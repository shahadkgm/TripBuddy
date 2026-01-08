// src/types/auth/authResponse.ts
export interface AuthResponse {
  message: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    role: "user" | "guide" | "admin";
    isBlocked:boolean
  };
}