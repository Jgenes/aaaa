import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import api from "../api/axio";
import AuthLayout from "../components/AuthLayout";

const INITIAL_ERRORS = {};

export default function Register() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(INITIAL_ERRORS);

  const navigate = useNavigate();

  const clearError = (field) => {
    if (!errors[field]) return;
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!fullname.trim()) next.fullname = "Enter your full name.";
    if (!email.trim()) next.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";
    if (!phone) next.phone = "Enter your phone number.";
    if (!password) next.password = "Choose a password.";
    else if (password.length < 6) next.password = "Use at least 6 characters.";
    if (!confirmPassword) next.confirmPassword = "Confirm your password.";
    else if (password !== confirmPassword) next.confirmPassword = "Passwords do not match.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleRegister = async (event) => {
    event?.preventDefault();
    if (!validate()) {
      toast.error("Please check the highlighted fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/register", {
        name: fullname,
        email,
        phone,
        password,
        password_confirmation: confirmPassword,
      });

      toast.success(
        response.data.message ||
          "Account created successfully! Check your email to activate your account."
      );

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Register as a learner and start your first cohort in minutes."
      asideTitle="Learn with confidence, grow with evidence."
    >
      <form onSubmit={handleRegister} noValidate>
        <div className="mb-3">
          <label className="form-label" htmlFor="register-name">
            Full name
          </label>
          <div className="field-icon">
            <i className="bi bi-person field-icon__adornment" aria-hidden="true"></i>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              className={`form-control ${errors.fullname ? "is-invalid" : ""}`}
              placeholder="e.g. Amina Juma"
              value={fullname}
              onChange={(e) => {
                setFullname(e.target.value);
                clearError("fullname");
              }}
              aria-invalid={Boolean(errors.fullname)}
            />
          </div>
          {errors.fullname && <p className="invalid-feedback d-block">{errors.fullname}</p>}
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="register-email">
            Email address
          </label>
          <div className="field-icon">
            <i className="bi bi-envelope field-icon__adornment" aria-hidden="true"></i>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError("email");
              }}
              aria-invalid={Boolean(errors.email)}
            />
          </div>
          {errors.email && <p className="invalid-feedback d-block">{errors.email}</p>}
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="register-phone">
            Phone number
          </label>
          <PhoneInput
            country="tz"
            value={phone}
            onChange={(value) => {
              setPhone("+" + value);
              clearError("phone");
            }}
            placeholder="Enter phone number"
            inputProps={{ id: "register-phone", autoComplete: "tel" }}
            containerStyle={{ width: "100%" }}
            buttonStyle={{ background: "var(--th-surface-sunken)" }}
          />
          {errors.phone && <p className="invalid-feedback d-block">{errors.phone}</p>}
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="register-password">
            Password
          </label>
          <div className="field-icon">
            <i className="bi bi-lock field-icon__adornment" aria-hidden="true"></i>
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError("password");
              }}
              aria-invalid={Boolean(errors.password)}
              aria-describedby="password-hint"
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
          <p className="form-text" id="password-hint">
            Use a mix of letters and numbers you don&apos;t use elsewhere.
          </p>
          {errors.password && <p className="invalid-feedback d-block">{errors.password}</p>}
        </div>

        <div className="mb-4">
          <label className="form-label" htmlFor="register-confirm">
            Confirm password
          </label>
          <div className="field-icon">
            <i className="bi bi-shield-lock field-icon__adornment" aria-hidden="true"></i>
            <input
              id="register-confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                clearError("confirmPassword");
              }}
              aria-invalid={Boolean(errors.confirmPassword)}
            />
          </div>
          {errors.confirmPassword && (
            <p className="invalid-feedback d-block">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          className={`btn btn-primary w-100 ${loading ? "is-loading" : ""}`}
          disabled={loading}
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="th-auth__foot">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
