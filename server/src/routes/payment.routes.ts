import { Router } from 'express';
import { PaymentRepository } from '../repositories/implementation/payment.repository';
import { PaymentService } from '../services/implementation/payment.service';
import { PaymentController } from '../controllers/implementation/payment.controller';
import { dtoValidationMiddleware } from '../middleware/dtoValidation';
import {
  CreatePaymentDTO,
  CreateStripeSessionDTO,
  VerifyStripePaymentDTO,
} from '../dto/payment.dto';
import { API_ROUTES } from '../constants/routes.constants';
import { protect } from '../middleware/authMiddleware';

import { UserRepository } from '../repositories/implementation/user.repository';
import { TripRepository } from '../repositories/implementation/trip.repository';
import { TripService } from '../services/implementation/trip.service';

const router = Router();

// DI
const paymentRepository = new PaymentRepository();
const userRepository = new UserRepository();
const tripRepository = new TripRepository();
const tripService = new TripService(tripRepository, paymentRepository, userRepository);
const paymentService = new PaymentService(paymentRepository, userRepository, tripService);
const paymentController = new PaymentController(paymentService);

router.use(protect);

router.post(
  API_ROUTES.PAYMENT.PAY_DEPOSIT,
  dtoValidationMiddleware(CreatePaymentDTO),
  paymentController.payDeposit
);

router.post(
  API_ROUTES.PAYMENT.PAY_WITH_WALLET,
  dtoValidationMiddleware(CreatePaymentDTO),
  paymentController.payWithWallet
);

router.post(
  API_ROUTES.PAYMENT.CREATE_STRIPE_SESSION,
  dtoValidationMiddleware(CreateStripeSessionDTO),
  paymentController.createStripeSession
);

router.post(
  API_ROUTES.PAYMENT.VERIFY_STRIPE_PAYMENT,
  dtoValidationMiddleware(VerifyStripePaymentDTO),
  paymentController.verifyStripePayment
);

router.get(API_ROUTES.PAYMENT.MY_PAYMENTS, paymentController.getMyPayments);

router.get(API_ROUTES.PAYMENT.TRIP_PAYMENTS, paymentController.getTripPayments);

router.get(API_ROUTES.PAYMENT.USER_PAYMENTS, paymentController.getUserPayments);
router.get(API_ROUTES.PAYMENT.WALLET_TRANSACTIONS, paymentController.getWalletTransactions);

export default router;
