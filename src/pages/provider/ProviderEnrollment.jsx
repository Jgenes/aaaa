import "../../dashboard.css";
import "../../App.css";
import { useState } from "react";

export default function ProviderEnrollments() {
  // SAMPLE enrollment data
  const [enrollments] = useState([
    {
      id: 1,
      student: "John Doe",
      course: "Fullstack Web Development",
      cohort: "Jan 2026",
      date: "2026-01-05",
      status: "Active",
    },
    {
      id: 2,
      student: "Anna Smith",
      course: "UI/UX Design Fundamentals",
      cohort: "Jan 2026",
      date: "2026-01-06",
      status: "Completed",
    },
    {
      id: 3,
      student: "Michael Brown",
      course: "Fullstack Web Development",
      cohort: "Oct 2025",
      date: "2025-10-20",
      status: "Pending",
    },
  ]);

  return (
    <>
      {/* HEADER */}
      <header className="navbar navbar-dark sticky-top bg-dark p-0 shadow">
        <a className="navbar-brand px-3" href="#">
          TrainingHub
        </a>
      </header>

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
                    className="nav-link d-flex align-items-center gap-2"
                    href="#"
                  >
                    <i className="bi bi-speedometer2"></i>
                    Dashboard
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className="nav-link d-flex align-items-center gap-2"
                    href="#"
                  >
                    <i className="bi bi-journal-text"></i>
                    Courses
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className="nav-link d-flex align-items-center gap-2"
                    href="#"
                  >
                    <i className="bi bi-calendar-event"></i>
                    Cohorts
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className="nav-link active d-flex align-items-center gap-2"
                    href="#"
                  >
                    <i className="bi bi-people"></i>
                    Enrollments
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className="nav-link d-flex align-items-center gap-2"
                    href="#"
                  >
                    <i className="bi bi-gear"></i>
                    Settings
                  </a>
                </li>
              </ul>

              <hr className="my-3" />

              <h6 className="sidebar-heading px-3 mb-2 text-muted text-uppercase small">
                Reports
              </h6>

              <ul className="nav flex-column mb-2">
                <li className="nav-item">
                  <a
                    className="nav-link d-flex align-items-center gap-2"
                    href="#"
                  >
                    <i className="bi bi-file-earmark-text"></i>
                    Course Reports
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className="nav-link d-flex align-items-center gap-2"
                    href="#"
                  >
                    <i className="bi bi-graph-up"></i>
                    Engagement
                  </a>
                </li>
              </ul>
            </div>
          </nav>

          {/* MAIN */}
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-3 border-bottom">
              <h3 className="h2">Enrollment Management</h3>
            </div>

            {/* TABLE */}
            <div className="card">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Cohort</th>
                      <th>Enrolled On</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">
                          No enrollments found
                        </td>
                      </tr>
                    ) : (
                      enrollments.map((e) => (
                        <tr key={e.id}>
                          <td>{e.student}</td>
                          <td>{e.course}</td>
                          <td>{e.cohort}</td>
                          <td>{e.date}</td>
                          <td>
                            <span
                              className={`badge ${
                                e.status === "Active"
                                  ? "bg-success"
                                  : e.status === "Completed"
                                  ? "bg-primary"
                                  : "bg-warning text-dark"
                              }`}
                            >
                              {e.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
