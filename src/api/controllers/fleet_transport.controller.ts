import { Request, Response } from 'express';
import { FleetTransportService } from '../services/fleet_transport.service';
import {
  createVehicleSchema,
  updateVehicleSchema,
  createDriverSchema,
  createTripSchema,
  completeTripSchema,
  createFuelLogSchema,
  createAccidentSchema,
  createDocumentSchema,
} from '../validators/fleet_transport.validator';

const service = new FleetTransportService();

export class FleetTransportController {
  async getVehicles(req: Request, res: Response) {
    try {
      const { search, category, status } = req.query;
      const vehicles = await service.getVehicles({
        search: search as string,
        category: category as string,
        status: status as string,
      });
      res.json({ success: true, count: vehicles.length, data: vehicles });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async getVehicleById(req: Request, res: Response) {
    try {
      const vehicle = await service.getVehicleById(req.params.id);
      res.json({ success: true, data: vehicle });
    } catch (e: any) {
      res.status(404).json({ success: false, message: e.message });
    }
  }

  async registerVehicle(req: Request, res: Response) {
    try {
      const validated = createVehicleSchema.parse(req.body);
      const vehicle = await service.registerVehicle(validated);
      res.status(201).json({ success: true, data: vehicle });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async updateVehicle(req: Request, res: Response) {
    try {
      const validated = updateVehicleSchema.parse(req.body);
      const updated = await service.updateVehicle(req.params.id, validated);
      res.json({ success: true, data: updated });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async getDrivers(req: Request, res: Response) {
    try {
      const drivers = await service.getDrivers();
      res.json({ success: true, count: drivers.length, data: drivers });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async registerDriver(req: Request, res: Response) {
    try {
      const validated = createDriverSchema.parse(req.body);
      const driver = await service.registerDriver(validated);
      res.status(201).json({ success: true, data: driver });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async getTrips(req: Request, res: Response) {
    try {
      const vehicleId = req.query.vehicleId as string;
      const trips = await service.getTrips(vehicleId);
      res.json({ success: true, count: trips.length, data: trips });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async dispatchTrip(req: Request, res: Response) {
    try {
      const validated = createTripSchema.parse(req.body);
      const trip = await service.dispatchTrip(validated);
      res.status(201).json({ success: true, data: trip });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async completeTrip(req: Request, res: Response) {
    try {
      const validated = completeTripSchema.parse(req.body);
      const trip = await service.completeTrip(req.params.id, validated);
      res.json({ success: true, data: trip });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async logFuel(req: Request, res: Response) {
    try {
      const validated = createFuelLogSchema.parse(req.body);
      const log = await service.logFuel(validated);
      res.status(201).json({ success: true, data: log });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async getFuelLogs(req: Request, res: Response) {
    try {
      const vehicleId = req.query.vehicleId as string;
      const logs = await service.getFuelLogs(vehicleId);
      res.json({ success: true, count: logs.length, data: logs });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async reportAccident(req: Request, res: Response) {
    try {
      const validated = createAccidentSchema.parse(req.body);
      const accident = await service.reportAccident(validated);
      res.status(201).json({ success: true, data: accident });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async registerDocument(req: Request, res: Response) {
    try {
      const validated = createDocumentSchema.parse(req.body);
      const doc = await service.registerDocument(validated);
      res.status(201).json({ success: true, data: doc });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async getDocuments(req: Request, res: Response) {
    try {
      const vehicleId = req.query.vehicleId as string;
      const docs = await service.getDocuments(vehicleId);
      res.json({ success: true, count: docs.length, data: docs });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async getFleetStats(req: Request, res: Response) {
    try {
      const stats = await service.getFleetStats();
      res.json({ success: true, data: stats });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
}
