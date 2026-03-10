import api from "../utils/api";

export const aiService = {
    async getChatResponse(prompt: string): Promise<string> {
        const response = await api.post("/api/ai/chat", { prompt });
        return response.data.data.response;
    }
};
