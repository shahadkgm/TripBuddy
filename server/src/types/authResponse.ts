// src/types/auth/authResponse.ts
// export interface AuthResponse {
//   message: string;
//   tokens?: {
//     accessToken: string;
//     refreshToken: string;
//   };
//   user?: {
//     id: string;
//     name: string;
//     email: string;
//     role: 'user' | 'guide' | 'admin';
//     isBlocked:boolean
//   };
// }

export type Role = 'user' | 'guide' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isBlocked: boolean;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

/* login */
export interface LoginResponse {
  message: string;
  user: AuthUser;
  tokens: Tokens;
}

/* register */
export interface RegisterResponse {
  message: string;
  user: AuthUser;
}

/* logout / forgot / reset */
export interface MessageResponse {
  message: string;
}
