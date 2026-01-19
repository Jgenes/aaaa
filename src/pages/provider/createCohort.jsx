import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import api from "../../api/axio";

export default function CreateCohort() {
  const navigate = useNavigate();
  const { courseId } = useParams(); // ← GET COURSE ID

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCohort({ ...cohort, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      console.log("Sending payload:", payload); // Debug log
      console.log("Course ID:", courseId); // Debug log

      // await api.post(`/courses/${courseId}/cohorts`, payload);
      await api.post(`/courses/${courseId}/cohorts`, payload);

      alert("Cohort created successfully!");

      navigate(`/provider/courses/${courseId}/cohorts`); // Redirect to cohort list
    } catch (err) {
      console.error("Submit Error:", err.response?.data || err);
      alert("Failed to create cohort!");
    }
  };

  return (
    <ProviderDashboardLayout title="Create New Cohort">
      <div className="container mt-4">
        <button
          className="btn btn-sm btn-outline-secondary mb-3"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="card p-4 shadow-sm">
          <h5 className="mb-4">Add New Cohort</h5>
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

            <button type="submit" className="btn btn-success btnCV">
              Create Cohort
            </button>
          </form>
        </div>
      </div>
    </ProviderDashboardLayout>
  );
}
