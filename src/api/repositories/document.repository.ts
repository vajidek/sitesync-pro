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
    const existingCat = await db.select().from(phase61DocumentCategories).limit(1);
    if (!isDemoSeedAllowed()) {
      tablesCreated = true;
      return;
    }

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
    // Fail closed: if the persistence layer cannot initialize in the active
    // runtime, do not mark EDMS as ready and continue with ambiguous state.
    tablesCreated = false;
    throw err;
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
  const actor = String(data.createdBy || '').trim();
  const folderName = String(data.folderName || '').trim();
  if (!actor) throw new Error('Authenticated folder creator identity is required.');
  if (!folderName) throw new Error('Folder name is required.');

  await ensureDocumentTablesExist();
  const now = new Date().toISOString();
  let parent = null;

  if (data.parentId) {
    parent = await getFolderById(data.parentId);
    if (!parent) throw new Error('Parent folder not found.');
    if (data.projectId && parent.projectId && data.projectId !== parent.projectId) {
      throw new Error('Child folder project context does not match its parent folder.');
    }
  }

  const folderPath = parent ? `${parent.folderPath}/${folderName}` : `/${folderName}`;
  const id = crypto.randomUUID();
  const record = {
    id,
    folderName,
    parentId: data.parentId || null,
    folderPath,
    projectId: data.projectId || parent?.projectId || null,
    department: data.department || parent?.department || 'Engineering',
    isSystemFolder: Boolean(data.isSystemFolder),
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
    createdBy: actor,
    updatedBy: actor,
    isDeleted: false,
  };

  await db.insert(phase61DocumentFolders).values(record);
  return record;
}

export async function updateFolder(id: string, data: any) {
  await ensureDocumentTablesExist();
  const now = new Date().toISOString();
  const update = {
    ...(data.folderName !== undefined ? { folderName: String(data.folderName).trim() } : {}),
    ...(data.parentId !== undefined ? { parentId: data.parentId || null } : {}),
    ...(data.projectId !== undefined ? { projectId: data.projectId || null } : {}),
    ...(data.department !== undefined ? { department: String(data.department).trim() } : {}),
    updatedAt: now,
    ...(data.updatedBy ? { updatedBy: String(data.updatedBy).trim() } : {}),
  };
  if (update.folderName === '') throw new Error('Folder name cannot be empty.');
  if ('updatedBy' in update && !update.updatedBy) throw new Error('Authenticated folder editor identity is required.');

  if (update.parentId) {
    const parent = await getFolderById(update.parentId);
    if (!parent) throw new Error('Parent folder not found.');
    const current = await getFolderById(id);
    if (!current) throw new Error('Folder not found.');
    const projectId = update.projectId ?? current.projectId;
    if (projectId && parent.projectId && projectId !== parent.projectId) {
      throw new Error('Folder project context does not match its parent folder.');
    }
    update.folderPath = `${parent.folderPath}/${update.folderName || current.folderName}`;
  }

  await db.update(phase61DocumentFolders).set(update as any).where(eq(phase61DocumentFolders.id, id));
  return getFolderById(id);
}

export async function deleteFolder(id: string, user?: string) {
  await ensureDocumentTablesExist();
  const actor = String(user || '').trim();
  if (!actor) throw new Error('Authenticated folder deletion actor identity is required.');
  const folder = await getFolderById(id);
  if (!folder) throw new Error('Folder not found.');

  const now = new Date().toISOString();
  await db.update(phase61DocumentFolders)
    .set({ isDeleted: true, deletedAt: now, status: 'DELETED', updatedAt: now, updatedBy: actor })
    .where(eq(phase61DocumentFolders.id, id));
  return true;
}

