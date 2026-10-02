// ============================================================================
// PHASE 76: MASTER DATA MANAGEMENT - DATA LINEAGE ENGINE
// ============================================================================

import {
  MasterRecordItem,
  DataLineageItem,
  LineageNode,
  LineageEdge,
} from './master_data.types';

export class DataLineageEngine {
  private static instance: DataLineageEngine;

  private constructor() {}

  public static getInstance(): DataLineageEngine {
    if (!DataLineageEngine.instance) {
      DataLineageEngine.instance = new DataLineageEngine();
    }
    return DataLineageEngine.instance;
  }

  /**
   * Build complete data lineage graph for any master record
   */
  public generateLineageForRecord(record: MasterRecordItem): DataLineageItem {
    const nodes: LineageNode[] = [];
    const edges: LineageEdge[] = [];

    // 1. Source Node
    const sourceNodeId = `src-${record.sourceModule.toLowerCase()}`;
    nodes.push({
      id: sourceNodeId,
      label: `${record.sourceModule} Subsystem`,
      category: 'SOURCE',
      module: record.sourceModule,
      description: `Originating authoritative transactional system (Entity ID: ${record.sourceEntityId})`,
    });

    // 2. Master Record Node (Center)
    const masterNodeId = `mdm-${record.canonicalId}`;
    nodes.push({
      id: masterNodeId,
      label: `MDM Canonical: ${record.canonicalId}`,
      category: 'MASTER',
      module: 'MDM_REGISTRY',
      description: `${record.primaryName} [v${record.version}] (${record.qualityScore}% Quality)`,
      details: {
        canonicalId: record.canonicalId,
        status: record.status,
        qualityScore: record.qualityScore,
      },
    });

    edges.push({
      id: `edge-${sourceNodeId}-${masterNodeId}`,
      from: sourceNodeId,
      to: masterNodeId,
      relationship: 'INGESTED_AND_STANDARDIZED',
      flowDirection: 'FORWARD',
      activeVolume: 'Continuous Sync',
    });

    // 3. Consuming Modules & Transactions
    const consumingModules: string[] = [];
    const transactionEntities: DataLineageItem['transactionEntities'] = [];

    switch (record.domainCode) {
      case 'VENDORS':
        consumingModules.push('PROCUREMENT', 'FINANCE', 'PROJECTS', 'CONTRACTS');
        transactionEntities.push(
          { module: 'PROCUREMENT', entityType: 'Purchase Orders', count: 18, lastActivity: '2 hours ago' },
          { module: 'FINANCE', entityType: 'Invoices & Vouchers', count: 42, lastActivity: '1 day ago' },
          { module: 'CONTRACTS', entityType: 'Subcontracts & SLAs', count: 3, lastActivity: '5 days ago' }
        );
        break;

      case 'EMPLOYEES':
        consumingModules.push('HRMS', 'PAYROLL', 'PROJECTS', 'HSE', 'QAQC');
        transactionEntities.push(
          { module: 'HRMS', entityType: 'Attendance & Leave Records', count: 240, lastActivity: 'Today' },
          { module: 'PAYROLL', entityType: 'Salary Slips & WPS Records', count: 12, lastActivity: '1 month ago' },
          { module: 'PROJECTS', entityType: 'Site Timesheets', count: 85, lastActivity: 'Yesterday' }
        );
        break;

      case 'MATERIALS':
        consumingModules.push('INVENTORY', 'PROCUREMENT', 'PROJECTS', 'FINANCE');
        transactionEntities.push(
          { module: 'INVENTORY', entityType: 'Stock Movements (GRN/MIN)', count: 96, lastActivity: '3 hours ago' },
          { module: 'PROCUREMENT', entityType: 'Material Requisitions', count: 14, lastActivity: 'Yesterday' }
        );
        break;

      case 'ASSETS':
      case 'EQUIPMENT':
      case 'FLEET_VEHICLES':
        consumingModules.push('EAM', 'FLEET', 'IOT', 'FINANCE');
        transactionEntities.push(
          { module: 'EAM', entityType: 'Work Orders & PM Schedules', count: 34, lastActivity: 'Today' },
          { module: 'IOT', entityType: 'Telemetry & Sensor Feeds', count: 12400, lastActivity: 'Live (Real-time)' }
        );
        break;

      default:
        consumingModules.push('OPERATIONS', 'FINANCE', 'ANALYTICS');
        transactionEntities.push({
          module: 'OPERATIONS',
          entityType: 'Transactional Logs',
          count: 50,
          lastActivity: 'Recent',
        });
        break;
    }

    // Add Consuming Module Nodes & Edges
    consumingModules.forEach((mod) => {
      const modNodeId = `mod-${mod.toLowerCase()}`;
      nodes.push({
        id: modNodeId,
        label: `${mod} Module`,
        category: 'CONSUMING_MODULE',
        module: mod,
        description: `Downstream consumer synchronized with canonical record`,
      });

      edges.push({
        id: `edge-${masterNodeId}-${modNodeId}`,
        from: masterNodeId,
        to: modNodeId,
        relationship: 'REPLICATED_REFERENCE',
        flowDirection: 'FORWARD',
        activeVolume: 'Real-time Event Stream',
      });
    });

    // 4. Reports Node
    const reportNodeId = `rep-bi-${record.domainCode.toLowerCase()}`;
    nodes.push({
      id: reportNodeId,
      label: `Executive BI & Finance Ledger Reports`,
      category: 'REPORT',
      module: 'ANALYTICS',
      description: `Cross-module analytical dashboards and compliance reports`,
    });

    consumingModules.slice(0, 2).forEach((mod) => {
      const modNodeId = `mod-${mod.toLowerCase()}`;
      edges.push({
        id: `edge-${modNodeId}-${reportNodeId}`,
        from: modNodeId,
        to: reportNodeId,
        relationship: 'AGGREGATED_INTO_REPORTS',
        flowDirection: 'FORWARD',
      });
    });

    // 5. AI Analytics Feeds Node
    const aiNodeId = `ai-agent-${record.domainCode.toLowerCase()}`;
    nodes.push({
      id: aiNodeId,
      label: `Phase 74/75 AI Gateway & Decision Feeds`,
      category: 'AI_ANALYTICS',
      module: 'AI_INTELLIGENCE',
      description: `Contextual embeddings and risk predictive models`,
    });

    edges.push({
      id: `edge-${reportNodeId}-${aiNodeId}`,
      from: reportNodeId,
      to: aiNodeId,
      relationship: 'TRAINED_AND_INDEXED',
      flowDirection: 'FORWARD',
    });

    return {
      id: `lin-${record.id}`,
      masterRecordId: record.id,
      canonicalId: record.canonicalId,
      domainCode: record.domainCode,
      sourceModule: record.sourceModule,
      sourceSystem: 'SiteSync ERP Core',
      consumingModules,
      transactionEntities,
      reportsDependent: [
        'Executive Operational Summary',
        'Commercial & Statutory Audit Trail',
        'Cost Variance & Ledger Reconciliation',
      ],
      aiAnalyticsFeeds: ['Phase 73 Risk Intelligence Sentinel', 'Phase 74 Multi-Model Gateway Copilot'],
      lineageGraph: {
        nodes,
        edges,
      },
      lastLineageMappedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export const dataLineageEngine = DataLineageEngine.getInstance();
