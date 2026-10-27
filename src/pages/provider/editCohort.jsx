import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaInfoCircle, FaEdit } from "react-icons/fa";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import api from "../../api/axio";
import "react-toastify/dist/ReactToastify.css";

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

        // Function ya kurekebisha tarehe kwa ajili ya input fields
        const formatDate = (dateString) => {
          if (!dateString) return "";
          return new Date(dateString).toISOString().split("T")[0];
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
          status: data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase() : "Open",
          description: data.description || "",
        });
      } catch (err) {
        toast.error("Failed to load cohort data");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (courseId && cohortId) fetchCohort();
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

      await api.put(`/courses/${courseId}/cohorts/${cohortId}`, payload);
      toast.success("✓ Cohort updated successfully!");
      
      setTimeout(() => navigate(`/provider/cohorts/${courseId}`), 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update cohort!";
      toast.error(`✗ ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProviderDashboardLayout title="Loading...">
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "400px" }}>
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p className="text-muted">Fetching intake details...</p>
        </div>
      </ProviderDashboardLayout>
    );
  }

  return (
    <ProviderDashboardLayout title="Edit Intake Details">
      <ToastContainer position="top-right" theme="colored" />
      

      <div className="th-form-narrow">
        {/* Header */}
        <div className="mb-4">
          <button className="btn btn-link text-decoration-none text-muted p-0 mb-2 small d-flex align-items-center gap-2" onClick={() => navigate(-1)}>
            <FaArrowLeft size={12} /> Discard Changes
          </button>
          <h3 className="fw-bold" style={{ color: "var(--th-primary)" }}>Modify Cohort</h3>
          <p className="text-muted small">Update settings for <strong>{cohort.intakeName}</strong></p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section 1: Basic Info */}
          <div className="form-section shadow-sm">
            <div className="section-title">
              <FaInfoCircle /> Basic Information
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="intakeName">Intake Name</label>
              <input id="intakeName" type="text" className="form-control" name="intakeName" value={cohort.intakeName} onChange={handleChange} required />
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="startDate">Start Date</label>
                <input id="startDate" type="date" className="form-control" name="startDate" value={cohort.startDate} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="endDate">End Date</label>
                <input id="endDate" type="date" className="form-control" name="endDate" value={cohort.endDate} onChange={handleChange} required />
              </div>
            </div>
          </div>

          {/* Section 2: Logistics */}
          <div className="form-section shadow-sm">
            <div className="section-title">
              <FaMapMarkerAlt /> Training Logistics
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="mode">Mode of Study</label>
                <select id="mode" className="form-select" name="mode" value={cohort.mode} onChange={handleChange}>
                  <option value="Online">Online</option>
                  <option value="Physical">Physical</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="schedule">Schedule</label>
                <input id="schedule" type="text" className="form-control" name="schedule" value={cohort.schedule} onChange={handleChange} required />
              </div>
            </div>

            {cohort.mode !== "Online" && (
              <div className="mb-3">
                <label className="form-label" htmlFor="venue">Physical Venue</label>
                <input id="venue" type="text" className="form-control" name="venue" value={cohort.venue} onChange={handleChange} placeholder="Room number or Building" />
              </div>
            )}

            {cohort.mode !== "Physical" && (
              <div className="mb-3">
                <label className="form-label" htmlFor="onlineLink">Class Link (Zoom/Meet)</label>
                <input id="onlineLink" type="url" className="form-control" name="onlineLink" value={cohort.onlineLink} onChange={handleChange} placeholder="https://..." />
              </div>
            )}
          </div>

          {/* Section 3: Capacity & Pricing */}
          <div className="form-section shadow-sm">
            <div className="section-title">
              <FaUsers /> Capacity & Pricing
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label" htmlFor="capacity">Max Capacity</label>
                <div className="input-group">
                  <input id="capacity" type="number" className="form-control" name="capacity" value={cohort.capacity} onChange={handleChange} required />
                  <span className="input-group-text small">Seats</span>
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label" htmlFor="price">Price (TZS)</label>
                <input id="price" type="number" className="form-control" name="price" value={cohort.price} onChange={handleChange} required />
              </div>
              <div className="col-md-4">
                <label className="form-label" htmlFor="status">Current Status</label>
                <select id="status" className="form-select" name="status" value={cohort.status} onChange={handleChange}>
                  <option value="Open">Open</option>
                  <option value="Full">Full</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="registrationDeadline">Registration Deadline</label>
              <div className="input-group">
                <span className="input-group-text"><FaCalendarAlt /></span>
                <input id="registrationDeadline" type="date" className="form-control" name="registrationDeadline" value={cohort.registrationDeadline} onChange={handleChange} required />
              </div>
            </div>
            <div className="mb-0">
              <label className="form-label" htmlFor="description">Additional Description</label>
              <textarea id="description" className="form-control" name="description" rows={3} value={cohort.description} onChange={handleChange}></textarea>
            </div>
          </div>

          {/* Actions */}
          <div className="d-flex gap-3 mt-4">
            <button type="button" className="btn btn-light px-4 fw-bold" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn-update d-flex align-items-center justify-content-center gap-2" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  Saving Changes...
                </>
              ) : (
                <>
                  <FaEdit /> Update Cohort
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ProviderDashboardLayout>
  );
}