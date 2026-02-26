import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function PesaPalGateway() {
  const location = useLocation();
  const navigate = useNavigate();
  const [iframeLoading, setIframeLoading] = useState(true);

  const { url, courseName } = location.state || {};

  // Function ya kuahirisha malipo
  const handleCancel = () => {
    if (
      window.confirm("Are you sure you want to cancel the payment process?")
    ) {
      navigate("/trainings"); // Inamrudisha mteja ukurasa wa nyuma (Checkout page)
    }
  };

  if (!url) {
    return (
      <div className="text-center py-5">
        <h4>Payment information not found.</h4>
        <button onClick={() => navigate("/")} className="btn btn-primary">
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <NavBar />

      <div className="container flex-grow-1 my-4">
        <div
          className="card shadow-lg border-0 overflow-hidden"
          style={{ borderRadius: "15px" }}
        >
          <div
            style={{ backgroundColor: "#0a2e67" }}
            className="card-header text-white py-3 d-flex justify-content-between align-items-center"
          >
            <div className="d-flex align-items-center">
              {/* --- CANCEL BUTTON --- */}
              <button
                onClick={handleCancel}
                className="btn btn-sm btn-outline-light me-3"
                style={{ borderRadius: "20px", fontSize: "12px" }}
              >
                <i className="bi bi-arrow-left me-1"></i> Cancel
              </button>

              <h5 className="mb-0" style={{ fontSize: "15px" }}>
                Payment for: {courseName}
              </h5>
            </div>

            <span
              className="badge bg-success text-uppercase"
              style={{ fontSize: "10px" }}
            >
              Secure Payment
            </span>
          </div>

          <div
            className="card-body p-0 position-relative"
            style={{ minHeight: "400px" }}
          >
            {/* 1. Spinner wakati iframe inaload */}
            {iframeLoading && (
              <div className="position-absolute top-50 start-50 translate-middle text-center w-100">
                <div
                  className="spinner-border text-primary"
                  role="status"
                  style={{ width: "3rem", height: "3rem" }}
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted fw-bold">
                  Please wait, connecting to payment server...
                </p>
              </div>
            )}

            {/* 2. Iframe ya PesaPal */}
            <iframe
              src={url}
              title="PesaPal Payment"
              onLoad={() => setIframeLoading(false)}
              style={{
                width: "100%",
                height: "750px",
                border: "none",
                display: iframeLoading ? "none" : "block",
              }}
              allow="payment"
            />
          </div>
        </div>

        <p className="text-center text-muted mt-3 small">
          If you encounter any issues, please contact support before canceling.
        </p>
      </div>

      <Footer />
    </div>
  );
}
