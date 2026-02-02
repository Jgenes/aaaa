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
    try {
      const res = await api.get("/provider/enrollments");
      setEnrollments(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
    }
  };

  const totalStudents = enrollments.length;
  const totalEarnings = enrollments.reduce((acc, curr) => {
    return curr.status === "PAID" || curr.status === "COMPLETED"
      ? acc + Number(curr.amount)
      : acc;
  }, 0);

  const columns = [
    {
      name: "Student",
      selector: (row) => row.user?.name,
      sortable: true,
      cell: (row) => (
        <div className="py-2">
          <div className="fw-bold text-dark">{row.user?.name || "Unknown"}</div>
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
          <div
            className="text-wrap"
            style={{ fontSize: "12px", lineHeight: "1.2" }}
          >
            {row.course?.title}
          </div>
          <span
            className="badge bg-light text-dark border mt-1"
            style={{ fontSize: "10px" }}
          >
            {row.cohort?.name}
          </span>
        </div>
      ),
    },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={`badge rounded-pill ${row.status === "PAID" || row.status === "COMPLETED" ? "bg-success" : "bg-danger"}`}
          style={{ fontSize: "10px" }}
        >
          {row.status === "PAID" || row.status === "COMPLETED"
            ? "Active"
            : "Pending"}
        </span>
      ),
    },
    {
      name: "Action",
      button: true,
      cell: (row) => (
        <button
          className="btn btn-sm btn-light border d-flex align-items-center"
          data-bs-toggle="modal"
          data-bs-target="#studentModal"
          onClick={() => setSelectedStudent(row)}
        >
          <i className="bi bi-eye me-1"></i> Details
        </button>
      ),
    },
  ];

  const filteredItems = enrollments.filter(
    (item) =>
      item.user?.name?.toLowerCase().includes(filterText.toLowerCase()) ||
      item.course?.title?.toLowerCase().includes(filterText.toLowerCase()),
  );

  return (
    <ProviderDashboardLayout title="Enrollments">
      <div className="row mb-4">
        <div className="col-md-3 mb-2">
          <div className="card border-0 shadow-sm p-3 border-start border-primary border-4">
            <small className="text-muted fw-bold d-block text-uppercase">
              Students
            </small>
            <h4 className="fw-bold mb-0">{totalStudents}</h4>
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="card border-0 shadow-sm p-3 border-start border-success border-4">
            <small className="text-muted fw-bold d-block text-uppercase">
              Earnings
            </small>
            <h4 className="fw-bold mb-0">
              Tsh {new Intl.NumberFormat().format(totalEarnings)}
            </h4>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0" style={{ color: "#0a2e67" }}>
            Registered
          </h5>
          {/* HAPA NDIPO PALEKEREBISHWA - Search bar sasa ni fupi (w-md-25) */}
          <div style={{ maxWidth: "250px", width: "100%" }}>
            <input
              type="text"
              className="form-control form-control-sm shadow-none"
              placeholder="Search..."
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
            highlightOnHover
            responsive
            customStyles={{
              headCells: { style: { color: "#0a2e67", fontWeight: "bold" } },
            }}
          />
        </div>
      </div>

      {/* --- MODAL --- */}
      <div className="modal fade" id="studentModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header border-0 bg-light">
              <h6 className="modal-title fw-bold">Enrollment Info</h6>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body p-4">
              {selectedStudent ? (
                <div className="row g-3">
                  <div className="col-12 bg-light p-2 rounded mb-2 text-center">
                    <small className="text-muted d-block">Current Cohort</small>
                    <span className="fw-bold text-primary">
                      {selectedStudent.cohort?.name}
                    </span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block text-uppercase">
                      Organization
                    </small>
                    <span className="fw-bold small">
                      {selectedStudent.organization || "N/A"}
                    </span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block text-uppercase">
                      Position
                    </small>
                    <span className="fw-bold small">
                      {selectedStudent.position || "N/A"}
                    </span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block text-uppercase">
                      Region/City
                    </small>
                    <span className="small d-block">
                      {selectedStudent.region}, {selectedStudent.city}
                    </span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block text-uppercase">
                      Street/Postal
                    </small>
                    <span className="small d-block">
                      {selectedStudent.street} | {selectedStudent.postal_code}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center">Loading...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProviderDashboardLayout>
  );
}
