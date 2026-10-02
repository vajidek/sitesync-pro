import { z } from 'zod';

export const createAssetCategorySchema = z.object({
  categoryCode: z.string().min(2, 'Category code must be at least 2 characters'),
  categoryName: z.string().min(2, 'Category name is required'),
  description: z.string().optional(),
  defaultDepreciationYears: z.number().int().min(1).default(10),
  icon: z.string().default('Wrench'),
});

export const createAssetGroupSchema = z.object({
  groupCode: z.string().min(2),
  groupName: z.string().min(2),
  categoryId: z.string().min(1),
  description: z.string().optional(),
});

export const createAssetMasterSchema = z.object({
  assetCode: z.string().min(2).optional(),
  assetName: z.string().min(2, 'Asset name is required'),
  categoryId: z.string().min(1, 'Category ID is required'),
  groupId: z.string().optional(),
  locationId: z.string().optional(),
  parentAssetId: z.string().optional(),
  serialNumber: z.string().optional(),
  modelNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  barcode: z.string().optional(),
  rfidTag: z.string().optional(),
  status: z.enum(['OPERATIONAL', 'UNDER_MAINTENANCE', 'BREAKDOWN', 'STANDBY', 'DECOMMISSIONED', 'DISPOSED']).default('OPERATIONAL'),
  criticality: z.enum(['CRITICAL_CLASS_A', 'ESSENTIAL_CLASS_B', 'GENERAL_CLASS_C']).default('ESSENTIAL_CLASS_B'),
  purchaseDate: z.string().optional(),
  purchaseCostAed: z.number().min(0).default(0),
  currentBookValueAed: z.number().min(0).default(0),
  warrantyExpiryDate: z.string().optional(),
  operatingHours: z.number().min(0).default(0),
  runningMeterReading: z.number().min(0).default(0),
  meterUnit: z.enum(['HOURS', 'KM', 'CYCLES', 'UNITS']).default('HOURS'),
  assignedToEmployeeId: z.string().optional(),
  department: z.string().default('Plant & Machinery'),
  projectId: z.string().optional(),
  specificationsJson: z.string().optional(),
  photoUrl: z.string().optional(),
});

export const updateAssetMasterSchema = createAssetMasterSchema.partial();

export const createAssetLocationSchema = z.object({
  locationCode: z.string().min(2),
  locationName: z.string().min(2),
  siteName: z.string().default('Main Plant / Central Yard'),
  zone: z.string().optional(),
  building: z.string().optional(),
  floor: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const createAssetCriticalitySchema = z.object({
  assetId: z.string().min(1),
  safetyImpactScore: z.number().int().min(1).max(5).default(3),
  environmentalImpactScore: z.number().int().min(1).max(5).default(3),
  productionLossScore: z.number().int().min(1).max(5).default(3),
  maintenanceCostScore: z.number().int().min(1).max(5).default(3),
  spareLeadTimeScore: z.number().int().min(1).max(5).default(3),
  rcmCategory: z.enum(['CLASS_A_CRITICAL', 'CLASS_B_ESSENTIAL', 'CLASS_C_GENERAL']).default('CLASS_A_CRITICAL'),
  recommendations: z.string().optional(),
});

export const createPreventiveMaintenancePlanSchema = z.object({
  planCode: z.string().min(2).optional(),
  planTitle: z.string().min(3, 'Plan title is required'),
  categoryId: z.string().optional(),
  assetId: z.string().optional(),
  frequencyType: z.enum(['TIME_BASED', 'METER_BASED', 'CONDITION_BASED']).default('TIME_BASED'),
  intervalDays: z.number().int().min(1).default(30),
  meterInterval: z.number().min(0).default(500),
  estimatedDurationHours: z.number().min(0.5).default(4),
  requiredCrewCount: z.number().int().min(1).default(2),
  estimatedCostAed: z.number().min(0).default(1500),
  checklistTemplateJson: z.string().optional(),
  safetyGuidelines: z.string().optional(),
  status: z.enum(['ACTIVE', 'DRAFT', 'SUSPENDED']).default('ACTIVE'),
});

export const createMaintenanceScheduleSchema = z.object({
  scheduleCode: z.string().optional(),
  planId: z.string().min(1),
  assetId: z.string().min(1),
  scheduledDate: z.string().min(4),
  dueDate: z.string().min(4),
  triggerSource: z.enum(['CALENDAR_CADENCE', 'RUNNING_HOURS_TRIGGER', 'TELEMETRY_ALARM']).default('CALENDAR_CADENCE'),
  status: z.enum(['SCHEDULED', 'WORK_ORDER_GENERATED', 'OVERDUE', 'COMPLETED', 'CANCELLED']).default('SCHEDULED'),
  assignedTeam: z.string().default('Mechanical Maintenance Crew A'),
  leadTechnicianId: z.string().optional(),
});

export const createMaintenanceWorkOrderSchema = z.object({
  workOrderNumber: z.string().optional(),
  title: z.string().min(3, 'Work order title is required'),
  workOrderType: z.enum(['PREVENTIVE', 'CORRECTIVE_BREAKDOWN', 'EMERGENCY', 'CALIBRATION', 'INSPECTION', 'OVERHAUL']).default('PREVENTIVE'),
  priority: z.enum(['CRITICAL_P1', 'HIGH_P2', 'MEDIUM_P3', 'LOW_P4']).default('MEDIUM_P3'),
  assetId: z.string().min(1, 'Asset ID is required'),
  scheduleId: z.string().optional(),
  breakdownId: z.string().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'ON_HOLD_PARTS', 'COMPLETED', 'VERIFIED_CLOSED', 'CANCELLED']).default('OPEN'),
  requestedBy: z.string().default('Operations Supervisor'),
  assignedTo: z.string().default('Sr. Maintenance Engineer'),
  plannedStartDate: z.string().min(4),
  plannedEndDate: z.string().min(4),
  actualStartDate: z.string().optional(),
  actualEndDate: z.string().optional(),
  totalLaborHours: z.number().min(0).default(0),
  totalLaborCostAed: z.number().min(0).default(0),
  totalPartsCostAed: z.number().min(0).default(0),
  totalOtherCostAed: z.number().min(0).default(0),
  totalCostAed: z.number().min(0).default(0),
  failureCode: z.string().optional(),
  resolutionSummary: z.string().optional(),
  isDowntimeCaused: z.boolean().default(false),
  downtimeMinutes: z.number().min(0).default(0),
});

