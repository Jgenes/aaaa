import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { FaArrowLeft, FaSave, FaImage, FaInfoCircle, FaListUl } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import api from "../../api/axio";

export default function EditCourse() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [course, setCourse] = useState({
    title: "",
    category: "",
    mode: "Online",
    shortDescription: "",
    longDescription: "",
    learningOutcomes: "",
    requirements: "",
    skills: "",
    banner: null,
    status: "Draft",
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/courses/${id}`);
        const data = response.data;

        setCourse({
          title: data.title || "",
          category: data.category || "",
          mode: data.mode || "Online",
          shortDescription: data.short_description || "",
          longDescription: data.long_description || "",
          learningOutcomes: Array.isArray(data.learning_outcomes) ? data.learning_outcomes.join("\n") : data.learning_outcomes || "",
          requirements: Array.isArray(data.requirements) ? data.requirements.join("\n") : data.requirements || "",
          skills: Array.isArray(data.skills) ? data.skills.join("\n") : data.skills || "",
          banner: data.banner || null,
          status: data.status || "Draft",
        });

        if (data.banner) {
          setPreviewImage(`http://localhost:8000/${data.banner}`);
        }
      } catch (err) {
        toast.error("Failed to load course data");
        navigate("/provider/course");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse({ ...course, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourse({ ...course, banner: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", course.title);
      formData.append("category", course.category);
      formData.append("mode", course.mode);
      formData.append("short_description", course.shortDescription);
      formData.append("long_description", course.longDescription);
      formData.append("status", course.status);
      formData.append("learning_outcomes", JSON.stringify(course.learningOutcomes.split("\n").filter((i) => i.trim())));
      formData.append("requirements", JSON.stringify(course.requirements.split("\n").filter((i) => i.trim())));
      formData.append("skills", JSON.stringify(course.skills.split("\n").filter((i) => i.trim())));

      if (course.banner && typeof course.banner !== "string") {
        formData.append("banner", course.banner);
      }
      formData.append("_method", "PUT");

      await api.post(`/courses/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Training updated successfully!");
      setTimeout(() => navigate("/provider/course"), 1500);
    } catch (err) {
      toast.error("Failed to update course!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <ProviderDashboardLayout title="Loading...">
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="spinner-border text-primary"></div>
      </div>
    </ProviderDashboardLayout>
  );

  return (
    <ProviderDashboardLayout title="Edit Training">
      <ToastContainer position="top-right" theme="colored" />
      
      <style>{`
        .edit-card { background: #fff; border-radius: 12px; border: 1px solid #edf2f7; padding: 25px; }
        .form-label { font-weight: 600; color: #4a5568; font-size: 14px; }
        .form-control, .form-select { border-radius: 8px; border: 1px solid #e2e8f0; padding: 10px 12px; }
        .form-control:focus { border-color: #0a2e67; box-shadow: 0 0 0 3px rgba(10,46,103,0.1); }
        .section-title { font-size: 15px; font-weight: 700; color: #0a2e67; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; border-bottom: 2px solid #f8fafc; padding-bottom: 10px; }
        .image-preview-box { width: 100%; height: 200px; border-radius: 10px; border: 2px dashed #e2e8f0; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #f8fafc; }
        .image-preview-box img { width: 100%; height: 100%; object-fit: cover; }
      `}</style>

      <div className="container py-4">
        <button className="btn btn-link text-decoration-none text-muted p-0 mb-4 d-flex align-items-center gap-2" onClick={() => navigate(-1)}>
          <FaArrowLeft size={12} /> Back to List
        </button>

        <form onSubmit={handleSubmit}>
          <div className="row">
            {/* Left Side: Main Content */}
            <div className="col-lg-8">
              <div className="edit-card shadow-sm mb-4">
                <div className="section-title"><FaInfoCircle /> General Information</div>
                <div className="mb-3">
                  <label className="form-label">Training Title *</label>
                  <input type="text" className="form-control" name="title" value={course.title} onChange={handleChange} required placeholder="e.g. Advanced System Analysis" />
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Category *</label>
                    <input type="text" className="form-control" name="category" value={course.category} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Delivery Mode *</label>
                    <select className="form-select" name="mode" value={course.mode} onChange={handleChange}>
                      <option>Online</option>
                      <option>Offline</option>
                      <option>Hybrid</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Short Summary *</label>
                  <textarea className="form-control" name="shortDescription" value={course.shortDescription} onChange={handleChange} rows="2" required />
                </div>

                <div className="mb-0">
                  <label className="form-label">Detailed Description *</label>
                  <textarea className="form-control" name="longDescription" value={course.longDescription} onChange={handleChange} rows="6" required />
                </div>
              </div>

              <div className="edit-card shadow-sm">
                <div className="section-title"><FaListUl /> Course Highlights</div>
                <div className="row">
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Learning Outcomes (One per line)</label>
                    <textarea className="form-control" name="learningOutcomes" value={course.learningOutcomes} onChange={handleChange} rows="4" placeholder="What will they learn?" />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Requirements</label>
                    <textarea className="form-control" name="requirements" value={course.requirements} onChange={handleChange} rows="4" placeholder="Prerequisites..." />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Skills Gained</label>
                    <textarea className="form-control" name="skills" value={course.skills} onChange={handleChange} rows="4" placeholder="e.g. React, Laravel..." />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Media & Actions */}
            <div className="col-lg-4">
              <div className="edit-card shadow-sm mb-4">
                <div className="section-title"><FaImage /> Media Assets</div>
                <div className="image-preview-box mb-3">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" />
                  ) : (
                    <div className="text-muted small">No image selected</div>
                  )}
                </div>
                <label className="form-label">Change Banner Image</label>
                <input type="file" className="form-control" onChange={handleFileChange} accept="image/*" />
              </div>

              <div className="edit-card shadow-sm">
                <div className="section-title">Publishing</div>
                <div className="mb-4 text-center p-3 rounded bg-light border">
                   <small className="text-muted d-block mb-2">Current Status</small>
                   <span className="badge bg-primary px-3 py-2">{course.status}</span>
                </div>
                <button type="submit" className="btn btn-primary w-100 mb-2 py-2 d-flex align-items-center justify-content-center gap-2" disabled={submitting}>
                  {submitting ? <span className="spinner-border spinner-border-sm"></span> : <FaSave />} Save Changes
                </button>
                <button type="button" className="btn btn-outline-secondary w-100 py-2" onClick={() => navigate(-1)}>
                  Discard
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </ProviderDashboardLayout>
  );
}