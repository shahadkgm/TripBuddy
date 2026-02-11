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
