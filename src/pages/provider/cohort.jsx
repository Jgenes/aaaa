import { useState } from "react";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import DataTable from "react-data-table-component";
import { FaEye, FaEdit, FaTrash, FaCogs, FaSearch, FaPlus, FaCalendarAlt, FaMapMarkerAlt, FaLink } from "react-icons/fa";

// Dummy Cohort Data (Imebaki vile vile)
const data = [
  {
    id: 1,
    intakeName: "Feb 2026 Cohort",
    courseName: "Advanced React",
    startDate: "2026-02-01",
    endDate: "2026-03-30",
    schedule: "Mon – Fri | 6pm – 8pm",
    mode: "Online",
    venue: "",
    onlineLink: "https://zoom.us/example",
    capacity: 30,
    price: 450000,
    registrationDeadline: "2026-01-25",
    status: "Open",
    description: "This cohort focuses on advanced React development and real projects.",
  },
  {
    id: 2,
    intakeName: "Mar 2026 Cohort",
    courseName: "Backend with Laravel",
    startDate: "2026-03-05",
    endDate: "2026-05-01",
    schedule: "Sat – Sun | 9am – 1pm",
    mode: "Physical",
    venue: "GRVA Tech – Dar es Salaam",
    capacity: 20,
    price: 600000,
    registrationDeadline: "2026-02-25",
    status: "Full",
    description: "Hands-on backend training using Laravel and MySQL.",
  },
];

const customStyles = {
  headCells: {
    style: {
      backgroundColor: "#f8fafc",
      color: "#475569",
      fontWeight: "700",
      fontSize: "13px",
      textTransform: "uppercase",
    },
  },
  cells: {
    style: {
      fontSize: "14px",
      color: "#1e293b",
      paddingTop: "12px",
      paddingBottom: "12px",
    },
  },
};

