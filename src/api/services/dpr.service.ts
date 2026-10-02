import { dprRepository, CreateDprDto, CreateDprEntryDto } from '../repositories/dpr.repository';

export class DprService {
  async getProjectDprs(projectId: string, filters?: { date?: string; status?: string; departmentId?: string }) {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    return dprRepository.getAllByProject(projectId, filters);
  }

  async getDprById(id: string) {
    if (!id) {
      throw new Error('DPR ID is required');
    }
    const dpr = await dprRepository.getById(id);
    if (!dpr) {
      throw new Error(`DPR with ID ${id} not found`);
    }
    return dpr;
  }

  async createDpr(data: CreateDprDto) {
    if (!data.projectId) {
      throw new Error('Project ID is required');
    }
    if (!data.date) {
      throw new Error('Date is required');
    }
    return dprRepository.create(data);
  }

  async updateDpr(id: string, data: Partial<CreateDprDto>) {
    if (!id) {
      throw new Error('DPR ID is required');
    }
    return dprRepository.update(id, data);
  }

  async softDeleteDpr(id: string) {
    if (!id) {
      throw new Error('DPR ID is required');
    }
    return dprRepository.softDelete(id);
  }

  async restoreDpr(id: string) {
    if (!id) {
      throw new Error('DPR ID is required');
    }
    return dprRepository.restore(id);
  }

  // Entries
  async addEntry(data: CreateDprEntryDto) {
    if (!data.dprId || !data.projectId) {
      throw new Error('DPR ID and Project ID are required');
    }
    return dprRepository.createEntry(data);
  }

  async updateEntry(id: string, data: Partial<CreateDprEntryDto>) {
    if (!id) {
      throw new Error('Entry ID is required');
    }
    return dprRepository.updateEntry(id, data);
  }

  async deleteEntry(id: string) {
    if (!id) {
      throw new Error('Entry ID is required');
    }
    return dprRepository.deleteEntry(id);
  }

  // Photos & Docs
  async addPhoto(data: { dprId: string; entryId?: string; category?: string; fileUrl: string; gpsLat?: number; gpsLng?: number; caption?: string; photoCategory?: string }) {
    if (!data.dprId || !data.fileUrl) {
      throw new Error('DPR ID and fileUrl are required');
    }
    return dprRepository.addPhoto(data);
  }

  async deletePhoto(id: string) {
    if (!id) throw new Error('Photo ID is required');
    return dprRepository.deletePhoto(id);
  }

  async addDocument(data: { dprId: string; title: string; documentType?: string; fileUrl: string; fileSize?: string; uploadedBy?: string }) {
    if (!data.dprId || !data.title || !data.fileUrl) {
      throw new Error('DPR ID, title and fileUrl are required');
    }
    return dprRepository.addDocument(data);
  }

  async deleteDocument(id: string) {
    if (!id) throw new Error('Document ID is required');
    return dprRepository.deleteDocument(id);
  }

  // Weather
  async upsertWeather(dprId: string, data: { condition?: string; temperature?: number; humidity?: number; rainfall?: number; windSpeed?: number; remarks?: string }) {
    if (!dprId) throw new Error('DPR ID is required');
    return dprRepository.upsertWeather(dprId, data);
  }

  // Delays
  async addDelay(data: { dprId: string; category: string; reason: string; responsibleParty?: string; impact?: string; affectedActivityId?: string; affectedBoqId?: string; affectedWbsId?: string; estimatedDelayHours?: number; correctiveAction?: string; status?: string }) {
    if (!data.dprId || !data.category || !data.reason) {
      throw new Error('DPR ID, category and reason are required');
    }
    return dprRepository.createDelay(data);
  }

  async updateDelay(id: string, data: Partial<{ category: string; reason: string; responsibleParty: string; impact: string; estimatedDelayHours: number; correctiveAction: string; status: string }>) {
    if (!id) throw new Error('Delay ID is required');
    return dprRepository.updateDelay(id, data);
  }

  async deleteDelay(id: string) {
    if (!id) throw new Error('Delay ID is required');
    return dprRepository.deleteDelay(id);
  }

  // Approvals & Comments
  async addApproval(dprId: string, data: { approverId?: string; approverName: string; action: string; remarks?: string }) {
    if (!dprId || !data.approverName || !data.action) {
      throw new Error('DPR ID, approver name and action are required');
    }
    return dprRepository.addApproval(dprId, data);
  }

  async addComment(dprId: string, data: { authorId?: string; authorName: string; role?: string; comment: string }) {
    if (!dprId || !data.authorName || !data.comment) {
      throw new Error('DPR ID, author name and comment are required');
    }
    return dprRepository.addComment(dprId, data);
  }

  // KPIs
  async getProjectDprKpis(projectId: string) {
    if (!projectId) throw new Error('Project ID is required');
    return dprRepository.getProjectDprKpis(projectId);
  }
}

export const dprService = new DprService();
