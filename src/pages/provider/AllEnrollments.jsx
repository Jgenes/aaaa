import { useState, useEffect } from "react";
import api from "../../api/axio";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import DataTable from "react-data-table-component";

export default function ProviderEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/provider/enrollments-view`);
      const data = res.data?.enrollments || [];
      setEnrollments(data);
    } catch (err) {
      console.error("Error fetching enrollments:", err);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      name: "Student",
      selector: (row) => row.user?.name,
      sortable: true,
      cell: (row) => (
        <div className="py-2">
          <div className="fw-bold text-dark">{row.user?.name || "Unknown"}</div>
          <small className="text-muted" style={{ fontSize: "11px" }}>
            {row.user?.email}
          </small>
        </div>
      ),
    },
    {
      name: "Course & Cohort",
      selector: (row) => row.course?.title,
      cell: (row) => (
        <div>
          <div className="text-wrap" style={{ fontSize: "12px", lineHeight: "1.2", fontWeight: "500" }}>
            {row.course?.title || "N/A"}
          </div>
          <span className="badge bg-light text-dark border mt-1" style={{ fontSize: "10px" }}>
            {row.cohort?.intake_name || "N/A"}
          </span>
        </div>
      ),
    },
    {
      name: "Status",
      cell: (row) => {
        const isPaid = ["PAID", "COMPLETED", "SUCCESS"].includes(row.status?.toUpperCase());
        return (
          <span className={`badge ${isPaid ? "bg-success" : "bg-danger"}`} style={{ fontSize: "10px", padding: "5px 12px", borderRadius: "2px" }}>
            {isPaid ? "Active" : "Pending"}
          </span>
        );
      }
    },
    {
      name: "Action",
      button: true,
      cell: (row) => (
        <button
          className="btn btn-sm btn-light border shadow-sm"
          style={{ borderRadius: "2px" }}
          data-bs-toggle="modal"
          data-bs-target="#studentModal"
          onClick={() => setSelectedStudent(row)}
        >
          <i className="bi bi-eye text-primary"></i>
        </button>
      ),
    },
  ];

  const filteredItems = enrollments.filter(
    (item) =>
      (item.user?.name || "").toLowerCase().includes(filterText.toLowerCase()) ||
      (item.course?.title || "").toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <ProviderDashboardLayout title="Enrollments - All Courses">
      
      {/* Stats Summary */}
      <div className="row mb-4">
        <div className="col-md-3 mb-2">
          <div className="card border-0 shadow-sm p-3 border-start border-primary border-4" style={{ borderRadius: "0px" }}>
            <small className="text-muted fw-bold d-block text-uppercase" style={{ letterSpacing: "0.5px", fontSize: "10px" }}>Total Students</small>
            <h4 className="fw-bold mb-0" style={{ color: "#0a2e67" }}>{enrollments.length}</h4>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: "5px" }}>
        <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0" style={{ color: "#0a2e67" }}>Enrollment List</h6>
          
          {/* Square Search Bar */}
          <input
            type="text"
            className="form-control form-control-sm shadow-none"
            style={{ 
                width: "250px", 
                borderRadius: "5px", // Sharp corners
                border: "1px solid #d1d5db" 
            }}
            placeholder="Search trainee..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>

        <div className="p-2">
          <DataTable
            columns={columns}
            data={filteredItems}
            pagination
            progressPending={loading}
            noDataComponent={<div className="p-4 text-muted">Hakuna data iliyopatikana.</div>}
            highlightOnHover
            responsive
            customStyles={{ 
                headCells: { style: { color: "#0a2e67", fontWeight: "bold", fontSize: "12px", textTransform: "uppercase" } },
                cells: { style: { fontSize: "13px" } }
            }}
          />
        </div>
      </div>

      {/* Details Modal */}
      <div className="modal fade" id="studentModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "0px" }}>
            <div className="modal-header bg-light border-0" style={{ borderRadius: "0px" }}>
              <h5 className="modal-title fw-bold" style={{ color: "#0a2e67" }}>
                <i className="bi bi-person-badge me-2"></i>
                Trainee Profile
              </h5>
              <button type="button" className="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <div className="modal-body p-4">
              {selectedStudent ? (
                <div className="row g-4">
                  <div className="col-12">
                    <div className="p-3 border-start border-4 border-primary" style={{ backgroundColor: "#f0f8ff" }}>
                      <small className="text-uppercase text-muted fw-bold" style={{ fontSize: "11px" }}>Enrolled Course</small>
                      <h5 className="fw-bold mb-1" style={{ color: "#0a2e67" }}>{selectedStudent.course?.title}</h5>
                      <span className="badge bg-primary px-3 shadow-sm" style={{ borderRadius: "2px" }}>
                        {selectedStudent.cohort?.intake_name}
                      </span>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                        <small className="text-muted d-block" style={{ fontSize: "11px" }}>Full Name</small>
                        <span className="fw-bold text-dark">{selectedStudent.user?.name}</span>
                    </div>
                    <div className="mb-3">
                        <small className="text-muted d-block" style={{ fontSize: "11px" }}>Email Address</small>
                        <span className="fw-bold text-dark">{selectedStudent.user?.email}</span>
                    </div>
                    <div className="mb-3">
                        <small className="text-muted d-block" style={{ fontSize: "11px" }}>Phone Number</small>
                        <span className="fw-bold text-dark">{selectedStudent.user?.phone || "N/A"}</span>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                        <small className="text-muted d-block" style={{ fontSize: "11px" }}>Organization</small>
                        <span className="fw-bold text-dark">{selectedStudent.organization || "N/A"}</span>
                    </div>
                    <div className="mb-3">
                        <small className="text-muted d-block" style={{ fontSize: "11px" }}>Location</small>
                        <span className="fw-bold text-dark">{selectedStudent.region}, {selectedStudent.city}</span>
                    </div>
                  </div>

                  <div className="col-12 border-top pt-3 mt-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted d-block" style={{ fontSize: "11px" }}>Status</small>
                        <span className="badge bg-success-subtle text-success border border-success px-3" style={{ borderRadius: "2px" }}>
                          {selectedStudent.status}
                        </span>
                      </div>
                      <div className="text-end">
                        <small className="text-muted d-block" style={{ fontSize: "11px" }}>Amount Paid</small>
                        <h4 className="fw-bold mb-0" style={{ color: "#0a2e67" }}>
                          Tsh {new Intl.NumberFormat().format(selectedStudent.amount || 0)}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="modal-footer border-0">
              <button type="button" className="btn btn-secondary px-4 btn-sm" style={{ borderRadius: "0px" }} data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </ProviderDashboardLayout>
  );
}