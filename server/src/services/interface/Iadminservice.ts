

import { IUserListResponse } from '../../types/admin.types.js';
import { Guide } from '../../types/guide.type.js';
import { IUser } from '../../types/user.type.js';

//    fetchPendingGuides():Promise<any[]>;
//    approveGuide(guideId: string):Promise<any>;
//    fetchAllGuides():Promise<any[]>
//    rejectApplication(guideId: string):Promise<any>

// }
// backend/src/services/interface/Iadminservice.ts

export interface IAdminService {
  // User Management
  fetchAllUsers(page: number, limit: number, search: string): Promise<IUserListResponse>;
  toggleUserBlock(userId: string, blockedStatus: boolean, adminId: string): Promise<IUser>;
  removeUser(userId: string, adminId: string): Promise<boolean>;

  // Dashboard
  getDashboardStats(): Promise<{
    totalUsers: number;
    pendingApplications: number;
  }>;

  // Guide Management
  fetchPendingGuides(): Promise<Guide[]>;
  approveGuide(guideId: string): Promise<Guide>;
  fetchAllGuides(page:number,limit:number,search:string): Promise<{
    guides:Guide[],
    totalPages:number,
    totalGuides:number,
    currentPage:number
  }>;
  rejectApplication(guideId: string): Promise<boolean>;
}