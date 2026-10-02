import { orgRepository, DbOrgUnit, DbProjectDepartment, DbProjectWorkPackage, DbModuleAssignment, DbDivision, DbDepartment } from '../repositories/org.repository';
import { PaginationParams } from '../utils/pagination';

export class OrgService {
  async getOrgUnits(params: PaginationParams & { unitType?: string; parentId?: string }) {
    return orgRepository.getOrgUnits(params);
  }

  async getOrgUnitTree() {
    return orgRepository.getOrgUnitTree();
  }

  async getOrgUnitById(id: string) {
    const unit = await orgRepository.getOrgUnitById(id);
    if (!unit) throw new Error('Organization unit not found');
    return unit;
  }

  async createOrgUnit(data: Omit<DbOrgUnit, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!data.name || !data.unitType || !data.unitCode) {
      throw new Error('Name, unitCode, and unitType are required');
    }
    return orgRepository.createOrgUnit(data);
  }

  async updateOrgUnit(id: string, updates: Partial<DbOrgUnit>) {
    const updated = await orgRepository.updateOrgUnit(id, updates);
    if (!updated) throw new Error('Organization unit not found');
    return updated;
  }

  async moveOrgUnit(id: string, newParentId: string | null) {
    return orgRepository.moveOrgUnit(id, newParentId);
  }

  async mergeOrgUnits(sourceId: string, targetId: string) {
    if (!sourceId || !targetId) throw new Error('Source and target department IDs are required');
    return orgRepository.mergeOrgUnits(sourceId, targetId);
  }

  async bulkImportOrgUnits(items: any[]) {
    if (!Array.isArray(items) || items.length === 0) throw new Error('Valid items array is required for bulk import');
    return orgRepository.bulkImportOrgUnits(items);
  }

  async softDeleteOrgUnit(id: string) {
    return orgRepository.softDeleteOrgUnit(id);
  }

  // =========================================================================
  // DIVISION MASTER
  // =========================================================================

  async getDivisions(params: { search?: string; isActive?: boolean } = {}) {
    return orgRepository.getDivisions(params);
  }

  async getDivisionById(id: string) {
    const div = await orgRepository.getDivisionById(id);
    if (!div) throw new Error(`Division with ID '${id}' not found`);
    return div;
  }

  async createDivision(data: {
    code: string;
    name: string;
    description?: string;
    headEmployeeId?: string;
    headEmployeeName?: string;
    displayOrder?: number;
    branchId?: string;
  }) {
    if (!data.code || !data.name) {
      throw new Error('Division code and name are required');
    }
    return orgRepository.createDivision(data);
  }

  async updateDivision(id: string, updates: Partial<DbDivision>) {
    const updated = await orgRepository.updateDivision(id, updates);
    if (!updated) throw new Error(`Division with ID '${id}' not found`);
    return updated;
  }

  async deactivateDivision(id: string, force = false) {
    return orgRepository.deactivateDivision(id, force);
  }

  async activateDivision(id: string) {
    return orgRepository.activateDivision(id);
  }

  // =========================================================================
  // DEPARTMENT MASTER & SAFE REASSIGNMENT
  // =========================================================================

  async getDepartments(params: { divisionId?: string; search?: string; isActive?: boolean } = {}) {
    return orgRepository.getDepartments(params);
  }

  async getDepartmentById(id: string) {
    const dept = await orgRepository.getDepartmentById(id);
    if (!dept) throw new Error(`Department with ID '${id}' not found`);
    return dept;
  }

  async createDepartment(data: {
    code: string;
    name: string;
    divisionId: string;
    description?: string;
    headEmployeeId?: string;
    headEmployeeName?: string;
    displayOrder?: number;
    color?: string;
    icon?: string;
    branchId?: string;
  }) {
    if (!data.code || !data.name || !data.divisionId) {
      throw new Error('Department code, name, and parent division ID are required');
    }
    return orgRepository.createDepartment(data);
  }

  async updateDepartment(id: string, updates: Partial<DbDepartment>) {
    const updated = await orgRepository.updateDepartment(id, updates);
    if (!updated) throw new Error(`Department with ID '${id}' not found`);
    return updated;
  }

  async reassignDepartmentDivision(departmentId: string, newDivisionId: string, reason?: string) {
    if (!departmentId || !newDivisionId) {
      throw new Error('Department ID and new target Division ID are required');
    }
    return orgRepository.reassignDepartmentDivision(departmentId, newDivisionId, reason);
  }

  async deactivateDepartment(id: string) {
    return orgRepository.deactivateDepartment(id);
  }

  async activateDepartment(id: string) {
    return orgRepository.activateDepartment(id);
  }

  async getEnterpriseHierarchyTree() {
    return orgRepository.getEnterpriseHierarchyTree();
  }

  // --- Master Picklists ---
  async getMasterList(category: string) {
    return orgRepository.getMasterList(category);
  }

  async createMasterRecord(category: string, data: any) {
    if (!data.name || !data.code) throw new Error('Code and Name are required for master record creation');
    return orgRepository.createMasterRecord(category, data);
  }

  async updateMasterRecord(category: string, id: string, data: any) {
    if (!category || !id) throw new Error('Category and ID are required');
    return orgRepository.updateMasterRecord(category, id, data);
  }

  async deleteMasterRecord(category: string, id: string) {
    if (!category || !id) throw new Error('Category and ID are required');
    return orgRepository.deleteMasterRecord(category, id);
  }

  async getReportingTree() {
    return orgRepository.getReportingTree();
  }

  // --- Project Department Links ---
  async getProjectDepartments(projectId: string) {
    return orgRepository.getProjectDepartments(projectId);
  }

  async assignDepartmentToProject(data: Omit<DbProjectDepartment, 'id' | 'createdAt'>) {
    return orgRepository.assignDepartmentToProject(data);
  }

  async removeDepartmentFromProject(id: string) {
    return orgRepository.removeDepartmentFromProject(id);
  }

  // --- Work Packages ---
  async getProjectWorkPackages(projectId: string) {
    return orgRepository.getProjectWorkPackages(projectId);
  }

  async createWorkPackage(data: Omit<DbProjectWorkPackage, 'id' | 'createdAt' | 'updatedAt'>) {
    return orgRepository.createWorkPackage(data);
  }

  // --- Module Assignments ---
  async getModuleAssignments(targetType?: string, targetId?: string) {
    return orgRepository.getModuleAssignments(targetType, targetId);
  }

  async assignModule(data: Omit<DbModuleAssignment, 'id' | 'createdAt' | 'updatedAt'>) {
    return orgRepository.assignModule(data);
  }
}

export const orgService = new OrgService();


