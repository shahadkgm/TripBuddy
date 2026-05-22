import { Router } from 'express';
import multer from 'multer';
import { TripRepository } from '../repositories/implementation/trip.repository';
import { TripService } from '../services/implementation/trip.service';
import { TripController } from '../controllers/implementation/trip.controller';
import { dtoValidationMiddleware } from '../middleware/dtoValidation';
import { CreateTripDTO } from '../dto/trip.dto';
import { API_ROUTES } from '../constants/routes.constants';

import { protect } from '../middleware/authMiddleware';
import { requireKyc } from '../middleware/kycMiddleware';

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

router.post('/:tripId/finalize', requireKyc, tripController.finalizeTrip);

router.post('/:tripId/cancel', requireKyc, tripController.cancelTrip);

router.post('/:tripId/complete', requireKyc, tripController.completeTrip);

router.post('/:tripId/leave', requireKyc, tripController.leaveTrip);

router.post(
  API_ROUTES.TRIP.CREATE,
  requireKyc,
  upload.none(), // Parse FormData fields into req.body
  dtoValidationMiddleware(CreateTripDTO),
  tripController.createTrip
);

router.get(API_ROUTES.TRIP.GET_BY_USER, tripController.getUserTrips);

router.get(API_ROUTES.TRIP.GET_ALL, tripController.getAllTrips);

router.get(API_ROUTES.TRIP.GET_BY_ID, tripController.getTripById);

router.patch(API_ROUTES.TRIP.GET_BY_ID, requireKyc, upload.none(), tripController.updateTrip);

router.get(API_ROUTES.TRIP.GET_CHAT, tripController.getChatHistory);

// Assign / remove a guide from a trip
router.patch('/:tripId/guide', requireKyc, tripController.assignGuide);

router.get('/guide/:guideId', tripController.getGuideTrips);

export default router;
