// backend/src/repositories/interfaces/IAdminRepository.ts

import { IGuide } from '../../types/guide.type';
import { IUser } from '../../types/user.type';
import { ITripDocument } from '../../types/trip.type';

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

  findUserById(userId: string): Promise<IUser | null>;

  updateUserBlockStatus(userId: string, isBlocked: boolean): Promise<IUser | null>;

  deleteUser(userId: string): Promise<boolean>;

  updateUserRole(userId: string, role: 'user' | 'guide' | 'admin'): Promise<IUser | null>;
  updateWalletBalance(
    userId: string,
    amount: number,
    tripId?: string,
    reason?: string
  ): Promise<IUser | null>;

  // guides
  getAllPendingGuides(): Promise<IGuide[]>;

  getAllGuides(
    page: number,
    limit: number,
    search: string
  ): Promise<{
    guides: IGuide[];
    totalPages: number;
    totalGuides: number;
    currentPage: number;
  }>;

  verifyGuide(guideId: string): Promise<IGuide | null>;
  rejectGuide(guideId: string, reason: string): Promise<IGuide | null>;
  deleteGuide(guideId: string): Promise<IGuide | null>;
  countVerifiedGuides(): Promise<number>;

  // trips
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

  updateTripStatus(tripId: string, status: string): Promise<ITripDocument | null>;
}
