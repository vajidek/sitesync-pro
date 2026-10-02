import { eamRepository } from '../repositories/eam.repository';

export class EamService {
  // Stats & Dashboard
  public async getDashboardStats() {
    return eamRepository.getDashboardStats();
  }

  // Categories
  public async getCategories() {
    return eamRepository.getCategories();
  }

  public async createCategory(data: any, createdBy: string) {
    return eamRepository.createCategory(data, createdBy);
  }

  // Assets
  public async getAssets(filters?: { categoryId?: string; status?: string; criticality?: string }) {
    return eamRepository.getAssets(filters);
  }

  public async getAssetById(id: string) {
    const asset = await eamRepository.getAssetById(id);
    if (!asset) {
      throw new Error('Asset not found');
    }
    return asset;
  }

  public async createAsset(data: any, createdBy: string) {
    return eamRepository.createAsset(data, createdBy);
  }

  public async updateAsset(id: string, data: any, updatedBy: string) {
    const existing = await eamRepository.getAssetById(id);
    if (!existing) {
      throw new Error('Asset not found');
    }
    return eamRepository.updateAsset(id, data, updatedBy);
  }

  // Locations & Criticality
  public async getLocations() {
    return eamRepository.getLocations();
  }

  public async createLocation(data: any, createdBy: string) {
    return eamRepository.createLocation(data, createdBy);
  }

  public async getCriticalityMatrix() {
    return eamRepository.getCriticalityMatrix();
  }

  // Preventive Plans & Schedules
  public async getPreventivePlans() {
    return eamRepository.getPreventivePlans();
  }

  public async createPreventivePlan(data: any, createdBy: string) {
    return eamRepository.createPreventivePlan(data, createdBy);
  }

  public async getMaintenanceSchedules() {
    return eamRepository.getMaintenanceSchedules();
  }

  public async createMaintenanceSchedule(data: any, createdBy: string) {
    return eamRepository.createMaintenanceSchedule(data, createdBy);
  }

  // Work Orders
  public async getWorkOrders(filters?: { status?: string; workOrderType?: string; assetId?: string }) {
    return eamRepository.getWorkOrders(filters);
  }

  public async getWorkOrderById(id: string) {
    const wo = await eamRepository.getWorkOrderById(id);
    if (!wo) {
      throw new Error('Work order not found');
    }
    return wo;
  }

  public async createWorkOrder(data: any, createdBy: string) {
    // If work order is for corrective/emergency breakdown, auto-set asset status to UNDER_MAINTENANCE
    if (data.workOrderType === 'CORRECTIVE_BREAKDOWN' || data.workOrderType === 'EMERGENCY') {
      await eamRepository.updateAsset(data.assetId, { status: 'UNDER_MAINTENANCE' }, createdBy);
    }
    return eamRepository.createWorkOrder(data, createdBy);
  }

  public async updateWorkOrder(id: string, data: any, updatedBy: string) {
    const existing = await eamRepository.getWorkOrderById(id);
    if (!existing) {
      throw new Error('Work order not found');
    }

    const updated = await eamRepository.updateWorkOrder(id, data, updatedBy);

    // If work order completed or closed, check if asset should return to OPERATIONAL
    if (data.status === 'COMPLETED' || data.status === 'VERIFIED_CLOSED') {
      await eamRepository.updateAsset(existing.assetId, { status: 'OPERATIONAL' }, updatedBy);
    }

    return updated;
  }

  // Breakdowns
  public async getBreakdownReports() {
    return eamRepository.getBreakdownReports();
  }

  public async createBreakdownReport(data: any, createdBy: string) {
    return eamRepository.createBreakdownReport(data, createdBy);
  }

  // Telemetry & Condition Monitoring
  public async getConditionMonitoring(assetId?: string) {
    return eamRepository.getConditionMonitoring(assetId);
  }

  public async createConditionMonitoring(data: any, createdBy: string) {
    return eamRepository.createConditionMonitoring(data, createdBy);
  }

  // Calibrations & Inspections
  public async getCalibrationRecords() {
    return eamRepository.getCalibrationRecords();
  }

  public async createCalibrationRecord(data: any, createdBy: string) {
    return eamRepository.createCalibrationRecord(data, createdBy);
  }

  public async getInspectionRecords() {
    return eamRepository.getInspectionRecords();
  }

  public async createInspectionRecord(data: any, createdBy: string) {
    return eamRepository.createInspectionRecord(data, createdBy);
  }

  // Maintenance Costs & Audit Logs
  public async getMaintenanceCosts() {
    return eamRepository.getMaintenanceCosts();
  }

  public async getAuditLogs() {
    return eamRepository.getAuditLogs();
  }
}

export const eamService = new EamService();
