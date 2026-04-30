import {
  GuideQueryDTO,
  GuideRegisterDTO,
  GuideResponseDTO,
  GuideStatusResponse,
  GuideUpdateDTO,
} from '../../dto/guide.dto';
import { IGuide } from '../../types/guide.type';

export interface IGuideService {
  register(userId: string, data: GuideRegisterDTO, avatarURL?: string): Promise<IGuide>;
  getStatus(userId: string): Promise<GuideStatusResponse>;
  getAllVerifiedGuides(
    query: GuideQueryDTO
  ): Promise<{ guides: GuideResponseDTO[]; total: number }>;
  updateProfile(userId: string, data: GuideUpdateDTO): Promise<IGuide | null>;
  resetStatus(userId: string): Promise<boolean>;
}
