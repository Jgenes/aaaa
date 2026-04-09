import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import DataTable from "react-data-table-component";
import { FaEye, FaPlus, FaArrowLeft, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { getCohorts, deleteCohort } from "../../api/courseServices";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const customStyles = {
    header: { style: { minHeight: '56px' } },
    headRow: {
      style: {
        borderTopStyle: 'solid',
        borderTopWidth: '1px',
        borderTopColor: '#f1f5f9',
        backgroundColor: '#f8fafc',
      },
    },
    headCells: {
      style: {
        fontWeight: '700',
        textTransform: 'uppercase',
        fontSize: '11px',
        letterSpacing: '0.5px',
        color: '#64748b',
      },
    },
    cells: {
      style: {
        fontSize: '14px',
        color: '#334155',
        paddingTop: '12px',
        paddingBottom: '12px',
      },
    },
  };

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
          <div className="w-100 pr-3">
            <div className="d-flex justify-content-between mb-1 small">
              <span>{enrolled}/{capacity}</span>
              <span className={remaining < 5 ? "text-danger fw-bold" : "text-muted"}>{remaining} left</span>
            </div>
            <div className="progress" style={{ height: "6px", borderRadius: "10px" }}>
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
        <span className="fw-bold" style={{ color: "#0a2e67" }}>
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
      
      <style>{`
        .page-header { background: #fff; padding: 1.5rem; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 2rem; }
        .search-wrapper { position: relative; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .search-input { padding-left: 35px !important; border-radius: 10px; border: 1px solid #e2e8f0; width: 250px; transition: 0.3s; }
        .search-input:focus { width: 300px; border-color: #0a2e67; box-shadow: 0 0 0 4px rgba(10,46,103,0.05); }
        
        .status-badge { padding: 5px 12px; border-radius: 20px; font-size: 10px; font-weight: 800; letter-spacing: 0.5px; }
        .status-open { background: #dcfce7; color: #15803d; }
        .status-full { background: #fef9c3; color: #a16207; }
        .status-closed { background: #f1f5f9; color: #475569; }

        .action-btn { width: 32px; height: 32px; border-radius: 8px; border: none; display: flex; align-items: center; justify-content: center; transition: 0.2s; font-size: 14px; }
        .btn-view { background: #eff6ff; color: #2563eb; }
        .btn-edit { background: #fff7ed; color: #ea580c; }
        .btn-delete { background: #fef2f2; color: #dc2626; }
        .action-btn:hover { transform: translateY(-2px); filter: brightness(0.95); }

        .btn-add-cohort { background: #0a2e67; color: #fff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; transition: 0.3s; }
        .btn-add-cohort:hover { background: #082452; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(10,46,103,0.2); }
        
        .rdt_Table { border-radius: 16px; overflow: hidden; }
      `}</style>

      <div className="container py-4">
        <div className="page-header d-md-flex justify-content-between align-items-center">
          <div>
            <button className="btn btn-link text-decoration-none text-muted p-0 mb-2 small d-flex align-items-center gap-2" onClick={() => navigate(-1)}>
              <FaArrowLeft size={12} /> Back to Trainings
            </button>
            <h4 className="fw-bold mb-0" style={{ color: "#0a2e67" }}>{courseName}</h4>
            <p className="text-muted small mb-0">Manage intakes, enrollment capacity, and schedules.</p>
          </div>

          <div className="d-flex gap-3 mt-3 mt-md-0">
            <div className="search-wrapper d-none d-lg-block">
              <FaSearch className="search-icon" />
              <input 
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

        <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: "16px" }}>
          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            highlightOnHover
            customStyles={customStyles}
            progressPending={loading}
            noDataComponent={<div className="p-5 text-muted">No intakes found for this course.</div>}
          />
        </div>

        {/* MODERN MODAL */}
        {showModal && selectedCohort && (
          <div className="modal fade show d-block" style={{ background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px" }}>
                <div className="modal-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                      <span className="badge bg-light text-primary mb-2">Cohort Details</span>
                      <h4 className="fw-bold mb-0">{selectedCohort.intake_name}</h4>
                    </div>
                    <button className="btn-close" onClick={() => setShowModal(false)}></button>
                  </div>

                  <div className="row g-4">
                    <div className="col-6">
                      <label className="text-uppercase small fw-bolder text-muted d-block mb-1">Timeline</label>
                      <div className="small fw-bold">{selectedCohort.start_date} - {selectedCohort.end_date}</div>
                    </div>
                    <div className="col-6">
                      <label className="text-uppercase small fw-bolder text-muted d-block mb-1">Investment</label>
                      <div className="small fw-bold text-success">TZS {selectedCohort.price?.toLocaleString()}</div>
                    </div>
                    <div className="col-6">
                      <label className="text-uppercase small fw-bolder text-muted d-block mb-1">Enrollment</label>
                      <div className="small fw-bold">{selectedCohort.enrolled_students} / {selectedCohort.capacity} Students</div>
                    </div>
                    <div className="col-6">
                      <label className="text-uppercase small fw-bolder text-muted d-block mb-1">Venue</label>
                      <div className="small fw-bold text-truncate">{selectedCohort.venue || "Online / Link"}</div>
                    </div>
                    <div className="col-12">
                      <label className="text-uppercase small fw-bolder text-muted d-block mb-1">Schedule</label>
                      <div className="p-3 bg-light rounded-3 small">{selectedCohort.schedule_text || "Contact provider for schedule details."}</div>
                    </div>
                  </div>

                  <button className="btn w-100 mt-4 py-2 fw-bold text-white" style={{ background: "#0a2e67", borderRadius: "10px" }} onClick={() => setShowModal(false)}>
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