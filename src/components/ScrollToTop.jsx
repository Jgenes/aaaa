import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Restores the expected scroll position on navigation.
 *
 * A new page starts at the top; returning to a guarded page the visitor was
 * interrupted on keeps them at the top too, so no screen ever opens
 * mid-scroll (a common "the UI is broken" symptom on long dashboards).
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? "auto" : "auto" });
  }, [pathname, search]);

  return null;
}
