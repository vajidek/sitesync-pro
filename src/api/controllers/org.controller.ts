import { Request, Response } from 'express';
import { orgService } from '../services/org.service';
import { PaginationParams } from '../utils/pagination';

export class OrgController {
  async getOrgUnits(req: Request, res: Response) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const search = req.query.search as string | undefined;
      const unitType = req.query.unitType as string | undefined;
      const parentId = req.query.parentId as string | undefined;

      const params: PaginationParams = { page, limit, search };
      const result = await orgService.getOrgUnits({ ...params, unitType, parentId });
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch org units' });
    }
  }

  async getOrgUnitTree(req: Request, res: Response) {
    try {
      const tree = await orgService.getOrgUnitTree();
      res.json({ success: true, data: tree });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch org tree' });
    }
  }

  async getOrgUnitById(req: Request, res: Response) {
    try {
      const unit = await orgService.getOrgUnitById(req.params.id);
      res.json({ success: true, data: unit });
    } catch (err: any) {
      res.status(404).json({ success: false, message: err.message || 'Org unit not found' });
    }
  }

  async createOrgUnit(req: Request, res: Response) {
    try {
      const newUnit = await orgService.createOrgUnit(req.body);
      res.status(201).json({ success: true, data: newUnit, message: 'Organization unit created successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to create org unit' });
    }
  }

  async updateOrgUnit(req: Request, res: Response) {
    try {
      const updated = await orgService.updateOrgUnit(req.params.id, req.body);
      res.json({ success: true, data: updated, message: 'Organization unit updated successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to update org unit' });
    }
  }

  async softDeleteOrgUnit(req: Request, res: Response) {
    try {
      await orgService.softDeleteOrgUnit(req.params.id);
      res.json({ success: true, message: 'Organization unit deactivated successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to deactivate org unit' });
    }
  }

  async moveOrgUnit(req: Request, res: Response) {
    try {
      const { id, newParentId } = req.body;
      const updated = await orgService.moveOrgUnit(id, newParentId);
      res.json({ success: true, data: updated, message: 'Department moved successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to move department' });
    }
  }

  async mergeOrgUnits(req: Request, res: Response) {
    try {
      const { sourceId, targetId } = req.body;
      await orgService.mergeOrgUnits(sourceId, targetId);
      res.json({ success: true, message: 'Departments merged successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to merge departments' });
    }
  }

  async bulkImportOrgUnits(req: Request, res: Response) {
    try {
      const { items } = req.body;
      const result = await orgService.bulkImportOrgUnits(items);
      res.json({ success: true, ...result, message: `${result.importedCount} organization units imported successfully` });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to import org units' });
    }
  }

  async getMasterList(req: Request, res: Response) {
    try {
      const list = await orgService.getMasterList(req.params.category);
      res.json({ success: true, data: list });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // =========================================================================
  // DIVISION CONTROLLER
  // =========================================================================

  async getDivisions(req: Request, res: Response) {
    try {
      const search = req.query.search as string | undefined;
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
      const data = await orgService.getDivisions({ search, isActive });
      res.json({ success: true, data, count: data.length });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch divisions' });
    }
  }

  async getDivisionById(req: Request, res: Response) {
    try {
      const data = await orgService.getDivisionById(req.params.id);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(404).json({ success: false, message: err.message || 'Division not found' });
    }
  }

  async createDivision(req: Request, res: Response) {
    try {
      const data = await orgService.createDivision(req.body);
      res.status(201).json({ success: true, data, message: 'Division created successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to create division' });
    }
  }

  async updateDivision(req: Request, res: Response) {
    try {
      const data = await orgService.updateDivision(req.params.id, req.body);
      res.json({ success: true, data, message: 'Division updated successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to update division' });
    }
  }

  async deactivateDivision(req: Request, res: Response) {
    try {
      const force = req.query.force === 'true' || req.body.force === true;
      const result = await orgService.deactivateDivision(req.params.id, force);
      if (!result.success) {
        return res.status(400).json({ success: false, ...result });
      }
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to deactivate division' });
    }
  }

  async activateDivision(req: Request, res: Response) {
    try {
      await orgService.activateDivision(req.params.id);
      res.json({ success: true, message: 'Division activated successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to activate division' });
    }
  }

  // =========================================================================
  // DEPARTMENT CONTROLLER & SAFE REASSIGNMENT
  // =========================================================================

  async getDepartments(req: Request, res: Response) {
    try {
      const divisionId = req.query.divisionId as string | undefined;
      const search = req.query.search as string | undefined;
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
      const data = await orgService.getDepartments({ divisionId, search, isActive });
      res.json({ success: true, data, count: data.length });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch departments' });
    }
  }

  async getDepartmentById(req: Request, res: Response) {
    try {
      const data = await orgService.getDepartmentById(req.params.id);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(404).json({ success: false, message: err.message || 'Department not found' });
    }
  }

  async createDepartment(req: Request, res: Response) {
    try {
      const data = await orgService.createDepartment(req.body);
      res.status(201).json({ success: true, data, message: 'Department created successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to create department' });
    }
  }

  async updateDepartment(req: Request, res: Response) {
    try {
      const data = await orgService.updateDepartment(req.params.id, req.body);
      res.json({ success: true, data, message: 'Department updated successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to update department' });
    }
  }

  async reassignDepartmentDivision(req: Request, res: Response) {
    try {
      const departmentId = req.params.id || req.body.departmentId;
      const { newDivisionId, reason } = req.body;
      const data = await orgService.reassignDepartmentDivision(departmentId, newDivisionId, reason);
      res.json({
        success: true,
        data,
        message: `Department '${data.name}' successfully reassigned to division '${data.divisionName}'`,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to reassign department' });
    }
  }

  async deactivateDepartment(req: Request, res: Response) {
    try {
      const result = await orgService.deactivateDepartment(req.params.id);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to deactivate department' });
    }
  }

  async activateDepartment(req: Request, res: Response) {
    try {
      await orgService.activateDepartment(req.params.id);
      res.json({ success: true, message: 'Department activated successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to activate department' });
    }
  }

  async getEnterpriseHierarchyTree(req: Request, res: Response) {
    try {
      const tree = await orgService.getEnterpriseHierarchyTree();
      res.json({ success: true, data: tree });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch enterprise tree' });
    }
  }

  async createMasterRecord(req: Request, res: Response) {
    try {
      const record = await orgService.createMasterRecord(req.params.category, req.body);
      res.status(201).json({ success: true, data: record, message: 'Master record created successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateMasterRecord(req: Request, res: Response) {
    try {
      const record = await orgService.updateMasterRecord(req.params.category, req.params.id, req.body);
      res.json({ success: true, data: record, message: 'Master record updated successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async deleteMasterRecord(req: Request, res: Response) {
    try {
      const record = await orgService.deleteMasterRecord(req.params.category, req.params.id);
      res.json({ success: true, data: record, message: 'Master record deactivated successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getReportingTree(req: Request, res: Response) {
    try {
      const tree = await orgService.getReportingTree();
      res.json({ success: true, data: tree });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }


  // --- Project Department Links ---
  async getProjectDepartments(req: Request, res: Response) {
    try {
      const list = await orgService.getProjectDepartments(req.params.projectId);
      res.json({ success: true, data: list });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async assignDepartmentToProject(req: Request, res: Response) {
    try {
      const data = await orgService.assignDepartmentToProject({ ...req.body, projectId: req.params.projectId });
      res.status(201).json({ success: true, data, message: 'Department assigned to project' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async removeDepartmentFromProject(req: Request, res: Response) {
    try {
      await orgService.removeDepartmentFromProject(req.params.id);
      res.json({ success: true, message: 'Department removed from project' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // --- Work Packages ---
  async getProjectWorkPackages(req: Request, res: Response) {
    try {
      const list = await orgService.getProjectWorkPackages(req.params.projectId);
      res.json({ success: true, data: list });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async createWorkPackage(req: Request, res: Response) {
    try {
      const pkg = await orgService.createWorkPackage({ ...req.body, projectId: req.params.projectId });
      res.status(201).json({ success: true, data: pkg, message: 'Work package created' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // --- Module Assignments ---
  async getModuleAssignments(req: Request, res: Response) {
    try {
      const { targetType, targetId } = req.query as { targetType?: string; targetId?: string };
      const list = await orgService.getModuleAssignments(targetType, targetId);
      res.json({ success: true, data: list });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async assignModule(req: Request, res: Response) {
    try {
      const assignment = await orgService.assignModule(req.body);
      res.status(201).json({ success: true, data: assignment, message: 'Module assigned successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

export const orgController = new OrgController();
