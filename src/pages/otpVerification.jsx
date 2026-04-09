import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import api from "../api/axio";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

function OtpVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get email from navigation state or fallback to localStorage
  const emailFromState = location.state?.email || localStorage.getItem("loginEmail");

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(0);
  const inputRefs = useRef([]);

  // Timer Logic for Resend OTP
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

  // Handle individual digit input
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Auto-focus next input box
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle Backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Main Verification API Call
  const handleVerifyOtp = async () => {
    const finalOtp = otp.join("");
    if (finalOtp.length < 6) {
      toast.error("Please enter 6-digit code.");
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
      
      toast.success("OTP Verified Successfully!");
      navigate(res.data.redirect || "/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP API Call with Loader
  const handleResendOtp = async () => {
    if (!canResend || resendLoading) return;

    setResendLoading(true);
    try {
      await api.post("/resend-otp", { email: emailFromState });
      toast.success("A new code has been sent to your email.");
      setCanResend(false);
      setTimer(30); // 30 second cooldown
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend code");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .otp-wrapper {
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f9fafb;
        }
        .otp-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #ffffff;
          max-width: 420px;
          width: 100%;
          padding: 40px;
        }
        .otp-input-group {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 25px;
        }
        .otp-box {
          width: 45px;
          height: 50px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          text-align: center;
          font-size: 20px;
          font-weight: 700;
          color: #0a2e67;
          transition: all 0.2s ease;
        }
        .otp-box:focus {
          border-color: #0a2e67;
          box-shadow: 0 0 0 3px rgba(10, 46, 103, 0.1);
          outline: none;
        }
        .verify-btn {
          background-color: #0a2e67;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          width: 100%;
          transition: opacity 0.2s;
        }
        .verify-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .resend-section {
          font-size: 13px;
          color: #6b7280;
          text-align: center;
          margin-top: 20px;
        }
        .resend-btn {
          color: #0a2e67;
          text-decoration: none;
          font-weight: 700;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .resend-btn:disabled {
          color: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>

      <NavBar />
      
      <div className="otp-wrapper">
        <ToastContainer position="top-center" autoClose={3000} />
        
        <div className="otp-card shadow-sm">
          <div className="text-center mb-4">
            {/* <div className="mb-3">
              <i className="bi bi-shield-lock-fill" style={{ fontSize: "40px", color: "#0a2e67" }}></i>
            </div> */}
            <h5 className="fw-bold mb-1" style={{ fontSize: "20px" }}>Verify OTP</h5>
            <p className="text-muted" style={{ fontSize: "13px" }}>
              Please enter the code sent to:<br/>
              <span className="fw-bold text-dark">{emailFromState || "your email"}</span>
            </p>
          </div>

          {/* OTP Inputs */}
          <div className="otp-input-group">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="otp-box"
                value={digit}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            className="verify-btn"
            onClick={handleVerifyOtp}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Verifying...
              </>
            ) : (
              "Confirm"
            )}
          </button>

          {/* Resend Section */}
          <div className="resend-section">
            Didn't receive the code? {" "}
            <button 
              className="resend-btn" 
              onClick={handleResendOtp}
              disabled={!canResend || resendLoading}
            >
              {resendLoading && (
                <span className="spinner-border spinner-border-sm" role="status"></span>
              )}
              {resendLoading 
                ? "Sending..." 
                : canResend 
                  ? "Resend Code" 
                  : `Try again in ${timer}s`
              }
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default OtpVerification;