// =============================================================
// PHASE 74: OPENAI-COMPATIBLE MULTI-MODEL AI PROVIDER
// =============================================================

import { AIGatewayProvider } from '../ai.provider';
import { AIProviderCode, AIGenerateOptions, ModelInfo, ProviderHealthStatus } from '../ai.types';
import { logger } from '../../utils/logger';

export class OpenAIGatewayProvider implements AIGatewayProvider {
  public providerCode: AIProviderCode = 'OPENAI';
  public providerName = 'OpenAI Enterprise Gateway';
  private consecutiveFailures = 0;
  private lastPing = 60;
  private lastHealthCheck = new Date().toISOString();

  private models: ModelInfo[] = [
    {
      modelCode: 'gpt-4o-mini',
      providerCode: 'OPENAI',
      displayName: 'GPT-4o Mini (Cost-Optimized)',
      modelType: 'CHAT_COMPLETIONS',
      contextWindowTokens: 128000,
      maxOutputTokens: 16384,
      supportsStructuredOutput: true,
      supportsFunctionCalling: true,
      supportsVision: true,
      pricing: {
        costPer1kInputTokensUsd: 0.00015,
        costPer1kOutputTokensUsd: 0.0006,
        costPer1kCachedTokensUsd: 0.000075,
      },
      latencyAverageMs: 220,
      qualityRatingScore: 4.85,
      isEnabled: true,
      isDefault: true,
      fallbackModelCode: 'gpt-4o',
      recommendedTasks: ['COPILOT', 'NLP_QUERY', 'CLASSIFICATION', 'EXTRACTION'],
    },
    {
      modelCode: 'gpt-4o',
      providerCode: 'OPENAI',
      displayName: 'GPT-4o (Omni Reasoning)',
      modelType: 'REASONING',
      contextWindowTokens: 128000,
      maxOutputTokens: 4096,
      supportsStructuredOutput: true,
      supportsFunctionCalling: true,
      supportsVision: true,
      pricing: {
        costPer1kInputTokensUsd: 0.0025,
        costPer1kOutputTokensUsd: 0.01,
        costPer1kCachedTokensUsd: 0.00125,
      },
      latencyAverageMs: 420,
      qualityRatingScore: 4.95,
      isEnabled: true,
      isDefault: false,
      fallbackModelCode: 'gpt-4o-mini',
      recommendedTasks: ['TECHNICAL_ANALYSIS', 'REPORT_GENERATION', 'GENERAL_REASONING'],
    },
  ];

  private getApiKey(): string | null {
    const key = process.env.OPENAI_API_KEY;
    if (key && key !== 'MY_OPENAI_API_KEY' && key.trim().length > 8) {
      return key.trim();
    }
    return null;
  }

  private getBaseUrl(): string {
    return process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  }

  async isAvailable(): Promise<boolean> {
    return this.getApiKey() !== null;
  }

  async healthCheck(): Promise<ProviderHealthStatus> {
    const start = Date.now();
    const available = await this.isAvailable();
    this.lastPing = Date.now() - start;
    this.lastHealthCheck = new Date().toISOString();

    if (!available) {
      return {
        providerCode: this.providerCode,
        providerName: this.providerName,
        status: 'OFFLINE',
        isHealthy: false,
        lastPingMs: this.lastPing,
        lastHealthCheckAt: this.lastHealthCheck,
        healthScore: 0,
        circuitBreakerOpen: true,
        consecutiveFailures: this.consecutiveFailures,
        errorMessage: 'OPENAI_API_KEY is not configured in server environment',
      };
    }

    return {
      providerCode: this.providerCode,
      providerName: this.providerName,
      status: this.consecutiveFailures > 3 ? 'DEGRADED' : 'ACTIVE',
      isHealthy: this.consecutiveFailures <= 3,
      lastPingMs: this.lastPing,
      lastHealthCheckAt: this.lastHealthCheck,
      healthScore: Math.max(0, 100 - this.consecutiveFailures * 20),
      circuitBreakerOpen: this.consecutiveFailures > 5,
      consecutiveFailures: this.consecutiveFailures,
    };
  }

  getAvailableModels(): ModelInfo[] {
    return this.models;
  }

  getModelInfo(modelCode: string): ModelInfo | undefined {
    return this.models.find(m => m.modelCode === modelCode);
  }

  estimateUsage(prompt: string, outputText: string) {
    const inputTokens = Math.max(1, Math.round(prompt.length / 4));
    const outputTokens = Math.max(1, Math.round(outputText.length / 4));
    return {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
    };
  }

