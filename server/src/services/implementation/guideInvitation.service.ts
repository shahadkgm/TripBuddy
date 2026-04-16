import { IGuideInvitationDocument, InvitationStatus } from "../../types/guideInvitation.type";
import { IGuideInvitationRepository } from "../../repositories/interface/IGuideInvitationRepository";
import { IGuideInvitationService } from "../interface/IGuideInvitationService";
import { ITripService } from "../interface/ITripService";
import guideModel from "../../models/guide.model";
import { logger } from "@/utils/logger";

export class GuideInvitationService implements IGuideInvitationService {
    constructor(
        private _invitationRepository: IGuideInvitationRepository,
        private _tripService: ITripService
    ) {}

    async sendInvitation(tripId: string, guideId: string, senderId: string): Promise<IGuideInvitationDocument> {
        logger.info('Sending guide invitation', { tripId, guideId, senderId });

        // Check if guide exists
        const guide = await guideModel.findById(guideId);
        if (!guide) throw new Error('Guide not found');
        if (!guide.isVerified) throw new Error('Only verified guides can be invited');

        // Check for existing pending invitation
        const existing = await this._invitationRepository.findByTripAndGuide(tripId, guideId);
        if (existing) throw new Error('An invitation is already pending for this guide and trip');

        const invitationData: Partial<IGuideInvitationDocument> = {
            tripId: tripId as any,
            senderId: senderId as any,
            guideId: guideId as any,
            receiverId: guide.userId as any,
            status: InvitationStatus.PENDING
        };

        return await this._invitationRepository.create(invitationData);
    }

    async getGuideInvitations(guideUserId: string): Promise<IGuideInvitationDocument[]> {
        return await this._invitationRepository.findByReceiverId(guideUserId);
    }

    async respondToInvitation(invitationId: string, status: string, guideUserId: string, reason?: string): Promise<IGuideInvitationDocument> {
        logger.info('Responding to guide invitation', { invitationId, status, guideUserId, reason });

        const invitation = await this._invitationRepository.findById(invitationId);
        if (!invitation) throw new Error('Invitation not found');

        if (invitation.receiverId.toString() !== guideUserId) {
            throw new Error('Unauthorized');
        }

        if (invitation.status !== InvitationStatus.PENDING) {
            throw new Error('Invitation is already ' + invitation.status);
        }

        if (status === InvitationStatus.ACCEPTED) {
            // Assign guide to trip
            await this._tripService.assignGuide(
                invitation.tripId._id.toString(), 
                invitation.guideId._id.toString(), 
                invitation.senderId._id.toString()
            );
        }

        if (status === InvitationStatus.REJECTED && reason) {
            invitation.rejectionReason = reason;
        }

        invitation.status = status as InvitationStatus;
        return await invitation.save();
    }

    async getOutboundInvitations(organizerId: string): Promise<IGuideInvitationDocument[]> {
        return await this._invitationRepository.findBySenderId(organizerId);
    }
}
