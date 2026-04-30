import { IGuideInvitationDocument } from '../../types/guideInvitation.type';

export interface IGuideInvitationService {
  sendInvitation(
    tripId: string,
    guideId: string,
    senderId: string
  ): Promise<IGuideInvitationDocument>;
  getGuideInvitations(
    guideUserId: string,
    page?: number,
    limit?: number
  ): Promise<{ invitations: IGuideInvitationDocument[]; total: number }>;
  respondToInvitation(
    invitationId: string,
    status: string,
    guideUserId: string,
    reason?: string
  ): Promise<IGuideInvitationDocument>;
  getOutboundInvitations(
    organizerId: string,
    page?: number,
    limit?: number
  ): Promise<{ invitations: IGuideInvitationDocument[]; total: number }>;
}
