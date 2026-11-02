import { useEffect, useState } from "react";
import { attemptsHave401, describeAttempts } from "../api/catalogue";

/**
 * Collapsible "why is the catalogue empty?" panel.
 *
 * Only rendered when the catalogue could not produce courses, so it never
 * appears in a healthy flow. It shows:
 *   • what each catalogue endpoint answered (`/public-courses`, `/training`),
 *   • the result of the API's public canary (`/cors-check`), which tells
 *     "the API is down/blocked" apart from "the catalogue route refused us",
 *   • a concrete hint for the most common causes (401 → auth middleware or a
 *     stale route cache).
 *
 * The same payload is exposed as `window.__trainhubCatalogue` so it can be
 * inspected (or copied) from the console.
 */
const BUILD_TIME = typeof __BUILD_TIME__ === "string" ? __BUILD_TIME__ : "dev server";

const HINTS = {
  401: "The API rejected the request as unauthenticated. The public catalogue routes (/public-courses, /training) must not require a token — check the backend's auth middleware / route cache, and that the deployed API includes those routes.",
  403: "The API refused this origin or account. Check the backend CORS configuration for your frontend domain.",
  404: "The route does not exist on the deployed API. The backend is probably an older build than routes/api.php — redeploy it (and clear the route cache).",
  429: "Too many requests — the API is rate limiting this address.",
  500: "The API threw a server error. Check the backend logs (storage/logs/laravel.log).",
};

const statusHint = (attempts) => {
  const status = attempts.find((attempt) => attempt?.status)?.status;
  return status ? HINTS[status] || null : null;
};

export default function CatalogueDiagnostics({ attempts = [], health = null }) {
  const [copied, setCopied] = useState(false);
  const summary = describeAttempts(attempts);
  const rejected = attemptsHave401(attempts);
  const hint = statusHint(attempts);
  const canaryFailed = health && !health.ok;

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.__trainhubCatalogue = { build: BUILD_TIME, summary, attempts, health };
  }, [summary, attempts, health]);

  if (!attempts.length && !health) return null;

  const report = [
    `build: ${BUILD_TIME}`,
    `summary: ${summary}`,
    ...attempts.map(
      (attempt) =>
        `- ${attempt.endpoint}: ${JSON.stringify({
          ok: attempt.ok,
          status: attempt.status ?? null,
          reason: attempt.reason ?? null,
          detail: attempt.detail ?? null,
          rawCount: attempt.rawCount ?? null,
          count: attempt.count ?? null,
        })}`
    ),
    health ? `cors-check: ${JSON.stringify(health)}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
    } catch {
      // Clipboard blocked (insecure origin / permissions) — the summary is
      // still selectable in the panel.
      setCopied(false);
    }
  };

  return (
    <details className="small text-muted mt-3 text-start">
      <summary className="fw-semibold">Technical details</summary>

      <ul className="list-unstyled mb-2 mt-2">
        {attempts.map((attempt, index) => (
          <li key={`${attempt.endpoint}-${index}`}>
            <code>{attempt.endpoint}</code>{" "}
            {attempt.ok
              ? attempt.endpoint === "catalogue-cache"
                ? "→ matched from cache"
                : `→ ${attempt.count ?? 0} courses`
              : attempt.reason === "empty"
                ? `→ ${attempt.detail || "empty list (HTTP 200)"}`
                : attempt.reason === "filtered"
                  ? `→ ${attempt.rawCount} records, none publicly visible`
                  : `→ ${attempt.detail || "failed"}`}
          </li>
        ))}

        {health && (
          <li>
            <code>/cors-check</code>{" "}
            {health.ok
              ? `→ OK in ${health.ms} ms (API reachable)`
              : `→ ${health.detail || "failed"}${health.status ? ` (HTTP ${health.status})` : ""}`}
          </li>
        )}
      </ul>

      {canaryFailed && (
        <p className="mb-2">
          The API itself is not answering the way this app expects. Check the backend host,
          DNS and its CORS allow-list for this domain.
        </p>
      )}

      {rejected && (
        <p className="mb-2">
          The catalogue endpoints answered <strong>401 Unauthorized</strong> while the API is
          otherwise reachable — that is a backend routing/authentication problem, not a
          frontend one.
        </p>
      )}

      {hint && <p className="mb-2">{hint}</p>}

      <p className="mb-1">
        Summary: <code className="text-break">{summary}</code>
      </p>
      <p className="mb-2">
        <button type="button" className="btn btn-sm btn-outline-dark" onClick={copyReport}>
          {copied ? "Copied" : "Copy details"}
        </button>
      </p>
      <p className="mb-0">
        Build: <code>{BUILD_TIME}</code> — if this changes after a redeploy, the new bundle is
        live.
      </p>
    </details>
  );
}
