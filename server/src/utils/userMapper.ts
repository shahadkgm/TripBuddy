// server/src/utils/userMapper.ts
import { IUser} from '../types/user.type.js';
import { UserResponseDTO } from '../dto/user.dto.js';

export class UserMapper {
  static toResponseDTO(user: IUser): UserResponseDTO {
    return {
      id: user._id,   
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt?.toISOString() ?? '',
    };
  }
}

export const mapUserFromDb = (u: any): IUser => ({
  ...u,
  _id: u._id.toString()
});