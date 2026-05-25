import { IGuideInvitationDocument } from '../../types/guideInvitation.type';

export interface IGuideInvitationRepository {
  create(data: Partial<IGuideInvitationDocument>): Promise<IGuideInvitationDocument>;
  findById(invitationId: string): Promise<IGuideInvitationDocument | null>;
  updateStatus(invitationId: string, status: string): Promise<IGuideInvitationDocument | null>;
  findByReceiverId(
    receiverId: string,
    skip?: number,
    limit?: number
  ): Promise<{ invitations: IGuideInvitationDocument[]; total: number }>;
  findByTripAndGuide(tripId: string, guideId: string): Promise<IGuideInvitationDocument | null>;
  deleteByTripAndGuide(tripId: string, guideId: string): Promise<void>;
  findBySenderId(
    senderId: string,
    skip?: number,
    limit?: number
  ): Promise<{ invitations: IGuideInvitationDocument[]; total: number }>;
}
