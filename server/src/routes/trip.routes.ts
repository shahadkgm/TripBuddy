import { Router } from 'express';
import multer from 'multer';
import { TripRepository } from '../repositories/implementation/trip.repository';
import { TripService } from '../services/implementation/trip.service';
import { TripController } from '../controllers/implementation/trip.controller';
import { dtoValidationMiddleware } from '../middleware/dtoValidation';
import { CreateTripDTO } from '../dto/trip.dto';
import { API_ROUTES } from '../constants/routes.constants';

import { protect } from '../middleware/authMiddleware';

import { PaymentRepository } from '../repositories/implementation/payment.repository';
import { UserRepository } from '../repositories/implementation/user.repository';

const router = Router();
const upload = multer();

// DI
const tripRepository = new TripRepository();
const paymentRepository = new PaymentRepository();
const userRepository = new UserRepository();
const tripService = new TripService(tripRepository, paymentRepository, userRepository);
const tripController = new TripController(tripService);

router.use(protect);

router.post(
    '/:id/finalize',
    tripController.finalizeTrip
);

router.post(
    '/:id/cancel',
    tripController.cancelTrip
);

router.post(
    '/:id/complete',
    tripController.completeTrip
);

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
    API_ROUTES.TRIP.GET_ALL,
    tripController.getAllTrips
);

router.get(
    API_ROUTES.TRIP.GET_BY_ID,
    tripController.getTripById
);

router.patch(
    API_ROUTES.TRIP.GET_BY_ID,
    upload.none(),
    tripController.updateTrip
);

router.get(
    API_ROUTES.TRIP.GET_CHAT,
    tripController.getChatHistory
);

// Assign / remove a guide from a trip
router.patch(
    '/:id/guide',
    tripController.assignGuide
);

export default router;
