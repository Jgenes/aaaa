/* ============================================================
   Public course catalogue + course data model.

   This module is the single place that knows the shape of the
   TrainHub TZ API (`routes/api.php`). Every screen that renders a
   course goes through it, so a payload change only has to be
   handled once.

   Endpoints (see the Laravel routes)
   ----------------------------------
     GET /public-courses   published courses (provider + OPEN cohorts)
     GET /training         published courses (+ is_enrolled, remaining_seats)
     GET /training/:id     a single published course
     GET /courses          the signed-in provider's own courses (auth only,
                           never used for the public catalogue)
     GET /courses/:id      a single course owned by the provider (auth only)

   Payload facts the UI depends on
   -------------------------------
     • Lists are returned as a bare array (no `{ data: … }` envelope), but
       the normaliser tolerates envelopes anyway.
     • `status` is "Published" | "Draft" | "Closed". `Draft` courses ARE part
       of the public catalogue (Course::scopePublished includes them), which
       is why the UI must not hide them — doing so emptied the whole
       catalogue.
     • Curriculum lives in `contents`: an array of sessions, each with
       `title`, `description`, `notes_text`, `video`, `video_links` and
       `handouts` (stored paths under `uploads/…`).
     • Cohorts carry `capacity`, `seats_taken`, `price`, `registration_deadline`,
       `start_date`, `end_date`, `intake_name` and `status` = OPEN | FULL | CLOSED.
       Only `/training` adds `remaining_seats`; everywhere else it is derived.
   ============================================================ */

import api from "./axio";

/** Endpoints that can serve the public catalogue, in priority order. */
const LIST_ENDPOINTS = ["/public-courses", "/training"];

/**
 * Endpoints that can serve a single public course.
 *
 * `/courses/:id` is deliberately NOT here: it is behind auth:sanctum and is
 * scoped to the owner, so calling it for a visitor produced 401s.
 */
const DETAIL_ENDPOINTS = (id) => [`/training/${id}`];

const CACHE_TTL = 60 * 1000;

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

  for (const key of ["data", "courses", "results", "items", "records", "cohorts"]) {
    if (key in payload) {
      const found = extractList(payload[key], depth + 1);
      if (found.length) return found;
    }
  }

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

/** Accept an array, a JSON string (even double-encoded) or null. */
export function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === "") return [];

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      return asArray(JSON.parse(trimmed));
    } catch {
      // Plain text: one entry per line (the API accepts this shape too).
      return trimmed
        .split(/\r\n|\r|\n/)
        .map((line) => line.trim())
        .filter(Boolean);
    }
  }

  return [];
}

/** Array of non-empty strings (accepts `{url}` / `{path}` / `{name}` items). */
function asStringList(value) {
  return asArray(value)
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (isPlainObject(item)) return item.url || item.path || item.file || item.name || "";
      return "";
    })
    .filter(Boolean);
}

