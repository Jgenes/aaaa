import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axio";
import AuthLayout from "../components/AuthLayout";

function OtpVerification() {
  const location = useLocation();
  const navigate = useNavigate();

  const emailFromState = location.state?.email || localStorage.getItem("loginEmail");

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(0);
  const inputRefs = useRef([]);

  // Resend cooldown
  useEffect(() => {
    let interval = null;
    if (!canResend && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleChange = (element, index) => {
    if (Number.isNaN(Number(element.value))) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    event.preventDefault();
    const next = new Array(6).fill("");
    pasted.split("").forEach((digit, i) => {
      next[i] = digit;
    });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const resolveDestination = (user) => {
    if (user?.role === "admin") return "/admin/dashboard";
    if (user?.role === "provider") return "/provider/dashboard";
    return "/learning";
  };

  const handleVerifyOtp = async (event) => {
    event?.preventDefault();
    const finalOtp = otp.join("");
    if (finalOtp.length < 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/verify-otp", {
        email: emailFromState,
        otp: finalOtp,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user || {}));
      localStorage.removeItem("loginEmail");

      toast.success("OTP verified successfully!");
      navigate(res.data.redirect || resolveDestination(res.data.user));
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || resendLoading) return;

    setResendLoading(true);
    try {
      await api.post("/resend-otp", { email: emailFromState });
      toast.success("A new code has been sent to your email.");
      setCanResend(false);
      setTimer(30);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend code");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your login"
      subtitle="Enter the 6-digit code we sent to your email address to finish signing in."
      asideTitle="Secure by design."
      points={[
        "One-time codes keep your account safe",
        "Codes expire shortly after they are issued",
        "Need help? Our support team is one click away",
      ]}
    >
      <div
        className="alert alert-info d-flex align-items-start gap-2"
        role="status"
        aria-live="polite"
      >
        <i className="bi bi-shield-lock" aria-hidden="true"></i>
        <span>
          Code sent to <strong>{emailFromState || "your email"}</strong>
        </span>
      </div>

      <form onSubmit={handleVerifyOtp} noValidate>
        <fieldset>
          <legend className="form-label mb-2">Verification code</legend>
          <div className="th-otp" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                aria-label={`Digit ${index + 1} of 6`}
                aria-invalid={false}
                autoComplete={index === 0 ? "one-time-code" : "off"}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          className={`btn btn-primary w-100 ${loading ? "is-loading" : ""}`}
          disabled={loading}
        >
          {loading ? "Verifying…" : "Confirm code"}
        </button>
      </form>

      <div className="text-center mt-4" style={{ fontSize: "var(--th-fs-sm)" }}>
        <span className="text-muted">Didn&apos;t receive the code? </span>
        <button
          type="button"
          className="btn btn-link btn-sm p-0 align-baseline"
          onClick={handleResendOtp}
          disabled={!canResend || resendLoading}
        >
          {resendLoading ? "Sending…" : canResend ? "Resend code" : `Try again in ${timer}s`}
        </button>
      </div>

      <p className="th-auth__foot">
        Wrong email? <Link to="/login">Back to login</Link>
      </p>
    </AuthLayout>
  );
}

export default OtpVerification;
