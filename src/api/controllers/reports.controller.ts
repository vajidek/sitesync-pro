import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { reportsService } from '../services/reports.service';

export class ReportsController {
  async getReports(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { dataSource, search } = req.query;
      const result = await reportsService.getReports(
        dataSource ? String(dataSource) : undefined,
        search ? String(search) : undefined
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getReportById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const report = await reportsService.getReportById(id);
      if (!report) {
        return res.status(404).json({ success: false, message: 'Report definition not found' });
      }
      res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  async createReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const report = await reportsService.createReport(req.body);
      res.status(201).json({ success: true, data: report, message: 'Report definition created successfully' });
    } catch (err) {
      next(err);
    }
  }

  async executeReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await reportsService.executeReportData(id, req.body, req.user);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async scheduleReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const schedule = await reportsService.scheduleReport(req.body);
      res.status(201).json({ success: true, data: schedule, message: 'Report schedule created successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export const reportsController = new ReportsController();
