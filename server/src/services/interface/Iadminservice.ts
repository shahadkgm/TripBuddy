




import { DashboardStatsDTO, GuideListDTO, UserListDTO } from '../../dto/admin.dto.js';
import { AdminGuideResponseDTO } from '../../dto/admin.dto.js';
import { UserResponseDTO } from '../../dto/user.dto.js';
export interface IAdminService {
  fetchAllUsers(page: number, limit: number, search: string): Promise<UserListDTO>;

  toggleUserBlock(
    userId: string,
    blockedStatus: boolean,
    adminId: string
  ): Promise<UserResponseDTO>;

  removeUser(userId: string, adminId: string): Promise<boolean>;

  fetchPendingGuides(): Promise<AdminGuideResponseDTO[]>;

  approveGuide(guideId: string): Promise<AdminGuideResponseDTO>;

  fetchAllGuides(
    page: number,
    limit: number,
    search: string
  ): Promise<GuideListDTO>;

  rejectApplication(guideId: string): Promise<boolean>;

  getDashboardStats(): Promise<DashboardStatsDTO>;
}