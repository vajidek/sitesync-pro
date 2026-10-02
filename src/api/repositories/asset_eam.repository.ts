import { db, createPool } from '../../db';
import { 
  phase58Assets, 
  assetTransfers, 
  assetAssignments, 
  assetMeterReadings, 
  assetMaintenancePlans, 
  assetWorkOrders, 
  assetFuelLogs, 
  assetCalibrations 
} from '../../db/schema';
import { eq, and, isNull, desc, sql, like, or } from 'drizzle-orm';
import crypto from 'crypto';

let isEAMTablesCreated = false;

async function ensureEAMTablesExist() {
  if (isEAMTablesCreated) return;
  try {
    isEAMTablesCreated = true;
  } catch (e) {
    console.error('Error ensuring EAM tables exist:', e);
  }
}

export class AssetEAMRepository {
  async findAssets(query?: { search?: string; category?: string; status?: string; projectId?: string }) {
    await ensureEAMTablesExist();
    let conditions = [isNull(phase58Assets.deletedAt)];

    if (query?.category) {
      conditions.push(eq(phase58Assets.category, query.category));
    }
    if (query?.status) {
      conditions.push(eq(phase58Assets.status, query.status));
    }
    if (query?.projectId) {
      conditions.push(eq(phase58Assets.projectId, query.projectId));
    }
    if (query?.search) {
      const searchPattern = `%${query.search.toLowerCase()}%`;
      conditions.push(
        or(
          like(sql`LOWER(${phase58Assets.name})`, searchPattern),
          like(sql`LOWER(${phase58Assets.assetNumber})`, searchPattern),
          like(sql`LOWER(${phase58Assets.serialNumber})`, searchPattern),
          like(sql`LOWER(${phase58Assets.manufacturer})`, searchPattern)
        )!
      );
    }

    return await db.select().from(phase58Assets)
      .where(and(...conditions))
      .orderBy(desc(phase58Assets.createdAt));
  }

  async findAssetById(id: string) {
    await ensureEAMTablesExist();
    const records = await db.select().from(phase58Assets)
      .where(and(eq(phase58Assets.id, id), isNull(phase58Assets.deletedAt)));
    return records[0] || null;
  }

  async createAsset(data: any) {
    await ensureEAMTablesExist();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const newAsset = {
      id,
      assetNumber: data.assetNumber,
      name: data.name,
      qrCode: `QR-${data.assetNumber}`,
      barcode: `BC-${data.assetNumber}`,
      rfidTag: `RFID-${data.assetNumber}`,
      category: data.category || 'HEAVY_EQUIPMENT',
      subcategory: data.subcategory || null,
      assetGroup: data.assetGroup || null,
      projectId: data.projectId || null,
      projectName: data.projectName || null,
      department: data.department || 'FLEET_PLANT',
      warehouseId: data.warehouseId || null,
      currentLocation: data.currentLocation,
      gpsCoordinates: data.gpsCoordinates || null,
      manufacturer: data.manufacturer,
      model: data.model,
      serialNumber: data.serialNumber,
      purchaseDate: data.purchaseDate,
      commissionDate: data.commissionDate || data.purchaseDate,
      warrantyStartDate: data.warrantyStartDate || data.purchaseDate,
      warrantyEndDate: data.warrantyEndDate || null,
      insurancePolicyNo: data.insurancePolicyNo || null,
      insuranceExpiryDate: data.insuranceExpiryDate || null,
      amcContractNo: data.amcContractNo || null,
      amcExpiryDate: data.amcExpiryDate || null,
      purchaseValue: data.purchaseValue,
      currentValue: data.currentValue ?? data.purchaseValue,
      residualValue: data.residualValue ?? 0,
      usefulLifeYears: data.usefulLifeYears ?? 10,
      depreciationMethod: data.depreciationMethod || 'STRAIGHT_LINE',
      responsibleEmployeeId: data.responsibleEmployeeId || null,
      responsibleEmployeeName: data.responsibleEmployeeName || null,
      status: 'ACTIVE',
      criticality: data.criticality || 'MEDIUM',
      runningHoursMeter: 0,
      odometerKm: 0,
      fuelEfficiencyKmPerL: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
    };

    await db.insert(phase58Assets).values(newAsset);
    return newAsset;
  }

  async updateAssetStatus(id: string, status: string) {
    const now = new Date().toISOString();
    await db.update(phase58Assets)
      .set({ status, updatedAt: now })
      .where(eq(phase58Assets.id, id));
  }

  async createTransfer(data: any) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const newTransfer = {
      id,
      transferNumber: data.transferNumber,
      assetId: data.assetId,
      assetName: data.assetName,
      fromLocation: data.fromLocation,
      toLocation: data.toLocation,
      fromProjectId: data.fromProjectId || null,
      toProjectId: data.toProjectId || null,
      requestedBy: data.requestedBy,
      approvedBy: 'Fleet Manager',
      dispatchDate: data.dispatchDate,
      status: 'DISPATCHED',
      notes: data.notes || null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(assetTransfers).values(newTransfer);

    // Update current location in Asset Master
    await db.update(phase58Assets)
      .set({ currentLocation: data.toLocation, status: 'IN_TRANSIT', updatedAt: now })
      .where(eq(phase58Assets.id, data.assetId));

    return newTransfer;
  }

