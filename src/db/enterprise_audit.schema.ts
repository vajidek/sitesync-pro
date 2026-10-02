import { pgTable, text, boolean, integer, jsonb } from 'drizzle-orm/pg-core';

export const enterpriseAuditEvents = pgTable('enterprise_audit_events', {
  id: text('id').primaryKey(),
  companyId: text('company_id'),
  tenantId: text('tenant_id'),
  userId: text('user_id'),
  userEmail: text('user_email'),
  userRole: text('user_role'),
  userName: text('user_name'),
  actionType: text('action_type').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  entityNumber: text('entity_number'),
  fromState: text('from_state'),
  toState: text('to_state'),
  diffJson: jsonb('diff_json'),
  metadata: jsonb('metadata'),
  reason: text('reason'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  requestId: text('request_id'),
  idempotencyKey: text('idempotency_key'),
  workflowInstanceId: text('workflow_instance_id'),
  workflowTaskId: text('workflow_task_id'),
  status: text('status').notNull().default('RECORDED'),
  createdAt: text('created_at').notNull(),
});

export type DbEnterpriseAuditEvent = typeof enterpriseAuditEvents.$inferSelect;
export type NewEnterpriseAuditEvent = typeof enterpriseAuditEvents.$inferInsert;
