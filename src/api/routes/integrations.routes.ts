import { Router } from 'express';
import { integrationsController } from '../controllers/integrations.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';

const router = Router();

// Authentication required for Enterprise Integration Hub
router.use(authenticateJWT);

router.get('/connectors', (req, res, next) => integrationsController.getAllConnectors(req, res, next));
router.get('/connectors/:id', (req, res, next) => integrationsController.getConnectorById(req, res, next));
router.patch('/connectors/:id/toggle', requireRoles('ADMIN'), (req, res, next) => integrationsController.toggleConnector(req, res, next));
router.post('/connectors/:id/configs', requireRoles('ADMIN'), (req, res, next) => integrationsController.updateConnectorConfigs(req, res, next));
router.post('/connectors/:id/test', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => integrationsController.testConnection(req, res, next));

router.get('/health', (req, res, next) => integrationsController.getHealthDashboard(req, res, next));

router.get('/jobs', (req, res, next) => integrationsController.getSyncJobs(req, res, next));
router.post('/jobs', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => integrationsController.createSyncJob(req, res, next));
router.post('/jobs/:id/trigger', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => integrationsController.triggerSyncJob(req, res, next));

router.get('/logs', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => integrationsController.getLogs(req, res, next));
router.post('/logs/:id/retry', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => integrationsController.retryFailedLog(req, res, next));

export default router;
