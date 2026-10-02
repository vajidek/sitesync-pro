import { wbsRepository, DbWbsNode, DbBoqItem, DbWbsActivity } from '../repositories/wbs.repository';

export class WbsService {
  // --- WBS NODES ---
  async getWbsTree(projectId: string, includeDeleted = false) {
    if (!projectId) throw new Error('Project ID is required');
    return wbsRepository.getWbsTree(projectId, includeDeleted);
  }

  async getWbsNodeById(id: string) {
    const node = await wbsRepository.getWbsNodeById(id);
    if (!node) throw new Error('WBS Node not found');
    return node;
  }

  async createWbsNode(data: {
    projectId: string;
    parentId?: string | null;
    code: string;
    name: string;
    description?: string;
    nodeType?: string;
    displayOrder?: number;
  }) {
    if (!data.projectId) throw new Error('Project ID is required');
    if (!data.code || !data.code.trim()) throw new Error('WBS Code is required');
    if (!data.name || !data.name.trim()) throw new Error('WBS Name is required');

    return wbsRepository.createWbsNode(data);
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
  ) {
    return wbsRepository.updateWbsNode(id, data);
  }

  async moveWbsNode(id: string, newParentId: string | null, newDisplayOrder?: number) {
    return wbsRepository.moveWbsNode(id, newParentId, newDisplayOrder);
  }

  async duplicateSubtree(id: string, targetParentId?: string | null) {
    return wbsRepository.duplicateSubtree(id, targetParentId);
  }

  async deleteWbsNode(id: string, recursive = false) {
    const success = await wbsRepository.deleteWbsNode(id, recursive);
    return { success, message: recursive ? 'WBS node and subtrees deleted successfully' : 'WBS node deleted successfully' };
  }

  async restoreWbsNode(id: string, recursive = false) {
    const success = await wbsRepository.restoreWbsNode(id, recursive);
    return { success, message: 'WBS node restored successfully' };
  }

  // --- BOQ ITEMS ---
  async getBoqItems(projectId: string, wbsId?: string, search?: string) {
    if (!projectId) throw new Error('Project ID is required');
    return wbsRepository.getBoqItemsByProject(projectId, wbsId, search);
  }

  async getBoqItemById(id: string) {
    const item = await wbsRepository.getBoqItemById(id);
    if (!item) throw new Error('BOQ Item not found');
    return item;
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
  }) {
    if (!data.projectId) throw new Error('Project ID is required');
    if (!data.wbsId) throw new Error('WBS ID is required');
    if (!data.itemCode || !data.itemCode.trim()) throw new Error('BOQ Item Code is required');
    if (!data.description || !data.description.trim()) throw new Error('BOQ Item Description is required');
    if (!data.unit || !data.unit.trim()) throw new Error('BOQ Unit is required');

    return wbsRepository.createBoqItem(data);
  }

  async updateBoqItem(id: string, data: Partial<DbBoqItem>) {
    return wbsRepository.updateBoqItem(id, data);
  }

  async bulkUpdateBoqItems(items: Array<{ id: string; [key: string]: any }>) {
    const updatedItems = [];
    for (const item of items) {
      if (!item.id) continue;
      const { id, ...rest } = item;
      const updated = await wbsRepository.updateBoqItem(id, rest);
      updatedItems.push(updated);
    }
    return { success: true, count: updatedItems.length, data: updatedItems };
  }

  async deleteBoqItem(id: string) {
    const success = await wbsRepository.deleteBoqItem(id);
    return { success, message: 'BOQ Item deleted successfully' };
  }

  async restoreBoqItem(id: string) {
    const success = await wbsRepository.restoreBoqItem(id);
    return { success, message: 'BOQ Item restored successfully' };
  }

  // --- ACTIVITIES ---
  async getActivities(
    projectId: string,
    options?: { wbsId?: string; boqItemId?: string; department?: string; status?: string; search?: string }
  ) {
    if (!projectId) throw new Error('Project ID is required');
    return wbsRepository.getActivitiesByProject(projectId, options);
  }

  async getActivityById(id: string) {
    const act = await wbsRepository.getActivityById(id);
    if (!act) throw new Error('Activity not found');

    const dependencies = await wbsRepository.getActivityDependencies(id);
    const documents = await wbsRepository.getActivityDocuments(id);

    return { ...act, dependencies, documents };
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
  }) {
    if (!data.projectId) throw new Error('Project ID is required');
    if (!data.wbsId) throw new Error('WBS ID is required');
    if (!data.code || !data.code.trim()) throw new Error('Activity Code is required');
    if (!data.name || !data.name.trim()) throw new Error('Activity Name is required');

    return wbsRepository.createActivity(data);
  }

  async updateActivity(id: string, data: Partial<DbWbsActivity>) {
    return wbsRepository.updateActivity(id, data);
  }

  async logDailyProgress(id: string, todayQty: number, status?: string) {
    return wbsRepository.logDailyProgress(id, todayQty, status);
  }

  async deleteActivity(id: string) {
    const success = await wbsRepository.deleteActivity(id);
    return { success, message: 'Activity deleted successfully' };
  }

  async restoreActivity(id: string) {
    const success = await wbsRepository.restoreActivity(id);
    return { success, message: 'Activity restored successfully' };
  }

  // Dependencies & Documents
  async addDependency(activityId: string, predecessorActivityId: string, dependencyType?: string, lagDays?: number, leadDays?: number) {
    return wbsRepository.addActivityDependency({ activityId, predecessorActivityId, dependencyType, lagDays, leadDays });
  }

  async deleteDependency(id: string) {
    return wbsRepository.deleteActivityDependency(id);
  }

  async addDocument(activityId: string, title: string, documentType?: string, fileUrl?: string, fileSize?: string, uploadedBy?: string) {
    return wbsRepository.addActivityDocument({
      activityId,
      title,
      documentType,
      fileUrl: fileUrl || '/docs/attachment_placeholder.pdf',
      fileSize,
      uploadedBy,
    });
  }

  async deleteDocument(id: string) {
    return wbsRepository.deleteActivityDocument(id);
  }
}

export const wbsService = new WbsService();
