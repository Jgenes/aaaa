import React, { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";

function HeroBanner() {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tunaita API na kuchuja 'on-progress' moja kwa moja
    axios
      .get("http://localhost:8000/api/user-courses", { withCredentials: true })
      .then((res) => {
        const inProgress = res.data.find((c) => c.t_status === "on-progress");
        setCourse(inProgress);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null; // Au weka spinner ndogo hapa
  if (!course) return null; // Kama hakuna kozi inayozidi, banner isionekane

  return (
    <div className="container my-5 banner5">
      <div
        className="row align-items-center text-white p-4 p-md-5"
        style={{
          backgroundColor: "#0a2e67",
          borderRadius: "28px",
          minHeight: "420px",
        }}
      >
        {/* LEFT CONTENT */}
        <div className="col-md-6">
          <span className="badge bg-warning text-dark mb-3">
            Continue Learning
          </span>
          <h1 className="fw-bold mb-3">{course.title}</h1>

          <p className="text-light opacity-75 mb-4 proof1">
            You are currently learning this course. Pick up right where you left
            off to reach your goal!
          </p>

          {/* PROGRESS STATS */}
          <div className="row mb-4">
            <div className="col-12 mb-3">
              <div className="d-flex justify-content-between mb-1">
                <small>Your Progress</small>
                <small>{course.progress_percent}%</small>
              </div>
              <div
                className="progress"
                style={{
                  height: "8px",
                  backgroundColor: "rgba(255,255,255,0.2)",
                }}
              >
                <div
                  className="progress-bar bg-white"
                  style={{ width: `${course.progress_percent}%` }}
                ></div>
              </div>
            </div>
            <div className="col-6 mb-2 aa">
              ✅ Instructor: {course.instructor_name}
            </div>
            <div className="col-6 mb-2 aa">🎓 Status: {course.t_status}</div>
          </div>

          {/* CTA - Inakupeleka kwenye kozi moja kwa moja */}
          <a
            href={`/course-learning/${course.id}`}
            className="btn btn-light fw-semibold px-4 py-2 mb-2"
            style={{ fontSize: "13px" }}
          >
            Resume Course
          </a>
        </div>

        {/* RIGHT CONTENT */}
        <div className="col-md-6 d-flex justify-content-center mt-4 mt-md-0">
          <img
            src={`http://localhost:8000/storage/${course.image_path}`}
            alt={course.title}
            className="img-fluid"
            style={{
              maxHeight: "360px",
              borderRadius: "20px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default HeroBanner;
