import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const completed = status === "COMPLETED";

  useEffect(() => {
    // Escape the PesaPal iframe if the redirect lands inside it
    if (window.top !== window.self) {
      window.top.location.href = window.location.href;
    }
  }, []);

  return (
    <>
      <NavBar />

      <main id="main-content" className="th-container-wide th-section">
        <div className="th-auth__card mx-auto text-center" style={{ maxWidth: 560 }}>
          <span
            className="th-empty__icon mx-auto"
            style={{
              background: completed ? "var(--th-success-soft)" : "var(--th-warning-soft)",
              color: completed ? "var(--th-success)" : "var(--th-warning)",
              borderColor: "transparent",
              width: 64,
              height: 64,
              fontSize: "1.75rem",
            }}
            aria-hidden="true"
          >
            <i className={`bi ${completed ? "bi-check-lg" : "bi-hourglass-split"}`}></i>
          </span>

          <h1 className="mb-2" style={{ fontSize: "var(--th-fs-2xl)" }}>
            {completed ? "Payment successful" : "Payment pending"}
          </h1>

          <p className="text-muted mb-4">
            {completed
              ? "Your enrolment is confirmed. Start learning right away — your cohort materials are ready."
              : "We are waiting for confirmation from the payment provider. This page will update once the payment completes."}
          </p>

          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <Link to="/learning" className="btn btn-primary">
              <i className="bi bi-play-circle" aria-hidden="true"></i>
              Start learning
            </Link>
            <Link to="/transactions" className="btn btn-outline-dark">
              View receipt
            </Link>
          </div>

          <p className="text-muted mt-4 mb-0" style={{ fontSize: "var(--th-fs-xs)" }}>
            Need help? Email{" "}
            <a href="mailto:info@traininghub.co.tz">info@traininghub.co.tz</a>
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
