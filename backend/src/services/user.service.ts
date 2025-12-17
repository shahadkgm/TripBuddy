import UserRepository from '../repositories/user.repository.js';
import { RegisterUserDTO } from '../types/user.dto.js';

class UserService {
  async registerUser(userData: RegisterUserDTO) {
    const existingUser = await UserRepository.findByEmail(userData.email);

    if (existingUser) {
      throw new Error("User with this email already exists.");
    }

    const newUser = await UserRepository.create(userData);

    return {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    };
  }

  async getAllUsers() {
    return await UserRepository.findAll();
  }
}

export default new UserService();
