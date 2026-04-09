import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../api/axio";

export default function CreateCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [course, setCourse] = useState({
    title: "", category: "", mode: "Online", shortDescription: "",
    longDescription: "", learningOutcomes: [""], skills: [""],
    requirements: [""], banner: null,
    contents: [
      { title: "", description: "", video: null, handouts: [], video_links: [""], notes_text: "" }
    ],
  });

  // --- Handlers ---
  const handleChange = (e) => setCourse({ ...course, [e.target.name]: e.target.value });

  const handleArrayChange = (field, index, value) => {
    const updated = [...course[field]];
    updated[index] = value;
    setCourse({ ...course, [field]: updated });
  };

  const addArrayItem = (field) => setCourse({ ...course, [field]: [...course[field], ""] });
  const removeArrayItem = (field, index) => {
    const updated = [...course[field]];
    updated.splice(index, 1);
    setCourse({ ...course, [field]: updated });
  };

  const handleContentChange = (index, field, value) => {
    const updated = [...course.contents];
    updated[index][field] = value;
    setCourse({ ...course, contents: updated });
  };

  const addVideoLink = (sectionIndex) => {
    const updated = [...course.contents];
    updated[sectionIndex].video_links.push("");
    setCourse({ ...course, contents: updated });
  };

  const handleVideoLinkChange = (sectionIndex, linkIndex, value) => {
    const updated = [...course.contents];
    updated[sectionIndex].video_links[linkIndex] = value;
    setCourse({ ...course, contents: updated });
  };

  const addContent = () => {
    setCourse({
      ...course,
      contents: [...course.contents, { title: "", description: "", video: null, handouts: [], video_links: [""], notes_text: "" }]
    });
  };

  const removeContent = (index) => {
    const updated = [...course.contents];
    updated.splice(index, 1);
    setCourse({ ...course, contents: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", course.title);
      formData.append("category", course.category);
      formData.append("mode", course.mode);
      formData.append("short_description", course.shortDescription);
      formData.append("long_description", course.longDescription);
      formData.append("status", "Draft");

      course.learningOutcomes.forEach((item, idx) => item && formData.append(`learning_outcomes[${idx}]`, item));
      course.skills.forEach((item, idx) => item && formData.append(`skills[${idx}]`, item));
      course.requirements.forEach((item, idx) => item && formData.append(`requirements[${idx}]`, item));

      course.contents.forEach((content, idx) => {
        formData.append(`contents[${idx}][title]`, content.title);
        formData.append(`contents[${idx}][description]`, content.description || "");
        formData.append(`contents[${idx}][notes_text]`, content.notes_text || "");
        if (content.video instanceof File) formData.append(`contents[${idx}][video]`, content.video);
        content.video_links.forEach((link, lIdx) => link && formData.append(`contents[${idx}][video_links][${lIdx}]`, link));
        if (content.handouts && content.handouts.length > 0) {
          Array.from(content.handouts).forEach((file, fIdx) => formData.append(`contents[${idx}][handouts][${fIdx}]`, file));
        }
      });

      if (course.banner instanceof File) formData.append("banner", course.banner);

      const response = await api.post("/courses", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data && response.data.course) {
        toast.success("Course created successfully!");
        navigate(`/provider/cohorts/${response.data.course.id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Check your form for errors.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProviderDashboardLayout title="Create Training">
      <ToastContainer position="top-right" />
      
      <style>{`
        .form-card { border: none; border-radius: 16px; background: #fff; box-shadow: 0 10px 40px rgba(0,0,0,0.04); }
        .custom-input { padding: 12px 15px; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 14px; transition: 0.3s; background: #fcfcfc; }
        .custom-input:focus { border-color: #0a2e67; box-shadow: 0 0 0 4px rgba(10, 46, 103, 0.05); outline: none; background: #fff; }
        .form-label-custom { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: block; }
        .section-card { background: #f8fafc; border: 1px solid #edf2f7; border-radius: 14px; padding: 25px; margin-bottom: 25px; position: relative; }
        .btn-navy { background-color: #0a2e67; color: white; font-weight: 700; border-radius: 10px; padding: 14px 30px; border: none; transition: 0.3s; }
        .btn-navy:hover { background-color: #082452; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(10, 46, 103, 0.2); }
        .add-btn { font-size: 12px; font-weight: 700; color: #0a2e67; background: none; border: none; padding: 0; }
        .badge-section { background: #e0e7ff; color: #0a2e67; font-size: 10px; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; }
      `}</style>

      <div className="container py-4">
        <button className="btn btn-sm text-muted mb-4 p-0 border-0" onClick={() => navigate(-1)}>
          <i className="bi bi-chevron-left me-1"></i> Back
        </button>

        <form onSubmit={handleSubmit} className="form-card p-4 p-md-5">
          <header className="mb-5">
            <h2 className="fw-bold" style={{ color: "#0a2e67", fontSize: "24px" }}>Create New Training</h2>
            <p className="text-muted small">Fill out the details below to set up your training program and curriculum.</p>
          </header>

          <section className="row g-4 mb-5">
            <div className="col-12">
              <label className="form-label-custom">Training Title</label>
              <input type="text" className="form-control custom-input w-100" name="title" value={course.title} onChange={handleChange} placeholder="e.g. Professional Web Development" required />
            </div>
            <div className="col-md-6">
              <label className="form-label-custom">Category</label>
              <input type="text" className="form-control custom-input" name="category" value={course.category} onChange={handleChange} placeholder="e.g. IT & Software" required />
            </div>
            <div className="col-md-6">
              <label className="form-label-custom">Delivery Mode</label>
              <select className="form-select custom-input" name="mode" value={course.mode} onChange={handleChange}>
                <option value="Online">Online</option>
                <option value="Physical">Physical</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label-custom">Short Summary</label>
              <textarea className="form-control custom-input" name="shortDescription" rows="2" value={course.shortDescription} onChange={handleChange} required />
            </div>
            <div className="col-12">
              <label className="form-label-custom">Detailed Description</label>
              <textarea className="form-control custom-input" name="longDescription" rows="5" value={course.longDescription} onChange={handleChange} required />
            </div>
          </section>

          <div className="row g-4 mb-5">
            {["learningOutcomes", "skills", "requirements"].map((field) => (
              <div className="col-md-4" key={field}>
                <label className="form-label-custom">{field.replace(/([A-Z])/g, " $1")}</label>
                {course[field].map((item, idx) => (
                  <div key={idx} className="d-flex gap-2 mb-2">
                    <input type="text" className="form-control custom-input form-control-sm" value={item} onChange={(e) => handleArrayChange(field, idx, e.target.value)} required />
                    {course[field].length > 1 && (
                      <button type="button" className="btn btn-sm text-danger border-0" onClick={() => removeArrayItem(field, idx)}><i className="bi bi-x-circle-fill"></i></button>
                    )}
                  </div>
                ))}
                <button type="button" className="add-btn" onClick={() => addArrayItem(field)}>+ ADD ITEM</button>
              </div>
            ))}
          </div>

          <hr className="my-5" />

          <section className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-bold" style={{ color: "#0a2e67", fontSize: "18px" }}>Curriculum Content</h3>
              <button type="button" className="btn btn-sm btn-outline-primary fw-bold rounded-pill px-3" onClick={addContent}>+ Add Section</button>
            </div>

            {course.contents.map((content, idx) => (
              <div key={idx} className="section-card">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <span className="badge-section">Section {idx + 1}</span>
                  <button type="button" className="btn btn-sm text-danger p-0 border-0" onClick={() => removeContent(idx)}><i className="bi bi-trash3 me-1"></i> Remove</button>
                </div>
                
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label-custom">Lesson Title</label>
                    <input type="text" className="form-control custom-input" value={content.title} onChange={(e) => handleContentChange(idx, "title", e.target.value)} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">Main Video</label>
                    <input type="file" className="form-control custom-input" accept="video/*" onChange={(e) => handleContentChange(idx, "video", e.target.files[0])} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">Handouts (PDFs)</label>
                    <input type="file" className="form-control custom-input" multiple accept=".pdf" onChange={(e) => handleContentChange(idx, "handouts", e.target.files)} />
                  </div>
                  <div className="col-12">
                    <label className="form-label-custom">Video Links</label>
                    {content.video_links.map((vLink, lIdx) => (
                      <input key={lIdx} type="url" className="form-control custom-input mb-2" placeholder="Paste YouTube/Vimeo link" value={vLink} onChange={(e) => handleVideoLinkChange(idx, lIdx, e.target.value)} />
                    ))}
                    <button type="button" className="add-btn" onClick={() => addVideoLink(idx)}>+ ADD ANOTHER LINK</button>
                  </div>
                  <div className="col-12">
                    <label className="form-label-custom">Detailed Lesson Notes</label>
                    <textarea className="form-control custom-input" rows="4" value={content.notes_text} onChange={(e) => handleContentChange(idx, "notes_text", e.target.value)} placeholder="Enter full text content for this lesson..." />
                  </div>
                </div>
              </div>
            ))}
          </section>

          <div className="mb-5">
            <label className="form-label-custom">Training Banner Image</label>
            <div className="p-4 border-2 border-dashed rounded-4 text-center bg-light" style={{ borderStyle: 'dashed', borderColor: '#cbd5e1' }}>
              <input type="file" className="form-control custom-input mb-2" accept="image/*" onChange={(e) => setCourse({ ...course, banner: e.target.files[0] })} />
              <small className="text-muted">High resolution images (1200x600px) work best.</small>
            </div>
          </div>

          <div className="d-grid pt-4 mt-4 border-top">
            <button type="submit" className="btn btn-navy" disabled={loading}>
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span> Finalizing Course...</>
              ) : "Create Course & Continue to Cohorts"}
            </button>
          </div>
        </form>
      </div>
    </ProviderDashboardLayout>
  );
}