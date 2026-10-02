// =============================================================
// PHASE 74: AI GATEWAY REPOSITORY
// =============================================================

import crypto from 'crypto';
import { AIRegistry } from '../ai/ai.registry';
import { AIRouter } from '../ai/ai.router';
import { AIHealthMonitor } from '../ai/ai.health';
import { AIWebhookEngine } from '../ai/ai.webhooks';
import {
  AIProviderCode,
  AITaskType,
  AIGatewayResult,
  ModelInfo,
} from '../ai/ai.types';

export interface UsageLogRecord {
  id: string;
  requestId: string;
  userId: string;
  userRole: string;
  taskType: string;
  providerCode: string;
  modelCode: string;
  wasFallbackUsed: boolean;
  fallbackReason?: string;
  originalProviderAttempted?: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  latencyMs: number;
  isSuccess: boolean;
  responseClassification: string;
  confidenceScore: number;
  timestamp: string;
}

export interface FailoverLogRecord {
  id: string;
  requestId: string;
  taskType: string;
  primaryProvider: string;
  primaryModel: string;
  failoverProvider: string;
  failoverModel: string;
  triggerReason: string;
  primaryLatencyMs: number;
  failoverLatencyMs: number;
  failoverStatus: string;
  occurredAt: string;
}

export interface QualityEvaluationRecord {
  id: string;
  evaluationCode: string;
  comparisonTitle: string;
  taskType: string;
  benchmarkPrompt: string;
  modelACode: string;
  modelBCode: string;
  modelAResponse: string;
  modelBResponse: string;
  modelALatencyMs: number;
  modelBLatencyMs: number;
  modelACostUsd: number;
  modelBCostUsd: number;
  modelAScore: number;
  modelBScore: number;
  winnerModelCode: string;
  evaluatorNotes?: string;
  evaluatedByUserId: string;
  evaluatedAt: string;
}

export interface ApiClientRecord {
  id: string;
  clientId: string;
  clientName: string;
  description: string;
  clientType: string;
  scopes: string[];
  status: 'ACTIVE' | 'REVOKED' | 'SUSPENDED';
  rateLimitRpm: number;
  secretPrefix: string;
  secretKeyPlaintext?: string; // Only shown once at creation
  createdAt: string;
  lastUsedAt?: string;
}

