// server/src/repositories/interface/IGuideRepository.ts";

import { Guide, GuideCreate } from "../../types/guide.type.js";


export interface IGuideRepository {
  
  findAll(filters:Record<string,unknown>): Promise<Guide[]>;

  findByUserId(userId: string): Promise<Guide | null>;

  
  create(data: GuideCreate): Promise<Guide>;
}


