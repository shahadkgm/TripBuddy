import { Response } from 'express';
import { IPaymentService } from '../../services/interface/IPaymentService';
import {
  CreatePaymentDTO,
  CreateStripeSessionDTO,
  VerifyStripePaymentDTO,
} from '../../dto/payment.dto';
import { asyncHandler } from '../../utils/asyncHandler';
import { BaseController } from './base.controller';
import { AuthRequest } from '../../types/authRequest';

export class PaymentController extends BaseController {
  constructor(private readonly _paymentService: IPaymentService) {
    super();
  }

  createStripeSession = asyncHandler(
    async (req: AuthRequest<{}, {}, CreateStripeSessionDTO>, res: Response) => {
      const userId = req.user?.id;
      if (!userId) {
        this.sendUnauthorized(res, 'User not authenticated');
        return;
      }

      const session = await this._paymentService.createStripeSession(userId, req.body);
      this.sendSuccess(res, session, 'Stripe session created successfully');
    }
  );

  verifyStripePayment = asyncHandler(
    async (req: AuthRequest<{}, {}, VerifyStripePaymentDTO>, res: Response) => {
      const userId = req.user?.id;
      if (!userId) {
        this.sendUnauthorized(res, 'User not authenticated');
        return;
      }

      const payment = await this._paymentService.verifyStripePayment(userId, req.body);
      this.sendSuccess(res, payment, 'Payment verified and recorded successfully');
    }
  );

  payDeposit = asyncHandler(async (req: AuthRequest<{}, {}, CreatePaymentDTO>, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.sendUnauthorized(res, 'User not authenticated');
      return;
    }

    const payment = await this._paymentService.payDeposit(userId, req.body);
    this.sendCreated(res, payment, 'Deposit paid successfully');
  });

  payWithWallet = asyncHandler(
    async (req: AuthRequest<{}, {}, CreatePaymentDTO>, res: Response) => {
      const userId = req.user?.id;
      if (!userId) {
        this.sendUnauthorized(res, 'User not authenticated');
        return;
      }

      const payment = await this._paymentService.payWithWallet(userId, req.body);
      this.sendCreated(res, payment, 'Paid with wallet successfully');
    }
  );

  getMyPayments = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { tripId } = req.params;

    if (!userId) {
      this.sendUnauthorized(res, 'User not authenticated');
      return;
    }

    const payments = await this._paymentService.getMyPayments(userId, tripId);
    this.sendSuccess(res, payments, 'My payments fetched successfully');
  });

  getTripPayments = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { tripId } = req.params;
    const payments = await this._paymentService.getTripPayments(tripId);
    this.sendSuccess(res, payments, 'Trip payments fetched successfully');
  });

  getUserPayments = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.sendUnauthorized(res, 'User not authenticated');
      return;
    }

    const payments = await this._paymentService.getUserPayments(userId);
    this.sendSuccess(res, payments, 'User payments fetched successfully');
  });
}
