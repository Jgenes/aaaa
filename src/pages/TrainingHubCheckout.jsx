import React, { useState } from "react";
import "../App.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const TrainingHubCheckout = () => {
  const [paymentMethod, setPaymentMethod] = useState("");

  return (
    <>
      <NavBar />

      <div className="container my-5">
        <div className="row g-4">
          {/* ================= LEFT SIDE ================= */}
          <div className="col-md-7">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h4 className="mb-4 fw-semibold">
                  Billing & Contact Information
                </h4>

                {/* USER INFO */}
                <div className="mb-3">
                  <label className="form-label fw-medium">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ngutu Joseph"
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="joseph@email.com"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+255 7XX XXX XXX"
                    />
                  </div>
                </div>

                {/* ADDRESS */}
                <h6 className="mt-4 mb-3 fw-semibold">Billing Address</h6>

                <div className="mb-3">
                  <label className="form-label fw-medium">Street Address</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Plot 123, Sam Nujoma Road"
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">City</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Dar es Salaam"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">
                      Region / State
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Kinondoni"
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">Country</label>
                    <select className="form-select">
                      <option value="">Select country</option>
                      <option>Tanzania</option>
                      <option>Kenya</option>
                      <option>Rwanda</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">Postal Code</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="00255"
                    />
                  </div>
                </div>

                {/* OPTIONAL BUSINESS INFO */}
                <div className="mb-3">
                  <label className="form-label fw-medium">
                    Company / Organization{" "}
                    <span className="text-muted">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ABC Technologies Ltd"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-medium">
                    Tax Identification Number (TIN)
                    <span className="text-muted"> (Optional)</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="TIN12345678"
                  />
                </div>

                <hr className="my-4" />

                {/* PAYMENT METHOD */}
                <h5 className="mb-3 fw-semibold">Payment Method</h5>

                {[
                  "M-Pesa (Vodacom)",
                  "Airtel Money",
                  "Tigo Pesa",
                  "Bank Transfer",
                ].map((method) => (
                  <div
                    key={method}
                    className={`border rounded p-3 mb-2 d-flex align-items-center ${
                      paymentMethod === method ? "border-primary" : ""
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setPaymentMethod(method)}
                  >
                    <input
                      type="radio"
                      className="form-check-input"
                      checked={paymentMethod === method}
                      readOnly
                    />
                    <span className="ms-3">{method}</span>
                  </div>
                ))}

                <div className="form-check mt-4">
                  <input className="form-check-input" type="checkbox" />
                  <label className="form-check-label small">
                    I agree to the Terms & Conditions
                  </label>
                </div>

                <button
                  className="btn btn-primary w-100 mt-4 py-2"
                  disabled={!paymentMethod}
                >
                  Complete Payment
                </button>
              </div>
            </div>
          </div>

          {/* ================= RIGHT SIDE ================= */}
          <div className="col-md-5">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h5 className="fw-semibold">Order Summary</h5>

                <div className="border rounded p-3 mb-3">
                  <h6 className="mb-1">Personal Data Protection Training</h6>
                  <p className="small text-muted mb-0">
                    Provider: IBM Skills Network
                  </p>
                  <p className="small text-muted mb-0">
                    Mode: Online • Duration: 8 Weeks
                  </p>
                  <p className="small text-muted mb-0">
                    Start Date: 15 Feb 2026
                  </p>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span>Course Fee</span>
                  <strong>$20 USD</strong>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span>Tax</span>
                  <strong>$0</strong>
                </div>

                <hr />

                <div className="d-flex justify-content-between">
                  <span className="fw-semibold">Total</span>
                  <span className="fw-semibold">$20 USD</span>
                </div>

                <p className="text-muted small mt-3">
                  Secure checkout. Payment confirmation will be sent to your
                  email and phone number.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default TrainingHubCheckout;
