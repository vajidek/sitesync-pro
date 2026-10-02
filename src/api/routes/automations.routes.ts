import { Router } from 'express';
import { automationsController } from '../controllers/automations.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';

const router = Router();

// Require authentication for Automation & Notification Engine
router.use(authenticateJWT);

router.get('/rules', (req, res, next) => automationsController.getAutomationRules(req, res, next));
router.get('/rules/:id', (req, res, next) => automationsController.getRuleById(req, res, next));
router.post('/rules', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => automationsController.createAutomationRule(req, res, next));
router.patch('/rules/:id/toggle', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => automationsController.toggleRuleStatus(req, res, next));
router.post('/trigger', (req, res, next) => automationsController.triggerEvent(req, res, next));

router.get('/templates', (req, res, next) => automationsController.getTemplates(req, res, next));
router.post('/templates', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => automationsController.createTemplate(req, res, next));

router.get('/notifications', (req, res, next) => automationsController.getUserNotifications(req, res, next));
router.patch('/notifications/:id/read', (req, res, next) => automationsController.markNotificationRead(req, res, next));

router.get('/logs', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => automationsController.getExecutionLogs(req, res, next));
router.post('/logs/:id/retry', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => automationsController.retryFailedLog(req, res, next));

export default router;
