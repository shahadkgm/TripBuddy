// server/src/repositories/interface/IGuideRepository.ts";

import { IGuideProfile } from "../../domain/entities/GuideProfile.js";

export interface IGuideRepository {
  
  findAll(filters: any): Promise<IGuideProfile[]>;

  findByUserId(userId: string): Promise<IGuideProfile | null>;

  
  create(data: Partial<IGuideProfile>): Promise<IGuideProfile>;
}


export interface IGuideService {
  getAllGuides(query: any): Promise<IGuideProfile[]>;
  checkStatus(userId: string): Promise<{ exists: boolean; isVerified: boolean }>;
}
