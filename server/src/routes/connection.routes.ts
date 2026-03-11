import { Router } from 'express';
import { ConnectionRepository } from '../repositories/implementation/connection.repository';
import { TripRepository } from '../repositories/implementation/trip.repository';
import { ConnectionService } from '../services/implementation/connection.service';
import { ConnectionController } from '../controllers/implementation/connection.controller';
import { protect } from '../middleware/authMiddleware';
import { API_ROUTES } from '../constants/routes.constants';

const router = Router();

// DI
const connectionRepository = new ConnectionRepository();
const tripRepository = new TripRepository();
const connectionService = new ConnectionService(connectionRepository, tripRepository);
const connectionController = new ConnectionController(connectionService);

router.use(protect);

router.post(API_ROUTES.CONNECTION.SEND, connectionController.sendRequest);
router.patch(API_ROUTES.CONNECTION.ACCEPT, connectionController.acceptRequest);
router.patch(API_ROUTES.CONNECTION.REJECT, connectionController.rejectRequest);
router.get(API_ROUTES.CONNECTION.PENDING, connectionController.getPendingRequests);
router.get(API_ROUTES.CONNECTION.MY_REQUESTS, connectionController.getSentRequests);
router.get(API_ROUTES.CONNECTION.STATUS, connectionController.getConnectionStatus);

router.get(API_ROUTES.CONNECTION.MEMBERS, connectionController.getTripMembers);

export default router;
