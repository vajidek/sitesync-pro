import { costCodeRepository, type CostCodeRecord } from '../repositories/cost_code.repository';

export class CostCodeService {
  async list(params?: { companyId?: string; projectId?: string; wbsId?: string; includeInactive?: boolean }) {
    return costCodeRepository.list(params);
  }

  async getById(id: string) {
    return costCodeRepository.getById(id);
  }

  async create(input: Partial<CostCodeRecord>, actor: { id: string; name: string }) {
    if (!input.companyId || !input.code || !input.name || !input.category) {
      throw new Error('Company, cost-code, name and category are required.');
    }
    if (Number(input.level || 1) < 1) throw new Error('Cost-code level must be at least 1.');

    return costCodeRepository.create({
      companyId: input.companyId,
      projectId: input.projectId || null,
      wbsId: input.wbsId || null,
      parentId: input.parentId || null,
      code: input.code,
      name: input.name,
      category: input.category,
      level: Number(input.level || 1),
      isBillable: input.isBillable !== false,
      isDirectCost: input.isDirectCost !== false,
      isActive: true,
      createdBy: actor.name,
      updatedBy: actor.name,
      id: input.id,
    } as any);
  }

  async update(id: string, input: Partial<CostCodeRecord>, actor: { id: string; name: string }) {
    const existing = await costCodeRepository.getById(id);
    if (!existing) throw new Error('Cost code not found.');
    return costCodeRepository.update(id, {
      ...input,
      updatedBy: actor.name,
    });
  }
}
