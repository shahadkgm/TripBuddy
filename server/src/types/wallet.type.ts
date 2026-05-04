import { Document, Types } from 'mongoose';

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export interface IWalletTransaction {
  userId: Types.ObjectId;
  tripId?: Types.ObjectId;
  amount: number;
  type: TransactionType;
  description: string;
  createdAt: Date;
}

export type IWalletTransactionDocument = IWalletTransaction & Document;
