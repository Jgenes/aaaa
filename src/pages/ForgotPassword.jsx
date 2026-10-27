import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axio";
import AuthLayout from "../components/AuthLayout";
import AuthField from "../components/AuthField";

/**
 * Step 1 of the password reset flow: ask for the account email and let the
 * API mail a signed reset link. The link lands on /reset-password.
 *
 * The endpoint follows the Laravel convention used by the rest of the auth
 * API (`POST /login`, `POST /register`, …). If the backend exposes a
 * different path, this single constant is the only thing to change.
 */
const FORGOT_PASSWORD_ENDPOINT = "/forgot-password";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event?.preventDefault();

    if (!email.trim()) {
      setError("Enter the email address you registered with.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await api.post(FORGOT_PASSWORD_ENDPOINT, { email: email.trim() });
      setSent(true);
    } catch (err) {
      const status = err.response?.status;
      const fieldMessage = err.response?.data?.errors?.email?.[0];

      if (status === 422 && fieldMessage) {
        setError(fieldMessage);
      } else if (!err.response) {
        setError("We couldn't reach the server. Check your connection and try again.");
      } else {
        setError(
          err.response?.data?.message ||
            "We couldn't send the reset link. Please try again in a moment."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Password help"
      title={sent ? "Check your inbox" : "Reset your password"}
      subtitle={
        sent
          ? undefined
          : "Enter the email address on your TrainHub TZ account. We'll send you a secure link to set a new password."
      }
    >
      {sent ? (
        <div className="th-auth__done">
          <span className="th-auth__done-icon" aria-hidden="true">
            <i className="bi bi-envelope-check"></i>
          </span>

          <p className="th-auth__done-text">
            If an account exists for <strong>{email.trim()}</strong>, a reset link is on its
            way. The link expires in 60 minutes and can only be used once.
          </p>

          <p className="th-auth__done-hint">
            Nothing arrived? Check your spam folder, or{" "}
            <button type="button" className="th-auth__inline-button" onClick={() => setSent(false)}>
              try another address
            </button>
            .
          </p>

          <Link to="/login" className="btn btn-primary btn-lg w-100">
            Back to log in
          </Link>
        </div>
      ) : (
        <>
          <form className="th-auth__form" onSubmit={handleSubmit} noValidate>
            <AuthField
              id="forgot-email"
              label="Email address"
              type="email"
              icon="bi-envelope"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              error={error}
            />

            <button
              type="submit"
              className={`btn btn-primary btn-lg w-100 ${loading ? "is-loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Sending link…" : "Send reset link"}
            </button>
          </form>

          <p className="th-auth__foot">
            <span>Remembered it after all?</span>
            <Link to="/login">Back to log in</Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
