import { Schema, model } from 'mongoose';
import { ITripDocument } from '../types/trip.type';

const tripSchema = new Schema<ITripDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    budget: {
      type: Number,
    },
    description: {
      type: String,
      trim: true,
    },
    preferences: {
      travelers: { type: Number, default: 1 },
      accommodation: { type: String, default: 'hotel' },
      transport: { type: String, default: 'flight' },
      interests: [{ type: String }],
    },
    depositAmount: {
      type: Number,
      default: 0,
    },
    minMembers: {
      type: Number,
      default: 2,
    },
    status: {
      type: String,
      enum: ['planned', 'ongoing', 'completed', 'cancelled', 'finalized', 'confirmed'],
      default: 'planned',
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    guideId: {
      type: Schema.Types.ObjectId,
      ref: 'GuideProfile',
      default: null,
    },
    itinerary: [
      {
        day: { type: Number, required: true },
        date: { type: Date, required: true },
        activities: [
          {
            time: { type: String, required: true },
            activity: { type: String, required: true },
            location: { type: String },
            notes: { type: String },
          },
        ],
      },
    ],
    joinDeadline: {
      type: Date,
      default: function (this: ITripDocument) {
        // Default to the startDate itself
        return new Date(this.startDate);
      },
    },
    poolBalance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Basic indexes for user-specific lookups
tripSchema.index({ userId: 1 });
tripSchema.index({ members: 1 });

export const TripModel = model<ITripDocument>('Trip', tripSchema);