// ==========================================
// DOCUMENT REPOSITORY

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
  const createdBy = String(data.createdBy || '').trim();
  const fileUrl = String(data.fileUrl || '').trim();
  const title = String(data.title || '').trim();
  const folderId = String(data.folderId || '').trim();

  if (!createdBy) throw new Error('Authenticated document creator identity is required.');
  if (!title) throw new Error('Document title is required.');
  if (!folderId) throw new Error('Document folder is required.');
  if (!fileUrl) throw new Error('A real file reference is required to create an EDMS document.');

  const folder = await getFolderById(folderId);
  if (!folder) throw new Error('Document folder not found.');
  if (data.projectId && folder.projectId && data.projectId !== folder.projectId) {
    throw new Error('Document project context does not match its folder.');
  }

  const fileSizeBytes = Number(data.fileSizeBytes || 0);
  if (!Number.isFinite(fileSizeBytes) || fileSizeBytes < 0) throw new Error('Document file size must be a valid non-negative number.');

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const documentNumber = `DOC-${new Date().getFullYear()}-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;

  const docRecord = {
    id,
    documentNumber,
    title,
    description: data.description || null,
    folderId,
    categoryId: data.categoryId || null,
    fileType: data.fileType || 'PDF',
    mimeType: data.mimeType || 'application/pdf',
    fileSizeBytes,
    fileUrl,
    currentVersion: 'v1.0',
    revisionNumber: 1,
    projectId: data.projectId || folder.projectId || null,
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

  return await db.transaction(async (tx) => {
    const duplicate = await tx.select({ id: phase61DocumentFiles.id })
      .from(phase61DocumentFiles)
      .where(and(eq(phase61DocumentFiles.documentNumber, documentNumber), eq(phase61DocumentFiles.isDeleted, false)))
      .limit(1);
    if (duplicate.length) throw new Error(`Document number ${documentNumber} already exists.`);

    await tx.insert(phase61DocumentFiles).values(docRecord);

    await tx.insert(phase61DocumentVersions).values({
      id: crypto.randomUUID(),
      documentId: id,
      versionName: 'v1.0',
      revisionNumber: 1,
      fileUrl,
      fileSizeBytes,
      changeSummary: 'Initial document submission',
      uploadedBy: createdBy,
      isMajorVersion: true,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      createdBy,
      updatedBy: createdBy,
      isDeleted: false,
    });

    for (const tag of data.tags || []) {
      const tagName = String(tag || '').trim();
      if (!tagName) continue;
      await tx.insert(phase61DocumentTags).values({
        id: crypto.randomUUID(),
        documentId: id,
        tagName,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        createdBy,
        updatedBy: createdBy,
        isDeleted: false,
      });
    }

    for (const [key, value] of Object.entries(data.metadata || {})) {
      const metaKey = String(key || '').trim();
      if (!metaKey) continue;
      await tx.insert(phase61DocumentMetadata).values({
        id: crypto.randomUUID(),
        documentId: id,
        metaKey,
        metaValue: String(value ?? ''),
        dataType: 'STRING',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        createdBy,
        updatedBy: createdBy,
        isDeleted: false,
      });
    }

    await tx.insert(phase61DocumentAuditLogs).values({
      id: crypto.randomUUID(),
      documentId: id,
      actorName: createdBy,
      actionExecuted: 'CREATE',
      detailsJson: JSON.stringify({ documentNumber, title }),
      timestamp: now,
      status: 'LOGGED',
      createdAt: now,
      updatedAt: now,
      createdBy,
      updatedBy: createdBy,
      isDeleted: false,
    });

    return docRecord;
  });
}

export async function updateDocument(id: string, data: any) {
  await ensureDocumentTablesExist();
  const doc = await getDocumentById(id);
  if (!doc) throw new Error('Document not found.');

  const actor = String(data.updatedBy || '').trim();
  if (!actor) throw new Error('Authenticated document editor identity is required.');

  const contentEditFields = ['title', 'description', 'folderId', 'categoryId'];
  if (['APPROVED', 'PUBLISHED'].includes(String(doc.workflowStatus).toUpperCase()) &&
      contentEditFields.some((field) => data[field] !== undefined)) {
    throw new Error('Approved or published documents must be revised through the version-controlled document workflow.');
  }

  const safeUpdate: Record<string, any> = {};
  for (const field of contentEditFields) {
    if (data[field] !== undefined) safeUpdate[field] = data[field];
  }
  if (data.isFavorite !== undefined) safeUpdate.isFavorite = Boolean(data.isFavorite);

  if (Object.keys(safeUpdate).length === 0) {
    return doc;
  }

  const now = new Date().toISOString();
  safeUpdate.updatedAt = now;
  safeUpdate.updatedBy = actor;

  await db.update(phase61DocumentFiles)
    .set(safeUpdate)
    .where(eq(phase61DocumentFiles.id, id));

  await logAudit(id, actor, 'EDIT', safeUpdate);
  return getDocumentById(id);
}

export async function deleteDocument(id: string, user: string) {
  if (!user?.trim()) throw new Error('Authenticated document actor identity is required.');
  await ensureDocumentTablesExist();
  const now = new Date().toISOString();
  await db.update(phase61DocumentFiles)
    .set({ isDeleted: true, deletedAt: now, status: 'DELETED' })
    .where(eq(phase61DocumentFiles.id, id));
  
  await logAudit(id, user, 'DELETE', { action: 'Soft deleted document' });
  return true;
}

export async function toggleFavoriteDocument(id: string, user: string) {
  if (!user?.trim()) throw new Error('Authenticated document actor identity is required.');
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
  const actor = String(user || '').trim();
  const archiveReason = String(reason || '').trim();
  if (!actor) throw new Error('Authenticated document archive actor identity is required.');
  if (!archiveReason) throw new Error('Archive reason is required.');

  const doc = await getDocumentById(id);
  if (!doc) throw new Error('Document not found.');
  if (doc.isDeleted) throw new Error('Deleted documents cannot be archived.');
  if (doc.isArchived) throw new Error('Document is already archived.');

  const now = new Date().toISOString();
  return await db.transaction(async (tx) => {
    await tx.update(phase61DocumentFiles).set({
      isArchived: true,
      workflowStatus: 'ARCHIVED',
      updatedAt: now,
      updatedBy: actor,
    }).where(eq(phase61DocumentFiles.id, id));

    await tx.insert(phase61DocumentArchive).values({
      id: crypto.randomUUID(),
      documentId: id,
      archiveReason,
      archivedBy: actor,
      archivedAt: now,
      status: 'ARCHIVED',
      createdAt: now,
      updatedAt: now,
      createdBy: actor,
      updatedBy: actor,
      isDeleted: false,
    });

    await tx.insert(phase61DocumentAuditLogs).values({
      id: crypto.randomUUID(),
      documentId: id,
      actorName: actor,
      actionExecuted: 'ARCHIVE',
      detailsJson: JSON.stringify({ reason: archiveReason }),
      timestamp: now,
      status: 'LOGGED',
      createdAt: now,
      updatedAt: now,
      createdBy: actor,
      updatedBy: actor,
      isDeleted: false,
    });

    return true;
  });
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
  const uploadedBy = String(data.uploadedBy || '').trim();
  const fileUrl = String(data.fileUrl || '').trim();
  const versionName = String(data.versionName || '').trim();
  if (!uploadedBy) throw new Error('Authenticated document revision owner is required.');
  if (!versionName) throw new Error('Version name is required.');
  if (!fileUrl) throw new Error('A real file reference is required for a document version.');

  return await db.transaction(async (tx) => {
    const [doc] = await tx.select().from(phase61DocumentFiles)
      .where(and(eq(phase61DocumentFiles.id, data.documentId), eq(phase61DocumentFiles.isDeleted, false)))
      .limit(1);
    if (!doc) throw new Error('Document not found.');
    if (doc.isArchived) throw new Error('Archived documents cannot receive a new version.');
    if (doc.isCheckedOut && doc.checkedOutBy !== uploadedBy) throw new Error('Document is checked out by another user.');

    const [latestVersion] = await tx.select().from(phase61DocumentVersions)
      .where(and(eq(phase61DocumentVersions.documentId, data.documentId), eq(phase61DocumentVersions.isDeleted, false)))
      .orderBy(desc(phase61DocumentVersions.revisionNumber))
      .limit(1);

    const nextRevision = (latestVersion?.revisionNumber ?? doc.revisionNumber ?? 0) + 1;
    const [sameName] = await tx.select({ id: phase61DocumentVersions.id })
      .from(phase61DocumentVersions)
      .where(and(
        eq(phase61DocumentVersions.documentId, data.documentId),
        eq(phase61DocumentVersions.versionName, versionName),
        eq(phase61DocumentVersions.isDeleted, false)
      ))
      .limit(1);
    if (sameName) throw new Error(`Version ${versionName} already exists for this document.`);

    const now = new Date().toISOString();
    const fileSizeBytes = Number(data.fileSizeBytes ?? doc.fileSizeBytes ?? 0);
    if (!Number.isFinite(fileSizeBytes) || fileSizeBytes < 0) throw new Error('Version file size must be a valid non-negative number.');

    await tx.insert(phase61DocumentVersions).values({
      id: crypto.randomUUID(),
      documentId: data.documentId,
      versionName,
      revisionNumber: nextRevision,
      fileUrl,
      fileSizeBytes,
      changeSummary: data.changeSummary || 'Revision update',
      uploadedBy,
      isMajorVersion: Boolean(data.isMajorVersion),
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      createdBy: uploadedBy,
      updatedBy: uploadedBy,
      isDeleted: false,
    });

    const [updated] = await tx.update(phase61DocumentFiles).set({
      currentVersion: versionName,
      revisionNumber: nextRevision,
      fileUrl,
      fileSizeBytes,
      workflowStatus: 'DRAFT',
      digitalStampApplied: false,
      watermarkText: null,
      isCheckedOut: false,
      checkedOutBy: null,
      checkedOutAt: null,
      isLocked: false,
      updatedAt: now,
      updatedBy: uploadedBy,
    }).where(eq(phase61DocumentFiles.id, data.documentId)).returning();

    if (!updated) throw new Error('Document version update failed.');

    await tx.insert(phase61DocumentAuditLogs).values({
      id: crypto.randomUUID(),
      documentId: data.documentId,
      actorName: uploadedBy,
      actionExecuted: 'VERSION_UPLOAD',
      detailsJson: JSON.stringify({ versionName, revisionNumber: nextRevision }),
      timestamp: now,
      status: 'LOGGED',
      createdAt: now,
      updatedAt: now,
      createdBy: uploadedBy,
      updatedBy: uploadedBy,
      isDeleted: false,
    });

    return updated;
  });
}

export async function checkinDocument(documentId: string, user: string, newVersionName?: string, fileUrl?: string, changeSummary?: string) {
  await ensureDocumentTablesExist();
  const actor = String(user || '').trim();
  if (!actor) throw new Error('Authenticated check-in actor identity is required.');

  const doc = await getDocumentById(documentId);
  if (!doc) throw new Error('Document not found.');
  if (!doc.isCheckedOut) throw new Error('Document is not currently checked out.');
  if (doc.checkedOutBy !== actor) throw new Error('Only the current checkout owner can check in this document.');

  const now = new Date().toISOString();
  const [checkout] = await db.select().from(phase61DocumentCheckouts)
    .where(and(eq(phase61DocumentCheckouts.documentId, documentId), eq(phase61DocumentCheckouts.isCheckedIn, false)))
    .orderBy(desc(phase61DocumentCheckouts.checkedOutAt))
    .limit(1);

  if (newVersionName && fileUrl) {
    await createDocumentVersion({
      documentId,
      versionName: newVersionName,
      fileUrl,
      fileSizeBytes: doc.fileSizeBytes,
      changeSummary: changeSummary || 'Checked-in revision',
      isMajorVersion: false,
      uploadedBy: actor,
    });
  }

  await db.update(phase61DocumentFiles).set({
    isCheckedOut: false,
    checkedOutBy: null,
    checkedOutAt: null,
    updatedAt: now,
    updatedBy: actor,
  }).where(eq(phase61DocumentFiles.id, documentId));

  if (checkout) {
    await db.update(phase61DocumentCheckouts).set({
      isCheckedIn: true,
      checkedInAt: now,
      status: 'COMPLETED',
      updatedAt: now,
      updatedBy: actor,
    }).where(eq(phase61DocumentCheckouts.id, checkout.id));
  }

  await logAudit(documentId, actor, 'CHECKIN', { newVersionName: newVersionName || null });
  return getDocumentById(documentId);
}
export async function checkoutDocument(documentId: string, user: string, notes?: string, expectedDate?: string) {
  await ensureDocumentTablesExist();
  const actor = String(user || '').trim();
  if (!actor) throw new Error('Authenticated checkout actor identity is required.');

  return await db.transaction(async (tx) => {
    const [doc] = await tx.select().from(phase61DocumentFiles)
      .where(and(eq(phase61DocumentFiles.id, documentId), eq(phase61DocumentFiles.isDeleted, false)))
      .limit(1);
    if (!doc) throw new Error('Document not found.');
    if (doc.isArchived) throw new Error('Archived documents cannot be checked out.');
    if (doc.isCheckedOut) throw new Error('Document is already checked out.');
    if (['APPROVED', 'PUBLISHED'].includes(String(doc.workflowStatus).toUpperCase()) && doc.isLocked) {
      throw new Error('Locked approved/published documents cannot be checked out.');
    }

    const now = new Date().toISOString();
    await tx.update(phase61DocumentFiles).set({
      isCheckedOut: true,
      checkedOutBy: actor,
      checkedOutAt: now,
      updatedAt: now,
      updatedBy: actor,
    }).where(and(eq(phase61DocumentFiles.id, documentId), eq(phase61DocumentFiles.isCheckedOut, false)));

    await tx.insert(phase61DocumentCheckouts).values({
      id: crypto.randomUUID(),
      documentId,
      checkedOutBy: actor,
      checkedOutAt: now,
      expectedCheckInDate: expectedDate || null,
      checkoutNotes: notes || null,
      isCheckedIn: false,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      createdBy: actor,
      updatedBy: actor,
      isDeleted: false,
    });

    await tx.insert(phase61DocumentAuditLogs).values({
      id: crypto.randomUUID(),
      documentId,
      actorName: actor,
      actionExecuted: 'CHECKOUT',
      detailsJson: JSON.stringify({ notes: notes || null }),
      timestamp: now,
      status: 'LOGGED',
      createdAt: now,
      updatedAt: now,
      createdBy: actor,
      updatedBy: actor,
      isDeleted: false,
    });

    return true;
  });
}

// ==========================================
// REVIEWS & APPROVALS

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
  const reviewerName = String(data.reviewerName || '').trim();
  const comments = String(data.comments || '').trim();
  const outcome = String(data.reviewOutcome || '').trim().toUpperCase();
  if (!reviewerName) throw new Error('Authenticated document reviewer identity is required.');
  if (!comments) throw new Error('Review comments are required.');
  if (!['RECOMMENDED', 'CHANGES_REQUESTED', 'REJECTED'].includes(outcome)) {
    throw new Error('A valid document review outcome is required.');
  }

  return await db.transaction(async (tx) => {
    const [doc] = await tx.select().from(phase61DocumentFiles)
      .where(and(eq(phase61DocumentFiles.id, data.documentId), eq(phase61DocumentFiles.isDeleted, false)))
      .limit(1);
    if (!doc) throw new Error('Document not found.');
    if (doc.createdBy === reviewerName) throw new Error('Maker-checker violation: document creator cannot be its reviewer.');
    if (!['DRAFT', 'SUBMITTED', 'RETURNED'].includes(String(doc.workflowStatus).toUpperCase())) {
      throw new Error(`Document cannot be reviewed from workflow status ${doc.workflowStatus}.`);
    }

    const now = new Date().toISOString();
    const nextStatus = outcome === 'RECOMMENDED' ? 'UNDER_REVIEW' : outcome === 'REJECTED' ? 'REJECTED' : 'RETURNED';

    await tx.insert(phase61DocumentReviews).values({
      id: crypto.randomUUID(),
      documentId: data.documentId,
      reviewerName,
      reviewRole: data.reviewRole || 'INSPECTING_ENGINEER',
      comments,
      reviewOutcome: outcome,
      reviewDate: now,
      status: 'COMPLETED',
      createdAt: now,
      updatedAt: now,
      createdBy: reviewerName,
      updatedBy: reviewerName,
      isDeleted: false,
    });

    await tx.update(phase61DocumentFiles).set({
      workflowStatus: nextStatus,
      updatedAt: now,
      updatedBy: reviewerName,
    }).where(eq(phase61DocumentFiles.id, data.documentId));

    await tx.insert(phase61DocumentAuditLogs).values({
      id: crypto.randomUUID(),
      documentId: data.documentId,
      actorName: reviewerName,
      actionExecuted: 'REVIEW',
      detailsJson: JSON.stringify({ outcome }),
      timestamp: now,
      status: 'LOGGED',
      createdAt: now,
      updatedAt: now,
      createdBy: reviewerName,
      updatedBy: reviewerName,
      isDeleted: false,
    });

    return true;
  });
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
  const approverName = String(data.approverName || '').trim();
  const decision = String(data.decision || '').trim().toUpperCase();
  if (!approverName) throw new Error('Authenticated document approver identity is required.');
  if (!['APPROVED', 'REJECTED', 'RETURNED'].includes(decision)) throw new Error('A valid document approval decision is required.');

  return await db.transaction(async (tx) => {
    const [doc] = await tx.select().from(phase61DocumentFiles)
      .where(and(eq(phase61DocumentFiles.id, data.documentId), eq(phase61DocumentFiles.isDeleted, false)))
      .limit(1);
    if (!doc) throw new Error('Document not found.');
    if (doc.createdBy === approverName) throw new Error('Maker-checker violation: document creator cannot approve the same document.');
    if (String(doc.workflowStatus).toUpperCase() !== 'UNDER_REVIEW') {
      throw new Error(`Document can be approved only after a completed review. Current workflow status: ${doc.workflowStatus}.`);
    }

    const latestReviews = await tx.select().from(phase61DocumentReviews)
      .where(and(eq(phase61DocumentReviews.documentId, data.documentId), eq(phase61DocumentReviews.isDeleted, false)))
      .orderBy(desc(phase61DocumentReviews.createdAt))
      .limit(1);
    const latestReview = latestReviews[0];
    if (!latestReview || latestReview.reviewOutcome !== 'RECOMMENDED') throw new Error('Document approval requires a recommended review.');
    if (latestReview.reviewerName === approverName) throw new Error('Maker-checker violation: reviewer cannot also be the approver.');

    const now = new Date().toISOString();
    const nextWorkflowStatus = decision === 'APPROVED' ? 'APPROVED' : decision === 'REJECTED' ? 'REJECTED' : 'RETURNED';

    await tx.insert(phase61DocumentApprovals).values({
      id: crypto.randomUUID(),
      documentId: data.documentId,
      approverName,
      approvalRole: data.approvalRole || 'PROJECT_MANAGER',
      approvalStage: data.approvalStage || 'FINAL_APPROVAL',
      decision,
      remarks: data.remarks || null,
      approvalDate: now,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      createdBy: approverName,
      updatedBy: approverName,
      isDeleted: false,
    });

    await tx.update(phase61DocumentFiles).set({
      workflowStatus: nextWorkflowStatus,
      digitalStampApplied: decision === 'APPROVED',
      watermarkText: decision === 'APPROVED' ? 'APPROVED BY SITESYNC PRO' : null,
      isLocked: decision === 'APPROVED',
      updatedAt: now,
      updatedBy: approverName,
    }).where(eq(phase61DocumentFiles.id, data.documentId));

    await tx.insert(phase61DocumentAuditLogs).values({
      id: crypto.randomUUID(),
      documentId: data.documentId,
      actorName: approverName,
      actionExecuted: 'APPROVE',
      detailsJson: JSON.stringify({ decision, remarks: data.remarks || null }),
      timestamp: now,
      status: 'LOGGED',
      createdAt: now,
      updatedAt: now,
      createdBy: approverName,
      updatedBy: approverName,
      isDeleted: false,
    });

    return true;
  });
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
  const auditActor = String(actor || '').trim();
  if (!auditActor) throw new Error('Authenticated audit actor identity is required.');
  const now = new Date().toISOString();
  await db.insert(phase61DocumentAuditLogs).values({
    id: crypto.randomUUID(),
    documentId,
    actorName: auditActor,
    actionExecuted: action,
    detailsJson: details ? JSON.stringify(details) : null,
    timestamp: now,
    status: 'LOGGED',
    createdAt: now,
    updatedAt: now,
    createdBy: auditActor,
    updatedBy: auditActor,
    isDeleted: false,
  });
  return true;
}

export async function getAuditLogs(documentId?: string) {
  await ensureDocumentTablesExist();
  const rows = await db.select().from(phase61DocumentAuditLogs)
    .where(documentId
      ? and(eq(phase61DocumentAuditLogs.documentId, documentId), eq(phase61DocumentAuditLogs.isDeleted, false))
      : eq(phase61DocumentAuditLogs.isDeleted, false))
    .orderBy(desc(phase61DocumentAuditLogs.timestamp));
  return rows;
}

export async function shareDocument(data: any) {
  await ensureDocumentTablesExist();
  const documentId = String(data?.documentId || '').trim();
  const createdBy = String(data?.createdBy || '').trim();
  if (!documentId || !createdBy) throw new Error('Document and authenticated share actor identity are required.');

  const [doc] = await db.select().from(phase61DocumentFiles)
    .where(and(eq(phase61DocumentFiles.id, documentId), eq(phase61DocumentFiles.isDeleted, false)))
    .limit(1);
  if (!doc) throw new Error('Document not found.');

  const now = new Date().toISOString();
  const shareToken = crypto.randomBytes(24).toString('hex');
  const [share] = await db.insert(phase61DocumentShares).values({
    id: crypto.randomUUID(),
    documentId,
    shareToken,
    sharedWithEmail: data.sharedWithEmail || null,
    recipientName: data.recipientName || null,
    permissionLevel: data.permissionLevel || 'READ_ONLY',
    expiryDate: data.expiryDate || null,
    passwordProtected: Boolean(data.passwordProtected),
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
    createdBy,
    updatedBy: createdBy,
    isDeleted: false,
    deletedAt: null,
  }).returning();

  await db.insert(phase61DocumentAuditLogs).values({
    id: crypto.randomUUID(), documentId, actorName: createdBy, actionExecuted: 'SHARE',
    detailsJson: JSON.stringify({ recipientName: data.recipientName || null, sharedWithEmail: data.sharedWithEmail || null, permissionLevel: data.permissionLevel || 'READ_ONLY' }),
    timestamp: now, status: 'LOGGED', createdAt: now, updatedAt: now, createdBy, updatedBy: createdBy, isDeleted: false,
  });
  return share;
}

export async function getDocumentShares(documentId: string) {
  await ensureDocumentTablesExist();
  return db.select().from(phase61DocumentShares)
    .where(and(eq(phase61DocumentShares.documentId, documentId), eq(phase61DocumentShares.isDeleted, false)))
    .orderBy(desc(phase61DocumentShares.createdAt));
}

export async function getEDMSStats()

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
