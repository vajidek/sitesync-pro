import { db } from '../../db';
import { projectWbs, boqItems, wbsActivities, activityDependencies, activityDocuments, projects } from '../../db/schema';
import { eq, and, isNull, sql, inArray, desc, asc } from 'drizzle-orm';
import { isDemoSeedAllowed } from '../config/env';

export interface DbWbsNode {
  id: string;
  projectId: string;
  parentId: string | null;
  code: string;
  name: string;
  description: string | null;
  level: number;
  nodeType: string;
  displayOrder: number;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  children?: DbWbsNode[];
  boqCount?: number;
  activityCount?: number;
}

export interface DbBoqItem {
  id: string;
  projectId: string;
  wbsId: string;
  departmentId: string | null;
  departmentName: string | null;
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  executedQty: number;
  balanceQty: number;
  budgetQty: number;
  revisedQty: number;
  remarks: string | null;
  status: string;
  priority: string;
  isVariation: boolean;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbWbsActivity {
  id: string;
  projectId: string;
  wbsId: string;
  boqItemId: string | null;
  code: string;
  name: string;
  description: string | null;
  department: string;
  discipline: string | null;
  responsibleEngineerId: string | null;
  responsibleEngineerName: string | null;
  supervisorId: string | null;
  supervisorName: string | null;
  foremanName: string | null;
  contractorName: string | null;
  subcontractorName: string | null;
  vendorName: string | null;
  crewName: string | null;
  status: string;
  plannedQty: number;
  todayQty: number;
  cumulativeQty: number;
  remainingQty: number;
  progressPercentage: number;
  weightage: number;
  spi: number;
  cpi: number;
  startDate: string | null;
  endDate: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  isCritical: boolean;
  isMilestone: boolean;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbActivityDependency {
  id: string;
  activityId: string;
  predecessorActivityId: string;
  dependencyType: string;
  lagDays: number;
  leadDays: number;
  createdAt: string;
}

export interface DbActivityDocument {
  id: string;
  activityId: string;
  title: string;
  documentType: string;
  fileUrl: string;
  fileSize: string | null;
  uploadedBy: string | null;
  createdAt: string;
}

export class WbsRepository {
  // Check circular hierarchy
  async isDescendant(projectId: string, candidateParentId: string, targetNodeId: string): Promise<boolean> {
    if (candidateParentId === targetNodeId) return true;
    let currentId: string | null = candidateParentId;
    const visited = new Set<string>();

    while (currentId) {
      if (visited.has(currentId)) break; // prevent loop
      visited.add(currentId);
      if (currentId === targetNodeId) return true;

      const [node] = await db
        .select({ parentId: projectWbs.parentId })
        .from(projectWbs)
        .where(eq(projectWbs.id, currentId));

      if (!node) break;
      currentId = node.parentId;
    }
    return false;
  }

  // Code Uniqueness Check
  async checkWbsCodeExists(projectId: string, code: string, excludeId?: string): Promise<boolean> {
    const query = db
      .select({ id: projectWbs.id })
      .from(projectWbs)
      .where(and(eq(projectWbs.projectId, projectId), eq(projectWbs.code, code.trim())));

    const rows = await query;
    if (excludeId) {
      return rows.some(r => r.id !== excludeId);
    }
    return rows.length > 0;
  }

  async checkBoqCodeExists(projectId: string, itemCode: string, excludeId?: string): Promise<boolean> {
    const rows = await db
      .select({ id: boqItems.id })
      .from(boqItems)
      .where(and(eq(boqItems.projectId, projectId), eq(boqItems.itemCode, itemCode.trim())));

    if (excludeId) {
      return rows.some(r => r.id !== excludeId);
    }
    return rows.length > 0;
  }

  // --- WBS NODES ---
  async getWbsTree(projectId: string, includeDeleted = false): Promise<DbWbsNode[]> {
    await this.ensureSeeded(projectId);

    const conditions = [eq(projectWbs.projectId, projectId)];
    if (!includeDeleted) {
      conditions.push(isNull(projectWbs.deletedAt));
    }

    const allNodes = await db
      .select()
      .from(projectWbs)
      .where(and(...conditions))
      .orderBy(asc(projectWbs.level), asc(projectWbs.displayOrder), asc(projectWbs.code));

    // Also fetch BOQ & Activity counts per WBS
    const allBoq = await db.select({ wbsId: boqItems.wbsId }).from(boqItems).where(eq(boqItems.projectId, projectId));
    const allActs = await db.select({ wbsId: wbsActivities.wbsId }).from(wbsActivities).where(eq(wbsActivities.projectId, projectId));

    const boqCountMap: Record<string, number> = {};
    allBoq.forEach(b => { boqCountMap[b.wbsId] = (boqCountMap[b.wbsId] || 0) + 1; });

    const actCountMap: Record<string, number> = {};
    allActs.forEach(a => { actCountMap[a.wbsId] = (actCountMap[a.wbsId] || 0) + 1; });

    const nodeMap = new Map<string, DbWbsNode>();
    const rootNodes: DbWbsNode[] = [];

    allNodes.forEach(node => {
      const formatted: DbWbsNode = {
        ...node,
        children: [],
        boqCount: boqCountMap[node.id] || 0,
        activityCount: actCountMap[node.id] || 0,
      };
      nodeMap.set(node.id, formatted);
    });

    nodeMap.forEach(node => {
      if (node.parentId && nodeMap.has(node.parentId)) {
        nodeMap.get(node.parentId)!.children!.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  }

  async getWbsNodeById(id: string): Promise<DbWbsNode | null> {
    const [node] = await db.select().from(projectWbs).where(eq(projectWbs.id, id));
    return node ? (node as DbWbsNode) : null;
  }

  async createWbsNode(data: {
    projectId: string;
    parentId?: string | null;
    code: string;
    name: string;
    description?: string;
    nodeType?: string;
    displayOrder?: number;
  }): Promise<DbWbsNode> {
    const isDup = await this.checkWbsCodeExists(data.projectId, data.code);
    if (isDup) {
      throw new Error(`WBS Code '${data.code}' already exists in this project.`);
    }

    let level = 1;
    if (data.parentId) {
      const parent = await this.getWbsNodeById(data.parentId);
      if (parent) {
        level = parent.level + 1;
      }
    }

    const id = `wbs-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const now = new Date().toISOString();

    const newNode = {
      id,
      projectId: data.projectId,
      parentId: data.parentId || null,
      code: data.code.trim(),
      name: data.name.trim(),
      description: data.description || null,
      level,
      nodeType: data.nodeType || 'WBS',
      displayOrder: data.displayOrder ?? 0,
      isActive: true,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(projectWbs).values(newNode);
    return newNode as DbWbsNode;
  }

  async updateWbsNode(
    id: string,
    data: {
      code?: string;
      name?: string;
      description?: string;
      nodeType?: string;
      displayOrder?: number;
      isActive?: boolean;
    }
  ): Promise<DbWbsNode> {
    const existing = await this.getWbsNodeById(id);
    if (!existing) throw new Error('WBS Node not found');

    if (data.code && data.code.trim() !== existing.code) {
      const isDup = await this.checkWbsCodeExists(existing.projectId, data.code, id);
      if (isDup) {
        throw new Error(`WBS Code '${data.code}' is already used by another node.`);
      }
    }

    const now = new Date().toISOString();
    const updateObj: any = { updatedAt: now };

    if (data.code !== undefined) updateObj.code = data.code.trim();
    if (data.name !== undefined) updateObj.name = data.name.trim();
    if (data.description !== undefined) updateObj.description = data.description;
    if (data.nodeType !== undefined) updateObj.nodeType = data.nodeType;
    if (data.displayOrder !== undefined) updateObj.displayOrder = data.displayOrder;
    if (data.isActive !== undefined) updateObj.isActive = data.isActive;

    await db.update(projectWbs).set(updateObj).where(eq(projectWbs.id, id));
    const [updated] = await db.select().from(projectWbs).where(eq(projectWbs.id, id));
    return updated as DbWbsNode;
  }

  async moveWbsNode(id: string, newParentId: string | null, newDisplayOrder?: number): Promise<DbWbsNode> {
    const node = await this.getWbsNodeById(id);
    if (!node) throw new Error('WBS Node not found');

    if (newParentId) {
      if (newParentId === id) throw new Error('Cannot set node as its own parent.');
      const isDesc = await this.isDescendant(node.projectId, newParentId, id);
      if (isDesc) {
        throw new Error('Circular hierarchy detected: Cannot move a node under its own descendant.');
      }
    }

    let level = 1;
    if (newParentId) {
      const parent = await this.getWbsNodeById(newParentId);
      if (parent) level = parent.level + 1;
    }

    const now = new Date().toISOString();
    const updateObj: any = {
      parentId: newParentId || null,
      level,
      updatedAt: now,
    };
    if (newDisplayOrder !== undefined) updateObj.displayOrder = newDisplayOrder;

    await db.update(projectWbs).set(updateObj).where(eq(projectWbs.id, id));

    // Recursively adjust children levels
    await this.updateSubtreeLevels(id, level);

    const [updated] = await db.select().from(projectWbs).where(eq(projectWbs.id, id));
    return updated as DbWbsNode;
  }

  private async updateSubtreeLevels(parentId: string, parentLevel: number): Promise<void> {
    const children = await db.select().from(projectWbs).where(eq(projectWbs.parentId, parentId));
    for (const child of children) {
      const childLevel = parentLevel + 1;
      await db
        .update(projectWbs)
        .set({ level: childLevel, updatedAt: new Date().toISOString() })
        .where(eq(projectWbs.id, child.id));
      await this.updateSubtreeLevels(child.id, childLevel);
    }
  }

  async duplicateSubtree(id: string, targetParentId?: string | null): Promise<DbWbsNode> {
    const rootNode = await this.getWbsNodeById(id);
    if (!rootNode) throw new Error('Source WBS Node not found');

    const copyNodeRecursive = async (sourceId: string, parentId: string | null): Promise<DbWbsNode> => {
      const source = await this.getWbsNodeById(sourceId);
      if (!source) throw new Error(`Node ${sourceId} not found`);

      const newCode = `${source.code}_COPY_${Math.floor(Math.random() * 1000)}`;
      const newName = `${source.name} (Copy)`;

      const created = await this.createWbsNode({
        projectId: source.projectId,
        parentId,
        code: newCode,
        name: newName,
        description: source.description || undefined,
        nodeType: source.nodeType,
        displayOrder: source.displayOrder + 1,
      });

      // Copy BOQ Items
      const boqs = await db.select().from(boqItems).where(and(eq(boqItems.wbsId, sourceId), isNull(boqItems.deletedAt)));
      for (const b of boqs) {
        await this.createBoqItem({
          projectId: b.projectId,
          wbsId: created.id,
          departmentId: b.departmentId,
          departmentName: b.departmentName,
          itemCode: `${b.itemCode}_COPY_${Math.floor(Math.random() * 1000)}`,
          description: b.description,
          unit: b.unit,
          quantity: b.quantity,
          rate: b.rate,
          remarks: b.remarks || undefined,
          priority: b.priority,
          isVariation: b.isVariation,
        });
      }

      // Copy Children WBS
      const children = await db.select().from(projectWbs).where(and(eq(projectWbs.parentId, sourceId), isNull(projectWbs.deletedAt)));
      for (const child of children) {
        await copyNodeRecursive(child.id, created.id);
      }

      return created;
    };

    return copyNodeRecursive(id, targetParentId !== undefined ? targetParentId : rootNode.parentId);
  }

  async deleteWbsNode(id: string, recursive = false): Promise<boolean> {
    const children = await db
      .select({ id: projectWbs.id })
      .from(projectWbs)
      .where(and(eq(projectWbs.parentId, id), isNull(projectWbs.deletedAt)));

    if (children.length > 0 && !recursive) {
      throw new Error('Cannot delete WBS node with active children. Select recursive delete to remove all child subtrees.');
    }

    const now = new Date().toISOString();

    const softDeleteSubtree = async (nodeId: string) => {
      const subChildren = await db
        .select({ id: projectWbs.id })
        .from(projectWbs)
        .where(eq(projectWbs.parentId, nodeId));
      for (const c of subChildren) {
        await softDeleteSubtree(c.id);
      }
      await db.update(projectWbs).set({ deletedAt: now, isActive: false, updatedAt: now }).where(eq(projectWbs.id, nodeId));
      await db.update(boqItems).set({ deletedAt: now, isActive: false, updatedAt: now }).where(eq(boqItems.wbsId, nodeId));
      await db.update(wbsActivities).set({ deletedAt: now, isActive: false, updatedAt: now }).where(eq(wbsActivities.wbsId, nodeId));
    };

    if (recursive) {
      await softDeleteSubtree(id);
    } else {
      await db.update(projectWbs).set({ deletedAt: now, isActive: false, updatedAt: now }).where(eq(projectWbs.id, id));
      await db.update(boqItems).set({ deletedAt: now, isActive: false, updatedAt: now }).where(eq(boqItems.wbsId, id));
      await db.update(wbsActivities).set({ deletedAt: now, isActive: false, updatedAt: now }).where(eq(wbsActivities.wbsId, id));
    }
    return true;
  }

  async restoreWbsNode(id: string, recursive = false): Promise<boolean> {
    const now = new Date().toISOString();
    const restoreSubtree = async (nodeId: string) => {
      await db.update(projectWbs).set({ deletedAt: null, isActive: true, updatedAt: now }).where(eq(projectWbs.id, nodeId));
      await db.update(boqItems).set({ deletedAt: null, isActive: true, updatedAt: now }).where(eq(boqItems.wbsId, nodeId));
      await db.update(wbsActivities).set({ deletedAt: null, isActive: true, updatedAt: now }).where(eq(wbsActivities.wbsId, nodeId));

      if (recursive) {
        const subChildren = await db.select({ id: projectWbs.id }).from(projectWbs).where(eq(projectWbs.parentId, nodeId));
        for (const c of subChildren) {
          await restoreSubtree(c.id);
        }
      }
    };
    await restoreSubtree(id);
    return true;
  }

  // --- BOQ ITEMS ---
  async getBoqItemsByProject(projectId: string, wbsId?: string, search?: string): Promise<DbBoqItem[]> {
    await this.ensureSeeded(projectId);
    const conditions = [eq(boqItems.projectId, projectId), isNull(boqItems.deletedAt)];

    if (wbsId) {
      conditions.push(eq(boqItems.wbsId, wbsId));
    }

    let query = db.select().from(boqItems).where(and(...conditions)).orderBy(asc(boqItems.itemCode));
    const items = await query;

    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      return (items as DbBoqItem[]).filter(
        i =>
          i.itemCode.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.departmentName && i.departmentName.toLowerCase().includes(q))
      );
    }

    return items as DbBoqItem[];
  }

  async getBoqItemById(id: string): Promise<DbBoqItem | null> {
    const [item] = await db.select().from(boqItems).where(eq(boqItems.id, id));
    return item ? (item as DbBoqItem) : null;
  }

  async createBoqItem(data: {
    projectId: string;
    wbsId: string;
    departmentId?: string | null;
    departmentName?: string | null;
    itemCode: string;
    description: string;
    unit: string;
    quantity: number;
    rate: number;
    remarks?: string;
    priority?: string;
    isVariation?: boolean;
  }): Promise<DbBoqItem> {
    const isDup = await this.checkBoqCodeExists(data.projectId, data.itemCode);
    if (isDup) {
      throw new Error(`BOQ Item Code '${data.itemCode}' already exists in this project.`);
    }

    const id = `boq-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const now = new Date().toISOString();
    const qty = Number(data.quantity) || 0;
    const rate = Number(data.rate) || 0;
    const amount = qty * rate;

    const newItem = {
      id,
      projectId: data.projectId,
      wbsId: data.wbsId,
      departmentId: data.departmentId || null,
      departmentName: data.departmentName || null,
      itemCode: data.itemCode.trim(),
      description: data.description.trim(),
      unit: data.unit.trim(),
      quantity: qty,
      rate: rate,
      amount: amount,
      executedQty: 0,
      balanceQty: qty,
      budgetQty: qty,
      revisedQty: qty,
      remarks: data.remarks || null,
      status: 'PLANNED',
      priority: data.priority || 'MEDIUM',
      isVariation: !!data.isVariation,
      isActive: true,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(boqItems).values(newItem);
    return newItem as DbBoqItem;
  }

  async updateBoqItem(id: string, data: Partial<DbBoqItem>): Promise<DbBoqItem> {
    const existing = await this.getBoqItemById(id);
    if (!existing) throw new Error('BOQ Item not found');

    if (data.itemCode && data.itemCode.trim() !== existing.itemCode) {
      const isDup = await this.checkBoqCodeExists(existing.projectId, data.itemCode, id);
      if (isDup) {
        throw new Error(`BOQ Item Code '${data.itemCode}' is already used by another item.`);
      }
    }

    const now = new Date().toISOString();
    const qty = data.quantity !== undefined ? Number(data.quantity) : existing.quantity;
    const rate = data.rate !== undefined ? Number(data.rate) : existing.rate;
    const execQty = data.executedQty !== undefined ? Number(data.executedQty) : existing.executedQty;
    const amount = qty * rate;
    const balanceQty = Math.max(0, qty - execQty);

    const updateObj: any = {
      ...data,
      quantity: qty,
      rate,
      amount,
      executedQty: execQty,
      balanceQty,
      updatedAt: now,
    };
    if (data.itemCode) updateObj.itemCode = data.itemCode.trim();

    await db.update(boqItems).set(updateObj).where(eq(boqItems.id, id));
    const [updated] = await db.select().from(boqItems).where(eq(boqItems.id, id));
    return updated as DbBoqItem;
  }

  async deleteBoqItem(id: string): Promise<boolean> {
    const now = new Date().toISOString();
    await db.update(boqItems).set({ deletedAt: now, isActive: false, updatedAt: now }).where(eq(boqItems.id, id));
    return true;
  }

  async restoreBoqItem(id: string): Promise<boolean> {
    const now = new Date().toISOString();
    await db.update(boqItems).set({ deletedAt: null, isActive: true, updatedAt: now }).where(eq(boqItems.id, id));
    return true;
  }

  // --- WBS ACTIVITIES ---
  async getActivitiesByProject(
    projectId: string,
    options?: { wbsId?: string; boqItemId?: string; department?: string; status?: string; search?: string }
  ): Promise<DbWbsActivity[]> {
    await this.ensureSeeded(projectId);
    const conditions = [eq(wbsActivities.projectId, projectId), isNull(wbsActivities.deletedAt)];

    if (options?.wbsId) conditions.push(eq(wbsActivities.wbsId, options.wbsId));
    if (options?.boqItemId) conditions.push(eq(wbsActivities.boqItemId, options.boqItemId));
    if (options?.department) conditions.push(eq(wbsActivities.department, options.department));
    if (options?.status) conditions.push(eq(wbsActivities.status, options.status));

    const items = await db.select().from(wbsActivities).where(and(...conditions)).orderBy(asc(wbsActivities.code));

    if (options?.search && options.search.trim() !== '') {
      const q = options.search.toLowerCase();
      return (items as DbWbsActivity[]).filter(
        a =>
          a.code.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          (a.contractorName && a.contractorName.toLowerCase().includes(q)) ||
          (a.responsibleEngineerName && a.responsibleEngineerName.toLowerCase().includes(q))
      );
    }

    return items as DbWbsActivity[];
  }

  async getActivityById(id: string): Promise<DbWbsActivity | null> {
    const [item] = await db.select().from(wbsActivities).where(eq(wbsActivities.id, id));
    return item ? (item as DbWbsActivity) : null;
  }

  async createActivity(data: {
    projectId: string;
    wbsId: string;
    boqItemId?: string | null;
    code: string;
    name: string;
    description?: string;
    department?: string;
    discipline?: string;
    responsibleEngineerId?: string;
    responsibleEngineerName?: string;
    supervisorId?: string;
    supervisorName?: string;
    foremanName?: string;
    contractorName?: string;
    subcontractorName?: string;
    vendorName?: string;
    crewName?: string;
    plannedQty?: number;
    startDate?: string;
    endDate?: string;
    weightage?: number;
    isCritical?: boolean;
    isMilestone?: boolean;
  }): Promise<DbWbsActivity> {
    const id = `act-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const now = new Date().toISOString();
    const plannedQty = Number(data.plannedQty) || 0;

    const newActivity = {
      id,
      projectId: data.projectId,
      wbsId: data.wbsId,
      boqItemId: data.boqItemId || null,
      code: data.code.trim(),
      name: data.name.trim(),
      description: data.description || null,
      department: data.department || data.discipline || 'General',
      discipline: data.discipline || null,
      responsibleEngineerId: data.responsibleEngineerId || null,
      responsibleEngineerName: data.responsibleEngineerName || null,
      supervisorId: data.supervisorId || null,
      supervisorName: data.supervisorName || null,
      foremanName: data.foremanName || null,
      contractorName: data.contractorName || null,
      subcontractorName: data.subcontractorName || null,
      vendorName: data.vendorName || null,
      crewName: data.crewName || null,
      status: 'PLANNED',
      plannedQty,
      todayQty: 0,
      cumulativeQty: 0,
      remainingQty: plannedQty,
      progressPercentage: 0,
      weightage: Number(data.weightage) || 1.0,
      spi: 1.0,
      cpi: 1.0,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      actualStartDate: null,
      actualEndDate: null,
      isCritical: !!data.isCritical,
      isMilestone: !!data.isMilestone,
      isActive: true,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(wbsActivities).values(newActivity);
    return newActivity as DbWbsActivity;
  }

  async updateActivity(id: string, data: Partial<DbWbsActivity>): Promise<DbWbsActivity> {
    const existing = await this.getActivityById(id);
    if (!existing) throw new Error('Activity not found');

    const now = new Date().toISOString();
    const plannedQty = data.plannedQty !== undefined ? Number(data.plannedQty) : existing.plannedQty;
    const cumulativeQty = data.cumulativeQty !== undefined ? Number(data.cumulativeQty) : existing.cumulativeQty;
    const remainingQty = Math.max(0, plannedQty - cumulativeQty);
    const progressPercentage = plannedQty > 0 ? Math.min(100, Math.round((cumulativeQty / plannedQty) * 10000) / 100) : existing.progressPercentage;

    const updateObj: any = {
      ...data,
      plannedQty,
      cumulativeQty,
      remainingQty,
      progressPercentage,
      updatedAt: now,
    };

    await db.update(wbsActivities).set(updateObj).where(eq(wbsActivities.id, id));
    const [updated] = await db.select().from(wbsActivities).where(eq(wbsActivities.id, id));
    return updated as DbWbsActivity;
  }

  async logDailyProgress(id: string, todayQty: number, status?: string): Promise<DbWbsActivity> {
    const act = await this.getActivityById(id);
    if (!act) throw new Error('Activity not found');

    const now = new Date().toISOString();
    const qtyAdded = Number(todayQty) || 0;
    const newCumulative = act.cumulativeQty + qtyAdded;
    const newRemaining = Math.max(0, act.plannedQty - newCumulative);
    const newPercentage = act.plannedQty > 0 ? Math.min(100, Math.round((newCumulative / act.plannedQty) * 10000) / 100) : 100;
    const newStatus = status || (newPercentage >= 100 ? 'COMPLETED' : newPercentage > 0 ? 'IN_PROGRESS' : act.status);

    await db
      .update(wbsActivities)
      .set({
        todayQty: qtyAdded,
        cumulativeQty: newCumulative,
        remainingQty: newRemaining,
        progressPercentage: newPercentage,
        status: newStatus,
        actualStartDate: act.actualStartDate || now,
        actualEndDate: newPercentage >= 100 ? now : null,
        updatedAt: now,
      })
      .where(eq(wbsActivities.id, id));

    // Also update parent BOQ Item executed qty if linked
    if (act.boqItemId) {
      const boq = await this.getBoqItemById(act.boqItemId);
      if (boq) {
        const newBoqExecuted = boq.executedQty + qtyAdded;
        await this.updateBoqItem(boq.id, { executedQty: newBoqExecuted });
      }
    }

    const [updated] = await db.select().from(wbsActivities).where(eq(wbsActivities.id, id));
    return updated as DbWbsActivity;
  }

  async deleteActivity(id: string): Promise<boolean> {
    const now = new Date().toISOString();
    await db.update(wbsActivities).set({ deletedAt: now, isActive: false, updatedAt: now }).where(eq(wbsActivities.id, id));
    return true;
  }

  async restoreActivity(id: string): Promise<boolean> {
    const now = new Date().toISOString();
    await db.update(wbsActivities).set({ deletedAt: null, isActive: true, updatedAt: now }).where(eq(wbsActivities.id, id));
    return true;
  }

  // --- DEPENDENCIES ---
  async getActivityDependencies(activityId: string): Promise<DbActivityDependency[]> {
    return db.select().from(activityDependencies).where(eq(activityDependencies.activityId, activityId));
  }

  async addActivityDependency(data: {
    activityId: string;
    predecessorActivityId: string;
    dependencyType?: string;
    lagDays?: number;
    leadDays?: number;
  }): Promise<DbActivityDependency> {
    if (data.activityId === data.predecessorActivityId) {
      throw new Error('An activity cannot depend on itself.');
    }
    const id = `dep-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newDep = {
      id,
      activityId: data.activityId,
      predecessorActivityId: data.predecessorActivityId,
      dependencyType: data.dependencyType || 'FS',
      lagDays: data.lagDays || 0,
      leadDays: data.leadDays || 0,
      createdAt: new Date().toISOString(),
    };
    await db.insert(activityDependencies).values(newDep);
    return newDep;
  }

  async deleteActivityDependency(id: string): Promise<boolean> {
    await db.delete(activityDependencies).where(eq(activityDependencies.id, id));
    return true;
  }

  // --- DOCUMENTS ---
  async getActivityDocuments(activityId: string): Promise<DbActivityDocument[]> {
    return db.select().from(activityDocuments).where(eq(activityDocuments.activityId, activityId));
  }

  async addActivityDocument(data: {
    activityId: string;
    title: string;
    documentType?: string;
    fileUrl: string;
    fileSize?: string;
    uploadedBy?: string;
  }): Promise<DbActivityDocument> {
    const id = `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newDoc = {
      id,
      activityId: data.activityId,
      title: data.title.trim(),
      documentType: data.documentType || 'DRAWING',
      fileUrl: data.fileUrl,
      fileSize: data.fileSize || '1.2 MB',
      uploadedBy: data.uploadedBy || 'System Engineer',
      createdAt: new Date().toISOString(),
    };
    await db.insert(activityDocuments).values(newDoc);
    return newDoc;
  }

  async deleteActivityDocument(id: string): Promise<boolean> {
    await db.delete(activityDocuments).where(eq(activityDocuments.id, id));
    return true;
  }

  // --- SEEDING METHOD ---
  async ensureSeeded(projectId: string): Promise<void> {
    if (!projectId) throw new Error('Project ID is required.');

    // Synthetic WBS/BOQ/activity fixtures are demo-only.
    // UAT/PRODUCTION must use controlled BOQ/WBS setup or import.
    if (!isDemoSeedAllowed()) return;
    const existing = await db
      .select({ count: sql<number>`count(*)` })
      .from(projectWbs)
      .where(eq(projectWbs.projectId, projectId));

    if (Number(existing[0]?.count || 0) > 0) return;

    const now = new Date().toISOString();

    // Create Root WBS Packages & Subtrees
    const wbs1Id = `wbs-${projectId}-pkg1`;
    const wbs2Id = `wbs-${projectId}-pkg2`;
    const wbs1_1Id = `wbs-${projectId}-pkg1-z1`;
    const wbs1_2Id = `wbs-${projectId}-pkg1-z2`;

    await db.insert(projectWbs).values([
      {
        id: wbs1Id,
        projectId,
        parentId: null,
        code: 'WBS-01',
        name: 'Package A: Civil & Structural Infrastructure',
        description: 'Earthworks, piling, foundation slabs and main concrete superstructures',
        level: 1,
        nodeType: 'PACKAGE',
        displayOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: wbs1_1Id,
        projectId,
        parentId: wbs1Id,
        code: 'WBS-01.1',
        name: 'Zone 1 - Earthworks & Foundations',
        description: 'Excavation, piling and blinding concrete works',
        level: 2,
        nodeType: 'ZONE',
        displayOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: wbs1_2Id,
        projectId,
        parentId: wbs1Id,
        code: 'WBS-01.2',
        name: 'Zone 2 - Superstructure & Steel Framing',
        description: 'Column casting, beam erection and structural steel roof trusses',
        level: 2,
        nodeType: 'ZONE',
        displayOrder: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: wbs2Id,
        projectId,
        parentId: null,
        code: 'WBS-02',
        name: 'Package B: Mechanical, Electrical & Piping (MEP)',
        description: 'High pressure piping, electrical switchgear, pump installation and SCADA',
        level: 1,
        nodeType: 'PACKAGE',
        displayOrder: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed BOQ Items
    const boq1Id = `boq-${projectId}-101`;
    const boq2Id = `boq-${projectId}-102`;
    const boq3Id = `boq-${projectId}-103`;

    await db.insert(boqItems).values([
      {
        id: boq1Id,
        projectId,
        wbsId: wbs1_1Id,
        departmentId: 'dept-civ',
        departmentName: 'Civil Works',
        itemCode: 'BOQ-CIV-001',
        description: 'Mass excavation in all types of soil including disposal and compaction',
        unit: 'm3',
        quantity: 15000,
        rate: 85,
        amount: 1275000,
        executedQty: 6200,
        balanceQty: 8800,
        budgetQty: 15000,
        revisedQty: 15000,
        remarks: 'Phase 1 excavation ongoing',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        isVariation: false,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: boq2Id,
        projectId,
        wbsId: wbs1_2Id,
        departmentId: 'dept-civ',
        departmentName: 'Civil Works',
        itemCode: 'BOQ-CIV-002',
        description: 'Reinforced concrete C35/45 for heavy foundation slabs and retaining walls',
        unit: 'm3',
        quantity: 4200,
        rate: 450,
        amount: 1890000,
        executedQty: 1200,
        balanceQty: 3000,
        budgetQty: 4200,
        revisedQty: 4200,
        remarks: 'Pouring schedule approved by Lead Engineer',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        isVariation: false,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: boq3Id,
        projectId,
        wbsId: wbs2Id,
        departmentId: 'dept-piping',
        departmentName: 'Piping & MEP',
        itemCode: 'BOQ-MEP-101',
        description: 'Supply and installation of 600mm Carbon Steel Pipeline (Class 150) with anti-corrosion coating',
        unit: 'm',
        quantity: 3500,
        rate: 680,
        amount: 2380000,
        executedQty: 850,
        balanceQty: 2650,
        budgetQty: 3500,
        revisedQty: 3500,
        remarks: 'Hydrotest pending for Section 1',
        status: 'IN_PROGRESS',
        priority: 'CRITICAL',
        isVariation: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Activities
    const act1Id = `act-${projectId}-001`;
    const act2Id = `act-${projectId}-002`;
    const act3Id = `act-${projectId}-003`;

    await db.insert(wbsActivities).values([
      {
        id: act1Id,
        projectId,
        wbsId: wbs1_1Id,
        boqItemId: boq1Id,
        code: 'ACT-EXC-01',
        name: 'Bulk Excavation for Main Sump & Pump House',
        description: 'Deep excavation using CAT 349 excavators to -6.5m level',
        department: 'Civil',
        discipline: 'Geotechnical & Earthworks',
        responsibleEngineerId: 'usr-inc-003',
        responsibleEngineerName: 'Eng. Sarah Al Hashmi',
        supervisorName: 'Mohammed Tariq',
        foremanName: 'Suresh Kumar',
        contractorName: 'Emirates Infra Tech LLC',
        status: 'IN_PROGRESS',
        plannedQty: 15000,
        todayQty: 350,
        cumulativeQty: 6200,
        remainingQty: 8800,
        progressPercentage: 41.33,
        weightage: 2.5,
        spi: 1.05,
        cpi: 1.02,
        startDate: '2026-08-01',
        endDate: '2026-09-15',
        actualStartDate: '2026-08-01',
        isCritical: true,
        isMilestone: false,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: act2Id,
        projectId,
        wbsId: wbs1_2Id,
        boqItemId: boq2Id,
        code: 'ACT-CON-01',
        name: 'Reinforcement Steel Fixing & Concrete Pouring for Foundation B1',
        description: 'Fixing rebar, shuttering formwork and 800m3 continuous pour',
        department: 'Civil',
        discipline: 'Structural Concrete',
        responsibleEngineerId: 'usr-mgr-002',
        responsibleEngineerName: 'Eng. David Miller',
        supervisorName: 'Hassan Ali',
        foremanName: 'Ramesh Patel',
        contractorName: 'Apex Gulf Structures',
        status: 'IN_PROGRESS',
        plannedQty: 4200,
        todayQty: 120,
        cumulativeQty: 1200,
        remainingQty: 3000,
        progressPercentage: 28.57,
        weightage: 3.0,
        spi: 0.98,
        cpi: 1.0,
        startDate: '2026-08-10',
        endDate: '2026-10-30',
        actualStartDate: '2026-08-10',
        isCritical: true,
        isMilestone: false,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: act3Id,
        projectId,
        wbsId: wbs2Id,
        boqItemId: boq3Id,
        code: 'ACT-PIP-01',
        name: 'Carbon Steel Pipe Laying & Field Butt Welding (DN600)',
        description: 'Positioning, alignment and TIG welding of 600mm main headers',
        department: 'Pipeline',
        discipline: 'Mechanical Piping',
        responsibleEngineerId: 'usr-admin-001',
        responsibleEngineerName: 'Eng. Abdul Vajid EK',
        supervisorName: 'Sami Al Mansoori',
        foremanName: 'Vikram Singh',
        contractorName: 'Arabian Piping Systems',
        status: 'IN_PROGRESS',
        plannedQty: 3500,
        todayQty: 45,
        cumulativeQty: 850,
        remainingQty: 2650,
        progressPercentage: 24.29,
        weightage: 4.5,
        spi: 1.02,
        cpi: 0.99,
        startDate: '2026-08-15',
        endDate: '2026-11-20',
        actualStartDate: '2026-08-15',
        isCritical: true,
        isMilestone: false,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Dependencies & Documents
    await db.insert(activityDependencies).values({
      id: `dep-${projectId}-01`,
      activityId: act2Id,
      predecessorActivityId: act1Id,
      dependencyType: 'FS',
      lagDays: 2,
      leadDays: 0,
      createdAt: now,
    });

    await db.insert(activityDocuments).values({
      id: `doc-${projectId}-01`,
      activityId: act3Id,
      title: 'DN600 Pipe Welding Method Statement & ITP',
      documentType: 'METHOD_STATEMENT',
      fileUrl: '/docs/DN600_Welding_ITP_Approved.pdf',
      fileSize: '3.4 MB',
      uploadedBy: 'Eng. Abdul Vajid EK',
      createdAt: now,
    });
  }
}

export const wbsRepository = new WbsRepository();
