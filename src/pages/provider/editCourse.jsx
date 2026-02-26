import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import api from "../../api/axio";

export default function EditCourse() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
    // price: 0,
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
          learningOutcomes: Array.isArray(data.learning_outcomes)
            ? data.learning_outcomes.join("\n")
            : data.learning_outcomes || "",
          requirements: Array.isArray(data.requirements)
            ? data.requirements.join("\n")
            : data.requirements || "",
          skills: Array.isArray(data.skills)
            ? data.skills.join("\n")
            : data.skills || "",
          banner: data.banner || null,
        //   price: data.price || 0,
          status: data.status || "Draft",
        });
      } catch (err) {
        console.error("Error fetching course:", err);
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      
      // Basic Fields
      formData.append("title", course.title);
      formData.append("category", course.category);
      formData.append("mode", course.mode);
      formData.append("short_description", course.shortDescription);
      formData.append("long_description", course.longDescription);
    //   formData.append("price", course.price);
      formData.append("status", course.status);

      // JSON fields kwa ajili ya Arrays
      formData.append(
        "learning_outcomes",
        JSON.stringify(course.learningOutcomes.split("\n").filter((i) => i.trim()))
      );
      formData.append(
        "requirements",
        JSON.stringify(course.requirements.split("\n").filter((i) => i.trim()))
      );
      formData.append(
        "skills",
        JSON.stringify(course.skills.split("\n").filter((i) => i.trim()))
      );

      // Banner logic
      if (course.banner && typeof course.banner !== "string") {
        formData.append("banner", course.banner);
      }

      // --- MUHIMU: Method Spoofing ---
      // Tunatumia POST hapa lakini tunaiambia Laravel kuwa hii ni PUT
      formData.append("_method", "PUT");

      await api.post(`/courses/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("✓ Course updated successfully!");
      setTimeout(() => navigate("/provider/course"), 1500);

    } catch (err) {
      console.error("Submit Error:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || "Failed to update course!";
      toast.error(`✗ ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProviderDashboardLayout title="Loading...">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
          <div className="spinner-border text-primary"></div>
        </div>
      </ProviderDashboardLayout>
    );
  }

  return (
    <ProviderDashboardLayout title="Edit Course">
      <ToastContainer />
      <div className="container mt-4">
        <button className="btn btn-sm btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="card p-4 shadow-sm">
          <h5 className="mb-4">Edit Course</h5>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Course Title *</label>
              <input type="text" className="form-control" name="title" value={course.title} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Category *</label>
              <input type="text" className="form-control" name="category" value={course.category} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Mode *</label>
              <select className="form-select" name="mode" value={course.mode} onChange={handleChange}>
                <option>Online</option>
                <option>Offline</option>
                <option>Hybrid</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Short Description *</label>
              <textarea className="form-control" name="shortDescription" value={course.shortDescription} onChange={handleChange} rows="3" required />
            </div>

            <div className="mb-3">
              <label className="form-label">Long Description *</label>
              <textarea className="form-control" name="longDescription" value={course.longDescription} onChange={handleChange} rows="5" required />
            </div>

            <div className="mb-3">
              <label className="form-label">Learning Outcomes (one per line)</label>
              <textarea className="form-control" name="learningOutcomes" value={course.learningOutcomes} onChange={handleChange} rows="4" />
            </div>

            <div className="mb-3">
              <label className="form-label">Requirements (one per line)</label>
              <textarea className="form-control" name="requirements" value={course.requirements} onChange={handleChange} rows="4" />
            </div>

            <div className="mb-3">
              <label className="form-label">Skills You'll Gain (one per line)</label>
              <textarea className="form-control" name="skills" value={course.skills} onChange={handleChange} rows="4" />
            </div>

            <div className="mb-3">
              <label className="form-label">Banner Image</label>
              <input type="file" className="form-control" onChange={handleFileChange} accept="image/*" />
              {typeof course.banner === "string" && (
                <small className="text-muted d-block mt-2">Current path: {course.banner}</small>
              )}
            </div>

            {/* <div className="mb-3">
              <label className="form-label">Price (TZS) *</label>
              <input type="number" className="form-control" name="price" value={course.price} onChange={handleChange} required />
            </div> */}

            {/* <div className="mb-3">
              <label className="form-label">Status *</label>
              <select className="form-select" name="status" value={course.status} onChange={handleChange}>
                <option>Draft</option>
                <option>Published</option>
              </select>
            </div> */}

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Updating..." : "✓ Update Course"}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </ProviderDashboardLayout>
  );
}