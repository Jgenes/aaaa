import { useEffect, useState } from "react";
import "../../../dashboard.css";
import "../../../App.css";

export default function ProviderDashboardLayout({ title, children }) {
  const [user, setUser] = useState(null);

  // ✅ LOGOUT FUNCTION
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // ✅ CHUKUA DATA KUTOKA LOCALSTORAGE
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    // Kama hana token au data ya user, mrudishe login moja kwa moja
    if (!token || !savedUser) {
      window.location.href = "/login";
      return;
    }

    try {
      // Badilisha data kutoka string kwenda Object ya Javascript
      const userData = JSON.parse(savedUser);
      setUser(userData);
    } catch (error) {
      console.error("Imeshindwa kusoma data za user", error);
      logout();
    }
  }, []);

  return (
    <>
      {/* TOP NAVBAR */}
      <header
        className="navbar sticky-top flex-md-nowrap p-0 shadow"
        style={{ backgroundColor: "#111827" }} // Rangi yako ya asili
      >
        <a
          className="navbar-brand col-md-3 col-lg-2 me-0 px-3 text-white fw-bold"
          href="#"
        >
          TrainingHub
        </a>

        <button
          className="navbar-toggler position-absolute d-md-none collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#sidebarMenu"
          aria-controls="sidebarMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <input
          className="form-control form-control-dark w-100 d-none d-md-block"
          type="text"
          placeholder="Search"
          style={{ backgroundColor: "#1f2937", border: "none", color: "white" }}
        />

        {/* ✅ USER INFO SECTION (TOP BAR) */}
        <div className="navbar-nav">
          <div className="nav-item d-flex align-items-center gap-3 px-3">
            {/* JINA LA USER LINATOKEA HAPA LIKIWA NYEUPE */}
            <div className="d-flex align-items-center text-white">
              <i className="bi bi-person-circle me-2 fs-5"></i>
              <span className="small fw-bold">
                {user ? user.name : "Loading..."}
              </span>
            </div>

            <button
              type="button"
              className="btn btn-sm btn-outline-light logoutButton d-flex align-items-center gap-1"
              onClick={logout}
            >
              <i className="bi bi-box-arrow-right"></i>
              <span className="d-none d-sm-inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="container-fluid">
        <div className="row">
          {/* SIDEBAR */}
          <nav
            id="sidebarMenu"
            className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse"
          >
            <div className="position-sticky pt-3">
              <ul className="nav flex-column">
                <li className="nav-item">
                  <a
                    className="nav-link d-flex gap-2"
                    href="/provider/dashboard"
                  >
                    <i className="bi bi-speedometer2"></i>
                    Overview
                  </a>
                </li>

                <li className="nav-item">
                  <a className="nav-link d-flex gap-2" href="/provider/course">
                    <i className="bi bi-journal-text"></i>
                    Trainings
                  </a>
                </li>
<li className="nav-item">
                  <a className="nav-link d-flex gap-2" href="/provider/all-cohorts">
                    <i className="bi bi-people"></i>
                    Cohorts
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link d-flex gap-2"
                    href="/provider/all-enrollments"
                  >
                    <i className="bi bi-person-lines-fill"></i>
                    Enrollments
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className="nav-link d-flex gap-2"
                    href="/provider/invoices"
                  >
                    <i className="bi bi-receipt"></i>
                    Invoices & Receipts
                  </a>
                </li>

                <li className="nav-item">
                  <a className="nav-link d-flex gap-2" href="/provider/profile">
                    <i className="bi bi-person"></i>
                    Profile
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className="nav-link d-flex gap-2"
                    href="/provider/settings"
                  >
                    <i className="bi bi-gear"></i>
                    Settings
                  </a>
                </li>
              </ul>

              <hr />

              <h6 className="sidebar-heading px-3 text-muted text-uppercase small">
                Reports
              </h6>

              <ul className="nav flex-column mb-2">
                <li className="nav-item">
                  <a className="nav-link d-flex gap-2" href="/provider/reports">
                    <i className="bi bi-file-earmark-text"></i>
                    Reports
                  </a>
                </li>

                 <li className="nav-item">
                  <a className="nav-link d-flex gap-2" href="/provider/review">
<i className="bi bi-star"></i>                    Reviews
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className="nav-link d-flex gap-2"
                    href="/provider/social-engagement"
                  >
                    <i className="bi bi-graph-up"></i>
                    Engagement
                  </a>
                </li>
              </ul>
            </div>
          </nav>

          {/* PAGE CONTENT */}
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div className="pt-3 pb-2 mb-3 border-bottom">
              <h1 className="h2 h2i" style={{ fontWeight: "700" }}>
                {title}
              </h1>
            </div>

            {/* Hapa ndipo page content yako inatokea */}
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
