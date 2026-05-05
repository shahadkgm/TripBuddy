import { Types } from 'mongoose';
import { getIO } from '../../config/socket';
import { IGuideInvitationDocument, InvitationStatus } from '../../types/guideInvitation.type';
import { IGuideInvitationRepository } from '../../repositories/interface/IGuideInvitationRepository';
import { IGuideInvitationService } from '../interface/IGuideInvitationService';
import { ITripService } from '../interface/ITripService';
import guideModel from '../../models/guide.model';
import { logger } from '@/utils/logger';

export class GuideInvitationService implements IGuideInvitationService {
  constructor(
    private _invitationRepository: IGuideInvitationRepository,
    private _tripService: ITripService
  ) {}

  async sendInvitation(
    tripId: string,
    guideId: string,
    senderId: string
  ): Promise<IGuideInvitationDocument> {
    logger.info('Sending guide invitation', { tripId, guideId, senderId });

    // Check if guide exists
    const guide = await guideModel.findById(guideId);
    if (!guide) throw new Error('Guide not found');
    if (!guide.isVerified) throw new Error('Only verified guides can be invited');

    // Check for existing pending invitation
    const existing = await this._invitationRepository.findByTripAndGuide(tripId, guideId);
    if (existing) throw new Error('An invitation is already pending for this guide and trip');

    const invitationData: Partial<IGuideInvitationDocument> = {
      tripId: new Types.ObjectId(tripId),
      senderId: new Types.ObjectId(senderId),
      guideId: new Types.ObjectId(guideId),
      receiverId: guide.userId as Types.ObjectId,
      status: InvitationStatus.PENDING,
    };

    const result = await this._invitationRepository.create(invitationData);
    
    try {
      getIO().to(`user_${guide.userId}`).emit('global_notification', {
        title: 'New Trip Invitation',
        message: 'You have received a new invitation to lead a trip.',
        link: '/guide/dashboard'
      });
    } catch (e) {
      logger.error('Failed to emit socket event', { error: e });
    }

    return result;
  }

  async getGuideInvitations(
    guideUserId: string,
    page = 1,
    limit = 10
  ): Promise<{ invitations: IGuideInvitationDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    return await this._invitationRepository.findByReceiverId(guideUserId, skip, limit);
  }

  async respondToInvitation(
    invitationId: string,
    status: string,
    guideUserId: string,
    reason?: string
  ): Promise<IGuideInvitationDocument> {
    logger.info('Responding to guide invitation', { invitationId, status, guideUserId, reason });

    const invitation = await this._invitationRepository.findById(invitationId);
    if (!invitation) {
      logger.error('Invitation not found', { invitationId });
      throw new Error('Invitation not found');
    }

    const receiverId = this.extractId(invitation.receiverId);
    logger.info('Comparing receiver and guide IDs', { receiverId, guideUserId });

    if (receiverId !== guideUserId) {
      logger.error('Unauthorized response attempt', { receiverId, guideUserId });
      throw new Error('Unauthorized');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      logger.error('Invitation already processed', { currentStatus: invitation.status });
      throw new Error('Invitation is already ' + invitation.status);
    }

    if (status === InvitationStatus.ACCEPTED) {
      const tripIdStr = this.extractId(invitation.tripId);
      const guideIdStr = this.extractId(invitation.guideId);
      const senderIdStr = this.extractId(invitation.senderId);

      logger.info('Accepting invitation, assigning guide to trip', {
        tripId: tripIdStr,
        guideId: guideIdStr,
      });

      try {
        // Assign guide to trip
        await this._tripService.assignGuide(tripIdStr, guideIdStr, senderIdStr);
      } catch (assignError: unknown) {
        const message = assignError instanceof Error ? assignError.message : 'Unknown error';
        logger.error('Error during trip service assignment', { error: message });
        throw assignError;
      }
    }

    if (status === InvitationStatus.REJECTED && reason) {
      invitation.rejectionReason = reason;
    }

    invitation.status = status as InvitationStatus;
    const saved = await invitation.save();
    logger.info('Invitation response saved successfully', { status: saved.status });
    return saved;
  }

  async getOutboundInvitations(
    organizerId: string,
    page = 1,
    limit = 10
  ): Promise<{ invitations: IGuideInvitationDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    return await this._invitationRepository.findBySenderId(organizerId, skip, limit);
  }

  private extractId(field: Types.ObjectId | unknown): string {
    if (!field) return '';
    if (field instanceof Types.ObjectId) return field.toString();
    if (typeof field === 'object' && field !== null && '_id' in field) {
      return (field as { _id: Types.ObjectId | string })._id.toString();
    }
    return String(field);
  }
}
