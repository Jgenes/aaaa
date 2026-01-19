import React from "react";
import IBMLogo from "../assets/pdpc.png";
import SATA from "../assets/sata.jfif"; // provider logo
import "../App.css";

const CourseHero = () => {
  return (
    <section className="course-hero">
      <div className="container">
        <div className="row align-items-center">
          {/* LEFT CONTENT */}
          <div className="col-md-7">
            <img src={IBMLogo} alt="Provider Logo" className="provider-logo" />

            <h1 className="course-title">
              IBM RAG and Agentic AI Professional Certificate
            </h1>

            <p className="course-description" style={{ fontSize: "13px" }}>
              Build real-world AI with RAG and agentic AI. Use AI tools to
              streamline automation, drive innovation, and take your career
              further—faster.
            </p>

            <div className="instructors">
              <span className="fw-semibold bnm">Instructors:</span>{" "}
              <a href="#" style={{ fontSize: "13px" }}>
                Personal Data Protection Commission
              </a>
            </div>

            <div className="mt-4">
              <a href="/courseLearning">
                <button
                  style={{ fontSize: "13px" }}
                  className="btn btn-primary enroll-btn"
                >
                  Enroll
                  <small className="d-block">Deadline Jan 13</small>
                </button>
              </a>
            </div>

            <div className="stats mt-3" style={{ fontSize: "13px" }}>
              <strong>42,272</strong> already enrolled
            </div>

            <div className="included mt-2"></div>
          </div>

          {/* RIGHT DECORATION */}
          <div className="col-md-5">
            <div className="hero-art">
              <img
                src={SATA}
                alt="Data Protection"
                style={{
                  width: "350px", // smaller width than height
                  height: "330px", // taller height
                  display: "block",
                  margin: "0 auto",
                  objectFit: "cover", // ensures image covers the oval nicely
                  borderRadius: "50%", // makes it oval
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
