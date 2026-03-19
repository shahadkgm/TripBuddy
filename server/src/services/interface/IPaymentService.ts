import { IPaymentDocument } from '../../types/payment.type';
import { CreatePaymentDTO, CreateStripeSessionDTO, VerifyStripePaymentDTO } from '../../dto/payment.dto';

export interface IPaymentService {
    payDeposit(userId: string, data: CreatePaymentDTO): Promise<IPaymentDocument>;
    createStripeSession(userId: string, data: CreateStripeSessionDTO): Promise<{ id: string, url: string }>;
    verifyStripePayment(userId: string, data: VerifyStripePaymentDTO): Promise<IPaymentDocument>;
    getMyPayments(userId: string, tripId: string): Promise<IPaymentDocument[]>;
    getTripPayments(tripId: string): Promise<IPaymentDocument[]>;
    getUserPayments(userId: string): Promise<IPaymentDocument[]>;
}
