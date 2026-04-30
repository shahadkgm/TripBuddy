import { IGalleryPost } from '../../models/galleryPost.model';
import { IGalleryRepository } from '../../repositories/IGallery.repository';
import { IGalleryService } from '../interface/IGallery.service';
import { IConnectionRepository } from '../../repositories/interface/IConnectionRepository';
import { Types } from 'mongoose';

export class GalleryService implements IGalleryService {
  constructor(
    private galleryRepository: IGalleryRepository,
    private connectionRepository: IConnectionRepository
  ) {}

  async createPost(data: {
    user: string;
    image: string;
    caption?: string;
    tripName?: string;
  }): Promise<IGalleryPost> {
    return await this.galleryRepository.create(data);
  }

  async getAllPosts(): Promise<IGalleryPost[]> {
    return await this.galleryRepository.findAll();
  }

  async getUserGallery(targetUserId: string, currentUserId: string): Promise<IGalleryPost[]> {
    // If viewing own gallery
    if (targetUserId === currentUserId) {
      return await this.galleryRepository.findByUser(targetUserId);
    }

    // Check if there is an accepted connection between users
    const connections = await this.connectionRepository.getUserConnections(targetUserId);
    const isConnected = connections.some(conn => {
      const getStrId = (id: Types.ObjectId | unknown): string => {
        if (id && typeof id === 'object' && '_id' in id) {
          return (id as { _id: Types.ObjectId })._id.toString();
        }
        return (id as Types.ObjectId).toString();
      };

      const senderId = getStrId(conn.senderId);
      const receiverId = getStrId(conn.receiverId);
      return (
        conn.status === 'accepted' && (senderId === currentUserId || receiverId === currentUserId)
      );
    });

    if (!isConnected) {
      throw new Error(
        'Unauthorized: You can only view galleries of people you are connected with.'
      );
    }

    return await this.galleryRepository.findByUser(targetUserId);
  }
}
