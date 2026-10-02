import { Router } from 'express';
import { auditController } from '../controllers/audit.controller';
import { authenticateJWT, requirePermissions } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.get('/', requirePermissions('audit:view'), (req, res, next) => auditController.getAuditLogs(req, res, next));

export default router;
