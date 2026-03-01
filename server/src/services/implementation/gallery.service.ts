import { IGalleryPost } from '../../models/galleryPost.model';
import { IGalleryRepository } from '../../repositories/IGallery.repository';
import { IGalleryService } from '../IGallery.service';

export class GalleryService implements IGalleryService {
    constructor(private galleryRepository: IGalleryRepository) { }

    async createPost(data: { user: string; image: string; caption?: string; tripName?: string }): Promise<IGalleryPost> {
        return await this.galleryRepository.create(data);
    }

    async getAllPosts(): Promise<IGalleryPost[]> {
        return await this.galleryRepository.findAll();
    }
}
