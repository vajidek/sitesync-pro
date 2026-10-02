import crypto from 'node:crypto';
import { db } from '../../db';
import { and, desc, eq } from 'drizzle-orm';
import { commercialTenders, projects, costCodes, projectWbs, boqItems, estimateHeaders, estimateRevisions, estimateLines, estimateResources } from '../../db/schema';
import { numberingService } from '../services/numbering.service';
import type { EstimateCreateInput, EstimateLineCreateInput, EstimateLine, EstimateResource, EstimateRevision, EstimateStatus, EstimateSummary } from '../types/estimation';

function toNumber(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error('Numeric value is invalid.');
  return n;
}

export class EstimationRepository {
  async list(filters?: { companyId?: string; projectId?: string; tenderId?: string }) {
    const predicates = [];
    if (filters?.companyId) predicates.push(eq(estimateHeaders.companyId, filters.companyId));
    if (filters?.projectId) predicates.push(eq(estimateHeaders.projectId, filters.projectId));
    if (filters?.tenderId) predicates.push(eq(estimateHeaders.tenderId, filters.tenderId));

    const rows = await db.select().from(estimateHeaders)
      .where(predicates.length ? and(...predicates) : undefined)
      .orderBy(desc(estimateHeaders.updatedAt));

    const result: EstimateSummary[] = [];
    for (const row of rows) {
      const revisions = await db.select().from(estimateRevisions)
        .where(eq(estimateRevisions.estimateId, row.id))
        .orderBy(desc(estimateRevisions.revisionNumber))
        .limit(1);
      result.push({
        id: row.id,
        companyId: row.companyId,
        tenderId: row.tenderId,
        projectId: row.projectId,
        estimateNumber: row.estimateNumber,
        title: row.title,
        estimateType: row.estimateType,
        currency: row.currency,
        status: row.status as EstimateStatus,
        currentRevisionNumber: row.currentRevisionNumber,
        createdBy: row.createdBy,
        updatedBy: row.updatedBy,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        revision: revisions[0] ? this.mapRevision(revisions[0]) : undefined,
      });
    }
    return result;
  }

  async getById(id: string, withLines = true): Promise<EstimateSummary | null> {
    const [row] = await db.select().from(estimateHeaders).where(eq(estimateHeaders.id, id)).limit(1);
    if (!row) return null;
    const [revision] = await db.select().from(estimateRevisions)
      .where(eq(estimateRevisions.estimateId, id))
      .orderBy(desc(estimateRevisions.revisionNumber))
      .limit(1);
    const result: EstimateSummary = {
      id: row.id, companyId: row.companyId, tenderId: row.tenderId, projectId: row.projectId,
      estimateNumber: row.estimateNumber, title: row.title, estimateType: row.estimateType, currency: row.currency,
      status: row.status as EstimateStatus, currentRevisionNumber: row.currentRevisionNumber,
      createdBy: row.createdBy, updatedBy: row.updatedBy, createdAt: row.createdAt, updatedAt: row.updatedAt,
      revision: revision ? this.mapRevision(revision) : undefined,
    };
    if (revision && withLines) {
      const lines = await db.select().from(estimateLines).where(eq(estimateLines.revisionId, revision.id)).orderBy(estimateLines.lineNumber);
      result.revision!.lines = [];
      for (const line of lines) {
        const resources = await db.select().from(estimateResources)
          .where(eq(estimateResources.lineId, line.id))
          .orderBy(estimateResources.createdAt);
        result.revision!.lines.push(this.mapLine(line, resources));
      }
    }
    return result;
  }

