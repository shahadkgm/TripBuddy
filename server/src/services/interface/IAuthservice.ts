import { RegisterUserDTO, LoginDTO } from "../../dto/auth.dto.js";
import { AuthResponse } from "../../types/authResponse.js";

export interface IAuthService {
  registerUser(data: RegisterUserDTO): Promise<AuthResponse>;
  loginUser(data: LoginDTO): Promise<AuthResponse>;
  // Add this line
  googleLogin(token: string): Promise<AuthResponse>; 
}