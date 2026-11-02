/* ============================================================
   Session + "continue where you left off" helpers.

   Every guarded screen needs the same three answers:
     1. Is there a session? (token + user in localStorage)
     2. Where may this role go?
     3. Where was the visitor heading when we interrupted them?

   The intended destination is kept in sessionStorage so it survives
   the email/OTP round-trip, a page reload, and a logout → login cycle
   inside the same tab.
   ============================================================ */

const RETURN_TO_KEY = "th:returnTo";

/** Pages that must never be used as a "come back to" destination. */
const AUTH_PAGE_PATTERNS = [
  /^\/login$/,
  /^\/otp-verification$/,
  /^\/register$/,
  /^\/tenant-register$/,
  /^\/forgot-password$/,
  /^\/reset-password$/,
  /^\/activate-account$/,
];

export const ROLE_HOME = {
  admin: "/admin/dashboard",
  provider: "/provider/dashboard",
  learner: "/learning",
  student: "/learning",
  user: "/learning",
};

/** Landing page for a role, falling back to the learner workspace. */
export function roleHome(role) {
  return ROLE_HOME[role] || ROLE_HOME.learner;
}

/** Areas that cannot render anything useful without a session. */
export function requiresSession(path) {
  return /^\/(admin|provider|tenant|learning|transactions|checkout)(\/|$)/.test(
    String(path || "")
  );
}

export function isAuthPage(pathname = "") {
  return AUTH_PAGE_PATTERNS.some((pattern) => pattern.test(pathname));
}

/**
 * Accept only same-origin, absolute paths ("/provider/course").
 * Rejects protocol-relative ("//evil.com"), absolute URLs and junk so a
 * crafted ?next= can never bounce a user to another site.
 */
export function safeInternalPath(candidate) {
  if (typeof candidate !== "string") return null;
  const value = candidate.trim();
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  if (/[\s\\]/.test(value)) return null;
  if (value.includes("://")) return null;
  return value;
}

/** Which roles may open a given path. */
export function canRoleAccessPath(role, path) {
  const target = safeInternalPath(path);
  if (!target) return false;

  if (target.startsWith("/admin")) return role === "admin";
  if (target.startsWith("/provider") || target.startsWith("/tenant/onboarding")) {
    return role === "provider";
  }
  // Public + learner pages are open to anyone who is signed in.
  return true;
}

/* ------------------------------------------------------------
   Session
   ------------------------------------------------------------ */

export function getToken() {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

export function readUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function getRole() {
  return readUser()?.role || null;
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function clearSession() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("USER_INFO");
    localStorage.removeItem("loginEmail");
  } catch {
    /* storage unavailable – nothing to clear */
  }
}

/* ------------------------------------------------------------
   Return-to destination
   ------------------------------------------------------------ */

export function rememberReturnTo(path) {
  const target = safeInternalPath(path);
  if (!target) return null;

  // Never trap the visitor in a redirect loop on an auth screen.
  const pathname = target.split("?")[0];
  if (isAuthPage(pathname)) return null;

  try {
    sessionStorage.setItem(RETURN_TO_KEY, target);
  } catch {
    /* private mode – the redirect still works, it just is not remembered */
  }
  return target;
}

export function peekReturnTo() {
  try {
    return safeInternalPath(sessionStorage.getItem(RETURN_TO_KEY));
  } catch {
    return null;
  }
}

export function clearReturnTo() {
  try {
    sessionStorage.removeItem(RETURN_TO_KEY);
  } catch {
    /* ignore */
  }
}

export function consumeReturnTo() {
  const target = peekReturnTo();
  clearReturnTo();
  return target;
}

/** Build the login URL that brings the visitor back afterwards. */
export function loginPathFor(path) {
  const target = rememberReturnTo(path);
  return target ? `/login?next=${encodeURIComponent(target)}` : "/login";
}

/**
 * Pick the destination after a successful sign-in.
 *
 * Priority: the page the visitor was interrupted on → the redirect the API
 * returned → the role's home. Anything the role may not open is skipped.
 */
export function resolvePostLoginPath({ next, backendRedirect, role } = {}) {
  const candidates = [next, peekReturnTo(), backendRedirect];
  for (const candidate of candidates) {
    const target = safeInternalPath(candidate);
    if (target && canRoleAccessPath(role, target)) {
      clearReturnTo();
      return target;
    }
  }
  clearReturnTo();
  return roleHome(role);
}

/** Human label for a destination, used in the "continue where you left off" hint. */
export function describePath(path) {
  const pathname = (safeInternalPath(path) || "").split("?")[0];
  const labels = [
    [/^\/admin\/providers/, "provider review"],
    [/^\/admin\/courses/, "course moderation"],
    [/^\/admin\/transactions/, "admin transactions"],
    [/^\/admin\/reports/, "reports"],
    [/^\/admin(\/|$)/, "the admin workspace"],
    [/^\/provider\/dashboard/, "your provider dashboard"],
    [/^\/provider\/course/, "your trainings"],
    [/^\/provider\/createCourse/, "the course builder"],
    [/^\/provider\/cohorts/, "your cohorts"],
    [/^\/provider\/enrollments|^\/provider\/all-enrollments/, "your enrolments"],
    [/^\/provider\/invoices|^\/provider\/transactions/, "your invoices"],
    [/^\/provider\/reports/, "your reports"],
    [/^\/provider\/review/, "your reviews"],
    [/^\/provider\/profile|^\/provider\/settings/, "your account settings"],
    [/^\/provider/, "the provider workspace"],
    [/^\/tenant\/onboarding/, "your provider application"],
    [/^\/learning/, "your learning workspace"],
    [/^\/transactions/, "your transactions"],
    [/^\/checkout/, "checkout"],
    [/^\/course\//, "the course you were viewing"],
    [/^\/trainings/, "the training catalogue"],
  ];

  const match = labels.find(([pattern]) => pattern.test(pathname || ""));
  return match ? match[1] : "where you left off";
}
