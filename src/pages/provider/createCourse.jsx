import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../api/axio";
import "../../App.css";

export default function CreateCourse() {
  const navigate = useNavigate();

  const [course, setCourse] = useState({
    title: "",
    category: "",
    mode: "Online",
    shortDescription: "",
    longDescription: "",
    learningOutcomes: [""],
    skills: [""],
    requirements: [""],
    contents: [
      {
        title: "",
        description: "",
        video: null,
        handouts: [], // Changed to array for multiple PDFs
        video_links: [""], // Changed to array for multiple Links
        notes_text: "",
      },
    ],
    banner: null,
  });

  const [loading, setLoading] = useState(false);

  // ===== Dynamic Field Handlers =====
  const handleChange = (e) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (field, index, value) => {
    const updated = [...course[field]];
    updated[index] = value;
    setCourse({ ...course, [field]: updated });
  };

  const addArrayItem = (field) => {
    setCourse({ ...course, [field]: [...course[field], ""] });
  };

  const removeArrayItem = (field, index) => {
    const updated = [...course[field]];
    updated.splice(index, 1);
    setCourse({ ...course, [field]: updated });
  };

  // ===== Content Section Handlers =====
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
      contents: [
        ...course.contents,
        {
          title: "",
          description: "",
          video: null,
          handouts: [],
          video_links: [""],
          notes_text: "",
        },
      ],
    });
  };

  const removeContent = (index) => {
    const updated = [...course.contents];
    updated.splice(index, 1);
    setCourse({ ...course, contents: updated });
  };

  // ===== Submit Handler =====
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

      course.learningOutcomes.forEach((item, idx) => {
        if (item) formData.append(`learning_outcomes[${idx}]`, item);
      });
      course.skills.forEach((item, idx) => {
        if (item) formData.append(`skills[${idx}]`, item);
      });
      course.requirements.forEach((item, idx) => {
        if (item) formData.append(`requirements[${idx}]`, item);
      });

      // Handle Nested Content with Multiple Files & Links
      course.contents.forEach((content, idx) => {
        formData.append(`contents[${idx}][title]`, content.title);
        formData.append(
          `contents[${idx}][description]`,
          content.description || "",
        );
        formData.append(
          `contents[${idx}][notes_text]`,
          content.notes_text || "",
        );

        // Main Video File
        if (content.video instanceof File) {
          formData.append(`contents[${idx}][video]`, content.video);
        }

        // Multiple Video Links
        content.video_links.forEach((link, lIdx) => {
          if (link)
            formData.append(`contents[${idx}][video_links][${lIdx}]`, link);
        });

        // Multiple Handout Files (PDFs)
        if (content.handouts && content.handouts.length > 0) {
          Array.from(content.handouts).forEach((file, fIdx) => {
            formData.append(`contents[${idx}][handouts][${fIdx}]`, file);
          });
        }
      });

      if (course.banner instanceof File) {
        formData.append("banner", course.banner);
      }

      // Ndani ya handleSubmit yako, badilisha sehemu ya response iwe hivi:

      const response = await api.post("/courses", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Hapa ndipo panapogoma! Hakikisha unatumia response.data.course.id
      if (response.data && response.data.course) {
        toast.success("Course created successfully!");
        const newCourseId = response.data.course.id;
        navigate(`/provider/cohorts/${newCourseId}`); // Hakikisha route hii ipo kwenye App.js
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Check your form for errors.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProviderDashboardLayout title="Create Training">
      <ToastContainer position="top-right" />
      <div className="container mt-4 mb-5">
        <button
          className="btn btn-sm btn-outline-secondary mb-4"
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </button>

        <form
          onSubmit={handleSubmit}
          className="shadow-sm p-4 bg-white rounded"
        >
          <h2 className="mb-4 h4 border-bottom pb-2">Trainging Details</h2>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold">Training Title</label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={course.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-bold">Category</label>
              <input
                type="text"
                className="form-control"
                name="category"
                value={course.category}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-bold">Mode</label>
              <select
                className="form-select"
                name="mode"
                value={course.mode}
                onChange={handleChange}
              >
                <option value="Online">Online</option>
                <option value="Physical">Physical</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Short Description</label>
            <textarea
              className="form-control"
              name="shortDescription"
              rows={2}
              value={course.shortDescription}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Long Description</label>
            <textarea
              className="form-control"
              name="longDescription"
              rows={4}
              value={course.longDescription}
              onChange={handleChange}
              required
            />
          </div>

          {/* Dynamic Lists Section */}
          <div className="row mb-4">
            {["learningOutcomes", "skills", "requirements"].map((field) => (
              <div className="col-md-4" key={field}>
                <h3 className="h6 fw-bold text-capitalize">
                  {field.replace(/([A-Z])/g, " $1")}
                </h3>
                {course[field].map((item, idx) => (
                  <div key={idx} className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={item}
                      onChange={(e) =>
                        handleArrayChange(field, idx, e.target.value)
                      }
                      required
                    />
                    {course[field].length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeArrayItem(field, idx)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-sm btn-link p-0"
                  onClick={() => addArrayItem(field)}
                >
                  + Add
                </button>
              </div>
            ))}
          </div>

          <hr />
          <h3 className="h5 mb-3">Course Contents (Curriculum)</h3>

          {course.contents.map((content, idx) => (
            <div key={idx} className="card mb-4 border-primary shadow-sm">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <span>Section {idx + 1}: Lesson Content</span>
                <button
                  type="button"
                  className="btn btn-sm btn-light"
                  onClick={() => removeContent(idx)}
                >
                  ×
                </button>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="fw-bold small">Lesson Title</label>
                    <input
                      type="text"
                      className="form-control mb-2"
                      value={content.title}
                      onChange={(e) =>
                        handleContentChange(idx, "title", e.target.value)
                      }
                      required
                    />
                    <label className="fw-bold small">Overview</label>
                    <textarea
                      className="form-control mb-2"
                      rows="2"
                      value={content.description}
                      onChange={(e) =>
                        handleContentChange(idx, "description", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="fw-bold small">Upload Main Video</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="video/*"
                      onChange={(e) =>
                        handleContentChange(idx, "video", e.target.files[0])
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="fw-bold small">
                      Additional Video Links
                    </label>
                    {content.video_links.map((vLink, lIdx) => (
                      <input
                        key={lIdx}
                        type="url"
                        className="form-control mb-1 form-control-sm"
                        placeholder="https://youtube.com/..."
                        value={vLink}
                        onChange={(e) =>
                          handleVideoLinkChange(idx, lIdx, e.target.value)
                        }
                      />
                    ))}
                    <button
                      type="button"
                      className="btn btn-sm btn-link p-0"
                      onClick={() => addVideoLink(idx)}
                    >
                      + Add Link
                    </button>
                  </div>

                  <div className="col-md-6">
                    <label className="fw-bold small">
                      Handouts / Resources (Multiple PDFs)
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf"
                      multiple
                      onChange={(e) =>
                        handleContentChange(idx, "handouts", e.target.files)
                      }
                    />
                    <small className="text-muted">
                      You can select multiple files
                    </small>
                  </div>

                  <div className="col-12">
                    <label className="fw-bold small">
                      Detailed Lesson Notes
                    </label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Write full lesson notes here..."
                      value={content.notes_text}
                      onChange={(e) =>
                        handleContentChange(idx, "notes_text", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="btn btn-outline-primary mb-4"
            onClick={addContent}
          >
            + Add New Section
          </button>

          <div className="mb-4">
            <h3 className="h5">Course Banner</h3>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={(e) =>
                setCourse({ ...course, banner: e.target.files[0] })
              }
            />
          </div>

          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              {loading && (
                <span className="spinner-border spinner-border-sm me-2"></span>
              )}
              {loading ? "Creating Course..." : "Publish Course Draft"}
            </button>
          </div>
        </form>
      </div>
    </ProviderDashboardLayout>
  );
}
