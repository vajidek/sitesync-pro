import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimit.middleware';
import {
  validate,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), (req, res, next) => authController.login(req, res, next));
router.post('/refresh', validate(refreshTokenSchema), (req, res, next) => authController.refresh(req, res, next));
router.get('/me', authenticateJWT, (req, res, next) => authController.me(req, res, next));
router.get('/login-history', authenticateJWT, (req, res, next) => authController.myLoginHistory(req, res, next));
router.post('/logout', authenticateJWT, (req, res, next) => authController.logout(req, res, next));
router.post('/logout-all', authenticateJWT, (req, res, next) => authController.logoutAll(req, res, next));
router.post('/change-password', authenticateJWT, validate(changePasswordSchema), (req, res, next) => authController.changePassword(req, res, next));
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), (req, res, next) => authController.resetPassword(req, res, next));

export default router;
