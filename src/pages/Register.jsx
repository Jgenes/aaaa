import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import api from "../api/axio";
import AuthLayout from "../components/AuthLayout";
import AuthField from "../components/AuthField";

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

  const passwordToggle = (
    <button
      type="button"
      className="th-field__trailing"
      onClick={() => setShowPassword((prev) => !prev)}
      aria-label={showPassword ? "Hide password" : "Show password"}
      aria-pressed={showPassword}
      aria-controls="register-password register-confirm"
    >
      <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} aria-hidden="true"></i>
    </button>
  );

  return (
    <AuthLayout
      wide
      eyebrow="New learner account"
      title="Create your account"
      subtitle="Register once, then enrol in any cohort on TrainHub TZ. We'll email you a link to activate the account."
    >
      <form className="th-auth__form" onSubmit={handleRegister} noValidate>
        <fieldset className="th-auth__group">
          <legend className="th-auth__legend">Your details</legend>

          <div className="th-auth__row-fields">
            <AuthField
              id="register-name"
              label="Full name"
              icon="bi-person"
              autoComplete="name"
              placeholder="e.g. Amina Juma"
              value={fullname}
              onChange={(e) => {
                setFullname(e.target.value);
                clearError("fullname");
              }}
              error={errors.fullname}
            />

            <AuthField
              id="register-email"
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
          </div>

          <div className={`th-field${errors.phone ? " th-field--invalid" : ""}`}>
            <label className="th-field__label" htmlFor="register-phone">
              Phone number
            </label>
            <div className="th-field__control th-field__control--plain">
              <PhoneInput
                country="tz"
                value={phone}
                onChange={(value) => {
                  setPhone("+" + value);
                  clearError("phone");
                }}
                placeholder="Enter phone number"
                inputProps={{
                  id: "register-phone",
                  autoComplete: "tel",
                  "aria-invalid": errors.phone ? true : undefined,
                  "aria-describedby": errors.phone ? "register-phone-error" : undefined,
                }}
                containerClass="th-phone"
                dropdownClass="th-phone__dropdown"
              />
            </div>
            {errors.phone && (
              <p className="th-field__error" id="register-phone-error">
                <i className="bi bi-exclamation-circle" aria-hidden="true" />
                {errors.phone}
              </p>
            )}
          </div>
        </fieldset>

        <fieldset className="th-auth__group">
          <legend className="th-auth__legend">Secure your account</legend>

          <div className="th-auth__row-fields">
            <AuthField
              id="register-password"
              label="Password"
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
              trailing={passwordToggle}
            />

            <AuthField
              id="register-confirm"
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

          <p className="th-auth__hint">Use at least 6 characters, mixing letters and numbers.</p>
        </fieldset>

        <button
          type="submit"
          className={`btn btn-primary btn-lg w-100 ${loading ? "is-loading" : ""}`}
          disabled={loading}
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="th-auth__foot">
        <span>Already have an account?</span>
        <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
