import bcrypt from 'bcryptjs';
import { adminRepository, DbUserPermissionOverride } from '../repositories/admin.repository';
import { userRepository } from '../repositories/user.repository';
import { hrRepository } from '../repositories/hr.repository';
import { authService } from './auth.service';
import { authCache } from '../utils/authCache';
import { PaginationParams } from '../utils/pagination';

export class AdminService {
  async getDashboardStats() {
    return adminRepository.getAdminDashboardStats();
  }

  // --- Users ---
  async getUsers(params: PaginationParams) {
    return adminRepository.getUsers(params);
  }

  async getUserById(id: string) {
    const user = await adminRepository.getUserById(id);
    if (!user) throw new Error('User not found');
    const { passwordHash, ...rest } = user;
    return rest;
  }

  async createUser(data: any, actorEmail?: string) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(data.password || 'Password123!', salt);
    const username = (data.username || data.userId || data.email.split('@')[0]).trim();

    const userToCreate = {
      username,
      email: data.email,
      passwordHash: hash,
      name: data.name,
      phone: data.phone || '',
      department: data.department || 'General Operations',
      roleId: data.roleId,
      employeeId: data.employeeId || '',
      assignedProjectId: data.assignedProjectId || 'PRJ-101',
      isActive: data.isActive !== undefined ? data.isActive : true,
      accountStatus: data.accountStatus || 'ACTIVE',
      isEmailVerified: true,
      forcePasswordChange: data.forcePasswordChange ?? false,
      failedLoginAttempts: 0,
      isLocked: false,
    };

    const created = await userRepository.create(userToCreate as any);

    await adminRepository.logAuditAction({
      userEmail: actorEmail || 'admin@sitesyncpro.com',
      action: 'USER_CREATED',
      module: 'Administration',
      details: `Created user ${created.name} (User ID: ${created.username}, Email: ${created.email})`,
    });

