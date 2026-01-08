import { LoginDTO, RegisterUserDTO } from "../../types/auth.dto.js";
import { AuthResponse } from "../../types/authResponse.js";

export interface IAuthService {
  registerUser(data: RegisterUserDTO): Promise<AuthResponse>;
  loginUser(data: LoginDTO): Promise<AuthResponse> 
    googleLogin(token: string): Promise<AuthResponse>; 

}