import { Request, Response, NextFunction } from 'express';
import { aiIntelligenceRepository } from '../repositories/ai_intelligence.repository';
import { AIIntelligenceService } from '../services/ai_intelligence.service';
import {
  nlpQuerySchema,
  copilotChatSchema,
  whatIfScenarioSchema,
  recommendationActionSchema,
  anomalyActionSchema,
  feedbackSchema,
  generateReportSchema,
  acknowledgeInsightSchema,
} from '../validators/ai_intelligence.validator';
import { sendSuccess } from '../utils/response';

function getAuthenticatedUser(req: Request, res: Response): any | null {
  const user = (req as any).user;
  if (!user?.id || !user?.role) {
    res.status(401).json({ success: false, message: 'Authenticated AI actor context is required.' });
    return null;
  }
  return user;
}

export class AIIntelligenceController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userRole = (req as any).user?.role;
      if (!userRole) {
        return res.status(401).json({ success: false, message: 'Authenticated AI actor context is required.' });
      }
      const stats = await aiIntelligenceRepository.getEnterpriseStats(userRole);
      return sendSuccess(res, stats, 'Enterprise AI intelligence stats retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async queryNLP(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = nlpQuerySchema.parse(req.body);
      const user = getAuthenticatedUser(req, res);
      if (!user) return;
      const result = await AIIntelligenceService.queryNLP(parsed.query, user);
      return sendSuccess(res, result, 'Natural language query executed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async copilotChat(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = copilotChatSchema.parse(req.body);
      const user = getAuthenticatedUser(req, res);
      if (!user) return;
      const result = await AIIntelligenceService.chatCopilot({
        message: parsed.message,
        user,
        conversationId: parsed.conversationId,
        agentCode: parsed.agentCode,
        projectId: parsed.projectId,
        moduleScope: parsed.moduleScope,
      });
      return sendSuccess(res, result, 'AI copilot response generated');
    } catch (error) {
      next(error);
    }
  }

  static async getInsights(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, severity } = req.query;
      const insights = await aiIntelligenceRepository.getInsights(
        category ? String(category) : undefined,
        severity ? String(severity) : undefined
      );
      return sendSuccess(res, insights, 'AI insights retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async acknowledgeInsight(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      if (!user?.id || !user?.name) {
        return res.status(401).json({ success: false, message: 'Authenticated AI actor context is required.' });
      }
      const item = await aiIntelligenceRepository.acknowledgeInsight(id, user);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Insight not found' });
      }
      return sendSuccess(res, item, 'Insight acknowledged');
    } catch (error) {
      next(error);
    }
  }

  static async getRecommendations(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, priority } = req.query;
      const recs = await aiIntelligenceRepository.getRecommendations(
        status ? String(status) : undefined,
        priority ? String(priority) : undefined
      );
      return sendSuccess(res, recs, 'AI recommendations retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateRecommendationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsed = recommendationActionSchema.parse(req.body);
      const userName = (req as any).user?.name;
      if (!userName) {
        return res.status(401).json({ success: false, message: 'Authenticated AI actor context is required.' });
      }
      const updated = await aiIntelligenceRepository.updateRecommendationStatus(
        id,
        parsed.status,
        parsed.actionNotes,
        userName
      );
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Recommendation not found' });
      }
      return sendSuccess(res, updated, 'Recommendation status updated');
    } catch (error) {
      next(error);
    }
  }

  static async getPredictions(req: Request, res: Response, next: NextFunction) {
    try {
      const { targetEntityType, riskLevel } = req.query;
      const preds = await aiIntelligenceRepository.getPredictions(
        targetEntityType ? String(targetEntityType) : undefined,
        riskLevel ? String(riskLevel) : undefined
      );
      return sendSuccess(res, preds, 'AI predictions retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getAnomalies(req: Request, res: Response, next: NextFunction) {
    try {
      const { sourceModule, severity, status } = req.query;
      const anoms = await aiIntelligenceRepository.getAnomalies(
        sourceModule ? String(sourceModule) : undefined,
        severity ? String(severity) : undefined,
        status ? String(status) : undefined
      );
      return sendSuccess(res, anoms, 'Anomalies retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateAnomalyStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsed = anomalyActionSchema.parse(req.body);
      const user = (req as any).user;
      if (!user?.id || !user?.name) {
        return res.status(401).json({ success: false, message: 'Authenticated AI actor context is required.' });
      }
      const updated = await aiIntelligenceRepository.updateAnomalyStatus(
        id,
        parsed.status,
        parsed.resolutionNotes,
        user
      );
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Anomaly not found' });
      }
      return sendSuccess(res, updated, 'Anomaly status updated');
    } catch (error) {
      next(error);
    }
  }

  static async getRiskScores(req: Request, res: Response, next: NextFunction) {
    try {
      const riskScores = await aiIntelligenceRepository.getRiskScores();
      return sendSuccess(res, riskScores, 'Project risk scores retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getScenarios(req: Request, res: Response, next: NextFunction) {
    try {
      const scenarios = await aiIntelligenceRepository.getScenarios();
      return sendSuccess(res, scenarios, 'What-if scenarios retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async runWhatIfScenario(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = whatIfScenarioSchema.parse(req.body);
      const user = (req as any).user || { id: 'usr-admin', role: 'ADMIN' };
      const result = await AIIntelligenceService.runWhatIfScenario({
        title: parsed.title,
        description: parsed.description,
        projectId: parsed.projectId,
        simulationParameters: parsed.simulationParameters,
        user,
      });
      return sendSuccess(res, result, 'What-if simulation executed');
    } catch (error) {
      next(error);
    }
  }

  static async getReports(req: Request, res: Response, next: NextFunction) {
    try {
      const { reportType } = req.query;
      const reports = await aiIntelligenceRepository.getReports(
        reportType ? String(reportType) : undefined
      );
      return sendSuccess(res, reports, 'AI executive reports retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async generateReport(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = generateReportSchema.parse(req.body);
      const user = getAuthenticatedUser(req, res);
      if (!user) return;
      const report = await AIIntelligenceService.generateReport({
        reportType: parsed.reportType,
        periodStart: parsed.periodStart,
        periodEnd: parsed.periodEnd,
        projectId: parsed.projectId,
        audience: parsed.audience,
        user,
      });
      return sendSuccess(res, report, 'AI executive report generated');
    } catch (error) {
      next(error);
    }
  }

  static async getFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const feedback = await aiIntelligenceRepository.getFeedback();
      return sendSuccess(res, feedback, 'Feedback items retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async submitFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = feedbackSchema.parse(req.body);
      const user = getAuthenticatedUser(req, res);
      if (!user) return;
      const item = await aiIntelligenceRepository.addFeedback({
        id: `fb-${Date.now()}`,
        userId: user.id,
        userRole: user.role,
        ...parsed,
        createdAt: new Date().toISOString(),
      });
      return sendSuccess(res, item, 'Feedback recorded');
    } catch (error) {
      next(error);
    }
  }

  static async getProviders(req: Request, res: Response, next: NextFunction) {
    try {
      const providers = await aiIntelligenceRepository.getProviders();
      return sendSuccess(res, providers, 'AI providers retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getModels(req: Request, res: Response, next: NextFunction) {
    try {
      const models = await aiIntelligenceRepository.getModels();
      return sendSuccess(res, models, 'AI models retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getAgents(req: Request, res: Response, next: NextFunction) {
    try {
      const agents = await aiIntelligenceRepository.getAgents();
      return sendSuccess(res, agents, 'AI agents retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const logs = await aiIntelligenceRepository.getAuditLogs(limit);
      return sendSuccess(res, logs, 'AI audit logs retrieved');
    } catch (error) {
      next(error);
    }
  }
}
