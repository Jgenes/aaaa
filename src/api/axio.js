import axios from "axios";

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
      localStorage.removeItem("token");
      localStorage.removeItem("USER_INFO");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
