import { z } from 'zod';

export const CreateDashboardSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  roleView: z.enum(['CEO', 'MD', 'PROJECT', 'FINANCE', 'PROCUREMENT', 'QAQC', 'HSE', 'FLEET', 'ASSET']).default('CEO'),
  description: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
  isPublic: z.boolean().optional().default(true),
  theme: z.enum(['LIGHT', 'DARK']).optional().default('LIGHT'),
  refreshIntervalSeconds: z.number().int().positive().optional().default(300),
});

export const UpdateDashboardSchema = CreateDashboardSchema.partial();

export const CreateWidgetSchema = z.object({
  dashboardId: z.string().min(1, 'Dashboard ID is required'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  widgetType: z.enum([
    'KPI_CARD',
    'TREND_CHART',
    'BAR_CHART',
    'PIE_CHART',
    'HEAT_MAP',
    'RANKING_TABLE',
    'RISK_MATRIX',
    'EXECUTIVE_REPORT',
  ]).default('KPI_CARD'),
  category: z.enum(['EXECUTIVE', 'PROJECT', 'FINANCE', 'PROCUREMENT', 'QAQC', 'HSE', 'FLEET', 'ASSET']).default('EXECUTIVE'),
  dataSourceUrl: z.string().optional(),
  refreshInterval: z.number().int().positive().optional().default(60),
});

export const UpdateWidgetSchema = CreateWidgetSchema.partial();

export const CreateSavedReportSchema = z.object({
  title: z.string().min(2, 'Report title is required'),
  reportType: z.string().default('EXECUTIVE_SUMMARY'),
  module: z.string().default('CROSS_MODULE'),
  filterParamsJson: z.string().optional().default('{}'),
  format: z.enum(['PDF', 'EXCEL', 'CSV']).default('PDF'),
});

export const CreateReportScheduleSchema = z.object({
  savedReportId: z.string().min(1, 'Saved Report ID is required'),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).default('WEEKLY'),
  cronExpression: z.string().default('0 8 * * 1'),
  recipientsEmail: z.string().email('Invalid email address'),
});

export const CreateKpiDefinitionSchema = z.object({
  code: z.string().min(2, 'KPI code is required'),
  name: z.string().min(2, 'KPI name is required'),
  module: z.string().default('GENERAL'),
  formula: z.string().min(1, 'Formula is required'),
  unit: z.string().default('PERCENT'),
  targetValue: z.number().default(100),
  warningThreshold: z.number().default(90),
  criticalThreshold: z.number().default(80),
});

export const CreateKpiSnapshotSchema = z.object({
  kpiCode: z.string().min(1, 'KPI code is required'),
  snapshotDate: z.string().default(new Date().toISOString().split('T')[0]),
  actualValue: z.number(),
  targetValue: z.number(),
  status: z.enum(['NORMAL', 'WARNING', 'CRITICAL']).default('NORMAL'),
});

export const CreateAlertRuleSchema = z.object({
  ruleName: z.string().min(2, 'Rule name is required'),
  kpiCode: z.string().min(1, 'KPI code is required'),
  condition: z.enum(['LESS_THAN', 'GREATER_THAN', 'EQUALS']).default('LESS_THAN'),
  thresholdValue: z.number(),
  severity: z.enum(['INFO', 'WARNING', 'CRITICAL']).default('WARNING'),
  isNotificationEnabled: z.boolean().optional().default(true),
});

export const CreateExecutiveReportSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  period: z.string().default('Q3-2026'),
  executiveSummary: z.string().min(10, 'Summary must be at least 10 characters'),
  highlightsJson: z.string().optional().default('[]'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
});

export const CreateAiInsightSchema = z.object({
  category: z.enum(['FINANCIAL_RISK', 'SCHEDULE_SLIPPAGE', 'SAFETY_ANOMALY', 'MATERIAL_WASTE']).default('FINANCIAL_RISK'),
  title: z.string().min(2, 'Title is required'),
  insightText: z.string().min(10, 'Insight text is required'),
  recommendedAction: z.string().min(5, 'Recommended action is required'),
  confidenceScore: z.number().min(0).max(1).default(0.95),
  impactSeverity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('HIGH'),
});
