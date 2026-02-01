import axios from "axios";
import type { AuthTokens, AuthUser, LoginDTO, RegisterDTO } from "../types/auth.dto";
import api from "../utils/api";


const API_URL = "http://localhost:4000/api/auth";

export const authService = {
  async register(userData: RegisterDTO) {
    const response = await axios.post(API_URL + "/register", userData);

    const { user, token } = response.data;

    if (token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    }

    return response.data;
  },

  async login(credentials: LoginDTO) {
    const response = await axios.post(API_URL + "/login", credentials);

    const { user, tokens }: { user: AuthUser; tokens: AuthTokens } =
      response.data;
      console.log("from frontend tokens",tokens)

    if (tokens?.accessToken&& user) {
      localStorage.setItem("access token", tokens.accessToken);
        //  localStorage.setItem("refresh token", tokens.refreshToken); 
      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event("storage"));
    }

    return response.data;
  },

  async googleLogin(token: string) {
    const response = await axios.post(API_URL + "/google-login", { token });

    const { user, tokens }: { user: AuthUser; tokens: AuthTokens } =
      response.data;

    if (tokens?.accessToken && user) {
      localStorage.setItem("token", tokens.accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event("storage"));
    }

    return response.data;
  },

  logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  },

  getCurrentUser(): AuthUser | null {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      const user: AuthUser = JSON.parse(userStr);
      return {
        ...user,
        isBlocked: user.isBlocked ?? false
      };
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    const token = localStorage.getItem("access token");
    return token ? token.replace(/^"|"$/g, "") : null;
  }
};
