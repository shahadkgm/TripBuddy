import { IGuideInvitationDocument } from '../../types/guideInvitation.type';

export interface IGuideInvitationRepository {
  create(data: Partial<IGuideInvitationDocument>): Promise<IGuideInvitationDocument>;
  findById(id: string): Promise<IGuideInvitationDocument | null>;
  updateStatus(id: string, status: string): Promise<IGuideInvitationDocument | null>;
  findByReceiverId(receiverId: string): Promise<IGuideInvitationDocument[]>;
  findByTripAndGuide(tripId: string, guideId: string): Promise<IGuideInvitationDocument | null>;
  findBySenderId(senderId: string): Promise<IGuideInvitationDocument[]>;
}
