import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { mediaUrl } from "../../lib/media";
import api from "../../api/axio";
import { extractList, normaliseCourse } from "../../api/catalogue";
import ProviderDashboardLayout from "./layouts/AdminDashboardLayout";
import DataTable from "react-data-table-component";
import { toast, ToastContainer } from "react-toastify";
import { clearStaleModalArtifacts, lockBodyScroll } from "../../lib/modalOverlay";

/* ============================================================
   Course moderation

   The review dialog is rendered by React (portal → <body>) while
   `selectedCourse` is set. It used to be a Bootstrap `data-bs-*`
   modal, which had two problems:

     • Bootstrap's JS appends `.modal-backdrop` to <body> and only
       removes it on `transitionend`. If that transition never
       fires (reduced motion, a re-render in between, a route
       change while the dialog is open…) the backdrop stays behind
       at z-index 1050 and eats every click — the "an overlay
       appears and I cannot press Approve / Set draft" bug.
     • The close call used `window.bootstrap`, which is undefined
       when the bundle is imported as an ES module, so the dialog
       never closed after a decision.

   Everything here is state driven now: one dialog, one backdrop
   we own (`data-th-app-backdrop`), no Bootstrap data API and no
   orphaned overlays.
   ============================================================ */

const CONFIRMABLE_STATUS = {
  DRAFT: { label: "Draft", success: "Course moved back to draft." },
  PUBLISHED: { label: "Published", success: "Course approved and published." },
};

/** Pill styling for a course status (reuses the admin pill tokens). */
const statusPillClass = (status) => {
  const value = String(status || "").toUpperCase();
  if (["PUBLISHED", "APPROVED"].includes(value)) return "th-pill--approved";
  if (["REJECTED"].includes(value)) return "th-pill--rejected";
  if (["CLOSED", "SUSPENDED", "ARCHIVED"].includes(value)) return "th-pill--suspended";
  return "th-pill--pending";
};

