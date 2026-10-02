import { Router } from 'express';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';
import { kwaController } from '../controllers/kwa.controller';

const router = Router();

// Protect all KWA routes with JWT auth
router.use(authenticateJWT);

// 1. KWA DASHBOARD METRICS
router.get('/dashboard-metrics', kwaController.getDashboardMetrics);

// 2. KWA PROJECTS (WTP, OHSR, GLSR, Pumping Mains)
router.get('/projects', kwaController.getProjects);
router.post('/projects', kwaController.createProject);

// 3. PIPELINE MANAGEMENT & SECTIONS
router.get('/pipelines', kwaController.getPipelines);
router.post('/pipelines', kwaController.createPipeline);

// 4. VALVE REGISTER & CHAMBERS
router.get('/valves', kwaController.getValves);
router.post('/valves', kwaController.createValve);

// 5. TESTING MODULE (HYDROSTATIC TESTS & TRIALS)
router.get('/testing', kwaController.getTestingReports);
router.post('/testing', kwaController.createTestReport);

// 6. DAILY SITE REPORT (DPR)
router.get('/daily-reports', kwaController.getDailySiteReports);
router.post('/daily-reports', kwaController.createDailySiteReport);

// 7. DOCUMENTS REGISTER & APPROVAL LETTERS
router.get('/documents', kwaController.getDocuments);
router.post('/documents', requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'), kwaController.createDocument);

export default router;
