import { db } from '../../db';
import { logger } from '../utils/logger';

export interface AIProviderRecord {
  id: string;
  providerCode: string;
  providerName: string;
  providerType: string;
  endpointUrl?: string;
  apiVersion?: string;
  isActive: boolean;
  isDefault: boolean;
  capabilities: string[];
  rateLimitPerMinute: number;
  status: string;
  createdAt: string;
}

export interface AIModelRecord {
  id: string;
  providerId: string;
  modelCode: string;
  modelName: string;
  contextWindow: number;
  costPer1kTokens: number;
  latencyAverageMs: number;
  specialization: string;
  isActive: boolean;
  createdAt: string;
}

export interface AIAgentRecord {
  id: string;
  agentCode: string;
  agentName: string;
  description: string;
  systemPrompt: string;
  roleAccess: string[];
  temperature: number;
  maxTokens: number;
  isActive: boolean;
  createdAt: string;
}

export interface AIInsightRecord {
  id: string;
  insightCode: string;
  category: string;
  title: string;
  summary: string;
  detailedAnalysis: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  classification: 'DATA-DERIVED' | 'CALCULATED' | 'RULE-BASED' | 'AI-ASSISTED' | 'AI-PREDICTED';
  relatedProjectId?: string;
  relatedAssetName?: string;
  metrics: Record<string, any>;
  evidence: string[];
  confidence: number;
  isAcknowledged: boolean;
  createdAt: string;
}

export interface AIRecommendationRecord {
  id: string;
  recommendationCode: string;
  insightId?: string;
  category: string;
  title: string;
  actionText: string;
  targetModule: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  impactAssessment: string;
  evidenceData: Record<string, any>;
  confidenceBasis: string;
  status: 'PENDING_REVIEW' | 'ACCEPTED' | 'IMPLEMENTED' | 'DISMISSED' | 'REJECTED';
  actionedBy?: string;
  actionedAt?: string;
  actionNotes?: string;
  createdAt: string;
}

export interface AIPredictionRecord {
  id: string;
  predictionCode: string;
  predictionType: string;
  targetEntityId: string;
  targetEntityType: string;
  targetEntityName: string;
  predictedOutcome: string;
  predictedValue?: number;
  unitOfMeasure?: string;
  confidenceLevel: number;
  probabilityScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  contributingFactors: string[];
  forecastHorizonDays: number;
  classification: string;
  validationStatus: string;
  createdAt: string;
}

export interface AIAnomalyRecord {
  id: string;
  anomalyCode: string;
  sourceModule: string;
  entityId: string;
  entityName: string;
  parameterName: string;
  observedValue: number;
  expectedValue: number;
  deviationPercent: number;
  zScore: number;
  detectionMethod: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'CONFIRMED' | 'FALSE_POSITIVE' | 'RESOLVED';
  recommendedAction: string;
  timestamp: string;
  createdAt: string;
}

export interface AIRiskScoreRecord {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  compositeRiskScore: number;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  scheduleRiskScore: number;
  costRiskScore: number;
  procurementRiskScore: number;
  qualityRiskScore: number;
  hseRiskScore: number;
  equipmentRiskScore: number;
  cashFlowRiskScore: number;
  explainabilityFactors: string[];
  assessmentDate: string;
}

export interface AIScenarioResultRecord {
  id: string;
  scenarioId: string;
  title: string;
  projectId: string;
  projectName: string;
  simulationParameters: {
    procurementDelayDays: number;
    productivityShiftPct: number;
    equipmentDowntimeShiftPct: number;
    materialCostShiftPct: number;
    activitySlipDays: number;
  };
  scheduleImpactDays: number;
  costImpactAmount: number;
  costImpactPercentage: number;
  riskScoreShift: number;
  criticalPathImpact: string;
  cashFlowImpact: string;
  affectedModules: string[];
  deterministicBreakdown: Record<string, any>;
  aiExplanationText: string;
  mitigationRecommendations: string[];
  computedAt: string;
}

export interface AIReportRecord {
  id: string;
  reportCode: string;
  reportType: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  dataSources: string[];
  executiveSummary: string;
  keyFindings: string[];
  identifiedRisks: string[];
  recommendations: string[];
  fullReportMarkdown: string;
  disclaimer: string;
  generatedAt: string;
}

export interface AIAuditLogRecord {
  id: string;
  userId: string;
  userRole: string;
  action: string;
  promptSummary: string;
  dataSourcesAccessed: string[];
  aiModelUsed: string;
  responseStatus: string;
  executionDurationMs: number;
  timestamp: string;
}

