import { IPaymentDocument } from '../../types/payment.type';
import {
  CreatePaymentDTO,
  CreateStripeSessionDTO,
  VerifyStripePaymentDTO,
} from '../../dto/payment.dto';
import { IWalletTransactionDocument } from '../../types/wallet.type';

export interface IPaymentService {
  payDeposit(userId: string, data: CreatePaymentDTO): Promise<IPaymentDocument>;
  createStripeSession(
    userId: string,
    data: CreateStripeSessionDTO
  ): Promise<{ id: string; url: string }>;
  payWithWallet(userId: string, data: CreatePaymentDTO): Promise<IPaymentDocument>;
  verifyStripePayment(userId: string, data: VerifyStripePaymentDTO): Promise<IPaymentDocument>;
  getMyPayments(userId: string, tripId: string): Promise<IPaymentDocument[]>;
  getTripPayments(tripId: string): Promise<IPaymentDocument[]>;
  getUserPayments(userId: string): Promise<IPaymentDocument[]>;
  getWalletTransactions(userId: string): Promise<IWalletTransactionDocument[]>;
}
