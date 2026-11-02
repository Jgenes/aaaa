/* ============================================================
   Shared helpers for modal / overlay hygiene.

   Bootstrap's JS appends `.modal-backdrop` elements straight to
   <body> and adds `.modal-open` to <body>. When the markup that
   owns the modal is unmounted (React route change, list refresh,
   a second "Review" click while the first modal is still
   transitioning) the backdrop can be left behind. That orphaned
   backdrop keeps `z-index: 1050` over the whole app and swallows
   every pointer event, so buttons such as Approve / Suspend /
   Reject stop working until the page is hard-reloaded.

   These helpers let an app-controlled (React rendered) modal stay
   in charge and clean up any leftovers from the Bootstrap-driven
   modals on other screens.
   ============================================================ */

/**
 * Remove Bootstrap-created backdrops that were appended to <body> and
 * restore the body to its normal scrollable state.
 *
 * Only direct children of <body> that were NOT rendered by React are
 * touched, so a backdrop owned by an app-controlled modal is never
 * removed from under React.
 */
export function clearStaleModalArtifacts() {
  if (typeof document === "undefined") return;

  document
    .querySelectorAll("body > .modal-backdrop:not([data-th-app-backdrop])")
    .forEach((el) => el.remove());

  document.body.classList.remove("modal-open");
  document.body.style.removeProperty("overflow");
  document.body.style.removeProperty("padding-right");
}

/**
 * Lock page scrolling while a modal is open and restore the previous
 * values when it closes (or when the page unmounts mid-flight).
 *
 * @returns {() => void} cleanup function
 */
export function lockBodyScroll() {
  if (typeof document === "undefined") return () => {};

  const { body } = document;
  const previousOverflow = body.style.overflow;
  const previousPadding = body.style.paddingRight;

  // Compensate for the disappearing scrollbar so the layout does not jump.
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

  body.classList.add("modal-open");
  body.style.overflow = "hidden";
  if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

  return () => {
    body.classList.remove("modal-open");
    body.style.overflow = previousOverflow;
    body.style.paddingRight = previousPadding;
  };
}