class AIIntelligenceRepository {
  private providers: AIProviderRecord[] = [
    {
      id: 'prov-gemini-1',
      providerCode: 'GEMINI',
      providerName: 'Google Gemini AI Engine (DeepMind)',
      providerType: 'CLOUD_API',
      endpointUrl: 'https://generativelanguage.googleapis.com',
      apiVersion: 'v1beta',
      isActive: true,
      isDefault: true,
      capabilities: ['text', 'structured', 'vision', 'reasoning', 'predictive'],
      rateLimitPerMinute: 120,
      status: process.env.GEMINI_API_KEY ? 'HEALTHY' : 'FALLBACK',
      createdAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'prov-openai-2',
      providerCode: 'OPENAI_COMPATIBLE',
      providerName: 'OpenAI Compatible Gateway',
      providerType: 'CLOUD_API',
      endpointUrl: 'https://api.openai.com/v1',
      apiVersion: 'v1',
      isActive: false,
      isDefault: false,
      capabilities: ['text', 'structured', 'function_calling'],
      rateLimitPerMinute: 60,
      status: 'FALLBACK',
      createdAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'prov-rule-3',
      providerCode: 'LOCAL_RULE_ENGINE',
      providerName: 'Deterministic Statistical & Rule-Based Analytics Engine',
      providerType: 'LOCAL_HEURISTIC',
      endpointUrl: 'local://engine/heuristic',
      apiVersion: 'v3.2',
      isActive: true,
      isDefault: false,
      capabilities: ['statistical', 'z_score', 'cpi_spi_forecasting', 'deterministic_cpm', 'anomaly_scan'],
      rateLimitPerMinute: 10000,
      status: 'HEALTHY',
      createdAt: '2026-01-10T00:00:00Z',
    }
  ];

  private models: AIModelRecord[] = [
    {
      id: 'mod-gem-36',
      providerId: 'prov-gemini-1',
      modelCode: 'gemini-3.6-flash',
      modelName: 'Gemini 3.6 Flash (Low-Latency Enterprise)',
      contextWindow: 1000000,
      costPer1kTokens: 0.0001,
      latencyAverageMs: 140,
      specialization: 'GENERAL_ERP',
      isActive: true,
      createdAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'mod-heur-1',
      providerId: 'prov-rule-3',
      modelCode: 'heuristic-analytics-v3',
      modelName: 'Deterministic EVM & Z-Score Statistical Engine',
      contextWindow: 64000,
      costPer1kTokens: 0.0,
      latencyAverageMs: 15,
      specialization: 'PREDICTIVE_ANALYTICS',
      isActive: true,
      createdAt: '2026-01-10T00:00:00Z',
    }
  ];

  private agents: AIAgentRecord[] = [
    {
      id: 'agent-exec-1',
      agentCode: 'EXEC_COPILOT',
      agentName: 'Executive Strategy & Health Copilot',
      description: 'Senior enterprise advisor analyzing cross-module financials, delays, and critical project health.',
      systemPrompt: 'You are SiteSync Pro Executive AI Copilot. Provide concise, strategic executive-level insights backed by transactional data.',
      roleAccess: ['ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR', 'STORE_KEEPER'],
      temperature: 0.2,
      maxTokens: 3000,
      isActive: true,
      createdAt: '2026-01-15T00:00:00Z',
    },
    {
      id: 'agent-risk-2',
      agentCode: 'RISK_ANALYST',
      agentName: 'CPM Schedule & Delay Risk Specialist',
      description: 'Calculates float consumption, critical path exposure, and contractor milestone slips.',
      systemPrompt: 'You are a Senior Project Controls Engineer specializing in CPM schedule compression, Earned Value CPI/SPI, and delay analysis.',
      roleAccess: ['ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'],
      temperature: 0.15,
      maxTokens: 2500,
      isActive: true,
      createdAt: '2026-01-15T00:00:00Z',
    },
    {
      id: 'agent-scada-3',
      agentCode: 'SCADA_ANOMALY',
      agentName: 'IoT, SCADA & Plant Reliability Sentinel',
      description: 'Monitors raw sensor telemetry, ISO vibration velocities, pump cavitation, and electrical surges.',
      systemPrompt: 'You are an Industrial SCADA & Asset Reliability Sentinel analyzing industrial pump, motor, and WTP telemetry.',
      roleAccess: ['ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR', 'OPERATOR'],
      temperature: 0.1,
      maxTokens: 2000,
      isActive: true,
      createdAt: '2026-01-15T00:00:00Z',
    }
  ];

