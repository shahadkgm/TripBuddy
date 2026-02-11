// backend/src/repositories/interfaces/IAdminRepository.ts

import { Guide, GuideCreate } from '../../types/guide.type.js';
import { IUser } from '../../types/user.type.js';

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
      role:'user'|'guide'|'admin'
    ):Promise<IUser|null>;




  // guides
  getAllPendingGuides(): Promise<Guide[]>;

  getAllGuides(page:number,limit:number,search:string): Promise<{
    guides:Guide[],
    totalPages:number,
    totalGuides:number,
    currentPage:number
  }>;

  verifyGuide(guideId: string): Promise<Guide | null>;

  deleteGuide(id: string): Promise<Guide | null>;
}
