import { Router } from 'express';
import { reportsController } from '../controllers/reports.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';

const router = Router();

// Require authentication for report engine
router.use(authenticateJWT);

router.get('/', (req, res, next) => reportsController.getReports(req, res, next));
router.get('/:id', (req, res, next) => reportsController.getReportById(req, res, next));
router.post('/', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => reportsController.createReport(req, res, next));
router.post('/:id/execute', (req, res, next) => reportsController.executeReport(req, res, next));
router.post('/schedule', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => reportsController.scheduleReport(req, res, next));

export default router;
