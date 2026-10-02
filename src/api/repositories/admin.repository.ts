import { db } from '../../db';
import {
  companies,
  branches,
  departments,
  designations,
  employees,
  users,
  roles,
  permissions,
  rolePermissions,
  projects,
  vehicles,
  equipments,
  materials,
  auditLogs,
  materialCategories,
  materialUnits,
} from '../../db/schema';
import { eq, desc, and, or } from 'drizzle-orm';
import { ensureMasterSeeded } from './master.repository';
import { paginateArray, PaginationParams } from '../utils/pagination';

let cachedMasterPermissions: DbPermission[] | null = null;

export function invalidateMasterPermissionsCache(): void {
  cachedMasterPermissions = null;
}

export interface DbUser {
  id: string;
  uid?: string;
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
  department: string;
  avatarUrl?: string;
  roleId: string;
  employeeId?: string;
  assignedProjectId?: string;
  assignedProjectName?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  failedLoginAttempts: number;
  lockedUntil?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbRole {
  id: string;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbPermission {
  id: string;
  code: string;
  name: string;
  module: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbAuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface DbModule {
  id: string;
  code: string;
  name: string;
  icon: string;
  category: string;
  route: string;
  status: 'ACTIVE' | 'BETA' | 'INACTIVE';
  displayOrder: number;
  visibleInSidebar: boolean;
  visibleOnMobile: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbUserPermissionOverride {
  id: string;
  userId: string;
  permissionId: string;
  permissionCode?: string;
  granted: boolean; // true = forced allow, false = explicit deny
  startDate?: string;
  endDate?: string;
  expiresAt?: string;
  reason?: string;
  createdBy?: string;
  createdAt: string;
}

export interface DbOrgSetting {
  id: string;
  key: string;
  value: string;
  group: 'GENERAL' | 'NOTIFICATIONS' | 'SECURITY' | 'WORKFLOW' | 'SYSTEM';
  description?: string;
  updatedAt: string;
}

// Initial ERP Module Registry Table
export const modulesTable: DbModule[] = [
  { id: 'mod-001', code: 'MOD-DASH', name: 'Dashboard & KPIs', icon: 'LayoutDashboard', category: 'Core Operations', route: 'dashboard', status: 'ACTIVE', displayOrder: 1, visibleInSidebar: true, visibleOnMobile: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'mod-002', code: 'MOD-PRJ', name: 'Projects & Sites', icon: 'Building2', category: 'Field Execution', route: 'projects', status: 'ACTIVE', displayOrder: 2, visibleInSidebar: true, visibleOnMobile: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'mod-003', code: 'MOD-WRK', name: 'Work Orders & Operations', icon: 'ClipboardCheck', category: 'Field Execution', route: 'workorders', status: 'ACTIVE', displayOrder: 3, visibleInSidebar: true, visibleOnMobile: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'mod-004', code: 'MOD-EQP', name: 'Plant & Heavy Machinery', icon: 'Truck', category: 'Asset Management', route: 'machinery', status: 'ACTIVE', displayOrder: 4, visibleInSidebar: true, visibleOnMobile: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'mod-005', code: 'MOD-INV', name: 'Materials & Inventory Store', icon: 'Boxes', category: 'Supply Chain', route: 'inventory', status: 'ACTIVE', displayOrder: 5, visibleInSidebar: true, visibleOnMobile: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'mod-006', code: 'MOD-ADM', name: 'ERP Administration & Security', icon: 'ShieldCheck', category: 'System Administration', route: 'admin', status: 'ACTIVE', displayOrder: 6, visibleInSidebar: true, visibleOnMobile: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'mod-007', code: 'MOD-SCH', name: 'ERP Schema Inspector', icon: 'Database', category: 'Technical Foundation', route: 'schema', status: 'ACTIVE', displayOrder: 7, visibleInSidebar: true, visibleOnMobile: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const userPermissionOverridesTable: DbUserPermissionOverride[] = [];

export const orgSettingsTable: DbOrgSetting[] = [
  { id: 'stg-001', key: 'COMPANY_LEGAL_NAME', value: 'SiteSync Infrastructure & Construction Corp Ltd.', group: 'GENERAL', description: 'Primary registered commercial entity name', updatedAt: new Date().toISOString() },
  { id: 'stg-002', key: 'TAX_REGISTRATION_NO', value: 'TAX-ENTERPRISE-REG-01', group: 'GENERAL', description: 'Corporate Tax / Registration Number', updatedAt: new Date().toISOString() },
  { id: 'stg-003', key: 'BASE_CURRENCY', value: 'INR', group: 'GENERAL', description: 'Enterprise reporting & consolidated base currency (₹)', updatedAt: new Date().toISOString() },
  { id: 'stg-004', key: 'DEFAULT_ENTERPRISE_JURISDICTION', value: 'INDIA', group: 'GENERAL', description: 'Default enterprise regulatory & statutory jurisdiction (India)', updatedAt: new Date().toISOString() },
  { id: 'stg-005', key: 'DEFAULT_STATE_REGION', value: 'KL', group: 'GENERAL', description: 'Default operating state profile (Kerala - KL)', updatedAt: new Date().toISOString() },
  { id: 'stg-006', key: 'DEFAULT_PAYROLL_JURISDICTION', value: 'INDIA', group: 'GENERAL', description: 'Default payroll & statutory calculation framework (India)', updatedAt: new Date().toISOString() },
  { id: 'stg-007', key: 'DEFAULT_STATUTORY_PROFILE', value: 'IN-STATUTORY-2026', group: 'GENERAL', description: 'Active statutory rule framework version', updatedAt: new Date().toISOString() },
  { id: 'stg-008', key: 'ENABLE_EMAIL_NOTIFICATIONS', value: 'true', group: 'NOTIFICATIONS', description: 'Send daily requisition & dispatch alerts', updatedAt: new Date().toISOString() },
  { id: 'stg-009', key: 'PASSWORD_EXPIRY_DAYS', value: '90', group: 'SECURITY', description: 'Enforce periodic credentials refresh', updatedAt: new Date().toISOString() },
  { id: 'stg-010', key: 'MAX_FAILED_LOGIN_ATTEMPTS', value: '5', group: 'SECURITY', description: 'Account lockout threshold', updatedAt: new Date().toISOString() },
  { id: 'stg-011', key: 'REQUIRE_APPROVAL_OVER_AMOUNT', value: '1000000', group: 'WORKFLOW', description: 'Threshold INR amount for Executive Director verification', updatedAt: new Date().toISOString() },
];

export class AdminRepository {
  // --- Admin Dashboard Metrics ---
  async getAdminDashboardStats() {
    await ensureMasterSeeded();
    const empRows = await db.select().from(employees);
    const prjRows = await db.select().from(projects);
    const userRows = await db.select().from(users);
    const vehRows = await db.select().from(vehicles);
    const eqpRows = await db.select().from(equipments);
    const matRows = await db.select().from(materials);
    const auditRows = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(8);
    const roleRows = await db.select().from(roles);

    const totalEmployees = empRows.length;
    const activeProjects = prjRows.filter((p) => p.status === 'IN_PROGRESS' || p.status === 'PLANNING').length;
    const totalUsers = userRows.length;
    const totalVehicles = vehRows.length;
    const totalEquipment = eqpRows.length;
    const totalMaterials = matRows.length;
    const pendingApprovals = 14;
    const totalNotifications = 28;

    const userRolesBreakdown = roleRows.map((role) => {
      const count = userRows.filter((u) => u.roleId === role.id).length;
      return { role: role.name, code: role.code, count };
    });

    const projectStatusBreakdown = [
      { status: 'In Progress', count: prjRows.filter((p) => p.status === 'IN_PROGRESS').length },
      { status: 'Planning', count: prjRows.filter((p) => p.status === 'PLANNING').length },
      { status: 'On Hold', count: prjRows.filter((p) => p.status === 'ON_HOLD').length },
      { status: 'Completed', count: prjRows.filter((p) => p.status === 'COMPLETED').length },
    ];

    return {
      kpi: {
        totalEmployees,
        activeProjects,
        totalUsers,
        totalVehicles,
        totalEquipment,
        totalMaterials,
        pendingApprovals,
        totalNotifications,
      },
      userRolesBreakdown,
      projectStatusBreakdown,
      recentAuditLogs: auditRows,
    };
  }

  // --- User Management ---
  async getUsers(params: PaginationParams) {
    const userRows = await db.select().from(users);
    return paginateArray(userRows, params, ['name', 'email', 'department', 'phone']);
  }

  async getUserById(id: string): Promise<DbUser | null> {
    const [row] = await db.select().from(users).where(eq(users.id, id));
    return (row as any) || null;
  }

  async createUser(user: Omit<DbUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<DbUser> {
    const newUser = {
      ...user,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.insert(users).values(newUser as any);
    return newUser as any;
  }

  async updateUser(id: string, updates: Partial<DbUser>): Promise<DbUser> {
    const existing = await this.getUserById(id);
    if (!existing) throw new Error('User not found');

    const updated = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await db.update(users).set(updated as any).where(eq(users.id, id));
    return (await this.getUserById(id))!;
  }

  async toggleUserStatus(id: string, isActive: boolean): Promise<DbUser> {
    return this.updateUser(id, { isActive });
  }

  async resetUserPassword(id: string, newPasswordHash: string): Promise<DbUser> {
    return this.updateUser(id, { passwordHash: newPasswordHash, failedLoginAttempts: 0, lockedUntil: undefined });
  }

  // --- Role Management ---
  async getRoles() {
    const allRoles = await db.select().from(roles);
    const allUsers = await db.select().from(users);
    const allRolePerms = await db.select().from(rolePermissions);

    return allRoles.map((role) => {
      const userCount = allUsers.filter((u) => u.roleId === role.id).length;
      const permIds = allRolePerms.filter((rp) => rp.roleId === role.id).map((rp) => rp.permissionId);
      return {
        ...role,
        userCount,
        permissionCount: permIds.length,
        permissionIds: permIds,
      };
    });
  }

  async getRoleById(id: string): Promise<DbRole | null> {
    if (!id) return null;
    const [row] = await db.select().from(roles).where(or(eq(roles.id, id), eq(roles.code, id)));
    return (row as any) || null;
  }

  async createRole(roleData: Omit<DbRole, 'id' | 'createdAt' | 'updatedAt'>, permissionIds: string[] = []): Promise<DbRole> {
    const existing = await db.select().from(roles).where(eq(roles.code, roleData.code));
    if (existing.length > 0) {
      throw new Error(`Role with code '${roleData.code}' already exists`);
    }

    const newRole = {
      ...roleData,
      id: `role-custom-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.insert(roles).values(newRole as any);

    for (const pId of permissionIds) {
      await db.insert(rolePermissions).values({
        id: `rp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        roleId: newRole.id,
        permissionId: pId,
        createdAt: new Date().toISOString(),
      });
    }

    return newRole as any;
  }

  async updateRole(id: string, updates: Partial<DbRole>, permissionIds?: string[]): Promise<DbRole> {
    const existing = await this.getRoleById(id);
    if (!existing) throw new Error('Role not found');

    const updated = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await db.update(roles).set(updated as any).where(eq(roles.id, id));

    if (permissionIds) {
      await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id));
      for (const pId of permissionIds) {
        await db.insert(rolePermissions).values({
          id: `rp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          roleId: id,
          permissionId: pId,
          createdAt: new Date().toISOString(),
        });
      }
    }

    return (await this.getRoleById(id))!;
  }

  async cloneRole(sourceRoleId: string, newRoleCode: any, newRoleName: string): Promise<DbRole> {
    const sourceRole = await this.getRoleById(sourceRoleId);
    if (!sourceRole) throw new Error('Source role not found');

    const allRolePerms = await db.select().from(rolePermissions);
    const existingPermIds = allRolePerms
      .filter((rp) => rp.roleId === sourceRoleId)
      .map((rp) => rp.permissionId);

    return this.createRole(
      {
        code: newRoleCode,
        name: newRoleName,
        description: `Cloned from ${sourceRole.name}`,
        isActive: true,
      },
      existingPermIds
    );
  }

  async toggleRoleStatus(id: string, isActive: boolean): Promise<DbRole> {
    return this.updateRole(id, { isActive });
  }

  async deleteRole(id: string): Promise<boolean> {
    const existing = await this.getRoleById(id);
    if (!existing) return false;

    // 1. Prevent deletion of seeded core enterprise system roles
    const SYSTEM_ROLE_CODES = ['ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR', 'STORE_KEEPER', 'DRIVER', 'OPERATOR', 'WORKER'];
    if (SYSTEM_ROLE_CODES.includes(existing.code)) {
      throw new Error(`System role '${existing.name}' (${existing.code}) cannot be deleted as it is a core enterprise system role. You may deactivate it instead.`);
    }

    // 2. Dependency guard: Check if active or existing users are currently assigned to this role
    const assignedUsers = await db.select().from(users).where(eq(users.roleId, id));
    if (assignedUsers.length > 0) {
      throw new Error(`Cannot delete role '${existing.name}' because ${assignedUsers.length} user(s) (e.g. ${assignedUsers[0].name}) are currently assigned to it. Please reassign those users to another role before deleting.`);
    }

    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id));
    await db.delete(roles).where(eq(roles.id, id));
    return true;
  }

  // --- Permission Matrix ---
  async getMasterPermissions(): Promise<DbPermission[]> {
    if (!cachedMasterPermissions) {
      cachedMasterPermissions = await db.select().from(permissions);
    }
    return cachedMasterPermissions;
  }

  async getAllRolePermissions() {
    return await db.select().from(rolePermissions);
  }

  async getAllUserPermissionOverrides(): Promise<DbUserPermissionOverride[]> {
    return userPermissionOverridesTable.slice();
  }

  async getPermissions() {
    return this.getMasterPermissions();
  }

  async getPermissionMatrix() {
    const allPerms = await this.getMasterPermissions();
    const allRoles = await db.select().from(roles);
    const allRolePerms = await this.getAllRolePermissions();

    const matrix = allRoles.map((role) => {
      const assignedPermIds = allRolePerms
        .filter((rp) => rp.roleId === role.id)
        .map((rp) => rp.permissionId);

      return {
        roleId: role.id,
        roleCode: role.code,
        roleName: role.name,
        permissions: allPerms.reduce((acc, p) => {
          acc[p.code] = assignedPermIds.includes(p.id);
          return acc;
        }, {} as Record<string, boolean>),
      };
    });

    return { permissions: allPerms, roles: allRoles, matrix };
  }

  async updateRolePermissions(roleId: string, permissionIds: string[]) {
    invalidateMasterPermissionsCache();
    return this.updateRole(roleId, {}, permissionIds);
  }

  async getUserPermissionOverrides(userId: string) {
    return userPermissionOverridesTable.filter((override) => override.userId === userId);
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
      createdBy?: string;
    }
  ) {
    const index = userPermissionOverridesTable.findIndex(
      (o) => o.userId === userId && o.permissionId === permissionId
    );

    const allPerms = await this.getMasterPermissions();
    const targetPerm = allPerms.find((p) => p.id === permissionId || p.code === permissionId);
    const permId = targetPerm ? targetPerm.id : permissionId;
    const permCode = targetPerm ? targetPerm.code : permissionId;

    if (index !== -1) {
      userPermissionOverridesTable[index] = {
        ...userPermissionOverridesTable[index],
        permissionId: permId,
        permissionCode: permCode,
        granted,
        startDate: overrideData?.startDate ?? userPermissionOverridesTable[index].startDate,
        endDate: overrideData?.endDate ?? userPermissionOverridesTable[index].endDate,
        expiresAt: overrideData?.expiresAt ?? userPermissionOverridesTable[index].expiresAt,
        reason: overrideData?.reason ?? userPermissionOverridesTable[index].reason,
        createdBy: overrideData?.createdBy ?? userPermissionOverridesTable[index].createdBy,
      };
      return userPermissionOverridesTable[index];
    } else {
      const newOverride: DbUserPermissionOverride = {
        id: `override-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId,
        permissionId: permId,
        permissionCode: permCode,
        granted,
        startDate: overrideData?.startDate,
        endDate: overrideData?.endDate,
        expiresAt: overrideData?.expiresAt,
        reason: overrideData?.reason || 'Admin permission override adjustment',
        createdBy: overrideData?.createdBy || 'system',
        createdAt: new Date().toISOString(),
      };
      userPermissionOverridesTable.push(newOverride);
      return newOverride;
    }
  }

  async deleteUserPermissionOverride(userId: string, permissionId: string) {
    const index = userPermissionOverridesTable.findIndex(
      (o) => o.userId === userId && (o.permissionId === permissionId || o.permissionCode === permissionId)
    );
    if (index !== -1) {
      userPermissionOverridesTable.splice(index, 1);
      return true;
    }
    return false;
  }

  async copyUserPermissions(sourceId: string, targetUserId: string, isSourceRole: boolean = false) {
    const now = new Date().toISOString();
    if (isSourceRole) {
      // Copy role permissions to target user as overrides
      const rolePerms = await db.select().from(rolePermissions).where(eq(rolePermissions.roleId, sourceId));
      for (const rp of rolePerms) {
        await this.setUserPermissionOverride(targetUserId, rp.permissionId, true, {
          reason: `Copied permissions from Role ID ${sourceId}`,
          createdBy: 'system',
        });
      }
    } else {
      // Copy overrides from source user to target user
      const sourceOverrides = await this.getUserPermissionOverrides(sourceId);
      for (const ov of sourceOverrides) {
        await this.setUserPermissionOverride(targetUserId, ov.permissionId, ov.granted, {
          startDate: ov.startDate,
          endDate: ov.endDate,
          expiresAt: ov.expiresAt,
          reason: `Copied from User ID ${sourceId}: ${ov.reason || ''}`,
          createdBy: 'system',
        });
      }
    }
    return this.getUserPermissionOverrides(targetUserId);
  }

  async getUserEffectivePermissions(userId: string, roleId: string, knownRoleCode?: string): Promise<string[]> {
    const roleObj = await this.getRoleById(roleId);
    const roleCode = knownRoleCode || roleObj?.code;
    const actualRoleId = roleObj?.id || roleId;

    const allPerms = await this.getMasterPermissions();
    const permCodeMap = new Map<string, string>();
    allPerms.forEach((p) => permCodeMap.set(p.id, p.code));

    const effectiveSet = new Set<string>();

    if (roleCode === 'ADMIN' || roleCode === 'SUPER_ADMIN') {
      allPerms.forEach((p) => effectiveSet.add(p.code));
    } else {
      const allRolePerms = await db.select().from(rolePermissions).where(eq(rolePermissions.roleId, actualRoleId));
      allRolePerms.forEach((rp) => {
        const code = permCodeMap.get(rp.permissionId);
        if (code) effectiveSet.add(code);
      });
    }

    const now = new Date().toISOString();
    const userOverrides = await this.getUserPermissionOverrides(userId);

    for (const override of userOverrides) {
      if (override.startDate && now < override.startDate) continue;
      const expiration = override.endDate || override.expiresAt;
      if (expiration && now > expiration) continue;

      const code = override.permissionCode || permCodeMap.get(override.permissionId);
      if (!code) continue;

      if (override.granted) {
        effectiveSet.add(code);
      } else {
        effectiveSet.delete(code);
      }
    }

    return Array.from(effectiveSet);
  }

  // --- Module Registry ---
  async getModules() {
    return modulesTable.slice().sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async updateModule(id: string, updates: Partial<DbModule>): Promise<DbModule> {
    const index = modulesTable.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Module not found');

    const updated = {
      ...modulesTable[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    modulesTable[index] = updated;
    return updated;
  }

  // --- Organization Settings ---
  async getOrgSettings() {
    await ensureMasterSeeded();
    const compRows = await db.select().from(companies);
    const branchRows = await db.select().from(branches);
    const deptRows = await db.select().from(departments);
    const desigRows = await db.select().from(designations);
    const catRows = await db.select().from(materialCategories);
    const unitRows = await db.select().from(materialUnits);

    return {
      settings: orgSettingsTable,
      companies: compRows,
      branches: branchRows,
      departments: deptRows,
      designations: desigRows,
      materialCategories: catRows,
      materialUnits: unitRows,
    };
  }

  async updateOrgSetting(key: string, value: string): Promise<DbOrgSetting> {
    const index = orgSettingsTable.findIndex((s) => s.key === key);
    if (index !== -1) {
      orgSettingsTable[index].value = value;
      orgSettingsTable[index].updatedAt = new Date().toISOString();
      return orgSettingsTable[index];
    } else {
      const newSetting: DbOrgSetting = {
        id: `stg-${Date.now()}`,
        key,
        value,
        group: 'GENERAL',
        updatedAt: new Date().toISOString(),
      };
      orgSettingsTable.push(newSetting);
      return newSetting;
    }
  }

  // --- Audit Logs ---
  async getAuditLogs(params: PaginationParams) {
    const rows = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
    return paginateArray(rows, params, ['action', 'module', 'details', 'userEmail', 'ipAddress']);
  }

  async logAuditAction(log: Omit<DbAuditLog, 'id' | 'createdAt'>): Promise<DbAuditLog> {
    const newLog: DbAuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    await db.insert(auditLogs).values({
      id: newLog.id,
      userId: newLog.userId ?? null,
      userEmail: newLog.userEmail ?? null,
      userRole: newLog.userRole ?? null,
      action: newLog.action,
      module: newLog.module,
      details: newLog.details,
      ipAddress: newLog.ipAddress ?? null,
      userAgent: newLog.userAgent ?? null,
      createdAt: newLog.createdAt,
    });
    return newLog;
  }
}

export const adminRepository = new AdminRepository();
