import { userRepository } from '../repositories/user.repository';
import { roleRepository } from '../repositories/role.repository';
import { tokenRepository } from '../repositories/token.repository';
import { auditRepository } from '../repositories/audit.repository';
import { comparePassword, hashPassword } from '../utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { authCache } from '../utils/authCache';
import { UserRole } from '../../types';

export class AuthService {
  async login(identifier: string, password: string, requestedRole?: UserRole, ipAddress?: string, userAgent?: string) {
    const normalizedIdentifier = String(identifier || '').trim();
    if (!normalizedIdentifier || !password) {
      throw new Error('User ID/email and password are required.');
    }

    // Authentication is always bound to the exact supplied identifier.
    // Never select a seeded account merely because a role was requested.
    const user = await userRepository.findByUsernameOrEmail(normalizedIdentifier);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    if (!user) {
      await auditRepository.logAction({
        userEmail: identifier,
        action: 'AUTH_LOGIN_FAILED',
        module: 'Authentication',
        details: `Login failed: User ID or Email not found (${identifier})`,
        ipAddress,
        userAgent,
      });
      throw new Error('Invalid User ID or Password.');
    }

    // Account Status & Lock Checks
    if (user.accountStatus === 'DELETED') {
      throw new Error('Account does not exist.');
    }

    if (user.accountStatus === 'INACTIVE' || !user.isActive) {
      throw new Error('User account is deactivated. Please contact Administrator.');
    }

    if (user.accountStatus === 'SUSPENDED') {
      throw new Error('Account is suspended. Please contact HR Department.');
    }

    if (user.isLocked || user.accountStatus === 'LOCKED') {
      await userRepository.recordLoginAttempt({
        userId: user.id,
        username: user.username || user.email,
        userEmail: user.email,
        loginDate: todayStr,
        loginTime: timeStr,
        ipAddress,
        device: userAgent,
        status: 'LOCKED',
        failureReason: 'Attempted login to locked account',
      });
      throw new Error('Account is locked due to security policy or excessive failed login attempts. Contact Admin/HR to unlock.');
    }

    // Verify bcrypt password hash
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      const newFailedCount = (user.failedLoginAttempts || 0) + 1;
      const isNowLocked = newFailedCount >= 5;

      await userRepository.update(user.id, {
        failedLoginAttempts: newFailedCount,
        isLocked: isNowLocked,
        accountStatus: isNowLocked ? 'LOCKED' : user.accountStatus,
        lockedAt: isNowLocked ? new Date().toISOString() : undefined,
      });

      await userRepository.recordLoginAttempt({
        userId: user.id,
        username: user.username || user.email,
        userEmail: user.email,
        loginDate: todayStr,
        loginTime: timeStr,
        ipAddress,
        device: userAgent,
        status: isNowLocked ? 'LOCKED' : 'FAILED',
        failureReason: isNowLocked ? '5 consecutive failed password attempts' : 'Invalid password',
      });

      await auditRepository.logAction({
        userId: user.id,
        userEmail: user.email,
        action: isNowLocked ? 'AUTH_ACCOUNT_LOCKED_FAILED_ATTEMPTS' : 'AUTH_LOGIN_FAILED',
        module: 'Authentication',
        details: isNowLocked
          ? `Account locked after 5 failed login attempts (${user.email})`
          : `Login failed: Invalid password credential (Attempt ${newFailedCount}/5)`,
        ipAddress,
        userAgent,
      });

      if (isNowLocked) {
        throw new Error('Account locked due to 5 consecutive failed login attempts. Please contact Admin/HR to unlock.');
      } else {
        throw new Error(`Invalid User ID or Password. (${5 - newFailedCount} attempt(s) remaining before account lockout)`);
      }
    }

    // Reset failed login attempts on success
    const loginTimeIso = new Date().toISOString();
    user.failedLoginAttempts = 0;
    user.lastLoginAt = loginTimeIso;
    await userRepository.update(user.id, {
      failedLoginAttempts: 0,
      lastLoginAt: loginTimeIso,
    });

    await userRepository.recordLoginAttempt({
      userId: user.id,
      username: user.username || user.email,
      userEmail: user.email,
      loginDate: todayStr,
      loginTime: timeStr,
      ipAddress,
      device: userAgent,
      status: 'SUCCESS',
    });

    // Resolve user role & database-driven permissions
    const role = await roleRepository.findById(user.roleId);
    if (!role) {
      throw new Error('User role configuration not found.');
    }

