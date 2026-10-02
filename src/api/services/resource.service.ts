import { resourceRepository } from '../repositories/resource.repository';
import { auditRepository } from '../repositories/audit.repository';

export class ResourceService {
  // Types & Groups
  async getTypes() {
    return resourceRepository.getAllTypes();
  }

  async createType(data: any, user: any) {
    if (!data.code || !data.name) {
      throw new Error('Type code and name are required.');
    }
    const created = await resourceRepository.createType({ ...data, createdBy: user?.email || user?.id });
    await resourceRepository.createLog({
      actionType: 'CREATE',
      performedBy: user?.email || user?.id || 'system',
      details: `Created resource type ${created.code} - ${created.name}`,
    });
    return created;
  }

  async getGroups() {
    return resourceRepository.getAllGroups();
  }

  async createGroup(data: any, user: any) {
    if (!data.code || !data.name) {
      throw new Error('Group code and name are required.');
    }
    const created = await resourceRepository.createGroup({ ...data, createdBy: user?.email || user?.id });
    await resourceRepository.createLog({
      actionType: 'CREATE',
      performedBy: user?.email || user?.id || 'system',
      details: `Created resource group ${created.code} - ${created.name}`,
    });
    return created;
  }

  // Skills
  async getSkills() {
    return resourceRepository.getAllSkills();
  }

  async createSkill(data: any, user: any) {
    if (!data.code || !data.name) {
      throw new Error('Skill code and name are required.');
    }
    return resourceRepository.createSkill({ ...data, createdBy: user?.email || user?.id });
  }

  async getSkillMappings(resourceId?: string) {
    return resourceRepository.getSkillMappings(resourceId);
  }

  async createSkillMapping(data: any, user: any) {
    if (!data.resourceId || !data.skillId) {
      throw new Error('Resource ID and Skill ID are required.');
    }
    return resourceRepository.createSkillMapping({ ...data, createdBy: user?.email || user?.id });
  }

  // Plans
  async getPlans(filters?: any) {
    return resourceRepository.getAllPlans(filters);
  }

  async getPlanById(id: string) {
    const plan = await resourceRepository.getPlanById(id);
    if (!plan) throw new Error('Resource Plan not found');
    return plan;
  }

  async createPlan(data: any, user: any) {
    if (!data.title || !data.startDate || !data.endDate) {
      throw new Error('Plan title, start date, and end date are required.');
    }

    if (new Date(data.startDate) > new Date(data.endDate)) {
      throw new Error('Invalid date range: Start date cannot be after end date.');
    }

    const created = await resourceRepository.createPlan({
      ...data,
      createdBy: user?.email || user?.id || 'system',
    });

    await resourceRepository.createLog({
      resourceId: created.id,
      actionType: 'CREATE',
      performedBy: user?.email || user?.id || 'system',
      details: `Created Resource Plan ${created.planNumber}: ${created.title}`,
    });

    return created;
  }

  async updatePlan(id: string, updates: any, user: any) {
    if (updates.startDate && updates.endDate && new Date(updates.startDate) > new Date(updates.endDate)) {
      throw new Error('Invalid date range: Start date cannot be after end date.');
    }

    const updated = await resourceRepository.updatePlan(id, updates);
    await resourceRepository.createLog({
      resourceId: id,
      actionType: 'UPDATE',
      performedBy: user?.email || user?.id || 'system',
      details: `Updated Resource Plan ${id}`,
    });
    return updated;
  }

  async deletePlan(id: string, user: any) {
    const deleted = await resourceRepository.softDeletePlan(id, user?.email || user?.id || 'system');
    await resourceRepository.createLog({
      resourceId: id,
      actionType: 'DELETE',
      performedBy: user?.email || user?.id || 'system',
      details: `Soft deleted Resource Plan ${id}`,
    });
    return deleted;
  }

  async restorePlan(id: string, user: any) {
    const restored = await resourceRepository.restorePlan(id);
    await resourceRepository.createLog({
      resourceId: id,
      actionType: 'RESTORE',
      performedBy: user?.email || user?.id || 'system',
      details: `Restored Resource Plan ${id}`,
    });
    return restored;
  }

  async clonePlan(id: string, user: any) {
    const cloned = await resourceRepository.clonePlan(id, user?.email || user?.id || 'system');
    await resourceRepository.createLog({
      resourceId: cloned.id,
      actionType: 'CREATE',
      performedBy: user?.email || user?.id || 'system',
      details: `Cloned Plan from ${id} to new plan ${cloned.planNumber}`,
    });
    return cloned;
  }

  // Allocations
  async getAllocations(filters?: any) {
    return resourceRepository.getAllAllocations(filters);
  }

  async getAllocationById(id: string) {
    const alloc = await resourceRepository.getAllocationById(id);
    if (!alloc) throw new Error('Resource Allocation not found');
    return alloc;
  }

  async allocateResource(data: any, user: any) {
    if (!data.resourceId || !data.startDate || !data.endDate) {
      throw new Error('Resource ID, Start Date, and End Date are required.');
    }

    if (new Date(data.startDate) > new Date(data.endDate)) {
      throw new Error('Invalid date range: Start date cannot be after end date.');
    }

    // Check existing allocations for conflicts
    const existing = await resourceRepository.getAllAllocations({ resourceId: data.resourceId, status: 'ALLOCATED' });
    const reqStart = new Date(data.startDate).getTime();
    const reqEnd = new Date(data.endDate).getTime();

    for (const alloc of existing) {
      const aStart = new Date(alloc.startDate).getTime();
      const aEnd = new Date(alloc.endDate).getTime();

      // Check overlap
      if (reqStart <= aEnd && reqEnd >= aStart) {
        // Log conflict
        await resourceRepository.createLog({
          resourceId: data.resourceId,
          actionType: 'CONFLICT_DETECTED',
          performedBy: user?.email || user?.id || 'system',
          details: `Date conflict overlap detected with allocation ${alloc.allocationNumber}`,
        });
      }
    }

    const created = await resourceRepository.createAllocation({
      ...data,
      createdBy: user?.email || user?.id || 'system',
    });

    await resourceRepository.createLog({
      resourceId: data.resourceId,
      actionType: 'ALLOCATE',
      performedBy: user?.email || user?.id || 'system',
      details: `Allocated resource ${data.resourceId} to project ${data.projectId || 'Department'} under Allocation ${created.allocationNumber}`,
    });

    return created;
  }

