import { Router } from 'express';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';
import { costCodeController } from '../controllers/cost_code.controller';

const router = Router();
router.use(authenticateJWT);

router.get('/', costCodeController.list.bind(costCodeController));
router.get('/:id', costCodeController.getById.bind(costCodeController));
router.post('/', requireRoles('ADMIN', 'MANAGER'), costCodeController.create.bind(costCodeController));
router.put('/:id', requireRoles('ADMIN', 'MANAGER'), costCodeController.update.bind(costCodeController));

export default router;
