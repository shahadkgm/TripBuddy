import { IUser } from '../types/user.type';
import { UserResponseDTO } from '../dto/user.dto';
import { IGuide } from '../types/guide.type';

export class UserMapper {
  static toResponseDTO(user: IUser): UserResponseDTO {
    return {
      // Mapping the MongoDB _id to the DTO id
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarURL: user.avatarURL ? user.avatarURL.replace(/\\/g, '/') : undefined,
      bio: user.bio,
      hourlyRate: user.hourlyRate,
      serviceArea: user.serviceArea,
      yearsOfExperience: user.yearsOfExperience,
      role: user.role,
      isVerified: user.isVerified,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt?.toISOString() ?? '',
      kycStatus: user.kyc?.status || 'none',
      kycDocument: user.kyc?.filePath ? user.kyc.filePath.replace(/\\/g, '/') : '',
      kycRejectionReason: user.kyc?.rejectionReason || null,
      walletBalance: user.walletBalance || 0,
      guideProfile:
        user.guideProfile && typeof user.guideProfile === 'object' && '_id' in user.guideProfile
          ? {
              _id: user.guideProfile._id?.toString() || '',
              dailyRate: (user.guideProfile as IGuide).dailyRate || 0,
              serviceArea: (user.guideProfile as IGuide).serviceArea || '',
              bio: (user.guideProfile as IGuide).bio || '',
              yearsOfExperience: (user.guideProfile as IGuide).yearsOfExperience || 0,
              specialties: (user.guideProfile as IGuide).specialties || [],
              languages: (user.guideProfile as IGuide).languages || [],
              socialLinks: (user.guideProfile as IGuide).socialLinks || undefined,
              avatarURL: (user.guideProfile as IGuide).avatarURL || undefined,
            }
          : null,
    };
  }
}
