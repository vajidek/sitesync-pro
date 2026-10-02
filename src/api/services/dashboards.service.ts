import { dashboardsRepository, CreateDashboardDto, AddWidgetDto } from '../repositories/dashboards.repository';

export class DashboardsService {
  async getDashboards(dashboardType?: string, search?: string) {
    return dashboardsRepository.getDashboards(dashboardType, search);
  }

  async getDashboardById(id: string) {
    return dashboardsRepository.getDashboardById(id);
  }

  async createDashboard(data: CreateDashboardDto) {
    return dashboardsRepository.createDashboard(data);
  }

  async cloneDashboard(id: string, newTitle: string) {
    return dashboardsRepository.cloneDashboard(id, newTitle);
  }

  async toggleFavorite(id: string, userId: string) {
    return dashboardsRepository.toggleFavorite(id, userId);
  }

  async addWidget(dto: AddWidgetDto) {
    return dashboardsRepository.addWidget(dto);
  }

  async deleteWidget(widgetId: string) {
    return dashboardsRepository.deleteWidget(widgetId);
  }

  async saveLayout(dashboardId: string, widgetPositions: any[]) {
    return dashboardsRepository.saveLayout(dashboardId, widgetPositions);
  }

  async resolveWidgetData(widgetId: string, globalFilters?: any, userContext?: any) {
    return dashboardsRepository.resolveWidgetData(widgetId, globalFilters, userContext);
  }

  async getWorkspaceConfig(workspaceId: string, userContext?: any) {
    return dashboardsRepository.getWorkspaceConfig(workspaceId, userContext);
  }
}

export const dashboardsService = new DashboardsService();
