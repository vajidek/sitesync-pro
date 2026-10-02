import { db } from '../../db';
import {
  phase61DocumentCategories,
  phase61DocumentFolders,
  phase61DocumentFiles,
  phase61DocumentVersions,
  phase61DocumentMetadata,
  phase61DocumentTags,
  phase61FolderPermissions,
  phase61DocumentPermissions,
  phase61DocumentCheckouts,
  phase61DocumentReviews,
  phase61DocumentApprovals,
  phase61DocumentWorkflows,
  phase61DocumentComments,
  phase61DocumentAttachments,
  phase61DocumentLinks,
  phase61DocumentDownloadLogs,
  phase61DocumentAccessLogs,
  phase61DocumentAuditLogs,
  phase61DocumentExpiry,
  phase61DocumentArchive,
  phase61DocumentTemplates,
  phase61DocumentShares,
  phase61DocumentNotifications,
} from '../../db/schema';
import { eq, and, isNull, desc, sql, like, or } from 'drizzle-orm';
import crypto from 'crypto';
import { isDemoSeedAllowed } from '../config/env';

let tablesCreated = false;

export async function ensureDocumentTablesExist() {
  if (tablesCreated) return;
  try {
    // Seed default categories and root folders if empty
    if (!isDemoSeedAllowed()) {
      tablesCreated = true;
      return;
    }
    const existingCat = await db.select().from(phase61DocumentCategories).limit(1);
    if (existingCat.length === 0) {
      const now = new Date().toISOString();
      await db.insert(phase61DocumentCategories).values([
        { id: crypto.randomUUID(), code: 'CAT-ENG', name: 'Engineering Drawings & Specs', description: 'CAD, BIM & Architectural drawings', colorCode: '#3b82f6', createdAt: now, updatedAt: now },
        { id: crypto.randomUUID(), code: 'CAT-QA', name: 'QA/QC & Inspections', description: 'ITPs, Test Certificates & Inspection Reports', colorCode: '#10b981', createdAt: now, updatedAt: now },
        { id: crypto.randomUUID(), code: 'CAT-HSE', name: 'HSE & Safety Protocols', description: 'Risk Assessments, Safety Guidelines & Method Statements', colorCode: '#f59e0b', createdAt: now, updatedAt: now },
        { id: crypto.randomUUID(), code: 'CAT-PROC', name: 'Procurement & Contracts', description: 'BOQs, POs, Subcontracts & Delivery Notes', colorCode: '#8b5cf6', createdAt: now, updatedAt: now },
        { id: crypto.randomUUID(), code: 'CAT-FIN', name: 'Finance & Invoices', description: 'Payment Certificates & Vendor Invoices', colorCode: '#ec4899', createdAt: now, updatedAt: now },
      ]);
    }

    const existingFolders = await db.select().from(phase61DocumentFolders).limit(1);
    if (existingFolders.length === 0) {
      const now = new Date().toISOString();
      const rootCivilId = crypto.randomUUID();
      await db.insert(phase61DocumentFolders).values([
        { id: rootCivilId, folderName: 'Civil Engineering Projects', parentId: null, folderPath: '/Civil Engineering Projects', isSystemFolder: true, createdAt: now, updatedAt: now },
        { id: crypto.randomUUID(), folderName: 'AutoCAD Drawings & BIM', parentId: rootCivilId, folderPath: '/Civil Engineering Projects/AutoCAD Drawings & BIM', isSystemFolder: false, createdAt: now, updatedAt: now },
        { id: crypto.randomUUID(), folderName: 'ITPs & Quality Certificates', parentId: rootCivilId, folderPath: '/Civil Engineering Projects/ITPs & Quality Certificates', isSystemFolder: false, createdAt: now, updatedAt: now },
        { id: crypto.randomUUID(), folderName: 'HSE Site Safety & Permits', parentId: null, folderPath: '/HSE Site Safety & Permits', isSystemFolder: true, createdAt: now, updatedAt: now },
      ]);
    }

    tablesCreated = true;
  } catch (err) {
    console.warn('Error creating Phase 61 EDMS tables:', err);
    tablesCreated = true;
  }
}

// ==========================================
// FOLDER REPOSITORY
// ==========================================

export async function getFolders(projectId?: string, parentId?: string | null) {
  await ensureDocumentTablesExist();
  let query = db.select().from(phase61DocumentFolders).where(eq(phase61DocumentFolders.isDeleted, false));
  const results = await query;
  return results.filter(f => {
    if (parentId !== undefined) {
      return parentId === null ? f.parentId === null : f.parentId === parentId;
    }
    if (projectId) return f.projectId === projectId;
    return true;
  });
}

