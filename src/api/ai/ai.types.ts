// =============================================================
// PHASE 74: ENTERPRISE MULTI-MODEL AI GATEWAY TYPES
// =============================================================

export type AIProviderCode = 'GEMINI' | 'OPENAI' | 'ANTHROPIC' | 'LOCAL_DETERMINISTIC' | 'CUSTOM_ENDPOINT';

export type AITaskType =
  | 'COPILOT'
  | 'NLP_QUERY'
  | 'EXECUTIVE_SUMMARY'
  | 'REPORT_GENERATION'
  | 'INSIGHT_EXPLANATION'
  | 'RECOMMENDATION_EXPLANATION'
  | 'DOCUMENT_SUMMARY'
  | 'TECHNICAL_ANALYSIS'
  | 'GENERAL_REASONING'
  | 'CLASSIFICATION'
  | 'EXTRACTION'
  | 'PREDICTION';

export type AIModelType =
  | 'CHAT_COMPLETIONS'
  | 'REASONING'
  | 'EMBEDDING'
  | 'STATISTICAL_DETERMINISTIC';

export type DataClassificationLevel = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';

export interface AIGenerateOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  systemInstruction?: string;
  responseMimeType?: string;
  topP?: number;
  topK?: number;
  timeoutMs?: number;
  maxRetries?: number;
  allowFallback?: boolean;
  metadata?: Record<string, any>;
  dataClassification?: DataClassificationLevel;
  taskType?: AITaskType;
  user?: {
    id: string;
    role: string;
  };
}

export interface ModelPricingConfig {
  costPer1kInputTokensUsd: number;
  costPer1kOutputTokensUsd: number;
  costPer1kCachedTokensUsd: number;
}

export interface ModelInfo {
  modelCode: string;
  providerCode: AIProviderCode;
  displayName: string;
  modelType: AIModelType;
  contextWindowTokens: number;
  maxOutputTokens: number;
  supportsStructuredOutput: boolean;
  supportsFunctionCalling: boolean;
  supportsVision: boolean;
  pricing: ModelPricingConfig;
  latencyAverageMs: number;
  qualityRatingScore: number;
  isEnabled: boolean;
  isDefault: boolean;
  fallbackModelCode?: string;
  recommendedTasks: AITaskType[];
}

export interface ProviderHealthStatus {
  providerCode: AIProviderCode;
  providerName: string;
  status: 'ACTIVE' | 'DEGRADED' | 'OFFLINE' | 'MAINTENANCE' | 'DISABLED';
  isHealthy: boolean;
  lastPingMs: number;
  lastHealthCheckAt: string;
  healthScore: number;
  circuitBreakerOpen: boolean;
  consecutiveFailures: number;
  errorMessage?: string;
}

export interface AIGatewayResult<T = string> {
  data: T;
  text: string;
  providerUsed: AIProviderCode;
  modelUsed: string;
  wasFallbackUsed: boolean;
  fallbackReason?: string;
  originalProviderAttempted?: AIProviderCode;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  latencyMs: number;
  confidence: number;
  responseClassification: 'AI_ASSISTED' | 'DETERMINISTIC' | 'HYBRID' | 'CACHED';
  requestId: string;
  timestamp: string;
}

export interface GatewayExecutionRequest {
  taskType: AITaskType;
  prompt: string;
  schemaDescription?: string;
  systemInstruction?: string;
  dataContext?: Record<string, any>;
  preferredProvider?: AIProviderCode;
  preferredModel?: string;
  temperature?: number;
  maxTokens?: number;
  dataClassification?: DataClassificationLevel;
  user: {
    id: string;
    role: string;
  };
}

export interface WebhookPayload {
  eventId: string;
  eventType: string;
  timestamp: string;
  sourceModule: string;
  data: Record<string, any>;
  signature?: string;
}
