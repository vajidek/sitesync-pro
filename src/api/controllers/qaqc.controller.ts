import { Request, Response } from 'express';
import { QAQCService } from '../services/qaqc.service';
import {
  CreateInspectionSchema,
  CreateNcrSchema,
  CreateCapaSchema,
  CreateItpSchema,
  CreateMirSchema,
  CreateSiteTestSchema,
  CreateWeldingInspectionSchema,
  CreateHydroTestSchema,
  CreatePressureTestSchema,
  CreatePunchListSchema,
  CreateSnagListSchema,
} from '../validators/qaqc.validator';

function getAuthenticatedActor(req: Request, res: Response): { userId: string; userName: string } | null {
  const user = (req as any).user;
  const userId = String(user?.id || user?.userId || '').trim();
  const userName = String(user?.name || user?.fullName || user?.email || '').trim();
  if (!userId || !userName) {
    res.status(401).json({ success: false, message: 'Authenticated user context is required.' });
    return null;
  }
  return { userId, userName };
}
export class QAQCController {
  private service: QAQCService;

  constructor() {
    this.service = new QAQCService();
  }

  public getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.service.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  public getInspections = async (req: Request, res: Response): Promise<void> => {
    try {
      const inspections = await this.service.getInspections();
      res.json({ success: true, count: inspections.length, data: inspections });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  public createInspection = async (req: Request, res: Response): Promise<void> => {
    try {
      const actor = getAuthenticatedActor(req, res);
      if (!actor) return;
      const validated = CreateInspectionSchema.parse(req.body);
      const inspection = await this.service.createInspection({
        ...validated,
        createdBy: actor.userName,
        updatedBy: actor.userName,
      });
      res.status(201).json({ success: true, data: inspection });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  public getNcrs = async (req: Request, res: Response): Promise<void> => {
    try {
      const ncrs = await this.service.getNcrs();
      res.json({ success: true, count: ncrs.length, data: ncrs });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  public createNcr = async (req: Request, res: Response): Promise<void> => {
    try {
      const actor = getAuthenticatedActor(req, res);
      if (!actor) return;
      const validated = CreateNcrSchema.parse(req.body);
      const ncr = await this.service.createNcr({
        ...validated,
        createdBy: actor.userName,
        updatedBy: actor.userName,
        issuedBy: actor.userName,
      });
      res.status(201).json({ success: true, data: ncr });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  public getCapas = async (req: Request, res: Response): Promise<void> => {
    try {
      const capas = await this.service.getCapas();
      res.json({ success: true, count: capas.length, data: capas });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  public createCapa = async (req: Request, res: Response): Promise<void> => {
    try {
      const actor = getAuthenticatedActor(req, res);
      if (!actor) return;
      const validated = CreateCapaSchema.parse(req.body);
      const capa = await this.service.createCapa({
        ...validated,
        createdBy: actor.userName,
        updatedBy: actor.userName,
      });
      res.status(201).json({ success: true, data: capa });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  public getItps = async (req: Request, res: Response): Promise<void> => {
    try {
      const itps = await this.service.getItps();
      res.json({ success: true, count: itps.length, data: itps });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  public createItp = async (req: Request, res: Response): Promise<void> => {
    try {
      const actor = getAuthenticatedActor(req, res);
      if (!actor) return;
      const validated = CreateItpSchema.parse(req.body);
      const itp = await this.service.createItp({
        ...validated,
        createdBy: actor.userName,
        updatedBy: actor.userName,
        preparedBy: actor.userName,
        status: 'DRAFT',
        approvedBy: undefined,
      });
      res.status(201).json({ success: true, data: itp });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  public getMaterialInspections = async (req: Request, res: Response): Promise<void> => {
    try {
      const mirs = await this.service.getMaterialInspections();
      res.json({ success: true, count: mirs.length, data: mirs });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  public createMaterialInspection = async (req: Request, res: Response): Promise<void> => {
    try {
      const actor = getAuthenticatedActor(req, res);
      if (!actor) return;
      const validated = CreateMirSchema.parse(req.body);
      const mir = await this.service.createMaterialInspection({
        ...validated,
        createdBy: actor.userName,
        updatedBy: actor.userName,
      });
      res.status(201).json({ success: true, data: mir });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  public getSiteTests = async (req: Request, res: Response): Promise<void> => {
    try {
      const tests = await this.service.getSiteTests();
      res.json({ success: true, count: tests.length, data: tests });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  public createSiteTest = async (req: Request, res: Response): Promise<void> => {
    try {
      const actor = getAuthenticatedActor(req, res);
      if (!actor) return;
      const validated = CreateSiteTestSchema.parse(req.body);
      const test = await this.service.createSiteTest({
        ...validated,
        createdBy: actor.userName,
        updatedBy: actor.userName,
      });
      res.status(201).json({ success: true, data: test });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  public getWeldingInspections = async (req: Request, res: Response): Promise<void> => {
    try {
      const wlds = await this.service.getWeldingInspections();
      res.json({ success: true, count: wlds.length, data: wlds });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  public createWeldingInspection = async (req: Request, res: Response): Promise<void> => {
    try {
      const actor = getAuthenticatedActor(req, res);
      if (!actor) return;
      const validated = CreateWeldingInspectionSchema.parse(req.body);
      const wld = await this.service.createWeldingInspection({
        ...validated,
        createdBy: actor.userName,
        updatedBy: actor.userName,
      });
      res.status(201).json({ success: true, data: wld });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  public getHydroTests = async (req: Request, res: Response): Promise<void> => {
    try {
      const tests = await this.service.getHydroTests();
      res.json({ success: true, count: tests.length, data: tests });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  public createHydroTest = async (req: Request, res: Response): Promise<void> => {
    try {
      const actor = getAuthenticatedActor(req, res);
      if (!actor) return;
      const validated = CreateHydroTestSchema.parse(req.body);
      const test = await this.service.createHydroTest({
        ...validated,
        createdBy: actor.userName,
        updatedBy: actor.userName,
      });
      res.status(201).json({ success: true, data: test });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  public getPressureTests = async (req: Request, res: Response): Promise<void> => {
    try {
      const tests = await this.service.getPressureTests();
      res.json({ success: true, count: tests.length, data: tests });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  public createPressureTest = async (req: Request, res: Response): Promise<void> => {
    try {
      const actor = getAuthenticatedActor(req, res);
      if (!actor) return;
      const validated = CreatePressureTestSchema.parse(req.body);
      const test = await this.service.createPressureTest({
        ...validated,
        createdBy: actor.userName,
        updatedBy: actor.userName,
      });
      res.status(201).json({ success: true, data: test });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  public getPunchLists = async (req: Request, res: Response): Promise<void> => {
    try {
      const punches = await this.service.getPunchLists();
      res.json({ success: true, count: punches.length, data: punches });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  public createPunchList = async (req: Request, res: Response): Promise<void> => {
    try {
      const actor = getAuthenticatedActor(req, res);
      if (!actor) return;
      const validated = CreatePunchListSchema.parse(req.body);
      const punch = await this.service.createPunchList({
        ...validated,
        createdBy: actor.userName,
        updatedBy: actor.userName,
      });
      res.status(201).json({ success: true, data: punch });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  public getSnagLists = async (req: Request, res: Response): Promise<void> => {
    try {
      const snags = await this.service.getSnagLists();
      res.json({ success: true, count: snags.length, data: snags });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  public createSnagList = async (req: Request, res: Response): Promise<void> => {
    try {
      const actor = getAuthenticatedActor(req, res);
      if (!actor) return;
      const validated = CreateSnagListSchema.parse(req.body);
      const snag = await this.service.createSnagList({
        ...validated,
        createdBy: actor.userName,
        updatedBy: actor.userName,
      });
      res.status(201).json({ success: true, data: snag });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  };
}
