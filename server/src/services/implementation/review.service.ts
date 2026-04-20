import { FilterQuery, Types } from 'mongoose';
import { IReview, IReviewDocument } from '../../models/review.model';
import { IReviewRepository } from '../../repositories/interface/IReviewRepository';
import { ITripRepository } from '../../repositories/interface/ITripRepository';
import { IReviewService } from '../interface/IReviewService';
import { logger } from '@/utils/logger';

export class ReviewService implements IReviewService {
  constructor(
    private _reviewRepository: IReviewRepository,
    private _tripRepository: ITripRepository
  ) {}

  private _getId(
    field: Types.ObjectId | string | Record<string, unknown> | null | undefined
  ): string {
    if (!field) return '';
    if (field instanceof Types.ObjectId) return field.toString();
    if (typeof field === 'object' && '_id' in field) {
      return String((field as { _id: string | Types.ObjectId })._id);
    }
    return String(field);
  }

  async createReview(data: {
    tripId: string;
    reviewerId: string;
    rating: number;
    comment: string;
    target?: 'organizer' | 'guide';
  }): Promise<IReviewDocument> {
    logger.info('Creating review in service', data);

    const trip = await this._tripRepository.findById(data.tripId);
    if (!trip) throw new Error('Trip not found');

    if (trip.status !== 'completed') {
      throw new Error('Can only review completed trips');
    }

    const isMember = trip.members.some(
      m => this._getId(m as unknown as Record<string, unknown>) === data.reviewerId
    );
    const isOrganizer =
      this._getId(trip.userId as unknown as Record<string, unknown>) === data.reviewerId;

    if (!isMember && !isOrganizer) {
      throw new Error('Only trip members or the organizer can leave a review');
    }

    const query: Record<string, unknown> = {
      tripId: data.tripId,
      reviewerId: data.reviewerId,
    };

    if (data.target === 'guide') {
      if (!trip.guideId) throw new Error('No guide assigned to this trip');
      query.guideId = { $exists: true };
    } else {
      query.guideId = { $exists: false };
    }

    const existingReview = await this._reviewRepository.findOne(
      query as FilterQuery<IReviewDocument>
    );
    if (existingReview) {
      throw new Error(`You have already reviewed this ${data.target || 'trip'}`);
    }

    const reviewData: Partial<IReview> = {
      tripId: trip._id,
      reviewerId: new Types.ObjectId(data.reviewerId),
      organizerId: trip.userId,
      rating: data.rating,
      comment: data.comment,
    };

    if (data.target === 'guide' && trip.guideId) {
      reviewData.guideId = trip.guideId as unknown as Types.ObjectId;
    }

    return await this._reviewRepository.create(reviewData as Partial<IReviewDocument>);
  }

  async getTripReviews(tripId: string): Promise<IReviewDocument[]> {
    return await this._reviewRepository.findByTripId(tripId);
  }

  async getOrganizerReviews(organizerId: string): Promise<IReviewDocument[]> {
    return await this._reviewRepository.findByOrganizerId(organizerId);
  }

  async getGuideReviews(guideId: string): Promise<IReviewDocument[]> {
    return await this._reviewRepository.findAll({ guideId } as FilterQuery<IReviewDocument>);
  }

  async getAllReviews(): Promise<IReviewDocument[]> {
    return await this._reviewRepository.findAll({});
  }

  async deleteReview(reviewId: string): Promise<void> {
    await this._reviewRepository.deleteById(reviewId);
  }
}
