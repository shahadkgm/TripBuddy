import { ReviewModel, IReviewDocument } from '../../models/review.model';
import { BaseRepository } from './base.repository';
import { IReviewRepository } from '../interface/IReviewRepository';

export class ReviewRepository extends BaseRepository<IReviewDocument, Partial<IReviewDocument>> implements IReviewRepository {
    constructor() {
        super(ReviewModel);
    }

    async findByTripId(tripId: string): Promise<IReviewDocument[]> {
        return await this._model.find({ tripId }).populate('reviewerId', 'name avatarURL').sort({ createdAt: -1 });
    }

    async findByOrganizerId(organizerId: string): Promise<IReviewDocument[]> {
        return await this._model.find({ organizerId }).populate('reviewerId', 'name avatarURL').populate('tripId', 'destination').sort({ createdAt: -1 });
    }
}
