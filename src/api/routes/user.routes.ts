import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticateJWT, requireRoles, requirePermissions } from '../middleware/auth.middleware';
import { validate } from '../validators/auth.validator';
import { createUserSchema, updateUserSchema } from '../validators/user.validator';
import { AuthenticatedRequest } from '../types/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', requirePermissions('users:manage'), (req, res, next) => userController.getUsers(req, res, next));
router.get('/:id', (req: AuthenticatedRequest, res, next) => {
  if (req.user && req.user.id !== req.params.id && !['ADMIN', 'MANAGER'].includes(req.user.role) && !req.user.permissions?.includes('users:manage')) {
    return res.status(403).json({ success: false, message: 'Forbidden: Access restricted to self or administrative roles.' });
  }
  return userController.getUserById(req, res, next);
});
router.post('/', requireRoles('ADMIN', 'MANAGER'), validate(createUserSchema), (req, res, next) => userController.createUser(req, res, next));
router.put('/:id', requireRoles('ADMIN', 'MANAGER'), validate(updateUserSchema), (req, res, next) => userController.updateUser(req, res, next));
router.delete('/:id', requireRoles('ADMIN'), (req, res, next) => userController.deactivateUser(req, res, next));

export default router;
