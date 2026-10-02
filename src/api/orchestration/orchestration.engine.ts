// ============================================================================
// PHASE 75: ENTERPRISE ERP ORCHESTRATION - CENTRAL ENGINE & EVENT BUS
// ============================================================================

import {
  DomainEventPayload,
  DomainEventRecord,
  EventHandlerDefinition,
  EventHandlerResult,
  EventProcessingStatus,
  SourceModule,
  IntegrationModuleHealth,
} from './orchestration.types';
import { CROSS_MODULE_EVENT_HANDLERS } from './orchestration.handlers';
import { OrchestrationAuditSentinel } from './orchestration.audit';

export class OrchestrationEngine {
  private static instance: OrchestrationEngine;
  private handlers: Map<string, EventHandlerDefinition[]> = new Map();
  private idempotencyCache: Set<string> = new Set();
  private eventStore: DomainEventRecord[] = [];
  private deadLetterQueue: Array<{ event: DomainEventRecord; reason: string; lastAttempt: string }> = [];
  private isInitialized = false;

  private moduleStats: Record<
    SourceModule,
    { inbound: number; outbound: number; failed: number; latencies: number[]; lastEvent: string }
  > = {
    PROJECTS: { inbound: 12, outbound: 15, failed: 0, latencies: [24, 30], lastEvent: new Date().toISOString() },
    PROJECT_CONTROLS: { inbound: 35, outbound: 28, failed: 0, latencies: [35, 42], lastEvent: new Date().toISOString() },
    PROCUREMENT: { inbound: 42, outbound: 38, failed: 0, latencies: [28, 31], lastEvent: new Date().toISOString() },
    INVENTORY: { inbound: 18, outbound: 14, failed: 0, latencies: [19, 22], lastEvent: new Date().toISOString() },
    FINANCE: { inbound: 29, outbound: 25, failed: 0, latencies: [45, 50], lastEvent: new Date().toISOString() },
    EAM: { inbound: 31, outbound: 29, failed: 0, latencies: [30, 36], lastEvent: new Date().toISOString() },
    SCADA: { inbound: 85, outbound: 62, failed: 1, latencies: [12, 18], lastEvent: new Date().toISOString() },
    IOT: { inbound: 40, outbound: 35, failed: 0, latencies: [15, 20], lastEvent: new Date().toISOString() },
    QAQC: { inbound: 22, outbound: 19, failed: 0, latencies: [25, 28], lastEvent: new Date().toISOString() },
    HSE: { inbound: 16, outbound: 14, failed: 0, latencies: [22, 24], lastEvent: new Date().toISOString() },
    EDMS: { inbound: 26, outbound: 21, failed: 0, latencies: [32, 40], lastEvent: new Date().toISOString() },
    HRMS: { inbound: 14, outbound: 11, failed: 0, latencies: [28, 33], lastEvent: new Date().toISOString() },
    CRM: { inbound: 10, outbound: 8, failed: 0, latencies: [30, 35], lastEvent: new Date().toISOString() },
    MOBILE_GIS: { inbound: 15, outbound: 12, failed: 0, latencies: [20, 25], lastEvent: new Date().toISOString() },
    AI_INTELLIGENCE: { inbound: 55, outbound: 48, failed: 0, latencies: [65, 80], lastEvent: new Date().toISOString() },
    AI_GATEWAY: { inbound: 60, outbound: 58, failed: 0, latencies: [70, 95], lastEvent: new Date().toISOString() },
    WORKFLOW: { inbound: 45, outbound: 40, failed: 0, latencies: [35, 45], lastEvent: new Date().toISOString() },
  };

  private constructor() {
    this.initializeHandlers();
  }

  public static getInstance(): OrchestrationEngine {
    if (!OrchestrationEngine.instance) {
      OrchestrationEngine.instance = new OrchestrationEngine();
    }
    return OrchestrationEngine.instance;
  }

  private initializeHandlers() {
    if (this.isInitialized) return;
    CROSS_MODULE_EVENT_HANDLERS.forEach((handler) => {
      this.registerHandler(handler);
    });
    this.seedInitialEvents();
    this.isInitialized = true;
  }

