// ============================================================================
// PHASE 75: ENTERPRISE ERP ORCHESTRATION - DOMAIN EVENT FACTORY
// ============================================================================

import { v4 as uuidv4 } from 'uuid';
import { DomainEventRecord, SourceModule, EventSeverity, EventProcessingStatus } from './orchestration.types';

export class DomainEventFactory {
  public static createEvent(params: {
    eventType: string;
    sourceModule: SourceModule;
    entityType: string;
    entityId: string;
    projectId?: string;
    severity?: EventSeverity;
    payload?: Record<string, any>;
    metadata?: Record<string, any>;
    correlationId?: string;
    causationId?: string;
    idempotencyKey?: string;
    createdBy?: string;
  }): DomainEventRecord {
    const now = new Date().toISOString();
    const eventId = `evt-${uuidv4().slice(0, 8)}`;
    const correlationId = params.correlationId || `corr-${uuidv4().slice(0, 8)}`;

    return {
      id: eventId,
      eventType: params.eventType,
      sourceModule: params.sourceModule,
      entityType: params.entityType,
      entityId: params.entityId,
      projectId: params.projectId || 'PRJ-101',
      severity: params.severity || 'MEDIUM',
      payload: params.payload || {},
      metadata: params.metadata || {},
      correlationId,
      causationId: params.causationId,
      idempotencyKey: params.idempotencyKey || `idem-${params.eventType}-${params.entityId}-${Date.now()}`,
      status: 'PENDING',
      timestamp: now,
      retryCount: 0,
      createdBy: params.createdBy || 'SYSTEM',
    };
  }
}
