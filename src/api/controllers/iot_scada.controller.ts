import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { iotScadaService } from '../services/iot_scada.service';
import {
  createDeviceSchema,
  updateDeviceSchema,
  createGatewaySchema,
  createRtuUnitSchema,
  createPlcUnitSchema,
  createSensorSchema,
  ingestTelemetrySchema,
  acknowledgeAlarmSchema,
  resolveAlarmSchema,
  sendDeviceCommandSchema,
  ingestEnergySchema,
} from '../validators/iot_scada.validator';

export class IotScadaController {
  // Statistics & Dashboard
  public async getIotStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const stats = await iotScadaService.getIotStats();
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async getScadaStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const stats = await iotScadaService.getScadaStats();
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Devices
  public async getDevices(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { status, protocol, projectId } = req.query;
      const devices = await iotScadaService.getDevices({
        status: status as string,
        protocol: protocol as string,
        projectId: projectId as string,
      });
      res.json({ success: true, data: devices });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async getDeviceById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const device = await iotScadaService.getDeviceById(req.params.id);
      res.json({ success: true, data: device });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  public async createDevice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = createDeviceSchema.parse(req.body);
      const user = req.user?.name || 'IoT Admin';
      const created = await iotScadaService.createDevice(validated, user);
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public async updateDevice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = updateDeviceSchema.parse(req.body);
      const user = req.user?.name || 'IoT Admin';
      const updated = await iotScadaService.updateDevice(req.params.id, validated, user);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Gateways
  public async getGateways(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const gateways = await iotScadaService.getGateways();
      res.json({ success: true, data: gateways });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createGateway(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = createGatewaySchema.parse(req.body);
      const user = req.user?.name || 'SCADA Admin';
      const created = await iotScadaService.createGateway(validated, user);
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // RTU & PLC
  public async getRtuUnits(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const rtus = await iotScadaService.getRtuUnits();
      res.json({ success: true, data: rtus });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createRtuUnit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = createRtuUnitSchema.parse(req.body);
      const user = req.user?.name || 'SCADA Admin';
      const created = await iotScadaService.createRtuUnit(validated, user);
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public async getPlcUnits(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const plcs = await iotScadaService.getPlcUnits();
      res.json({ success: true, data: plcs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createPlcUnit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = createPlcUnitSchema.parse(req.body);
      const user = req.user?.name || 'SCADA Engineer';
      const created = await iotScadaService.createPlcUnit(validated, user);
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Sensors
  public async getSensors(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const sensors = await iotScadaService.getSensors();
      res.json({ success: true, data: sensors });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createSensor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = createSensorSchema.parse(req.body);
      const user = req.user?.name || 'Instrumentation Lead';
      const created = await iotScadaService.createSensor(validated, user);
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Telemetry Engine
  public async ingestTelemetry(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = ingestTelemetrySchema.parse(req.body);
      const reading = await iotScadaService.ingestTelemetry(validated);
      res.status(201).json({ success: true, data: reading });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public async getLatestTelemetry(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const data = await iotScadaService.getLatestTelemetry(limit);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async getHistoricalTelemetry(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { pointId, deviceId, limit } = req.query;
      const parsedLimit = limit ? parseInt(limit as string, 10) : 100;
      const history = await iotScadaService.getHistoricalTelemetry(
        pointId as string,
        deviceId as string,
        parsedLimit
      );
      res.json({ success: true, data: history });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Alarms
  public async getAlarms(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { status, severity } = req.query;
      const alarms = await iotScadaService.getAlarms(status as string, severity as string);
      res.json({ success: true, data: alarms });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async acknowledgeAlarm(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = acknowledgeAlarmSchema.parse(req.body);
      const user = {
        id: req.user?.id || 'usr-scada-1',
        name: req.user?.name || 'SCADA Operator',
      };
      const updated = await iotScadaService.acknowledgeAlarm(
        req.params.id,
        user,
        validated.comments,
        validated.expectedAction
      );
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public async resolveAlarm(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = resolveAlarmSchema.parse(req.body);
      const resolvedBy = req.user?.name || 'Chief Plant Engineer';
      const updated = await iotScadaService.resolveAlarm(
        req.params.id,
        resolvedBy,
        validated.resolutionNotes,
        validated.createWorkOrder,
        validated.workOrderId
      );
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Equipment Health & Predictive Maintenance
  public async getEquipmentHealth(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const health = await iotScadaService.getEquipmentHealth();
      res.json({ success: true, data: health });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async getPredictiveMaintenance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = await iotScadaService.getPredictiveMaintenanceData();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Energy
  public async getEnergyMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const energy = await iotScadaService.getEnergyMetrics();
      res.json({ success: true, data: energy });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async ingestEnergy(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = ingestEnergySchema.parse(req.body);
      const created = await iotScadaService.ingestEnergy(validated);
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Remote Commands
  public async sendDeviceCommand(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = sendDeviceCommandSchema.parse(req.body);
      const requestedBy = req.user?.name || 'SCADA Operator';
      const authorizedBy = req.user?.name || 'Lead Systems Engineer';
      const result = await iotScadaService.sendDeviceCommand({
        ...validated,
        requestedBy,
        authorizedBy,
      });
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public async getCommandsHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const history = await iotScadaService.getCommandsHistory(limit);
      res.json({ success: true, data: history });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // SCADA Tags & Dashboards
  public async getScadaTags(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const tags = await iotScadaService.getScadaTags();
      res.json({ success: true, data: tags });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async getScadaDashboards(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const dashboards = await iotScadaService.getScadaDashboards();
      res.json({ success: true, data: dashboards });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const iotScadaController = new IotScadaController();
