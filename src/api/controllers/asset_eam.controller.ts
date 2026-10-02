import { Request, Response } from 'express';
import { AssetEAMService } from '../services/asset_eam.service';
import { 
  createAssetSchema, 
  transferAssetSchema, 
  assignAssetSchema, 
  createMeterReadingSchema, 
  createMaintenancePlanSchema, 
  createWorkOrderSchema, 
  updateWorkOrderSchema, 
  logFuelSchema, 
  logCalibrationSchema 
} from '../validators/asset_eam.validator';

const service = new AssetEAMService();

export class AssetEAMController {
  async getAssets(req: Request, res: Response) {
    try {
      const { search, category, status, projectId } = req.query;
      const assets = await service.getAssets({
        search: search as string,
        category: category as string,
        status: status as string,
        projectId: projectId as string,
      });
      res.json({ success: true, count: assets.length, data: assets });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAssetById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const asset = await service.getAssetById(id);
      res.json({ success: true, data: asset });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async registerAsset(req: Request, res: Response) {
    try {
      const validated = createAssetSchema.parse(req.body);
      const asset = await service.registerAsset(validated);
      res.status(201).json({ success: true, message: 'Asset registered successfully', data: asset });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async transferAsset(req: Request, res: Response) {
    try {
      const validated = transferAssetSchema.parse(req.body);
      const transfer = await service.transferAsset(validated);
      res.status(201).json({ success: true, message: 'Asset transfer dispatched', data: transfer });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async assignAsset(req: Request, res: Response) {
    try {
      const validated = assignAssetSchema.parse(req.body);
      const assignment = await service.assignAsset(validated);
      res.status(201).json({ success: true, message: 'Asset assigned successfully', data: assignment });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async recordMeterReading(req: Request, res: Response) {
    try {
      const validated = createMeterReadingSchema.parse(req.body);
      const reading = await service.recordMeterReading(validated);
      res.status(201).json({ success: true, message: 'Meter reading recorded', data: reading });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async createMaintenancePlan(req: Request, res: Response) {
    try {
      const validated = createMaintenancePlanSchema.parse(req.body);
      const plan = await service.createMaintenancePlan(validated);
      res.status(201).json({ success: true, message: 'Maintenance plan created', data: plan });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getMaintenancePlans(req: Request, res: Response) {
    try {
      const { assetId } = req.query;
      const plans = await service.getMaintenancePlans(assetId as string);
      res.json({ success: true, count: plans.length, data: plans });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createWorkOrder(req: Request, res: Response) {
    try {
      const validated = createWorkOrderSchema.parse(req.body);
      const wo = await service.createWorkOrder(validated);
      res.status(201).json({ success: true, message: 'Maintenance work order created', data: wo });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getWorkOrders(req: Request, res: Response) {
    try {
      const { assetId, status } = req.query;
      const workOrders = await service.getWorkOrders({
        assetId: assetId as string,
        status: status as string,
      });
      res.json({ success: true, count: workOrders.length, data: workOrders });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateWorkOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validated = updateWorkOrderSchema.parse(req.body);
      const result = await service.updateWorkOrder(id, validated);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async logFuel(req: Request, res: Response) {
    try {
      const validated = logFuelSchema.parse(req.body);
      const fuelLog = await service.logFuel(validated);
      res.status(201).json({ success: true, message: 'Fuel consumption logged', data: fuelLog });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getFuelLogs(req: Request, res: Response) {
    try {
      const { assetId } = req.query;
      const logs = await service.getFuelLogs(assetId as string);
      res.json({ success: true, count: logs.length, data: logs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async logCalibration(req: Request, res: Response) {
    try {
      const validated = logCalibrationSchema.parse(req.body);
      const cal = await service.logCalibration(validated);
      res.status(201).json({ success: true, message: 'Calibration record added', data: cal });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getCalibrations(req: Request, res: Response) {
    try {
      const { assetId } = req.query;
      const records = await service.getCalibrations(assetId as string);
      res.json({ success: true, count: records.length, data: records });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getDashboardStats(req: Request, res: Response) {
    try {
      const stats = await service.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
