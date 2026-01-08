// backend/src/services/implementation/admin.service.ts
import UserModel from "../../models/user.models.js";
import { AdminRepository } from "../../repositories/implementation/admin.repository.js";

export class AdminService {
  constructor(private adminRepo: AdminRepository) {}

  async fetchAllUsers(page: number = 1, limit: number = 10, search: string = '') {
    return await this.adminRepo.getAllUsers(page, limit, search);
  }

  async getDashboardStats() {
    const userStats = await this.adminRepo.getAllUsers(1, 1, '');
    const pending = await this.adminRepo.getAllPendingGuides();
    
    return {
      totalUsers: userStats.totalUsers, 
      pendingApplications: pending.length,
      // (trips, revenue, etc.)
    };
  }

  async toggleUserBlock(userId: string, blockedStatus: boolean, adminId: string) {
    if (userId === adminId) {
      throw new Error("You cannot block your own account.");
    }

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

  // 4 guide Management
  async fetchPendingGuides() {
    return await this.adminRepo.getAllPendingGuides();
  }

  async approveGuide(guideId: string) {
    const updatedProfile = await this.adminRepo.verifyGuide(guideId);
    if (!updatedProfile) throw new Error("Guide application not found");

    
    await UserModel.findByIdAndUpdate(updatedProfile.userId, {
      role: 'guide'
    });

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