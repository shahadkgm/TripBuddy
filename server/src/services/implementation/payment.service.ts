import { IPaymentDocument, PaymentStatus, PaymentType } from '../../types/payment.type';
import { CreatePaymentDTO } from '../../dto/payment.dto';
import { IPaymentRepository } from '../../repositories/interface/IPaymentRepository';
import { IPaymentService } from '../interface/IPaymentService';
import mongoose from 'mongoose';

export class PaymentService implements IPaymentService {
    constructor(private paymentRepository: IPaymentRepository) {}

    async payDeposit(userId: string, data: CreatePaymentDTO): Promise<IPaymentDocument> {
        //  integrate Razorpay,or stripe this time only message 
        
        return await this.paymentRepository.create({
            userId: new mongoose.Types.ObjectId(userId),
            tripId: new mongoose.Types.ObjectId(data.tripId),
            amount: data.amount,
            status: PaymentStatus.ESCROWED,
            paymentType: PaymentType.DEPOSIT,
            transactionId: data.transactionId || `sim_${Date.now()}`
        });
    }

    async getMyPayments(userId: string, tripId: string): Promise<IPaymentDocument[]> {
        return await this.paymentRepository.findByUserAndTrip(userId, tripId);
    }

    async getTripPayments(tripId: string): Promise<IPaymentDocument[]> {
        return await this.paymentRepository.findByTripId(tripId);
    }

    async getUserPayments(userId: string): Promise<IPaymentDocument[]> {
        return await this.paymentRepository.findByUserId(userId);
    }
}
