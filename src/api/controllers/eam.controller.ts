import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { eamService } from '../services/eam.service';
import {
  createAssetCategorySchema,
  createAssetMasterSchema,
  updateAssetMasterSchema,
  createAssetLocationSchema,
  createPreventiveMaintenancePlanSchema,
  createMaintenanceScheduleSchema,
  createMaintenanceWorkOrderSchema,
  updateMaintenanceWorkOrderSchema,
  createBreakdownReportSchema,
  createConditionMonitoringSchema,
  createCalibrationRecordSchema,
  createInspectionRecordSchema,
} from '../validators/eam.validator';

export class EamController {
  // Stats & Dashboard
  public async getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const stats = await eamService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Categories
  public async getCategories(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const categories = await eamService.getCategories();
      res.json({ success: true, data: categories });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = createAssetCategorySchema.parse(req.body);
      const user = req.user?.name || 'EAM Admin';
      const created = await eamService.createCategory(validated, user);
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Assets
  public async getAssets(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { categoryId, status, criticality } = req.query;
      const assets = await eamService.getAssets({
        categoryId: categoryId as string,
        status: status as string,
        criticality: criticality as string,
      });
      res.json({ success: true, data: assets });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async getAssetById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const asset = await eamService.getAssetById(id);
      res.json({ success: true, data: asset });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  public async createAsset(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = createAssetMasterSchema.parse(req.body);
      const user = req.user?.name || 'EAM Admin';
      const created = await eamService.createAsset(validated, user);
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public async updateAsset(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validated = updateAssetMasterSchema.parse(req.body);
      const user = req.user?.name || 'EAM Admin';
      const updated = await eamService.updateAsset(id, validated, user);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Locations & Criticality
  public async getLocations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const locations = await eamService.getLocations();
      res.json({ success: true, data: locations });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = createAssetLocationSchema.parse(req.body);
      const user = req.user?.name || 'EAM Admin';
      const created = await eamService.createLocation(validated, user);
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public async getCriticalityMatrix(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const matrix = await eamService.getCriticalityMatrix();
      res.json({ success: true, data: matrix });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Preventive Maintenance Plans & Schedules
  public async getPreventivePlans(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const plans = await eamService.getPreventivePlans();
      res.json({ success: true, data: plans });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createPreventivePlan(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = createPreventiveMaintenancePlanSchema.parse(req.body);
      const user = req.user?.name || 'Maintenance Planner';
      const created = await eamService.createPreventivePlan(validated, user);
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public async getMaintenanceSchedules(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const schedules = await eamService.getMaintenanceSchedules();
      res.json({ success: true, data: schedules });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createMaintenanceSchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = createMaintenanceScheduleSchema.parse(req.body);
      const user = req.user?.name || 'Maintenance Planner';
      const created = await eamService.createMaintenanceSchedule(validated, user);
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Work Orders
  public async getWorkOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { status, workOrderType, assetId } = req.query;
      const workOrders = await eamService.getWorkOrders({
        status: status as string,
        workOrderType: workOrderType as string,
        assetId: assetId as string,
      });
      res.json({ success: true, data: workOrders });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async getWorkOrderById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const wo = await eamService.getWorkOrderById(id);
      res.json({ success: true, data: wo });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  public async createWorkOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = createMaintenanceWorkOrderSchema.parse(req.body);
      const user = req.user?.name || 'Maintenance Admin';
      const created = await eamService.createWorkOrder(validated, user);
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public async updateWorkOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validated = updateMaintenanceWorkOrderSchema.parse(req.body);
      const user = req.user?.name || 'Maintenance Admin';
      const updated = await eamService.updateWorkOrder(id, validated, user);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Breakdowns
  public async getBreakdownReports(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const breakdowns = await eamService.getBreakdownReports();
      res.json({ success: true, data: breakdowns });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createBreakdownReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = createBreakdownReportSchema.parse(req.body);
      const user = req.user?.name || 'Site Operator';
      const created = await eamService.createBreakdownReport(validated, user);
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Telemetry & Condition Monitoring
  public async getConditionMonitoring(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { assetId } = req.query;
      const telemetry = await eamService.getConditionMonitoring(assetId as string);
      res.json({ success: true, data: telemetry });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createConditionMonitoring(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = createConditionMonitoringSchema.parse(req.body);
      const user = req.user?.name || 'IoT Gateway';
      const created = await eamService.createConditionMonitoring(validated, user);
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Calibrations
  public async getCalibrationRecords(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const calibrations = await eamService.getCalibrationRecords();
      res.json({ success: true, data: calibrations });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createCalibrationRecord(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = createCalibrationRecordSchema.parse(req.body);
      const user = req.user?.name || 'Calibration Lead';
      const created = await eamService.createCalibrationRecord(validated, user);
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Inspections
  public async getInspectionRecords(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const inspections = await eamService.getInspectionRecords();
      res.json({ success: true, data: inspections });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createInspectionRecord(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = createInspectionRecordSchema.parse(req.body);
      const user = req.user?.name || 'QA/QC Inspector';
      const created = await eamService.createInspectionRecord(validated, user);
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Maintenance Costs & Audit Logs
  public async getMaintenanceCosts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const costs = await eamService.getMaintenanceCosts();
      res.json({ success: true, data: costs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const logs = await eamService.getAuditLogs();
      res.json({ success: true, data: logs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const eamController = new EamController();
