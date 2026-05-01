import api from '../utils/api';
import { API_ENDPOINTS } from '../constants/api.constants';

export interface GalleryPost {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  image: string;
  caption?: string;
  tripName?: string;
  createdAt: string;
}

export const galleryService = {
  // Upload image with fieldname 'gallery' for proper folder sorting
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('gallery', file);
    const response = await api.post(API_ENDPOINTS.GALLERY.UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async createPost(data: { image: string; caption?: string; tripName?: string }) {
    const response = await api.post(API_ENDPOINTS.GALLERY.POST, data);
    return response.data;
  },

  async getAllPosts() {
    const response = await api.get(API_ENDPOINTS.GALLERY.ALL);
    return response.data;
  },
  async getUserPosts(userId: string) {
    const response = await api.get(API_ENDPOINTS.GALLERY.USER_GALLERY(userId));
    return response.data;
  },
};
