import { ITripDocument, ITripFilters, ITripPopulatedDocument } from '../../types/trip.type';
import { CreateTripDTO } from '../../dto/trip.dto';
import { IMessagePopulated } from '../../models/message.model';
import { ITripRepository } from '../../repositories/interface/ITripRepository';
import { ITripService } from '../interface/ITripService';
import { IPaymentRepository } from '../../repositories/interface/IPaymentRepository';
import { IUserRepository } from '../../repositories/interface/IUserRepository';
import { IPaymentPopulatedDocument, PaymentStatus, PaymentType } from '../../types/payment.type';
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
        const tripData: CreateTripDTO = {
            ...data,
            members: [data.userId]
        };
        return await this._tripRepository.create(tripData);
    }

    async getUserTrips(userId: string): Promise<ITripDocument[]> {
        return await this._tripRepository.findByUserId(userId);
    }

    async getTripById(tripId: string): Promise<ITripDocument | null> {
        return await this._tripRepository.findById(tripId);
    }

    async getAllTrips(filters: ITripFilters, page: number, limit: number): Promise<{ trips: ITripDocument[], total: number }> {
        logger.info('Fetching all trips with filters in t-s', { filters, page, limit });
        return await this._tripRepository.findAllTrips(filters, page, limit);
    }

    async updateTrip(id: string, data: Partial<CreateTripDTO>): Promise<ITripDocument | null> {
        logger.info('Updating trip in service', { id, data });
        return await this._tripRepository.updateById(id, data);
    }

    async getChatHistory(tripId: string): Promise<IMessagePopulated[]> {
        return await this._tripRepository.getChatHistory(tripId);
    }

    async finalizeTrip(tripId: string, userId: string, budget: number, depositAmount: number): Promise<ITripDocument> {
        const trip = await this._tripRepository.findById(tripId) as ITripPopulatedDocument | null;
        if (!trip) throw new Error('Trip not found');
        
        const ownerId = trip.userId._id.toString();
        if (ownerId !== userId) throw new Error('Unauthorized');
        if (trip.status !== 'planned') throw new Error('Trip already finalized or in progress');

        const updatedTrip = await this._tripRepository.updateById(tripId, {
            budget,
            depositAmount,
            status: 'finalized'
        });

        if (!updatedTrip) throw new Error('Failed to update trip');
        return updatedTrip;
    }

    async checkAndConfirmTrip(tripId: string): Promise<ITripDocument | null> {
        const trip = await this._tripRepository.findById(tripId);
        if (!trip || trip.status !== 'finalized') return null;

        const payments = await this._paymentRepository.findByTripId(tripId);
        const paidCount = payments.filter(p => p.status === PaymentStatus.ESCROWED).length;

        if (paidCount >= (trip.minMembers || 2)) {
            return await this._tripRepository.updateById(tripId, { status: 'confirmed' });
        }

        return trip;
    }

    async cancelTrip(tripId: string, userId: string): Promise<ITripDocument> {
        const trip = await this._tripRepository.findById(tripId) as ITripPopulatedDocument | null;
        if (!trip) throw new Error('Trip not found');
        
        const ownerId = trip.userId._id.toString();
        if (ownerId !== userId) throw new Error('Unauthorized');

        // 1. Mark trip as cancelled
        const cancelledTrip = await this._tripRepository.updateById(tripId, { status: 'cancelled' });
        if (!cancelledTrip) throw new Error('Failed to cancel trip');

        // 2. Refund all escrowed deposits
        const payments = await this._paymentRepository.findByTripId(tripId) as unknown as IPaymentPopulatedDocument[];
        const escrowedPayments = payments.filter(p => p.status === PaymentStatus.ESCROWED);

        for (const payment of escrowedPayments) {
            // Refund 100% to wallet
            await this._userRepository.updateWalletBalance(payment.userId._id.toString(), payment.amount);
            
            // Mark payment as refunded
            await this._paymentRepository.updateById(payment._id.toString(), { 
                status: PaymentStatus.REFUNDED 
            });

            // Log refund (could also create a new payment record if needed, but status update is cleaner)
        }

        return cancelledTrip;
    }

    async assignGuide(tripId: string, guideId: string | null, userId: string): Promise<ITripDocument> {
        const trip = await this._tripRepository.findById(tripId) as ITripPopulatedDocument | null;
        if (!trip) throw new Error('Trip not found');

        // Only trip owner can assign a guide
        const ownerId = trip.userId._id.toString();
        if (ownerId !== userId) throw new Error('Unauthorized: only the trip owner can assign a guide');

        if (guideId) {
            const guide = await guideModel.findById(guideId);
            if (!guide) throw new Error('Guide not found');
            if (!guide.isVerified) throw new Error('Only verified guides can be assigned to a trip');
        }

        const updated = await this._tripRepository.assignGuide(tripId, guideId);
        if (!updated) throw new Error('Failed to assign guide');
        return updated;
    }
}