  async create(input: EstimateCreateInput): Promise<EstimateSummary> {
    const companyId = input.companyId.trim();
    const title = input.title.trim();
    const estimateType = input.estimateType.trim();
    const currency = input.currency.trim().toUpperCase();
    const actor = input.createdBy.trim();

    if (!companyId || !title || !estimateType || !currency || !actor || !input.createdByName.trim()) {
      throw new Error('Company, title, estimate type, currency and authenticated creator are required.');
    }
    if (!input.tenderId && !input.projectId) throw new Error('Select a tender or project for the estimate.');

    if (input.tenderId) {
      const [tender] = await db.select().from(commercialTenders).where(eq(commercialTenders.id, input.tenderId)).limit(1);
      if (!tender) throw new Error('Tender not found.');
      if (tender.currency.toUpperCase() !== currency) throw new Error('Estimate currency must match the linked tender currency.');
    }
    if (input.projectId) {
      const [project] = await db.select().from(projects).where(and(eq(projects.id, input.projectId), eq(projects.isActive, true))).limit(1);
      if (!project) throw new Error('Project not found or inactive.');
      if (project.companyId && project.companyId !== companyId) throw new Error('Project does not belong to the selected company.');
      if (project.currency && project.currency.toUpperCase() !== currency) throw new Error('Estimate currency must match the project currency.');
    }

    const now = new Date().toISOString();
    return db.transaction(async (tx) => {
      const estimateNumber = input.estimateNumber?.trim() || await numberingService.getNextNumber({
        entityType: 'ESTIMATE',
        companyId,
        branchId: input.branchId || null,
        projectId: input.projectId || null,
        date: now,
        allocatedBy: actor,
      }, tx);

      const [existing] = await tx.select({ id: estimateHeaders.id }).from(estimateHeaders)
        .where(eq(estimateHeaders.estimateNumber, estimateNumber)).limit(1);
      if (existing) throw new Error(`Estimate number ${estimateNumber} already exists.`);

      const estimateId = crypto.randomUUID();
      const revisionId = crypto.randomUUID();

      await tx.insert(estimateHeaders).values({
        id: estimateId, companyId, tenderId: input.tenderId || null, projectId: input.projectId || null,
        estimateNumber, title, estimateType, currency, description: input.description || null, currentRevisionNumber: 1,
        status: 'DRAFT', createdBy: actor, createdByName: input.createdByName.trim(), updatedBy: actor,
        createdAt: now, updatedAt: now,
      });
      await tx.insert(estimateRevisions).values({
        id: revisionId, estimateId, revisionNumber: 1, revisionLabel: 'Initial Revision', status: 'DRAFT',
        description: input.description || null, directCost: 0, overheadAmount: 0, contingencyAmount: 0, profitAmount: 0,
        taxAmount: 0, totalCost: 0, totalPrice: 0, createdBy: actor, createdByName: input.createdByName.trim(),
        createdAt: now, updatedAt: now,
      });
      return (await this.getById(estimateId, true))!;
    });
  }

  private assertEditable(status: string) {
    if (!['DRAFT', 'REJECTED'].includes(status)) {
      throw new Error(`Estimate revision is locked for editing at status ${status}.`);
    }
  }

  private async recalculateRevision(tx: any, revisionId: string) {
    const [revision] = await tx.select().from(estimateRevisions).where(eq(estimateRevisions.id, revisionId)).limit(1);
    if (!revision) throw new Error('Estimate revision not found.');

    const lines = await tx.select().from(estimateLines).where(eq(estimateLines.revisionId, revisionId));
    let directCost = 0;
    let overheadAmount = 0;
    let profitAmount = 0;
    let quotedTotal = 0;

    for (const line of lines) {
      directCost += Number(line.directAmount || 0);
      overheadAmount += Number(line.directAmount || 0) * Number(line.overheadPercent || 0) / 100;
      const base = Number(line.directAmount || 0) + Number(line.directAmount || 0) * Number(line.overheadPercent || 0) / 100;
      profitAmount += base * Number(line.profitPercent || 0) / 100;
      quotedTotal += Number(line.quotedAmount || 0);
    }

    const totalCost = directCost + overheadAmount;
    const totalPrice = quotedTotal;
    await tx.update(estimateRevisions).set({
      directCost, overheadAmount, profitAmount, totalCost, totalPrice, updatedAt: new Date().toISOString(),
    }).where(eq(estimateRevisions.id, revisionId));
    return { directCost, overheadAmount, profitAmount, totalCost, totalPrice };
  }

