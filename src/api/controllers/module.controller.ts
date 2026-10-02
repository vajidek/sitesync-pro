import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { moduleService } from '../services/module.service';

export class ModuleController {
  async getModules(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await moduleService.getModules();
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }

  async getModuleById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const item = await moduleService.getModuleById(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Module not found' });
      }
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  async createModule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const created = await moduleService.createModule(req.body);
      res.status(201).json({ success: true, data: created, message: 'Module created successfully' });
    } catch (err) {
      next(err);
    }
  }

  async updateModule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await moduleService.updateModule(id, req.body);
      res.json({ success: true, data: updated, message: 'Module updated successfully' });
    } catch (err) {
      next(err);
    }
  }

  async archiveModule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await moduleService.archiveModule(id);
      res.json({ success: true, message: 'Module archived successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getSubModules(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const moduleId = req.query.moduleId as string | undefined;
      const list = await moduleService.getSubModules(moduleId);
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }

  async createSubModule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const created = await moduleService.createSubModule(req.body);
      res.status(201).json({ success: true, data: created, message: 'Sub-module created successfully' });
    } catch (err) {
      next(err);
    }
  }

  async updateSubModule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await moduleService.updateSubModule(id, req.body);
      res.json({ success: true, data: updated, message: 'Sub-module updated successfully' });
    } catch (err) {
      next(err);
    }
  }

  async archiveSubModule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await moduleService.archiveSubModule(id);
      res.json({ success: true, message: 'Sub-module archived successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getFeatures(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const subModuleId = req.query.subModuleId as string | undefined;
      const list = await moduleService.getFeatures(subModuleId);
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }

  async createFeature(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const created = await moduleService.createFeature(req.body);
      res.status(201).json({ success: true, data: created, message: 'Feature created successfully' });
    } catch (err) {
      next(err);
    }
  }

  async updateFeature(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await moduleService.updateFeature(id, req.body);
      res.json({ success: true, data: updated, message: 'Feature updated successfully' });
    } catch (err) {
      next(err);
    }
  }

  async archiveFeature(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await moduleService.archiveFeature(id);
      res.json({ success: true, message: 'Feature archived successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getSidebarTree(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userRole = req.user?.role || 'VIEWER';
      const departmentId = req.query.departmentId as string | undefined;
      const projectId = req.query.projectId as string | undefined;

      const tree = await moduleService.getSidebarTree(userRole, departmentId, projectId);
      res.json({ success: true, data: tree });
    } catch (err) {
      next(err);
    }
  }

  async getDashboardWidgets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const moduleCode = req.query.moduleCode as string | undefined;
      const widgets = await moduleService.getDashboardWidgets(moduleCode);
      res.json({ success: true, data: widgets });
    } catch (err) {
      next(err);
    }
  }

  async registerDashboardWidget(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const widget = await moduleService.registerDashboardWidget(req.body);
      res.status(201).json({ success: true, data: widget, message: 'Dashboard widget registered' });
    } catch (err) {
      next(err);
    }
  }
}

export const moduleController = new ModuleController();
