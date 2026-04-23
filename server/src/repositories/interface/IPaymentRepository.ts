import { IPaymentDocument, IPaymentCreate, IRevenueStats } from '../../types/payment.type';
import { IBaseRepository } from './IBaseRepository';

export interface IPaymentRepository extends IBaseRepository<IPaymentDocument, IPaymentCreate> {
  findByTripId(tripId: string): Promise<IPaymentDocument[]>;
  findByUserId(userId: string): Promise<IPaymentDocument[]>;
  findByUserAndTrip(userId: string, tripId: string): Promise<IPaymentDocument[]>;
  findAllPayments(
    page: number,
    limit: number
  ): Promise<{ payments: IPaymentDocument[]; total: number }>;
  getRevenueStats(from?: Date, to?: Date): Promise<IRevenueStats>;
}
