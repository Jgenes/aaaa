import React, { useEffect, useState } from "react";
import api from "../api/axio";
import "../App.css";

export default function ProgramTabs({ courseId, cohortId }) {
  const [course, setCourse] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);

  useEffect(() => {
    fetchCourseContent();
  }, [courseId, cohortId]);

  const fetchCourseContent = async () => {
    try {
      const res = await api.get(`/training/${courseId}`);
      const courseData = res.data;
      const cohort = courseData.cohorts.find(
        (c) => c.id === parseInt(cohortId),
      );
      setCourse({ ...courseData, selectedCohort: cohort });
    } catch (error) {
      console.error("Failed to fetch course content", error);
    }
  };

  if (!course)
    return <p className="text-center py-5">Loading course content...</p>;

  const { selectedCohort, curriculum, requirements, description } = course;

  return (
    <div className="container mt-5">
      {/* COURSE CONTENT */}
      <h5>Course content</h5>
      <div className="accordion mt-3" id="curriculumAccordion">
        {curriculum?.map((section, index) => (
          <div className="accordion-item mb-2" key={index}>
            <h2 className="accordion-header">
              <button
                className={`accordion-button collapsed d-flex justify-content-between`}
                type="button"
                data-bs-toggle={section.unlocked ? "collapse" : ""}
                data-bs-target={section.unlocked ? `#section${index}` : ""}
                style={{
                  cursor: section.unlocked ? "pointer" : "not-allowed",
                  backgroundColor: "#f8f9fa",
                }}
                title={!section.unlocked ? "Complete enrollment to unlock" : ""}
              >
                <span>
                  {section.unlocked ? "▼ " : "🔒 "}
                  {section.sectionTitle}
                </span>
                <small className="text-muted">
                  {section.lectures} lectures • {section.duration}
                </small>
              </button>
            </h2>

            {section.unlocked && (
              <div
                id={`section${index}`}
                className="accordion-collapse collapse"
                data-bs-parent="#curriculumAccordion"
              >
                <div className="accordion-body p-0">
                  {section.lessons.map((lesson, i) => (
                    <div
                      key={i}
                      className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom"
                      style={{
                        fontSize: "13px",
                        cursor: lesson.preview ? "pointer" : "default",
                      }}
                      onClick={() => {
                        if (lesson.preview && lesson.video)
                          setPreviewVideo(lesson.video);
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span>▶</span>
                        <span>{lesson.title}</span>
                        {lesson.preview && (
                          <span className="text-primary">Preview</span>
                        )}
                      </div>
                      <div className="text-muted">{lesson.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* REQUIREMENTS */}
      <div className="mt-5">
        <h5 style={{ fontSize: "15px" }}>Requirements</h5>
        <ul style={{ fontSize: "13px" }}>
          {requirements?.map((req, i) => (
            <li key={i}>{req}</li>
          ))}
        </ul>
      </div>

      {/* DESCRIPTION */}
      <div className="mt-5">
        <h5 style={{ fontSize: "15px" }}>Description</h5>
        <p style={{ fontSize: "13px" }}>{description}</p>
      </div>

      {/* VIDEO PREVIEW MODAL */}
      {previewVideo && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.7)" }}
          onClick={() => setPreviewVideo(null)}
        >
          <div
            className="modal-dialog modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title">Preview Lesson</h6>
                <button
                  className="btn-close"
                  onClick={() => setPreviewVideo(null)}
                ></button>
              </div>
              <div className="modal-body p-0">
                <video
                  width="100%"
                  height="auto"
                  controls
                  autoPlay
                  onEnded={() => setPreviewVideo(null)}
                >
                  <source src={previewVideo} type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
