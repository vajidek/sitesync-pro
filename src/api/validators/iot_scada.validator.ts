import { z } from 'zod';

export const createDeviceTypeSchema = z.object({
  typeCode: z.string().min(2, 'Type code must be at least 2 characters'),
  typeName: z.string().min(2, 'Type name is required'),
  category: z.string().default('SCADA_NODE'),
  description: z.string().optional(),
  defaultProtocol: z.string().default('MODBUS_TCP'),
  icon: z.string().default('Cpu'),
});

export const createDeviceSchema = z.object({
  deviceCode: z.string().min(2).optional(),
  deviceName: z.string().min(2, 'Device name is required'),
  deviceTypeId: z.string().min(1, 'Device type ID is required'),
  modelId: z.string().optional(),
  gatewayId: z.string().optional(),
  rtuId: z.string().optional(),
  plcId: z.string().optional(),
  assetId: z.string().optional(),
  projectId: z.string().optional(),
  siteLocation: z.string().default('Central Pump House'),
  ipAddress: z.string().optional(),
  macAddress: z.string().optional(),
  communicationProtocol: z.enum(['MODBUS_TCP', 'MODBUS_RTU', 'MQTT', 'OPC_UA', 'REST_HTTP', 'WEBSOCKET', 'LORAWAN', 'DNP3']).default('MODBUS_TCP'),
  status: z.enum(['CONNECTED', 'DISCONNECTED', 'UNKNOWN', 'SIMULATED', 'OFFLINE']).default('CONNECTED'),
  isEnabled: z.boolean().default(true),
  isSimulated: z.boolean().default(false),
  firmwareVersion: z.string().default('v2.4.1'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  metadataJson: z.string().optional(),
});

export const updateDeviceSchema = createDeviceSchema.partial();

export const createGatewaySchema = z.object({
  gatewayCode: z.string().min(2).optional(),
  gatewayName: z.string().min(2, 'Gateway name is required'),
  manufacturer: z.string().default('Moxa / Siemens Industrial'),
  model: z.string().default('UC-8100 Series / SIMATIC IOT2050'),
  ipAddress: z.string().default('192.168.10.1'),
  macAddress: z.string().optional(),
  uplinkProtocol: z.string().default('MQTT_TLS'),
  downlinkProtocol: z.string().default('MODBUS_RTU_TCP'),
  status: z.enum(['CONNECTED', 'DISCONNECTED', 'UNKNOWN', 'SIMULATED', 'OFFLINE']).default('CONNECTED'),
  connectedDevicesCount: z.number().int().min(0).default(0),
  location: z.string().default('Station Main Control Room'),
  projectId: z.string().optional(),
});

export const updateGatewaySchema = createGatewaySchema.partial();

export const createRtuUnitSchema = z.object({
  rtuCode: z.string().min(2).optional(),
  rtuName: z.string().min(2, 'RTU name is required'),
  model: z.string().default('Schneider SCADAPack 357E'),
  stationId: z.string().default('STN-WTP-01'),
  gatewayId: z.string().optional(),
  ipAddress: z.string().optional(),
  modbusSlaveAddress: z.number().int().min(1).max(255).default(1),
  protocol: z.string().default('DNP3_MODBUS'),
  digitalInputsCount: z.number().int().min(0).default(16),
  digitalOutputsCount: z.number().int().min(0).default(8),
  analogInputsCount: z.number().int().min(0).default(8),
  analogOutputsCount: z.number().int().min(0).default(4),
  status: z.enum(['CONNECTED', 'DISCONNECTED', 'UNKNOWN', 'SIMULATED', 'OFFLINE']).default('CONNECTED'),
  batteryBackupVoltage: z.number().min(0).default(24.2),
});

export const updateRtuUnitSchema = createRtuUnitSchema.partial();

export const createPlcUnitSchema = z.object({
  plcCode: z.string().min(2).optional(),
  plcName: z.string().min(2, 'PLC name is required'),
  manufacturer: z.string().default('Siemens / Rockwell Allen-Bradley'),
  model: z.string().default('SIMATIC S7-1500 / ControlLogix 5580'),
  firmwareVersion: z.string().default('v3.1.2'),
  ipAddress: z.string().default('192.168.1.100'),
  rackSlot: z.string().default('Rack 0, Slot 2'),
  scanCycleMs: z.number().int().min(1).default(10),
  cpuUtilizationPercent: z.number().min(0).max(100).default(22.5),
  operatingMode: z.enum(['RUN', 'STOP', 'FAULT']).default('RUN'),
  status: z.enum(['CONNECTED', 'DISCONNECTED', 'UNKNOWN', 'SIMULATED', 'OFFLINE']).default('CONNECTED'),
  location: z.string().default('MCC Panel Room'),
  projectId: z.string().optional(),
});

export const updatePlcUnitSchema = createPlcUnitSchema.partial();

export const createSensorSchema = z.object({
  sensorCode: z.string().min(2).optional(),
  sensorName: z.string().min(2, 'Sensor name is required'),
  deviceId: z.string().min(1, 'Device ID is required'),
  assetId: z.string().optional(),
  sensorType: z.enum(['FLOW', 'PRESSURE', 'LEVEL', 'TEMPERATURE', 'VIBRATION', 'ENERGY', 'RPM', 'CHLORINE', 'TURBIDITY', 'PH']).default('PRESSURE'),
  measurementUnit: z.string().min(1),
  rangeMin: z.number().default(0),
  rangeMax: z.number().default(100),
  calibrationOffset: z.number().default(0),
  scalingFactor: z.number().default(1.0),
  samplingIntervalSeconds: z.number().int().min(1).default(5),
  status: z.enum(['OPERATIONAL', 'CALIBRATING', 'FAULT', 'OFFLINE']).default('OPERATIONAL'),
  lastCalibrationDate: z.string().optional(),
  nextCalibrationDate: z.string().optional(),
});

export const updateSensorSchema = createSensorSchema.partial();

export const ingestTelemetrySchema = z.object({
  pointId: z.string().optional(),
  deviceId: z.string().min(1, 'Device ID is required'),
  sensorId: z.string().optional(),
  assetId: z.string().optional(),
  projectId: z.string().optional(),
  timestamp: z.string().optional(),
  rawVal: z.number(),
  engVal: z.number().optional(),
  unit: z.string().default('bar'),
  quality: z.enum(['GOOD', 'UNCERTAIN', 'BAD', 'SIMULATED']).default('GOOD'),
  pointCode: z.string().optional(),
  pointName: z.string().optional(),
});

export const telemetryBatchSchema = z.object({
  readings: z.array(ingestTelemetrySchema).min(1),
});

export const sendDeviceCommandSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  assetId: z.string().optional(),
  commandType: z.enum(['START', 'STOP', 'RESET', 'OPEN', 'CLOSE', 'SETPOINT', 'ENABLE', 'DISABLE']),
  targetRegister: z.string().optional(),
  parameterValue: z.string().optional(),
  timeoutSeconds: z.number().int().min(5).max(300).default(30),
});

