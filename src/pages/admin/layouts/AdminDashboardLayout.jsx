import { useEffect, useState } from "react";
import "../../../dashboard.css";
import "../../../App.css";
import api from "../../../api/axio"; 

export default function AdminDashboardLayout({ title, children }) {
  const [user, setUser] = useState(null);

  // ✅ 1. State ya Notifications (Counts)
  const [counts, setCounts] = useState({
    providers: 0,
    courses: 0,
    transactions: 0,
    reports: 0,
    logs: 0
  });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // ✅ 2. Kuvuta Data ya Notifications
  const fetchCounts = async () => {
    try {
      const res = await api.get("/admin/notifications/count");
      if (res.data) setCounts(res.data);
    } catch (error) {
      console.error("Notification fetch error", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
      window.location.href = "/login";
      return;
    }

    try {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      fetchCounts();
      const interval = setInterval(fetchCounts, 120000);
      return () => clearInterval(interval);
    } catch (error) {
      logout();
    }
  }, []);

  // ✅ 3. Helper ya Kiduara Chekundu (Badge)
  const RedDot = ({ count }) => {
    if (!count || count <= 0) return null;
    return (
      <span className="badge rounded-pill bg-danger ms-auto" style={{ fontSize: '10px', padding: '3px 6px' }}>
        {count > 9 ? '9+' : count}
      </span>
    );
  };

  return (
    <>
      <header className="navbar sticky-top flex-md-nowrap p-0 shadow" style={{ backgroundColor: "#111827" }}>
        <a className="navbar-brand col-md-3 col-lg-2 me-0 px-3 text-white fw-bold" href="#">
          TrainingHub
        </a>

        <button className="navbar-toggler position-absolute d-md-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarMenu">
          <span className="navbar-toggler-icon"></span>
        </button>

        <input className="form-control form-control-dark w-100 d-none d-md-block" type="text" placeholder="Search" style={{ backgroundColor: "#1f2937", border: "none", color: "white" }} />

        <div className="navbar-nav">
          <div className="nav-item d-flex align-items-center gap-3 px-3">
            <div className="d-flex align-items-center text-white">
              <i className="bi bi-person-circle me-2 fs-5"></i>
              <span className="small fw-bold">{user ? user.name : "Loading..."}</span>
            </div>

            <button type="button" className="btn btn-sm btn-outline-light logoutButton d-flex align-items-center gap-1" onClick={logout}>
              <i className="bi bi-box-arrow-right"></i>
              <span className="d-none d-sm-inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container-fluid">
        <div className="row">
          <nav id="sidebarMenu" className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
            <div className="position-sticky pt-3">
              <ul className="nav flex-column">
                <li className="nav-item">
                  <a className="nav-link d-flex gap-2" href="/admin/dashboard">
                    <i className="bi bi-speedometer2"></i> Overview
                  </a>
                </li>

                <li className="nav-item">
                  <a className="nav-link d-flex gap-2 align-items-center" href="/admin/providers">
                    <i className="bi bi-building"></i> Providers
                    <RedDot count={counts.providers} />
                  </a>
                </li>

                <li className="nav-item">
                  <a className="nav-link d-flex gap-2 align-items-center" href="/admin/courses">
                    <i className="bi bi-book"></i> Courses
                    <RedDot count={counts.courses} />
                  </a>
                </li>

                <li className="nav-item">
                  <a className="nav-link d-flex gap-2 align-items-center" href="/admin/transactions">
                    <i className="bi bi-credit-card"></i> Transactions
                    <RedDot count={counts.transactions} />
                  </a>
                </li>

                <li className="nav-item">
                  <a className="nav-link d-flex gap-2" href="/provider/settings">
                    <i className="bi bi-gear"></i> Settings
                  </a>
                </li>
              </ul>

              <hr />

              <h6 className="sidebar-heading px-3 text-muted text-uppercase small">
                Reports
              </h6>

              <ul className="nav flex-column mb-2">
                <li className="nav-item">
                  <a className="nav-link d-flex gap-2 align-items-center" href="/admin/reports">
                    <i className="bi bi-bar-chart"></i> Reports
                    <RedDot count={counts.reports} />
                  </a>
                </li>

                <li className="nav-item">
                  <a className="nav-link d-flex gap-2 align-items-center" href="/admin/logs">
                    <i className="bi bi-terminal"></i> Logs
                    <RedDot count={counts.logs} />
                  </a>
                </li>
              </ul>
            </div>
          </nav>

          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div className="pt-3 pb-2 mb-3 border-bottom">
              <h1 className="h2 h2i" style={{ fontWeight: "700" }}>
                {title}
              </h1>
            </div>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}