  private insights: AIInsightRecord[] = [
    {
      id: 'ins-001',
      insightCode: 'INS-CROSS-SCADA-EAM-01',
      category: 'EAM_SCADA_CORRELATION',
      title: 'Cavitation & High Vibration Warning on Peruvannamuzhi Inlet Pump P-101',
      summary: 'SCADA telemetry detected 6.82 mm/s vibration (ISO Zone C) correlated with 22% higher energy consumption (142 kW vs 116 kW benchmark).',
      detailedAnalysis: 'Vibration frequency analysis indicates impeller blade cavitation caused by upstream suction valve throttling. Over 48 hours, energy efficiency degraded by 18.4%. Continued operation in this state has an 82% likelihood of bearing seizure within 14 days.',
      severity: 'CRITICAL',
      classification: 'AI-PREDICTED',
      relatedProjectId: 'proj-kwa-wtp-001',
      relatedAssetName: 'Raw Water Intake Pump 01 (KWA-WTP-PUMP-01)',
      metrics: { vibrationMmS: 6.82, isoZone: 'C', energyDrawKW: 142, benchmarkKW: 116, efficiencyLossPct: 18.4 },
      evidence: [
        'Phase 72 Sensor Channel sns_vib_01 recorded 6.82 mm/s RMS (Threshold: 4.5 mm/s)',
        'Phase 72 Energy meter dev-6 recorded 142.4 kW instantaneous active power',
        'Phase 71 Asset AST-P71-1 maintenance log shows last impeller overhaul 340 operating hours ago'
      ],
      confidence: 0.94,
      isAcknowledged: false,
      createdAt: '2026-08-15T10:30:00Z',
    },
    {
      id: 'ins-002',
      insightCode: 'INS-SCHED-PROC-02',
      category: 'SCHEDULE_PROCUREMENT_RISK',
      title: 'High-Speed Rail Viaduct Pier 14 Rebar Delivery 18-Day Delay Threat',
      summary: 'PO-2026-089 (Fe500D TMT Rebar, 120 MT) delivery delayed by 18 days due to vendor mill downtime, directly threatening CPM Milestone M-4.',
      detailedAnalysis: 'Activity ACT-VIAD-P14 (Pier Cap Reinforcement) is on the zero-float Critical Path. Delaying rebar staging past August 28 will consume the entire buffer for Gantry Erection and incur estimated liquidated damages of $14,500/week.',
      severity: 'HIGH',
      classification: 'DATA-DERIVED',
      relatedProjectId: 'proj-hsr-002',
      metrics: { poNumber: 'PO-2026-089', delayedDays: 18, criticalFloatRemaining: 0, estimatedLdUSD: 29000 },
      evidence: [
        'Phase 69 Procurement PO-2026-089 tracking indicates revised dispatch date August 31',
        'Phase 64 Critical Path CPM schedule shows ACT-VIAD-P14 has float = 0 days',
        'Vendor VEND-003 delivery reliability score dropped to 71.4%'
      ],
      confidence: 0.96,
      isAcknowledged: false,
      createdAt: '2026-08-15T09:15:00Z',
    },
    {
      id: 'ins-003',
      insightCode: 'INS-COST-OVERRUN-03',
      category: 'COST_OVERRUN_RISK',
      title: 'Metro Line 4 Underground Tunneling Cost Variance Acceleration (CPI = 0.88)',
      summary: 'TBM muck disposal and grout chemical consumption exceeds BOQ item rates by 13.6%, projecting a $340,000 final cost overrun.',
      detailedAnalysis: 'Geotechnical soil variation at Ch: 14+200 encountered high water table siltstone, requiring 28% more bentonite slurry and secondary polymer grouting. Earned value analysis indicates EV = $1.82M against AC = $2.07M.',
      severity: 'HIGH',
      classification: 'CALCULATED',
      relatedProjectId: 'proj-metro-003',
      metrics: { cpi: 0.88, spi: 0.94, costVarianceUSD: -250000, projectedOverrunUSD: 340000 },
      evidence: [
        'Phase 64 Earned Value Analysis: Cumulative CPI = 0.88 (Target: >= 1.00)',
        'Phase 60 Finance General Ledger shows Grout Polymer expenditure at 118% of budget',
        'Phase 62 Material Inspection Reports show 14 additional slurry tankers billed'
      ],
      confidence: 0.91,
      isAcknowledged: true,
      createdAt: '2026-08-14T16:45:00Z',
    },
    {
      id: 'ins-004',
      insightCode: 'INS-QAQC-HOTSPOT-04',
      category: 'QAQC_RECURRING_DEFECT',
      title: 'Recurring Concrete Honeycombing at Cochin Desalination Outfall Structure',
      summary: '3 NCRs logged in 10 days for honeycombing and cover block displacement during slipform pour cycle.',
      detailedAnalysis: 'Root cause analysis correlates defect clusters with high ambient pour temperatures (>34°C) during night shift and insufficient needle vibrator staging. 14% of structural core tests flagged for re-grouting.',
      severity: 'MEDIUM',
      classification: 'RULE-BASED',
      relatedProjectId: 'proj-desal-004',
      metrics: { openNcrs: 3, affectedPours: 2, coreTestRetestPct: 14 },
      evidence: [
        'Phase 62 NCR-2026-041, NCR-2026-043, NCR-2026-048 in Outfall Chamber C-2',
        'Phase 63 HSE Weather Log shows ambient temperature 34.8°C at 21:00 hrs',
        'Phase 68 Mobile Inspection Photo audit shows congested 32mm rebar cage'
      ],
      confidence: 0.89,
      isAcknowledged: false,
      createdAt: '2026-08-14T11:20:00Z',
    },
    {
      id: 'ins-005',
      insightCode: 'INS-HSE-RISK-05',
      category: 'HSE_PREVENTIVE_WARNING',
      title: 'Scaffolding Tag Expiry and Working-at-Height Permit Risk at Viaduct Pier 9',
      summary: '2 scaffolding staging platforms at Elevation +24.5m have expired green inspection tags with 14 operatives on shift.',
      detailedAnalysis: 'High wind gusts (>38 km/h) forecasted for coastal corridor tomorrow morning. Working without daily scaffolding re-certification under high wind conditions elevates fall hazard severity to Maximum.',
      severity: 'CRITICAL',
      classification: 'AI-ASSISTED',
      relatedProjectId: 'proj-hsr-002',
      metrics: { workingElevationM: 24.5, windGustKmh: 38, operativesAtRisk: 14 },
      evidence: [
        'Phase 63 HSE Permit PTW-2026-114 scaffold inspection validity expired 18:00 yesterday',
        'Phase 68 Mobile GIS weather telemetry reports increasing gust velocity',
        'Phase 70 HRMS shift roster assigns 14 steel fixers to Pier 9 deck'
      ],
      confidence: 0.97,
      isAcknowledged: false,
      createdAt: '2026-08-15T08:00:00Z',
    }
  ];

