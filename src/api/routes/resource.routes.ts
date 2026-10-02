import { Router } from 'express';
import { resourceController } from '../controllers/resource.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

// Dashboard KPIs
router.get('/kpis', (req, res) => resourceController.getDashboardKpis(req, res));

// Types & Groups & Skills
router.get('/types', (req, res) => resourceController.getTypes(req, res));
router.post('/types', requireRoles('ADMIN', 'MANAGER'), (req, res) => resourceController.createType(req, res));

router.get('/groups', (req, res) => resourceController.getGroups(req, res));
router.post('/groups', requireRoles('ADMIN', 'MANAGER'), (req, res) => resourceController.createGroup(req, res));

router.get('/skills', (req, res) => resourceController.getSkills(req, res));
router.post('/skills', requireRoles('ADMIN', 'MANAGER'), (req, res) => resourceController.createSkill(req, res));

// Plans
router.get('/plans', (req, res) => resourceController.getPlans(req, res));
router.get('/plans/:id', (req, res) => resourceController.getPlanById(req, res));
router.post('/plans', requireRoles('ADMIN', 'MANAGER'), (req, res) => resourceController.createPlan(req, res));
router.put('/plans/:id', requireRoles('ADMIN', 'MANAGER'), (req, res) => resourceController.updatePlan(req, res));
router.delete('/plans/:id', requireRoles('ADMIN', 'MANAGER'), (req, res) => resourceController.deletePlan(req, res));
router.post('/plans/:id/restore', requireRoles('ADMIN', 'MANAGER'), (req, res) => resourceController.restorePlan(req, res));
router.post('/plans/:id/clone', requireRoles('ADMIN', 'MANAGER'), (req, res) => resourceController.clonePlan(req, res));

// Allocations
router.get('/allocations', (req, res) => resourceController.getAllocations(req, res));
router.get('/allocations/:id', (req, res) => resourceController.getAllocationById(req, res));
router.post('/allocations', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), (req, res) => resourceController.createAllocation(req, res));
router.put('/allocations/:id', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), (req, res) => resourceController.updateAllocation(req, res));
router.post('/allocations/:id/release', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), (req, res) => resourceController.releaseAllocation(req, res));
router.post('/allocations/:id/transfer', requireRoles('ADMIN', 'MANAGER'), (req, res) => resourceController.transferAllocation(req, res));
router.delete('/allocations/:id', requireRoles('ADMIN', 'MANAGER'), (req, res) => resourceController.deleteAllocation(req, res));

// Availability & Utilization
router.get('/availability', (req, res) => resourceController.getAvailability(req, res));
router.post('/availability/calculate', requireRoles('ADMIN', 'MANAGER'), (req, res) => resourceController.calculateAvailability(req, res));
router.get('/utilization', (req, res) => resourceController.getUtilization(req, res));

// Requests
router.get('/requests', (req, res) => resourceController.getRequests(req, res));
router.get('/requests/:id', (req, res) => resourceController.getRequestById(req, res));
router.post('/requests', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR', 'STORE_KEEPER'), (req, res) => resourceController.createRequest(req, res));
router.post('/requests/:id/approve', requireRoles('ADMIN', 'MANAGER'), (req, res) => resourceController.approveRequest(req, res));
router.post('/requests/:id/reject', requireRoles('ADMIN', 'MANAGER'), (req, res) => resourceController.rejectRequest(req, res));

// Calendars & Shifts
router.get('/calendars', (req, res) => resourceController.getCalendars(req, res));
router.post('/calendars', requireRoles('ADMIN', 'MANAGER'), (req, res) => resourceController.createCalendarEntry(req, res));
router.get('/shift-templates', (req, res) => resourceController.getShiftTemplates(req, res));
router.get('/holidays', (req, res) => resourceController.getHolidays(req, res));

// Costs
router.get('/costs', (req, res) => resourceController.getCosts(req, res));
router.post('/costs', requireRoles('ADMIN', 'MANAGER'), (req, res) => resourceController.createCost(req, res));

// Conflicts
router.get('/conflicts', (req, res) => resourceController.getConflicts(req, res));
router.post('/conflicts/:id/resolve', requireRoles('ADMIN', 'MANAGER'), (req, res) => resourceController.resolveConflict(req, res));

// Logs
router.get('/logs', (req, res) => resourceController.getLogs(req, res));

export default router;
