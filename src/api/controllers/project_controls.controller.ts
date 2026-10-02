import { Request, Response } from 'express';
import { isDemoSeedAllowed } from '../config/env';
import { ProjectControlsService } from '../services/project_controls.service';
import {
  CreateWbsSchema,
  CreateWorkPackageSchema,
  CreateActivitySchema,
  CreateActivityRelationshipSchema,
  CreateBaselineSchema,
  CreateCalendarSchema,
  CreateResourceSchema,
  CreateResourceAssignmentSchema,
  UpdateProgressSchema,
  CreateDelaySchema,
  CreateMilestoneSchema,
  CreateRiskSchema,
  CreateIssueSchema,
  CreateChangeRequestSchema,
  CreateLookaheadSchema,
  CreateDailyProgressSchema,
} from '../validators/project_controls.validator';

const projectControlsService = new ProjectControlsService();
function resolveProjectContext(req: Request): string {
  const queryProjectId = String(req.query.projectId || '').trim();
  const bodyProjectId = String((req.body as any)?.projectId || '').trim();
  const assignedProjectId = String((req as any).user?.assignedProjectId || '').trim();
  const resolved = queryProjectId || bodyProjectId || assignedProjectId;

  if (resolved) return resolved;
  if (isDemoSeedAllowed()) return 'PRJ-101';

  throw new Error('Explicit projectId is required for project-controls operations outside DEMO mode.');
}


function withAuthenticatedActor<T extends Record<string, any>>(req: Request, payload: T): T & { createdBy: string; updatedBy: string; createdById: string } {
  const user = (req as any).user;
  const actorId = String(user?.id || '').trim();
  const actorName = String(user?.name || user?.email || '').trim();

  if (!actorId || !actorName) {
    throw new Error('Authenticated actor identity is required for project-controls writes.');
  }

  return {
    ...payload,
    createdBy: actorName,
    updatedBy: actorName,
    createdById: actorId,
  };
}

export class ProjectControlsController {
  public async getStats(req: Request, res: Response): Promise<void> {
    try {
      const projectId = resolveProjectContext(req);
      const stats = await projectControlsService.getStats(projectId);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async getCostControlMatrix(req: Request, res: Response): Promise<void> {
    try {
      const projectId = resolveProjectContext(req);
      const matrix = await projectControlsService.getCostControlMatrix(projectId);
      res.json({ success: true, data: matrix });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // WBS
  public async getWbsList(req: Request, res: Response): Promise<void> {
    try {
      const projectId = resolveProjectContext(req);
      const wbsList = await projectControlsService.getWbsList(projectId);
      res.json({ success: true, count: wbsList.length, data: wbsList });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createWbs(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateWbsSchema.parse(req.body);
      const newWbs = await projectControlsService.createWbs(withAuthenticatedActor(req, validated));
      res.status(201).json({ success: true, message: 'WBS created successfully', data: newWbs });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error });
    }
  }

  // Work Packages
  public async getWorkPackages(req: Request, res: Response): Promise<void> {
    try {
      const wbsId = req.query.wbsId as string;
      const projectId = resolveProjectContext(req);
      const packages = await projectControlsService.getWorkPackages(wbsId, projectId);
      res.json({ success: true, count: packages.length, data: packages });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createWorkPackage(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateWorkPackageSchema.parse(req.body);
      const newPackage = await projectControlsService.createWorkPackage(withAuthenticatedActor(req, validated));
      res.status(201).json({ success: true, message: 'Work package created successfully', data: newPackage });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error });
    }
  }

  // Activities & CPM
  public async getActivities(req: Request, res: Response): Promise<void> {
    try {
      const projectId = resolveProjectContext(req);
      const activities = await projectControlsService.getActivities(projectId);
      res.json({ success: true, count: activities.length, data: activities });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createActivity(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateActivitySchema.parse(req.body);
      const newActivity = await projectControlsService.createActivity(withAuthenticatedActor(req, validated));
      res.status(201).json({ success: true, message: 'Activity created successfully', data: newActivity });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error });
    }
  }

  // Relationships
  public async getRelationships(req: Request, res: Response): Promise<void> {
    try {
      const projectId = resolveProjectContext(req);
      const rels = await projectControlsService.getRelationships(projectId);
      res.json({ success: true, count: rels.length, data: rels });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createRelationship(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateActivityRelationshipSchema.parse(req.body);
      const newRel = await projectControlsService.createRelationship(withAuthenticatedActor(req, validated));
      res.status(201).json({ success: true, message: 'Relationship created successfully', data: newRel });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error });
    }
  }