const statusLabel = (status) => {
  if (!status) return "Unknown";
  const words = String(status).replace(/[_-]+/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const isPublished = (status) =>
  ["PUBLISHED", "APPROVED"].includes(String(status || "").toUpperCase());

const formatMoney = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const asList = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

/* ------------------------------------------------------------
   Review dialog
   ------------------------------------------------------------ */
function CourseReviewDialog({
  course,
  isDrafting,
  reason,
  onReasonChange,
  busyStatus,
  onCancelDraft,
  onDecision,
  onClose,
}) {
  const dialogRef = useRef(null);
  const busy = busyStatus !== null;

  // Lock the page behind the dialog and always release it again.
  useEffect(() => lockBodyScroll(), []);

  // Escape closes the dialog, but never mid-request.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "Escape" || busy) return;
      if (isDrafting) onCancelDraft();
      else onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, isDrafting, onCancelDraft, onClose]);

  useEffect(() => {
    dialogRef.current?.focus({ preventScroll: true });
  }, []);

  const handleSurfaceClick = (event) => {
    if (event.target === event.currentTarget && !busy) onClose();
  };

  const learningOutcomes = asList(course.learning_outcomes);
  const requirements = asList(course.requirements);
  const skills = asList(course.skills);
  const cohorts = asList(course.cohorts);
  const curriculum = asList(course.curriculum);
  const alreadyPublished = isPublished(course.status);

  return createPortal(
    <>
      <div
        className="modal-backdrop fade show"
        data-th-app-backdrop="true"
        aria-hidden="true"
        style={{ zIndex: 1050 }}
      />
      <div
        className="modal show d-block th-review-dialog"
        id="courseModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="courseModalTitle"
        tabIndex={-1}
        ref={dialogRef}
        onClick={handleSurfaceClick}
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="th-review-dialog__head">
              <span className="th-review-dialog__avatar" aria-hidden="true">
                <i className="bi bi-journal-bookmark"></i>
              </span>
              <div className="min-w-0">
                <h2 className="th-review-dialog__title" id="courseModalTitle">
                  {course.title}
                </h2>
                <p className="th-review-dialog__meta">
                  {[
                    course.provider?.legal_name || course.provider?.name,
                    course.category,
                    course.mode,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Course review"}
                </p>
              </div>
              <span className="d-none d-sm-inline-flex ms-auto">
                <span className={`th-pill ${statusPillClass(course.status)}`}>
                  {statusLabel(course.status)}
                </span>
              </span>
              <button
                type="button"
                className="th-review-dialog__close ms-2"
                aria-label="Close course review"
                onClick={onClose}
                disabled={busy}
              >
                <i className="bi bi-x-lg" aria-hidden="true"></i>
              </button>
            </div>

            <div className="modal-body th-review-dialog__body">
              {course.banner && (
                <div className="mb-3">
                  <img
                    src={mediaUrl(course.banner)}
                    alt={`${course.title} banner`}
                    className="img-fluid rounded shadow-sm w-100"
                    style={{ maxHeight: "260px", objectFit: "cover" }}
                  />
                </div>
              )}

              <div className="row g-3">
                <div className="col-lg-6">
                  <section className="th-review-section h-100">
                    <h3 className="th-review-section__title">
                      <i className="bi bi-info-circle" aria-hidden="true"></i>
                      Course details
                    </h3>
                    <dl className="mb-0">
                      {[
                        ["Provider", course.provider?.legal_name || course.provider?.name || "Not provided"],
                        ["Category", course.category || "Not provided"],
                        ["Mode", course.mode || "Not provided"],
                        ["Status", statusLabel(course.status)],
                      ].map(([label, value]) => (
                        <div className="th-fact" key={label}>
                          <dt>{label}</dt>
                          <dd>{value}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mb-0 mt-3">
                      <strong>Short description</strong>
                      <br />
                      <span className="text-muted">
                        {course.short_description || "Not provided"}
                      </span>
                    </p>
                  </section>
                </div>

                <div className="col-lg-6">
                  <section className="th-review-section h-100">
                    <h3 className="th-review-section__title">
                      <i className="bi bi-calendar3" aria-hidden="true"></i>
                      Cohorts (intakes)
                    </h3>
                    {cohorts.length ? (
                      <div className="table-responsive">
                        <table className="table table-sm align-middle mb-0">
                          <thead className="table-light">
                            <tr>
                              <th scope="col">Intake</th>
                              <th scope="col">Starts</th>
                              <th scope="col">Price</th>
                              <th scope="col">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cohorts.map((cohort, index) => (
                              <tr key={cohort.id ?? index}>
                                <td>{cohort.intake_name || `Intake ${index + 1}`}</td>
                                <td>{formatDate(cohort.start_date)}</td>
                                <td>{formatMoney(cohort.price)}</td>
                                <td>
                                  <span
                                    className={`badge ${
                                      String(cohort.status).toUpperCase() === "OPEN"
                                        ? "bg-success"
                                        : "bg-warning text-dark"
                                    }`}
                                  >
                                    {statusLabel(cohort.status)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted mb-0">No cohorts attached yet.</p>
                    )}
                  </section>
                </div>

                <div className="col-lg-4">
                  <section className="th-review-section h-100">
                    <h3 className="th-review-section__title">
                      <i className="bi bi-bullseye" aria-hidden="true"></i>
                      Learning outcomes
                    </h3>
                    {learningOutcomes.length ? (
                      <ul className="mb-0 ps-3">
                        {learningOutcomes.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted mb-0">Not provided</p>
                    )}
                  </section>
                </div>

                <div className="col-lg-4">
                  <section className="th-review-section h-100">
                    <h3 className="th-review-section__title">
                      <i className="bi bi-check2-square" aria-hidden="true"></i>
                      Requirements
                    </h3>
                    {requirements.length ? (
                      <ul className="mb-0 ps-3">
                        {requirements.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted mb-0">Not provided</p>
                    )}
                  </section>
                </div>

                <div className="col-lg-4">
                  <section className="th-review-section h-100">
                    <h3 className="th-review-section__title">
                      <i className="bi bi-stars" aria-hidden="true"></i>
                      Skills gained
                    </h3>
                    {skills.length ? (
                      <ul className="mb-0 ps-3">
                        {skills.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted mb-0">Not provided</p>
                    )}
                  </section>
                </div>

                <div className="col-12">
                  <section className="th-review-section">
                    <h3 className="th-review-section__title">
                      <i className="bi bi-journal-text" aria-hidden="true"></i>
                      Description &amp; contents
                    </h3>
                    <p className="text-muted">
                      {course.long_description || "No long description provided."}
                    </p>

                    {curriculum.length ? (
                      curriculum.map((item, index) => (
                        <div key={item.id ?? index} className="mb-3 p-3 border rounded">
                          <h4 className="h6 fw-bold mb-1">
                            {index + 1}. {item.title}
                          </h4>
                          {item.description && <p className="mb-1">{item.description}</p>}
                          <small className="text-muted">
                            {item.video ? "Video · " : ""}
                            {asList(item.video_links).length} links ·{" "}
                            {asList(item.handouts).length} handouts
                          </small>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted mb-0">No contents available.</p>
                    )}
                  </section>
                </div>
              </div>

              {isDrafting && (
                <div className="th-decision">
                  <label
                    className="th-decision__title"
                    htmlFor="reason_for_rejection_draft"
                  >
                    Why is this course going back to draft?
                  </label>
                  <p className="th-decision__hint">
                    The provider sees this reason, so be specific about what needs fixing.
                  </p>
                  <textarea
                    id="reason_for_rejection_draft"
                    className="form-control"
                    rows={3}
                    placeholder="e.g. The curriculum section is missing the assessment details."
                    value={reason}
                    onChange={(event) => onReasonChange(event.target.value)}
                    disabled={busy}
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div className="th-review-dialog__foot">
              <p className="th-review-dialog__note">
                {isDrafting
                  ? "A reason is required before the course is moved back to draft."
                  : alreadyPublished
                    ? "This course is live in the public catalogue."
                    : "Approving publishes the course in the public catalogue."}
              </p>

              <div className="th-review-dialog__actions">
                {isDrafting ? (
                  <>
                    <button
                      type="button"
                      className="btn th-btn-suspend"
                      onClick={onCancelDraft}
                      disabled={busy}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn th-btn-reject"
                      onClick={() => onDecision("DRAFT")}
                      disabled={busy || !reason.trim()}
                    >
                      {busyStatus === "DRAFT" ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            aria-hidden="true"
                          ></span>
                          Saving…
                        </>
                      ) : (
                        <>
                          <i className="bi bi-file-earmark-text me-2" aria-hidden="true"></i>
                          Confirm draft
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn th-btn-suspend"
                      onClick={onClose}
                      disabled={busy}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn th-btn-reject"
                      onClick={() => onDecision("DRAFT")}
                      disabled={busy}
                    >
                      <i className="bi bi-file-earmark-text me-2" aria-hidden="true"></i>
                      Set draft
                    </button>
                    <button
                      type="button"
                      className="btn th-btn-approve"
                      onClick={() => onDecision("PUBLISHED")}
                      disabled={busy || alreadyPublished}
                    >
                      {busyStatus === "PUBLISHED" ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            aria-hidden="true"
                          ></span>
                          Publishing…
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check2-circle me-2" aria-hidden="true"></i>
                          {alreadyPublished ? "Already published" : "Approve & publish"}
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

/* ------------------------------------------------------------
   Page
   ------------------------------------------------------------ */
export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [busyStatus, setBusyStatus] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [reason, setReason] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/courses");
      // GET /admin/courses → bare array of every course + provider + cohorts.
      const data = extractList(res.data).map(normaliseCourse).filter(Boolean);
      setCourses(data);
    } catch (error) {
      toast.error("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Bootstrap-backed dialogs on other screens can leave a backdrop on <body>.
  // Sweep it on the way in and on the way out so this page is never blocked.
  useEffect(() => {
    clearStaleModalArtifacts();
    return clearStaleModalArtifacts;
  }, []);

  const filteredCourses = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return courses;

    return courses.filter((course) =>
      [
        course.title,
        course.provider?.legal_name,
        course.provider?.name,
        course.category,
        course.mode,
        course.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [courses, searchText]);

  const openReview = (course) => {
    // Clear any leftover backdrop before the dialog mounts.
    clearStaleModalArtifacts();
    setSelectedCourse(course);
    setIsDrafting(false);
    setReason("");
  };

  const closeReview = useCallback(() => {
    setSelectedCourse(null);
    setIsDrafting(false);
    setReason("");
  }, []);

  const cancelDraft = useCallback(() => {
    setIsDrafting(false);
    setReason("");
  }, []);

  const handleStatusUpdate = async (newStatus) => {
    const course = selectedCourse;
    if (!course?.id || busyStatus !== null) return;

    // "Set draft" first asks for a reason; the API needs one.
    if (newStatus === "DRAFT" && !isDrafting) {
      setIsDrafting(true);
      return;
    }

    const trimmedReason = reason.trim();
    if (newStatus === "DRAFT" && !trimmedReason) return;

    try {
      setBusyStatus(newStatus);
      await api.post(`/courses/${course.id}/status`, {
        status: newStatus,
        reason: newStatus === "DRAFT" ? trimmedReason : "",
      });

      // Reflect the new status straight away, then reconcile with the server.
      setCourses((previous) =>
        previous.map((item) =>
          item.id === course.id ? { ...item, status: CONFIRMABLE_STATUS[newStatus].label } : item
        )
      );
      toast.success(CONFIRMABLE_STATUS[newStatus]?.success || "Course updated.");

      closeReview();
      fetchCourses();
    } catch (error) {
      const message =
        error?.response?.data?.message || "We could not update this course. Please try again.";
      toast.error(message);
    } finally {
      setBusyStatus(null);
    }
  };

  const columns = [
    {
      name: "Title",
      selector: (row) => row.title,
      sortable: true,
      wrap: true,
    },
    {
      name: "Provider",
      selector: (row) => row.provider?.legal_name || row.provider?.name || "N/A",
      sortable: true,
      wrap: true,
    },
    {
      name: "Category",
      selector: (row) => row.category || "N/A",
      sortable: true,
    },
    {
      name: "Mode",
      selector: (row) => row.mode || "N/A",
    },
    {
      name: "Status",
      cell: (row) => {
        const currentStatus = row.status ? row.status.toUpperCase().trim() : "";
        let badgeClass = "bg-warning text-dark";

        if (currentStatus === "PUBLISHED" || currentStatus === "APPROVED") {
          badgeClass = "bg-success";
        } else if (currentStatus === "DRAFT") {
          badgeClass = "bg-secondary";
        } else if (currentStatus === "CLOSED" || currentStatus === "SUSPENDED") {
          badgeClass = "bg-danger";
        }

        return <span className={`badge ${badgeClass}`}>{row.status}</span>;
      },
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <button
          type="button"
          className="btn btn-sm th-btn-review"
          onClick={() => openReview(row)}
          aria-label={`Review ${row.title}`}
        >
          Review
        </button>
      ),
      ignoreRowClick: true,
    },
  ];

  return (
    <ProviderDashboardLayout title="Courses Management">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* SEARCH SECTION */}
      <div className="row mt-3 mb-2">
        <div className="col-md-4 ms-auto">
          <div className="input-group shadow-sm">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              aria-label="Search courses"
              type="text"
              className="form-control border-start-0"
              placeholder="Search courses..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <DataTable
            columns={columns}
            data={filteredCourses}
            pagination
            progressPending={loading}
            highlightOnHover
            responsive
            noDataComponent={
              <div className="th-table-empty">
                <span className="th-table-empty__icon" aria-hidden="true">
                  <i className="bi bi-journal-x"></i>
                </span>
                <p className="th-table-empty__title">No courses found</p>
                <p className="th-table-empty__text">
                  {searchText
                    ? "No course matches your search. Try a different title, provider or status."
                    : "Courses submitted by providers will appear here for review."}
                </p>
              </div>
            }
          />
        </div>
      </div>

      {selectedCourse && (
        <CourseReviewDialog
          course={selectedCourse}
          isDrafting={isDrafting}
          reason={reason}
          onReasonChange={setReason}
          busyStatus={busyStatus}
          onCancelDraft={cancelDraft}
          onDecision={handleStatusUpdate}
          onClose={closeReview}
        />
      )}
    </ProviderDashboardLayout>
  );
}
