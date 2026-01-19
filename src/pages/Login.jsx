import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import api from "../api/axio";
import "react-toastify/dist/ReactToastify.css";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      // await api.get("/sanctum/csrf-cookie");

      const response = await api.post("/login", { email, password });

      const data = response.data;

      // Save email temporarily for OTP page
      localStorage.setItem("loginEmail", email);

      toast.success(data.message || "OTP sent to your email. Please verify.");

      // Redirect to OTP verification page
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
      <div className="container py-5">
        <ToastContainer />

        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h3 className="text-left fw-bold mb-2 t1">Login</h3>
                <p className="text-left t2">Access your account</p>

                <form onSubmit={(e) => e.preventDefault()}>
                  {/* Email */}
                  <div className="mb-3">
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
                        style={{ cursor: "pointer" }}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <a href="">
                      <p style={{ fontSize: "13px", color: "#111827" }}>
                        Forgot password ?
                      </p>
                    </a>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary w-100 py-2 tbutton"
                    onClick={handleLogin}
                    disabled={loading}
                    style={{ fontSize: "13px" }}
                  >
                    {loading ? "Sending OTP..." : "Login"}
                  </button>
                  <div className="mt-4">
                    <a href="/register">
                      <center>
                        <p style={{ fontSize: "13px", color: "#111827" }}>
                          Don't have an account register here...
                        </p>
                      </center>
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Login;
