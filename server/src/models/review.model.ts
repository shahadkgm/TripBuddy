import { Schema, model, Document, Types } from 'mongoose';

export interface IReview {
    tripId: Types.ObjectId;
    reviewerId: Types.ObjectId;
    organizerId: Types.ObjectId;
    guideId?: Types.ObjectId;
    rating: number; // 1-5
    comment: string;
    createdAt: Date;
}

export type IReviewDocument = IReview & Document;

const reviewSchema = new Schema<IReviewDocument>(
    {
        tripId: {
            type: Schema.Types.ObjectId,
            ref: 'Trip',
            required: true,
        },
        reviewerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        organizerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        guideId: {
            type: Schema.Types.ObjectId,
            ref: 'GuideProfile',
            required: false,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Indexes
reviewSchema.index({ tripId: 1 });
reviewSchema.index({ organizerId: 1 });
reviewSchema.index({ reviewerId: 1 });
reviewSchema.index({ guideId: 1 });

export const ReviewModel = model<IReviewDocument>('Review', reviewSchema);
