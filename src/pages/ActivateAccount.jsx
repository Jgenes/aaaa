import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const called = useRef(false); // Prevents duplicate activation calls
  const [state, setState] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setState("error");
      setMessage("This activation link is incomplete. Please use the link from your email.");
      return;
    }

    if (called.current) return;
    called.current = true;

    axios
      .post("http://localhost:8000/api/auth/activate-account", { token, email })
      .then(() => {
        setState("success");
        setTimeout(() => navigate("/login?activated=true"), 1600);
      })
      .catch((error) => {
        setState("error");
        setMessage(
          error.response?.data?.message ||
            "We could not activate this account. The link may have expired or already been used."
        );
      });
  }, [searchParams, navigate]);

  return (
    <>
      <NavBar />

      <main id="main-content" className="th-container-wide th-section">
        <div className="th-auth__card mx-auto text-center" style={{ maxWidth: 520 }}>
          {state === "loading" && (
            <>
              <div className="spinner-border mb-3" role="status" aria-hidden="true"></div>
              <h1 className="mb-2" style={{ fontSize: "var(--th-fs-xl)" }}>
                Activating your account
              </h1>
              <p className="text-muted mb-0">
                Hang tight — this only takes a moment.
              </p>
              <p className="visually-hidden" role="status">
                Activating account, please wait.
              </p>
            </>
          )}

          {state === "success" && (
            <>
              <span
                className="th-empty__icon mx-auto"
                style={{
                  background: "var(--th-success-soft)",
                  color: "var(--th-success)",
                  borderColor: "transparent",
                }}
                aria-hidden="true"
              >
                <i className="bi bi-check-lg"></i>
              </span>
              <h1 className="mb-2" style={{ fontSize: "var(--th-fs-xl)" }}>
                Account activated
              </h1>
              <p className="text-muted mb-4">
                You&apos;re all set. Redirecting you to the login page…
              </p>
              <Link to="/login?activated=true" className="btn btn-primary">
                Continue to login
              </Link>
            </>
          )}

          {state === "error" && (
            <>
              <span
                className="th-empty__icon mx-auto"
                style={{
                  background: "var(--th-danger-soft)",
                  color: "var(--th-danger)",
                  borderColor: "transparent",
                }}
                aria-hidden="true"
              >
                <i className="bi bi-exclamation-triangle"></i>
              </span>
              <h1 className="mb-2" style={{ fontSize: "var(--th-fs-xl)" }}>
                Activation failed
              </h1>
              <p className="text-muted mb-4">{message}</p>
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <Link to="/login" className="btn btn-primary">
                  Go to login
                </Link>
                <Link to="/contact" className="btn btn-outline-dark">
                  Contact support
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
