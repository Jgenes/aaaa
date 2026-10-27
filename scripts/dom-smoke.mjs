/* Route smoke test (headless, no browser required).

   Builds the production bundle, re-wraps it as an IIFE and executes it inside
   jsdom for every application route. It asserts that the app mounts, renders
   real content and emits no React warnings / runtime errors.

   Usage: npm run test:ui
*/
import fs from "node:fs";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";
import { build as viteBuild } from "vite";
import * as esbuild from "esbuild";

const BABEL_IGNORED =
  /Failed to load resource|Network Error|ERR_|ResizeObserver loop|Not implemented: navigation|Not implemented: HTMLCanvasElement|Could not parse CSS|getContext|Failed to create chart|can't acquire context|Error fetching|Dashboard Fetch|Notification fetch|Request failed|Load failed|\b(404|401|500|503)\b/i;

const ROUTES = [
  "/",
  "/trainings",
  "/course/1",
  "/contact",
  "/login",
  "/register",
  "/tenant-register",
  "/otp-verification",
  "/activate-account",
  "/learning",
  "/transactions",
  "/checkout/1/1",
  "/pesapal-gateway",
  "/provider/dashboard",
  "/provider/course",
  "/provider/cohorts",
  "/provider/enrollments",
  "/provider/invoices",
  "/provider/reports",
  "/provider/profile",
  "/provider/settings",
  "/provider/review",
  "/provider/social-engagement",
  "/provider/all-cohorts",
  "/provider/all-enrollments",
  "/provider/createCourse",
  "/admin/dashboard",
  "/admin/providers",
  "/admin/courses",
  "/admin/transactions",
  "/admin/reports",
  "/tenant/onboarding",
  "/provider/verification",
];

const ROUTES_REQUIRING_AUTH = /^\/(admin|provider|tenant)/;

async function buildBundle() {
  console.log("› Building production bundle…");
  await viteBuild({ logLevel: "warn" });

  const assetsDir = path.resolve("dist/assets");
  const entry = fs
    .readdirSync(assetsDir)
    .find((file) => /^index-.*\.js$/.test(file));

  if (!entry) throw new Error("No production entry found in dist/assets");

  const outfile = path.join(process.env.TMPDIR || "/tmp", "trainhub-prod-iife.js");
  await esbuild.build({
    entryPoints: [path.join(assetsDir, entry)],
    bundle: true,
    format: "iife",
    outfile,
    logLevel: "error",
  });

  // Vite resolves asset URLs against import.meta.url, which has no meaning in
  // an IIFE wrapper – point it at the dev server origin instead.
  const source = fs
    .readFileSync(outfile, "utf8")
    .replaceAll("import_meta.url", JSON.stringify("http://localhost/assets/index.js"))
    .replaceAll("import.meta.url", JSON.stringify("http://localhost/assets/index.js"));

  return source;
}

const seedSession = (window, route) => {
  const role = route.startsWith("/admin") ? "admin" : "provider";
  window.localStorage.setItem("token", "smoke-test-token");
  window.localStorage.setItem(
    "user",
    JSON.stringify({ name: "Amina Juma", role, onboarded: true })
  );
};

