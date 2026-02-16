import type { AuthUser, LoginDTO, RegisterDTO } from "../types/auth.dto";
import api from "../utils/api";



// const API_URL = "http://localhost:4000/api";

export const authService = {
  async register(userData: RegisterDTO) {
    const response = await api.post("/auth/register", userData)
    const { user, token } = response.data;
    if (token && user) {
      this.setToken(token);
      localStorage.setItem("user", JSON.stringify(user))
    }
    return response.data
  },

  //   async login(credentials: LoginDTO) {
  // const response = await api.post("/auth/login", credentials);
  //     const { user, accessToken}=response.data;
  //       console.log("from frontend tokens",accessToken)

  //     if (accessToken&& user) {
  //       localStorage.setItem("access token", accessToken);
  //         //  localStorage.setItem("refresh token", tokens.refreshToken); 
  //       localStorage.setItem("user", JSON.stringify(user));
  //       window.dispatchEvent(new Event("storage"));
  //     }

  //     return response.data;
  //   },
  async login(credentials: LoginDTO) {
    const response = await api.post("/auth/login", credentials);
    const { user, accessToken } = response.data;
    if (accessToken && user) {
      this.setToken(accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event("storage"))
    }
    return response.data
  },

  verifyEmail: async (token: string) => {
    return await api.get(`/auth/verify-email/${token}`);
  },

  async googleLogin(token: string) {
    const response = await api.post("/auth/google-login", { token });
    const { user, accessToken } = response.data;
    if (accessToken && user) {
      this.setToken(accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event("storage"));
    }
    return response.data
  },

  logout() {
    localStorage.removeItem("user");
    console.log("token from logout", localStorage.getItem("accessToken"))
    localStorage.removeItem("accessToken");
    window.location.replace("/login");
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
    const token = localStorage.getItem("accessToken");
    return token ? token.replace(/^"|"$/g, "") : null;
  },
  setToken(token: string) {
    localStorage.setItem("accessToken", token);
  }
};
