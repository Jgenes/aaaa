import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import CourseContentSidebar from "../components/CourseContentSideBar";
import "../App.css";

export default function CourseLearning() {
  return (
    <>
      <NavBar />

      <div
        className="container-fluid course-learning"
        style={{ backgroundColor: "#ffffff", minHeight: "100vh" }} // ✅ White background
      >
        <div className="row">
          {/* ===== VIDEO + CONTENT ===== */}
          <div className="col-lg-8 col-12 p-3">
            {/* VIDEO PLAYER */}
            <div className="video-wrapper mb-3">
              <video controls style={{ width: "100%", borderRadius: "8px" }}>
                <source
                  src="https://www.w3schools.com/html/mov_bbb.mp4"
                  type="video/mp4"
                />
              </video>
            </div>

            {/* TABS */}
            <div className="learning-tabs-content">
              <ul className="nav nav-tabs">
                <li className="nav-item">
                  <button className="nav-link active">Overview</button>
                </li>
                <li className="nav-item">
                  <button className="nav-link" style={{ color: "#111827" }}>
                    Q&A
                  </button>
                </li>
                <li className="nav-item">
                  <button className="nav-link" style={{ color: "#111827" }}>
                    Notes
                  </button>
                </li>
                <li className="nav-item">
                  <button className="nav-link" style={{ color: "#111827" }}>
                    Announcements
                  </button>
                </li>
                <li className="nav-item">
                  <button className="nav-link" style={{ color: "#111827" }}>
                    Reviews
                  </button>
                </li>
                <li className="nav-item">
                  <button className="nav-link" style={{ color: "#111827" }}>
                    Learning tools
                  </button>
                </li>
              </ul>

              {/* OVERVIEW CONTENT */}
              <div className="tab-body mt-3">
                <h4 style={{ fontSize: "20px" }}>
                  The modern JavaScript course for everyone!
                </h4>

                <div className="course-meta">
                  <span style={{ fontSize: "13px" }}>⭐ 4.7</span>
                  <span style={{ fontSize: "13px" }}>1,014,474 Students</span>
                  <span style={{ fontSize: "13px" }}>71 Hours</span>
                </div>

                <p className="mt-3">
                  Master JavaScript with projects, challenges and theory. Many
                  courses in one! Learn modern JavaScript from scratch and
                  become job-ready.
                </p>

                <small className="text-muted">
                  Last updated October 2025 • English
                </small>

                {/* CERTIFICATION */}
                <div className="schedule-box mt-4">
                  <h6>Certification</h6>
                  <p>
                    Download your certificate upon course completion to showcase
                    your achievement.
                  </p>
                  <button className="btn btn-primary btn-sm downLoad-btn">
                    <i className="bi bi-download me-1"></i> Download
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ===== SIDEBAR ===== */}
          <div className="col-lg-4 col-12 p-3">
            <div style={{ position: "sticky", top: "80px" }}>
              <CourseContentSidebar />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
