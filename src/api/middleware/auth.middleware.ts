import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/response';
import { userRepository } from '../repositories/user.repository';
import { authCache } from '../utils/authCache';
import { UserRole } from '../../types';

export async function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication token missing or invalid format. Please log in.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);

    // Fast-path: Check Bounded In-Memory Auth Context Cache
    let authContext = authCache.get(payload.userId);

    if (!authContext) {
      // Single-Query Fallback on Cache Miss
      authContext = await userRepository.getAuthContext(payload.userId);
      if (authContext) {
        authCache.set(payload.userId, authContext);
      }
    }

    // Ensure user still exists, is active, and is not locked/deactivated
    if (
      !authContext ||
      !authContext.isActive ||
      authContext.isLocked ||
      authContext.accountStatus === 'INACTIVE' ||
      authContext.accountStatus === 'LOCKED' ||
      authContext.accountStatus === 'DELETED'
    ) {
      return sendError(res, 'User account is invalid, locked, or deactivated.', 401);
    }

    req.user = {
      id: authContext.id,
      email: authContext.email,
      name: authContext.name,
      role: authContext.role || payload.role,
      roleId: authContext.roleId,
      roleName: authContext.roleName,
      department: authContext.department,
      phone: authContext.phone,
      avatarUrl: authContext.avatarUrl,
      assignedProjectId: authContext.assignedProjectId,
      assignedProjectName: authContext.assignedProjectName,
      permissions: authContext.permissions,
    };
    req.token = token;

    next();
  } catch (err: any) {
    console.error('JWT Authentication Error:', err);
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Access token expired. Please refresh token.', 401, undefined, { tokenExpired: true });
    }
    return sendError(res, err.message || 'Invalid access token authorization.', 401);
  }
}

export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized access.', 401);
    }
    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, `Forbidden: Role ${req.user.role} lacks required clearance for this operation.`, 403);
    }
    next();
  };
}

export function requirePermissions(...requiredPermissions: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized access.', 401);
    }
    if (req.user.role === 'ADMIN' || (req.user.role as string) === 'SYSTEM_ADMIN' || req.user.permissions.includes('ALL')) {
      return next();
    }
    // Check with aliases support for enterprise permission normalization
    const userPerms = req.user.permissions || [];
    const hasAll = requiredPermissions.every((perm) => {
      if (userPerms.includes(perm)) return true;
      if (perm === 'ADMIN_MANAGE_USERS' && (userPerms.includes('users:manage') || userPerms.includes('org:manage'))) return true;
      if (perm === 'org:manage' && (userPerms.includes('users:manage') || userPerms.includes('ADMIN_MANAGE_USERS'))) return true;
      if (perm === 'users:manage' && userPerms.includes('ADMIN_MANAGE_USERS')) return true;
      return false;
    });
    if (!hasAll) {
      return sendError(res, `Forbidden: Missing database-driven permission [${requiredPermissions.join(', ')}].`, 403);
    }
    next();
  };
}
