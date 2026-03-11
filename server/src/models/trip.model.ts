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
        status: {
            type: String,
            enum: ['planned', 'ongoing', 'completed', 'cancelled'],
            default: 'planned',
        },
        members: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Basic indexes for user-specific lookups
tripSchema.index({ userId: 1 });
tripSchema.index({ members: 1 });

export const TripModel = model<ITripDocument>('Trip', tripSchema);
