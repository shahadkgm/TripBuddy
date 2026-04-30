import { DashboardStatsDTO, GuideListDTO, UserListDTO, RevenueStatsDTO } from '../../dto/admin.dto';
import { AdminGuideResponseDTO } from '../../dto/admin.dto';
import { UserResponseDTO } from '../../dto/user.dto';
import { KYCStatus } from '../../types/kyc.type';
import { IPaymentDocument } from '../../types/payment.type';
import { ITripDocument } from '../../types/trip.type';

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

  fetchAllGuides(page: number, limit: number, search: string): Promise<GuideListDTO>;

  rejectApplication(guideId: string, reason: string): Promise<boolean>;
  approveKYC(userId: string, status: KYCStatus, reason?: string): Promise<boolean>;
  getDashboardStats(): Promise<DashboardStatsDTO>;
  getAllPayments(
    page: number,
    limit: number
  ): Promise<{ payments: IPaymentDocument[]; total: number }>;
  updatePaymentStatus(paymentId: string, status: string): Promise<IPaymentDocument>;

  // Trips
  getAllTrips(
    page: number,
    limit: number,
    search: string
  ): Promise<{
    trips: ITripDocument[];
    totalPages: number;
    currentPage: number;
    totalTrips: number;
  }>;
  updateTripStatus(tripId: string, status: string): Promise<ITripDocument>;
  getRevenueStats(from?: Date, to?: Date): Promise<RevenueStatsDTO>;
}
