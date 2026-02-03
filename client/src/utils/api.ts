import axios from "axios"
import { authService } from "../services/c.authService";

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear(); 
      // window.location.replace("/login")
      
      const publicPages = ['/login', '/register'];
      if (!publicPages.includes(window.location.pathname)) {
        window.location.replace("/login");
      }
    }
    if(error.response?.status===403&&error.response.data?.message==="User blocked"){
      localStorage.clear();
      window.location.replace("/login?blocked=true")
    }

    return Promise.reject(error);
  }
);


export default api;
