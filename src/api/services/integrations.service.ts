import {
  integrationsRepository,
  ConnectorConfigItem,
  CreateJobDto,
} from '../repositories/integrations.repository';

export class IntegrationsService {
  async getAllConnectors(category?: string, search?: string) {
    return integrationsRepository.getAllConnectors(category, search);
  }

  async getConnectorById(id: string) {
    return integrationsRepository.getConnectorById(id);
  }

  async toggleConnector(id: string, isEnabled: boolean) {
    return integrationsRepository.toggleConnector(id, isEnabled);
  }

  async updateConnectorConfigs(connectorId: string, configs: ConnectorConfigItem[], userEmail?: string) {
    return integrationsRepository.updateConnectorConfigs(connectorId, configs, userEmail);
  }

  async testConnection(connectorId: string) {
    return integrationsRepository.testConnection(connectorId);
  }

  async getHealthDashboard() {
    return integrationsRepository.getHealthDashboard();
  }

  async getSyncJobs(connectorId?: string) {
    return integrationsRepository.getSyncJobs(connectorId);
  }

  async createSyncJob(dto: CreateJobDto) {
    return integrationsRepository.createSyncJob(dto);
  }

  async triggerSyncJob(jobId: string) {
    return integrationsRepository.triggerSyncJob(jobId);
  }

  async getLogs(connectorId?: string, status?: string) {
    return integrationsRepository.getLogs(connectorId, status);
  }

  async retryFailedLog(logId: string) {
    return integrationsRepository.retryFailedLog(logId);
  }
}

export const integrationsService = new IntegrationsService();
