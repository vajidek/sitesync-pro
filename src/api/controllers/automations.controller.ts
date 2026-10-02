import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { automationsService } from '../services/automations.service';

export class AutomationsController {
  async getAutomationRules(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { eventSource, search } = req.query;
      const result = await automationsService.getAutomationRules(
        eventSource ? String(eventSource) : undefined,
        search ? String(search) : undefined
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getRuleById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const rule = await automationsService.getRuleById(id);
      if (!rule) {
        return res.status(404).json({ success: false, message: 'Automation rule not found' });
      }
      res.json({ success: true, data: rule });
    } catch (err) {
      next(err);
    }
  }

  async createAutomationRule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const rule = await automationsService.createAutomationRule(req.body);
      res.status(201).json({ success: true, data: rule, message: 'Automation rule created successfully' });
    } catch (err) {
      next(err);
    }
  }

  async toggleRuleStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await automationsService.toggleRuleStatus(id);
      res.json({ success: true, data: result, message: 'Rule status updated' });
    } catch (err) {
      next(err);
    }
  }

  async triggerEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { eventSource, triggerType, payload } = req.body;
      const result = await automationsService.evaluateAndTrigger(eventSource, triggerType, payload, req.user);
      res.json({ success: true, data: result, message: 'Event evaluated across rules engine' });
    } catch (err) {
      next(err);
    }
  }

  async getTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await automationsService.getTemplates();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async createTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tpl = await automationsService.createTemplate(req.body);
      res.status(201).json({ success: true, data: tpl, message: 'Notification template created' });
    } catch (err) {
      next(err);
    }
  }

  async getUserNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'usr-admin';
      const result = await automationsService.getUserNotifications(userId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async markNotificationRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await automationsService.markNotificationRead(id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getExecutionLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await automationsService.getExecutionLogs();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async retryFailedLog(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await automationsService.retryFailedLog(id);
      res.json({ success: true, data: result, message: 'Failed action retried successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export const automationsController = new AutomationsController();
