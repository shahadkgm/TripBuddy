import { IUser, IUserDocument } from "../../types/user.type.js";

export interface IUserRepository {
  create(userData: Partial<IUser>): Promise<IUserDocument>;
  findByEmail(email: string): Promise<IUserDocument | null>;
  findAll(): Promise<IUserDocument[]>;

  // Password reset
  updateResetToken(userId: string, token: string, expires: number): Promise<void>;
  findByResetToken(hashedToken: string): Promise<IUserDocument | null>;
  updatePassword(userId: string, newPassword: string): Promise<void>;

  // Google auth
  findOrCreateGoogleUser(data: {
    email: string;
    name: string;
  }): Promise<IUserDocument>;

  // ✅ Email verification
  updateVerificationToken(
    userId: string,
    token: string,
    expires: number
  ): Promise<void>;

  findByVerificationToken(token: string): Promise<IUserDocument | null>;
  verifyUser(userId: string): Promise<void>;
}
