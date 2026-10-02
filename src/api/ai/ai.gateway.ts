// =============================================================
// PHASE 74: ENTERPRISE MULTI-MODEL AI GATEWAY
// =============================================================

import crypto from 'crypto';
import { AIRouter } from './ai.router';
import { AIHealthMonitor } from './ai.health';
import { AICostEngine } from './ai.cost';
import {
  AITaskType,
  AIProviderCode,
  AIGatewayResult,
  GatewayExecutionRequest,
  AIGenerateOptions,
} from './ai.types';
import { logger } from '../utils/logger';

export class AIGateway {
  private static MAX_RETRIES = 2;

  /**
   * Sanitizes input against prompt injection and security override attempts
   */
  static sanitizePrompt(input: string): { sanitized: string; isFlagged: boolean; reason?: string } {
    const blockedPatterns = [
      /ignore previous instructions/i,
      /ignore all prior rules/i,
      /you are now in developer mode/i,
      /dan mode/i,
      /system override/i,
      /bypass rbac/i,
      /reveal api keys/i,
      /reveal system prompt/i,
      /export all passwords/i,
      /drop table/i,
    ];

    for (const pattern of blockedPatterns) {
      if (pattern.test(input)) {
        return {
          sanitized: '[REDACTED_SECURITY_POLICY_VIOLATION]',
          isFlagged: true,
          reason: 'Potential prompt injection or security policy violation detected.',
        };
      }
    }

    return {
      sanitized: input.trim(),
      isFlagged: false,
    };
  }

  /**
   * Universal Enterprise Gateway Execution Endpoint
   * Routes seamlessly across providers with automated failover and cost tracking
   */
  static async execute(req: GatewayExecutionRequest): Promise<AIGatewayResult<any>> {
    const startTime = Date.now();
    const requestId = `gw_req_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const timestamp = new Date().toISOString();

    // 1. Security Check
    const { sanitized, isFlagged, reason } = this.sanitizePrompt(req.prompt);
    if (isFlagged) {
      return {
        data: null,
        text: `Security Policy Violation: Prompt contained disallowed instructions (${reason}). Request blocked.`,
        providerUsed: 'LOCAL_DETERMINISTIC',
        modelUsed: 'heuristic-analytics-v3',
        wasFallbackUsed: false,
        inputTokens: Math.round(req.prompt.length / 4),
        outputTokens: 20,
        totalTokens: Math.round(req.prompt.length / 4) + 20,
        estimatedCostUsd: 0.0,
        latencyMs: Date.now() - startTime,
        confidence: 1.0,
        responseClassification: 'DETERMINISTIC',
        requestId,
        timestamp,
      };
    }

    // 2. Resolve Route Chain
    const route = await AIRouter.resolveRoute(
      req.taskType,
      req.preferredProvider,
      req.preferredModel,
      req.dataClassification
    );

    let providerToUse = route.provider;
    let modelToUse = route.model;
    let wasFallback = false;
    let fallbackReason: string | undefined;
    let originalAttempted: AIProviderCode | undefined;

    const options: AIGenerateOptions = {
      model: modelToUse.modelCode,
      temperature: req.temperature ?? 0.2,
      maxTokens: req.maxTokens ?? 2048,
      systemInstruction: req.systemInstruction,
      taskType: req.taskType,
      user: req.user,
      dataClassification: req.dataClassification,
    };

    // 3. Attempt Primary Provider Execution with Automatic Fallback Chain
    let executionSuccess = false;
    let resultText = '';
    let resultData: any = null;
    let confidence = 0.95;
    let inputTokens = Math.round(sanitized.length / 4);
    let outputTokens = 100;

    // Try primary
    try {
      if (req.schemaDescription) {
        const out = await providerToUse.generateStructuredOutput(sanitized, req.schemaDescription, options);
        resultData = out.data;
        resultText = JSON.stringify(out.data);
        confidence = out.confidence;
        inputTokens = out.inputTokens || inputTokens;
        outputTokens = out.outputTokens || outputTokens;
      } else {
        const out = await providerToUse.generateText(sanitized, options);
        resultText = out.text;
        resultData = out.text;
        confidence = out.confidence;
        inputTokens = out.inputTokens || inputTokens;
        outputTokens = out.outputTokens || outputTokens;
      }
      executionSuccess = true;
      AIHealthMonitor.recordSuccess(providerToUse.providerCode);
    } catch (err: any) {
      logger.warn(`[AIGateway] Primary provider ${providerToUse.providerCode} failed: ${err.message}. Initiating failover.`);
      AIHealthMonitor.recordFailure(providerToUse.providerCode, err);
      originalAttempted = providerToUse.providerCode;
      fallbackReason = err?.message || 'Primary provider execution failure';
    }

    // 4. If primary failed, iterate through fallback chain
    if (!executionSuccess) {
      for (const fallback of route.fallbackChain) {
        try {
          logger.info(`[AIGateway] Attempting fallback provider ${fallback.provider.providerCode} with model ${fallback.model.modelCode}`);
          const fallbackOptions: AIGenerateOptions = {
            ...options,
            model: fallback.model.modelCode,
          };

          if (req.schemaDescription) {
            const out = await fallback.provider.generateStructuredOutput(sanitized, req.schemaDescription, fallbackOptions);
            resultData = out.data;
            resultText = JSON.stringify(out.data);
            confidence = out.confidence;
            inputTokens = out.inputTokens || inputTokens;
            outputTokens = out.outputTokens || outputTokens;
          } else {
            const out = await fallback.provider.generateText(sanitized, fallbackOptions);
            resultText = out.text;
            resultData = out.text;
            confidence = out.confidence;
            inputTokens = out.inputTokens || inputTokens;
            outputTokens = out.outputTokens || outputTokens;
          }

          providerToUse = fallback.provider;
          modelToUse = fallback.model;
          wasFallback = true;
          executionSuccess = true;
          AIHealthMonitor.recordSuccess(fallback.provider.providerCode);
          break;
        } catch (fallbackErr: any) {
          logger.warn(`[AIGateway] Fallback provider ${fallback.provider.providerCode} failed: ${fallbackErr.message}`);
          AIHealthMonitor.recordFailure(fallback.provider.providerCode, fallbackErr);
        }
      }
    }

    // 5. Compute Cost & Response Classification
    const totalTokens = inputTokens + outputTokens;
    const estimatedCostUsd = AICostEngine.calculateCost(modelToUse.pricing, inputTokens, outputTokens);
    const latencyMs = Date.now() - startTime;

    const responseClassification =
      providerToUse.providerCode === 'LOCAL_DETERMINISTIC'
        ? 'DETERMINISTIC'
        : wasFallback
        ? 'HYBRID'
        : 'AI_ASSISTED';

    return {
      data: resultData,
      text: resultText,
      providerUsed: providerToUse.providerCode,
      modelUsed: modelToUse.modelCode,
      wasFallbackUsed: wasFallback,
      fallbackReason,
      originalProviderAttempted: originalAttempted,
      inputTokens,
      outputTokens,
      totalTokens,
      estimatedCostUsd,
      latencyMs,
      confidence,
      responseClassification,
      requestId,
      timestamp,
    };
  }
}
