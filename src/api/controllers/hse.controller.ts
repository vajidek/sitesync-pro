import { Request, Response } from 'express';
import { HSEService } from '../services/hse.service';
import {
  CreateIncidentSchema,
  CreateNearMissSchema,
  CreateHazardReportSchema,
  CreateRiskAssessmentSchema,
  CreateJsaSchema,
  CreateToolboxTalkSchema,
  CreateWorkPermitSchema,
  CreateSafetyInspectionSchema,
  CreatePpeIssuanceSchema,
  CreateTrainingRecordSchema,
  CreateEmergencyDrillSchema,
  CreateFireEquipmentSchema,
  CreateEnvironmentMonitoringSchema,
  CreateWasteManagementSchema,
} from '../validators/hse.validator';

export class HSEController {
  private service: HSEService;

  constructor() {
    this.service = new HSEService();
  }

  public getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.service.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  // Incidents
  public getIncidents = async (req: Request, res: Response): Promise<void> => {
    try {
      const incidents = await this.service.getIncidents();
      res.json({ success: true, count: incidents.length, data: incidents });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  public createIncident = async (req: Request, res: Response): Promise<void> => {
    try {
      const validated = CreateIncidentSchema.parse(req.body);
      const result = await this.service.createIncident(validated);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  // Near Miss
  public getNearMisses = async (req: Request, res: Response): Promise<void> => {
    try {
      const records = await this.service.getNearMisses();
      res.json({ success: true, count: records.length, data: records });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  public createNearMiss = async (req: Request, res: Response): Promise<void> => {
    try {
      const validated = CreateNearMissSchema.parse(req.body);
      const result = await this.service.createNearMiss(validated);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  // Hazard Reports
  public getHazardReports = async (req: Request, res: Response): Promise<void> => {
    try {
      const records = await this.service.getHazardReports();
      res.json({ success: true, count: records.length, data: records });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  public createHazardReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const validated = CreateHazardReportSchema.parse(req.body);
      const result = await this.service.createHazardReport(validated);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  // Risk Assessments
  public getRiskAssessments = async (req: Request, res: Response): Promise<void> => {
    try {
      const records = await this.service.getRiskAssessments();
      res.json({ success: true, count: records.length, data: records });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  public createRiskAssessment = async (req: Request, res: Response): Promise<void> => {
    try {
      const validated = CreateRiskAssessmentSchema.parse(req.body);
      const result = await this.service.createRiskAssessment(validated);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  // JSA
  public getJsaList = async (req: Request, res: Response): Promise<void> => {
    try {
      const records = await this.service.getJsaList();
      res.json({ success: true, count: records.length, data: records });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  public createJsa = async (req: Request, res: Response): Promise<void> => {
    try {
      const validated = CreateJsaSchema.parse(req.body);
      const result = await this.service.createJsa(validated);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  // Toolbox Talks
  public getToolboxTalks = async (req: Request, res: Response): Promise<void> => {
    try {
      const records = await this.service.getToolboxTalks();
      res.json({ success: true, count: records.length, data: records });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  // Work Permits
  public getWorkPermits = async (req: Request, res: Response): Promise<void> => {
    try {
      const records = await this.service.getWorkPermits();
      res.json({ success: true, count: records.length, data: records });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  public createWorkPermit = async (req: Request, res: Response): Promise<void> => {
    try {
      const validated = CreateWorkPermitSchema.parse(req.body);
      const result = await this.service.createWorkPermit(validated);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  // Safety Inspections
  public getSafetyInspections = async (req: Request, res: Response): Promise<void> => {
    try {
      const records = await this.service.getSafetyInspections();
      res.json({ success: true, count: records.length, data: records });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  // PPE Issuances
  public getPpeIssuances = async (req: Request, res: Response): Promise<void> => {
    try {
      const records = await this.service.getPpeIssuances();
      res.json({ success: true, count: records.length, data: records });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  public createPpeIssuance = async (req: Request, res: Response): Promise<void> => {
    try {
      const validated = CreatePpeIssuanceSchema.parse(req.body);
      const result = await this.service.createPpeIssuance(validated);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  // Training Records
  public getTrainingRecords = async (req: Request, res: Response): Promise<void> => {
    try {
      const records = await this.service.getTrainingRecords();
      res.json({ success: true, count: records.length, data: records });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  // Emergency Drills
  public getEmergencyDrills = async (req: Request, res: Response): Promise<void> => {
    try {
      const records = await this.service.getEmergencyDrills();
      res.json({ success: true, count: records.length, data: records });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  // Fire Equipment
  public getFireEquipment = async (req: Request, res: Response): Promise<void> => {
    try {
      const records = await this.service.getFireEquipment();
      res.json({ success: true, count: records.length, data: records });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  // Environmental Monitoring
  public getEnvironmentLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const records = await this.service.getEnvironmentLogs();
      res.json({ success: true, count: records.length, data: records });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  // Waste Management
  public getWasteLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const records = await this.service.getWasteLogs();
      res.json({ success: true, count: records.length, data: records });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
}
