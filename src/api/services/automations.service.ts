import { automationsRepository, CreateRuleDto, CreateTemplateDto } from '../repositories/automations.repository';

export class AutomationsService {
  async getAutomationRules(eventSource?: string, search?: string) {
    return automationsRepository.getAutomationRules(eventSource, search);
  }

  async getRuleById(id: string) {
    return automationsRepository.getRuleById(id);
  }

  async createAutomationRule(dto: CreateRuleDto) {
    return automationsRepository.createAutomationRule(dto);
  }

  async toggleRuleStatus(id: string) {
    return automationsRepository.toggleRuleStatus(id);
  }

  async evaluateAndTrigger(eventSource: string, triggerType: string, payload: any, userContext?: any) {
    return automationsRepository.evaluateAndTrigger(eventSource, triggerType, payload, userContext);
  }

  async getTemplates() {
    return automationsRepository.getTemplates();
  }

  async createTemplate(dto: CreateTemplateDto) {
    return automationsRepository.createTemplate(dto);
  }

  async getUserNotifications(userId: string) {
    return automationsRepository.getUserNotifications(userId);
  }

  async markNotificationRead(id: string) {
    return automationsRepository.markNotificationRead(id);
  }

  async getExecutionLogs() {
    return automationsRepository.getExecutionLogs();
  }

  async retryFailedLog(logId: string) {
    return automationsRepository.retryFailedLog(logId);
  }
}

export const automationsService = new AutomationsService();