export async function getFolderById(id: string) {
  await ensureDocumentTablesExist();
  const rows = await db.select().from(phase61DocumentFolders).where(and(eq(phase61DocumentFolders.id, id), eq(phase61DocumentFolders.isDeleted, false)));
  return rows[0] || null;
}

export async function createFolder(data: {
  folderName: string;
  parentId?: string | null;
  projectId?: string;
  department?: string;
  isSystemFolder?: boolean;
  createdBy?: string;
}) {
  await ensureDocumentTablesExist();
  const now = new Date().toISOString();
  let folderPath = '/' + data.folderName;

  if (data.parentId) {
    const parent = await getFolderById(data.parentId);
    if (parent) {
      folderPath = `${parent.folderPath}/${data.folderName}`;
    }
  }

  const id = crypto.randomUUID();
  const record = {
    id,
    folderName: data.folderName,
    parentId: data.parentId || null,
    folderPath,
    projectId: data.projectId || null,
    department: data.department || 'Engineering',
    isSystemFolder: data.isSystemFolder || false,
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
    createdBy: String(data.createdBy || '').trim(),
    updatedBy: String(data.createdBy || '').trim(),
    isDeleted: false,
  };
  if (!record.createdBy) throw new Error('Authenticated folder creator identity is required.');

  await db.insert(phase61DocumentFolders).values(record);
  return record;
}

export async function updateFolder(id: string, data: any) {
  await ensureDocumentTablesExist();
  const now = new Date().toISOString();
  await db.update(phase61DocumentFolders)
    .set({ ...data, updatedAt: now })
    .where(eq(phase61DocumentFolders.id, id));
  return getFolderById(id);
}

export async function deleteFolder(id: string) {
  await ensureDocumentTablesExist();
  const now = new Date().toISOString();
  await db.update(phase61DocumentFolders)
    .set({ isDeleted: true, deletedAt: now, status: 'DELETED' })
    .where(eq(phase61DocumentFolders.id, id));
  return true;
}

// ==========================================
// DOCUMENT REPOSITORY
// ==========================================

export async function getDocuments(filters?: {
  folderId?: string;
  categoryId?: string;
  search?: string;
  workflowStatus?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  projectId?: string;
  isDeleted?: boolean;
}) {
  await ensureDocumentTablesExist();
  const docs = await db.select().from(phase61DocumentFiles).where(eq(phase61DocumentFiles.isDeleted, filters?.isDeleted ?? false));

  return docs.filter(d => {
    if (filters?.folderId && d.folderId !== filters.folderId) return false;
    if (filters?.categoryId && d.categoryId !== filters.categoryId) return false;
    if (filters?.workflowStatus && d.workflowStatus !== filters.workflowStatus) return false;
    if (filters?.isFavorite !== undefined && d.isFavorite !== filters.isFavorite) return false;
    if (filters?.isArchived !== undefined && d.isArchived !== filters.isArchived) return false;
    if (filters?.projectId && d.projectId !== filters.projectId) return false;
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      const matchNumber = d.documentNumber.toLowerCase().includes(q);
      const matchTitle = d.title.toLowerCase().includes(q);
      const matchDesc = d.description ? d.description.toLowerCase().includes(q) : false;
      const matchType = d.fileType.toLowerCase().includes(q);
      if (!matchNumber && !matchTitle && !matchDesc && !matchType) return false;
    }
    return true;
  });
}

export async function getDocumentById(id: string) {
  await ensureDocumentTablesExist();
  const rows = await db.select().from(phase61DocumentFiles).where(eq(phase61DocumentFiles.id, id));
  return rows[0] || null;
}

