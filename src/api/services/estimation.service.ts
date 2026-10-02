import { estimationRepository } from '../repositories/estimation.repository';
import type { EstimateCreateInput, EstimateLineCreateInput, EstimateStatus } from '../types/estimation';

export class EstimationService {
  async list(filters: { companyId?: string; projectId?: string; tenderId?: string }) {
    return estimationRepository.list(filters);
  }

  async getById(id: string) {
    return estimationRepository.getById(id, true);
  }

  async create(input: Omit<EstimateCreateInput, 'createdBy' | 'createdByName'>, actor: { id: string; name: string }) {
    return estimationRepository.create({
      ...input,
      createdBy: actor.id,
      createdByName: actor.name,
    });
  }

  async addLine(estimateId: string, input: EstimateLineCreateInput, actor: { id: string; name: string }) {
    return estimationRepository.addLine(estimateId, input, actor);
  }

  async addResource(revisionId: string, lineId: string, input: any, actor: { id: string; name: string }) {
    return estimationRepository.addResource(revisionId, lineId, input, actor);
  }

  async transition(id: string, status: EstimateStatus, actor: { id: string; name: string }) {
    return estimationRepository.transition(id, status, actor);
  }
}

export const estimationService = new EstimationService();