    const { passwordHash, ...rest } = created;
    return rest;
  }

  async updateUser(id: string, updates: any, actorEmail?: string) {
    const updated = await userRepository.update(id, updates);
    if (!updated) throw new Error('User not found');

    authCache.invalidateUser(id);

    await adminRepository.logAuditAction({
      userEmail: actorEmail || 'admin@sitesyncpro.com',
      action: 'USER_UPDATED',
      module: 'Administration',
      details: `Updated user account ${updated.username || updated.email}`,
    });

    const { passwordHash, ...rest } = updated;
    return rest;
  }

  async toggleUserStatus(id: string, isActive: boolean, actorEmail?: string) {
    const status = isActive ? 'ACTIVE' : 'INACTIVE';
    const updated = await userRepository.update(id, { isActive, accountStatus: status });
    if (!updated) throw new Error('User not found');

    authCache.invalidateUser(id);

    await adminRepository.logAuditAction({
      userEmail: actorEmail || 'admin@sitesyncpro.com',
      action: isActive ? 'USER_REACTIVATED' : 'USER_DEACTIVATED',
      module: 'Administration',
      details: `${isActive ? 'Reactivated' : 'Deactivated'} user account ${updated.username || updated.email}`,
    });

    const { passwordHash, ...rest } = updated;
    return rest;
  }

  async resetUserPassword(id: string, newPass: string, actorEmail?: string) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPass, salt);

    const updated = await userRepository.update(id, {
      passwordHash: hash,
      failedLoginAttempts: 0,
      isLocked: false,
      accountStatus: 'ACTIVE',
      lockedUntil: undefined,
      lockedAt: undefined,
      passwordLastChangedAt: new Date().toISOString(),
    });
    if (!updated) throw new Error('User not found');

    authCache.invalidateUser(id);

    await adminRepository.logAuditAction({
      userEmail: actorEmail || 'admin@sitesyncpro.com',
      action: 'ADMIN_PASSWORD_RESET',
      module: 'Administration',
      details: `Admin reset password for ${updated.username || updated.email}`,
    });

    return { success: true, message: `Password successfully updated for ${updated.username || updated.email}` };
  }

  async generateTemporaryPassword(id: string, actorEmail?: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new Error('User not found');

    // Generate readable random temp password e.g. Tmp#9284!
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const tempPassword = `Tmp#${randomNum}!`;

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(tempPassword, salt);

    await userRepository.update(id, {
      passwordHash: hash,
      forcePasswordChange: true,
      failedLoginAttempts: 0,
      isLocked: false,
      accountStatus: 'ACTIVE',
      lockedUntil: undefined,
      lockedAt: undefined,
      passwordLastChangedAt: new Date().toISOString(),
    });

    authCache.invalidateUser(id);

    await adminRepository.logAuditAction({
      userEmail: actorEmail || 'admin@sitesyncpro.com',
      action: 'ADMIN_TEMP_PASSWORD_GENERATED',
      module: 'Administration',
      details: `Admin generated temporary password for ${user.username || user.email}`,
    });

    return {
      success: true,
      temporaryPassword: tempPassword,
      message: `Temporary password generated for ${user.name} (${user.username}). User will be required to change password on next login.`,
    };
  }

  async lockUserAccount(id: string, actorEmail?: string) {
    const updated = await userRepository.update(id, {
      isLocked: true,
      accountStatus: 'LOCKED',
      lockedAt: new Date().toISOString(),
    });
    if (!updated) throw new Error('User not found');

    authCache.invalidateUser(id);

    await adminRepository.logAuditAction({
      userEmail: actorEmail || 'admin@sitesyncpro.com',
      action: 'USER_ACCOUNT_LOCKED',
      module: 'Administration',
      details: `Admin locked user account ${updated.username || updated.email}`,
    });

    const { passwordHash, ...rest } = updated;
    return rest;
  }

  async unlockUserAccount(id: string, actorEmail?: string) {
    const updated = await userRepository.update(id, {
      isLocked: false,
      failedLoginAttempts: 0,
      accountStatus: 'ACTIVE',
      lockedUntil: undefined,
      lockedAt: undefined,
    });
    if (!updated) throw new Error('User not found');

    authCache.invalidateUser(id);

    await adminRepository.logAuditAction({
      userEmail: actorEmail || 'admin@sitesyncpro.com',
      action: 'USER_ACCOUNT_UNLOCKED',
      module: 'Administration',
      details: `Admin unlocked user account ${updated.username || updated.email}`,
    });

    const { passwordHash, ...rest } = updated;
    return rest;
  }

  async forcePasswordChange(id: string, force: boolean, actorEmail?: string) {
    const updated = await userRepository.update(id, { forcePasswordChange: force });
    if (!updated) throw new Error('User not found');

    authCache.invalidateUser(id);

    await adminRepository.logAuditAction({
      userEmail: actorEmail || 'admin@sitesyncpro.com',
      action: force ? 'FORCE_PASSWORD_CHANGE_ENABLED' : 'FORCE_PASSWORD_CHANGE_DISABLED',
      module: 'Administration',
      details: `Admin ${force ? 'enabled' : 'disabled'} force password change for ${updated.username || updated.email}`,
    });

    const { passwordHash, ...rest } = updated;
    return rest;
  }

  async logoutUserAllDevices(id: string, actorEmail?: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new Error('User not found');

    authCache.invalidateUser(id);
    const revokedCount = await authService.logoutAllDevices(id, user.email);

    await adminRepository.logAuditAction({
      userEmail: actorEmail || 'admin@sitesyncpro.com',
      action: 'ADMIN_REVOKED_ALL_USER_SESSIONS',
      module: 'Administration',
      details: `Admin revoked all active sessions for ${user.username || user.email} (${revokedCount} sessions)`,
    });

    return { success: true, revokedCount, message: `Revoked ${revokedCount} active session(s) for ${user.name}` };
  }

  async softDeleteUserAccount(id: string, actorEmail?: string) {
    const success = await userRepository.softDelete(id, actorEmail);
    if (!success) throw new Error('User not found');

    authCache.invalidateUser(id);

    await adminRepository.logAuditAction({
      userEmail: actorEmail || 'admin@sitesyncpro.com',
      action: 'USER_SOFT_DELETED',
      module: 'Administration',
      details: `Soft deleted user account ${id}`,
    });

    return { success: true, message: 'User account soft deleted' };
  }

  async restoreUserAccount(id: string, actorEmail?: string) {
    const restored = await userRepository.restore(id, actorEmail);
    if (!restored) throw new Error('User not found');

    authCache.invalidateUser(id);

    await adminRepository.logAuditAction({
      userEmail: actorEmail || 'admin@sitesyncpro.com',
      action: 'USER_ACCOUNT_RESTORED',
      module: 'Administration',
      details: `Restored user account ${restored.username || restored.email}`,
    });

    const { passwordHash, ...rest } = restored;
    return rest;
  }

  async getLoginHistory(userId?: string) {
    return userRepository.getLoginHistory(userId);
  }

  // --- Roles ---
  async getRoles() {
    return adminRepository.getRoles();
  }

  async createRole(data: any, actorEmail?: string) {
    const role = await adminRepository.createRole(
      {
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description,
        isActive: true,
      },
      data.permissionIds || []
    );

    await adminRepository.logAuditAction({
      userEmail: actorEmail || 'admin@sitesyncpro.com',
      action: 'ROLE_CREATED',
      module: 'Administration',
      details: `Created role ${role.name} (${role.code})`,
    });

    return role;
  }

  async updateRole(id: string, updates: any, permissionIds?: string[], actorEmail?: string) {
    const updated = await adminRepository.updateRole(id, updates, permissionIds);
    authCache.invalidateRole(id);

    await adminRepository.logAuditAction({
      userEmail: actorEmail || 'admin@sitesyncpro.com',
      action: 'ROLE_UPDATED',
      module: 'Administration',
      details: `Updated role permissions & configuration for ${updated.name}`,
    });

    return updated;
  }

  async cloneRole(sourceId: string, newCode: string, newName: string, actorEmail?: string) {
    const cloned = await adminRepository.cloneRole(sourceId, newCode, newName);

    await adminRepository.logAuditAction({
      userEmail: actorEmail || 'admin@sitesyncpro.com',
      action: 'ROLE_CLONED',
      module: 'Administration',
      details: `Cloned role to ${cloned.name} (${cloned.code})`,
    });

    return cloned;
  }

  async toggleRoleStatus(id: string, isActive: boolean, actorEmail?: string) {
    const updated = await adminRepository.toggleRoleStatus(id, isActive);
    authCache.invalidateRole(id);
    return updated;
  }

  async deleteRole(id: string, actorEmail?: string) {
    const deleted = await adminRepository.deleteRole(id);
    authCache.invalidateRole(id);

    await adminRepository.logAuditAction({
      userEmail: actorEmail || 'admin@sitesyncpro.com',
      action: 'ROLE_DELETED',
      module: 'Administration',
      details: `Deleted custom role ID ${id}`,
    });

    return deleted;
  }

  // --- Permission Matrix ---
  async getPermissions() {
    return adminRepository.getPermissions();
  }

  async getPermissionMatrix() {
    return adminRepository.getPermissionMatrix();
  }

  async updateRolePermissions(roleId: string, permissionIds: string[], actorEmail?: string) {
    const updatedRole = await adminRepository.updateRolePermissions(roleId, permissionIds);
    authCache.invalidateRole(roleId);

    await adminRepository.logAuditAction({
      userEmail: actorEmail || 'admin@sitesyncpro.com',
      action: 'PERMISSIONS_MATRIX_UPDATED',
      module: 'Security',
      details: `Updated matrix permissions for role ID ${roleId}`,
    });

    return updatedRole;
  }

  async getUserPermissionOverrides(userId: string) {
    return adminRepository.getUserPermissionOverrides(userId);
  }

  async setUserPermissionOverride(
    userId: string,
    permissionId: string,
    granted: boolean,
    overrideData?: {
      startDate?: string;
      endDate?: string;
      expiresAt?: string;
      reason?: string;
    },
    actorEmail?: string
  ) {
    const override = await adminRepository.setUserPermissionOverride(userId, permissionId, granted, {
      ...overrideData,
      createdBy: actorEmail || 'admin@sitesyncpro.com',
    });

    authCache.invalidateUser(userId);

    await adminRepository.logAuditAction({
      userEmail: actorEmail || 'admin@sitesyncpro.com',
      action: 'USER_PERMISSION_OVERRIDE_SET',
      module: 'Security',
      details: `Set override ${granted ? 'GRANT' : 'EXPLICIT_DENY'} for user ID ${userId} on perm ${permissionId}${overrideData?.reason ? ` (Reason: ${overrideData.reason})` : ''}`,
    });

    return override;
  }

  async deleteUserPermissionOverride(userId: string, permissionId: string, actorEmail?: string) {
    const deleted = await adminRepository.deleteUserPermissionOverride(userId, permissionId);
    authCache.invalidateUser(userId);

    await adminRepository.logAuditAction({
      userEmail: actorEmail || 'admin@sitesyncpro.com',
      action: 'USER_PERMISSION_OVERRIDE_REMOVED',
      module: 'Security',
      details: `Removed override for user ID ${userId} on perm ${permissionId}`,
    });

    return { success: deleted };
  }

  async copyUserPermissions(sourceId: string, targetUserId: string, isSourceRole: boolean = false, actorEmail?: string) {
    const overrides = await adminRepository.copyUserPermissions(sourceId, targetUserId, isSourceRole);
    authCache.invalidateUser(targetUserId);

    await adminRepository.logAuditAction({
      userEmail: actorEmail || 'admin@sitesyncpro.com',
      action: 'USER_PERMISSIONS_COPIED',
      module: 'Security',
      details: `Copied permissions from ${isSourceRole ? 'Role' : 'User'} ID ${sourceId} to Target User ID ${targetUserId}`,
    });

    return overrides;
  }

  async getUserEffectivePermissionSummary(userId: string) {
    const user = await adminRepository.getUserById(userId);
    if (!user) throw new Error('User not found');

    const effectivePermissions = await adminRepository.getUserEffectivePermissions(userId, user.roleId);
    const role = await adminRepository.getRoleById(user.roleId);
    const overrides = await adminRepository.getUserPermissionOverrides(userId);

    // Fetch linked employee record if available
    let employeeData = null;
    if (user.employeeId) {
      try {
        const emp = await hrRepository.getEmployeeById(user.employeeId);
        if (emp) {
          employeeData = {
            id: emp.id,
            employeeCode: emp.employeeCode,
            fullName: emp.fullName,
            designation: emp.designation,
            department: emp.department,
            branch: emp.branch,
            status: emp.status,
          };
        }
      } catch (e) {
        console.warn('Error fetching linked employee:', e);
      }
    }

    // Role base permissions
    const allMasterPerms = await adminRepository.getMasterPermissions();
    const allRolePerms = await adminRepository.getAllRolePermissions();
    const targetRoleId = role?.id || user.roleId;
    const rolePermIds = allRolePerms.filter((rp) => rp.roleId === targetRoleId).map((rp) => rp.permissionId);
    const roleBasePermissions = allMasterPerms
      .filter((p) => rolePermIds.includes(p.id))
      .map((p) => p.code);

    const explanationTrail = [
      {
        step: 1,
        title: 'User Identity Authentication',
        detail: `Verified account ${user.name} (${user.email}) with account state ${user.isActive ? 'ACTIVE' : 'INACTIVE'}.`,
        status: user.isActive ? 'PASSED' : 'BLOCKED',
      },
      {
        step: 2,
        title: 'HR Employee Linkage',
        detail: employeeData
          ? `Linked to HR Employee Master: ${employeeData.fullName} [${employeeData.employeeCode}] — ${employeeData.designation} (${employeeData.status})`
          : `Standalone System User account (No 1:1 HR Employee Master record bound).`,
        status: 'INFO',
      },
      {
        step: 3,
        title: 'Organizational Scope',
        detail: `Assigned to Department: '${user.department || 'General'}', Branch: '${employeeData?.branch || 'Corporate HQ'}'.`,
        status: 'INFO',
      },
      {
        step: 4,
        title: 'Role Authorization & Base Permissions',
        detail: `Assigned Role: ${role?.name || user.roleId} (${role?.code || 'CUSTOM'}). Inherited ${roleBasePermissions.length} baseline permission keys.`,
        status: 'INFO',
      },
      {
        step: 5,
        title: 'Direct User Overrides (ABAC/Ad-hoc)',
        detail: overrides.length > 0
          ? `${overrides.length} explicit permission override rule(s) applied (Grant/Deny).`
          : `No direct user-level overrides active. Permissions derived purely from role definition.`,
        status: 'INFO',
      },
      {
        step: 6,
        title: 'Project & Site Scope Binding',
        detail: `Restricted to Project: ${user.assignedProjectId || 'PRJ-101 (All-Site Access)'}.`,
        status: 'INFO',
      },
      {
        step: 7,
        title: 'Final Computed Effective Permissions',
        detail: `Total of ${effectivePermissions.length} active permission key(s) verified for this user identity across all ERP modules.`,
        status: 'PASSED',
      },
    ];

    return {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      department: user.department,
      assignedProjectId: user.assignedProjectId || 'PRJ-101',
      isActive: user.isActive,
      isLocked: !!(user.lockedUntil && new Date(user.lockedUntil) > new Date()),
      roleId: user.roleId,
      roleName: role?.name || 'Unknown Role',
      roleCode: role?.code || 'USER',
      roleIsActive: role?.isActive ?? true,
      employee: employeeData,
      roleBasePermissions,
      overrides,
      effectivePermissions,
      explanationTrail,
    };
  }

  // --- Module Registry ---
  async getModules() {
    return adminRepository.getModules();
  }

  async updateModule(id: string, updates: any, actorEmail?: string) {
    const moduleItem = await adminRepository.updateModule(id, updates);

    await adminRepository.logAuditAction({
      userEmail: actorEmail || 'admin@sitesyncpro.com',
      action: 'ERP_MODULE_UPDATED',
      module: 'System Registry',
      details: `Updated ERP module ${moduleItem.name} config`,
    });

    return moduleItem;
  }

  // --- Org Settings ---
  async getOrgSettings() {
    return adminRepository.getOrgSettings();
  }

  async updateOrgSetting(key: string, value: string, actorEmail?: string) {
    const setting = await adminRepository.updateOrgSetting(key, value);

    await adminRepository.logAuditAction({
      userEmail: actorEmail || 'admin@sitesyncpro.com',
      action: 'ORG_SETTING_UPDATED',
      module: 'Organization',
      details: `Updated setting ${key} to ${value}`,
    });

    return setting;
  }

  // --- Audit Logs ---
  async getAuditLogs(params: PaginationParams) {
    return adminRepository.getAuditLogs(params);
  }
}

export const adminService = new AdminService();
