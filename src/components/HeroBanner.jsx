import React from "react";
import bannerImg from "../assets/banner2.jpg";
// you can also split images later if needed
import "../App.css";
function HeroBanner() {
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
          <h1 className="fw-bold mb-3">
            Personal Data Protection <br /> Training
          </h1>

          <p className="text-light opacity-75 mb-4 proof1">
            Future-proof your skills with Personal Plan. Get access to a variety
            of fresh content from real-world experts.
          </p>

          {/* FEATURES */}
          <div className="row mb-4">
            <div className="col-6 mb-2 aa">✅ Learn AI and more</div>
            <div className="col-6 mb-2 aa">🎓 Prep for a certification</div>
            <div className="col-6 mb-2 aa">🤖 Practice with AI coaching</div>
            <div className="col-6 mb-2 aa">🚀 Advance your career</div>
          </div>

          {/* CTA */}
          <button
            className="btn btn-light fw-semibold px-4 py-2 mb-2"
            style={{ fontSize: "13px" }}
          >
            Enroll Now
          </button>

          <div
            className="text-light opacity-75 mt-2"
            style={{ fontSize: "13px" }}
          >
            Deadline: <i>February 13, 2026</i>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="col-md-6 d-flex justify-content-center mt-4 mt-md-0">
          <img
            src={bannerImg}
            alt="AI Banner"
            className="img-fluid"
            style={{
              maxHeight: "360px",
              borderRadius: "20px",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default HeroBanner;
