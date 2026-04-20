export interface IAIService {
  generateResponse(userPrompt: string): Promise<string>;
}
