import * as documentRepo from '../repositories/document.repository';

export class DocumentService {
  async getStats() {
    return documentRepo.getEDMSStats();
  }

  async getFolders(projectId?: string, parentId?: string | null) {
    return documentRepo.getFolders(projectId, parentId);
  }

  async getFolderById(id: string) {
    const folder = await documentRepo.getFolderById(id);
    if (!folder) throw new Error('Folder not found');
    return folder;
  }

  async createFolder(data: any) {
    return documentRepo.createFolder(data);
  }

  async updateFolder(id: string, data: any) {
    return documentRepo.updateFolder(id, data);
  }

  async deleteFolder(id: string) {
    return documentRepo.deleteFolder(id);
  }

  async getDocuments(filters?: any) {
    return documentRepo.getDocuments(filters);
  }

  async getDocumentById(id: string) {
    const doc = await documentRepo.getDocumentById(id);
    if (!doc) throw new Error('Document not found');
    return doc;
  }

  async createDocument(data: any) {
    return documentRepo.createDocument(data);
  }

  async updateDocument(id: string, data: any) {
    return documentRepo.updateDocument(id, data);
  }

  async deleteDocument(id: string, user?: string) {
    return documentRepo.deleteDocument(id, user);
  }

  async toggleFavorite(id: string, user?: string) {
    return documentRepo.toggleFavoriteDocument(id, user);
  }

  async archiveDocument(id: string, reason: string, user: string) {
    return documentRepo.archiveDocument(id, reason, user);
  }

  async restoreDocument(id: string, user: string) {
    return documentRepo.restoreDocument(id, user);
  }

  async getVersions(documentId: string) {
    return documentRepo.getDocumentVersions(documentId);
  }

  async addVersion(data: any) {
    return documentRepo.createDocumentVersion(data);
  }

  async checkoutDocument(documentId: string, user: string, notes?: string, expectedDate?: string) {
    return documentRepo.checkoutDocument(documentId, user, notes, expectedDate);
  }

  async reviewDocument(data: any) {
    return documentRepo.reviewDocument(data);
  }

  async approveDocument(data: any) {
    return documentRepo.approveDocument(data);
  }

  async getReviews(documentId: string) {
    return documentRepo.getDocumentReviews(documentId);
  }

  async getApprovals(documentId: string) {
    return documentRepo.getDocumentApprovals(documentId);
  }

  async searchDocuments(query: string, filters?: any) {
    return documentRepo.searchDocuments(query, filters);
  }

  async getAuditLogs(documentId?: string) {
    return documentRepo.getAuditLogs(documentId);
  }

  async shareDocument(data: any) {
    return documentRepo.shareDocument(data);
  }

  async getShares(documentId: string) {
    return documentRepo.getDocumentShares(documentId);
  }
}

export const documentService = new DocumentService();
