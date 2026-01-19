import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import "./app.css";
import api from "../api/axio";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

function RegisterTenant() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async () => {
    // ✅ Validate fields
    const missing = [];
    if (!fullname) missing.push("Full Name");
    if (!email) missing.push("Email");
    if (!phone) missing.push("Phone");
    if (!password) missing.push("Password");
    if (!confirmPassword) missing.push("Confirm Password");

    if (missing.length > 0) {
      toast.error(`Please fill: ${missing.join(", ")}`);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // ✅ POST to tenant-register route
      await axios.get(" http://127.0.0.1:8000/sanctum/csrf-cookie");

      const response = await api.post("/tenant-register", {
        name: fullname,
        email,
        phone,
        password,
        password_confirmation: confirmPassword,
      });

      toast.success(
        response.data.message ||
          "Tenant registered successfully! Check your email to activate your account.",
      );

      // Redirect to login after 2 seconds
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="container py-5">
        <ToastContainer />
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h3 className="text-left fw-bold mb-2 t1">
                  Register as a Tenant
                </h3>
                <p className="text-left t2">
                  Create your tenant account to manage your Trainings
                </p>
                <form onSubmit={(e) => e.preventDefault()}>
                  {/* Full Name + Email */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Full Name</label>
                      <div className="position-relative">
                        <FaUser className="input-icon" />
                        <input
                          type="text"
                          className="form-control input-with-icon"
                          placeholder="John Doe"
                          value={fullname}
                          onChange={(e) => setFullname(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email</label>
                      <div className="position-relative">
                        <FaEnvelope className="input-icon" />
                        <input
                          type="email"
                          className="form-control input-with-icon"
                          placeholder="john@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <div className="position-relative">
                      <FaPhone className="input-icon" />
                      <PhoneInput
                        country="tz"
                        value={phone}
                        onChange={(value) => setPhone("+" + value)}
                        placeholder="Enter phone number"
                        containerStyle={{ width: "100%" }}
                        inputStyle={{
                          width: "100%",
                          height: "38px",
                          paddingLeft: "38px",
                        }}
                        buttonStyle={{ borderRadius: "0.375rem 0 0 0.375rem" }}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-4">
                    <label className="form-label">Password</label>
                    <div className="position-relative">
                      <FaLock className="input-icon" />
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control input-with-icon input-with-icon-right"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <span
                        className="input-icon-right"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-4">
                    <label className="form-label">Confirm Password</label>
                    <div className="position-relative">
                      <FaLock className="input-icon" />
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control input-with-icon input-with-icon-right"
                        placeholder="********"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <span
                        className="input-icon-right"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="button"
                    className="btn btn-primary w-100 py-2 tbutton"
                    onClick={handleRegister}
                    disabled={loading}
                    style={{ fontSize: "13px" }}
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </button>
                </form>
                <div className="mt-4">
                  <a href="/login">
                    <center>
                      <p style={{ fontSize: "13px", color: "#111827" }}>
                        Have an account login here...
                      </p>
                    </center>
                  </a>
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

export default RegisterTenant;
