import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import api from "../../api/axio";
import "bootstrap-icons/font/bootstrap-icons.css"; // For icons

export default function ViewCourse() {
  const { id } = useParams(); // Inasoma ID kutoka URL
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/courses/${id}`);
        setCourse(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching course details:", error);
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading)
    return (
      <ProviderDashboardLayout title="Loading...">
        <div>Loading...</div>
      </ProviderDashboardLayout>
    );
  if (!course)
    return (
      <ProviderDashboardLayout title="Not Found">
        <div>Trining not found!</div>
      </ProviderDashboardLayout>
    );

  const isOnline = course.mode?.toLowerCase() === "online";

  return (
    <ProviderDashboardLayout title="View Training">
      <div className="container mt-4">
        {/* Course Banner - Fixed path */}
        {course.banner && (
          <img
            src={`http://localhost:8000/${course.banner}`}
            alt={course.title}
            className="img-fluid rounded mb-3"
            onError={(e) => { e.target.style.display = 'none'; }}
            style={{
              height: "250px",
              width: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        )}

        <div className="mb-4">
          <h3 className="h4A">{course.title}</h3>
          <p>
            <strong>
              <i>Category:</i>
            </strong>{" "}
            {course.category} |{" "}
            <strong>
              <i>Mode:</i>
            </strong>{" "}
            {course.mode} |{" "}
            <strong>
              <i>Status:</i>
            </strong>
            <span
              className={
                course.status === "Published" ? "text-success" : "text-warning"
              }
            >
              {course.status}
            </span>
          </p>
          <p>
            <strong>
              <i>Short Description:</i>
            </strong>{" "}
            {course.short_description}
          </p>
          <p>
            <strong>
              <i>Long Description:</i>
            </strong>{" "}
            {course.long_description}
          </p>
        </div>

        <hr />
        {/* Learning Outcomes - Kumbuka huku ni array (Casted in Model) */}
        {course.learning_outcomes?.length > 0 && (
          <div className="mb-4">
            <h3 className="h4A">What You'll Learn</h3>
            <ul>
              {course.learning_outcomes.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <hr />
        {/* Skills */}
        {course.skills?.length > 0 && (
          <div className="mb-4">
            <h3 className="h4A">Skills You'll Gain</h3>
            <div className="d-flex gap-2 flex-wrap">
              {course.skills.map((skill, idx) => (
                <span key={idx} className="badge bg-primary">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <hr />
        {/* Contents - Section by Section with videos and handouts */}
        {course.contents?.length > 0 && (
          <div className="mb-4">
            <h3 className="h4A">Course Contents</h3>
            {course.contents.map((content, idx) => (
              <div key={idx} className="mb-4 p-4 border rounded shadow-sm bg-light">
                {/* Section Title */}
                <h5 className="h5A mb-3" style={{ color: "#0a2e67" }}>
                  <i className="bi bi-book me-2"></i>
                  Lesson {idx + 1}: {content.title}
                </h5>

                {/* Description */}
                {content.description && (
                  <div className="mb-3">
                    <p className="text-muted mb-0">{content.description}</p>
                  </div>
                )}

                {/* Notes */}
                {content.notes_text && (
                  <div className="mb-3 p-3 bg-white rounded border-start border-4" style={{ borderColor: "#0a2e67" }}>
                    <h6 className="fw-bold mb-2"><i className="bi bi-sticky me-2"></i>Notes:</h6>
                    <p className="small mb-0">{content.notes_text}</p>
                  </div>
                )}

                {/* Video Links */}
                {content.video_links && content.video_links.length > 0 && (
                  <div className="mb-3">
                    <h6 className="fw-bold mb-2"><i className="bi bi-play-circle me-2"></i>Video Resources:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {content.video_links.map((link, vidIdx) => (
                        <a
                          key={vidIdx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-primary"
                        >
                          <i className="bi bi-youtube me-1"></i>Video {vidIdx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Handouts (PDFs) */}
                {content.handouts && content.handouts.length > 0 && (
                  <div className="mb-2">
                    <h6 className="fw-bold mb-2"><i className="bi bi-file-pdf me-2"></i>Handouts & Materials:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {content.handouts.map((pdf, pdfIdx) => (
                        <a
                          key={pdfIdx}
                          href={`http://localhost:8000/${pdf}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-danger"
                        >
                          <i className="bi bi-download me-1"></i>PDF {pdfIdx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ProviderDashboardLayout>
  );
}
