import { db } from '../../db';
import {
  companies,
  branches,
  departments,
  designations,
  employees,
  projects,
  sites,
  contractors,
  vendors,
  customers,
  equipments,
  vehicles,
  materialCategories,
  materialUnits,
  materials,
  warehouses,
  stocks,
  documents,
} from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { paginateArray, PaginationParams } from '../utils/pagination';
import { isDemoSeedAllowed } from '../config/env';

export interface DbCompany {
  id: string;
  code: string;
  name: string;
  taxId?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  logoUrl?: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbBranch {
  id: string;
  code: string;
  name: string;
  companyId: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbDepartment {
  id: string;
  code: string;
  name: string;
  branchId?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbDesignation {
  id: string;
  code: string;
  name: string;
  departmentId?: string;
  gradeLevel?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbEmployee {
  id: string;
  employeeCode: string;
  name: string;
  photoUrl?: string;
  phone: string;
  email: string;
  address?: string;
  emergencyContact?: string;
  dateOfJoining: string;
  departmentId?: string;
  designationId?: string;
  reportingManagerId?: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'PROBATION' | 'TERMINATED';
  baseSalary: number;
  hourlyRate: number;
  passportNumber?: string;
  nationalId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbProject {
  id: string;
  projectCode: string;
  projectName: string;
  companyId?: string;
  customerId?: string;
  customerName?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  startDate: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  budget: number;
  actualSpent?: number;
  progressPercentage?: number;
  projectManagerId?: string;
  projectInchargeId?: string;
  projectSupervisorId?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbSite {
  id: string;
  siteCode: string;
  siteName: string;
  projectId: string;
  address: string;
  latitude?: number;
  longitude?: number;
  googleMapUrl?: string;
  siteEngineerId?: string;
  supervisorId?: string;
  inchargeId?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED';
  progressPercentage?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbContractor {
  id: string;
  code: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  tradeLicense?: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbVendor {
  id: string;
  code: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  rating: number;
  paymentTerms?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbCustomer {
  id: string;
  code: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  creditLimit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbMaterialCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbMaterialUnit {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbMaterial {
  id: string;
  itemCode: string;
  name: string;
  categoryId: string;
  subCategory?: string;
  specification?: string;
  brand?: string;
  model?: string;
  manufacturer?: string;
  unitId: string;
  hsnCode?: string;
  gstPercentage?: number;
  barcode?: string;
  qrCode?: string;
  imageUrl?: string;
  description?: string;
  minStock: number;
  maxStock: number;
  reorderLevel: number;
  openingStock: number;
  currentStock: number;
  reservedStock: number;
  unitPrice: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbWarehouse {
  id: string;
  code: string;
  name: string;
  type: string;
  location: string;
  siteId?: string;
  managerId?: string;
  managerName?: string;
  capacity?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbStock {
  id: string;
  warehouseId: string;
  materialId: string;
  quantity: number;
  reservedQuantity: number;
  batchNumber?: string;
  rackLocation?: string;
  updatedAt: string;
}

export interface DbEquipment {
  id: string;
  code: string;
  name: string;
  type: string;
  serialNumber?: string;
  modelNumber?: string;
  status: string;
  hourlyCost: number;
  currentProjectId?: string;
  siteId?: string;
  operatorId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbVehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  fuelType: string;
  currentOdometer: number;
  insurancePolicy?: string;
  insuranceExpiry?: string;
  rcNumber?: string;
  fitnessExpiry?: string;
  assignedDriverId?: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbDocument {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  entityType: 'PROJECT' | 'SITE' | 'WORK_ORDER' | 'EMPLOYEE' | 'EQUIPMENT' | 'VEHICLE' | 'VENDOR';
  entityId: string;
  uploadedById?: string;
  notes?: string;
  createdAt: string;
}

function mapCompanyRow(row: any): DbCompany {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    taxId: row.taxId ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    website: row.website ?? undefined,
    address: row.address ?? undefined,
    logoUrl: row.logoUrl ?? undefined,
    currency: row.currency ?? 'USD',
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapBranchRow(row: any): DbBranch {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    companyId: row.companyId,
    address: row.address ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapDepartmentRow(row: any): DbDepartment {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    branchId: row.branchId ?? undefined,
    description: row.description ?? undefined,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapDesignationRow(row: any): DbDesignation {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    departmentId: row.departmentId ?? undefined,
    gradeLevel: row.gradeLevel ?? undefined,
    description: row.description ?? undefined,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapEmployeeRow(row: any): DbEmployee {
  return {
    id: row.id,
    employeeCode: row.employeeCode,
    name: row.name,
    photoUrl: row.photoUrl ?? undefined,
    phone: row.phone,
    email: row.email,
    address: row.address ?? undefined,
    emergencyContact: row.emergencyContact ?? undefined,
    dateOfJoining: row.dateOfJoining,
    departmentId: row.departmentId ?? undefined,
    designationId: row.designationId ?? undefined,
    reportingManagerId: row.reportingManagerId ?? undefined,
    status: row.status as any,
    baseSalary: Number(row.baseSalary ?? 0),
    hourlyRate: Number(row.hourlyRate ?? 0),
    passportNumber: row.passportNumber ?? undefined,
    nationalId: row.nationalId ?? undefined,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

let isMasterSeeded = false;

export async function ensureMasterSeeded() {
  if (isMasterSeeded) return;

  try {
    const existingCompanies = await db.select().from(companies);
    if (existingCompanies.length === 0) {
      const defaultCompanies = [
        { id: 'cmp-101', code: 'CMP-AE-01', name: 'SiteSync Infrastructure Contracting LLC', taxId: 'TAX-99887766', email: 'info@sitesyncpro.com', phone: '+971 4 333 4455', website: 'https://sitesyncpro.com', address: 'Plot 402, Industrial Zone 3, Abu Dhabi, UAE', currency: 'AED', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
      for (const comp of defaultCompanies) {
        await db.insert(companies).values(comp).onConflictDoNothing();
      }
    }

    const existingBranches = await db.select().from(branches);
    if (existingBranches.length === 0) {
      const defaultBranches = [
        { id: 'brn-101', code: 'BRN-AUH', name: 'Abu Dhabi Main Branch', companyId: 'cmp-101', phone: '+971 2 666 7788', email: 'abudhabi@sitesyncpro.com', address: 'Mussafah Industrial City, Sector 12, Abu Dhabi', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'brn-102', code: 'BRN-DXB', name: 'Dubai Regional Office', companyId: 'cmp-101', phone: '+971 4 888 9900', email: 'dubai@sitesyncpro.com', address: 'Jebel Ali Free Zone, South 2, Dubai', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
      for (const b of defaultBranches) {
        await db.insert(branches).values(b).onConflictDoNothing();
      }
    }

    const existingDepts = await db.select().from(departments);
    if (existingDepts.length === 0) {
      const defaultDepartments = [
        { id: 'dep-101', code: 'DEP-ENG', name: 'Mechanical & Piping Engineering', branchId: 'brn-101', description: 'Heavy piping fabrication, structural steel, and hydro-testing division', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'dep-102', code: 'DEP-OPS', name: 'Site Execution & Construction', branchId: 'brn-101', description: 'On-site execution, machinery operations, and field logistics', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'dep-103', code: 'DEP-SCM', name: 'Supply Chain & Inventory Store', branchId: 'brn-101', description: 'Warehouse management, material procurement, and stock control', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
      for (const d of defaultDepartments) {
        await db.insert(departments).values(d).onConflictDoNothing();
      }
    }

    const existingDesigs = await db.select().from(designations);
    if (existingDesigs.length === 0) {
      const defaultDesignations = [
        { id: 'dsg-101', code: 'DSG-PM', name: 'Project Manager', departmentId: 'dep-101', gradeLevel: 'M3', description: 'Lead project delivery and client communications', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'dsg-102', code: 'DSG-SE', name: 'Site Engineer', departmentId: 'dep-101', gradeLevel: 'E2', description: 'Field engineering, daily log review, technical quality', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'dsg-103', code: 'DSG-SK', name: 'Store Keeper', departmentId: 'dep-103', gradeLevel: 'S1', description: 'Warehouse operations & inventory tracking', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'dsg-104', code: 'DSG-OP', name: 'Crane/Plant Operator', departmentId: 'dep-102', gradeLevel: 'T2', description: 'Heavy plant machinery handling', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
      for (const des of defaultDesignations) {
        await db.insert(designations).values(des).onConflictDoNothing();
      }
    }

    const existingEmps = await db.select().from(employees);
    if (existingEmps.length === 0 && isDemoSeedAllowed()) {
      const defaultEmployees = [
        { id: 'emp-001', employeeCode: 'EMP-1001', name: 'Abdul Vajid EK', email: 'admin@sitesyncpro.com', phone: '+971 50 123 4567', dateOfJoining: '2023-01-15', status: 'ACTIVE', departmentId: 'dep-101', designationId: 'dsg-101', baseSalary: 25000, hourlyRate: 150, passportNumber: 'A98765432', nationalId: '784-1990-1234567-1', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'emp-002', employeeCode: 'EMP-1002', name: 'Sarah Al-Mansoor', email: 'manager@sitesyncpro.com', phone: '+971 52 987 6543', dateOfJoining: '2023-03-01', status: 'ACTIVE', departmentId: 'dep-101', designationId: 'dsg-101', baseSalary: 22000, hourlyRate: 135, passportNumber: 'B87654321', nationalId: '784-1992-7654321-2', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'emp-003', employeeCode: 'EMP-1003', name: 'Tariq Al-Farsi', email: 'incharge@sitesyncpro.com', phone: '+971 55 444 3322', dateOfJoining: '2023-05-10', status: 'ACTIVE', departmentId: 'dep-102', designationId: 'dsg-102', baseSalary: 18000, hourlyRate: 110, passportNumber: 'C76543210', nationalId: '784-1991-3322110-3', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'emp-004', employeeCode: 'EMP-1004', name: 'Ramesh Patel', email: 'store@sitesyncpro.com', phone: '+971 54 888 7766', dateOfJoining: '2023-06-20', status: 'ACTIVE', departmentId: 'dep-103', designationId: 'dsg-103', baseSalary: 9500, hourlyRate: 60, passportNumber: 'D65432109', nationalId: '784-1988-9988776-4', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'emp-005', employeeCode: 'EMP-1005', name: 'Vikram Singh', email: 'operator@sitesyncpro.com', phone: '+971 52 777 4455', dateOfJoining: '2023-08-01', status: 'ACTIVE', departmentId: 'dep-102', designationId: 'dsg-104', baseSalary: 8500, hourlyRate: 55, passportNumber: 'E54321098', nationalId: '784-1995-5544332-5', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
      for (const emp of defaultEmployees) {
        await db.insert(employees).values(emp).onConflictDoNothing();
      }
    }

    isMasterSeeded = true;
  } catch (err) {
    console.error('Master seed error:', err);
  }
}

export class MasterRepository {
  // --- Companies ---
  async getCompanies(params: PaginationParams) {
    await ensureMasterSeeded();
    const rows = await db.select().from(companies);
    const mapped = rows.map(mapCompanyRow);
    const activeOnly = mapped.filter((c) => c.isActive);
    return paginateArray(activeOnly, params, ['code', 'name', 'email', 'taxId']);
  }

  async getCompanyById(id: string): Promise<DbCompany | null> {
    await ensureMasterSeeded();
    const [row] = await db.select().from(companies).where(eq(companies.id, id));
    return row ? mapCompanyRow(row) : null;
  }

  async createCompany(data: Omit<DbCompany, 'id' | 'createdAt' | 'updatedAt'>): Promise<DbCompany> {
    await ensureMasterSeeded();
    const id = `cmp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();
    const newRecord = {
      id,
      code: data.code,
      name: data.name,
      taxId: data.taxId ?? null,
      email: data.email ?? null,
      phone: data.phone ?? null,
      website: data.website ?? null,
      address: data.address ?? null,
      logoUrl: data.logoUrl ?? null,
      currency: data.currency ?? 'USD',
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(companies).values(newRecord);
    return mapCompanyRow(newRecord);
  }

  async updateCompany(id: string, updates: Partial<DbCompany>): Promise<DbCompany | null> {
    await ensureMasterSeeded();
    const existing = await this.getCompanyById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const payload: Record<string, any> = { updatedAt: now };
    if (updates.code !== undefined) payload.code = updates.code;
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.taxId !== undefined) payload.taxId = updates.taxId;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.website !== undefined) payload.website = updates.website;
    if (updates.address !== undefined) payload.address = updates.address;
    if (updates.logoUrl !== undefined) payload.logoUrl = updates.logoUrl;
    if (updates.currency !== undefined) payload.currency = updates.currency;
    if (updates.isActive !== undefined) payload.isActive = updates.isActive;

    await db.update(companies).set(payload).where(eq(companies.id, id));
    return this.getCompanyById(id);
  }

  async deleteCompany(id: string): Promise<boolean> {
    await ensureMasterSeeded();
    const existing = await this.getCompanyById(id);
    if (!existing) return false;

    await db.update(companies).set({ isActive: false, updatedAt: new Date().toISOString() }).where(eq(companies.id, id));
    return true;
  }

  // --- Branches ---
  async getBranches(params: PaginationParams) {
    await ensureMasterSeeded();
    const rows = await db.select().from(branches);
    const mapped = rows.map(mapBranchRow);
    const activeOnly = mapped.filter((b) => b.isActive);
    return paginateArray(activeOnly, params, ['code', 'name', 'address', 'phone']);
  }

  async getBranchById(id: string): Promise<DbBranch | null> {
    await ensureMasterSeeded();
    const [row] = await db.select().from(branches).where(eq(branches.id, id));
    return row ? mapBranchRow(row) : null;
  }

  async createBranch(data: Omit<DbBranch, 'id' | 'createdAt' | 'updatedAt'>): Promise<DbBranch> {
    await ensureMasterSeeded();
    const id = `brn-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();
    const newRecord = {
      id,
      code: data.code,
      name: data.name,
      companyId: data.companyId,
      address: data.address ?? null,
      phone: data.phone ?? null,
      email: data.email ?? null,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(branches).values(newRecord);
    return mapBranchRow(newRecord);
  }

  async updateBranch(id: string, updates: Partial<DbBranch>): Promise<DbBranch | null> {
    await ensureMasterSeeded();
    const existing = await this.getBranchById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const payload: Record<string, any> = { updatedAt: now };
    if (updates.code !== undefined) payload.code = updates.code;
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.companyId !== undefined) payload.companyId = updates.companyId;
    if (updates.address !== undefined) payload.address = updates.address;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.isActive !== undefined) payload.isActive = updates.isActive;

    await db.update(branches).set(payload).where(eq(branches.id, id));
    return this.getBranchById(id);
  }

  async deleteBranch(id: string): Promise<boolean> {
    await ensureMasterSeeded();
    const existing = await this.getBranchById(id);
    if (!existing) return false;

    await db.update(branches).set({ isActive: false, updatedAt: new Date().toISOString() }).where(eq(branches.id, id));
    return true;
  }

  // --- Departments ---
  async getDepartments(params: PaginationParams) {
    await ensureMasterSeeded();
    const rows = await db.select().from(departments);
    const mapped = rows.map(mapDepartmentRow);
    const activeOnly = mapped.filter((d) => d.isActive);
    return paginateArray(activeOnly, params, ['code', 'name', 'description']);
  }

  async getDepartmentById(id: string): Promise<DbDepartment | null> {
    await ensureMasterSeeded();
    const [row] = await db.select().from(departments).where(eq(departments.id, id));
    return row ? mapDepartmentRow(row) : null;
  }

  async createDepartment(data: Omit<DbDepartment, 'id' | 'createdAt' | 'updatedAt'>): Promise<DbDepartment> {
    await ensureMasterSeeded();
    const id = `dep-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();
    const newRecord = {
      id,
      code: data.code,
      name: data.name,
      branchId: data.branchId ?? null,
      description: data.description ?? null,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(departments).values(newRecord);
    return mapDepartmentRow(newRecord);
  }

  async updateDepartment(id: string, updates: Partial<DbDepartment>): Promise<DbDepartment | null> {
    await ensureMasterSeeded();
    const existing = await this.getDepartmentById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const payload: Record<string, any> = { updatedAt: now };
    if (updates.code !== undefined) payload.code = updates.code;
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.branchId !== undefined) payload.branchId = updates.branchId;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.isActive !== undefined) payload.isActive = updates.isActive;

    await db.update(departments).set(payload).where(eq(departments.id, id));
    return this.getDepartmentById(id);
  }

  async deleteDepartment(id: string): Promise<boolean> {
    await ensureMasterSeeded();
    const existing = await this.getDepartmentById(id);
    if (!existing) return false;

    await db.update(departments).set({ isActive: false, updatedAt: new Date().toISOString() }).where(eq(departments.id, id));
    return true;
  }

  // --- Designations ---
  async getDesignations(params: PaginationParams) {
    await ensureMasterSeeded();
    const rows = await db.select().from(designations);
    const mapped = rows.map(mapDesignationRow);
    const activeOnly = mapped.filter((d) => d.isActive);
    return paginateArray(activeOnly, params, ['code', 'name', 'gradeLevel', 'description']);
  }

  async getDesignationById(id: string): Promise<DbDesignation | null> {
    await ensureMasterSeeded();
    const [row] = await db.select().from(designations).where(eq(designations.id, id));
    return row ? mapDesignationRow(row) : null;
  }

  async createDesignation(data: Omit<DbDesignation, 'id' | 'createdAt' | 'updatedAt'>): Promise<DbDesignation> {
    await ensureMasterSeeded();
    const id = `dsg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();
    const newRecord = {
      id,
      code: data.code,
      name: data.name,
      departmentId: data.departmentId ?? null,
      gradeLevel: data.gradeLevel ?? null,
      description: data.description ?? null,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(designations).values(newRecord);
    return mapDesignationRow(newRecord);
  }

  async updateDesignation(id: string, updates: Partial<DbDesignation>): Promise<DbDesignation | null> {
    await ensureMasterSeeded();
    const existing = await this.getDesignationById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const payload: Record<string, any> = { updatedAt: now };
    if (updates.code !== undefined) payload.code = updates.code;
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.departmentId !== undefined) payload.departmentId = updates.departmentId;
    if (updates.gradeLevel !== undefined) payload.gradeLevel = updates.gradeLevel;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.isActive !== undefined) payload.isActive = updates.isActive;

    await db.update(designations).set(payload).where(eq(designations.id, id));
    return this.getDesignationById(id);
  }

  async deleteDesignation(id: string): Promise<boolean> {
    await ensureMasterSeeded();
    const existing = await this.getDesignationById(id);
    if (!existing) return false;

    await db.update(designations).set({ isActive: false, updatedAt: new Date().toISOString() }).where(eq(designations.id, id));
    return true;
  }

  // --- Employees ---
  async getEmployees(params: PaginationParams) {
    await ensureMasterSeeded();
    const rows = await db.select().from(employees);
    const mapped = rows.map(mapEmployeeRow);
    const activeOnly = mapped.filter((e) => e.isActive);
    return paginateArray(activeOnly, params, ['employeeCode', 'name', 'email', 'phone', 'passportNumber', 'nationalId']);
  }

  async getEmployeeById(id: string): Promise<DbEmployee | null> {
    await ensureMasterSeeded();
    const [row] = await db.select().from(employees).where(eq(employees.id, id));
    return row ? mapEmployeeRow(row) : null;
  }

  async createEmployee(data: Omit<DbEmployee, 'id' | 'createdAt' | 'updatedAt'>): Promise<DbEmployee> {
    await ensureMasterSeeded();
    const id = `emp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();
    const newRecord = {
      id,
      employeeCode: data.employeeCode || `EMP-${Date.now()}`,
      name: data.name,
      photoUrl: data.photoUrl ?? null,
      phone: data.phone,
      email: data.email,
      address: data.address ?? null,
      emergencyContact: data.emergencyContact ?? null,
      dateOfJoining: data.dateOfJoining || new Date().toISOString().split('T')[0],
      departmentId: data.departmentId ?? null,
      designationId: data.designationId ?? null,
      reportingManagerId: data.reportingManagerId ?? null,
      status: data.status || 'ACTIVE',
      baseSalary: Number(data.baseSalary ?? 0),
      hourlyRate: Number(data.hourlyRate ?? 0),
      passportNumber: data.passportNumber ?? null,
      nationalId: data.nationalId ?? null,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(employees).values(newRecord);
    return mapEmployeeRow(newRecord);
  }

  async updateEmployee(id: string, updates: Partial<DbEmployee>): Promise<DbEmployee | null> {
    await ensureMasterSeeded();
    const existing = await this.getEmployeeById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const payload: Record<string, any> = { updatedAt: now };
    if (updates.employeeCode !== undefined) payload.employeeCode = updates.employeeCode;
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.photoUrl !== undefined) payload.photoUrl = updates.photoUrl;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.address !== undefined) payload.address = updates.address;
    if (updates.emergencyContact !== undefined) payload.emergencyContact = updates.emergencyContact;
    if (updates.dateOfJoining !== undefined) payload.dateOfJoining = updates.dateOfJoining;
    if (updates.departmentId !== undefined) payload.departmentId = updates.departmentId;
    if (updates.designationId !== undefined) payload.designationId = updates.designationId;
    if (updates.reportingManagerId !== undefined) payload.reportingManagerId = updates.reportingManagerId;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.baseSalary !== undefined) payload.baseSalary = Number(updates.baseSalary);
    if (updates.hourlyRate !== undefined) payload.hourlyRate = Number(updates.hourlyRate);
    if (updates.passportNumber !== undefined) payload.passportNumber = updates.passportNumber;
    if (updates.nationalId !== undefined) payload.nationalId = updates.nationalId;
    if (updates.isActive !== undefined) payload.isActive = updates.isActive;

    await db.update(employees).set(payload).where(eq(employees.id, id));
    return this.getEmployeeById(id);
  }

  async deleteEmployee(id: string): Promise<boolean> {
    await ensureMasterSeeded();
    const existing = await this.getEmployeeById(id);
    if (!existing) return false;

    await db.update(employees).set({ isActive: false, updatedAt: new Date().toISOString() }).where(eq(employees.id, id));
    return true;
  }

  // --- Projects ---
  async getProjects(params: PaginationParams) {
    const rows = await db.select().from(projects);
    const activeOnly = rows.filter((p) => p.isActive);
    return paginateArray(activeOnly, params, ['projectCode', 'projectName', 'location', 'status']);
  }

  async getProjectById(id: string): Promise<DbProject | null> {
    const [row] = await db.select().from(projects).where(eq(projects.id, id));
    if (row) return row as any;
    const [rowCode] = await db.select().from(projects).where(eq(projects.projectCode, id));
    return rowCode ? (rowCode as any) : null;
  }

  async createProject(data: Omit<DbProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<DbProject> {
    const newProject = {
      ...data,
      id: `PRJ-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.insert(projects).values(newProject as any);
    return newProject as any;
  }

  // --- Sites ---
  async getSites(params: PaginationParams) {
    const rows = await db.select().from(sites);
    const activeOnly = rows.filter((s) => s.isActive);
    return paginateArray(activeOnly, params, ['siteCode', 'siteName', 'address']);
  }

  // --- Contractors, Vendors, Customers ---
  async getContractors(params: PaginationParams) {
    const rows = await db.select().from(contractors);
    return paginateArray(rows.filter((c) => c.isActive), params, ['code', 'name', 'contactPerson', 'email']);
  }

  async getVendors(params: PaginationParams) {
    const rows = await db.select().from(vendors);
    return paginateArray(rows.filter((v) => v.isActive), params, ['code', 'name', 'contactPerson', 'email']);
  }

  async getCustomers(params: PaginationParams) {
    const rows = await db.select().from(customers);
    return paginateArray(rows.filter((c) => c.isActive), params, ['code', 'name', 'contactPerson', 'email']);
  }

  // --- Materials & Warehouses ---
  async getMaterials(params: PaginationParams) {
    const rows = await db.select().from(materials);
    return paginateArray(rows.filter((m) => m.isActive), params, ['itemCode', 'name', 'specification', 'barcode', 'qrCode']);
  }

  async getMaterialCategories(params: PaginationParams) {
    const rows = await db.select().from(materialCategories);
    return paginateArray(rows.filter((mc) => mc.isActive), params, ['code', 'name']);
  }

  async getMaterialUnits(params: PaginationParams) {
    const rows = await db.select().from(materialUnits);
    return paginateArray(rows.filter((mu) => mu.isActive), params, ['code', 'name']);
  }

  async getWarehouses(params: PaginationParams) {
    const rows = await db.select().from(warehouses);
    return paginateArray(rows.filter((w) => w.isActive), params, ['code', 'name', 'location']);
  }

  async getStocks(params: PaginationParams) {
    const rows = await db.select().from(stocks);
    return paginateArray(rows, params, ['warehouseId', 'materialId', 'batchNumber', 'rackLocation']);
  }

  // --- Plant, Machinery & Vehicles ---
  async getEquipment(params: PaginationParams) {
    const rows = await db.select().from(equipments);
    return paginateArray(rows.filter((e) => e.isActive), params, ['code', 'name', 'type', 'serialNumber', 'modelNumber']);
  }

  async getVehicles(params: PaginationParams) {
    const rows = await db.select().from(vehicles);
    return paginateArray(rows.filter((v) => v.isActive), params, ['vehicleNumber', 'vehicleType', 'insurancePolicy', 'rcNumber']);
  }

  // --- Master Data Stores for 13 Master Categories ---
  private memoryShifts = [
    { id: 'sft_1', code: 'SFT-DAY', name: 'General Day Shift (08:00 - 17:00)', startTime: '08:00', endTime: '17:00', breakDurationMinutes: 60, description: 'Standard site & office day shift', isActive: true },
    { id: 'sft_2', code: 'SFT-NIGHT', name: 'Night Operations Shift (20:00 - 05:00)', startTime: '20:00', endTime: '05:00', breakDurationMinutes: 60, description: 'Tunneling & night pour shift', isActive: true },
    { id: 'sft_3', code: 'SFT-OT', name: 'Overtime Extended Shift (17:00 - 21:00)', startTime: '17:00', endTime: '21:00', breakDurationMinutes: 30, description: 'Peak deadline overtime shift', isActive: true }
  ];

  private memoryEmploymentTypes = [
    { id: 'empt_1', code: 'FULL_TIME', name: 'Full-Time Permanent', description: 'Full time monthly salaried employee', isActive: true },
    { id: 'empt_2', code: 'CONTRACT', name: 'Fixed-Term Contract', description: 'Project fixed tenure contract', isActive: true },
    { id: 'empt_3', code: 'DAILY_WAGE', name: 'Daily Wage Skilled', description: 'Daily muster roll labor', isActive: true },
    { id: 'empt_4', code: 'SUBCONTRACT', name: 'Subcontracted Staff', description: 'Third party agency manpower', isActive: true }
  ];

  private memoryHolidayCalendar = [
    { id: 'hol_1', code: 'HOL-2026-01', title: 'Republic Day', date: '2026-01-26', dayOfWeek: 'Monday', holidayType: 'NATIONAL', description: 'National holiday across all sites', isActive: true },
    { id: 'hol_2', code: 'HOL-2026-02', title: 'Independence Day', date: '2026-08-15', dayOfWeek: 'Saturday', holidayType: 'NATIONAL', description: 'National flag hoisting day', isActive: true },
    { id: 'hol_3', code: 'HOL-2026-03', title: 'Onam Festival', date: '2026-08-28', dayOfWeek: 'Friday', holidayType: 'STATE', description: 'Regional festival holiday (Kerala)', isActive: true },
    { id: 'hol_4', code: 'HOL-2026-04', title: 'Gandhi Jayanti', date: '2026-10-02', dayOfWeek: 'Friday', holidayType: 'NATIONAL', description: 'National observance', isActive: true }
  ];

  private memorySkills = [
    { id: 'skl_1', code: 'SKL-CIV-01', name: 'Structural Concrete Pouring', category: 'Civil', description: 'Expertise in high-grade concrete compaction & curing', isActive: true },
    { id: 'skl_2', code: 'SKL-MCH-01', name: 'HDPE Butt Fusion Welding', category: 'Mechanical', description: 'Certified joint welding for water mains', isActive: true },
    { id: 'skl_3', code: 'SKL-HSE-01', name: 'Confined Space Rescue & Safety', category: 'HSE', description: 'Advanced trench & tunnel safety level 3', isActive: true },
    { id: 'skl_4', code: 'SKL-ELE-01', name: 'PLC & SCADA Wiring', category: 'Electrical', description: 'WTP automation instrumentation & telemetry', isActive: true }
  ];

  private memoryEmployeeCategories = [
    { id: 'cat_emp_1', code: 'CAT-EXEC', name: 'Executive Leadership', description: 'Directors, C-Suite & VP Operations', isActive: true },
    { id: 'cat_emp_2', code: 'CAT-ENGG', name: 'Engineering & Tech Staff', description: 'Site, Mechanical, Civil & Design Engineers', isActive: true },
    { id: 'cat_emp_3', code: 'CAT-SITE', name: 'Site Operations & Field Staff', description: 'Incharges, Supervisors & Foreman', isActive: true },
    { id: 'cat_emp_4', code: 'CAT-ADMIN', name: 'Support & Corporate Admin', description: 'HR, Finance, Procurement & Accounts', isActive: true }
  ];

  private memoryVendorCategories = [
    { id: 'cat_ven_1', code: 'VEN-MAT', name: 'Raw Material Supplier', description: 'Pipes, Valves, Steel, Cement & Aggregates', isActive: true },
    { id: 'cat_ven_2', code: 'VEN-EQP', name: 'Heavy Equipment Rental', description: 'Excavators, Cranes, DG Sets & Pumping Rigs', isActive: true },
    { id: 'cat_ven_3', code: 'VEN-SUB', name: 'Turnkey Subcontractor', description: 'Pipelaying, Hydrotesting & Trenching agencies', isActive: true }
  ];

  private memoryMaterialCategoryList = [
    { id: 'mc_1', code: 'MAT-PIPE', name: 'DI & HDPE Piping System', description: 'Ductile Iron, Mild Steel & HDPE mainlines', isActive: true },
    { id: 'mc_2', code: 'MAT-VALVE', name: 'Flow Control Valves & Fittings', description: 'Sluice valves, Air valves & Flanges', isActive: true },
    { id: 'mc_3', code: 'MAT-CEM', name: 'Civil Aggregates & Cement', description: 'OPC 53 cement, sand & crushed aggregate', isActive: true },
    { id: 'mc_4', code: 'MAT-INST', name: 'Telemetry & SCADA Sensors', description: 'Flowmeters, pressure transmitters & PLC nodes', isActive: true }
  ];

  private memoryVehicleCategories = [
    { id: 'cat_veh_1', code: 'VEH-TRK', name: 'Heavy Transport Truck', description: 'Multi-axle pipe haulers & tippers', isActive: true },
    { id: 'cat_veh_2', code: 'VEH-LVT', name: 'Light Utility Vehicle', description: 'Site inspection pickups & crew vans', isActive: true },
    { id: 'cat_veh_3', code: 'VEH-SPE', name: 'Special Purpose Tanker', description: 'Water tankers, fuel bowsers & lube vans', isActive: true }
  ];

  private memoryEquipmentCategories = [
    { id: 'cat_eq_1', code: 'EQP-EXC', name: 'Earthmoving & Excavators', description: 'Tracked excavators, backhoes & trenchers', isActive: true },
    { id: 'cat_eq_2', code: 'EQP-CRN', name: 'Lifting Cranes & Rigging', description: 'Hydra cranes, crawler cranes & gantry rigs', isActive: true },
    { id: 'cat_eq_3', code: 'EQP-GEN', name: 'Power Generators & Compressors', description: '3-phase DG sets & high-pressure air compressors', isActive: true }
  ];

  // --- 13 MASTER CATEGORIES GET/CREATE/UPDATE/DELETE METHODS ---
  async getShifts() { return this.memoryShifts.filter(x => x.isActive); }
  async createShift(data: any) {
    const newObj = { ...data, id: `sft_${Date.now()}`, isActive: true };
    this.memoryShifts.push(newObj);
    return newObj;
  }
  async updateShift(id: string, updates: any) {
    const idx = this.memoryShifts.findIndex(x => x.id === id);
    if (idx < 0) return null;
    this.memoryShifts[idx] = { ...this.memoryShifts[idx], ...updates };
    return this.memoryShifts[idx];
  }
  async deleteShift(id: string) {
    const item = this.memoryShifts.find(x => x.id === id);
    if (item) item.isActive = false;
    return true;
  }

  async getEmploymentTypesMaster() { return this.memoryEmploymentTypes.filter(x => x.isActive); }
  async createEmploymentTypeMaster(data: any) {
    const newObj = { ...data, id: `empt_${Date.now()}`, isActive: true };
    this.memoryEmploymentTypes.push(newObj);
    return newObj;
  }

  async getHolidayCalendars() { return this.memoryHolidayCalendar.filter(x => x.isActive); }
  async createHolidayCalendar(data: any) {
    const newObj = { ...data, id: `hol_${Date.now()}`, isActive: true };
    this.memoryHolidayCalendar.push(newObj);
    return newObj;
  }

  async getSkillsMaster() { return this.memorySkills.filter(x => x.isActive); }
  async createSkillMaster(data: any) {
    const newObj = { ...data, id: `skl_${Date.now()}`, isActive: true };
    this.memorySkills.push(newObj);
    return newObj;
  }

  async getEmployeeCategories() { return this.memoryEmployeeCategories.filter(x => x.isActive); }
  async createEmployeeCategory(data: any) {
    const newObj = { ...data, id: `cat_emp_${Date.now()}`, isActive: true };
    this.memoryEmployeeCategories.push(newObj);
    return newObj;
  }

  async getVendorCategoriesMaster() { return this.memoryVendorCategories.filter(x => x.isActive); }
  async createVendorCategoryMaster(data: any) {
    const newObj = { ...data, id: `cat_ven_${Date.now()}`, isActive: true };
    this.memoryVendorCategories.push(newObj);
    return newObj;
  }

  async getVehicleCategoriesMaster() { return this.memoryVehicleCategories.filter(x => x.isActive); }
  async createVehicleCategoryMaster(data: any) {
    const newObj = { ...data, id: `cat_veh_${Date.now()}`, isActive: true };
    this.memoryVehicleCategories.push(newObj);
    return newObj;
  }

  async getEquipmentCategoriesMaster() { return this.memoryEquipmentCategories.filter(x => x.isActive); }
  async createEquipmentCategoryMaster(data: any) {
    const newObj = { ...data, id: `cat_eq_${Date.now()}`, isActive: true };
    this.memoryEquipmentCategories.push(newObj);
    return newObj;
  }

  // --- Generic Documents ---
  async getDocumentsByEntity(entityType: DbDocument['entityType'], entityId: string) {
    const rows = await db
      .select()
      .from(documents)
      .where(and(eq(documents.entityType, entityType), eq(documents.entityId, entityId)));
    return rows;
  }

  async createDocument(docData: Omit<DbDocument, 'id' | 'createdAt'>): Promise<DbDocument> {
    const newDoc = {
      ...docData,
      id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    await db.insert(documents).values(newDoc as any);
    return newDoc as any;
  }
}

export const masterRepository = new MasterRepository();