export const updateMaintenanceWorkOrderSchema = createMaintenanceWorkOrderSchema.partial();

export const createMaintenanceTaskSchema = z.object({
  workOrderId: z.string().min(1),
  taskSequence: z.number().int().default(1),
  taskDescription: z.string().min(2),
  taskType: z.enum(['INSPECTION_SERVICE', 'COMPONENT_REPLACE', 'LUBRICATION', 'TESTING']).default('INSPECTION_SERVICE'),
  estimatedMinutes: z.number().int().default(60),
  actualMinutes: z.number().int().default(0),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED']).default('PENDING'),
  completedBy: z.string().optional(),
  remarks: z.string().optional(),
});

export const createMaintenanceChecklistSchema = z.object({
  workOrderId: z.string().min(1),
  taskId: z.string().optional(),
  checkItem: z.string().min(2),
  expectedCondition: z.string().min(2),
  observedCondition: z.string().optional(),
  isPassed: z.boolean().default(true),
  isMandatory: z.boolean().default(true),
  checkedBy: z.string().optional(),
});

export const createMaintenanceLaborSchema = z.object({
  workOrderId: z.string().min(1),
  technicianId: z.string().optional(),
  technicianName: z.string().min(2),
  tradeType: z.enum(['MECHANICAL', 'ELECTRICAL', 'HYDRAULIC', 'INSTRUMENTATION', 'HVAC']).default('MECHANICAL'),
  hourlyRateAed: z.number().min(0).default(120),
  regularHours: z.number().min(0).default(4),
  overtimeHours: z.number().min(0).default(0),
  workDate: z.string().min(4),
});

export const createMaintenanceSparePartSchema = z.object({
  workOrderId: z.string().min(1),
  partNumber: z.string().min(1),
  partName: z.string().min(1),
  quantityUsed: z.number().min(0.1).default(1),
  unitOfMeasure: z.string().default('PCS'),
  unitCostAed: z.number().min(0).default(0),
  warehouseLocation: z.string().default('Central Store - Bin A12'),
  requisitionRef: z.string().optional(),
});

export const createBreakdownReportSchema = z.object({
  breakdownNumber: z.string().optional(),
  assetId: z.string().min(1, 'Asset ID is required'),
  breakdownDate: z.string().min(4),
  breakdownTime: z.string().min(2),
  reportedBy: z.string().min(2),
  initialSymptoms: z.string().min(3),
  severity: z.enum(['CRITICAL_STOPPAGE', 'MAJOR_DEGRADATION', 'MINOR_ISSUE']).default('CRITICAL_STOPPAGE'),
  suspectedRootCause: z.string().optional(),
  productionImpact: z.enum(['LINE_HALTED', 'CAPACITY_REDUCED', 'NO_IMPACT']).default('LINE_HALTED'),
  status: z.enum(['REPORTED', 'ASSIGNED', 'UNDER_REPAIR', 'REPAIRED', 'CLOSED']).default('REPORTED'),
});

