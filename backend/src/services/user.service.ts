// src/services/user.service.ts
import { IUserRepository } from '../interfaces/IUserRepository.js';
import { RegisterUserDTO } from '../types/user.dto.js';

export class UserService {
  // We depend on the Interface, not the Class
  constructor(private userRepository: IUserRepository) {}

  async  registerUser(userData: RegisterUserDTO) {
    const existingUser = await this.userRepository.findByEmail(userData.email);

    if (existingUser) {
      throw new Error("User with this email already exists.");
    }

    const newUser = await this.userRepository.create(userData as any);

    return {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    };
  }

  async getAllUsers() {
    return await this.userRepository.findAll();
  }
}

// export default new UserService();
