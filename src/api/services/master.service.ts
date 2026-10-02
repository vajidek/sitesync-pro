import { masterRepository } from '../repositories/master.repository';
import { PaginationParams } from '../utils/pagination';

export class MasterService {
  async listCompanies(params: PaginationParams) {
    return masterRepository.getCompanies(params);
  }

  async getCompany(id: string) {
    const company = await masterRepository.getCompanyById(id);
    if (!company) {
      throw new Error('Company not found');
    }
    return company;
  }

  async createCompany(data: any) {
    return masterRepository.createCompany(data);
  }

  async updateCompany(id: string, updates: any) {
    const updated = await masterRepository.updateCompany(id, updates);
    if (!updated) {
      throw new Error('Company not found');
    }
    return updated;
  }

  async deleteCompany(id: string) {
    const success = await masterRepository.deleteCompany(id);
    if (!success) {
      throw new Error('Company not found');
    }
    return { success: true };
  }

  async listBranches(params: PaginationParams) {
    return masterRepository.getBranches(params);
  }

  async getBranch(id: string) {
    const branch = await masterRepository.getBranchById(id);
    if (!branch) {
      throw new Error('Branch not found');
    }
    return branch;
  }

  async createBranch(data: any) {
    return masterRepository.createBranch(data);
  }

  async updateBranch(id: string, updates: any) {
    const updated = await masterRepository.updateBranch(id, updates);
    if (!updated) {
      throw new Error('Branch not found');
    }
    return updated;
  }

  async deleteBranch(id: string) {
    const success = await masterRepository.deleteBranch(id);
    if (!success) {
      throw new Error('Branch not found');
    }
    return { success: true };
  }

  async listDepartments(params: PaginationParams) {
    return masterRepository.getDepartments(params);
  }

  async getDepartment(id: string) {
    const dept = await masterRepository.getDepartmentById(id);
    if (!dept) {
      throw new Error('Department not found');
    }
    return dept;
  }

  async createDepartment(data: any) {
    return masterRepository.createDepartment(data);
  }

  async updateDepartment(id: string, updates: any) {
    const updated = await masterRepository.updateDepartment(id, updates);
    if (!updated) {
      throw new Error('Department not found');
    }
    return updated;
  }

  async deleteDepartment(id: string) {
    const success = await masterRepository.deleteDepartment(id);
    if (!success) {
      throw new Error('Department not found');
    }
    return { success: true };
  }

  async listDesignations(params: PaginationParams) {
    return masterRepository.getDesignations(params);
  }

  async getDesignation(id: string) {
    const desig = await masterRepository.getDesignationById(id);
    if (!desig) {
      throw new Error('Designation not found');
    }
    return desig;
  }

  async createDesignation(data: any) {
    return masterRepository.createDesignation(data);
  }

  async updateDesignation(id: string, updates: any) {
    const updated = await masterRepository.updateDesignation(id, updates);
    if (!updated) {
      throw new Error('Designation not found');
    }
    return updated;
  }

  async deleteDesignation(id: string) {
    const success = await masterRepository.deleteDesignation(id);
    if (!success) {
      throw new Error('Designation not found');
    }
    return { success: true };
  }

  // --- Master Data Categories (13 Master Categories) ---
  async getShifts() { return masterRepository.getShifts(); }
  async createShift(data: any) { return masterRepository.createShift(data); }

  async getEmploymentTypesMaster() { return masterRepository.getEmploymentTypesMaster(); }
  async createEmploymentTypeMaster(data: any) { return masterRepository.createEmploymentTypeMaster(data); }

  async getHolidayCalendars() { return masterRepository.getHolidayCalendars(); }
  async createHolidayCalendar(data: any) { return masterRepository.createHolidayCalendar(data); }

  async getSkillsMaster() { return masterRepository.getSkillsMaster(); }
  async createSkillMaster(data: any) { return masterRepository.createSkillMaster(data); }

  async getEmployeeCategories() { return masterRepository.getEmployeeCategories(); }
  async createEmployeeCategory(data: any) { return masterRepository.createEmployeeCategory(data); }

  async getVendorCategoriesMaster() { return masterRepository.getVendorCategoriesMaster(); }
  async createVendorCategoryMaster(data: any) { return masterRepository.createVendorCategoryMaster(data); }

  async getVehicleCategoriesMaster() { return masterRepository.getVehicleCategoriesMaster(); }
  async createVehicleCategoryMaster(data: any) { return masterRepository.createVehicleCategoryMaster(data); }

  async getEquipmentCategoriesMaster() { return masterRepository.getEquipmentCategoriesMaster(); }
  async createEquipmentCategoryMaster(data: any) { return masterRepository.createEquipmentCategoryMaster(data); }

  async listEmployees(params: PaginationParams) {
    return masterRepository.getEmployees(params);
  }

  async getEmployee(id: string) {
    const employee = await masterRepository.getEmployeeById(id);
    if (!employee) {
      throw new Error('Employee not found');
    }
    return employee;
  }

  async createEmployee(data: any) {
    return masterRepository.createEmployee(data);
  }

  async updateEmployee(id: string, updates: any) {
    const updated = await masterRepository.updateEmployee(id, updates);
    if (!updated) {
      throw new Error('Employee not found');
    }
    return updated;
  }

  async deleteEmployee(id: string) {
    const success = await masterRepository.deleteEmployee(id);
    if (!success) {
      throw new Error('Employee not found');
    }
    return { success: true };
  }

  async listProjects(params: PaginationParams) {
    return masterRepository.getProjects(params);
  }

  async getProject(id: string) {
    const project = await masterRepository.getProjectById(id);
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  }

  async createProject(data: any) {
    return masterRepository.createProject(data);
  }

  async listSites(params: PaginationParams) {
    return masterRepository.getSites(params);
  }

  async listContractors(params: PaginationParams) {
    return masterRepository.getContractors(params);
  }

  async listVendors(params: PaginationParams) {
    return masterRepository.getVendors(params);
  }

  async listCustomers(params: PaginationParams) {
    return masterRepository.getCustomers(params);
  }

  async listMaterials(params: PaginationParams) {
    return masterRepository.getMaterials(params);
  }

  async listMaterialCategories(params: PaginationParams) {
    return masterRepository.getMaterialCategories(params);
  }

  async listMaterialUnits(params: PaginationParams) {
    return masterRepository.getMaterialUnits(params);
  }

  async listWarehouses(params: PaginationParams) {
    return masterRepository.getWarehouses(params);
  }

  async listStocks(params: PaginationParams) {
    return masterRepository.getStocks(params);
  }

  async listEquipment(params: PaginationParams) {
    return masterRepository.getEquipment(params);
  }

  async listVehicles(params: PaginationParams) {
    return masterRepository.getVehicles(params);
  }

  async getEntityDocuments(entityType: any, entityId: string) {
    return masterRepository.getDocumentsByEntity(entityType, entityId);
  }

  async attachDocument(data: any, userId?: string) {
    return masterRepository.createDocument({
      ...data,
      uploadedById: userId,
    });
  }
}

export const masterService = new MasterService();
