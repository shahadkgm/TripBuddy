import { Router } from 'express';
import { ReviewController } from '../controllers/implementation/review.controller';
import { ReviewService } from '../services/implementation/review.service';
import { ReviewRepository } from '../repositories/implementation/review.repository';
import { TripRepository } from '../repositories/implementation/trip.repository';
import { protect } from '../middleware/authMiddleware';

const router = Router();

const reviewRepository = new ReviewRepository();
const tripRepository = new TripRepository();
const reviewService = new ReviewService(reviewRepository, tripRepository);
const reviewController = new ReviewController(reviewService);

// Public routes (or just for members/authenticated users)
router.get('/trip/:tripId', reviewController.getTripReviews);
router.get('/organizer/:organizerId', reviewController.getOrganizerReviews);
router.get('/guide/:guideId', reviewController.getGuideReviews);

// Protected routes
router.post('/', protect, reviewController.createReview);

// Admin routes
router.get('/admin/all', protect, reviewController.getAllReviews);
router.delete('/:id', protect, reviewController.deleteReview);

export default router;
