import { IUserDb } from '../../models/user.models.js';
import { IUser } from '../../types/user.type.js';

export interface IUserRepository {
  create(userData: Partial<IUser>): Promise<IUserDb>;
  findByEmail(email: string): Promise<IUserDb | null>;
  findAll(): Promise< IUserDb[]>;
findUserById(userId: string): Promise<IUserDb | null>;
  // Password reset
  updateResetToken(userId: string, token: string, expires: number): Promise<void>;
  findByResetToken(hashedToken: string): Promise< IUserDb | null>;
  updatePassword(userId: string, newPassword: string): Promise<void>;

  // Google auth
  findOrCreateGoogleUser(data: {
    email: string;
    name: string;
  }): Promise< IUserDb>;

  // ✅ Email verification
  updateVerificationToken(
    userId: string,
    token: string,
    expires: number
  ): Promise<void>;

  findByVerificationToken(token: string): Promise< IUserDb | null>;
  verifyUser(userId: string): Promise<void>;
  
}
