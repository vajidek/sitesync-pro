// =============================================================
// PHASE 74: AI GATEWAY CONTROLLER
// =============================================================

import { Request, Response } from 'express';
import { aiGatewayService } from '../services/ai_gateway.service';
import {
  aiGatewayExecuteSchema,
  updateRoutingPolicySchema,
  createApiClientSchema,
  createWebhookSchema,
  submitEvaluationSchema,
  simulateFailoverSchema,
} from '../validators/ai_gateway.validator';
import { logger } from '../utils/logger';

export class AIGatewayController {
  // 1. GET Overview / Health / Stats
  async getOverview(req: Request, res: Response) {
    try {
      const stats = await aiGatewayService.getDashboardOverview();
      return res.json({ success: true, data: stats });
    } catch (err: any) {
      logger.error('[AIGatewayController] getOverview failed:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 2. POST /execute - Universal Task Execution
  async execute(req: Request, res: Response) {
    try {
      const parseResult = aiGatewayExecuteSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: parseResult.error.issues,
        });
      }

      const user = (req as any).user || { id: 'usr-admin-01', role: 'ADMIN' };
      const ipAddress = req.ip || req.socket.remoteAddress;

      const result = await aiGatewayService.executeTask({
        ...parseResult.data,
        user,
        ipAddress,
      });

      return res.json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      logger.error('[AIGatewayController] execute failed:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 3. GET /providers & /models
  async getProviders(req: Request, res: Response) {
    try {
      const providers = await aiGatewayService.getRegisteredProviders();
      return res.json({ success: true, data: providers });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async getModels(req: Request, res: Response) {
    try {
      const models = await aiGatewayService.getRegisteredModels();
      return res.json({ success: true, data: models });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 4. GET & PUT /policies
  async getRoutingPolicies(req: Request, res: Response) {
    try {
      const policies = await aiGatewayService.getRoutingPolicies();
      return res.json({ success: true, data: policies });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async updateRoutingPolicy(req: Request, res: Response) {
    try {
      const parseResult = updateRoutingPolicySchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ success: false, error: 'Invalid policy payload', details: parseResult.error.issues });
      }
      const user = (req as any).user || { id: 'usr-admin-01', role: 'ADMIN' };
      const updated = await aiGatewayService.updateRoutingPolicy(parseResult.data as any, user.id);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 5. GET /usage-logs & /failover-logs
  async getUsageLogs(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await aiGatewayService.getUsageLogs(limit);
      return res.json({ success: true, data: logs });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async getFailoverLogs(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await aiGatewayService.getFailoverLogs(limit);
      return res.json({ success: true, data: logs });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 6. Evaluations
  async getQualityEvaluations(req: Request, res: Response) {
    try {
      const evals = await aiGatewayService.getQualityEvaluations();
      return res.json({ success: true, data: evals });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async runEvaluation(req: Request, res: Response) {
    try {
      const parseResult = submitEvaluationSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ success: false, error: 'Invalid evaluation payload', details: parseResult.error.issues });
      }
      const user = (req as any).user || { id: 'usr-admin-01', role: 'ADMIN' };
      const evaluation = await aiGatewayService.runModelEvaluation({
        ...parseResult.data,
        user,
      });
      return res.json({ success: true, data: evaluation });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 7. Failover Chaos Simulator
  async simulateFailover(req: Request, res: Response) {
    try {
      const parseResult = simulateFailoverSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ success: false, error: 'Invalid simulation payload', details: parseResult.error.issues });
      }
      const user = (req as any).user || { id: 'usr-admin-01', role: 'ADMIN' };
      const simulation = await aiGatewayService.simulateFailover({
        ...parseResult.data,
        user,
      });
      return res.json({ success: true, data: simulation });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 8. API Clients
  async getApiClients(req: Request, res: Response) {
    try {
      const clients = await aiGatewayService.getApiClients();
      return res.json({ success: true, data: clients });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async createApiClient(req: Request, res: Response) {
    try {
      const parseResult = createApiClientSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ success: false, error: 'Invalid client payload', details: parseResult.error.issues });
      }
      const user = (req as any).user || { id: 'usr-admin-01', role: 'ADMIN' };
      const client = await aiGatewayService.createApiClient({
        ...parseResult.data,
        userId: user.id,
      });
      return res.json({ success: true, data: client });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async revokeApiClient(req: Request, res: Response) {
    try {
      const { clientId } = req.params;
      const user = (req as any).user || { id: 'usr-admin-01', role: 'ADMIN' };
      const success = await aiGatewayService.revokeApiClient(clientId, user.id);
      return res.json({ success });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 9. Webhooks
  async getWebhooks(req: Request, res: Response) {
    try {
      const webhooks = await aiGatewayService.getWebhooks();
      return res.json({ success: true, data: webhooks });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async createWebhook(req: Request, res: Response) {
    try {
      const parseResult = createWebhookSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ success: false, error: 'Invalid webhook payload', details: parseResult.error.issues });
      }
      const user = (req as any).user || { id: 'usr-admin-01', role: 'ADMIN' };
      const webhook = await aiGatewayService.createWebhook({
        ...parseResult.data,
        userId: user.id,
      });
      return res.json({ success: true, data: webhook });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async testWebhook(req: Request, res: Response) {
    try {
      const { webhookCode } = req.params;
      const testResult = await aiGatewayService.testWebhook(webhookCode);
      return res.json({ success: true, data: testResult });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async getWebhookEvents(req: Request, res: Response) {
    try {
      const events = await aiGatewayService.getRecentWebhookEvents();
      return res.json({ success: true, data: events });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 10. Audit Logs
  async getAuditLogs(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await aiGatewayService.getAuditLogs(limit);
      return res.json({ success: true, data: logs });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const aiGatewayController = new AIGatewayController();
