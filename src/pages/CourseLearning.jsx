import { useEffect, useMemo, useState } from "react";
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

function formatDuration(duration) {
  if (duration === null || duration === undefined || duration === "") return "10 min";
  if (typeof duration === "number" || /^\d+(\.\d+)?$/.test(String(duration).trim())) {
    return `${duration} min`;
  }
  return String(duration);
}

function fileNameFromUrl(url, fallback) {
  try {
    const path = new URL(url, window.location.origin).pathname;
    const name = decodeURIComponent(path.split("/").filter(Boolean).pop() || "");
    return name || fallback;
  } catch {
    return fallback;
  }
}

function toFileItems(list) {
  if (!Array.isArray(list)) return [];
  return list.map((file, index) => {
    const href = typeof file === "string" ? file : file?.url || file?.path || "";
    const label =
      (typeof file === "object" && (file?.name || file?.title)) ||
      fileNameFromUrl(href, `Resource ${index + 1}`);
    return { href, label, key: `${href}-${index}` };
  });
}

function toLinkItems(list) {
  if (!Array.isArray(list)) return [];
  return list.map((link, index) => {
    const href = typeof link === "string" ? link : link?.url || "";
    const label =
      (typeof link === "object" && (link?.name || link?.title)) || href || `Link ${index + 1}`;
    return { href, label, key: `${href}-${index}` };
  });
}