  private recommendations: AIRecommendationRecord[] = [
    {
      id: 'rec-001',
      recommendationCode: 'REC-EAM-WO-01',
      insightId: 'ins-001',
      category: 'PREVENTIVE_MAINTENANCE',
      title: 'Issue Priority-1 Preventive Maintenance Work Order for Intake Pump P-101',
      actionText: 'Dispatch mechanical millwright to perform suction valve clearance check, bearing lubrication purge, and acoustic vibration re-check on Pump KWA-WTP-PUMP-01.',
      targetModule: 'EAM',
      priority: 'URGENT',
      impactAssessment: 'Prevents catastrophic impeller seizure and saves estimated $45,000 emergency replacement downtime.',
      evidenceData: { vibration: '6.82 mm/s', power: '142 kW', risk: 'Cavitation seizure' },
      confidenceBasis: 'SCADA ISO-10816 vibration trend + EAM component operating hours.',
      status: 'PENDING_REVIEW',
      createdAt: '2026-08-15T10:35:00Z',
    },
    {
      id: 'rec-002',
      recommendationCode: 'REC-PROC-EXP-02',
      insightId: 'ins-002',
      category: 'EXPEDITE_PROCUREMENT',
      title: 'Expedite Alternate Stock Rebar from Regional Warehouse (Buffer: 40 MT)',
      actionText: 'Transfer 40 MT of Fe500D 25mm rebar from Central Heavy Yard (Inv-CY-01) to Viaduct Pier 14 site to maintain zero-float Critical Path while Vendor VEND-003 clears delivery backlog.',
      targetModule: 'PROCUREMENT',
      priority: 'HIGH',
      impactAssessment: 'Protects milestone M-4 completion date and neutralizes $29,000 potential LD exposure.',
      evidenceData: { availableYardStockMT: 85, requiredTransferMT: 40, transferTransitHours: 6 },
      confidenceBasis: 'Inventory real-time balances + CPM zero float constraint.',
      status: 'PENDING_REVIEW',
      createdAt: '2026-08-15T09:20:00Z',
    },
    {
      id: 'rec-003',
      recommendationCode: 'REC-FIN-IPC-03',
      insightId: 'ins-003',
      category: 'CASHFLOW_ADJUSTMENT',
      title: 'Submit Interim Payment Certificate (IPC-14) Variation Claim for Geological Hard Rock',
      actionText: 'Compile geotechnical borehole logs and grout volume consumption logs into an IPC-14 Variation Claim to recover $210,000 unforeseen ground condition expenses.',
      targetModule: 'FINANCE',
      priority: 'HIGH',
      impactAssessment: 'Restores project cash buffer and improves Metro Line 4 CPI from 0.88 toward 0.95.',
      evidenceData: { claimableVarianceUSD: 210000, contractClause: 'FIDIC Cl. 4.12 Unforeseeable Physical Conditions' },
      confidenceBasis: 'Contract Cl. 4.12 eligibility + Verified material dispatch records.',
      status: 'ACCEPTED',
      actionedBy: 'Sarah Al-Mansoor (Project Manager)',
      actionedAt: '2026-08-14T17:30:00Z',
      actionNotes: 'QS Team instructed to assemble formal geotechnical documentation by Monday.',
      createdAt: '2026-08-14T16:50:00Z',
    },
    {
      id: 'rec-004',
      recommendationCode: 'REC-QAQC-ITP-04',
      insightId: 'ins-004',
      category: 'QAQC_AUDIT',
      title: 'Increase QA/QC Cover Block & Slump Inspection Frequency on Night Slipforms',
      actionText: 'Mandate pre-pour 100% cover block verification sign-off and concrete temperature limit test (<32°C) on all Kochi Outfall slipform pours.',
      targetModule: 'QAQC',
      priority: 'MEDIUM',
      impactAssessment: 'Eliminates repetitive honeycombing and avoids costly structural polymer injection repairs.',
      evidenceData: { defectReductionExpectedPct: 80, inspectionChecklist: 'ITP-CONC-SLIPFORM-V2' },
      confidenceBasis: 'Historical NCR recurrence pattern analysis.',
      status: 'PENDING_REVIEW',
      createdAt: '2026-08-14T11:25:00Z',
    },
    {
      id: 'rec-005',
      recommendationCode: 'REC-HSE-STOP-05',
      insightId: 'ins-005',
      category: 'HSE_INTERVENTION',
      title: 'Impose Immediate Stop-Work on Viaduct Pier 9 Scaffolding Until Re-Tagged',
      actionText: 'HSE Officer must inspect base jacks, ledger clamps, and toe-boards at Pier 9, issue Green Tag 2026-891, and brief workers before any high-elevation works commence.',
      targetModule: 'HSE',
      priority: 'URGENT',
      impactAssessment: 'Guarantees zero-fall incident compliance under high coastal wind advisory conditions.',
      evidenceData: { elevation: '24.5m', windGust: '38 km/h', permitStatus: 'EXPIRED' },
      confidenceBasis: 'Permit safety lifecycle rule-set + Coastal meteorological data.',
      status: 'IMPLEMENTED',
      actionedBy: 'Hassan Al-Saeed (Field Supervisor)',
      actionedAt: '2026-08-15T08:30:00Z',
      actionNotes: 'Scaffold re-certified and safety lines tethered at 08:30 hrs.',
      createdAt: '2026-08-15T08:05:00Z',
    }
  ];

