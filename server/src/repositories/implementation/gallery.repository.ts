import GalleryPost, { IGalleryPost } from '../../models/galleryPost.model';
import { IGalleryRepository } from '../IGallery.repository';

export class GalleryRepository implements IGalleryRepository {
    async create(data: { user: string; image: string; caption?: string; tripName?: string }): Promise<IGalleryPost> {
        const post = new GalleryPost(data);
        return await post.save();
    }

    async findAll(): Promise<IGalleryPost[]> {
        return await GalleryPost.find().populate('user', 'name avatar').sort({ createdAt: -1 });
    }
}
