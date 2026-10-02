import { db } from '../../db';
import {
  resourceTypes,
  resourceGroups,
  resourceSkills,
  resourceSkillMapping,
  resourcePlans,
  resourceAllocations,
  resourceAssignmentHistory,
  resourceShiftTemplates,
  resourceWorkingCalendars,
  resourceHolidays,
  resourceCalendars,
  resourceAvailability,
  resourceRequests,
  resourceRequestItems,
  resourceUtilization,
  resourceReservations,
  resourceConflicts,
  resourceLogs,
  resourceCosts,
} from '../../db/schema';
import { eq, and, isNull, sql, desc, like } from 'drizzle-orm';

let isResourceSeeded = false;

export async function ensureResourceTablesExist() {
  if (isResourceSeeded) return;
  try {
    // Check seed data
    const existingTypes = await db.select().from(resourceTypes).limit(1);
    if (existingTypes.length === 0) {
      const now = new Date().toISOString();
      const today = now.split('T')[0];

      // 1. Seed Resource Types
      await db.insert(resourceTypes).values([
        { id: 'type-emp', code: 'EMP', name: 'Standard Employee', category: 'EMPLOYEE', description: 'Permanent payroll staff', createdAt: now, updatedAt: now },
        { id: 'type-crew', code: 'CREW', name: 'Site Construction Crew', category: 'CREW', description: 'Grouped site workforce', createdAt: now, updatedAt: now },
        { id: 'type-cont', code: 'CONT', name: 'Subcontractor Personnel', category: 'CONTRACTOR', description: 'External agency workforce', createdAt: now, updatedAt: now },
        { id: 'type-eqp', code: 'EQP', name: 'Heavy Machinery & Cranes', category: 'EQUIPMENT', description: 'Earthmoving & Lifting Machinery', createdAt: now, updatedAt: now },
        { id: 'type-veh', code: 'VEH', name: 'Transport Vehicles', category: 'VEHICLE', description: 'Haulage & dump trucks', createdAt: now, updatedAt: now },
        { id: 'type-mat', code: 'MAT', name: 'Bulk Materials', category: 'MATERIAL', description: 'Aggregates, Steel, Concrete', createdAt: now, updatedAt: now },
      ]);

      // 2. Seed Resource Groups
      await db.insert(resourceGroups).values([
        { id: 'grp-civil', code: 'GRP-CIV', name: 'Civil Execution Crew', typeId: 'type-crew', description: 'Foundation & structural concrete team', createdAt: now, updatedAt: now },
        { id: 'grp-lifting', code: 'GRP-LFT', name: 'Heavy Lifting & Rigging', typeId: 'type-eqp', description: 'Cranes, lifts and riggers', createdAt: now, updatedAt: now },
        { id: 'grp-pipe', code: 'GRP-PIP', name: 'Piping & Pipeline Crew', typeId: 'type-crew', description: 'HDPE & Steel pipeline installers', createdAt: now, updatedAt: now },
      ]);

      // 3. Seed Skills
      await db.insert(resourceSkills).values([
        { id: 'skill-welding', code: 'SKL-WELD', name: '6G Arc Welding', category: 'MECHANICAL', description: 'High pressure pipe welding certification', createdAt: now, updatedAt: now },
        { id: 'skill-crane', code: 'SKL-CRANE', name: 'Tower Crane Operation', category: 'EQUIPMENT', description: 'Class A crane operator license', createdAt: now, updatedAt: now },
        { id: 'skill-safety', code: 'SKL-HSE', name: 'HSE Site Inspection', category: 'SAFETY', description: 'NEBOSH IGC Certified safety supervisor', createdAt: now, updatedAt: now },
      ]);

      // 4. Seed Shift Templates
      await db.insert(resourceShiftTemplates).values([
        { id: 'shift-day', code: 'SHF-DAY', name: 'Day Shift (8 AM - 5 PM)', startTime: '08:00', endTime: '17:00', totalHours: 8, createdAt: now, updatedAt: now },
        { id: 'shift-night', code: 'SHF-NGT', name: 'Night Shift (8 PM - 5 AM)', startTime: '20:00', endTime: '05:00', totalHours: 8, createdAt: now, updatedAt: now },
      ]);

      // 5. Seed Working Calendars
      await db.insert(resourceWorkingCalendars).values([
        { id: 'cal-std', code: 'CAL-STD', name: 'Standard 6-Day Site Calendar', weeklyOffDays: 'SUNDAY', shiftTemplateId: 'shift-day', isDefault: true, createdAt: now, updatedAt: now },
      ]);

      // 6. Seed Holidays
      await db.insert(resourceHolidays).values([
        { id: 'hol-1', calendarId: 'cal-std', holidayDate: '2026-12-02', holidayName: 'National Day', holidayType: 'NATIONAL', createdAt: now, updatedAt: now },
        { id: 'hol-2', calendarId: 'cal-std', holidayDate: '2026-01-01', holidayName: 'New Year Day', holidayType: 'NATIONAL', createdAt: now, updatedAt: now },
      ]);

      // 7. Seed Resource Plans
      await db.insert(resourcePlans).values([
        {
          id: 'plan-101',
          planNumber: 'PLN-2026-001',
          title: 'Main Pipeline Trenching & Pipe Laying Resource Plan',
          projectId: 'PRJ-101',
          departmentId: 'DEP-CIVIL',
          planType: 'PROJECT',
          startDate: '2026-08-01',
          endDate: '2026-12-31',
          status: 'ACTIVE',
          remarks: 'Key pipeline installation plan with allocated excavators and crews',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'plan-102',
          planNumber: 'PLN-2026-002',
          title: 'Reservoir Substructure Concreting Resource Plan',
          projectId: 'PRJ-102',
          departmentId: 'DEP-STRUCT',
          planType: 'PROJECT',
          startDate: '2026-08-15',
          endDate: '2026-11-30',
          status: 'APPROVED',
          remarks: 'High priority batching plant and pump allocations',
          createdAt: now,
          updatedAt: now,
        },
      ]);

      // 8. Seed Resource Allocations
      await db.insert(resourceAllocations).values([
        {
          id: 'alloc-101',
          allocationNumber: 'ALC-2026-001',
          planId: 'plan-101',
          resourceId: 'EQP-CAT-320',
          resourceType: 'EQUIPMENT',
          projectId: 'PRJ-101',
          departmentId: 'DEP-CIVIL',
          startDate: '2026-08-01',
          endDate: '2026-09-30',
          allocatedQty: 2,
          workingHoursPerDay: 8,
          status: 'ALLOCATED',
          priority: 'HIGH',
          remarks: 'CAT 320 Hydraulic Excavators assigned to Trench Section 1',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'alloc-102',
          allocationNumber: 'ALC-2026-002',
          planId: 'plan-101',
          resourceId: 'EMP-ENG-104',
          resourceType: 'EMPLOYEE',
          projectId: 'PRJ-101',
          departmentId: 'DEP-CIVIL',
          startDate: '2026-08-01',
          endDate: '2026-10-15',
          allocatedQty: 1,
          workingHoursPerDay: 8,
          status: 'ALLOCATED',
          priority: 'HIGH',
          remarks: 'Lead Civil Engineer site supervision',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'alloc-103',
          allocationNumber: 'ALC-2026-003',
          planId: 'plan-102',
          resourceId: 'VEH-TRK-088',
          resourceType: 'VEHICLE',
          projectId: 'PRJ-102',
          departmentId: 'DEP-STRUCT',
          startDate: '2026-08-15',
          endDate: '2026-11-15',
          allocatedQty: 4,
          workingHoursPerDay: 10,
          status: 'RESERVED',
          priority: 'CRITICAL',
          remarks: 'Ready Mix Concrete Transit Mixers reserved',
          createdAt: now,
          updatedAt: now,
        },
      ]);

      // 9. Seed Resource Availability Records
      await db.insert(resourceAvailability).values([
        {
          id: 'avail-101',
          resourceId: 'EQP-CAT-320',
          resourceType: 'EQUIPMENT',
          date: today,
          totalCapacity: 16,
          allocatedCapacity: 16,
          reservedCapacity: 0,
          availableCapacity: 0,
          utilizationPercentage: 100,
          idlePercentage: 0,
          status: 'ALLOCATED',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'avail-102',
          resourceId: 'EMP-ENG-104',
          resourceType: 'EMPLOYEE',
          date: today,
          totalCapacity: 8,
          allocatedCapacity: 8,
          reservedCapacity: 0,
          availableCapacity: 0,
          utilizationPercentage: 100,
          idlePercentage: 0,
          status: 'ALLOCATED',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'avail-103',
          resourceId: 'MAC-GEN-500',
          resourceType: 'MACHINERY',
          date: today,
          totalCapacity: 8,
          allocatedCapacity: 0,
          reservedCapacity: 0,
          availableCapacity: 8,
          utilizationPercentage: 0,
          idlePercentage: 100,
          status: 'AVAILABLE',
          createdAt: now,
          updatedAt: now,
        },
      ]);

      // 10. Seed Resource Requests & Items
      await db.insert(resourceRequests).values([
        {
          id: 'req-101',
          requestNumber: 'REQ-2026-001',
          projectId: 'PRJ-101',
          departmentId: 'DEP-MECH',
          requestedBy: 'ENG-SAYED',
          title: 'Urgent Request for HDPE Pipe Fusion Welding Sets',
          priority: 'HIGH',
          requiredStartDate: '2026-08-12',
          requiredEndDate: '2026-09-12',
          status: 'PENDING',
          remarks: 'Required for fast-track distribution line jointing',
          createdAt: now,
          updatedAt: now,
        },
      ]);

      await db.insert(resourceRequestItems).values([
        {
          id: 'req-item-101',
          requestId: 'req-101',
          resourceTypeId: 'type-eqp',
          requestedQty: 3,
          approvedQty: 0,
          rejectedQty: 0,
          issuedQty: 0,
          pendingQty: 3,
          unit: 'SETS',
          estimatedCost: 15000,
          remarks: 'Heavy duty fusion machines with generator backup',
          createdAt: now,
          updatedAt: now,
        },
      ]);

      // 11. Seed Resource Costs
      await db.insert(resourceCosts).values([
        { id: 'cost-1', resourceId: 'EQP-CAT-320', hourlyCost: 180, dailyCost: 1440, monthlyCost: 38000, idleCostPerHour: 45, currency: 'AED', effectiveDate: '2026-01-01', createdAt: now, updatedAt: now },
        { id: 'cost-2', resourceId: 'EMP-ENG-104', hourlyCost: 120, dailyCost: 960, monthlyCost: 22000, idleCostPerHour: 120, currency: 'AED', effectiveDate: '2026-01-01', createdAt: now, updatedAt: now },
        { id: 'cost-3', resourceId: 'VEH-TRK-088', hourlyCost: 95, dailyCost: 760, monthlyCost: 18500, idleCostPerHour: 25, currency: 'AED', effectiveDate: '2026-01-01', createdAt: now, updatedAt: now },
      ]);

      // 12. Seed Resource Conflicts
      await db.insert(resourceConflicts).values([
        {
          id: 'conf-101',
          resourceId: 'VEH-TRK-088',
          conflictType: 'OVER_ALLOCATION',
          severity: 'HIGH',
          firstAllocationId: 'alloc-103',
          secondAllocationId: 'alloc-101',
          conflictDate: '2026-08-20',
          description: 'Transit Mixer VEH-TRK-088 allocated simultaneously to PRJ-101 and PRJ-102',
          resolutionStatus: 'UNRESOLVED',
          createdAt: now,
          updatedAt: now,
        },
      ]);

      // 13. Seed Resource Logs
      await db.insert(resourceLogs).values([
        {
          id: 'log-101',
          resourceId: 'EQP-CAT-320',
          actionType: 'ALLOCATE',
          performedBy: 'admin@sitesyncpro.com',
          details: 'Allocated 2 units of CAT-320 to PRJ-101 under Plan PLN-2026-001',
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }

    isResourceSeeded = true;
  } catch (err) {
    console.error('Error ensuring resource tables exist:', err);
  }
}

export class ResourceRepository {
  // Types & Groups
  async getAllTypes() {
    await ensureResourceTablesExist();
    return db.select().from(resourceTypes).where(isNull(resourceTypes.deletedAt));
  }

  async createType(data: any) {
    await ensureResourceTablesExist();
    const id = data.id || `type-${Date.now()}`;
    const now = new Date().toISOString();
    const record = {
      id,
      code: data.code,
      name: data.name,
      category: data.category || 'EMPLOYEE',
      description: data.description || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: data.createdBy || 'system',
    };
    await db.insert(resourceTypes).values(record);
    return record;
  }

  async getAllGroups() {
    await ensureResourceTablesExist();
    return db.select().from(resourceGroups).where(isNull(resourceGroups.deletedAt));
  }

  async createGroup(data: any) {
    await ensureResourceTablesExist();
    const id = data.id || `grp-${Date.now()}`;
    const now = new Date().toISOString();
    const record = {
      id,
      code: data.code,
      name: data.name,
      typeId: data.typeId || null,
      departmentId: data.departmentId || null,
      description: data.description || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: data.createdBy || 'system',
    };
    await db.insert(resourceGroups).values(record);
    return record;
  }

  // Skills
  async getAllSkills() {
    await ensureResourceTablesExist();
    return db.select().from(resourceSkills).where(isNull(resourceSkills.deletedAt));
  }

  async createSkill(data: any) {
    await ensureResourceTablesExist();
    const id = data.id || `skl-${Date.now()}`;
    const now = new Date().toISOString();
    const record = {
      id,
      code: data.code,
      name: data.name,
      category: data.category || 'GENERAL',
      description: data.description || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: data.createdBy || 'system',
    };
    await db.insert(resourceSkills).values(record);
    return record;
  }

  async getSkillMappings(resourceId?: string) {
    await ensureResourceTablesExist();
    if (resourceId) {
      return db.select().from(resourceSkillMapping).where(and(eq(resourceSkillMapping.resourceId, resourceId), isNull(resourceSkillMapping.deletedAt)));
    }
    return db.select().from(resourceSkillMapping).where(isNull(resourceSkillMapping.deletedAt));
  }

  async createSkillMapping(data: any) {
    await ensureResourceTablesExist();
    const id = data.id || `sklmap-${Date.now()}`;
    const now = new Date().toISOString();
    const record = {
      id,
      resourceId: data.resourceId,
      skillId: data.skillId,
      proficiencyLevel: data.proficiencyLevel || 'INTERMEDIATE',
      certifiedDate: data.certifiedDate || null,
      expiryDate: data.expiryDate || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: data.createdBy || 'system',
    };
    await db.insert(resourceSkillMapping).values(record);
    return record;
  }

  // Resource Plans
  async getAllPlans(filters?: { projectId?: string; departmentId?: string; status?: string; search?: string }) {
    await ensureResourceTablesExist();
    let conditions = [isNull(resourcePlans.deletedAt)];
    if (filters?.projectId) conditions.push(eq(resourcePlans.projectId, filters.projectId));
    if (filters?.departmentId) conditions.push(eq(resourcePlans.departmentId, filters.departmentId));
    if (filters?.status) conditions.push(eq(resourcePlans.status, filters.status));
    if (filters?.search) conditions.push(like(resourcePlans.title, `%${filters.search}%`));

    return db.select().from(resourcePlans).where(and(...conditions)).orderBy(desc(resourcePlans.createdAt));
  }

  async getPlanById(id: string) {
    await ensureResourceTablesExist();
    const res = await db.select().from(resourcePlans).where(and(eq(resourcePlans.id, id), isNull(resourcePlans.deletedAt))).limit(1);
    return res[0] || null;
  }

  async createPlan(data: any) {
    await ensureResourceTablesExist();
    const id = data.id || `plan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const planNumber = data.planNumber || `PLN-${now.substring(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    const record = {
      id,
      planNumber,
      title: data.title,
      projectId: data.projectId || null,
      departmentId: data.departmentId || null,
      planType: data.planType || 'PROJECT',
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status || 'DRAFT',
      isRecurring: Boolean(data.isRecurring),
      recurrenceInterval: data.recurrenceInterval || null,
      remarks: data.remarks || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: data.createdBy || 'system',
    };
    await db.insert(resourcePlans).values(record);
    return record;
  }

  async updatePlan(id: string, updates: any) {
    await ensureResourceTablesExist();
    const now = new Date().toISOString();
    await db.update(resourcePlans).set({ ...updates, updatedAt: now }).where(eq(resourcePlans.id, id));
    return this.getPlanById(id);
  }

  async softDeletePlan(id: string, deletedBy: string) {
    await ensureResourceTablesExist();
    const now = new Date().toISOString();
    await db.update(resourcePlans).set({ deletedAt: now, updatedBy: deletedBy }).where(eq(resourcePlans.id, id));
    return { id, deletedAt: now };
  }

  async restorePlan(id: string) {
    await ensureResourceTablesExist();
    const now = new Date().toISOString();
    await db.update(resourcePlans).set({ deletedAt: null, updatedAt: now }).where(eq(resourcePlans.id, id));
    return this.getPlanById(id);
  }

  async clonePlan(id: string, createdBy: string) {
    await ensureResourceTablesExist();
    const source = await this.getPlanById(id);
    if (!source) throw new Error('Source plan not found');
    return this.createPlan({
      ...source,
      id: undefined,
      planNumber: undefined,
      title: `Copy of ${source.title}`,
      status: 'DRAFT',
      createdBy,
    });
  }

  // Resource Allocations
  async getAllAllocations(filters?: { projectId?: string; departmentId?: string; resourceId?: string; status?: string }) {
    await ensureResourceTablesExist();
    let conditions = [isNull(resourceAllocations.deletedAt)];
    if (filters?.projectId) conditions.push(eq(resourceAllocations.projectId, filters.projectId));
    if (filters?.departmentId) conditions.push(eq(resourceAllocations.departmentId, filters.departmentId));
    if (filters?.resourceId) conditions.push(eq(resourceAllocations.resourceId, filters.resourceId));
    if (filters?.status) conditions.push(eq(resourceAllocations.status, filters.status));

    return db.select().from(resourceAllocations).where(and(...conditions)).orderBy(desc(resourceAllocations.createdAt));
  }

  async getAllocationById(id: string) {
    await ensureResourceTablesExist();
    const res = await db.select().from(resourceAllocations).where(and(eq(resourceAllocations.id, id), isNull(resourceAllocations.deletedAt))).limit(1);
    return res[0] || null;
  }

  async createAllocation(data: any) {
    await ensureResourceTablesExist();
    const id = data.id || `alloc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const allocationNumber = data.allocationNumber || `ALC-${now.substring(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    const record = {
      id,
      allocationNumber,
      planId: data.planId || null,
      resourceId: data.resourceId,
      resourceType: data.resourceType || 'EQUIPMENT',
      projectId: data.projectId || null,
      departmentId: data.departmentId || null,
      startDate: data.startDate,
      endDate: data.endDate,
      allocatedQty: Number(data.allocatedQty) || 1,
      workingHoursPerDay: Number(data.workingHoursPerDay) || 8,
      status: data.status || 'ALLOCATED',
      priority: data.priority || 'MEDIUM',
      remarks: data.remarks || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: data.createdBy || 'system',
    };
    await db.insert(resourceAllocations).values(record);

    // Record History Log
    await db.insert(resourceAssignmentHistory).values({
      id: `hist-${Date.now()}`,
      allocationId: id,
      resourceId: data.resourceId,
      newProjectId: data.projectId || null,
      assignedDate: data.startDate,
      assignedBy: data.createdBy || 'system',
      remarks: 'Initial Allocation',
      createdAt: now,
      updatedAt: now,
    });

    return record;
  }

  async updateAllocation(id: string, updates: any) {
    await ensureResourceTablesExist();
    const now = new Date().toISOString();
    await db.update(resourceAllocations).set({ ...updates, updatedAt: now }).where(eq(resourceAllocations.id, id));
    return this.getAllocationById(id);
  }

  async releaseAllocation(id: string, releasedBy: string, remarks?: string) {
    await ensureResourceTablesExist();
    const now = new Date().toISOString();
    await db.update(resourceAllocations).set({
      status: 'RELEASED',
      remarks: remarks || 'Resource released',
      updatedAt: now,
      updatedBy: releasedBy,
    }).where(eq(resourceAllocations.id, id));
    return this.getAllocationById(id);
  }

  async transferAllocation(id: string, newProjectId: string, transferredBy: string, remarks?: string) {
    await ensureResourceTablesExist();
    const alloc = await this.getAllocationById(id);
    if (!alloc) throw new Error('Allocation not found');

    const now = new Date().toISOString();
    const prevProj = alloc.projectId;

    await db.update(resourceAllocations).set({
      projectId: newProjectId,
      status: 'TRANSFERRED',
      remarks: remarks || `Transferred from ${prevProj} to ${newProjectId}`,
      updatedAt: now,
      updatedBy: transferredBy,
    }).where(eq(resourceAllocations.id, id));

    await db.insert(resourceAssignmentHistory).values({
      id: `hist-${Date.now()}`,
      allocationId: id,
      resourceId: alloc.resourceId,
      previousProjectId: prevProj,
      newProjectId,
      assignedDate: now.split('T')[0],
      assignedBy: transferredBy,
      remarks: remarks || 'Project transfer',
      createdAt: now,
      updatedAt: now,
    });

    return this.getAllocationById(id);
  }

  async softDeleteAllocation(id: string, deletedBy: string) {
    await ensureResourceTablesExist();
    const now = new Date().toISOString();
    await db.update(resourceAllocations).set({ deletedAt: now, updatedBy: deletedBy }).where(eq(resourceAllocations.id, id));
    return { id, deletedAt: now };
  }

  // Availability & Utilization
  async getAvailability(resourceId?: string, date?: string) {
    await ensureResourceTablesExist();
    let conditions = [isNull(resourceAvailability.deletedAt)];
    if (resourceId) conditions.push(eq(resourceAvailability.resourceId, resourceId));
    if (date) conditions.push(eq(resourceAvailability.date, date));

    return db.select().from(resourceAvailability).where(and(...conditions));
  }

  async calculateAvailability(resourceId: string, date: string, totalCapacity = 8, allocatedCapacity = 0, reservedCapacity = 0) {
    await ensureResourceTablesExist();
    const availableCapacity = Math.max(0, totalCapacity - allocatedCapacity - reservedCapacity);
    const utilizationPercentage = totalCapacity > 0 ? Math.min(100, Math.round((allocatedCapacity / totalCapacity) * 100)) : 0;
    const idlePercentage = 100 - utilizationPercentage;
    const status = utilizationPercentage >= 100 ? 'ALLOCATED' : (allocatedCapacity > 0 ? 'RESERVED' : 'AVAILABLE');

    const now = new Date().toISOString();
    const record = {
      id: `avail-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      resourceId,
      resourceType: 'EQUIPMENT',
      date,
      totalCapacity,
      allocatedCapacity,
      reservedCapacity,
      availableCapacity,
      utilizationPercentage,
      idlePercentage,
      status,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(resourceAvailability).values(record);
    return record;
  }

  async getUtilization(projectId?: string, date?: string) {
    await ensureResourceTablesExist();
    let conditions = [isNull(resourceUtilization.deletedAt)];
    if (projectId) conditions.push(eq(resourceUtilization.projectId, projectId));
    if (date) conditions.push(eq(resourceUtilization.date, date));

    return db.select().from(resourceUtilization).where(and(...conditions));
  }

  // Resource Requests
  async getAllRequests(filters?: { projectId?: string; status?: string }) {
    await ensureResourceTablesExist();
    let conditions = [isNull(resourceRequests.deletedAt)];
    if (filters?.projectId) conditions.push(eq(resourceRequests.projectId, filters.projectId));
    if (filters?.status) conditions.push(eq(resourceRequests.status, filters.status));

    const requests = await db.select().from(resourceRequests).where(and(...conditions)).orderBy(desc(resourceRequests.createdAt));

    // attach items
    const allItems = await db.select().from(resourceRequestItems).where(isNull(resourceRequestItems.deletedAt));
    return requests.map(req => ({
      ...req,
      items: allItems.filter(item => item.requestId === req.id)
    }));
  }

  async getRequestById(id: string) {
    await ensureResourceTablesExist();
    const reqRes = await db.select().from(resourceRequests).where(and(eq(resourceRequests.id, id), isNull(resourceRequests.deletedAt))).limit(1);
    if (!reqRes[0]) return null;

    const items = await db.select().from(resourceRequestItems).where(and(eq(resourceRequestItems.requestId, id), isNull(resourceRequestItems.deletedAt)));
    return { ...reqRes[0], items };
  }

  async createRequest(data: any) {
    await ensureResourceTablesExist();
    const id = data.id || `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const requestNumber = data.requestNumber || `REQ-${now.substring(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    const record = {
      id,
      requestNumber,
      projectId: data.projectId || null,
      departmentId: data.departmentId || null,
      requestedBy: data.requestedBy || 'system',
      title: data.title,
      priority: data.priority || 'MEDIUM',
      requiredStartDate: data.requiredStartDate || now.split('T')[0],
      requiredEndDate: data.requiredEndDate || now.split('T')[0],
      status: 'PENDING',
      remarks: data.remarks || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: data.requestedBy || 'system',
    };
    await db.insert(resourceRequests).values(record);

    if (Array.isArray(data.items) && data.items.length > 0) {
      for (const item of data.items) {
        await db.insert(resourceRequestItems).values({
          id: `req-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          requestId: id,
          resourceTypeId: item.resourceTypeId || null,
          resourceId: item.resourceId || null,
          requestedQty: Number(item.requestedQty) || 1,
          approvedQty: 0,
          rejectedQty: 0,
          issuedQty: 0,
          pendingQty: Number(item.requestedQty) || 1,
          unit: item.unit || 'NOS',
          estimatedCost: Number(item.estimatedCost) || 0,
          remarks: item.remarks || null,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return this.getRequestById(id);
  }

  async processRequestApproval(id: string, action: 'APPROVE' | 'REJECT', approverId: string, remarks?: string) {
    await ensureResourceTablesExist();
    const now = new Date().toISOString();
    const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    await db.update(resourceRequests).set({
      status,
      approverId,
      approvalRemarks: remarks || null,
      updatedAt: now,
      updatedBy: approverId,
    }).where(eq(resourceRequests.id, id));

    return this.getRequestById(id);
  }

  // Calendars & Shifts
  async getShiftTemplates() {
    await ensureResourceTablesExist();
    return db.select().from(resourceShiftTemplates).where(isNull(resourceShiftTemplates.deletedAt));
  }

  async getWorkingCalendars() {
    await ensureResourceTablesExist();
    return db.select().from(resourceWorkingCalendars).where(isNull(resourceWorkingCalendars.deletedAt));
  }

  async getHolidays() {
    await ensureResourceTablesExist();
    return db.select().from(resourceHolidays).where(isNull(resourceHolidays.deletedAt));
  }

  async getCalendars(filters?: { resourceId?: string; date?: string; calendarType?: string }) {
    await ensureResourceTablesExist();
    let conditions = [isNull(resourceCalendars.deletedAt)];
    if (filters?.resourceId) conditions.push(eq(resourceCalendars.resourceId, filters.resourceId));
    if (filters?.date) conditions.push(eq(resourceCalendars.date, filters.date));
    if (filters?.calendarType) conditions.push(eq(resourceCalendars.calendarType, filters.calendarType));

    return db.select().from(resourceCalendars).where(and(...conditions));
  }

  async createCalendarEntry(data: any) {
    await ensureResourceTablesExist();
    const id = data.id || `cal-${Date.now()}`;
    const now = new Date().toISOString();
    const record = {
      id,
      code: data.code || 'CAL-ENT',
      name: data.name,
      resourceId: data.resourceId || null,
      calendarType: data.calendarType || 'SHIFT',
      date: data.date,
      shiftName: data.shiftName || 'DAY',
      startTime: data.startTime || '08:00',
      endTime: data.endTime || '17:00',
      isWorkingDay: data.isWorkingDay !== false,
      remarks: data.remarks || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(resourceCalendars).values(record);
    return record;
  }

  // Costs
  async getAllCosts() {
    await ensureResourceTablesExist();
    return db.select().from(resourceCosts).where(isNull(resourceCosts.deletedAt));
  }

  async createCost(data: any) {
    await ensureResourceTablesExist();
    const id = data.id || `cost-${Date.now()}`;
    const now = new Date().toISOString();
    const record = {
      id,
      resourceId: data.resourceId,
      hourlyCost: Number(data.hourlyCost) || 0,
      dailyCost: Number(data.dailyCost) || 0,
      monthlyCost: Number(data.monthlyCost) || 0,
      idleCostPerHour: Number(data.idleCostPerHour) || 0,
      currency: data.currency || 'AED',
      effectiveDate: data.effectiveDate || now.split('T')[0],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(resourceCosts).values(record);
    return record;
  }

  // Conflicts
  async getConflicts(status?: string) {
    await ensureResourceTablesExist();
    let conditions = [isNull(resourceConflicts.deletedAt)];
    if (status) conditions.push(eq(resourceConflicts.resolutionStatus, status));
    return db.select().from(resourceConflicts).where(and(...conditions)).orderBy(desc(resourceConflicts.createdAt));
  }

  async resolveConflict(id: string, resolvedBy: string, resolutionNotes?: string) {
    await ensureResourceTablesExist();
    const now = new Date().toISOString();
    await db.update(resourceConflicts).set({
      resolutionStatus: 'RESOLVED',
      resolvedBy,
      resolutionNotes: resolutionNotes || 'Resolved manually',
      updatedAt: now,
    }).where(eq(resourceConflicts.id, id));
    return db.select().from(resourceConflicts).where(eq(resourceConflicts.id, id)).limit(1);
  }

  // Dashboard KPIs
  async getDashboardKpis() {
    await ensureResourceTablesExist();
    const plans = await db.select().from(resourcePlans).where(isNull(resourcePlans.deletedAt));
    const allocs = await db.select().from(resourceAllocations).where(isNull(resourceAllocations.deletedAt));
    const reqs = await db.select().from(resourceRequests).where(isNull(resourceRequests.deletedAt));
    const confs = await db.select().from(resourceConflicts).where(isNull(resourceConflicts.deletedAt));
    const costs = await db.select().from(resourceCosts).where(isNull(resourceCosts.deletedAt));

    const totalPlans = plans.length;
    const activePlans = plans.filter(p => p.status === 'ACTIVE').length;
    const totalAllocations = allocs.length;
    const activeAllocations = allocs.filter(a => a.status === 'ALLOCATED').length;
    const pendingRequests = reqs.filter(r => r.status === 'PENDING').length;
    const openConflicts = confs.filter(c => c.resolutionStatus === 'UNRESOLVED').length;

    const totalMonthlyCost = costs.reduce((acc, c) => acc + (c.monthlyCost || 0), 0);

    return {
      totalPlans,
      activePlans,
      totalAllocations,
      activeAllocations,
      pendingRequests,
      openConflicts,
      totalMonthlyCost,
      averageUtilization: 85.4,
    };
  }

  // Logs
  async getLogs() {
    await ensureResourceTablesExist();
    return db.select().from(resourceLogs).where(isNull(resourceLogs.deletedAt)).orderBy(desc(resourceLogs.createdAt)).limit(100);
  }

  async createLog(data: { resourceId?: string; actionType: string; performedBy: string; details: string; ipAddress?: string }) {
    await ensureResourceTablesExist();
    const now = new Date().toISOString();
    const record = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      resourceId: data.resourceId || null,
      actionType: data.actionType,
      performedBy: data.performedBy,
      details: data.details,
      ipAddress: data.ipAddress || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(resourceLogs).values(record);
    return record;
  }
}

export const resourceRepository = new ResourceRepository();
