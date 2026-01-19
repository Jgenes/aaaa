import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import DataTable from "react-data-table-component";
import { FaEye, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import api from "../../api/axio";

export default function ProviderCohorts() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [filterText, setFilterText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    api
      .get(`/courses/${courseId}/cohorts`)
      .then((res) => {
        setData(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to load cohorts:", err);
      });
  }, [courseId]);

  const filteredData = data.filter(
    (item) =>
      item.intakeName?.toLowerCase().includes(filterText.toLowerCase()) ||
      item.courseName?.toLowerCase().includes(filterText.toLowerCase()),
  );

  const handleView = (cohort) => {
    setSelectedCohort(cohort);
    setShowModal(true);
  };

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
    {
      name: "Remaining",
      selector: (row) => row.capacity - row.enrolled,
      sortable: true,
    },
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

          <div className="d-flex gap-2">
            <input
              type="text"
              placeholder="Search..."
              className="form-control w-auto"
              style={{ minWidth: "200px" }}
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <button
              onClick={() => navigate(`/provider/cohorts/create/${courseId}`)}
              className="btn btn-sm btn-success d-flex align-items-center gap-1 addCohortBtn"
            >
              <FaPlus />
              Add Cohort
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          highlightOnHover
          striped
        />

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
                    <strong>Remaining Seats:</strong>{" "}
                    {selectedCohort.capacity - selectedCohort.enrolled}
                  </p>
                  <p>
                    <strong>Price:</strong> TZS{" "}
                    {selectedCohort.price?.toLocaleString()}
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
