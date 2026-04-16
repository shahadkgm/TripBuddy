import { Response } from 'express';
import { IReviewService } from '../../services/interface/IReviewService';
import { asyncHandler } from '../../utils/asyncHandler';
import { BaseController } from './base.controller';
import { AuthRequest } from '../../types/authRequest';

export class ReviewController extends BaseController {
    constructor(private readonly _reviewService: IReviewService) {
        super();
    }

    createReview = asyncHandler(async (req: AuthRequest<{}, unknown, { tripId: string, rating: number, comment: string, target?: 'organizer' | 'guide' }>, res: Response) => {
        const { tripId, rating, comment, target } = req.body;
        const reviewerId = req.user?.id as string;

        const review = await this._reviewService.createReview({
            tripId,
            reviewerId,
            rating: Number(rating),
            comment,
            target
        });

        this.sendCreated(res, review, 'Review submitted successfully');
    });

    getTripReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { tripId } = req.params;
        const reviews = await this._reviewService.getTripReviews(tripId);
        this.sendSuccess(res, reviews, 'Trip reviews fetched successfully');
    });

    getOrganizerReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { organizerId } = req.params;
        const reviews = await this._reviewService.getOrganizerReviews(organizerId);
        this.sendSuccess(res, reviews, 'Organizer reviews fetched successfully');
    });

    getGuideReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { guideId } = req.params;
        const reviews = await this._reviewService.getGuideReviews(guideId);
        this.sendSuccess(res, reviews, 'Guide reviews fetched successfully');
    });

    getAllReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
        const reviews = await this._reviewService.getAllReviews();
        this.sendSuccess(res, reviews, 'All reviews fetched successfully');
    });

    deleteReview = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { id } = req.params;
        await this._reviewService.deleteReview(id);
        this.sendSuccess(res, null, 'Review deleted successfully');
    });
}
