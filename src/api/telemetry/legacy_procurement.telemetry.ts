import { db } from '../../db';
import { procurementLogs } from '../../db/schema';

export interface LegacyTelemetryEvent {
  eventType: 'LEGACY_READ_REDIRECTED' | 'LEGACY_WRITE_BRIDGED' | 'OBSOLETE_QUERY_BLOCKED';
  caller: string;
  legacyTarget: string;
  activeTarget: string;
  entityId?: string;
  details?: Record<string, any>;
  timestamp?: string;
}

export class LegacyProcurementTelemetry {
  private static instance: LegacyProcurementTelemetry;
  private inMemoryLogs: LegacyTelemetryEvent[] = [];

  public static getInstance(): LegacyProcurementTelemetry {
    if (!LegacyProcurementTelemetry.instance) {
      LegacyProcurementTelemetry.instance = new LegacyProcurementTelemetry();
    }
    return LegacyProcurementTelemetry.instance;
  }

  /**
   * Record a legacy redirection or write bridging event
   */
  public async logEvent(event: LegacyTelemetryEvent): Promise<void> {
    const timestamp = event.timestamp || new Date().toISOString();
    const eventWithTimestamp = { ...event, timestamp };

    // 1. Maintain in-memory log buffer for observability and testing
    this.inMemoryLogs.push(eventWithTimestamp);
    if (this.inMemoryLogs.length > 500) {
      this.inMemoryLogs.shift();
    }

    // 2. Persist telemetry to procurement logs table
    try {
      await db.insert(procurementLogs).values({
        id: `plog_leg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        entityType: 'LEGACY_CONSOLIDATION',
        entityId: event.entityId || event.legacyTarget,
        entityNumber: event.entityId || event.legacyTarget || 'LEGACY-CONSOLIDATION',
        actionType: event.eventType === 'LEGACY_WRITE_BRIDGED' ? 'LEGACY_PROCUREMENT_WRITE_BRIDGED' : 'LEGACY_PROCUREMENT_READ_REDIRECTED',
        performedBy: event.caller || 'SYSTEM_MIGRATION_ADAPTER',
        details: JSON.stringify({
          caller: event.caller,
          legacyTarget: event.legacyTarget,
          activeTarget: event.activeTarget,
          details: event.details || {},
        }),
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    } catch (err) {
      console.warn('[LegacyTelemetry] Warning: failed to persist to DB log table:', err);
    }
  }

  /**
   * Retrieve in-memory telemetry logs
   */
  public getLogs(limit: number = 50): LegacyTelemetryEvent[] {
    return this.inMemoryLogs.slice(-limit);
  }

  /**
   * Alias for getLogs
   */
  public async getRecentEvents(limit: number = 50): Promise<LegacyTelemetryEvent[]> {
    return this.getLogs(limit);
  }

  /**
   * Summary stats of telemetry
   */
  public getStats() {
    return {
      totalEvents: this.inMemoryLogs.length,
      readsRedirected: this.inMemoryLogs.filter((e) => e.eventType === 'LEGACY_READ_REDIRECTED').length,
      writesBridged: this.inMemoryLogs.filter((e) => e.eventType === 'LEGACY_WRITE_BRIDGED').length,
      blockedQueries: this.inMemoryLogs.filter((e) => e.eventType === 'OBSOLETE_QUERY_BLOCKED').length,
    };
  }

  /**
   * Clear telemetry for test setup
   */
  public clearLogs(): void {
    this.inMemoryLogs = [];
  }
}

export const legacyProcurementTelemetry = LegacyProcurementTelemetry.getInstance();
