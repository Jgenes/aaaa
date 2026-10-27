import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaGraduationCap, FaLayerGroup, FaPlayCircle, FaFilePdf, FaTag, FaInfoCircle } from "react-icons/fa";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import api from "../../api/axio";

export default function ViewCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/courses/${id}`);
        setCourse(response.data);
      } catch (error) {
        console.error("Error fetching course details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) return (
    <ProviderDashboardLayout title="Loading...">
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p className="text-muted">Loading training profile...</p>
      </div>
    </ProviderDashboardLayout>
  );

  if (!course) return (
    <ProviderDashboardLayout title="Not Found">
      <div className="text-center py-4">
        <h4 className="text-muted">Training session not found!</h4>
        <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    </ProviderDashboardLayout>
  );

  return (
    <ProviderDashboardLayout title="Training Preview">

      <div className="th-page-narrow">
        {/* Navigation */}
        <button className="btn btn-link text-decoration-none text-muted p-0 mb-4 d-flex align-items-center gap-2" onClick={() => navigate(-1)}>
          <FaArrowLeft size={14} /> Back to Dashboard
        </button>

        {/* Banner Section */}
        {course.banner && (
          <img src={`http://localhost:8000/${course.banner}`} alt={course.title} className="course-banner mb-4" />
        )}

        {/* Core Identity */}
        <div className="info-card shadow-sm">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <span className="badge bg-primary-subtle text-primary mb-2 px-3 py-2">{course.category}</span>
              <h2 className="fw-bold" style={{ color: "var(--th-primary)" }}>{course.title}</h2>
            </div>
            <span className={`status-pill ${course.status === "Published" ? "bg-success text-white" : "bg-warning text-dark"}`}>
              {course.status}
            </span>
          </div>
          
          <div className="d-flex gap-4 mb-4 text-muted small">
            <span className="d-flex align-items-center gap-2"><FaLayerGroup /> {course.mode}</span>
            <span className="d-flex align-items-center gap-2"><FaTag /> ID: {id}</span>
          </div>

          <div className="mb-4">
            <h6 className="fw-bold text-dark">Brief Overview</h6>
            <p className="text-secondary">{course.short_description}</p>
          </div>

          <div className="p-3 rounded bg-light border-start border-4 border-primary">
            <h6 className="fw-bold text-dark">Full Description</h6>
            <p className="text-secondary mb-0 small" style={{ lineHeight: "1.6" }}>{course.long_description}</p>
          </div>
        </div>

        <div className="row">
          {/* Left Column: Learning Outcomes & Skills */}
          <div className="col-lg-5">
            {course.learning_outcomes?.length > 0 && (
              <div className="info-card shadow-sm">
                <div className="section-header"><FaGraduationCap /> Outcomes</div>
                <ul className="ps-0">
                  {course.learning_outcomes.map((item, idx) => (
                    <li key={idx} className="outcome-item">
                      <FaCheckCircle className="text-success me-2" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {course.skills?.length > 0 && (
              <div className="info-card shadow-sm">
                <div className="section-header"><FaTag /> Skills Gained</div>
                <div className="d-flex gap-2 flex-wrap">
                  {course.skills.map((skill, idx) => (
                    <span key={idx} className="skill-badge">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Course Content */}
          <div className="col-lg-7">
            <div className="info-card shadow-sm">
              <div className="section-header"><FaInfoCircle /> Curriculum</div>
              {course.contents?.length > 0 ? (
                course.contents.map((content, idx) => (
                  <div key={idx} className="lesson-card p-4 mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold mb-0" style={{ color: "var(--th-primary)" }}>
                        Lesson {idx + 1}: {content.title}
                      </h6>
                    </div>
                    
                    <p className="text-muted small mb-3">{content.description}</p>

                    {content.notes_text && (
                      <div className="bg-light p-2 rounded mb-3 small border">
                        <strong>Teacher's Note:</strong> {content.notes_text}
                      </div>
                    )}

                    <div className="d-flex flex-wrap gap-2">
                      {content.video_links?.map((link, vIdx) => (
                        <a key={vIdx} href={link} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary d-flex align-items-center gap-2 px-3">
                          <FaPlayCircle /> Video {vIdx + 1}
                        </a>
                      ))}
                      {content.handouts?.map((pdf, pIdx) => (
                        <a key={pIdx} href={`http://localhost:8000/${pdf}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2 px-3">
                          <FaFilePdf /> Material {pIdx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-muted">No syllabus content added yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProviderDashboardLayout>
  );
}