const toNumber = (value, fallback = null) => {
  if (value === null || value === undefined || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const toIsoDate = (value) => {
  if (!value) return null;
  return String(value);
};

/* ------------------------------------------------------------
   Cohorts
   ------------------------------------------------------------ */

/**
 * Normalise one cohort: numbers, derived seat counts and an upper-case
 * status (the API stores OPEN / FULL / CLOSED).
 */
export function normaliseCohort(raw) {
  if (!isPlainObject(raw)) return null;

  const capacity = toNumber(raw.capacity, 0) ?? 0;
  const seatsTaken =
    toNumber(raw.seats_taken ?? raw.enrolled_students ?? raw.enrolled, 0) ?? 0;
  const remaining =
    toNumber(raw.remaining_seats, null) ?? Math.max(0, capacity - seatsTaken);

  return {
    ...raw,
    id: raw.id ?? raw.cohort_id,
    intake_name: raw.intake_name || raw.intakeName || raw.name || `Cohort ${raw.id ?? ""}`.trim(),
    capacity,
    seats_taken: seatsTaken,
    remaining_seats: remaining,
    price: toNumber(raw.price, 0) ?? 0,
    start_date: toIsoDate(raw.start_date ?? raw.startDate),
    end_date: toIsoDate(raw.end_date ?? raw.endDate),
    registration_deadline: toIsoDate(
      raw.registration_deadline ?? raw.registrationDeadline
    ),
    schedule_text: raw.schedule_text || raw.schedule || "",
    venue: raw.venue || "",
    online_link: raw.online_link || raw.onlineLink || "",
    status: String(raw.status || "").toUpperCase(),
  };
}

export const normaliseCohorts = (value) =>
  asArray(value)
    .map(normaliseCohort)
    .filter((cohort) => cohort && cohort.id !== undefined);

const startOfDay = (date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

/**
 * Can a learner enrol into this cohort?
 *
 * Mirrors the backend rules (Cohort::refreshStatus + the registration
 * deadline): OPEN and inside the deadline with seats left. Everything the
 * UI shows about enrolment comes from here so the badge on a card and the
 * button on the detail page can never disagree.
 *
 * @returns {{state: "open"|"closed"|"full"|"full-or-closed"|"scheduled"|"none",
 *            open: boolean, label: string, remaining: number|null,
 *            deadline: Date|null, deadlinePassed: boolean, isFull: boolean}}
 */
export function cohortAvailability(cohort, now = new Date()) {
  if (!cohort) {
    return {
      state: "none",
      open: false,
      label: "Cohort dates coming soon",
      remaining: null,
      deadline: null,
      deadlinePassed: false,
      isFull: false,
    };
  }

  const remaining = toNumber(cohort.remaining_seats, null);
  const deadline = cohort.registration_deadline
    ? new Date(cohort.registration_deadline)
    : null;
  const validDeadline = deadline && !Number.isNaN(deadline.getTime()) ? deadline : null;
  const deadlinePassed = validDeadline ? startOfDay(validDeadline) < startOfDay(now) : false;
  const isFull = remaining !== null ? remaining <= 0 : false;
  const status = String(cohort.status || "").toUpperCase();

  if (status === "FULL" || isFull) {
    return {
      state: "full",
      open: false,
      label: "Cohort full",
      remaining: remaining ?? 0,
      deadline: validDeadline,
      deadlinePassed,
      isFull: true,
    };
  }

  if (status === "CLOSED" || deadlinePassed) {
    return {
      state: "closed",
      open: false,
      label: "Enrolment closed",
      remaining,
      deadline: validDeadline,
      deadlinePassed,
      isFull: false,
    };
  }

  if (status && status !== "OPEN") {
    // Unexpected status from the API — fail closed rather than sell a seat.
    return {
      state: "closed",
      open: false,
      label: "Enrolment closed",
      remaining,
      deadline: validDeadline,
      deadlinePassed,
      isFull: false,
    };
  }

  return {
    state: "open",
    open: true,
    label:
      remaining !== null && remaining > 0 ? `${remaining} seats left` : "Enrolment open",
    remaining,
    deadline: validDeadline,
    deadlinePassed,
    isFull: false,
  };
}

/** The cohort a visitor should see first: an open one, else the soonest. */
export function primaryCohort(cohorts) {
  const list = normaliseCohorts(cohorts);
  if (!list.length) return null;

  const open = list.filter((cohort) => cohortAvailability(cohort).open);
  if (open.length) {
    return open.sort((a, b) => {
      const aDate = new Date(a.start_date || 0).getTime() || 0;
      const bDate = new Date(b.start_date || 0).getTime() || 0;
      return aDate - bDate;
    })[0];
  }

  return (
    [...list].sort((a, b) => {
      const aDate = new Date(a.registration_deadline || a.start_date || 0).getTime() || 0;
      const bDate = new Date(b.registration_deadline || b.start_date || 0).getTime() || 0;
      return bDate - aDate;
    })[0] || null
  );
}

/* ------------------------------------------------------------
   Curriculum
   ------------------------------------------------------------ */

/**
 * Normalise one curriculum session.
 *
 * The API stores exactly one level: every entry of `contents` is a session.
 * Older deployments nested `lessons` inside a section, so both shapes are
 * flattened into the same session list.
 */
function toSession(item, index, prefix = "") {
  if (typeof item === "string") {
    const title = item.trim();
    if (!title) return null;
    return {
      id: String(index + 1),
      title: prefix ? `${prefix} — ${title}` : title,
      description: "",
      notes: "",
      video: null,
      video_links: [],
      handouts: [],
      duration: null,
    };
  }

  if (!isPlainObject(item)) return null;

  const title = item.title || item.name || item.sectionTitle || `Session ${index + 1}`;

  return {
    id: item.id !== undefined && item.id !== null ? String(item.id) : String(index + 1),
    title: prefix ? `${prefix} — ${title}` : title,
    description: item.description || item.summary || "",
    notes: item.notes_text || item.notes || "",
    video: item.video || item.video_url || item.videoUrl || null,
    video_links: asStringList(item.video_links ?? item.links),
    handouts: asStringList(item.handouts ?? item.resources ?? item.files),
    duration: item.duration || item.time || null,
  };
}

/** Flat list of sessions for a course payload. */
export function normaliseCurriculum(raw) {
  let source = raw;

  // Some payloads wrap the list: { curriculum: [...] } / { contents: { data: [...] } }
  if (isPlainObject(source)) {
    source = source.curriculum ?? source.contents ?? source.data ?? [];
  }

  const items = asArray(source);
  const sessions = [];

  items.forEach((item) => {
    if (isPlainObject(item) && Array.isArray(item.lessons)) {
      item.lessons.forEach((lesson) => {
        const session = toSession(lesson, sessions.length, item.title || "");
        if (session) sessions.push(session);
      });
      return;
    }

    const session = toSession(item, sessions.length);
    if (session) sessions.push(session);
  });

  return sessions;
}

/* ------------------------------------------------------------
   Courses
   ------------------------------------------------------------ */

const providerOf = (course) => {
  const provider = course.provider || course.tenant || course.organisation || null;
  if (!provider) {
    return course.provider_name
      ? { name: course.provider_name, logo: null }
      : null;
  }

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

/** Cheapest open cohort price, used when the course itself has no fee. */
const priceOf = (raw, cohorts) => {
  const direct = toNumber(raw.price ?? raw.fee ?? raw.cost, null);
  if (direct !== null) return direct;

  const prices = cohorts
    .map((cohort) => toNumber(cohort.price, null))
    .filter((price) => price !== null);
  return prices.length ? Math.min(...prices) : null;
};

/** Normalise one course so every screen sees the same fields. */
export function normaliseCourse(raw) {
  if (!isPlainObject(raw)) return null;

  const cohorts = normaliseCohorts(raw.cohorts ?? raw.course_cohorts ?? raw.schedules);
  const sessions = normaliseCurriculum(raw.contents ?? raw.curriculum ?? raw.modules);
  const provider = providerOf(raw);
  const shortDescription = raw.short_description || raw.summary || raw.description || "";

  return {
    ...raw,
    id: raw.id ?? raw.course_id,
    title: raw.title || raw.name || "Untitled training",
    category: raw.category || raw.category_name || raw.field || null,
    mode: raw.mode || raw.delivery_mode || raw.delivery || null,
    status: raw.status || null,
    short_description: shortDescription,
    description: raw.description || shortDescription,
    long_description: raw.long_description || raw.overview || "",
    banner: raw.banner || raw.image || raw.thumbnail || raw.cover_image || null,
    price: priceOf(raw, cohorts),
    provider,
    cohorts,
    // Learning outcomes / skills / requirements are JSON columns that can
    // arrive as arrays, JSON strings or newline-separated text.
    learning_outcomes: asStringList(raw.learning_outcomes),
    learningOutcomes: asStringList(raw.learning_outcomes),
    skills: asStringList(raw.skills),
    requirements: asStringList(raw.requirements),
    curriculum: sessions,
    contents: sessions,
    is_enrolled: Boolean(raw.is_enrolled ?? raw.isEnrolled),
  };
}

/**
 * Keep only courses a visitor should see.
 *
 * IMPORTANT: `Draft` is intentionally treated as visible. The API's public
 * scope (`Course::scopePublished`) returns Published *and* Draft courses —
 * new provider courses are saved as Draft — so filtering Draft out here hid
 * every course in the catalogue.
 */
const HIDDEN_STATUSES = new Set([
  "CLOSED",
  "SUSPENDED",
  "ARCHIVED",
  "REJECTED",
  "UNPUBLISHED",
  "DELETED",
]);

export function isPubliclyVisible(course) {
  if (!course) return false;
  if (course.is_published === false || course.published === false) return false;
  if (course.is_active === false && course.status === undefined) return false;

  const status = String(course.status ?? course.course_status ?? "")
    .trim()
    .toUpperCase();

  return !HIDDEN_STATUSES.has(status);
}

const normaliseList = (records) =>
  records
    .map(normaliseCourse)
    .filter(Boolean)
    .filter(isPubliclyVisible);

/* ------------------------------------------------------------
   Fetching + diagnostics
   ------------------------------------------------------------ */

let listCache = null; // { at, courses, endpoint }

/**
 * A 200 response that is actually the site's HTML shell (typical when the
 * frontend is pointed at its own origin without a working API proxy).
 */
const looksLikeHtml = (data) =>
  typeof data === "string" && /^\s*<(!doctype|html|body|head)/i.test(data);

/** Human readable label for a failed request. */
const describeError = (error) => {
  if (!error) return "unknown error";
  if (error.response) return `HTTP ${error.response.status}`;
  if (error.code === "ECONNABORTED" || /timeout/i.test(error.message || "")) {
    return "timeout";
  }
  if (error.request) return "network error (no response)";
  return error.message || "request failed";
};

/**
 * One-line, copy-pasteable summary of what happened when loading the
 * catalogue. Example:
 *   "/public-courses → HTTP 401 · /training → HTTP 401"
 */
export function describeAttempts(attempts = []) {
  if (!Array.isArray(attempts) || !attempts.length) return "no request made";

  return attempts
    .map((attempt) => {
      if (attempt.ok) {
        if (attempt.endpoint === "catalogue-cache") return "cache → match";
        return `${attempt.endpoint} → ${attempt.count ?? 0} courses`;
      }
      if (attempt.reason === "empty") {
        return `${attempt.endpoint} → ${attempt.detail || "empty list"}`;
      }
      if (attempt.reason === "filtered") {
        return `${attempt.endpoint} → ${attempt.rawCount} records, none public`;
      }
      return `${attempt.endpoint} → ${attempt.detail || "failed"}`;
    })
    .join(" · ");
}

/** True when the API answered but rejected the request as unauthenticated. */
export const attemptsHave401 = (attempts = []) =>
  (attempts || []).some((attempt) => Number(attempt?.status) === 401);

/**
 * Probe the API's public canary (`GET /cors-check`).
 *
 * It is deliberately cheap and unauthenticated, so it separates two very
 * different failures:
 *   • canary fails too  → the API is unreachable / blocked (network, DNS, CORS)
 *   • canary works      → the API is fine, but the catalogue routes are
 *                         rejecting the request (auth middleware, route cache,
 *                         stale deployment)
 */
export async function checkCatalogueHealth() {
  const startedAt = Date.now();
  try {
    const res = await api.get("/cors-check", { timeout: 8000 });
    return {
      ok: true,
      status: res.status,
      ms: Date.now() - startedAt,
      data: res.data || null,
    };
  } catch (error) {
    return {
      ok: false,
      status: error?.response?.status ?? null,
      ms: Date.now() - startedAt,
      detail: describeError(error),
      data: error?.response?.data ?? null,
    };
  }
}

/**
 * Load the public course catalogue.
 *
 * Tries each endpoint until one returns something usable, normalises the
 * payload, and caches the result briefly so the home page, the catalogue
 * and the notification strip do not all hit the API on a cold load.
 *
 * The result distinguishes the three ways an empty catalogue can happen:
 *   ok: true,  courses: []                    → nothing is published yet
 *   ok: true,  filteredOut > 0, courses: []   → records exist but all hidden
 *   ok: false                                 → every request failed
 *
 * @param {{ force?: boolean }} options
 * @returns {Promise<{courses: object[], endpoint: string|null, attempts: object[],
 *                    ok: boolean, filteredOut: number, cached: boolean}>}
 */
export async function fetchCourses({ force = false } = {}) {
  const now = Date.now();
  if (!force && listCache && now - listCache.at < CACHE_TTL) {
    return {
      courses: listCache.courses,
      endpoint: listCache.endpoint,
      attempts: [],
      ok: true,
      filteredOut: 0,
      cached: true,
    };
  }

  const attempts = [];
  let ok = false; // did any endpoint answer with a 2xx?
  let filteredOut = 0;

  for (const endpoint of LIST_ENDPOINTS) {
    try {
      const res = await api.get(endpoint);

      if (looksLikeHtml(res.data)) {
        attempts.push({
          endpoint,
          ok: false,
          status: res.status,
          reason: "error",
          detail: "HTML instead of JSON (API base URL or proxy misconfigured)",
        });
        continue;
      }

      ok = true;

      const records = extractList(res.data);
      if (!records.length) {
        // A 200 that is an array means "nothing published". Anything else is a
        // payload shape we did not recognise — say so, with the keys we saw.
        const payload =
          res.data && typeof res.data === "object" && !Array.isArray(res.data)
            ? `object with keys: ${Object.keys(res.data).slice(0, 8).join(", ") || "(none)"}`
            : Array.isArray(res.data)
              ? null
              : `scalar ${typeof res.data}`;

        attempts.push({
          endpoint,
          ok: false,
          status: res.status,
          rawCount: 0,
          reason: "empty",
          detail: payload
            ? `unrecognised payload (${payload})`
            : undefined,
        });
        continue;
      }

      const courses = normaliseList(records);
      if (!courses.length) {
        filteredOut = Math.max(filteredOut, records.length);
        attempts.push({
          endpoint,
          ok: false,
          status: res.status,
          rawCount: records.length,
          reason: "filtered",
        });
        continue;
      }

      listCache = { at: now, courses, endpoint };
      attempts.push({
        endpoint,
        ok: true,
        status: res.status,
        count: courses.length,
      });

      return { courses, endpoint, attempts, ok: true, filteredOut: 0, cached: false };
    } catch (error) {
      attempts.push({
        endpoint,
        ok: false,
        status: error?.response?.status ?? null,
        reason: "error",
        detail: describeError(error),
      });
    }
  }

  return { courses: [], endpoint: null, attempts, ok, filteredOut, cached: false };
}

/**
 * Load a single course for the detail page.
 *
 * Falls back to the cached catalogue (or a fresh list) when the detail
 * endpoint is unavailable, so a card that came from /public-courses still
 * opens even if /training/:id returns nothing.
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
      attempts.push({ endpoint, ok: false, status: res.status, reason: "empty" });
    } catch (error) {
      attempts.push({
        endpoint,
        ok: false,
        status: error?.response?.status ?? null,
        reason: "error",
        detail: describeError(error),
      });
    }
  }

  // Last resort: the catalogue we already have (or can still load).
  const { courses, attempts: listAttempts = [] } = await fetchCourses();
  const match = courses.find((course) => String(course.id) === String(id));
  if (match) {
    attempts.push({ endpoint: "catalogue-cache", ok: true });
    return { course: match, endpoint: "catalogue-cache", attempts, failed: false };
  }

  // Keep the catalogue attempts too — they explain *why* the fallback was empty.
  listAttempts.forEach((attempt) => {
    attempts.push({ ...attempt, endpoint: `list ${attempt.endpoint}` });
  });

  // Distinguish "this course is gone" (a clean 404/empty) from "the API is
  // broken for us" (no response, 401, 5xx) so the page can explain itself.
  const failed = attempts.some(
    (attempt) =>
      !attempt.ok &&
      (attempt.status == null || attempt.status === 401 || attempt.status >= 500)
  );

  return { course: null, endpoint: null, attempts, failed };
}

/** Clear the short-lived cache (used by retry buttons and tests). */
export function invalidateCatalogue() {
  listCache = null;
}

/** Human readable date used across course cards and detail pages. */
export function formatDate(value, fallback = "—") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
