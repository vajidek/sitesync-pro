import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { integrationsService } from '../services/integrations.service';

export class IntegrationsController {
  async getAllConnectors(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { category, search } = req.query;
      const result = await integrationsService.getAllConnectors(
        category ? String(category) : undefined,
        search ? String(search) : undefined
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getConnectorById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await integrationsService.getConnectorById(id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Connector not found' });
      }
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async toggleConnector(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isEnabled } = req.body;
      const result = await integrationsService.toggleConnector(id, Boolean(isEnabled));
      res.json({ success: true, data: result, message: 'Connector status updated' });
    } catch (err) {
      next(err);
    }
  }

  async updateConnectorConfigs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { configs } = req.body;
      const result = await integrationsService.updateConnectorConfigs(id, configs || [], req.user?.email);
      res.json({ success: true, data: result, message: 'Connector configurations updated' });
    } catch (err) {
      next(err);
    }
  }

  async testConnection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await integrationsService.testConnection(id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getHealthDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await integrationsService.getHealthDashboard();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getSyncJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { connectorId } = req.query;
      const result = await integrationsService.getSyncJobs(connectorId ? String(connectorId) : undefined);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async createSyncJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await integrationsService.createSyncJob(req.body);
      res.status(201).json({ success: true, data: result, message: 'Sync job created' });
    } catch (err) {
      next(err);
    }
  }

  async triggerSyncJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await integrationsService.triggerSyncJob(id);
      res.json({ success: true, data: result, message: 'Sync job triggered manually' });
    } catch (err) {
      next(err);
    }
  }

  async getLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { connectorId, status } = req.query;
      const result = await integrationsService.getLogs(
        connectorId ? String(connectorId) : undefined,
        status ? String(status) : undefined
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async retryFailedLog(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await integrationsService.retryFailedLog(id);
      res.json({ success: true, data: result, message: 'Action retried via Integration Hub' });
    } catch (err) {
      next(err);
    }
  }
}

export const integrationsController = new IntegrationsController();
