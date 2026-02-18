import { userInfo } from 'os';
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
  // Identify the user data from the populated field
  // const userData = typeof guide.userId === 'object' ? guide.userId : null;

  return {
    id: guide._id.toString(),
    user: {
      id: guide?._id.toString() || guide.userId.toString(),
      name: guide?.name || 'Unknown',
      email: guide?.bio || 'N/A',
     role:"guide"
    },
    // Ensure these match AdminGuideResponseDTO
    yearsOfExperience: guide.yearsOfExperience,
    status: guide.isVerified ? 'Verified' : 'Pending',
    createdAt: guide.createdAt?.toISOString() || new Date().toISOString(),
  };
};