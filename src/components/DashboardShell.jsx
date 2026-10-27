import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LOGO from "../assets/trainhub-tz-logo.png";

/**
 * Shared application shell for provider and admin dashboards.
 * Handles the responsive sidebar, active navigation states and top bar.
 */
export default function DashboardShell({
  title,
  subtitle,
  eyebrow,
  sections = [],
  user,
  onLogout,
  children,
}) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close the mobile drawer on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Escape closes the drawer
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  const isActive = (to) =>
    location.pathname === to || location.pathname.startsWith(`${to}/`);

  const initials = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="th-app">
      <aside
        id="sidebarMenu"
        className={`th-sidebar ${sidebarOpen ? "is-open" : ""}`}
        aria-label="Dashboard navigation"
      >
        <div className="th-sidebar__brand">
          <Link to="/" aria-label="TrainHub TZ home">
            <img src={LOGO} alt="TrainHub TZ" width="413" height="127" />
          </Link>
        </div>

        <div className="th-sidebar__scroll">
          {sections.map((section, index) => (
            <div key={section.heading || index}>
              {section.heading && (
                <p className="th-sidebar__section">{section.heading}</p>
              )}
              <nav aria-label={section.heading || "Main"}>
                {section.items.map((item) =>
                  item.disabled ? (
                    <span
                      key={item.label}
                      className="th-sidebar__link"
                      aria-disabled="true"
                      style={{ opacity: 0.55, cursor: "not-allowed" }}
                    >
                      <i className={`bi ${item.icon}`} aria-hidden="true"></i>
                      {item.label}
                      <span className="badge ms-auto">Soon</span>
                    </span>
                  ) : (
                    <Link
                      key={item.label}
                      to={item.to}
                      className={`th-sidebar__link ${isActive(item.to) ? "is-active" : ""}`}
                      aria-current={isActive(item.to) ? "page" : undefined}
                    >
                      <i className={`bi ${item.icon}`} aria-hidden="true"></i>
                      {item.label}
                      {item.badge > 0 && (
                        <span className="badge" aria-label={`${item.badge} new`}>
                          {item.badge > 9 ? "9+" : item.badge}
                        </span>
                      )}
                    </Link>
                  )
                )}
              </nav>
            </div>
          ))}
        </div>

        <div className="th-sidebar__footer">
          <Link to="/trainings" className="th-sidebar__cta">
            View public site
          </Link>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="th-scrim"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        ></button>
      )}

      <div className="th-app__main">
        <header className="th-topbar">
          <button
            type="button"
            className="th-topbar__toggle"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-expanded={sidebarOpen}
            aria-controls="sidebarMenu"
            aria-label="Toggle navigation"
          >
            <i className="bi bi-list" aria-hidden="true"></i>
          </button>

          <div className="th-topbar__titles">
            <span className="th-topbar__eyebrow">{eyebrow || "Workspace"}</span>
            <h1 className="th-topbar__title">{title}</h1>
          </div>

          <div className="th-topbar__actions">
            <div className="th-topbar__user">
              <span className="th-avatar th-avatar--dark" aria-hidden="true">
                {initials}
              </span>
              <span className="th-topbar__user-name">{user?.name || "Loading…"}</span>
            </div>
            <button
              type="button"
              className="th-topbar__logout"
              onClick={onLogout}
              aria-label="Log out"
            >
              <i className="bi bi-box-arrow-right" aria-hidden="true"></i>
              <span className="d-none d-md-inline">Log out</span>
            </button>
          </div>
        </header>

        <main className="th-app__content" id="main-content">
          {subtitle && (
            <div className="th-content-head">
              <div>
                <h2 className="th-content-head__title">{title}</h2>
                <p className="th-content-head__sub">{subtitle}</p>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
