import { z } from 'zod';

export const CreateWbsSchema = z.object({
  projectId: z.string().optional().default('PRJ-101'),
  code: z.string().min(1, 'WBS code is required'),
  name: z.string().min(1, 'WBS name is required'),
  description: z.string().optional(),
  level: z.number().int().min(1).default(1),
  parentId: z.string().optional(),
  budgetAmount: z.number().optional().default(0),
  plannedStartDate: z.string().optional(),
  plannedEndDate: z.string().optional(),
});

export const CreateWorkPackageSchema = z.object({
  wbsId: z.string().min(1, 'WBS ID is required'),
  projectId: z.string().optional().default('PRJ-101'),
  code: z.string().min(1, 'Package code is required'),
  name: z.string().min(1, 'Work package name is required'),
  deliverable: z.string().optional(),
  responsiblePerson: z.string().optional().default('Project Manager'),
  estimatedCost: z.number().optional().default(0),
  plannedStartDate: z.string().optional(),
  plannedEndDate: z.string().optional(),
});

export const CreateActivitySchema = z.object({
  projectId: z.string().optional().default('PRJ-101'),
  wbsId: z.string().min(1, 'WBS ID is required'),
  wpId: z.string().optional(),
  activityCode: z.string().min(1, 'Activity code is required'),
  name: z.string().min(1, 'Activity name is required'),
  description: z.string().optional(),
  durationDays: z.number().int().min(1).default(1),
  plannedStartDate: z.string().min(1, 'Planned start date is required'),
  plannedEndDate: z.string().min(1, 'Planned end date is required'),
  plannedCost: z.number().optional().default(0),
});

export const CreateActivityRelationshipSchema = z.object({
  predecessorActivityId: z.string().min(1, 'Predecessor ID is required'),
  successorActivityId: z.string().min(1, 'Successor ID is required'),
  relationshipType: z.enum(['FS', 'SS', 'FF', 'SF']).default('FS'),
  lagDays: z.number().int().default(0),
});

export const CreateBaselineSchema = z.object({
  projectId: z.string().optional().default('PRJ-101'),
  baselineName: z.string().min(1, 'Baseline name is required'),
  approvedBy: z.string().optional().default('Project Director'),
  approvedDate: z.string().optional(),
  version: z.string().optional().default('V1.0'),
  totalDurationDays: z.number().int().optional().default(180),
  totalPlannedCost: z.number().optional().default(5000000),
});

export const CreateCalendarSchema = z.object({
  projectId: z.string().optional().default('PRJ-101'),
  calendarName: z.string().min(1, 'Calendar name is required'),
  workingDaysPerWeek: z.number().int().min(1).max(7).default(6),
  workingHoursPerDay: z.number().default(8),
  holidaysJson: z.string().optional().default('[]'),
  isDefault: z.boolean().optional().default(true),
});

export const CreateResourceSchema = z.object({
  resourceCode: z.string().min(1, 'Resource code is required'),
  name: z.string().min(1, 'Resource name is required'),
  type: z.enum(['LABOR', 'EQUIPMENT', 'MATERIAL', 'SUBCONTRACTOR']).default('LABOR'),
  unitOfMeasure: z.string().default('HOURS'),
  unitRate: z.number().default(0),
  capacityPerDay: z.number().default(8),
});

export const CreateResourceAssignmentSchema = z.object({
  activityId: z.string().min(1, 'Activity ID is required'),
  resourceId: z.string().min(1, 'Resource ID is required'),
  allocatedQuantity: z.number().min(0.1).default(1),
  unitRate: z.number().min(0).default(0),
});

export const UpdateProgressSchema = z.object({
  projectId: z.string().optional().default('PRJ-101'),
  asOfDate: z.string().min(1, 'As of date is required'),
  plannedProgressPercent: z.number().min(0).max(100),
  actualProgressPercent: z.number().min(0).max(100),
  plannedValue: z.number().min(0),
  earnedValue: z.number().min(0),
  actualCost: z.number().min(0),
});

