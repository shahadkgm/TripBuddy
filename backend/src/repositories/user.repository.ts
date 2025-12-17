
import UserModel from '../models/user.models.js'; 
import { IUser } from '../types/User.js';       

/**
 * Handles direct interaction with the database (Mongoose).
 */
class UserRepository {

    async create(userData: IUser) {
        const newUser = await UserModel.create(userData);
        return newUser;
    }

    async findByEmail(email: string) {
        return await UserModel.findOne({ email: email }).exec();
    }
    
    async findAll() {
        return await UserModel.find().exec();
    }
    
}

export default new UserRepository();