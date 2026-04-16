import { IReviewDocument } from '../../models/review.model';
import { IBaseRepository } from './IBaseRepository';

export interface IReviewRepository extends IBaseRepository<IReviewDocument, Partial<IReviewDocument>> {
    findByTripId(tripId: string): Promise<IReviewDocument[]>;
    findByOrganizerId(organizerId: string): Promise<IReviewDocument[]>;
}
