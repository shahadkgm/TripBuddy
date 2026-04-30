import { RegisterUserDTO, LoginDTO } from '../../dto/auth.dto';
import { AuthResponse } from '../../types/authResponse';

export interface IAuthService {
  registerUser(data: RegisterUserDTO): Promise<AuthResponse>;
  loginUser(data: LoginDTO): Promise<AuthResponse>;
  googleLogin(token: string): Promise<AuthResponse>;
  verifyEmail(token: string): Promise<AuthResponse>;
  refreshToken(token: string): Promise<string>;
}
