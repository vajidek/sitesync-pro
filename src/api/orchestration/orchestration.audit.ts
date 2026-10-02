// ============================================================================
// PHASE 75: ENTERPRISE ERP ORCHESTRATION - AUDIT SENTINEL
// ============================================================================

export interface OrchestrationAuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  userRole: string;
  ipAddress: string;
  previousState?: string;
  newState?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export class OrchestrationAuditSentinel {
  private static inMemoryAuditLogs: OrchestrationAuditEntry[] = [];
  private static readonly MAX_IN_MEMORY_LOGS = 1000;

  /**
   * Logs an orchestration activity with full attribution
   */
  public static log(entry: Omit<OrchestrationAuditEntry, 'id' | 'timestamp'>): OrchestrationAuditEntry {
    const fullEntry: OrchestrationAuditEntry = {
      ...entry,
      id: `audit-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };

    this.inMemoryAuditLogs.unshift(fullEntry);
    if (this.inMemoryAuditLogs.length > this.MAX_IN_MEMORY_LOGS) {
      this.inMemoryAuditLogs.pop();
    }

    return fullEntry;
  }

  /**
   * Retrieves recent audit logs
   */
  public static getLogs(limit: number = 100): OrchestrationAuditEntry[] {
    return this.inMemoryAuditLogs.slice(0, limit);
  }

  /**
   * Filters audit logs by entity or action
   */
  public static filterLogs(filter: {
    entityType?: string;
    entityId?: string;
    action?: string;
    userId?: string;
  }): OrchestrationAuditEntry[] {
    return this.inMemoryAuditLogs.filter((log) => {
      if (filter.entityType && log.entityType !== filter.entityType) return false;
      if (filter.entityId && log.entityId !== filter.entityId) return false;
      if (filter.action && log.action !== filter.action) return false;
      if (filter.userId && log.userId !== filter.userId) return false;
      return true;
    });
  }
}
