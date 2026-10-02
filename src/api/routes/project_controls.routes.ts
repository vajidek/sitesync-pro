import { Router } from 'express';
import { ProjectControlsController } from '../controllers/project_controls.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';

const router = Router();
const controller = new ProjectControlsController();

// Secure all routes with JWT authentication and Role checks
router.use(authenticateJWT);
router.use(requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'));

// Dashboard / KPI Stats
router.get('/stats', controller.getStats.bind(controller));
router.get('/cost-control', controller.getCostControlMatrix.bind(controller));

// WBS
router.get('/wbs', controller.getWbsList.bind(controller));
router.post('/wbs', controller.createWbs.bind(controller));

// Work Packages
router.get('/work-packages', controller.getWorkPackages.bind(controller));
router.post('/work-packages', controller.createWorkPackage.bind(controller));

// Activities & CPM
router.get('/activities', controller.getActivities.bind(controller));
router.post('/activities', controller.createActivity.bind(controller));

// Activity Relationships
router.get('/relationships', controller.getRelationships.bind(controller));
router.post('/relationships', controller.createRelationship.bind(controller));

// Baselines
router.get('/baselines', controller.getBaselines.bind(controller));
router.post('/baselines', controller.createBaseline.bind(controller));

// Calendars
router.get('/calendars', controller.getCalendars.bind(controller));
router.post('/calendars', controller.createCalendar.bind(controller));

// Resources
router.get('/resources', controller.getResources.bind(controller));
router.post('/resources', controller.createResource.bind(controller));

// Resource Assignments
router.get('/resource-assignments', controller.getResourceAssignments.bind(controller));
router.post('/resource-assignments', controller.assignResource.bind(controller));

// EVM Progress
router.get('/progress', controller.getProgress.bind(controller));
router.post('/progress', controller.addProgressSnapshot.bind(controller));

// Delays
router.get('/delays', controller.getDelays.bind(controller));
router.post('/delays', controller.createDelay.bind(controller));

// Milestones
router.get('/milestones', controller.getMilestones.bind(controller));
router.post('/milestones', controller.createMilestone.bind(controller));

// Risks
router.get('/risks', controller.getRisks.bind(controller));
router.post('/risks', controller.createRisk.bind(controller));

// Issues
router.get('/issues', controller.getIssues.bind(controller));
router.post('/issues', controller.createIssue.bind(controller));

// Change Requests
router.get('/change-requests', controller.getChangeRequests.bind(controller));
router.post('/change-requests', controller.createChangeRequest.bind(controller));

// Lookahead Plans
router.get('/lookahead', controller.getLookaheadPlans.bind(controller));
router.post('/lookahead', controller.createLookaheadPlan.bind(controller));

// Daily / Weekly / Monthly Progress
router.get('/daily-progress', controller.getDailyProgress.bind(controller));
router.post('/daily-progress', controller.createDailyProgress.bind(controller));
router.get('/weekly-progress', controller.getWeeklyProgress.bind(controller));
router.get('/monthly-progress', controller.getMonthlyProgress.bind(controller));

export default router;
