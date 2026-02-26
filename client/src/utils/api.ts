import axios from "axios";
import { authService } from "../services/c.authService";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true //4 cookie
});


// ==========================
// REQUEST → attach access token
// ==========================

api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  }
);


// ==========================
// RESPONSE --> refresh logic
// ==========================
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    //  access expired --> try refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.data.accessToken;

        authService.setToken(newAccessToken);

        // Ensure headers exist and attach the new token
        // if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        // }

        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        localStorage.clear();
        window.location.replace("/login");
        return Promise.reject(refreshError);
      }
    }

    //  blocked user
    if (
      error.response?.status === 403 &&
      error.response.data?.message === "User blocked"
    ) {
      localStorage.clear();
      window.location.replace("/login?blocked=true");
    }

    return Promise.reject(error);
  }
);

export default api;
