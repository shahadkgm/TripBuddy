import { Model, Document } from 'mongoose';

export abstract class BaseRepository<T> {
  constructor(protected readonly model: Model<any>) {}

  protected map(doc: any): T {
    if (!doc) return doc;

    const obj = typeof doc.toObject === 'function'
      ? doc.toObject()
      : doc;

    if (obj._id) {
      obj._id = obj._id.toString();
    }

    return obj as T;
  }

  protected mapMany(docs: any[]): T[] {
    return docs.map(doc => this.map(doc));
  }

  async create(data: Partial<T>): Promise<T> {
    const doc = await this.model.create(data);
    return this.map(doc);
  }

  async findById(id: string): Promise<T | null> {
    const doc = await this.model.findById(id);
    return this.map(doc);
  }

  async findOne(filter: Record<string, unknown>): Promise<T | null> {
    const doc = await this.model.findOne(filter);
    return this.map(doc);
  }

  async findAll(filter: Record<string, unknown> = {}): Promise<T[]> {
    const docs = await this.model.find(filter);
    return this.mapMany(docs);
  }
}
