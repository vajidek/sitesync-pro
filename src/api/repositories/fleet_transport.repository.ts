import { db, createPool } from '../../db';
import {
  phase59FleetVehicles,
  phase59FleetDrivers,
  phase59FleetTrips,
  phase59FleetFuelLogs,
  phase59FleetMaintenance,
  phase59FleetAccidents,
  phase59FleetDocuments
} from '../../db/schema';
import { eq, and, isNull, desc, sql, like, or } from 'drizzle-orm';
import crypto from 'crypto';

let isFleetTablesCreated = false;

async function ensureFleetTablesExist() {
  if (isFleetTablesCreated) return;
  try {
    isFleetTablesCreated = true;
  } catch (e) {
    console.error('Error ensuring Fleet Phase 59 tables exist:', e);
  }
}

export class FleetTransportRepository {
  async findVehicles(query?: { search?: string; category?: string; status?: string }) {
    await ensureFleetTablesExist();
    let conditions = [isNull(phase59FleetVehicles.deletedAt)];

    if (query?.category) {
      conditions.push(eq(phase59FleetVehicles.category, query.category));
    }
    if (query?.status) {
      conditions.push(eq(phase59FleetVehicles.status, query.status));
    }
    if (query?.search) {
      conditions.push(
        or(
          like(phase59FleetVehicles.vehicleNumber, `%${query.search}%`),
          like(phase59FleetVehicles.manufacturer, `%${query.search}%`),
          like(phase59FleetVehicles.model, `%${query.search}%`),
          like(phase59FleetVehicles.vin, `%${query.search}%`)
        )
      );
    }

    return await db.select().from(phase59FleetVehicles)
      .where(and(...conditions))
      .orderBy(desc(phase59FleetVehicles.createdAt));
  }

  async findVehicleById(id: string) {
    await ensureFleetTablesExist();
    const records = await db.select().from(phase59FleetVehicles)
      .where(and(eq(phase59FleetVehicles.id, id), isNull(phase59FleetVehicles.deletedAt)));
    return records[0] || null;
  }

  async createVehicle(data: any) {
    await ensureFleetTablesExist();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const record = {
      id,
      ...data,
      assetNumber: data.assetNumber || `AST-FLT-${Math.floor(1000 + Math.random() * 9000)}`,
      qrCode: `QR-VEH-${data.vehicleNumber}`,
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
    };

    await db.insert(phase59FleetVehicles).values(record);
    return record;
  }

  async updateVehicle(id: string, data: any) {
    await ensureFleetTablesExist();
    const now = new Date().toISOString();
    const updated = { ...data, updatedAt: now };
    await db.update(phase59FleetVehicles).set(updated).where(eq(phase59FleetVehicles.id, id));
    return this.findVehicleById(id);
  }

  // Driver Methods
  async findDrivers() {
    await ensureFleetTablesExist();
    return await db.select().from(phase59FleetDrivers)
      .where(isNull(phase59FleetDrivers.deletedAt))
      .orderBy(desc(phase59FleetDrivers.createdAt));
  }

  async findDriverById(id: string) {
    await ensureFleetTablesExist();
    const result = await db.select().from(phase59FleetDrivers)
      .where(and(eq(phase59FleetDrivers.id, id), isNull(phase59FleetDrivers.deletedAt)));
    return result[0] || null;
  }

  async createDriver(data: any) {
    await ensureFleetTablesExist();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const driverCode = `DRV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const record = {
      id,
      driverCode,
      ...data,
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
    };

    await db.insert(phase59FleetDrivers).values(record);
    return record;
  }

  // Trip Methods
  async findTrips(vehicleId?: string) {
    await ensureFleetTablesExist();
    if (vehicleId) {
      return await db.select().from(phase59FleetTrips)
        .where(and(eq(phase59FleetTrips.vehicleId, vehicleId), isNull(phase59FleetTrips.deletedAt)))
        .orderBy(desc(phase59FleetTrips.createdAt));
    }
    return await db.select().from(phase59FleetTrips)
      .where(isNull(phase59FleetTrips.deletedAt))
      .orderBy(desc(phase59FleetTrips.createdAt));
  }

  async createTrip(data: any) {
    await ensureFleetTablesExist();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const tripNumber = `TRIP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const record = {
      id,
      tripNumber,
      ...data,
      status: 'APPROVED',
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
    };

    await db.insert(phase59FleetTrips).values(record);
    // Mark vehicle as ON_TRIP
    await db.update(phase59FleetVehicles)
      .set({ status: 'ON_TRIP', updatedAt: now })
      .where(eq(phase59FleetVehicles.id, data.vehicleId));

    return record;
  }

