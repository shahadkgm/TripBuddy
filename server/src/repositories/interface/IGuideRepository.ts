// server/src/repositories/interface/IGuideRepository.ts";

import { Guide, GuideCreate } from '../../types/guide.type.js';


import { IBaseRepository } from './IBaseRepository.js';

export interface IGuideRepository extends Omit<IBaseRepository<Guide>, 'create'> {

  findAll(filters?: Record<string, unknown>): Promise<Guide[]>;

  findByUserId(userId: string): Promise<Guide | null>;

  create(data: GuideCreate): Promise<Guide>;
}

