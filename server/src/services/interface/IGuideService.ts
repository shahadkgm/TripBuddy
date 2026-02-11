import { GuideQueryDTO, GuideRegisterDTO, GuideResponseDTO, GuideStatusResponse } from "../../dto/guide.dto.js";
import { Guide } from "../../types/guide.type.js";

// src/services/interfaces/IGuideService.ts
export interface IGuideService {
  register(userId: string, data: GuideRegisterDTO, file?: string): Promise<Guide>;
  getStatus(userId: string): Promise<GuideStatusResponse>;
  getAllVerifiedGuides(query: GuideQueryDTO): Promise<GuideResponseDTO[]>;
}
