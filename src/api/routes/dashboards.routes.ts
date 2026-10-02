import { Router } from 'express';
import { dashboardsController } from '../controllers/dashboards.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';

const router = Router();

// Require authentication for dashboard engine
router.use(authenticateJWT);

router.get('/', (req, res, next) => dashboardsController.getDashboards(req, res, next));
router.get('/workspace/:workspaceId', (req, res, next) => dashboardsController.getWorkspaceConfig(req, res, next));
router.get('/:id', (req, res, next) => dashboardsController.getDashboardById(req, res, next));
router.post('/', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => dashboardsController.createDashboard(req, res, next));
router.post('/:id/clone', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => dashboardsController.cloneDashboard(req, res, next));
router.post('/:id/favorite', (req, res, next) => dashboardsController.toggleFavorite(req, res, next));
router.post('/widgets', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => dashboardsController.addWidget(req, res, next));
router.delete('/widgets/:widgetId', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => dashboardsController.deleteWidget(req, res, next));
router.post('/:id/layout', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => dashboardsController.saveLayout(req, res, next));
router.post('/widgets/:widgetId/data', (req, res, next) => dashboardsController.getWidgetData(req, res, next));

export default router;