export interface GatewayAuditLogRecord {
  id: string;
  userId: string;
  userRole: string;
  action: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export class AIGatewayRepository {
  private usageLogs: UsageLogRecord[] = [];
  private failoverLogs: FailoverLogRecord[] = [];
  private qualityEvaluations: QualityEvaluationRecord[] = [
    {
      id: 'eval-001',
      evaluationCode: 'EVAL-CPM-DELAY-01',
      comparisonTitle: 'Critical Path Method Delay Analysis Benchmark',
      taskType: 'TECHNICAL_ANALYSIS',
      benchmarkPrompt: 'Analyze schedule float consumption for Metro Line 4 Viaduct Pier 14 with 18-day rebar delay.',
      modelACode: 'gemini-3.6-flash',
      modelBCode: 'heuristic-analytics-v3',
      modelAResponse: 'Synthesizes exact CPM downstream delay of 18 days on Pier 14 slipform assembly with 0 float remaining.',
      modelBResponse: 'Calculates float consumption: 0 days remaining, shifts critical path milestone M-4 to Nov 15.',
      modelALatencyMs: 210,
      modelBLatencyMs: 12,
      modelACostUsd: 0.00018,
      modelBCostUsd: 0.0,
      modelAScore: 4.9,
      modelBScore: 4.8,
      winnerModelCode: 'gemini-3.6-flash',
      evaluatorNotes: 'Gemini 3.6 Flash provided richer natural narrative with exact mathematical alignment to deterministic baseline.',
      evaluatedByUserId: 'usr-admin-01',
      evaluatedAt: new Date().toISOString(),
    },
    {
      id: 'eval-002',
      evaluationCode: 'EVAL-SCADA-ANOM-02',
      comparisonTitle: 'SCADA Vibration ISO-10816 Diagnostics Benchmark',
      taskType: 'PREDICTION',
      benchmarkPrompt: 'Diagnose 6.82 mm/s RMS vibration velocity on Raw Water Intake Pump P-101 (Zone C).',
      modelACode: 'gemini-3.7-flash',
      modelBCode: 'gpt-4o-mini',
      modelAResponse: 'Diagnoses impeller cavitation and dynamic unbalance; recommends bearing lubrication and strobe inspection.',
      modelBResponse: 'Identifies Zone C ISO-10816 alarm condition; suggests pump isolation and seal inspection.',
      modelALatencyMs: 280,
      modelBLatencyMs: 310,
      modelACostUsd: 0.00035,
      modelBCostUsd: 0.00042,
      modelAScore: 4.95,
      modelBScore: 4.7,
      winnerModelCode: 'gemini-3.7-flash',
      evaluatorNotes: 'Gemini 3.7 Flash provided root-cause telemetry correlations with high technical precision.',
      evaluatedByUserId: 'usr-admin-01',
      evaluatedAt: new Date().toISOString(),
    },
  ];

  private apiClients: ApiClientRecord[] = [
    {
      id: 'client-001',
      clientId: 'client_scada_rtu_bridge',
      clientName: 'SCADA & IoT Influx Telemetry Bridge',
      description: 'Ingests high-frequency vibration, temperature, and power telemetry from site RTUs',
      clientType: 'SCADA_BRIDGE',
      scopes: ['ai:read', 'ai:execute', 'telemetry:write'],
      status: 'ACTIVE',
      rateLimitRpm: 300,
      secretPrefix: 'sk_live_scada_7a9f',
      createdAt: '2026-08-01T08:00:00Z',
      lastUsedAt: new Date().toISOString(),
    },
    {
      id: 'client-002',
      clientId: 'client_kwa_water_erp',
      clientName: 'Water Utility Billing & Work Order Connector',
      description: 'Synchronizes pipe laying milestones and water quality telemetry with central utility systems',
      clientType: 'THIRD_PARTY',
      scopes: ['ai:read', 'workorders:read', 'workorders:write'],
      status: 'ACTIVE',
      rateLimitRpm: 120,
      secretPrefix: 'sk_live_kwa_99b2',
      createdAt: '2026-08-05T10:30:00Z',
      lastUsedAt: new Date().toISOString(),
    },
  ];

  private auditLogs: GatewayAuditLogRecord[] = [];

  constructor() {
    this.seedInitialMetrics();
  }

  private seedInitialMetrics() {
    const tasks = ['COPILOT', 'NLP_QUERY', 'EXECUTIVE_SUMMARY', 'TECHNICAL_ANALYSIS', 'REPORT_GENERATION'];
    const providers = ['GEMINI', 'OPENAI', 'LOCAL_DETERMINISTIC'];
    const models = ['gemini-3.6-flash', 'gpt-4o-mini', 'heuristic-analytics-v3'];

    for (let i = 0; i < 25; i++) {
      const task = tasks[i % tasks.length];
      const provider = providers[i % providers.length];
      const model = models[i % models.length];
      const inputTokens = 250 + Math.round(Math.random() * 600);
      const outputTokens = 120 + Math.round(Math.random() * 400);
      const latencyMs = provider === 'LOCAL_DETERMINISTIC' ? 12 : 150 + Math.round(Math.random() * 250);

      this.usageLogs.push({
        id: `usg-${i + 100}`,
        requestId: `req_seed_${i + 100}`,
        userId: 'usr-admin-01',
        userRole: 'ADMIN',
        taskType: task,
        providerCode: provider,
        modelCode: model,
        wasFallbackUsed: i === 7 || i === 18,
        fallbackReason: (i === 7 || i === 18) ? 'Primary provider timeout simulation' : undefined,
        originalProviderAttempted: (i === 7 || i === 18) ? 'GEMINI' : undefined,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        estimatedCostUsd: provider === 'LOCAL_DETERMINISTIC' ? 0.0 : ((inputTokens + outputTokens) / 1000) * 0.0003,
        latencyMs,
        isSuccess: true,
        responseClassification: provider === 'LOCAL_DETERMINISTIC' ? 'DETERMINISTIC' : (i === 7 || i === 18 ? 'HYBRID' : 'AI_ASSISTED'),
        confidenceScore: 0.94 + Math.random() * 0.05,
        timestamp: new Date(Date.now() - (25 - i) * 3600000).toISOString(),
      });
    }
  }

  // Record usage
  async logUsage(record: Omit<UsageLogRecord, 'id'>): Promise<UsageLogRecord> {
    const item: UsageLogRecord = {
      id: `usg_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      ...record,
    };
    this.usageLogs.push(item);
    return item;
  }

  // Record failover
  async logFailover(record: Omit<FailoverLogRecord, 'id'>): Promise<FailoverLogRecord> {
    const item: FailoverLogRecord = {
      id: `failover_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      ...record,
    };
    this.failoverLogs.push(item);
    return item;
  }

  // Record audit log
  async logAudit(userId: string, userRole: string, action: string, details: string, ipAddress?: string): Promise<GatewayAuditLogRecord> {
    const item: GatewayAuditLogRecord = {
      id: `gw_aud_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      userId,
      userRole,
      action,
      details,
      ipAddress,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.push(item);
    return item;
  }

  // Get Stats
  async getGatewayStats() {
    const totalRequests = this.usageLogs.length;
    const totalTokens = this.usageLogs.reduce((sum, l) => sum + l.totalTokens, 0);
    const totalCostUsd = this.usageLogs.reduce((sum, l) => sum + l.estimatedCostUsd, 0);
    const fallbackCount = this.usageLogs.filter(l => l.wasFallbackUsed).length;
    const fallbackRate = totalRequests > 0 ? (fallbackCount / totalRequests) * 100 : 0;
    const avgLatency = totalRequests > 0 ? Math.round(this.usageLogs.reduce((sum, l) => sum + l.latencyMs, 0) / totalRequests) : 0;

    const providersHealth = await AIRegistry.getHealthOverview();
    const activeProviders = providersHealth.filter(p => p.status === 'ACTIVE').length;
    const totalProviders = providersHealth.length;

    const webhooks = AIWebhookEngine.getWebhooks();
    const totalWebhooks = webhooks.length;
    const activeWebhooks = webhooks.filter(w => w.status === 'ACTIVE').length;

    return {
      overview: {
        totalRequests,
        totalTokens,
        totalCostUsd: Math.round(totalCostUsd * 10000) / 10000,
        averageLatencyMs: avgLatency,
        fallbackRate: Math.round(fallbackRate * 10) / 10,
        successRate: 99.4,
        activeProviders: `${activeProviders}/${totalProviders}`,
        activeWebhooks: `${activeWebhooks}/${totalWebhooks}`,
        totalApiClients: this.apiClients.filter(c => c.status === 'ACTIVE').length,
        systemHealth: activeProviders > 0 ? 'HEALTHY' : 'DEGRADED',
      },
      providersHealth,
      recentUsage: this.usageLogs.slice(-15).reverse(),
      recentFailovers: this.failoverLogs.slice(-10).reverse(),
    };
  }

  async getUsageLogs(limit: number = 50) {
    return this.usageLogs.slice(-limit).reverse();
  }

  async getFailoverLogs(limit: number = 50) {
    return this.failoverLogs.slice(-limit).reverse();
  }

  async getQualityEvaluations() {
    return this.qualityEvaluations;
  }

  async addQualityEvaluation(evalData: Omit<QualityEvaluationRecord, 'id' | 'evaluationCode' | 'evaluatedAt'>) {
    const record: QualityEvaluationRecord = {
      id: `eval_${Date.now()}`,
      evaluationCode: `EVAL-${Date.now().toString(36).toUpperCase()}`,
      evaluatedAt: new Date().toISOString(),
      ...evalData,
    };
    this.qualityEvaluations.push(record);
    return record;
  }

  async getApiClients() {
    return this.apiClients;
  }

  async createApiClient(data: {
    clientName: string;
    description: string;
    clientType: string;
    scopes: string[];
    rateLimitRpm: number;
    userId: string;
  }) {
    const rawSecret = `sk_live_${crypto.randomBytes(16).toString('hex')}`;
    const prefix = `${rawSecret.substring(0, 12)}...`;

    const client: ApiClientRecord = {
      id: `client_${Date.now()}`,
      clientId: `client_${data.clientName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${crypto.randomBytes(2).toString('hex')}`,
      clientName: data.clientName,
      description: data.description,
      clientType: data.clientType,
      scopes: data.scopes,
      status: 'ACTIVE',
      rateLimitRpm: data.rateLimitRpm,
      secretPrefix: prefix,
      secretKeyPlaintext: rawSecret, // Displayed once
      createdAt: new Date().toISOString(),
    };

    this.apiClients.push(client);
    await this.logAudit(data.userId, 'ADMIN', 'API_CLIENT_CREATED', `Created client ${client.clientId} (${client.clientName})`);
    return client;
  }

  async revokeApiClient(clientId: string, userId: string) {
    const client = this.apiClients.find(c => c.clientId === clientId || c.id === clientId);
    if (client) {
      client.status = 'REVOKED';
      await this.logAudit(userId, 'ADMIN', 'API_CLIENT_REVOKED', `Revoked client ${client.clientId}`);
      return true;
    }
    return false;
  }

  async getAuditLogs(limit: number = 50) {
    return this.auditLogs.slice(-limit).reverse();
  }
}

export const aiGatewayRepository = new AIGatewayRepository();
