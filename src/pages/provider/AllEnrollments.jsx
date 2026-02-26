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
      // Kama ulivyoona kwenye Postman: { status: 'success', enrollments: [] }
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
          <div className="fw-bold text-dark">{row.user?.name || row.user_name || "Unknown"}</div>
          <small className="text-muted" style={{ fontSize: "11px" }}>
            {row.user?.email || row.email}
          </small>
        </div>
      ),
    },
    {
      name: "Course & Cohort",
      selector: (row) => row.course?.title,
      cell: (row) => (
        <div>
          <div className="text-wrap" style={{ fontSize: "12px", lineHeight: "1.2" }}>
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
          <span className={`badge rounded-pill ${isPaid ? "bg-success" : "bg-danger"}`} style={{ fontSize: "10px" }}>
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
          className="btn btn-sm btn-light border"
          data-bs-toggle="modal"
          data-bs-target="#studentModal"
          onClick={() => setSelectedStudent(row)}
        >
          <i className="bi bi-eye"></i>
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
          <div className="card border-0 shadow-sm p-3 border-start border-primary border-4">
            <small className="text-muted fw-bold d-block text-uppercase">Total Students</small>
            <h4 className="fw-bold mb-0">{enrollments.length}</h4>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
          <input
            type="text"
            className="form-control form-control-sm w-25 shadow-none"
            placeholder="Search..."
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
            customStyles={{ headCells: { style: { color: "#0a2e67", fontWeight: "bold" } } }}
          />
        </div>
      </div>

      {/* Details Modal */}
      {/* Details Modal */}
<div className="modal fade" id="studentModal" tabIndex="-1" aria-hidden="true">
  <div className="modal-dialog modal-lg modal-dialog-centered">
    <div className="modal-content border-0 shadow-lg">
      <div className="modal-header bg-light">
        <h5 className="modal-title fw-bold" style={{ color: "#0a2e67" }}>
          <i className="bi bi-person-badge me-2"></i>
          Trainee Profile
        </h5>
        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      
      <div className="modal-body p-4">
        {selectedStudent ? (
          <div className="row g-4">
            {/* Sehemu ya Kozi na Cohort */}
            <div className="col-12">
              <div className="p-3 rounded-3 border-start border-4 border-primary bg-aliceblue" style={{ backgroundColor: "#f0f8ff" }}>
                <small className="text-uppercase text-muted fw-bold" style={{ fontSize: "11px" }}>Enrolled Course</small>
                <h5 className="fw-bold mb-1">{selectedStudent.course?.title || "Course Name N/A"}</h5>
                <span className="badge bg-primary">
                  <i className="bi bi-calendar3 me-1"></i> {selectedStudent.cohort?.intake_name || "No Cohort"}
                </span>
              </div>
            </div>

            {/* Taarifa Binafsi */}
            <div className="col-md-6">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-light rounded-circle p-2 me-3">
                  <i className="bi bi-person text-primary fs-4"></i>
                </div>
                <div>
                  <small className="text-muted d-block">Full Name</small>
                  <span className="fw-bold">{selectedStudent.user?.name || "N/A"}</span>
                </div>
              </div>

              <div className="d-flex align-items-center mb-3">
                <div className="bg-light rounded-circle p-2 me-3">
                  <i className="bi bi-envelope text-primary fs-4"></i>
                </div>
                <div>
                  <small className="text-muted d-block">Email Address</small>
                  <span className="fw-bold">{selectedStudent.user?.email || "N/A"}</span>
                </div>
              </div>

              <div className="d-flex align-items-center">
                <div className="bg-light rounded-circle p-2 me-3">
                  <i className="bi bi-telephone text-primary fs-4"></i>
                </div>
                <div>
                  <small className="text-muted d-block">Phone Number</small>
                  <span className="fw-bold">{selectedStudent.user?.phone || "Not Provided"}</span>
                </div>
              </div>
            </div>

            {/* Taarifa za Kazi/Eneo */}
            <div className="col-md-6">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-light rounded-circle p-2 me-3">
                  <i className="bi bi-building text-primary fs-4"></i>
                </div>
                <div>
                  <small className="text-muted d-block">Organization</small>
                  <span className="fw-bold">{selectedStudent.organization || "N/A"}</span>
                </div>
              </div>

              <div className="d-flex align-items-center mb-3">
                <div className="bg-light rounded-circle p-2 me-3">
                  <i className="bi bi-briefcase text-primary fs-4"></i>
                </div>
                <div>
                  <small className="text-muted d-block">Position</small>
                  <span className="fw-bold">{selectedStudent.position || "N/A"}</span>
                </div>
              </div>

              <div className="d-flex align-items-center">
                <div className="bg-light rounded-circle p-2 me-3">
                  <i className="bi bi-geo-alt text-primary fs-4"></i>
                </div>
                <div>
                  <small className="text-muted d-block">Location</small>
                  <span className="fw-bold">{selectedStudent.region || "N/A"}, {selectedStudent.city || ""}</span>
                </div>
              </div>
            </div>

            {/* Sehemu ya Malipo */}
            <div className="col-12">
              <div className="border-top pt-3 d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted d-block">Payment Status</small>
                  <span className="badge bg-success-subtle text-success border border-success px-3">
                    <i className="bi bi-check-circle-fill me-1"></i> {selectedStudent.status}
                  </span>
                </div>
                <div className="text-end">
                  <small className="text-muted d-block">Total Amount Paid</small>
                  <h4 className="fw-bold text-dark mb-0">
                    Tsh {new Intl.NumberFormat().format(selectedStudent.amount || 0)}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Fetching student details...</p>
          </div>
        )}
      </div>

      <div className="modal-footer border-0">
        <button type="button" className="btn btn-secondary px-4" data-bs-dismiss="modal">Close</button>
        
      </div>
    </div>
  </div>
</div>

    </ProviderDashboardLayout>
  );
}