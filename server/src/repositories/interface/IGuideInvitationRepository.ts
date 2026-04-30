import { IGuideInvitationDocument } from '../../types/guideInvitation.type';

export interface IGuideInvitationRepository {
  create(data: Partial<IGuideInvitationDocument>): Promise<IGuideInvitationDocument>;
  findById(id: string): Promise<IGuideInvitationDocument | null>;
  updateStatus(id: string, status: string): Promise<IGuideInvitationDocument | null>;
  findByReceiverId(
    receiverId: string,
    skip?: number,
    limit?: number
  ): Promise<{ invitations: IGuideInvitationDocument[]; total: number }>;
  findByTripAndGuide(tripId: string, guideId: string): Promise<IGuideInvitationDocument | null>;
  findBySenderId(
    senderId: string,
    skip?: number,
    limit?: number
  ): Promise<{ invitations: IGuideInvitationDocument[]; total: number }>;
}
