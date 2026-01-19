import { useState } from "react";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import DataTable from "react-data-table-component";
import { FaEye, FaEdit, FaTrash, FaCogs } from "react-icons/fa";

// Dummy Cohort Data
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
    description:
      "This cohort focuses on advanced React development and real projects.",
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

  const handleManage = (cohort) => alert(`Manage cohort: ${cohort.intakeName}`);

  const handleEdit = (cohort) => alert(`Edit cohort: ${cohort.intakeName}`);

  const handleDelete = (cohort) => {
    if (window.confirm(`Delete ${cohort.intakeName}?`)) {
      alert("Deleted");
    }
  };

  const columns = [
    { name: "ID", selector: (row) => row.id, width: "70px" },
    { name: "Intake Name", selector: (row) => row.intakeName, sortable: true },
    { name: "Course", selector: (row) => row.courseName },
    { name: "Mode", selector: (row) => row.mode },
    { name: "Seats", selector: (row) => row.capacity },
    { name: "Status", selector: (row) => row.status },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-info"
            onClick={() => handleView(row)}
          >
            <FaEye color="white" />
          </button>
          <button
            className="btn btn-sm btn-warning"
            onClick={() => handleManage(row)}
          >
            <FaCogs color="white" />
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => handleEdit(row)}
          >
            <FaEdit color="white" />
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(row)}
          >
            <FaTrash color="white" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <ProviderDashboardLayout title="Cohorts">
      <div className="container mt-4">
        <div className="d-flex justify-content-between mb-2">
          <h5>Cohorts List</h5>
          <input
            type="text"
            placeholder="Search..."
            className="form-control w-auto"
            style={{ minWidth: "200px" }}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          highlightOnHover
          striped
        />

        {/* VIEW COHORT MODAL */}
        {showModal && selectedCohort && (
          <div
            className="modal fade show d-block"
            style={{ background: "#00000080" }}
          >
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{selectedCohort.intakeName}</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>

                <div className="modal-body">
                  <p>
                    <strong>Course:</strong> {selectedCohort.courseName}
                  </p>

                  <p>
                    <strong>Duration:</strong> {selectedCohort.startDate} –{" "}
                    {selectedCohort.endDate}
                  </p>

                  <p>
                    <strong>Schedule:</strong> {selectedCohort.schedule}
                  </p>

                  <p>
                    <strong>Mode:</strong> {selectedCohort.mode}
                  </p>

                  {selectedCohort.mode === "Physical" && (
                    <p>
                      <strong>Venue:</strong> {selectedCohort.venue}
                    </p>
                  )}

                  {selectedCohort.mode === "Online" && (
                    <p>
                      <strong>Online Link:</strong>{" "}
                      <a
                        href={selectedCohort.onlineLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Join Class
                      </a>
                    </p>
                  )}

                  <hr />

                  <p>
                    <strong>Seats:</strong> {selectedCohort.capacity}
                  </p>

                  <p>
                    <strong>Price:</strong> TZS{" "}
                    {selectedCohort.price.toLocaleString()}
                  </p>

                  <p>
                    <strong>Registration Deadline:</strong>{" "}
                    {selectedCohort.registrationDeadline}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    <span className="badge bg-success">
                      {selectedCohort.status}
                    </span>
                  </p>

                  <hr />

                  <p>
                    <strong>Description:</strong> {selectedCohort.description}
                  </p>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Close
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
