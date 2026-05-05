import api from '../utils/api';
import { API_ENDPOINTS } from '../constants/api.constants';

export const aiService = {
  async getChatResponse(prompt: string): Promise<string> {
    const response = await api.post(API_ENDPOINTS.AI.CHAT, { prompt });
    return response.data.data.response;
  },
};
