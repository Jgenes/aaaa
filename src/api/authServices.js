// src/api/authService.js
import api from "./axio";

// Get CSRF cookie first
export const getCsrf = async () => {
  await api.get("/sanctum/csrf-cookie");
};

// USER / TENANT REGISTER
export const registerUser = async (data) => {
  await getCsrf();
  return api.post("/register", data);
};

export const registerTenant = async (data) => {
  await getCsrf();
  return api.post("/tenant-register", data);
};

// LOGIN → sends OTP
export const loginUser = async (data) => {
  await getCsrf();
  return api.post("/login", data);
};

// VERIFY OTP → returns token + redirect
export const verifyOtp = async (data) => {
  await getCsrf();
  return api.post("/verify-otp", data);
};

// GET current user
export const getMe = async () => {
  return api.get("/me");
};
