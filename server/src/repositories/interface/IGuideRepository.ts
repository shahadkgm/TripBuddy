// server/src/repositories/interface/IGuideRepository.ts";

import { IGuide } from '../../types/guide.type.js';


import { IBaseRepository } from './IBaseRepository.js';

export interface IGuideRepository extends Omit<IBaseRepository<IGuide>, 'create'> {

  findAll(filters?: Record<string, unknown>): Promise<IGuide[]>;

  findByUserId(userId: string): Promise<IGuide | null>;
create(data:any):Promise<IGuide> // use data type as dto for creating guide

}

