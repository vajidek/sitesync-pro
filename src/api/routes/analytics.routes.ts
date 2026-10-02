import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';

const router = Router();
const controller = new AnalyticsController();

// Secure all analytics & executive dashboard routes with JWT and Role check
router.use(authenticateJWT);
router.use(requireRoles('ADMIN', 'MANAGER', 'INCHARGE'));

// KPI Stats & Overview
router.get('/stats', controller.getStats.bind(controller));
router.get('/overview', controller.getExecutiveOverview.bind(controller));

// Dashboards
router.get('/dashboards', controller.getDashboards.bind(controller));
router.post('/dashboards', controller.createDashboard.bind(controller));

// Widgets
router.get('/widgets', controller.getWidgets.bind(controller));
router.post('/widgets', controller.createWidget.bind(controller));

// Saved Reports
router.get('/saved-reports', controller.getSavedReports.bind(controller));
router.post('/saved-reports', controller.createSavedReport.bind(controller));

// AI Insights
router.get('/ai-insights', controller.getAiInsights.bind(controller));
router.post('/ai-insights', controller.createAiInsight.bind(controller));

// Executive Reports
router.get('/executive-reports', controller.getExecutiveReports.bind(controller));
router.post('/executive-reports', controller.createExecutiveReport.bind(controller));

// KPIs
router.get('/kpis', controller.getKpis.bind(controller));

export default router;
