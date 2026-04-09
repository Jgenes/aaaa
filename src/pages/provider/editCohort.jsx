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
      
      <style>{`
        .form-section { background: #fff; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #edf2f7; }
        .section-title { font-size: 14px; font-weight: 700; color: #0a2e67; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
        .form-label { font-weight: 600; color: #4a5568; font-size: 13px; }
        .form-control, .form-select { border-radius: 8px; padding: 10px 15px; border: 1px solid #e2e8f0; font-size: 14px; }
        .form-control:focus { border-color: #0a2e67; box-shadow: 0 0 0 3px rgba(10,46,103,0.1); }
        .btn-update { background: #0a2e67; color: white; border: none; padding: 12px 30px; border-radius: 10px; font-weight: 700; transition: 0.3s; width: 100%; }
        .btn-update:hover:not(:disabled) { background: #082452; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(10,46,103,0.15); }
        .input-group-text { background: #f8fafc; border-color: #e2e8f0; color: #64748b; }
      `}</style>

      <div className="container py-4" style={{ maxWidth: "800px" }}>
        {/* Header */}
        <div className="mb-4">
          <button className="btn btn-link text-decoration-none text-muted p-0 mb-2 small d-flex align-items-center gap-2" onClick={() => navigate(-1)}>
            <FaArrowLeft size={12} /> Discard Changes
          </button>
          <h3 className="fw-bold" style={{ color: "#0a2e67" }}>Modify Cohort</h3>
          <p className="text-muted small">Update settings for <strong>{cohort.intakeName}</strong></p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section 1: Basic Info */}
          <div className="form-section shadow-sm">
            <div className="section-title">
              <FaInfoCircle /> Basic Information
            </div>
            <div className="mb-3">
              <label className="form-label">Intake Name</label>
              <input type="text" className="form-control" name="intakeName" value={cohort.intakeName} onChange={handleChange} required />
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Start Date</label>
                <input type="date" className="form-control" name="startDate" value={cohort.startDate} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">End Date</label>
                <input type="date" className="form-control" name="endDate" value={cohort.endDate} onChange={handleChange} required />
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
                <label className="form-label">Mode of Study</label>
                <select className="form-select" name="mode" value={cohort.mode} onChange={handleChange}>
                  <option value="Online">Online</option>
                  <option value="Physical">Physical</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Schedule</label>
                <input type="text" className="form-control" name="schedule" value={cohort.schedule} onChange={handleChange} required />
              </div>
            </div>

            {cohort.mode !== "Online" && (
              <div className="mb-3">
                <label className="form-label">Physical Venue</label>
                <input type="text" className="form-control" name="venue" value={cohort.venue} onChange={handleChange} placeholder="Room number or Building" />
              </div>
            )}

            {cohort.mode !== "Physical" && (
              <div className="mb-3">
                <label className="form-label">Class Link (Zoom/Meet)</label>
                <input type="url" className="form-control" name="onlineLink" value={cohort.onlineLink} onChange={handleChange} placeholder="https://..." />
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
                <label className="form-label">Max Capacity</label>
                <div className="input-group">
                  <input type="number" className="form-control" name="capacity" value={cohort.capacity} onChange={handleChange} required />
                  <span className="input-group-text small">Seats</span>
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label">Price (TZS)</label>
                <input type="number" className="form-control" name="price" value={cohort.price} onChange={handleChange} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Current Status</label>
                <select className="form-select" name="status" value={cohort.status} onChange={handleChange}>
                  <option value="Open">Open</option>
                  <option value="Full">Full</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Registration Deadline</label>
              <div className="input-group">
                <span className="input-group-text"><FaCalendarAlt /></span>
                <input type="date" className="form-control" name="registrationDeadline" value={cohort.registrationDeadline} onChange={handleChange} required />
              </div>
            </div>
            <div className="mb-0">
              <label className="form-label">Additional Description</label>
              <textarea className="form-control" name="description" rows={3} value={cohort.description} onChange={handleChange}></textarea>
            </div>
          </div>

          {/* Actions */}
          <div className="d-flex gap-3 mt-4">
            <button type="button" className="btn btn-light px-4 fw-bold" style={{ borderRadius: "10px" }} onClick={() => navigate(-1)}>
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