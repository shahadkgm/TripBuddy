import { Types } from 'mongoose';
import { AdminGuideResponseDTO } from '../dto/admin.dto';
import { GuideResponseDTO } from '../dto/guide.dto';
import { IGuide } from '../types/guide.type';

interface PopulatedGuide extends IGuide {
  userDoc?: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    role: string;
  };
  kycData?: {
    status: string;
    filePath: string;
    rejectionReason?: string | null;
  };
}

export const toGuideResponse = (guide: IGuide): GuideResponseDTO => ({
  id: guide._id.toString(),
  name: guide.name,
  bio: guide.bio,
  dailyRate: guide.dailyRate,
  serviceArea: guide.serviceArea,
  specialties: guide.specialties,
  avatarURL: guide.avatarURL,
  yearsOfExperience: guide.yearsOfExperience,
  languages: guide.languages || [],
  socialLinks: guide.socialLinks,
  isVerified: guide.isVerified,
  averageRating: guide.averageRating,
  reviewCount: guide.reviewCount,
});
export const toAdminGuideResponse = (guide: PopulatedGuide): AdminGuideResponseDTO => {
  const populatedUser =
    guide.userDoc ||
    (guide.userId && typeof guide.userId === 'object' && 'name' in guide.userId
      ? (guide.userId as unknown as PopulatedGuide['userDoc'])
      : null);

  return {
    id: guide._id.toString(),
    user: {
      id: populatedUser?._id.toString() || guide.userId.toString(),
      name: populatedUser?.name || guide.name || 'Unknown',
      email: populatedUser?.email || 'N/A',
      role: populatedUser?.role || 'guide',
    },
    bio: guide.bio,
    dailyRate: guide.dailyRate,
    serviceArea: guide.serviceArea,
    specialties: guide.specialties || [],
    avatarURL: guide.avatarURL,
    languages: guide.languages || [],
    socialLinks: guide.socialLinks,
    certificateUrl: guide.certificateUrl,
    yearsOfExperience: guide.yearsOfExperience,
    status: guide.status || (guide.isVerified ? 'verified' : 'pending'),
    isVerified: guide.isVerified,
    rejectionReason: guide.rejectionReason,
    kycData: guide.kycData,
    createdAt: guide.createdAt instanceof Date ? guide.createdAt.toISOString() : guide.createdAt,
  };
};
