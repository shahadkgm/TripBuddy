import { IPaymentDocument, PaymentStatus, PaymentType } from '../../types/payment.type';
import { CreatePaymentDTO, CreateRazorpayOrderDTO, VerifyRazorpayPaymentDTO } from '../../dto/payment.dto';
import { IPaymentRepository } from '../../repositories/interface/IPaymentRepository';
import { IPaymentService } from '../interface/IPaymentService';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Orders } from 'razorpay/dist/types/orders';

export class PaymentService implements IPaymentService {
    private razorpay: Razorpay;

    constructor(private paymentRepository: IPaymentRepository) {
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_KEY_SECRET || '',
        });
    }

    async createOrder(userId: string, data: CreateRazorpayOrderDTO): Promise<Orders.RazorpayOrder> {
        const options = {
            amount: Math.round(data.amount * 100), // amount in the smallest currency unit
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };
        try {
            const order = await this.razorpay.orders.create(options);
            return order;
        } catch (error) {
            console.error('Error creating Razorpay order:', error);
            throw new Error('Failed to create Razorpay order');
        }
    }

    async verifyPayment(userId: string, data: VerifyRazorpayPaymentDTO): Promise<IPaymentDocument> {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tripId, amount } = data;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '')
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            return await this.paymentRepository.create({
                userId: new mongoose.Types.ObjectId(userId),
                tripId: new mongoose.Types.ObjectId(tripId),
                amount: amount,
                status: PaymentStatus.ESCROWED,
                paymentType: PaymentType.DEPOSIT,
                transactionId: razorpay_payment_id
            });
        } else {
            throw new Error('Invalid signature');
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
