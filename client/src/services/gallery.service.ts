import api from '../utils/api';

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
    async createPost(data: { image: string, caption?: string, tripName?: string }) {
        const response = await api.post('/api/gallery/post', data);
        return response.data;
    },

    async getAllPosts() {
        const response = await api.get('/api/gallery/all');
        return response.data;
    }
};
