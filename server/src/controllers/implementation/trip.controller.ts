import { Request, Response } from 'express';
import { StatusCode } from '../../constants/statusCode.enum';
import { ITripService } from '../../services/interface/ITripService';
import { CreateTripDTO } from '../../dto/trip.dto';
import { asyncHandler } from '../../utils/asyncHandler';
import { logger } from '@/utils/logger';

export class TripController {
    constructor(private readonly _tripService: ITripService) { }

    createTrip = asyncHandler(async (req: Request<{}, {}, CreateTripDTO>, res: Response) => {
        const tripData = req.body;
        logger.info(`reached in controller tripData:${tripData} `)
        const newTrip = await this._tripService.createTrip(tripData);
        res.status(StatusCode.CREATED).json(newTrip);
    });

    getUserTrips = asyncHandler(async (req: Request, res: Response) => {
        const { userId } = req.params;
        const trips = await this._tripService.getUserTrips(userId);
        res.status(StatusCode.OK).json(trips);
    });

    getTripById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const trip = await this._tripService.getTripById(id);
        if (!trip) {
            return res.status(StatusCode.NOT_FOUND).json({ message: 'Trip not found' });
        }
        res.status(StatusCode.OK).json(trip);
    });
}
