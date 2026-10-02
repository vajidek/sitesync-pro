import { Request, Response, NextFunction } from 'express';
import { fleetRepository } from '../repositories/fleet.repository';
import { auditRepository } from '../repositories/audit.repository';

function parsePaginationParams(query: any) {
  return {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 20,
    search: query.search as string,
    status: query.status as string,
    projectId: query.projectId as string,
    vehicleType: query.vehicleType as string,
    category: query.category as string,
    assetType: query.assetType as string,
  };
}

export class FleetController {
  // ==========================================
  // VEHICLE MANAGEMENT
  // ==========================================
  async getVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parsePaginationParams(req.query);
      const result = await fleetRepository.getVehicles(params);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getVehicleById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const vehicle = await fleetRepository.getVehicleById(id);
      if (!vehicle) {
        return res.status(404).json({ success: false, error: 'Vehicle not found' });
      }
      res.json({ success: true, data: vehicle });
    } catch (err) {
      next(err);
    }
  }

  async createVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await fleetRepository.createVehicle(req.body);
      const user = (req as any).user;

      await auditRepository.logAction({
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
        action: 'CREATE_VEHICLE',
        module: 'FLEET',
        details: `Registered vehicle ${vehicle.vehicleNumber} (${vehicle.manufacturer} ${vehicle.model})`,
      });

      res.status(201).json({ success: true, data: vehicle });
    } catch (err) {
      next(err);
    }
  }

  async updateVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const vehicle = await fleetRepository.updateVehicle(id, req.body);
      if (!vehicle) {
        return res.status(404).json({ success: false, error: 'Vehicle not found' });
      }

      const user = (req as any).user;
      await auditRepository.logAction({
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
        action: 'UPDATE_VEHICLE',
        module: 'FLEET',
        details: `Updated vehicle ${vehicle.vehicleNumber} status to ${vehicle.status}`,
      });

      res.json({ success: true, data: vehicle });
    } catch (err) {
      next(err);
    }
  }

  async deleteVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const ok = await fleetRepository.deleteVehicle(id);
      if (!ok) {
        return res.status(404).json({ success: false, error: 'Vehicle not found' });
      }

      const user = (req as any).user;
      await auditRepository.logAction({
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
        action: 'DECOMMISSION_VEHICLE',
        module: 'FLEET',
        details: `Decommissioned vehicle ${id}`,
      });

      res.json({ success: true, message: 'Vehicle decommissioned successfully' });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // DRIVER MANAGEMENT
  // ==========================================
  async getDrivers(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parsePaginationParams(req.query);
      const result = await fleetRepository.getDrivers(params);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async createDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await fleetRepository.createDriver(req.body);
      const user = (req as any).user;

      await auditRepository.logAction({
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
        action: 'CREATE_DRIVER',
        module: 'FLEET',
        details: `Registered driver ${driver.driverName} (License: ${driver.licenseNumber})`,
      });

      res.status(201).json({ success: true, data: driver });
    } catch (err) {
      next(err);
    }
  }

  async updateDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const driver = await fleetRepository.updateDriver(id, req.body);
      if (!driver) {
        return res.status(404).json({ success: false, error: 'Driver profile not found' });
      }

      const user = (req as any).user;
      await auditRepository.logAction({
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
        action: 'UPDATE_DRIVER',
        module: 'FLEET',
        details: `Updated driver ${driver.driverName} details`,
      });

      res.json({ success: true, data: driver });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // EQUIPMENT MANAGEMENT
  // ==========================================
  async getEquipment(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parsePaginationParams(req.query);
      const result = await fleetRepository.getEquipment(params);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async createEquipment(req: Request, res: Response, next: NextFunction) {
    try {
      const eqp = await fleetRepository.createEquipment(req.body);
      const user = (req as any).user;

      await auditRepository.logAction({
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
        action: 'CREATE_EQUIPMENT',
        module: 'FLEET',
        details: `Registered heavy equipment ${eqp.equipmentCode} - ${eqp.equipmentName}`,
      });

      res.status(201).json({ success: true, data: eqp });
    } catch (err) {
      next(err);
    }
  }

  async updateEquipment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const eqp = await fleetRepository.updateEquipment(id, req.body);
      if (!eqp) {
        return res.status(404).json({ success: false, error: 'Equipment asset not found' });
      }

      const user = (req as any).user;
      await auditRepository.logAction({
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
        action: 'UPDATE_EQUIPMENT',
        module: 'FLEET',
        details: `Updated equipment ${eqp.equipmentCode} status to ${eqp.status}`,
      });

      res.json({ success: true, data: eqp });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // MAINTENANCE LOGS & SCHEDULING
  // ==========================================
  async getMaintenanceRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parsePaginationParams(req.query);
      const result = await fleetRepository.getMaintenanceRecords(params);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async createMaintenanceRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await fleetRepository.createMaintenanceRecord(req.body);
      const user = (req as any).user;

      await auditRepository.logAction({
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
        action: 'LOG_MAINTENANCE',
        module: 'FLEET',
        details: `Logged ${record.maintenanceType} maintenance for ${record.assetName} (${record.maintenanceCode})`,
      });

      res.status(201).json({ success: true, data: record });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // FUEL MANAGEMENT
  // ==========================================
  async getFuelLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parsePaginationParams(req.query);
      const result = await fleetRepository.getFuelLogs(params);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async createFuelLog(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const log = await fleetRepository.createFuelLog({
        ...req.body,
        filledById: user?.id,
        filledByName: req.body.filledByName || user?.name || 'Site Storekeeper',
      });

      await auditRepository.logAction({
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
        action: 'RECORD_FUEL_FILL',
        module: 'FLEET',
        details: `Recorded fuel refill ${log.quantityLiters}L (Cost ₹${log.totalCost}) for ${log.assetName}`,
      });

      res.status(201).json({ success: true, data: log });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // TRIP LOGS & DISPATCH
  // ==========================================
  async getTripLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parsePaginationParams(req.query);
      const result = await fleetRepository.getTripLogs(params);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async createTripLog(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const trip = await fleetRepository.createTripLog(req.body);

      await auditRepository.logAction({
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
        action: 'CREATE_TRIP_DISPATCH',
        module: 'FLEET',
        details: `Dispatched vehicle trip ${trip.tripCode} (${trip.vehicleNumber}) from ${trip.origin} to ${trip.destination}`,
      });

      res.status(201).json({ success: true, data: trip });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // ALERTS & NOTIFICATIONS
  // ==========================================
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const notifs = await fleetRepository.getNotifications();
      res.json({ success: true, data: notifs });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // ANALYTICS & REPORTS
  // ==========================================
  async getFleetAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await fleetRepository.getFleetAnalytics();
      res.json({ success: true, data: analytics });
    } catch (err) {
      next(err);
    }
  }
}

export const fleetController = new FleetController();
