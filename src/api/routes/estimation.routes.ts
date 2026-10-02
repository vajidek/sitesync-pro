import { Router } from 'express';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';
import { estimationController } from '../controllers/estimation.controller';

const router = Router();
router.use(authenticateJWT);

router.get('/', estimationController.list.bind(estimationController));
router.get('/:id', estimationController.getById.bind(estimationController));
router.post('/', requireRoles('ADMIN', 'MANAGER'), estimationController.create.bind(estimationController));
router.post('/:id/lines', requireRoles('ADMIN', 'MANAGER'), estimationController.addLine.bind(estimationController));
router.post('/:revisionId/lines/:lineId/resources', requireRoles('ADMIN', 'MANAGER'), estimationController.addResource.bind(estimationController));
router.post('/:id/status', requireRoles('ADMIN', 'MANAGER'), estimationController.transition.bind(estimationController));

export default router;