  // Baselines
  public async getBaselines(req: Request, res: Response): Promise<void> {
    try {
      const projectId = resolveProjectContext(req);
      const baselines = await projectControlsService.getBaselines(projectId);
      res.json({ success: true, count: baselines.length, data: baselines });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createBaseline(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateBaselineSchema.parse(req.body);
      const newBaseline = await projectControlsService.createBaseline(withAuthenticatedActor(req, validated));
      res.status(201).json({ success: true, message: 'Baseline created successfully', data: newBaseline });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error });
    }
  }

  // Calendars
  public async getCalendars(req: Request, res: Response): Promise<void> {
    try {
      const projectId = resolveProjectContext(req);
      const calendars = await projectControlsService.getCalendars(projectId);
      res.json({ success: true, count: calendars.length, data: calendars });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createCalendar(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateCalendarSchema.parse(req.body);
      const newCal = await projectControlsService.createCalendar(withAuthenticatedActor(req, validated));
      res.status(201).json({ success: true, message: 'Calendar created successfully', data: newCal });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error });
    }
  }

  // Resources & Assignments
  public async getResources(req: Request, res: Response): Promise<void> {
    try {
      const resources = await projectControlsService.getResources();
      res.json({ success: true, count: resources.length, data: resources });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createResource(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateResourceSchema.parse(req.body);
      const newRes = await projectControlsService.createResource(withAuthenticatedActor(req, validated));
      res.status(201).json({ success: true, message: 'Resource created successfully', data: newRes });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error });
    }
  }

  public async getResourceAssignments(req: Request, res: Response): Promise<void> {
    try {
      const activityId = req.query.activityId as string;
      const assignments = await projectControlsService.getResourceAssignments(activityId);
      res.json({ success: true, count: assignments.length, data: assignments });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async assignResource(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateResourceAssignmentSchema.parse(req.body);
      const newAssign = await projectControlsService.assignResource(withAuthenticatedActor(req, validated));
      res.status(201).json({ success: true, message: 'Resource assigned successfully', data: newAssign });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error });
    }
  }

  // Progress (EVM)
  public async getProgress(req: Request, res: Response): Promise<void> {
    try {
      const projectId = resolveProjectContext(req);
      const progress = await projectControlsService.getProgress(projectId);
      res.json({ success: true, count: progress.length, data: progress });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async addProgressSnapshot(req: Request, res: Response): Promise<void> {
    try {
      const validated = UpdateProgressSchema.parse(req.body);
      const newSnapshot = await projectControlsService.addProgressSnapshot(withAuthenticatedActor(req, validated));
      res.status(201).json({ success: true, message: 'Progress snapshot recorded', data: newSnapshot });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error });
    }
  }

  // Delays
  public async getDelays(req: Request, res: Response): Promise<void> {
    try {
      const projectId = resolveProjectContext(req);
      const delays = await projectControlsService.getDelays(projectId);
      res.json({ success: true, count: delays.length, data: delays });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createDelay(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateDelaySchema.parse(req.body);
      const newDelay = await projectControlsService.createDelay(withAuthenticatedActor(req, validated));
      res.status(201).json({ success: true, message: 'Delay record created successfully', data: newDelay });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error });
    }
  }

  // Milestones
  public async getMilestones(req: Request, res: Response): Promise<void> {
    try {
      const projectId = resolveProjectContext(req);
      const milestones = await projectControlsService.getMilestones(projectId);
      res.json({ success: true, count: milestones.length, data: milestones });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createMilestone(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateMilestoneSchema.parse(req.body);
      const newMs = await projectControlsService.createMilestone(withAuthenticatedActor(req, validated));
      res.status(201).json({ success: true, message: 'Milestone created successfully', data: newMs });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error });
    }
  }

  // Risks & Issues
  public async getRisks(req: Request, res: Response): Promise<void> {
    try {
      const projectId = resolveProjectContext(req);
      const risks = await projectControlsService.getRisks(projectId);
      res.json({ success: true, count: risks.length, data: risks });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createRisk(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateRiskSchema.parse(req.body);
      const newRisk = await projectControlsService.createRisk(withAuthenticatedActor(req, validated));
      res.status(201).json({ success: true, message: 'Risk record created successfully', data: newRisk });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error });
    }
  }

  public async getIssues(req: Request, res: Response): Promise<void> {
    try {
      const projectId = resolveProjectContext(req);
      const issues = await projectControlsService.getIssues(projectId);
      res.json({ success: true, count: issues.length, data: issues });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createIssue(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateIssueSchema.parse(req.body);
      const newIssue = await projectControlsService.createIssue(withAuthenticatedActor(req, validated));
      res.status(201).json({ success: true, message: 'Issue created successfully', data: newIssue });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error });
    }
  }

  // Change Requests
  public async getChangeRequests(req: Request, res: Response): Promise<void> {
    try {
      const projectId = resolveProjectContext(req);
      const crs = await projectControlsService.getChangeRequests(projectId);
      res.json({ success: true, count: crs.length, data: crs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createChangeRequest(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateChangeRequestSchema.parse(req.body);
      const newCr = await projectControlsService.createChangeRequest(withAuthenticatedActor(req, validated));
      res.status(201).json({ success: true, message: 'Change request created successfully', data: newCr });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error });
    }
  }

  // Lookahead Plans
  public async getLookaheadPlans(req: Request, res: Response): Promise<void> {
    try {
      const projectId = resolveProjectContext(req);
      const plans = await projectControlsService.getLookaheadPlans(projectId);
      res.json({ success: true, count: plans.length, data: plans });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createLookaheadPlan(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateLookaheadSchema.parse(req.body);
      const newPlan = await projectControlsService.createLookaheadPlan(withAuthenticatedActor(req, validated));
      res.status(201).json({ success: true, message: 'Lookahead plan created successfully', data: newPlan });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error });
    }
  }

  // Daily, Weekly, Monthly Progress
  public async getDailyProgress(req: Request, res: Response): Promise<void> {
    try {
      const projectId = resolveProjectContext(req);
      const progress = await projectControlsService.getDailyProgress(projectId);
      res.json({ success: true, count: progress.length, data: progress });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async createDailyProgress(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateDailyProgressSchema.parse(req.body);
      const newProg = await projectControlsService.createDailyProgress(withAuthenticatedActor(req, validated));
      res.status(201).json({ success: true, message: 'Daily progress recorded', data: newProg });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error });
    }
  }

  public async getWeeklyProgress(req: Request, res: Response): Promise<void> {
    try {
      const projectId = resolveProjectContext(req);
      const weekly = await projectControlsService.getWeeklyProgress(projectId);
      res.json({ success: true, count: weekly.length, data: weekly });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async getMonthlyProgress(req: Request, res: Response): Promise<void> {
    try {
      const projectId = resolveProjectContext(req);
      const monthly = await projectControlsService.getMonthlyProgress(projectId);
      res.json({ success: true, count: monthly.length, data: monthly });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
