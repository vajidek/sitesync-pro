import { db } from '../../db';
import { users, roles, loginHistory } from '../../db/schema';
import { eq, or, desc } from 'drizzle-orm';
import { roleRepository, ensureAuthSeeded } from './role.repository';
import { adminRepository } from './admin.repository';
import { AuthContext } from '../utils/authCache';
import { UserRole } from '../../types';

export interface DbUser {
  id: string;
  uid?: string;
  username?: string;
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
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'SUSPENDED' | 'DELETED';
  isEmailVerified: boolean;
  lastLoginAt?: string;
  lastLogoutAt?: string;
  passwordLastChangedAt?: string;
  failedLoginAttempts: number;
  isLocked: boolean;
  lockedUntil?: string;
  lockedAt?: string;
  forcePasswordChange: boolean;
  rememberDevice: boolean;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbLoginHistory {
  id: string;
  userId: string;
  username: string;
  userEmail?: string;
  loginDate: string;
  loginTime: string;
  logoutTime?: string;
  sessionDuration?: number;
  browser?: string;
  device?: string;
  ipAddress?: string;
  status: 'SUCCESS' | 'FAILED' | 'LOCKED';
  failureReason?: string;
  createdAt: string;
}

function mapUserRow(row: any): DbUser {
  const derivedUsername = row.email ? row.email.split('@')[0] : row.id;
  return {
    id: row.id,
    uid: row.uid ?? undefined,
    username: derivedUsername,
    email: row.email,
    passwordHash: row.passwordHash,
    name: row.name,
    phone: row.phone,
    department: row.department,
    avatarUrl: row.avatarUrl ?? undefined,
    roleId: row.roleId,
    employeeId: row.employeeId ?? undefined,
    assignedProjectId: row.assignedProjectId ?? undefined,
    assignedProjectName: row.assignedProjectName ?? undefined,
    isActive: row.isActive ?? true,
    accountStatus: (row.isActive ?? true) ? 'ACTIVE' : 'INACTIVE',
    isEmailVerified: row.isEmailVerified ?? true,
    lastLoginAt: row.lastLoginAt ?? undefined,
    failedLoginAttempts: row.failedLoginAttempts ?? 0,
    isLocked: row.lockedUntil ? new Date(row.lockedUntil) > new Date() : false,
    lockedUntil: row.lockedUntil ?? undefined,
    forcePasswordChange: false,
    rememberDevice: false,
    createdBy: row.createdBy ?? undefined,
    updatedBy: row.updatedBy ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class UserRepository {
  async findByUsernameOrEmail(identifier: string): Promise<DbUser | null> {
    await ensureAuthSeeded();
    if (!identifier) return null;
    const normalized = identifier.toLowerCase().trim();
    const normalizedClean = normalized.replace(/[^a-z0-9]/g, '');

    const allUsers = await db.select().from(users);
    
    // 1. Direct attribute match (email, username prefix, id, employeeId)
    let userRow = allUsers.find((u) => {
      const emailPrefix = u.email ? u.email.toLowerCase().split('@')[0] : '';
      return (
        u.email.toLowerCase() === normalized ||
        emailPrefix === normalized ||
        emailPrefix.replace(/[^a-z0-9]/g, '') === normalizedClean ||
        u.id.toLowerCase() === normalized ||
        (u.employeeId && u.employeeId.toLowerCase() === normalized)
      );
    });

    // 2. Fallback: match by Role Code (e.g. ADMIN, MANAGER, INCHARGE, SUPERVISOR, STORE_KEEPER, DRIVER, WORKER)
    if (!userRow) {
      const allRoles = await roleRepository.findAll();
      const matchedRole = allRoles.find(
        (r) =>
          r.code.toLowerCase() === normalized ||
          r.code.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedClean ||
          r.name.toLowerCase().includes(normalized)
      );

      if (matchedRole) {
        userRow = allUsers.find((u) => u.roleId === matchedRole.id && u.isActive);
      }
    }

    return userRow ? mapUserRow(userRow) : null;
  }

  async findByEmail(email: string): Promise<DbUser | null> {
    return this.findByUsernameOrEmail(email);
  }

  async findById(id: string): Promise<DbUser | null> {
    await ensureAuthSeeded();
    const [row] = await db.select().from(users).where(eq(users.id, id));
    return row ? mapUserRow(row) : null;
  }

  async getAuthContext(id: string): Promise<AuthContext | null> {
    await ensureAuthSeeded();
    const [row] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        department: users.department,
        avatarUrl: users.avatarUrl,
        roleId: users.roleId,
        assignedProjectId: users.assignedProjectId,
        assignedProjectName: users.assignedProjectName,
        isActive: users.isActive,
        isEmailVerified: users.isEmailVerified,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        lockedUntil: users.lockedUntil,
        roleCode: roles.code,
        roleName: roles.name,
        roleIsActive: roles.isActive,
      })
      .from(users)
      .leftJoin(roles, or(eq(users.roleId, roles.id), eq(users.roleId, roles.code)))
      .where(eq(users.id, id));

    if (!row) return null;

    const isLocked = row.lockedUntil ? new Date(row.lockedUntil) > new Date() : false;
    const roleCode = (row.roleCode || 'WORKER') as UserRole;
    const permissions = await adminRepository.getUserEffectivePermissions(row.id, row.roleId, roleCode);

    const isUserActive = row.isActive !== false;
    const isRoleActive = row.roleIsActive === undefined || row.roleIsActive === null || row.roleIsActive !== false;

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: roleCode,
      roleId: row.roleId,
      roleName: row.roleName || 'Worker',
      department: row.department,
      phone: row.phone,
      avatarUrl: row.avatarUrl ?? undefined,
      assignedProjectId: row.assignedProjectId ?? undefined,
      assignedProjectName: row.assignedProjectName ?? undefined,
      isActive: isUserActive && isRoleActive,
      isEmailVerified: row.isEmailVerified ?? true,
      lastLoginAt: row.lastLoginAt ?? undefined,
      createdAt: row.createdAt,
      accountStatus: isUserActive && !isLocked ? 'ACTIVE' : (isLocked ? 'LOCKED' : 'INACTIVE'),
      isLocked,
      permissions,
      cachedAt: Date.now(),
      expiresAt: Date.now() + 30000,
    };
  }

