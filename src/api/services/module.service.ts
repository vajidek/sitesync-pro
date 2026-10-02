import { moduleRepository, CreateModuleDto, CreateSubModuleDto, CreateFeatureDto } from '../repositories/module.repository';

export class ModuleService {
  async getModules() {
    return moduleRepository.getModules();
  }

  async getModuleById(id: string) {
    return moduleRepository.getModuleById(id);
  }

  async createModule(data: CreateModuleDto) {
    return moduleRepository.createModule(data);
  }

  async updateModule(id: string, updates: Partial<CreateModuleDto> & { isEnabled?: boolean }) {
    return moduleRepository.updateModule(id, updates);
  }

  async archiveModule(id: string) {
    return moduleRepository.archiveModule(id);
  }

  async getSubModules(moduleId?: string) {
    return moduleRepository.getSubModules(moduleId);
  }

  async createSubModule(data: CreateSubModuleDto) {
    return moduleRepository.createSubModule(data);
  }

  async updateSubModule(id: string, updates: any) {
    return moduleRepository.updateSubModule(id, updates);
  }

  async archiveSubModule(id: string) {
    return moduleRepository.archiveSubModule(id);
  }

  async getFeatures(subModuleId?: string) {
    return moduleRepository.getFeatures(subModuleId);
  }

  async createFeature(data: CreateFeatureDto) {
    return moduleRepository.createFeature(data);
  }

  async updateFeature(id: string, updates: any) {
    return moduleRepository.updateFeature(id, updates);
  }

  async archiveFeature(id: string) {
    return moduleRepository.archiveFeature(id);
  }

  async getSidebarTree(userRole: string, departmentId?: string, projectId?: string, userId?: string) {
    return moduleRepository.getSidebarTree(userRole, departmentId, projectId, userId);
  }

  async getDashboardWidgets(moduleCode?: string) {
    return moduleRepository.getDashboardWidgets(moduleCode);
  }

  async registerDashboardWidget(data: { moduleCode: string; title: string; widgetType: string; configJson?: any; displayOrder?: number }) {
    return moduleRepository.registerDashboardWidget(data);
  }
}

export const moduleService = new ModuleService();
