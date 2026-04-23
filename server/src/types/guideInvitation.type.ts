import { Document, Types } from 'mongoose';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export interface IGuideInvitation {
  tripId: Types.ObjectId;
  senderId: Types.ObjectId;
  guideId: Types.ObjectId;
  receiverId: Types.ObjectId;
  status: InvitationStatus;
  message?: string;
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IGuideInvitationDocument extends IGuideInvitation, Document {}
