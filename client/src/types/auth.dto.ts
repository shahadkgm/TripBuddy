// Data sent TO backend
export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface GoogleLoginDTO {
  token: string;
}

// Data received FROM backend
export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "guide";
  isBlocked?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}
