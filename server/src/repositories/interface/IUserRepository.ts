import { IUser } from '../../types/user.type';
import { IBaseRepository } from './IBaseRepository';
import { CreateUserDTO, GoogleUserDTO } from '../../dto/user.dto';

export interface IUserRepository extends IBaseRepository<IUser, CreateUserDTO> {
  findByEmail(email: string): Promise<IUser | null>;

  // Password reset
  updateResetToken(userId: string, token: string, expires: number): Promise<void>;
  findByResetToken(hashedToken: string): Promise<IUser | null>;
  updatePassword(userId: string, newPassword: string): Promise<void>;

  // Google auth
  findOrCreateGoogleUser(data: GoogleUserDTO): Promise<IUser>;

  // ✅ Email verification
  updateVerificationToken(userId: string, token: string, expires: number): Promise<void>;

  findByVerificationToken(token: string): Promise<IUser | null>;
  verifyUser(userId: string): Promise<void>;

  // Wallet
  updateWalletBalance(userId: string, amount: number): Promise<void>;
}
