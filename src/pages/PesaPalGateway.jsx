import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function PesaPalGateway() {
  const location = useLocation();
  const navigate = useNavigate();
  const [iframeLoading, setIframeLoading] = useState(true);

  const { url, courseName } = location.state || {};

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel the payment process?")) {
      navigate("/trainings");
    }
  };

  if (!url) {
    return (
      <>
        <NavBar />
        <main id="main-content" className="th-container-wide th-section">
          <div className="th-empty">
            <span className="th-empty__icon">
              <i className="bi bi-credit-card" aria-hidden="true"></i>
            </span>
            <h1 className="th-empty__title">Payment information not found</h1>
            <p className="th-empty__text">
              This can happen if the page was reloaded. Start the enrolment again from the
              training page.
            </p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <button type="button" onClick={() => navigate("/")} className="btn btn-primary">
                Return home
              </button>
              <button
                type="button"
                onClick={() => navigate("/trainings")}
                className="btn btn-outline-dark"
              >
                Browse trainings
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <NavBar />

      <main id="main-content" className="th-container-wide flex-grow-1 py-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
          <div>
            <h1 className="mb-1" style={{ fontSize: "var(--th-fs-xl)" }}>
              Secure payment
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: "var(--th-fs-sm)" }}>
              {courseName ? `Paying for: ${courseName}` : "Complete your payment below."}
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="th-status th-status--success">
              <i className="bi bi-shield-lock" aria-hidden="true"></i>
              PesaPal secured
            </span>
            <button type="button" onClick={handleCancel} className="btn btn-outline-dark btn-sm">
              <i className="bi bi-arrow-left" aria-hidden="true"></i>
              Cancel
            </button>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="card-body p-0 position-relative" style={{ minHeight: 480 }}>
            {iframeLoading && (
              <div
                className="position-absolute top-50 start-50 translate-middle text-center w-100 px-3"
                role="status"
              >
                <div className="spinner-border" aria-hidden="true"></div>
                <p className="mt-3 text-muted mb-0" style={{ fontSize: "var(--th-fs-sm)" }}>
                  Connecting to the payment server…
                </p>
              </div>
            )}

            <iframe
              src={url}
              title="PesaPal payment gateway"
              onLoad={() => setIframeLoading(false)}
              style={{
                width: "100%",
                height: "720px",
                border: "none",
                display: iframeLoading ? "none" : "block",
              }}
              allow="payment"
            />
          </div>
        </div>

        <p
          className="text-center text-muted mt-3 mb-0"
          style={{ fontSize: "var(--th-fs-xs)" }}
        >
          If you encounter any issues, please contact support before cancelling.
        </p>
      </main>

      <Footer />
    </div>
  );
}
