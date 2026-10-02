// ============================================================================
// PHASE 76: MASTER DATA MANAGEMENT - GOVERNANCE AUDIT SENTINEL
// ============================================================================

import { GovernanceAuditLogItem, MasterDomainCode } from './master_data.types';

export class MasterDataAuditSentinel {
  private static instance: MasterDataAuditSentinel;
  private auditLogs: GovernanceAuditLogItem[] = [];

  private constructor() {
    this.seedInitialAuditLogs();
  }

  public static getInstance(): MasterDataAuditSentinel {
    if (!MasterDataAuditSentinel.instance) {
      MasterDataAuditSentinel.instance = new MasterDataAuditSentinel();
    }
    return MasterDataAuditSentinel.instance;
  }

  private seedInitialAuditLogs() {
    this.auditLogs = [
      {
        id: 'aud-001',
        action: 'MDM_REGISTRY_BOOTSTRAP',
        domainCode: 'ORGANIZATION',
        canonicalId: 'MDM-ORG-001',
        userId: 'SYSTEM',
        userName: 'Enterprise Master Data Sentinel',
        userRole: 'SYSTEM_ADMIN',
        ipAddress: '127.0.0.1',
        changeSummary: 'Initialized authoritative master registry for Apex Global Engineering subsidiaries.',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'aud-002',
        action: 'DUPLICATE_CANDIDATE_DETECTED',
        domainCode: 'VENDORS',
        canonicalId: 'MDM-VND-001',
        userId: 'SYSTEM',
        userName: 'Duplicate Detection Engine',
        userRole: 'AUTOMATED_SCANNER',
        ipAddress: '127.0.0.1',
        changeSummary: 'Detected 94% similarity candidate pair between Gulf Steel Supply LLC and Gulf Steel FZC.',
        timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        id: 'aud-003',
        action: 'DATA_QUALITY_SCAN_EXECUTED',
        domainCode: 'MATERIALS',
        canonicalId: 'ALL',
        userId: 'usr-inv-01',
        userName: 'Ali Hassan',
        userRole: 'INVENTORY_MANAGER',
        ipAddress: '192.168.1.45',
        changeSummary: 'Executed comprehensive deterministic quality scan across 1,420 material SKU masters.',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
    ];
  }

  public logEvent(params: {
    action: string;
    domainCode: MasterDomainCode;
    canonicalId: string;
    userId: string;
    userName: string;
    userRole: string;
    ipAddress?: string;
    previousState?: Record<string, any>;
    newState?: Record<string, any>;
    changeSummary: string;
  }): GovernanceAuditLogItem {
    const item: GovernanceAuditLogItem = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action: params.action,
      domainCode: params.domainCode,
      canonicalId: params.canonicalId,
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      ipAddress: params.ipAddress || '127.0.0.1',
      previousState: params.previousState,
      newState: params.newState,
      changeSummary: params.changeSummary,
      timestamp: new Date().toISOString(),
    };

    this.auditLogs.unshift(item);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return item;
  }

  public getLogs(filter?: { domainCode?: MasterDomainCode; canonicalId?: string; limit?: number }): GovernanceAuditLogItem[] {
    let result = this.auditLogs;
    if (filter?.domainCode) {
      result = result.filter((l) => l.domainCode === filter.domainCode);
    }
    if (filter?.canonicalId) {
      result = result.filter((l) => l.canonicalId === filter.canonicalId);
    }
    const limit = filter?.limit || 100;
    return result.slice(0, limit);
  }
}

export const masterDataAuditSentinel = MasterDataAuditSentinel.getInstance();
