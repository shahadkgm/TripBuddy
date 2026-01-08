// src/interfaces/IMailService.ts
export interface IMailService {
  sendResetEmail(email: string, token: string): Promise<void>;
  // add other mail methods here
}