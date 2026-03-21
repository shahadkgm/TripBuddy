import { IPaymentDocument, IPaymentCreate } from '../../types/payment.type';
import { PaymentModel } from '../../models/payment.model';
import { BaseRepository } from './base.repository';
import { IPaymentRepository } from '../interface/IPaymentRepository';

export class PaymentRepository extends BaseRepository<IPaymentDocument, IPaymentCreate> implements IPaymentRepository {
    constructor() {
        super(PaymentModel);
    }

    async findByTripId(tripId: string): Promise<IPaymentDocument[]> {
        return await this._model.find({ tripId }).populate('userId', 'name email avatarURL');
    }

    async findByUserId(userId: string): Promise<IPaymentDocument[]> {
        return await this._model.find({ userId }).populate('tripId', 'destination title');
    }

    async findByUserAndTrip(userId: string, tripId: string): Promise<IPaymentDocument[]> {
        return await this._model.find({ userId, tripId });
    }

    async findAllPayments(page: number, limit: number): Promise<{ payments: IPaymentDocument[], total: number }> {
        const skip = (page - 1) * limit;
        const [payments, total] = await Promise.all([
            this._model.find()
                .populate('userId', 'name email avatarURL')
                .populate('tripId', 'destination title')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            this._model.countDocuments()
        ]);
        return { payments, total };
    }
}