async function runRoute(bundle, route) {
  const errors = [];
  const virtualConsole = new VirtualConsole();

  virtualConsole.on("jsdomError", (error) => {
    if (!BABEL_IGNORED.test(error.message)) errors.push(`jsdom: ${error.message}`);
  });
  virtualConsole.on("error", (...args) => {
    const text = args.join(" ");
    if (!BABEL_IGNORED.test(text)) errors.push(`console.error: ${text.split("\n")[0]}`);
  });
  virtualConsole.on("warn", (...args) => {
    const text = args.join(" ");
    if (/Each child in a list|validateDOMNesting|Invalid DOM property/.test(text)) {
      errors.push(`console.warn: ${text.split("\n")[0]}`);
    }
  });

  const dom = new JSDOM(
    '<!doctype html><html><head><title>smoke</title></head><body><div id="root"></div></body></html>',
    {
      url: `http://localhost${route}`,
      runScripts: "dangerously",
      pretendToBeVisual: true,
      virtualConsole,
    }
  );

  const { window } = dom;

  // The API is unreachable in CI; fail requests fast so effects settle.
  window.XMLHttpRequest = class {
    constructor() {
      this.readyState = 0;
      this.status = 0;
      this.responseText = "";
    }
    open() {}
    setRequestHeader() {}
    send() {
      setTimeout(() => {
        this.readyState = 4;
        this.status = 503;
        this.responseText = JSON.stringify({ message: "offline" });
        this.onreadystatechange?.();
        this.onerror?.(new window.Event("error"));
      }, 0);
    }
    abort() {}
  };
  window.fetch = () => Promise.reject(new Error("offline"));
  window.scrollTo = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.matchMedia =
    window.matchMedia ||
    (() => ({
      matches: false,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
    }));

  if (ROUTES_REQUIRING_AUTH.test(route)) seedSession(window, route);

  try {
    window.eval(bundle);
  } catch (error) {
    errors.push(`mount threw: ${error.message}`);
  }

  await new Promise((resolve) => setTimeout(resolve, 130));

  const root = window.document.getElementById("root");
  const audit = collectAudit(window.document, root);
  const text = (root?.textContent || "").replace(/\s+/g, " ").trim();
  const landmark = root?.querySelector("header, h1, main");
  const title = window.document.title;

  if (!landmark) errors.push("no landmark element rendered");
  if (text.length < 60) errors.push(`almost no content (${text.length} chars)`);

  window.close();

  AUDIT.set(route, audit);

  if (errors.length) {
    console.log(`✗ ${route}\n   ${errors.slice(0, 3).join("\n   ")}`);
    return false;
  }

  console.log(`✓ ${route} · “${title}” · ${text.length} chars of content`);
  return true;
}

function collectAudit(document, root) {
  if (!root) return {};
  const accessibleName = (el) =>
    (el.getAttribute("aria-label") ||
      el.getAttribute("title") ||
      el.textContent ||
      "").trim();

  const headings = [...root.querySelectorAll("h1")].length;

  const imagesMissingAlt = [...root.querySelectorAll("img")].filter(
    (img) => !img.hasAttribute("alt")
  ).length;

  const unnamedControls = [
    ...root.querySelectorAll("button, a[href]"),
  ].filter((el) => {
    if (el.closest("[aria-hidden='true']")) return false;
    if (accessibleName(el)) return false;
    const img = el.querySelector("img[alt]");
    return !img || !img.getAttribute("alt").trim();
  }).length;

  const ids = [...root.querySelectorAll("[id]")].map((el) => el.id);
  const idCounts = ids.reduce((acc, id) => acc.set(id, (acc.get(id) || 0) + 1), new Map());
  const duplicatedIdNames = [...idCounts].filter(([, n]) => n > 1).map(([id, n]) => `${id}×${n}`);
  const duplicateIds = ids.length - new Set(ids).size;

  const labelledIds = new Set([
    ...[...root.querySelectorAll("label[for]")].map((l) => l.getAttribute("for")),
  ]);
  const unlabelledInputs = [
    ...root.querySelectorAll("input:not([type=hidden]), select, textarea"),
  ].filter((el) => {
    if (el.getAttribute("aria-label") || el.getAttribute("aria-labelledby")) return false;
    const id = el.getAttribute("id");
    return !id || !labelledIds.has(id);
  }).length;

  const inlineStyles = [...root.querySelectorAll("[style]")].length;

  return { headings, imagesMissingAlt, unnamedControls, duplicateIds, duplicatedIdNames, unlabelledInputs, inlineStyles };
}

const AUDIT = new Map();
const bundle = await buildBundle();
let failed = 0;

for (const route of ROUTES) {
  const ok = await runRoute(bundle, route);
  if (!ok) failed += 1;
}

if (process.env.AUDIT === "1") {
  console.log("\nStructural audit (headings / alt text / names / ids / labels / inline styles)");
  for (const [route, a] of AUDIT) {
    const flags = [];
    if (a.headings !== 1) flags.push(`h1×${a.headings}`);
    if (a.imagesMissingAlt) flags.push(`img-no-alt×${a.imagesMissingAlt}`);
    if (a.unnamedControls) flags.push(`unnamed-controls×${a.unnamedControls}`);
    if (a.duplicateIds) flags.push(`dup-ids×${a.duplicateIds} (${a.duplicatedIdNames.join(", ")})`);
    if (a.unlabelledInputs) flags.push(`unlabelled-fields×${a.unlabelledInputs}`);
    if (flags.length) console.log(`  ${route}: ${flags.join(", ")} (inline styles: ${a.inlineStyles})`);
  }
}

console.log(
  `\n${failed === 0 ? `All ${ROUTES.length} routes mounted cleanly` : `${failed}/${ROUTES.length} route(s) failed`}`
);
process.exit(failed === 0 ? 0 : 1);
