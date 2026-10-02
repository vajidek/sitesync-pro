import { Request, Response } from 'express';
import { estimationService } from '../services/estimation.service';

function actor(req: Request, res: Response) {
  const user = (req as any).user;
  const id = String(user?.id || '').trim();
  const name = String(user?.name || user?.fullName || user?.email || '').trim();
  if (!id || !name) {
    res.status(401).json({ success: false, message: 'Authenticated estimator identity is required.' });
    return null;
  }
  return { id, name };
}

export class EstimationController {
  async list(req: Request, res: Response) {
    try {
      const data = await estimationService.list({
        companyId: String(req.query.companyId || '').trim() || undefined,
        projectId: String(req.query.projectId || '').trim() || undefined,
        tenderId: String(req.query.tenderId || '').trim() || undefined,
      });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const data = await estimationService.getById(req.params.id);
      if (!data) {
        res.status(404).json({ success: false, message: 'Estimate not found.' });
        return;
      }
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    const a = actor(req, res);
    if (!a) return;
    try {
      const row = await estimationService.create(req.body, a);
      res.status(201).json({ success: true, data: row });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async addLine(req: Request, res: Response) {
    const a = actor(req, res);
    if (!a) return;
    try {
      const row = await estimationService.addLine(req.params.id, req.body, a);
      res.status(201).json({ success: true, data: row });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async addResource(req: Request, res: Response) {
    const a = actor(req, res);
    if (!a) return;
    try {
      const row = await estimationService.addResource(req.params.revisionId, req.params.lineId, req.body, a);
      res.status(201).json({ success: true, data: row });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async transition(req: Request, res: Response) {
    const a = actor(req, res);
    if (!a) return;
    try {
      const row = await estimationService.transition(req.params.id, req.body?.status, a);
      res.json({ success: true, data: row });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
export const estimationController = new EstimationController();
