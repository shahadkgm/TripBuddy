// server/src/utils/userMapper.ts
import { IUser } from '../types/user.type.js';
import { UserResponseDTO } from '../dto/user.dto.js';
import {  Types } from 'mongoose';


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
type LeanUser = Omit<IUser, '_id'> & {
  _id: Types.ObjectId;
};

// Helper to ensure database objects match the IUser interface
export const mapUserFromDb = (u: LeanUser): IUser => ({
  ...u,
  _id: u._id.toString(),
});
