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
      // Tunaita endpoint uliyothibitisha kwenye Postman
      const res = await api.get(`/provider/enrollments-view`);
      
      console.log("API Response:", res.data);

      // Tunahakikisha tunapata array ya enrollments (kama ulivyoona Postman)
      const data = res.data?.enrollments || (Array.isArray(res.data) ? res.data : []);
      setEnrollments(data);
    } catch (err) {
      console.error("Error fetching enrollments:", err.response?.data || err.message);
      setEnrollments([]);
    } finally {
      // Hii ndio itazima loading spinner hata kukiwa na error
      setLoading(false);
    }
  };

  // Calculations
  const totalStudents = enrollments.length;
  const totalEarnings = enrollments.reduce((acc, curr) => {
    const isPaid = ["PAID", "COMPLETED", "SUCCESS"].includes(curr.status?.toUpperCase());
    return isPaid ? acc + Number(curr.amount || 0) : acc;
  }, 0);

  // Column Definitions
  const columns = [
    {
      name: "Student",
      selector: (row) => row.user?.name,
      sortable: true,
      cell: (row) => (
        <div className="py-2">
          <div className="fw-bold text-dark">{row.user?.name || row.user_name || "Unknown"}</div>
          <small className="text-muted" style={{ fontSize: "11px" }}>
            {row.user?.email || row.email || "No email"}
          </small>
        </div>
      ),
    },
    {
      name: "Course & Cohort",
      selector: (row) => row.course?.title,
      cell: (row) => (
        <div>
          <div className="text-wrap" style={{ fontSize: "12px", lineHeight: "1.2", maxWidth: "200px" }}>
            {row.course?.title || "N/A"}
          </div>
          <span className="badge bg-light text-dark border mt-1" style={{ fontSize: "10px" }}>
            {row.cohort?.name || "N/A"}
          </span>
        </div>
      ),
    },
    {
      name: "Status",
      selector: (row) => row.status,
      cell: (row) => {
        const isActive = ["PAID", "COMPLETED", "SUCCESS"].includes(row.status?.toUpperCase());
        return (
          <span
            className={`badge rounded-pill ${isActive ? "bg-success" : "bg-warning text-dark"}`}
            style={{ fontSize: "10px" }}
          >
            {isActive ? "Active" : row.status || "Pending"}
          </span>
        );
      },
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
          <i className="bi bi-eye me-1"></i> Details
        </button>
      ),
    },
  ];

  // Search filter logic
  const filteredItems = enrollments.filter(
    (item) =>
      (item.user?.name || "").toLowerCase().includes(filterText.toLowerCase()) ||
      (item.course?.title || "").toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <ProviderDashboardLayout title="Enrollments - All Courses">
      
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-2">
          <div className="card border-0 shadow-sm p-3 border-start border-primary border-4">
            <small className="text-muted fw-bold d-block text-uppercase">Total Students</small>
            <h4 className="fw-bold mb-0">{totalStudents}</h4>
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="card border-0 shadow-sm p-3 border-start border-success border-4">
            <small className="text-muted fw-bold d-block text-uppercase">Total Earnings</small>
            <h4 className="fw-bold mb-0">Tsh {new Intl.NumberFormat().format(totalEarnings)}</h4>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0" style={{ color: "#0a2e67" }}>Student Registry</h5>
          <div style={{ maxWidth: "250px", width: "100%" }}>
            <input
              type="text"
              className="form-control form-control-sm shadow-none"
              placeholder="Search by name or course..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
        </div>

        <div className="p-2">
          <DataTable
            columns={columns}
            data={filteredItems}
            pagination
            progressPending={loading}
            persistTableHead
            noDataComponent={<div className="p-5 text-muted">Hakuna enrollment iliyopatikana.</div>}
            highlightOnHover
            responsive
            customStyles={{
              headCells: { style: { color: "#0a2e67", fontWeight: "bold", fontSize: "13px" } },
            }}
          />
        </div>
      </div>

      {/* Details Modal */}
      <div className="modal fade" id="studentModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold">Full Student Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body p-4">
              {selectedStudent ? (
                <div className="row g-3">
                  <div className="col-12 bg-light p-3 rounded mb-2 text-center border">
                    <small className="text-muted d-block">Enrolled Course</small>
                    <div className="fw-bold text-dark fs-5">{selectedStudent.course?.title || "N/A"}</div>
                    <div className="fw-bold text-primary">{selectedStudent.cohort?.name || "N/A"}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block text-uppercase" style={{ fontSize: '10px' }}>Full Name</small>
                    <span className="fw-bold">{selectedStudent.user?.name || selectedStudent.user_name || "N/A"}</span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block text-uppercase" style={{ fontSize: '10px' }}>Organization</small>
                    <span className="fw-bold text-primary">{selectedStudent.organization || "N/A"}</span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block text-uppercase" style={{ fontSize: '10px' }}>Position</small>
                    <span className="fw-bold">{selectedStudent.position || "N/A"}</span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block text-uppercase" style={{ fontSize: '10px' }}>Contact Email</small>
                    <span className="fw-bold">{selectedStudent.user?.email || selectedStudent.email || "N/A"}</span>
                  </div>
                  <div className="col-12 border-top pt-3 mt-2 d-flex justify-content-between align-items-center">
                    <span className={`badge px-3 py-2 ${["PAID", "COMPLETED", "SUCCESS"].includes(selectedStudent.status?.toUpperCase()) ? 'bg-success' : 'bg-warning text-dark'}`}>
                      STATUS: {selectedStudent.status}
                    </span>
                    <h5 className="mb-0 fw-bold text-dark">
                        Tsh {new Intl.NumberFormat().format(selectedStudent.amount || 0)}
                    </h5>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted italic">Click details to view info...</div>
              )}
            </div>
          </div>
        </div>
      </div>

    </ProviderDashboardLayout>
  );
}