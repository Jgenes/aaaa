import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  checkCatalogueHealth,
  cohortAvailability,
  describeAttempts,
  fetchCourseById,
  formatDate,
  primaryCohort,
} from "../api/catalogue";
import CatalogueDiagnostics from "../components/CatalogueDiagnostics";
import { mediaUrl } from "../lib/media";
import MediaImage from "../components/MediaImage";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import CourseImageFallback from "../assets/ict-pic (1).jpg";

/** File name shown for a stored handout path. */
const fileNameOf = (path, fallback) => {
  if (!path) return fallback;
  try {
    const clean = String(path).split("?")[0];
    const name = decodeURIComponent(clean.split("/").filter(Boolean).pop() || "");
    return name || fallback;
  } catch {
    return fallback;
  }
};

/** How much description is worth showing before asking the reader to expand. */
const CLAMP_CHARS = 420;

/**
 * Long descriptions used to stretch the page for screens. Keep the block short
 * and offer a "Read more" toggle — only when the text is actually long enough
 * to be clipped, so short descriptions never get a pointless button.
 */
function ExpandableText({ text, lines = 6, className = "" }) {
  const [expanded, setExpanded] = useState(false);
  const content = String(text || "").trim();

  if (content.length <= CLAMP_CHARS) {
    return <div className={className}>{content}</div>;
  }

  return (
    <div className="th-expandable">
      <div
        id="course-description-body"
        className={`th-expandable__body ${className} ${
          expanded ? "is-expanded" : "is-clamped"
        }`}
        style={expanded ? undefined : { WebkitLineClamp: lines }}
      >
        {content}
      </div>
      <button
        type="button"
        className="th-expandable__toggle"
        aria-expanded={expanded}
        aria-controls="course-description-body"
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? "Show less" : "Read more"}
        <i
          className={`bi ${expanded ? "bi-chevron-up" : "bi-chevron-down"}`}
          aria-hidden="true"
        ></i>
      </button>
    </div>
  );
}

