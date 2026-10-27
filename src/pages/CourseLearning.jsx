import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import CourseContentSidebar from "../components/CourseContentSideBar";
import ReviewModal from "../components/ReviewModal";
import api from "../api/axio";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "resources", label: "Resources" },
  { id: "links", label: "Links" },
];

export default function CourseLearning() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fetchCourseDetails = async (showLoading = true) => {
    if (!courseId || courseId === "undefined") return;
    try {
      if (showLoading) setLoading(true);
      const token = localStorage.getItem("token");
      const res = await api.get(`/courses/${courseId}/learning`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCourse(res.data);

      if (!activeLesson && res.data?.modules?.[0]) {
        setActiveLesson(res.data.modules[0]);
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleMarkAsComplete = async (lessonId) => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("token");

      await api.post(
        `/courses/${courseId}/complete-lesson`,
        { lesson_id: lessonId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Lesson completed. Well done!");

      const res = await api.get(`/courses/${courseId}/learning`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourse(res.data);

      if (res.data.progress_percentage === 100) {
        setShowReviewModal(true);
      }
    } catch (error) {
      toast.error("We could not save your progress. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center vh-100 gap-3">
        <div className="spinner-border" role="status"></div>
        <p className="text-muted mb-0">Loading your classroom…</p>
      </div>
    );
  }

  const progress = course?.progress_percentage || 0;
  const handouts = activeLesson?.handouts || [];
  const videoLinks = activeLesson?.video_links || [];

  return (
    <div className="bg-light min-vh-100">
      <NavBar />

      {/* Class header */}
      <div
        className="sticky-top"
        style={{
          top: "var(--th-header-h)",
          zIndex: 1020,
          background: "#fff",
          borderBottom: "1px solid var(--th-line)",
        }}
      >
        <div className="th-container-wide py-2 d-flex align-items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-sm btn-outline-dark flex-shrink-0"
            aria-label="Back to my learning"
          >
            <i className="bi bi-arrow-left" aria-hidden="true"></i>
          </button>

          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <span
              className="d-block text-truncate"
              style={{ fontWeight: 700, color: "var(--th-ink)", fontSize: "var(--th-fs-sm)" }}
            >
              {course?.title}
            </span>
            <button
              type="button"
              className="btn btn-link btn-sm p-0"
              onClick={() => setShowReviewModal(true)}
            >
              <i className="bi bi-star-fill me-1" aria-hidden="true"></i>
              Rate this course
            </button>
          </div>

          <div className="d-none d-md-block" style={{ width: 180 }}>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">
                Progress
              </span>
              <span style={{ fontSize: "var(--th-fs-2xs)", fontWeight: 700 }}>{progress}%</span>
            </div>
            <div
              className="progress"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Course progress"
            >
              <div
                className="progress-bar"
                style={{ width: `${progress}%`, backgroundColor: "var(--th-accent)" }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid p-0">
        <div className="row g-0">
          <div className="col-lg-8">
            <div style={{ background: "#0b1b2d" }}>
              <div className="ratio ratio-16x9">
                {activeLesson?.video_url ? (
                  <video
                    key={activeLesson.video_url}
                    controls
                    controlsList="nodownload"
                    autoPlay
                    className="w-100 h-100"
                  >
                    <source src={activeLesson.video_url} type="video/mp4" />
                  </video>
                ) : (
                  <div className="d-flex flex-column align-items-center justify-content-center text-white p-5 h-100 text-center">
                    <i
                      className="bi bi-file-earmark-text mb-3"
                      style={{ fontSize: 42, opacity: 0.6 }}
                      aria-hidden="true"
                    ></i>
                    <h2 style={{ color: "#fff", fontSize: "var(--th-fs-lg)" }}>
                      Reading material only
                    </h2>
                    <p className="mb-0" style={{ fontSize: "var(--th-fs-sm)", opacity: 0.7 }}>
                      This session has notes instead of a video.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border-bottom p-4">
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                <h1 className="mb-0">
                  {activeLesson?.title || "Select a lesson"}
                </h1>

                {activeLesson && (
                  <button
                    type="button"
                    onClick={() => handleMarkAsComplete(activeLesson.id)}
                    disabled={activeLesson.is_completed || isUpdating}
                    className={`btn ${
                      activeLesson.is_completed ? "btn-secondary" : "btn-outline-dark"
                    } btn-sm`}
                  >
                    {isUpdating ? (
                      <span
                        className="spinner-border spinner-border-sm"
                        aria-hidden="true"
                      ></span>
                    ) : (
                      <i
                        className={`bi ${
                          activeLesson.is_completed ? "bi-check-all" : "bi-check2-circle"
                        }`}
                        aria-hidden="true"
                      ></i>
                    )}
                    {activeLesson.is_completed ? "Completed" : "Mark as complete"}
                  </button>
                )}
              </div>

              <ul className="nav nav-tabs mb-4" role="tablist">
                {TABS.map((tab) => (
                  <li className="nav-item" key={tab.id} role="presentation">
                    <button
                      type="button"
                      role="tab"
                      id={`tab-${tab.id}`}
                      aria-selected={activeTab === tab.id}
                      aria-controls={`panel-${tab.id}`}
                      className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="tab-content">
                {activeTab === "overview" && (
                  <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview">
                    <p className="text-muted mb-4">
                      {activeLesson?.description || "No description provided for this session."}
                    </p>
                    <div className="th-panel-muted">
                      <h2 className="mb-2">
                        Lesson notes
                      </h2>
                      <div
                        className="th-prose"
                        style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}
                      >
                        {activeLesson?.notes || "No notes for this session."}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "resources" && (
                  <div role="tabpanel" id="panel-resources" aria-labelledby="tab-resources">
                    {handouts.length > 0 ? (
                      <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                        {handouts.map((file, index) => {
                          const href = file.url || file.path || file;
                          const label = file.name || `Resource ${index + 1}`;
                          return (
                            <li key={index}>
                              <a
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                className="d-inline-flex align-items-center gap-2"
                                style={{ fontSize: "var(--th-fs-sm)", fontWeight: 600 }}
                              >
                                <i className="bi bi-file-earmark-arrow-down" aria-hidden="true"></i>
                                {label}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-muted mb-0">
                        No downloadable resources for this session.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "links" && (
                  <div role="tabpanel" id="panel-links" aria-labelledby="tab-links">
                    {videoLinks.length > 0 ? (
                      <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                        {videoLinks.map((link, index) => (
                          <li key={index}>
                            <a
                              href={link}
                              target="_blank"
                              rel="noreferrer"
                              className="d-inline-flex align-items-center gap-2"
                              style={{ fontSize: "var(--th-fs-sm)", fontWeight: 600 }}
                            >
                              <i className="bi bi-link-45deg" aria-hidden="true"></i>
                              {link}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted mb-0">
                        No additional links for this session.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4 bg-white border-start">
            <div style={{ position: "sticky", top: "calc(var(--th-header-h) + 58px)" }}>
              <CourseContentSidebar
                modules={course?.modules}
                onLessonSelect={(lesson) => {
                  setActiveLesson(lesson);
                  setActiveTab("overview");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                activeLessonTitle={activeLesson?.title}
              />
              <div className="p-3 border-top">
                <Link to="/learning" className="btn btn-outline-dark w-100 btn-sm">
                  <i className="bi bi-collection-play" aria-hidden="true"></i>
                  Back to my learning
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {showReviewModal && (
        <ReviewModal courseId={courseId} onClose={() => setShowReviewModal(false)} />
      )}
    </div>
  );
}
