//backend/src/repositories/user.repository.ts
import { IUserRepository } from '../interface/IUserRepository.js';
import UserModel from '../../models/user.models.js'; 
import { IUser } from '../../types/user.type.js';       
import bcrypt from 'bcryptjs'; // Make sure to install bcryptjs

export class UserRepository implements IUserRepository  {

    async create(userData: IUser) {
        // const newUser = await UserModel.create(userData);
        // return newUser;
        return await UserModel.create(userData);
    }

    async findByEmail(email: string) {
        return await UserModel.findOne({ email: email }).exec();
    }
    
    async findAll() {
        return await UserModel.find().exec();
    } 
    
    async updateResetToken(userId: string, token: string, expires: number) {
    await UserModel.findByIdAndUpdate(userId, {
      passwordResetToken: token,
      passwordResetExpires: expires
    });
  }
async findByResetToken(hashedToken: string) {
        return await UserModel.findOne({ 
            passwordResetToken: hashedToken 
        }).exec();
    }

    async updatePassword(userId: string, newPassword: string) {
        // 1. Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 2. Update user and unset/clear reset fields so token can't be used twice
        await UserModel.findByIdAndUpdate(userId, {
            password: hashedPassword,
            $unset: { 
                passwordResetToken: 1, 
                passwordResetExpires: 1 
            }
        });
    }

    async findOrCreateGoogleUser(data:{
        name:string;
        email:string
    }){
        let user=await UserModel.findOne({email:data.email})
        if(!user){
            user=await UserModel.create({
                name:data.name,
                email:data.email,
                role:"user",
                isVerified:true,
                isBlocked:false
            })
        }
        return user;
    }
    
}



// export default new UserRepository();