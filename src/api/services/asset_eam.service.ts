import { AssetEAMRepository } from '../repositories/asset_eam.repository';

export class AssetEAMService {
  private repo: AssetEAMRepository;

  constructor() {
    this.repo = new AssetEAMRepository();
  }

  async getAssets(query?: { search?: string; category?: string; status?: string; projectId?: string }) {
    return await this.repo.findAssets(query);
  }

  async getAssetById(id: string) {
    const asset = await this.repo.findAssetById(id);
    if (!asset) {
      throw new Error('Asset not found');
    }
    return asset;
  }

  async registerAsset(data: any) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const assetNumber = `AST-2026-${randomSuffix}`;

    return await this.repo.createAsset({
      ...data,
      assetNumber
    });
  }

  async transferAsset(data: any) {
    const asset = await this.repo.findAssetById(data.assetId);
    if (!asset) {
      throw new Error('Asset not found for transfer');
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const transferNumber = `TRN-2026-${randomSuffix}`;

    return await this.repo.createTransfer({
      ...data,
      assetName: asset.name,
      transferNumber
    });
  }

  async assignAsset(data: any) {
    const asset = await this.repo.findAssetById(data.assetId);
    if (!asset) {
      throw new Error('Asset not found for assignment');
    }

    return await this.repo.createAssignment(data);
  }

  async recordMeterReading(data: any) {
    const asset = await this.repo.findAssetById(data.assetId);
    if (!asset) {
      throw new Error('Asset not found for meter reading');
    }

    return await this.repo.createMeterReading(data);
  }

  async createMaintenancePlan(data: any) {
    const asset = await this.repo.findAssetById(data.assetId);
    if (!asset) {
      throw new Error('Asset not found for maintenance plan');
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const planNumber = `PLN-2026-${randomSuffix}`;

    return await this.repo.createMaintenancePlan({
      ...data,
      assetName: asset.name,
      planNumber
    });
  }

  async getMaintenancePlans(assetId?: string) {
    return await this.repo.findMaintenancePlans(assetId);
  }

  async createWorkOrder(data: any) {
    const asset = await this.repo.findAssetById(data.assetId);
    if (!asset) {
      throw new Error('Asset not found for work order');
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const workOrderNumber = `WO-2026-${randomSuffix}`;

    return await this.repo.createWorkOrder({
      ...data,
      assetName: asset.name,
      workOrderNumber
    });
  }

  async getWorkOrders(query?: { assetId?: string; status?: string }) {
    return await this.repo.findWorkOrders(query);
  }

  async updateWorkOrder(id: string, data: any) {
    await this.repo.updateWorkOrder(id, data);
    return { success: true, message: 'Work order updated successfully' };
  }

  async logFuel(data: any) {
    const asset = await this.repo.findAssetById(data.assetId);
    if (!asset) {
      throw new Error('Asset not found for fuel logging');
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const logNumber = `FUL-2026-${randomSuffix}`;

    return await this.repo.createFuelLog({
      ...data,
      assetName: asset.name,
      logNumber
    });
  }

  async getFuelLogs(assetId?: string) {
    return await this.repo.findFuelLogs(assetId);
  }

  async logCalibration(data: any) {
    const asset = await this.repo.findAssetById(data.assetId);
    if (!asset) {
      throw new Error('Asset not found for calibration logging');
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const calibrationNumber = `CAL-2026-${randomSuffix}`;

    return await this.repo.createCalibration({
      ...data,
      assetName: asset.name,
      calibrationNumber
    });
  }

  async getCalibrations(assetId?: string) {
    return await this.repo.findCalibrations(assetId);
  }

  async getDashboardStats() {
    return await this.repo.getEAMStats();
  }
}
