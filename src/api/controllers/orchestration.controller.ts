// ============================================================================
// PHASE 75: ENTERPRISE ERP ORCHESTRATION - HTTP CONTROLLER
// ============================================================================

import { Request, Response } from 'express';
import { OrchestrationService } from '../services/orchestration.service';
import {
  publishEventSchema,
  replayEventSchema,
  createActionItemSchema,
  updateActionStatusSchema,
  assignActionSchema,
  acknowledgeAlertSchema,
  resolveAlertSchema,
  calculateHealthSchema,
} from '../validators/orchestration.validator';

export class OrchestrationController {
  private service: OrchestrationService;

  constructor() {
    this.service = OrchestrationService.getInstance();
  }

  // 1. Get Operations Command Center Snapshot
  public async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const summary = this.service.getCommandCenterSummary();
      res.json({ success: true, data: summary });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || 'Failed to fetch summary' });
    }
  }

  // 2. Publish Domain Event
  public async publishEvent(req: Request, res: Response): Promise<void> {
    try {
      const parsed = publishEventSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.format() });
        return;
      }

      const user = (req as any).user || { id: 'usr-admin', name: 'Operations Admin', role: 'ADMIN' };
      const result = await this.service.ingestDomainEvent({
        ...parsed.data,
        createdBy: user.name || user.id,
      });

      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || 'Failed to publish event' });
    }
  }

  // 3. Replay Event
  public async replayEvent(req: Request, res: Response): Promise<void> {
    try {
      const parsed = replayEventSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.format() });
        return;
      }

      const user = (req as any).user || { id: 'usr-admin', name: 'Operations Admin', role: 'ADMIN' };
      const result = await this.service.replayEvent(parsed.data.eventId, user.name || user.id);

      res.json({ success: result.success, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || 'Failed to replay event' });
    }
  }

  // 4. Get Domain Events
  public async getEvents(req: Request, res: Response): Promise<void> {
    try {
      const { module, eventType, status, projectId, limit } = req.query;
      const events = this.service.getEvents({
        module: module as any,
        eventType: eventType as string,
        status: status as any,
        projectId: projectId as string,
        limit: limit ? parseInt(limit as string, 10) : 50,
      });
      res.json({ success: true, data: events });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || 'Failed to fetch events' });
    }
  }

  // 5. Get Project Health List & Calculate Health
  public async getProjectHealth(req: Request, res: Response): Promise<void> {
    try {
      const list = this.service.getProjectHealthList();
      res.json({ success: true, data: list });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || 'Failed to fetch health list' });
    }
  }

  public async calculateHealth(req: Request, res: Response): Promise<void> {
    try {
      const parsed = calculateHealthSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.format() });
        return;
      }

      const scorecard = this.service.calculateProjectHealth({
        ...parsed.data,
        projectName: parsed.data.projectName || `Project ${parsed.data.projectId}`,
      });

      res.json({ success: true, data: scorecard });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || 'Failed to calculate health' });
    }
  }

  // 6. Action Center Endpoints
  public async getActions(req: Request, res: Response): Promise<void> {
    try {
      const { status, priority, projectId, targetModule, assignedToUserId } = req.query;
      const actions = this.service.getActions({
        status: status as any,
        priority: priority as string,
        projectId: projectId as string,
        targetModule: targetModule as string,
        assignedToUserId: assignedToUserId as string,
      });
      res.json({ success: true, data: actions });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || 'Failed to fetch actions' });
    }
  }

  public async createAction(req: Request, res: Response): Promise<void> {
    try {
      const parsed = createActionItemSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.format() });
        return;
      }

      const user = (req as any).user || { id: 'usr-admin', name: 'Operations Admin' };
      const action = this.service.createAction({
        ...parsed.data,
        actionButtons: [
          { id: 'btn-1', label: 'Execute Task', action: 'EXECUTE', variant: 'primary' },
          { id: 'btn-2', label: 'View Related Record', action: 'VIEW', variant: 'outline' },
        ],
        createdBy: user.name || user.id,
      });

      res.status(201).json({ success: true, data: action });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || 'Failed to create action' });
    }
  }

  public async updateActionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { actionId } = req.params;
      const parsed = updateActionStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.format() });
        return;
      }

      const user = (req as any).user || { id: 'usr-admin', name: 'Operations Admin' };
      const updated = this.service.updateActionStatus(actionId, parsed.data.status, parsed.data.resolutionNotes, user.name);

      if (!updated) {
        res.status(404).json({ success: false, error: 'Action not found' });
        return;
      }

      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || 'Failed to update action status' });
    }
  }

  public async assignAction(req: Request, res: Response): Promise<void> {
    try {
      const { actionId } = req.params;
      const parsed = assignActionSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.format() });
        return;
      }

      const user = (req as any).user || { id: 'usr-admin', name: 'Operations Admin' };
      const updated = this.service.assignAction(
        actionId,
        parsed.data.assignedUserId,
        parsed.data.assignedRole,
        parsed.data.assignedName,
        user.name
      );

      if (!updated) {
        res.status(404).json({ success: false, error: 'Action not found' });
        return;
      }

      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || 'Failed to assign action' });
    }
  }

  // 7. Correlated Alerts Endpoints
  public async getAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { status, severity, projectId } = req.query;
      const alerts = this.service.getAlerts({
        status: status as string,
        severity: severity as string,
        projectId: projectId as string,
      });
      res.json({ success: true, data: alerts });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || 'Failed to fetch alerts' });
    }
  }

  public async acknowledgeAlert(req: Request, res: Response): Promise<void> {
    try {
      const { alertId } = req.params;
      const user = (req as any).user || { id: 'usr-admin', name: 'Operations Admin' };
      const result = this.service.acknowledgeAlert(alertId, user.name || user.id);

      if (!result) {
        res.status(404).json({ success: false, error: 'Alert not found' });
        return;
      }

      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || 'Failed to acknowledge alert' });
    }
  }

  public async resolveAlert(req: Request, res: Response): Promise<void> {
    try {
      const { alertId } = req.params;
      const parsed = resolveAlertSchema.safeParse({ alertId, ...req.body });
      if (!parsed.success) {
        res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.format() });
        return;
      }

      const user = (req as any).user || { id: 'usr-admin', name: 'Operations Admin' };
      const result = this.service.resolveAlert(alertId, user.name || user.id, parsed.data.resolutionSummary);

      if (!result) {
        res.status(404).json({ success: false, error: 'Alert not found' });
        return;
      }

      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || 'Failed to resolve alert' });
    }
  }

  // 8. Integration Health & Audit Logs
  public async getIntegrationHealth(req: Request, res: Response): Promise<void> {
    try {
      const health = this.service.getIntegrationHealth();
      res.json({ success: true, data: health });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || 'Failed to fetch integration health' });
    }
  }

  public async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const { limit } = req.query;
      const logs = this.service.getAuditLogs(limit ? parseInt(limit as string, 10) : 100);
      res.json({ success: true, data: logs });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || 'Failed to fetch audit logs' });
    }
  }
}

export const orchestrationController = new OrchestrationController();
