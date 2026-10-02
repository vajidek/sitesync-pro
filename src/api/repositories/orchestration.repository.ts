// ============================================================================
// PHASE 75: ENTERPRISE ERP ORCHESTRATION - REPOSITORY
// ============================================================================

import {
  EnterpriseActionItem,
  CorrelatedAlertItem,
  ProjectHealthScorecard,
  DomainEventRecord,
  IntegrationModuleHealth,
  ActionStatus,
} from '../orchestration/orchestration.types';
import { OrchestrationEngine } from '../orchestration/orchestration.engine';
import { OrchestrationRulesEngine } from '../orchestration/orchestration.rules';

export class OrchestrationRepository {
  private static instance: OrchestrationRepository;

  private actionsStore: EnterpriseActionItem[] = [];
  private alertsStore: CorrelatedAlertItem[] = [];
  private projectHealthStore: Map<string, ProjectHealthScorecard> = new Map();

  private constructor() {
    this.seedInitialData();
  }

  public static getInstance(): OrchestrationRepository {
    if (!OrchestrationRepository.instance) {
      OrchestrationRepository.instance = new OrchestrationRepository();
    }
    return OrchestrationRepository.instance;
  }

  private seedInitialData() {
    // 1. Seed Initial Enterprise Actions
    this.actionsStore = [
      {
        id: 'act-001',
        actionNumber: 'ACT-2026-001',
        title: 'Review 1200mm Flange Delivery Delay & Expedite Alternate Supplier',
        description: 'Vendor delay on PO-2026-889 impacts WBS-3.2 on Critical Path. Immediate supplier expedite or Dubai warehouse stock transfer required.',
        actionType: 'ESCALATION',
        priority: 'CRITICAL',
        status: 'OPEN',
        sourceModule: 'PROCUREMENT',
        targetModule: 'PROJECT_CONTROLS',
        projectId: 'PRJ-101',
        entityType: 'PURCHASE_ORDER',
        entityId: 'PO-2026-889',
        correlatedAlertId: 'alert-corr-002',
        assignedToUserId: 'usr-proc-01',
        assignedToRole: 'PROCUREMENT_MANAGER',
        assignedToName: 'Khalid Mansoor',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        actionButtons: [
          { id: 'btn-1', label: 'Authorize Stock Transfer', action: 'STOCK_TRANSFER', variant: 'primary', targetTab: 'inventory' },
          { id: 'btn-2', label: 'View PO in Procurement', action: 'VIEW_PO', variant: 'outline', targetTab: 'procurement' },
        ],
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        createdBy: 'Orchestration Engine',
      },
      {
        id: 'act-002',
        actionNumber: 'ACT-2026-002',
        title: 'Inspect PLC-DMA-04 Pump A Radial Bearing Vibration Anomaly',
        description: 'SCADA alarm triggered 11.8 mm/s RMS vibration warning on primary booster station. High risk of mechanical seal failure.',
        actionType: 'TASK',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        sourceModule: 'SCADA',
        targetModule: 'EAM',
        projectId: 'PRJ-101',
        entityType: 'SCADA_DEVICE',
        entityId: 'PLC-DMA-04-PUMP-A',
        correlatedAlertId: 'alert-corr-001',
        assignedToUserId: 'usr-eam-02',
        assignedToRole: 'MAINTENANCE_LEAD',
        assignedToName: 'Suresh Menon',
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        actionButtons: [
          { id: 'btn-3', label: 'Create Work Order', action: 'CREATE_WO', variant: 'primary', targetTab: 'eam' },
          { id: 'btn-4', label: 'Inspect SCADA Live', action: 'VIEW_SCADA', variant: 'secondary', targetTab: 'iot' },
        ],
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        createdBy: 'Orchestration Engine',
      },
      {
        id: 'act-003',
        actionNumber: 'ACT-2026-003',
        title: 'Close Out Weld Root Porosity NCR-2026-042 on Section 4',
        description: 'Consultant hold-point rejected due to overdue corrective action report. Re-radiography required prior to pressure test authorization.',
        actionType: 'APPROVAL',
        priority: 'HIGH',
        status: 'PENDING_APPROVAL',
        sourceModule: 'QAQC',
        targetModule: 'PROJECT_CONTROLS',
        projectId: 'PRJ-101',
        entityType: 'NON_CONFORMANCE_REPORT',
        entityId: 'NCR-2026-042',
        correlatedAlertId: 'alert-corr-003',
        assignedToUserId: 'usr-qa-01',
        assignedToRole: 'LEAD_QAQC_ENGINEER',
        assignedToName: 'Fatima Al-Nuaimi',
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        actionButtons: [
          { id: 'btn-5', label: 'Approve CAR & Close NCR', action: 'CLOSE_NCR', variant: 'primary', targetTab: 'qaqc' },
          { id: 'btn-6', label: 'Open Quality View', action: 'VIEW_QAQC', variant: 'outline', targetTab: 'qaqc' },
        ],
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        createdBy: 'Orchestration Engine',
      },
      {
        id: 'act-004',
        actionNumber: 'ACT-2026-004',
        title: 'Review Expired Confined Space Permit PTW-2026-118',
        description: 'Mandatory work stop active on Trench Section KM 14+200. Atmospheric gas test re-verification required for permit re-issuance.',
        actionType: 'ESCALATION',
        priority: 'CRITICAL',
        status: 'OPEN',
        sourceModule: 'HSE',
        targetModule: 'WORKFLOW',
        projectId: 'PRJ-102',
        entityType: 'SAFETY_PERMIT',
        entityId: 'PTW-2026-118',
        assignedToUserId: 'usr-hse-01',
        assignedToRole: 'HSE_DIRECTOR',
        assignedToName: 'Tariq Hassan',
        dueDate: new Date(Date.now() + 3600000 * 4).toISOString(),
        actionButtons: [
          { id: 'btn-7', label: 'Authorize Permit Renewal', action: 'RENEW_PERMIT', variant: 'primary', targetTab: 'hse' },
          { id: 'btn-8', label: 'Audit HSE Log', action: 'VIEW_HSE', variant: 'outline', targetTab: 'hse' },
        ],
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        createdBy: 'HSE Safety Sentinel',
      },
      {
        id: 'act-005',
        actionNumber: 'ACT-2026-005',
        title: 'Commercial Spend Variance Review: CC-MEP-SUBSTRUCTURE',
        description: 'Committed spend reached 98.75% of authorized budget ($1.185M / $1.200M). Delegation of authority approval required for subsequent requisitions.',
        actionType: 'APPROVAL',
        priority: 'HIGH',
        status: 'OPEN',
        sourceModule: 'FINANCE',
        targetModule: 'PROCUREMENT',
        projectId: 'PRJ-101',
        entityType: 'COST_CENTER',
        entityId: 'CC-MEP-SUBSTRUCTURE',
        assignedToUserId: 'usr-cfo-01',
        assignedToRole: 'CFO',
        assignedToName: 'Richard Vance',
        dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
        actionButtons: [
          { id: 'btn-9', label: 'Approve Budget Amendment', action: 'APPROVE_BUDGET', variant: 'primary', targetTab: 'finance' },
          { id: 'btn-10', label: 'Inspect Cost Center', action: 'VIEW_FINANCE', variant: 'outline', targetTab: 'finance' },
        ],
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        createdBy: 'Finance Spend Sentinel',
      },
    ];

    // 2. Generate Initial Correlated Alerts from initial events
    const initialEvents = OrchestrationEngine.getInstance().getEvents({ limit: 10 });
    this.alertsStore = OrchestrationRulesEngine.correlateEvents(initialEvents);

    // 3. Compute Initial Project Health Scorecards for portfolio
    const prj101 = OrchestrationRulesEngine.calculateProjectHealth({
      projectId: 'PRJ-101',
      projectName: 'Strategic Water Reservoir & Transmission Pipeline Phase 2',
      cpi: 0.94,
      spi: 0.88,
      delayedCriticalPosCount: 1,
      openCriticalNcrsCount: 1,
      hseIncidentsCount: 0,
      equipmentDowntimeHours: 4,
    });

    const prj102 = OrchestrationRulesEngine.calculateProjectHealth({
      projectId: 'PRJ-102',
      projectName: 'Al Dhafra District Cooling Plant & Piping Network',
      cpi: 1.02,
      spi: 0.96,
      delayedCriticalPosCount: 0,
      openCriticalNcrsCount: 0,
      hseIncidentsCount: 1, // expired permit
      equipmentDowntimeHours: 1,
    });

    const prj103 = OrchestrationRulesEngine.calculateProjectHealth({
      projectId: 'PRJ-103',
      projectName: 'Dubai Marina Substation MEP Infrastructure Upgrade',
      cpi: 0.99,
      spi: 1.01,
      delayedCriticalPosCount: 0,
      openCriticalNcrsCount: 0,
      hseIncidentsCount: 0,
      equipmentDowntimeHours: 0,
    });

    this.projectHealthStore.set('PRJ-101', prj101);
    this.projectHealthStore.set('PRJ-102', prj102);
    this.projectHealthStore.set('PRJ-103', prj103);
  }

