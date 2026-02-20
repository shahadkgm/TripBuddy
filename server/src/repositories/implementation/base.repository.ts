import mongoose, { Model, FilterQuery, UpdateQuery } from 'mongoose';
import { IBaseRepository } from '../interface/IBaseRepository';

export class BaseRepository<T, DTO> implements IBaseRepository<T, DTO> {
  protected _model: Model<T>;

  constructor(model: Model<T>) {
    this._model = model;
  }

  async create(data: DTO): Promise<T> {
    return await this._model.create(data);
  }

  async findById(id: string | mongoose.Types.ObjectId): Promise<T | null> {
    return await this._model.findById(id).exec();
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return await this._model.findOne(filter).exec();
  }

  async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
    return await this._model.find(filter).exec();
  }

  async updateById(id: string | mongoose.Types.ObjectId, update: UpdateQuery<T>): Promise<T | null> {
    return await this._model.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async deleteById(id: string | mongoose.Types.ObjectId): Promise<void> {
    await this._model.findByIdAndDelete(id).exec();
  }

  async deleteByFilter(filter: FilterQuery<T>): Promise<void> {
    await this._model.deleteMany(filter).exec();
  }
}