export default function Course() {
  const { courseId, cohortId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [health, setHealth] = useState(null);
  const [selectedCohort, setSelectedCohort] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [openSessions, setOpenSessions] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      // GET /training/:id, with the cached catalogue as a fallback.
      const { course: courseData, attempts: detailAttempts = [], failed } =
        await fetchCourseById(courseId);
      if (cancelled) return;

      setAttempts(detailAttempts);

      if (!courseData) {
        setError(
          failed
            ? "We couldn't load this training — the API did not respond."
            : "This training is not available right now."
        );
        setLoading(false);
        if (failed) {
          console.warn("[catalogue]", describeAttempts(detailAttempts), detailAttempts);
          checkCatalogueHealth().then((canary) => {
            if (!cancelled) setHealth(canary);
          });
        }
        return;
      }

      // Pick the cohort named in the URL, otherwise the best open one.
      const requested =
        cohortId && cohortId !== "undefined"
          ? courseData.cohorts.find((cohort) => String(cohort.id) === String(cohortId))
          : null;

      setCourse(courseData);
      setSelectedCohort(requested || primaryCohort(courseData.cohorts));
      // First session expanded so the curriculum never looks empty.
      setOpenSessions(courseData.curriculum.length ? [0] : []);
      setLoading(false);
    };

    load().catch((err) => {
      if (cancelled) return;
      console.error("Fetch error:", err);
      setError("Failed to load training details.");
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [courseId, cohortId]);

  // Close the preview modal with the keyboard.
  useEffect(() => {
    if (!previewVideo) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setPreviewVideo(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [previewVideo]);

  const sessions = useMemo(() => course?.curriculum || [], [course]);
  const availability = useMemo(
    () => cohortAvailability(selectedCohort),
    [selectedCohort]
  );

  const toggleSession = (index) =>
    setOpenSessions((current) =>
      current.includes(index)
        ? current.filter((value) => value !== index)
        : [...current, index]
    );

  const sessionCount = sessions.length;
  const lessonLabel = sessionCount === 1 ? "session" : "sessions";

  if (loading) {
    return (
      <>
        <NavBar />
        <main tabIndex={-1} id="main-content" className="th-container-wide th-section">
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
        <main tabIndex={-1} id="main-content" className="th-container-wide th-section">
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
            <CatalogueDiagnostics attempts={attempts} health={health} />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const cohort = selectedCohort;
  const canEnrol = Boolean(cohort) && availability.open;
  const checkoutHref = cohort?.id ? `/checkout/${course.id}/${cohort.id}` : null;
  const priceLabel =
    cohort && Number(cohort.price) > 0
      ? `TZS ${Number(cohort.price).toLocaleString()}`
      : course.price
        ? `TZS ${Number(course.price).toLocaleString()}`
        : "Fee on request";

  const enrolled = Boolean(course.is_enrolled);
  // Module contents (notes, videos, links, handouts) stay locked until the
  // enrolment is confirmed, i.e. until the learner has paid.
  const hasCourseAccess = enrolled;

  /**
   * The primary call to action always leads to checkout. It used to swap to
   * "Continue learning" whenever the API reported `is_enrolled`, which sent
   * people to the (long) My learning page instead of the payment page.
   */
  const enrolButton = (className) =>
    canEnrol && checkoutHref ? (
      <Link to={checkoutHref} className={className}>
        Enrol now
        <i className="bi bi-arrow-right" aria-hidden="true"></i>
      </Link>
    ) : (
      <button type="button" className={className} disabled>
        {cohort ? availability.label : "Cohort dates coming soon"}
      </button>
    );

  /** Secondary door into the classroom for learners who already have access. */
  const continueButton = (className) =>
    enrolled ? (
      <Link to={`/learning/${course.id}`} className={className}>
        <i className="bi bi-play-circle" aria-hidden="true"></i>
        Continue learning
      </Link>
    ) : null;

  return (
    <>
      <NavBar />

      <main tabIndex={-1} id="main-content">
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
                {course.short_description && (
                  <p className="th-course-hero__lead">{course.short_description}</p>
                )}

                {cohort ? (
                  <ul className="th-course-meta">
                    <li>
                      <i className="bi bi-calendar-check" aria-hidden="true"></i>
                      Starts {formatDate(cohort.start_date, "date to be confirmed")}
                    </li>
                    <li className={availability.deadlinePassed ? "is-danger" : ""}>
                      <i className="bi bi-alarm" aria-hidden="true"></i>
                      Deadline {formatDate(cohort.registration_deadline, "not set")}
                    </li>
                    <li className={availability.isFull ? "is-danger" : "is-success"}>
                      <i className="bi bi-people" aria-hidden="true"></i>
                      {cohort.capacity > 0
                        ? `${cohort.remaining_seats} of ${cohort.capacity} seats available`
                        : `${cohort.remaining_seats} seats available`}
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
                  {enrolButton("btn btn-primary btn-lg")}
                  {continueButton("btn btn-outline-dark btn-lg")}
                  <Link to="/trainings" className="btn btn-outline-dark btn-lg">
                    Compare trainings
                  </Link>
                </div>
              </div>

              <div className="th-course-media">
                <MediaImage
                  path={course.banner}
                  fallback={CourseImageFallback}
                  alt={`${course.title} training preview`}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="th-container-wide th-section-tight">
          <div className="row g-4">
            <div className="col-lg-8">
              {course.learning_outcomes?.length > 0 && (
                <section className="th-detail-block" aria-labelledby="outcomes-title">
                  <h2 className="th-detail-block__title" id="outcomes-title">
                    <i className="bi bi-check2-circle" aria-hidden="true"></i>
                    What you&apos;ll learn
                  </h2>
                  <ul className="th-outcome-list">
                    {course.learning_outcomes.map((item, i) => (
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

                {sessionCount > 0 && !hasCourseAccess && (
                  <>
                    <p className="text-muted small mb-3">
                      {sessionCount} {lessonLabel} · module titles are visible, contents unlock
                      after payment
                    </p>

                    <ol className="th-module-preview">
                      {sessions.map((session, index) => (
                        <li className="th-module-preview__item" key={session.id ?? index}>
                          <span className="th-module-preview__index" aria-hidden="true">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="th-module-preview__title">{session.title}</span>
                          <span className="th-module-preview__lock">
                            <i className="bi bi-lock-fill" aria-hidden="true"></i>
                            Locked
                          </span>
                        </li>
                      ))}
                    </ol>

                    <div className="th-locked-note" role="note">
                      <span className="th-locked-note__icon" aria-hidden="true">
                        <i className="bi bi-shield-lock"></i>
                      </span>
                      <div className="th-locked-note__body">
                        <p className="th-locked-note__title">
                          Module contents unlock after payment
                        </p>
                        <p className="th-locked-note__text">
                          Session descriptions, videos, resources and handouts appear in your
                          classroom as soon as your enrolment is confirmed. You can see every
                          module title above.
                        </p>
                        <div className="d-flex flex-wrap gap-2">
                          {enrolButton("btn btn-primary btn-sm")}
                          {continueButton("btn btn-outline-dark btn-sm")}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {sessionCount > 0 && hasCourseAccess && (
                  <>
                    <p className="text-muted small mb-3">
                      {sessionCount} {lessonLabel} · covered across the cohort
                    </p>

                    <div className="accordion" id="curriculumAccordion">
                      {sessions.map((session, index) => {
                        const isOpen = openSessions.includes(index);
                        const panelId = `curriculum-session-${index}`;
                        const headingId = `curriculum-heading-${index}`;
                        const links = session.video_links || [];
                        const handouts = session.handouts || [];

                        return (
                          <div className="accordion-item" key={session.id ?? index}>
                            <h3 className="accordion-header" id={headingId}>
                              <button
                                className={`accordion-button ${isOpen ? "" : "collapsed"}`}
                                type="button"
                                aria-expanded={isOpen}
                                aria-controls={panelId}
                                onClick={() => toggleSession(index)}
                              >
                                <span className="d-flex align-items-center gap-2">
                                  <i
                                    className={`bi ${
                                      session.video ? "bi-play-circle" : "bi-journal-text"
                                    } text-muted`}
                                    aria-hidden="true"
                                  ></i>
                                  <strong>
                                    {index + 1}. {session.title}
                                  </strong>
                                </span>
                              </button>
                            </h3>
                            <div
                              id={panelId}
                              className={`accordion-collapse collapse ${isOpen ? "show" : ""}`}
                              aria-labelledby={headingId}
                            >
                              <div className="accordion-body">
                                {session.description && (
                                  <p className="mb-2 small text-secondary">
                                    {session.description}
                                  </p>
                                )}

                                {session.notes && (
                                  <div className="th-prose small mb-3">
                                    {session.notes}
                                  </div>
                                )}

                                {session.video && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-dark mb-3"
                                    onClick={() => setPreviewVideo(session.video)}
                                  >
                                    <i className="bi bi-play-circle me-2" aria-hidden="true"></i>
                                    Preview this session
                                  </button>
                                )}

                                {links.length > 0 && (
                                  <ul className="list-unstyled d-flex flex-column gap-2 mb-3">
                                    {links.map((link, linkIndex) => (
                                      <li key={`${link}-${linkIndex}`}>
                                        <a
                                          href={link}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="small d-inline-flex align-items-center gap-2"
                                        >
                                          <i className="bi bi-box-arrow-up-right" aria-hidden="true"></i>
                                          Session resource {linkIndex + 1}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                )}

                                {handouts.length > 0 && (
                                  <ul className="th-file-list">
                                    {handouts.map((handout, fileIndex) => (
                                      <li key={`${handout}-${fileIndex}`}>
                                        <a
                                          href={mediaUrl(handout)}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="th-file"
                                          download
                                        >
                                          <span className="th-file__icon" aria-hidden="true">
                                            <i className="bi bi-file-earmark-arrow-down"></i>
                                          </span>
                                          <span className="th-file__text">
                                            {fileNameOf(handout, `Handout ${fileIndex + 1}`)}
                                          </span>
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                )}

                                {!session.description &&
                                  !session.notes &&
                                  !session.video &&
                                  !links.length &&
                                  !handouts.length && (
                                    <p className="text-muted small mb-0">
                                      Materials for this session are shared once your enrolment
                                      is confirmed.
                                    </p>
                                  )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {sessionCount === 0 && (
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
                  <ExpandableText text={course.long_description} className="th-prose" />
                </section>
              )}
            </div>

            {/* --------------------------------------------- Enrolment panel */}
            <aside className="col-lg-4">
              <div className="th-enroll-panel">
                <p className="th-enroll-panel__label">Course fee</p>
                <p className="th-enroll-panel__value">{priceLabel}</p>
                <p className="th-enroll-panel__seats">
                  <span
                    className={`th-status ${
                      availability.open ? "th-status--success" : "th-status--info"
                    }`}
                  >
                    {cohort
                      ? availability.state === "open"
                        ? `${cohort.remaining_seats} of ${cohort.capacity || "—"} seats left`
                        : availability.label
                      : "No cohort scheduled"}
                  </span>
                </p>

                <ul className="th-enroll-panel__list">
                  <li>
                    <span>Starts</span>
                    <strong>{formatDate(cohort?.start_date, "—")}</strong>
                  </li>
                  <li>
                    <span>Enrolment deadline</span>
                    <strong>{formatDate(cohort?.registration_deadline, "—")}</strong>
                  </li>
                  {cohort?.intake_name && (
                    <li>
                      <span>Intake</span>
                      <strong>{cohort.intake_name}</strong>
                    </li>
                  )}
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

                <div className="d-flex flex-column gap-2 mt-4">
                  {enrolButton("btn btn-primary w-100")}
                  {continueButton("btn btn-outline-dark w-100")}
                </div>

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
          aria-label="Session preview"
          onClick={(event) => {
            if (event.target === event.currentTarget) setPreviewVideo(null);
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header">
                <h2 className="modal-title h6 mb-0">Session preview</h2>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close preview"
                  onClick={() => setPreviewVideo(null)}
                ></button>
              </div>
              <div className="modal-body p-0">
                <div className="ratio ratio-16x9">
                  <video controls autoPlay src={mediaUrl(previewVideo)}>
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
