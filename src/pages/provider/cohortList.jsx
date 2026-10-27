import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import DataTable from "react-data-table-component";
import { FaEye, FaPlus, FaArrowLeft, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { getCohorts, deleteCohort } from "../../api/courseServices";
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

  useEffect(() => {
    fetchCohorts();
  }, [courseId]);

  const fetchCohorts = async () => {
    try {
      setLoading(true);
      const response = await getCohorts(courseId);
      let cohortsData = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) cohortsData = response.data;
        else if (response.data.data && Array.isArray(response.data.data)) cohortsData = response.data.data;
        else if (response.data.cohorts && Array.isArray(response.data.cohorts)) cohortsData = response.data.cohorts;
      }

      setCohorts(cohortsData);
      if (cohortsData.length > 0) {
        setCourseName(cohortsData[0].course?.title || cohortsData[0].course_name || `Course #${courseId}`);
      } else {
        setCourseName(`Course #${courseId}`);
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

  const calculateRemainingSeats = (cohort) => {
    const enrolled = cohort.enrolled_students || cohort.enrolledStudents || 0;
    const capacity = cohort.capacity || 0;
    return Math.max(0, capacity - enrolled);
  };

  const getStatusBadge = (cohort) => {
    const now = new Date();
    const deadline = new Date(cohort.registration_deadline || cohort.registrationDeadline);
    const enrolled = cohort.enrolled_students || cohort.enrolledStudents || 0;
    const capacity = cohort.capacity || 0;

    if (now > deadline) return { label: "CLOSED", class: "status-closed" };
    if (enrolled >= capacity) return { label: "FULL", class: "status-full" };
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
          <div className="text-nowrap"><span className="text-muted">Start:</span> {row.start_date}</div>
          <div className="text-nowrap"><span className="text-muted">End:</span> {row.end_date}</div>
        </div>
      )
    },
    {
      name: "Enrollment",
      selector: (row) => row.enrolled_students,
      sortable: true,
      cell: (row) => {
        const remaining = calculateRemainingSeats(row);
        const capacity = row.capacity || 0;
        const enrolled = row.enrolled_students || 0;
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
                      <div className="small fw-bold">{selectedCohort.start_date} - {selectedCohort.end_date}</div>
                    </div>
                    <div className="col-6">
                      <div className="detail-label">Investment</div>
                      <div className="small fw-bold text-success">TZS {selectedCohort.price?.toLocaleString()}</div>
                    </div>
                    <div className="col-6">
                      <div className="detail-label">Enrollment</div>
                      <div className="small fw-bold">{selectedCohort.enrolled_students} / {selectedCohort.capacity} Students</div>
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