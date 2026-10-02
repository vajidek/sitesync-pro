import { db } from '../../db';
import { roles, permissions, rolePermissions, users } from '../../db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { UserRole } from '../../types';
import bcrypt from 'bcryptjs';

export interface DbRole {
  id: string;
  code: UserRole;
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

let seedDone = false;

export async function ensureAuthSeeded() {
  if (seedDone) return;
  try {
    const existingRoles = await db.select().from(roles).limit(1);
    if (existingRoles.length === 0) {
      console.log('Seeding initial Roles, Permissions, RolePermissions to PostgreSQL...');
      
      const defaultRoles = [
        { id: 'role-uuid-001', code: 'ADMIN', name: 'System Administrator', description: 'Full root level operational & system administration privileges across all construction sites.', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'role-uuid-002', code: 'MANAGER', name: 'Project Manager', description: 'Executive project planning, budget approval, site oversight, & resource allocation.', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'role-uuid-003', code: 'INCHARGE', name: 'Site Incharge', description: 'On-site execution lead, daily log approval, material requisition, & work safety manager.', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'role-uuid-004', code: 'SUPERVISOR', name: 'Field Supervisor', description: 'Direct team crew lead, task assignment, quality inspection, & shift activity reporting.', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'role-uuid-005', code: 'STORE_KEEPER', name: 'Store Keeper', description: 'Warehouse inventory control, material issue/return logs, stock threshold management.', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'role-uuid-006', code: 'DRIVER', name: 'Logistics Driver', description: 'Heavy vehicle transport, material dispatch logging, fuel tracking, & site logistics.', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'role-uuid-007', code: 'OPERATOR', name: 'Machinery Operator', description: 'Heavy plant equipment operation (Cranes, Excavators), hour logs, & maintenance alerts.', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'role-uuid-008', code: 'WORKER', name: 'Site Tradesperson / Technician', description: 'Field task execution (Piping, Welding, Electrical, Structural), personal hours logging.', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
      await db.insert(roles).values(defaultRoles).onConflictDoNothing();

      const defaultPermissions = [
        { id: 'perm-001', code: 'users:manage', name: 'Manage Users', module: 'Identity', description: 'Create, update, deactivate users and assign roles', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'perm-002', code: 'projects:manage', name: 'Manage Projects', module: 'Projects', description: 'Create and modify project scopes, budgets, schedules', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'perm-003', code: 'requisitions:approve', name: 'Approve Requisitions', module: 'Procurement', description: 'Approve or reject inventory requisitions and purchase orders', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'perm-004', code: 'inventory:manage', name: 'Manage Inventory', module: 'Store', description: 'Issue stock, restock inventory, track warehouse locations', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'perm-005', code: 'machinery:operate', name: 'Operate Machinery', module: 'Plant', description: 'Log working hours, fuel usage, and breakdown reports for heavy plant', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'perm-006', code: 'work:log', name: 'Log Daily Work', module: 'Operations', description: 'Submit shift work logs, safety notes, and task progress', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'perm-007', code: 'schema:view', name: 'View ERP Schema', module: 'System', description: 'Access backend PostgreSQL and Prisma schema inspector', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'perm-008', code: 'audit:view', name: 'View Audit Logs', module: 'Security', description: 'Access enterprise security audit trails', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
      await db.insert(permissions).values(defaultPermissions).onConflictDoNothing();

      const defaultRolePermissions = [
        { id: 'rp-101', roleId: 'role-uuid-001', permissionId: 'perm-001', createdAt: new Date().toISOString() },
        { id: 'rp-102', roleId: 'role-uuid-001', permissionId: 'perm-002', createdAt: new Date().toISOString() },
        { id: 'rp-103', roleId: 'role-uuid-001', permissionId: 'perm-003', createdAt: new Date().toISOString() },
        { id: 'rp-104', roleId: 'role-uuid-001', permissionId: 'perm-004', createdAt: new Date().toISOString() },
        { id: 'rp-105', roleId: 'role-uuid-001', permissionId: 'perm-005', createdAt: new Date().toISOString() },
        { id: 'rp-106', roleId: 'role-uuid-001', permissionId: 'perm-006', createdAt: new Date().toISOString() },
        { id: 'rp-107', roleId: 'role-uuid-001', permissionId: 'perm-007', createdAt: new Date().toISOString() },
        { id: 'rp-108', roleId: 'role-uuid-001', permissionId: 'perm-008', createdAt: new Date().toISOString() },
        { id: 'rp-201', roleId: 'role-uuid-002', permissionId: 'perm-002', createdAt: new Date().toISOString() },
        { id: 'rp-202', roleId: 'role-uuid-002', permissionId: 'perm-003', createdAt: new Date().toISOString() },
        { id: 'rp-203', roleId: 'role-uuid-002', permissionId: 'perm-004', createdAt: new Date().toISOString() },
        { id: 'rp-204', roleId: 'role-uuid-002', permissionId: 'perm-006', createdAt: new Date().toISOString() },
        { id: 'rp-205', roleId: 'role-uuid-002', permissionId: 'perm-007', createdAt: new Date().toISOString() },
        { id: 'rp-206', roleId: 'role-uuid-002', permissionId: 'perm-008', createdAt: new Date().toISOString() },
      ];
      await db.insert(rolePermissions).values(defaultRolePermissions).onConflictDoNothing();
    }

    const defaultHash = bcrypt.hashSync('Password123!', 10);
    const defaultUsers = [
      { id: 'usr-admin-001', email: 'admin@sitesyncpro.com', passwordHash: defaultHash, name: 'Abdul Vajid EK', phone: '+971 50 123 4567', department: 'System Architecture & Operations', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80', roleId: 'role-uuid-001', employeeId: 'emp-001', assignedProjectId: 'PRJ-101', assignedProjectName: 'Al Reem Mechanical Piping & Structural Hub', isActive: true, isEmailVerified: true, failedLoginAttempts: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'usr-mgr-002', email: 'manager@sitesyncpro.com', passwordHash: defaultHash, name: 'Sarah Al-Mansoor', phone: '+971 52 987 6543', department: 'Project Management & Planning', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80', roleId: 'role-uuid-002', employeeId: 'emp-002', assignedProjectId: 'PRJ-101', assignedProjectName: 'Al Reem Mechanical Piping & Structural Hub', isActive: true, isEmailVerified: true, failedLoginAttempts: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'usr-inc-003', email: 'incharge@sitesyncpro.com', passwordHash: defaultHash, name: 'Tariq Al-Farsi', phone: '+971 55 444 3322', department: 'Civil & Mechanical Engineering', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80', roleId: 'role-uuid-003', employeeId: 'emp-003', assignedProjectId: 'PRJ-101', assignedProjectName: 'Al Reem Mechanical Piping & Structural Hub', isActive: true, isEmailVerified: true, failedLoginAttempts: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'usr-sup-004', email: 'supervisor@sitesyncpro.com', passwordHash: defaultHash, name: 'Hassan Al-Saeed', phone: '+971 50 333 2211', department: 'Field Supervision & Operations', roleId: 'role-uuid-004', employeeId: 'emp-004', assignedProjectId: 'PRJ-101', assignedProjectName: 'Al Reem Mechanical Piping & Structural Hub', isActive: true, isEmailVerified: true, failedLoginAttempts: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'usr-str-005', email: 'store@sitesyncpro.com', passwordHash: defaultHash, name: 'Ramesh Patel', phone: '+971 54 888 7766', department: 'Central Store & Logistics', roleId: 'role-uuid-005', employeeId: 'emp-005', assignedProjectId: 'PRJ-101', assignedProjectName: 'Al Reem Mechanical Piping & Structural Hub', isActive: true, isEmailVerified: true, failedLoginAttempts: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'usr-drv-006', email: 'driver@sitesyncpro.com', passwordHash: defaultHash, name: 'Suresh Kumar', phone: '+971 55 666 5544', department: 'Logistics & Fleet Operations', roleId: 'role-uuid-006', employeeId: 'emp-006', assignedProjectId: 'PRJ-101', assignedProjectName: 'Al Reem Mechanical Piping & Structural Hub', isActive: true, isEmailVerified: true, failedLoginAttempts: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'usr-opr-007', email: 'operator@sitesyncpro.com', passwordHash: defaultHash, name: 'Vikram Singh', phone: '+971 52 777 4455', department: 'Heavy Plant Operations', roleId: 'role-uuid-007', employeeId: 'emp-007', assignedProjectId: 'PRJ-101', assignedProjectName: 'Al Reem Mechanical Piping & Structural Hub', isActive: true, isEmailVerified: true, failedLoginAttempts: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'usr-wrk-008', email: 'worker@sitesyncpro.com', passwordHash: defaultHash, name: 'Ali Ahmed', phone: '+971 50 999 8877', department: 'Field Construction Crew', roleId: 'role-uuid-008', employeeId: 'emp-008', assignedProjectId: 'PRJ-101', assignedProjectName: 'Al Reem Mechanical Piping & Structural Hub', isActive: true, isEmailVerified: true, failedLoginAttempts: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];
    await db.insert(users).values(defaultUsers).onConflictDoNothing();

    seedDone = true;
  } catch (err) {
    console.error('Error auto-seeding auth tables:', err);
  }
}

export class RoleRepository {
  async findAll(): Promise<DbRole[]> {
    await ensureAuthSeeded();
    const rows = await db.select().from(roles).where(eq(roles.isActive, true));
    return rows.map((r) => ({
      id: r.id,
      code: r.code as UserRole,
      name: r.name,
      description: r.description,
      isActive: r.isActive,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async findById(id: string): Promise<DbRole | null> {
    await ensureAuthSeeded();
    const [row] = await db.select().from(roles).where(eq(roles.id, id));
    if (!row) return null;
    return {
      id: row.id,
      code: row.code as UserRole,
      name: row.name,
      description: row.description,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findByCode(code: UserRole): Promise<DbRole | null> {
    await ensureAuthSeeded();
    const [row] = await db.select().from(roles).where(eq(roles.code, code));
    if (!row) return null;
    return {
      id: row.id,
      code: row.code as UserRole,
      name: row.name,
      description: row.description,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async getRolePermissions(roleId: string): Promise<DbPermission[]> {
    await ensureAuthSeeded();
    const rpList = await db.select().from(rolePermissions).where(eq(rolePermissions.roleId, roleId));
    if (rpList.length === 0) return [];
    const permIds = rpList.map((rp) => rp.permissionId);
    const permList = await db
      .select()
      .from(permissions)
      .where(and(inArray(permissions.id, permIds), eq(permissions.isActive, true)));
    return permList.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      module: p.module,
      description: p.description,
      isActive: p.isActive,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  async getRolePermissionCodes(roleId: string): Promise<string[]> {
    const perms = await this.getRolePermissions(roleId);
    return perms.map((p) => p.code);
  }
}

export const roleRepository = new RoleRepository();
