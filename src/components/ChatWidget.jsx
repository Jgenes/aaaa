import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * Floating "Chat with us" launcher.
 *
 * There is no live-chat backend in the project, so the panel opens the real
 * support channels (WhatsApp, phone, email) plus the contact form instead of
 * pretending to be an inbox.
 */

const PHONE_DISPLAY = "+255 745 732 935";
const PHONE_HREF = "tel:+255745732935";
const WHATSAPP_HREF = "https://wa.me/255745732935";
const EMAIL = "info@traininghub.co.tz";

// Focused flows: the launcher would sit on top of the submit button on small
// screens, and an auth form is not a good place to upsell support.
const HIDDEN_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/otp-verification",
  "/activate-account",
];

const CHANNELS = [
  {
    icon: "bi-whatsapp",
    label: "WhatsApp",
    hint: "Fastest reply during office hours",
    href: WHATSAPP_HREF,
    external: true,
  },
  {
    icon: "bi-telephone",
    label: "Call the team",
    hint: PHONE_DISPLAY,
    href: PHONE_HREF,
  },
  {
    icon: "bi-envelope",
    label: "Email us",
    hint: EMAIL,
    href: `mailto:${EMAIL}`,
  },
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const toggleRef = useRef(null);
  const closeRef = useRef(null);
  const location = useLocation();
  const hidden = HIDDEN_PREFIXES.some((prefix) => location.pathname.startsWith(prefix));

  // Close when the route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Move focus into the panel when it opens (the panel sits before the
  // launcher in the DOM, so tabbing alone would skip it).
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };

    const onPointerDown = (event) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        !toggleRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  if (hidden) return null;

  return (
    <div className="th-chat">
      {open && (
        <div
          className="th-chat__panel"
          id="th-chat-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="th-chat-title"
          ref={panelRef}
        >
          <div className="th-chat__head">
            <div>
              <p className="th-chat__eyebrow">TrainHub TZ support</p>
              <h2 className="th-chat__title" id="th-chat-title">
                Chat with us
              </h2>
            </div>
            <button
              type="button"
              className="th-chat__close"
              ref={closeRef}
              onClick={() => {
                setOpen(false);
                toggleRef.current?.focus();
              }}
              aria-label="Close chat options"
            >
              <i className="bi bi-x-lg" aria-hidden="true"></i>
            </button>
          </div>

          <p className="th-chat__text">
            Questions about a training, a cohort date or a payment? Reach the team on
            whichever channel suits you.
          </p>

          <ul className="th-chat__channels">
            {CHANNELS.map((channel) => (
              <li key={channel.label}>
                <a
                  className="th-chat__channel"
                  href={channel.href}
                  {...(channel.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <span className="th-chat__channel-icon">
                    <i className={`bi ${channel.icon}`} aria-hidden="true"></i>
                  </span>
                  <span>
                    <strong>{channel.label}</strong>
                    <small>{channel.hint}</small>
                  </span>
                </a>
              </li>
            ))}
            <li>
              <Link className="th-chat__channel" to="/contact" onClick={() => setOpen(false)}>
                <span className="th-chat__channel-icon">
                  <i className="bi bi-chat-left-text" aria-hidden="true"></i>
                </span>
                <span>
                  <strong>Contact form</strong>
                  <small>Send us the details and we reply by email</small>
                </span>
              </Link>
            </li>
          </ul>
        </div>
      )}

      <button
        type="button"
        className={`th-chat__toggle ${open ? "is-open" : ""}`}
        ref={toggleRef}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="th-chat-panel"
      >
        <i
          className={`bi ${open ? "bi-x-lg" : "bi-chat-dots"} th-chat__toggle-icon`}
          aria-hidden="true"
        ></i>
        <span className="th-chat__toggle-label">{open ? "Close" : "Chat with us"}</span>
      </button>
    </div>
  );
}
