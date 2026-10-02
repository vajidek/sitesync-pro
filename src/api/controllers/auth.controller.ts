import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { userRepository } from '../repositories/user.repository';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types/auth';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, username, email, password, role } = req.body;
      const identifier = (userId || username || email || '').trim();
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.login(identifier, password, role, ipAddress, userAgent);
      return sendSuccess(res, result, 'Authenticated successfully.');
    } catch (err: any) {
      return sendError(res, err.message || 'Login failed', 401);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const ipAddress = req.ip;

      const result = await authService.refreshTokens(refreshToken, ipAddress);
      return sendSuccess(res, result, 'Tokens refreshed successfully.');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to refresh token', 401);
    }
  }

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthenticated', 401);
      }
      const userDetails = await userService.getUserDetails(req.user.id, req.user);
      return sendSuccess(res, userDetails, 'Current authenticated user retrieved.');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to get user profile', 400);
    }
  }

  async myLoginHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      const history = await userRepository.getLoginHistory(req.user.id, 50);
      return sendSuccess(res, history, 'Personal login history retrieved.');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch login history', 400);
    }
  }

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body || {};
      await authService.logout(refreshToken, req.user?.id, req.user?.email);
      return sendSuccess(res, { loggedOut: true }, 'Successfully logged out.');
    } catch (err: any) {
      return sendError(res, err.message || 'Logout failed', 400);
    }
  }

  async logoutAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);

      const count = await authService.logoutAllDevices(req.user.id, req.user.email);
      return sendSuccess(res, { revokedSessionsCount: count }, 'Logged out from all active devices.');
    } catch (err: any) {
      return sendError(res, err.message || 'Logout all failed', 400);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);

      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user.id, currentPassword, newPassword, req.user.email);
      return sendSuccess(res, { success: true }, 'Password changed successfully. Please log in again.');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to change password', 400);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, identifier, email } = req.body;
      const idStr = (userId || identifier || email || '').trim();
      const result = await authService.forgotPassword(idStr);
      return sendSuccess(res, result, 'Forgot password request processed.');
    } catch (err: any) {
      return sendError(res, err.message || 'Forgot password failed', 400);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { resetToken, newPassword } = req.body;
      const result = await authService.resetPassword(resetToken, newPassword);
      return sendSuccess(res, result, 'Password reset successfully.');
    } catch (err: any) {
      return sendError(res, err.message || 'Reset password failed', 400);
    }
  }
}

export const authController = new AuthController();
