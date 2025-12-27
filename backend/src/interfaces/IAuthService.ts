// src/interfaces/IAuthService.ts
export interface IAuthService {
  registerUser(data: any): Promise<{ user: any; token: string }>;
  loginUser(data: any): Promise<{ user: any; token: string }> 
}