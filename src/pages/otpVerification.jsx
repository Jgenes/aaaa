import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import api from "../api/axio"; // Hakikisha jina la file ni sahihi (axio au axios?)
import "react-toastify/dist/ReactToastify.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

function OtpVerification() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Kuchukua email kutoka login stage
  const emailFromState =
    location.state?.email || localStorage.getItem("loginEmail");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("Tafadhali ingiza OTP");
      return;
    }

    setLoading(true);

    try {
      // 2. Tuma ombi kwenye route sahihi ya Laravel
      const response = await api.post("/verify-otp", {
        email: emailFromState,
        otp: otp,
      });

      const data = response.data;

      // 3. Hifadhi Token kwa jina "token" ili axios interceptor ipate
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user || {}));

      toast.success("OTP imethibitishwa!");

      // 4. Safisha email ya muda kwenye storage kama ipo
      localStorage.removeItem("loginEmail");

      // 5. Redirect kulingana na maelekezo ya Backend
      if (data.redirect) {
        navigate(data.redirect);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      // Laravel itarudisha error kama "OTP expired" au "Invalid OTP"
      toast.error(err.response?.data?.message || "Imeshindwa kuthibitisha OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="container py-5" style={{ minHeight: "80vh" }}>
        <ToastContainer position="top-center" />

        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5">
                <h3 className="text-center fw-bold mb-3">Thibitisha OTP</h3>
                <p className="text-center text-muted mb-4">
                  Tumekutumia kodi kwenye barua pepe: <br />
                  <strong>{emailFromState}</strong>
                </p>

                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Ingiza Namba za OTP
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg text-center fw-bold"
                    style={{ letterSpacing: "5px" }}
                    placeholder="000000"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-primary w-100 py-3 fw-bold"
                  onClick={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : null}
                  {loading ? "Inathibitisha..." : "Thibitisha Sasa"}
                </button>

                <div className="text-center mt-4">
                  <button
                    className="btn btn-link text-decoration-none"
                    onClick={() => navigate("/login")}
                  >
                    Rudi kwenye Login
                  </button>
                </div>
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
