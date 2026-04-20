import { IReviewDocument } from '../../models/review.model';

export interface IReviewService {
  createReview(data: {
    tripId: string;
    reviewerId: string;
    rating: number;
    comment: string;
    target?: 'organizer' | 'guide';
  }): Promise<IReviewDocument>;
  getTripReviews(tripId: string): Promise<IReviewDocument[]>;
  getOrganizerReviews(organizerId: string): Promise<IReviewDocument[]>;
  getGuideReviews(guideId: string): Promise<IReviewDocument[]>;
  getAllReviews(): Promise<IReviewDocument[]>;
  deleteReview(reviewId: string): Promise<void>;
}
