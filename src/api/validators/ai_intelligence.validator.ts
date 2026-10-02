import { z } from 'zod';

export const nlpQuerySchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters').max(1000, 'Query cannot exceed 1000 characters'),
  contextScope: z.string().optional(),
  targetModule: z.string().optional(),
  maxResults: z.number().int().min(1).max(50).default(10).optional(),
});

export const copilotChatSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1, 'Message is required').max(2000, 'Message cannot exceed 2000 characters'),
  agentCode: z.string().default('EXEC_COPILOT').optional(),
  projectId: z.string().optional(),
  moduleScope: z.array(z.string()).optional(),
});

export const whatIfScenarioSchema = z.object({
  title: z.string().min(3, 'Scenario title is required').max(150),
  description: z.string().max(500).optional(),
  projectId: z.string().min(1, 'Project ID is required'),
  simulationParameters: z.object({
    procurementDelayDays: z.number().int().min(-60).max(180).default(0),
    productivityShiftPct: z.number().min(-50).max(50).default(0),
    equipmentDowntimeShiftPct: z.number().min(-50).max(100).default(0),
    materialCostShiftPct: z.number().min(-30).max(50).default(0),
    activitySlipDays: z.number().int().min(-30).max(90).default(0),
  }),
});

export const recommendationActionSchema = z.object({
  status: z.enum(['ACCEPTED', 'IMPLEMENTED', 'DISMISSED', 'REJECTED']),
  actionNotes: z.string().max(1000).optional(),
});

export const anomalyActionSchema = z.object({
  status: z.enum(['INVESTIGATING', 'CONFIRMED', 'FALSE_POSITIVE', 'RESOLVED']),
  resolutionNotes: z.string().max(1000).optional(),
});

export const feedbackSchema = z.object({
  targetType: z.enum(['MESSAGE', 'INSIGHT', 'RECOMMENDATION', 'PREDICTION', 'SCENARIO', 'REPORT']),
  targetId: z.string().min(1, 'Target ID is required'),
  rating: z.enum(['USEFUL', 'NOT_USEFUL', 'INCORRECT', 'INCOMPLETE']),
  feedbackText: z.string().max(1000).optional(),
  correctedAnswer: z.string().max(2000).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const generateReportSchema = z.object({
  reportType: z.enum([
    'DAILY_PROJECT_BRIEF',
    'WEEKLY_MANAGEMENT_BRIEF',
    'MONTHLY_EXECUTIVE',
    'RISK_INTELLIGENCE',
    'PROCUREMENT_INTELLIGENCE',
    'FINANCIAL_RISK',
    'EQUIPMENT_HEALTH',
    'HSE_INTELLIGENCE',
    'QAQC_INTELLIGENCE',
    'SCADA_INTELLIGENCE'
  ]),
  projectId: z.string().optional(),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  audience: z.enum(['EXECUTIVE', 'PROJECT_MANAGEMENT', 'SITE_ENGINEERS', 'AUDITORS']).default('EXECUTIVE').optional(),
});

export const acknowledgeInsightSchema = z.object({
  isAcknowledged: z.boolean().default(true),
});
