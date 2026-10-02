import { Router } from 'express';
import { moduleController } from '../controllers/module.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';

const router = Router();

// Require authentication for all module engine endpoints
router.use(authenticateJWT);

// Dynamic Sidebar Tree endpoint
router.get('/sidebar-tree', (req, res, next) => moduleController.getSidebarTree(req, res, next));

// Dashboard Widgets
router.get('/dashboard-widgets', (req, res, next) => moduleController.getDashboardWidgets(req, res, next));
router.post('/dashboard-widgets', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => moduleController.registerDashboardWidget(req, res, next));

// Modules CRUD
router.get('/', (req, res, next) => moduleController.getModules(req, res, next));
router.get('/:id', (req, res, next) => moduleController.getModuleById(req, res, next));
router.post('/', requireRoles('ADMIN'), (req, res, next) => moduleController.createModule(req, res, next));
router.put('/:id', requireRoles('ADMIN'), (req, res, next) => moduleController.updateModule(req, res, next));
router.delete('/:id', requireRoles('ADMIN'), (req, res, next) => moduleController.archiveModule(req, res, next));

// Sub-Modules CRUD
router.get('/sub-modules/all', (req, res, next) => moduleController.getSubModules(req, res, next));
router.post('/sub-modules', requireRoles('ADMIN'), (req, res, next) => moduleController.createSubModule(req, res, next));
router.put('/sub-modules/:id', requireRoles('ADMIN'), (req, res, next) => moduleController.updateSubModule(req, res, next));
router.delete('/sub-modules/:id', requireRoles('ADMIN'), (req, res, next) => moduleController.archiveSubModule(req, res, next));

// Features CRUD
router.get('/features/all', (req, res, next) => moduleController.getFeatures(req, res, next));
router.post('/features', requireRoles('ADMIN'), (req, res, next) => moduleController.createFeature(req, res, next));
router.put('/features/:id', requireRoles('ADMIN'), (req, res, next) => moduleController.updateFeature(req, res, next));
router.delete('/features/:id', requireRoles('ADMIN'), (req, res, next) => moduleController.archiveFeature(req, res, next));

export default router;