  async findAll(includeDeleted = false): Promise<DbUser[]> {
    await ensureAuthSeeded();
    const rows = await db.select().from(users);
    const mapped = rows.map(mapUserRow);
    if (!includeDeleted) {
      return mapped.filter((u) => u.accountStatus !== 'DELETED');
    }
    return mapped;
  }

  async create(userData: Omit<DbUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<DbUser> {
    await ensureAuthSeeded();
    const id = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();
    
    const newUserRecord = {
      id,
      username: userData.username || userData.email.split('@')[0],
      email: userData.email,
      passwordHash: userData.passwordHash,
      name: userData.name,
      phone: userData.phone,
      department: userData.department,
      avatarUrl: userData.avatarUrl ?? null,
      roleId: userData.roleId,
      employeeId: userData.employeeId ?? null,
      assignedProjectId: userData.assignedProjectId ?? null,
      assignedProjectName: userData.assignedProjectName ?? null,
      isActive: userData.isActive ?? true,
      accountStatus: userData.accountStatus ?? 'ACTIVE',
      isEmailVerified: userData.isEmailVerified ?? true,
      failedLoginAttempts: userData.failedLoginAttempts ?? 0,
      isLocked: userData.isLocked ?? false,
      lockedUntil: userData.lockedUntil ?? null,
      lockedAt: userData.lockedAt ?? null,
      forcePasswordChange: userData.forcePasswordChange ?? false,
      rememberDevice: userData.rememberDevice ?? false,
      createdBy: userData.createdBy ?? null,
      updatedBy: userData.updatedBy ?? null,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(users).values(newUserRecord);
    return mapUserRow(newUserRecord);
  }

  async update(id: string, updates: Partial<DbUser>): Promise<DbUser | null> {
    await ensureAuthSeeded();
    const existing = await this.findById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updatePayload: Record<string, any> = {
      updatedAt: now,
    };

    if (updates.username !== undefined) updatePayload.username = updates.username;
    if (updates.email !== undefined) updatePayload.email = updates.email;
    if (updates.passwordHash !== undefined) updatePayload.passwordHash = updates.passwordHash;
    if (updates.name !== undefined) updatePayload.name = updates.name;
    if (updates.phone !== undefined) updatePayload.phone = updates.phone;
    if (updates.department !== undefined) updatePayload.department = updates.department;
    if (updates.avatarUrl !== undefined) updatePayload.avatarUrl = updates.avatarUrl;
    if (updates.roleId !== undefined) updatePayload.roleId = updates.roleId;
    if (updates.employeeId !== undefined) updatePayload.employeeId = updates.employeeId;
    if (updates.assignedProjectId !== undefined) updatePayload.assignedProjectId = updates.assignedProjectId;
    if (updates.assignedProjectName !== undefined) updatePayload.assignedProjectName = updates.assignedProjectName;
    if (updates.isActive !== undefined) updatePayload.isActive = updates.isActive;
    if (updates.accountStatus !== undefined) updatePayload.accountStatus = updates.accountStatus;
    if (updates.isEmailVerified !== undefined) updatePayload.isEmailVerified = updates.isEmailVerified;
    if (updates.lastLoginAt !== undefined) updatePayload.lastLoginAt = updates.lastLoginAt;
    if (updates.lastLogoutAt !== undefined) updatePayload.lastLogoutAt = updates.lastLogoutAt;
    if (updates.passwordLastChangedAt !== undefined) updatePayload.passwordLastChangedAt = updates.passwordLastChangedAt;
    if (updates.failedLoginAttempts !== undefined) updatePayload.failedLoginAttempts = updates.failedLoginAttempts;
    if (updates.isLocked !== undefined) updatePayload.isLocked = updates.isLocked;
    if (updates.lockedUntil !== undefined) updatePayload.lockedUntil = updates.lockedUntil;
    if (updates.lockedAt !== undefined) updatePayload.lockedAt = updates.lockedAt;
    if (updates.forcePasswordChange !== undefined) updatePayload.forcePasswordChange = updates.forcePasswordChange;
    if (updates.rememberDevice !== undefined) updatePayload.rememberDevice = updates.rememberDevice;
    if (updates.updatedBy !== undefined) updatePayload.updatedBy = updates.updatedBy;
    if (updates.deletedAt !== undefined) updatePayload.deletedAt = updates.deletedAt;

    await db.update(users).set(updatePayload).where(eq(users.id, id));
    return this.findById(id);
  }

  async softDelete(id: string, actorEmail?: string): Promise<boolean> {
    await ensureAuthSeeded();
    const existing = await this.findById(id);
    if (!existing) return false;

    await db.update(users).set({
      isActive: false,
      updatedBy: actorEmail || null,
      updatedAt: new Date().toISOString()
    }).where(eq(users.id, id));
    return true;
  }

  async restore(id: string, actorEmail?: string): Promise<DbUser | null> {
    await ensureAuthSeeded();
    const existing = await this.findById(id);
    if (!existing) return null;

    await db.update(users).set({
      isActive: true,
      updatedBy: actorEmail || null,
      updatedAt: new Date().toISOString()
    }).where(eq(users.id, id));
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    return this.softDelete(id);
  }

  async recordLoginAttempt(data: Omit<DbLoginHistory, 'id' | 'createdAt'>): Promise<DbLoginHistory> {
    await ensureAuthSeeded();
    const id = `lh-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();
    const entry = {
      id,
      userId: data.userId,
      username: data.username,
      userEmail: data.userEmail ?? null,
      loginDate: data.loginDate,
      loginTime: data.loginTime,
      logoutTime: data.logoutTime ?? null,
      sessionDuration: data.sessionDuration ?? null,
      browser: data.browser ?? 'Browser',
      device: data.device ?? 'Desktop',
      ipAddress: data.ipAddress ?? '127.0.0.1',
      status: data.status,
      failureReason: data.failureReason ?? null,
      createdAt: now,
    };
    await db.insert(loginHistory).values(entry);
    return entry;
  }

  async getLoginHistory(userId?: string, limit = 50): Promise<DbLoginHistory[]> {
    await ensureAuthSeeded();
    const all = await db.select().from(loginHistory).orderBy(desc(loginHistory.createdAt)).limit(limit);
    if (userId) {
      return all.filter((l) => l.userId === userId) as DbLoginHistory[];
    }
    return all as DbLoginHistory[];
  }

  async getUserPermissions(roleId: string): Promise<string[]> {
    return roleRepository.getRolePermissionCodes(roleId);
  }
}

export const userRepository = new UserRepository();
