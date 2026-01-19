import { useEffect, useState } from "react";
import "../../../dashboard.css";
import "../../../app.css";

export default function ProviderDashboardLayout({ title, children }) {
  const [user, setUser] = useState(null);

  // ✅ LOGOUT FUNCTION
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // ✅ CHUKUA DATA KUTOKA LOCALSTORAGE (BILA KUTUMIA API ROUTE)
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
        className="navbar sticky-top bg-white flex-md-nowrap p-0 shadow"
        style={{ backgroundColor: "#111827" }}
      >
        <a className="navbar-brand col-md-3 col-lg-2 me-0 px-3" href="#">
          TrainingHub
        </a>

        <button
          className="navbar-toggler position-absolute d-md-none collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#sidebarMenu"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <input
          className="form-control form-control-dark w-100"
          type="text"
          placeholder="Search"
        />

        {/* USER INFO SECTION */}
        <div className="navbar-nav">
          <div className="nav-item d-flex align-items-center gap-3 px-3 text-white">
            {/* Hapa ndipo jina lako linatokea kutoka kwenye LocalStorage */}
            <span className="small text-white" style={{ color: "#111827" }}>
              <i className="bi bi-person-circle me-1"></i>
              {user ? user.name : "Mgeni"}
            </span>

            <button
              type="button"
              className="btn btn-sm btn-outline-light logoutButton d-flex align-items-center gap-1"
              onClick={logout}
            >
              <i className="bi bi-box-arrow-right"></i>
              Logout
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
                    Courses
                  </a>
                </li>

                <li className="nav-item">
                  <a className="nav-link d-flex gap-2" href="/provider/cohorts">
                    <i className="bi bi-calendar-event"></i>
                    Cohorts / Intakes
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className="nav-link d-flex gap-2"
                    href="/tenant/enrollments"
                  >
                    <i className="bi bi-people"></i>
                    Enrollments
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className="nav-link d-flex gap-2"
                    href="/tenant/enrollments"
                  >
                    <i className="bi bi-people"></i>
                    Invoices & Receipts
                  </a>
                </li>

                <li className="nav-item">
                  <a className="nav-link d-flex gap-2" href="/tenant/profile">
                    <i className="bi bi-person"></i>
                    Profile
                  </a>
                </li>

                <li className="nav-item">
                  <a className="nav-link d-flex gap-2" href="/tenant/settings">
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
                  <a
                    className="nav-link d-flex gap-2"
                    href="/tenant/reports/courses"
                  >
                    <i className="bi bi-file-earmark-text"></i>
                    Course Reports
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className="nav-link d-flex gap-2"
                    href="/tenant/reports/engagement"
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
              <h1 className="h2 h2i">{title}</h1>
            </div>

            {/* Hapa ndipo page content yako inatokea */}
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
