import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axio";
import "../App.css";

const CourseHero = () => {
  const { courseId, cohortId } = useParams(); // from route /course/:courseId/cohort/:cohortId
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [courseId, cohortId]);

  const fetchCourse = async () => {
    try {
      const res = await api.get(`/training/${courseId}`); // get single course
      // Find the specific cohort
      const selectedCohort = res.data.cohorts.find(
        (c) => c.id === parseInt(cohortId),
      );
      setCourse({ ...res.data, selectedCohort });
    } catch (error) {
      console.error("Failed to fetch course", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <p className="text-center py-5">Loading course details...</p>;
  if (!course) return <p className="text-center py-5">Course not found</p>;

  const { title, description, banner, mode, provider, selectedCohort } = course;

  const providerLogo = provider?.logo
    ? `http://localhost:8000/storage/${provider.logo}`
    : "https://ui-avatars.com/api/?name=Trainer&background=6c757d&color=fff";

  const courseBanner = banner
    ? `http://localhost:8000/${banner}`
    : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23ccc' width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' fill='%23999' text-anchor='middle' dy='.3em' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";

  return (
    <section className="course-hero">
      <div className="container">
        <div className="row align-items-center">
          {/* LEFT CONTENT */}
          <div className="col-md-7">
            <img
              src={providerLogo}
              alt={provider?.name}
              className="provider-logo"
            />

            <h1 className="course-title">{title}</h1>

            <p className="course-description" style={{ fontSize: "13px" }}>
              {description || "No description available for this course."}
            </p>

            <div className="instructors">
              <span className="fw-semibold bnm">Instructor:</span>{" "}
              <span style={{ fontSize: "13px" }}>
                {provider?.name || "Unknown"}
              </span>
            </div>

            {/* Cohort Info */}
            {selectedCohort && (
              <div className="cohort-info mt-3" style={{ fontSize: "13px" }}>
                <p>
                  <i className="bi bi-calendar-event me-1"></i> Start Date:{" "}
                  {selectedCohort.start_date}
                </p>
                <p>
                  <i className="bi bi-people-fill me-1"></i> Capacity:{" "}
                  {selectedCohort.capacity}
                </p>
                <p>
                  <i className="bi bi-person-check-fill me-1"></i> Taken:{" "}
                  {selectedCohort.seats_taken}
                </p>
                <p>
                  <i className="bi bi-box-seam me-1"></i> Remaining Seats:{" "}
                  <strong
                    className={
                      selectedCohort.remaining_seats === 0
                        ? "text-danger"
                        : "text-success"
                    }
                  >
                    {selectedCohort.remaining_seats}
                  </strong>
                </p>
              </div>
            )}

            <div className="mt-4">
              {selectedCohort?.remaining_seats > 0 ? (
                <a href={`/courseLearning/${courseId}/${cohortId}`}>
                  <button
                    style={{ fontSize: "13px" }}
                    className="btn btn-primary enroll-btn"
                  >
                    Enroll
                    <small className="d-block">
                      Deadline: {selectedCohort?.registration_deadline}
                    </small>
                  </button>
                </a>
              ) : (
                <span className="badge bg-danger">FULL</span>
              )}
            </div>

            <div className="stats mt-3" style={{ fontSize: "13px" }}>
              <strong>{selectedCohort?.enrolled || 0}</strong> already enrolled
            </div>
          </div>

          {/* RIGHT IMAGE / HERO */}
          <div className="col-md-5">
            <div className="hero-art">
              <img
                src={courseBanner}
                alt={title}
                style={{
                  width: "350px",
                  height: "330px",
                  display: "block",
                  margin: "0 auto",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseHero;
