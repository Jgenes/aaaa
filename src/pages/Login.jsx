import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axio";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

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
    <>
      <NavBar />

      <main id="main-content" className="th-auth">
        <div className="th-auth__panel">
          <div className="th-auth__card">
            <h1 className="th-auth__title">Welcome back</h1>
            <p className="th-auth__sub">
              Sign in to continue your training. We&apos;ll email you a one-time code to
              confirm it&apos;s you.
            </p>

            {justActivated && (
              <div className="alert alert-success d-flex align-items-start gap-2" role="status">
                <i className="bi bi-check-circle-fill" aria-hidden="true"></i>
                <span>Your account is activated. Sign in to continue.</span>
              </div>
            )}

            <form onSubmit={handleLogin} noValidate>
              <div className="mb-3">
                <label className="form-label" htmlFor="login-email">
                  Email address
                </label>
                <div className="field-icon">
                  <i className="bi bi-envelope field-icon__adornment" aria-hidden="true"></i>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                    }}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "login-email-error" : undefined}
                  />
                </div>
                {errors.email && (
                  <p className="invalid-feedback d-block" id="login-email-error">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="mb-2">
                <label className="form-label" htmlFor="login-password">
                  Password
                </label>
                <div className="field-icon">
                  <i className="bi bi-lock field-icon__adornment" aria-hidden="true"></i>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                    }}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? "login-password-error" : undefined}
                    style={{ paddingRight: "2.75rem" }}
                  />
                  <button
                    type="button"
                    className="field-icon__button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    <i
                      className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                      aria-hidden="true"
                    ></i>
                  </button>
                </div>
                {errors.password && (
                  <p className="invalid-feedback d-block" id="login-password-error">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="th-auth__helper">
                <span className="text-muted">One-time code verification</span>
                <Link to="/contact" className="fw-semibold">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className={`btn btn-primary w-100 ${loading ? "is-loading" : ""}`}
                disabled={loading}
              >
                {loading ? "Sending code…" : "Log in"}
              </button>
            </form>

            <p className="th-auth__foot">
              Don&apos;t have an account? <Link to="/register">Create one</Link>
            </p>
          </div>
        </div>

        <aside className="th-auth__aside" aria-hidden="true">
          <div>
            <h2>Skills that move Tanzania forward.</h2>
            <ul className="th-auth__points">
              <li>
                <i className="bi bi-check-circle-fill"></i>
                Accredited courses from verified providers
              </li>
              <li>
                <i className="bi bi-check-circle-fill"></i>
                Cohort-based learning with real projects
              </li>
              <li>
                <i className="bi bi-check-circle-fill"></i>
                Verifiable certificates on completion
              </li>
            </ul>
          </div>
          <p className="mb-0">
            Elevating skills. Transforming Tanzania. Join thousands of professionals
            learning with TrainHub TZ.
          </p>
        </aside>
      </main>

      <Footer />
    </>
  );
}