  async createAssignment(data: any) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const newAssignment = {
      id,
      assetId: data.assetId,
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      assignedDate: data.assignedDate,
      expectedReturnDate: data.expectedReturnDate || null,
      purpose: data.purpose,
      conditionOnAssign: data.conditionOnAssign || 'EXCELLENT',
      status: 'ACTIVE',
      assignedBy: 'System Administrator',
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(assetAssignments).values(newAssignment);

    // Update responsible person in Asset Master
    await db.update(phase58Assets)
      .set({ 
        responsibleEmployeeId: data.employeeId, 
        responsibleEmployeeName: data.employeeName, 
        updatedAt: now 
      })
      .where(eq(phase58Assets.id, data.assetId));

    return newAssignment;
  }

  async createMeterReading(data: any) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const newReading = {
      id,
      assetId: data.assetId,
      readingType: data.readingType || 'RUNNING_HOURS',
      readingValue: data.readingValue,
      unit: data.unit || 'HRS',
      readingDate: data.readingDate,
      recordedBy: data.recordedBy,
      notes: data.notes || null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(assetMeterReadings).values(newReading);

    // Sync back to Asset Master
    if (data.readingType === 'RUNNING_HOURS') {
      await db.update(phase58Assets)
        .set({ runningHoursMeter: data.readingValue, updatedAt: now })
        .where(eq(phase58Assets.id, data.assetId));
    } else if (data.readingType === 'ODOMETER_KM') {
      await db.update(phase58Assets)
        .set({ odometerKm: data.readingValue, updatedAt: now })
        .where(eq(phase58Assets.id, data.assetId));
    }

    return newReading;
  }

  async createMaintenancePlan(data: any) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const newPlan = {
      id,
      planNumber: data.planNumber,
      assetId: data.assetId,
      assetName: data.assetName,
      planType: data.planType || 'PREVENTIVE',
      triggerType: data.triggerType || 'TIME_BASED',
      intervalDays: data.intervalDays ?? 30,
      intervalMeterValue: data.intervalMeterValue ?? 250,
      nextDueDate: data.nextDueDate,
      taskDescription: data.taskDescription,
      priority: data.priority || 'MEDIUM',
      assignedTechnician: data.assignedTechnician || null,
      estimatedDurationHours: data.estimatedDurationHours ?? 4,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(assetMaintenancePlans).values(newPlan);
    return newPlan;
  }

  async findMaintenancePlans(assetId?: string) {
    if (assetId) {
      return await db.select().from(assetMaintenancePlans)
        .where(eq(assetMaintenancePlans.assetId, assetId))
        .orderBy(desc(assetMaintenancePlans.createdAt));
    }
    return await db.select().from(assetMaintenancePlans)
      .orderBy(desc(assetMaintenancePlans.createdAt));
  }

  async createWorkOrder(data: any) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const newWO = {
      id,
      workOrderNumber: data.workOrderNumber,
      assetId: data.assetId,
      assetName: data.assetName,
      workOrderType: data.workOrderType || 'PREVENTIVE',
      priority: data.priority || 'MEDIUM',
      summary: data.summary,
      description: data.description,
      maintenancePlanId: data.maintenancePlanId || null,
      failureCode: data.failureCode || null,
      assignedTechnician: data.assignedTechnician,
      scheduledStartDate: data.scheduledStartDate,
      scheduledEndDate: data.scheduledEndDate,
      laborHoursSpent: 0,
      laborCost: 0,
      partsCost: 0,
      totalCost: 0,
      downtimeHours: 0,
      status: 'SCHEDULED',
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(assetWorkOrders).values(newWO);

    // Update asset status if CORRECTIVE / EMERGENCY
    if (data.workOrderType === 'CORRECTIVE' || data.workOrderType === 'EMERGENCY') {
      await db.update(phase58Assets)
        .set({ status: 'UNDER_MAINTENANCE', updatedAt: now })
        .where(eq(phase58Assets.id, data.assetId));
    }

    return newWO;
  }

  async findWorkOrders(query?: { assetId?: string; status?: string }) {
    await ensureEAMTablesExist();
    let conditions = [];
    if (query?.assetId) conditions.push(eq(assetWorkOrders.assetId, query.assetId));
    if (query?.status) conditions.push(eq(assetWorkOrders.status, query.status));

    if (conditions.length > 0) {
      return await db.select().from(assetWorkOrders)
        .where(and(...conditions))
        .orderBy(desc(assetWorkOrders.createdAt));
    }
    return await db.select().from(assetWorkOrders)
      .orderBy(desc(assetWorkOrders.createdAt));
  }

