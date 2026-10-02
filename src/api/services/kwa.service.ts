import { kwaRepository, KWARepository } from '../repositories/kwa.repository';
import {
  PipelineSection,
  ValveRecord,
  WaterTestReport,
  WaterDailySiteReport,
  WaterDocument,
  WaterProjectDashboardMetrics,
} from '../../types/waterInfrastructureEngine';

export class KWAService {
  constructor(private repository: KWARepository = kwaRepository) {}

  async getDashboardMetrics(): Promise<WaterProjectDashboardMetrics> {
    return await this.repository.getDashboardMetrics();
  }

  async getProjects(params: { type?: string; search?: string }) {
    return await this.repository.getProjects(params);
  }

  async createProject(data: any) {
    return await this.repository.createProject(data);
  }

  async getPipelines(params: { projectId?: string; pipeMaterial?: string }): Promise<PipelineSection[]> {
    return await this.repository.getPipelines(params);
  }

  async createPipeline(data: any): Promise<PipelineSection> {
    return await this.repository.createPipeline(data);
  }

  async getValves(params: { projectId?: string; status?: string }): Promise<ValveRecord[]> {
    return await this.repository.getValves(params);
  }

  async createValve(data: any): Promise<ValveRecord> {
    return await this.repository.createValve(data);
  }

  async getTestingReports(params: { projectId?: string; testResult?: string }): Promise<WaterTestReport[]> {
    return await this.repository.getTestingReports(params);
  }

  async createTestReport(data: any): Promise<WaterTestReport> {
    return await this.repository.createTestReport(data);
  }

  async getDailySiteReports(params: { projectId?: string; date?: string }): Promise<WaterDailySiteReport[]> {
    return await this.repository.getDailySiteReports(params);
  }

  async createDailySiteReport(data: any): Promise<WaterDailySiteReport> {
    return await this.repository.createDailySiteReport(data);
  }

  async getDocuments(params: { projectId?: string; category?: string }): Promise<WaterDocument[]> {
    return await this.repository.getDocuments(params);
  }

  async createDocument(data: any): Promise<WaterDocument> {
    return await this.repository.createDocument(data);
  }
}

export const kwaService = new KWAService();
