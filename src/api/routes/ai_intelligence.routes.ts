import { Router } from 'express';
import { AIIntelligenceController } from '../controllers/ai_intelligence.controller';
import { AIController } from '../controllers/ai.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Protect with JWT Auth
router.use(authenticateJWT);

// Backwards compatibility with legacy AI routes
router.post('/chat', AIController.chat);
router.post('/boq-analysis', AIController.analyzeBOQ);
router.post('/predict-delays', AIController.predictDelays);
router.post('/predict-maintenance', AIController.predictMaintenance);
router.get('/search', AIController.naturalSearch);

// Executive AI Stats
router.get('/stats', AIIntelligenceController.getStats);

// Natural Language & Copilot
router.post('/nlp-query', AIIntelligenceController.queryNLP);
router.post('/copilot', AIIntelligenceController.copilotChat);

// Insights & Recommendations
router.get('/insights', AIIntelligenceController.getInsights);
router.post('/insights/:id/ack', AIIntelligenceController.acknowledgeInsight);
router.get('/recommendations', AIIntelligenceController.getRecommendations);
router.post('/recommendations/:id/action', AIIntelligenceController.updateRecommendationStatus);
router.patch('/recommendations/:id/action', AIIntelligenceController.updateRecommendationStatus);

// Predictions & Anomalies
router.get('/predictions', AIIntelligenceController.getPredictions);
router.get('/anomalies', AIIntelligenceController.getAnomalies);
router.post('/anomalies/:id/action', AIIntelligenceController.updateAnomalyStatus);
router.patch('/anomalies/:id/action', AIIntelligenceController.updateAnomalyStatus);

// Risk Scores & What-If Simulations
router.get('/risk-scores', AIIntelligenceController.getRiskScores);
router.get('/scenarios', AIIntelligenceController.getScenarios);
router.post('/scenarios/run', AIIntelligenceController.runWhatIfScenario);

// Executive Reports
router.get('/reports', AIIntelligenceController.getReports);
router.post('/reports/generate', AIIntelligenceController.generateReport);

// Governance, Feedback & Audit
router.get('/feedback', AIIntelligenceController.getFeedback);
router.post('/feedback', AIIntelligenceController.submitFeedback);
router.get('/providers', AIIntelligenceController.getProviders);
router.get('/models', AIIntelligenceController.getModels);
router.get('/agents', AIIntelligenceController.getAgents);
router.get('/audit-logs', AIIntelligenceController.getAuditLogs);

export default router;
