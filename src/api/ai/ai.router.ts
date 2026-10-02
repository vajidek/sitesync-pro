// =============================================================
// PHASE 74: TASK-BASED MODEL ROUTING ENGINE
// =============================================================

import { AIRegistry } from './ai.registry';
import { AIHealthMonitor } from './ai.health';
import { AIGatewayProvider } from './ai.provider';
import { AIProviderCode, AITaskType, ModelInfo, DataClassificationLevel } from './ai.types';
import { logger } from '../utils/logger';

export interface RouteResolution {
  provider: AIGatewayProvider;
  model: ModelInfo;
  fallbackChain: Array<{ provider: AIGatewayProvider; model: ModelInfo }>;
  requiresDeterministicBackup: boolean;
}

export interface RoutingPolicyRule {
  taskType: AITaskType;
  primaryProvider: AIProviderCode;
  primaryModel: string;
  fallbackProvider: AIProviderCode;
  fallbackModel: string;
  requiresDeterministic: boolean;
  allowedRoles: string[];
}

export class AIRouter {
  private static policies: Map<AITaskType, RoutingPolicyRule> = new Map([
    [
      'COPILOT',
      {
        taskType: 'COPILOT',
        primaryProvider: 'GEMINI',
        primaryModel: 'gemini-3.6-flash',
        fallbackProvider: 'OPENAI',
        fallbackModel: 'gpt-4o-mini',
        requiresDeterministic: true,
        allowedRoles: ['ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR', 'STORE_KEEPER'],
      },
    ],
    [
      'NLP_QUERY',
      {
        taskType: 'NLP_QUERY',
        primaryProvider: 'GEMINI',
        primaryModel: 'gemini-3.6-flash',
        fallbackProvider: 'OPENAI',
        fallbackModel: 'gpt-4o-mini',
        requiresDeterministic: true,
        allowedRoles: ['ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR', 'STORE_KEEPER'],
      },
    ],
    [
      'EXECUTIVE_SUMMARY',
      {
        taskType: 'EXECUTIVE_SUMMARY',
        primaryProvider: 'GEMINI',
        primaryModel: 'gemini-3.6-flash',
        fallbackProvider: 'OPENAI',
        fallbackModel: 'gpt-4o-mini',
        requiresDeterministic: true,
        allowedRoles: ['ADMIN', 'MANAGER'],
      },
    ],
    [
      'REPORT_GENERATION',
      {
        taskType: 'REPORT_GENERATION',
        primaryProvider: 'GEMINI',
        primaryModel: 'gemini-3.6-flash',
        fallbackProvider: 'OPENAI',
        fallbackModel: 'gpt-4o',
        requiresDeterministic: true,
        allowedRoles: ['ADMIN', 'MANAGER', 'INCHARGE'],
      },
    ],
    [
      'TECHNICAL_ANALYSIS',
      {
        taskType: 'TECHNICAL_ANALYSIS',
        primaryProvider: 'LOCAL_DETERMINISTIC',
        primaryModel: 'heuristic-analytics-v3',
        fallbackProvider: 'GEMINI',
        fallbackModel: 'gemini-3.6-flash',
        requiresDeterministic: true,
        allowedRoles: ['ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'],
      },
    ],
    [
      'INSIGHT_EXPLANATION',
      {
        taskType: 'INSIGHT_EXPLANATION',
        primaryProvider: 'GEMINI',
        primaryModel: 'gemini-3.6-flash',
        fallbackProvider: 'LOCAL_DETERMINISTIC',
        fallbackModel: 'heuristic-analytics-v3',
        requiresDeterministic: true,
        allowedRoles: ['ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'],
      },
    ],
    [
      'RECOMMENDATION_EXPLANATION',
      {
        taskType: 'RECOMMENDATION_EXPLANATION',
        primaryProvider: 'GEMINI',
        primaryModel: 'gemini-3.6-flash',
        fallbackProvider: 'LOCAL_DETERMINISTIC',
        fallbackModel: 'heuristic-analytics-v3',
        requiresDeterministic: true,
        allowedRoles: ['ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'],
      },
    ],
    [
      'DOCUMENT_SUMMARY',
      {
        taskType: 'DOCUMENT_SUMMARY',
        primaryProvider: 'GEMINI',
        primaryModel: 'gemini-1.5-pro',
        fallbackProvider: 'OPENAI',
        fallbackModel: 'gpt-4o-mini',
        requiresDeterministic: false,
        allowedRoles: ['ADMIN', 'MANAGER', 'INCHARGE'],
      },
    ],
    [
      'GENERAL_REASONING',
      {
        taskType: 'GENERAL_REASONING',
        primaryProvider: 'GEMINI',
        primaryModel: 'gemini-3.7-flash',
        fallbackProvider: 'OPENAI',
        fallbackModel: 'gpt-4o',
        requiresDeterministic: false,
        allowedRoles: ['ADMIN', 'MANAGER'],
      },
    ],
    [
      'CLASSIFICATION',
      {
        taskType: 'CLASSIFICATION',
        primaryProvider: 'GEMINI',
        primaryModel: 'gemini-3.6-flash',
        fallbackProvider: 'LOCAL_DETERMINISTIC',
        fallbackModel: 'heuristic-analytics-v3',
        requiresDeterministic: true,
        allowedRoles: ['ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'],
      },
    ],
    [
      'EXTRACTION',
      {
        taskType: 'EXTRACTION',
        primaryProvider: 'GEMINI',
        primaryModel: 'gemini-3.6-flash',
        fallbackProvider: 'OPENAI',
        fallbackModel: 'gpt-4o-mini',
        requiresDeterministic: true,
        allowedRoles: ['ADMIN', 'MANAGER', 'INCHARGE'],
      },
    ],
    [
      'PREDICTION',
      {
        taskType: 'PREDICTION',
        primaryProvider: 'LOCAL_DETERMINISTIC',
        primaryModel: 'heuristic-analytics-v3',
        fallbackProvider: 'GEMINI',
        fallbackModel: 'gemini-3.6-flash',
        requiresDeterministic: true,
        allowedRoles: ['ADMIN', 'MANAGER'],
      },
    ],
  ]);