  private predictions: AIPredictionRecord[] = [
    {
      id: 'pred-001',
      predictionCode: 'PRD-DEL-HSR-01',
      predictionType: 'SCHEDULE_DELAY',
      targetEntityId: 'proj-hsr-002',
      targetEntityType: 'PROJECT',
      targetEntityName: 'High-Speed Rail Viaduct Package 2',
      predictedOutcome: 'Projected completion delay of 14 days if Pier 14 rebar staging is not resolved within 72 hours.',
      predictedValue: 14,
      unitOfMeasure: 'DAYS',
      confidenceLevel: 0.91,
      probabilityScore: 0.78,
      riskLevel: 'HIGH',
      contributingFactors: [
        'Zero float on CPM Activity ACT-VIAD-P14',
        'Vendor VEND-003 delivery delay of 18 days',
        'High coastal wind forecasted delaying crane lifts'
      ],
      forecastHorizonDays: 45,
      classification: 'AI-PREDICTED',
      validationStatus: 'ACTIVE',
      createdAt: '2026-08-15T09:30:00Z',
    },
    {
      id: 'pred-002',
      predictionCode: 'PRD-COST-METRO-02',
      predictionType: 'COST_OVERRUN',
      targetEntityId: 'proj-metro-003',
      targetEntityType: 'PROJECT',
      targetEntityName: 'Metro Line 4 Underground Tunnel Package',
      predictedOutcome: 'Forecasted final cost at completion (EAC) will exceed authorized budget by $340,000 (3.8% variance).',
      predictedValue: 340000,
      unitOfMeasure: 'USD',
      confidenceLevel: 0.88,
      probabilityScore: 0.82,
      riskLevel: 'HIGH',
      contributingFactors: [
        'Cumulative CPI dropped to 0.88 over last 3 accounting periods',
        'Geotechnical siltstone stratum requiring 28% higher chemical grout consumption',
        'TBM cutter-head wear rate 1.4x higher than geotechnical baseline'
      ],
      forecastHorizonDays: 90,
      classification: 'AI-PREDICTED',
      validationStatus: 'ACTIVE',
      createdAt: '2026-08-14T17:00:00Z',
    },
    {
      id: 'pred-003',
      predictionCode: 'PRD-PUMP-RUL-03',
      predictionType: 'EQUIPMENT_FAILURE',
      targetEntityId: 'ast-p71-1',
      targetEntityType: 'ASSET',
      targetEntityName: 'Peruvannamuzhi Intake Pump 01',
      predictedOutcome: 'Remaining Useful Life (RUL) of drive-end bearing estimated at 240 operating hours (approx 12-14 days) under current vibration velocity.',
      predictedValue: 240,
      unitOfMeasure: 'HOURS',
      confidenceLevel: 0.93,
      probabilityScore: 0.85,
      riskLevel: 'CRITICAL',
      contributingFactors: [
        'Vibration RMS at 6.82 mm/s in ISO-10816 Zone C',
        'Bearing temperature elevated to 68.4°C (Normal: 45-52°C)',
        'Active power draw at 142.4 kW (18.4% above nameplate curve)'
      ],
      forecastHorizonDays: 14,
      classification: 'AI-PREDICTED',
      validationStatus: 'ACTIVE',
      createdAt: '2026-08-15T10:40:00Z',
    }
  ];

  private anomalies: AIAnomalyRecord[] = [
    {
      id: 'anom-001',
      anomalyCode: 'ANOM-SCADA-VIB-01',
      sourceModule: 'SCADA',
      entityId: 'sns_vib_01',
      entityName: 'Raw Water Intake Pump 01 Vibration Sensor',
      parameterName: 'Drive-End Vibration RMS (mm/s)',
      observedValue: 6.82,
      expectedValue: 3.20,
      deviationPercent: 113.1,
      zScore: 3.42,
      detectionMethod: 'STATISTICAL_ZSCORE',
      severity: 'CRITICAL',
      status: 'OPEN',
      recommendedAction: 'Inspect pump impeller for cavitation and check suction valve positioning.',
      timestamp: '2026-08-15T10:28:14Z',
      createdAt: '2026-08-15T10:30:00Z',
    },
    {
      id: 'anom-002',
      anomalyCode: 'ANOM-FIN-EXP-02',
      sourceModule: 'FINANCE',
      entityId: 'gl_chem_grout_01',
      entityName: 'General Ledger: Polymer Grout Expense',
      parameterName: 'Weekly Chemical Grout Cost (USD)',
      observedValue: 48200,
      expectedValue: 24000,
      deviationPercent: 100.8,
      zScore: 2.95,
      detectionMethod: 'MOVING_AVERAGE',
      severity: 'HIGH',
      status: 'INVESTIGATING',
      recommendedAction: 'Verify TBM slurry consumption logs and check IPC variation claim eligibility.',
      timestamp: '2026-08-14T18:00:00Z',
      createdAt: '2026-08-14T18:05:00Z',
    },
    {
      id: 'anom-003',
      anomalyCode: 'ANOM-HRMS-OT-03',
      sourceModule: 'HRMS',
      entityId: 'dept_metro_tbm_01',
      entityName: 'Metro Tunneling Mechanical Crew',
      parameterName: 'Weekly Overtime Hours (hrs/person)',
      observedValue: 28.5,
      expectedValue: 12.0,
      deviationPercent: 137.5,
      zScore: 3.12,
      detectionMethod: 'STATISTICAL_ZSCORE',
      severity: 'MEDIUM',
      status: 'CONFIRMED',
      recommendedAction: 'Review shift fatigue risk and mobilize relief mechanical crew from regional reserve.',
      timestamp: '2026-08-13T19:00:00Z',
      createdAt: '2026-08-13T19:10:00Z',
    },
    {
      id: 'anom-004',
      anomalyCode: 'ANOM-INV-STEEL-04',
      sourceModule: 'INVENTORY',
      entityId: 'item_rebar_32',
      entityName: 'Fe500D 32mm High-Yield Rebar Stock',
      parameterName: 'Daily Rebar Wastage Rate (%)',
      observedValue: 6.8,
      expectedValue: 2.5,
      deviationPercent: 172.0,
      zScore: 2.88,
      detectionMethod: 'TREND_DEVIATION',
      severity: 'MEDIUM',
      status: 'OPEN',
      recommendedAction: 'Audit bar bending schedule (BBS) cutting lists on Viaduct Pier 12.',
      timestamp: '2026-08-15T07:45:00Z',
      createdAt: '2026-08-15T07:50:00Z',
    }
  ];

