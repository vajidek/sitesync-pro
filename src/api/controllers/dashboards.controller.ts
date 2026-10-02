import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { dashboardsService } from '../services/dashboards.service';

export class DashboardsController {
  async getDashboards(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { type, search } = req.query;
      const result = await dashboardsService.getDashboards(
        type ? String(type) : undefined,
        search ? String(search) : undefined
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getDashboardById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const dashboard = await dashboardsService.getDashboardById(id);
      if (!dashboard) {
        return res.status(404).json({ success: false, message: 'Dashboard definition not found' });
      }
      res.json({ success: true, data: dashboard });
    } catch (err) {
      next(err);
    }
  }

  async createDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const dashboard = await dashboardsService.createDashboard(req.body);
      res.status(201).json({ success: true, data: dashboard, message: 'Dashboard created successfully' });
    } catch (err) {
      next(err);
    }
  }

  async cloneDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { title } = req.body;
      const dashboard = await dashboardsService.cloneDashboard(id, title);
      res.status(201).json({ success: true, data: dashboard, message: 'Dashboard cloned successfully' });
    } catch (err) {
      next(err);
    }
  }

  async toggleFavorite(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'usr-admin';
      const result = await dashboardsService.toggleFavorite(id, userId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async addWidget(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const widget = await dashboardsService.addWidget(req.body);
      res.status(201).json({ success: true, data: widget, message: 'Widget added to dashboard' });
    } catch (err) {
      next(err);
    }
  }

  async deleteWidget(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { widgetId } = req.params;
      const result = await dashboardsService.deleteWidget(widgetId);
      res.json({ success: true, data: result, message: 'Widget removed' });
    } catch (err) {
      next(err);
    }
  }

  async saveLayout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { widgetPositions } = req.body;
      const result = await dashboardsService.saveLayout(id, widgetPositions || []);
      res.json({ success: true, data: result, message: 'Dashboard layout saved successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getWidgetData(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { widgetId } = req.params;
      const result = await dashboardsService.resolveWidgetData(widgetId, req.body, req.user);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getWorkspaceConfig(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      const data = await dashboardsService.getWorkspaceConfig(workspaceId, req.user);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

export const dashboardsController = new DashboardsController();
