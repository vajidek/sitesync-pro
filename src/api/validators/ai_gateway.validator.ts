// =============================================================
// PHASE 74: AI GATEWAY & INTEGRATION VALIDATORS (ZOD)
// =============================================================

import { z } from 'zod';

export const aiProviderCodeEnum = z.enum([
  'GEMINI',
  'OPENAI',
  'ANTHROPIC',
  'LOCAL_DETERMINISTIC',
  'CUSTOM_ENDPOINT',
]);

export const aiTaskTypeEnum = z.enum([
  'COPILOT',
  'NLP_QUERY',
  'EXECUTIVE_SUMMARY',
  'REPORT_GENERATION',
  'INSIGHT_EXPLANATION',
  'RECOMMENDATION_EXPLANATION',
  'DOCUMENT_SUMMARY',
  'TECHNICAL_ANALYSIS',
  'GENERAL_REASONING',
  'CLASSIFICATION',
  'EXTRACTION',
  'PREDICTION',
]);

export const dataClassificationEnum = z.enum([
  'PUBLIC',
  'INTERNAL',
  'CONFIDENTIAL',
  'RESTRICTED',
]);

// Execution Request Validator
export const aiGatewayExecuteSchema = z.object({
  taskType: aiTaskTypeEnum.default('COPILOT'),
  prompt: z.string().min(1, 'Prompt cannot be empty').max(50000, 'Prompt too large'),
  schemaDescription: z.string().optional(),
  systemInstruction: z.string().optional(),
  preferredProvider: aiProviderCodeEnum.optional(),
  preferredModel: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().min(1).max(32768).optional(),
  dataClassification: dataClassificationEnum.default('INTERNAL'),
});

// Provider Config Validator
export const updateProviderConfigSchema = z.object({
  providerCode: aiProviderCodeEnum,
  providerName: z.string().min(1),
  status: z.enum(['ACTIVE', 'DEGRADED', 'OFFLINE', 'MAINTENANCE', 'DISABLED']),
  priority: z.number().int().min(1).max(10),
  rateLimitRpm: z.number().int().min(1),
  rateLimitTpm: z.number().int().min(1),
});

// Routing Policy Validator
export const updateRoutingPolicySchema = z.object({
  taskType: aiTaskTypeEnum,
  primaryProvider: aiProviderCodeEnum,
  primaryModel: z.string().min(1),
  fallbackProvider: aiProviderCodeEnum,
  fallbackModel: z.string().min(1),
  requiresDeterministic: z.boolean().default(true),
});

// API Client Creation Validator
export const createApiClientSchema = z.object({
  clientName: z.string().min(2).max(100),
  description: z.string().min(2).max(255),
  clientType: z.enum(['SERVICE_ACCOUNT', 'THIRD_PARTY', 'SCADA_BRIDGE', 'MOBILE_APP']).default('SERVICE_ACCOUNT'),
  scopes: z.array(z.string()).default(['ai:read', 'ai:execute']),
  rateLimitRpm: z.number().int().min(10).max(10000).default(120),
});

// Webhook Creation Validator
export const createWebhookSchema = z.object({
  name: z.string().min(2).max(100),
  targetUrl: z.string().url('Target URL must be a valid HTTP/HTTPS URL'),
  subscribedEvents: z.array(z.string()).min(1, 'Must subscribe to at least one event'),
  secretKey: z.string().optional(),
});

// Quality Evaluation Validator
export const submitEvaluationSchema = z.object({
  comparisonTitle: z.string().min(2),
  taskType: aiTaskTypeEnum,
  benchmarkPrompt: z.string().min(5),
  modelACode: z.string().min(1),
  modelBCode: z.string().min(1),
  modelAScore: z.number().min(1).max(5),
  modelBScore: z.number().min(1).max(5),
  winnerModelCode: z.string().min(1),
  evaluatorNotes: z.string().optional(),
});

// Failover Simulation Validator
export const simulateFailoverSchema = z.object({
  providerToFail: aiProviderCodeEnum,
  taskType: aiTaskTypeEnum.default('COPILOT'),
  testPrompt: z.string().default('Give me an executive summary of current critical path risk.'),
});
