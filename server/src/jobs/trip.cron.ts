import cron from 'node-cron';
import { TripStatus } from '../constants/tripStatus.enum';
import { TripModel } from '../models/trip.model';
import { PaymentModel } from '../models/payment.model';
import { PaymentStatus } from '../types/payment.type';
import { TripRepository } from '../repositories/implementation/trip.repository';
import { PaymentRepository } from '../repositories/implementation/payment.repository';
import { UserRepository } from '../repositories/implementation/user.repository';
import { logger } from '@/utils/logger';

const tripRepository = new TripRepository();
const paymentRepository = new PaymentRepository();
const userRepository = new UserRepository();

export const startCronJobs = () => {
  // Run every hour to check for expired deadlines
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('Running Trip Auto-Cancellation Cron Job...');
      const now = new Date();

      // Find trips where the deadline (startDate) has passed by more than 3 days
      // and they are still stuck in planned/finalized
      const gracePeriod = 3 * 24 * 60 * 60 * 1000;
      const expiryDate = new Date(now.getTime() - gracePeriod);

      const pendingTrips = await TripModel.find({
        joinDeadline: { $lt: expiryDate },
        status: { $in: [TripStatus.PLANNED, TripStatus.FINALIZED] },
      });

      for (const trip of pendingTrips) {
        // Check if they met the minimum members requirement
        const payments = await PaymentModel.find({
          tripId: trip._id,
          status: PaymentStatus.ESCROWED,
        });

        // If didn't reach the target
        if (payments.length < trip.minMembers) {
          logger.info(
            `Auto-cancelling trip ${trip._id} - failed to reach min members before deadline.`
          );

          // Direct 100% refund for all remaining members who placed an escrow
          for (const payment of payments) {
            await userRepository.updateWalletBalance(
              payment.userId.toString(),
              payment.amount,
              trip._id.toString(),
              `Auto-refund: Trip failed to reach minimum members (${trip.title})`
            );
            await paymentRepository.updateById(payment._id.toString(), {
              status: PaymentStatus.REFUNDED,
              refundReason:
                'Auto-refund: Trip failed to reach minimum members by the required join deadline.',
            });
          }

          // Safely cancel trip globally
          await tripRepository.updateById(trip._id.toString(), { status: TripStatus.CANCELLED });
        }
      }
    } catch (error) {
      logger.error('Error running trip cron jobs:', error);
    }
  });
};