export async function createDocument(data: {
  title: string;
  description?: string;
  folderId: string;
  categoryId?: string;
  fileType?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  fileUrl?: string;
  projectId?: string;
  vendorId?: string;
  contractId?: string;
  poId?: string;
  assetId?: string;
  hrEmployeeId?: string;
  qaInspectionId?: string;
  tags?: string[];
  metadata?: Record<string, string>;
  createdBy?: string;
  watermarkText?: string;
}) {
  await ensureDocumentTablesExist();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const title = String(data.title || '').trim();
  const folderId = String(data.folderId || '').trim();
  const createdBy = String(data.createdBy || '').trim();
  const fileUrl = String(data.fileUrl || '').trim();
  const fileType = String(data.fileType || '').trim().toUpperCase();
  const mimeType = String(data.mimeType || '').trim();
  const fileSizeBytes = Number(data.fileSizeBytes);
  if (!title || !folderId || !createdBy || !fileUrl || !fileType || !mimeType || !Number.isFinite(fileSizeBytes) || fileSizeBytes <= 0) {
    throw new Error('Document title, folder, uploaded file URL/type/mime/size and authenticated creator are required.');
  }
  const folder = await getFolderById(folderId);
  if (!folder) throw new Error('Target document folder not found.');

  // Generate document number e.g. DOC-2026-XXXXX
  const countRes = await db.select({ count: sql<number>`count(*)` }).from(phase61DocumentFiles);
  const seq = Number(countRes[0]?.count || 0) + 1;
  const documentNumber = `DOC-${new Date().getFullYear()}-${String(seq).padStart(6, '0')}`;

  const docRecord = {
    id,
    documentNumber,
    title,
    description: data.description || null,
    folderId,
    categoryId: data.categoryId || null,
    fileType,
    mimeType,
    fileSizeBytes,
    fileUrl,
    currentVersion: 'v1.0',
    revisionNumber: 1,
    projectId: data.projectId || null,
    vendorId: data.vendorId || null,
    contractId: data.contractId || null,
    poId: data.poId || null,
    assetId: data.assetId || null,
    hrEmployeeId: data.hrEmployeeId || null,
    qaInspectionId: data.qaInspectionId || null,
    isCheckedOut: false,
    isFavorite: false,
    isArchived: false,
    isLocked: false,
    ocrTextContent: null,
    workflowStatus: 'DRAFT',
    digitalStampApplied: false,
    watermarkText: data.watermarkText || null,
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
    createdBy,
    updatedBy: createdBy,
    isDeleted: false,
  };

  await db.insert(phase61DocumentFiles).values(docRecord);

  // Insert Version 1.0
  const versionId = crypto.randomUUID();
  await db.insert(phase61DocumentVersions).values({
    id: versionId,
    documentId: id,
    versionName: 'v1.0',
    revisionNumber: 1,
    fileUrl: docRecord.fileUrl,
    fileSizeBytes: docRecord.fileSizeBytes,
    changeSummary: 'Initial document submission',
    uploadedBy: docRecord.createdBy,
    isMajorVersion: true,
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
    createdBy: docRecord.createdBy,
    updatedBy: docRecord.createdBy,
    isDeleted: false,
  });

  // Insert Tags if provided
  if (data.tags && data.tags.length > 0) {
    for (const tag of data.tags) {
      await db.insert(phase61DocumentTags).values({
        id: crypto.randomUUID(),
        documentId: id,
        tagName: tag,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        createdBy: docRecord.createdBy,
        updatedBy: docRecord.createdBy,
        isDeleted: false,
      });
    }
  }

  // Insert Metadata if provided
  if (data.metadata) {
    for (const [key, value] of Object.entries(data.metadata)) {
      await db.insert(phase61DocumentMetadata).values({
        id: crypto.randomUUID(),
        documentId: id,
        metaKey: key,
        metaValue: value,
        dataType: 'STRING',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        createdBy: docRecord.createdBy,
        updatedBy: docRecord.createdBy,
        isDeleted: false,
      });
    }
  }

  // Log Audit
  await logAudit(id, docRecord.createdBy, 'CREATE', { documentNumber, title: data.title });

  return docRecord;
}

export async function updateDocument(id: string, data: any) {
  await ensureDocumentTablesExist();
  const now = new Date().toISOString();
  await db.update(phase61DocumentFiles)
    .set({ ...data, updatedAt: now })
    .where(eq(phase61DocumentFiles.id, id));
  
  if (data.updatedBy) {
    await logAudit(id, data.updatedBy, 'EDIT', data);
  }
  return getDocumentById(id);
}

export async function deleteDocument(id: string, user: string) {
  if (!user?.trim()) throw new Error('Authenticated document deletion actor is required.');
  await ensureDocumentTablesExist();
  const now = new Date().toISOString();
  await db.update(phase61DocumentFiles)
    .set({ isDeleted: true, deletedAt: now, status: 'DELETED' })
    .where(eq(phase61DocumentFiles.id, id));
  
  await logAudit(id, user, 'DELETE', { action: 'Soft deleted document' });
  return true;
}

