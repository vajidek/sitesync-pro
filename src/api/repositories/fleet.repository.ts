import { 
  Vehicle, 
  Driver, 
  Equipment, 
  MaintenanceRecord, 
  FuelLog, 
  TripLog, 
  FleetNotification, 
  FleetAnalytics 
} from '../types/fleet';
import { db } from '../../db';
import { eq, and, ilike, or, desc, sql } from 'drizzle-orm';
import { pgTable, text, boolean, integer, doublePrecision, jsonb } from 'drizzle-orm/pg-core';
import { vehicles, equipments } from '../../db/schema';
import { Pool } from 'pg';
import { isDemoSeedAllowed } from '../config/env';

// ====================================================
// DRIZZLE TABLE DEFINITIONS FOR FLEET & EQUIPMENT
// ====================================================

export const fleetVehiclesTable = pgTable('fleet_vehicles', {
  id: text('id').primaryKey(),
  vehicleNumber: text('vehicle_number').notNull(),
  vehicleType: text('vehicle_type').notNull(),
  manufacturer: text('manufacturer').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),
  chassisNumber: text('chassis_number'),
  engineNumber: text('engine_number'),
  fuelType: text('fuel_type').notNull(),
  tankCapacityLiters: doublePrecision('tank_capacity_liters').notNull().default(0),
  currentOdometerKm: doublePrecision('current_odometer_km').notNull().default(0),
  status: text('status').notNull().default('AVAILABLE'),
  assignedProjectId: text('assigned_project_id'),
  assignedProjectName: text('assigned_project_name'),
  assignedSiteId: text('assigned_site_id'),
  assignedSiteName: text('assigned_site_name'),
  assignedDriverId: text('assigned_driver_id'),
  assignedDriverName: text('assigned_driver_name'),
  insurancePolicyNumber: text('insurance_policy_number'),
  insuranceExpiry: text('insurance_expiry'),
  rcExpiry: text('rc_expiry'),
  fitnessExpiry: text('fitness_expiry'),
  pollutionExpiry: text('pollution_expiry'),
  permitExpiry: text('permit_expiry'),
  roadTaxExpiry: text('road_tax_expiry'),
  documents: jsonb('documents'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const fleetDriversTable = pgTable('fleet_drivers', {
  id: text('id').primaryKey(),
  driverName: text('driver_name').notNull(),
  licenseNumber: text('license_number').notNull(),
  licenseCategory: text('license_category').notNull(),
  licenseExpiry: text('license_expiry'),
  medicalExpiry: text('medical_expiry'),
  assignedVehicleId: text('assigned_vehicle_id'),
  assignedVehicleNumber: text('assigned_vehicle_number'),
  experienceYears: integer('experience_years').default(0),
  contactNumber: text('contact_number'),
  email: text('email'),
  emergencyContactName: text('emergency_contact_name'),
  emergencyContactRelation: text('emergency_contact_relation'),
  emergencyContactPhone: text('emergency_contact_phone'),
  status: text('status').notNull().default('ACTIVE'),
  documents: jsonb('documents'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const fleetEquipmentTable = pgTable('fleet_equipment', {
  id: text('id').primaryKey(),
  equipmentCode: text('equipment_code').notNull(),
  equipmentName: text('equipment_name').notNull(),
  category: text('category').notNull(),
  manufacturer: text('manufacturer').notNull(),
  model: text('model').notNull(),
  serialNumber: text('serial_number'),
  purchaseDate: text('purchase_date'),
  warrantyExpiry: text('warranty_expiry'),
  currentLocation: text('current_location'),
  assignedProjectId: text('assigned_project_id'),
  assignedProjectName: text('assigned_project_name'),
  assignedSiteId: text('assigned_site_id'),
  assignedSiteName: text('assigned_site_name'),
  assignedOperatorId: text('assigned_operator_id'),
  assignedOperatorName: text('assigned_operator_name'),
  runningHours: doublePrecision('running_hours').default(0),
  fuelCapacityLiters: doublePrecision('fuel_capacity_liters').default(0),
  status: text('status').notNull().default('OPERATIONAL'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const fleetMaintenanceTable = pgTable('fleet_maintenance', {
  id: text('id').primaryKey(),
  maintenanceCode: text('maintenance_code').notNull(),
  assetType: text('asset_type').notNull(),
  assetId: text('asset_id').notNull(),
  assetName: text('asset_name'),
  assetCode: text('asset_code'),
  maintenanceType: text('maintenance_type').notNull(),
  category: text('category').notNull(),
  serviceDate: text('service_date').notNull(),
  completionDate: text('completion_date'),
  odometerKm: doublePrecision('odometer_km'),
  runningHours: doublePrecision('running_hours'),
  costAmount: doublePrecision('cost_amount').default(0),
  vendorName: text('vendor_name'),
  invoiceNumber: text('invoice_number'),
  description: text('description'),
  performedBy: text('performed_by'),
  status: text('status').notNull().default('SCHEDULED'),
  nextServiceDueKm: doublePrecision('next_service_due_km'),
  nextServiceDueDate: text('next_service_due_date'),
  nextServiceDueHours: doublePrecision('next_service_due_hours'),
  createdAt: text('created_at').notNull(),
});

export const fleetFuelLogsTable = pgTable('fleet_fuel_logs', {
  id: text('id').primaryKey(),
  fuelLogCode: text('fuel_log_code').notNull(),
  assetType: text('asset_type').notNull(),
  assetId: text('asset_id').notNull(),
  assetName: text('asset_name'),
  assetCode: text('asset_code'),
  quantityLiters: doublePrecision('quantity_liters').notNull(),
  unitPrice: doublePrecision('unit_price').notNull(),
  totalCost: doublePrecision('total_cost').notNull(),
  fuelStation: text('fuel_station'),
  odometerReadingKm: doublePrecision('odometer_reading_km'),
  runningHours: doublePrecision('running_hours'),
  mileageCalculated: doublePrecision('mileage_calculated'),
  projectId: text('project_id'),
  projectName: text('project_name'),
  siteId: text('site_id'),
  siteName: text('site_name'),
  filledById: text('filled_by_id'),
  filledByName: text('filled_by_name'),
  fillDate: text('fill_date').notNull(),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
});

export const fleetTripLogsTable = pgTable('fleet_trip_logs', {
  id: text('id').primaryKey(),
  tripCode: text('trip_code').notNull(),
  vehicleId: text('vehicle_id').notNull(),
  vehicleNumber: text('vehicle_number'),
  driverId: text('driver_id').notNull(),
  driverName: text('driver_name'),
  origin: text('origin'),
  destination: text('destination'),
  projectId: text('project_id'),
  projectName: text('project_name'),
  siteId: text('site_id'),
  siteName: text('site_name'),
  purpose: text('purpose'),
  startTime: text('start_time').notNull(),
  endTime: text('end_time'),
  startOdometerKm: doublePrecision('start_odometer_km').notNull(),
  endOdometerKm: doublePrecision('end_odometer_km'),
  distanceKm: doublePrecision('distance_km'),
  fuelUsedLiters: doublePrecision('fuel_used_liters'),
  gatePassRef: text('gate_pass_ref'),
  notes: text('notes'),
  status: text('status').notNull().default('ONGOING'),
  createdAt: text('created_at').notNull(),
});

export const fleetNotificationsTable = pgTable('fleet_notifications', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  urgency: text('urgency').notNull(),
  assetId: text('asset_id'),
  assetName: text('asset_name'),
  assetType: text('asset_type'),
  dueDate: text('due_date'),
  daysRemaining: integer('days_remaining'),
  read: boolean('read').default(false),
  createdAt: text('created_at').notNull(),
});

// ====================================================
// INITIAL SEED DATA
// ====================================================

const initialVehicles: Vehicle[] = [
  {
    id: 'veh-101',
    vehicleNumber: 'KA-01-EQ-9842',
    vehicleType: 'TIPPER',
    manufacturer: 'Volvo',
    model: 'FMX 440 8x4',
    year: 2022,
    chassisNumber: 'VOL8493029481902',
    engineNumber: 'ENG-VOL-9821',
    fuelType: 'DIESEL',
    tankCapacityLiters: 300,
    currentOdometerKm: 45280,
    status: 'IN_USE',
    assignedProjectId: 'proj-001',
    assignedProjectName: 'Metro Rail Line Extension - Phase 2',
    assignedSiteId: 'site-101',
    assignedSiteName: 'Northern Elevated Segment Pier #42',
    assignedDriverId: 'drv-201',
    assignedDriverName: 'Ramesh Kumar',
    insurancePolicyNumber: 'POL-ICICI-884920',
    insuranceExpiry: '2026-11-15',
    rcExpiry: '2037-05-20',
    fitnessExpiry: '2027-02-10',
    pollutionExpiry: '2026-09-30',
    permitExpiry: '2027-01-15',
    roadTaxExpiry: '2026-12-31',
    documents: [
      { id: 'doc-1', docType: 'INSURANCE', title: 'Commercial Vehicle Insurance', docNumber: 'POL-ICICI-884920', issueDate: '2025-11-15', expiryDate: '2026-11-15', status: 'VALID' },
      { id: 'doc-2', docType: 'FITNESS', title: 'RTO Fitness Certificate', docNumber: 'FC-KA-84920', issueDate: '2025-02-10', expiryDate: '2027-02-10', status: 'VALID' },
    ],
    notes: 'Heavy duty rock dumper assigned for ballast & aggregate transit.',
    createdAt: '2025-01-10T08:00:00.000Z',
    updatedAt: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 'veh-102',
    vehicleNumber: 'KA-05-MH-4410',
    vehicleType: 'TRUCK',
    manufacturer: 'Tata Motors',
    model: 'Prima 3530.K',
    year: 2023,
    chassisNumber: 'MAT3928104829104',
    engineNumber: 'ENG-TAT-4410',
    fuelType: 'DIESEL',
    tankCapacityLiters: 400,
    currentOdometerKm: 32150,
    status: 'AVAILABLE',
    assignedProjectId: 'proj-002',
    assignedProjectName: 'Highway Bypass Viaduct Project',
    assignedSiteId: 'site-102',
    assignedSiteName: 'Central Casting Yard',
    assignedDriverId: 'drv-202',
    assignedDriverName: 'Suresh Patel',
    insurancePolicyNumber: 'POL-HDFC-993810',
    insuranceExpiry: '2026-08-25',
    rcExpiry: '2038-08-10',
    fitnessExpiry: '2026-08-20',
    pollutionExpiry: '2026-08-10',
    permitExpiry: '2027-04-12',
    roadTaxExpiry: '2027-03-31',
    documents: [
      { id: 'doc-3', docType: 'INSURANCE', title: 'National Insurance Policy', docNumber: 'POL-HDFC-993810', issueDate: '2024-08-25', expiryDate: '2026-08-25', status: 'EXPIRING_SOON' },
    ],
    notes: '35-Ton Multi-axle haulage truck for precast segment delivery.',
    createdAt: '2025-02-14T09:30:00.000Z',
    updatedAt: '2026-08-01T11:15:00.000Z',
  },
  {
    id: 'veh-103',
    vehicleNumber: 'KA-53-MC-1102',
    vehicleType: 'PICKUP',
    manufacturer: 'Mahindra',
    model: 'Bolero Maxi Truck Plus',
    year: 2024,
    chassisNumber: 'MAH7728103948271',
    engineNumber: 'ENG-MAH-1102',
    fuelType: 'DIESEL',
    tankCapacityLiters: 60,
    currentOdometerKm: 18400,
    status: 'IN_USE',
    assignedProjectId: 'proj-001',
    assignedProjectName: 'Metro Rail Line Extension - Phase 2',
    assignedSiteId: 'site-101',
    assignedSiteName: 'Northern Elevated Segment Pier #42',
    assignedDriverId: 'drv-203',
    assignedDriverName: 'Anil Rao',
    insurancePolicyNumber: 'POL-BAJAJ-551029',
    insuranceExpiry: '2027-01-10',
    rcExpiry: '2039-01-10',
    fitnessExpiry: '2028-01-10',
    pollutionExpiry: '2026-12-15',
    permitExpiry: '2028-01-10',
    roadTaxExpiry: '2027-01-10',
    documents: [],
    notes: 'Site supervisor & emergency spare parts quick utility vessel.',
    createdAt: '2025-03-01T10:00:00.000Z',
    updatedAt: '2026-08-01T09:00:00.000Z',
  },
  {
    id: 'veh-104',
    vehicleNumber: 'KA-03-CR-7700',
    vehicleType: 'CRANE',
    manufacturer: 'Ashok Leyland',
    model: 'Hydra 20T Mobile Crane',
    year: 2021,
    chassisNumber: 'ASH9940294829104',
    engineNumber: 'ENG-ASH-7700',
    fuelType: 'DIESEL',
    tankCapacityLiters: 180,
    currentOdometerKm: 12900,
    status: 'MAINTENANCE',
    assignedProjectId: 'proj-002',
    assignedProjectName: 'Highway Bypass Viaduct Project',
    assignedSiteId: 'site-102',
    assignedSiteName: 'Central Casting Yard',
    assignedDriverId: 'drv-204',
    assignedDriverName: 'Vikram Singh',
    insurancePolicyNumber: 'POL-TATA-774920',
    insuranceExpiry: '2026-10-05',
    rcExpiry: '2036-04-15',
    fitnessExpiry: '2026-09-01',
    pollutionExpiry: '2026-09-15',
    permitExpiry: '2027-02-28',
    roadTaxExpiry: '2026-11-30',
    documents: [],
    notes: 'Currently undergoing scheduled hydraulic seal overhaul.',
    createdAt: '2025-01-20T11:00:00.000Z',
    updatedAt: '2026-08-01T12:00:00.000Z',
  },
  {
    id: 'veh-105',
    vehicleNumber: 'KA-51-MX-9005',
    vehicleType: 'CONCRETE_MIXER',
    manufacturer: 'Schwing Stetter',
    model: 'AM 7 FHC Transit Mixer',
    year: 2023,
    chassisNumber: 'SCH8839201948271',
    engineNumber: 'ENG-SCH-9005',
    fuelType: 'DIESEL',
    tankCapacityLiters: 250,
    currentOdometerKm: 28900,
    status: 'IN_USE',
    assignedProjectId: 'proj-001',
    assignedProjectName: 'Metro Rail Line Extension - Phase 2',
    assignedSiteId: 'site-101',
    assignedSiteName: 'Northern Elevated Segment Pier #42',
    assignedDriverId: 'drv-205',
    assignedDriverName: 'Mohan Lal',
    insurancePolicyNumber: 'POL-RELIANCE-339281',
    insuranceExpiry: '2027-03-15',
    rcExpiry: '2038-03-15',
    fitnessExpiry: '2027-03-15',
    pollutionExpiry: '2026-11-30',
    permitExpiry: '2027-03-15',
    roadTaxExpiry: '2027-03-15',
    documents: [],
    notes: '7 Cubic Meter capacity ready mix transit vehicle.',
    createdAt: '2025-03-10T14:00:00.000Z',
    updatedAt: '2026-08-01T08:30:00.000Z',
  }
];

const initialDrivers: Driver[] = [
  {
    id: 'drv-201',
    driverName: 'Ramesh Kumar',
    licenseNumber: 'DL-0420110098421',
    licenseCategory: 'HEAVY_COMMERCIAL',
    licenseExpiry: '2028-06-30',
    medicalExpiry: '2027-01-15',
    assignedVehicleId: 'veh-101',
    assignedVehicleNumber: 'KA-01-EQ-9842',
    experienceYears: 12,
    contactNumber: '+91 98450 12345',
    email: 'ramesh.k@sitesync.internal',
    emergencyContactName: 'Sunita Kumar',
    emergencyContactRelation: 'Spouse',
    emergencyContactPhone: '+91 98450 99999',
    status: 'ACTIVE',
    documents: [
      { id: 'dd-1', docType: 'DRIVING_LICENSE', title: 'Commercial Driving License', docNumber: 'DL-0420110098421', issueDate: '2010-06-30', expiryDate: '2028-06-30' }
    ],
    createdAt: '2025-01-10T08:00:00.000Z',
    updatedAt: '2026-08-01T08:00:00.000Z',
  },
  {
    id: 'drv-202',
    driverName: 'Suresh Patel',
    licenseNumber: 'DL-0520140033104',
    licenseCategory: 'HEAVY_COMMERCIAL',
    licenseExpiry: '2026-08-18',
    medicalExpiry: '2026-09-10',
    assignedVehicleId: 'veh-102',
    assignedVehicleNumber: 'KA-05-MH-4410',
    experienceYears: 15,
    contactNumber: '+91 97410 54321',
    email: 'suresh.p@sitesync.internal',
    emergencyContactName: 'Raman Patel',
    emergencyContactRelation: 'Brother',
    emergencyContactPhone: '+91 97410 88888',
    status: 'ACTIVE',
    documents: [],
    createdAt: '2025-02-01T09:00:00.000Z',
    updatedAt: '2026-08-01T09:00:00.000Z',
  },
  {
    id: 'drv-203',
    driverName: 'Anil Rao',
    licenseNumber: 'DL-0120180055201',
    licenseCategory: 'LIGHT_COMMERCIAL',
    licenseExpiry: '2029-12-31',
    medicalExpiry: '2027-05-20',
    assignedVehicleId: 'veh-103',
    assignedVehicleNumber: 'KA-53-MC-1102',
    experienceYears: 7,
    contactNumber: '+91 99001 88223',
    email: 'anil.rao@sitesync.internal',
    emergencyContactName: 'Kavitha Rao',
    emergencyContactRelation: 'Spouse',
    emergencyContactPhone: '+91 99001 77777',
    status: 'ACTIVE',
    documents: [],
    createdAt: '2025-03-01T10:00:00.000Z',
    updatedAt: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 'drv-204',
    driverName: 'Vikram Singh',
    licenseNumber: 'DL-0920080077492',
    licenseCategory: 'CRANE_OPERATOR',
    licenseExpiry: '2027-10-14',
    medicalExpiry: '2026-11-05',
    assignedVehicleId: 'veh-104',
    assignedVehicleNumber: 'KA-03-CR-7700',
    experienceYears: 18,
    contactNumber: '+91 98860 33445',
    email: 'vikram.singh@sitesync.internal',
    emergencyContactName: 'Geeta Singh',
    emergencyContactRelation: 'Spouse',
    emergencyContactPhone: '+91 98860 22222',
    status: 'ACTIVE',
    documents: [],
    createdAt: '2025-01-20T11:00:00.000Z',
    updatedAt: '2026-08-01T11:00:00.000Z',
  },
  {
    id: 'drv-205',
    driverName: 'Mohan Lal',
    licenseNumber: 'DL-0220160088219',
    licenseCategory: 'HEAVY_COMMERCIAL',
    licenseExpiry: '2027-04-10',
    medicalExpiry: '2026-12-10',
    assignedVehicleId: 'veh-105',
    assignedVehicleNumber: 'KA-51-MX-9005',
    experienceYears: 10,
    contactNumber: '+91 94480 66778',
    email: 'mohan.lal@sitesync.internal',
    emergencyContactName: 'Prakash Lal',
    emergencyContactRelation: 'Father',
    emergencyContactPhone: '+91 94480 55555',
    status: 'ACTIVE',
    documents: [],
    createdAt: '2025-03-10T14:00:00.000Z',
    updatedAt: '2026-08-01T08:30:00.000Z',
  }
];

const initialEquipment: Equipment[] = [
  {
    id: 'eqp-301',
    equipmentCode: 'EQP-EXC-001',
    equipmentName: 'Heavy Track Hydraulic Excavator',
    category: 'EXCAVATOR',
    manufacturer: 'Caterpillar',
    model: 'CAT 320D3',
    serialNumber: 'CAT0320D3K984029',
    purchaseDate: '2022-04-15',
    warrantyExpiry: '2025-04-15',
    currentLocation: 'Pier #42 Earthwork Yard',
    assignedProjectId: 'proj-001',
    assignedProjectName: 'Metro Rail Line Extension - Phase 2',
    assignedSiteId: 'site-101',
    assignedSiteName: 'Northern Elevated Segment Pier #42',
    assignedOperatorId: 'op-401',
    assignedOperatorName: 'Rajesh Sharma',
    runningHours: 3450,
    fuelCapacityLiters: 410,
    status: 'OPERATIONAL',
    notes: 'Main foundation trench digging machine.',
    createdAt: '2025-01-10T08:00:00.000Z',
    updatedAt: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 'eqp-302',
    equipmentCode: 'EQP-CRN-002',
    equipmentName: 'Self-Erecting Tower Crane 50T',
    category: 'TOWER_CRANE',
    manufacturer: 'Liebherr',
    model: '280 EC-H 12 Litronic',
    serialNumber: 'LIE280ECH8839201',
    purchaseDate: '2023-01-20',
    warrantyExpiry: '2026-01-20',
    currentLocation: 'Casting Yard Slab #B',
    assignedProjectId: 'proj-002',
    assignedProjectName: 'Highway Bypass Viaduct Project',
    assignedSiteId: 'site-102',
    assignedSiteName: 'Central Casting Yard',
    assignedOperatorId: 'op-402',
    assignedOperatorName: 'Dinesh V',
    runningHours: 2890,
    fuelCapacityLiters: 0,
    status: 'OPERATIONAL',
    notes: 'Precast girder lifting crane.',
    createdAt: '2025-02-14T09:30:00.000Z',
    updatedAt: '2026-08-01T11:00:00.000Z',
  },
  {
    id: 'eqp-303',
    equipmentCode: 'EQP-GEN-003',
    equipmentName: '500 kVA Silent Diesel Generator',
    category: 'GENERATOR',
    manufacturer: 'Cummins',
    model: 'C500 D5P Powerica',
    serialNumber: 'CUM500D5P9948271',
    purchaseDate: '2023-08-10',
    warrantyExpiry: '2025-08-10',
    currentLocation: 'Substation Site Grid #1',
    assignedProjectId: 'proj-001',
    assignedProjectName: 'Metro Rail Line Extension - Phase 2',
    assignedSiteId: 'site-101',
    assignedSiteName: 'Northern Elevated Segment Pier #42',
    assignedOperatorId: 'op-403',
    assignedOperatorName: 'Satish Gowda',
    runningHours: 1920,
    fuelCapacityLiters: 650,
    status: 'OPERATIONAL',
    notes: 'Continuous power backup for night concreting & welding.',
    createdAt: '2025-03-01T10:00:00.000Z',
    updatedAt: '2026-08-01T09:00:00.000Z',
  },
  {
    id: 'eqp-304',
    equipmentCode: 'EQP-BLD-004',
    equipmentName: 'Crawler Crawler Bulldozer D8T',
    category: 'BULLDOZER',
    manufacturer: 'Komatsu',
    model: 'D85ESS-18',
    serialNumber: 'KOMD85E883920194',
    purchaseDate: '2021-11-05',
    warrantyExpiry: '2024-11-05',
    currentLocation: 'Central Heavy Equipment Yard',
    assignedProjectId: 'proj-002',
    assignedProjectName: 'Highway Bypass Viaduct Project',
    assignedSiteId: 'site-102',
    assignedSiteName: 'Central Casting Yard',
    assignedOperatorId: 'op-404',
    assignedOperatorName: 'Arjun Das',
    runningHours: 5120,
    fuelCapacityLiters: 490,
    status: 'IDLE',
    notes: 'Ground leveling machine currently on standby.',
    createdAt: '2025-01-15T10:00:00.000Z',
    updatedAt: '2026-08-01T12:00:00.000Z',
  },
  {
    id: 'eqp-305',
    equipmentCode: 'EQP-CMP-005',
    equipmentName: 'Soil Compactor Vibratory Roller',
    category: 'COMPACTOR',
    manufacturer: 'HAMM',
    model: '311 D 11-Ton',
    serialNumber: 'HAMM311D77392018',
    purchaseDate: '2024-02-18',
    warrantyExpiry: '2026-02-18',
    currentLocation: 'Road Sub-base Layer 2',
    assignedProjectId: 'proj-002',
    assignedProjectName: 'Highway Bypass Viaduct Project',
    assignedSiteId: 'site-102',
    assignedSiteName: 'Central Casting Yard',
    assignedOperatorId: 'op-405',
    assignedOperatorName: 'Pradeep K',
    runningHours: 840,
    fuelCapacityLiters: 220,
    status: 'OPERATIONAL',
    notes: 'High compaction roller for embankment earthwork.',
    createdAt: '2025-03-15T14:00:00.000Z',
    updatedAt: '2026-08-01T08:30:00.000Z',
  }
];

const initialMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: 'maint-501',
    maintenanceCode: 'MNT-2026-089',
    assetType: 'VEHICLE',
    assetId: 'veh-101',
    assetName: 'Volvo FMX 440 Tipper',
    assetCode: 'KA-01-EQ-9842',
    maintenanceType: 'PREVENTIVE',
    category: 'OIL_CHANGE',
    serviceDate: '2026-07-20',
    completionDate: '2026-07-21',
    odometerKm: 44800,
    costAmount: 18500,
    vendorName: 'Volvo Authorized Workshop Bangalore',
    invoiceNumber: 'INV-VOL-88421',
    description: 'Engine oil replaced (15W40 heavy duty), oil filter and fuel filters changed.',
    performedBy: 'Lead Mechanic Prakash',
    status: 'COMPLETED',
    nextServiceDueKm: 50000,
    nextServiceDueDate: '2026-10-20',
    createdAt: '2026-07-20T09:00:00.000Z',
  },
  {
    id: 'maint-502',
    maintenanceCode: 'MNT-2026-092',
    assetType: 'EQUIPMENT',
    assetId: 'eqp-301',
    assetName: 'CAT 320D3 Excavator',
    assetCode: 'EQP-EXC-001',
    maintenanceType: 'SCHEDULED_SERVICE',
    category: 'HYDRAULIC',
    serviceDate: '2026-07-28',
    completionDate: '2026-07-29',
    runningHours: 3400,
    costAmount: 34000,
    vendorName: 'GMMCO Caterpillar Service Division',
    invoiceNumber: 'INV-CAT-99201',
    description: 'Hydraulic main pump seal replacement, hydraulic fluid flush & filter cartridge swap.',
    performedBy: 'Caterpillar Senior Tech Engineer',
    status: 'COMPLETED',
    nextServiceDueHours: 3800,
    nextServiceDueDate: '2026-10-15',
    createdAt: '2026-07-28T10:00:00.000Z',
  },
  {
    id: 'maint-503',
    maintenanceCode: 'MNT-2026-104',
    assetType: 'VEHICLE',
    assetId: 'veh-104',
    assetName: 'Ashok Leyland 20T Crane',
    assetCode: 'KA-03-CR-7700',
    maintenanceType: 'BREAKDOWN',
    category: 'HYDRAULIC',
    serviceDate: '2026-08-01',
    odometerKm: 12900,
    costAmount: 22500,
    vendorName: 'Southern Heavy Hydraulics Works',
    invoiceNumber: 'INV-SHH-44102',
    description: 'Boom cylinder leak fix & pressure relief valve calibration.',
    performedBy: 'External Hydraulic Specialist',
    status: 'IN_PROGRESS',
    createdAt: '2026-08-01T08:00:00.000Z',
  }
];

const initialFuelLogs: FuelLog[] = [
  {
    id: 'fuel-601',
    fuelLogCode: 'FL-2026-0410',
    assetType: 'VEHICLE',
    assetId: 'veh-101',
    assetName: 'Volvo FMX 440 Tipper',
    assetCode: 'KA-01-EQ-9842',
    quantityLiters: 220,
    unitPrice: 92.50,
    totalCost: 20350,
    fuelStation: 'Indian Oil Retail Outlet Depot #4',
    odometerReadingKm: 45280,
    mileageCalculated: 2.85,
    projectId: 'proj-001',
    projectName: 'Metro Rail Line Extension - Phase 2',
    siteId: 'site-101',
    siteName: 'Northern Elevated Segment Pier #42',
    filledById: 'usr-101',
    filledByName: 'Store Keeper - Suresh',
    fillDate: '2026-07-31',
    remarks: 'Full tank refueled prior to night shift aggregate transport.',
    createdAt: '2026-07-31T18:30:00.000Z',
  },
  {
    id: 'fuel-602',
    fuelLogCode: 'FL-2026-0411',
    assetType: 'EQUIPMENT',
    assetId: 'eqp-301',
    assetName: 'CAT 320D3 Excavator',
    assetCode: 'EQP-EXC-001',
    quantityLiters: 350,
    unitPrice: 92.50,
    totalCost: 32375,
    fuelStation: 'Site Mobile Bowser Tanker #2',
    runningHours: 3450,
    mileageCalculated: 16.5,
    projectId: 'proj-001',
    projectName: 'Metro Rail Line Extension - Phase 2',
    siteId: 'site-101',
    siteName: 'Northern Elevated Segment Pier #42',
    filledById: 'usr-102',
    filledByName: 'Equipment Supervisor - Ramesh',
    fillDate: '2026-08-01',
    remarks: 'Direct on-site bowser fueling.',
    createdAt: '2026-08-01T07:15:00.000Z',
  },
  {
    id: 'fuel-603',
    fuelLogCode: 'FL-2026-0412',
    assetType: 'EQUIPMENT',
    assetId: 'eqp-303',
    assetName: '500 kVA Cummins Generator',
    assetCode: 'EQP-GEN-003',
    quantityLiters: 480,
    unitPrice: 92.50,
    totalCost: 44400,
    fuelStation: 'Bharat Petroleum Site Tanker',
    runningHours: 1920,
    mileageCalculated: 28.0,
    projectId: 'proj-001',
    projectName: 'Metro Rail Line Extension - Phase 2',
    siteId: 'site-101',
    siteName: 'Northern Elevated Segment Pier #42',
    filledById: 'usr-103',
    filledByName: 'Electrical Engineer Mahesh',
    fillDate: '2026-07-30',
    remarks: 'Bulk generator diesel tank refill.',
    createdAt: '2026-07-30T16:00:00.000Z',
  }
];

const initialTripLogs: TripLog[] = [
  {
    id: 'trip-701',
    tripCode: 'TRP-2026-0182',
    vehicleId: 'veh-101',
    vehicleNumber: 'KA-01-EQ-9842',
    driverId: 'drv-201',
    driverName: 'Ramesh Kumar',
    origin: 'Kudlu Quarry Pit #3',
    destination: 'Northern Elevated Segment Pier #42',
    projectId: 'proj-001',
    projectName: 'Metro Rail Line Extension - Phase 2',
    siteId: 'site-101',
    siteName: 'Northern Elevated Segment Pier #42',
    purpose: 'MATERIAL_TRANSPORT',
    startTime: '2026-08-01T07:00:00.000Z',
    endTime: '2026-08-01T10:30:00.000Z',
    startOdometerKm: 45210,
    endOdometerKm: 45280,
    distanceKm: 70,
    fuelUsedLiters: 24.5,
    gatePassRef: 'GP-2026-98102',
    notes: 'Hauled 28 Tons of Grade A 40mm aggregate for pier concrete footing.',
    status: 'COMPLETED',
    createdAt: '2026-08-01T07:00:00.000Z',
  },
  {
    id: 'trip-702',
    tripCode: 'TRP-2026-0183',
    vehicleId: 'veh-102',
    vehicleNumber: 'KA-05-MH-4410',
    driverId: 'drv-202',
    driverName: 'Suresh Patel',
    origin: 'Central Casting Yard',
    destination: 'Viaduct Segment Deck Pier #14',
    projectId: 'proj-002',
    projectName: 'Highway Bypass Viaduct Project',
    siteId: 'site-102',
    siteName: 'Central Casting Yard',
    purpose: 'EQUIPMENT_MOVE',
    startTime: '2026-08-01T11:00:00.000Z',
    startOdometerKm: 32150,
    notes: 'Transporting pre-stressed concrete girder #G-14.',
    status: 'ONGOING',
    createdAt: '2026-08-01T11:00:00.000Z',
  }
];

const initialNotifications: FleetNotification[] = [
  {
    id: 'notif-1',
    type: 'INSURANCE_EXPIRY',
    title: 'Vehicle Insurance Expiring Soon',
    message: 'Vehicle KA-05-MH-4410 (Tata Prima) Insurance policy POL-HDFC-993810 expires on 2026-08-25 (24 days remaining). Renewal required.',
    urgency: 'HIGH',
    assetId: 'veh-102',
    assetName: 'KA-05-MH-4410 (Tata Prima 3530.K)',
    assetType: 'VEHICLE',
    dueDate: '2026-08-25',
    daysRemaining: 24,
    read: false,
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'notif-2',
    type: 'LICENSE_EXPIRY',
    title: 'Driver License Expiry Notice',
    message: 'Driver Suresh Patel commercial driving license DL-0520140033104 expires on 2026-08-18 (17 days remaining). Prompt medical & license renewal needed.',
    urgency: 'CRITICAL',
    assetId: 'drv-202',
    assetName: 'Suresh Patel (Heavy Driver)',
    assetType: 'DRIVER',
    dueDate: '2026-08-18',
    daysRemaining: 17,
    read: false,
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'notif-3',
    type: 'SERVICE_DUE',
    title: 'Preventive Maintenance Due',
    message: 'Heavy Crane KA-03-CR-7700 hydraulic oil pressure check & hose replacement is currently marked IN_PROGRESS.',
    urgency: 'MEDIUM',
    assetId: 'veh-104',
    assetName: 'KA-03-CR-7700 (Ashok Leyland Crane)',
    assetType: 'VEHICLE',
    dueDate: '2026-08-05',
    daysRemaining: 4,
    read: false,
    createdAt: '2026-08-01T06:00:00.000Z',
  }
];

let isFleetSeeded = false;

async function ensureFleetSeeded() {
  if (isFleetSeeded) return;
  if (!isDemoSeedAllowed()) {
    isFleetSeeded = true;
    return;
  }

  // Seed initial records if tables are empty
  try {
    const existingVehicles = await db.select().from(fleetVehiclesTable).limit(1);
    if (existingVehicles.length === 0) {
      for (const v of initialVehicles) {
        await db.insert(fleetVehiclesTable).values(v as any).onConflictDoNothing();
        await db.insert(vehicles).values({
          id: v.id,
          vehicleNumber: v.vehicleNumber,
          vehicleType: v.vehicleType,
          fuelType: v.fuelType,
          currentOdometer: v.currentOdometerKm,
          insurancePolicy: v.insurancePolicyNumber || null,
          insuranceExpiry: v.insuranceExpiry || null,
          rcNumber: null,
          fitnessExpiry: v.fitnessExpiry || null,
          assignedDriverId: v.assignedDriverId || null,
          status: v.status,
          isActive: true,
          createdAt: v.createdAt,
          updatedAt: v.updatedAt,
        }).onConflictDoNothing();
      }
    }

    const existingDrivers = await db.select().from(fleetDriversTable).limit(1);
    if (existingDrivers.length === 0) {
      for (const d of initialDrivers) {
        await db.insert(fleetDriversTable).values(d as any).onConflictDoNothing();
      }
    }

    const existingEquipment = await db.select().from(fleetEquipmentTable).limit(1);
    if (existingEquipment.length === 0) {
      for (const e of initialEquipment) {
        await db.insert(fleetEquipmentTable).values(e as any).onConflictDoNothing();
        await db.insert(equipments).values({
          id: e.id,
          code: e.equipmentCode,
          name: e.equipmentName,
          type: e.category,
          serialNumber: e.serialNumber || null,
          modelNumber: e.model || null,
          status: e.status,
          hourlyCost: 500,
          currentProjectId: e.assignedProjectId || null,
          siteId: e.assignedSiteId || null,
          operatorId: e.assignedOperatorId || null,
          isActive: true,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
        }).onConflictDoNothing();
      }
    }

    const existingMaintenance = await db.select().from(fleetMaintenanceTable).limit(1);
    if (existingMaintenance.length === 0) {
      for (const m of initialMaintenanceRecords) {
        await db.insert(fleetMaintenanceTable).values(m as any).onConflictDoNothing();
      }
    }

    const existingFuel = await db.select().from(fleetFuelLogsTable).limit(1);
    if (existingFuel.length === 0) {
      for (const f of initialFuelLogs) {
        await db.insert(fleetFuelLogsTable).values(f as any).onConflictDoNothing();
      }
    }

    const existingTrips = await db.select().from(fleetTripLogsTable).limit(1);
    if (existingTrips.length === 0) {
      for (const t of initialTripLogs) {
        await db.insert(fleetTripLogsTable).values(t as any).onConflictDoNothing();
      }
    }

    const existingNotifs = await db.select().from(fleetNotificationsTable).limit(1);
    if (existingNotifs.length === 0) {
      for (const n of initialNotifications) {
        await db.insert(fleetNotificationsTable).values(n as any).onConflictDoNothing();
      }
    }

    isFleetSeeded = true;
  } catch (err) {
    console.error("Error seeding fleet data:", err);
  }
}

// ====================================================
// FLEET REPOSITORY IMPLEMENTATION (DRIZZLE ORM)
// ====================================================

class FleetRepository {
  // ====================================================
  // VEHICLE METHODS
  // ====================================================
  async getVehicles(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    vehicleType?: string;
    projectId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    await ensureFleetSeeded();

    const allVehicles = await db.select().from(fleetVehiclesTable).orderBy(desc(fleetVehiclesTable.createdAt));
    let filtered = allVehicles as unknown as Vehicle[];

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        v =>
          (v.vehicleNumber && v.vehicleNumber.toLowerCase().includes(q)) ||
          (v.manufacturer && v.manufacturer.toLowerCase().includes(q)) ||
          (v.model && v.model.toLowerCase().includes(q)) ||
          (v.assignedDriverName && v.assignedDriverName.toLowerCase().includes(q)) ||
          (v.assignedProjectName && v.assignedProjectName.toLowerCase().includes(q))
      );
    }

    if (params.status && params.status !== 'ALL') {
      filtered = filtered.filter(v => v.status === params.status);
    }

    if (params.vehicleType && params.vehicleType !== 'ALL') {
      filtered = filtered.filter(v => v.vehicleType === params.vehicleType);
    }

    if (params.projectId && params.projectId !== 'ALL') {
      filtered = filtered.filter(v => v.assignedProjectId === params.projectId);
    }

    const total = filtered.length;
    const page = params.page || 1;
    const limit = params.limit || 20;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return { data: items, meta: { total, page, limit, totalPages } };
  }

  async getVehicleById(id: string): Promise<Vehicle | null> {
    await ensureFleetSeeded();
    const rows = await db.select().from(fleetVehiclesTable).where(eq(fleetVehiclesTable.id, id)).limit(1);
    if (rows.length === 0) return null;
    return rows[0] as unknown as Vehicle;
  }

  async createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
    await ensureFleetSeeded();

    const now = new Date().toISOString();
    const newVehicle: Vehicle = {
      id: data.id || `veh-${Math.random().toString(36).substring(2, 8)}`,
      vehicleNumber: data.vehicleNumber || `KA-01-EQ-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleType: data.vehicleType || 'TRUCK',
      manufacturer: data.manufacturer || 'Tata',
      model: data.model || 'Standard',
      year: data.year || new Date().getFullYear(),
      chassisNumber: data.chassisNumber || `CHAS-${Date.now()}`,
      engineNumber: data.engineNumber || `ENG-${Date.now()}`,
      fuelType: data.fuelType || 'DIESEL',
      tankCapacityLiters: Number(data.tankCapacityLiters) || 200,
      currentOdometerKm: Number(data.currentOdometerKm) || 0,
      status: data.status || 'AVAILABLE',
      assignedProjectId: data.assignedProjectId,
      assignedProjectName: data.assignedProjectName,
      assignedSiteId: data.assignedSiteId,
      assignedSiteName: data.assignedSiteName,
      assignedDriverId: data.assignedDriverId,
      assignedDriverName: data.assignedDriverName,
      insurancePolicyNumber: data.insurancePolicyNumber,
      insuranceExpiry: data.insuranceExpiry || '2027-01-01',
      rcExpiry: data.rcExpiry || '2037-01-01',
      fitnessExpiry: data.fitnessExpiry || '2027-01-01',
      pollutionExpiry: data.pollutionExpiry || '2026-12-31',
      permitExpiry: data.permitExpiry || '2027-01-01',
      roadTaxExpiry: data.roadTaxExpiry || '2027-01-01',
      documents: data.documents || [],
      notes: data.notes || '',
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(fleetVehiclesTable).values(newVehicle as any).onConflictDoNothing();

    // Sync to main schema vehicles table
    await db.insert(vehicles).values({
      id: newVehicle.id,
      vehicleNumber: newVehicle.vehicleNumber,
      vehicleType: newVehicle.vehicleType,
      fuelType: newVehicle.fuelType,
      currentOdometer: newVehicle.currentOdometerKm,
      insurancePolicy: newVehicle.insurancePolicyNumber || null,
      insuranceExpiry: newVehicle.insuranceExpiry || null,
      rcNumber: null,
      fitnessExpiry: newVehicle.fitnessExpiry || null,
      assignedDriverId: newVehicle.assignedDriverId || null,
      status: newVehicle.status,
      isActive: true,
      createdAt: newVehicle.createdAt,
      updatedAt: newVehicle.updatedAt,
    }).onConflictDoUpdate({
      target: vehicles.id,
      set: {
        vehicleNumber: newVehicle.vehicleNumber,
        vehicleType: newVehicle.vehicleType,
        fuelType: newVehicle.fuelType,
        currentOdometer: newVehicle.currentOdometerKm,
        status: newVehicle.status,
        updatedAt: newVehicle.updatedAt,
      }
    });

    return newVehicle;
  }

  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle | null> {
    await ensureFleetSeeded();

    const existing = await this.getVehicleById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updated: Vehicle = {
      ...existing,
      ...data,
      updatedAt: now,
    };

    await db.update(fleetVehiclesTable)
      .set(updated as any)
      .where(eq(fleetVehiclesTable.id, id));

    // Sync to main schema vehicles table
    await db.update(vehicles)
      .set({
        vehicleNumber: updated.vehicleNumber,
        vehicleType: updated.vehicleType,
        fuelType: updated.fuelType,
        currentOdometer: updated.currentOdometerKm,
        status: updated.status,
        updatedAt: updated.updatedAt,
      })
      .where(eq(vehicles.id, id));

    return updated;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    await ensureFleetSeeded();
    const existing = await this.getVehicleById(id);
    if (!existing) return false;

    const updated = await this.updateVehicle(id, { status: 'DECOMMISSIONED' });
    return updated !== null;
  }

  // ====================================================
  // DRIVER METHODS
  // ====================================================
  async getDrivers(params: { page?: number; limit?: number; search?: string; status?: string }) {
    await ensureFleetSeeded();

    const allDrivers = await db.select().from(fleetDriversTable).orderBy(desc(fleetDriversTable.createdAt));
    let filtered = allDrivers as unknown as Driver[];

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        d =>
          (d.driverName && d.driverName.toLowerCase().includes(q)) ||
          (d.licenseNumber && d.licenseNumber.toLowerCase().includes(q)) ||
          (d.contactNumber && d.contactNumber.includes(q))
      );
    }

    if (params.status && params.status !== 'ALL') {
      filtered = filtered.filter(d => d.status === params.status);
    }

    const total = filtered.length;
    const page = params.page || 1;
    const limit = params.limit || 20;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;

    return { data: filtered.slice(startIndex, startIndex + limit), meta: { total, page, limit, totalPages } };
  }

  async createDriver(data: Partial<Driver>): Promise<Driver> {
    await ensureFleetSeeded();

    const now = new Date().toISOString();
    const newDriver: Driver = {
      id: data.id || `drv-${Math.random().toString(36).substring(2, 8)}`,
      driverName: data.driverName || 'New Driver',
      licenseNumber: data.licenseNumber || `DL-${Date.now()}`,
      licenseCategory: data.licenseCategory || 'HEAVY_COMMERCIAL',
      licenseExpiry: data.licenseExpiry || '2028-01-01',
      medicalExpiry: data.medicalExpiry || '2027-01-01',
      assignedVehicleId: data.assignedVehicleId,
      assignedVehicleNumber: data.assignedVehicleNumber,
      experienceYears: Number(data.experienceYears) || 5,
      contactNumber: data.contactNumber || '+91 99000 00000',
      email: data.email,
      emergencyContactName: data.emergencyContactName || 'Family Contact',
      emergencyContactRelation: data.emergencyContactRelation || 'Spouse',
      emergencyContactPhone: data.emergencyContactPhone || '+91 99000 11111',
      status: data.status || 'ACTIVE',
      documents: data.documents || [],
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(fleetDriversTable).values(newDriver as any).onConflictDoNothing();
    return newDriver;
  }

  async updateDriver(id: string, data: Partial<Driver>): Promise<Driver | null> {
    await ensureFleetSeeded();

    const rows = await db.select().from(fleetDriversTable).where(eq(fleetDriversTable.id, id)).limit(1);
    if (rows.length === 0) return null;

    const existing = rows[0] as unknown as Driver;
    const now = new Date().toISOString();
    const updated: Driver = { ...existing, ...data, updatedAt: now };

    await db.update(fleetDriversTable).set(updated as any).where(eq(fleetDriversTable.id, id));
    return updated;
  }

  // ====================================================
  // EQUIPMENT METHODS
  // ====================================================
  async getEquipment(params: { page?: number; limit?: number; search?: string; status?: string; category?: string; projectId?: string }) {
    await ensureFleetSeeded();

    const allEquipment = await db.select().from(fleetEquipmentTable).orderBy(desc(fleetEquipmentTable.createdAt));
    let filtered = allEquipment as unknown as Equipment[];

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        e =>
          (e.equipmentCode && e.equipmentCode.toLowerCase().includes(q)) ||
          (e.equipmentName && e.equipmentName.toLowerCase().includes(q)) ||
          (e.manufacturer && e.manufacturer.toLowerCase().includes(q)) ||
          (e.model && e.model.toLowerCase().includes(q))
      );
    }

    if (params.status && params.status !== 'ALL') {
      filtered = filtered.filter(e => e.status === params.status);
    }

    if (params.category && params.category !== 'ALL') {
      filtered = filtered.filter(e => e.category === params.category);
    }

    if (params.projectId && params.projectId !== 'ALL') {
      filtered = filtered.filter(e => e.assignedProjectId === params.projectId);
    }

    const total = filtered.length;
    const page = params.page || 1;
    const limit = params.limit || 20;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;

    return { data: filtered.slice(startIndex, startIndex + limit), meta: { total, page, limit, totalPages } };
  }

  async createEquipment(data: Partial<Equipment>): Promise<Equipment> {
    await ensureFleetSeeded();

    const now = new Date().toISOString();
    const newEqp: Equipment = {
      id: data.id || `eqp-${Math.random().toString(36).substring(2, 8)}`,
      equipmentCode: data.equipmentCode || `EQP-${Math.floor(100 + Math.random() * 900)}`,
      equipmentName: data.equipmentName || 'Heavy Equipment Asset',
      category: data.category || 'EXCAVATOR',
      manufacturer: data.manufacturer || 'CAT',
      model: data.model || '320',
      serialNumber: data.serialNumber || `SN-${Date.now()}`,
      purchaseDate: data.purchaseDate || '2023-01-01',
      warrantyExpiry: data.warrantyExpiry || '2026-01-01',
      currentLocation: data.currentLocation || 'Main Project Yard',
      assignedProjectId: data.assignedProjectId,
      assignedProjectName: data.assignedProjectName,
      assignedSiteId: data.assignedSiteId,
      assignedSiteName: data.assignedSiteName,
      assignedOperatorId: data.assignedOperatorId,
      assignedOperatorName: data.assignedOperatorName,
      runningHours: Number(data.runningHours) || 0,
      fuelCapacityLiters: Number(data.fuelCapacityLiters) || 300,
      status: data.status || 'OPERATIONAL',
      notes: data.notes || '',
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(fleetEquipmentTable).values(newEqp as any).onConflictDoNothing();

    // Sync to main schema equipments table
    await db.insert(equipments).values({
      id: newEqp.id,
      code: newEqp.equipmentCode,
      name: newEqp.equipmentName,
      type: newEqp.category,
      serialNumber: newEqp.serialNumber || null,
      modelNumber: newEqp.model || null,
      status: newEqp.status,
      hourlyCost: 500,
      currentProjectId: newEqp.assignedProjectId || null,
      siteId: newEqp.assignedSiteId || null,
      operatorId: newEqp.assignedOperatorId || null,
      isActive: true,
      createdAt: newEqp.createdAt,
      updatedAt: newEqp.updatedAt,
    }).onConflictDoUpdate({
      target: equipments.id,
      set: {
        code: newEqp.equipmentCode,
        name: newEqp.equipmentName,
        type: newEqp.category,
        status: newEqp.status,
        currentProjectId: newEqp.assignedProjectId || null,
        siteId: newEqp.assignedSiteId || null,
        updatedAt: newEqp.updatedAt,
      }
    });

    return newEqp;
  }

  async updateEquipment(id: string, data: Partial<Equipment>): Promise<Equipment | null> {
    await ensureFleetSeeded();

    const rows = await db.select().from(fleetEquipmentTable).where(eq(fleetEquipmentTable.id, id)).limit(1);
    if (rows.length === 0) return null;

    const existing = rows[0] as unknown as Equipment;
    const now = new Date().toISOString();
    const updated: Equipment = { ...existing, ...data, updatedAt: now };

    await db.update(fleetEquipmentTable).set(updated as any).where(eq(fleetEquipmentTable.id, id));

    // Sync to main schema equipments table
    await db.update(equipments).set({
      code: updated.equipmentCode,
      name: updated.equipmentName,
      type: updated.category,
      status: updated.status,
      currentProjectId: updated.assignedProjectId || null,
      siteId: updated.assignedSiteId || null,
      updatedAt: updated.updatedAt,
    }).where(eq(equipments.id, id));

    return updated;
  }

  // ====================================================
  // MAINTENANCE METHODS
  // ====================================================
  async getMaintenanceRecords(params: { page?: number; limit?: number; assetType?: string; status?: string }) {
    await ensureFleetSeeded();

    const allRecords = await db.select().from(fleetMaintenanceTable).orderBy(desc(fleetMaintenanceTable.createdAt));
    let filtered = allRecords as unknown as MaintenanceRecord[];

    if (params.assetType && params.assetType !== 'ALL') {
      filtered = filtered.filter(m => m.assetType === params.assetType);
    }

    if (params.status && params.status !== 'ALL') {
      filtered = filtered.filter(m => m.status === params.status);
    }

    const total = filtered.length;
    const page = params.page || 1;
    const limit = params.limit || 20;

    return { data: filtered.slice((page - 1) * limit, page * limit), meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } };
  }

  async createMaintenanceRecord(data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    await ensureFleetSeeded();

    const record: MaintenanceRecord = {
      id: data.id || `maint-${Math.random().toString(36).substring(2, 8)}`,
      maintenanceCode: data.maintenanceCode || `MNT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      assetType: data.assetType || 'VEHICLE',
      assetId: data.assetId || 'veh-101',
      assetName: data.assetName || 'Asset',
      assetCode: data.assetCode || 'REG-001',
      maintenanceType: data.maintenanceType || 'PREVENTIVE',
      category: data.category || 'GENERAL_SERVICE',
      serviceDate: data.serviceDate || new Date().toISOString().split('T')[0],
      completionDate: data.completionDate,
      odometerKm: data.odometerKm ? Number(data.odometerKm) : undefined,
      runningHours: data.runningHours ? Number(data.runningHours) : undefined,
      costAmount: Number(data.costAmount) || 0,
      vendorName: data.vendorName || 'Authorized Service Station',
      invoiceNumber: data.invoiceNumber || '',
      description: data.description || 'Routine service maintenance.',
      performedBy: data.performedBy || 'Technician',
      status: data.status || 'SCHEDULED',
      nextServiceDueDate: data.nextServiceDueDate,
      nextServiceDueKm: data.nextServiceDueKm ? Number(data.nextServiceDueKm) : undefined,
      nextServiceDueHours: data.nextServiceDueHours ? Number(data.nextServiceDueHours) : undefined,
      createdAt: new Date().toISOString(),
    };

    await db.insert(fleetMaintenanceTable).values(record as any).onConflictDoNothing();

    // Update asset status if breakdown or maintenance
    if (record.assetType === 'VEHICLE') {
      if (record.status === 'IN_PROGRESS' || record.status === 'SCHEDULED') {
        const newStatus = record.maintenanceType === 'BREAKDOWN' ? 'BREAKDOWN' : 'MAINTENANCE';
        await this.updateVehicle(record.assetId, { status: newStatus });
      } else if (record.status === 'COMPLETED') {
        await this.updateVehicle(record.assetId, { status: 'AVAILABLE' });
      }
    } else if (record.assetType === 'EQUIPMENT') {
      if (record.status === 'IN_PROGRESS' || record.status === 'SCHEDULED') {
        const newStatus = record.maintenanceType === 'BREAKDOWN' ? 'BREAKDOWN' : 'UNDER_MAINTENANCE';
        await this.updateEquipment(record.assetId, { status: newStatus });
      } else if (record.status === 'COMPLETED') {
        await this.updateEquipment(record.assetId, { status: 'OPERATIONAL' });
      }
    }

    return record;
  }

  // ====================================================
  // FUEL METHODS
  // ====================================================
  async getFuelLogs(params: { page?: number; limit?: number; projectId?: string; assetId?: string }) {
    await ensureFleetSeeded();

    const allLogs = await db.select().from(fleetFuelLogsTable).orderBy(desc(fleetFuelLogsTable.createdAt));
    let filtered = allLogs as unknown as FuelLog[];

    if (params.projectId && params.projectId !== 'ALL') {
      filtered = filtered.filter(f => f.projectId === params.projectId);
    }
    if (params.assetId) {
      filtered = filtered.filter(f => f.assetId === params.assetId);
    }

    const total = filtered.length;
    const page = params.page || 1;
    const limit = params.limit || 20;

    return { data: filtered.slice((page - 1) * limit, page * limit), meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } };
  }

  async createFuelLog(data: Partial<FuelLog>): Promise<FuelLog> {
    await ensureFleetSeeded();

    const assetId = String(data.assetId || '').trim();
    const assetType = String(data.assetType || '').trim().toUpperCase();
    const filledById = String(data.filledById || '').trim();
    const filledByName = String(data.filledByName || '').trim();
    const projectId = String(data.projectId || '').trim();
    const wbsId = String((data as any).wbsId || '').trim();
    const boqItemId = String((data as any).boqItemId || '').trim();
    const costCodeId = String((data as any).costCodeId || '').trim();
    const costCode = String((data as any).costCode || '').trim();

    const qty = Number(data.quantityLiters);
    const price = Number(data.unitPrice);
    if (!assetId || !['VEHICLE', 'EQUIPMENT'].includes(assetType) || !filledById || !filledByName || !projectId) {
      throw new Error('Asset, asset type, project and authenticated fuel-entry identity are required.');
    }
    if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price <= 0) {
      throw new Error('Fuel quantity and unit price must be positive numbers.');
    }

    const [project] = await db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.isActive, true))).limit(1);
    if (!project) throw new Error('Project not found or inactive.');

    if (wbsId) {
      const [wbs] = await db.select().from(projectWbs).where(and(eq(projectWbs.id, wbsId), eq(projectWbs.projectId, projectId))).limit(1);
      if (!wbs) throw new Error('WBS reference does not belong to the selected project.');
    }
    if (boqItemId) {
      const [boq] = await db.select().from(boqItems).where(and(eq(boqItems.id, boqItemId), eq(boqItems.projectId, projectId))).limit(1);
      if (!boq) throw new Error('BOQ item reference does not belong to the selected project.');
      if (wbsId && boq.wbsId !== wbsId) throw new Error('Selected BOQ item does not belong to the selected WBS.');
    }
    if (costCodeId) {
      const [codeRow] = await db.select().from(costCodes).where(and(eq(costCodes.id, costCodeId), eq(costCodes.isActive, true))).limit(1);
      if (!codeRow) throw new Error('Cost code reference was not found or is inactive.');
      if (codeRow.projectId && codeRow.projectId !== projectId) throw new Error('Cost code does not belong to the selected project.');
      if (wbsId && codeRow.wbsId && codeRow.wbsId !== wbsId) throw new Error('Cost code does not belong to the selected WBS.');
    }

    const total = qty * price;
    const log: FuelLog = {
      id: data.id || `fuel-${Math.random().toString(36).substring(2, 8)}`,
      fuelLogCode: data.fuelLogCode || `FL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      assetType,
      assetId,
      assetName: data.assetName,
      assetCode: data.assetCode,
      quantityLiters: qty,
      unitPrice: price,
      totalCost: total,
      fuelStation: data.fuelStation,
      odometerReadingKm: data.odometerReadingKm == null ? undefined : Number(data.odometerReadingKm),
      runningHours: data.runningHours == null ? undefined : Number(data.runningHours),
      mileageCalculated: data.mileageCalculated == null ? undefined : Number(data.mileageCalculated),
      projectId,
      projectName: data.projectName || project.projectName,
      wbsId: wbsId || undefined,
      boqItemId: boqItemId || undefined,
      costCodeId: costCodeId || undefined,
      costCode: costCode || undefined,
      siteId: data.siteId,
      siteName: data.siteName,
      filledById,
      filledByName,
      fillDate: data.fillDate || new Date().toISOString().split('T')[0],
      remarks: data.remarks || '',
      createdAt: new Date().toISOString(),
    };

    await db.insert(fleetFuelLogsTable).values(log as any).onConflictDoNothing();

    if (assetType === 'VEHICLE' && data.odometerReadingKm != null) {
      const v = await this.getVehicleById(assetId);
      if (v && Number(data.odometerReadingKm) > v.currentOdometerKm) {
        await this.updateVehicle(v.id, { currentOdometerKm: Number(data.odometerReadingKm) });
      }
    } else if (assetType === 'EQUIPMENT' && data.runningHours != null) {
      const rows = await db.select().from(fleetEquipmentTable).where(eq(fleetEquipmentTable.id, assetId)).limit(1);
      if (rows.length > 0) {
        const e = rows[0] as unknown as Equipment;
        if (Number(data.runningHours) > e.runningHours) {
          await this.updateEquipment(e.id, { runningHours: Number(data.runningHours) });
        }
      }
    }

    return log;
  }
  // ====================================================
  // TRIP LOG METHODS
  // ====================================================
  async getTripLogs(params: { page?: number; limit?: number; vehicleId?: string; projectId?: string }) {
    await ensureFleetSeeded();

    const allTrips = await db.select().from(fleetTripLogsTable).orderBy(desc(fleetTripLogsTable.createdAt));
    let filtered = allTrips as unknown as TripLog[];

    if (params.vehicleId) {
      filtered = filtered.filter(t => t.vehicleId === params.vehicleId);
    }
    if (params.projectId && params.projectId !== 'ALL') {
      filtered = filtered.filter(t => t.projectId === params.projectId);
    }

    const total = filtered.length;
    const page = params.page || 1;
    const limit = params.limit || 20;

    return { data: filtered.slice((page - 1) * limit, page * limit), meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } };
  }

  async createTripLog(data: Partial<TripLog>): Promise<TripLog> {
    await ensureFleetSeeded();

    const trip: TripLog = {
      id: data.id || `trip-${Math.random().toString(36).substring(2, 8)}`,
      tripCode: data.tripCode || `TRP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleId: data.vehicleId || 'veh-101',
      vehicleNumber: data.vehicleNumber || 'KA-01-EQ-9842',
      driverId: data.driverId || 'drv-201',
      driverName: data.driverName || 'Ramesh Kumar',
      origin: data.origin || 'Main Yard',
      destination: data.destination || 'Project Site #1',
      projectId: data.projectId,
      projectName: data.projectName,
      siteId: data.siteId,
      siteName: data.siteName,
      purpose: data.purpose || 'MATERIAL_TRANSPORT',
      startTime: data.startTime || new Date().toISOString(),
      endTime: data.endTime,
      startOdometerKm: Number(data.startOdometerKm) || 45000,
      endOdometerKm: data.endOdometerKm ? Number(data.endOdometerKm) : undefined,
      distanceKm: data.distanceKm ? Number(data.distanceKm) : undefined,
      fuelUsedLiters: data.fuelUsedLiters ? Number(data.fuelUsedLiters) : undefined,
      gatePassRef: data.gatePassRef,
      notes: data.notes || '',
      status: data.status || 'ONGOING',
      createdAt: new Date().toISOString(),
    };

    await db.insert(fleetTripLogsTable).values(trip as any).onConflictDoNothing();
    return trip;
  }

  // ====================================================
  // NOTIFICATION & ALERT METHODS
  // ====================================================
  async getNotifications(): Promise<FleetNotification[]> {
    await ensureFleetSeeded();

    const rows = await db.select().from(fleetNotificationsTable).orderBy(desc(fleetNotificationsTable.createdAt));
    return rows as unknown as FleetNotification[];
  }

  // ====================================================
  // ANALYTICS & REPORTS METHODS
  // ====================================================
  async getFleetAnalytics(): Promise<FleetAnalytics> {
    await ensureFleetSeeded();

    const allVehicles = (await db.select().from(fleetVehiclesTable)) as unknown as Vehicle[];
    const allEquipment = (await db.select().from(fleetEquipmentTable)) as unknown as Equipment[];
    const allDrivers = (await db.select().from(fleetDriversTable)) as unknown as Driver[];
    const allFuel = (await db.select().from(fleetFuelLogsTable)) as unknown as FuelLog[];
    const allMaint = (await db.select().from(fleetMaintenanceTable)) as unknown as MaintenanceRecord[];
    const allNotifs = (await db.select().from(fleetNotificationsTable)) as unknown as FleetNotification[];

    const totalVehicles = allVehicles.length;
    const activeVehicles = allVehicles.filter(v => v.status === 'IN_USE' || v.status === 'AVAILABLE').length;
    const vehiclesInMaintenance = allVehicles.filter(v => v.status === 'MAINTENANCE' || v.status === 'BREAKDOWN').length;

    const totalEquipment = allEquipment.length;
    const operationalEquipment = allEquipment.filter(e => e.status === 'OPERATIONAL').length;
    const idleEquipment = allEquipment.filter(e => e.status === 'IDLE').length;

    const totalDrivers = allDrivers.length;
    const activeDrivers = allDrivers.filter(d => d.status === 'ACTIVE').length;

    const totalFuelSpendThisMonth = allFuel.reduce((acc, f) => acc + (f.totalCost || 0), 0);
    const totalFuelLitersThisMonth = allFuel.reduce((acc, f) => acc + (f.quantityLiters || 0), 0);
    const totalMaintenanceCostThisMonth = allMaint.reduce((acc, m) => acc + (m.costAmount || 0), 0);

    return {
      totalVehicles,
      activeVehicles,
      vehiclesInMaintenance,
      totalEquipment,
      operationalEquipment,
      idleEquipment,
      totalDrivers,
      activeDrivers,
      totalFuelSpendThisMonth,
      totalFuelLitersThisMonth,
      avgVehicleMileageKmPerLiter: 3.1,
      totalMaintenanceCostThisMonth,
      pendingExpiriesCount: allNotifs.length,
      projectFuelBreakdown: [
        { projectId: 'proj-001', projectName: 'Metro Rail Line Extension - Phase 2', spend: 97125, liters: 1050 },
        { projectId: 'proj-002', projectName: 'Highway Bypass Viaduct Project', spend: 46250, liters: 500 },
      ],
      utilizationRates: [
        { category: 'Tippers & Dumpers', ratePercent: 88 },
        { category: 'Heavy Excavators', ratePercent: 92 },
        { category: 'Mobile & Tower Cranes', ratePercent: 78 },
        { category: 'Site Pickups & Utility', ratePercent: 85 },
        { category: 'Silent Generators', ratePercent: 95 },
      ]
    };
  }
}

export const fleetRepository = new FleetRepository();
