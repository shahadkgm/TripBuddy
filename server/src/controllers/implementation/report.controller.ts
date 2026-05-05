import { Response } from 'express';
import { Types } from 'mongoose';
import { IReportService } from '../../services/implementation/report.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { BaseController } from './base.controller';
import { AuthRequest } from '../../types/authRequest';
import { CreateReportDTO, UpdateReportStatusDTO } from '../../dto/report.dto';
import { IReportDocument } from '../../models/report.model';

export class ReportController extends BaseController {
  constructor(private _reportService: IReportService) {
    super();
  }

  createReport = asyncHandler(async (req: AuthRequest<{}, {}, CreateReportDTO>, res: Response) => {
    const reporterId = req.user?.id;
    if (!reporterId) {
      this.sendUnauthorized(res, 'User not authenticated');
      return;
    }

    const reportData: Partial<IReportDocument> = {
      ...req.body,
      reporterId: new Types.ObjectId(reporterId),
      targetId: new Types.ObjectId(req.body.targetId),
      tripId: new Types.ObjectId(req.body.tripId),
    };
    const report = await this._reportService.createReport(reportData);
    this.sendCreated(res, report, 'Report submitted successfully');
  });

  getAllReports = asyncHandler(async (req: AuthRequest, res: Response) => {
    const reports = await this._reportService.getAllReports();
    this.sendSuccess(res, reports, 'Reports fetched successfully');
  });

  getReportsByTarget = asyncHandler(
    async (req: AuthRequest<{ targetId: string }>, res: Response) => {
      const { targetId } = req.params;
      const reports = await this._reportService.getReportsByTarget(targetId);
      this.sendSuccess(res, reports, 'Reports fetched successfully');
    }
  );

  updateStatus = asyncHandler(
    async (req: AuthRequest<{ reportId: string }, {}, UpdateReportStatusDTO>, res: Response) => {
      const { reportId } = req.params;
      const { status } = req.body;
      const report = await this._reportService.updateReportStatus(reportId, status);
      if (!report) {
        this.sendNotFound(res, 'Report not found');
        return;
      }
      this.sendSuccess(res, report, 'Report status updated');
    }
  );
}
