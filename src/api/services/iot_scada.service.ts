import { IotScadaRepository } from '../repositories/iot_scada.repository';

export const iotScadaRepository = new IotScadaRepository();

export class IotScadaService {
  // Statistics & Executive Overview
  public async getIotStats() {
    return iotScadaRepository.getIotStats();
  }

  public async getScadaStats() {
    return iotScadaRepository.getIotStats();
  }

  // Devices
  public async getDevices(filters?: { status?: string; protocol?: string; projectId?: string }) {
    return iotScadaRepository.getDevices(filters);
  }

  public async getDeviceById(id: string) {
    const dev = await iotScadaRepository.getDeviceById(id);
    if (!dev) {
      throw new Error('IoT Device not found');
    }
    return dev;
  }

  public async createDevice(data: any, createdBy: string) {
    return iotScadaRepository.createDevice(data, createdBy);
  }

  public async updateDevice(id: string, data: any, updatedBy: string) {
    const existing = await iotScadaRepository.getDeviceById(id);
    if (!existing) {
      throw new Error('IoT Device not found');
    }
    return iotScadaRepository.updateDevice(id, data, updatedBy);
  }

  // Gateways
  public async getGateways() {
    return iotScadaRepository.getGateways();
  }

  public async createGateway(data: any, createdBy: string) {
    return iotScadaRepository.createGateway(data, createdBy);
  }

  // RTU & PLC
  public async getRtuUnits() {
    return iotScadaRepository.getRtuUnits();
  }

  public async createRtuUnit(data: any, createdBy: string) {
    return iotScadaRepository.createRtuUnit(data, createdBy);
  }

  public async getPlcUnits() {
    return iotScadaRepository.getPlcUnits();
  }

  public async createPlcUnit(data: any, createdBy: string) {
    return iotScadaRepository.createPlcUnit(data, createdBy);
  }

  // Sensors
  public async getSensors() {
    return iotScadaRepository.getSensors();
  }

  public async createSensor(data: any, createdBy: string) {
    return iotScadaRepository.createSensor(data, createdBy);
  }

  // Telemetry Engine
  public async ingestTelemetry(data: any) {
    return iotScadaRepository.ingestTelemetry(data);
  }

  public async getLatestTelemetry(limit?: number) {
    return iotScadaRepository.getLatestTelemetry(limit);
  }

  public async getHistoricalTelemetry(pointId?: string, deviceId?: string, limit?: number) {
    return iotScadaRepository.getHistoricalTelemetry(pointId, deviceId, limit);
  }

  // Alarms
  public async getAlarms(status?: string, severity?: string) {
    return iotScadaRepository.getAlarms(status, severity);
  }

  public async acknowledgeAlarm(alarmId: string, user: { id: string; name: string }, comments: string, expectedAction?: string) {
    return iotScadaRepository.acknowledgeAlarm(alarmId, user, comments, expectedAction);
  }

  public async resolveAlarm(alarmId: string, resolvedBy: string, resolutionNotes: string, createWorkOrder?: boolean, workOrderId?: string) {
    return iotScadaRepository.resolveAlarm(alarmId, resolvedBy, resolutionNotes, createWorkOrder, workOrderId);
  }

  // Equipment Health & Predictive Maintenance
  public async getEquipmentHealth() {
    return iotScadaRepository.getEquipmentHealth();
  }

  public async getPredictiveMaintenanceData() {
    return iotScadaRepository.getPredictiveMaintenanceData();
  }

  // Energy
  public async getEnergyMetrics() {
    return iotScadaRepository.getEnergyMetrics();
  }

  public async ingestEnergy(data: any) {
    return iotScadaRepository.ingestEnergy(data);
  }

  // Remote Commands
  public async sendDeviceCommand(data: {
    deviceId: string;
    assetId?: string;
    commandType: string;
    targetRegister?: string;
    parameterValue?: string;
    timeoutSeconds?: number;
    requestedBy: string;
    authorizedBy: string;
  }) {
    return iotScadaRepository.sendDeviceCommand(data);
  }

  public async getCommandsHistory(limit?: number) {
    return iotScadaRepository.getCommandsHistory(limit);
  }

  // SCADA Tags & Dashboards
  public async getScadaTags() {
    return iotScadaRepository.getScadaTags();
  }

  public async getScadaDashboards() {
    return iotScadaRepository.getScadaDashboards();
  }
}

export const iotScadaService = new IotScadaService();