export async function toggleFavoriteDocument(id: string, user: string) {
  if (!user?.trim()) throw new Error('Authenticated document actor is required.');
  await ensureDocumentTablesExist();
  const doc = await getDocumentById(id);
  if (!doc) return null;
  const newFav = !doc.isFavorite;
  await db.update(phase61DocumentFiles)
    .set({ isFavorite: newFav, updatedAt: new Date().toISOString() })
    .where(eq(phase61DocumentFiles.id, id));
  return newFav;
}

export async function archiveDocument(id: string, reason: string, user: string) {
  await ensureDocumentTablesExist();
  const now = new Date().toISOString();
  await db.update(phase61DocumentFiles)
    .set({ isArchived: true, workflowStatus: 'ARCHIVED', updatedAt: now })
    .where(eq(phase61DocumentFiles.id, id));

  await db.insert(phase61DocumentArchive).values({
    id: crypto.randomUUID(),
    documentId: id,
    archiveReason: reason,
    archivedBy: user,
    archivedAt: now,
    status: 'ARCHIVED',
    createdAt: now,
    updatedAt: now,
    createdBy: user,
    updatedBy: user,
    isDeleted: false,
  });

  await logAudit(id, user, 'ARCHIVE', { reason });
  return true;
}

export async function restoreDocument(id: string, user: string) {
  await ensureDocumentTablesExist();
  const now = new Date().toISOString();
  await db.update(phase61DocumentFiles)
    .set({ isArchived: false, isDeleted: false, workflowStatus: 'DRAFT', updatedAt: now })
    .where(eq(phase61DocumentFiles.id, id));

  await logAudit(id, user, 'RESTORE', { action: 'Document restored from archive/recycle bin' });
  return true;
}

// ==========================================
// VERSIONS & CHECKOUT
// ==========================================

export async function getDocumentVersions(documentId: string) {
  await ensureDocumentTablesExist();
  return db.select().from(phase61DocumentVersions)
    .where(and(eq(phase61DocumentVersions.documentId, documentId), eq(phase61DocumentVersions.isDeleted, false)))
    .orderBy(desc(phase61DocumentVersions.createdAt));
}

export async function createDocumentVersion(data: {
  documentId: string;
  versionName: string;
  fileUrl: string;
  fileSizeBytes?: number;
  changeSummary?: string;
  isMajorVersion?: boolean;
  uploadedBy?: string;
}) {
  await ensureDocumentTablesExist();
  const now = new Date().toISOString();
  const uploadedBy = String(data.uploadedBy || '').trim();
  const fileUrl = String(data.fileUrl || '').trim();
  const fileSizeBytes = Number(data.fileSizeBytes);
  if (!uploadedBy || !fileUrl || !Number.isFinite(fileSizeBytes) || fileSizeBytes <= 0 || !String(data.versionName || '').trim()) {
    throw new Error('Version name, actual file URL/size and authenticated uploader identity are required.');
  }
  const doc = await getDocumentById(data.documentId);
  if (!doc) throw new Error('Document not found');

  const nextRevision = doc.revisionNumber + 1;
  const versionId = crypto.randomUUID();

  await db.insert(phase61DocumentVersions).values({
    id: versionId,
    documentId: data.documentId,
    versionName: data.versionName,
    revisionNumber: nextRevision,
    fileUrl,
    fileSizeBytes,
    changeSummary: data.changeSummary || 'Revision update',
    uploadedBy,
    isMajorVersion: data.isMajorVersion || false,
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
    createdBy: uploadedBy,
    updatedBy: uploadedBy,
    isDeleted: false,
  });

  // Update master document version
  await db.update(phase61DocumentFiles).set({
    currentVersion: data.versionName,
    revisionNumber: nextRevision,
    fileUrl,
    fileSizeBytes,
    isCheckedOut: false,
    checkedOutBy: null,
    checkedOutAt: null,
    updatedAt: now,
  }).where(eq(phase61DocumentFiles.id, data.documentId));

  await logAudit(data.documentId, uploadedBy, 'VERSION_UPLOAD', {
    versionName: data.versionName,
    revisionNumber: nextRevision,
  });

  return getDocumentById(data.documentId);
}