export const createAlarmRuleSchema = z.object({
  ruleCode: z.string().min(2).optional(),
  ruleName: z.string().min(2, 'Rule name is required'),
  pointId: z.string().optional(),
  sensorType: z.string().default('PRESSURE'),
  highHighLimit: z.number().optional(),
  highLimit: z.number().optional(),
  lowLimit: z.number().optional(),
  lowLowLimit: z.number().optional(),
  deadband: z.number().default(0.5),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'ADVISORY']).default('HIGH'),
  priority: z.enum(['P1', 'P2', 'P3', 'P4']).default('P1'),
  suppressionMinutes: z.number().int().min(0).default(15),
  isEnabled: z.boolean().default(true),
  autoCreateWorkOrder: z.boolean().default(false),
});

export const updateAlarmRuleSchema = createAlarmRuleSchema.partial();

export const acknowledgeAlarmSchema = z.object({
  comments: z.string().min(2, 'Acknowledgement comments required'),
  expectedAction: z.string().optional(),
});

export const resolveAlarmSchema = z.object({
  resolutionNotes: z.string().min(3, 'Resolution notes required'),
  createWorkOrder: z.boolean().default(false),
  workOrderId: z.string().optional(),
});

export const createPredictiveModelSchema = z.object({
  modelCode: z.string().min(2).optional(),
  modelName: z.string().min(2),
  algorithm: z.string().default('LSTM_AUTOENCODER'),
  targetEquipmentType: z.string().default('CENTRIFUGAL_PUMP'),
  accuracyScore: z.number().min(0).max(1).default(0.95),
  version: z.string().default('v1.0.0'),
  modelProvider: z.string().default('SiteSync ML Engine Provider Interface'),
  isActive: z.boolean().default(true),
});

