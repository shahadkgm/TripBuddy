import { Request, Response } from 'express';
import { IAIService } from '../../services/interface/IAIService';
import { asyncHandler } from '../../utils/asyncHandler';
import { BaseController } from './base.controller';
import { StatusCode } from '../../constants/statusCode.enum';

export class AIController extends BaseController {
  constructor(private readonly _aiService: IAIService) {
    super();
  }

  getAIResponse = asyncHandler(async (req: Request, res: Response) => {
    const { prompt } = req.body;

    if (!prompt) {
      return this.sendError(res, 'Prompt is required', StatusCode.BAD_REQUEST);
    }

    const response = await this._aiService.generateResponse(prompt);

    this.sendSuccess(res, { response }, 'AI response generated successfully');
  });
}