  private riskScores: AIRiskScoreRecord[] = [
    {
      id: 'risk-001',
      projectId: 'proj-kwa-wtp-001',
      projectCode: 'KWA-WTP-100MLD',
      projectName: 'Peruvannamuzhi 100 MLD Water Treatment Plant',
      compositeRiskScore: 38.5,
      riskRating: 'MEDIUM',
      scheduleRiskScore: 32.0,
      costRiskScore: 28.0,
      procurementRiskScore: 35.0,
      qualityRiskScore: 22.0,
      hseRiskScore: 18.0,
      equipmentRiskScore: 78.0,
      cashFlowRiskScore: 30.0,
      explainabilityFactors: [
        'Elevated equipment risk (78/100) due to Inlet Pump 01 cavitation and bearing vibration (6.82 mm/s)',
        'Civil works progressing ahead of milestone curve (SPI = 1.04)',
        'HSE safety compliance rating is excellent (Zero lost-time injuries in 450,000 safe hours)'
      ],
      assessmentDate: '2026-08-15',
    },
    {
      id: 'risk-002',
      projectId: 'proj-hsr-002',
      projectCode: 'HSR-VIAD-PKG2',
      projectName: 'High-Speed Rail Viaduct Package 2',
      compositeRiskScore: 68.4,
      riskRating: 'HIGH',
      scheduleRiskScore: 78.0,
      costRiskScore: 48.0,
      procurementRiskScore: 82.0,
      qualityRiskScore: 42.0,
      hseRiskScore: 62.0,
      equipmentRiskScore: 44.0,
      cashFlowRiskScore: 54.0,
      explainabilityFactors: [
        'Critical procurement delay on TMT rebar PO-2026-089 impacting zero-float Pier 14 milestone',
        'HSE working-at-height permit compliance requires immediate scaffold re-certification',
        'Crane availability impacted by coastal wind gusts exceeding safe lifting threshold'
      ],
      assessmentDate: '2026-08-15',
    },
    {
      id: 'risk-003',
      projectId: 'proj-metro-003',
      projectCode: 'METRO-UG-L4',
      projectName: 'Metro Line 4 Underground Tunnel Package',
      compositeRiskScore: 72.8,
      riskRating: 'HIGH',
      scheduleRiskScore: 64.0,
      costRiskScore: 88.0,
      procurementRiskScore: 52.0,
      qualityRiskScore: 58.0,
      hseRiskScore: 46.0,
      equipmentRiskScore: 68.0,
      cashFlowRiskScore: 76.0,
      explainabilityFactors: [
        'High cost overrun exposure (CPI = 0.88) driven by unexpected geological siltstone and high chemical grout consumption',
        'TBM cutter-head wear accelerating maintenance interval downtime',
        'Variation claim IPC-14 pending client engineering approval'
      ],
      assessmentDate: '2026-08-15',
    },
    {
      id: 'risk-004',
      projectId: 'proj-desal-004',
      projectCode: 'COCHIN-DESAL-50',
      projectName: 'Cochin 50 MLD Seawater Desalination Facility',
      compositeRiskScore: 44.2,
      riskRating: 'MEDIUM',
      scheduleRiskScore: 42.0,
      costRiskScore: 36.0,
      procurementRiskScore: 48.0,
      qualityRiskScore: 65.0,
      hseRiskScore: 32.0,
      equipmentRiskScore: 38.0,
      cashFlowRiskScore: 40.0,
      explainabilityFactors: [
        'Quality risk elevated (65/100) due to 3 NCRs logged on concrete honeycombing in marine outfall structure',
        'Marine pipeline dredging works on track with hydrographic survey tolerances',
        'SWRO membrane module delivery confirmed for next month'
      ],
      assessmentDate: '2026-08-15',
    }
  ];

