// =============================================================
// PHASE 74: AI GATEWAY & INTEGRATION ROUTES
// =============================================================

import { Router } from 'express';
import { aiGatewayController } from '../controllers/ai_gateway.controller';

const router = Router();

// Overview & Health Monitoring
router.get('/overview', (req, res) => aiGatewayController.getOverview(req, res));
router.get('/stats', (req, res) => aiGatewayController.getOverview(req, res));
router.get('/health', (req, res) => aiGatewayController.getOverview(req, res));
router.get('/providers', (req, res) => aiGatewayController.getProviders(req, res));
router.get('/models', (req, res) => aiGatewayController.getModels(req, res));

// Core Gateway Execution
router.post('/execute', (req, res) => aiGatewayController.execute(req, res));

// Routing Policies
router.get('/policies', (req, res) => aiGatewayController.getRoutingPolicies(req, res));
router.get('/routing', (req, res) => aiGatewayController.getRoutingPolicies(req, res));
router.put('/policies', (req, res) => aiGatewayController.updateRoutingPolicy(req, res));
router.put('/routing', (req, res) => aiGatewayController.updateRoutingPolicy(req, res));

// Usage & Cost Logs
router.get('/usage-logs', (req, res) => aiGatewayController.getUsageLogs(req, res));
router.get('/usage', (req, res) => aiGatewayController.getUsageLogs(req, res));
router.get('/cost', (req, res) => aiGatewayController.getUsageLogs(req, res));
router.get('/failover-logs', (req, res) => aiGatewayController.getFailoverLogs(req, res));

// Model Benchmarking & Evaluations
router.get('/evaluations', (req, res) => aiGatewayController.getQualityEvaluations(req, res));
router.get('/quality', (req, res) => aiGatewayController.getQualityEvaluations(req, res));
router.post('/evaluations', (req, res) => aiGatewayController.runEvaluation(req, res));
router.post('/quality/evaluate', (req, res) => aiGatewayController.runEvaluation(req, res));

// Failover Chaos Simulator
router.post('/simulate-failover', (req, res) => aiGatewayController.simulateFailover(req, res));
router.post('/failover/simulate', (req, res) => aiGatewayController.simulateFailover(req, res));

// API Clients & Key Management
router.get('/api-clients', (req, res) => aiGatewayController.getApiClients(req, res));
router.get('/clients', (req, res) => aiGatewayController.getApiClients(req, res));
router.post('/api-clients', (req, res) => aiGatewayController.createApiClient(req, res));
router.post('/clients', (req, res) => aiGatewayController.createApiClient(req, res));
router.delete('/api-clients/:clientId', (req, res) => aiGatewayController.revokeApiClient(req, res));
router.delete('/clients/:clientId', (req, res) => aiGatewayController.revokeApiClient(req, res));

// Webhooks & Event Subscriptions
router.get('/webhooks', (req, res) => aiGatewayController.getWebhooks(req, res));
router.post('/webhooks', (req, res) => aiGatewayController.createWebhook(req, res));
router.post('/webhooks/:webhookCode/test', (req, res) => aiGatewayController.testWebhook(req, res));
router.get('/webhook-events', (req, res) => aiGatewayController.getWebhookEvents(req, res));

// Audit Logs
router.get('/audit-logs', (req, res) => aiGatewayController.getAuditLogs(req, res));

export default router;
