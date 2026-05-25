import { IGuideInvitationRepository } from '../interface/IGuideInvitationRepository';
import { IGuideInvitationDocument } from '../../types/guideInvitation.type';
import { GuideInvitationModel } from '../../models/guideInvitation.model';

export class GuideInvitationRepository implements IGuideInvitationRepository {
  async create(data: Partial<IGuideInvitationDocument>): Promise<IGuideInvitationDocument> {
    const invitation = new GuideInvitationModel(data);
    return await invitation.save();
  }

  async findById(invitationId: string): Promise<IGuideInvitationDocument | null> {
    return await GuideInvitationModel.findById(invitationId)
      .populate('tripId', '_id title destination startDate endDate status')
      .populate('senderId', '_id name email avatarURL')
      .populate('guideId', '_id hourlyRate serviceArea bio')
      .populate('receiverId', '_id name email');
  }

  async updateStatus(invitationId: string, status: string): Promise<IGuideInvitationDocument | null> {
    return await GuideInvitationModel.findByIdAndUpdate(invitationId, { status }, { new: true });
  }

  async findByReceiverId(
    receiverId: string,
    skip = 0,
    limit = 10
  ): Promise<{ invitations: IGuideInvitationDocument[]; total: number }> {
    const [invitations, total] = await Promise.all([
      GuideInvitationModel.find({ receiverId })
        .populate('tripId', 'title destination startDate endDate status budget')
        .populate('senderId', '_id name email avatarURL')
        .populate('guideId', '_id hourlyRate serviceArea')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      GuideInvitationModel.countDocuments({ receiverId }),
    ]);

    return { invitations, total };
  }

  async findByTripAndGuide(
    tripId: string,
    guideId: string
  ): Promise<IGuideInvitationDocument | null> {
    return await GuideInvitationModel.findOne({ tripId, guideId, status: 'pending' });
  }

  async deleteByTripAndGuide(tripId: string, guideId: string): Promise<void> {
    await GuideInvitationModel.deleteMany({ tripId, guideId });
  }







  async findBySenderId(
    senderId: string,
    skip = 0,
    limit = 10
  ): Promise<{ invitations: IGuideInvitationDocument[]; total: number }> {
    const [invitations, total] = await Promise.all([
      GuideInvitationModel.find({ senderId })
        .populate('tripId', 'title destination startDate endDate status')
        .populate('guideId', 'hourlyRate serviceArea')
        .populate('receiverId', 'name email avatarURL')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      GuideInvitationModel.countDocuments({ senderId }),
    ]);

    return { invitations, total };
  }
}
