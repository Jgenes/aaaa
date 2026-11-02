import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import DataTable from "react-data-table-component";
import { FaEye, FaPlus, FaArrowLeft, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { deleteCohort, getCohorts, refreshCohortStatuses } from "../../api/courseServices";
import api from "../../api/axio";
import { extractList, formatDate, normaliseCohort } from "../../api/catalogue";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { tableStyles } from "../../lib/tableStyles";
export default function CohortList() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [cohorts, setCohorts] = useState([]);
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCohorts();
  }, [courseId]);

  const fetchCohorts = async () => {
    try {
      setLoading(true);
      // GET /courses/:id/cohorts → { status, data: [...] }
      const response = await getCohorts(courseId);
      const cohortsData = extractList(response.data)
        .map(normaliseCohort)
        .filter(Boolean);

      setCohorts(cohortsData);

      // Cohorts come back with their course relation; fall back to a direct
      // fetch so the page never shows "Course #7" as its heading.
      const embeddedName = cohortsData[0]?.course?.title || cohortsData[0]?.course_title;
      if (embeddedName) {
        setCourseName(embeddedName);
      } else {
        try {
          const courseRes = await api.get(`/courses/${courseId}`);
          setCourseName(courseRes.data?.title || `Course #${courseId}`);
        } catch {
          setCourseName(`Course #${courseId}`);
        }
      }
    } catch (error) {
      toast.error("Failed to load cohorts");
      setCohorts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = cohorts.filter((item) =>
    (item.intake_name || item.intakeName || "").toLowerCase().includes(filterText.toLowerCase())
  );

  const handleDelete = async (cohort) => {
    const cohortName = cohort.intake_name || cohort.intakeName || `Cohort #${cohort.id}`;
    if (!window.confirm(`Delete "${cohortName}"?`)) return;

    try {
      await deleteCohort(courseId, cohort.id);
      toast.success("Cohort deleted successfully");
      fetchCohorts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting cohort");
    }
  };

  // POST /courses/:id/cohorts/refresh-statuses → recompute OPEN/FULL/CLOSED.
  const handleRefreshStatuses = async () => {
    try {
      setRefreshing(true);
      await refreshCohortStatuses(courseId);
      toast.success("Cohort statuses refreshed.");
      await fetchCohorts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not refresh cohort statuses.");
    } finally {
      setRefreshing(false);
    }
  };

  // The API tracks seats with `seats_taken` (capacity - seats_taken = remaining).
  const seatsTaken = (cohort) => Number(cohort.seats_taken ?? 0);
  const remainingSeats = (cohort) =>
    cohort.remaining_seats !== undefined
      ? Number(cohort.remaining_seats)
      : Math.max(0, Number(cohort.capacity || 0) - seatsTaken(cohort));

  const getStatusBadge = (cohort) => {
    const status = String(cohort.status || "").toUpperCase(); // OPEN | FULL | CLOSED
    if (status === "FULL") return { label: "FULL", class: "status-full" };
    if (status === "CLOSED") return { label: "CLOSED", class: "status-closed" };

    const deadline = cohort.registration_deadline
      ? new Date(cohort.registration_deadline)
      : null;
    if (deadline && !Number.isNaN(deadline.getTime()) && deadline < new Date()) {
      return { label: "CLOSED", class: "status-closed" };
    }
    if (remainingSeats(cohort) <= 0) return { label: "FULL", class: "status-full" };
    return { label: "OPEN", class: "status-open" };
  };

  // Modern DataTable Styling

  const columns = [
    {
      name: "Intake Details",
      selector: (row) => row.intake_name,
      sortable: true,
      grow: 2,
      cell: (row) => (
        <div>
          <div className="fw-bold text-dark">{row.intake_name || row.intakeName}</div>
          <div className="text-muted small">ID: #{row.id}</div>
        </div>
      )
    },
    {
      name: "Duration",
      cell: (row) => (
        <div className="small">
          <div className="text-nowrap"><span className="text-muted">Start:</span> {formatDate(row.start_date)}</div>
          <div className="text-nowrap"><span className="text-muted">End:</span> {formatDate(row.end_date)}</div>
        </div>
      )
    },
    {
      name: "Enrollment",
      selector: (row) => seatsTaken(row),
      sortable: true,
      cell: (row) => {
        const remaining = remainingSeats(row);
        const capacity = Number(row.capacity || 0);
        const enrolled = seatsTaken(row);
        const percentage = capacity > 0 ? (enrolled / capacity) * 100 : 0;
        return (
          <div className="w-100 pe-3">
            <div className="d-flex justify-content-between mb-1 small">
              <span>{enrolled}/{capacity}</span>
              <span className={remaining < 5 ? "text-danger fw-bold" : "text-muted"}>{remaining} left</span>
            </div>
            <div className="progress" style={{ height: "6px", }}>
              <div 
                className={`progress-bar ${percentage >= 90 ? "bg-danger" : percentage >= 70 ? "bg-warning" : "bg-primary"}`} 
                style={{ width: `${Math.min(percentage, 100)}%` }} 
              />
            </div>
          </div>
        );
      },
    },
    {
      name: "Investment",
      selector: (row) => row.price,
      sortable: true,
      cell: (row) => (
        <span className="fw-bold" style={{ color: "var(--th-primary)" }}>
          TZS {(row.price || 0).toLocaleString()}
        </span>
      )
    },
    {
      name: "Status",
      cell: (row) => {
        const status = getStatusBadge(row);
        return <span className={`status-badge ${status.class}`}>{status.label}</span>;
      },
    },
    {
      name: "Actions",
      right: true,
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="action-btn btn-view" onClick={() => { setSelectedCohort(row); setShowModal(true); }} title="View">
            <FaEye />
          </button>
          <button className="action-btn btn-edit" onClick={() => navigate(`/provider/cohorts/${courseId}/${row.id}/edit`)} title="Edit">
            <FaEdit />
          </button>
          <button className="action-btn btn-delete" onClick={() => handleDelete(row)} title="Delete">
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <ProviderDashboardLayout title="Management">
      <ToastContainer position="top-right" theme="colored" />
      

      <div>
        <div className="page-header d-md-flex justify-content-between align-items-center">
          <div>
            <button className="btn btn-link text-decoration-none text-muted p-0 mb-2 small d-flex align-items-center gap-2" onClick={() => navigate(-1)}>
              <FaArrowLeft size={12} /> Back to Trainings
            </button>
            <h4 className="fw-bold mb-0" style={{ color: "var(--th-primary)" }}>{courseName}</h4>
            <p className="text-muted small mb-0">Manage intakes, enrollment capacity, and schedules.</p>
          </div>

          <div className="d-flex gap-3 mt-3 mt-md-0">
            <div className="search-wrapper d-none d-lg-block">
              <FaSearch className="search-icon" />
              <input aria-label="Find intake" 
                type="text" 
                className="form-control search-input" 
                placeholder="Find intake..." 
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn btn-outline-dark d-flex align-items-center gap-2"
              onClick={handleRefreshStatuses}
              disabled={refreshing}
            >
              <i className={`bi bi-arrow-clockwise ${refreshing ? "spinner-border spinner-border-sm" : ""}`} aria-hidden="true"></i>
              Refresh seats
            </button>
            <button className="btn-add-cohort d-flex align-items-center gap-2" onClick={() => navigate(`/provider/cohorts/create/${courseId}`)}>
              <FaPlus size={14} /> Add Cohort
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            highlightOnHover
            customStyles={tableStyles}
            progressPending={loading}
            noDataComponent={<div className="p-5 text-muted">No intakes found for this course.</div>}
          />
        </div>

        {/* MODERN MODAL */}
        {showModal && selectedCohort && (
          <div className="modal fade show d-block th-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="cohort-details-title">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                      <span className="badge bg-light text-primary mb-2">Cohort Details</span>
                      <h4 className="fw-bold mb-0" id="cohort-details-title">{selectedCohort.intake_name}</h4>
                    </div>
                    <button
                      className="btn-close"
                      aria-label="Close cohort details"
                      onClick={() => setShowModal(false)}
                    ></button>
                  </div>

                  <div className="row g-4">
                    <div className="col-6">
                      <div className="detail-label">Timeline</div>
                      <div className="small fw-bold">{formatDate(selectedCohort.start_date)} – {formatDate(selectedCohort.end_date)}</div>
                    </div>
                    <div className="col-6">
                      <div className="detail-label">Investment</div>
                      <div className="small fw-bold text-success">TZS {selectedCohort.price?.toLocaleString()}</div>
                    </div>
                    <div className="col-6">
                      <div className="detail-label">Enrollment</div>
                      <div className="small fw-bold">{selectedCohort.seats_taken} / {selectedCohort.capacity} Students</div>
                    </div>
                    <div className="col-6">
                      <div className="detail-label">Venue</div>
                      <div className="small fw-bold text-truncate">{selectedCohort.venue || "Online / Link"}</div>
                    </div>
                    <div className="col-12">
                      <div className="detail-label">Schedule</div>
                      <div className="p-3 bg-light rounded-3 small">{selectedCohort.schedule_text || "Contact provider for schedule details."}</div>
                    </div>
                  </div>

                  <button className="btn btn-primary w-100 mt-4 py-2 fw-bold" onClick={() => setShowModal(false)}>
                    Close Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProviderDashboardLayout>
  );
}