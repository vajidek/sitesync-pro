import { FleetTransportRepository } from '../repositories/fleet_transport.repository';

export class FleetTransportService {
  private repo = new FleetTransportRepository();

  async getVehicles(query?: { search?: string; category?: string; status?: string }) {
    return await this.repo.findVehicles(query);
  }

  async getVehicleById(id: string) {
    const vehicle = await this.repo.findVehicleById(id);
    if (!vehicle) throw new Error('Vehicle not found');
    return vehicle;
  }

  async registerVehicle(data: any) {
    return await this.repo.createVehicle(data);
  }

  async updateVehicle(id: string, data: any) {
    return await this.repo.updateVehicle(id, data);
  }

  async getDrivers() {
    return await this.repo.findDrivers();
  }

  async registerDriver(data: any) {
    return await this.repo.createDriver(data);
  }

  async getTrips(vehicleId?: string) {
    return await this.repo.findTrips(vehicleId);
  }

  async dispatchTrip(data: any) {
    const vehicle = await this.repo.findVehicleById(data.vehicleId);
    if (!vehicle) throw new Error('Vehicle not found');
    if (vehicle.status === 'IN_MAINTENANCE') {
      throw new Error('Vehicle is currently under maintenance and cannot be dispatched on a trip');
    }

    const driver = data.driverId ? await this.repo.findDriverById(data.driverId) : null;
    const driverName = driver ? driver.fullName : (data.driverName || 'Assigned Driver');

    const vehicleNumber = vehicle.vehicleNumber;
    return await this.repo.createTrip({
      ...data,
      vehicleNumber,
      driverName,
    });
  }

  async completeTrip(id: string, data: any) {
    const result = await this.repo.completeTrip(id, data);
    if (!result) throw new Error('Trip not found');
    return result;
  }

  async logFuel(data: any) {
    const vehicle = await this.repo.findVehicleById(data.vehicleId);
    if (!vehicle) throw new Error('Vehicle not found');

    return await this.repo.createFuelLog({
      ...data,
      vehicleNumber: vehicle.vehicleNumber,
      driverName: data.driverName || vehicle.assignedDriverName || 'Fleet Operator',
    });
  }

  async getFuelLogs(vehicleId?: string) {
    return await this.repo.findFuelLogs(vehicleId);
  }

  async reportAccident(data: any) {
    const vehicle = await this.repo.findVehicleById(data.vehicleId);
    if (!vehicle) throw new Error('Vehicle not found');

    return await this.repo.createAccident({
      ...data,
      vehicleNumber: vehicle.vehicleNumber,
      driverName: data.driverName || vehicle.assignedDriverName || 'Assigned Driver',
    });
  }

  async registerDocument(data: any) {
    const vehicle = await this.repo.findVehicleById(data.vehicleId);
    if (!vehicle) throw new Error('Vehicle not found');

    return await this.repo.createDocument({
      ...data,
      vehicleNumber: vehicle.vehicleNumber,
    });
  }

  async getDocuments(vehicleId?: string) {
    return await this.repo.findDocuments(vehicleId);
  }

  async getFleetStats() {
    return await this.repo.getFleetStats();
  }
}
