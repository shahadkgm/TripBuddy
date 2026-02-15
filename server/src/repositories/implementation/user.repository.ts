
import { IUserRepository } from '../interface/IUserRepository.js';
import { IUser } from '../../types/user.type.js';
import bcrypt from 'bcryptjs';
import { UserModel } from '../../models/user.models.js';
import { BaseRepository } from './base.repository.js';
import { UpdateQuery } from 'mongoose';

export class UserRepository extends BaseRepository<IUser> implements IUserRepository {

    constructor() {
        super(UserModel);
    }

    async findByEmail(email: string): Promise<IUser | null> {
        return await this.findOne({ email });
    }

    async updateResetToken(userId: string, token: string, expires: number): Promise<void> {
        await this.updateById(userId, {
            passwordResetToken: token,
            passwordResetExpires: expires
        });
    }

    async findByResetToken(hashedToken: string): Promise<IUser | null> {
        return await this.findOne({
            passwordResetToken: hashedToken
        });
    }

    async updatePassword(userId: string, newPassword: string): Promise<void> {
        // 1. Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 2. Update user and unset/clear reset fields
        const update: UpdateQuery<IUser> = {
            $set: { password: hashedPassword },
            $unset: {
                passwordResetToken: 1,
                passwordResetExpires: 1
            }
        };
        await this.updateById(userId, update);
    }

    async findOrCreateGoogleUser(data: {
        name: string;
        email: string;
    }): Promise<IUser> {
        let user = await this.findOne({ email: data.email });
        if (!user) {
            user = await this.create({
                name: data.name,
                email: data.email,
                role: 'user',
                isVerified: true,
                isBlocked: false
            });
        }
        return user;
    }

    async updateVerificationToken(userId: string, token: string, expires: number): Promise<void> {
        await this.updateById(userId, {
            verificationToken: token,
            verificationTokenExpires: expires,
        });
    }

    async findByVerificationToken(token: string): Promise<IUser | null> {
        return await this.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: new Date() } // Date.now() works but new Date() is safer for comparison
        });
    }

    async verifyUser(userId: string): Promise<void> {
        const update: UpdateQuery<IUser> = {
            $set: { isVerified: true },
            $unset: {
                verificationToken: 1,
                verificationTokenExpires: 1,
            },
        };
        await this.updateById(userId, update);
    }
}
