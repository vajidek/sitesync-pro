import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { masterService } from '../services/master.service';

export class MasterController {
  // Companies
  async listCompanies(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await masterService.listCompanies(req.query as any);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async getCompanyById(req: AuthenticatedRequest, res: Response) {
    try {
      const company = await masterService.getCompany(req.params.id);
      res.json({ success: true, data: company });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  }

  async createCompany(req: AuthenticatedRequest, res: Response) {
    try {
      const company = await masterService.createCompany(req.body);
      res.status(201).json({ success: true, data: company });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async updateCompany(req: AuthenticatedRequest, res: Response) {
    try {
      const company = await masterService.updateCompany(req.params.id, req.body);
      res.json({ success: true, data: company });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async deleteCompany(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await masterService.deleteCompany(req.params.id);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  // Branches & Structure
  async listBranches(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await masterService.listBranches(req.query as any);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async getBranchById(req: AuthenticatedRequest, res: Response) {
    try {
      const branch = await masterService.getBranch(req.params.id);
      res.json({ success: true, data: branch });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  }

  async createBranch(req: AuthenticatedRequest, res: Response) {
    try {
      const branch = await masterService.createBranch(req.body);
      res.status(201).json({ success: true, data: branch });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async updateBranch(req: AuthenticatedRequest, res: Response) {
    try {
      const branch = await masterService.updateBranch(req.params.id, req.body);
      res.json({ success: true, data: branch });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async deleteBranch(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await masterService.deleteBranch(req.params.id);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async listDepartments(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await masterService.listDepartments(req.query as any);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async getDepartmentById(req: AuthenticatedRequest, res: Response) {
    try {
      const dept = await masterService.getDepartment(req.params.id);
      res.json({ success: true, data: dept });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  }

  async createDepartment(req: AuthenticatedRequest, res: Response) {
    try {
      const dept = await masterService.createDepartment(req.body);
      res.status(201).json({ success: true, data: dept });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async updateDepartment(req: AuthenticatedRequest, res: Response) {
    try {
      const dept = await masterService.updateDepartment(req.params.id, req.body);
      res.json({ success: true, data: dept });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async deleteDepartment(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await masterService.deleteDepartment(req.params.id);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async listDesignations(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await masterService.listDesignations(req.query as any);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async getDesignationById(req: AuthenticatedRequest, res: Response) {
    try {
      const desig = await masterService.getDesignation(req.params.id);
      res.json({ success: true, data: desig });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  }

  async createDesignation(req: AuthenticatedRequest, res: Response) {
    try {
      const desig = await masterService.createDesignation(req.body);
      res.status(201).json({ success: true, data: desig });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async updateDesignation(req: AuthenticatedRequest, res: Response) {
    try {
      const desig = await masterService.updateDesignation(req.params.id, req.body);
      res.json({ success: true, data: desig });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async deleteDesignation(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await masterService.deleteDesignation(req.params.id);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  // Master Data Categories
  async listShifts(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await masterService.getShifts();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async createShift(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await masterService.createShift(req.body);
      res.status(201).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async listEmploymentTypes(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await masterService.getEmploymentTypesMaster();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async createEmploymentType(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await masterService.createEmploymentTypeMaster(req.body);
      res.status(201).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async listHolidayCalendars(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await masterService.getHolidayCalendars();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async createHolidayCalendar(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await masterService.createHolidayCalendar(req.body);
      res.status(201).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async listSkills(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await masterService.getSkillsMaster();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async createSkill(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await masterService.createSkillMaster(req.body);
      res.status(201).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async listEmployeeCategories(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await masterService.getEmployeeCategories();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async createEmployeeCategory(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await masterService.createEmployeeCategory(req.body);
      res.status(201).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async listVendorCategories(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await masterService.getVendorCategoriesMaster();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async createVendorCategory(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await masterService.createVendorCategoryMaster(req.body);
      res.status(201).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async listVehicleCategories(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await masterService.getVehicleCategoriesMaster();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async createVehicleCategory(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await masterService.createVehicleCategoryMaster(req.body);
      res.status(201).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async listEquipmentCategories(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await masterService.getEquipmentCategoriesMaster();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async createEquipmentCategory(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await masterService.createEquipmentCategoryMaster(req.body);
      res.status(201).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  // Employees
  async listEmployees(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await masterService.listEmployees(req.query as any);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async getEmployeeById(req: AuthenticatedRequest, res: Response) {
    try {
      const employee = await masterService.getEmployee(req.params.id);
      res.json({ success: true, data: employee });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  }

  async createEmployee(req: AuthenticatedRequest, res: Response) {
    try {
      const employee = await masterService.createEmployee(req.body);
      res.status(201).json({ success: true, data: employee });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async updateEmployee(req: AuthenticatedRequest, res: Response) {
    try {
      const employee = await masterService.updateEmployee(req.params.id, req.body);
      res.json({ success: true, data: employee });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async deleteEmployee(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await masterService.deleteEmployee(req.params.id);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  // Projects & Sites
  async listProjects(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await masterService.listProjects(req.query as any);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async getProjectById(req: AuthenticatedRequest, res: Response) {
    try {
      const project = await masterService.getProject(req.params.id);
      res.json({ success: true, data: project });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  }

  async createProject(req: AuthenticatedRequest, res: Response) {
    try {
      const project = await masterService.createProject(req.body);
      res.status(201).json({ success: true, data: project });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async listSites(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await masterService.listSites(req.query as any);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Third party
  async listContractors(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await masterService.listContractors(req.query as any);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async listVendors(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await masterService.listVendors(req.query as any);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async listCustomers(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await masterService.listCustomers(req.query as any);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Materials, Stock & Warehouses
  async listMaterials(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await masterService.listMaterials(req.query as any);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async listMaterialCategories(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await masterService.listMaterialCategories(req.query as any);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async listMaterialUnits(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await masterService.listMaterialUnits(req.query as any);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async listWarehouses(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await masterService.listWarehouses(req.query as any);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async listStocks(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await masterService.listStocks(req.query as any);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Plant & Equipment
  async listEquipment(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await masterService.listEquipment(req.query as any);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async listVehicles(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await masterService.listVehicles(req.query as any);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Documents
  async listDocuments(req: AuthenticatedRequest, res: Response) {
    try {
      const { entityType, entityId } = req.params;
      const documents = await masterService.getEntityDocuments(entityType, entityId);
      res.json({ success: true, data: documents });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async createDocument(req: AuthenticatedRequest, res: Response) {
    try {
      const doc = await masterService.attachDocument(req.body, req.user?.id);
      res.status(201).json({ success: true, data: doc });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}

export const masterController = new MasterController();
