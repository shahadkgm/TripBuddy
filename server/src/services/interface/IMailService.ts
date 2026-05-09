// src/interfaces/IMailService.ts
export interface IMailService {
  sendResetEmail(email: string, token: string): Promise<void>;
  sendVerificationEmail(email: string, name: string, verificationLink: string): Promise<void>;
}
