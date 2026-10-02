import { reportsRepository, CreateReportDto, ScheduleReportDto } from '../repositories/reports.repository';

export class ReportsService {
  async getReports(dataSource?: string, search?: string) {
    return reportsRepository.getReports(dataSource, search);
  }

  async getReportById(id: string) {
    return reportsRepository.getReportById(id);
  }

  async createReport(data: CreateReportDto) {
    return reportsRepository.createReport(data);
  }

  async executeReportData(reportId: string, runtimeFilters?: any, userContext?: any) {
    return reportsRepository.executeReportData(reportId, runtimeFilters, userContext);
  }

  async scheduleReport(data: ScheduleReportDto) {
    return reportsRepository.scheduleReport(data);
  }
}

export const reportsService = new ReportsService();
