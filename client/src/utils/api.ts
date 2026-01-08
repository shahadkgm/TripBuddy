import axios from "axios"
import { authService } from "../store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Response Interceptor: Catch 401 (Blocked/Expired) and redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 1. Clear everything immediately
      localStorage.clear(); 
      
      // 2. Only redirect if we aren't already on a public page
      const publicPages = ['/login', '/register'];
      if (!publicPages.includes(window.location.pathname)) {
        // Use replace so they can't click "back" into the protected area
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);


export default api;
