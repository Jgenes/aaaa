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

// Public routes never need a token — a 401 from one of them means the API is
// misconfigured, not that the visitor's session expired. Clearing the session
// there would log people out just for browsing the catalogue.
const PUBLIC_GET_PATHS = [
  /^\/public-courses(\/|$)/,
  /^\/public-reviews(\/|$)/,
  /^\/top-providers(\/|$)/,
  /^\/training(\/|$)/,
  /^\/cors-check(\/|$)/,
  /^\/mail-check(\/|$)/,
  /^\/download-document\//,
  /^\/qr-code\//,
];

const isPublicRequest = (config = {}) => {
  const method = String(config.method || "get").toLowerCase();
  if (method !== "get") return false;
  // Strip the base URL if axios kept the absolute form.
  const url = String(config.url || "").replace(/^https?:\/\/[^/]+\/api/, "");
  return PUBLIC_GET_PATHS.some((pattern) => pattern.test(url));
};

// 🔄 Handle expired token (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const wasAuthenticated = Boolean(
      error.config?.headers?.Authorization || error.config?.headers?.authorization
    );

    if (
      error.response?.status === 401 &&
      wasAuthenticated &&
      !isPublicRequest(error.config)
    ) {
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
