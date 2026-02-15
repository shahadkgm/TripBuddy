import mongoose, { Model,  FilterQuery, UpdateQuery } from 'mongoose';
import { IBaseRepository } from '../interface/IBaseRepository.js';

export class BaseRepository<T> implements IBaseRepository<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data);
  }

  async findById(id: string | mongoose.Types.ObjectId): Promise<T | null> {
    return await this.model.findById(id).exec();
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return await this.model.findOne(filter).exec();
  }

  async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
    return await this.model.find(filter).exec();
  }

  async updateById(id: string | mongoose.Types.ObjectId, update: UpdateQuery<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async deleteById(id: string | mongoose.Types.ObjectId): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  async deleteByFilter(filter: FilterQuery<T>): Promise<void> {
    await this.model.deleteMany(filter).exec();
  }
}