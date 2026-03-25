import { Types } from 'mongoose';
import { IAdminRepository } from '../../repositories/interface/IAdminRepository';
import { AppError } from '../../utils/AppError';
import { StatusCode } from '../../constants/statusCode.enum';
import { UserListDTO, DashboardStatsDTO, GuideListDTO, AdminGuideResponseDTO } from '../../dto/admin.dto';
import { UserResponseDTO } from '../../dto/user.dto';
import { toAdminGuideResponse } from '../../utils/guide.mapper';
import { UserMapper } from '../../utils/userMapper';
import { logger } from '../../utils/logger';
import { IAdminService } from '../interface/Iadminservice';
import { IKYCRepository } from '../../repositories/interface/IKycRepository';
import { KYCStatus } from '../../types/kyc.type';
import { IPaymentRepository } from '../../repositories/interface/IPaymentRepository';
import { IPaymentDocument } from '../../types/payment.type';
import { ITripDocument } from '../../types/trip.type';

export class AdminService implements IAdminService {
  constructor(
    private adminRepo: IAdminRepository,
    private kycRepo: IKYCRepository,
    private paymentRepo: IPaymentRepository
  ) { }

  async fetchAllUsers(page = 1, limit = 10, search = ''): Promise<UserListDTO> {
    const result = await this.adminRepo.getAllUsers(page, limit, search);

    return {
      users: result.users.map(user => UserMapper.toResponseDTO(user)),
      totalPages: result.totalPages,
      // currentPage: result.currentPage,
      totalUsers: result.totalUsers
    };
  }

  async toggleUserBlock(userId: string, blockedStatus: boolean, adminId: string): Promise<UserResponseDTO> {
    if (userId === adminId) {
      throw new AppError('You cannot block your own account', StatusCode.FORBIDDEN);
    }

    const user = await this.adminRepo.findUserById(userId);
    if (!user) {
      throw new AppError('User not found', StatusCode.NOT_FOUND,);
    }

    if (user.role === 'admin') {
      throw new AppError('Cannot modify another admin', StatusCode.FORBIDDEN);
    }

    const updatedUser = await this.adminRepo.updateUserBlockStatus(userId, blockedStatus);
    if (!updatedUser) {
      throw new AppError('Failed to update user block status', StatusCode.INTERNAL_SERVER_ERROR);
    }

    // Map the internal IUser to the public UserResponseDTO
    return UserMapper.toResponseDTO(updatedUser);
  }

  async removeUser(userId: string, adminId: string): Promise<boolean> {
    if (userId === adminId) {
      throw new AppError('Cannot delete yourself', StatusCode.FORBIDDEN);
    }

    const user = await this.adminRepo.findUserById(userId);
    if (user?.role === 'admin') {
      throw new AppError('Cannot delete another admin account', StatusCode.FORBIDDEN);
    }

    const deleted = await this.adminRepo.deleteUser(userId);
    if (!deleted) {
      throw new AppError('User not found', StatusCode.NOT_FOUND);
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

    const userId = profile.userId instanceof Types.ObjectId
      ? profile.userId.toString()
      : profile.userId._id.toString();

    await this.adminRepo.updateUserRole(userId, 'guide');

    await this.kycRepo.updateStatus(userId, 'approved');
    logger.info(`KYC status auto-approved for user: ${userId}`);

    return toAdminGuideResponse(profile);
  }


  async fetchAllGuides(page = 1, limit = 10, search = ''): Promise<GuideListDTO> {
    const data = await this.adminRepo.getAllGuides(page, limit, search);
    const mappedGuides = data.guides.map(toAdminGuideResponse);
    console.log('Mapped guides in service:', mappedGuides[0]);
    return {
      ...data,
      guides: mappedGuides
    };
  }

  async rejectApplication(guideId: string): Promise<boolean> {
    const deleted = await this.adminRepo.deleteGuide(guideId);

    if (!deleted) {
      throw new AppError('Guide application not found', StatusCode.NOT_FOUND);
    }

    return true;
  }

  async approveKYC(userId: string, status: KYCStatus, reason?: string): Promise<boolean> {
    const result = await this.kycRepo.updateStatus(userId, status, reason);
    if (!result) {
      throw new AppError('KYC record not found', StatusCode.NOT_FOUND);
    }
    logger.info(`KYC status updated manually for user: ${userId} to ${status}`);
    return true;
  }

  async getDashboardStats(): Promise<DashboardStatsDTO> {
    console.log('from get dashboard stats');
    const userStats = await this.adminRepo.getAllUsers(1, 1, '');
    logger.info(`from gerdashboard userstats: ${userStats}`);
    const verifiedGuidesCount = await this.adminRepo.countVerifiedGuides();
    logger.info(`from gerdashboard  guide count:${verifiedGuidesCount}`);

    const pending = await this.adminRepo.getAllPendingGuides();

    console.log('Dashboard Stats Debug:', {
      totalUsers: userStats.totalUsers,
      totalGuides: verifiedGuidesCount,
      pendingApplications: pending.length
    });

    return {
      totalUsers: userStats.totalUsers,
      totalGuides: verifiedGuidesCount,
      pendingApplications: pending.length,
    };
  }

  async getAllPayments(page: number, limit: number): Promise<{ payments: IPaymentDocument[], total: number }> {
    const result = await this.paymentRepo.findAllPayments(page, limit);
    return result;
  }

  async updatePaymentStatus(paymentId: string, status: string): Promise<IPaymentDocument> {
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) {
      throw new AppError('Payment not found', StatusCode.NOT_FOUND);
    }

    // Only credit wallet if status is changing to refunded and wasn't already refunded
    if (status === 'refunded' && payment.status !== 'refunded') {
      // Safely extract userId string whether it's an ObjectId or a populated object
      const userId = payment.userId instanceof Types.ObjectId 
        ? payment.userId.toString() 
        : (payment.userId as unknown as { _id: Types.ObjectId })._id.toString();

      await this.adminRepo.updateWalletBalance(userId, payment.amount);
      logger.info(`Credited ${payment.amount} to user ${userId} wallet due to refund.`);
    }

    const updatedPayment = await this.paymentRepo.updateById(paymentId, { status });
    if (!updatedPayment) {
        throw new AppError('Failed to update payment status', StatusCode.INTERNAL_SERVER_ERROR);
    }
    return updatedPayment;
  }

  // Trips
  async getAllTrips(page = 1, limit = 10, search = ''): Promise<{ trips: ITripDocument[], totalPages: number, currentPage: number, totalTrips: number }> {
    return await this.adminRepo.getAllTrips(page, limit, search);
  }

  async updateTripStatus(tripId: string, status: string): Promise<ITripDocument> {
    const updatedTrip = await this.adminRepo.updateTripStatus(tripId, status);
    if (!updatedTrip) {
      throw new AppError('Trip not found or failed to update', StatusCode.NOT_FOUND);
    }
    return updatedTrip;
  }
}