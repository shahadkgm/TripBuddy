import { IPaymentDocument, IPaymentCreate } from '../../types/payment.type';
import { IBaseRepository } from './IBaseRepository';

export interface IPaymentRepository extends IBaseRepository<IPaymentDocument, IPaymentCreate> {
    findByTripId(tripId: string): Promise<IPaymentDocument[]>;
    findByUserId(userId: string): Promise<IPaymentDocument[]>;
    findByUserAndTrip(userId: string, tripId: string): Promise<IPaymentDocument[]>;
}
