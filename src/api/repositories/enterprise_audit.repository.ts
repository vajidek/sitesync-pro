import { db } from '../../db';
import { enterpriseAuditEvents, DbEnterpriseAuditEvent, NewEnterpriseAuditEvent } from '../../db/enterprise_audit.schema';
import { eq, and, desc, sql, gte, lte, ilike, or } from 'drizzle-orm';
import { logger } from '../utils/logger';

export type StandardAuditEventType =
  | 'CREATE'
  | 'UPDATE'
  | 'SUBMIT'
  | 'VERIFY'
  | 'APPROVE'
  | 'REJECT'
  | 'RETURN'
  | 'CANCEL'
  | 'REVERSE'
  | 'ISSUE'
  | 'RECEIVE'
  | 'DISBURSE'
  | 'SETTLE'
  | 'CLOSE';

export interface AuditEventPayload {
  id?: string;
  companyId?: string | null;
  tenantId?: string | null;
  userId?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  userName?: string | null;
  actionType: StandardAuditEventType | string;
  entityType: string;
  entityId: string;
  entityNumber?: string | null;
  fromState?: string | null;
  toState?: string | null;
  diffJson?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  reason?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
  idempotencyKey?: string | null;
  workflowInstanceId?: string | null;
  workflowTaskId?: string | null;
  status?: string;
  createdAt?: string;
}

