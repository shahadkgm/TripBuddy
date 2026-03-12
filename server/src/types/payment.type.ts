import { Document, Types } from 'mongoose';

export enum PaymentStatus {
    PENDING = 'pending',
    ESCROWED = 'escrowed',
    RELEASED = 'released',
    REFUNDED = 'refunded',
    FAILED = 'failed'
}

export enum PaymentType {
    DEPOSIT = 'deposit',
    FINAL_PAYMENT = 'final_payment',
    REFUND = 'refund'
}

export interface IPayment {
    userId: Types.ObjectId;
    tripId: Types.ObjectId;
    amount: number;
    status: PaymentStatus;
    paymentType: PaymentType;
    transactionId?: string;
    refundReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type IPaymentCreate = Omit<IPayment, 'createdAt' | 'updatedAt'>;

export type IPaymentDocument = IPayment & Document;
