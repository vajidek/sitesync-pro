import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';

const router = Router();

// Protect all project management routes
router.use(authenticateJWT);

// Global Search & Types
router.get('/search', (req, res, next) => projectController.globalSearch(req, res, next));
router.get('/work-package-types', (req, res, next) => projectController.getWorkPackageTypes(req, res, next));
router.post('/work-package-types', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => projectController.createWorkPackageType(req, res, next));

// --- PHASE 51 MASTERS & VALIDATION ---
router.get('/check-code', (req, res, next) => projectController.checkCodeExists(req, res, next));
router.get('/check-work-order', (req, res, next) => projectController.checkWorkOrderExists(req, res, next));
router.get('/check-agreement', (req, res, next) => projectController.checkAgreementExists(req, res, next));

router.get('/masters/funding-agencies', (req, res, next) => projectController.getFundingAgencies(req, res, next));
router.post('/masters/funding-agencies', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => projectController.createFundingAgency(req, res, next));

router.get('/masters/consultants', (req, res, next) => projectController.getConsultants(req, res, next));
router.post('/masters/consultants', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => projectController.createConsultant(req, res, next));

router.get('/masters/clients', (req, res, next) => projectController.getClients(req, res, next));
router.post('/masters/clients', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => projectController.createClient(req, res, next));

router.get('/masters/currencies', (req, res, next) => projectController.getCurrencies(req, res, next));
router.post('/masters/currencies', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => projectController.createCurrency(req, res, next));

router.get('/masters/priorities', (req, res, next) => projectController.getProjectPriorities(req, res, next));
router.post('/masters/priorities', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => projectController.createProjectPriority(req, res, next));

router.get('/masters/statuses', (req, res, next) => projectController.getProjectStatuses(req, res, next));
router.post('/masters/statuses', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => projectController.createProjectStatus(req, res, next));

router.get('/masters/categories', (req, res, next) => projectController.getProjectCategories(req, res, next));
router.post('/masters/categories', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => projectController.createProjectCategory(req, res, next));

router.get('/masters/types', (req, res, next) => projectController.getProjectTypes(req, res, next));
router.post('/masters/types', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => projectController.createProjectType(req, res, next));

router.get('/masters/contract-types', (req, res, next) => projectController.getContractTypes(req, res, next));
router.post('/masters/contract-types', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => projectController.createContractType(req, res, next));

// Work Packages Direct CRUD
router.put('/work-packages/:id', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), (req, res, next) => projectController.updateWorkPackage(req, res, next));
router.delete('/work-packages/:id', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => projectController.deleteWorkPackage(req, res, next));

// Activities Direct CRUD
router.get('/work-packages/:workPackageId/activities', (req, res, next) => projectController.getActivities(req, res, next));
router.post('/work-packages/:workPackageId/activities', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), (req, res, next) => projectController.createActivity(req, res, next));
router.put('/activities/:id', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), (req, res, next) => projectController.updateActivity(req, res, next));
router.delete('/activities/:id', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => projectController.deleteActivity(req, res, next));

// Projects CRUD
router.get('/', (req, res, next) => projectController.getProjects(req, res, next));
router.post('/', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => projectController.createProject(req, res, next));
router.get('/:id', (req, res, next) => projectController.getProjectById(req, res, next));
router.get('/:id/commercial-control', (req, res, next) => projectController.getCommercialCostControl(req, res, next));
router.get('/:id/cost-control', (req, res, next) => projectController.getCommercialCostControl(req, res, next));
router.put('/:id', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), (req, res, next) => projectController.updateProject(req, res, next));
router.delete('/:id', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => projectController.deleteProject(req, res, next));
router.post('/:id/restore', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => projectController.restoreProject(req, res, next));
router.post('/:id/archive', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => projectController.archiveProject(req, res, next));
router.get('/:id/dashboard', (req, res, next) => projectController.getProjectDashboard(req, res, next));

// Project Engine Sub-Resources
router.get('/:projectId/work-packages', (req, res, next) => projectController.getWorkPackages(req, res, next));
router.post('/:projectId/work-packages', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), (req, res, next) => projectController.createWorkPackage(req, res, next));
router.get('/:projectId/settings', (req, res, next) => projectController.getProjectSettings(req, res, next));
router.put('/:projectId/settings', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => projectController.updateProjectSettings(req, res, next));

// Sub-Projects & Structures
router.get('/:projectId/sub-projects', (req, res, next) => projectController.getSubProjects(req, res, next));

router.get('/:projectId/structures', (req, res, next) => projectController.getProjectStructures(req, res, next));
router.post('/:projectId/structures', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), (req, res, next) => projectController.createProjectStructure(req, res, next));
router.put('/structures/:id', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), (req, res, next) => projectController.updateProjectStructure(req, res, next));
router.delete('/structures/:id', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => projectController.deleteProjectStructure(req, res, next));

// Departments
router.get('/:projectId/departments', (req, res, next) => projectController.getProjectDepartments(req, res, next));
router.post('/:projectId/departments', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => projectController.addProjectDepartment(req, res, next));
router.delete('/departments/:id', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => projectController.removeProjectDepartment(req, res, next));

// Sites
router.get('/:projectId/sites', (req, res, next) => projectController.getSites(req, res, next));
router.post('/sites', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), (req, res, next) => projectController.createSite(req, res, next));
router.put('/sites/:id', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), (req, res, next) => projectController.updateSite(req, res, next));

// Team Members
router.get('/:projectId/members', (req, res, next) => projectController.getMembers(req, res, next));
router.post('/members', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => projectController.addMember(req, res, next));
router.delete('/members/:memberId', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => projectController.removeMember(req, res, next));

// Daily Progress Entries
router.get('/:projectId/daily-progress', (req, res, next) => projectController.getDailyProgress(req, res, next));
router.post('/daily-progress', (req, res, next) => projectController.createDailyProgress(req, res, next));
router.put('/daily-progress/:id/status', (req, res, next) => projectController.updateProgressStatus(req, res, next));

// Tasks
router.get('/:projectId/tasks', (req, res, next) => projectController.getTasks(req, res, next));
router.post('/tasks', (req, res, next) => projectController.createTask(req, res, next));
router.put('/tasks/:id/status', (req, res, next) => projectController.updateTaskStatus(req, res, next));
router.get('/tasks/:id/comments', (req, res, next) => projectController.getTaskComments(req, res, next));
router.post('/tasks/:id/comments', (req, res, next) => projectController.addTaskComment(req, res, next));

// Documents
router.get('/:projectId/documents', (req, res, next) => projectController.getDocuments(req, res, next));
router.post('/documents', (req, res, next) => projectController.createDocument(req, res, next));

// Milestones & Timeline
router.get('/:projectId/milestones', (req, res, next) => projectController.getMilestones(req, res, next));
router.post('/milestones', (req, res, next) => projectController.createMilestone(req, res, next));

export default router;