export const CreateDelaySchema = z.object({
  projectId: z.string().optional().default('PRJ-101'),
  activityId: z.string().optional(),
  delayCategory: z.enum(['CLIENT', 'CONTRACTOR', 'WEATHER', 'PERMIT', 'MATERIAL', 'SITE_ACCESS']).default('CLIENT'),
  description: z.string().min(1, 'Description is required'),
  delayDays: z.number().int().min(1),
  impactOnCriticalPath: z.boolean().default(false),
  mitigationPlan: z.string().optional(),
});

export const CreateConstraintSchema = z.object({
  projectId: z.string().optional().default('PRJ-101'),
  activityId: z.string().min(1, 'Activity ID is required'),
  constraintType: z.enum(['MUST_START_ON', 'MUST_FINISH_ON', 'START_NO_EARLIER_THAN', 'FINISH_NO_LATER_THAN']).default('MUST_START_ON'),
  constraintDate: z.string().min(1, 'Constraint date is required'),
  reason: z.string().optional(),
});

export const CreateMilestoneSchema = z.object({
  projectId: z.string().optional().default('PRJ-101'),
  name: z.string().min(1, 'Milestone name is required'),
  targetDate: z.string().min(1, 'Target date is required'),
  paymentPercentage: z.number().default(0),
  isKeyMilestone: z.boolean().default(true),
});

export const CreateRiskSchema = z.object({
  projectId: z.string().optional().default('PRJ-101'),
  title: z.string().min(1, 'Risk title is required'),
  category: z.enum(['SCHEDULE', 'COST', 'TECHNICAL', 'RESOURCE', 'EXTERNAL']).default('SCHEDULE'),
  probability: z.number().int().min(1).max(5).default(3),
  impact: z.number().int().min(1).max(5).default(3),
  mitigationStrategy: z.string().optional(),
  owner: z.string().optional().default('Planning Manager'),
});

export const CreateIssueSchema = z.object({
  projectId: z.string().optional().default('PRJ-101'),
  activityId: z.string().optional(),
  title: z.string().min(1, 'Issue title is required'),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW', 'CRITICAL']).default('MEDIUM'),
  assignedTo: z.string().optional().default('Site Engineer'),
  resolutionPlan: z.string().optional(),
});

export const CreateChangeRequestSchema = z.object({
  projectId: z.string().optional().default('PRJ-101'),
  title: z.string().min(1, 'Change request title is required'),
  reason: z.string().min(1, 'Reason is required'),
  timeExtensionDays: z.number().int().default(0),
  costImpact: z.number().default(0),
});

export const CreateLookaheadSchema = z.object({
  projectId: z.string().optional().default('PRJ-101'),
  periodWeeks: z.number().int().min(1).max(12).default(3),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  plannedActivitiesCount: z.number().int().default(0),
  readinessStatus: z.enum(['READY', 'CONSTRAINED', 'BLOCKED']).default('READY'),
});

export const CreateDailyProgressSchema = z.object({
  projectId: z.string().optional().default('PRJ-101'),
  activityId: z.string().min(1, 'Activity ID is required'),
  reportDate: z.string().min(1, 'Report date is required'),
  workDoneQty: z.number().default(0),
  unit: z.string().default('MTRS'),
  manpowerCount: z.number().int().default(0),
  equipmentHours: z.number().default(0),
  remarks: z.string().optional(),
});

export const CreateWeeklyProgressSchema = z.object({
  projectId: z.string().optional().default('PRJ-101'),
  weekNumber: z.number().int().min(1).max(53),
  year: z.number().int().default(2026),
  plannedPercent: z.number().min(0).max(100),
  actualPercent: z.number().min(0).max(100),
  weeklyRemarks: z.string().optional(),
});

export const CreateMonthlyProgressSchema = z.object({
  projectId: z.string().optional().default('PRJ-101'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().default(2026),
  monthlyPlannedValue: z.number().min(0),
  monthlyEarnedValue: z.number().min(0),
  monthlyActualCost: z.number().min(0),
});
