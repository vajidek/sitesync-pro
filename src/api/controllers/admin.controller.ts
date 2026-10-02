import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { adminService } from '../services/admin.service';

export class AdminController {
  // GET /api/admin/dashboard
  async getDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/admin/users
  async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

      const result = await adminService.getUsers({ page, limit, search, sortBy, sortOrder });
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/admin/users/:id
  async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await adminService.getUserById(req.params.id);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/admin/users
  async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorEmail = req.user?.email;
      const created = await adminService.createUser(req.body, actorEmail);
      res.status(201).json({ success: true, message: 'User created successfully', data: created });
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/admin/users/:id
  async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorEmail = req.user?.email;
      const updated = await adminService.updateUser(req.params.id, req.body, actorEmail);
      res.json({ success: true, message: 'User updated successfully', data: updated });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/admin/users/:id/toggle-status
  async toggleUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { isActive } = req.body;
      const actorEmail = req.user?.email;
      const updated = await adminService.toggleUserStatus(req.params.id, Boolean(isActive), actorEmail);
      res.json({ success: true, message: `User status changed`, data: updated });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/admin/users/:id/reset-password
  async resetUserPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { newPassword } = req.body;
      const actorEmail = req.user?.email;
      const result = await adminService.resetUserPassword(req.params.id, newPassword || 'Password123!', actorEmail);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/admin/users/:id/generate-temp-password
  async generateTemporaryPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorEmail = req.user?.email;
      const result = await adminService.generateTemporaryPassword(req.params.id, actorEmail);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/admin/users/:id/lock
  async lockUserAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorEmail = req.user?.email;
      const updated = await adminService.lockUserAccount(req.params.id, actorEmail);
      res.json({ success: true, message: 'User account locked', data: updated });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/admin/users/:id/unlock
  async unlockUserAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorEmail = req.user?.email;
      const updated = await adminService.unlockUserAccount(req.params.id, actorEmail);
      res.json({ success: true, message: 'User account unlocked', data: updated });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/admin/users/:id/force-password-change
  async forcePasswordChange(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { forcePasswordChange } = req.body;
      const actorEmail = req.user?.email;
      const updated = await adminService.forcePasswordChange(req.params.id, Boolean(forcePasswordChange), actorEmail);
      res.json({ success: true, message: 'Force password change setting updated', data: updated });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/admin/users/:id/logout-all-devices
  async logoutUserAllDevices(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorEmail = req.user?.email;
      const result = await adminService.logoutUserAllDevices(req.params.id, actorEmail);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/admin/users/:id
  async softDeleteUserAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorEmail = req.user?.email;
      const result = await adminService.softDeleteUserAccount(req.params.id, actorEmail);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/admin/users/:id/restore
  async restoreUserAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorEmail = req.user?.email;
      const restored = await adminService.restoreUserAccount(req.params.id, actorEmail);
      res.json({ success: true, message: 'User account restored', data: restored });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/admin/login-history
  async getLoginHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id || (req.query.userId as string);
      const history = await adminService.getLoginHistory(userId);
      res.json({ success: true, data: history });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/admin/roles
  async getRoles(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const roles = await adminService.getRoles();
      res.json({ success: true, data: roles });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/admin/roles
  async createRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorEmail = req.user?.email;
      const role = await adminService.createRole(req.body, actorEmail);
      res.status(201).json({ success: true, message: 'Role created', data: role });
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/admin/roles/:id
  async updateRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorEmail = req.user?.email;
      const { permissionIds, ...updates } = req.body;
      const updated = await adminService.updateRole(req.params.id, updates, permissionIds, actorEmail);
      res.json({ success: true, message: 'Role updated', data: updated });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/admin/roles/:id/clone
  async cloneRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorEmail = req.user?.email;
      const { newRoleCode, newRoleName } = req.body;
      const cloned = await adminService.cloneRole(req.params.id, newRoleCode, newNameRole(newRoleName), actorEmail);
      res.status(201).json({ success: true, message: 'Role cloned successfully', data: cloned });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/admin/roles/:id/toggle-status
  async toggleRoleStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorEmail = req.user?.email;
      const { isActive } = req.body;
      const updated = await adminService.toggleRoleStatus(req.params.id, Boolean(isActive), actorEmail);
      res.json({ success: true, message: 'Role status updated', data: updated });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/admin/roles/:id
  async deleteRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorEmail = req.user?.email;
      await adminService.deleteRole(req.params.id, actorEmail);
      res.json({ success: true, message: 'Role deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/admin/permissions
  async getPermissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const permissions = await adminService.getPermissions();
      res.json({ success: true, data: permissions });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/admin/permission-matrix
  async getPermissionMatrix(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const matrix = await adminService.getPermissionMatrix();
      res.json({ success: true, data: matrix });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/admin/permission-matrix
  async updateRolePermissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorEmail = req.user?.email;
      const { roleId, permissionIds } = req.body;
      const updated = await adminService.updateRolePermissions(roleId, permissionIds, actorEmail);
      res.json({ success: true, message: 'Role permissions matrix updated', data: updated });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/admin/users/:userId/permission-overrides
  async getUserPermissionOverrides(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const overrides = await adminService.getUserPermissionOverrides(req.params.userId);
      res.json({ success: true, data: overrides });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/admin/user-permission-override
  async setUserPermissionOverride(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorEmail = req.user?.email;
      const { userId, permissionId, granted, startDate, endDate, expiresAt, reason } = req.body;
      const result = await adminService.setUserPermissionOverride(
        userId,
        permissionId,
        Boolean(granted),
        { startDate, endDate, expiresAt, reason },
        actorEmail
      );
      res.json({ success: true, message: 'User permission override saved successfully', data: result });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/admin/users/:userId/permission-overrides/:permissionId
  async deleteUserPermissionOverride(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorEmail = req.user?.email;
      const { userId, permissionId } = req.params;
      const result = await adminService.deleteUserPermissionOverride(userId, permissionId, actorEmail);
      res.json({ success: true, message: 'Permission override removed', data: result });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/admin/copy-permissions
  async copyUserPermissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorEmail = req.user?.email;
      const { sourceId, targetUserId, isSourceRole } = req.body;
      const result = await adminService.copyUserPermissions(sourceId, targetUserId, Boolean(isSourceRole), actorEmail);
      res.json({ success: true, message: 'Permissions copied successfully', data: result });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/admin/users/:userId/effective-permissions
  async getUserEffectivePermissionSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const summary = await adminService.getUserEffectivePermissionSummary(req.params.userId);
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/admin/modules
  async getModules(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const modules = await adminService.getModules();
      res.json({ success: true, data: modules });
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/admin/modules/:id
  async updateModule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorEmail = req.user?.email;
      const updated = await adminService.updateModule(req.params.id, req.body, actorEmail);
      res.json({ success: true, message: 'Module updated', data: updated });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/admin/settings
  async getOrgSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settings = await adminService.getOrgSettings();
      res.json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/admin/settings
  async updateOrgSetting(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorEmail = req.user?.email;
      const { key, value } = req.body;
      const updated = await adminService.updateOrgSetting(key, value, actorEmail);
      res.json({ success: true, message: 'Setting saved', data: updated });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/admin/audit-logs
  async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 15;
      const search = (req.query.search as string) || '';
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

      const result = await adminService.getAuditLogs({ page, limit, search, sortBy, sortOrder });
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
}

function newNameRole(name: any): string {
  return typeof name === 'string' ? name : String(name || 'Cloned Role');
}

export const adminController = new AdminController();
