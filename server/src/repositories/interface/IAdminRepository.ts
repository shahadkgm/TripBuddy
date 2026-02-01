// backend/src/repositories/interfaces/IAdminRepository.ts

import { IUser } from "../../types/user.type.js";
import { IGuideProfile } from "../../domain/entities/GuideProfile.js";

export interface IAdminRepository {
  // users
  getAllUsers(
    page: number,
    limit: number,
    search: string
  ): Promise<{
    users: IUser[];
    totalPages: number;
    currentPage: number;
    totalUsers: number;
  }>;

  findUserById(id: string): Promise<IUser | null>;

  updateUserBlockStatus(
    id: string,
    isBlocked: boolean
  ): Promise<IUser | null>;

  deleteUser(id: string): Promise<boolean>;
 
    updateUserRole(
      userId:string,
      role:"user"|"guide"|"admin"
    ):Promise<IUser|null>;




  // guides
  getAllPendingGuides(): Promise<IGuideProfile[]>;

  getAllGuides(): Promise<IGuideProfile[]>;

  verifyGuide(guideId: string): Promise<IGuideProfile | null>;

  deleteGuide(id: string): Promise<IGuideProfile | null>;
}
