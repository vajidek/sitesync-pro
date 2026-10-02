// ============================================================================
// PHASE 75: ENTERPRISE ERP ORCHESTRATION & COMMAND CENTER ROUTES
// ============================================================================

import { Router } from 'express';
import { orchestrationController } from '../controllers/orchestration.controller';

const router = Router();

// Command Center Overview & Summaries
router.get('/summary', (req, res) => orchestrationController.getSummary(req, res));
router.get('/overview', (req, res) => orchestrationController.getSummary(req, res));
router.get('/stats', (req, res) => orchestrationController.getSummary(req, res));

// Domain Event Ingestion & Replay
router.post('/events', (req, res) => orchestrationController.publishEvent(req, res));
router.get('/events', (req, res) => orchestrationController.getEvents(req, res));
router.post('/events/replay', (req, res) => orchestrationController.replayEvent(req, res));
router.post('/events/:eventId/replay', (req, res) => {
  req.body = { ...req.body, eventId: req.params.eventId };
  orchestrationController.replayEvent(req, res);
});

// Project Health Engine
router.get('/health', (req, res) => orchestrationController.getProjectHealth(req, res));
router.get('/health/projects', (req, res) => orchestrationController.getProjectHealth(req, res));
router.post('/health/calculate', (req, res) => orchestrationController.calculateHealth(req, res));

// Enterprise Action Center
router.get('/actions', (req, res) => orchestrationController.getActions(req, res));
router.post('/actions', (req, res) => orchestrationController.createAction(req, res));
router.patch('/actions/:actionId/status', (req, res) => orchestrationController.updateActionStatus(req, res));
router.put('/actions/:actionId/status', (req, res) => orchestrationController.updateActionStatus(req, res));
router.patch('/actions/:actionId/assign', (req, res) => orchestrationController.assignAction(req, res));
router.put('/actions/:actionId/assign', (req, res) => orchestrationController.assignAction(req, res));

// Correlated Enterprise Alerts
router.get('/alerts', (req, res) => orchestrationController.getAlerts(req, res));
router.post('/alerts/:alertId/ack', (req, res) => orchestrationController.acknowledgeAlert(req, res));
router.post('/alerts/:alertId/acknowledge', (req, res) => orchestrationController.acknowledgeAlert(req, res));
router.post('/alerts/:alertId/resolve', (req, res) => orchestrationController.resolveAlert(req, res));

// Integration Health & Telemetry
router.get('/integration-health', (req, res) => orchestrationController.getIntegrationHealth(req, res));
router.get('/integration/health', (req, res) => orchestrationController.getIntegrationHealth(req, res));
router.get('/audit-logs', (req, res) => orchestrationController.getAuditLogs(req, res));
router.get('/audit', (req, res) => orchestrationController.getAuditLogs(req, res));

export default router;
