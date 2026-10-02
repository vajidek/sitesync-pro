import { Router } from 'express';
import { WorkflowController } from '../controllers/workflow.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

export function createWorkflowRouter(): Router {
  const router = Router();
  const controller = new WorkflowController();

  router.use(authenticateJWT);

  // Stats & Telemetry
  router.get('/stats', controller.getWorkflowStats);

  // States & Transitions (Both direct and nested under workflows)
  router.post('/states', controller.createState);
  router.delete('/states/:stateId', controller.deleteState);
  router.post('/transitions', controller.createTransition);
  router.delete('/transitions/:transitionId', controller.deleteTransition);

  // Specific workflow routes
  router.get('/:id/states', controller.getStates);
  router.get('/:id/transitions', controller.getTransitions);
  router.post('/:id/duplicate', controller.duplicateWorkflow);
  router.post('/:id/publish', controller.publishWorkflow);
  router.put('/:id', controller.updateWorkflow);
  router.get('/:id', controller.getWorkflowById);

  // Workflows CRUD
  router.get('/', controller.getWorkflows);
  router.post('/', controller.createWorkflow);

  // Instances & Submissions
  router.post('/instances', controller.submitWorkflowInstance);
  router.post('/instances/submit', controller.submitWorkflowInstance);
  router.post('/submit', controller.submitWorkflowInstance);

  // Tasks & Approvals
  router.get('/tasks', controller.getPendingTasks);
  router.get('/tasks/pending', controller.getPendingTasks);
  router.get('/pending-tasks', controller.getPendingTasks);
  router.get('/my-approvals', controller.getPendingTasks);
  router.post('/approvals/decision', controller.processApprovalDecision);
  router.post('/decision', controller.processApprovalDecision);

  // Delegations
  router.get('/delegations', controller.getDelegations);
  router.post('/delegations', controller.createDelegation);

  // Escalations
  router.get('/escalations', controller.getEscalations);

  // History & Audit
  router.get('/history', controller.getWorkflowHistory);
  router.get('/activity', controller.getActivityFeed);

  // Notifications & Announcements
  router.get('/notifications', controller.getNotifications);
  router.post('/notifications', controller.createNotification);
  router.get('/announcements', controller.getAnnouncements);
  router.post('/announcements', controller.createAnnouncement);

  // Universal Governance Policy Engine
  router.get('/policy/:codeOrEntity', controller.getWorkflowPolicy);
  router.put('/policy/:codeOrEntity', controller.updateWorkflowPolicy);
  router.post('/policy/evaluate', controller.evaluateEligibility);
  router.get('/policy/chain/:entityType/:entityId', controller.getApprovalChain);

  return router;
}

const workflowRoutes = createWorkflowRouter();
export default workflowRoutes;
