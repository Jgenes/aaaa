import { useEffect } from "react";
import { clearStaleModalArtifacts } from "../lib/modalOverlay";

/**
 * App-wide safety net for modal overlays.
 *
 * Several screens still open dialogs through Bootstrap's data API, which
 * appends `.modal-backdrop` elements to <body> and adds `.modal-open` to it.
 * If the owning markup unmounts (route change, list refresh) the backdrop can
 * be orphaned and then silently blocks every click on the page — the "I can't
 * press Approve / Suspend / Reject" symptom.
 *
 * This guard watches <body> and, once the DOM has been quiet for a moment and
 * no dialog is actually open, removes the leftovers. It never touches a
 * backdrop while a modal is showing, so it cannot break a dialog that is
 * mid-transition.
 */
export default function OverlayGuard() {
  useEffect(() => {
    let timer = null;

    const hasOpenDialog = () => {
      const dialog =
        document.querySelector(".modal.show") || document.querySelector(".modal.fade.show");
      return Boolean(dialog);
    };

    const sweep = () => {
      if (hasOpenDialog()) return;

      const leftovers = document.querySelectorAll("body > .modal-backdrop");
      const bodyLocked =
        document.body.classList.contains("modal-open") ||
        document.body.style.overflow === "hidden";

      if (leftovers.length || bodyLocked) clearStaleModalArtifacts();
    };

    const schedule = () => {
      window.clearTimeout(timer);
      // Wait for a transition to finish before judging the DOM.
      timer = window.setTimeout(sweep, 400);
    };

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      childList: true,
      subtree: false,
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    const interval = window.setInterval(sweep, 2000);
    schedule();

    return () => {
      observer.disconnect();
      window.clearInterval(interval);
      window.clearTimeout(timer);
    };
  }, []);

  return null;
}
