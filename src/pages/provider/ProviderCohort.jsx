import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import DataTable from "react-data-table-component";
import { FaEye, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import api from "../../api/axio";
import { extractList, formatDate, normaliseCohort } from "../../api/catalogue";
import { deleteCohort } from "../../api/courseServices";

/**
 * Cohort browser.
 *
 * • /provider/cohorts            → every cohort owned by the provider
 *                                  (GET /provider/all-cohorts)
 * • /provider/cohorts/:courseId  → cohorts of one course
 *                                  (GET /courses/:id/cohorts)
 *
 * The API field names are snake_case: `intake_name`, `seats_taken`,
 * `registration_deadline`, `course_title`…
 */
export default function ProviderCohorts() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [filterText, setFilterText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCohorts = async () => {
    setLoading(true);
    try {
      const res = courseId
        ? await api.get(`/courses/${courseId}/cohorts`)
        : await api.get("/provider/all-cohorts");

      const list = extractList(res.data)
        .map(normaliseCohort)
        .filter(Boolean);

      setData(list);
    } catch (err) {
      console.error("Failed to load cohorts:", err);
      toast.error("We could not load cohorts.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCohorts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const filteredData = data.filter((item) =>
    [item.intake_name, item.course_title, item.course?.title, item.start_date]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(filterText.toLowerCase()))
  );

  const handleDelete = async (cohort) => {
    if (!window.confirm(`Delete "${cohort.intake_name}"?`)) return;

    try {
      await deleteCohort(cohort.course_id || courseId, cohort.id);
      toast.success("Cohort deleted.");
      loadCohorts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete this cohort.");
    }
  };

  const columns = [
    { name: "ID", selector: (row) => row.id, width: "70px" },
    { name: "Intake name", selector: (row) => row.intake_name, sortable: true },
    {
      name: "Course",
      selector: (row) => row.course_title || row.course?.title || "—",
      sortable: true,
    },
    {
      name: "Starts",
      selector: (row) => row.start_date,
      cell: (row) => formatDate(row.start_date),
      sortable: true,
    },
    {
      name: "Seats",
      cell: (row) => `${row.seats_taken} / ${row.capacity || "—"}`,
    },
    {
      name: "Remaining",
      selector: (row) => row.remaining_seats,
      sortable: true,
    },
    {
      name: "Price",
      selector: (row) => row.price,
      cell: (row) => `TZS ${Number(row.price || 0).toLocaleString()}`,
    },
    {
      name: "Status",
      cell: (row) => {
        const tone =
          row.status === "OPEN"
            ? "bg-success"
            : row.status === "FULL"
              ? "bg-warning text-dark"
              : "bg-secondary";
        return <span className={`badge ${tone}`}>{row.status || "—"}</span>;
      },
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-info"
            aria-label={`View ${row.intake_name}`}
            onClick={() => {
              setSelectedCohort(row);
              setShowModal(true);
            }}
          >
            <FaEye color="white" />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            aria-label={`Edit ${row.intake_name}`}
            onClick={() =>
              navigate(
                `/provider/cohorts/${row.course_id || courseId}/${row.id}/edit`
              )
            }
          >
            <FaEdit color="white" />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-danger"
            aria-label={`Delete ${row.intake_name}`}
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
      <ToastContainer position="top-right" />
      <div>
        <div className="d-flex justify-content-between mb-2">
          <h2 className="h5 mb-0">Cohorts</h2>
          <div className="d-flex gap-2">
            <input
              aria-label="Search cohorts"
              type="text"
              placeholder="Search…"
              className="form-control w-auto"
              style={{ minWidth: "200px" }}
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            {courseId && (
              <button
                type="button"
                onClick={() => navigate(`/provider/cohorts/create/${courseId}`)}
                className="btn btn-sm btn-success d-flex align-items-center gap-1 addCohortBtn"
              >
                <FaPlus /> Add cohort
              </button>
            )}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          highlightOnHover
          responsive
          progressPending={loading}
          noDataComponent={
            <div className="p-4 text-muted">
              No cohorts found. Pick a course from Trainings to open an intake.
            </div>
          }
        />

        {showModal && selectedCohort && (
          <div
            className="modal fade show d-block th-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cohort-modal-title"
          >
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 className="modal-title h5" id="cohort-modal-title">
                    {selectedCohort.intake_name}
                  </h2>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close cohort details"
                    onClick={() => setShowModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <p>
                    <strong>Course:</strong>{" "}
                    {selectedCohort.course_title || selectedCohort.course?.title || "—"}
                  </p>
                  <p>
                    <strong>Dates:</strong> {formatDate(selectedCohort.start_date)} –{" "}
                    {formatDate(selectedCohort.end_date)}
                  </p>
                  <p>
                    <strong>Schedule:</strong> {selectedCohort.schedule_text || "—"}
                  </p>
                  <p>
                    <strong>Venue:</strong> {selectedCohort.venue || "—"}
                  </p>
                  {selectedCohort.online_link && (
                    <p>
                      <strong>Online link:</strong>{" "}
                      <a
                        href={selectedCohort.online_link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Join class
                      </a>
                    </p>
                  )}
                  <hr />
                  <p>
                    <strong>Seats taken:</strong> {selectedCohort.seats_taken} of{" "}
                    {selectedCohort.capacity || "—"} ({selectedCohort.remaining_seats}{" "}
                    remaining)
                  </p>
                  <p>
                    <strong>Price:</strong> TZS{" "}
                    {Number(selectedCohort.price || 0).toLocaleString()}
                  </p>
                  <p>
                    <strong>Registration deadline:</strong>{" "}
                    {formatDate(selectedCohort.registration_deadline)}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className="badge bg-success">{selectedCohort.status}</span>
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
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