export async function checkoutDocument(documentId: string, user: string, notes?: string, expectedDate?: string) {
  await ensureDocumentTablesExist();
  const now = new Date().toISOString();
  await db.update(phase61DocumentFiles).set({
    isCheckedOut: true,
    checkedOutBy: user,
    checkedOutAt: now,
    updatedAt: now,
  }).where(eq(phase61DocumentFiles.id, documentId));

  await db.insert(phase61DocumentCheckouts).values({
    id: crypto.randomUUID(),
    documentId,
    checkedOutBy: user,
    checkedOutAt: now,
    expectedCheckInDate: expectedDate || null,
    checkoutNotes: notes || null,
    isCheckedIn: false,
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
    createdBy: user,
    updatedBy: user,
    isDeleted: false,
  });

  await logAudit(documentId, user, 'CHECKOUT', { notes });
  return true;
}

// ==========================================
// REVIEWS & APPROVALS
// ==========================================

export async function reviewDocument(data: {
  documentId: string;
  reviewerName: string;
  reviewRole?: string;
  comments: string;
  reviewOutcome?: string;
}) {
  await ensureDocumentTablesExist();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await db.insert(phase61DocumentReviews).values({
    id,
    documentId: data.documentId,
    reviewerName: data.reviewerName,
    reviewRole: data.reviewRole || 'INSPECTING_ENGINEER',
    comments: data.comments,
    reviewOutcome: data.reviewOutcome || 'RECOMMENDED',
    reviewDate: now,
    status: 'COMPLETED',
    createdAt: now,
    updatedAt: now,
    createdBy: data.reviewerName,
    updatedBy: data.reviewerName,
    isDeleted: false,
  });

  // Update workflow status
  const nextStatus = data.reviewOutcome === 'RECOMMENDED' ? 'UNDER_REVIEW' : 'RETURNED';
  await db.update(phase61DocumentFiles).set({
    workflowStatus: nextStatus,
    updatedAt: now,
  }).where(eq(phase61DocumentFiles.id, data.documentId));

  await logAudit(data.documentId, data.reviewerName, 'REVIEW', { outcome: data.reviewOutcome });
  return true;
}

export async function approveDocument(data: {
  documentId: string;
  approverName: string;
  approvalRole?: string;
  approvalStage?: string;
  decision?: string;
  remarks?: string;
}) {
  await ensureDocumentTablesExist();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const decision = String(data.decision || '').trim().toUpperCase();
  if (!data.approverName?.trim()) throw new Error('Authenticated document approver identity is required.');
  if (!['APPROVED', 'REJECTED', 'RETURNED'].includes(decision)) throw new Error('A document approval decision must be APPROVED, REJECTED or RETURNED.');
  const [document] = await db.select().from(phase61DocumentFiles).where(and(eq(phase61DocumentFiles.id, data.documentId), eq(phase61DocumentFiles.isDeleted, false))).limit(1);
  if (!document) throw new Error('Document not found.');
  if (!['UNDER_REVIEW', 'SUBMITTED'].includes(document.workflowStatus)) throw new Error(`Document cannot be approved from workflow status ${document.workflowStatus}.`);
  if (document.createdBy?.trim().toLowerCase() === data.approverName.trim().toLowerCase()) throw new Error('Maker-checker violation: document creator cannot approve the same document.');
  await db.insert(phase61DocumentApprovals).values({
    id,
    documentId: data.documentId,
    approverName: data.approverName,
    approvalRole: data.approvalRole || 'PROJECT_MANAGER',
    approvalStage: data.approvalStage || 'FINAL_APPROVAL',
    decision,
    remarks: data.remarks || null,
    approvalDate: now,
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
    createdBy: data.approverName,
    updatedBy: data.approverName,
    isDeleted: false,
  });

  const nextWorkflowStatus = decision === 'APPROVED' ? 'APPROVED' : decision === 'REJECTED' ? 'REJECTED' : 'RETURNED';
  
  await db.update(phase61DocumentFiles).set({
    workflowStatus: nextWorkflowStatus,
    digitalStampApplied: decision === 'APPROVED',
    watermarkText: decision === 'APPROVED' ? 'APPROVED BY AUTHORIZED WORKFLOW' : null,
    updatedAt: now,
  }).where(eq(phase61DocumentFiles.id, data.documentId));

  await logAudit(data.documentId, data.approverName, 'APPROVE', { decision, remarks: data.remarks });
  return true;
}

export async function getDocumentReviews(documentId: string) {
  await ensureDocumentTablesExist();
  return db.select().from(phase61DocumentReviews)
    .where(and(eq(phase61DocumentReviews.documentId, documentId), eq(phase61DocumentReviews.isDeleted, false)))
    .orderBy(desc(phase61DocumentReviews.createdAt));
}

