  //client/src/store/authStore.ts
  import axios from 'axios';
import { Users } from 'lucide-react';
// Optional: Import your DTO types if you have them shared
// import { LoginDTO, RegisterUserDTO } from '../types/auth.dto';

const API_URL = 'http://localhost:4000/api/auth'; 

export const authService = {
  async register(userData: any) {
    console.log("hi")
    const response = await axios.post(`${API_URL}/register`, userData);
    const {user,token}=response.data
    console.log("user and token from authservice store",user,token)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(credentials: any) {
    const response = await axios.post(`${API_URL}/login`, credentials);
    const { user, tokens } = response.data;
    
    if (tokens?.accessToken && user) {
      localStorage.setItem('token', tokens.accessToken); 
      // 2. Store the user object
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event("storage"))
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

 getCurrentUser() {
  const userStr = localStorage.getItem('user');
  if (!userStr || userStr === "undefined" || userStr === "null") return null;
  try {
    const user = JSON.parse(userStr);
    // Return with a default to prevent "undefined" crashes in ProtectedRoute
    return {
      ...user,
      isBlocked: user.isBlocked ?? false 
    };
  } catch (e) {
    return null;
  }
},

  getToken() {
    const token=localStorage.getItem('token')
    if(!token)return null;
    return token.replace(/^"|"$/g, "")
  },
  async googleLogin(credential: string) {
    // Send the Google ID token to your backend
    const response = await axios.post(`${API_URL}/google-login`, { token: credential });
    const { user, tokens } = response.data;
    
    if (tokens?.accessToken && user) {
      // Consistent with your login storage logic
      localStorage.setItem('token', tokens.accessToken); 
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event("storage"));
    }
    return response.data;
  }
  
};