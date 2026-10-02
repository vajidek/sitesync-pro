// ============================================================================
// PHASE 75: ENTERPRISE ERP ORCHESTRATION - ZOD VALIDATORS
// ============================================================================

import { z } from 'zod';

export const sourceModuleEnum = z.enum([
  'PROJECTS',
  'PROJECT_CONTROLS',
  'PROCUREMENT',
  'INVENTORY',
  'FINANCE',
  'EAM',
  'SCADA',
  'IOT',
  'QAQC',
  'HSE',
  'EDMS',
  'HRMS',
  'CRM',
  'MOBILE_GIS',
  'AI_INTELLIGENCE',
  'AI_GATEWAY',
  'WORKFLOW',
]);

export const eventSeverityEnum = z.enum(['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export const actionTypeEnum = z.enum(['TASK', 'APPROVAL', 'ESCALATION', 'RECOMMENDATION', 'FOLLOWUP']);
export const actionPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL']);
export const actionStatusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'PENDING_APPROVAL', 'RESOLVED', 'CANCELLED', 'ESCALATED']);

export const publishEventSchema = z.object({
  eventType: z.string().min(2, 'Event type is required'),
  sourceModule: sourceModuleEnum,
  entityType: z.string().min(1, 'Entity type is required'),
  entityId: z.string().min(1, 'Entity ID is required'),
  projectId: z.string().optional(),
  severity: eventSeverityEnum.default('INFO'),
  payload: z.record(z.string(), z.any()).default({}),
  metadata: z.record(z.string(), z.any()).optional(),
  correlationId: z.string().optional(),
  causationId: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

export const replayEventSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  reason: z.string().optional(),
});

export const createActionItemSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().default(''),
  actionType: actionTypeEnum.default('TASK'),
  priority: actionPriorityEnum.default('MEDIUM'),
  sourceModule: sourceModuleEnum,
  targetModule: sourceModuleEnum,
  projectId: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  assignedToUserId: z.string().optional(),
  assignedToRole: z.string().optional(),
  assignedToName: z.string().optional(),
  dueDate: z.string().optional(),
});

export const updateActionStatusSchema = z.object({
  status: actionStatusEnum,
  resolutionNotes: z.string().optional(),
  comment: z.string().optional(),
});

export const assignActionSchema = z.object({
  assignedUserId: z.string().min(1, 'User ID is required'),
  assignedRole: z.string().min(1, 'Role is required'),
  assignedName: z.string().optional(),
  assignmentNote: z.string().optional(),
});

export const acknowledgeAlertSchema = z.object({
  alertId: z.string().min(1, 'Alert ID is required'),
  comment: z.string().optional(),
});

export const resolveAlertSchema = z.object({
  alertId: z.string().min(1, 'Alert ID is required'),
  resolutionSummary: z.string().min(3, 'Resolution summary is required'),
});

export const calculateHealthSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  projectName: z.string().optional(),
  cpi: z.number().min(0).max(5).optional(),
  spi: z.number().min(0).max(5).optional(),
  openCriticalNcrsCount: z.number().int().min(0).optional(),
  hseIncidentsCount: z.number().int().min(0).optional(),
  delayedCriticalPosCount: z.number().int().min(0).optional(),
  overdueInvoicesCount: z.number().int().min(0).optional(),
  equipmentDowntimeHours: z.number().min(0).optional(),
  keyVacanciesCount: z.number().int().min(0).optional(),
  rejectedDocsCount: z.number().int().min(0).optional(),
  openComplaintsCount: z.number().int().min(0).optional(),
});
