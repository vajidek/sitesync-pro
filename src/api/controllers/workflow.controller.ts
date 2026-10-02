import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { WorkflowService } from '../services/workflow.service';
import { workflowPolicyEngine } from '../services/workflowPolicyEngine.service';
import { sendSuccess, sendError } from '../utils/response';
import {
  CreateWorkflowSchema,
  UpdateWorkflowSchema,
  CreateWorkflowStateSchema,
  CreateWorkflowTransitionSchema,
  SubmitWorkflowInstanceSchema,
  ProcessApprovalDecisionSchema,
  CreateDelegationSchema,
  CreateAnnouncementSchema,
  CreateNotificationSchema,
} from '../validators/workflow.validator';

export class WorkflowController {
  private service: WorkflowService;

  constructor() {
    this.service = new WorkflowService();
  }

  public getWorkflowStats = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const stats = await this.service.getWorkflowStats(req.user);
      return sendSuccess(res, stats, 'Workflow engine telemetry retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to retrieve workflow stats', 500);
    }
  };

  public getWorkflows = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { module, status } = req.query;
      const workflows = await this.service.getWorkflows(module as string, status as string);
      return sendSuccess(res, workflows, 'Workflows retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to retrieve workflows', 500);
    }
  };

  public getWorkflowById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const wf = await this.service.getWorkflowById(id);
      if (!wf) return sendError(res, `Workflow ${id} not found`, 404);
      return sendSuccess(res, wf, 'Workflow details retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch workflow', 500);
    }
  };

  public createWorkflow = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const validated = CreateWorkflowSchema.parse(req.body);
      const created = await this.service.createWorkflow(validated, req.user?.name || 'System Admin');
      return sendSuccess(res, created, 'Enterprise workflow registered', 201);
    } catch (err: any) {
      return sendError(res, err.errors?.[0]?.message || err.message || 'Failed to create workflow', 400);
    }
  };

  public updateWorkflow = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const validated = UpdateWorkflowSchema.parse(req.body);
      const updated = await this.service.updateWorkflow(id, validated, req.user?.name || 'System Admin');
      return sendSuccess(res, updated, 'Workflow updated successfully');
    } catch (err: any) {
      return sendError(res, err.errors?.[0]?.message || err.message || 'Failed to update workflow', 400);
    }
  };

  public duplicateWorkflow = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const duplicated = await this.service.duplicateWorkflow(id, req.user?.name || 'System Admin');
      return sendSuccess(res, duplicated, 'Workflow duplicated successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to duplicate workflow', 500);
    }
  };

  public publishWorkflow = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const result = await this.service.publishWorkflow(id, req.user?.name || 'System Admin');
      return sendSuccess(res, result, 'Workflow published successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to publish workflow', 500);
    }
  };

  // States
  public getStates = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const states = await this.service.getStatesByWorkflowId(id);
      return sendSuccess(res, states, 'States retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to get states', 500);
    }
  };

  public createState = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const validated = CreateWorkflowStateSchema.parse(req.body);
      const state = await this.service.createState(validated);
      return sendSuccess(res, state, 'State created successfully', 201);
    } catch (err: any) {
      return sendError(res, err.errors?.[0]?.message || err.message || 'Failed to create state', 400);
    }
  };

  public deleteState = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { stateId } = req.params;
      const result = await this.service.deleteState(stateId);
      return sendSuccess(res, result, 'State deleted successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to delete state', 500);
    }
  };

  // Transitions
  public getTransitions = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const transitions = await this.service.getTransitionsByWorkflowId(id);
      return sendSuccess(res, transitions, 'Transitions retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to get transitions', 500);
    }
  };

  public createTransition = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const validated = CreateWorkflowTransitionSchema.parse(req.body);
      const transition = await this.service.createTransition(validated);
      return sendSuccess(res, transition, 'Transition configured successfully', 201);
    } catch (err: any) {
      return sendError(res, err.errors?.[0]?.message || err.message || 'Failed to create transition', 400);
    }
  };

  public deleteTransition = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { transitionId } = req.params;
      const result = await this.service.deleteTransition(transitionId);
      return sendSuccess(res, result, 'Transition deleted successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to delete transition', 500);
    }
  };

  // Instances & Submissions
  public submitWorkflowInstance = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const validated = SubmitWorkflowInstanceSchema.parse(req.body);
      const result = await this.service.submitWorkflowInstance(validated, req.user);
      return sendSuccess(res, result, 'Workflow instance submitted for approval routing', 201);
    } catch (err: any) {
      return sendError(res, err.errors?.[0]?.message || err.message || 'Failed to submit workflow instance', 400);
    }
  };

  public getPendingTasks = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tasks = await this.service.getPendingTasks(req.user, req.query);
      return sendSuccess(res, tasks, 'Pending approval tasks retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to get pending tasks', 500);
    }
  };

  public processApprovalDecision = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const validated = ProcessApprovalDecisionSchema.parse(req.body);
      const result = await this.service.processApprovalDecision(validated, req.user);
      return sendSuccess(res, result, 'Approval decision executed and audit log recorded');
    } catch (err: any) {
      return sendError(res, err.errors?.[0]?.message || err.message || 'Failed to process approval decision', 400);
    }
  };

  // Delegations
  public getDelegations = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const delegations = await this.service.getDelegations(req.user);
      return sendSuccess(res, delegations, 'Delegations retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to get delegations', 500);
    }
  };

  public createDelegation = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const validated = CreateDelegationSchema.parse(req.body);
      const created = await this.service.createDelegation(validated, req.user);
      return sendSuccess(res, created, 'Delegation registered', 201);
    } catch (err: any) {
      return sendError(res, err.errors?.[0]?.message || err.message || 'Failed to create delegation', 400);
    }
  };

  // Escalations & History
  public getEscalations = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const escalations = await this.service.getEscalations();
      return sendSuccess(res, escalations, 'Escalations retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to get escalations', 500);
    }
  };

  public getWorkflowHistory = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { entityId } = req.query;
      const history = await this.service.getWorkflowHistory(entityId as string);
      return sendSuccess(res, history, 'Workflow history retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to get workflow history', 500);
    }
  };

  // Notifications & Announcements
  public getNotifications = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const notifications = await this.service.getNotifications();
      return sendSuccess(res, notifications, 'Notifications retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to get notifications', 500);
    }
  };

  public createNotification = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const validated = CreateNotificationSchema.parse(req.body);
      const notif = await this.service.createNotification(validated);
      return sendSuccess(res, notif, 'Notification created', 201);
    } catch (err: any) {
      return sendError(res, err.errors?.[0]?.message || err.message || 'Failed to create notification', 400);
    }
  };

  public getAnnouncements = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const announcements = await this.service.getAnnouncements();
      return sendSuccess(res, announcements, 'Announcements retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to get announcements', 500);
    }
  };

  public createAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const validated = CreateAnnouncementSchema.parse(req.body);
      const anc = await this.service.createAnnouncement(validated);
      return sendSuccess(res, anc, 'Announcement published', 201);
    } catch (err: any) {
      return sendError(res, err.errors?.[0]?.message || err.message || 'Failed to create announcement', 400);
    }
  };

  public getActivityFeed = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const feed = await this.service.getActivityFeed();
      return sendSuccess(res, feed, 'Activity feed retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to get activity feed', 500);
    }
  };

  // ==========================================
  // UNIVERSAL WORKFLOW GOVERNANCE & POLICY ENGINE
  // ==========================================

  public getWorkflowPolicy = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { codeOrEntity } = req.params;
      const policy = await workflowPolicyEngine.getWorkflowConfig(codeOrEntity);
      return sendSuccess(res, policy, 'Workflow governance policy retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to retrieve workflow policy', 500);
    }
  };

  public updateWorkflowPolicy = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { codeOrEntity } = req.params;
      const updated = await workflowPolicyEngine.updateWorkflowPolicy(
        codeOrEntity,
        req.body,
        req.user?.name || 'System Administrator'
      );
      return sendSuccess(res, updated, 'Workflow governance policy updated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update workflow policy', 500);
    }
  };

  public evaluateEligibility = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { entityType, action, instance, context, amount } = req.body;
      const result = await workflowPolicyEngine.evaluateEligibility({
        user: req.user,
        entityType,
        action: action || 'APPROVE',
        instance,
        context,
        amount,
      });
      return sendSuccess(res, result, 'Workflow policy evaluation completed');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to evaluate workflow policy', 500);
    }
  };

  public getApprovalChain = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { entityType, entityId } = req.params;
      const chain = await workflowPolicyEngine.getApprovalChainStatus({
        entityType,
        entityId,
        instance: req.query.instance ? JSON.parse(req.query.instance as string) : undefined,
        currentUser: req.user,
      });
      return sendSuccess(res, chain, 'Approval chain retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to retrieve approval chain', 500);
    }
  };
}
