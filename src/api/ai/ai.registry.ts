// =============================================================
// PHASE 74: ENTERPRISE MODEL & PROVIDER REGISTRY
// =============================================================

import { AIGatewayProvider } from './ai.provider';
import { AIProviderCode, ModelInfo, ProviderHealthStatus } from './ai.types';
import { GeminiGatewayProvider } from './providers/gemini.provider';
import { OpenAIGatewayProvider } from './providers/openai.provider';
import { DeterministicGatewayProvider } from './providers/deterministic.provider';

export class AIRegistry {
  private static providers: Map<AIProviderCode, AIGatewayProvider> = new Map();
  private static initialized = false;

  static init() {
    if (this.initialized) return;
    this.registerProvider(new GeminiGatewayProvider());
    this.registerProvider(new OpenAIGatewayProvider());
    this.registerProvider(new DeterministicGatewayProvider());
    this.initialized = true;
  }

  static registerProvider(provider: AIGatewayProvider) {
    this.providers.set(provider.providerCode, provider);
  }

  static getProvider(providerCode: AIProviderCode): AIGatewayProvider | undefined {
    this.init();
    return this.providers.get(providerCode);
  }

  static getAllProviders(): AIGatewayProvider[] {
    this.init();
    return Array.from(this.providers.values());
  }

  static getAllModels(): ModelInfo[] {
    this.init();
    const list: ModelInfo[] = [];
    for (const provider of this.providers.values()) {
      list.push(...provider.getAvailableModels());
    }
    return list;
  }

  static getModel(modelCode: string): { provider: AIGatewayProvider; modelInfo: ModelInfo } | undefined {
    this.init();
    for (const provider of this.providers.values()) {
      const info = provider.getModelInfo(modelCode);
      if (info) {
        return { provider, modelInfo: info };
      }
    }
    return undefined;
  }

  static async getHealthOverview(): Promise<ProviderHealthStatus[]> {
    this.init();
    const statuses: ProviderHealthStatus[] = [];
    for (const provider of this.providers.values()) {
      try {
        statuses.push(await provider.healthCheck());
      } catch (err: any) {
        statuses.push({
          providerCode: provider.providerCode,
          providerName: provider.providerName,
          status: 'OFFLINE',
          isHealthy: false,
          lastPingMs: 999,
          lastHealthCheckAt: new Date().toISOString(),
          healthScore: 0,
          circuitBreakerOpen: true,
          consecutiveFailures: 1,
          errorMessage: err?.message || 'Health check error',
        });
      }
    }
    return statuses;
  }
}
