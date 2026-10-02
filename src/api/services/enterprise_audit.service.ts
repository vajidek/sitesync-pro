import {
  enterpriseAuditRepository,
  AuditEventPayload,
  AuditEventFilter,
} from '../repositories/enterprise_audit.repository';
import { auditRepository } from '../repositories/audit.repository';
import { db } from '../../db/index';
import { procurementLogs, inventoryLogs } from '../../db/schema';
import { logger } from '../utils/logger';

export interface DomainAuditEventPayload extends AuditEventPayload {
  mirrorToLegacy?: boolean;
}

export class EnterpriseAuditService {
  /**
   * Records a domain action in the Enterprise Audit Event layer
   * and optionally mirrors to legacy audit tables for backwards compatibility.
   */
  async recordEvent(params: AuditEventPayload, tx?: any) {
    const event = await enterpriseAuditRepository.logEvent(params, tx);

    // Backwards compatibility dual-write to legacy auditLogs table
    try {
      await auditRepository.logAction({
        userId: params.userId || undefined,
        userEmail: params.userEmail || undefined,
        userRole: params.userRole || undefined,
        action: `${params.entityType}_${params.actionType}`,
        module: params.entityType,
        details: params.reason || `Action ${params.actionType} on ${params.entityType} ${params.entityNumber || params.entityId}`,
        ipAddress: params.ipAddress || undefined,
        userAgent: params.userAgent || undefined,
      });
    } catch (e) {
      logger.warn('[ENTERPRISE_AUDIT] Legacy audit mirror non-fatal error:', e);
    }

    return event;
  }

  /**
   * Records a domain event with explicit support for legacy domain log mirroring
   */
  async recordDomainEvent(params: DomainAuditEventPayload, tx?: any) {
    const event = await this.recordEvent(params, tx);

    if (params.mirrorToLegacy) {
      const now = new Date().toISOString();
      const targetDb = tx || db;

      try {
        const isProcurement = [
          'PURCHASE_REQUISITION',
          'PURCHASE_ORDER',
          'RFQ',
          'QUOTATION',
          'VENDOR_QUOTATION',
          'COMPARATIVE_STATEMENT',
          'SUBCONTRACT_WORK_ORDER',
          'RA_BILL',
        ].includes(params.entityType);

        if (isProcurement) {
          await targetDb.insert(procurementLogs).values({
            id: `plog-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            entityType: params.entityType,
            entityId: params.entityId,
            entityNumber: params.entityNumber || params.entityId,
            actionType: params.actionType,
            performedBy: params.userName || 'System',
            details: params.reason || `Action ${params.actionType} on ${params.entityType} ${params.entityNumber || params.entityId}`,
            isActive: true,
            isDeleted: false,
            createdAt: now,
            updatedAt: now,
          });
        }

        const isInventory = [
          'GOODS_RECEIPT_NOTE',
          'MATERIAL_ISSUE',
          'MATERIAL_RETURN',
          'MATERIAL_TRANSFER',
          'STOCK_TRANSACTION',
        ].includes(params.entityType);

        if (isInventory) {
          await targetDb.insert(inventoryLogs).values({
            id: `ilog-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            actionType: params.actionType,
            performedBy: params.userName || 'System',
            details: params.reason || `Action ${params.actionType} on ${params.entityType} ${params.entityNumber || params.entityId}`,
            warehouseId: (params.metadata as any)?.warehouseId || 'wh-main',
            createdAt: now,
          });
        }
      } catch (err) {
        logger.warn('[ENTERPRISE_AUDIT] Domain log legacy mirror error:', err);
      }
    }

    return event;
  }

  /**
   * Query enterprise audit trail with filtering and pagination
   */
  async queryAuditTrail(filter: AuditEventFilter) {
    return await enterpriseAuditRepository.queryEvents(filter);
  }

  /**
   * Get entity audit history
   */
  async getEntityHistory(entityType: string, entityId: string) {
    return await enterpriseAuditRepository.getEventsByEntity(entityType, entityId);
  }

  /**
   * Get audit events by idempotency key
   */
  async getEventsByIdempotencyKey(idempotencyKey: string) {
    return await enterpriseAuditRepository.getEventsByIdempotencyKey(idempotencyKey);
  }
}

export const enterpriseAuditService = new EnterpriseAuditService();
