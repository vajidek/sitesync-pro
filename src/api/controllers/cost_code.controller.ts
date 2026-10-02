import { Request, Response } from 'express';
import { costCodeService } from '../services/cost_code.service';

function actor(req: Request, res: Response) {
  const user = (req as any).user;
  const id = String(user?.id || '').trim();
  const name = String(user?.name || user?.fullName || user?.email || '').trim();
  if (!id || !name) {
    res.status(401).json({ success: false, message: 'Authenticated actor identity is required.' });
    return null;
  }
  return { id, name };
}

export class CostCodeController {
  async list(req: Request, res: Response) {
    try {
      const data = await costCodeService.list({
        companyId: String(req.query.companyId || '').trim() || undefined,
        projectId: String(req.query.projectId || '').trim() || undefined,
        wbsId: String(req.query.wbsId || '').trim() || undefined,
        includeInactive: String(req.query.includeInactive || '').toLowerCase() === 'true',
      });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const row = await costCodeService.getById(req.params.id);
      if (!row) {
        res.status(404).json({ success: false, message: 'Cost code not found.' });
        return;
      }
      res.json({ success: true, data: row });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    const a = actor(req, res);
    if (!a) return;
    try {
      const row = await costCodeService.create(req.body, a);
      res.status(201).json({ success: true, data: row });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    const a = actor(req, res);
    if (!a) return;
    try {
      const row = await costCodeService.update(req.params.id, req.body, a);
      if (!row) {
        res.status(404).json({ success: false, message: 'Cost code not found.' });
        return;
      }
      res.json({ success: true, data: row });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export const costCodeController = new CostCodeController();
