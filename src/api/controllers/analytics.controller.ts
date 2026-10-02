import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import {
  CreateDashboardSchema,
  CreateWidgetSchema,
  CreateSavedReportSchema,
  CreateExecutiveReportSchema,
  CreateAiInsightSchema,
} from '../validators/analytics.validator';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  public async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await analyticsService.getStats();
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async getExecutiveOverview(req: Request, res: Response): Promise<void> {
    try {
      const overview = await analyticsService.getExecutiveOverview();
      res.json({ success: true, data: overview });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Dashboards
  public async getDashboards(req: Request, res: Response): Promise<void> {
    try {
      const roleView = req.query.roleView as string;
      const dashboards = await analyticsService.getDashboards(roleView);
      res.json({ success: true, count: dashboards.length, data: dashboards });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createDashboard(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateDashboardSchema.parse(req.body);
      const newDash = await analyticsService.createDashboard(validated);
      res.status(201).json({ success: true, message: 'Dashboard created successfully', data: newDash });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error });
    }
  }

  // Widgets
  public async getWidgets(req: Request, res: Response): Promise<void> {
    try {
      const dashboardId = req.query.dashboardId as string;
      const widgets = await analyticsService.getWidgets(dashboardId);
      res.json({ success: true, count: widgets.length, data: widgets });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createWidget(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateWidgetSchema.parse(req.body);
      const newWidget = await analyticsService.createWidget(validated);
      res.status(201).json({ success: true, message: 'Widget created successfully', data: newWidget });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error });
    }
  }

  // Saved Reports
  public async getSavedReports(req: Request, res: Response): Promise<void> {
    try {
      const reports = await analyticsService.getSavedReports();
      res.json({ success: true, count: reports.length, data: reports });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createSavedReport(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateSavedReportSchema.parse(req.body);
      const newReport = await analyticsService.createSavedReport(validated);
      res.status(201).json({ success: true, message: 'Saved report created successfully', data: newReport });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error });
    }
  }

  // AI Insights
  public async getAiInsights(req: Request, res: Response): Promise<void> {
    try {
      const insights = await analyticsService.getAiInsights();
      res.json({ success: true, count: insights.length, data: insights });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createAiInsight(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateAiInsightSchema.parse(req.body);
      const newInsight = await analyticsService.createAiInsight(validated);
      res.status(201).json({ success: true, message: 'AI insight created successfully', data: newInsight });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error });
    }
  }

  // Executive Reports
  public async getExecutiveReports(req: Request, res: Response): Promise<void> {
    try {
      const reports = await analyticsService.getExecutiveReports();
      res.json({ success: true, count: reports.length, data: reports });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createExecutiveReport(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateExecutiveReportSchema.parse(req.body);
      const newReport = await analyticsService.createExecutiveReport(validated);
      res.status(201).json({ success: true, message: 'Executive report created successfully', data: newReport });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error });
    }
  }

  // KPIs
  public async getKpis(req: Request, res: Response): Promise<void> {
    try {
      const kpis = await analyticsService.getKpiDefinitions();
      res.json({ success: true, count: kpis.length, data: kpis });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
