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

  findUserById(id: string): Promise<IUser | null>;

  updateUserBlockStatus(id: string, isBlocked: boolean): Promise<IUser | null>;

  deleteUser(id: string): Promise<boolean>;

  updateUserRole(userId: string, role: 'user' | 'guide' | 'admin'): Promise<IUser | null>;
  updateWalletBalance(userId: string, amount: number): Promise<IUser | null>;

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

  deleteGuide(id: string): Promise<IGuide | null>;
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
