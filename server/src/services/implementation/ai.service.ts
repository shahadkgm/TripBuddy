import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { IAIService } from "../interface/IAIService";
import { logger } from "../../utils/logger";

export class AIService implements IAIService {
    private readonly _genAI: GoogleGenerativeAI;
    private readonly _model: GenerativeModel;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            logger.error("GEMINI_API_KEY is not defined in environment variables");
            throw new Error("AI Service configuration missing");
        }
        this._genAI = new GoogleGenerativeAI(apiKey);
        this._model = this._genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    }

    async generateResponse(userPrompt: string): Promise<string> {
        try {
            const chat = this._model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: "You are a friendly and knowledgeable AI Travel Assistant for 'Trip Buddy', a platform that helps people find travel partners and plan trips. Suggest destinations, help with itineraries, and be encouraging. Keep responses concise but helpful. Use markdown for formatting." }],
                    },
                    {
                        role: "model",
                        parts: [{ text: "Hello! I'm your Trip Buddy AI Assistant. I can help you find amazing destinations, plan your next adventure, or even help you find the perfect travel partner. Where are we heading today?" }],
                    },
                ],
            });

            const result = await chat.sendMessage(userPrompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            logger.error("Error in AIService.generateResponse:", error);
            throw new Error("Failed to generate AI response");
        }
    }
}

