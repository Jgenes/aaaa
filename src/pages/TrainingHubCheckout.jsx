import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import api from "../api/axio";
import "../App.css";

export default function TrainingHubCheckout() {
  const { courseId, cohortId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [cohort, setCohort] = useState(null);

  // --- OTP STATES ---
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    organizationName: "",
    position: "",
    street: "",
    city: "",
    region: "",
    country: "Tanzania",
    postalCode: "",
  });

  const tzData = {
    Arusha: ["Arusha City", "Arumeru", "Karatu", "Monduli", "Ngorongoro"],
    "Dar es Salaam": ["Ilala", "Kinondoni", "Temeke", "Kigamboni", "Ubungo"],
    Dodoma: ["Dodoma City", "Bahi", "Chamwino", "Kondoa", "Mpwapwa"],
    Mwanza: ["Ilemela", "Nyamagana", "Magu", "Sengerema"],
    Tanga: ["Tanga City", "Handeni", "Korogwe", "Lushoto", "Muheza", "Pangani"],
  };

  const formatTzPhone = (number) => {
    if (!number) return "";
    let cleaned = number.toString().replace(/\D/g, "");
    if (cleaned.startsWith("0")) return "255" + cleaned.substring(1);
    if (cleaned.startsWith("7") || cleaned.startsWith("6")) return "255" + cleaned;
    return cleaned;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const cohortRes = await api.get(`/courses/${courseId}/cohorts/${cohortId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const cohortData = cohortRes.data.data || cohortRes.data;
        setCohort(cohortData);
        setCourse(cohortData.course || null);

        const userRes = await api.get("/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = userRes.data;
        setUserInfo((prev) => ({
          ...prev,
          name: user.name || "",
          email: user.email || "",
          phone: formatTzPhone(user.phone || ""),
        }));
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, cohortId, navigate]);

  // STEP 1: Omba OTP
  const handleRequestOtp = async () => {
    try {
      setLoading(true);
      await api.post("/payment/send-otp", {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setShowOtpModal(true);
    } catch (err) {
      alert("Error sending OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify & Pay
  const handleVerifyAndPay = async () => {
    try {
      setIsVerifying(true);
      const token = localStorage.getItem("token");

      // Verify OTP kwanza
      await api.post("/payment/verify-otp", { otp: otpValue }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Ikishapita, endelea na initiate transaction
      const paymentData = {
        course_id: courseId,
        cohort_id: cohortId,
        amount: cohort?.price,
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        organization: userInfo.organizationName,
        position: userInfo.position,
        street: userInfo.street,
        region: userInfo.region,
        city: userInfo.city,
        postal: userInfo.postalCode,
      };

      const res = await api.post("/payment/initiate", paymentData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success && res.data.redirect_url) {
        navigate("/pesapal-gateway", {
          state: { url: res.data.redirect_url, courseName: course?.title },
        });
      } else {
        alert("Backend Error: " + (res.data.message || "Unknown error"));
      }
    } catch (error) {
      alert(error.response?.data?.message || "Invalid OTP code.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-5 mt-5">
        <div className="spinner-border text-primary"></div>
        <p>Processing...</p>
      </div>
    );

  return (
    <>
      <NavBar />
      <div className="container my-5">
        <div className="row g-4">
          <div className="col-md-7">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h4 className="mb-4" style={{ color: "#111827", fontSize: "15px" }}>
                  Billing Information
                </h4>

                <div className="mb-3">
                  <label className="form-label fw-medium">Full Name</label>
                  <input type="text" className="form-control bg-light" value={userInfo.name} readOnly />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">Email Address</label>
                    <input type="email" className="form-control bg-light" value={userInfo.email} readOnly />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">Phone (255...)</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={userInfo.phone}
                      onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                    />
                  </div>
                </div>

                <h6 style={{ color: "#111827", fontSize: "15px" }} className="mt-4 mb-3 border-bottom pb-2">
                  Work Details (Optional)
                </h6>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">Organization Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={userInfo.organizationName}
                      onChange={(e) => setUserInfo({ ...userInfo, organizationName: e.target.value })}
                      placeholder="e.g. Google"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">Your Position</label>
                    <input
                      type="text"
                      className="form-control"
                      value={userInfo.position}
                      onChange={(e) => setUserInfo({ ...userInfo, position: e.target.value })}
                      placeholder="e.g. Manager"
                    />
                  </div>
                </div>

                <h6 style={{ color: "#111827", fontSize: "15px" }} className="mt-4 mb-3 border-bottom pb-2">
                  Address Information
                </h6>
                <div className="mb-3">
                  <label className="form-label fw-medium">Street Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={userInfo.street}
                    onChange={(e) => setUserInfo({ ...userInfo, street: e.target.value })}
                    placeholder="Mwai Kibaki Road"
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">Region</label>
                    <select
                      className="form-select"
                      value={userInfo.region}
                      onChange={(e) => setUserInfo({ ...userInfo, region: e.target.value, city: "" })}
                    >
                      <option value="">Select Region</option>
                      {Object.keys(tzData).sort().map((reg) => (
                        <option key={reg} value={reg}>{reg}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">City / District</label>
                    <select
                      className="form-select"
                      value={userInfo.city}
                      disabled={!userInfo.region}
                      onChange={(e) => setUserInfo({ ...userInfo, city: e.target.value })}
                    >
                      <option value="">Select City</option>
                      {userInfo.region && tzData[userInfo.region].map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">Country</label>
                    <input className="form-control bg-light" value="Tanzania" readOnly />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">Postal Code</label>
                    <input
                      type="text"
                      className="form-control"
                      value={userInfo.postalCode}
                      onChange={(e) => setUserInfo({ ...userInfo, postalCode: e.target.value })}
                      placeholder="e.g. 11101"
                    />
                  </div>
                </div>

                {/* Badala ya handlePayNow, tunaita handleRequestOtp */}
                <button className="btn btn-primary w-100 mt-4 shadow-sm checkOutBtn" onClick={handleRequestOtp}>
                  Pay Now
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-5">
            <div className="card shadow-sm border-0 bg-light">
              <div className="card-body p-4">
                <h5 className="mb-3 border-bottom pb-2" style={{ fontSize: "15px", color: "#111827" }}>
                  Order Summary
                </h5>
                <div className="mb-4">
                  <h6 className="mb-1" style={{ fontSize: "15px", color: "#111827", fontWeight: "600" }}>
                    {course?.title || "Course"}
                  </h6>
                  <p className="small text-muted mb-0">Cohort: {cohort?.intake_name || "Loading..."}</p>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Price</span>
                  <strong>{cohort?.price?.toLocaleString()} TZS</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax (0%)</span>
                  <strong>0 TZS</strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ fontSize: "15px", color: "#111827" }} className="fw-bold">Total</span>
                  <span className="fw-bold fs-5 text-primary">
                    <span style={{ fontSize: "13px", color: "#111827" }}>{cohort?.price?.toLocaleString()} TZS</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL YA OTP (Inafuata style yako) --- */}
      {showOtpModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold" style={{ fontSize: "17px" }}>Verify Your Payment</h5>
                <button type="button" className="btn-close" onClick={() => setShowOtpModal(false)}></button>
              </div>
              <div className="modal-body text-center py-4">
                <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
                  We've sent a 6-digit verification code to your email. Please enter it below to confirm your purchase.
                </p>
                <input
                  type="text"
                  className="form-control form-control-lg text-center fw-bold"
                  style={{ letterSpacing: "10px", fontSize: "24px", border: "2px solid #eee" }}
                  maxLength="6"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value)}
                  placeholder="000000"
                />
              </div>
              <div className="modal-footer border-0 pt-0">
                <button 
                  className="btn btn-primary w-100 py-2 fw-bold" 
                  onClick={handleVerifyAndPay}
                  disabled={otpValue.length < 6 || isVerifying}
                >
                  {isVerifying ? "Verifying..." : "Confirm & Proceed"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}