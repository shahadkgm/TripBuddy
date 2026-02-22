import { Types } from 'mongoose';
import { AdminGuideResponseDTO } from '../dto/admin.dto';
import { GuideResponseDTO } from '../dto/guide.dto';
import { IGuide } from '../types/guide.type';

export const toGuideResponse = (guide: IGuide): GuideResponseDTO => ({

  id: guide._id.toString(),
  name: guide.name,
  bio: guide.bio,
  hourlyRate: guide.hourlyRate,
  serviceArea: guide.serviceArea,
  specialties: guide.specialties,
  avatarURL: guide.avatarURL,
  isVerified: guide.isVerified
});
export const toAdminGuideResponse = (guide: IGuide): AdminGuideResponseDTO => {
  const populatedUser = (guide.userId && typeof guide.userId === 'object' && 'name' in guide.userId)
    ? guide.userId as { _id: Types.ObjectId; name: string; email: string; role: string }
    : null;

  return {
    id: guide._id.toString(),
    user: {
      id: populatedUser?._id.toString() || guide.userId.toString(),
      name: populatedUser?.name || guide.name || 'Unknown',
      email: populatedUser?.email || 'N/A',
      role: populatedUser?.role || 'guide'
    },
    bio: guide.bio,
    hourlyRate: guide.hourlyRate,
    serviceArea: guide.serviceArea,
    specialties: guide.specialties || [],
    avatarURL: guide.avatarURL,
    certificateUrl: guide.certificateUrl,
    yearsOfExperience: guide.yearsOfExperience,
    status: guide.isVerified ? 'Verified' : 'Pending',
    isVerified: guide.isVerified,
    createdAt: guide.createdAt?.toISOString() || new Date().toISOString(),
  };
};