  private scenarios: AIScenarioResultRecord[] = [
    {
      id: 'scen-001',
      scenarioId: 'sim-001',
      title: 'Procurement Delay Simulation (+15 Days Rebar Delivery)',
      projectId: 'proj-hsr-002',
      projectName: 'High-Speed Rail Viaduct Package 2',
      simulationParameters: {
        procurementDelayDays: 15,
        productivityShiftPct: 0,
        equipmentDowntimeShiftPct: 0,
        materialCostShiftPct: 0,
        activitySlipDays: 0,
      },
      scheduleImpactDays: 12,
      costImpactAmount: 24500,
      costImpactPercentage: 1.4,
      riskScoreShift: 14.2,
      criticalPathImpact: 'Consumes all total float on Pier Cap 14 and delays Gantry Erection start by 12 days.',
      cashFlowImpact: 'Delays milestone billing IPC-08 by 1 billing cycle ($420,000 cash deferral).',
      affectedModules: ['PROCUREMENT', 'PROJECT_CONTROLS', 'FINANCE'],
      deterministicBreakdown: {
        floatConsumedDays: 8,
        liquidatedDamagesEstimated: 18000,
        idleLaborCostEstimated: 6500,
      },
      aiExplanationText: 'This what-if simulation demonstrates that a 15-day delay in primary rebar delivery pushes Pier Cap 14 past its total float window, cascading a 12-day net delay into viaduct gantry erection.',
      mitigationRecommendations: [
        'Deploy 40 MT buffer stock from Central Heavy Yard immediately',
        'Split fabrication into pre-tied cages to compress assembly time by 4 days upon delivery'
      ],
      computedAt: '2026-08-15T09:45:00Z',
    }
  ];

  private reports: AIReportRecord[] = [
    {
      id: 'rep-001',
      reportCode: 'REP-EXEC-DAILY-20260815',
      reportType: 'DAILY_PROJECT_BRIEF',
      title: 'Executive Daily Project AI Brief (All Sites)',
      periodStart: '2026-08-15',
      periodEnd: '2026-08-15',
      dataSources: ['Phase 64 Controls', 'Phase 60 Finance', 'Phase 71 EAM', 'Phase 72 SCADA', 'Phase 63 HSE'],
      executiveSummary: 'Enterprise operational health is rated at 82.4/100. Overall project schedule performance remains stable with an average SPI of 0.98. Key items requiring executive attention today are: 1) Cavitation & vibration on Intake Pump 01, 2) Critical rebar delivery tracking for HSR Viaduct Pier 14, and 3) Metro Line 4 tunneling grout cost variance review.',
      keyFindings: [
        'Peruvannamuzhi WTP: Civil works SPI = 1.04; Pump P-101 requires priority mechanical check (vibration 6.82 mm/s).',
        'HSR Viaduct: 0-day float on Pier 14 rebar staging; scaffolding green-tag re-certification completed at Pier 9.',
        'Metro Line 4: Cumulative CPI at 0.88; IPC-14 variation documentation in progress for unforeseen siltstone ground.',
        'Cochin Desalination: Quality audit implemented on outfall slipform pours to prevent concrete honeycombing.'
      ],
      identifiedRisks: [
        'HSR Viaduct Critical Path slip risk (78% probability without rebar stock buffer transfer).',
        'Pump P-101 bearing failure risk within 14 days under continuous uncorrected cavitation.'
      ],
      recommendations: [
        'Authorize 40 MT rebar yard transfer for HSR Viaduct Pier 14.',
        'Approve Work Order WO-2026-0189 for intake pump suction clearance inspection.',
        'Review Metro Line 4 geological variation documentation prior to IPC submission.'
      ],
      fullReportMarkdown: `# Executive Daily AI Intelligence Brief\n**Date:** August 15, 2026\n**Enterprise Health Score:** 82.4 / 100\n\n## 1. Executive Summary\nAll four primary mega projects remain operational with active telemetry streaming. Composite risk ratings show 2 Medium and 2 High risk projects.\n\n## 2. Key Action Items for Management\n1. **High-Speed Rail Viaduct**: Expedite buffer rebar transfer.\n2. **Water Treatment Plant**: Execute preventative maintenance on Pump P-101.\n3. **Metro Line 4**: Finalize ground condition variation claim under Cl. 4.12.\n\n*Disclaimer: AI-Assisted Executive Brief synthesized from verified SiteSync Pro transaction data.*`,
      disclaimer: 'AI-Assisted Executive Brief synthesized from verified SiteSync Pro transaction data. Decisions should incorporate engineering review.',
      generatedAt: '2026-08-15T11:00:00Z',
    }
  ];

  private auditLogs: AIAuditLogRecord[] = [];
  private feedbackList: any[] = [];
  private conversations: Map<string, any[]> = new Map();

  // Getters
  async getProviders() {
    return this.providers;
  }

  async getModels() {
    return this.models;
  }

  async getAgents() {
    return this.agents;
  }

  async getInsights(category?: string, severity?: string) {
    let list = [...this.insights];
    if (category) list = list.filter(i => i.category === category);
    if (severity) list = list.filter(i => i.severity === severity);
    return list;
  }

