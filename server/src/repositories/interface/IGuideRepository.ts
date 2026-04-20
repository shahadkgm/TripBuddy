import { CreateGuideDTO } from '../../dto/guide.dto';
import { IGuide } from '../../types/guide.type';

import { IBaseRepository } from './IBaseRepository';

export interface IGuideRepository extends IBaseRepository<IGuide, CreateGuideDTO> {
  findAllWithPagination(
    filters?: Record<string, unknown>,
    page?: number,
    limit?: number
  ): Promise<{ guides: IGuide[]; total: number }>;
}
