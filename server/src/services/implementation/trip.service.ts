import { ITripDocument, ITripFilters, ITripPopulatedDocument } from '../../types/trip.type';
import { TripStatus } from '../../constants/tripStatus.enum';
import { CreateTripDTO } from '../../dto/trip.dto';
import { IMessagePopulated } from '../../models/message.model';
import { ITripRepository } from '../../repositories/interface/ITripRepository';
import { ITripService } from '../interface/ITripService';
import { IPaymentRepository } from '../../repositories/interface/IPaymentRepository';
import { IUserRepository } from '../../repositories/interface/IUserRepository';
import { IPaymentPopulatedDocument, PaymentStatus } from '../../types/payment.type';
import { logger } from '@/utils/logger';
import mongoose from 'mongoose';
import guideModel from '../../models/guide.model';

export class TripService implements ITripService {
  constructor(
    private _tripRepository: ITripRepository,
    private _paymentRepository: IPaymentRepository,
    private _userRepository: IUserRepository
  ) {}

  async createTrip(data: CreateTripDTO): Promise<ITripDocument> {
    logger.info('Creating new trip in service in t-s', { data });

    const existingTrip = await this._tripRepository.findOne({
      userId: data.userId,
      title: { $regex: new RegExp(`^${data.title}$`, 'i') },
    });

    if (existingTrip) {
      throw new Error(' Please choose a unique name.');
    }

    const tripData: CreateTripDTO = {
      ...data,
      members: [data.userId],
    };
    return await this._tripRepository.create(tripData);
  }

  async getUserTrips(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ trips: ITripDocument[]; total: number }> {
    return await this._tripRepository.findByUserId(userId, page, limit);
  }

  async getTripById(tripId: string): Promise<ITripDocument | null> {
    return await this._tripRepository.findById(tripId);
  }

  async getAllTrips(
    filters: ITripFilters,
    page: number,
    limit: number
  ): Promise<{ trips: ITripDocument[]; total: number }> {
    logger.info('Fetching all trips with filters in t-s', { filters, page, limit });
    return await this._tripRepository.findAllTrips(filters, page, limit);
  }

  async updateTrip(id: string, data: Partial<CreateTripDTO>): Promise<ITripDocument | null> {
    logger.info('Updating trip in service', { id, data });

    if (data.title && data.userId) {
      const existingTrip = await this._tripRepository.findOne({
        userId: data.userId,
        title: { $regex: new RegExp(`^${data.title}$`, 'i') },
        _id: { $ne: id }, // Exclude current trip from the search
      });

      if (existingTrip) {
        throw new Error(
          'You already have another trip with this title. Please choose a unique name.'
        );
      }
    }

    return await this._tripRepository.updateById(id, data);
  }

  async getChatHistory(
    tripId: string,
    page: number,
    limit: number
  ): Promise<{ messages: IMessagePopulated[]; total: number }> {
    return await this._tripRepository.getChatHistory(tripId, page, limit);
  }

  async finalizeTrip(
    tripId: string,
    userId: string,
    budget: number,
    depositAmount: number
  ): Promise<ITripDocument> {
    const trip = (await this._tripRepository.findById(tripId)) as ITripPopulatedDocument | null;
    if (!trip) throw new Error('Trip not found');

    const ownerId = trip.userId._id.toString();
    if (ownerId !== userId) throw new Error('Unauthorized');
    if (trip.status !== TripStatus.PLANNED)
      throw new Error('Trip already finalized or in progress');

    const updatedTrip = await this._tripRepository.updateById(tripId, {
      budget,
      depositAmount,
      status: TripStatus.FINALIZED,
    });

    if (!updatedTrip) throw new Error('Failed to update trip');
    return updatedTrip;
  }

  async checkAndConfirmTrip(tripId: string): Promise<ITripDocument | null> {
    const trip = await this._tripRepository.findById(tripId);
    if (!trip || trip.status !== TripStatus.FINALIZED) return null;

    const payments = await this._paymentRepository.findByTripId(tripId);
    const paidCount = payments.filter(p => p.status === PaymentStatus.ESCROWED).length;

    if (paidCount >= (trip.minMembers || 2)) {
      return await this._tripRepository.updateById(tripId, { status: TripStatus.CONFIRMED });
    }

    return trip;
  }

