// backend/src/models/guide.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IGuideProfile extends Document {
  userId: mongoose.Types.ObjectId;
  bio: string;
  hourlyRate: number;
  serviceArea: string;
  avatarURL: string;
  specialities: string[];
  isVerified: boolean;
  experience?: number;
}

const GuideProfileSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio: { type: String, required: true },
  hourlyRate: { type: Number, required: true },
  serviceArea: { type: String, required: true },
  avatarURL: { type: String },
  specialities: [{ type: String }],
  isVerified: { type: Boolean, default: false }, 
}, { timestamps: true });

export default mongoose.model<IGuideProfile>('GuideProfile', GuideProfileSchema);