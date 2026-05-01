import { IReportDocument } from '../../models/report.model';
import { IBaseRepository } from './IBaseRepository';

export interface IReportRepository extends IBaseRepository<
  IReportDocument,
  Partial<IReportDocument>
> {
  findAllWithDetails(): Promise<IReportDocument[]>;
  findByTargetId(targetId: string): Promise<IReportDocument[]>;
}