export default function CourseLearning() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fetchCourseDetails = async (showLoading = true) => {
    if (!courseId || courseId === "undefined") {
      setLoadError(true);
      setLoading(false);
      return;
    }

    try {
      if (showLoading) setLoading(true);
      const res = await api.get(`/courses/${courseId}/learning`);
      setCourse(res.data);

      const modules = Array.isArray(res.data?.modules) ? res.data.modules : [];
      setActiveLesson((current) => {
        if (current) {
          const refreshed = modules.find((module) => module.id === current.id);
          if (refreshed) return refreshed;
        }
        return modules.find((module) => !module.is_completed) || modules[0] || null;
      });
    } catch (error) {
      console.error("Error loading course:", error);
      if (error.response?.status === 401) {
        navigate("/login");
        return;
      }
      setLoadError(true);
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

      await api.post(`/courses/${courseId}/complete-lesson`, { lesson_id: lessonId });

      toast.success("Session completed. Well done!");

      const res = await api.get(`/courses/${courseId}/learning`);
      setCourse(res.data);

      const modules = Array.isArray(res.data?.modules) ? res.data.modules : [];
      const refreshed = modules.find((module) => module.id === lessonId);
      if (refreshed) setActiveLesson(refreshed);

      if (Number(res.data?.progress_percentage) >= 100) {
        setShowReviewModal(true);
      }
    } catch (error) {
      toast.error("We could not save your progress. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const modules = useMemo(
    () => (Array.isArray(course?.modules) ? course.modules : []),
    [course]
  );
  const lessonIndex = activeLesson
    ? modules.findIndex((module) => module.id === activeLesson.id)
    : -1;
  const previousLesson = lessonIndex > 0 ? modules[lessonIndex - 1] : null;
  const nextLesson =
    lessonIndex >= 0 && lessonIndex < modules.length - 1 ? modules[lessonIndex + 1] : null;

  const handouts = toFileItems(activeLesson?.handouts);
  const videoLinks = toLinkItems(activeLesson?.video_links);
  const progress = Math.min(100, Math.round(Number(course?.progress_percentage) || 0));

  const selectLesson = (lesson) => {
    setActiveLesson(lesson);
    setActiveTab("overview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="th-classroom">
        <NavBar />
        <main id="main-content" className="th-container-wide th-classroom__loading">
          <h1 className="visually-hidden">Loading your classroom</h1>
          <div className="th-classroom__loading-grid" aria-hidden="true">
            <div>
              <div className="th-skeleton th-classroom__loading-stage" />
              <div className="th-skeleton" style={{ height: 168, marginTop: 24 }} />
            </div>
            <div className="th-skeleton" style={{ height: 420 }} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loadError || !course) {
    return (
      <div className="th-classroom">
        <NavBar />
        <main id="main-content" className="th-container-wide th-section">
          <div className="th-empty">
            <span className="th-empty__icon">
              <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
            </span>
            <p className="th-empty__title">We could not open this classroom</p>
            <p className="th-empty__text">
              The course may have been unpublished, or your enrolment is still being confirmed.
            </p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <Link to="/learning" className="btn btn-primary">
                Back to my learning
              </Link>
              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={() => {
                  setLoadError(false);
                  fetchCourseDetails();
                }}
              >
                Try again
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="th-classroom">
      <NavBar />

      <main id="main-content">
        <div className="th-classroom__bar">
          <div className="th-container-wide th-classroom__bar-inner">
            <Link to="/learning" className="th-classroom__back">
              <i className="bi bi-arrow-left" aria-hidden="true"></i>
              <span>My learning</span>
            </Link>

            <div className="th-classroom__bar-title">
              <p className="th-classroom__bar-label">Now learning</p>
              <p className="th-classroom__bar-course" title={course.title}>
                {course.title}
              </p>
            </div>

            <div className="th-classroom__bar-progress">
              <div className="th-classroom__bar-progress-head">
                <span>Course progress</span>
                <strong>{progress}%</strong>
              </div>
              <div
                className="th-progress"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Course progress"
              >
                <span
                  className="th-progress__fill th-progress__fill--accent"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="th-classroom__layout">
          <div className="th-classroom__main">
            <div className="th-stage">
              <div className="th-stage__frame">
                {activeLesson?.video_url ? (
                  <video
                    key={activeLesson.video_url}
                    controls
                    controlsList="nodownload"
                    playsInline
                    preload="metadata"
                    aria-label={`${activeLesson.title} video`}
                  >
                    <source src={activeLesson.video_url} type="video/mp4" />
                    Your browser does not support embedded video.
                  </video>
                ) : (
                  <div className="th-stage__empty">
                    <span className="th-stage__empty-icon" aria-hidden="true">
                      <i className="bi bi-journal-text"></i>
                    </span>
                    <h2>{activeLesson ? "Reading session" : "Choose a session"}</h2>
                    <p>
                      {activeLesson
                        ? "This session is delivered as written notes and resources instead of a video."
                        : "Pick a session from the course contents to begin."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <section className="th-lesson" aria-labelledby="lesson-title">
              <header className="th-lesson__head">
                <div>
                  <p className="th-lesson__eyebrow">
                    {lessonIndex >= 0 ? (
                      <span>
                        Session {lessonIndex + 1} of {modules.length}
                      </span>
                    ) : (
                      <span>No session selected</span>
                    )}
                    <span className="dot" aria-hidden="true"></span>
                    <span>{activeLesson?.video_url ? "Video" : "Reading"}</span>
                    <span className="dot" aria-hidden="true"></span>
                    <span>{formatDuration(activeLesson?.duration)}</span>
                    {activeLesson?.is_completed && (
                      <>
                        <span className="dot" aria-hidden="true"></span>
                        <span className="th-lesson__done">
                          <i className="bi bi-check-circle-fill" aria-hidden="true"></i>
                          Completed
                        </span>
                      </>
                    )}
                  </p>

                  <h1 className="th-lesson__title" id="lesson-title">
                    {activeLesson?.title || "Select a session"}
                  </h1>
                </div>

                <div className="th-lesson__actions">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-dark"
                    onClick={() => setShowReviewModal(true)}
                  >
                    <i className="bi bi-star" aria-hidden="true"></i>
                    Rate course
                  </button>

                  {activeLesson && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsComplete(activeLesson.id)}
                      disabled={activeLesson.is_completed || isUpdating}
                      className={`btn btn-sm ${
                        activeLesson.is_completed ? "btn-secondary" : "btn-primary"
                      }`}
                    >
                      {isUpdating ? (
                        <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
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
              </header>

              <div className="th-lesson__tabs" role="tablist" aria-label="Session information">
                {TABS.map((tab) => {
                  const count =
                    tab.id === "resources"
                      ? handouts.length
                      : tab.id === "links"
                        ? videoLinks.length
                        : null;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      id={`tab-${tab.id}`}
                      aria-selected={activeTab === tab.id}
                      aria-controls={`panel-${tab.id}`}
                      className={`th-lesson__tab${activeTab === tab.id ? " is-active" : ""}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.label}
                      {count > 0 && (
                        <span className="th-lesson__tab-count" aria-hidden="true">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="th-lesson__body">
                {activeTab === "overview" && (
                  <div
                    role="tabpanel"
                    id="panel-overview"
                    aria-labelledby="tab-overview"
                    tabIndex={0}
                  >
                    <p className="th-lesson__desc">
                      {activeLesson?.description ||
                        "This session has no summary yet. Use the notes below to follow along."}
                    </p>

                    <div className="th-notes">
                      <h2 className="th-notes__title">
                        <i className="bi bi-journal-text" aria-hidden="true"></i>
                        Session notes
                      </h2>
                      <div className="th-prose">
                        {activeLesson?.notes || "No notes have been added for this session."}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "resources" && (
                  <div
                    role="tabpanel"
                    id="panel-resources"
                    aria-labelledby="tab-resources"
                    tabIndex={0}
                  >
                    {handouts.length > 0 ? (
                      <ul className="th-file-list">
                        {handouts.map((file) => (
                          <li key={file.key}>
                            <a
                              href={file.href}
                              target="_blank"
                              rel="noreferrer"
                              className="th-file"
                              download
                            >
                              <span className="th-file__icon" aria-hidden="true">
                                <i className="bi bi-file-earmark-arrow-down"></i>
                              </span>
                              <span className="th-file__text">
                                <span className="th-file__name">{file.label}</span>
                                <span className="th-file__meta">Session handout</span>
                              </span>
                              <span className="th-file__cta" aria-hidden="true">
                                Download
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted mb-0">
                        No downloadable resources for this session.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "links" && (
                  <div
                    role="tabpanel"
                    id="panel-links"
                    aria-labelledby="tab-links"
                    tabIndex={0}
                  >
                    {videoLinks.length > 0 ? (
                      <ul className="th-file-list">
                        {videoLinks.map((link) => (
                          <li key={link.key}>
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noreferrer"
                              className="th-file"
                            >
                              <span className="th-file__icon" aria-hidden="true">
                                <i className="bi bi-link-45deg"></i>
                              </span>
                              <span className="th-file__text">
                                <span className="th-file__name">{link.label}</span>
                                <span className="th-file__meta">External reference</span>
                              </span>
                              <span className="th-file__cta" aria-hidden="true">
                                Open
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted mb-0">No additional links for this session.</p>
                    )}
                  </div>
                )}
              </div>

              <nav className="th-lesson__nav" aria-label="Session navigation">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-dark th-lesson__step"
                  onClick={() => previousLesson && selectLesson(previousLesson)}
                  disabled={!previousLesson}
                >
                  <i className="bi bi-arrow-left" aria-hidden="true"></i>
                  <span className="th-lesson__step-text">
                    <span className="th-lesson__step-label">Previous session</span>
                    <span className="th-lesson__step-title">
                      {previousLesson ? previousLesson.title : "Start of course"}
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-primary th-lesson__step th-lesson__step--next"
                  onClick={() => nextLesson && selectLesson(nextLesson)}
                  disabled={!nextLesson}
                >
                  <span className="th-lesson__step-text">
                    <span className="th-lesson__step-label">
                      {nextLesson ? "Next session" : "Course complete"}
                    </span>
                    <span className="th-lesson__step-title">
                      {nextLesson ? nextLesson.title : "You made it to the last session"}
                    </span>
                  </span>
                  <i className="bi bi-arrow-right" aria-hidden="true"></i>
                </button>
              </nav>
            </section>
          </div>

          <aside className="th-classroom__rail" aria-label="Course contents">
            <CourseContentSidebar
              modules={modules}
              onLessonSelect={selectLesson}
              activeLessonTitle={activeLesson?.title}
              activeLessonId={activeLesson?.id}
            />

            <div className="th-classroom__rail-footer">
              <Link to="/learning" className="btn btn-outline-dark w-100 btn-sm">
                <i className="bi bi-collection-play" aria-hidden="true"></i>
                Back to my learning
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <Footer />

      {showReviewModal && (
        <ReviewModal courseId={courseId} onClose={() => setShowReviewModal(false)} />
      )}
    </div>
  );
}
