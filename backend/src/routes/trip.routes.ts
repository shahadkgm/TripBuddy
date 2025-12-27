// backend/src/routes/trip.routes.ts
import { Router } from 'express';
import { TripRepository } from '../repositories/trip.repository.js';
import { TripService } from '../services/trip.service.js';
import { TripController } from '../controllers/trip.controller.js';

const router = Router();

const tripRepo = new TripRepository();
const tripService = new TripService(tripRepo);
const tripController = new TripController(tripService);

router.get('/', tripController.getAllTrips);
router.post('/', tripController.createTrip);

export default router;