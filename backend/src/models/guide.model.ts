// backend/src/models/guide.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IGuideProfile } from '../interfaces/IGuideInterface.js';



const GuideProfileSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio: { type: String, required: true },
  hourlyRate: { type: Number, required: true },
  serviceArea: { type: String, required: true },
  avatarURL: { type: String },
  specialities: [{ type: String }],
  isVerified: { type: Boolean, default: false }, 
  lastUpdated: { type: Date, default: Date.now } 
}, { timestamps: true });

export default mongoose.model<IGuideProfile>('GuideProfile', GuideProfileSchema);