    if (requestedRole && role.code !== requestedRole) {
      await auditRepository.logAction({
        userId: user.id,
        userEmail: user.email,
        userRole: role.code,
        action: 'AUTH_LOGIN_ROLE_MISMATCH',
        module: 'Authentication',
        details: `Rejected requested role ${requestedRole}; account is configured for ${role.code}.`,
        ipAddress,
        userAgent,
      });
      throw new Error('Requested role does not match the authenticated account role.');
    }

    const permissions = await roleRepository.getRolePermissionCodes(role.id);

    // Issue JWT tokens
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: role.code,
      permissions,
    });

    const refreshTokenEntity = await tokenRepository.saveRefreshToken({
      userId: user.id,
      token: '', // filled below
      isRevoked: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      ipAddress,
      device: userAgent,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      tokenId: refreshTokenEntity.id,
    });

    refreshTokenEntity.token = refreshToken;

    // Log successful audit entry
    await auditRepository.logAction({
      userId: user.id,
      userEmail: user.email,
      userRole: role.code,
      action: 'AUTH_LOGIN_SUCCESS',
      module: 'Authentication',
      details: `User successfully logged in as ${role.name} (${role.code})`,
      ipAddress,
      userAgent,
    });

    // Resolve authorized workspaces for post-login selection (server-authoritative)
    const WORKSPACE_DEFINITIONS: Record<string, { label: string; description: string; badge: string }> = {
      ADMIN: {
        label: 'System Administration',
        description: 'Enterprise governance, user directory, RBAC, master data, and audit sentinel.',
        badge: 'Executive Root',
      },
      MANAGER: {
        label: 'Project Management',
        description: 'Manage projects, site progress, schedule, commitments, and commercial contracts.',
        badge: 'Project Control',
      },
      INCHARGE: {
        label: 'Site Operations Leadership',
        description: 'On-site execution management, daily site approvals, and trade coordination.',
        badge: 'Site Lead',
      },
      SUPERVISOR: {
        label: 'Site Supervision',
        description: 'Crew timecards, daily progress logs, field task assignments, and shift reporting.',
        badge: 'Field Operations',
      },
      STORE_KEEPER: {
        label: 'Stores & Inventory',
        description: 'Material requisitions, Goods Receipts (GRN), and warehouse stock control.',
        badge: 'Supply Chain',
      },
      DRIVER: {
        label: 'Fleet & Logistics',
        description: 'Heavy transport, material dispatch, vehicle inspections, and route logs.',
        badge: 'Logistics',
      },
      OPERATOR: {
        label: 'Plant & Machinery',
        description: 'Heavy machinery operation, working hours, fuel logs, and maintenance alerts.',
        badge: 'Equipment',
      },
      WORKER: {
        label: 'Site Operations & Timecard',
        description: 'Task assignments, personal attendance, GPS punch clock, and expense claims.',
        badge: 'Field Craft',
      },
    };

    let authorizedWorkspaces = [
      {
        role: role.code as UserRole,
        label: WORKSPACE_DEFINITIONS[role.code]?.label || role.name,
        description: WORKSPACE_DEFINITIONS[role.code]?.description || role.description,
        badge: WORKSPACE_DEFINITIONS[role.code]?.badge || 'Primary',
      },
    ];

    if (role.code === 'ADMIN' || (role.code as string) === 'SYSTEM_ADMIN') {
      authorizedWorkspaces = [
        {
          role: 'ADMIN' as UserRole,
          label: WORKSPACE_DEFINITIONS.ADMIN.label,
          description: WORKSPACE_DEFINITIONS.ADMIN.description,
          badge: 'Executive Root',
        },
        {
          role: 'MANAGER' as UserRole,
          label: WORKSPACE_DEFINITIONS.MANAGER.label,
          description: WORKSPACE_DEFINITIONS.MANAGER.description,
          badge: 'Project Control',
        },
        {
          role: 'SUPERVISOR' as UserRole,
          label: WORKSPACE_DEFINITIONS.SUPERVISOR.label,
          description: WORKSPACE_DEFINITIONS.SUPERVISOR.description,
          badge: 'Field Operations',
        },
        {
          role: 'STORE_KEEPER' as UserRole,
          label: WORKSPACE_DEFINITIONS.STORE_KEEPER.label,
          description: WORKSPACE_DEFINITIONS.STORE_KEEPER.description,
          badge: 'Supply Chain',
        },
      ];
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username || user.email.split('@')[0],
        employeeId: user.employeeId || '',
        name: user.name,
        email: user.email,
        role: role.code,
        roleName: role.name,
        department: user.department,
        phone: user.phone,
        accountStatus: user.accountStatus,
        forcePasswordChange: user.forcePasswordChange,
        assignedProjectId: user.assignedProjectId,
        assignedProjectName: user.assignedProjectName,
        permissions,
        authorizedWorkspaces,
      },
    };
  }

  async refreshTokens(refreshTokenStr: string, ipAddress?: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshTokenStr);
    } catch {
      throw new Error('Invalid or expired refresh token.');
    }

    const savedToken = await tokenRepository.findRefreshToken(refreshTokenStr);
    if (!savedToken || savedToken.isRevoked) {
      throw new Error('Refresh token has been revoked or is invalid.');
    }

    const user = await userRepository.findById(payload.userId);
    if (!user || user.accountStatus !== 'ACTIVE') {
      throw new Error('User account is invalid or deactivated.');
    }

    const role = await roleRepository.findById(user.roleId);
    if (!role) {
      throw new Error('Associated user role not found.');
    }

    const permissions = await roleRepository.getRolePermissionCodes(role.id);

    // Revoke old refresh token
    await tokenRepository.revokeToken(refreshTokenStr);

    // Generate new token pair
    const newAccessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: role.code,
      permissions,
    });

    const newRefreshTokenEntity = await tokenRepository.saveRefreshToken({
      userId: user.id,
      token: '',
      isRevoked: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      ipAddress,
    });

    const newRefreshToken = signRefreshToken({
      userId: user.id,
      tokenId: newRefreshTokenEntity.id,
    });

    newRefreshTokenEntity.token = newRefreshToken;

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshTokenStr: string, userId?: string, userEmail?: string) {
    if (refreshTokenStr) {
      await tokenRepository.revokeToken(refreshTokenStr);
    }
    if (userId) {
      authCache.invalidateUser(userId);
      await userRepository.update(userId, { lastLogoutAt: new Date().toISOString() });
      await auditRepository.logAction({
        userId,
        userEmail,
        action: 'AUTH_LOGOUT',
        module: 'Authentication',
        details: 'User logged out of current session.',
      });
    }
    return true;
  }

  async logoutAllDevices(userId: string, userEmail?: string) {
    authCache.invalidateUser(userId);
    const revokedCount = await tokenRepository.revokeAllUserTokens(userId);
    await userRepository.update(userId, { lastLogoutAt: new Date().toISOString() });
    await auditRepository.logAction({
      userId,
      userEmail,
      action: 'AUTH_LOGOUT_ALL_DEVICES',
      module: 'Authentication',
      details: `User logged out of all active sessions (${revokedCount} tokens revoked).`,
    });
    return revokedCount;
  }

  async changePassword(userId: string, currentPass: string, newPass: string, userEmail?: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found.');

    const isMatch = await comparePassword(currentPass, user.passwordHash);
    if (!isMatch) {
      throw new Error('Current password does not match.');
    }

    const newHash = await hashPassword(newPass);
    await userRepository.update(userId, {
      passwordHash: newHash,
      forcePasswordChange: false,
      passwordLastChangedAt: new Date().toISOString(),
    });

    authCache.invalidateUser(userId);

    // Revoke all tokens so user logs in cleanly with new password
    await tokenRepository.revokeAllUserTokens(userId);

    await auditRepository.logAction({
      userId,
      userEmail,
      action: 'AUTH_PASSWORD_CHANGED',
      module: 'Authentication',
      details: 'User password changed successfully. All sessions revoked.',
    });

    return true;
  }

  async forgotPassword(identifier: string) {
    const user = await userRepository.findByUsernameOrEmail(identifier);
    if (user) {
      await auditRepository.logAction({
        userId: user.id,
        userEmail: user.email,
        action: 'AUTH_FORGOT_PASSWORD_REQUESTED',
        module: 'Authentication',
        details: `Forgot password query submitted for User ID / Email (${identifier})`,
      });
    }
    return {
      success: true,
      message: 'If you forgot your password, please contact your Administrator or HR Department. The Administrator can assign a temporary password. Passwords cannot be viewed for security reasons.',
    };
  }

  async resetPassword(resetToken: string, newPass: string) {
    throw new Error('Self-service password reset is disabled. Please contact your Administrator or HR Department.');
  }
}

export const authService = new AuthService();