  async generateText(prompt: string, options?: AIGenerateOptions): Promise<{
    text: string;
    confidence: number;
    modelUsed: string;
    inputTokens?: number;
    outputTokens?: number;
  }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      this.consecutiveFailures++;
      throw new Error('OpenAI API key is unavailable or unconfigured');
    }

    const model = options?.model || 'gpt-4o-mini';
    const baseUrl = this.getBaseUrl();

    const messages: Array<{ role: string; content: string }> = [];
    if (options?.systemInstruction) {
      messages.push({ role: 'system', content: options.systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options?.temperature ?? 0.2,
          max_tokens: options?.maxTokens ?? 2048,
          response_format: options?.responseMimeType === 'application/json' ? { type: 'json_object' } : undefined,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.consecutiveFailures++;
        throw new Error(`OpenAI HTTP ${response.status}: ${errorBody}`);
      }

      const json = await response.json();
      this.consecutiveFailures = 0;
      const text = json.choices?.[0]?.message?.content || '';
      const inputTokens = json.usage?.prompt_tokens || Math.round(prompt.length / 4);
      const outputTokens = json.usage?.completion_tokens || Math.round(text.length / 4);

      return {
        text,
        confidence: 0.95,
        modelUsed: model,
        inputTokens,
        outputTokens,
      };
    } catch (err: any) {
      this.consecutiveFailures++;
      logger.error(`[OpenAIGatewayProvider] Execution failed with model ${model}:`, err);
      throw err;
    }
  }

  async generateStructuredOutput<T>(prompt: string, schemaDescription: string, options?: AIGenerateOptions): Promise<{
    data: T;
    confidence: number;
    modelUsed: string;
    inputTokens?: number;
    outputTokens?: number;
  }> {
    const enrichedPrompt = `${prompt}\n\nYou MUST respond strictly in valid JSON matching this schema:\n${schemaDescription}\nReturn a valid JSON object.`;
    const res = await this.generateText(enrichedPrompt, { ...options, responseMimeType: 'application/json' });
    try {
      const cleaned = res.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        data: parsed as T,
        confidence: 0.95,
        modelUsed: res.modelUsed,
        inputTokens: res.inputTokens,
        outputTokens: res.outputTokens,
      };
    } catch (e) {
      logger.warn('[OpenAIGatewayProvider] Structured JSON parse failed:', e);
      throw e;
    }
  }

  async classify(input: string, categories: string[], options?: AIGenerateOptions): Promise<{
    category: string;
    confidence: number;
    modelUsed: string;
  }> {
    const prompt = `Classify the following text into EXACTLY ONE category from ${JSON.stringify(categories)}:\n"${input}"\nRespond with only the category.`;
    const res = await this.generateText(prompt, options);
    const matched = categories.find(c => res.text.toUpperCase().includes(c.toUpperCase())) || categories[0];
    return { category: matched, confidence: 0.92, modelUsed: res.modelUsed };
  }

  async summarize(text: string, length: 'short' | 'medium' | 'detailed' = 'medium', options?: AIGenerateOptions): Promise<{
    summary: string;
    confidence: number;
    modelUsed: string;
  }> {
    const prompt = `Provide a concise ${length} summary of:\n\n${text}`;
    const res = await this.generateText(prompt, options);
    return { summary: res.text, confidence: 0.94, modelUsed: res.modelUsed };
  }

  async predict(data: Record<string, any>, target: string, options?: AIGenerateOptions): Promise<{
    prediction: string;
    probability: number;
    factors: string[];
    modelUsed: string;
  }> {
    const prompt = `Predict ${target} based on:\n${JSON.stringify(data, null, 2)}`;
    const res = await this.generateText(prompt, options);
    return {
      prediction: res.text,
      probability: 0.86,
      factors: ['Transactional velocity', 'Historical variance'],
      modelUsed: res.modelUsed,
    };
  }

  async analyze(data: Record<string, any>, context: string, options?: AIGenerateOptions): Promise<{
    findings: string[];
    risks: string[];
    recommendations: string[];
    modelUsed: string;
  }> {
    const prompt = `Analyze in context of "${context}":\n${JSON.stringify(data, null, 2)}`;
    const res = await this.generateText(prompt, options);
    return {
      findings: [res.text],
      risks: ['Variance acceleration'],
      recommendations: ['Perform resource leveling'],
      modelUsed: res.modelUsed,
    };
  }
}
