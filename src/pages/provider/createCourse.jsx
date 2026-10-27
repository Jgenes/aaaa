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
      

      <div>
        <button className="btn btn-sm text-muted mb-4 p-0 border-0" onClick={() => navigate(-1)}>
          <i className="bi bi-chevron-left me-1"></i> Back
        </button>

        <form onSubmit={handleSubmit} className="form-card p-4 p-md-5">
          <header className="mb-5">
            <h2 className="fw-bold text-primary">Create New Training</h2>
            <p className="text-muted small">Fill out the details below to set up your training program and curriculum.</p>
          </header>

          <section className="row g-4 mb-5">
            <div className="col-12">
              <label className="form-label-custom" htmlFor="title">Training Title</label>
              <input id="title" type="text" className="form-control custom-input w-100" name="title" value={course.title} onChange={handleChange} placeholder="e.g. Professional Web Development" required />
            </div>
            <div className="col-md-6">
              <label className="form-label-custom" htmlFor="category">Category</label>
              <input id="category" type="text" className="form-control custom-input" name="category" value={course.category} onChange={handleChange} placeholder="e.g. IT & Software" required />
            </div>
            <div className="col-md-6">
              <label className="form-label-custom" htmlFor="mode">Delivery Mode</label>
              <select id="mode" className="form-select custom-input" name="mode" value={course.mode} onChange={handleChange}>
                <option value="Online">Online</option>
                <option value="Physical">Physical</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label-custom" htmlFor="shortDescription">Short Summary</label>
              <textarea id="shortDescription" className="form-control custom-input" name="shortDescription" rows="2" value={course.shortDescription} onChange={handleChange} required />
            </div>
            <div className="col-12">
              <label className="form-label-custom" htmlFor="longDescription">Detailed Description</label>
              <textarea id="longDescription" className="form-control custom-input" name="longDescription" rows="5" value={course.longDescription} onChange={handleChange} required />
            </div>
          </section>

          <div className="row g-4 mb-5">
            {["learningOutcomes", "skills", "requirements"].map((field) => (
              <div className="col-md-4" key={field}>
                <div className="form-label-custom" id={`${field}-label`}>
                  {field.replace(/([A-Z])/g, " $1")}
                </div>
                {course[field].map((item, idx) => (
                  <div key={idx} className="d-flex gap-2 mb-2">
                    <input
                      type="text"
                      className="form-control custom-input form-control-sm"
                      aria-label={`${field.replace(/([A-Z])/g, " $1")} ${idx + 1}`}
                      value={item}
                      onChange={(e) => handleArrayChange(field, idx, e.target.value)}
                      required
                    />
                    {course[field].length > 1 && (
                      <button
                        type="button"
                        className="btn btn-sm text-danger border-0"
                        aria-label={`Remove ${field.replace(/([A-Z])/g, " $1").toLowerCase()} ${idx + 1}`}
                        onClick={() => removeArrayItem(field, idx)}
                      >
                        <i className="bi bi-x-circle-fill" aria-hidden="true"></i>
                      </button>
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
              <h3 className="fw-bold text-primary fs-5">Curriculum Content</h3>
              <button type="button" className="btn btn-sm btn-outline-primary fw-bold rounded-pill px-3" onClick={addContent}>+ Add Section</button>
            </div>

            {course.contents.map((content, idx) => (
              <div key={idx} className="section-card">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <span className="badge-section">Section {idx + 1}</span>
                  <button
                    type="button"
                    className="btn btn-sm text-danger p-0 border-0"
                    aria-label={`Remove section ${idx + 1}`}
                    onClick={() => removeContent(idx)}
                  >
                    <i className="bi bi-trash3 me-1" aria-hidden="true"></i> Remove
                  </button>
                </div>
                
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label-custom" htmlFor={`lesson-title-${idx}`}>Lesson Title</label>
                    <input id={`lesson-title-${idx}`} type="text" className="form-control custom-input" value={content.title} onChange={(e) => handleContentChange(idx, "title", e.target.value)} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom" htmlFor={`main-video-${idx}`}>Main Video</label>
                    <input id={`main-video-${idx}`} type="file" className="form-control custom-input" accept="video/*" onChange={(e) => handleContentChange(idx, "video", e.target.files[0])} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom" htmlFor={`handouts-${idx}`}>Handouts (PDFs)</label>
                    <input id={`handouts-${idx}`} type="file" className="form-control custom-input" multiple accept=".pdf" onChange={(e) => handleContentChange(idx, "handouts", e.target.files)} />
                  </div>
                  <div className="col-12">
                    <div className="form-label-custom" id={`video-links-label-${idx}`}>
                      Video Links
                    </div>
                    {content.video_links.map((vLink, lIdx) => (
                      <input
                        key={lIdx}
                        type="url"
                        className="form-control custom-input mb-2"
                        aria-label={`Video link ${lIdx + 1} for section ${idx + 1}`}
                        placeholder="Paste YouTube/Vimeo link"
                        value={vLink}
                        onChange={(e) => handleVideoLinkChange(idx, lIdx, e.target.value)}
                      />
                    ))}
                    <button type="button" className="add-btn" onClick={() => addVideoLink(idx)}>+ ADD ANOTHER LINK</button>
                  </div>
                  <div className="col-12">
                    <label className="form-label-custom" htmlFor={`lesson-notes-${idx}`}>Detailed Lesson Notes</label>
                    <textarea id={`lesson-notes-${idx}`} className="form-control custom-input" rows="4" value={content.notes_text} onChange={(e) => handleContentChange(idx, "notes_text", e.target.value)} placeholder="Enter full text content for this lesson..." />
                  </div>
                </div>
              </div>
            ))}
          </section>

          <div className="mb-5">
            <label className="form-label-custom" htmlFor="training_banner_image">Training Banner Image</label>
            <div className="p-4 border-2 border-dashed rounded-4 text-center bg-light" style={{ borderStyle: 'dashed', borderColor: '#cbd5e1' }}>
              <input id="training_banner_image" type="file" className="form-control custom-input mb-2" accept="image/*" onChange={(e) => setCourse({ ...course, banner: e.target.files[0] })} />
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