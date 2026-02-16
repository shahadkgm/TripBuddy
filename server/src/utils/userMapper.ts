// server/src/utils/userMapper.ts
import { IUser } from '../types/user.type';
import { UserResponseDTO } from '../dto/user.dto';


export class UserMapper {
  static toResponseDTO(user: IUser): UserResponseDTO {
    return {
      // Mapping the MongoDB _id to the DTO id
      id: user._id.toString(), 
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt?.toISOString() ?? '',
    };
  }
}

