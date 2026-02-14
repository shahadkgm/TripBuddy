import { AdminGuideResponseDTO } from '../dto/admin.dto.js';
import { GuideResponseDTO } from '../dto/guide.dto.js';
import { Guide } from '../types/guide.type.js';

export const toGuideResponse = (guide: Guide): GuideResponseDTO => ({
  
  id: guide._id.toString(),
  name: guide.name,
  bio: guide.bio,
  hourlyRate: guide.hourlyRate,
  serviceArea: guide.serviceArea,
  specialities: guide.specialities,
  avatarURL: guide.avatarURL,
  isVerified: guide.isVerified
});
export const toAdminGuideResponse = (guide: Guide): AdminGuideResponseDTO => {
  // Identify the user data from the populated field
  // const userData = typeof guide.userId === 'object' ? guide.userId : null;

  return {
    id: guide._id.toString(),
    user: {
      id: guide?._id.toString() || guide.userId.toString(),
      name: guide?.name || 'Unknown',
      email: guide?.bio || 'N/A',
    },
    // Ensure these match AdminGuideResponseDTO
    yearsOfExperience:guide.yearsOfExperience,
    status: guide.isVerified ? 'Verified' : 'Pending',
    createdAt: guide.createdAt?.toISOString() || new Date().toISOString(),
  };
};