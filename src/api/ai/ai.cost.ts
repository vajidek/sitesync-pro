// =============================================================
// PHASE 74: AI USAGE & COST TRACKING ENGINE
// =============================================================

import { ModelPricingConfig } from './ai.types';

export class AICostEngine {
  /**
   * Calculates cost in USD based on model pricing configuration
   */
  static calculateCost(
    pricing: ModelPricingConfig,
    inputTokens: number,
    outputTokens: number,
    cachedTokens: number = 0
  ): number {
    const inputCost = (inputTokens / 1000) * pricing.costPer1kInputTokensUsd;
    const outputCost = (outputTokens / 1000) * pricing.costPer1kOutputTokensUsd;
    const cachedCost = (cachedTokens / 1000) * pricing.costPer1kCachedTokensUsd;
    const total = inputCost + outputCost + cachedCost;
    return Math.round(total * 1000000) / 1000000; // 6 decimal precision
  }

  /**
   * Formats USD cost for display
   */
  static formatCost(costUsd: number): string {
    if (costUsd === 0) return '$0.0000';
    if (costUsd < 0.0001) return `<$0.0001`;
    return `$${costUsd.toFixed(4)}`;
  }
}
