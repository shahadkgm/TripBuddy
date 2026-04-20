import { Schema, model } from 'mongoose';
import { IGuideInvitationDocument, InvitationStatus } from '../types/guideInvitation.type';

const guideInvitationSchema = new Schema<IGuideInvitationDocument>(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    guideId: {
      type: Schema.Types.ObjectId,
      ref: 'GuideProfile',
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(InvitationStatus),
      default: InvitationStatus.PENDING,
    },
    message: {
      type: String,
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster lookups
guideInvitationSchema.index({ guideId: 1, status: 1 });
guideInvitationSchema.index({ receiverId: 1, status: 1 });
guideInvitationSchema.index(
  { tripId: 1, guideId: 1 },
  { unique: true, partialFilterExpression: { status: InvitationStatus.PENDING } }
);

export const GuideInvitationModel = model<IGuideInvitationDocument>(
  'GuideInvitation',
  guideInvitationSchema
);
