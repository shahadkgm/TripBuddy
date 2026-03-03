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
    // Upload image with fieldname 'gallery' for proper folder sorting
    async uploadImage(file: File) {
        const formData = new FormData();
        formData.append('gallery', file);
        const response = await api.post('/api/gallery/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    async createPost(data: { image: string, caption?: string, tripName?: string }) {
        const response = await api.post('/api/gallery/post', data);
        return response.data;
    },

    async getAllPosts() {
        const response = await api.get('/api/gallery/all');
        return response.data;
    },
    async getUserPosts(userId: string) {
        const response = await api.get(`/api/gallery/user/${userId}`);
        return response.data;
    }
};
