// ============================================================================
// PHASE 75: ENTERPRISE ERP ORCHESTRATION - TYPES & INTERFACES
// ============================================================================

export type SourceModule =
  | 'PROJECTS'
  | 'PROJECT_CONTROLS'
  | 'PROCUREMENT'
  | 'INVENTORY'
  | 'FINANCE'
  | 'EAM'
  | 'SCADA'
  | 'IOT'
  | 'QAQC'
  | 'HSE'
  | 'EDMS'
  | 'HRMS'
  | 'CRM'
  | 'MOBILE_GIS'
  | 'AI_INTELLIGENCE'
  | 'AI_GATEWAY'
  | 'WORKFLOW';

export type EventSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type DomainEventType =
  | 'PO_DELIVERY_DELAYED'
  | 'SCADA_PUMP_VIBRATION_ALERT'
  | 'NCR_REJECTED'
  | 'PERMIT_TO_WORK_EXPIRED'
  | 'MATERIAL_STOCKOUT_RISK'
  | 'PROJECT_SCHEDULE_SLIPPAGE'
  | 'BUDGET_OVERRUN_DETECTED'
  | 'PAYMENT_MILESTONE_TRIGGERED'
  | 'SAFETY_INCIDENT_REPORTED'
  | 'SENSOR_ANOMALY_RECORDED'
  | string;

export type EventProcessingStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PROCESSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'REPLAYED'
  | 'DEAD_LETTER';

export type ActionStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'PENDING_APPROVAL'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'ESCALATED';

export type ActionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'URGENT';

export type ProjectHealthStatus = 'GREEN' | 'AMBER' | 'RED' | 'CRITICAL';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type DomainEventPayload = any;

export interface DomainEventRecord {
  id: string;
  eventId?: string;
  eventType?: string;
  sourceModule?: SourceModule | any;
  entityType?: string;
  entityId?: string;
  projectId?: string;
  severity?: EventSeverity;
  payload?: any;
  metadata?: Record<string, any>;
  correlationId?: string;
  causationId?: string;
  idempotencyKey?: string;
  status?: EventProcessingStatus;
  processedAt?: string;
  updatedAt?: string;
  errorMessage?: string;
  timestamp?: string;
  createdAt?: string;
  retryCount?: number;
  maxRetries?: number;
  createdBy?: string;
  [key: string]: any;
}

export interface EventHandlerContext {
  event: DomainEventRecord;
  actor: string;
  correlationId?: string;
  sourceModule?: SourceModule;
  timestamp?: string;
}

export interface EventHandlerResult {
  success: boolean;
  handlerCode: string;
  summary: string;
  executionTimeMs: number;
  actionsCreated?: string[];
  alertsGenerated?: string[];
  error?: string;
}

export interface EventHandlerDefinition {
  code: string;
  name: string;
  eventType: string;
  targetModule: SourceModule;
  executionOrder: number;
  isAsync: boolean;
  timeoutMs: number;
  retryLimit: number;
  isEnabled: boolean;
  description: string;
  execute: (ctx: EventHandlerContext) => Promise<EventHandlerResult>;
}

export interface IntegrationModuleHealth {
  module?: SourceModule;
  moduleCode?: SourceModule;
  moduleName?: string;
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'CRITICAL';
  eventsInbound24h: number;
  eventsOutbound24h: number;
  failedEvents24h: number;
  avgProcessingLatencyMs: number;
  queueDepth?: number;
  lastEventTimestamp?: string;
  lastHealthCheck?: string;
  lastHeartbeat?: string;
}

export interface EnterpriseActionButton {
  id: string;
  label: string;
  action: string;
  variant: 'primary' | 'secondary' | 'outline' | 'destructive';
  targetTab?: string;
}

export interface EnterpriseActionItem {
  id: string;
  actionNumber: string;
  title: string;
  description: string;
  actionType: 'TASK' | 'ESCALATION' | 'APPROVAL' | 'REMEDIATION' | string;
  priority: ActionPriority;
  status: ActionStatus;
  sourceModule: SourceModule | string;
  targetModule: SourceModule | string;
  projectId?: string;
  entityType?: string;
  entityId?: string;
  correlatedAlertId?: string;
  assignedToUserId?: string;
  assignedToRole?: string;
  assignedToName?: string;
  dueDate?: string;
  actionButtons?: EnterpriseActionButton[];
  resolutionNotes?: string;
  resolvedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CorrelatedAlertItem {
  id: string;
  title: string;
  severity: EventSeverity;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  sourceModules: SourceModule[];
  impactAssessment: string;
  recommendedAction: string;
  correlatedEventIds: string[];
  relatedEntities?: Array<{ entityType: string; entityId: string; module: SourceModule }>;
  projectId?: string;
  detectedAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  updatedAt?: string;
}

export interface ProjectHealthScorecard {
  projectId: string;
  projectName: string;
  overallScore: number;
  overallStatus: ProjectHealthStatus;
  riskLevel: RiskLevel;
  dimensionScores: {
    schedule: number;
    cost: number;
    quality: number;
    safety: number;
    procurement: number;
  };
  keyRisks: string[];
  recentAlertsCount: number;
  lastEvaluatedAt: string;
}

export interface OperationsCommandCenterSummary {
  overview: {
    overallSystemHealth: number;
    activeProjectsCount: number;
    projectsAtRiskCount: number;
    activeCorrelatedAlerts: number;
    openActionItems: number;
    totalEvents24h?: number;
    failedEventsQueueDepth?: number;
    criticalScadaAlarms?: number;
    highRiskHsePermits?: number;
    [key: string]: any;
  };
  projectHealthRanking: ProjectHealthScorecard[];
  criticalCorrelatedAlerts: CorrelatedAlertItem[];
  urgentActionItems: EnterpriseActionItem[];
  recentDomainEvents?: DomainEventRecord[];
  integrationHealth?: IntegrationModuleHealth[];
  aiOperationsInsight: {
    classification: string;
    narrative: string;
    rootCauses: string[];
    recommendedPriorities: string[];
    generatedAt: string;
  };
}
