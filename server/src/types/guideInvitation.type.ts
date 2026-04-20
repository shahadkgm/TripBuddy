import { Document, Schema } from 'mongoose';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export interface IGuideInvitation {
  tripId: Schema.Types.ObjectId;
  senderId: Schema.Types.ObjectId;
  guideId: Schema.Types.ObjectId;
  receiverId: Schema.Types.ObjectId;
  status: InvitationStatus;
  message?: string;
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IGuideInvitationDocument extends IGuideInvitation, Document {}
