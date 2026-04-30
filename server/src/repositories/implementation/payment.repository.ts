import { FilterQuery } from 'mongoose';
import { IPaymentDocument, IPaymentCreate, IRevenueStats } from '../../types/payment.type';
import { PaymentModel } from '../../models/payment.model';
import { BaseRepository } from './base.repository';
import { IPaymentRepository } from '../interface/IPaymentRepository';

export class PaymentRepository
  extends BaseRepository<IPaymentDocument, IPaymentCreate>
  implements IPaymentRepository
{
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

  async findAllPayments(
    page: number,
    limit: number
  ): Promise<{ payments: IPaymentDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      this._model
        .find()
        .populate('userId', 'name email avatarURL')
        .populate('tripId', 'destination title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this._model.countDocuments(),
    ]);
    return { payments, total };
  }

  async getRevenueStats(from?: Date, to?: Date): Promise<IRevenueStats> {
    const match: FilterQuery<IPaymentDocument> = {};
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = from;
      if (to) match.createdAt.$lte = to;
    }

    const stats = await this._model.aggregate([
      { $match: match },
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                totalRevenue: {
                  $sum: { $cond: [{ $eq: ['$status', 'released'] }, '$amount', 0] },
                },
                totalRefunds: {
                  $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, '$amount', 0] },
                },
                escrowedAmount: {
                  $sum: { $cond: [{ $eq: ['$status', 'escrowed'] }, '$amount', 0] },
                },
                totalCount: { $sum: 1 },
              },
            },
          ],
          monthlyTrend: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                revenue: { $sum: { $cond: [{ $eq: ['$status', 'released'] }, '$amount', 0] } },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          byPaymentType: [
            {
              $group: {
                _id: '$paymentType',
                total: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
          ],
          topTrips: [
            { $match: { status: 'released' } },
            {
              $group: {
                _id: '$tripId',
                revenue: { $sum: '$amount' },
                transactions: { $sum: 1 },
              },
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'trips',
                localField: '_id',
                foreignField: '_id',
                as: 'tripInfo',
              },
            },
            { $unwind: '$tripInfo' },
            {
              $project: {
                _id: 1,
                revenue: 1,
                transactions: 1,
                title: '$tripInfo.title',
                destination: '$tripInfo.destination',
              },
            },
          ],
        },
      },
    ]);

    const result = stats[0];
    return {
      totalRevenue: result.overall[0]?.totalRevenue || 0,
      totalRefunds: result.overall[0]?.totalRefunds || 0,
      escrowedAmount: result.overall[0]?.escrowedAmount || 0,
      totalCount: result.overall[0]?.totalCount || 0,
      monthlyTrend: result.monthlyTrend,
      byPaymentType: result.byPaymentType,
      topTrips: result.topTrips,
    };
  }
}