export async function getDocumentApprovals(documentId: string) {
  await ensureDocumentTablesExist();
  return db.select().from(phase61DocumentApprovals)
    .where(and(eq(phase61DocumentApprovals.documentId, documentId), eq(phase61DocumentApprovals.isDeleted, false)))
    .orderBy(desc(phase61DocumentApprovals.createdAt));
}

// ==========================================
// SEARCH & AUDIT LOGS
// ==========================================

export async function searchDocuments(query: string, filters?: any) {
  await ensureDocumentTablesExist();
  return getDocuments({ search: query, ...filters });
}

export async function logAudit(documentId: string, actor: string, action: string, details?: any) {
  try {
    const now = new Date().toISOString();
    await db.insert(phase61DocumentAuditLogs).values({
      id: crypto.randomUUID(),
      documentId,
      actorName: actor,
      actionExecuted: action,
      detailsJson: details ? JSON.stringify(details) : null,
      timestamp: now,
      status: 'LOGGED',
      createdAt: now,
      updatedAt: now,
      createdBy: actor,
      updatedBy: actor,
      isDeleted: false,
    });
  } catch (err) {
    console.warn('Audit log error:', err);
  }
}

export async function getAuditLogs(documentId?: string) {
  await ensureDocumentTablesExist();
  if (documentId) {
    return db.select().from(phase61DocumentAuditLogs)
      .where(and(eq(phase61DocumentAuditLogs.documentId, documentId), eq(phase61DocumentAuditLogs.isDeleted, false)))
      .orderBy(desc(phase61DocumentAuditLogs.timestamp));
  }
  return db.select().from(phase61DocumentAuditLogs)
    .where(eq(phase61DocumentAuditLogs.isDeleted, false))
    .orderBy(desc(phase61DocumentAuditLogs.timestamp))
    .limit(100);
}

export async function shareDocument(data: {
  documentId: string;
  sharedWithEmail?: string;
  recipientName?: string;
  permissionLevel?: string;
  expiryDate?: string;
  createdBy?: string;
}) {
  await ensureDocumentTablesExist();
  const now = new Date().toISOString();
  const token = crypto.randomBytes(16).toString('hex');
  if (!data.createdBy?.trim() || (!data.sharedWithEmail?.trim() && !data.recipientName?.trim())) throw new Error('Authenticated sharer and explicit recipient are required.');
  const record = {
    id: crypto.randomUUID(),
    documentId: data.documentId,
    shareToken: token,
    sharedWithEmail: data.sharedWithEmail || null,
    recipientName: data.recipientName || null,
    permissionLevel: data.permissionLevel || 'READ_ONLY',
    expiryDate: data.expiryDate || null,
    passwordProtected: false,
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
    createdBy: data.createdBy.trim(),
    updatedBy: data.createdBy.trim(),
    isDeleted: false,
  };

  await db.insert(phase61DocumentShares).values(record);
  await logAudit(data.documentId, data.createdBy.trim(), 'SHARE', { recipient: data.recipientName, token });
  return record;
}

export async function getDocumentShares(documentId: string) {
  await ensureDocumentTablesExist();
  return db.select().from(phase61DocumentShares)
    .where(and(eq(phase61DocumentShares.documentId, documentId), eq(phase61DocumentShares.isDeleted, false)));
}

// ==========================================
// EDMS STATS
// ==========================================

export async function getEDMSStats() {
  await ensureDocumentTablesExist();
  const allDocs = await db.select().from(phase61DocumentFiles).where(eq(phase61DocumentFiles.isDeleted, false));
  const allFolders = await db.select().from(phase61DocumentFolders).where(eq(phase61DocumentFolders.isDeleted, false));
  
  const totalDocuments = allDocs.length;
  const totalFolders = allFolders.length;
  const pendingApprovals = allDocs.filter(d => d.workflowStatus === 'SUBMITTED' || d.workflowStatus === 'UNDER_REVIEW').length;
  const approvedDocuments = allDocs.filter(d => d.workflowStatus === 'APPROVED' || d.workflowStatus === 'PUBLISHED').length;
  const checkedOutCount = allDocs.filter(d => d.isCheckedOut).length;
  const archivedCount = allDocs.filter(d => d.isArchived).length;
  const totalStorageBytes = allDocs.reduce((acc, d) => acc + (d.fileSizeBytes || 0), 0);

  return {
    totalDocuments,
    totalFolders,
    pendingApprovals,
    approvedDocuments,
    checkedOutCount,
    archivedCount,
    totalStorageMB: Math.round((totalStorageBytes / (1024 * 1024)) * 100) / 100,
  };
}
