import { z } from 'zod';

export const CreateUserAdminSchema = z.object({
  email: z.string().email('Valid email address is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  department: z.string().optional(),
  roleId: z.string().min(1, 'Role assignment is required'),
  employeeId: z.string().optional(),
  assignedProjectId: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const UpdateUserAdminSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  roleId: z.string().optional(),
  employeeId: z.string().optional(),
  assignedProjectId: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const ResetPasswordAdminSchema = z.object({
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const CreateRoleAdminSchema = z.object({
  code: z.string().min(2, 'Role code required'),
  name: z.string().min(2, 'Role name required'),
  description: z.string().min(5, 'Description required'),
  permissionIds: z.array(z.string()).optional().default([]),
});

export const CloneRoleSchema = z.object({
  newRoleCode: z.string().min(2, 'New role code required'),
  newRoleName: z.string().min(2, 'New role name required'),
});

export const BatchUpdatePermissionsSchema = z.object({
  roleId: z.string().min(1, 'Role ID required'),
  permissionIds: z.array(z.string()),
});

export const UserPermissionOverrideSchema = z.object({
  permissionId: z.string().min(1, 'Permission ID required'),
  granted: z.boolean(),
});

export const UpdateModuleAdminSchema = z.object({
  name: z.string().optional(),
  icon: z.string().optional(),
  category: z.string().optional(),
  route: z.string().optional(),
  status: z.enum(['ACTIVE', 'BETA', 'INACTIVE']).optional(),
  displayOrder: z.number().optional(),
  visibleInSidebar: z.boolean().optional(),
  visibleOnMobile: z.boolean().optional(),
});

export const UpdateSettingAdminSchema = z.object({
  key: z.string().min(1, 'Setting key required'),
  value: z.string(),
});
