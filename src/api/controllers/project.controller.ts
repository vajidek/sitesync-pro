import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { projectService } from '../services/project.service';
import { 
  createProjectSchema, 
  updateProjectSchema, 
  createSiteSchema, 
  addProjectMemberSchema, 
  createDailyProgressSchema, 
  createTaskSchema, 
  createDocumentSchema, 
  createMilestoneSchema 
} from '../validators/project.validator';

export class ProjectController {
  async getProjects(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string;
      const status = req.query.status as string;
      const priority = req.query.priority as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await projectService.getAllProjects({ search, status, priority, page, limit });
      res.json({ success: true, data: result.projects, pagination: result.pagination });
    } catch (err) {
      next(err);
    }
  }

  async getProjectById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const project = await projectService.getProjectById(id);
      res.json({ success: true, data: project });
    } catch (err) {
      next(err);
    }
  }

  async createProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createProjectSchema.parse(req.body);
      const project = await projectService.createProject(validated);
      res.status(201).json({ success: true, data: project, message: 'Project created successfully' });
    } catch (err) {
      next(err);
    }
  }

  async updateProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validated = updateProjectSchema.parse(req.body);
      const updated = await projectService.updateProject(id, validated);
      res.json({ success: true, data: updated, message: 'Project updated successfully' });
    } catch (err) {
      next(err);
    }
  }

  async archiveProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await projectService.archiveProject(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async deleteProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await projectService.deleteProject(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async restoreProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await projectService.restoreProject(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // Dashboard
  async getProjectDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const metrics = await projectService.getDashboard(id);
      res.json({ success: true, data: metrics });
    } catch (err) {
      next(err);
    }
  }

  // Sites
  async getSites(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const sites = await projectService.getSitesByProject(projectId);
      res.json({ success: true, data: sites });
    } catch (err) {
      next(err);
    }
  }

  async createSite(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createSiteSchema.parse(req.body);
      const site = await projectService.createSite(validated);
      res.status(201).json({ success: true, data: site, message: 'Site created successfully' });
    } catch (err) {
      next(err);
    }
  }

  async updateSite(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const site = await projectService.updateSite(id, req.body);
      res.json({ success: true, data: site, message: 'Site updated successfully' });
    } catch (err) {
      next(err);
    }
  }

  // Members
  async getMembers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const members = await projectService.getMembersByProject(projectId);
      res.json({ success: true, data: members });
    } catch (err) {
      next(err);
    }
  }

  async addMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = addProjectMemberSchema.parse(req.body);
      const member = await projectService.addMember(validated);
      res.status(201).json({ success: true, data: member, message: 'Project member added' });
    } catch (err) {
      next(err);
    }
  }

  async removeMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { memberId } = req.params;
      await projectService.removeMember(memberId);
      res.json({ success: true, message: 'Member released from project' });
    } catch (err) {
      next(err);
    }
  }

  // Daily Progress
  async getDailyProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const logs = await projectService.getDailyProgress(projectId);
      res.json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  }

  async createDailyProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createDailyProgressSchema.parse(req.body);
      const user = req.user;
      const log = await projectService.createDailyProgress({
        ...validated,
        createdById: user?.id || 'usr-inc-003',
        createdByName: user?.name || 'Site Incharge',
      });
      res.status(201).json({ success: true, data: log, message: 'Daily work progress logged' });
    } catch (err) {
      next(err);
    }
  }

  async updateProgressStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = req.user || { id: 'usr-admin-001', name: 'Admin Approver' };
      const updated = await projectService.updateProgressStatus(id, status, { id: user.id, name: user.name });
      res.json({ success: true, data: updated, message: `Work log status updated to ${status}` });
    } catch (err) {
      next(err);
    }
  }

  // Tasks
  async getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const tasks = await projectService.getTasks(projectId);
      res.json({ success: true, data: tasks });
    } catch (err) {
      next(err);
    }
  }

  async createTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createTaskSchema.parse(req.body);
      const user = req.user;
      const task = await projectService.createTask({
        ...validated,
        createdById: user?.id || 'usr-mgr-002',
      });
      res.status(201).json({ success: true, data: task, message: 'Task created' });
    } catch (err) {
      next(err);
    }
  }

  async updateTaskStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const task = await projectService.updateTaskStatus(id, status);
      res.json({ success: true, data: task, message: 'Task status updated' });
    } catch (err) {
      next(err);
    }
  }

  async addTaskComment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const user = req.user || { id: 'usr-inc-003', name: 'Site Supervisor' };
      const commentObj = await projectService.addTaskComment(id, user.id, user.name, comment);
      res.status(201).json({ success: true, data: commentObj });
    } catch (err) {
      next(err);
    }
  }

  async getTaskComments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const comments = await projectService.getTaskComments(id);
      res.json({ success: true, data: comments });
    } catch (err) {
      next(err);
    }
  }

  // Documents
  async getDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const docs = await projectService.getDocuments(projectId);
      res.json({ success: true, data: docs });
    } catch (err) {
      next(err);
    }
  }

  async createDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createDocumentSchema.parse(req.body);
      const user = req.user;
      const doc = await projectService.createDocument({
        ...validated,
        uploadedById: user?.id,
        uploadedByName: user?.name,
      });
      res.status(201).json({ success: true, data: doc, message: 'Document stored' });
    } catch (err) {
      next(err);
    }
  }

  // Milestones
  async getMilestones(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const milestones = await projectService.getMilestones(projectId);
      res.json({ success: true, data: milestones });
    } catch (err) {
      next(err);
    }
  }

  async createMilestone(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createMilestoneSchema.parse(req.body);
      const milestone = await projectService.createMilestone(validated);
      res.status(201).json({ success: true, data: milestone, message: 'Milestone created' });
    } catch (err) {
      next(err);
    }
  }

  // Global Search
  async globalSearch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const q = (req.query.q as string) || '';
      const result = await projectService.globalSearch(q);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // --- PHASE 13 PROJECT ENGINE CONTROLLER METHODS ---
  async getWorkPackageTypes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const types = await projectService.getWorkPackageTypes();
      res.json({ success: true, data: types });
    } catch (err) {
      next(err);
    }
  }

  async createWorkPackageType(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const newType = await projectService.createWorkPackageType(req.body);
      res.status(201).json({ success: true, data: newType, message: 'Work package type created' });
    } catch (err) {
      next(err);
    }
  }

  async getWorkPackages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const departmentId = req.query.departmentId as string | undefined;
      const packages = await projectService.getWorkPackages(projectId, departmentId);
      res.json({ success: true, data: packages });
    } catch (err) {
      next(err);
    }
  }

  async createWorkPackage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const pkg = await projectService.createWorkPackage({ ...req.body, projectId });
      res.status(201).json({ success: true, data: pkg, message: 'Work package created' });
    } catch (err) {
      next(err);
    }
  }

  async updateWorkPackage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await projectService.updateWorkPackage(id, req.body);
      res.json({ success: true, data: updated, message: 'Work package updated' });
    } catch (err) {
      next(err);
    }
  }

  async deleteWorkPackage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await projectService.deleteWorkPackage(id);
      res.json({ success: true, message: 'Work package deactivated' });
    } catch (err) {
      next(err);
    }
  }

  async getActivities(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workPackageId } = req.params;
      const activities = await projectService.getActivities(workPackageId);
      res.json({ success: true, data: activities });
    } catch (err) {
      next(err);
    }
  }

  async createActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workPackageId } = req.params;
      const act = await projectService.createActivity({ ...req.body, workPackageId });
      res.status(201).json({ success: true, data: act, message: 'Activity created' });
    } catch (err) {
      next(err);
    }
  }

  async updateActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await projectService.updateActivity(id, req.body);
      res.json({ success: true, data: updated, message: 'Activity updated' });
    } catch (err) {
      next(err);
    }
  }

  async deleteActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await projectService.deleteActivity(id);
      res.json({ success: true, message: 'Activity removed' });
    } catch (err) {
      next(err);
    }
  }

  async getProjectSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const settings = await projectService.getProjectSettings(projectId);
      res.json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  }

  async updateProjectSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const updated = await projectService.updateProjectSettings(projectId, req.body);
      res.json({ success: true, data: updated, message: 'Project settings updated' });
    } catch (err) {
      next(err);
    }
  }

  // --- PHASE 51 EXTENSIONS ---
  async checkCodeExists(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const code = req.query.code as string;
      const excludeId = req.query.excludeId as string | undefined;
      const exists = await projectService.checkCodeExists(code, excludeId);
      res.json({ success: true, exists });
    } catch (err) {
      next(err);
    }
  }

  async checkWorkOrderExists(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const woNumber = req.query.woNumber as string;
      const excludeId = req.query.excludeId as string | undefined;
      const exists = await projectService.checkWorkOrderExists(woNumber, excludeId);
      res.json({ success: true, exists });
    } catch (err) {
      next(err);
    }
  }

  async checkAgreementExists(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const agreementNumber = req.query.agreementNumber as string;
      const excludeId = req.query.excludeId as string | undefined;
      const exists = await projectService.checkAgreementExists(agreementNumber, excludeId);
      res.json({ success: true, exists });
    } catch (err) {
      next(err);
    }
  }

  async getSubProjects(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const subProjects = await projectService.getSubProjects(projectId);
      res.json({ success: true, data: subProjects });
    } catch (err) {
      next(err);
    }
  }

  // Structure Hierarchy
  async getProjectStructures(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const structures = await projectService.getProjectStructures(projectId);
      res.json({ success: true, data: structures });
    } catch (err) {
      next(err);
    }
  }

  async createProjectStructure(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const structure = await projectService.createProjectStructure({ ...req.body, projectId });
      res.status(201).json({ success: true, data: structure, message: 'Structure added successfully' });
    } catch (err) {
      next(err);
    }
  }

  async updateProjectStructure(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await projectService.updateProjectStructure(id, req.body);
      res.json({ success: true, data: updated, message: 'Structure updated successfully' });
    } catch (err) {
      next(err);
    }
  }

  async deleteProjectStructure(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await projectService.deleteProjectStructure(id);
      res.json({ success: true, message: 'Structure removed successfully' });
    } catch (err) {
      next(err);
    }
  }

  // Project Departments
  async getProjectDepartments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const deps = await projectService.getProjectDepartments(projectId);
      res.json({ success: true, data: deps });
    } catch (err) {
      next(err);
    }
  }

  async addProjectDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const dep = await projectService.addProjectDepartment({ ...req.body, projectId });
      res.status(201).json({ success: true, data: dep, message: 'Department assigned to project' });
    } catch (err) {
      next(err);
    }
  }

  async removeProjectDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await projectService.removeProjectDepartment(id);
      res.json({ success: true, message: 'Department removed from project' });
    } catch (err) {
      next(err);
    }
  }

  // Master Data Engine
  async getFundingAgencies(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await projectService.getFundingAgencies();
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }

  async createFundingAgency(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const item = await projectService.createFundingAgency(req.body);
      res.status(201).json({ success: true, data: item, message: 'Funding agency added' });
    } catch (err) {
      next(err);
    }
  }

  async getConsultants(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await projectService.getConsultants();
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }

  async createConsultant(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const item = await projectService.createConsultant(req.body);
      res.status(201).json({ success: true, data: item, message: 'Consultant added' });
    } catch (err) {
      next(err);
    }
  }

  async getClients(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await projectService.getClients();
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }

  async createClient(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const item = await projectService.createClient(req.body);
      res.status(201).json({ success: true, data: item, message: 'Client added' });
    } catch (err) {
      next(err);
    }
  }

  async getCurrencies(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await projectService.getCurrencies();
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }

  async createCurrency(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const item = await projectService.createCurrency(req.body);
      res.status(201).json({ success: true, data: item, message: 'Currency added' });
    } catch (err) {
      next(err);
    }
  }

  async getProjectPriorities(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await projectService.getProjectPriorities();
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }

  async createProjectPriority(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const item = await projectService.createProjectPriority(req.body);
      res.status(201).json({ success: true, data: item, message: 'Priority level added' });
    } catch (err) {
      next(err);
    }
  }

  async getProjectStatuses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await projectService.getProjectStatuses();
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }

  async createProjectStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const item = await projectService.createProjectStatus(req.body);
      res.status(201).json({ success: true, data: item, message: 'Project status added' });
    } catch (err) {
      next(err);
    }
  }

  async getProjectCategories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await projectService.getProjectCategories();
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }

  async createProjectCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const item = await projectService.createProjectCategory(req.body);
      res.status(201).json({ success: true, data: item, message: 'Project category added' });
    } catch (err) {
      next(err);
    }
  }

  async getProjectTypes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await projectService.getProjectTypes();
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }

  async createProjectType(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const item = await projectService.createProjectType(req.body);
      res.status(201).json({ success: true, data: item, message: 'Project type added' });
    } catch (err) {
      next(err);
    }
  }

  async getContractTypes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await projectService.getContractTypes();
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }

  async createContractType(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const item = await projectService.createContractType(req.body);
      res.status(201).json({ success: true, data: item, message: 'Contract type added' });
    } catch (err) {
      next(err);
    }
  }

  async getCommercialCostControl(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await projectService.getCommercialCostControl(id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

export const projectController = new ProjectController();
