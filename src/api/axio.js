import axios from "axios";

const api = axios.create({
  baseURL: "https://traininghubtz.co.tz/api",
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
