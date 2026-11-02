import { useCallback } from "react";

/**
 * Keyboard "skip to content" link.
 *
 * Rendered from React (not index.html) so it can move focus to the real
 * landmark once the route has mounted, and can clean the `#main-content`
 * hash out of the address bar afterwards — a leftover hash made the SPA
 * jump back to the content landmark on every later navigation.
 */
export default function SkipLink() {
  const handleClick = useCallback((event) => {
    const main = document.getElementById("main-content");
    if (!main) return; // fall back to the browser's native anchor jump

    event.preventDefault();

    // Landmarks are not focusable by default; make it so for this jump only.
    if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
    main.focus({ preventScroll: true });

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    main.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });

    // Keep the URL clean so the hash does not persist across route changes.
    if (window.location.hash) {
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.search}`
      );
    }
  }, []);

  return (
    <a className="skip-link" href="#main-content" onClick={handleClick}>
      Skip to main content
    </a>
  );
}
