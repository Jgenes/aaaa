import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axio";
import AuthLayout from "../components/AuthLayout";
import AuthField from "../components/AuthField";

/**
 * Step 2 of the password reset flow: the emailed link carries `token` and
 * `email` in the query string, exactly like a standard Laravel reset URL.
 *
 * Endpoint path follows the same convention as the rest of the auth API; if
 * the backend differs, this constant and the payload keys are all that change.
 */
const RESET_PASSWORD_ENDPOINT = "/reset-password";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";
  const emailFromLink = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromLink);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const clearError = (field) => {
    if (!errors[field]) return;
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = "Enter the email address on your account.";
    if (!password) next.password = "Choose a new password.";
    else if (password.length < 6) next.password = "Use at least 6 characters.";
    if (!confirmPassword) next.confirmPassword = "Confirm your new password.";
    else if (password !== confirmPassword) next.confirmPassword = "Passwords do not match.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      await api.post(RESET_PASSWORD_ENDPOINT, {
        token,
        email: email.trim(),
        password,
        password_confirmation: confirmPassword,
      });

      setDone(true);
      toast.success("Password updated. You can log in with your new password.");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      const data = err.response?.data;

      if (err.response?.status === 422 && data?.errors) {
        setErrors({
          email: data.errors.email?.[0],
          password: data.errors.password?.[0],
        });
        return;
      }

      const message =
        data?.message ||
        (err.response
          ? "That reset link is invalid or has expired. Request a new one."
          : "We couldn't reach the server. Check your connection and try again.");

      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  };

  /* A reset without a token cannot succeed — say so instead of letting the
     visitor fill in a form that is guaranteed to fail. */
  if (!token && !done) {
    return (
      <AuthLayout eyebrow="Password help" title="This reset link is incomplete">
        <div className="th-auth__notice" role="alert">
          <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
          <span>
            The link is missing its security token. It may have been cut off by your email
            client, or it has already been used.
          </span>
        </div>

        <Link to="/forgot-password" className="btn btn-primary btn-lg w-100">
          Request a new link
        </Link>

        <p className="th-auth__foot">
          <span>Nothing wrong with the link?</span>
          <Link to="/login">Back to log in</Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Password help"
      title={done ? "Password updated" : "Set a new password"}
      subtitle={
        done
          ? undefined
          : "Choose a password you don't use anywhere else. You'll use it the next time you log in."
      }
    >
      {done ? (
        <div className="th-auth__done">
          <span className="th-auth__done-icon" aria-hidden="true">
            <i className="bi bi-shield-check"></i>
          </span>

          <p className="th-auth__done-text">
            Your password has been changed. Taking you to the log-in page…
          </p>

          <Link to="/login" className="btn btn-primary btn-lg w-100">
            Log in now
          </Link>
        </div>
      ) : (
        <>
          <form className="th-auth__form" onSubmit={handleSubmit} noValidate>
            {errors.form && (
              <div className="th-auth__notice" role="alert">
                <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
                <span>{errors.form}</span>
              </div>
            )}

            <AuthField
              id="reset-email"
              label="Email address"
              type="email"
              icon="bi-envelope"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError("email");
              }}
              error={errors.email}
            />

            <div className="th-auth__row-fields">
              <AuthField
                id="reset-password"
                label="New password"
                type={showPassword ? "text" : "password"}
                icon="bi-lock"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError("password");
                }}
                error={errors.password}
                trailing={
                  <button
                    type="button"
                    className="th-field__trailing"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    aria-controls="reset-password"
                  >
                    <i
                      className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                      aria-hidden="true"
                    ></i>
                  </button>
                }
              />

              <AuthField
                id="reset-confirm"
                label="Confirm password"
                type={showPassword ? "text" : "password"}
                icon="bi-shield-lock"
                autoComplete="new-password"
                placeholder="Re-enter it"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearError("confirmPassword");
                }}
                error={errors.confirmPassword}
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-lg w-100 ${loading ? "is-loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Saving password…" : "Save new password"}
            </button>
          </form>

          <p className="th-auth__foot">
            <span>Link not working?</span>
            <Link to="/forgot-password">Request a new one</Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