  async updateWorkOrder(id: string, data: any) {
    const now = new Date().toISOString();
    const totalCost = (data.laborCost || 0) + (data.partsCost || 0);

    const updatePayload: any = {
      ...data,
      totalCost,
      updatedAt: now,
    };

    await db.update(assetWorkOrders)
      .set(updatePayload)
      .where(eq(assetWorkOrders.id, id));

    // If completed or approved, return asset to ACTIVE
    if (data.status === 'COMPLETED' || data.status === 'APPROVED') {
      const wo = await db.select().from(assetWorkOrders).where(eq(assetWorkOrders.id, id));
      if (wo[0]) {
        await db.update(phase58Assets)
          .set({ status: 'ACTIVE', updatedAt: now })
          .where(eq(phase58Assets.id, wo[0].assetId));
      }
    }
  }

  async createFuelLog(data: any) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const totalAmount = data.quantityLiters * data.pricePerLiter;

    const newFuelLog = {
      id,
      logNumber: data.logNumber,
      assetId: data.assetId,
      assetName: data.assetName,
      fuelType: data.fuelType || 'DIESEL',
      quantityLiters: data.quantityLiters,
      pricePerLiter: data.pricePerLiter,
      totalAmount,
      odometerReading: data.odometerReading || null,
      runningHourReading: data.runningHourReading || null,
      fuelStationVendor: data.fuelStationVendor,
      driverOrOperatorName: data.driverOrOperatorName,
      logDate: data.logDate,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(assetFuelLogs).values(newFuelLog);
    return newFuelLog;
  }

  async findFuelLogs(assetId?: string) {
    await ensureEAMTablesExist();
    if (assetId) {
      return await db.select().from(assetFuelLogs)
        .where(eq(assetFuelLogs.assetId, assetId))
        .orderBy(desc(assetFuelLogs.createdAt));
    }
    return await db.select().from(assetFuelLogs)
      .orderBy(desc(assetFuelLogs.createdAt));
  }

  async createCalibration(data: any) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const newCal = {
      id,
      calibrationNumber: data.calibrationNumber,
      assetId: data.assetId,
      assetName: data.assetName,
      calibrationDate: data.calibrationDate,
      dueDate: data.dueDate,
      certifiedVendorName: data.certifiedVendorName,
      certificateNo: data.certificateNo,
      accuracyRange: data.accuracyRange || null,
      resultStatus: data.resultStatus || 'PASSED',
      nextCalibrationDate: data.nextCalibrationDate,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(assetCalibrations).values(newCal);
    return newCal;
  }

  async findCalibrations(assetId?: string) {
    if (assetId) {
      return await db.select().from(assetCalibrations)
        .where(eq(assetCalibrations.assetId, assetId))
        .orderBy(desc(assetCalibrations.createdAt));
    }
    return await db.select().from(assetCalibrations)
      .orderBy(desc(assetCalibrations.createdAt));
  }

  async getEAMStats() {
    await ensureEAMTablesExist();
    const assets = await db.select().from(phase58Assets).where(isNull(phase58Assets.deletedAt));
    const workOrders = await db.select().from(assetWorkOrders);
    const fuelLogs = await db.select().from(assetFuelLogs);

    const totalAssets = assets.length;
    const activeAssets = assets.filter(a => a.status === 'ACTIVE').length;
    const idleAssets = assets.filter(a => a.status === 'IDLE').length;
    const underMaintenance = assets.filter(a => a.status === 'UNDER_MAINTENANCE').length;
    const totalAssetValue = assets.reduce((sum, a) => sum + (a.purchaseValue || 0), 0);

    const totalWorkOrders = workOrders.length;
    const pendingWorkOrders = workOrders.filter(w => w.status === 'SCHEDULED' || w.status === 'IN_PROGRESS').length;
    const totalMaintenanceCost = workOrders.reduce((sum, w) => sum + (w.totalCost || 0), 0);
    const totalDowntimeHours = workOrders.reduce((sum, w) => sum + (w.downtimeHours || 0), 0);

    const totalFuelCost = fuelLogs.reduce((sum, f) => sum + (f.totalAmount || 0), 0);
    const totalFuelLiters = fuelLogs.reduce((sum, f) => sum + (f.quantityLiters || 0), 0);

    // Mean Time Between Failures (MTBF) & Mean Time To Repair (MTTR) calculation
    const totalBreakdowns = workOrders.filter(w => w.workOrderType === 'CORRECTIVE' || w.workOrderType === 'EMERGENCY').length;
    const mttrHours = totalBreakdowns > 0 ? (totalDowntimeHours / totalBreakdowns).toFixed(1) : '0.0';
    const mtbfHours = totalBreakdowns > 0 ? ((24 * 30 * totalAssets) / totalBreakdowns).toFixed(1) : '720.0';

    return {
      totalAssets,
      activeAssets,
      idleAssets,
      underMaintenance,
      totalAssetValue,
      totalWorkOrders,
      pendingWorkOrders,
      totalMaintenanceCost,
      totalDowntimeHours,
      totalFuelCost,
      totalFuelLiters,
      mttrHours: Number(mttrHours),
      mtbfHours: Number(mtbfHours)
    };
  }
}