  async completeTrip(id: string, completionData: any) {
    await ensureFleetTablesExist();
    const now = new Date().toISOString();
    const trips = await db.select().from(phase59FleetTrips).where(eq(phase59FleetTrips.id, id));
    if (!trips.length) return null;

    const trip = trips[0];
    const distanceKm = Math.max(0, completionData.endOdometerKm - trip.startOdometerKm);

    await db.update(phase59FleetTrips)
      .set({
        ...completionData,
        distanceKm,
        status: 'COMPLETED',
        updatedAt: now,
      })
      .where(eq(phase59FleetTrips.id, id));

    // Release vehicle
    await db.update(phase59FleetVehicles)
      .set({
        status: 'AVAILABLE',
        odometerKm: completionData.endOdometerKm,
        updatedAt: now,
      })
      .where(eq(phase59FleetVehicles.id, trip.vehicleId));

    return { ...trip, ...completionData, distanceKm, status: 'COMPLETED' };
  }

  // Fuel Logs
  async createFuelLog(data: any) {
    await ensureFleetTablesExist();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const fuelLogNumber = `FFL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalCost = data.quantityLiters * data.costPerLiter;

    const record = {
      id,
      fuelLogNumber,
      totalCost,
      ...data,
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
    };

    await db.insert(phase59FleetFuelLogs).values(record);
    return record;
  }

  async findFuelLogs(vehicleId?: string) {
    await ensureFleetTablesExist();
    if (vehicleId) {
      return await db.select().from(phase59FleetFuelLogs)
        .where(and(eq(phase59FleetFuelLogs.vehicleId, vehicleId), isNull(phase59FleetFuelLogs.deletedAt)))
        .orderBy(desc(phase59FleetFuelLogs.createdAt));
    }
    return await db.select().from(phase59FleetFuelLogs)
      .where(isNull(phase59FleetFuelLogs.deletedAt))
      .orderBy(desc(phase59FleetFuelLogs.createdAt));
  }

  // Accidents
  async createAccident(data: any) {
    await ensureFleetTablesExist();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const accidentNumber = `ACC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const record = {
      id,
      accidentNumber,
      ...data,
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
    };

    await db.insert(phase59FleetAccidents).values(record);
    return record;
  }

  // Compliance Documents
  async createDocument(data: any) {
    await ensureFleetTablesExist();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const docNumber = `DOC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const record = {
      id,
      docNumber,
      ...data,
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
    };

    await db.insert(phase59FleetDocuments).values(record);
    return record;
  }

  async findDocuments(vehicleId?: string) {
    await ensureFleetTablesExist();
    if (vehicleId) {
      return await db.select().from(phase59FleetDocuments)
        .where(and(eq(phase59FleetDocuments.vehicleId, vehicleId), isNull(phase59FleetDocuments.deletedAt)))
        .orderBy(desc(phase59FleetDocuments.createdAt));
    }
    return await db.select().from(phase59FleetDocuments)
      .where(isNull(phase59FleetDocuments.deletedAt))
      .orderBy(desc(phase59FleetDocuments.createdAt));
  }

  // Stats Analytics
  async getFleetStats() {
    await ensureFleetTablesExist();
    const vehicles = await db.select().from(phase59FleetVehicles).where(isNull(phase59FleetVehicles.deletedAt));
    const trips = await db.select().from(phase59FleetTrips).where(isNull(phase59FleetTrips.deletedAt));
    const fuelLogs = await db.select().from(phase59FleetFuelLogs).where(isNull(phase59FleetFuelLogs.deletedAt));
    const drivers = await db.select().from(phase59FleetDrivers).where(isNull(phase59FleetDrivers.deletedAt));

    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.status === 'AVAILABLE' || v.status === 'ON_TRIP').length;
    const onTripVehicles = vehicles.filter(v => v.status === 'ON_TRIP').length;
    const maintenanceVehicles = vehicles.filter(v => v.status === 'IN_MAINTENANCE').length;
    const totalAssetValue = vehicles.reduce((sum, v) => sum + (v.currentValue || v.purchaseCost || 0), 0);

    const totalTrips = trips.length;
    const completedTrips = trips.filter(t => t.status === 'COMPLETED').length;
    const totalDistanceKm = trips.reduce((sum, t) => sum + (t.distanceKm || 0), 0);

    const totalFuelLiters = fuelLogs.reduce((sum, f) => sum + (f.quantityLiters || 0), 0);
    const totalFuelCost = fuelLogs.reduce((sum, f) => sum + (f.totalCost || 0), 0);

    return {
      totalVehicles,
      activeVehicles,
      onTripVehicles,
      maintenanceVehicles,
      totalAssetValue,
      totalTrips,
      completedTrips,
      totalDistanceKm,
      totalFuelLiters,
      totalFuelCost,
      activeDrivers: drivers.length,
      utilizationRatePercent: totalVehicles ? Math.round((activeVehicles / totalVehicles) * 100) : 0,
    };
  }
}