export default function ProviderCohorts() {
  const [filterText, setFilterText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState(null);

  const filteredData = data.filter(
    (item) =>
      item.intakeName.toLowerCase().includes(filterText.toLowerCase()) ||
      item.courseName.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleView = (cohort) => {
    setSelectedCohort(cohort);
    setShowModal(true);
  };

  const columns = [
    { name: "#", selector: (row) => row.id, width: "60px", sortable: true },
    { 
        name: "Intake & Course", 
        selector: (row) => row.intakeName, 
        sortable: true,
        cell: (row) => (
            <div>
                <div className="fw-bold text-primary">{row.intakeName}</div>
                <small className="text-muted">{row.courseName}</small>
            </div>
        ),
        grow: 2
    },
    { 
        name: "Mode", 
        selector: (row) => row.mode,
        cell: (row) => (
            <span className={`badge ${row.mode === 'Online' ? 'bg-info-subtle text-info' : 'bg-warning-subtle text-warning'} border`}>
                {row.mode}
            </span>
        )
    },
    { 
        name: "Capacity", 
        cell: (row) => (
            <span>{row.capacity} Seats</span>
        ) 
    },
    { 
        name: "Status", 
        selector: (row) => row.status,
        cell: (row) => (
            <span className={`badge ${row.status === 'Open' ? 'bg-success' : 'bg-danger'}`}>
                {row.status}
            </span>
        )
    },
    {
      name: "Actions",
      right: true,
      cell: (row) => (
        <div className="d-flex gap-1">
          <button className="btn btn-sm btn-light border text-primary" title="View" onClick={() => handleView(row)}><FaEye /></button>
          <button className="btn btn-sm btn-light border text-dark" title="Manage" onClick={() => alert('Manage')}><FaCogs /></button>
          <button className="btn btn-sm btn-light border text-warning" title="Edit" onClick={() => alert('Edit')}><FaEdit /></button>
          <button className="btn btn-sm btn-light border text-danger" title="Delete" onClick={() => alert('Delete')}><FaTrash /></button>
        </div>
      ),
    },
  ];

  return (
    <ProviderDashboardLayout title="Training Cohorts">
      <div className="container-fluid py-4">
        
        {/* Header Section */}
        <div className="card border-0 shadow-sm mb-4">
            <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <div>
                    <h4 className="mb-0 fw-bold">Active Cohorts</h4>
                    <p className="text-muted small mb-0">Manage schedules and enrollments for your courses</p>
                </div>
                <div className="d-flex gap-2 w-100 w-md-auto">
                    <div className="input-group" style={{ maxWidth: "300px" }}>
                        <span className="input-group-text bg-white border-end-0"><FaSearch className="text-muted" /></span>
                        <input
                            type="text"
                            placeholder="Search cohorts..."
                            className="form-control border-start-0 ps-0"
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
                        <FaPlus size={12} /> <span className="d-none d-sm-inline">New Cohort</span>
                    </button>
                </div>
            </div>
        </div>

        {/* Table Section */}
        <div className="card border-0 shadow-sm overflow-hidden">
            <DataTable
                columns={columns}
                data={filteredData}
                pagination
                highlightOnHover
                customStyles={customStyles}
                responsive
            />
        </div>

        {/* MODERN VIEW MODAL */}
        {showModal && selectedCohort && (
          <div className="modal fade show d-block" style={{ background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px" }}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold text-primary">{selectedCohort.intakeName}</h5>
                  <button className="btn-close shadow-none" onClick={() => setShowModal(false)} />
                </div>

                <div className="modal-body p-4">
                    <div className="row g-4">
                        <div className="col-md-7">
                            <h6 className="fw-bold mb-3">About this Cohort</h6>
                            <p className="text-muted">{selectedCohort.description}</p>
                            
                            <div className="d-flex align-items-center gap-3 mb-3 p-3 bg-light rounded-3">
                                <FaCalendarAlt className="text-primary" />
                                <div>
                                    <small className="d-block text-muted">Schedule</small>
                                    <span className="fw-semibold">{selectedCohort.schedule}</span>
                                </div>
                            </div>

                            <div className="row g-2">
                                <div className="col-6">
                                    <div className="p-2 border rounded text-center">
                                        <small className="text-muted d-block">Start Date</small>
                                        <span className="fw-bold">{selectedCohort.startDate}</span>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="p-2 border rounded text-center">
                                        <small className="text-muted d-block">End Date</small>
                                        <span className="fw-bold">{selectedCohort.endDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-5 border-start ps-md-4">
                            <h6 className="fw-bold mb-3">Logistics</h6>
                            <ul className="list-unstyled">
                                <li className="mb-3 d-flex align-items-start gap-2">
                                    {selectedCohort.mode === "Physical" ? <FaMapMarkerAlt className="mt-1 text-danger" /> : <FaLink className="mt-1 text-info" />}
                                    <div>
                                        <span className="d-block fw-bold small text-uppercase text-muted">Location / Mode</span>
                                        {selectedCohort.mode === "Physical" ? (
                                            <span className="text-dark">{selectedCohort.venue}</span>
                                        ) : (
                                            <a href={selectedCohort.onlineLink} target="_blank" rel="noreferrer" className="text-decoration-none">Click to Join Zoom</a>
                                        )}
                                    </div>
                                </li>
                                <li className="mb-3">
                                    <span className="d-block fw-bold small text-uppercase text-muted">Investment</span>
                                    <span className="h5 fw-bold text-success">TZS {selectedCohort.price.toLocaleString()}</span>
                                </li>
                                <li className="mb-3">
                                    <span className="d-block fw-bold small text-uppercase text-muted">Registration Closes</span>
                                    <span className="text-danger fw-bold">{selectedCohort.registrationDeadline}</span>
                                </li>
                                <li>
                                    <span className={`badge w-100 py-2 ${selectedCohort.status === 'Open' ? 'bg-success' : 'bg-danger'}`}>
                                        Status: {selectedCohort.status}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="modal-footer border-0">
                  <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowModal(false)}>Close</button>
                  <button className="btn btn-primary rounded-pill px-4" onClick={() => alert('Editing')}>Edit Details</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProviderDashboardLayout>
  );
}