  static getPolicies(): RoutingPolicyRule[] {
    return Array.from(this.policies.values());
  }

  static updatePolicy(rule: RoutingPolicyRule) {
    this.policies.set(rule.taskType, rule);
  }

  /**
   * Resolves optimal provider and model routing chain for a task
   */
  static async resolveRoute(
    taskType: AITaskType,
    preferredProvider?: AIProviderCode,
    preferredModel?: string,
    dataClassification?: DataClassificationLevel
  ): Promise<RouteResolution> {
    const policy = this.policies.get(taskType) || this.policies.get('COPILOT')!;

    // Restrict strictly confidential data to local deterministic or anonymized processing
    if (dataClassification === 'RESTRICTED') {
      const deterministic = AIRegistry.getProvider('LOCAL_DETERMINISTIC')!;
      const model = deterministic.getModelInfo('heuristic-analytics-v3')!;
      return {
        provider: deterministic,
        model,
        fallbackChain: [],
        requiresDeterministicBackup: true,
      };
    }

    const fallbackChain: Array<{ provider: AIGatewayProvider; model: ModelInfo }> = [];

    // 1. Check preferred provider if requested
    if (preferredProvider && preferredProvider !== 'LOCAL_DETERMINISTIC') {
      const prov = AIRegistry.getProvider(preferredProvider);
      if (prov && !AIHealthMonitor.isCircuitOpen(preferredProvider) && (await prov.isAvailable())) {
        const model = (preferredModel && prov.getModelInfo(preferredModel)) || prov.getAvailableModels()[0];
        if (model) {
          this.buildFallbackChain(fallbackChain, policy, preferredProvider);
          return {
            provider: prov,
            model,
            fallbackChain,
            requiresDeterministicBackup: policy.requiresDeterministic,
          };
        }
      }
    }

    // 2. Check primary policy provider
    const primaryProv = AIRegistry.getProvider(policy.primaryProvider);
    if (
      primaryProv &&
      !AIHealthMonitor.isCircuitOpen(policy.primaryProvider) &&
      (await primaryProv.isAvailable())
    ) {
      const model = primaryProv.getModelInfo(policy.primaryModel) || primaryProv.getAvailableModels()[0];
      if (model) {
        this.buildFallbackChain(fallbackChain, policy, policy.primaryProvider);
        return {
          provider: primaryProv,
          model,
          fallbackChain,
          requiresDeterministicBackup: policy.requiresDeterministic,
        };
      }
    }

    // 3. Check secondary policy fallback
    const fallbackProv = AIRegistry.getProvider(policy.fallbackProvider);
    if (
      fallbackProv &&
      !AIHealthMonitor.isCircuitOpen(policy.fallbackProvider) &&
      (await fallbackProv.isAvailable())
    ) {
      const model = fallbackProv.getModelInfo(policy.fallbackModel) || fallbackProv.getAvailableModels()[0];
      if (model) {
        this.buildFallbackChain(fallbackChain, policy, policy.fallbackProvider);
        return {
          provider: fallbackProv,
          model,
          fallbackChain,
          requiresDeterministicBackup: policy.requiresDeterministic,
        };
      }
    }

    // 4. Default guaranteed deterministic fallback
    const deterministicProv = AIRegistry.getProvider('LOCAL_DETERMINISTIC')!;
    const model = deterministicProv.getModelInfo('heuristic-analytics-v3')!;
    return {
      provider: deterministicProv,
      model,
      fallbackChain: [],
      requiresDeterministicBackup: true,
    };
  }

  private static buildFallbackChain(
    chain: Array<{ provider: AIGatewayProvider; model: ModelInfo }>,
    policy: RoutingPolicyRule,
    chosenPrimary: AIProviderCode
  ) {
    if (chosenPrimary !== 'GEMINI') {
      const p = AIRegistry.getProvider('GEMINI');
      if (p) {
        const m = p.getModelInfo('gemini-3.6-flash') || p.getAvailableModels()[0];
        if (m) chain.push({ provider: p, model: m });
      }
    }

    if (chosenPrimary !== 'OPENAI') {
      const p = AIRegistry.getProvider('OPENAI');
      if (p) {
        const m = p.getModelInfo('gpt-4o-mini') || p.getAvailableModels()[0];
        if (m) chain.push({ provider: p, model: m });
      }
    }

    // Guaranteed deterministic terminal fallback
    const det = AIRegistry.getProvider('LOCAL_DETERMINISTIC')!;
    const detModel = det.getModelInfo('heuristic-analytics-v3')!;
    chain.push({ provider: det, model: detModel });
  }
}
