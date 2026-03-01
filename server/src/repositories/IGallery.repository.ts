import { IGalleryPost } from '../models/galleryPost.model';

export interface IGalleryRepository {
    create(data: { user: string; image: string; caption?: string; tripName?: string }): Promise<IGalleryPost>;
    findAll(): Promise<IGalleryPost[]>;
}
