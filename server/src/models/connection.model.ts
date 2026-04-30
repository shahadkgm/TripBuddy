import { Schema, model } from 'mongoose';
import { IConnectionDocument } from '../types/connection.type';

const connectionSchema = new Schema<IConnectionDocument>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Individual indexes for faster lookups
connectionSchema.index({ senderId: 1 });
connectionSchema.index({ receiverId: 1 });

// Prevent duplicate requests between same users for same trip
connectionSchema.index({ senderId: 1, receiverId: 1, tripId: 1 }, { unique: true });

export const ConnectionModel = model<IConnectionDocument>('Connection', connectionSchema);
