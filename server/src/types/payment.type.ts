import { Document, Types } from 'mongoose';

export enum PaymentStatus {
  PENDING = 'pending',
  ESCROWED = 'escrowed',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

export enum PaymentType {
  DEPOSIT = 'deposit',
  FINAL_PAYMENT = 'final_payment',
  REFUND = 'refund',
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

export interface IPaymentPopulated extends Omit<IPayment, 'userId' | 'tripId'> {
  userId: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    avatarURL?: string;
  };
  tripId: {
    _id: Types.ObjectId;
    destination: string;
    title: string;
  };
}

export type IPaymentPopulatedDocument = IPaymentPopulated & Document;

export interface IRevenueStats {
  totalRevenue: number;
  totalRefunds: number;
  escrowedAmount: number;
  totalCount: number;
  monthlyTrend: {
    _id: string;
    revenue: number;
    count: number;
  }[];
  byPaymentType: {
    _id: string;
    total: number;
    count: number;
  }[];
  topTrips: {
    _id: string;
    revenue: number;
    transactions: number;
    title: string;
    destination: string;
  }[];
}
