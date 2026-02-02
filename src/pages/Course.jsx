import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axio";
import { FaPlay, FaLock, FaChevronDown } from "react-icons/fa";
import "../App.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function Course() {
  const { courseId, cohortId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);

  useEffect(() => {
    fetchCourse();
  }, [courseId, cohortId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/training/${courseId}`);
      const courseData = res.data;

      const cohort = courseData.cohorts?.find(
        (c) => c.id === parseInt(cohortId),
      );

      const robustParse = (data) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        let result = data;
        try {
          if (typeof result === "string") result = JSON.parse(result);
          if (typeof result === "string") result = JSON.parse(result);
          return Array.isArray(result) ? result : [];
        } catch (e) {
          return [];
        }
      };

      let rawCurriculum =
        cohort?.contents?.curriculum ||
        cohort?.contents ||
        courseData.curriculum ||
        courseData.contents ||
        [];

      setCourse({
        ...courseData,
        selectedCohort: cohort,
        curriculum: robustParse(rawCurriculum),
        requirements: robustParse(courseData.requirements),
        learningOutcomes: robustParse(courseData.learning_outcomes),
        skills: robustParse(courseData.skills),
      });
    } catch (err) {
      setError("Failed to load course details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p>Loading Course...</p>
      </div>
    );
  if (error || !course)
    return (
      <div className="text-center py-5">
        <h3>{error || "Course not found"}</h3>
        <Link to="/">Go Home</Link>
      </div>
    );

  return (
    <>
      <NavBar />
      <div className="single-course-view">
        {/* HERO SECTION - Full Width Background */}
        <section className="course-hero bg-light py-5 border-bottom">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h1 className="display-4 fw-bold">{course.title}</h1>
                <p className="lead text-muted" style={{ fontSize: "15px" }}>
                  {course.short_description}
                </p>
                {course.selectedCohort && (
                  <div className="d-flex flex-wrap gap-3 mt-4 mb-4">
                    <div className="badge border text-dark p-2 fw-normal">
                      <i className="bi bi-calendar-check me-1"></i> Starts:{" "}
                      {course.selectedCohort.start_date}
                    </div>
                    <div className="badge border text-danger p-2 fw-normal">
                      <i className="bi bi-alarm me-1"></i> Deadline:{" "}
                      {course.selectedCohort.registration_deadline}
                    </div>
                    <div className="badge border text-success p-2 fw-normal">
                      <i className="bi bi-people me-1"></i> Available Seats:{" "}
                      {course.selectedCohort.remaining_seats}
                    </div>
                  </div>
                )}
                <Link
                  to={`/checkout/${courseId}/${cohortId}`}
                  className="btn btn-primary  px-5 py-3 shadow btnEnroll"
                >
                  Enroll Now
                </Link>
              </div>
              <div className="col-md-4 text-center">
                <img
                  src={
                    course.banner
                      ? `http://localhost:8000/storage/${course.banner}`
                      : "https://via.placeholder.com/350"
                  }
                  className="img-fluid rounded shadow-lg"
                  style={{
                    width: "100%",
                    maxHeight: "300px",
                    objectFit: "cover",
                  }}
                  alt="Banner"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="container py-5">
          {/* TOP SECTION: What you'll learn (Full Width) */}
          {course.learningOutcomes?.length > 0 && (
            <div className="mb-5 p-4 border rounded bg-white shadow-sm">
              <h5 className="fw-bold mb-4" style={{ fontSize: "18PX" }}>
                What you'll learn
              </h5>
              <div className="row g-3">
                {course.learningOutcomes.map((item, i) => (
                  <div
                    key={i}
                    className="col-md-4 small d-flex align-items-start"
                  >
                    <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CURRICULUM SECTION (Full Width) */}
          <div className="row mb-5">
            <div className="col-12">
              <h4 className="fw-bold mb-4" style={{ fontSize: "18PX" }}>
                Course Content
              </h4>
              {course.curriculum.length > 0 ? (
                <div className="accordion shadow-sm" id="curriculumAccordion">
                  {course.curriculum.map((section, index) => {
                    const isOpen = index < 2;
                    return (
                      <div
                        className="accordion-item border-0 mb-2 shadow-sm"
                        key={index}
                      >
                        <h2 className="accordion-header">
                          <button
                            className={`accordion-button ${!isOpen ? "collapsed" : ""} py-3 bg-white`}
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#section${index}`}
                          >
                            <div className="d-flex justify-content-between w-100 align-items-center me-3">
                              <span>
                                {section.unlocked ? (
                                  <FaChevronDown className="me-2 small" />
                                ) : (
                                  <FaLock className="me-2 small text-muted" />
                                )}
                                <strong>
                                  {section.sectionTitle || section.title}
                                </strong>
                              </span>
                              {/* <span className="badge bg-light text-dark fw-normal px-3">
                                {section.lessons?.length || 0} lessons
                              </span> */}
                            </div>
                          </button>
                        </h2>
                        <div
                          id={`section${index}`}
                          className={`accordion-collapse collapse ${isOpen ? "show" : ""}`}
                          data-bs-parent="#curriculumAccordion"
                        >
                          <div className="accordion-body p-0 bg-light">
                            {section.lessons?.map((lesson, i) => (
                              <div
                                key={i}
                                className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom"
                                style={{
                                  cursor: lesson.preview
                                    ? "pointer"
                                    : "default",
                                }}
                                onClick={() =>
                                  lesson.preview &&
                                  setPreviewVideo(lesson.video)
                                }
                              >
                                <div className="d-flex align-items-center gap-3">
                                  {lesson.preview ? (
                                    <FaPlay className="text-primary small" />
                                  ) : (
                                    <FaLock className="text-muted small" />
                                  )}
                                  <span className="small">{lesson.title}</span>
                                </div>
                                <span className="text-muted small">
                                  {lesson.time}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="alert alert-info">Curriculum coming soon.</div>
              )}
            </div>
          </div>

          {/* SKILLS & REQUIREMENTS (Same Row, Split 50/50) */}
          <div className="row g-4 mb-5">
            <div className="col-md-6">
              <div className="p-4 border rounded bg-white h-100 shadow-sm">
                <h5 className="fw-bold mb-3" style={{ fontSize: "18PX" }}>
                  Skills you will gain
                </h5>
                <div className="d-flex flex-wrap gap-2">
                  {course.skills?.map((skill, i) => (
                    <span
                      key={i}
                      className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 fw-normal"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="p-4 border rounded bg-white h-100 shadow-sm">
                <h5 className="fw-bold mb-3" style={{ fontSize: "18PX" }}>
                  Requirements
                </h5>
                <ul className="list-unstyled">
                  {course.requirements?.map((req, i) => (
                    <li
                      key={i}
                      className="small mb-2 d-flex align-items-center"
                    >
                      <i className="bi bi-arrow-right-short text-primary fs-5 me-1"></i>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* DESCRIPTION (Full Width) */}
          <div className="row">
            <div className="col-12">
              <div className="p-4 bg-white border rounded shadow-sm">
                <h4 className="fw-bold mb-4" style={{ fontSize: "18PX" }}>
                  Detailed Course Description
                </h4>
                <div
                  className="text-secondary"
                  style={{ lineHeight: "1.8", fontSize: "13PX" }}
                  dangerouslySetInnerHTML={{ __html: course.long_description }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* MODAL VIDEO */}
        {previewVideo && (
          <div
            className="modal show d-block"
            style={{ background: "rgba(0,0,0,0.9)" }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content bg-dark border-0 shadow">
                <div className="modal-header border-0 text-white pb-0">
                  <h6 className="modal-title">Lesson Preview</h6>
                  <button
                    className="btn-close btn-close-white"
                    onClick={() => setPreviewVideo(null)}
                  ></button>
                </div>
                <div className="modal-body p-0">
                  <div className="ratio ratio-16x9">
                    <video controls autoPlay>
                      <source src={previewVideo} type="video/mp4" />
                    </video>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
