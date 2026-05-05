import { getIO } from '../../config/socket';
import { IReportRepository } from '../../repositories/interface/IReportRepository';
import { IReportDocument } from '../../models/report.model';

export interface IReportService {
  createReport(data: Partial<IReportDocument>): Promise<IReportDocument>;
  getAllReports(): Promise<IReportDocument[]>;
  getReportsByTarget(targetId: string): Promise<IReportDocument[]>;
  updateReportStatus(id: string, status: string): Promise<IReportDocument | null>;
}

export class ReportService implements IReportService {
  constructor(private _reportRepository: IReportRepository) {}

  async createReport(data: Partial<IReportDocument>): Promise<IReportDocument> {
    const result = await this._reportRepository.create(data);
    try {
      getIO().to('admin_room').emit('global_notification', {
        title: 'New Report Filed',
        message: `A new report has been submitted against a ${data.targetType || 'user'}.`,
        link: '/admin/reports'
      });
    } catch (e) {
      console.error('Failed to emit socket event', e);
    }
    return result;
  }

  async getAllReports(): Promise<IReportDocument[]> {
    return await this._reportRepository.findAllWithDetails();
  }

  async getReportsByTarget(targetId: string): Promise<IReportDocument[]> {
    return await this._reportRepository.findByTargetId(targetId);
  }

  async updateReportStatus(id: string, status: string): Promise<IReportDocument | null> {
    return await this._reportRepository.updateById(id, { status } as Partial<IReportDocument>);
  }
}
