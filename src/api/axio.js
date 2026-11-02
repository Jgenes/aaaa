import axios from "axios";
import {
  clearSession,
  isAuthPage,
  loginPathFor,
  rememberReturnTo,
  requiresSession,
} from "../lib/session";

// Override with VITE_API_BASE_URL when pointing the app at a local/staging API.
const baseURL =
  import.meta.env.VITE_API_BASE_URL || "https://api.traininghubtz.co.tz/api";

const api = axios.create({
  baseURL,
  headers: {
    Accept: "application/json", // ✔ keep this
  },
});

// 🔐 Add token automatically (Bearer auth)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// 🔄 Handle expired token (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();

      // Send the visitor back to the exact page they were working on once
      // they sign in again — but never bounce them in circles on an auth page.
      const { pathname = "", search = "" } = window.location;
      if (!isAuthPage(pathname) && requiresSession(pathname)) {
        const target = `${pathname}${search}`;
        rememberReturnTo(target);
        window.location.replace(loginPathFor(target));
      }
    }
    return Promise.reject(error);
  },
);

export default api;
