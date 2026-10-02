// =============================================================
// PHASE 74: AI GATEWAY PROVIDER INTERFACE
// =============================================================

import { AIProviderCode, AIGenerateOptions, ModelInfo, ProviderHealthStatus } from './ai.types';

export interface AIGatewayProvider {
  providerCode: AIProviderCode;
  providerName: string;

  isAvailable(): Promise<boolean>;
  healthCheck(): Promise<ProviderHealthStatus>;
  getAvailableModels(): ModelInfo[];
  getModelInfo(modelCode: string): ModelInfo | undefined;

  generateText(prompt: string, options?: AIGenerateOptions): Promise<{
    text: string;
    confidence: number;
    modelUsed: string;
    inputTokens?: number;
    outputTokens?: number;
  }>;

  generateStructuredOutput<T>(prompt: string, schemaDescription: string, options?: AIGenerateOptions): Promise<{
    data: T;
    confidence: number;
    modelUsed: string;
    inputTokens?: number;
    outputTokens?: number;
  }>;

  classify(input: string, categories: string[], options?: AIGenerateOptions): Promise<{
    category: string;
    confidence: number;
    modelUsed: string;
  }>;

  summarize(text: string, length?: 'short' | 'medium' | 'detailed', options?: AIGenerateOptions): Promise<{
    summary: string;
    confidence: number;
    modelUsed: string;
  }>;

  predict(data: Record<string, any>, target: string, options?: AIGenerateOptions): Promise<{
    prediction: string;
    probability: number;
    factors: string[];
    modelUsed: string;
  }>;

  analyze(data: Record<string, any>, context: string, options?: AIGenerateOptions): Promise<{
    findings: string[];
    risks: string[];
    recommendations: string[];
    modelUsed: string;
  }>;

  estimateUsage(prompt: string, outputText: string): {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}
