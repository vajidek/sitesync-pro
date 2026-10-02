export type VehicleStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'BREAKDOWN' | 'DECOMMISSIONED';
export type EquipmentStatus = 'OPERATIONAL' | 'UNDER_MAINTENANCE' | 'IDLE' | 'BREAKDOWN' | 'DECOMMISSIONED';
export type DriverStatus = 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED';
export type FuelType = 'DIESEL' | 'PETROL' | 'CNG' | 'ELECTRIC' | 'HYBRID';
export type AssetType = 'VEHICLE' | 'EQUIPMENT';

export type MaintenanceType = 'PREVENTIVE' | 'BREAKDOWN' | 'SCHEDULED_SERVICE' | 'INSPECTION';
export type MaintenanceCategory = 
  | 'OIL_CHANGE' 
  | 'FILTER_CHANGE' 
  | 'BATTERY' 
  | 'TYRES' 
  | 'HYDRAULIC' 
  | 'ENGINE' 
  | 'TRANSMISSION' 
  | 'BRAKE_SYSTEM' 
  | 'GENERAL_SERVICE';

export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface VehicleDocument {
  id: string;
  docType: 'INSURANCE' | 'RC' | 'FITNESS' | 'PUC' | 'PERMIT' | 'TAX' | 'OTHER';
  title: string;
  docNumber: string;
  issueDate: string;
  expiryDate: string;
  fileUrl?: string;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: 'TRUCK' | 'TIPPER' | 'CRANE' | 'EXCAVATOR' | 'PICKUP' | 'BUS' | 'TRAILER' | 'CAR' | 'CONCRETE_MIXER' | 'TRACTOR';
  manufacturer: string;
  model: string;
  year: number;
  chassisNumber: string;
  engineNumber: string;
  fuelType: FuelType;
  tankCapacityLiters: number;
  currentOdometerKm: number;
  status: VehicleStatus;
  assignedProjectId?: string;
  assignedProjectName?: string;
  assignedSiteId?: string;
  assignedSiteName?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  
  // Expiry Dates
  insurancePolicyNumber?: string;
  insuranceExpiry: string;
  rcExpiry: string;
  fitnessExpiry: string;
  pollutionExpiry: string;
  permitExpiry: string;
  roadTaxExpiry: string;
  
  documents?: VehicleDocument[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverDocument {
  id: string;
  docType: 'DRIVING_LICENSE' | 'MEDICAL_CERTIFICATE' | 'ID_PROOF' | 'TRAINING_CERTIFICATE';
  title: string;
  docNumber: string;
  issueDate: string;
  expiryDate: string;
  fileUrl?: string;
}

export interface Driver {
  id: string;
  driverName: string;
  licenseNumber: string;
  licenseCategory: 'HEAVY_COMMERCIAL' | 'LIGHT_COMMERCIAL' | 'HEAVY_EQUIPMENT' | 'CRANE_OPERATOR' | 'ALL_VEHICLES';
  licenseExpiry: string;
  medicalExpiry: string;
  assignedVehicleId?: string;
  assignedVehicleNumber?: string;
  experienceYears: number;
  contactNumber: string;
  email?: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  status: DriverStatus;
  documents?: DriverDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface Equipment {
  id: string;
  equipmentCode: string;
  equipmentName: string;
  category: 
    | 'EXCAVATOR' 
    | 'BULLDOZER' 
    | 'TOWER_CRANE' 
    | 'MOBILE_CRANE' 
    | 'GENERATOR' 
    | 'COMPRESSOR' 
    | 'PUMP' 
    | 'CONCRETE_BATCHING' 
    | 'LOADER' 
    | 'COMPACTOR';
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiry: string;
  currentLocation: string;
  assignedProjectId?: string;
  assignedProjectName?: string;
  assignedSiteId?: string;
  assignedSiteName?: string;
  assignedOperatorId?: string;
  assignedOperatorName?: string;
  runningHours: number;
  fuelCapacityLiters: number;
  status: EquipmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  maintenanceCode: string;
  assetType: AssetType;
  assetId: string;
  assetName: string;
  assetCode: string; // vehicle number or equipment code
  maintenanceType: MaintenanceType;
  category: MaintenanceCategory;
  serviceDate: string;
  completionDate?: string;
  odometerKm?: number;
  runningHours?: number;
  costAmount: number;
  vendorName: string;
  invoiceNumber?: string;
  description: string;
  performedBy: string;
  status: MaintenanceStatus;
  nextServiceDueKm?: number;
  nextServiceDueDate?: string;
  nextServiceDueHours?: number;
  createdAt: string;
}

export interface FuelLog {
  id: string;
  fuelLogCode: string;
  assetType: AssetType;
  assetId: string;
  assetName: string;
  assetCode: string;
  quantityLiters: number;
  unitPrice: number;
  totalCost: number;
  fuelStation: string;
  odometerReadingKm?: number;
  runningHours?: number;
  mileageCalculated?: number; // Km/L or L/Hr
  projectId?: string;
  projectName?: string;
  siteId?: string;
  siteName?: string;
  filledById?: string;
  filledByName: string;
  fillDate: string;
  remarks?: string;
  createdAt: string;
}

export interface TripLog {
  id: string;
  tripCode: string;
  vehicleId: string;
  vehicleNumber: string;
  driverId: string;
  driverName: string;
  origin: string;
  destination: string;
  projectId?: string;
  projectName?: string;
  siteId?: string;
  siteName?: string;
  purpose: 'MATERIAL_TRANSPORT' | 'EQUIPMENT_MOVE' | 'SITE_TRANSIT' | 'EXECUTIVE_TRAVEL' | 'MAINTENANCE_RUN' | 'OTHER';
  startTime: string;
  endTime?: string;
  startOdometerKm: number;
  endOdometerKm?: number;
  distanceKm?: number;
  fuelUsedLiters?: number;
  gatePassRef?: string;
  notes?: string;
  status: 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface FleetNotification {
  id: string;
  type: 'INSURANCE_EXPIRY' | 'FITNESS_EXPIRY' | 'LICENSE_EXPIRY' | 'SERVICE_DUE' | 'FUEL_THRESHOLD' | 'MAINTENANCE_REMINDER';
  title: string;
  message: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assetId: string;
  assetName: string;
  assetType: AssetType | 'DRIVER';
  dueDate?: string;
  daysRemaining?: number;
  read: boolean;
  createdAt: string;
}

export interface FleetAnalytics {
  totalVehicles: number;
  activeVehicles: number;
  vehiclesInMaintenance: number;
  totalEquipment: number;
  operationalEquipment: number;
  idleEquipment: number;
  totalDrivers: number;
  activeDrivers: number;
  totalFuelSpendThisMonth: number;
  totalFuelLitersThisMonth: number;
  avgVehicleMileageKmPerLiter: number;
  totalMaintenanceCostThisMonth: number;
  pendingExpiriesCount: number;
  projectFuelBreakdown: { projectId: string; projectName: string; spend: number; liters: number }[];
  utilizationRates: { category: string; ratePercent: number }[];
}
