import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import api from "../../api/axio"; // Inatumia interceptor kupitisha Bearer Token

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
    contents: [{ title: "", description: "", link: "" }],
    status: "Draft",
    banner: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================
        HANDLERS
  ========================== */

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

  const handleContentChange = (index, field, value) => {
    const updated = [...course.contents];
    updated[index][field] = value;
    setCourse({ ...course, contents: updated });
  };

  const addContent = () => {
    setCourse({
      ...course,
      contents: [...course.contents, { title: "", description: "", link: "" }],
    });
  };

  const handleBannerUpload = (e) => {
    setCourse({ ...course, banner: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Prepare FormData kwa ajili ya Multipart (FileUpload + JSON)
      const formData = new FormData();

      // Text fields
      formData.append("title", course.title);
      formData.append("category", course.category);
      formData.append("mode", course.mode);
      formData.append("shortDescription", course.shortDescription);
      formData.append("longDescription", course.longDescription);
      formData.append("status", course.status);

      // Arrays/Objects zinatumwa kama JSON strings (Laravel itazi-decode)
      formData.append(
        "learningOutcomes",
        JSON.stringify(course.learningOutcomes),
      );
      formData.append("skills", JSON.stringify(course.skills));
      formData.append("requirements", JSON.stringify(course.requirements));
      formData.append("contents", JSON.stringify(course.contents));

      // Banner File
      if (course.banner) {
        formData.append("banner", course.banner);
      }

      // 2. Tuma POST request kwa kutumia 'api' instance
      // Kumbuka: Token inaongezwa automatically na axios interceptor yako
      const response = await api.post("/courses", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Laravel inarudisha { message: '...', course: { id: ... } }
      const createdCourseId = response.data.course.id;

      navigate(`/provider/cohorts/${createdCourseId}`, {
        state: { message: "Course created! Please add at least one cohort." },
      });
    } catch (err) {
      console.error("Submission Error:", err);
      // Kama kuna validation errors kutoka Laravel (e.g. status 422)
      const msg =
        err.response?.data?.message || "Failed to create course. Try again!";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProviderDashboardLayout title="Create Course">
      <div className="container mt-4">
        <button
          className="btn btn-sm btn-outline-secondary mb-3"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="pb-5">
          <h3 className="mb-3 h4">Course Information</h3>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Course Title</label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={course.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-control"
                name="category"
                value={course.category}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Mode</label>
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
            <label className="form-label">Short Description</label>
            <textarea
              className="form-control"
              name="shortDescription"
              value={course.shortDescription}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Long Description</label>
            <textarea
              className="form-control"
              rows="4"
              name="longDescription"
              value={course.longDescription}
              onChange={handleChange}
            />
          </div>

          <hr />
          <h3 className="h5">What You'll Learn</h3>
          {course.learningOutcomes.map((item, idx) => (
            <input
              key={idx}
              type="text"
              className="form-control mb-2"
              value={item}
              onChange={(e) =>
                handleArrayChange("learningOutcomes", idx, e.target.value)
              }
              placeholder="e.g. Master React Hooks"
            />
          ))}
          <button
            type="button"
            className="btn btn-sm btn-link p-0 mb-3"
            onClick={() => addArrayItem("learningOutcomes")}
          >
            + Add Outcome
          </button>

          <hr />
          <h3 className="h5">Skills & Requirements</h3>
          <div className="row">
            <div className="col-md-6">
              <label className="small fw-bold">Skills Gained</label>
              {course.skills.map((skill, idx) => (
                <input
                  key={idx}
                  type="text"
                  className="form-control mb-2"
                  value={skill}
                  onChange={(e) =>
                    handleArrayChange("skills", idx, e.target.value)
                  }
                />
              ))}
              <button
                type="button"
                className="btn btn-sm btn-link p-0 mb-3"
                onClick={() => addArrayItem("skills")}
              >
                + Add Skill
              </button>
            </div>
            <div className="col-md-6">
              <label className="small fw-bold">Requirements</label>
              {course.requirements.map((req, idx) => (
                <input
                  key={idx}
                  type="text"
                  className="form-control mb-2"
                  value={req}
                  onChange={(e) =>
                    handleArrayChange("requirements", idx, e.target.value)
                  }
                />
              ))}
              <button
                type="button"
                className="btn btn-sm btn-link p-0 mb-3"
                onClick={() => addArrayItem("requirements")}
              >
                + Add Requirement
              </button>
            </div>
          </div>

          <hr />
          <h3 className="h5">Course Contents</h3>
          {course.contents.map((content, idx) => (
            <div key={idx} className="border rounded p-3 mb-3 bg-light">
              <input
                type="text"
                placeholder="Section Title"
                className="form-control mb-2"
                value={content.title}
                onChange={(e) =>
                  handleContentChange(idx, "title", e.target.value)
                }
              />
              <textarea
                placeholder="Description"
                className="form-control mb-2"
                value={content.description}
                onChange={(e) =>
                  handleContentChange(idx, "description", e.target.value)
                }
              />
              {course.mode === "Online" && (
                <input
                  type="text"
                  placeholder="Video URL"
                  className="form-control"
                  value={content.link}
                  onChange={(e) =>
                    handleContentChange(idx, "link", e.target.value)
                  }
                />
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-sm btn-outline-primary mb-4"
            onClick={addContent}
          >
            + Add Content Section
          </button>

          <hr />
          <div className="row align-items-end">
            <div className="col-md-6">
              <h3 className="h5">Banner Image</h3>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={handleBannerUpload}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Publishing Status</label>
              <select
                className="form-select"
                name="status"
                value={course.status}
                onChange={handleChange}
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="mt-5 border-top pt-4">
            <button
              type="submit"
              className="btn btn-primary btn-lg px-5 shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving Course...
                </span>
              ) : (
                "Create Course"
              )}
            </button>
          </div>
        </form>
      </div>
    </ProviderDashboardLayout>
  );
}
