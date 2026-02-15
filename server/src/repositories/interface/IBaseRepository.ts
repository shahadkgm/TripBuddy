
import mongoose, { FilterQuery, UpdateQuery } from 'mongoose';

export interface IBaseRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string | mongoose.Types.ObjectId): Promise<T | null>;
  findOne(filter: FilterQuery<T>): Promise<T | null>;
  findAll(filter?: FilterQuery<T>): Promise<T[]>;
  updateById(id: string | mongoose.Types.ObjectId, update: UpdateQuery<T>): Promise<T | null>;
  deleteById(id: string | mongoose.Types.ObjectId): Promise<void>;
  deleteByFilter(filter: FilterQuery<T>): Promise<void>;
}