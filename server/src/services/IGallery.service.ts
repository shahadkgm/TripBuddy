import { IGalleryPost } from '../models/galleryPost.model';

export interface IGalleryService {
    createPost(data: Partial<IGalleryPost>): Promise<IGalleryPost>;
    getAllPosts(): Promise<IGalleryPost[]>;
}
