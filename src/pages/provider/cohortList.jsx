import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import DataTable from "react-data-table-component";
import { FaEye, FaPlus, FaArrowLeft, FaSync, FaEdit, FaTrash } from "react-icons/fa";
import { getCohorts, refreshCohortStatuses, deleteCohort } from "../../api/courseServices";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CohortList() {
  const { courseId } = useParams(); // Inakamata ID kutoka kwenye URL mfano: /cohortlist/4
  const navigate = useNavigate();

  const [cohorts, setCohorts] = useState([]);
  const [courseName, setCourseName] = useState(""); // Kuhifadhi jina la kozi husika
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState(null);

  // Kuvuta data pindi tu page inapofunguka
  useEffect(() => {
    fetchCohorts();
  }, [courseId]);

  const fetchCohorts = async () => {
    try {
      setLoading(true);
      console.log("Fetching cohorts for courseId:", courseId);

      // Use the API service instead of direct api call
      const response = await getCohorts(courseId);
      console.log("API Response:", response);

      // Handle different response structures
      let cohortsData = [];
      if (response.data) {
        // If response.data is an array, use it directly
        if (Array.isArray(response.data)) {
          cohortsData = response.data;
        }
        // If response.data has a data property (nested structure)
        else if (response.data.data && Array.isArray(response.data.data)) {
          cohortsData = response.data.data;
        }
        // If response.data has cohorts property
        else if (
          response.data.cohorts &&
          Array.isArray(response.data.cohorts)
        ) {
          cohortsData = response.data.cohorts;
        }
      }

      console.log("Processed cohorts data:", cohortsData);
      setCohorts(cohortsData);

      // Try to get course name from the first cohort or response
      if (cohortsData.length > 0) {
        setCourseName(
          cohortsData[0].course?.title ||
            cohortsData[0].course_name ||
            `Course #${courseId}`,
        );
      } else {
        setCourseName(`Course #${courseId}`);
      }
    } catch (error) {
      console.error("Error fetching cohorts:", error);
      console.error("Error response:", error.response?.data);
      setCohorts([]); // Ensure cohorts is empty on error
    } finally {
      setLoading(false);
    }
  };

  const filteredData = cohorts.filter((item) =>
    (item.intake_name || item.intakeName || "")
      .toLowerCase()
      .includes(filterText.toLowerCase()),
  );

  const handleView = (cohort) => {
    console.log("Selected cohort data:", cohort);
    setSelectedCohort(cohort);
    setShowModal(true);
  };

  // Refresh cohort statuses
  const handleRefreshStatuses = async () => {
    try {
      setLoading(true);
      await refreshCohortStatuses(courseId);
      // Refresh the cohorts data
      await fetchCohorts();
      alert("Cohort statuses updated successfully!");
    } catch (error) {
      console.error("Error refreshing cohort statuses:", error);
      alert("Failed to refresh cohort statuses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

    const handleDelete = async (cohort) => {
      const cohortName = cohort.intake_name || cohort.intakeName || `Cohort #${cohort.id}`;
    
      if (!window.confirm(`Are you sure you want to delete "${cohortName}"? This action cannot be undone.`)) {
        return;
      }

      try {
        await deleteCohort(courseId, cohort.id);
      
        toast.success("✓ Cohort deleted successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });

        // Refresh the cohorts list
        await fetchCohorts();
      } catch (error) {
        console.error("Error deleting cohort:", error);
        const errorMessage = error.response?.data?.message || "Failed to delete cohort!";
        toast.error(`✗ ${errorMessage}`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      }
    };

  // Calculate remaining seats
  const calculateRemainingSeats = (cohort) => {
    const enrolled = cohort.enrolled_students || cohort.enrolledStudents || 0;
    const capacity = cohort.capacity || 0;
    return Math.max(0, capacity - enrolled);
  };

  // Get cohort status with automatic updates
  const getCohortStatus = (cohort) => {
    const now = new Date();
    const deadline = new Date(
      cohort.registration_deadline || cohort.registrationDeadline,
    );
    const endDate = new Date(cohort.end_date || cohort.endDate);
    const enrolled = cohort.enrolled_students || cohort.enrolledStudents || 0;
    const capacity = cohort.capacity || 0;

    // If end date has passed, mark as ended
    if (now > endDate) {
      return "ENDED";
    }

    // If enrollment deadline has passed, mark as closed
    if (now > deadline) {
      return "CLOSED";
    }

    // If at full capacity, mark as full
    if (enrolled >= capacity) {
      return "FULL";
    }

    // Otherwise, use the stored status or default to open
    return cohort.status || "OPEN";
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status.toUpperCase()) {
      case "OPEN":
        return "bg-success";
      case "CLOSED":
        return "bg-secondary";
      case "FULL":
        return "bg-warning text-dark";
      case "ENDED":
        return "bg-dark";
      default:
        return "bg-danger";
    }
  };

  const columns = [
    { name: "ID", selector: (row) => row.id, width: "70px", sortable: true },
    {
      name: "Intake Name",
      selector: (row) => row.intake_name || row.intakeName,
      sortable: true,
    },
    {
      name: "Start Date",
      selector: (row) => row.start_date || row.startDate,
      sortable: true,
    },
    {
      name: "End Date",
      selector: (row) => row.end_date || row.endDate,
      sortable: true,
    },
    {
      name: "Capacity",
      selector: (row) => row.capacity,
      sortable: true,
    },
    {
      name: "Enrolled",
      selector: (row) => row.enrolled_students || row.enrolledStudents || 0,
      sortable: true,
    },
    {
      name: "Remaining Seats",
      selector: (row) => calculateRemainingSeats(row),
      sortable: true,
      cell: (row) => {
        const remaining = calculateRemainingSeats(row);
        const capacity = row.capacity || 0;
        const percentage =
          capacity > 0 ? ((capacity - remaining) / capacity) * 100 : 0;

        return (
          <div>
            <span className={remaining === 0 ? "text-danger fw-bold" : ""}>
              {remaining}
            </span>
            <div
              className="progress mt-1"
              style={{ height: "4px", width: "60px" }}
            >
              <div
                className={`progress-bar ${percentage >= 100 ? "bg-danger" : percentage >= 80 ? "bg-warning" : "bg-success"}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      name: "Price",
      selector: (row) => `TZS ${(row.price || 0).toLocaleString()}`,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => getCohortStatus(row),
      sortable: true,
      cell: (row) => {
        const status = getCohortStatus(row);
        return (
          <span className={`badge ${getStatusBadge(status)}`}>{status}</span>
        );
      },
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-info" onClick={() => handleView(row)}>
            <FaEye color="white" />
          </button>
          <button
            className="btn btn-sm btn-warning"
            onClick={() => navigate(`/provider/cohorts/${courseId}/${row.id}/edit`)}
            title="Edit cohort"
          >
            <FaEdit color="white" />
          </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => handleDelete(row)}
              title="Delete cohort"
            >
              <FaTrash color="white" />
            </button>
        </div>
      ),
    },
  ];

  return (
    <ProviderDashboardLayout title="Course Cohorts">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      <div className="container mt-4">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <button
              className="btn btn-sm btn-outline-secondary mb-2"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft /> Back
            </button>
            <h5 className="mb-0" style={{fontSize:"16px"}}>
              Cohorts for:{" "}
              <span className="text-primary">
                {courseName || `Course #${courseId}`}
              </span>
            </h5>
          </div>

          <div className="d-flex gap-2">
            <input
              type="text"
              placeholder="Search intake..."
              className="form-control w-auto"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            {/* <button
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
              onClick={handleRefreshStatuses}
              disabled={loading}
              title="Refresh cohort statuses"
            >
              <FaSync className={loading ? "spinning" : ""} />
              Refresh Status
            </button> */}
            <button
              className="btn btn-sm btn-success d-flex align-items-center gap-1 vvb"
              onClick={() => navigate(`/provider/cohorts/create/${courseId}`)}
            >
              <FaPlus /> Add Cohort
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="card shadow-sm">
          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            highlightOnHover
            striped
            progressPending={loading}
            noDataComponent={
              <div className="p-5">
                No cohorts found for this specific course.
              </div>
            }
          />
        </div>

        {/* VIEW COHORT MODAL */}
        {showModal && selectedCohort && (
          <div
            className="modal fade show d-block"
            style={{ background: "#00000080" }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    {selectedCohort.intake_name || selectedCohort.intakeName}
                  </h5>
                  <button
                    className="btn-close btn-close-white"
                    onClick={() => setShowModal(false)}
                  />
                </div>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6 border-end">
                      <p>
                        <strong>Start Date:</strong>{" "}
                        {selectedCohort.start_date || selectedCohort.startDate}
                      </p>
                      <p>
                        <strong>End Date:</strong>{" "}
                        {selectedCohort.end_date || selectedCohort.endDate}
                      </p>
                      <p>
                        <strong>Registration Deadline:</strong>{" "}
                        {selectedCohort.registration_deadline ||
                          selectedCohort.registrationDeadline}
                      </p>
                      <p>
                        <strong>Price:</strong> TZS{" "}
                        {(selectedCohort.price || 0).toLocaleString()}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        <span
                          className={`badge ${getStatusBadge(getCohortStatus(selectedCohort))}`}
                        >
                          {getCohortStatus(selectedCohort)}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p>
                        <strong>Capacity:</strong> {selectedCohort.capacity}{" "}
                        Students
                      </p>
                      <p>
                        <strong>Enrolled Students:</strong>{" "}
                        {selectedCohort.enrolled_students ||
                          selectedCohort.enrolledStudents ||
                          0}
                      </p>
                      <p>
                        <strong>Remaining Seats:</strong>{" "}
                        <span
                          className={
                            calculateRemainingSeats(selectedCohort) === 0
                              ? "text-danger fw-bold"
                              : "text-success fw-bold"
                          }
                        >
                          {calculateRemainingSeats(selectedCohort)}
                        </span>
                      </p>
                      <p>
                        <strong>Schedule:</strong>{" "}
                        {selectedCohort.schedule_text ||
                          selectedCohort.schedule}
                      </p>
                      <p>
                        <strong>Venue/Link:</strong>{" "}
                        {selectedCohort.venue ||
                          selectedCohort.online_link ||
                          selectedCohort.onlineLink ||
                          "N/A"}
                      </p>
                    </div>
                  </div>
                  <hr />
                  <h6 className="fw-bold mb-2">Description</h6>
                  <p className="text-muted">
                    {selectedCohort.description || 
                     selectedCohort.cohort_description ||
                     selectedCohort.intake_description ||
                     selectedCohort.notes ||
                     "No description provided."}
                  </p>
                </div>
                <div className="modal-footer bg-light">
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

      <style jsx>{`
        .spinning {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </ProviderDashboardLayout>
  );
}
