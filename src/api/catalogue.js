/* ============================================================
   Public course catalogue.

   Why this module exists
   ----------------------
   The public screens were calling different endpoints with different
   assumptions about the payload:

     • Home + notifications  → GET /public-courses  (assumed a bare array)
     • Catalogue (/trainings) → GET /training       (assumed { data: [] })
     • Course detail         → GET /training/:id    (assumed a bare object)

   The API can wrap results in `{ data: [...] }` (sometimes twice, or with
   Laravel pagination keys), so the home page crashed while mapping and the
   catalogue silently rendered zero courses. Every screen now goes through
   the same normaliser, and if one endpoint is unavailable we fall back to
   the others instead of showing an empty page.
   ============================================================ */

import api from "./axio";

/** Endpoints that can serve the public catalogue, in priority order. */
const LIST_ENDPOINTS = ["/public-courses", "/training", "/courses"];

/** Endpoints that can serve a single public course. */
const DETAIL_ENDPOINTS = (id) => [
  `/training/${id}`,
  `/public-courses/${id}`,
  `/courses/${id}`,
];

const CACHE_TTL = 60 * 1000;

let listCache = null; // { at, courses, endpoint }

/* ------------------------------------------------------------
   Payload normalising
   ------------------------------------------------------------ */

const isPlainObject = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

/**
 * Pull an array of records out of any common API envelope:
 *   [ ... ]
 *   { data: [ ... ] }
 *   { data: { data: [ ... ] } }
 *   { courses: [ ... ] } | { results: [ ... ] } | { items: [ ... ] }
 */
export function extractList(payload, depth = 0) {
  if (depth > 3 || payload === null || payload === undefined) return [];

  if (Array.isArray(payload)) return payload;
  if (typeof payload === "string") {
    try {
      return extractList(JSON.parse(payload), depth + 1);
    } catch {
      return [];
    }
  }
  if (!isPlainObject(payload)) return [];

  for (const key of ["data", "courses", "results", "items", "records"]) {
    if (key in payload) {
      const found = extractList(payload[key], depth + 1);
      if (found.length) return found;
    }
  }

  // Laravel paginator: { data: [...], meta: {...} } handled above; any other
  // object shape is not a list.
  return [];
}

/** Same idea for a single record. */
export function extractRecord(payload, depth = 0) {
  if (depth > 3 || payload === null || payload === undefined) return null;
  if (typeof payload === "string") {
    try {
      return extractRecord(JSON.parse(payload), depth + 1);
    } catch {
      return null;
    }
  }
  if (Array.isArray(payload)) return extractRecord(payload[0], depth + 1);
  if (!isPlainObject(payload)) return null;

  if (payload.id !== undefined && (payload.title !== undefined || payload.name !== undefined)) {
    return payload;
  }

  for (const key of ["data", "course", "result", "item"]) {
    if (key in payload) {
      const found = extractRecord(payload[key], depth + 1);
      if (found) return found;
    }
  }

  return payload.id !== undefined ? payload : null;
}

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === "") return [];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

/* ------------------------------------------------------------
   Record normalising
   ------------------------------------------------------------ */

const PUBLISHED_STATUSES = new Set([
  "APPROVED",
  "PUBLISHED",
  "ACTIVE",
  "OPEN",
  "LIVE",
]);

const isHiddenStatus = (status) => {
  const value = String(status || "").toUpperCase();
  if (!value) return false;
  if (PUBLISHED_STATUSES.has(value)) return false;
  // Anything still in the moderation pipeline must not appear publicly.
  return ["DRAFT", "PENDING", "PENDING_REVIEW", "SUBMITTED", "REJECTED", "SUSPENDED", "ARCHIVED"].includes(
    value
  );
};

const providerOf = (course) => {
  const provider = course.provider || course.tenant || course.organisation || null;
  if (!provider) return null;

  const name =
    provider.name ||
    provider.brand_name ||
    provider.legal_name ||
    provider.title ||
    null;

  return {
    ...provider,
    name,
    logo: provider.logo || provider.image || provider.avatar || null,
  };
};

