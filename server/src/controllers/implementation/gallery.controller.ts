import { Request, Response } from 'express';
import { IGalleryService } from '../../services/interface/IGallery.service';
import { AuthRequest } from '../../types/authRequest';
import { asyncHandler } from '../../utils/asyncHandler';
import { BaseController } from './base.controller';
import { logger } from '@/utils/logger';

export class GalleryController extends BaseController {
    constructor(private galleryService: IGalleryService) {
        super();
    }

    uploadImage = asyncHandler(async (req: Request, res: Response) => {
        if (!req.file) {
            return this.sendBadRequest(res, 'No file uploaded');
        }
        const s3File = req.file as Express.Multer.File & { location: string };
        this.sendSuccess(res, { imageUrl: s3File.location });
    });

    createPost = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.id;
        logger.info(`userId from p-c ${userId}`);
        const { image, caption, tripName } = req.body;

        if (!image) {
            return this.sendBadRequest(res, 'Image is required');
        }

        if (!userId) {
            return this.sendBadRequest(res, 'User authentication failed');
        }

        const post = await this.galleryService.createPost({
            user: userId,
            image,
            caption,
            tripName
        });

        this.sendCreated(res, post);
    });

    getAllPosts = asyncHandler(async (_req: Request, res: Response) => {
        const posts = await this.galleryService.getAllPosts();
        this.sendSuccess(res, posts);
    });

    getUserGallery = asyncHandler(async (req: AuthRequest, res: Response) => {
        const targetUserId = req.params.userId;
        const currentUserId = req.user?.id;

        if (!currentUserId) {
            return this.sendUnauthorized(res, 'Authentication required');
        }

        try {
            const posts = await this.galleryService.getUserGallery(targetUserId, currentUserId);
            this.sendSuccess(res, posts);
        } catch (error: unknown) {
            if (error instanceof Error && error.message.includes('Unauthorized')) {
                return this.sendForbidden(res, error.message);
            }
            throw error;
        }
    });
}
