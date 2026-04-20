import { IGuideInvitationRepository } from '../interface/IGuideInvitationRepository';
import { IGuideInvitationDocument } from '../../types/guideInvitation.type';
import { GuideInvitationModel } from '../../models/guideInvitation.model';

export class GuideInvitationRepository implements IGuideInvitationRepository {

    async create(data: Partial<IGuideInvitationDocument>): Promise<IGuideInvitationDocument> {
        const invitation = new GuideInvitationModel(data);
        return await invitation.save();
    }

    async findById(id: string): Promise<IGuideInvitationDocument | null> {
        return await GuideInvitationModel.findById(id)
            .populate('tripId', '_id title destination startDate endDate status')
            .populate('senderId', '_id name email avatarURL')
            .populate('guideId', '_id hourlyRate serviceArea bio')
            .populate('receiverId', '_id name email');
    }

    async updateStatus(id: string, status: string): Promise<IGuideInvitationDocument | null> {
        return await GuideInvitationModel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
    }

    async findByReceiverId(receiverId: string): Promise<IGuideInvitationDocument[]> {
        return await GuideInvitationModel.find({ receiverId })
            .populate('tripId', 'title destination startDate endDate status budget')
            .populate('senderId', '_id name email avatarURL')
            .populate('guideId', '_id hourlyRate serviceArea')
            .sort({ createdAt: -1 });
    }

    async findByTripAndGuide(tripId: string, guideId: string): Promise<IGuideInvitationDocument | null> {
        return await GuideInvitationModel.findOne({ tripId, guideId, status: 'pending' });
    }

    async findBySenderId(senderId: string): Promise<IGuideInvitationDocument[]> {
        return await GuideInvitationModel.find({ senderId })
            .populate('tripId', 'title destination startDate endDate status')
            .populate('guideId', 'hourlyRate serviceArea')
            .populate('receiverId', 'name email avatarURL')
            .sort({ createdAt: -1 });
    }
}
