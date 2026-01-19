import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  // 🔑 Tumeondoa withCredentials kwa sababu tunatumia Bearer Token, sio Cookies
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json", // Ni muhimu ili Laravel ijue irudishe JSON error badala ya HTML
  },
});

// Add token automatically
api.interceptors.request.use(
  (config) => {
    // Hakikisha jina la key hapa linafanana na lile uliloweka wakati wa Login
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Mbinu ya ziada: Interceptor ya kushughulikia Token ikiexpire (401 error)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Kama token imekufa, mfute user na mrudishe login
      localStorage.removeItem("token");
      localStorage.removeItem("USER_INFO");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
