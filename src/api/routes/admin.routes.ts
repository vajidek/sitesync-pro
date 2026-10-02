import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';
import { validate } from '../validators/auth.validator';
import {
  CreateUserAdminSchema,
  UpdateUserAdminSchema,
  ResetPasswordAdminSchema,
  CreateRoleAdminSchema,
  CloneRoleSchema,
  BatchUpdatePermissionsSchema,
  UserPermissionOverrideSchema,
  UpdateModuleAdminSchema,
  UpdateSettingAdminSchema,
} from '../validators/admin.validator';

const router = Router();

// Require authenticated user (preferably ADMIN or MANAGER for administration APIs)
router.use(authenticateJWT);

// Dashboard & Admin Overview
router.get('/dashboard', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => adminController.getDashboardStats(req, res, next));

// Users Management
router.get('/users', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => adminController.getUsers(req, res, next));
router.get('/users/:id', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => adminController.getUserById(req, res, next));
router.post('/users', requireRoles('ADMIN'), validate(CreateUserAdminSchema), (req, res, next) => adminController.createUser(req, res, next));
router.put('/users/:id', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => adminController.updateUser(req, res, next));
router.post('/users/:id/toggle-status', requireRoles('ADMIN'), (req, res, next) => adminController.toggleUserStatus(req, res, next));
router.post('/users/:id/reset-password', requireRoles('ADMIN'), (req, res, next) => adminController.resetUserPassword(req, res, next));
router.post('/users/:id/generate-temp-password', requireRoles('ADMIN'), (req, res, next) => adminController.generateTemporaryPassword(req, res, next));
router.post('/users/:id/lock', requireRoles('ADMIN'), (req, res, next) => adminController.lockUserAccount(req, res, next));
router.post('/users/:id/unlock', requireRoles('ADMIN'), (req, res, next) => adminController.unlockUserAccount(req, res, next));
router.post('/users/:id/force-password-change', requireRoles('ADMIN'), (req, res, next) => adminController.forcePasswordChange(req, res, next));
router.post('/users/:id/logout-all-devices', requireRoles('ADMIN'), (req, res, next) => adminController.logoutUserAllDevices(req, res, next));
router.post('/users/:id/restore', requireRoles('ADMIN'), (req, res, next) => adminController.restoreUserAccount(req, res, next));
router.delete('/users/:id', requireRoles('ADMIN'), (req, res, next) => adminController.softDeleteUserAccount(req, res, next));

// Login History
router.get('/login-history', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => adminController.getLoginHistory(req, res, next));
router.get('/users/:id/login-history', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => adminController.getLoginHistory(req, res, next));

// Role Management
router.get('/roles', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => adminController.getRoles(req, res, next));
router.post('/roles', requireRoles('ADMIN'), validate(CreateRoleAdminSchema), (req, res, next) => adminController.createRole(req, res, next));
router.put('/roles/:id', requireRoles('ADMIN'), (req, res, next) => adminController.updateRole(req, res, next));
router.post('/roles/:id/clone', requireRoles('ADMIN'), validate(CloneRoleSchema), (req, res, next) => adminController.cloneRole(req, res, next));
router.post('/roles/:id/toggle-status', requireRoles('ADMIN'), (req, res, next) => adminController.toggleRoleStatus(req, res, next));
router.delete('/roles/:id', requireRoles('ADMIN'), (req, res, next) => adminController.deleteRole(req, res, next));

// Permissions & Matrix
router.get('/permissions', requireRoles('ADMIN'), (req, res, next) => adminController.getPermissions(req, res, next));
router.get('/permission-matrix', requireRoles('ADMIN'), (req, res, next) => adminController.getPermissionMatrix(req, res, next));
router.post('/permission-matrix', requireRoles('ADMIN'), validate(BatchUpdatePermissionsSchema), (req, res, next) => adminController.updateRolePermissions(req, res, next));
router.get('/users/:userId/permission-overrides', requireRoles('ADMIN'), (req, res, next) => adminController.getUserPermissionOverrides(req, res, next));
router.post('/user-permission-override', requireRoles('ADMIN'), (req, res, next) => adminController.setUserPermissionOverride(req, res, next));
router.delete('/users/:userId/permission-overrides/:permissionId', requireRoles('ADMIN'), (req, res, next) => adminController.deleteUserPermissionOverride(req, res, next));
router.post('/copy-permissions', requireRoles('ADMIN'), (req, res, next) => adminController.copyUserPermissions(req, res, next));
router.get('/users/:userId/effective-permissions', requireRoles('ADMIN'), (req, res, next) => adminController.getUserEffectivePermissionSummary(req, res, next));

// Module Management Registry
router.get('/modules', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => adminController.getModules(req, res, next));
router.put('/modules/:id', requireRoles('ADMIN'), validate(UpdateModuleAdminSchema), (req, res, next) => adminController.updateModule(req, res, next));

// Organization Settings
router.get('/settings', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => adminController.getOrgSettings(req, res, next));
router.put('/settings', requireRoles('ADMIN'), validate(UpdateSettingAdminSchema), (req, res, next) => adminController.updateOrgSetting(req, res, next));

// Audit Logs
router.get('/audit-logs', requireRoles('ADMIN', 'MANAGER'), (req, res, next) => adminController.getAuditLogs(req, res, next));

export default router;
