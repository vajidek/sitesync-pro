// =============================================================
// PHASE 74: AI HEALTH & CIRCUIT BREAKER MONITOR
// =============================================================

import { AIProviderCode, ProviderHealthStatus } from './ai.types';
import { logger } from '../utils/logger';

export interface CircuitBreakerState {
  providerCode: AIProviderCode;
  isOpen: boolean;
  failureCount: number;
  lastFailureTime?: number;
  nextAttemptTime?: number;
}

export class AIHealthMonitor {
  private static circuitBreakers: Map<AIProviderCode, CircuitBreakerState> = new Map();
  private static THRESHOLD = 5; // 5 consecutive failures trips the breaker
  private static RESET_TIMEOUT_MS = 60000; // 1 minute cool-down

  static recordSuccess(providerCode: AIProviderCode) {
    const state = this.getOrCreateState(providerCode);
    state.failureCount = 0;
    state.isOpen = false;
  }

  static recordFailure(providerCode: AIProviderCode, error?: any) {
    const state = this.getOrCreateState(providerCode);
    state.failureCount++;
    state.lastFailureTime = Date.now();

    if (state.failureCount >= this.THRESHOLD) {
      state.isOpen = true;
      state.nextAttemptTime = Date.now() + this.RESET_TIMEOUT_MS;
      logger.warn(`[AIHealthMonitor] Circuit breaker TRIPPED for provider ${providerCode}. Falling back to next provider.`);
    }
  }

  static isCircuitOpen(providerCode: AIProviderCode): boolean {
    const state = this.getOrCreateState(providerCode);
    if (!state.isOpen) return false;

    // Check if cooldown period elapsed (half-open state probe)
    if (state.nextAttemptTime && Date.now() > state.nextAttemptTime) {
      logger.info(`[AIHealthMonitor] Circuit breaker for ${providerCode} is HALF-OPEN. Probing with next request.`);
      return false;
    }

    return true;
  }

  private static getOrCreateState(providerCode: AIProviderCode): CircuitBreakerState {
    if (!this.circuitBreakers.has(providerCode)) {
      this.circuitBreakers.set(providerCode, {
        providerCode,
        isOpen: false,
        failureCount: 0,
      });
    }
    return this.circuitBreakers.get(providerCode)!;
  }

  static getCircuitBreakerStatuses(): Record<string, any>[] {
    return Array.from(this.circuitBreakers.entries()).map(([code, state]) => ({
      providerCode: code,
      isOpen: state.isOpen,
      failureCount: state.failureCount,
      lastFailureTime: state.lastFailureTime ? new Date(state.lastFailureTime).toISOString() : null,
    }));
  }
}