  async addLine(estimateId: string, input: EstimateLineCreateInput, actor: { id: string; name: string }): Promise<EstimateLine> {
    return db.transaction(async (tx) => {
      const [estimate] = await tx.select().from(estimateHeaders).where(eq(estimateHeaders.id, estimateId)).limit(1);
      if (!estimate) throw new Error('Estimate not found.');

      const [revision] = await tx.select().from(estimateRevisions).where(and(eq(estimateRevisions.estimateId, estimateId), eq(estimateRevisions.revisionNumber, estimate.currentRevisionNumber))).limit(1);
      if (!revision) throw new Error('Current estimate revision not found.');
      this.assertEditable(revision.status);
      if (revision.createdBy === actor.id && revision.status === 'UNDER_REVIEW') throw new Error('Maker-checker violation.');

      const itemCode = input.itemCode.trim();
      const description = input.description.trim();
      const unit = input.unit.trim();
      const quantity = toNumber(input.quantity);
      const overhead = toNumber(input.overheadPercent || 0);
      const profit = toNumber(input.profitPercent || 0);
      if (!itemCode || !description || !unit || quantity <= 0 || overhead < 0 || profit < 0) throw new Error('Valid line item, unit, quantity and markup values are required.');

      if (input.wbsId) {
        const [wbs] = await tx.select().from(projectWbs).where(and(eq(projectWbs.id, input.wbsId), eq(projectWbs.projectId, estimate.projectId || ''))).limit(1);
        if (!wbs) throw new Error('WBS reference does not belong to this estimate project.');
      }
      if (input.boqItemId) {
        const [boq] = await tx.select().from(boqItems).where(and(eq(boqItems.id, input.boqItemId), eq(boqItems.projectId, estimate.projectId || ''))).limit(1);
        if (!boq) throw new Error('BOQ reference does not belong to this estimate project.');
      }
      if (input.costCodeId) {
        const [code] = await tx.select().from(costCodes).where(and(eq(costCodes.id, input.costCodeId), eq(costCodes.isActive, true))).limit(1);
        if (!code) throw new Error('Cost code not found or inactive.');
      }

      const existingLines = await tx.select({ lineNumber: estimateLines.lineNumber }).from(estimateLines).where(eq(estimateLines.revisionId, revision.id));
      const lineNumber = existingLines.reduce((max, row) => Math.max(max, row.lineNumber), 0) + 1;
      const lineId = crypto.randomUUID();

      const resources = input.resources || [];
      let directAmount = 0;
      const resourceRows: any[] = [];
      for (const resource of resources) {
        const rq = toNumber(resource.quantity);
        const rr = toNumber(resource.unitRate);
        if (rq <= 0 || rr < 0 || !resource.description.trim() || !resource.unit.trim()) throw new Error('Estimate resource values are invalid.');
        const amount = rq * rr;
        directAmount += amount;
        resourceRows.push({
          id: crypto.randomUUID(), lineId, resourceType: resource.resourceType, resourceCode: resource.resourceCode || null,
          description: resource.description.trim(), unit: resource.unit.trim(), quantity: rq, unitRate: rr, amount,
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        });
      }
      if (!resources.length) {
        const directRate = toNumber((input as any).directRate);
        if (!Number.isFinite(directRate) || directRate < 0) throw new Error('Add at least one resource or supply a valid direct rate.');
        directAmount = directRate * quantity;
      } else if (quantity > 0) {
        directAmount = directAmount * quantity;
      }

      const directRate = directAmount / quantity;
      const overheadAmount = directAmount * overhead / 100;
      const quotedRate = directRate + (directRate * overhead / 100) + ((directRate + directRate * overhead / 100) * profit / 100);
      const quotedAmount = quotedRate * quantity;

      const [row] = await tx.insert(estimateLines).values({
        id: lineId, revisionId: revision.id, lineNumber, itemCode, description, unit, quantity,
        directRate, directAmount, overheadPercent: overhead, profitPercent: profit, quotedRate, quotedAmount,
        wbsId: input.wbsId || null, boqItemId: input.boqItemId || null, costCodeId: input.costCodeId || null, costCode: null,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      }).returning();

      if (resourceRows.length) await tx.insert(estimateResources).values(resourceRows);
      await this.recalculateRevision(tx, revision.id);
      return this.mapLine(row, resourceRows);
    });
  }

  async addResource(revisionId: string, lineId: string, resource: Omit<EstimateResource, 'id' | 'lineId' | 'amount' | 'createdAt' | 'updatedAt'>, actor: { id: string; name: string }) {
    return db.transaction(async (tx) => {
      const [revision] = await tx.select().from(estimateRevisions).where(eq(estimateRevisions.id, revisionId)).limit(1);
      if (!revision) throw new Error('Estimate revision not found.');
      this.assertEditable(revision.status);
      const rq = toNumber(resource.quantity);
      const rr = toNumber(resource.unitRate);
      if (rq <= 0 || rr < 0 || !resource.description.trim() || !resource.unit.trim()) throw new Error('Resource values are invalid.');
      const [line] = await tx.select().from(estimateLines).where(and(eq(estimateLines.id, lineId), eq(estimateLines.revisionId, revisionId))).limit(1);
      if (!line) throw new Error('Estimate line not found.');

      const amount = rq * rr;
      const [created] = await tx.insert(estimateResources).values({
        id: crypto.randomUUID(), lineId, resourceType: resource.resourceType, resourceCode: resource.resourceCode || null,
        description: resource.description.trim(), unit: resource.unit.trim(), quantity: rq, unitRate: rr, amount,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      }).returning();

      const resources = await tx.select().from(estimateResources).where(eq(estimateResources.lineId, lineId));
      const directAmount = resources.reduce((sum, r) => sum + Number(r.amount || 0), 0) * Number(line.quantity);
      const directRate = directAmount / Number(line.quantity);
      const overhead = Number(line.overheadPercent || 0);
      const profit = Number(line.profitPercent || 0);
      const quotedRate = directRate + directRate * overhead / 100;
      const quoted = quotedRate + quotedRate * profit / 100;

      await tx.update(estimateLines).set({
        directRate, directAmount, quotedRate: quoted, quotedAmount: quoted * Number(line.quantity), updatedAt: new Date().toISOString(),
      }).where(eq(estimateLines.id, lineId));
      await this.recalculateRevision(tx, revisionId);
      return created;
    });
  }

