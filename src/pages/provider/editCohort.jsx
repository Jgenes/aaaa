import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import api from "../../api/axio";

export default function EditCohort() {
  const navigate = useNavigate();
  const { courseId, cohortId } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [cohort, setCohort] = useState({
    intakeName: "",
    startDate: "",
    endDate: "",
    schedule: "",
    mode: "Online",
    venue: "",
    onlineLink: "",
    capacity: 0,
    price: 0,
    registrationDeadline: "",
    status: "Open",
    description: "",
  });

  // Fetch cohort data on mount
  useEffect(() => {
    const fetchCohort = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/courses/${courseId}/cohorts/${cohortId}`);
        const data = response.data;

        // Format dates from API response
        const formatDate = (dateString) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          return date.toISOString().split("T")[0];
        };

        setCohort({
          intakeName: data.intake_name || "",
          startDate: formatDate(data.start_date),
          endDate: formatDate(data.end_date),
          schedule: data.schedule_text || "",
          mode: data.mode || "Online",
          venue: data.venue || "",
          onlineLink: data.online_link || "",
          capacity: data.capacity || 0,
          price: data.price || 0,
          registrationDeadline: formatDate(data.registration_deadline),
          status: data.status || "Open",
          description: data.description || "",
        });
      } catch (err) {
        console.error("Error fetching cohort:", err);
        toast.error("Failed to load cohort data");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (courseId && cohortId) {
      fetchCohort();
    }
  }, [courseId, cohortId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCohort({ ...cohort, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        intake_name: cohort.intakeName,
        start_date: cohort.startDate,
        end_date: cohort.endDate,
        schedule_text: cohort.schedule,
        mode: cohort.mode,
        venue: cohort.venue,
        online_link: cohort.onlineLink,
        capacity: parseInt(cohort.capacity) || 0,
        price: parseFloat(cohort.price) || 0,
        registration_deadline: cohort.registrationDeadline,
        status: cohort.status.toUpperCase(),
        description: cohort.description,
      };

      console.log("Updating cohort with payload:", payload);

      await api.put(`/courses/${courseId}/cohorts/${cohortId}`, payload);

      toast.success("✓ Cohort updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });

      // Small delay before navigation
      setTimeout(() => {
        navigate(`/provider/courses/${courseId}/cohorts`);
      }, 1000);
    } catch (err) {
      console.error("Submit Error:", err.response?.data || err);

      const errorMessage = err.response?.data?.message || "Failed to update cohort!";
      toast.error(`✗ ${errorMessage}`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProviderDashboardLayout title="Loading...">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <div className="spinner-border text-primary"></div>
        </div>
      </ProviderDashboardLayout>
    );
  }

  return (
    <ProviderDashboardLayout title="Edit Cohort">
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
        <button
          className="btn btn-sm btn-outline-secondary mb-3"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="card p-4 shadow-sm">
          <h5 className="mb-4">Edit Cohort</h5>
          <form onSubmit={handleSubmit}>
            {/* Intake Name */}
            <div className="mb-3">
              <label className="form-label">Intake Name</label>
              <input
                type="text"
                className="form-control"
                name="intakeName"
                value={cohort.intakeName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Dates */}
            <div className="row mb-3">
              <div className="col">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="startDate"
                  value={cohort.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="endDate"
                  value={cohort.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Schedule */}
            <div className="mb-3">
              <label className="form-label">Schedule</label>
              <input
                type="text"
                className="form-control"
                name="schedule"
                value={cohort.schedule}
                onChange={handleChange}
                placeholder="e.g., Mon – Fri | 6pm – 8pm"
                required
              />
            </div>

            {/* Mode */}
            <div className="mb-3">
              <label className="form-label">Mode</label>
              <select
                className="form-select"
                name="mode"
                value={cohort.mode}
                onChange={handleChange}
              >
                <option value="Online">Online</option>
                <option value="Physical">Physical</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            {cohort.mode === "Physical" && (
              <div className="mb-3">
                <label className="form-label">Venue</label>
                <input
                  type="text"
                  className="form-control"
                  name="venue"
                  value={cohort.venue}
                  onChange={handleChange}
                  placeholder="Physical location"
                />
              </div>
            )}

            {cohort.mode === "Online" && (
              <div className="mb-3">
                <label className="form-label">Online Link</label>
                <input
                  type="text"
                  className="form-control"
                  name="onlineLink"
                  value={cohort.onlineLink}
                  onChange={handleChange}
                  placeholder="Zoom / Google Meet link"
                />
              </div>
            )}

            {/* Capacity & Price */}
            <div className="row mb-3">
              <div className="col">
                <label className="form-label">Capacity (Seats)</label>
                <input
                  type="number"
                  className="form-control"
                  name="capacity"
                  value={cohort.capacity}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col">
                <label className="form-label">Price (TZS)</label>
                <input
                  type="number"
                  className="form-control"
                  name="price"
                  value={cohort.price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Deadline */}
            <div className="mb-3">
              <label className="form-label">Registration Deadline</label>
              <input
                type="date"
                className="form-control"
                name="registrationDeadline"
                value={cohort.registrationDeadline}
                onChange={handleChange}
                required
              />
            </div>

            {/* Status */}
            <div className="mb-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                name="status"
                value={cohort.status}
                onChange={handleChange}
              >
                <option value="Open">Open</option>
                <option value="Full">Full</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                name="description"
                rows={4}
                value={cohort.description}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btnCV"
              disabled={submitting}
            >
              {submitting ? "Updating..." : "Update Cohort"}
            </button>
          </form>
        </div>
      </div>
    </ProviderDashboardLayout>
  );
}
