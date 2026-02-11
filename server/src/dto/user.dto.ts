export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  password: string;
}
export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  role: 'user'|'guide'|'admin';
  isVerified: boolean;
  isBlocked: boolean;
  createdAt: string;
}
export interface RegisterUserResponseDTO {
  id: string;
  name: string;
  email: string;
  role: string;
}