/** Normalise one course so every screen sees the same fields. */
export function normaliseCourse(raw) {
  if (!isPlainObject(raw)) return null;

  const cohorts = asArray(raw.cohorts ?? raw.courses_cohorts ?? raw.schedules);
  const provider = providerOf(raw);

  return {
    ...raw,
    id: raw.id ?? raw.course_id,
    title: raw.title || raw.name || "Untitled training",
    category: raw.category || raw.category_name || raw.field || null,
    mode: raw.mode || raw.delivery_mode || raw.delivery || null,
    description: raw.description || raw.summary || raw.overview || "",
    banner: raw.banner || raw.image || raw.thumbnail || raw.cover_image || null,
    price: raw.price ?? raw.fee ?? raw.cost ?? null,
    provider,
    cohorts,
    is_enrolled: Boolean(raw.is_enrolled ?? raw.isEnrolled),
  };
}

/** Keep only records a visitor should see. */
export function isPubliclyVisible(course) {
  if (!course) return false;
  if (course.is_published === false || course.published === false) return false;
  if (course.is_active === false && course.status === undefined) return false;
  return !isHiddenStatus(course.status ?? course.course_status);
}

const normaliseList = (records) =>
  records
    .map(normaliseCourse)
    .filter(Boolean)
    .filter(isPubliclyVisible);

/* ------------------------------------------------------------
   Fetching
   ------------------------------------------------------------ */

/**
 * Load the public course catalogue.
 *
 * Tries each endpoint until one returns something usable, normalises the
 * payload, and caches the result briefly so the home page and the catalogue
 * do not both hit the API on a cold load.
 *
 * @param {{ force?: boolean }} options
 * @returns {Promise<{ courses: object[], endpoint: string|null, attempts: object[] }>}
 */
export async function fetchCourses({ force = false } = {}) {
  const now = Date.now();
  if (!force && listCache && now - listCache.at < CACHE_TTL) {
    return { courses: listCache.courses, endpoint: listCache.endpoint, attempts: [] };
  }

  const attempts = [];

  for (const endpoint of LIST_ENDPOINTS) {
    try {
      const res = await api.get(endpoint);
      const records = extractList(res.data);
      if (!records.length) {
        attempts.push({ endpoint, ok: false, reason: "empty" });
        continue;
      }

      const courses = normaliseList(records);
      if (!courses.length) {
        attempts.push({ endpoint, ok: false, reason: "filtered" });
        continue;
      }

      listCache = { at: now, courses, endpoint };
      attempts.push({ endpoint, ok: true, count: courses.length });
      return { courses, endpoint, attempts };
    } catch (error) {
      attempts.push({
        endpoint,
        ok: false,
        reason: error?.response?.status || error?.message || "error",
      });
    }
  }

  return { courses: [], endpoint: null, attempts };
}

/**
 * Load a single course for the detail page.
 *
 * Falls back to the cached catalogue when the detail endpoint is missing, so
 * a card that came from /public-courses still opens even if /training/:id
 * does not exist on the deployment.
 */
export async function fetchCourseById(id) {
  const attempts = [];

  for (const endpoint of DETAIL_ENDPOINTS(id)) {
    try {
      const res = await api.get(endpoint);
      const record = extractRecord(res.data);
      if (record) {
        attempts.push({ endpoint, ok: true });
        return { course: normaliseCourse(record), endpoint, attempts };
      }
      attempts.push({ endpoint, ok: false, reason: "empty" });
    } catch (error) {
      attempts.push({
        endpoint,
        ok: false,
        reason: error?.response?.status || error?.message || "error",
      });
    }
  }

  // Last resort: the catalogue we already have (or can still load).
  const { courses } = await fetchCourses();
  const match = courses.find((course) => String(course.id) === String(id));
  if (match) {
    attempts.push({ endpoint: "catalogue-cache", ok: true });
    return { course: match, endpoint: "catalogue-cache", attempts };
  }

  return { course: null, endpoint: null, attempts };
}

/** Clear the short-lived cache (used by retry buttons and tests). */
export function invalidateCatalogue() {
  listCache = null;
}
