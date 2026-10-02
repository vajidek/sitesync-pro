import { projectRepository, DbProject, DbSite, DbDailyProgress, DbTask, DbProjectDocument, DbProjectMilestone, DbProjectMember } from '../repositories/project.repository';

export class ProjectService {
  async getAllProjects(params: { search?: string; status?: string; priority?: string; page?: number; limit?: number }) {
    return projectRepository.findAllProjects(params);
  }

  async getProjectById(id: string) {
    const project = await projectRepository.findProjectById(id);
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  }

  async createProject(data: Partial<DbProject>) {
    return projectRepository.createProject(data);
  }

  async updateProject(id: string, updates: Partial<DbProject>) {
    const updated = await projectRepository.updateProject(id, updates);
    if (!updated) {
      throw new Error('Project not found or failed to update');
    }
    return updated;
  }

  async archiveProject(id: string) {
    const success = await projectRepository.archiveProject(id);
    if (!success) {
      throw new Error('Project not found');
    }
    return { success: true, message: 'Project archived successfully' };
  }

  async deleteProject(id: string) {
    const success = await projectRepository.deleteProject(id);
    if (!success) {
      throw new Error('Project not found');
    }
    return { success: true, message: 'Project deleted (soft delete) successfully' };
  }

  async restoreProject(id: string) {
    const success = await projectRepository.restoreProject(id);
    if (!success) {
      throw new Error('Project not found');
    }
    return { success: true, message: 'Project restored successfully' };
  }

  // Sites
  async getSitesByProject(projectId: string) {
    return projectRepository.findSitesByProjectId(projectId);
  }

  async createSite(data: Partial<DbSite>) {
    return projectRepository.createSite(data);
  }

  async updateSite(id: string, updates: Partial<DbSite>) {
    const updated = await projectRepository.updateSite(id, updates);
    if (!updated) {
      throw new Error('Site not found');
    }
    return updated;
  }

  // Members
  async getMembersByProject(projectId: string) {
    return projectRepository.findMembersByProjectId(projectId);
  }

  async addMember(data: Partial<DbProjectMember>) {
    return projectRepository.addProjectMember(data);
  }

  async removeMember(memberId: string) {
    return projectRepository.removeProjectMember(memberId);
  }

  // Daily Progress
  async getDailyProgress(projectId: string) {
    return projectRepository.findDailyProgressByProject(projectId);
  }

  async createDailyProgress(data: Partial<DbDailyProgress>) {
    return projectRepository.createDailyProgress(data);
  }

  async updateProgressStatus(id: string, status: 'VERIFIED' | 'APPROVED' | 'REJECTED', user: { id: string; name: string }) {
    return projectRepository.updateDailyProgressStatus(id, status, user);
  }

  // Tasks
  async getTasks(projectId: string) {
    return projectRepository.findTasksByProject(projectId);
  }

  async createTask(data: Partial<DbTask>) {
    return projectRepository.createTask(data);
  }

  async updateTaskStatus(id: string, status: DbTask['status']) {
    return projectRepository.updateTaskStatus(id, status);
  }

  async addTaskComment(taskId: string, userId: string, userName: string, comment: string) {
    return projectRepository.addTaskComment(taskId, userId, userName, comment);
  }

  async getTaskComments(taskId: string) {
    return projectRepository.findTaskComments(taskId);
  }

  // Documents
  async getDocuments(projectId: string) {
    return projectRepository.findDocumentsByProject(projectId);
  }

  async createDocument(data: Partial<DbProjectDocument>) {
    return projectRepository.createDocument(data);
  }

  // Milestones
  async getMilestones(projectId: string) {
    return projectRepository.findMilestonesByProject(projectId);
  }

  async createMilestone(data: Partial<DbProjectMilestone>) {
    return projectRepository.createMilestone(data);
  }

  // Dashboard Aggregated Metrics
  async getDashboard(projectId: string) {
    const metrics = await projectRepository.getProjectDashboardMetrics(projectId);
    if (!metrics) {
      throw new Error('Project metrics not found');
    }
    return metrics;
  }

  // Global Search
  async globalSearch(query: string) {
    return projectRepository.globalSearch(query);
  }

  // --- PHASE 13 PROJECT ENGINE SERVICES ---
  async getWorkPackageTypes() {
    return projectRepository.getWorkPackageTypes();
  }

