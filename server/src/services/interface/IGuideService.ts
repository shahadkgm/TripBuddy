import { GuideQueryDTO, GuideRegisterDTO, GuideResponseDTO, GuideStatusResponse } from '../../dto/guide.dto';
import { IGuide } from '../../types/guide.type';

export interface IGuideService {
  register(userId: string, data: GuideRegisterDTO, file?: string): Promise<IGuide>;
  getStatus(userId: string): Promise<GuideStatusResponse>;
  getAllVerifiedGuides(query: GuideQueryDTO): Promise<GuideResponseDTO[]>;
}
