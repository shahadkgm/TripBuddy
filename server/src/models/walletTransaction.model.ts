import { Schema, model } from 'mongoose';
import { IWalletTransactionDocument, TransactionType } from '../types/wallet.type';

const walletTransactionSchema = new Schema<IWalletTransactionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

walletTransactionSchema.index({ userId: 1 });
walletTransactionSchema.index({ tripId: 1 });

export const WalletTransactionModel = model<IWalletTransactionDocument>(
  'WalletTransaction',
  walletTransactionSchema
);
