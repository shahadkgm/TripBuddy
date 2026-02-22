import { Router } from 'express';
import multer from 'multer';
import { TripRepository } from '../repositories/implementation/trip.repository';
import { TripService } from '../services/implementation/trip.service';
import { TripController } from '../controllers/implementation/trip.controller';
import { dtoValidationMiddleware } from '../middleware/dtoValidation';
import { CreateTripDTO } from '../dto/trip.dto';
import { API_ROUTES } from '../constants/routes.constants';

const router = Router();
const upload = multer();

// DI
const tripRepository = new TripRepository();
const tripService = new TripService(tripRepository);
const tripController = new TripController(tripService);

router.post(
    API_ROUTES.TRIP.CREATE,
    upload.none(), // Parse FormData fields into req.body
    dtoValidationMiddleware(CreateTripDTO),
    tripController.createTrip
);

router.get(
    API_ROUTES.TRIP.GET_BY_USER,
    tripController.getUserTrips
);

router.get(
    API_ROUTES.TRIP.GET_BY_ID,
    tripController.getTripById
);

export default router;
