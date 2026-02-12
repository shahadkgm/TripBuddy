// backend/src/services/implementation/admin.service.ts
import { IAdminRepository } from '../../repositories/interface/IAdminRepository.js';
import { IAdminService } from '../interface/Iadminservice.js';
import { AppError } from '../../utils/AppError.js';
import { StatusCode } from '../../constants/statusCode.enum.js';
import { IUser } from '../../types/user.type.js';
import { Guide } from '../../types/guide.type.js';

export class AdminService implements IAdminService {
  constructor(private adminRepo: IAdminRepository) {}

  async fetchAllUsers(page = 1, limit = 10, search = '') {
    return this.adminRepo.getAllUsers(page, limit, search);
  }

  async toggleUserBlock(userId: string, blockedStatus: boolean, adminId: string):Promise<IUser> {
    if (userId === adminId) {
      throw new AppError(StatusCode.FORBIDDEN, 'You cannot block your own account');
    }

    const user = await this.adminRepo.findUserById(userId);
    if (!user) {
      throw new AppError(StatusCode.NOT_FOUND, 'User not found');
    }

    if (user.role === 'admin') {
      throw new AppError(StatusCode.FORBIDDEN, 'Cannot modify another admin');
    }

    const updatedUser=await this.adminRepo.updateUserBlockStatus(userId, blockedStatus);
    if(!updatedUser){
      throw new AppError(StatusCode.INTERNAL_SERVER_ERROR,'Faild to update user block status');
    };
    return updatedUser;
  };

  async removeUser(userId: string, adminId: string) {
    if (userId === adminId) {
      throw new AppError(StatusCode.FORBIDDEN, 'Cannot delete yourself');
    }

    const deleted = await this.adminRepo.deleteUser(userId);
    if (!deleted) {
      throw new AppError(StatusCode.NOT_FOUND, 'User not found');
    }

    return deleted;
  }

  async fetchPendingGuides():Promise<Guide[]> {
    return this.adminRepo.getAllPendingGuides();
  }

  async approveGuide(guideId: string) {
    const profile = await this.adminRepo.verifyGuide(guideId);

    if (!profile) {
      throw new AppError(StatusCode.NOT_FOUND, 'Guide application not found');
    }

    await this.adminRepo.updateUserRole(profile.userId.toString(), 'guide');
    return profile;
  }

  async fetchAllGuides(page=1,limit=10,search='') {
    return this.adminRepo.getAllGuides(page,limit,search);
  }

  async rejectApplication(guideId: string):Promise<boolean> {
    const deleted = await this.adminRepo.deleteGuide(guideId);

    if (!deleted) {
      throw new AppError(StatusCode.NOT_FOUND, 'Guide application not found');
    }

    return true;
  }

  
 async getDashboardStats(): Promise<{ totalUsers: number; pendingApplications: number }> {
    const userStats = await this.adminRepo.getAllUsers(1, 1, '');
    const pending = await this.adminRepo.getAllPendingGuides();
    
    return {
      totalUsers: userStats.totalUsers, 
      pendingApplications: pending.length,
    };
  }
}






   //dashbord
