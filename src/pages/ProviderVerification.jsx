import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function ProviderVerification() {
  return (
    <>
      <NavBar />

      <main id="main-content" className="th-container-wide th-section">
        <div className="th-auth__card mx-auto text-center" style={{ maxWidth: 560 }}>
          <span
            className="th-empty__icon mx-auto"
            style={{
              background: "var(--th-warning-soft)",
              color: "var(--th-warning)",
              borderColor: "transparent",
              width: 60,
              height: 60,
              fontSize: "1.5rem",
            }}
            aria-hidden="true"
          >
            <i className="bi bi-hourglass-split"></i>
          </span>

          <h1 className="mb-2" style={{ fontSize: "var(--th-fs-2xl)" }}>
            Your information is under review
          </h1>

          <p className="text-muted mb-4">
            Thanks for applying to become a TrainHub TZ provider. Our team reviews every
            application manually — you&apos;ll receive an email as soon as your organisation is
            verified, usually within two business days.
          </p>

          <div className="th-panel-muted text-start mb-4">
            <h2 className="mb-2">
              While you wait
            </h2>
            <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
              <li className="d-flex gap-2">
                <i className="bi bi-check2 text-primary" aria-hidden="true"></i>
                Prepare your course outlines and cohort dates
              </li>
              <li className="d-flex gap-2">
                <i className="bi bi-check2 text-primary" aria-hidden="true"></i>
                Have your accreditation certificates ready to upload
              </li>
              <li className="d-flex gap-2">
                <i className="bi bi-check2 text-primary" aria-hidden="true"></i>
                Reply promptly if our team requests clarification
              </li>
            </ul>
          </div>

          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <Link to="/" className="btn btn-primary">
              Back to home
            </Link>
            <Link to="/contact" className="btn btn-outline-dark">
              Contact support
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
