import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/ai.service';
import { sendSuccess } from '../utils/response';

export class AIController {
  static async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { prompt, context } = req.body;
      if (!prompt) {
        return res.status(400).json({ success: false, message: 'Prompt parameter is required' });
      }
      const result = await AIService.chat(prompt, context);
      return sendSuccess(res, result, 'AI assistant response generated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async analyzeBOQ(req: Request, res: Response, next: NextFunction) {
    try {
      const { items } = req.body;
      const result = await AIService.analyzeBOQ(items || []);
      return sendSuccess(res, result, 'BOQ AI analysis completed');
    } catch (error) {
      next(error);
    }
  }

  static async predictDelays(req: Request, res: Response, next: NextFunction) {
    try {
      const { project } = req.body;
      const result = await AIService.predictDelays(project || {});
      return sendSuccess(res, result, 'Delay prediction generated');
    } catch (error) {
      next(error);
    }
  }

  static async predictMaintenance(req: Request, res: Response, next: NextFunction) {
    try {
      const { fleet } = req.body;
      const result = await AIService.predictMaintenance(fleet || []);
      return sendSuccess(res, result, 'Equipment predictive maintenance report generated');
    } catch (error) {
      next(error);
    }
  }

  static async naturalSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      const result = await AIService.naturalLanguageSearch(String(q || ''));
      return sendSuccess(res, result, 'Natural language search results');
    } catch (error) {
      next(error);
    }
  }
}
