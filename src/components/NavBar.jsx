import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import LOGO from "../assets/trainhub-tz-logo.png";
import NotificationBar from "./NotificationBar";

const NAV_LINKS = [
  { to: "/", label: "Explore", match: (p) => p === "/" },
  {
    to: "/trainings",
    label: "Trainings",
    match: (p) => p.startsWith("/trainings") || p.startsWith("/course/"),
  },
  { to: "/learning", label: "My Learning", auth: true, match: (p) => p.startsWith("/learning") },
  {
    to: "/transactions",
    label: "Transactions",
    auth: true,
    match: (p) => p.startsWith("/transactions"),
  },
  { to: "/contact", label: "Contact", guest: true, match: (p) => p === "/contact" },
];

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // A provider who has not completed onboarding gets a distraction-free header
  const isProviderOnboarding = user.role === "provider" && user.onboarded === false;

  const dashboardPath =
    user.role === "admin" ? "/admin/dashboard" : "/provider/dashboard";
  const canAccessDashboard = user.role === "admin" || user.role === "provider";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const term = searchTerm.trim();
    setIsNavOpen(false);
    navigate(term ? `/trainings?q=${encodeURIComponent(term)}` : "/trainings");
  };

  // Close menus when the route changes
  useEffect(() => {
    setIsNavOpen(false);
    setIsOpen(false);
  }, [location.pathname]);

  // Close the account menu on outside click / Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsNavOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const visibleLinks = NAV_LINKS.filter((link) => {
    if (isProviderOnboarding) return link.guest === true;
    if (link.auth) return Boolean(token);
    if (link.guest) return !token;
    return true;
  });

  const renderSearch = (id) => (
    <form className="site-search" role="search" onSubmit={handleSearch}>
      <i className="bi bi-search site-search__icon" aria-hidden="true"></i>
      <label htmlFor={id} className="visually-hidden">
        Search trainings
      </label>
      <input
        id={id}
        type="search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search trainings, skills…"
        autoComplete="off"
      />
    </form>
  );

  const renderUserMenu = () => (
    <div className="site-account" ref={dropdownRef}>
      <button
        type="button"
        className="site-account__trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Account menu for ${user.name || "user"}`}
      >
        <span className="th-avatar th-avatar--dark" aria-hidden="true">
          {user.name?.charAt(0).toUpperCase() || "U"}
        </span>
        <i className="bi bi-chevron-down site-account__chevron" aria-hidden="true"></i>
      </button>

      {isOpen && (
        <div className="site-account__menu" role="menu">
          <div className="site-account__identity">
            <span className="site-account__name">{user.name || "Your account"}</span>
            <span className="site-account__role">
              {isProviderOnboarding ? "Onboarding" : user.role || "Learner"}
            </span>
          </div>

          {canAccessDashboard && (
            <Link className="site-account__item" to={dashboardPath} role="menuitem">
              <i className="bi bi-speedometer2" aria-hidden="true"></i>
              Dashboard
            </Link>
          )}
          <Link className="site-account__item" to="/learning" role="menuitem">
            <i className="bi bi-collection-play" aria-hidden="true"></i>
            My learning
          </Link>
          <Link className="site-account__item" to="/transactions" role="menuitem">
            <i className="bi bi-receipt" aria-hidden="true"></i>
            Transactions
          </Link>
          <div className="dropdown-divider"></div>
          <button
            type="button"
            className="site-account__item site-account__item--danger"
            onClick={handleLogout}
            role="menuitem"
          >
            <i className="bi bi-box-arrow-right" aria-hidden="true"></i>
            Log out
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <NotificationBar />

      <header className="site-header">
        <div className="th-container-wide site-header__inner">
          <Link to="/" className="site-brand">
            <img
              src={LOGO}
              alt="TrainHub TZ — Elevating Skills. Transforming Tanzania."
              width="413"
              height="127"
            />
          </Link>

          <nav className="site-nav" aria-label="Primary">
            {visibleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`site-nav__link ${
                  link.match(location.pathname) ? "is-active" : ""
                }`}
                aria-current={link.match(location.pathname) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {!isProviderOnboarding && (
            <div className="site-header__search d-none d-xl-block">
              {renderSearch("site-search-desktop")}
            </div>
          )}

          <div className="site-actions">
            {token ? (
              renderUserMenu()
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-dark btn-sm">
                  Log in
                </Link>
                <Link to="/tenant-register" className="btn btn-primary btn-sm">
                  Join as provider
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="site-toggle"
            onClick={() => setIsNavOpen((prev) => !prev)}
            aria-expanded={isNavOpen}
            aria-controls="site-mobile-menu"
            aria-label={isNavOpen ? "Close menu" : "Open menu"}
          >
            <i className={`bi ${isNavOpen ? "bi-x-lg" : "bi-list"}`} aria-hidden="true"></i>
          </button>
        </div>

        <div
          id="site-mobile-menu"
          className={`site-mobile ${isNavOpen ? "is-open" : ""}`}
        >
          <div className="th-container-wide">
            {!isProviderOnboarding && (
              <div className="site-mobile__search">
                {renderSearch("site-search-mobile")}
              </div>
            )}

            {token && (
              <div className="site-mobile__account">
                <span className="th-avatar th-avatar--dark" aria-hidden="true">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </span>
                <div style={{ minWidth: 0 }}>
                  <span className="site-account__name">{user.name || "Your account"}</span>
                  <span className="site-account__role">
                    {isProviderOnboarding ? "Onboarding" : user.role || "Learner"}
                  </span>
                </div>
              </div>
            )}

            <ul className="site-mobile__list">
              {visibleLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`site-mobile__link ${
                      link.match(location.pathname) ? "is-active" : ""
                    }`}
                    onClick={() => setIsNavOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {canAccessDashboard && (
                <li>
                  <Link
                    to={dashboardPath}
                    className="site-mobile__link"
                    onClick={() => setIsNavOpen(false)}
                  >
                    Dashboard
                  </Link>
                </li>
              )}
            </ul>

            <div className="site-mobile__actions">
              {token ? (
                <button
                  type="button"
                  className="btn btn-outline-dark w-100"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right" aria-hidden="true"></i>
                  Log out
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn btn-outline-dark w-100"
                    onClick={() => setIsNavOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/tenant-register"
                    className="btn btn-primary w-100"
                    onClick={() => setIsNavOpen(false)}
                  >
                    Join as provider
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
