import { Router } from 'express';
import { PaymentRepository } from '../repositories/implementation/payment.repository';
import { PaymentService } from '../services/implementation/payment.service';
import { PaymentController } from '../controllers/implementation/payment.controller';
import { dtoValidationMiddleware } from '../middleware/dtoValidation';
import { CreatePaymentDTO } from '../dto/payment.dto';
import { API_ROUTES } from '../constants/routes.constants';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// DI
const paymentRepository = new PaymentRepository();
const paymentService = new PaymentService(paymentRepository);
const paymentController = new PaymentController(paymentService);

router.use(protect);

router.post(
    API_ROUTES.PAYMENT.PAY_DEPOSIT,
    dtoValidationMiddleware(CreatePaymentDTO),
    paymentController.payDeposit
);

router.get(
    API_ROUTES.PAYMENT.MY_PAYMENTS,
    paymentController.getMyPayments
);

router.get(
    API_ROUTES.PAYMENT.TRIP_PAYMENTS,
    paymentController.getTripPayments
);

router.get(
    API_ROUTES.PAYMENT.USER_PAYMENTS,
    paymentController.getUserPayments
);

export default router;
