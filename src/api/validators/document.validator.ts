import { z } from 'zod';

export const createFolderSchema = z.object({
  folderName: z.string().min(1, 'Folder name is required'),
  parentId: z.string().nullable().optional(),
  projectId: z.string().optional(),
  department: z.string().optional().default('Engineering'),
  isSystemFolder: z.boolean().optional().default(false),
});

export const updateFolderSchema = z.object({
  folderName: z.string().min(1).optional(),
  parentId: z.string().nullable().optional(),
  department: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
});

export const createDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  folderId: z.string().min(1, 'Folder ID is required'),
  categoryId: z.string().optional(),
  fileType: z.string().min(1).default('PDF'),
  mimeType: z.string().optional().default('application/pdf'),
  fileSizeBytes: z.number().min(0).default(0),
  fileUrl: z.string().optional().default('https://assets.sitesyncpro.com/docs/sample.pdf'),
  
  // ERP integrations
  projectId: z.string().optional(),
  vendorId: z.string().optional(),
  contractId: z.string().optional(),
  poId: z.string().optional(),
  assetId: z.string().optional(),
  hrEmployeeId: z.string().optional(),
  qaInspectionId: z.string().optional(),

  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  watermarkText: z.string().optional(),
});

export const updateDocumentSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  folderId: z.string().optional(),
  categoryId: z.string().optional(),
  workflowStatus: z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RETURNED', 'PUBLISHED', 'ARCHIVED']).optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  watermarkText: z.string().optional(),
});

export const createVersionSchema = z.object({
  documentId: z.string().min(1),
  versionName: z.string().min(1),
  fileUrl: z.string().min(1),
  fileSizeBytes: z.number().min(0).default(0),
  changeSummary: z.string().optional(),
  isMajorVersion: z.boolean().optional().default(false),
});

export const checkoutDocumentSchema = z.object({
  documentId: z.string().min(1),
  expectedCheckInDate: z.string().optional(),
  checkoutNotes: z.string().optional(),
});

export const checkinDocumentSchema = z.object({
  documentId: z.string().min(1),
  newVersionName: z.string().optional(),
  fileUrl: z.string().optional(),
  changeSummary: z.string().optional(),
});

export const reviewDocumentSchema = z.object({
  documentId: z.string().min(1),
  reviewerName: z.string().min(1),
  reviewRole: z.string().default('INSPECTING_ENGINEER'),
  comments: z.string().min(1, 'Review comments required'),
  reviewOutcome: z.enum(['RECOMMENDED', 'CHANGES_REQUESTED', 'REJECTED']).default('RECOMMENDED'),
});

export const approvalDocumentSchema = z.object({
  documentId: z.string().min(1),
  approverName: z.string().min(1),
  approvalRole: z.string().default('PROJECT_MANAGER'),
  approvalStage: z.string().default('FINAL_APPROVAL'),
  decision: z.enum(['APPROVED', 'REJECTED', 'RETURNED']).default('APPROVED'),
  remarks: z.string().optional(),
});

export const shareDocumentSchema = z.object({
  documentId: z.string().min(1),
  sharedWithEmail: z.string().email().optional(),
  recipientName: z.string().optional(),
  permissionLevel: z.enum(['READ_ONLY', 'DOWNLOAD', 'COMMENT']).default('READ_ONLY'),
  expiryDate: z.string().optional(),
  passwordProtected: z.boolean().optional().default(false),
});

export const documentPermissionSchema = z.object({
  documentId: z.string().min(1),
  role: z.string().min(1),
  canView: z.boolean().default(true),
  canDownload: z.boolean().default(true),
  canEdit: z.boolean().default(false),
  canApprove: z.boolean().default(false),
  canDelete: z.boolean().default(false),
  canShare: z.boolean().default(false),
  canArchive: z.boolean().default(false),
});

export const createTemplateSchema = z.object({
  templateName: z.string().min(1),
  category: z.string().default('SAFETY'),
  templateUrl: z.string().min(1),
  description: z.string().optional(),
  version: z.string().default('v1.0'),
});
