import { ReportModel, IReportDocument } from '../../models/report.model';
import { BaseRepository } from './base.repository';
import { IReportRepository } from '../interface/IReportRepository';
import { Types } from 'mongoose';

export class ReportRepository
  extends BaseRepository<IReportDocument, Partial<IReportDocument>>
  implements IReportRepository
{
  constructor() {
    super(ReportModel);
  }

  async findAllWithDetails(): Promise<IReportDocument[]> {
    return await this._model
      .find()
      .populate('reporterId', 'name email avatarURL')
      .populate('targetId', 'name email role avatarURL')
      .populate('tripId', 'title destination')
      .sort({ createdAt: -1 });
  }

  async findByTargetId(targetId: string): Promise<IReportDocument[]> {
    return await this._model
      .find({ targetId: new Types.ObjectId(targetId) })
      .populate('reporterId', 'name email avatarURL')
      .populate('tripId', 'title destination')
      .sort({ createdAt: -1 });
  }
}
