// backend/src/services/implementation/admin.service.ts
import { IAdminRepository } from "../../repositories/interface/IAdminRepository.js";
import { IAdminService } from "../interface/Iadminservice.js";

export class AdminService implements IAdminService {
  constructor(private adminRepo: IAdminRepository) {}

  async fetchAllUsers(page: number = 1, limit: number = 10, search: string = '') {
    return await this.adminRepo.getAllUsers(page, limit, search);
  }

  
  async toggleUserBlock(userId: string, blockedStatus: boolean, adminId: string) {
    if (userId === adminId) {
      throw new Error("You cannot block your own account.");
    }
    console.log("from userid in servise admin",userId)
    const user = await this.adminRepo.findUserById(userId);
    if (!user) throw new Error("User not found");
    
    if (user.role === 'admin') {
      throw new Error("Cannot modify status of another admin.");
    }
    
    return await this.adminRepo.updateUserBlockStatus(userId, blockedStatus);
  }

   async removeUser(userId: string, adminId: string) {
    if (userId === adminId) throw new Error("Cannot delete yourself.");
    return await this.adminRepo.deleteUser(userId);
  }

   //dashbord

  async getDashboardStats() {
    const userStats = await this.adminRepo.getAllUsers(1, 1, '');
    const pending = await this.adminRepo.getAllPendingGuides();
    
    return {
      totalUsers: userStats.totalUsers, 
      pendingApplications: pending.length,
      // (trips, revenue, etc.)
    };
  }
  
 

  //  guide Management
  async fetchPendingGuides() {
    return await this.adminRepo.getAllPendingGuides();
  }

  async approveGuide(guideId: string) {
    const updatedProfile = await this.adminRepo.verifyGuide(guideId);
    if (!updatedProfile) throw new Error("Guide application not found");

    
await this.adminRepo.updateUserRole(updatedProfile.userId.toString(),"guide")

    return updatedProfile;
  }

  async fetchAllGuides() {
    return await this.adminRepo.getAllGuides();
  }

  async rejectApplication(guideId: string) {
    const deletedGuide = await this.adminRepo.deleteGuide(guideId);
    if (!deletedGuide) {
      throw new Error("Guide application not found");
    }
    return deletedGuide;
  }
}