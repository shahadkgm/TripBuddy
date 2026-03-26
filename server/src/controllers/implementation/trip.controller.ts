import { Request, Response } from 'express';
import { ITripService } from '../../services/interface/ITripService';
import { CreateTripDTO } from '../../dto/trip.dto';
import { asyncHandler } from '../../utils/asyncHandler';
import { logger } from '@/utils/logger';

import { BaseController } from './base.controller';
import { AuthRequest } from '../../types/authRequest';

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

    getUserTrips = asyncHandler(async (req: Request, res: Response) => {
        const { userId } = req.params;
        const trips = await this._tripService.getUserTrips(userId);
        this.sendSuccess(res, trips, 'User trips fetched successfully');
    });

    getTripById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const trip = await this._tripService.getTripById(id);
        if (!trip) {
            this.sendNotFound(res, 'Trip not found');
            return;
        }
        this.sendSuccess(res, trip, 'Trip fetched successfully');
    });

    getAllTrips = asyncHandler(async (req: Request, res: Response) => {
        const { destination, transport, interest, page, limit } = req.query;

        const filters = {
            destination: destination as string,
            transport: transport as string,
            interest: interest as string
        };

        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 10;

        const result = await this._tripService.getAllTrips(filters, pageNum, limitNum);
        this.sendSuccess(res, result, 'All trips fetched successfully');
    });

    updateTrip = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const updateData = req.body;
        logger.info('Trip update request received', { id, updateData });
        const updatedTrip = await this._tripService.updateTrip(id, updateData);
        if (!updatedTrip) {
            this.sendNotFound(res, 'Trip not found or update failed');
            return;
        }
        this.sendSuccess(res, updatedTrip, 'Trip updated successfully');
    });

    finalizeTrip = asyncHandler(async (req: AuthRequest<{ id: string }, unknown, { budget: number, depositAmount: number }>, res: Response) => {
        const { id } = req.params;
        const { budget, depositAmount } = req.body;
        const userId = req.user?.id as string;
        
        const trip = await this._tripService.finalizeTrip(id, userId, budget, depositAmount);
        this.sendSuccess(res, trip, 'Trip finalized successfully');
    });

    cancelTrip = asyncHandler(async (req: AuthRequest<{ id: string }>, res: Response) => {
        const { id } = req.params;
        const userId = req.user?.id as string;
        
        const trip = await this._tripService.cancelTrip(id, userId);
        this.sendSuccess(res, trip, 'Trip cancelled and members refunded');
    });

    getChatHistory = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const chatHistory = await this._tripService.getChatHistory(id);
        this.sendSuccess(res, chatHistory, 'Chat history fetched successfully');
    });

    assignGuide = asyncHandler(async (req: AuthRequest<{ id: string }, unknown, { guideId?: string | null }>, res: Response) => {
        const { id } = req.params;
        const { guideId } = req.body; // can be a string ID or null
        const userId = req.user?.id as string;

        const updatedTrip = await this._tripService.assignGuide(id, guideId ?? null, userId);
        this.sendSuccess(res, updatedTrip, guideId ? 'Guide assigned successfully' : 'Guide removed successfully');
    });
}