export const reportAnomalySchema = z.object({
  anomalyCode: z.string().optional(),
  assetId: z.string().min(1),
  sensorId: z.string().optional(),
  parameterName: z.string().default('Discharge Pressure & Vibration Peak'),
  anomalyScore: z.number().min(0).max(1).default(0.85),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).default('HIGH'),
  observedValue: z.number(),
  expectedValue: z.number(),
  unit: z.string().default('bar'),
  rootCauseNotes: z.string().optional(),
});

export const createScadaTagSchema = z.object({
  tagCode: z.string().min(2).optional(),
  tagName: z.string().min(2),
  description: z.string().optional(),
  deviceId: z.string().optional(),
  sensorId: z.string().optional(),
  assetId: z.string().optional(),
  dataType: z.string().default('FLOAT32'),
  engineeringUnit: z.string().default('bar'),
  scalingMultiplier: z.number().default(1.0),
  scalingOffset: z.number().default(0.0),
  highHighLimit: z.number().optional(),
  highLimit: z.number().optional(),
  lowLimit: z.number().optional(),
  lowLowLimit: z.number().optional(),
  deadband: z.number().default(0.1),
  scanRateMs: z.number().int().min(100).default(1000),
});

export const updateScadaTagSchema = createScadaTagSchema.partial();

export const createScadaDashboardSchema = z.object({
  dashboardCode: z.string().min(2).optional(),
  dashboardTitle: z.string().min(2),
  dashboardType: z.string().default('WATER_TREATMENT_PLANT'),
  projectId: z.string().optional(),
  layoutConfigJson: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const createScadaWidgetSchema = z.object({
  dashboardId: z.string().min(1),
  widgetTitle: z.string().min(2),
  widgetType: z.enum(['GAUGE', 'TIME_SERIES', 'PUMP_STATUS', 'PIPE_FLOW', 'TANK_LEVEL', 'ALARM_BANNER']).default('GAUGE'),
  tagId: z.string().optional(),
  gridX: z.number().int().default(0),
  gridY: z.number().int().default(0),
  gridW: z.number().int().default(4),
  gridH: z.number().int().default(3),
  widgetConfigJson: z.string().optional(),
});

export const ingestEnergySchema = z.object({
  assetId: z.string().optional(),
  deviceId: z.string().min(1),
  projectId: z.string().optional(),
  timestamp: z.string().optional(),
  activePowerKw: z.number().default(145.2),
  apparentPowerKva: z.number().default(158.4),
  energyKwh: z.number().default(4820.5),
  voltagePhaseA: z.number().default(415.2),
  voltagePhaseB: z.number().default(414.8),
  voltagePhaseC: z.number().default(416.0),
  currentPhaseA: z.number().default(220.4),
  currentPhaseB: z.number().default(219.8),
  currentPhaseC: z.number().default(221.1),
  powerFactor: z.number().default(0.92),
  frequencyHz: z.number().default(50.0),
  specificEnergyKwhM3: z.number().default(0.38),
});
