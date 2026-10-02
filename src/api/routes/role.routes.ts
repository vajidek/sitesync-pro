import { Router } from 'express';
import { roleController } from '../controllers/role.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';
import { validate } from '../validators/auth.validator';
import { CreateRoleAdminSchema } from '../validators/admin.validator';

const router = Router();

router.use(authenticateJWT);

router.get('/', (req, res, next) => roleController.getRoles(req, res, next));
router.post(
  '/',
  requireRoles('ADMIN'),
  validate(CreateRoleAdminSchema),
  (req, res, next) => roleController.createRole(req, res, next)
);
router.get('/:roleId/permissions', (req, res, next) => roleController.getRolePermissions(req, res, next));
router.delete(
  '/:roleId',
  requireRoles('ADMIN'),
  (req, res, next) => roleController.deleteRole(req, res, next)
);

export default router;
