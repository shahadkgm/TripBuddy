import { IUser } from '../../types/user.type.js';
import { IBaseRepository } from './IBaseRepository.js';

export interface IUserRepository extends IBaseRepository<IUser> {

  findByEmail(email: string): Promise<IUser | null>;

  // Password reset
  updateResetToken(userId: string, token: string, expires: number): Promise<void>;
  findByResetToken(hashedToken: string): Promise<IUser | null>;
  updatePassword(userId: string, newPassword: string): Promise<void>;

  // Google auth
  findOrCreateGoogleUser(data: {
    email: string;
    name: string;
  }): Promise<IUser>;

  // ✅ Email verification
  updateVerificationToken(
    userId: string,
    token: string,
    expires: number
  ): Promise<void>;

  findByVerificationToken(token: string): Promise<IUser | null>;
  verifyUser(userId: string): Promise<void>;
}