export const updateBreakdownReportSchema = createBreakdownReportSchema.partial();

export const createDowntimeLogSchema = z.object({
  breakdownId: z.string().optional(),
  workOrderId: z.string().optional(),
  assetId: z.string().min(1),
  startTime: z.string().min(4),
  endTime: z.string().optional(),
  totalDowntimeMinutes: z.number().min(0).default(0),
  downtimeCategory: z.enum(['UNPLANNED_MECHANICAL', 'UNPLANNED_ELECTRICAL', 'PLANNED_PM', 'UTILITY_FAILURE', 'OPERATOR_ERROR']).default('UNPLANNED_MECHANICAL'),
  lossCostAed: z.number().min(0).default(0),
  resolvedBy: z.string().optional(),
});

export const createConditionMonitoringSchema = z.object({
  assetId: z.string().min(1),
  sensorId: z.string().min(1),
  parameterName: z.string().min(2),
  parameterValue: z.number(),
  unit: z.string().min(1),
  thresholdMin: z.number().default(0),
  thresholdMax: z.number().default(100),
  alertSeverity: z.enum(['NORMAL', 'WARNING', 'CRITICAL_ALARM']).default('NORMAL'),
  measuredAt: z.string().min(4),
  isAlarmActive: z.boolean().default(false),
});

export const createMeterReadingSchema = z.object({
  assetId: z.string().min(1),
  readingDate: z.string().min(4),
  meterType: z.enum(['RUNNING_HOURS', 'ODOMETER_KM', 'ENERGY_KWH', 'CYCLES_COUNT', 'PRODUCTION_UNITS']).default('RUNNING_HOURS'),
  previousReading: z.number().min(0).default(0),
  currentReading: z.number().min(0),
  readingSource: z.enum(['MANUAL_ENTRY', 'TELEMATICS_CANBUS', 'SCADA_INTEGRATION']).default('MANUAL_ENTRY'),
});

export const createCalibrationRecordSchema = z.object({
  calibrationNumber: z.string().optional(),
  assetId: z.string().min(1),
  instrumentName: z.string().min(2),
  calibrationAgency: z.string().default('Dubai Central Laboratory (DCL)'),
  certificateNumber: z.string().min(2),
  calibratedDate: z.string().min(4),
  nextDueDate: z.string().min(4),
  standardUsed: z.string().default('ISO/IEC 17025 Traceable Master'),
  resultStatus: z.enum(['PASS_WITHIN_TOLERANCE', 'OUT_OF_TOLERANCE_ADJUSTED', 'FAILED_REJECTED']).default('PASS_WITHIN_TOLERANCE'),
  uncertaintyMeasurement: z.string().default('±0.05% FS'),
  approvedBy: z.string().default('QA/QC Calibration Lead'),
  certificateUrl: z.string().optional(),
});

export const createInspectionRecordSchema = z.object({
  inspectionNumber: z.string().optional(),
  assetId: z.string().min(1),
  inspectorName: z.string().min(2),
  inspectionType: z.enum(['THIRD_PARTY_STATUTORY', 'INTERNAL_SAFETY', 'PRE_MOBILIZATION', 'ANNUAL_FITNESS']).default('THIRD_PARTY_STATUTORY'),
  inspectionDate: z.string().min(4),
  complianceStandard: z.string().default('EN 13000 / ASME B30.5 / UAE Federal Law 8'),
  overallRating: z.enum(['EXCELLENT', 'SATISFACTORY', 'CONDITIONAL_PASS', 'CRITICAL_FAIL']).default('SATISFACTORY'),
  observations: z.string().optional(),
  recommendedActions: z.string().optional(),
  passStatus: z.boolean().default(true),
  nextInspectionDate: z.string().min(4),
  reportUrl: z.string().optional(),
});

export const createAssetDisposalSchema = z.object({
  assetId: z.string().min(1),
  disposalCode: z.string().optional(),
  disposalReason: z.enum(['BEYOND_ECONOMIC_REPAIR', 'OBSOLETE', 'ACCIDENT_DAMAGED', 'UPGRADE_REPLACED']).default('BEYOND_ECONOMIC_REPAIR'),
  disposalMethod: z.enum(['AUCTION_SALE', 'SCRAP_METAL', 'TRADE_IN', 'DONATION']).default('AUCTION_SALE'),
  saleProceedsAed: z.number().min(0).default(0),
  netBookValueAtDisposalAed: z.number().min(0).default(0),
  gainOrLossAed: z.number().default(0),
  approvedBy: z.string().default('Finance Committee'),
  disposalDate: z.string().min(4),
  scrapCertificateUrl: z.string().optional(),
});
