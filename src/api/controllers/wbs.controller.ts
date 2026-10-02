import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { wbsService } from '../services/wbs.service';

export class WbsController {
  // --- WBS NODES ---
  async getWbsTree(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const includeDeleted = req.query.includeDeleted === 'true';
      const tree = await wbsService.getWbsTree(projectId, includeDeleted);
      res.json({ success: true, data: tree });
    } catch (err) {
      next(err);
    }
  }

  async getWbsNodeById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const node = await wbsService.getWbsNodeById(id);
      res.json({ success: true, data: node });
    } catch (err) {
      next(err);
    }
  }

  async createWbsNode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const newNode = await wbsService.createWbsNode({ ...req.body, projectId });
      res.status(201).json({ success: true, data: newNode, message: 'WBS Node created successfully' });
    } catch (err) {
      next(err);
    }
  }

  async updateWbsNode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await wbsService.updateWbsNode(id, req.body);
      res.json({ success: true, data: updated, message: 'WBS Node updated successfully' });
    } catch (err) {
      next(err);
    }
  }

  async moveWbsNode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { newParentId, newDisplayOrder } = req.body;
      const moved = await wbsService.moveWbsNode(id, newParentId, newDisplayOrder);
      res.json({ success: true, data: moved, message: 'WBS Node moved successfully' });
    } catch (err) {
      next(err);
    }
  }

  async duplicateSubtree(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { targetParentId } = req.body;
      const duplicated = await wbsService.duplicateSubtree(id, targetParentId);
      res.status(201).json({ success: true, data: duplicated, message: 'WBS Subtree duplicated successfully' });
    } catch (err) {
      next(err);
    }
  }

  async deleteWbsNode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const recursive = req.query.recursive === 'true' || req.body.recursive === true;
      const result = await wbsService.deleteWbsNode(id, recursive);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async restoreWbsNode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const recursive = req.query.recursive === 'true' || req.body.recursive === true;
      const result = await wbsService.restoreWbsNode(id, recursive);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // --- BOQ ITEMS ---
  async getBoqItems(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { wbsId, search } = req.query as { wbsId?: string; search?: string };
      const items = await wbsService.getBoqItems(projectId, wbsId, search);
      res.json({ success: true, data: items, count: items.length });
    } catch (err) {
      next(err);
    }
  }

  async getBoqItemById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const item = await wbsService.getBoqItemById(id);
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  async createBoqItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const newItem = await wbsService.createBoqItem({ ...req.body, projectId });
      res.status(201).json({ success: true, data: newItem, message: 'BOQ Item created successfully' });
    } catch (err) {
      next(err);
    }
  }

  async updateBoqItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await wbsService.updateBoqItem(id, req.body);
      res.json({ success: true, data: updated, message: 'BOQ Item updated successfully' });
    } catch (err) {
      next(err);
    }
  }

  async bulkUpdateBoqItems(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        res.status(400).json({ success: false, message: 'items array is required' });
        return;
      }
      const result = await wbsService.bulkUpdateBoqItems(items);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async deleteBoqItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await wbsService.deleteBoqItem(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async restoreBoqItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await wbsService.restoreBoqItem(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // --- ACTIVITIES ---
  async getActivities(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { wbsId, boqItemId, department, status, search } = req.query as any;
      const activities = await wbsService.getActivities(projectId, { wbsId, boqItemId, department, status, search });
      res.json({ success: true, data: activities, count: activities.length });
    } catch (err) {
      next(err);
    }
  }

  async getActivityById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const activity = await wbsService.getActivityById(id);
      res.json({ success: true, data: activity });
    } catch (err) {
      next(err);
    }
  }

  async createActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const newAct = await wbsService.createActivity({ ...req.body, projectId });
      res.status(201).json({ success: true, data: newAct, message: 'Activity created successfully' });
    } catch (err) {
      next(err);
    }
  }

  async updateActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await wbsService.updateActivity(id, req.body);
      res.json({ success: true, data: updated, message: 'Activity updated successfully' });
    } catch (err) {
      next(err);
    }
  }

  async logDailyProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { todayQty, status } = req.body;
      const updated = await wbsService.logDailyProgress(id, todayQty, status);
      res.json({ success: true, data: updated, message: "Daily progress recorded successfully" });
    } catch (err) {
      next(err);
    }
  }

  async deleteActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await wbsService.deleteActivity(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async restoreActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await wbsService.restoreActivity(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // Dependencies & Documents
  async addDependency(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { activityId } = req.params;
      const { predecessorActivityId, dependencyType, lagDays, leadDays } = req.body;
      const dep = await wbsService.addDependency(activityId, predecessorActivityId, dependencyType, lagDays, leadDays);
      res.status(201).json({ success: true, data: dep, message: 'Activity dependency added successfully' });
    } catch (err) {
      next(err);
    }
  }

  async deleteDependency(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await wbsService.deleteDependency(id);
      res.json({ success: true, message: 'Dependency removed successfully' });
    } catch (err) {
      next(err);
    }
  }

  async addDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { activityId } = req.params;
      const { title, documentType, fileUrl, fileSize } = req.body;
      const uploadedBy = req.user?.name || req.user?.email || 'Engineer';
      const doc = await wbsService.addDocument(activityId, title, documentType, fileUrl, fileSize, uploadedBy);
      res.status(201).json({ success: true, data: doc, message: 'Activity document uploaded successfully' });
    } catch (err) {
      next(err);
    }
  }

  async deleteDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await wbsService.deleteDocument(id);
      res.json({ success: true, message: 'Document removed successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export const wbsController = new WbsController();
