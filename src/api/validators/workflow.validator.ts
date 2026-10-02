import { z } from 'zod';

export const CreateWorkflowSchema = z.object({
  code: z.string().min(2, 'Workflow code is required'),
  name: z.string().min(2, 'Workflow name is required'),
  description: z.string().optional(),
  category: z.string().default('APPROVAL'), // 'APPROVAL' | 'REVIEW' | 'INSPECTION' | 'FINANCE'
  moduleCode: z.string().default('CROSS_MODULE'), // 'PROCUREMENT' | 'FINANCE' | 'INVENTORY' | 'STORE' | 'FLEET' | 'HR' | 'QAQC' | 'HSE' | 'ASSETS' | 'EDMS' | 'PROJECT_CONTROLS' | 'CROSS_MODULE'
  companyId: z.string().optional(),
  branchId: z.string().optional(),
  departmentId: z.string().optional(),
  projectId: z.string().optional(),
  triggerType: z.enum(['MANUAL', 'AUTOMATIC', 'THRESHOLD', 'HYBRID']).default('MANUAL'),
  minApprovalAmount: z.number().nonnegative().optional().default(0),
  currency: z.string().default('INR'),
  slaHours: z.number().int().positive().optional().default(24),
  escalationRole: z.string().optional(),
  allowDelegation: z.boolean().default(true),
  isParallel: z.boolean().default(false),
  minApprovalsRequired: z.number().int().positive().default(1),
});

export const UpdateWorkflowSchema = CreateWorkflowSchema.partial();

export const CreateWorkflowVersionSchema = z.object({
  workflowId: z.string().min(1, 'Workflow ID is required'),
  description: z.string().optional(),
  isPublished: z.boolean().default(false),
});

export const CreateWorkflowStateSchema = z.object({
  workflowId: z.string().min(1, 'Workflow ID is required'),
  versionNumber: z.number().int().positive().default(1),
  stateCode: z.string().min(2, 'State code is required'),
  name: z.string().min(2, 'State name is required'),
  type: z.enum(['INITIAL', 'INTERMEDIATE', 'APPROVED', 'REJECTED', 'RETURNED', 'FINAL', 'BLOCKED']).default('INTERMEDIATE'),
  color: z.string().default('#3b82f6'),
  displayOrder: z.number().int().default(1),
  slaHours: z.number().int().positive().optional(),
});

export const CreateWorkflowTransitionSchema = z.object({
  workflowId: z.string().min(1, 'Workflow ID is required'),
  versionNumber: z.number().int().positive().default(1),
  fromStateCode: z.string().min(1, 'From state code is required'),
  toStateCode: z.string().min(1, 'To state code is required'),
  actionLabel: z.string().min(1, 'Action label is required'),
  requiredRole: z.string().optional().default('MANAGER'),
  approverType: z.enum(['ROLE', 'USER', 'REPORTING_MANAGER', 'DEPARTMENT_HEAD', 'PROJECT_ROLE', 'AMOUNT_THRESHOLD', 'ANY']).default('ROLE'),
  approverTarget: z.string().optional(),
  conditionExpression: z.string().optional().default('true'),
  minAmount: z.number().optional().default(0),
  maxAmount: z.number().optional(),
  currency: z.string().optional().default('INR'),
  requiresComments: z.boolean().default(false),
  requiresSignature: z.boolean().default(false),
});

export const SubmitWorkflowInstanceSchema = z.object({
  workflowCode: z.string().min(2, 'Workflow code is required'),
  entityType: z.string().min(1, 'Entity type is required'), // PO, INVOICE, REQUISITION, LEAVE, NC_REPORT, RA_BILL, CASH_REQUEST, etc.
  entityId: z.string().min(1, 'Entity ID is required'),
  title: z.string().min(2, 'Title is required'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  amount: z.number().optional().default(0),
  currency: z.string().optional().default('INR'),
  baseAmount: z.number().optional(),
  exchangeRate: z.number().optional(),
  exchangeRateType: z.string().optional().default('CORPORATE'),
  transactionDate: z.string().optional(),
  projectId: z.string().optional(),
  department: z.string().optional(),
  dataContextJson: z.string().optional().default('{}'),
});

export const ProcessApprovalDecisionSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  instanceId: z.string().optional(),
  decision: z.enum([
    'APPROVED',
    'REJECTED',
    'RETURN_FOR_CORRECTION',
    'REVISION_REQUESTED',
    'REQUEST_CLARIFICATION',
    'DELEGATED',
    'REASSIGNED',
    'ESCALATED',
    'CANCELLED',
  ]),
  comments: z.string().optional(),
  delegateToUserId: z.string().optional(),
  reassignToUserId: z.string().optional(),
  digitalSignature: z.string().optional(),
});

export const CreateDelegationSchema = z.object({
  delegateeId: z.string().min(1, 'Delegatee ID is required'),
  delegateeName: z.string().min(1, 'Delegatee Name is required'),
  moduleScope: z.string().default('ALL'),
  startDate: z.string().default(new Date().toISOString().split('T')[0]),
  endDate: z.string(),
  reason: z.string().optional(),
});

export const CreateAnnouncementSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  content: z.string().min(5, 'Content must be at least 5 characters'),
  authorName: z.string().default('Executive Office'),
  targetAudience: z.enum(['ALL_STAFF', 'SITE_MANAGERS', 'PROJECT_ENGINEERS', 'DEPARTMENT_HEADS']).default('ALL_STAFF'),
  priority: z.enum(['NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  isPinned: z.boolean().optional().default(false),
});

export const CreateNotificationSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  message: z.string().min(2, 'Message is required'),
  category: z.enum(['APPROVAL', 'SYSTEM', 'ALERT', 'ANNOUNCEMENT', 'TASK', 'ESCALATION']).default('APPROVAL'),
  severity: z.enum(['INFO', 'WARNING', 'CRITICAL', 'SUCCESS']).default('INFO'),
  linkUrl: z.string().optional(),
  targetUserIds: z.array(z.string()).optional(),
});
