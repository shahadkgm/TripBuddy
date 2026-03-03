import { IGalleryPost } from '../../models/galleryPost.model';

export interface IGalleryService {
    createPost(data: { user: string; image: string; caption?: string; tripName?: string }): Promise<IGalleryPost>;
    getAllPosts(): Promise<IGalleryPost[]>;
    getUserGallery(targetUserId: string, currentUserId: string): Promise<IGalleryPost[]>;
}
