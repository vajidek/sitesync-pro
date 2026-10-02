import crypto from 'node:crypto';
import { db } from '../../db';
import { costCodes } from '../../db/schema';
import { and, asc, eq, isNull, or } from 'drizzle-orm';

export interface CostCodeRecord {
  id: string;
  companyId: string;
  projectId?: string | null;
  wbsId?: string | null;
  parentId?: string | null;
  code: string;
  name: string;
  category: string;
  level: number;
  isBillable: boolean;
  isDirectCost: boolean;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

class CostCodeRepository {
  async list(params?: { companyId?: string; projectId?: string; wbsId?: string; includeInactive?: boolean }) {
    const predicates: any[] = [];
    if (params?.companyId) predicates.push(eq(costCodes.companyId, params.companyId));
    if (params?.projectId) predicates.push(or(isNull(costCodes.projectId), eq(costCodes.projectId, params.projectId)));
    if (params?.wbsId) predicates.push(or(isNull(costCodes.wbsId), eq(costCodes.wbsId, params.wbsId)));
    if (!params?.includeInactive) predicates.push(eq(costCodes.isActive, true));

    return db.select().from(costCodes)
      .where(predicates.length ? and(...predicates) : undefined)
      .orderBy(asc(costCodes.category), asc(costCodes.code));
  }

  async getById(id: string) {
    const [row] = await db.select().from(costCodes).where(eq(costCodes.id, id)).limit(1);
    return row || null;
  }

  async create(data: Omit<CostCodeRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) {
    const now = new Date().toISOString();
    const id = data.id || crypto.randomUUID();
    const [row] = await db.insert(costCodes).values({
      id,
      companyId: data.companyId,
      projectId: data.projectId || null,
      wbsId: data.wbsId || null,
      parentId: data.parentId || null,
      code: data.code.trim(),
      name: data.name.trim(),
      category: data.category.trim(),
      level: Number(data.level || 1),
      isBillable: data.isBillable !== false,
      isDirectCost: data.isDirectCost !== false,
      isActive: true,
      createdBy: data.createdBy.trim(),
      updatedBy: data.updatedBy.trim(),
      createdAt: now,
      updatedAt: now,
    }).returning();
    return row;
  }

  async update(id: string, changes: Partial<CostCodeRecord>) {
    const [row] = await db.update(costCodes).set({
      projectId: changes.projectId === undefined ? undefined : changes.projectId || null,
      wbsId: changes.wbsId === undefined ? undefined : changes.wbsId || null,
      parentId: changes.parentId === undefined ? undefined : changes.parentId || null,
      code: changes.code === undefined ? undefined : changes.code.trim(),
      name: changes.name === undefined ? undefined : changes.name.trim(),
      category: changes.category === undefined ? undefined : changes.category.trim(),
      level: changes.level === undefined ? undefined : Number(changes.level),
      isBillable: changes.isBillable,
      isDirectCost: changes.isDirectCost,
      isActive: changes.isActive,
      updatedBy: changes.updatedBy?.trim(),
      updatedAt: new Date().toISOString(),
    }).where(eq(costCodes.id, id)).returning();
    return row || null;
  }
}
export const costCodeRepository = new CostCodeRepository();
