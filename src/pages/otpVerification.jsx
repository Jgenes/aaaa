import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import api from "../api/axio";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

function OtpVerification() {
  const location = useLocation();
  const navigate = useNavigate();

  const emailFromState =
    location.state?.email || localStorage.getItem("loginEmail");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(0);

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

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      toast.error("Please enter a valid 6-digit OTP code");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/verify-otp", {
        email: emailFromState,
        otp: otp,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user || {}));
      localStorage.removeItem("loginEmail");

      toast.success("OTP Verified Successfully!");

      if (res.data.redirect) {
        navigate(res.data.redirect);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    try {
      await api.post("/resend-otp", { email: emailFromState });
      toast.success("OTP Sent Successfully");

      setCanResend(false);
      setTimer(15);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <>
      <NavBar />
      <div className="container py-5" style={{ minHeight: "80vh" }}>
        <ToastContainer position="top-center" />

        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-5">
                <h3
                  className="text-center fw-bold mb-3"
                  style={{ fontSize: "20px" }}
                >
                  Verify OTP
                </h3>
                <p
                  className="text-center text-muted mb-4"
                  style={{ fontSize: "13px" }}
                >
                  Code has been sent to your email: <br />
                  <strong>{emailFromState}</strong>
                </p>

                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Enter OTP Code
                  </label>
                  <input
                    type="text"
                    className="form-control form-control text-center"
                    style={{ letterSpacing: "5px" }}
                    placeholder="000000"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-primary w-100 verifyBtn1"
                  onClick={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : null}
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <div className="text-center mt-3">
                  <button
                    style={{ fontSize: "13px", color: "#111827" }}
                    className="btn btn-link text-decoration-none"
                    disabled={!canResend}
                    onClick={handleResendOtp}
                  >
                    {canResend ? "Resend OTP" : `Resend OTP in ${timer}s`}
                  </button>
                </div>

                <div className="text-center mt-3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default OtpVerification;
