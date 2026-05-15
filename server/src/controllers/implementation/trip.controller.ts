import { Request, Response } from 'express';
import { ITripService } from '../../services/interface/ITripService';
import { CreateTripDTO } from '../../dto/trip.dto';
import { asyncHandler } from '../../utils/asyncHandler';
import { logger } from '@/utils/logger';

import { BaseController } from './base.controller';
import { AuthRequest } from '../../types/authRequest';

/** Safely extracts the string ID from either a populated object or a raw ObjectId */
const getMemberId = (m: unknown): string => {
  if (m && typeof m === 'object' && '_id' in m) {
    return (m as { _id: { toString(): string } })._id.toString();
  }
  return String(m);
};

export class TripController extends BaseController {
  constructor(private readonly _tripService: ITripService) {
    super();
  }

  createTrip = asyncHandler(async (req: Request<{}, {}, CreateTripDTO>, res: Response) => {
    const tripData = req.body;
    logger.info('Trip creation request received', { tripData });
    const newTrip = await this._tripService.createTrip(tripData);
    this.sendCreated(res, newTrip, 'Trip created successfully');
  });

  getUserTrips = asyncHandler(
    async (
      req: AuthRequest<{ userId: string }, unknown, unknown, { page?: string; limit?: string }>,
      res: Response
    ) => {
      const { userId } = req.params;
    
    // Authorization Check: Users can only fetch their own trips
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      this.sendError(res, 'Unauthorized to view these trips', 403);
      return;
    }

    const { page, limit } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;

    const result = await this._tripService.getUserTrips(userId, pageNum, limitNum);
    this.sendSuccess(res, result, 'User trips fetched successfully');
  });

  getTripById = asyncHandler(async (req: AuthRequest<{ tripId: string }>, res: Response) => {
    const { tripId } = req.params;
    const trip = await this._tripService.getTripById(tripId);

    if (!trip) {
      this.sendNotFound(res, 'Trip not found');
      return;
    }

    // Any authenticated user can view a trip's public details.
    // This is required so users can browse trips on "Find Trips" and
    // see the details before deciding to send a join request.
    // Write operations (update, finalize, etc.) have their own stricter owner-only checks.
    this.sendSuccess(res, trip, 'Trip fetched successfully');
  });

  getAllTrips = asyncHandler(async (req: Request, res: Response) => {
    const { destination, transport, interest, page, limit } = req.query;

    const filters = {
      destination: destination as string,
      transport: transport as string,
      interest: interest as string,
    };

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;

    const result = await this._tripService.getAllTrips(filters, pageNum, limitNum);
    this.sendSuccess(res, result, 'All trips fetched successfully');
  });

  updateTrip = asyncHandler(
    async (req: AuthRequest<{ tripId: string }, unknown, Partial<CreateTripDTO>>, res: Response) => {
      const { tripId } = req.params;
    const updateData = req.body;
    
    const trip = await this._tripService.getTripById(tripId);
    if (!trip) {
      this.sendNotFound(res, 'Trip not found');
      return;
    }

    // Authorization Check: Only the trip owner can update it
    const ownerId = trip.userId._id ? trip.userId._id.toString() : trip.userId.toString();
    if (ownerId !== req.user?.id && req.user?.role !== 'admin') {
      this.sendError(res, 'Unauthorized to update this trip', 403);
      return;
    }

    logger.info('Trip update request received', { tripId, updateData });
    const updatedTrip = await this._tripService.updateTrip(tripId, updateData);
    if (!updatedTrip) {
      this.sendNotFound(res, 'Trip not found or update failed');
      return;
    }
    this.sendSuccess(res, updatedTrip, 'Trip updated successfully');
  });

  finalizeTrip = asyncHandler(
    async (
      req: AuthRequest<{ tripId: string }, unknown, { budget: number; depositAmount: number }>,
      res: Response
    ) => {
      const { tripId } = req.params;
      const { budget, depositAmount } = req.body;
      const userId = req.user?.id as string;

      const trip = await this._tripService.finalizeTrip(tripId, userId, budget, depositAmount);
      this.sendSuccess(res, trip, 'Trip finalized successfully');
    }
  );

  cancelTrip = asyncHandler(async (req: AuthRequest<{ tripId: string }>, res: Response) => {
    const { tripId } = req.params;
    const userId = req.user?.id as string;

    const trip = await this._tripService.cancelTrip(tripId, userId);
    this.sendSuccess(res, trip, 'Trip cancelled and members refunded');
  });

  leaveTrip = asyncHandler(async (req: AuthRequest<{ tripId: string }>, res: Response) => {
    const { tripId } = req.params;
    const userId = req.user?.id as string;

    const trip = await this._tripService.leaveTrip(tripId, userId);
    this.sendSuccess(
      res,
      trip,
      'You have left the trip. Necessary cancellation fee deductions were processed.'
    );
  });

  completeTrip = asyncHandler(async (req: AuthRequest<{ tripId: string }>, res: Response) => {
    const { tripId } = req.params;
    const userId = req.user?.id as string;

    const trip = await this._tripService.completeTrip(tripId, userId);
    this.sendSuccess(res, trip, 'Trip successfully completed and escrow funds released.');
  });

  getChatHistory = asyncHandler(
    async (
      req: AuthRequest<{ tripId: string }, unknown, unknown, { page?: string; limit?: string }>,
      res: Response
    ) => {
    const { tripId } = req.params;
    
    const trip = await this._tripService.getTripById(tripId);
    if (!trip) {
      this.sendNotFound(res, 'Trip not found');
      return;
    }

    // Authorization Check: Only members or admin can view chat history
    // members may be populated objects OR raw ObjectIds — getMemberId handles both
    const isMember = trip.members.some(m => getMemberId(m) === req.user?.id);
    if (!isMember && req.user?.role !== 'admin') {
      this.sendError(res, 'Unauthorized to view chat history', 403);
      return;
    }

    const { page, limit } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50; // History usually loads more

    const chatHistory = await this._tripService.getChatHistory(tripId, pageNum, limitNum);
    this.sendSuccess(res, chatHistory, 'Chat history fetched successfully');
  });

  assignGuide = asyncHandler(
    async (
      req: AuthRequest<{ tripId: string }, unknown, { guideId?: string | null }>,
      res: Response
    ) => {
      const { tripId } = req.params;
      const { guideId } = req.body; // can be a string ID or null
      const userId = req.user?.id as string;

      const updatedTrip = await this._tripService.assignGuide(tripId, guideId ?? null, userId);
      this.sendSuccess(
        res,
        updatedTrip,
        guideId ? 'Guide assigned successfully' : 'Guide removed successfully'
      );
    }
  );

  getGuideTrips = asyncHandler(async (req: Request, res: Response) => {
    const { guideId } = req.params;
    const { page, limit } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;

    const result = await this._tripService.getGuideTrips(guideId, pageNum, limitNum);
    this.sendSuccess(res, result, 'Guide trips fetched successfully');
  });
}
