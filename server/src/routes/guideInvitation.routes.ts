import { Router } from 'express';
import { GuideInvitationRepository } from '../repositories/implementation/guideInvitation.repository';
import { GuideInvitationService } from '../services/implementation/guideInvitation.service';
import { GuideInvitationController } from '../controllers/implementation/guideInvitation.controller';
import { TripRepository } from '../repositories/implementation/trip.repository';
import { PaymentRepository } from '../repositories/implementation/payment.repository';
import { UserRepository } from '../repositories/implementation/user.repository';
import { TripService } from '../services/implementation/trip.service';
import { protect } from '../middleware/authMiddleware';
import { API_ROUTES } from '../constants/routes.constants';

const router = Router();

// DI Setup
const invitationRepo = new GuideInvitationRepository();
const tripRepo = new TripRepository();
const paymentRepo = new PaymentRepository();
const userRepo = new UserRepository();

const tripService = new TripService(tripRepo, paymentRepo, userRepo);
const invitationService = new GuideInvitationService(invitationRepo, tripService);
const invitationController = new GuideInvitationController(invitationService);

// Routes
router.use(protect);

router.post(
  API_ROUTES.GUIDE_INVITATION.SEND,
  invitationController.sendInvitation.bind(invitationController)
);
router.post(
  API_ROUTES.GUIDE_INVITATION.RESPOND,
  invitationController.respondToInvitation.bind(invitationController)
);
router.get(
  API_ROUTES.GUIDE_INVITATION.INBOUND,
  invitationController.getInboundInvitations.bind(invitationController)
);
router.get(
  API_ROUTES.GUIDE_INVITATION.OUTBOUND,
  invitationController.getOutboundInvitations.bind(invitationController)
);

export default router;
