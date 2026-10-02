import { Request, Response } from 'express';
import { kwaService, KWAService } from '../services/kwa.service';
import { logger } from '../utils/logger';

export class KWAController {
  constructor(private service: KWAService = kwaService) {}

  getDashboardMetrics = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getDashboardMetrics();
      res.json({ success: true, data });
    } catch (err: any) {
      logger.error(`[KWA Controller] Error fetching dashboard metrics: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch dashboard metrics' });
    }
  };

  getProjects = async (req: Request, res: Response) => {
    try {
      const { type, search } = req.query;
      const projects = await this.service.getProjects({
        type: type as string,
        search: search as string,
      });

      res.json({ success: true, count: projects.length, data: projects });
    } catch (err: any) {
      logger.error(`[KWA Controller] Error fetching projects: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch projects' });
    }
  };

  createProject = async (req: Request, res: Response) => {
    try {
      const newProject = await this.service.createProject(req.body);
      logger.info(`[KWA Controller] Created new project: ${newProject.code}`);
      res.status(201).json({ success: true, message: 'Project registered successfully', data: newProject });
    } catch (err: any) {
      logger.error(`[KWA Controller] Error creating project: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to create project' });
    }
  };

  getPipelines = async (req: Request, res: Response) => {
    try {
      const { projectId, pipeMaterial } = req.query;
      const sections = await this.service.getPipelines({
        projectId: projectId as string,
        pipeMaterial: pipeMaterial as string,
      });

      res.json({ success: true, count: sections.length, data: sections });
    } catch (err: any) {
      logger.error(`[KWA Controller] Error fetching pipeline sections: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch pipeline sections' });
    }
  };

  createPipeline = async (req: Request, res: Response) => {
    try {
      const newSection = await this.service.createPipeline(req.body);
      logger.info(`[KWA Controller] Registered pipeline section: ${newSection.sectionName}`);
      res.status(201).json({ success: true, message: 'Pipeline section registered', data: newSection });
    } catch (err: any) {
      logger.error(`[KWA Controller] Error creating pipeline section: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to create pipeline section' });
    }
  };

  getValves = async (req: Request, res: Response) => {
    try {
      const { projectId, status } = req.query;
      const valves = await this.service.getValves({
        projectId: projectId as string,
        status: status as string,
      });

      res.json({ success: true, count: valves.length, data: valves });
    } catch (err: any) {
      logger.error(`[KWA Controller] Error fetching valves: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch valve register' });
    }
  };

  createValve = async (req: Request, res: Response) => {
    try {
      const newValve = await this.service.createValve(req.body);
      logger.info(`[KWA Controller] Registered valve: ${newValve.valveNumber}`);
      res.status(201).json({ success: true, message: 'Valve added to register', data: newValve });
    } catch (err: any) {
      logger.error(`[KWA Controller] Error adding valve: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to add valve' });
    }
  };

  getTestingReports = async (req: Request, res: Response) => {
    try {
      const { projectId, result: testResult } = req.query;
      const reports = await this.service.getTestingReports({
        projectId: projectId as string,
        testResult: testResult as string,
      });

      res.json({ success: true, count: reports.length, data: reports });
    } catch (err: any) {
      logger.error(`[KWA Controller] Error fetching test reports: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch test reports' });
    }
  };

  createTestReport = async (req: Request, res: Response) => {
    try {
      const newReport = await this.service.createTestReport(req.body);
      logger.info(`[KWA Controller] Registered test report: ${newReport.testNo}`);
      res.status(201).json({ success: true, message: 'Test report recorded successfully', data: newReport });
    } catch (err: any) {
      logger.error(`[KWA Controller] Error creating test report: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to record test report' });
    }
  };

  getDailySiteReports = async (req: Request, res: Response) => {
    try {
      const { projectId, date } = req.query;
      const dprs = await this.service.getDailySiteReports({
        projectId: projectId as string,
        date: date as string,
      });

      res.json({ success: true, count: dprs.length, data: dprs });
    } catch (err: any) {
      logger.error(`[KWA Controller] Error fetching daily site reports: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch DPRs' });
    }
  };

  createDailySiteReport = async (req: Request, res: Response) => {
    try {
      const newDPR = await this.service.createDailySiteReport(req.body);
      logger.info(`[KWA Controller] Created Daily Site Report: ${newDPR.dprNumber}`);
      res.status(201).json({ success: true, message: 'Daily Site Report saved', data: newDPR });
    } catch (err: any) {
      logger.error(`[KWA Controller] Error creating DPR: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to create DPR' });
    }
  };

  getDocuments = async (req: Request, res: Response) => {
    try {
      const { projectId, category } = req.query;
      const docs = await this.service.getDocuments({
        projectId: projectId as string,
        category: category as string,
      });

      res.json({ success: true, count: docs.length, data: docs });
    } catch (err: any) {
      logger.error(`[KWA Controller] Error fetching documents: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch documents' });
    }
  };

  createDocument = async (req: Request, res: Response) => {
    try {
      const newDoc = await this.service.createDocument(req.body);
      logger.info(`[KWA Controller] Registered Document: ${newDoc.docNumber}`);
      res.status(201).json({ success: true, message: 'Document registered', data: newDoc });
    } catch (err: any) {
      logger.error(`[KWA Controller] Error creating document: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to register document' });
    }
  };
}

export const kwaController = new KWAController();