  private seedInitialEvents() {
    // Seed initial operational domain events for demo/bootstrap
    const initialEvents: DomainEventPayload[] = [
      {
        eventId: 'evt-boot-001',
        eventType: 'PO_DELIVERY_DELAYED',
        sourceModule: 'PROCUREMENT',
        entityType: 'PURCHASE_ORDER',
        entityId: 'PO-2026-889',
        projectId: 'PRJ-101',
        severity: 'CRITICAL',
        payload: {
          poNumber: 'PO-2026-889',
          vendorId: 'VND-EMIRATES-STEEL',
          materialName: '1200mm Heavy-Duty Carbon Steel Flanges (DN1200 PN16)',
          promisedDate: '2026-08-10',
          revisedDate: '2026-08-25',
          projectId: 'PRJ-101',
          isZeroFloatImpact: true,
          delayDays: 15,
        },
        correlationId: 'corr-supply-pipeline-01',
        idempotencyKey: 'PO_DELIVERY_DELAYED_PURCHASE_ORDER_PO-2026-889_boot',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        createdBy: 'Procurement Ingestion Service',
      },
      {
        eventId: 'evt-boot-002',
        eventType: 'SCADA_ALARM_CRITICAL',
        sourceModule: 'SCADA',
        entityType: 'SCADA_DEVICE',
        entityId: 'PLC-DMA-04-PUMP-A',
        projectId: 'PRJ-101',
        severity: 'CRITICAL',
        payload: {
          deviceId: 'PLC-DMA-04-PUMP-A',
          tagCode: 'PUMP_VIB_RADIAL_DE',
          alarmText: 'High vibration limit exceeded (11.8 mm/s RMS). Risk of bearing failure.',
          pressureBar: 14.2,
          tripActive: true,
          dmaZone: 'DMA-04-NORTH',
        },
        correlationId: 'corr-scada-telemetry-01',
        idempotencyKey: 'SCADA_ALARM_CRITICAL_SCADA_DEVICE_PLC-DMA-04-PUMP-A_boot',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        createdBy: 'SCADA RTU Poller',
      },
      {
        eventId: 'evt-boot-003',
        eventType: 'NCR_OVERDUE',
        sourceModule: 'QAQC',
        entityType: 'NON_CONFORMANCE_REPORT',
        entityId: 'NCR-2026-042',
        projectId: 'PRJ-101',
        severity: 'HIGH',
        payload: {
          ncrNumber: 'NCR-2026-042',
          projectId: 'PRJ-101',
          wbsCode: 'WBS-4.1-WELDING',
          assignedEngineerId: 'ENG-QA-08',
          daysOverdue: 4,
          defectCategory: 'Weld Root Porosity (Section 4 Hydrotest)',
        },
        correlationId: 'corr-qaqc-ncr-01',
        idempotencyKey: 'NCR_OVERDUE_NON_CONFORMANCE_REPORT_NCR-2026-042_boot',
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
        createdBy: 'QA/QC Inspection Sentinel',
      },
      {
        eventId: 'evt-boot-004',
        eventType: 'PERMIT_EXPIRED',
        sourceModule: 'HSE',
        entityType: 'SAFETY_PERMIT',
        entityId: 'PTW-2026-118',
        projectId: 'PRJ-102',
        severity: 'CRITICAL',
        payload: {
          permitNumber: 'PTW-2026-118',
          permitType: 'CONFINED_SPACE',
          projectId: 'PRJ-102',
          location: 'Trench Section KM 14+200',
          hazardLevel: 'CRITICAL_OXYGEN_DEFICIT_RISK',
        },
        correlationId: 'corr-hse-ptw-01',
        idempotencyKey: 'PERMIT_EXPIRED_SAFETY_PERMIT_PTW-2026-118_boot',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        createdBy: 'HSE Sentinel',
      },
      {
        eventId: 'evt-boot-005',
        eventType: 'BUDGET_THRESHOLD_EXCEEDED',
        sourceModule: 'FINANCE',
        entityType: 'COST_CENTER',
        entityId: 'CC-MEP-SUBSTRUCTURE',
        projectId: 'PRJ-101',
        severity: 'CRITICAL',
        payload: {
          costCenterId: 'CC-MEP-SUBSTRUCTURE',
          projectId: 'PRJ-101',
          allocatedBudget: 1200000,
          committedSpend: 1185000,
          variancePercentage: 98.75,
        },
        correlationId: 'corr-finance-budget-01',
        idempotencyKey: 'BUDGET_THRESHOLD_EXCEEDED_COST_CENTER_CC-MEP-SUBSTRUCTURE_boot',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        createdBy: 'Finance Ledger Engine',
      },
    ];

    initialEvents.forEach((evt) => {
      this.eventStore.push({
        ...evt,
        id: evt.eventId,
        status: 'COMPLETED',
        retryCount: 0,
        maxRetries: 3,
        processedAt: evt.timestamp,
        createdAt: evt.timestamp,
        updatedAt: evt.timestamp,
      });
      this.idempotencyCache.add(evt.idempotencyKey);
    });
  }

