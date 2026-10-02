import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { dprService } from '../services/dpr.service';

export class DprController {
  async getProjectDprs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.projectId;
      const { date, status, departmentId } = req.query as Record<string, string>;
      const reports = await dprService.getProjectDprs(projectId, { date, status, departmentId });
      res.json({ success: true, data: reports });
    } catch (err) {
      next(err);
    }
  }

  async getDprById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const dpr = await dprService.getDprById(id);
      res.json({ success: true, data: dpr });
    } catch (err) {
      next(err);
    }
  }

  async createDpr(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.projectId || req.body.projectId;
      const createdBy = req.user?.id || 'system';
      const date = req.body.date || req.body.reportDate || new Date().toISOString().split('T')[0];
      const dpr = await dprService.createDpr({
        ...req.body,
        projectId,
        date,
        createdBy
      });
      res.status(201).json({ success: true, data: dpr });
    } catch (err) {
      next(err);
    }
  }

  async updateDpr(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const updated = await dprService.updateDpr(id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async softDeleteDpr(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const result = await dprService.softDeleteDpr(id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async restoreDpr(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const restored = await dprService.restoreDpr(id);
      res.json({ success: true, data: restored });
    } catch (err) {
      next(err);
    }
  }

  // Entries
  async addEntry(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const dprId = req.params.id;
      const createdBy = req.user?.id || 'system';
      const entryId = await dprService.addEntry({
        ...req.body,
        dprId,
        createdBy
      });
      res.status(201).json({ success: true, data: { id: entryId } });
    } catch (err) {
      next(err);
    }
  }

  async updateEntry(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const entryId = req.params.entryId;
      await dprService.updateEntry(entryId, req.body);
      res.json({ success: true, message: 'Entry updated successfully' });
    } catch (err) {
      next(err);
    }
  }

  async deleteEntry(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const entryId = req.params.entryId;
      await dprService.deleteEntry(entryId);
      res.json({ success: true, message: 'Entry deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  // Weather
  async upsertWeather(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const dprId = req.params.id;
      const id = await dprService.upsertWeather(dprId, req.body);
      res.json({ success: true, data: { id } });
    } catch (err) {
      next(err);
    }
  }

  // Delays
  async addDelay(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const dprId = req.params.id;
      const id = await dprService.addDelay({ ...req.body, dprId });
      res.status(201).json({ success: true, data: { id } });
    } catch (err) {
      next(err);
    }
  }

  async updateDelay(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const delayId = req.params.delayId;
      await dprService.updateDelay(delayId, req.body);
      res.json({ success: true, message: 'Delay updated successfully' });
    } catch (err) {
      next(err);
    }
  }

  async deleteDelay(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const delayId = req.params.delayId;
      await dprService.deleteDelay(delayId);
      res.json({ success: true, message: 'Delay deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  // Photos & Docs
  async addPhoto(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const dprId = req.params.id;
      const id = await dprService.addPhoto({ ...req.body, dprId });
      res.status(201).json({ success: true, data: { id } });
    } catch (err) {
      next(err);
    }
  }

  async deletePhoto(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const photoId = req.params.photoId;
      await dprService.deletePhoto(photoId);
      res.json({ success: true, message: 'Photo deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  async addDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const dprId = req.params.id;
      const uploadedBy = req.user?.email || 'User';
      const id = await dprService.addDocument({ ...req.body, dprId, uploadedBy });
      res.status(201).json({ success: true, data: { id } });
    } catch (err) {
      next(err);
    }
  }

  async deleteDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const documentId = req.params.documentId;
      await dprService.deleteDocument(documentId);
      res.json({ success: true, message: 'Document deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  // Approvals & Comments
  async addApproval(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const dprId = req.params.id;
      const approverId = req.user?.id;
      const approverName = req.user?.email || req.body.approverName || 'Approver';
      const id = await dprService.addApproval(dprId, {
        ...req.body,
        approverId,
        approverName
      });
      res.status(201).json({ success: true, data: { id } });
    } catch (err) {
      next(err);
    }
  }

  async addComment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const dprId = req.params.id;
      const authorId = req.user?.id;
      const authorName = req.user?.email || req.body.authorName || 'Engineer';
      const id = await dprService.addComment(dprId, {
        ...req.body,
        authorId,
        authorName
      });
      res.status(201).json({ success: true, data: { id } });
    } catch (err) {
      next(err);
    }
  }

  // KPIs
  async getProjectDprKpis(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.projectId;
      const kpis = await dprService.getProjectDprKpis(projectId);
      res.json({ success: true, data: kpis });
    } catch (err) {
      next(err);
    }
  }
}

export const dprController = new DprController();