  async leaveTrip(tripId: string, userId: string): Promise<ITripDocument> {
    const trip = await this._tripRepository.findById(tripId);
    if (!trip) throw new Error('Trip not found');

    // Organizer cannot leave the trip, they must cancel it entirely
    if (trip.userId.toString() === userId) {
      throw new Error('Organizer cannot leave the trip. You must cancel the entire trip.');
    }

    const isMember = trip.members.some(m => m.toString() === userId);
    if (!isMember) throw new Error('You are not a member of this trip');

    if (trip.status === TripStatus.COMPLETED || trip.status === TripStatus.CANCELLED) {
      throw new Error('Cannot leave a trip that is already completed or cancelled.');
    }

    const payments = await this._paymentRepository.findByUserAndTrip(userId, tripId);
    const escrowedPayment = payments.find(p => p.status === PaymentStatus.ESCROWED);

    if (!escrowedPayment) {
      throw new Error('No escrowed payment found. Cannot process refund.');
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysTillTrip = (new Date(trip.startDate).getTime() - new Date().getTime()) / msPerDay;

    let deductionRate = 0;
    if (daysTillTrip < 3) {
      deductionRate = 0.3;
    } else if (daysTillTrip <= 7) {
      deductionRate = 0.1;
    }

    const cancellationFee = Number((escrowedPayment.amount * deductionRate).toFixed(2));
    const refundAmount = Number((escrowedPayment.amount - cancellationFee).toFixed(2));

    // Platform takes 10% of the cancellation penalty!
    const platformCancellationCut = Number((cancellationFee * 0.1).toFixed(2));
    const travelersShareOfPenalty = cancellationFee - platformCancellationCut;

    const newMembers = trip.members.filter(m => m.toString() !== userId);
    const newPoolBalance = (trip.poolBalance || 0) + travelersShareOfPenalty;

    const updatedTrip = await this._tripRepository.updateById(tripId, {
      members: newMembers,
      poolBalance: newPoolBalance,
    });

    if (!updatedTrip) throw new Error('Failed to update trip when leaving');

    if (refundAmount > 0) {
      await this._userRepository.updateWalletBalance(
        userId,
        refundAmount,
        tripId,
        `Refund for leaving trip: ${trip.title}`
      );
    }

    await this._paymentRepository.updateById(escrowedPayment._id.toString(), {
      status: PaymentStatus.REFUNDED,
      refundReason: `User left trip. Refund: ${refundAmount}. Cancel Fee: ${cancellationFee}`,
    });

    return updatedTrip;
  }

  async cancelTrip(tripId: string, userId: string): Promise<ITripDocument> {
    const trip = (await this._tripRepository.findById(tripId)) as ITripPopulatedDocument | null;
    if (!trip) throw new Error('Trip not found');

    const ownerId = trip.userId._id.toString();
    if (ownerId !== userId) throw new Error('Unauthorized');

    // 1. Mark trip as cancelled
    const cancelledTrip = await this._tripRepository.updateById(tripId, {
      status: TripStatus.CANCELLED,
    });
    if (!cancelledTrip) throw new Error('Failed to cancel trip');

    // 2. Refund all escrowed deposits
    const payments = (await this._paymentRepository.findByTripId(
      tripId
    )) as unknown as IPaymentPopulatedDocument[];
    const escrowedPayments = payments.filter(p => p.status === PaymentStatus.ESCROWED);

    for (const payment of escrowedPayments) {
      // Refund 100% to wallet
      await this._userRepository.updateWalletBalance(
        payment.userId._id.toString(),
        payment.amount,
        tripId,
        `Full refund for cancelled trip: ${trip.title}`
      );

      // Mark payment as refunded
      await this._paymentRepository.updateById(payment._id.toString(), {
        status: PaymentStatus.REFUNDED,
      });

      // Log refund (could also create a new payment record if needed, but status update is cleaner)
    }

    return cancelledTrip;
  }

  async completeTrip(tripId: string, userId: string): Promise<ITripDocument> {
    const trip = (await this._tripRepository.findById(tripId)) as ITripPopulatedDocument | null;
    if (!trip) throw new Error('Trip not found');

    const ownerId = trip.userId._id.toString();
    if (ownerId !== userId) throw new Error('Unauthorized');

    if (trip.status !== TripStatus.CONFIRMED && trip.status !== TripStatus.ONGOING) {
      throw new Error('Trip must be confirmed or ongoing to be completed.');
    }

    // 1. Mark trip as completed and wipe pool balance
    const initialPoolBalance = trip.poolBalance || 0;
    const completedTrip = await this._tripRepository.updateById(tripId, {
      status: TripStatus.COMPLETED,
      poolBalance: 0,
    });
    if (!completedTrip) throw new Error('Failed to complete trip');

    // 2. Escrow Money Math!
    const payments = await this._paymentRepository.findByTripId(tripId);
    const escrowedPayments = payments.filter(p => p.status === PaymentStatus.ESCROWED);
    const totalEscrowPool = escrowedPayments.reduce((acc, curr) => acc + curr.amount, 0);

    // 3. Platform Commission (2%)
    const platformCommission = Number((totalEscrowPool * 0.02).toFixed(2));
    let guidePayout = 0;

    // 4. Guide Payout
    let guideUserId: string | null = null;
    if (trip.guideId) {
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      guidePayout = days * (trip.guideId.hourlyRate || 0);

      guideUserId =
        (trip.guideId.userId as { _id?: mongoose.Types.ObjectId })._id?.toString() ||
        (trip.guideId.userId as unknown as string);
    }

    // Checking for deficit!
    const requiredFunds = platformCommission + guidePayout;
    if (totalEscrowPool < requiredFunds) {
      throw new Error(
        `Insufficient funds collected in Escrow. Required: ${requiredFunds}, Available: ${totalEscrowPool}. Please ensure members pay correct deposit amount.`
      );
    }

    // 5. Pay the Guide physically
    if (guidePayout > 0 && guideUserId) {
      await this._userRepository.updateWalletBalance(
        guideUserId,
        guidePayout,
        tripId,
        `Payout for guiding trip: ${trip.title}`
      );
      logger.info('Guide payout released', {
        tripId,
        guideId: trip.guideId?._id,
        amount: guidePayout,
      });
    }

    // 6. Remaining Balance -> Refund equally to all travelers
    const remainingEscrow = totalEscrowPool - platformCommission - guidePayout;
    const finalPoolToDistribute = initialPoolBalance + remainingEscrow;

    const travelerMembers = trip.members.filter(m => m._id.toString() !== guideUserId);

    if (finalPoolToDistribute > 0 && travelerMembers.length > 0) {
      const splitAmount = Number((finalPoolToDistribute / travelerMembers.length).toFixed(2));
      for (const member of travelerMembers) {
        // Send the money straight to their wallet
        await this._userRepository.updateWalletBalance(
          member._id.toString(),
          splitAmount,
          tripId,
          `Pool split refund for trip: ${trip.title}`
        );
      }
    }

    // 7. Mark all Escrow as Released
    if (totalEscrowPool > 0) {
      for (const payment of escrowedPayments) {
        await this._paymentRepository.updateById(payment._id.toString(), {
          status: PaymentStatus.RELEASED,
        });
      }
    }

    return completedTrip;
  }

  async assignGuide(
    tripId: string,
    guideId: string | null,
    userId: string
  ): Promise<ITripDocument> {
    const trip = (await this._tripRepository.findById(tripId)) as ITripPopulatedDocument | null;
    if (!trip) throw new Error('Trip not found');

    // Only trip owner can assign a guide
    const ownerId = trip.userId._id.toString();
    if (ownerId !== userId) throw new Error('Unauthorized: only the trip owner can assign a guide');

    if (guideId) {
      const guide = await guideModel.findById(guideId);
      if (!guide) throw new Error('Guide not found');
      if (!guide.isVerified) throw new Error('Only verified guides can be assigned to a trip');

      // Add guide's userId to members array for access
      await this._tripRepository.addMember(tripId, guide.userId.toString());
    } else if (trip.guideId) {
      // Remove previous guide's userId from members if needed?
      // Actually, keep it for historical reasons or if they were also a traveler?
      // Safer to just leave it or let them leave manually.
      // But for a pure guide assignment, we might want to remove them.
      const guide = await guideModel.findById(trip.guideId._id);
      if (guide) {
        const updatedMembers = trip.members.filter(
          m => m._id.toString() !== guide.userId.toString()
        );
        await this._tripRepository.updateById(tripId, { members: updatedMembers.map(m => m._id) });
      }
    }

    const updated = await this._tripRepository.assignGuide(tripId, guideId);
    if (!updated) throw new Error('Failed to assign guide');
    return updated;
  }

  async getGuideTrips(
    guideId: string,
    page: number,
    limit: number
  ): Promise<{ trips: ITripDocument[]; total: number }> {
    return await this._tripRepository.findByGuideId(guideId, page, limit);
  }
}
