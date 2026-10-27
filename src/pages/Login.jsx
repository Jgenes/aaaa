import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axio";
import AuthLayout from "../components/AuthLayout";
import AuthField from "../components/AuthField";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const justActivated = searchParams.get("activated") === "true";

  const validate = () => {
    const nextErrors = {};
    if (!email.trim()) nextErrors.email = "Enter the email address you registered with.";
    if (!password) nextErrors.password = "Enter your password.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async (event) => {
    event?.preventDefault();
    if (!validate()) {
      toast.error("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/login", { email, password });
      const data = response.data;

      // Save email temporarily for the OTP page
      localStorage.setItem("loginEmail", email);

      toast.success(data.message || "OTP sent to your email. Please verify.");
      navigate("/otp-verification", { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Learner account"
      title="Welcome back"
      subtitle="Sign in to continue your training. We'll email you a one-time code to confirm it's you."
    >
      {justActivated && (
        <div className="alert alert-success d-flex align-items-start gap-2" role="status">
          <i className="bi bi-check-circle-fill" aria-hidden="true"></i>
          <span>Your account is activated. Sign in to continue.</span>
        </div>
      )}

      <form className="th-auth__form" onSubmit={handleLogin} noValidate>
        <AuthField
          id="login-email"
          label="Email address"
          type="email"
          icon="bi-envelope"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
          }}
          error={errors.email}
        />

        <AuthField
          id="login-password"
          label="Password"
          type={showPassword ? "text" : "password"}
          icon="bi-lock"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
          }}
          error={errors.password}
          trailing={
            <button
              type="button"
              className="th-field__trailing"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              aria-controls="login-password"
            >
              <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} aria-hidden="true"></i>
            </button>
          }
        />

        <div className="th-auth__row">
          <span className="th-auth__helper">Verified with a one-time code</span>
          <Link to="/forgot-password" className="th-auth__helper-link">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className={`btn btn-primary btn-lg w-100 ${loading ? "is-loading" : ""}`}
          disabled={loading}
        >
          {loading ? "Sending code…" : "Log in"}
        </button>
      </form>

      <p className="th-auth__foot">
        <span>Don&apos;t have an account yet?</span>
        <Link to="/register">Create one</Link>
      </p>
    </AuthLayout>
  );
}
