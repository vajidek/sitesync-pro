import { userRepository } from '../repositories/user.repository';
import { roleRepository } from '../repositories/role.repository';
import { adminRepository } from '../repositories/admin.repository';
import { auditRepository } from '../repositories/audit.repository';
import { hashPassword } from '../utils/hash';
import { authCache } from '../utils/authCache';
import { AuthenticatedUser } from '../types/auth';
import { UserRole } from '../../types';

export class UserService {
  async getUserDetails(userId: string, prefetchedUser?: AuthenticatedUser) {
    if (prefetchedUser && prefetchedUser.id === userId) {
      const cached = authCache.get(userId);
      return {
        id: prefetchedUser.id,
        email: prefetchedUser.email,
        name: prefetchedUser.name,
        phone: prefetchedUser.phone || '',
        department: prefetchedUser.department || '',
        avatarUrl: prefetchedUser.avatarUrl,
        role: prefetchedUser.role,
        roleName: prefetchedUser.roleName || (prefetchedUser.role as string),
        assignedProjectId: prefetchedUser.assignedProjectId,
        assignedProjectName: prefetchedUser.assignedProjectName,
        isActive: cached ? cached.isActive : true,
        isEmailVerified: cached ? (cached.isEmailVerified ?? true) : true,
        lastLoginAt: cached ? cached.lastLoginAt : undefined,
        createdAt: cached ? cached.createdAt : undefined,
        permissions: prefetchedUser.permissions,
      };
    }

    const authCtx = authCache.get(userId) || (await userRepository.getAuthContext(userId));
    if (!authCtx) {
      throw new Error('User account not found.');
    }

    return {
      id: authCtx.id,
      email: authCtx.email,
      name: authCtx.name,
      phone: authCtx.phone,
      department: authCtx.department,
      avatarUrl: authCtx.avatarUrl,
      role: authCtx.role,
      roleName: authCtx.roleName || 'Worker',
      assignedProjectId: authCtx.assignedProjectId,
      assignedProjectName: authCtx.assignedProjectName,
      isActive: authCtx.isActive,
      isEmailVerified: authCtx.isEmailVerified ?? true,
      lastLoginAt: authCtx.lastLoginAt,
      createdAt: authCtx.createdAt,
      permissions: authCtx.permissions,
    };
  }

  async getAllUsers() {
    const users = await userRepository.findAll();
    const roles = await roleRepository.findAll();
    const allPerms = await adminRepository.getMasterPermissions();
    const allRolePerms = await adminRepository.getAllRolePermissions();
    const userOverrides = await adminRepository.getAllUserPermissionOverrides();

    const roleMap = new Map(roles.map((r) => [r.id, r]));
    const permCodeMap = new Map(allPerms.map((p) => [p.id, p.code]));

    const rolePermMap = new Map<string, Set<string>>();
    for (const rp of allRolePerms) {
      let set = rolePermMap.get(rp.roleId);
      if (!set) {
        set = new Set<string>();
        rolePermMap.set(rp.roleId, set);
      }
      const code = permCodeMap.get(rp.permissionId);
      if (code) set.add(code);
    }

    const overrideMap = new Map<string, typeof userOverrides>();
    for (const ov of userOverrides) {
      let list = overrideMap.get(ov.userId);
      if (!list) {
        list = [];
        overrideMap.set(ov.userId, list);
      }
      list.push(ov);
    }

    const now = new Date().toISOString();

    return users.map((u) => {
      const role = roleMap.get(u.roleId);
      const roleCode = role ? role.code : ('WORKER' as UserRole);

      const effectiveSet = new Set<string>();
      if (roleCode === 'ADMIN' || (roleCode as string) === 'SUPER_ADMIN') {
        allPerms.forEach((p) => effectiveSet.add(p.code));
      } else {
        const rolePerms = rolePermMap.get(u.roleId);
        if (rolePerms) {
          rolePerms.forEach((code) => effectiveSet.add(code));
        }
      }

      const overrides = overrideMap.get(u.id) || [];
      for (const override of overrides) {
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

      return {
        id: u.id,
        email: u.email,
        name: u.name,
        phone: u.phone,
        department: u.department,
        avatarUrl: u.avatarUrl,
        role: roleCode,
        roleName: role ? role.name : 'Worker',
        assignedProjectId: u.assignedProjectId,
        assignedProjectName: u.assignedProjectName,
        isActive: u.isActive,
        createdAt: u.createdAt,
        permissions: Array.from(effectiveSet),
      };
    });
  }

  async createUser(data: {
    email: string;
    name: string;
    password: string;
    roleCode: UserRole;
    department: string;
    phone: string;
    assignedProjectId?: string;
    assignedProjectName?: string;
  }, actorEmail?: string) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new Error('A user with this email address already exists.');
    }

    const role = await roleRepository.findByCode(data.roleCode);
    if (!role) {
      throw new Error(`Role ${data.roleCode} does not exist.`);
    }

    const passwordHash = await hashPassword(data.password);

    const newUser = await userRepository.create({
      email: data.email,
      username: data.email.split('@')[0],
      passwordHash,
      name: data.name,
      phone: data.phone,
      department: data.department,
      roleId: role.id,
      assignedProjectId: data.assignedProjectId,
      assignedProjectName: data.assignedProjectName,
      isActive: true,
      accountStatus: 'ACTIVE',
      isLocked: false,
      forcePasswordChange: false,
      rememberDevice: false,
      isEmailVerified: true,
      failedLoginAttempts: 0,
      createdBy: actorEmail || 'system',
    });

    await auditRepository.logAction({
      userEmail: actorEmail,
      action: 'USER_CREATED',
      module: 'UserManagement',
      details: `Created user ${newUser.name} (${newUser.email}) with role ${data.roleCode}`,
    });

    return this.getUserDetails(newUser.id);
  }

  async updateUser(
    userId: string,
    updates: {
      name?: string;
      department?: string;
      phone?: string;
      assignedProjectId?: string;
      assignedProjectName?: string;
      isActive?: boolean;
      roleCode?: UserRole;
    },
    actorEmail?: string
  ) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    let roleId = user.roleId;
    if (updates.roleCode) {
      const role = await roleRepository.findByCode(updates.roleCode);
      if (role) {
        roleId = role.id;
      }
    }

    const updated = await userRepository.update(userId, {
      name: updates.name ?? user.name,
      department: updates.department ?? user.department,
      phone: updates.phone ?? user.phone,
      assignedProjectId: updates.assignedProjectId ?? user.assignedProjectId,
      assignedProjectName: updates.assignedProjectName ?? user.assignedProjectName,
      isActive: updates.isActive ?? user.isActive,
      roleId,
      updatedBy: actorEmail,
    });

    authCache.invalidateUser(userId);

    await auditRepository.logAction({
      userEmail: actorEmail,
      action: 'USER_UPDATED',
      module: 'UserManagement',
      details: `Updated user profile for ${user.email}`,
    });

    return this.getUserDetails(updated!.id);
  }

  async deactivateUser(userId: string, actorEmail?: string) {
    const result = await userRepository.delete(userId);
    if (result) {
      authCache.invalidateUser(userId);
      await auditRepository.logAction({
        userEmail: actorEmail,
        action: 'USER_DEACTIVATED',
        module: 'UserManagement',
        details: `Deactivated user ID ${userId}`,
      });
    }
    return result;
  }
}

export const userService = new UserService();
