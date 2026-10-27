import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axio";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import CourseImageFallback from "../assets/ict-pic (1).jpg";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function Course() {
  const { courseId, cohortId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);

  useEffect(() => {
    fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, cohortId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/training/${courseId}`);
      const courseData = res.data;

      let cohort = null;
      if (cohortId && cohortId !== "undefined") {
        cohort = courseData.cohorts?.find((c) => c.id === parseInt(cohortId));
      }

      if (!cohort && courseData.cohorts?.length > 0) {
        cohort = courseData.cohorts[0];
      }

      const robustParse = (data) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        let result = data;
        try {
          if (typeof result === "string") result = JSON.parse(result);
          if (typeof result === "string") result = JSON.parse(result);
          return Array.isArray(result) ? result : [];
        } catch (e) {
          return [];
        }
      };

      let rawCurriculum =
        cohort?.contents?.curriculum ||
        cohort?.contents ||
        courseData.curriculum ||
        courseData.contents ||
        [];

      setCourse({
        ...courseData,
        selectedCohort: cohort,
        curriculum: robustParse(rawCurriculum),
        requirements: robustParse(courseData.requirements),
        learningOutcomes: robustParse(courseData.learning_outcomes),
        skills: robustParse(courseData.skills),
      });
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load training details.");
    } finally {
      setLoading(false);
    }
  };

  // Enrolment availability logic (unchanged behaviour)
  const getEnrollmentStatus = () => {
    if (!course?.selectedCohort) return { disabled: true, text: "Enrol now" };

    const today = new Date();
    const deadline = new Date(course.selectedCohort.registration_deadline);
    const remainingSeats = parseInt(course.selectedCohort.remaining_seats) || 0;

    if (today > deadline) {
      return { disabled: true, text: "Enrolment closed" };
    }

    if (remainingSeats <= 0) {
      return { disabled: true, text: "Cohort full" };
    }

    return { disabled: false, text: "Enrol now" };
  };

  // Close the preview modal with the keyboard
  useEffect(() => {
    if (!previewVideo) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setPreviewVideo(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [previewVideo]);

  const status = getEnrollmentStatus();

  if (loading) {
    return (
      <>
        <NavBar />
        <main id="main-content" className="th-container-wide th-section">
          <h1 className="visually-hidden">Loading training details</h1>
          <div className="row g-4" aria-hidden="true">
            <div className="col-lg-8">
              <div className="th-skeleton" style={{ height: 28, width: "60%", marginBottom: 16 }} />
              <div className="th-skeleton" style={{ height: 16, width: "90%", marginBottom: 8 }} />
              <div className="th-skeleton" style={{ height: 16, width: "75%" }} />
            </div>
            <div className="col-lg-4">
              <div className="th-skeleton" style={{ height: 240 }} />
            </div>
          </div>
          <p className="visually-hidden" role="status">
            Loading training details…
          </p>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !course) {
    return (
      <>
        <NavBar />
        <main id="main-content" className="th-container-wide th-section">
          <div className="th-empty">
            <span className="th-empty__icon">
              <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
            </span>
            <h1 className="th-empty__title">{error || "Training not found"}</h1>
            <p className="th-empty__text">
              The training you are looking for may have been unpublished or moved. Browse the
              catalogue to find an alternative cohort.
            </p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <Link to="/trainings" className="btn btn-primary">
                Browse trainings
              </Link>
              <Link to="/" className="btn btn-outline-dark">
                Back home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const cohort = course.selectedCohort;

  return (
    <>
      <NavBar />

      <main id="main-content">
        <section className="th-course-hero">
          <div className="th-container-wide">
            <nav aria-label="Breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/trainings">Trainings</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {course.title}
                </li>
              </ol>
            </nav>

            <div className="th-course-hero__grid">
              <div>
                {course.category && (
                  <span className="th-skill-pill mb-3 d-inline-flex">{course.category}</span>
                )}
                <h1 className="th-course-hero__title">{course.title}</h1>
                <p className="th-course-hero__lead">{course.short_description}</p>

                {cohort ? (
                  <ul className="th-course-meta">
                    <li>
                      <i className="bi bi-calendar-check" aria-hidden="true"></i>
                      Starts {formatDate(cohort.start_date)}
                    </li>
                    <li className="is-danger">
                      <i className="bi bi-alarm" aria-hidden="true"></i>
                      Deadline {formatDate(cohort.registration_deadline)}
                    </li>
                    <li className="is-success">
                      <i className="bi bi-people" aria-hidden="true"></i>
                      {cohort.remaining_seats ?? "—"} seats available
                    </li>
                    {course.mode && (
                      <li>
                        <i className="bi bi-broadcast" aria-hidden="true"></i>
                        {course.mode}
                      </li>
                    )}
                  </ul>
                ) : (
                  <div className="alert alert-info d-inline-flex align-items-center gap-2">
                    <i className="bi bi-info-circle" aria-hidden="true"></i>
                    Cohort information is not available yet — check back soon.
                  </div>
                )}

                <div className="d-flex flex-wrap gap-2">
                  {status.disabled || !cohort ? (
                    <button type="button" className="btn btn-primary btn-lg" disabled>
                      {status.text}
                    </button>
                  ) : (
                    <Link
                      to={`/checkout/${courseId}/${cohort.id}`}
                      className="btn btn-primary btn-lg"
                    >
                      {status.text}
                      <i className="bi bi-arrow-right" aria-hidden="true"></i>
                    </Link>
                  )}
                  <Link to="/trainings" className="btn btn-outline-dark btn-lg">
                    Compare trainings
                  </Link>
                </div>
              </div>

              <div className="th-course-media">
                <img
                  src={
                    course.banner
                      ? `http://localhost:8000/${course.banner}`
                      : CourseImageFallback
                  }
                  alt={`${course.title} training preview`}
                  onError={(event) => {
                    event.currentTarget.src = CourseImageFallback;
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="th-container-wide th-section-tight">
          <div className="row g-4">
            <div className="col-lg-8">
              {course.learningOutcomes?.length > 0 && (
                <section className="th-detail-block" aria-labelledby="outcomes-title">
                  <h2 className="th-detail-block__title" id="outcomes-title">
                    <i className="bi bi-check2-circle" aria-hidden="true"></i>
                    What you&apos;ll learn
                  </h2>
                  <ul className="th-outcome-list">
                    {course.learningOutcomes.map((item, i) => (
                      <li key={i}>
                        <i className="bi bi-check-circle-fill" aria-hidden="true"></i>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="th-detail-block" aria-labelledby="curriculum-title">
                <h2 className="th-detail-block__title" id="curriculum-title">
                  <i className="bi bi-collection-play" aria-hidden="true"></i>
                  Course content
                </h2>

                {course.curriculum.length > 0 ? (
                  <div className="accordion" id="curriculumAccordion">
                    {course.curriculum.map((section, index) => {
                      const isOpen = index < 2;
                      return (
                        <div className="accordion-item" key={index}>
                          <h3 className="accordion-header" id={`section-heading-${index}`}>
                            <button
                              className={`accordion-button ${!isOpen ? "collapsed" : ""}`}
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target={`#section${index}`}
                              aria-expanded={isOpen}
                              aria-controls={`section${index}`}
                            >
                              <span className="d-flex align-items-center gap-2">
                                <i
                                  className={`bi ${
                                    section.unlocked ? "bi-unlock" : "bi-lock"
                                  } text-muted`}
                                  aria-hidden="true"
                                ></i>
                                <strong>{section.sectionTitle || section.title}</strong>
                              </span>
                            </button>
                          </h3>
                          <div
                            id={`section${index}`}
                            className={`accordion-collapse collapse ${isOpen ? "show" : ""}`}
                            aria-labelledby={`section-heading-${index}`}
                            data-bs-parent="#curriculumAccordion"
                          >
                            <div className="accordion-body p-0">
                              {section.lessons?.map((lesson, i) => (
                                <div
                                  key={i}
                                  className={`th-lesson ${
                                    lesson.preview ? "th-lesson--preview" : ""
                                  }`}
                                  onClick={() =>
                                    lesson.preview && lesson.video && setPreviewVideo(lesson.video)
                                  }
                                  role={lesson.preview && lesson.video ? "button" : undefined}
                                  tabIndex={lesson.preview && lesson.video ? 0 : undefined}
                                  onKeyDown={(event) => {
                                    if (
                                      (event.key === "Enter" || event.key === " ") &&
                                      lesson.preview &&
                                      lesson.video
                                    ) {
                                      event.preventDefault();
                                      setPreviewVideo(lesson.video);
                                    }
                                  }}
                                >
                                  <span className="th-lesson__label">
                                    <i
                                      className={`bi ${
                                        lesson.preview ? "bi-play-circle-fill" : "bi-lock"
                                      } th-lesson__icon`}
                                      aria-hidden="true"
                                    ></i>
                                    <span>{lesson.title}</span>
                                  </span>
                                  <span className="th-lesson__time">{lesson.time}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted mb-0">Curriculum coming soon.</p>
                )}
              </section>

              <div className="row g-4">
                <div className="col-md-6">
                  <section className="th-detail-block h-100" aria-labelledby="skills-title">
                    <h2 className="th-detail-block__title" id="skills-title">
                      <i className="bi bi-lightning-charge" aria-hidden="true"></i>
                      Skills you will gain
                    </h2>
                    {course.skills?.length > 0 ? (
                      <div className="th-skill-pills">
                        {course.skills.map((skill, i) => (
                          <span key={i} className="th-skill-pill">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted mb-0 small">
                        Skills for this training will be published soon.
                      </p>
                    )}
                  </section>
                </div>

                <div className="col-md-6">
                  <section className="th-detail-block h-100" aria-labelledby="requirements-title">
                    <h2 className="th-detail-block__title" id="requirements-title">
                      <i className="bi bi-list-check" aria-hidden="true"></i>
                      Requirements
                    </h2>
                    {course.requirements?.length > 0 ? (
                      <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                        {course.requirements.map((req, i) => (
                          <li key={i} className="d-flex align-items-start gap-2 small">
                            <i
                              className="bi bi-arrow-right-short text-primary mt-1"
                              aria-hidden="true"
                            ></i>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted mb-0 small">
                        No prerequisites listed for this training.
                      </p>
                    )}
                  </section>
                </div>
              </div>

              {course.long_description && (
                <section className="th-detail-block" aria-labelledby="description-title">
                  <h2 className="th-detail-block__title" id="description-title">
                    <i className="bi bi-file-text" aria-hidden="true"></i>
                    Detailed course description
                  </h2>
                  <div
                    className="th-prose"
                    dangerouslySetInnerHTML={{ __html: course.long_description }}
                  />
                </section>
              )}
            </div>

            {/* --------------------------------------------- Enrolment panel */}
            <aside className="col-lg-4">
              <div className="th-enroll-panel">
                <p className="th-enroll-panel__label">Course fee</p>
                <p className="th-enroll-panel__value">
                  {cohort?.price ? `TZS ${Number(cohort.price).toLocaleString()}` : "Fee on request"}
                </p>
                <p className="th-enroll-panel__seats">
                  <span className="th-status th-status--info">
                    {cohort?.remaining_seats ?? "—"} of {cohort?.capacity ?? "—"} seats left
                  </span>
                </p>

                <ul className="th-enroll-panel__list">
                  <li>
                    <span>Starts</span>
                    <strong>{formatDate(cohort?.start_date)}</strong>
                  </li>
                  <li>
                    <span>Enrolment deadline</span>
                    <strong>{formatDate(cohort?.registration_deadline)}</strong>
                  </li>
                  <li>
                    <span>Delivery</span>
                    <strong>{course.mode || "—"}</strong>
                  </li>
                  {course.provider?.name && (
                    <li>
                      <span>Provider</span>
                      <strong>{course.provider.name}</strong>
                    </li>
                  )}
                </ul>

                {status.disabled || !cohort ? (
                  <button type="button" className="btn btn-primary w-100 mt-4" disabled>
                    {status.text}
                  </button>
                ) : (
                  <Link
                    to={`/checkout/${courseId}/${cohort.id}`}
                    className="btn btn-primary w-100 mt-4"
                  >
                    {status.text}
                    <i className="bi bi-arrow-right" aria-hidden="true"></i>
                  </Link>
                )}

                <p className="th-enroll-panel__note">
                  Secure checkout · Instant invoice · Verified certificate
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {previewVideo && (
        <div
          className="modal show d-block th-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Lesson preview"
          onClick={(event) => {
            if (event.target === event.currentTarget) setPreviewVideo(null);
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header">
                <h2 className="modal-title h6 mb-0">Lesson preview</h2>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close preview"
                  onClick={() => setPreviewVideo(null)}
                ></button>
              </div>
              <div className="modal-body p-0">
                <div className="ratio ratio-16x9">
                  <video controls autoPlay>
                    <source src={previewVideo} type="video/mp4" />
                    Your browser does not support embedded videos.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