  async createWorkPackageType(data: { typeCode: string; name: string; description?: string }) {
    return projectRepository.createWorkPackageType(data);
  }

  async getWorkPackages(projectId: string, departmentId?: string) {
    return projectRepository.getProjectWorkPackages(projectId, departmentId);
  }

  async createWorkPackage(data: any) {
    return projectRepository.createWorkPackage(data);
  }

  async updateWorkPackage(id: string, updates: any) {
    return projectRepository.updateWorkPackage(id, updates);
  }

  async deleteWorkPackage(id: string) {
    return projectRepository.deleteWorkPackage(id);
  }

  async getActivities(workPackageId: string, projectId?: string) {
    return projectRepository.getActivities(workPackageId, projectId);
  }

  async createActivity(data: any) {
    return projectRepository.createActivity(data);
  }

  async updateActivity(id: string, updates: any) {
    return projectRepository.updateActivity(id, updates);
  }

  async deleteActivity(id: string) {
    return projectRepository.deleteActivity(id);
  }

  async getProjectSettings(projectId: string) {
    return projectRepository.getProjectSettings(projectId);
  }

  async updateProjectSettings(projectId: string, updates: any) {
    return projectRepository.updateProjectSettings(projectId, updates);
  }

  // --- PHASE 51 EXTENSIONS ---
  async checkCodeExists(code: string, excludeId?: string) {
    return projectRepository.checkProjectCodeExists(code, excludeId);
  }

  async checkWorkOrderExists(woNumber: string, excludeId?: string) {
    return projectRepository.checkWorkOrderNumberExists(woNumber, excludeId);
  }

  async checkAgreementExists(agreementNumber: string, excludeId?: string) {
    return projectRepository.checkAgreementNumberExists(agreementNumber, excludeId);
  }

  async getSubProjects(parentProjectId: string) {
    return projectRepository.findSubProjectsByParentId(parentProjectId);
  }

  // Structure Hierarchy
  async getProjectStructures(projectId: string) {
    return projectRepository.findStructuresByProjectId(projectId);
  }

  async createProjectStructure(data: any) {
    return projectRepository.createStructure(data);
  }

  async updateProjectStructure(id: string, updates: any) {
    return projectRepository.updateStructure(id, updates);
  }

  async deleteProjectStructure(id: string) {
    return projectRepository.deleteStructure(id);
  }

  // Project Departments
  async getProjectDepartments(projectId: string) {
    return projectRepository.findDepartmentsByProjectId(projectId);
  }

  async addProjectDepartment(data: any) {
    return projectRepository.addProjectDepartment(data);
  }

  async removeProjectDepartment(id: string) {
    return projectRepository.removeProjectDepartment(id);
  }

  // Master Data Engine
  async getFundingAgencies() {
    return projectRepository.getFundingAgencies();
  }

  async createFundingAgency(data: any) {
    return projectRepository.createFundingAgency(data);
  }

  async getConsultants() {
    return projectRepository.getConsultants();
  }

  async createConsultant(data: any) {
    return projectRepository.createConsultant(data);
  }

  async getClients() {
    return projectRepository.getClients();
  }

  async createClient(data: any) {
    return projectRepository.createClient(data);
  }

  async getCurrencies() {
    return projectRepository.getCurrencies();
  }

  async createCurrency(data: any) {
    return projectRepository.createCurrency(data);
  }

  async getProjectPriorities() {
    return projectRepository.getProjectPriorities();
  }

  async createProjectPriority(data: any) {
    return projectRepository.createProjectPriority(data);
  }

  async getProjectStatuses() {
    return projectRepository.getProjectStatuses();
  }

  async createProjectStatus(data: any) {
    return projectRepository.createProjectStatus(data);
  }

  async getProjectCategories() {
    return projectRepository.getProjectCategories();
  }

  async createProjectCategory(data: any) {
    return projectRepository.createProjectCategory(data);
  }

  async getProjectTypes() {
    return projectRepository.getProjectTypes();
  }

  async createProjectType(data: any) {
    return projectRepository.createProjectType(data);
  }

  async getContractTypes() {
    return projectRepository.getContractTypes();
  }

  async createContractType(data: any) {
    return projectRepository.createContractType(data);
  }

  async getCommercialCostControl(projectId: string) {
    const data = await projectRepository.getCommercialCostControl(projectId);
    if (!data) {
      throw new Error('Project not found for commercial cost control');
    }
    return data;
  }
}

export const projectService = new ProjectService();
