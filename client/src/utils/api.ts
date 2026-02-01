import axios from "axios"
import { authService } from "../services/authService";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    console.log("token",token)
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
      // window.location.replace("/login")
      
      // 2. Only redirect if we aren't already on a public page
      const publicPages = ['/login', '/register'];
      if (!publicPages.includes(window.location.pathname)) {
        // Use replace so they can't click "back" into the protected area
        window.location.replace("/login");
      }
    }
    if(error.response.status===403&&error.response.message==="User blocked"){
      localStorage.clear();
      window.location.replace("/login?blocked=true")
    }

    return Promise.reject(error);
  }
);


export default api;
