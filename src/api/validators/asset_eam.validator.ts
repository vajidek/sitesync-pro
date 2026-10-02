import { z } from 'zod';

export const createAssetSchema = z.object({
  name: z.string().min(2, 'Asset name is required'),
  category: z.enum([
    'HEAVY_EQUIPMENT',
    'PLANT_MACHINERY',
    'VEHICLE',
    'GENERATOR',
    'PUMP',
    'INSTRUMENTATION',
    'TOOL',
    'IT_HARDWARE',
    'OTHER'
  ]).default('HEAVY_EQUIPMENT'),
  subcategory: z.string().optional(),
  assetGroup: z.string().optional(),
  projectId: z.string().optional(),
  projectName: z.string().optional(),
  department: z.string().default('FLEET_PLANT'),
  warehouseId: z.string().optional(),
  currentLocation: z.string().min(2, 'Current location is required'),
  gpsCoordinates: z.string().optional(),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  model: z.string().min(1, 'Model is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  commissionDate: z.string().optional(),
  warrantyStartDate: z.string().optional(),
  warrantyEndDate: z.string().optional(),
  insurancePolicyNo: z.string().optional(),
  insuranceExpiryDate: z.string().optional(),
  amcContractNo: z.string().optional(),
  amcExpiryDate: z.string().optional(),
  purchaseValue: z.number().positive('Purchase value must be positive'),
  currentValue: z.number().optional(),
  residualValue: z.number().default(0),
  usefulLifeYears: z.number().int().positive().default(10),
  depreciationMethod: z.enum(['STRAIGHT_LINE', 'WDV', 'CUSTOM']).default('STRAIGHT_LINE'),
  responsibleEmployeeId: z.string().optional(),
  responsibleEmployeeName: z.string().optional(),
  criticality: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
});

export const updateAssetSchema = createAssetSchema.partial();

export const transferAssetSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  fromLocation: z.string().min(1, 'From location is required'),
  toLocation: z.string().min(1, 'To location is required'),
  fromProjectId: z.string().optional(),
  toProjectId: z.string().optional(),
  requestedBy: z.string().min(1, 'Requested by is required'),
  dispatchDate: z.string().min(1, 'Dispatch date is required'),
  notes: z.string().optional(),
});

export const assignAssetSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  employeeName: z.string().min(1, 'Employee Name is required'),
  assignedDate: z.string().min(1, 'Assigned date is required'),
  expectedReturnDate: z.string().optional(),
  purpose: z.string().min(1, 'Purpose is required'),
  conditionOnAssign: z.enum(['EXCELLENT', 'GOOD', 'FAIR']).default('EXCELLENT'),
});

export const createMeterReadingSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  readingType: z.enum(['RUNNING_HOURS', 'ODOMETER_KM', 'GENERATOR_HOURS', 'PUMP_HOURS', 'ENERGY_KWH', 'CUSTOM']).default('RUNNING_HOURS'),
  readingValue: z.number().min(0, 'Reading value must be non-negative'),
  unit: z.string().default('HRS'),
  readingDate: z.string().min(1, 'Reading date is required'),
  recordedBy: z.string().min(1, 'Recorded by is required'),
  notes: z.string().optional(),
});

export const createMaintenancePlanSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  planType: z.enum(['PREVENTIVE', 'CONDITION_BASED', 'CALIBRATION']).default('PREVENTIVE'),
  triggerType: z.enum(['TIME_BASED', 'METER_BASED', 'BOTH']).default('TIME_BASED'),
  intervalDays: z.number().int().positive().optional().default(30),
  intervalMeterValue: z.number().positive().optional().default(250),
  nextDueDate: z.string().min(1, 'Next due date is required'),
  taskDescription: z.string().min(5, 'Task description is required'),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW', 'CRITICAL']).default('MEDIUM'),
  assignedTechnician: z.string().optional(),
  estimatedDurationHours: z.number().positive().default(4),
});

export const createWorkOrderSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  workOrderType: z.enum(['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY', 'CALIBRATION', 'OVERHAUL']).default('PREVENTIVE'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']).default('MEDIUM'),
  summary: z.string().min(5, 'Summary is required'),
  description: z.string().min(5, 'Description is required'),
  maintenancePlanId: z.string().optional(),
  failureCode: z.string().optional(),
  assignedTechnician: z.string().min(1, 'Assigned technician is required'),
  scheduledStartDate: z.string().min(1, 'Scheduled start date is required'),
  scheduledEndDate: z.string().min(1, 'Scheduled end date is required'),
});

export const updateWorkOrderSchema = z.object({
  status: z.enum(['CREATED', 'SCHEDULED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'APPROVED', 'CANCELLED']).optional(),
  actualStartDate: z.string().optional(),
  actualEndDate: z.string().optional(),
  laborHoursSpent: z.number().min(0).optional(),
  laborCost: z.number().min(0).optional(),
  partsCost: z.number().min(0).optional(),
  downtimeHours: z.number().min(0).optional(),
  rootCauseAnalysis: z.string().optional(),
});

export const logFuelSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  fuelType: z.enum(['DIESEL', 'PETROL', 'ELECTRIC', 'HYBRID']).default('DIESEL'),
  quantityLiters: z.number().positive('Quantity must be positive'),
  pricePerLiter: z.number().positive('Price per liter must be positive'),
  odometerReading: z.number().optional(),
  runningHourReading: z.number().optional(),
  fuelStationVendor: z.string().min(1, 'Fuel station vendor is required'),
  driverOrOperatorName: z.string().min(1, 'Driver/Operator name is required'),
  logDate: z.string().min(1, 'Log date is required'),
});

export const logCalibrationSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  calibrationDate: z.string().min(1, 'Calibration date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  certifiedVendorName: z.string().min(1, 'Certified vendor is required'),
  certificateNo: z.string().min(1, 'Certificate number is required'),
  accuracyRange: z.string().optional(),
  resultStatus: z.enum(['PASSED', 'FAILED', 'ADJUSTED']).default('PASSED'),
  nextCalibrationDate: z.string().min(1, 'Next calibration date is required'),
});
