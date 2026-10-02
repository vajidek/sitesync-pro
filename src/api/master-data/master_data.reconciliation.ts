// ============================================================================
// PHASE 76: MASTER DATA MANAGEMENT - CROSS-MODULE RECONCILIATION ENGINE
// ============================================================================

import {
  MasterDomainCode,
  ReconciliationJobItem,
  MasterRecordItem,
} from './master_data.types';

export class ReconciliationEngine {
  private static instance: ReconciliationEngine;

  private constructor() {}

  public static getInstance(): ReconciliationEngine {
    if (!ReconciliationEngine.instance) {
      ReconciliationEngine.instance = new ReconciliationEngine();
    }
    return ReconciliationEngine.instance;
  }

  /**
   * Run cross-module reconciliation for a specific domain
   */
  public executeDomainReconciliation(params: {
    domainCode: MasterDomainCode;
    masterRecords: MasterRecordItem[];
    triggerType?: 'MANUAL' | 'SCHEDULED' | 'EVENT_DRIVEN';
    executedByUserId?: string;
  }): ReconciliationJobItem {
    const { domainCode, masterRecords, triggerType = 'MANUAL', executedByUserId = 'SYSTEM' } = params;

    const participatingModules = this.getParticipatingModulesForDomain(domainCode);
    const jobCode = `REC-${domainCode}-${Date.now().toString().slice(-6)}`;
    const startTime = new Date().toISOString();

    const moduleBreakdown: Record<string, { total: number; reconciled: number; discrepancies: number }> = {};
    participatingModules.forEach((mod) => {
      moduleBreakdown[mod] = { total: masterRecords.length, reconciled: 0, discrepancies: 0 };
    });

    const orphans: Array<{ module: string; entityId: string; reason: string }> = [];
    const conflicts: Array<{ canonicalId: string; field: string; values: Record<string, any>; severity: string }> = [];

    let issuesFoundCount = 0;
    let orphanRecordsCount = 0;
    let conflictsCount = 0;

    masterRecords.forEach((record) => {
      const payload = record.dataPayload || {};

      // Check 1: Inactive or suspended records with active transactional links
      if (record.status === 'SUSPENDED' && (payload.activePurchaseOrders || payload.activeContracts)) {
        conflictsCount++;
        issuesFoundCount++;
        conflicts.push({
          canonicalId: record.canonicalId,
          field: 'status',
          values: { masterStatus: record.status, operationalStatus: 'ACTIVE_COMMERCIAL_TRANSACTIONS' },
          severity: 'HIGH',
        });
      }

      // Check 2: Missing statutory identifier in Finance vs Procurement
      if (domainCode === 'VENDORS') {
        if (!payload.taxId || !payload.iban) {
          issuesFoundCount++;
          participatingModules.forEach((m) => {
            if (m === 'FINANCE') moduleBreakdown[m].discrepancies++;
          });
        }
      }

      // Check 3: Orphan check - Record has no sourceEntityId or disconnected source module
      if (!record.sourceEntityId || record.sourceEntityId === 'UNKNOWN') {
        orphanRecordsCount++;
        issuesFoundCount++;
        orphans.push({
          module: record.sourceModule,
          entityId: record.canonicalId,
          reason: 'Master entity possesses no verifiable primary key link in upstream module repository.',
        });
      }

      // Mark reconciled modules
      participatingModules.forEach((mod) => {
        moduleBreakdown[mod].reconciled = moduleBreakdown[mod].total - moduleBreakdown[mod].discrepancies;
      });
    });

    const endTime = new Date().toISOString();

    return {
      id: `job-${jobCode}`,
      jobCode,
      jobName: `${domainCode} Cross-Module Multi-System Reconciliation`,
      domainCode,
      participatingModules,
      status: 'COMPLETED',
      triggerType,
      startTime,
      endTime,
      recordsScannedCount: masterRecords.length,
      issuesFoundCount,
      issuesResolvedCount: 0,
      orphanRecordsCount,
      conflictsCount,
      summaryReport: {
        scannedEntities: masterRecords.length,
        moduleBreakdown,
        orphans,
        conflicts,
      },
      executedByUserId,
      createdAt: startTime,
      updatedAt: endTime,
    };
  }

  public getParticipatingModulesForDomain(domainCode: MasterDomainCode): string[] {
    switch (domainCode) {
      case 'VENDORS':
        return ['PROCUREMENT', 'CONTRACTS', 'FINANCE', 'PROJECTS'];
      case 'EMPLOYEES':
        return ['HRMS', 'PAYROLL', 'PROJECTS', 'HSE', 'QAQC'];
      case 'MATERIALS':
        return ['INVENTORY', 'PROCUREMENT', 'PROJECTS', 'FINANCE'];
      case 'ASSETS':
      case 'EQUIPMENT':
      case 'FLEET_VEHICLES':
        return ['EAM', 'FLEET', 'IOT', 'SCADA', 'FINANCE'];
      case 'PROJECTS':
      case 'SITES':
        return ['PROJECTS', 'PROJECT_CONTROLS', 'FINANCE', 'CRM', 'EDMS'];
      case 'CUSTOMERS':
        return ['CRM', 'FINANCE', 'PROJECTS', 'CONTRACTS'];
      case 'COST_CENTERS':
      case 'CHART_OF_ACCOUNTS':
        return ['FINANCE', 'PROJECT_CONTROLS', 'PROCUREMENT', 'HRMS'];
      default:
        return ['CORE_ERP', 'OPERATIONS', 'FINANCE'];
    }
  }
}

export const reconciliationEngine = ReconciliationEngine.getInstance();