  async transition(id: string, nextStatus: EstimateStatus, actor: { id: string; name: string }) {
    return db.transaction(async (tx) => {
      const [estimate] = await tx.select().from(estimateHeaders).where(eq(estimateHeaders.id, id)).limit(1);
      if (!estimate) throw new Error('Estimate not found.');
      const [revision] = await tx.select().from(estimateRevisions).where(and(eq(estimateRevisions.estimateId, id), eq(estimateRevisions.revisionNumber, estimate.currentRevisionNumber))).limit(1);
      if (!revision) throw new Error('Current revision not found.');

      const allowed: Record<string, EstimateStatus[]> = {
        DRAFT: ['UNDER_REVIEW', 'CANCELLED'],
        REJECTED: ['DRAFT', 'CANCELLED'],
        UNDER_REVIEW: ['APPROVED', 'REJECTED'],
        APPROVED: ['LOCKED'],
        LOCKED: [],
        CANCELLED: [],
      };
      if (!allowed[revision.status]?.includes(nextStatus)) throw new Error(`Invalid estimate status transition: ${revision.status} → ${nextStatus}`);

      if (nextStatus === 'APPROVED') {
        if (revision.createdBy === actor.id) throw new Error('Maker-checker violation: estimate creator cannot approve the same revision.');
        const lines = await tx.select().from(estimateLines).where(eq(estimateLines.revisionId, revision.id));
        if (!lines.length || Number(revision.totalPrice || 0) <= 0) throw new Error('An estimate must contain priced line items before approval.');
      }

      const now = new Date().toISOString();
      await tx.update(estimateRevisions).set({
        status: nextStatus,
        approvedBy: nextStatus === 'APPROVED' ? actor.name : revision.approvedBy,
        approvedAt: nextStatus === 'APPROVED' ? now : revision.approvedAt,
        updatedAt: now,
      }).where(eq(estimateRevisions.id, revision.id));

      await tx.update(estimateHeaders).set({
        status: nextStatus,
        updatedBy: actor.id,
        updatedAt: now,
      }).where(eq(estimateHeaders.id, id));

      return this.getById(id, true);
    });
  }

  private mapRevision(row: any): EstimateRevision {
    return {
      id: row.id, estimateId: row.estimateId, revisionNumber: row.revisionNumber, revisionLabel: row.revisionLabel || undefined,
      status: row.status as EstimateStatus, description: row.description || undefined,
      directCost: Number(row.directCost || 0), overheadAmount: Number(row.overheadAmount || 0), contingencyAmount: Number(row.contingencyAmount || 0),
      profitAmount: Number(row.profitAmount || 0), taxAmount: Number(row.taxAmount || 0), totalCost: Number(row.totalCost || 0),
      totalPrice: Number(row.totalPrice || 0), approvedBy: row.approvedBy || null, approvedAt: row.approvedAt || null,
      createdBy: row.createdBy, createdAt: row.createdAt, updatedAt: row.updatedAt,
    };
  }

  private mapLine(row: any, resources: any[] = []): EstimateLine {
    return {
      id: row.id, revisionId: row.revisionId, lineNumber: row.lineNumber, itemCode: row.itemCode, description: row.description,
      unit: row.unit, quantity: Number(row.quantity), directRate: Number(row.directRate), directAmount: Number(row.directAmount),
      overheadPercent: Number(row.overheadPercent || 0), profitPercent: Number(row.profitPercent || 0), quotedRate: Number(row.quotedRate || 0), quotedAmount: Number(row.quotedAmount || 0),
      wbsId: row.wbsId, boqItemId: row.boqItemId, costCodeId: row.costCodeId, costCode: row.costCode,
      createdAt: row.createdAt, updatedAt: row.updatedAt,
      resources: resources.map((r) => ({ id: r.id, lineId: r.lineId, resourceType: r.resourceType, resourceCode: r.resourceCode, description: r.description, unit: r.unit, quantity: Number(r.quantity), unitRate: Number(r.unitRate), amount: Number(r.amount), createdAt: r.createdAt, updatedAt: r.updatedAt })),
    };
  }
}

export const estimationRepository = new EstimationRepository();
