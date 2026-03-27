import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL + "/api/store";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ── Request Interceptor ──────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // ✅ لو الـ refresh نفسه فشل، وقف فوراً
    if (original.url?.includes("/auth/token/refresh/")) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("refresh_token");

      if (!refresh) {
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // ✅ axios مباشرة مش api عشان مندخلش في الـ interceptor
        const res = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
          refresh,
        });
        const newAccess = res.data.access;
        localStorage.setItem("access_token", newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
