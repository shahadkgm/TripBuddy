import { CreateGuideDTO } from '../../../dto/guide.dto';
import { IGuide } from '../../../types/guide.type';

import { IBaseRepository } from './IBaseRepository';

export interface IGuideRepository extends IBaseRepository<IGuide, CreateGuideDTO> {

  findAll(filters?: Record<string, unknown>): Promise<IGuide[]>;
}

