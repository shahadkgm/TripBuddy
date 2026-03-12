import { IPaymentDocument } from '../../types/payment.type';
import { CreatePaymentDTO } from '../../dto/payment.dto';

export interface IPaymentService {
    payDeposit(userId: string, data: CreatePaymentDTO): Promise<IPaymentDocument>;
    getMyPayments(userId: string, tripId: string): Promise<IPaymentDocument[]>;
    getTripPayments(tripId: string): Promise<IPaymentDocument[]>;
    getUserPayments(userId: string): Promise<IPaymentDocument[]>;
}
