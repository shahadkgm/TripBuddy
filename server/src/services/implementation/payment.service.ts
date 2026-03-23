import { IPaymentDocument, PaymentStatus, PaymentType } from '../../types/payment.type';
import { CreatePaymentDTO, CreateStripeSessionDTO, VerifyStripePaymentDTO } from '../../dto/payment.dto';
import { IPaymentRepository } from '../../repositories/interface/IPaymentRepository';
import { IPaymentService } from '../interface/IPaymentService';
import { IUserRepository } from '../../repositories/interface/IUserRepository';
import { ITripService } from '../interface/ITripService';
import mongoose from 'mongoose';
import Stripe from 'stripe';

export class PaymentService implements IPaymentService {
    private stripe: Stripe;

    constructor(
        private paymentRepository: IPaymentRepository,
        private userRepository: IUserRepository,
        private tripService: ITripService
    ) {
        const stripeKey = process.env.STRIPE_SECRET_KEY ||""
        this.stripe = new Stripe(stripeKey);
    }

    async createStripeSession(userId: string, data: CreateStripeSessionDTO): Promise<{ id: string, url: string }> {
        try {
            const session = await this.stripe.checkout.sessions.create({
                // Let Stripe Dashboard automatically handle all active payment methods
                line_items: [
                    {
                        price_data: {
                            currency: 'inr',
                            product_data: {
                                name: `Trip Deposit`,
                            },
                            unit_amount: Math.round(data.amount * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/group-chat/${data.tripId}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/group-chat/${data.tripId}`,
                metadata: {
                    tripId: data.tripId,
                    userId: userId,
                    type: PaymentType.DEPOSIT
                }
            });

            if (!session.url) {
                 throw new Error('Failed to create Stripe session URL');
            }

            return { id: session.id, url: session.url };
        } catch (error) {
            console.error('Error creating Stripe session:', error);
            throw new Error('Failed to create Stripe session');
        }
    }

    async verifyStripePayment(userId: string, data: VerifyStripePaymentDTO): Promise<IPaymentDocument> {
        const session = await this.stripe.checkout.sessions.retrieve(data.sessionId);

        if (session.payment_status === 'paid') {
            const payment = await this.paymentRepository.create({
                userId: new mongoose.Types.ObjectId(userId),
                tripId: new mongoose.Types.ObjectId(data.tripId),
                amount: session.amount_total ? session.amount_total / 100 : 0,
                status: PaymentStatus.ESCROWED,
                paymentType: PaymentType.DEPOSIT,
                transactionId: session.id
            });

            // Trigger trip confirmation check
            await this.tripService.checkAndConfirmTrip(data.tripId);

            return payment;
        } else {
            throw new Error('Stripe payment not confirmed');
        }
    }

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

    async payWithWallet(userId: string, data: CreatePaymentDTO): Promise<IPaymentDocument> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.walletBalance < data.amount) {
            throw new Error('Insufficient wallet balance');
        }

        // Deduct from wallet
        await this.userRepository.updateWalletBalance(userId, -data.amount);

        // Create payment record
        const payment = await this.paymentRepository.create({
            userId: new mongoose.Types.ObjectId(userId),
            tripId: new mongoose.Types.ObjectId(data.tripId),
            amount: data.amount,
            status: PaymentStatus.ESCROWED,
            paymentType: PaymentType.DEPOSIT,
            transactionId: `wallet_${Date.now()}`
        });

        // Trigger trip confirmation check
        await this.tripService.checkAndConfirmTrip(data.tripId);

        return payment;
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