  async acknowledgeInsight(id: string, user: string) {
    const item = this.insights.find(i => i.id === id);
    if (item) {
      item.isAcknowledged = true;
      return item;
    }
    return null;
  }

  async getRecommendations(status?: string, priority?: string) {
    let list = [...this.recommendations];
    if (status) list = list.filter(r => r.status === status);
    if (priority) list = list.filter(r => r.priority === priority);
    return list;
  }

  async updateRecommendationStatus(id: string, status: any, actionNotes?: string, actionedBy?: string) {
    const item = this.recommendations.find(r => r.id === id);
    if (item) {
      item.status = status;
      item.actionNotes = actionNotes;
      item.actionedBy = actionedBy || 'System User';
      item.actionedAt = new Date().toISOString();
      return item;
    }
    return null;
  }

  async getPredictions(targetEntityType?: string, riskLevel?: string) {
    let list = [...this.predictions];
    if (targetEntityType) list = list.filter(p => p.targetEntityType === targetEntityType);
    if (riskLevel) list = list.filter(p => p.riskLevel === riskLevel);
    return list;
  }

  async getAnomalies(sourceModule?: string, severity?: string, status?: string) {
    let list = [...this.anomalies];
    if (sourceModule) list = list.filter(a => a.sourceModule === sourceModule);
    if (severity) list = list.filter(a => a.severity === severity);
    if (status) list = list.filter(a => a.status === status);
    return list;
  }

  async updateAnomalyStatus(id: string, status: any, resolutionNotes?: string, investigatedBy?: string) {
    const item = this.anomalies.find(a => a.id === id);
    if (item) {
      item.status = status;
      return item;
    }
    return null;
  }

  async getRiskScores() {
    return this.riskScores;
  }

  async getScenarios() {
    return this.scenarios;
  }

  async addScenarioResult(scenario: AIScenarioResultRecord) {
    this.scenarios.unshift(scenario);
    return scenario;
  }

  async getReports(reportType?: string) {
    let list = [...this.reports];
    if (reportType) list = list.filter(r => r.reportType === reportType);
    return list;
  }

  async addReport(report: AIReportRecord) {
    this.reports.unshift(report);
    return report;
  }

  async addFeedback(feedback: any) {
    this.feedbackList.push(feedback);
    return feedback;
  }

  async getFeedback() {
    return this.feedbackList;
  }

  async logAudit(log: AIAuditLogRecord) {
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
  }

  async getAuditLogs(limit = 50) {
    return this.auditLogs.slice(0, limit);
  }

  async saveConversationMessage(conversationId: string, message: any) {
    const msgs = this.conversations.get(conversationId) || [];
    msgs.push(message);
    this.conversations.set(conversationId, msgs);
    return message;
  }

  async getConversationMessages(conversationId: string) {
    return this.conversations.get(conversationId) || [];
  }

  // Cross-Module Live KPI Aggregations for Executive Command Center
  async getEnterpriseStats(userRole: string) {
    const avgRisk = Math.round(this.riskScores.reduce((acc, curr) => acc + curr.compositeRiskScore, 0) / (this.riskScores.length || 1));
    const enterpriseHealth = Math.max(10, Math.min(100, 100 - (avgRisk * 0.45)));

    const activeAnomaliesCount = this.anomalies.filter(a => a.status === 'OPEN' || a.status === 'INVESTIGATING').length;
    const pendingRecommendationsCount = this.recommendations.filter(r => r.status === 'PENDING_REVIEW').length;
    const criticalAlertsCount = this.insights.filter(i => i.severity === 'CRITICAL' && !i.isAcknowledged).length;

    return {
      enterpriseHealthScore: Number(enterpriseHealth.toFixed(1)),
      overallRiskScore: avgRisk,
      projectRisk: 52.4,
      scheduleRisk: 58.0,
      costRisk: 51.5,
      procurementRisk: 54.2,
      vendorRisk: 41.0,
      equipmentRisk: 57.0,
      hseRisk: 39.5,
      qualityRisk: 46.8,
      cashFlowRisk: 50.0,
      iotScadaRisk: 48.2,
      totalInsights: this.insights.length,
      criticalInsightsCount: criticalAlertsCount,
      pendingRecommendationsCount,
      activeAnomaliesCount,
      activePredictionsCount: this.predictions.length,
      aiProviderStatus: process.env.GEMINI_API_KEY ? 'LIVE_GEMINI_ACTIVE' : 'DETERMINISTIC_HEURISTIC_ACTIVE',
      availableDataSources: [
        'Phase 64 Project Controls (CPM, EVM, Schedule)',
        'Phase 60 Finance & Accounts (GL, AP/AR, IPC)',
        'Phase 69 Procurement & Contracts (PO, 3-Way Match)',
        'Phase 71 EAM & Plant Maintenance (Assets, MTBF, WO)',
        'Phase 72 IoT & SCADA Telemetry (Sensors, Alarms, RTU)',
        'Phase 63 HSE Safety Management (PTW, Hazards)',
        'Phase 62 QA/QC Quality (ITP, NCRs, Inspections)',
        'Phase 70 HRMS & Payroll (Attendance, Shifts)',
        'Phase 59 Fleet & Logistics',
        'Phase 61 EDMS Documents'
      ]
    };
  }
}

export const aiIntelligenceRepository = new AIIntelligenceRepository();
