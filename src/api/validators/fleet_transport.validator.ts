import { z } from 'zod';

export const createVehicleSchema = z.object({
  vehicleNumber: z.string().min(2, 'Vehicle number is required'),
  assetNumber: z.string().optional(),
  category: z.enum(['HEAVY_COMMERCIAL', 'LIGHT_COMMERCIAL', 'PASSENGER', 'SPECIAL_PURPOSE']).default('HEAVY_COMMERCIAL'),
  vehicleType: z.enum(['TRUCK', 'BUS', 'PICKUP', 'VAN', 'TRAILER', 'TANKER', 'CAR', 'CRANE']).default('TRUCK'),
  department: z.string().default('LOGISTICS'),
  projectId: z.string().optional(),
  projectName: z.string().optional(),
  currentSite: z.string().default('Main Depot'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  model: z.string().min(1, 'Model is required'),
  vin: z.string().min(3, 'VIN is required'),
  engineNumber: z.string().min(3, 'Engine number is required'),
  chassisNumber: z.string().min(3, 'Chassis number is required'),
  year: z.number().int().min(1990).max(2030).default(2025),
  purchaseDate: z.string().min(8, 'Purchase date required'),
  purchaseCost: z.number().nonnegative().default(0),
  currentValue: z.number().nonnegative().default(0),
  fuelType: z.enum(['DIESEL', 'PETROL', 'ELECTRIC', 'HYBRID']).default('DIESEL'),
  fuelTankCapacity: z.number().positive().default(200),
  mileageKmPerL: z.number().positive().default(5.5),
  engineHours: z.number().nonnegative().default(0),
  odometerKm: z.number().nonnegative().default(0),
  assignedDriverId: z.string().optional(),
  assignedDriverName: z.string().optional(),
  gpsDeviceId: z.string().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial().extend({
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'IN_MAINTENANCE', 'RESERVED', 'DECOMMISSIONED']).optional(),
});

export const createDriverSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(5, 'Phone number is required'),
  licenseNumber: z.string().min(3, 'License number is required'),
  licenseCategory: z.string().default('HEAVY_VEHICLE'),
  licenseExpiry: z.string().min(8, 'License expiry date required'),
  badgeNumber: z.string().optional(),
  assignedVehicleId: z.string().optional(),
});

export const createTripSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  driverId: z.string().min(1, 'Driver ID is required'),
  projectId: z.string().optional(),
  projectName: z.string().optional(),
  purpose: z.string().min(2, 'Purpose is required'),
  originLocation: z.string().min(2, 'Origin location is required'),
  destinationLocation: z.string().min(2, 'Destination location is required'),
  plannedDepartureDate: z.string().min(8, 'Departure date required'),
  plannedArrivalDate: z.string().min(8, 'Arrival date required'),
  startOdometerKm: z.number().nonnegative().default(0),
});

export const completeTripSchema = z.object({
  actualArrivalDate: z.string().min(8, 'Arrival date required'),
  endOdometerKm: z.number().nonnegative(),
  fuelConsumedLiters: z.number().nonnegative().default(0),
  tripCost: z.number().nonnegative().default(0),
});

export const createFuelLogSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  fuelStation: z.string().min(2, 'Fuel station vendor required'),
  fuelType: z.enum(['DIESEL', 'PETROL', 'ELECTRIC', 'HYBRID']).default('DIESEL'),
  quantityLiters: z.number().positive(),
  costPerLiter: z.number().positive(),
  odometerKm: z.number().nonnegative(),
  fillDate: z.string().min(8, 'Fill date required'),
  driverName: z.string().optional(),
});

export const createAccidentSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  driverId: z.string().min(1, 'Driver ID is required'),
  incidentDate: z.string().min(8, 'Incident date required'),
  location: z.string().min(2, 'Location required'),
  severity: z.enum(['MINOR', 'MODERATE', 'SEVERE', 'TOTAL_LOSS']).default('MINOR'),
  description: z.string().min(5, 'Description required'),
  estimatedRepairCost: z.number().nonnegative().default(0),
  insuranceClaimed: z.boolean().default(false),
  claimNumber: z.string().optional(),
});

export const createDocumentSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID required'),
  docType: z.enum(['INSURANCE', 'FITNESS', 'PERMIT', 'POLLUTION', 'REGISTRATION']).default('INSURANCE'),
  policyOrCertNumber: z.string().min(2, 'Document / Policy number required'),
  issuingAuthority: z.string().min(2, 'Authority required'),
  issueDate: z.string().min(8, 'Issue date required'),
  expiryDate: z.string().min(8, 'Expiry date required'),
  costAmount: z.number().nonnegative().default(0),
});
