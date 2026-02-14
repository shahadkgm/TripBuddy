// backend/src/services/implementation/admin.service.ts
import { IAdminRepository } from '../../repositories/interface/IAdminRepository.js';
import { IAdminService } from '../interface/Iadminservice.js';
import { AppError } from '../../utils/AppError.js';
import { StatusCode } from '../../constants/statusCode.enum.js';
import { UserListDTO, DashboardStatsDTO, GuideListDTO, AdminGuideResponseDTO } from '../../dto/admin.dto.js';
import { UserResponseDTO } from '../../dto/user.dto.js';
// import { GuideResponseDTO } from '../../dto/guide.dto.js';
import { toAdminGuideResponse} from '../../utils/guide.mapper.js'; // Ensure this exists
import { UserMapper } from '../../utils/userMapper.js'; // Ensure this exists
import { logger } from '../../utils/logger.js';

export class AdminService implements IAdminService {
  constructor(private adminRepo: IAdminRepository) {}

  async fetchAllUsers(page = 1, limit = 10, search = ''): Promise<UserListDTO> {
  const result = await this.adminRepo.getAllUsers(page, limit, search);
  
  return {
    users: result.users.map(user => UserMapper .toResponseDTO(user)),
    totalPages: result.totalPages,
    // currentPage: result.currentPage,
    totalUsers: result.totalUsers
  };
}

  async toggleUserBlock(userId: string, blockedStatus: boolean, adminId: string): Promise<UserResponseDTO> {
    if (userId === adminId) {
      throw new AppError('You cannot block your own account',StatusCode.FORBIDDEN );
    }

    const user = await this.adminRepo.findUserById(userId);
    if (!user) {
      throw new AppError('User not found',StatusCode.NOT_FOUND,);
    }

    if (user.role === 'admin') {
      throw new AppError( 'Cannot modify another admin',StatusCode.FORBIDDEN);
    }

    const updatedUser = await this.adminRepo.updateUserBlockStatus(userId, blockedStatus);
    if (!updatedUser) {
      throw new AppError( 'Failed to update user block status',StatusCode.INTERNAL_SERVER_ERROR);
    }
    
    // Map the internal IUser to the public UserResponseDTO
    return UserMapper.toResponseDTO(updatedUser);
  }

  async removeUser(userId: string, adminId: string): Promise<boolean> {
    if (userId === adminId) {
      throw new AppError( 'Cannot delete yourself',StatusCode.FORBIDDEN);
    }

    const deleted = await this.adminRepo.deleteUser(userId);
    if (!deleted) {
      throw new AppError( 'User not found',StatusCode.NOT_FOUND);
    }

    return deleted;
  }
async fetchPendingGuides(): Promise<AdminGuideResponseDTO[]> {
  const guides = await this.adminRepo.getAllPendingGuides();
  return guides.map(toAdminGuideResponse);
}

async approveGuide(guideId: string): Promise<AdminGuideResponseDTO> {
  // logger.debug(`userid from approveguide${guideId}`)
  const profile = await this.adminRepo.verifyGuide(guideId);
  logger.info(`info from approveguide admin${profile}`);

  if (!profile) {
    throw new AppError('Guide application not found', StatusCode.NOT_FOUND);
  }

  const userId =
    typeof profile.userId === 'object'
      ? (profile.userId as any)._id.toString()
      : profile.userId.toString();

  await this.adminRepo.updateUserRole(userId, 'guide');

  return toAdminGuideResponse(profile);
}


  async fetchAllGuides(page = 1, limit = 10, search = ''): Promise<GuideListDTO> {
    const data = await this.adminRepo.getAllGuides(page, limit, search);
    console.log('data from admin service',data);
    // logger.debug("data from adminservice ,f-allguide",data)
    return {
      ...data,
      guides: data.guides.map(toAdminGuideResponse)
    };
  }

  async rejectApplication(guideId: string): Promise<boolean> {
    const deleted = await this.adminRepo.deleteGuide(guideId);

    if (!deleted) {
      throw new AppError('Guide application not found',StatusCode.NOT_FOUND );
    }

    return true;
  }

  async getDashboardStats(): Promise<DashboardStatsDTO> {
    const userStats = await this.adminRepo.getAllUsers(1, 1, '');
    const pending = await this.adminRepo.getAllPendingGuides();
    
    return {
      totalUsers: userStats.totalUsers, 
      pendingApplications: pending.length,
    };
  }
}