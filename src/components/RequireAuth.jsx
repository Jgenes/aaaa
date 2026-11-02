import { Navigate, useLocation } from "react-router-dom";
import {
  getRole,
  isAuthenticated,
  loginPathFor,
  roleHome,
  safeInternalPath,
} from "../lib/session";

/**
 * Route guard for signed-in areas.
 *
 * - No session → go to the login screen, remembering the exact page (and
 *   query string) so the visitor lands back there after the OTP step, a
 *   reload, or a logout → login cycle.
 * - Wrong role → send them to the workspace they actually own instead of
 *   showing an empty or broken screen.
 *
 * `allow` lists the roles permitted to render the route. Omit it to accept
 * any signed-in visitor.
 */
export default function RequireAuth({ allow, children }) {
  const location = useLocation();
  const currentPath = `${location.pathname}${location.search}`;

  if (!isAuthenticated()) {
    return <Navigate to={loginPathFor(currentPath)} replace />;
  }

  const role = getRole();

  if (allow?.length && role && !allow.includes(role)) {
    // A deep link the role may not open: fall back to their own home, but
    // keep them out of a redirect loop by only redirecting when the target
    // really differs from where they already are.
    const home = roleHome(role);
    if (safeInternalPath(home) && home !== location.pathname) {
      return <Navigate to={home} replace />;
    }
  }

  // Defensive: a role-less session still gets through; the API is the final
  // authority on authorisation.
  return children;
}

/** Convenience wrappers so routes read declaratively. */
export function RequireAdmin({ children }) {
  return <RequireAuth allow={["admin"]}>{children}</RequireAuth>;
}

export function RequireProvider({ children }) {
  return <RequireAuth allow={["provider"]}>{children}</RequireAuth>;
}

export function RequireLearner({ children }) {
  return (
    <RequireAuth allow={["learner", "student", "user", "provider", "admin"]}>
      {children}
    </RequireAuth>
  );
}
