/* ============================================================
   Media URLs.

   The API returns relative file paths ("courses/abc.jpg",
   "storage/uploads/logo.png"). They used to be resolved against a
   hard-coded http://localhost:8000, which meant every banner and
   provider logo was broken in production (and shown as a broken
   image card even though the course existed).

   Everything now resolves against the configured API origin, with a
   few sensible candidate paths tried in order by <MediaImage>.
   ============================================================ */

const FALLBACK_API_BASE = "https://api.traininghubtz.co.tz/api";

export const API_BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL || FALLBACK_API_BASE
).replace(/\/+$/, "");

/** API origin without the trailing /api segment. */
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");

/** Where uploaded files live. Override with VITE_MEDIA_BASE_URL if needed. */
export const MEDIA_BASE_URL = (
  import.meta.env?.VITE_MEDIA_BASE_URL || API_ORIGIN
).replace(/\/+$/, "");

export const isAbsoluteUrl = (value = "") =>
  /^(?:[a-z]+:)?\/\//i.test(String(value)) || String(value).startsWith("data:");

/**
 * Candidate URLs for a stored file path, most likely first.
 * Returns [] when there is nothing to show.
 */
export function mediaCandidates(path) {
  if (!path || typeof path !== "string") return [];

  const value = path.trim().replace(/^\/+/, "");
  if (!value) return [];
  if (isAbsoluteUrl(value)) return [value];

  const candidates = [];
  const push = (url) => {
    if (url && !candidates.includes(url)) candidates.push(url);
  };

  // Already namespaced by the API, e.g. "storage/uploads/logo.png".
  if (/^(storage|uploads|media)\//i.test(value)) {
    push(`${MEDIA_BASE_URL}/${value}`);
  } else {
    push(`${MEDIA_BASE_URL}/storage/${value}`);
    push(`${MEDIA_BASE_URL}/storage/uploads/${value}`);
    push(`${MEDIA_BASE_URL}/${value}`);
  }

  return candidates;
}

/** Best single URL for a stored path (or "" when unavailable). */
export function mediaUrl(path) {
  return mediaCandidates(path)[0] || "";
}

/** Absolute URL for an API route — handy for downloads and redirects. */
export function apiUrl(path = "") {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
