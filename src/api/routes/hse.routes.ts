import { Router } from 'express';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';
import { HSEController } from '../controllers/hse.controller';

const router = Router();
const controller = new HSEController();

// Protect all HSE routes with JWT
router.use(authenticateJWT);

// Root Alias Handler
router.get('/', (req, res) => {
  if (req.baseUrl.endsWith('/incidents')) {
    return controller.getIncidents(req, res);
  }
  if (req.baseUrl.endsWith('/permits')) {
    return controller.getWorkPermits(req, res);
  }
  if (req.baseUrl.endsWith('/risk')) {
    return controller.getRiskAssessments(req, res);
  }
  return controller.getStats(req, res);
});

// Dashboard Stats
router.get('/stats', controller.getStats);

// Incidents
router.get('/incidents', controller.getIncidents);
router.post('/incidents', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.createIncident);

// Near Miss
router.get('/near-miss', controller.getNearMisses);
router.post('/near-miss', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.createNearMiss);

// Hazards
router.get('/hazards', controller.getHazardReports);
router.post('/hazards', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.createHazardReport);

// Risk Assessment Matrix
router.get('/risk', controller.getRiskAssessments);
router.get('/risk-assessments', controller.getRiskAssessments);
router.post('/risk', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.createRiskAssessment);
router.post('/risk-assessments', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.createRiskAssessment);

// JSA (Job Safety Analysis)
router.get('/jsa', controller.getJsaList);
router.post('/jsa', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.createJsa);

// Toolbox Talks (TBT)
router.get('/toolbox-talks', controller.getToolboxTalks);

// Work Permits (PTW)
router.get('/permits', controller.getWorkPermits);
router.get('/work-permits', controller.getWorkPermits);
router.post('/permits', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.createWorkPermit);
router.post('/work-permits', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.createWorkPermit);
router.put('/permits/:id/status', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.reviewWorkPermit);
router.put('/work-permits/:id/status', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), controller.reviewWorkPermit);

// Safety Inspections
router.get('/safety-inspections', controller.getSafetyInspections);

// PPE Issuances
router.get('/ppe', controller.getPpeIssuances);
router.get('/ppe-issuance', controller.getPpeIssuances);
router.post('/ppe', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), controller.createPpeIssuance);

// Training Records
router.get('/training', controller.getTrainingRecords);

// Emergency Drills
router.get('/drills', controller.getEmergencyDrills);

// Fire Equipment
router.get('/fire-equipment', controller.getFireEquipment);

// Environmental Monitoring
router.get('/environment', controller.getEnvironmentLogs);

// Waste Management
router.get('/waste', controller.getWasteLogs);

export default router;
