import React from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function About() {
  return (
    <>
      <style>{`
        .contact-header {
          padding: 60px 0 40px;
          text-align: center;
          background: #ffffff;
        }
        .header-title {
          font-size: 32px;
          font-weight: 800;
          color: #333;
        }
        .contact-input {
          border: 1px solid #dee2e6;
          padding: 12px 15px;
          border-radius: 5px;
          font-size: 14px;
          transition: all 0.2s ease;
          background: #fdfdfd;
        }
        .contact-input:focus {
          border-color: #0a2e67;
          box-shadow: none;
          background: #fff;
          outline: none;
        }
        .contact-sidebar {
          background: #0a2e67;
          color: white;
          border-radius: 0 5px 5px 0;
          padding: 40px;
          position: relative;
        }
        .info-pill {
          background: rgba(255,255,255,0.08);
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .info-pill i { font-size: 18px; color: #4cc9f0; }
        .info-pill strong { font-size: 14px; display: block; }
        .info-pill small { font-size: 11px; opacity: 0.7; }
        
        @media (max-width: 992px) {
          .contact-sidebar { border-radius: 0 0 5px 5px; }
        }
      `}</style>

      <NavBar />

      <section className="contact-header">
        <div className="container">
          <h1 className="header-title">Get in <span style={{ color: "#0a2e67" }}>touch.</span></h1>
          <p className="text-muted mx-auto" style={{ maxWidth: "450px", fontSize: "14px" }}>
            Have a question or want to partner? Our team is here to help you navigate your journey.
          </p>
        </div>
      </section>

      <div className="container pb-5">
        <div className="row g-0 shadow-sm border" style={{ borderRadius: "5px", overflow: "hidden" }}>
          
          {/* Form Side */}
          <div className="col-lg-7 bg-white p-4 p-md-5">
            <h5 className="fw-bold mb-4" style={{ fontSize: "18px" }}>Send Message</h5>
            <form>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="small fw-bold text-muted mb-1">Full Name</label>
                  <input type="text" className="form-control contact-input" placeholder="e.g Adamu Omari" />
                </div>
                <div className="col-md-6">
                  <label className="small fw-bold text-muted mb-1">Email Address</label>
                  <input type="email" className="form-control contact-input" placeholder="name@example.com" />
                </div>
                <div className="col-12">
                  <label className="small fw-bold text-muted mb-1">Subject</label>
                  <input type="text" className="form-control contact-input" placeholder="How can we help you?" />
                </div>
                <div className="col-12">
                  <label className="small fw-bold text-muted mb-1">Message</label>
                  <textarea className="form-control contact-input" rows="4" placeholder="Your message..."></textarea>
                </div>
                <div className="col-12 mt-4">
                  <button className="btn w-100 py-2 fw-bold" style={{ background: "#0a2e67", color: "white", borderRadius: "5px", fontSize: "14px" }}>
                    Send Message <i className="bi bi-send ms-2"></i>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar Side */}
          <div className="col-lg-5 contact-sidebar d-flex flex-column justify-content-center">
            <h5 className="fw-bold mb-4" style={{ fontSize: "18px" }}>Contact Information</h5>
            
            <div className="info-pills-container">
              <div className="info-pill">
                <i className="bi bi-envelope-at"></i>
                <div>
                  <small>Email Support</small>
                  <strong>info@traininghub.co.tz</strong>
                </div>
              </div>

              <div className="info-pill">
                <i className="bi bi-telephone"></i>
                <div>
                  <small>Direct Call</small>
                  <strong>+255 712 345 678</strong>
                </div>
              </div>

              <div className="info-pill">
                <i className="bi bi-geo-alt"></i>
                <div>
                  <small>Office Location</small>
                  <strong>Upanga, Dar es Salaam</strong>
                </div>
              </div>
            </div>

            <div className="social-links mt-4 d-flex gap-2">
              {['linkedin', 'twitter-x', 'instagram'].map(social => (
                <div key={social} className="bg-white bg-opacity-10 rounded p-2 px-3" style={{ cursor: "pointer" }}>
                  <i className={`bi bi-${social} text-white`}></i>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}