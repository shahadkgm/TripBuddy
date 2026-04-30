import { Schema, model, Document, Types } from 'mongoose';

export interface IReport {
  reporterId: Types.ObjectId;
  targetId: Types.ObjectId; // Could be a Guide or Organizer
  targetType: 'guide' | 'organizer';
  tripId: Types.ObjectId;
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: Date;
  updatedAt: Date;
}

export type IReportDocument = IReport & Document;

const ReportSchema = new Schema<IReportDocument>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['guide', 'organizer'], required: true },
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const ReportModel = model<IReportDocument>('Report', ReportSchema);
