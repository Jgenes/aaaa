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
      { title: "", description: "", video: null, handouts: null, link: "" },
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

  const addContent = () => {
    setCourse({
      ...course,
      contents: [
        ...course.contents,
        { title: "", description: "", video: null, handouts: null, link: "" },
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

      // 1. Basic Fields (Mapping camelCase to snake_case for Laravel)
      formData.append("title", course.title);
      formData.append("category", course.category);
      formData.append("mode", course.mode);
      formData.append("short_description", course.shortDescription);
      formData.append("long_description", course.longDescription);
      formData.append("status", "Draft");

      // 2. Handle Simple Arrays (Individually appended with brackets [])
      course.learningOutcomes.forEach((item, idx) => {
        if (item) formData.append(`learning_outcomes[${idx}]`, item);
      });
      course.skills.forEach((item, idx) => {
        if (item) formData.append(`skills[${idx}]`, item);
      });
      course.requirements.forEach((item, idx) => {
        if (item) formData.append(`requirements[${idx}]`, item);
      });

      // 3. Handle Nested Content Array & Files
      course.contents.forEach((content, idx) => {
        formData.append(`contents[${idx}][title]`, content.title);
        formData.append(`contents[${idx}][description]`, content.description);
        formData.append(`contents[${idx}][link]`, content.link || "");

        if (content.video instanceof File) {
          formData.append(`contents[${idx}][video]`, content.video);
        }
        if (content.handouts instanceof File) {
          formData.append(`contents[${idx}][handouts]`, content.handouts);
        }
      });

      // 4. Main Banner
      if (course.banner instanceof File) {
        formData.append("banner", course.banner);
      }

      const response = await api.post("/courses", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Course created successfully!");
      // Redirecting to cohorts page as per your instruction
      navigate(`/provider/cohorts/${response.data.course.id}`);
    } catch (err) {
      console.error("Submission Error:", err.response?.data);
      const errorMsg =
        err.response?.data?.message || "Check your form for errors.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProviderDashboardLayout title="Create Course">
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
          <h2 className="mb-4 h4 border-bottom pb-2">Course Details</h2>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold">Course Title</label>
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
            <div key={idx} className="card mb-3 bg-light border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <h6 className="fw-bold">Section {idx + 1}</h6>
                  {course.contents.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeContent(idx)}
                    >
                      Remove Section
                    </button>
                  )}
                </div>
                <div className="mb-3 mt-2">
                  <input
                    type="text"
                    placeholder="Section Title"
                    className="form-control mb-2"
                    value={content.title}
                    onChange={(e) =>
                      handleContentChange(idx, "title", e.target.value)
                    }
                    required
                  />
                  <textarea
                    placeholder="Section Description"
                    className="form-control mb-2"
                    rows={2}
                    value={content.description}
                    onChange={(e) =>
                      handleContentChange(idx, "description", e.target.value)
                    }
                    required
                  />
                  <div className="row">
                    <div className="col-md-6">
                      <label className="small fw-bold">Video (MP4/WebM)</label>
                      <input
                        type="file"
                        className="form-control form-control-sm"
                        accept="video/*"
                        onChange={(e) =>
                          handleContentChange(idx, "video", e.target.files[0])
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="small fw-bold">Handouts (PDF)</label>
                      <input
                        type="file"
                        className="form-control form-control-sm"
                        accept=".pdf"
                        onChange={(e) =>
                          handleContentChange(
                            idx,
                            "handouts",
                            e.target.files[0],
                          )
                        }
                      />
                    </div>
                  </div>
                  <input
                    type="url"
                    placeholder="External Link (Optional)"
                    className="form-control form-control-sm mt-2"
                    value={content.link}
                    onChange={(e) =>
                      handleContentChange(idx, "link", e.target.value)
                    }
                  />
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
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : null}
              {loading ? "Creating Course..." : "Publish Course Draft"}
            </button>
          </div>
        </form>
      </div>
    </ProviderDashboardLayout>
  );
}
