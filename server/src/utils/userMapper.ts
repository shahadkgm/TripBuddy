// server/src/utils/userMapper.ts
import { IUserDocument } from '../types/user.type.js';
import { UserResponseDTO } from '../dto/user.dto.js';

export class UserMapper {
  static toResponseDTO(user: IUserDocument): UserResponseDTO {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt?.toString()??"",
    };
  }
}