  // --- Enterprise Actions Repository Operations ---

  public getActions(filter?: {
    status?: ActionStatus;
    priority?: string;
    projectId?: string;
    targetModule?: string;
    assignedToUserId?: string;
  }): EnterpriseActionItem[] {
    let list = [...this.actionsStore];
    if (filter?.status) list = list.filter((a) => a.status === filter.status);
    if (filter?.priority) list = list.filter((a) => a.priority === filter.priority);
    if (filter?.projectId) list = list.filter((a) => a.projectId === filter.projectId);
    if (filter?.targetModule) list = list.filter((a) => a.targetModule === filter.targetModule);
    if (filter?.assignedToUserId) list = list.filter((a) => a.assignedToUserId === filter.assignedToUserId);
    return list;
  }

  public getActionById(actionId: string): EnterpriseActionItem | undefined {
    return this.actionsStore.find((a) => a.id === actionId || a.actionNumber === actionId);
  }

  public createAction(item: Omit<EnterpriseActionItem, 'id' | 'actionNumber' | 'createdAt' | 'updatedAt'>): EnterpriseActionItem {
    const num = `ACT-2026-${String(this.actionsStore.length + 1).padStart(3, '0')}`;
    const newAction: EnterpriseActionItem = {
      ...item,
      id: `act-${Date.now().toString(36)}`,
      actionNumber: num,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.actionsStore.unshift(newAction);
    return newAction;
  }

  public updateActionStatus(
    actionId: string,
    status: ActionStatus,
    resolutionNotes?: string
  ): EnterpriseActionItem | null {
    const action = this.getActionById(actionId);
    if (!action) return null;
    action.status = status;
    if (resolutionNotes) action.resolutionNotes = resolutionNotes;
    if (status === 'RESOLVED' || status === 'CANCELLED') {
      action.completedAt = new Date().toISOString();
    }
    action.updatedAt = new Date().toISOString();
    return action;
  }

  public assignAction(
    actionId: string,
    assignedUserId: string,
    assignedRole: string,
    assignedName?: string
  ): EnterpriseActionItem | null {
    const action = this.getActionById(actionId);
    if (!action) return null;
    action.assignedToUserId = assignedUserId;
    action.assignedToRole = assignedRole;
    if (assignedName) action.assignedToName = assignedName;
    action.updatedAt = new Date().toISOString();
    return action;
  }

  // --- Correlated Alerts Repository Operations ---

  public getAlerts(filter?: { status?: string; severity?: string; projectId?: string }): CorrelatedAlertItem[] {
    let list = [...this.alertsStore];
    if (filter?.status) list = list.filter((a) => a.status === filter.status);
    if (filter?.severity) list = list.filter((a) => a.severity === filter.severity);
    if (filter?.projectId) list = list.filter((a) => a.projectId === filter.projectId);
    return list;
  }

  public getAlertById(alertId: string): CorrelatedAlertItem | undefined {
    return this.alertsStore.find((a) => a.id === alertId);
  }

  public acknowledgeAlert(alertId: string, userId: string): CorrelatedAlertItem | null {
    const alert = this.getAlertById(alertId);
    if (!alert) return null;
    alert.status = 'ACKNOWLEDGED';
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date().toISOString();
    alert.updatedAt = new Date().toISOString();
    return alert;
  }

  public resolveAlert(alertId: string, userId: string, summary: string): CorrelatedAlertItem | null {
    const alert = this.getAlertById(alertId);
    if (!alert) return null;
    alert.status = 'RESOLVED';
    alert.resolvedBy = userId;
    alert.resolvedAt = new Date().toISOString();
    alert.impactAssessment = `[RESOLVED] ${summary}`;
    alert.updatedAt = new Date().toISOString();
    return alert;
  }

  // --- Project Health Operations ---

  public getProjectHealthList(): ProjectHealthScorecard[] {
    return Array.from(this.projectHealthStore.values());
  }

  public getProjectHealth(projectId: string): ProjectHealthScorecard | undefined {
    return this.projectHealthStore.get(projectId);
  }

  public updateProjectHealth(scorecard: ProjectHealthScorecard) {
    this.projectHealthStore.set(scorecard.projectId, scorecard);
  }
}