export interface AuditEventFilter {
  companyId?: string;
  tenantId?: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  actionType?: string;
  entityType?: string;
  entityId?: string;
  entityNumber?: string;
  idempotencyKey?: string;
  workflowInstanceId?: string;
  fromState?: string;
  toState?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export class EnterpriseAuditRepository {
  private static isTableEnsured = false;

  async ensureTable(): Promise<void> {
    if (EnterpriseAuditRepository.isTableEnsured) return;
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS enterprise_audit_events (
          id TEXT PRIMARY KEY,
          company_id TEXT,
          tenant_id TEXT,
          user_id TEXT,
          user_email TEXT,
          user_role TEXT,
          user_name TEXT,
          action_type TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          entity_number TEXT,
          from_state TEXT,
          to_state TEXT,
          diff_json JSONB,
          metadata JSONB,
          reason TEXT,
          ip_address TEXT,
          user_agent TEXT,
          request_id TEXT,
          idempotency_key TEXT,
          workflow_instance_id TEXT,
          workflow_task_id TEXT,
          status TEXT NOT NULL DEFAULT 'RECORDED',
          created_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_eae_entity ON enterprise_audit_events (entity_type, entity_id);
        CREATE INDEX IF NOT EXISTS idx_eae_created_at ON enterprise_audit_events (created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_eae_user_id ON enterprise_audit_events (user_id);
        CREATE INDEX IF NOT EXISTS idx_eae_company_id ON enterprise_audit_events (company_id);
        CREATE INDEX IF NOT EXISTS idx_eae_action_type ON enterprise_audit_events (action_type);
        CREATE INDEX IF NOT EXISTS idx_eae_idempotency_key ON enterprise_audit_events (idempotency_key);
        CREATE INDEX IF NOT EXISTS idx_eae_entity_number ON enterprise_audit_events (entity_number);
        CREATE INDEX IF NOT EXISTS idx_eae_wf_instance ON enterprise_audit_events (workflow_instance_id);
      `);
      EnterpriseAuditRepository.isTableEnsured = true;
    } catch (err) {
      logger.error('Failed to ensure enterprise_audit_events table:', err);
    }
  }

  /**
   * Records a single enterprise audit event.
   * Append-only: Guaranteed non-destructive.
   */
  async logEvent(params: AuditEventPayload, tx?: any): Promise<DbEnterpriseAuditEvent> {
    await this.ensureTable();
    const now = params.createdAt || new Date().toISOString();
    const id = params.id || `eae-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const eventRecord: NewEnterpriseAuditEvent = {
      id,
      companyId: params.companyId ?? 'cmp-101',
      tenantId: params.tenantId ?? null,
      userId: params.userId ?? null,
      userEmail: params.userEmail ?? null,
      userRole: params.userRole ?? null,
      userName: params.userName ?? null,
      actionType: String(params.actionType).toUpperCase(),
      entityType: String(params.entityType).toUpperCase(),
      entityId: String(params.entityId),
      entityNumber: params.entityNumber ?? null,
      fromState: params.fromState ?? null,
      toState: params.toState ?? null,
      diffJson: params.diffJson ?? null,
      metadata: params.metadata ?? null,
      reason: params.reason ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
      requestId: params.requestId ?? null,
      idempotencyKey: params.idempotencyKey ?? null,
      workflowInstanceId: params.workflowInstanceId ?? null,
      workflowTaskId: params.workflowTaskId ?? null,
      status: params.status || 'RECORDED',
      createdAt: now,
    };

    const client = tx || db;
    try {
      await client.insert(enterpriseAuditEvents).values(eventRecord);
    } catch (err) {
      logger.error(`[ENTERPRISE_AUDIT] Failed to insert audit event ${id}:`, err);
      // If table missing, retry once after ensureTable
      try {
        await this.ensureTable();
        await client.insert(enterpriseAuditEvents).values(eventRecord);
      } catch (retryErr) {
        logger.error(`[ENTERPRISE_AUDIT] Retry insert failed for event ${id}:`, retryErr);
      }
    }

    logger.info(
      `[ENTERPRISE_AUDIT] Action: ${eventRecord.actionType} | Entity: ${eventRecord.entityType} (${eventRecord.entityNumber || eventRecord.entityId}) | User: ${eventRecord.userEmail || eventRecord.userId || 'System'} | State: ${eventRecord.fromState || 'NONE'} -> ${eventRecord.toState || 'RECORDED'}`
    );

    return eventRecord as DbEnterpriseAuditEvent;
  }

  /**
   * Batch log multiple events atomically or sequentially.
   */
  async batchLogEvents(events: AuditEventPayload[], tx?: any): Promise<DbEnterpriseAuditEvent[]> {
    const results: DbEnterpriseAuditEvent[] = [];
    for (const evt of events) {
      const res = await this.logEvent(evt, tx);
      results.push(res);
    }
    return results;
  }

  /**
   * Retrieves events matching the multi-dimensional filter.
   */
  async queryEvents(filter: AuditEventFilter = {}): Promise<{ events: DbEnterpriseAuditEvent[]; total: number }> {
    await this.ensureTable();
    try {
      let query = db.select().from(enterpriseAuditEvents).orderBy(desc(enterpriseAuditEvents.createdAt));
      const all = await query;

      let filtered = all.filter((evt) => {
        if (filter.companyId && evt.companyId !== filter.companyId) return false;
        if (filter.tenantId && evt.tenantId !== filter.tenantId) return false;
        if (filter.userId && evt.userId !== filter.userId) return false;
        if (filter.userEmail && evt.userEmail?.toLowerCase() !== filter.userEmail.toLowerCase()) return false;
        if (filter.userRole && evt.userRole?.toUpperCase() !== filter.userRole.toUpperCase()) return false;
        if (filter.actionType && evt.actionType?.toUpperCase() !== filter.actionType.toUpperCase()) return false;
        if (filter.entityType && evt.entityType?.toUpperCase() !== filter.entityType.toUpperCase()) return false;
        if (filter.entityId && evt.entityId !== filter.entityId) return false;
        if (filter.entityNumber && evt.entityNumber?.toLowerCase() !== filter.entityNumber.toLowerCase()) return false;
        if (filter.idempotencyKey && evt.idempotencyKey !== filter.idempotencyKey) return false;
        if (filter.workflowInstanceId && evt.workflowInstanceId !== filter.workflowInstanceId) return false;
        if (filter.fromState && evt.fromState !== filter.fromState) return false;
        if (filter.toState && evt.toState !== filter.toState) return false;
        if (filter.startDate && evt.createdAt < filter.startDate) return false;
        if (filter.endDate && evt.createdAt > filter.endDate) return false;

        if (filter.search) {
          const q = filter.search.toLowerCase();
          const matches =
            evt.entityId?.toLowerCase().includes(q) ||
            evt.entityNumber?.toLowerCase().includes(q) ||
            evt.entityType?.toLowerCase().includes(q) ||
            evt.actionType?.toLowerCase().includes(q) ||
            evt.userEmail?.toLowerCase().includes(q) ||
            evt.userName?.toLowerCase().includes(q) ||
            evt.reason?.toLowerCase().includes(q);
          if (!matches) return false;
        }

        return true;
      });

      const total = filtered.length;
      const offset = filter.offset || 0;
      const limit = filter.limit || 50;
      const paginated = filtered.slice(offset, offset + limit);

      return { events: paginated, total };
    } catch (err) {
      logger.error('Failed to query enterprise_audit_events:', err);
      return { events: [], total: 0 };
    }
  }

  /**
   * Retrieves an event by its ID.
   */
  async getEventById(id: string): Promise<DbEnterpriseAuditEvent | null> {
    await this.ensureTable();
    try {
      const rows = await db.select().from(enterpriseAuditEvents).where(eq(enterpriseAuditEvents.id, id)).limit(1);
      return rows[0] || null;
    } catch (err) {
      logger.error(`Failed to get audit event by ID ${id}:`, err);
      return null;
    }
  }

  /**
   * Retrieves all events for a specific entity.
   */
  async getEventsByEntity(entityType: string, entityId: string): Promise<DbEnterpriseAuditEvent[]> {
    await this.ensureTable();
    try {
      return await db
        .select()
        .from(enterpriseAuditEvents)
        .where(
          and(
            eq(enterpriseAuditEvents.entityType, entityType.toUpperCase()),
            eq(enterpriseAuditEvents.entityId, entityId)
          )
        )
        .orderBy(desc(enterpriseAuditEvents.createdAt));
    } catch (err) {
      logger.error(`Failed to get audit events for entity ${entityType}:${entityId}:`, err);
      return [];
    }
  }

  /**
   * Retrieves events linked to an idempotency key.
   */
  async getEventsByIdempotencyKey(idempotencyKey: string): Promise<DbEnterpriseAuditEvent[]> {
    await this.ensureTable();
    try {
      return await db
        .select()
        .from(enterpriseAuditEvents)
        .where(eq(enterpriseAuditEvents.idempotencyKey, idempotencyKey))
        .orderBy(desc(enterpriseAuditEvents.createdAt));
    } catch (err) {
      logger.error(`Failed to get audit events for idempotencyKey ${idempotencyKey}:`, err);
      return [];
    }
  }

  /**
   * IMMUTABILITY ENFORCEMENT
   * The Enterprise Audit Trail is strictly append-only.
   * Updates and Deletions are forbidden by design.
   */
  async updateEvent(): Promise<never> {
    throw new Error('Immutability Violation: Enterprise Audit Events are append-only and cannot be updated.');
  }

  async deleteEvent(): Promise<never> {
    throw new Error('Immutability Violation: Enterprise Audit Events are append-only and cannot be deleted.');
  }
}

export const enterpriseAuditRepository = new EnterpriseAuditRepository();
