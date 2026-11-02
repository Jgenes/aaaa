/* Catalogue failure-state test.

   The empty-catalogue panel is only trustworthy if `fetchCourses`,
   `fetchCourseById` and the health probe classify each failure correctly.
   This script bundles `src/api/catalogue.js` with the axios instance replaced
   by a stub, then replays every state we have met in production: 401s, an
   offline network, an empty list, a fully hidden list, an HTML shell instead
   of JSON, an unrecognised envelope, a broken detail endpoint and the cache
   fallback.

   Usage: npm run test:fetch
*/
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import * as esbuild from "esbuild";

const outdir = path.join(process.cwd(), "node_modules", ".cache", "fetch-check");
fs.mkdirSync(outdir, { recursive: true });

const stub = path.join(outdir, "axio-stub.mjs");
fs.writeFileSync(
  stub,
  `const answer = (url) => {
    const routes = globalThis.__routes || {};
    const hit = routes[url];
    if (hit === undefined) return { status: 200, data: [] };
    if (hit instanceof Error) throw hit;
    if (hit.reject) {
      const error = new Error(hit.reject.message || 'request failed');
      error.response = hit.reject.status ? { status: hit.reject.status } : undefined;
      if (!hit.reject.status) error.request = {};
      throw error;
    }
    return { status: hit.status ?? 200, data: hit.data };
  };
  export default { get: async (url) => answer(url) };
  `
);

const aliasPlugin = {
  name: "stub-axio",
  setup(build) {
    build.onResolve({ filter: /(^|\/)axio(\.js)?$/ }, () => ({ path: stub }));
  },
};

const outfile = path.join(outdir, "catalogue.mjs");
await esbuild.build({
  entryPoints: ["src/api/catalogue.js"],
  outfile,
  bundle: true,
  format: "esm",
  platform: "node",
  packages: "external",
  define: { "import.meta.env": "{}" },
  plugins: [aliasPlugin],
  logLevel: "error",
});

const catalogue = await import(pathToFileURL(outfile).href);

let failures = 0;
const eq = (name, actual, expected) => {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) console.log(`✓ ${name}`);
  else {
    failures += 1;
    console.log(`✗ ${name} — expected ${e}, got ${a}`);
  }
};

const runCase = async (name, routes, fn) => {
  catalogue.invalidateCatalogue();
  globalThis.__routes = routes;
  try {
    await fn();
  } catch (error) {
    failures += 1;
    console.log(`✗ ${name} threw ${error.message}`);
  }
};

const course = (id) => ({ id, title: `Course ${id}`, status: "Draft", cohorts: [] });

// 1. both endpoints 401 → ok:false, two attempts, statuses recorded
await runCase("401", {
  "/public-courses": { reject: { status: 401 } },
  "/training": { reject: { status: 401 } },
}, async () => {
  const result = await catalogue.fetchCourses({ force: true });
  eq("401: no courses", result.courses.length, 0);
  eq("401: ok flag", result.ok, false);
  eq("401: attempts", result.attempts.map((a) => [a.endpoint, a.status, a.detail]), [
    ["/public-courses", 401, "HTTP 401"],
    ["/training", 401, "HTTP 401"],
  ]);
  eq("401: summary", catalogue.describeAttempts(result.attempts),
    "/public-courses → HTTP 401 · /training → HTTP 401");
  eq("401: flagged", catalogue.attemptsHave401(result.attempts), true);
});

// 2. network failure (no response)
await runCase("offline", {
  "/public-courses": { reject: { message: "Network Error" } },
  "/training": { reject: { message: "Network Error" } },
}, async () => {
  const result = await catalogue.fetchCourses({ force: true });
  eq("offline: reason", result.attempts[0].detail, "network error (no response)");
  eq("offline: ok flag", result.ok, false);
});

// 3. first endpoint empty, second has data → falls back and reports
await runCase("fallback", {
  "/public-courses": { data: [] },
  "/training": { data: [course(1), course(2)] },
}, async () => {
  const result = await catalogue.fetchCourses({ force: true });
  eq("fallback: count", result.courses.length, 2);
  eq("fallback: endpoint", result.endpoint, "/training");
  eq("fallback: attempts", result.attempts.map((a) => a.reason || a.count), ["empty", 2]);
});

// 4. all records hidden → filteredOut, not "empty"
await runCase("filtered", {
  "/public-courses": { data: [{ id: 9, title: "Old", status: "Closed", cohorts: [] }] },
  "/training": { data: [] },
}, async () => {
  const result = await catalogue.fetchCourses({ force: true });
  eq("filtered: no courses", result.courses.length, 0);
  eq("filtered: ok", result.ok, true);
  eq("filtered: filteredOut", result.filteredOut, 1);
  eq("filtered: reasons", result.attempts.map((a) => a.reason), ["filtered", "empty"]);
});

// 5. HTML shell instead of JSON
await runCase("html", {
  "/public-courses": { data: "<!doctype html><html></html>" },
  "/training": { data: "<html><body>404</body></html>" },
}, async () => {
  const result = await catalogue.fetchCourses({ force: true });
  eq("html: ok flag", result.ok, false);
  eq("html: detail", result.attempts[0].detail,
    "HTML instead of JSON (API base URL or proxy misconfigured)");
});

// 6. unrecognised envelope → says which keys it saw
await runCase("envelope", {
  "/public-courses": { data: { items: [], meta: {} } },
  "/training": { data: { result: [] } },
}, async () => {
  const result = await catalogue.fetchCourses({ force: true });
  eq("envelope: detail", result.attempts[0].detail, "unrecognised payload (object with keys: items, meta)");
});

// 7. detail endpoint: 401 on /training/{id} + 401 catalogue → failed true
await runCase("detail-fail", {
  "/training/7": { reject: { status: 401 } },
  "/public-courses": { reject: { status: 401 } },
  "/training": { reject: { status: 401 } },
}, async () => {
  const { course: found, failed, attempts } = await catalogue.fetchCourseById(7);
  eq("detail 401: no course", found, null);
  eq("detail 401: failed", failed, true);
  eq("detail 401: attempts", attempts.map((a) => a.endpoint),
    ["/training/7", "list /public-courses", "list /training"]);
});

// 8. detail endpoint 404 but catalogue has the course → cached fallback
await runCase("detail-cache", {
  "/training/7": { reject: { status: 404 } },
  "/public-courses": { data: [course(7)] },
  "/training": { data: [] },
}, async () => {
  const { course: found, failed, endpoint } = await catalogue.fetchCourseById(7);
  eq("detail cache: found", found?.id, 7);
  eq("detail cache: failed", failed, false);
  eq("detail cache: endpoint", endpoint, "catalogue-cache");
});

// 9. health canary
await runCase("health-ok", { "/cors-check": { data: { ok: true } } }, async () => {
  const health = await catalogue.checkCatalogueHealth();
  eq("health ok", [health.ok, health.status], [true, 200]);
});
await runCase("health-down", { "/cors-check": { reject: { message: "Network Error" } } }, async () => {
  const health = await catalogue.checkCatalogueHealth();
  eq("health down", [health.ok, health.status, health.detail], [false, null, "network error (no response)"]);
});

fs.rmSync(outdir, { recursive: true, force: true });
console.log(failures === 0 ? "\nAll fetch states behave as designed" : `\n${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