  async updateAllocation(id: string, updates: any, user: any) {
    const updated = await resourceRepository.updateAllocation(id, updates);
    await resourceRepository.createLog({
      resourceId: updated?.resourceId,
      actionType: 'UPDATE',
      performedBy: user?.email || user?.id || 'system',
      details: `Updated Allocation ${id}`,
    });
    return updated;
  }

  async releaseResource(id: string, user: any, remarks?: string) {
    const released = await resourceRepository.releaseAllocation(id, user?.email || user?.id || 'system', remarks);
    await resourceRepository.createLog({
      resourceId: released?.resourceId,
      actionType: 'RELEASE',
      performedBy: user?.email || user?.id || 'system',
      details: `Released allocation ${id}: ${remarks || 'No remarks'}`,
    });
    return released;
  }

  async transferResource(id: string, newProjectId: string, user: any, remarks?: string) {
    if (!newProjectId) throw new Error('Target Project ID is required for transfer.');
    const transferred = await resourceRepository.transferAllocation(id, newProjectId, user?.email || user?.id || 'system', remarks);

    await resourceRepository.createLog({
      resourceId: transferred?.resourceId,
      actionType: 'TRANSFER',
      performedBy: user?.email || user?.id || 'system',
      details: `Transferred allocation ${id} to Project ${newProjectId}`,
    });

    return transferred;
  }

  async deleteAllocation(id: string, user: any) {
    const deleted = await resourceRepository.softDeleteAllocation(id, user?.email || user?.id || 'system');
    await resourceRepository.createLog({
      actionType: 'DELETE',
      performedBy: user?.email || user?.id || 'system',
      details: `Deleted Allocation ${id}`,
    });
    return deleted;
  }

  // Availability & Utilization
  async getAvailability(resourceId?: string, date?: string) {
    return resourceRepository.getAvailability(resourceId, date);
  }

  async calculateAvailability(resourceId: string, date: string, totalCapacity?: number, allocatedCapacity?: number) {
    return resourceRepository.calculateAvailability(resourceId, date, totalCapacity, allocatedCapacity);
  }

  async getUtilization(projectId?: string, date?: string) {
    return resourceRepository.getUtilization(projectId, date);
  }

  // Requests
  async getRequests(filters?: any) {
    return resourceRepository.getAllRequests(filters);
  }

  async getRequestById(id: string) {
    const req = await resourceRepository.getRequestById(id);
    if (!req) throw new Error('Resource Request not found');
    return req;
  }

  async createRequest(data: any, user: any) {
    if (!data.title) throw new Error('Request title is required.');
    const created = await resourceRepository.createRequest({
      ...data,
      requestedBy: user?.email || user?.id || 'system',
    });

    await resourceRepository.createLog({
      actionType: 'CREATE',
      performedBy: user?.email || user?.id || 'system',
      details: `Created Resource Request ${created?.requestNumber}: ${created?.title}`,
    });

    return created;
  }

  async processApproval(id: string, action: 'APPROVE' | 'REJECT', user: any, remarks?: string) {
    const updated = await resourceRepository.processRequestApproval(id, action, user?.email || user?.id || 'system', remarks);
    await resourceRepository.createLog({
      actionType: action,
      performedBy: user?.email || user?.id || 'system',
      details: `${action}D Resource Request ${id}: ${remarks || 'No remarks'}`,
    });
    return updated;
  }

  // Calendars
  async getCalendars(filters?: any) {
    return resourceRepository.getCalendars(filters);
  }

  async createCalendarEntry(data: any, user: any) {
    if (!data.name || !data.date) throw new Error('Calendar name and date are required.');
    return resourceRepository.createCalendarEntry(data);
  }

  async getShiftTemplates() {
    return resourceRepository.getShiftTemplates();
  }

  async getWorkingCalendars() {
    return resourceRepository.getWorkingCalendars();
  }

  async getHolidays() {
    return resourceRepository.getHolidays();
  }

  // Costs
  async getCosts() {
    return resourceRepository.getAllCosts();
  }

  async createCost(data: any, user: any) {
    if (!data.resourceId) throw new Error('Resource ID is required.');
    return resourceRepository.createCost(data);
  }

  // Conflicts
  async getConflicts(status?: string) {
    return resourceRepository.getConflicts(status);
  }

  async resolveConflict(id: string, user: any, notes?: string) {
    const res = await resourceRepository.resolveConflict(id, user?.email || user?.id || 'system', notes);
    await resourceRepository.createLog({
      actionType: 'RESOLVE_CONFLICT',
      performedBy: user?.email || user?.id || 'system',
      details: `Resolved conflict ${id}`,
    });
    return res[0];
  }

  // Dashboard KPIs
  async getDashboardKpis() {
    return resourceRepository.getDashboardKpis();
  }

  // Logs
  async getLogs() {
    return resourceRepository.getLogs();
  }
}

export const resourceService = new ResourceService();