  public registerHandler(handler: EventHandlerDefinition) {
    const list = this.handlers.get(handler.eventType) || [];
    list.push(handler);
    // Sort by execution order ascending
    list.sort((a, b) => a.executionOrder - b.executionOrder);
    this.handlers.set(handler.eventType, list);
  }

  /**
   * Publishes an event to the Event Bus with Idempotency check & Handler execution
   */
  public async publishEvent(payload: DomainEventPayload): Promise<{
    status: EventProcessingStatus;
    eventId: string;
    isDuplicate: boolean;
    results: EventHandlerResult[];
  }> {
    // 1. Idempotency Check
    if (this.idempotencyCache.has(payload.idempotencyKey)) {
      const existing = this.eventStore.find((e) => e.idempotencyKey === payload.idempotencyKey);
      return {
        status: existing?.status || 'COMPLETED',
        eventId: existing?.id || payload.eventId,
        isDuplicate: true,
        results: [],
      };
    }

    const eventRecord: DomainEventRecord = {
      ...payload,
      id: payload.eventId,
      status: 'PROCESSING',
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.eventStore.unshift(eventRecord);
    this.idempotencyCache.add(payload.idempotencyKey);

    // Update outbound metrics for source module
    if (this.moduleStats[payload.sourceModule]) {
      this.moduleStats[payload.sourceModule].outbound++;
      this.moduleStats[payload.sourceModule].lastEvent = new Date().toISOString();
    }

    const matchedHandlers = this.handlers.get(payload.eventType) || [];
    const results: EventHandlerResult[] = [];
    let hasFailure = false;

    // 2. Dispatch to Handlers with error isolation & bounded retry
    for (const handler of matchedHandlers) {
      if (!handler.isEnabled) continue;

      // Inbound metrics
      if (this.moduleStats[handler.targetModule]) {
        this.moduleStats[handler.targetModule].inbound++;
      }

      let attempt = 1;
      let executedSuccess = false;
      let lastErr = '';

      while (attempt <= handler.retryLimit && !executedSuccess) {
        try {
          const timeoutPromise = new Promise<EventHandlerResult>((_, reject) =>
            setTimeout(() => reject(new Error(`Handler timeout (${handler.timeoutMs}ms)`)), handler.timeoutMs)
          );

          const execPromise = handler.execute({
            event: eventRecord,
            correlationId: payload.correlationId,
            sourceModule: payload.sourceModule,
            timestamp: payload.timestamp,
            actor: payload.createdBy,
          });

          const result = await Promise.race([execPromise, timeoutPromise]);
          results.push(result);
          executedSuccess = result.success;

          if (this.moduleStats[handler.targetModule]) {
            this.moduleStats[handler.targetModule].latencies.push(result.executionTimeMs);
            if (this.moduleStats[handler.targetModule].latencies.length > 20) {
              this.moduleStats[handler.targetModule].latencies.shift();
            }
          }
        } catch (err: any) {
          lastErr = err?.message || 'Unknown handler execution failure';
          attempt++;
        }
      }

      if (!executedSuccess) {
        hasFailure = true;
        if (this.moduleStats[handler.targetModule]) {
          this.moduleStats[handler.targetModule].failed++;
        }
        results.push({
          success: false,
          handlerCode: handler.code,
          summary: `Handler execution failed after ${handler.retryLimit} attempts: ${lastErr}`,
          executionTimeMs: 0,
          error: lastErr,
        });
      }
    }

    // 3. Finalize Event Record State
    eventRecord.processedAt = new Date().toISOString();
    eventRecord.updatedAt = new Date().toISOString();

    if (hasFailure) {
      eventRecord.status = 'FAILED';
      eventRecord.errorMessage = 'One or more handlers failed to complete.';
      this.deadLetterQueue.push({
        event: eventRecord,
        reason: eventRecord.errorMessage,
        lastAttempt: new Date().toISOString(),
      });
    } else {
      eventRecord.status = 'COMPLETED';
    }

    OrchestrationAuditSentinel.log({
      action: 'DOMAIN_EVENT_PUBLISHED',
      entityType: payload.entityType,
      entityId: payload.entityId,
      userId: payload.createdBy,
      userName: 'Event Bus',
      userRole: 'SYSTEM',
      ipAddress: '127.0.0.1',
      metadata: {
        eventType: payload.eventType,
        correlationId: payload.correlationId,
        handlersExecuted: matchedHandlers.length,
        status: eventRecord.status,
      },
    });

    return {
      status: eventRecord.status,
      eventId: eventRecord.id,
      isDuplicate: false,
      results,
    };
  }

  /**
   * Replays an event by ID (Idempotency override with new correlation sequence)
   */
  public async replayEvent(
    eventId: string,
    requestedBy: string
  ): Promise<{ success: boolean; message: string; results: EventHandlerResult[] }> {
    const existing = this.eventStore.find((e) => e.id === eventId);
    if (!existing) {
      return { success: false, message: `Event ${eventId} not found in store.`, results: [] };
    }

    // Reset status and generate causation linkage
    const replayPayload: DomainEventPayload = {
      ...existing,
      eventId: `evt-replay-${Date.now().toString(36)}`,
      causationId: existing.id,
      idempotencyKey: `${existing.idempotencyKey}_replay_${Date.now()}`,
      createdBy: requestedBy,
      timestamp: new Date().toISOString(),
    };

    const res = await this.publishEvent(replayPayload);

    OrchestrationAuditSentinel.log({
      action: 'EVENT_REPLAY_REQUESTED',
      entityType: existing.entityType,
      entityId: existing.entityId,
      userId: requestedBy,
      userName: requestedBy,
      userRole: 'OPERATIONS_ADMIN',
      ipAddress: '127.0.0.1',
      metadata: { originalEventId: eventId, newEventId: res.eventId, status: res.status },
    });

    return {
      success: res.status === 'COMPLETED',
      message: `Event ${eventId} replayed as ${res.eventId}. Status: ${res.status}`,
      results: res.results,
    };
  }

  /**
   * Returns recent events with optional filtering
   */
  public getEvents(filter?: {
    module?: SourceModule;
    eventType?: string;
    status?: EventProcessingStatus;
    projectId?: string;
    limit?: number;
  }): DomainEventRecord[] {
    let result = [...this.eventStore];
    if (filter?.module) {
      result = result.filter((e) => e.sourceModule === filter.module);
    }
    if (filter?.eventType) {
      result = result.filter((e) => e.eventType === filter.eventType);
    }
    if (filter?.status) {
      result = result.filter((e) => e.status === filter.status);
    }
    if (filter?.projectId) {
      result = result.filter((e) => e.projectId === filter.projectId);
    }
    const limit = filter?.limit || 50;
    return result.slice(0, limit);
  }

  /**
   * Retrieves integration module health statuses
   */
  public getIntegrationHealth(): IntegrationModuleHealth[] {
    const modules: SourceModule[] = [
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
    ];

    return modules.map((m) => {
      const stats = this.moduleStats[m] || {
        inbound: 0,
        outbound: 0,
        failed: 0,
        latencies: [30],
        lastEvent: new Date().toISOString(),
      };
      const avgLatency =
        stats.latencies.length > 0
          ? Math.round(stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length)
          : 30;

      let healthStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'OFFLINE' = 'HEALTHY';
      if (stats.failed > 2) {
        healthStatus = 'CRITICAL';
      } else if (stats.failed > 0 || avgLatency > 150) {
        healthStatus = 'DEGRADED';
      }

      return {
        moduleCode: m,
        moduleName: this.getModuleName(m),
        healthStatus,
        eventsInbound24h: stats.inbound,
        eventsOutbound24h: stats.outbound,
        failedEvents24h: stats.failed,
        avgProcessingLatencyMs: avgLatency,
        queueDepth: stats.failed > 0 ? stats.failed : 0,
        lastEventTimestamp: stats.lastEvent,
        lastHealthCheck: new Date().toISOString(),
      };
    });
  }

  private getModuleName(module: SourceModule): string {
    const names: Record<SourceModule, string> = {
      PROJECTS: 'Projects & Sites',
      PROJECT_CONTROLS: 'Project Controls & EVM',
      PROCUREMENT: 'Strategic Procurement',
      INVENTORY: 'Mechanical Inventory Store',
      FINANCE: 'Finance & Accounts',
      EAM: 'EAM & Machinery Management',
      SCADA: 'SCADA & DMA Telemetry',
      IOT: 'Industrial IoT Sensors',
      QAQC: 'QA/QC Quality System',
      HSE: 'HSE Safety & Environmental',
      EDMS: 'Document Management (EDMS)',
      HRMS: 'HRMS & Site Workforce',
      CRM: 'CRM & Client Stakeholders',
      MOBILE_GIS: 'Mobile Field Operations & GIS',
      AI_INTELLIGENCE: 'Enterprise AI Intelligence',
      AI_GATEWAY: 'Multi-Model AI Gateway',
      WORKFLOW: 'Workflow & Notification Engine',
    };
    return names[module] || module;
  }

  public getDeadLetterQueue() {
    return this.deadLetterQueue;
  }
}
