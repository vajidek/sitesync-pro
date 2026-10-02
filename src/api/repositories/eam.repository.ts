import { db } from '../../db/index';
import {
  phase71AssetCategories,
  phase71AssetGroups,
  phase71AssetMaster,
  phase71AssetSpecifications,
  phase71AssetHierarchy,
  phase71AssetLocations,
  phase71AssetCriticality,
  phase71AssetLifecycle,
  phase71AssetAcquisition,
  phase71AssetDepreciation,
  phase71AssetWarranty,
  phase71AssetManuals,
  phase71AssetPhotos,
  phase71PreventiveMaintenancePlans,
  phase71MaintenanceSchedules,
  phase71MaintenanceWorkOrders,
  phase71MaintenanceTasks,
  phase71MaintenanceChecklists,
  phase71MaintenanceLabor,
  phase71MaintenanceSpareParts,
  phase71MaintenanceHistory,
  phase71BreakdownReports,
  phase71DowntimeLogs,
  phase71ConditionMonitoring,
  phase71MeterReadings,
  phase71CalibrationRecords,
  phase71InspectionRecords,
  phase71MaintenanceCosts,
  phase71AssetDisposal,
  phase71AssetAuditLogs,
} from '../../db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const getDb = () => db;

export class EamRepository {
  private initialized = false;

  public async ensureEamTablesExist(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.seedDemoDataIfEmpty();
      this.initialized = true;
    } catch (error) {
      console.error('[EAM Repository] Table initialization error:', error);
    }
  }

  private async seedDemoDataIfEmpty(): Promise<void> {
    const db = getDb();
    const existing = await db
      .select({ count: sql<number>`count(*)` })
      .from(phase71AssetMaster)
      .where(eq(phase71AssetMaster.isDeleted, false));

    if (Number(existing[0]?.count || 0) > 0) return;

    const now = new Date().toISOString();

    // 1. Categories
    const categories = [
      { id: 'cat-heavy-machinery', categoryCode: 'CAT-HM', categoryName: 'Heavy Earthmoving & Lifting', defaultDepreciationYears: 8, icon: 'Truck' },
      { id: 'cat-concrete-equipment', categoryCode: 'CAT-CE', categoryName: 'Concrete & Batching Plants', defaultDepreciationYears: 10, icon: 'Hammer' },
      { id: 'cat-power-generators', categoryCode: 'CAT-PG', categoryName: 'Power & Temporary Utilities', defaultDepreciationYears: 7, icon: 'Zap' },
      { id: 'cat-survey-instruments', categoryCode: 'CAT-SI', categoryName: 'Geospatial & Testing Instruments', defaultDepreciationYears: 5, icon: 'Compass' },
      { id: 'cat-mep-hvac', categoryCode: 'CAT-MEP', categoryName: 'Plant Compressors & HVAC Systems', defaultDepreciationYears: 12, icon: 'Airplay' },
    ];

    for (const c of categories) {
      await db.insert(phase71AssetCategories).values({
        id: c.id,
        categoryCode: c.categoryCode,
        categoryName: c.categoryName,
        defaultDepreciationYears: c.defaultDepreciationYears,
        icon: c.icon,
        createdAt: now,
        updatedAt: now,
      }).onConflictDoNothing();
    }

    // 2. Locations
    const locations = [
      { id: 'loc-dubai-site-1', locationCode: 'LOC-DXB-01', locationName: 'Dubai South Skyrise Tower Site', zone: 'Zone A - Heavy Crane Bay', building: 'Tower Core 1', latitude: 25.076, longitude: 55.143 },
      { id: 'loc-yard-central', locationCode: 'LOC-YARD-01', locationName: 'Jebel Ali Central Fleet Depot', zone: 'Heavy Workshop Bay 4', building: 'Main Maintenance Hangar', latitude: 24.992, longitude: 55.082 },
      { id: 'loc-batching-plant', locationCode: 'LOC-BCH-02', locationName: 'Abu Dhabi Industrial Batching Yard', zone: 'Mixer Batching Station 2', building: 'Control Tower', latitude: 24.453, longitude: 54.377 },
      { id: 'loc-sharjah-site', locationCode: 'LOC-SHJ-03', locationName: 'Sharjah Waterfront Bridge Site', zone: 'East Piling Sector', building: 'Substructure Bay', latitude: 25.357, longitude: 55.391 },
    ];

    for (const loc of locations) {
      await db.insert(phase71AssetLocations).values({
        id: loc.id,
        locationCode: loc.locationCode,
        locationName: loc.locationName,
        zone: loc.zone,
        building: loc.building,
        latitude: loc.latitude,
        longitude: loc.longitude,
        createdAt: now,
        updatedAt: now,
      }).onConflictDoNothing();
    }

    // 3. Asset Master (Real Enterprise Construction & Plant Assets)
    const assets = [
      {
        id: 'asset-crane-ltm1250',
        assetCode: 'EQ-CRN-001',
        assetName: 'Liebherr LTM 1250-5.1 All-Terrain Mobile Crane (250t)',
        categoryId: 'cat-heavy-machinery',
        locationId: 'loc-dubai-site-1',
        serialNumber: 'LTM-250-78492',
        modelNumber: 'LTM 1250-5.1',
        manufacturer: 'Liebherr-Werk Ehingen GmbH',
        status: 'OPERATIONAL',
        criticality: 'CRITICAL_CLASS_A',
        purchaseDate: '2023-03-15',
        purchaseCostAed: 4850000,
        currentBookValueAed: 3950000,
        warrantyExpiryDate: '2026-03-14',
        operatingHours: 4210,
        runningMeterReading: 4210,
        meterUnit: 'HOURS',
        department: 'Heavy Lifting Operations',
        photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f2?w=800',
      },
      {
        id: 'asset-excavator-cat349',
        assetCode: 'EQ-EXC-002',
        assetName: 'Caterpillar 349D2 Hydraulic Excavator (48 Ton)',
        categoryId: 'cat-heavy-machinery',
        locationId: 'loc-sharjah-site',
        serialNumber: 'CAT-349-9941',
        modelNumber: '349D2 L',
        manufacturer: 'Caterpillar Inc.',
        status: 'OPERATIONAL',
        criticality: 'CRITICAL_CLASS_A',
        purchaseDate: '2023-06-20',
        purchaseCostAed: 1850000,
        currentBookValueAed: 1480000,
        warrantyExpiryDate: '2025-06-19',
        operatingHours: 6120,
        runningMeterReading: 6120,
        meterUnit: 'HOURS',
        department: 'Earthmoving Fleet',
        photoUrl: 'https://images.unsplash.com/photo-1579273166152-d725a4e2b755?w=800',
      },
      {
        id: 'asset-pump-putzmeister',
        assetCode: 'EQ-PMP-003',
        assetName: 'Putzmeister BSA 2110 HP-D High-Pressure Stationary Concrete Pump',
        categoryId: 'cat-concrete-equipment',
        locationId: 'loc-dubai-site-1',
        serialNumber: 'PM-BSA-2110-441',
        modelNumber: 'BSA 2110 HP-D',
        manufacturer: 'Putzmeister Concrete Pumps GmbH',
        status: 'UNDER_MAINTENANCE',
        criticality: 'CRITICAL_CLASS_A',
        purchaseDate: '2022-11-10',
        purchaseCostAed: 1650000,
        currentBookValueAed: 1210000,
        warrantyExpiryDate: '2024-11-09',
        operatingHours: 5430,
        runningMeterReading: 5430,
        meterUnit: 'HOURS',
        department: 'Concrete Placement Division',
        photoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
      },
      {
        id: 'asset-gen-cat500',
        assetCode: 'EQ-GEN-004',
        assetName: 'CAT C15 500kVA Soundproof Synchronized Diesel Generator',
        categoryId: 'cat-power-generators',
        locationId: 'loc-dubai-site-1',
        serialNumber: 'CAT-GEN-500-112',
        modelNumber: 'DE500GC',
        manufacturer: 'Caterpillar Energy Solutions',
        status: 'OPERATIONAL',
        criticality: 'ESSENTIAL_CLASS_B',
        purchaseDate: '2024-01-18',
        purchaseCostAed: 340000,
        currentBookValueAed: 295000,
        warrantyExpiryDate: '2027-01-17',
        operatingHours: 2890,
        runningMeterReading: 2890,
        meterUnit: 'HOURS',
        department: 'Site Utilities & Power',
        photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800',
      },
      {
        id: 'asset-survey-leica',
        assetCode: 'EQ-SRV-005',
        assetName: 'Leica TS16 I 1" R1000 Robotic Total Station with Captivate',
        categoryId: 'cat-survey-instruments',
        locationId: 'loc-dubai-site-1',
        serialNumber: 'LCA-TS16-8832',
        modelNumber: 'TS16 I 1"',
        manufacturer: 'Leica Geosystems AG',
        status: 'OPERATIONAL',
        criticality: 'ESSENTIAL_CLASS_B',
        purchaseDate: '2024-04-10',
        purchaseCostAed: 145000,
        currentBookValueAed: 128000,
        warrantyExpiryDate: '2027-04-09',
        operatingHours: 940,
        runningMeterReading: 940,
        meterUnit: 'HOURS',
        department: 'Geodetic Surveying & QA',
        photoUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800',
      },
      {
        id: 'asset-comp-atlas',
        assetCode: 'EQ-CMP-006',
        assetName: 'Atlas Copco GA 75 VSD+ Rotary Screw Air Compressor (10.5 Bar)',
        categoryId: 'cat-mep-hvac',
        locationId: 'loc-yard-central',
        serialNumber: 'AC-GA75-7721',
        modelNumber: 'GA 75 VSD+',
        manufacturer: 'Atlas Copco Airpower',
        status: 'OPERATIONAL',
        criticality: 'GENERAL_CLASS_C',
        purchaseDate: '2023-09-05',
        purchaseCostAed: 220000,
        currentBookValueAed: 185000,
        warrantyExpiryDate: '2025-09-04',
        operatingHours: 3750,
        runningMeterReading: 3750,
        meterUnit: 'HOURS',
        department: 'Central Workshop Maintenance',
        photoUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800',
      },
    ];

    for (const a of assets) {
      await db.insert(phase71AssetMaster).values({
        id: a.id,
        assetCode: a.assetCode,
        assetName: a.assetName,
        categoryId: a.categoryId,
        locationId: a.locationId,
        serialNumber: a.serialNumber,
        modelNumber: a.modelNumber,
        manufacturer: a.manufacturer,
        status: a.status,
        criticality: a.criticality,
        purchaseDate: a.purchaseDate,
        purchaseCostAed: a.purchaseCostAed,
        currentBookValueAed: a.currentBookValueAed,
        warrantyExpiryDate: a.warrantyExpiryDate,
        operatingHours: a.operatingHours,
        runningMeterReading: a.runningMeterReading,
        meterUnit: a.meterUnit,
        department: a.department,
        photoUrl: a.photoUrl,
        createdAt: now,
        updatedAt: now,
      }).onConflictDoNothing();

      // Asset Criticality Scores
      await db.insert(phase71AssetCriticality).values({
        id: 'crit-' + a.id,
        assetId: a.id,
        safetyImpactScore: a.criticality === 'CRITICAL_CLASS_A' ? 5 : 3,
        environmentalImpactScore: a.criticality === 'CRITICAL_CLASS_A' ? 4 : 2,
        productionLossScore: a.criticality === 'CRITICAL_CLASS_A' ? 5 : 3,
        maintenanceCostScore: a.criticality === 'CRITICAL_CLASS_A' ? 4 : 3,
        spareLeadTimeScore: a.criticality === 'CRITICAL_CLASS_A' ? 4 : 2,
        totalRiskScore: a.criticality === 'CRITICAL_CLASS_A' ? 22 : 13,
        rcmCategory: a.criticality === 'CRITICAL_CLASS_A' ? 'CLASS_A_CRITICAL' : 'CLASS_B_ESSENTIAL',
        recommendations: 'Quarterly vibration telemetry, monthly oil analysis and OEM certified inspection.',
        createdAt: now,
        updatedAt: now,
      }).onConflictDoNothing();
    }

    // 4. Preventive Maintenance Plans
    const pmPlans = [
      {
        id: 'plan-crane-500h',
        planCode: 'PM-CRN-500H',
        planTitle: 'Liebherr Mobile Crane 500-Hour Hydraulic & Boom Inspection',
        categoryId: 'cat-heavy-machinery',
        assetId: 'asset-crane-ltm1250',
        frequencyType: 'METER_BASED',
        intervalDays: 60,
        meterInterval: 500,
        estimatedDurationHours: 6,
        requiredCrewCount: 2,
        estimatedCostAed: 3500,
        safetyGuidelines: 'Lockout-Tagout (LOTO) hydraulic system, deploy all 5 outriggers on steel load-bearing pads.',
      },
      {
        id: 'plan-gen-monthly',
        planCode: 'PM-GEN-MONTHLY',
        planTitle: 'CAT Generator Monthly Full-Load Diagnostic & Lube Service',
        categoryId: 'cat-power-generators',
        assetId: 'asset-gen-cat500',
        frequencyType: 'TIME_BASED',
        intervalDays: 30,
        meterInterval: 250,
        estimatedDurationHours: 3,
        requiredCrewCount: 1,
        estimatedCostAed: 1200,
        safetyGuidelines: 'Isolate main ATS synchronization panel prior to filter changes.',
      },
      {
        id: 'plan-pump-biweekly',
        planCode: 'PM-PMP-BIWEEKLY',
        planTitle: 'Concrete Pump S-Tube & Wear Plate Clearance Service',
        categoryId: 'cat-concrete-equipment',
        assetId: 'asset-pump-putzmeister',
        frequencyType: 'TIME_BASED',
        intervalDays: 14,
        meterInterval: 100,
        estimatedDurationHours: 4,
        requiredCrewCount: 2,
        estimatedCostAed: 2200,
        safetyGuidelines: 'Flush all delivery pipelines with water sponge ball before opening hopper.',
      },
    ];

    for (const p of pmPlans) {
      await db.insert(phase71PreventiveMaintenancePlans).values({
        id: p.id,
        planCode: p.planCode,
        planTitle: p.planTitle,
        categoryId: p.categoryId,
        assetId: p.assetId,
        frequencyType: p.frequencyType,
        intervalDays: p.intervalDays,
        meterInterval: p.meterInterval,
        estimatedDurationHours: p.estimatedDurationHours,
        requiredCrewCount: p.requiredCrewCount,
        estimatedCostAed: p.estimatedCostAed,
        safetyGuidelines: p.safetyGuidelines,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      }).onConflictDoNothing();
    }

    // 5. Work Orders
    const workOrders = [
      {
        id: 'wo-2026-001',
        workOrderNumber: 'WO-2026-0801',
        title: 'LTM 1250 Outrigger Pressure Relief Valve Replacement & Calibration',
        workOrderType: 'PREVENTIVE',
        priority: 'HIGH_P2',
        assetId: 'asset-crane-ltm1250',
        status: 'COMPLETED',
        requestedBy: 'Eng. Tariq Al-Hashimi',
        assignedTo: 'Lead Tech. Vikram Sharma',
        plannedStartDate: '2026-08-05',
        plannedEndDate: '2026-08-06',
        actualStartDate: '2026-08-05',
        actualEndDate: '2026-08-06',
        totalLaborHours: 8,
        totalLaborCostAed: 960,
        totalPartsCostAed: 2400,
        totalOtherCostAed: 300,
        totalCostAed: 3660,
        resolutionSummary: 'Replaced proportional cartridge relief valves on front left and rear right outrigger rams. Pressure verified to 350 bar specification.',
        isDowntimeCaused: true,
        downtimeMinutes: 360,
      },
      {
        id: 'wo-2026-002',
        workOrderNumber: 'WO-2026-0802',
        title: 'Emergency Repair: Putzmeister Concrete Pump Hydraulic Hose Burst',
        workOrderType: 'CORRECTIVE_BREAKDOWN',
        priority: 'CRITICAL_P1',
        assetId: 'asset-pump-putzmeister',
        status: 'IN_PROGRESS',
        requestedBy: 'Site Superintendent Mark O’Connor',
        assignedTo: 'Hydraulic Specialist Hamad Al-Sayed',
        plannedStartDate: '2026-08-14',
        plannedEndDate: '2026-08-15',
        actualStartDate: '2026-08-14',
        actualEndDate: null,
        totalLaborHours: 4.5,
        totalLaborCostAed: 540,
        totalPartsCostAed: 1800,
        totalOtherCostAed: 0,
        totalCostAed: 2340,
        failureCode: 'HYD-HOSE-RUPTURE',
        resolutionSummary: 'Replacing main 4-spiral hydraulic delivery line from main pump to accumulator. Flushed system and currently bleeding air.',
        isDowntimeCaused: true,
        downtimeMinutes: 270,
      },
      {
        id: 'wo-2026-003',
        workOrderNumber: 'WO-2026-0803',
        title: 'CAT 500kVA Generator 250H Routine Oil, Fuel & Air Filter Overhaul',
        workOrderType: 'PREVENTIVE',
        priority: 'MEDIUM_P3',
        assetId: 'asset-gen-cat500',
        status: 'OPEN',
        requestedBy: 'Maintenance Planner',
        assignedTo: 'Electromechanical Team Beta',
        plannedStartDate: '2026-08-18',
        plannedEndDate: '2026-08-18',
        actualStartDate: null,
        actualEndDate: null,
        totalLaborHours: 3,
        totalLaborCostAed: 360,
        totalPartsCostAed: 750,
        totalOtherCostAed: 0,
        totalCostAed: 1110,
        isDowntimeCaused: false,
        downtimeMinutes: 0,
      },
    ];

    for (const wo of workOrders) {
      await db.insert(phase71MaintenanceWorkOrders).values({
        id: wo.id,
        workOrderNumber: wo.workOrderNumber,
        title: wo.title,
        workOrderType: wo.workOrderType,
        priority: wo.priority,
        assetId: wo.assetId,
        status: wo.status,
        requestedBy: wo.requestedBy,
        assignedTo: wo.assignedTo,
        plannedStartDate: wo.plannedStartDate,
        plannedEndDate: wo.plannedEndDate,
        actualStartDate: wo.actualStartDate,
        actualEndDate: wo.actualEndDate,
        totalLaborHours: wo.totalLaborHours,
        totalLaborCostAed: wo.totalLaborCostAed,
        totalPartsCostAed: wo.totalPartsCostAed,
        totalOtherCostAed: wo.totalOtherCostAed,
        totalCostAed: wo.totalCostAed,
        resolutionSummary: wo.resolutionSummary,
        isDowntimeCaused: wo.isDowntimeCaused,
        downtimeMinutes: wo.downtimeMinutes,
        createdAt: now,
        updatedAt: now,
      }).onConflictDoNothing();

      // Seed sample tasks and checklists for the work order
      await db.insert(phase71MaintenanceTasks).values({
        id: 'task-1-' + wo.id,
        workOrderId: wo.id,
        taskSequence: 1,
        taskDescription: 'Inspect hydraulic pressure levels and check for pinhole leaks',
        taskType: 'INSPECTION_SERVICE',
        estimatedMinutes: 60,
        actualMinutes: 45,
        status: wo.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS',
        completedBy: wo.assignedTo,
        createdAt: now,
        updatedAt: now,
      }).onConflictDoNothing();

      await db.insert(phase71MaintenanceChecklists).values({
        id: 'chk-1-' + wo.id,
        workOrderId: wo.id,
        checkItem: 'Safety isolation / LOTO tag attached and verified zero energy',
        expectedCondition: 'Verified zero stored hydraulic/electrical pressure',
        observedCondition: 'Isolators padlocked, zero bar confirmed on master gauge',
        isPassed: true,
        isMandatory: true,
        checkedBy: wo.assignedTo,
        checkedAt: now,
        createdAt: now,
        updatedAt: now,
      }).onConflictDoNothing();
    }

    // 6. Breakdowns & Downtime
    await db.insert(phase71BreakdownReports).values({
      id: 'brk-2026-001',
      breakdownNumber: 'BD-2026-0044',
      assetId: 'asset-pump-putzmeister',
      breakdownDate: '2026-08-14',
      breakdownTime: '07:45 AM',
      reportedBy: 'Site Shift Foreman - Rashid Khan',
      initialSymptoms: 'Sudden pressure drop and oil mist spray near pump hopper drive cylinder during 45th cubic meter pour.',
      severity: 'CRITICAL_STOPPAGE',
      suspectedRootCause: 'Thermal fatigue on 4-spiral flexible hose fitting under continuous 210 bar pumping pressure.',
      productionImpact: 'LINE_HALTED',
      emergencyWorkOrderId: 'wo-2026-002',
      status: 'UNDER_REPAIR',
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing();

    await db.insert(phase71DowntimeLogs).values({
      id: 'dt-2026-001',
      breakdownId: 'brk-2026-001',
      workOrderId: 'wo-2026-002',
      assetId: 'asset-pump-putzmeister',
      startTime: '2026-08-14T07:45:00Z',
      endTime: null,
      totalDowntimeMinutes: 270,
      downtimeCategory: 'UNPLANNED_MECHANICAL',
      lossCostAed: 14500,
      resolvedBy: 'Hydraulic Team',
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing();

    // 7. Condition Monitoring & Telemetry
    const telemetry = [
      { id: 'tele-1', assetId: 'asset-crane-ltm1250', sensorId: 'SNS-VIB-01', parameterName: 'Main Slewing Bearing Vibration (RMS)', parameterValue: 2.14, unit: 'mm/s', thresholdMin: 0, thresholdMax: 4.5, alertSeverity: 'NORMAL', isAlarmActive: false },
      { id: 'tele-2', assetId: 'asset-crane-ltm1250', sensorId: 'SNS-TMP-02', parameterName: 'Hydraulic Oil Reservoir Temperature', parameterValue: 68.5, unit: '°C', thresholdMin: 20, thresholdMax: 85, alertSeverity: 'NORMAL', isAlarmActive: false },
      { id: 'tele-3', assetId: 'asset-pump-putzmeister', sensorId: 'SNS-PRS-03', parameterName: 'Pumping Circuit Working Pressure', parameterValue: 215.0, unit: 'bar', thresholdMin: 50, thresholdMax: 210, alertSeverity: 'CRITICAL_ALARM', isAlarmActive: true },
      { id: 'tele-4', assetId: 'asset-gen-cat500', sensorId: 'SNS-FRQ-04', parameterName: 'Generator Output Grid Frequency', parameterValue: 50.04, unit: 'Hz', thresholdMin: 49.5, thresholdMax: 50.5, alertSeverity: 'NORMAL', isAlarmActive: false },
    ];

    for (const t of telemetry) {
      await db.insert(phase71ConditionMonitoring).values({
        id: t.id,
        assetId: t.assetId,
        sensorId: t.sensorId,
        parameterName: t.parameterName,
        parameterValue: t.parameterValue,
        unit: t.unit,
        thresholdMin: t.thresholdMin,
        thresholdMax: t.thresholdMax,
        alertSeverity: t.alertSeverity,
        measuredAt: now,
        isAlarmActive: t.isAlarmActive,
        createdAt: now,
        updatedAt: now,
      }).onConflictDoNothing();
    }

    // 8. Calibration Records
    await db.insert(phase71CalibrationRecords).values({
      id: 'cal-2026-001',
      calibrationNumber: 'CAL-2026-019',
      assetId: 'asset-survey-leica',
      instrumentName: 'Leica TS16 Robotic Total Station Optical & EDM Sensor',
      calibrationAgency: 'Leica Geosystems Authorized Center UAE',
      certificateNumber: 'CERT-LCA-2026-8812',
      calibratedDate: '2026-04-15',
      nextDueDate: '2027-04-14',
      standardUsed: 'ISO 17123-3 (Theodolites) & ISO 17123-4 (EDM)',
      resultStatus: 'PASS_WITHIN_TOLERANCE',
      uncertaintyMeasurement: '±1.0 mm + 1.5 ppm',
      approvedBy: 'Chief Surveyor Nabil Mansour',
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing();

    // 9. Inspection Records
    await db.insert(phase71InspectionRecords).values({
      id: 'insp-2026-001',
      inspectionNumber: 'INSP-2026-052',
      assetId: 'asset-crane-ltm1250',
      inspectorName: 'Bureau Veritas UAE Crane Inspector',
      inspectionType: 'THIRD_PARTY_STATUTORY',
      inspectionDate: '2026-05-10',
      complianceStandard: 'UAE Federal Law 8 / BS 7121 / ASME B30.5',
      overallRating: 'EXCELLENT',
      observations: 'All wire ropes, load moment limiter (LML), anti-two-block devices and load cells tested to 125% proof load without deformation.',
      recommendedActions: 'Routine lube to boom extension sliding pads every 200 operating hours.',
      passStatus: true,
      nextInspectionDate: '2027-05-09',
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing();

    // 10. Maintenance Costs
    await db.insert(phase71MaintenanceCosts).values({
      id: 'cost-2026-08',
      assetId: 'asset-crane-ltm1250',
      costPeriod: '2026-08',
      preventiveCostAed: 3660,
      correctiveCostAed: 1200,
      sparePartsCostAed: 2400,
      externalVendorCostAed: 800,
      totalMaintenanceCostAed: 8060,
      budgetAed: 10000,
      varianceAed: 1940,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing();

    console.log('[EAM Repository] Seeded Enterprise Asset Management & CMMS demo data successfully.');
  }

  // --- ASSET CATEGORIES ---
  public async getCategories() {
    await this.ensureEamTablesExist();
    const db = getDb();
    return db.select().from(phase71AssetCategories).where(eq(phase71AssetCategories.isDeleted, false));
  }

  public async createCategory(data: any, createdBy: string = 'EAM Admin') {
    await this.ensureEamTablesExist();
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    const [created] = await db.insert(phase71AssetCategories).values({
      id,
      categoryCode: data.categoryCode,
      categoryName: data.categoryName,
      description: data.description,
      defaultDepreciationYears: data.defaultDepreciationYears || 10,
      icon: data.icon || 'Wrench',
      createdAt: now,
      updatedAt: now,
      createdBy,
      updatedBy: createdBy,
    }).returning();
    return created;
  }

  // --- ASSET MASTER ---
  public async getAssets(filters?: { categoryId?: string; status?: string; criticality?: string }) {
    await this.ensureEamTablesExist();
    const db = getDb();
    const conditions = [eq(phase71AssetMaster.isDeleted, false)];
    if (filters?.categoryId) conditions.push(eq(phase71AssetMaster.categoryId, filters.categoryId));
    if (filters?.status) conditions.push(eq(phase71AssetMaster.status, filters.status));
    if (filters?.criticality) conditions.push(eq(phase71AssetMaster.criticality, filters.criticality));

    return db
      .select()
      .from(phase71AssetMaster)
      .where(and(...conditions))
      .orderBy(desc(phase71AssetMaster.createdAt));
  }

  public async getAssetById(id: string) {
    await this.ensureEamTablesExist();
    const db = getDb();
    const [asset] = await db
      .select()
      .from(phase71AssetMaster)
      .where(and(eq(phase71AssetMaster.id, id), eq(phase71AssetMaster.isDeleted, false)));
    return asset || null;
  }

  public async createAsset(data: any, createdBy: string = 'EAM Admin') {
    await this.ensureEamTablesExist();
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    const code = data.assetCode || `EQ-${Date.now().toString().slice(-4)}`;

    const [created] = await db.insert(phase71AssetMaster).values({
      id,
      assetCode: code,
      assetName: data.assetName,
      categoryId: data.categoryId,
      groupId: data.groupId,
      locationId: data.locationId,
      parentAssetId: data.parentAssetId,
      serialNumber: data.serialNumber,
      modelNumber: data.modelNumber,
      manufacturer: data.manufacturer,
      barcode: data.barcode || code,
      rfidTag: data.rfidTag,
      status: data.status || 'OPERATIONAL',
      criticality: data.criticality || 'ESSENTIAL_CLASS_B',
      purchaseDate: data.purchaseDate,
      purchaseCostAed: data.purchaseCostAed || 0,
      currentBookValueAed: data.currentBookValueAed || data.purchaseCostAed || 0,
      warrantyExpiryDate: data.warrantyExpiryDate,
      operatingHours: data.operatingHours || 0,
      runningMeterReading: data.runningMeterReading || 0,
      meterUnit: data.meterUnit || 'HOURS',
      assignedToEmployeeId: data.assignedToEmployeeId,
      department: data.department || 'Plant & Machinery',
      projectId: data.projectId,
      specificationsJson: data.specificationsJson,
      photoUrl: data.photoUrl,
      createdAt: now,
      updatedAt: now,
      createdBy,
      updatedBy: createdBy,
    }).returning();

    // Log Audit
    await this.createAuditLog({
      actionType: 'ASSET_REGISTERED',
      entityType: 'ASSET_MASTER',
      entityId: id,
      referenceNumber: code,
      performedBy: createdBy,
      detailsJson: JSON.stringify({ assetName: data.assetName, categoryId: data.categoryId }),
    });

    return created;
  }

  public async updateAsset(id: string, data: any, updatedBy: string = 'EAM Admin') {
    await this.ensureEamTablesExist();
    const db = getDb();
    const now = new Date().toISOString();
    const [updated] = await db
      .update(phase71AssetMaster)
      .set({
        ...data,
        updatedAt: now,
        updatedBy,
      })
      .where(eq(phase71AssetMaster.id, id))
      .returning();
    return updated;
  }

  // --- LOCATIONS ---
  public async getLocations() {
    await this.ensureEamTablesExist();
    const db = getDb();
    return db.select().from(phase71AssetLocations).where(eq(phase71AssetLocations.isDeleted, false));
  }

  public async createLocation(data: any, createdBy: string = 'EAM Admin') {
    await this.ensureEamTablesExist();
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    const [created] = await db.insert(phase71AssetLocations).values({
      id,
      locationCode: data.locationCode,
      locationName: data.locationName,
      siteName: data.siteName || 'Main Plant / Central Yard',
      zone: data.zone,
      building: data.building,
      floor: data.floor,
      latitude: data.latitude,
      longitude: data.longitude,
      createdAt: now,
      updatedAt: now,
      createdBy,
      updatedBy: createdBy,
    }).returning();
    return created;
  }

  // --- CRITICALITY MATRIX ---
  public async getCriticalityMatrix() {
    await this.ensureEamTablesExist();
    const db = getDb();
    return db.select().from(phase71AssetCriticality).where(eq(phase71AssetCriticality.isDeleted, false));
  }

  // --- PREVENTIVE MAINTENANCE PLANS & SCHEDULES ---
  public async getPreventivePlans() {
    await this.ensureEamTablesExist();
    const db = getDb();
    return db.select().from(phase71PreventiveMaintenancePlans).where(eq(phase71PreventiveMaintenancePlans.isDeleted, false));
  }

  public async createPreventivePlan(data: any, createdBy: string = 'Maintenance Planner') {
    await this.ensureEamTablesExist();
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    const code = data.planCode || `PM-${Date.now().toString().slice(-4)}`;

    const [created] = await db.insert(phase71PreventiveMaintenancePlans).values({
      id,
      planCode: code,
      planTitle: data.planTitle,
      categoryId: data.categoryId,
      assetId: data.assetId,
      frequencyType: data.frequencyType || 'TIME_BASED',
      intervalDays: data.intervalDays || 30,
      meterInterval: data.meterInterval || 500,
      estimatedDurationHours: data.estimatedDurationHours || 4,
      requiredCrewCount: data.requiredCrewCount || 2,
      estimatedCostAed: data.estimatedCostAed || 1500,
      checklistTemplateJson: data.checklistTemplateJson,
      safetyGuidelines: data.safetyGuidelines,
      status: data.status || 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      createdBy,
      updatedBy: createdBy,
    }).returning();
    return created;
  }

  public async getMaintenanceSchedules() {
    await this.ensureEamTablesExist();
    const db = getDb();
    return db.select().from(phase71MaintenanceSchedules).where(eq(phase71MaintenanceSchedules.isDeleted, false)).orderBy(desc(phase71MaintenanceSchedules.scheduledDate));
  }

  public async createMaintenanceSchedule(data: any, createdBy: string = 'Maintenance Planner') {
    await this.ensureEamTablesExist();
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    const code = data.scheduleCode || `SCH-${Date.now().toString().slice(-4)}`;

    const [created] = await db.insert(phase71MaintenanceSchedules).values({
      id,
      scheduleCode: code,
      planId: data.planId,
      assetId: data.assetId,
      scheduledDate: data.scheduledDate,
      dueDate: data.dueDate,
      triggerSource: data.triggerSource || 'CALENDAR_CADENCE',
      status: data.status || 'SCHEDULED',
      assignedTeam: data.assignedTeam || 'Mechanical Maintenance Crew A',
      leadTechnicianId: data.leadTechnicianId,
      createdAt: now,
      updatedAt: now,
      createdBy,
      updatedBy: createdBy,
    }).returning();
    return created;
  }

  // --- WORK ORDERS ---
  public async getWorkOrders(filters?: { status?: string; workOrderType?: string; assetId?: string }) {
    await this.ensureEamTablesExist();
    const db = getDb();
    const conditions = [eq(phase71MaintenanceWorkOrders.isDeleted, false)];
    if (filters?.status) conditions.push(eq(phase71MaintenanceWorkOrders.status, filters.status));
    if (filters?.workOrderType) conditions.push(eq(phase71MaintenanceWorkOrders.workOrderType, filters.workOrderType));
    if (filters?.assetId) conditions.push(eq(phase71MaintenanceWorkOrders.assetId, filters.assetId));

    return db
      .select()
      .from(phase71MaintenanceWorkOrders)
      .where(and(...conditions))
      .orderBy(desc(phase71MaintenanceWorkOrders.createdAt));
  }

  public async getWorkOrderById(id: string) {
    await this.ensureEamTablesExist();
    const db = getDb();
    const [wo] = await db
      .select()
      .from(phase71MaintenanceWorkOrders)
      .where(and(eq(phase71MaintenanceWorkOrders.id, id), eq(phase71MaintenanceWorkOrders.isDeleted, false)));
    return wo || null;
  }

  public async createWorkOrder(data: any, createdBy: string = 'Maintenance Admin') {
    await this.ensureEamTablesExist();
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    const woNum = data.workOrderNumber || `WO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const totalCost = (Number(data.totalLaborCostAed) || 0) + (Number(data.totalPartsCostAed) || 0) + (Number(data.totalOtherCostAed) || 0);

    const [created] = await db.insert(phase71MaintenanceWorkOrders).values({
      id,
      workOrderNumber: woNum,
      title: data.title,
      workOrderType: data.workOrderType || 'PREVENTIVE',
      priority: data.priority || 'MEDIUM_P3',
      assetId: data.assetId,
      scheduleId: data.scheduleId,
      breakdownId: data.breakdownId,
      status: data.status || 'OPEN',
      requestedBy: data.requestedBy || 'Operations Supervisor',
      assignedTo: data.assignedTo || 'Sr. Maintenance Engineer',
      plannedStartDate: data.plannedStartDate,
      plannedEndDate: data.plannedEndDate,
      actualStartDate: data.actualStartDate,
      actualEndDate: data.actualEndDate,
      totalLaborHours: data.totalLaborHours || 0,
      totalLaborCostAed: data.totalLaborCostAed || 0,
      totalPartsCostAed: data.totalPartsCostAed || 0,
      totalOtherCostAed: data.totalOtherCostAed || 0,
      totalCostAed: totalCost,
      failureCode: data.failureCode,
      resolutionSummary: data.resolutionSummary,
      isDowntimeCaused: data.isDowntimeCaused || false,
      downtimeMinutes: data.downtimeMinutes || 0,
      createdAt: now,
      updatedAt: now,
      createdBy,
      updatedBy: createdBy,
    }).returning();

    // Log Audit
    await this.createAuditLog({
      actionType: 'WORK_ORDER_CREATED',
      entityType: 'WORK_ORDER',
      entityId: id,
      referenceNumber: woNum,
      performedBy: createdBy,
      detailsJson: JSON.stringify({ title: data.title, type: data.workOrderType, priority: data.priority }),
    });

    return created;
  }

  public async updateWorkOrder(id: string, data: any, updatedBy: string = 'Maintenance Admin') {
    await this.ensureEamTablesExist();
    const db = getDb();
    const now = new Date().toISOString();

    const [updated] = await db
      .update(phase71MaintenanceWorkOrders)
      .set({
        ...data,
        updatedAt: now,
        updatedBy,
      })
      .where(eq(phase71MaintenanceWorkOrders.id, id))
      .returning();

    if (data.status === 'COMPLETED' || data.status === 'VERIFIED_CLOSED') {
      // Record in maintenance history
      if (updated) {
        await db.insert(phase71MaintenanceHistory).values({
          id: uuidv4(),
          assetId: updated.assetId,
          eventType: updated.workOrderType === 'PREVENTIVE' ? 'PM_COMPLETED' : 'BREAKDOWN_REPAIRED',
          referenceNumber: updated.workOrderNumber,
          summary: updated.title,
          actionTaken: updated.resolutionSummary || 'Maintenance completed in accordance with OEM standard checklist.',
          costAed: updated.totalCostAed,
          downtimeHours: (updated.downtimeMinutes || 0) / 60,
          loggedBy: updatedBy,
          eventDate: now.slice(0, 10),
          createdAt: now,
          updatedAt: now,
        }).onConflictDoNothing();
      }
    }

    return updated;
  }

  // --- BREAKDOWN & DOWNTIME ---
  public async getBreakdownReports() {
    await this.ensureEamTablesExist();
    const db = getDb();
    return db.select().from(phase71BreakdownReports).where(eq(phase71BreakdownReports.isDeleted, false)).orderBy(desc(phase71BreakdownReports.createdAt));
  }

  public async createBreakdownReport(data: any, createdBy: string = 'Site Operator') {
    await this.ensureEamTablesExist();
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    const code = data.breakdownNumber || `BD-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const [created] = await db.insert(phase71BreakdownReports).values({
      id,
      breakdownNumber: code,
      assetId: data.assetId,
      breakdownDate: data.breakdownDate,
      breakdownTime: data.breakdownTime,
      reportedBy: data.reportedBy,
      initialSymptoms: data.initialSymptoms,
      severity: data.severity || 'CRITICAL_STOPPAGE',
      suspectedRootCause: data.suspectedRootCause,
      productionImpact: data.productionImpact || 'LINE_HALTED',
      status: data.status || 'REPORTED',
      createdAt: now,
      updatedAt: now,
      createdBy,
      updatedBy: createdBy,
    }).returning();

    // Auto-update asset status to BREAKDOWN
    await db
      .update(phase71AssetMaster)
      .set({ status: 'BREAKDOWN', updatedAt: now, updatedBy: createdBy })
      .where(eq(phase71AssetMaster.id, data.assetId));

    // Log Audit
    await this.createAuditLog({
      actionType: 'BREAKDOWN_LOGGED',
      entityType: 'BREAKDOWN_REPORT',
      entityId: id,
      referenceNumber: code,
      performedBy: createdBy,
      detailsJson: JSON.stringify({ severity: data.severity, impact: data.productionImpact }),
    });

    return created;
  }

  // --- CONDITION MONITORING & TELEMETRY ---
  public async getConditionMonitoring(assetId?: string) {
    await this.ensureEamTablesExist();
    const db = getDb();
    if (assetId) {
      return db
        .select()
        .from(phase71ConditionMonitoring)
        .where(and(eq(phase71ConditionMonitoring.assetId, assetId), eq(phase71ConditionMonitoring.isDeleted, false)))
        .orderBy(desc(phase71ConditionMonitoring.measuredAt));
    }
    return db
      .select()
      .from(phase71ConditionMonitoring)
      .where(eq(phase71ConditionMonitoring.isDeleted, false))
      .orderBy(desc(phase71ConditionMonitoring.measuredAt))
      .limit(100);
  }

  public async createConditionMonitoring(data: any, createdBy: string = 'IoT Gateway') {
    await this.ensureEamTablesExist();
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();

    const [created] = await db.insert(phase71ConditionMonitoring).values({
      id,
      assetId: data.assetId,
      sensorId: data.sensorId,
      parameterName: data.parameterName,
      parameterValue: data.parameterValue,
      unit: data.unit,
      thresholdMin: data.thresholdMin || 0,
      thresholdMax: data.thresholdMax || 100,
      alertSeverity: data.alertSeverity || 'NORMAL',
      measuredAt: data.measuredAt || now,
      isAlarmActive: data.isAlarmActive || false,
      createdAt: now,
      updatedAt: now,
      createdBy,
      updatedBy: createdBy,
    }).returning();
    return created;
  }

  // --- CALIBRATION RECORDS ---
  public async getCalibrationRecords() {
    await this.ensureEamTablesExist();
    const db = getDb();
    return db.select().from(phase71CalibrationRecords).where(eq(phase71CalibrationRecords.isDeleted, false)).orderBy(desc(phase71CalibrationRecords.calibratedDate));
  }

  public async createCalibrationRecord(data: any, createdBy: string = 'Calibration Lead') {
    await this.ensureEamTablesExist();
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    const code = data.calibrationNumber || `CAL-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const [created] = await db.insert(phase71CalibrationRecords).values({
      id,
      calibrationNumber: code,
      assetId: data.assetId,
      instrumentName: data.instrumentName,
      calibrationAgency: data.calibrationAgency || 'Dubai Central Laboratory (DCL)',
      certificateNumber: data.certificateNumber,
      calibratedDate: data.calibratedDate,
      nextDueDate: data.nextDueDate,
      standardUsed: data.standardUsed || 'ISO/IEC 17025 Traceable Master',
      resultStatus: data.resultStatus || 'PASS_WITHIN_TOLERANCE',
      uncertaintyMeasurement: data.uncertaintyMeasurement || '±0.05% FS',
      approvedBy: data.approvedBy || 'QA/QC Calibration Lead',
      certificateUrl: data.certificateUrl,
      createdAt: now,
      updatedAt: now,
      createdBy,
      updatedBy: createdBy,
    }).returning();
    return created;
  }

  // --- INSPECTION RECORDS ---
  public async getInspectionRecords() {
    await this.ensureEamTablesExist();
    const db = getDb();
    return db.select().from(phase71InspectionRecords).where(eq(phase71InspectionRecords.isDeleted, false)).orderBy(desc(phase71InspectionRecords.inspectionDate));
  }

  public async createInspectionRecord(data: any, createdBy: string = 'QA/QC Inspector') {
    await this.ensureEamTablesExist();
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    const code = data.inspectionNumber || `INSP-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const [created] = await db.insert(phase71InspectionRecords).values({
      id,
      inspectionNumber: code,
      assetId: data.assetId,
      inspectorName: data.inspectorName,
      inspectionType: data.inspectionType || 'THIRD_PARTY_STATUTORY',
      inspectionDate: data.inspectionDate,
      complianceStandard: data.complianceStandard || 'EN 13000 / ASME B30.5 / UAE Federal Law 8',
      overallRating: data.overallRating || 'SATISFACTORY',
      observations: data.observations,
      recommendedActions: data.recommendedActions,
      passStatus: data.passStatus ?? true,
      nextInspectionDate: data.nextInspectionDate,
      reportUrl: data.reportUrl,
      createdAt: now,
      updatedAt: now,
      createdBy,
      updatedBy: createdBy,
    }).returning();
    return created;
  }

  // --- MAINTENANCE COSTS ---
  public async getMaintenanceCosts() {
    await this.ensureEamTablesExist();
    const db = getDb();
    return db.select().from(phase71MaintenanceCosts).where(eq(phase71MaintenanceCosts.isDeleted, false));
  }

  // --- AUDIT LOGS ---
  public async createAuditLog(data: {
    actionType: string;
    entityType: string;
    entityId: string;
    referenceNumber: string;
    performedBy: string;
    detailsJson?: string;
  }) {
    await this.ensureEamTablesExist();
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();

    await db.insert(phase71AssetAuditLogs).values({
      id,
      actionType: data.actionType,
      entityType: data.entityType,
      entityId: data.entityId,
      referenceNumber: data.referenceNumber,
      performedBy: data.performedBy,
      detailsJson: data.detailsJson,
      timestamp: now,
      createdAt: now,
      updatedAt: now,
      createdBy: data.performedBy,
      updatedBy: data.performedBy,
    }).onConflictDoNothing();
  }

  public async getAuditLogs() {
    await this.ensureEamTablesExist();
    const db = getDb();
    return db.select().from(phase71AssetAuditLogs).where(eq(phase71AssetAuditLogs.isDeleted, false)).orderBy(desc(phase71AssetAuditLogs.timestamp)).limit(50);
  }

  // --- EXECUTIVE DASHBOARD & KPI STATISTICS ---
  public async getDashboardStats() {
    await this.ensureEamTablesExist();
    const db = getDb();

    const assets = await db.select().from(phase71AssetMaster).where(eq(phase71AssetMaster.isDeleted, false));
    const workOrders = await db.select().from(phase71MaintenanceWorkOrders).where(eq(phase71MaintenanceWorkOrders.isDeleted, false));
    const breakdowns = await db.select().from(phase71BreakdownReports).where(eq(phase71BreakdownReports.isDeleted, false));
    const calibrations = await db.select().from(phase71CalibrationRecords).where(eq(phase71CalibrationRecords.isDeleted, false));
    const inspections = await db.select().from(phase71InspectionRecords).where(eq(phase71InspectionRecords.isDeleted, false));

    const totalAssets = assets.length;
    const operationalAssets = assets.filter((a) => a.status === 'OPERATIONAL').length;
    const underMaintenanceAssets = assets.filter((a) => a.status === 'UNDER_MAINTENANCE').length;
    const breakdownAssets = assets.filter((a) => a.status === 'BREAKDOWN').length;
    const criticalClassAAssets = assets.filter((a) => a.criticality === 'CRITICAL_CLASS_A').length;

    const totalFleetValueAed = assets.reduce((sum, a) => sum + (Number(a.currentBookValueAed) || 0), 0);
    const totalPurchaseCostAed = assets.reduce((sum, a) => sum + (Number(a.purchaseCostAed) || 0), 0);

    const openWorkOrders = workOrders.filter((w) => w.status === 'OPEN' || w.status === 'IN_PROGRESS').length;
    const completedWorkOrders = workOrders.filter((w) => w.status === 'COMPLETED' || w.status === 'VERIFIED_CLOSED').length;
    const preventiveWorkOrders = workOrders.filter((w) => w.workOrderType === 'PREVENTIVE').length;
    const correctiveWorkOrders = workOrders.filter((w) => w.workOrderType === 'CORRECTIVE_BREAKDOWN' || w.workOrderType === 'EMERGENCY').length;

    const totalMaintenanceCostAed = workOrders.reduce((sum, w) => sum + (Number(w.totalCostAed) || 0), 0);

    // Maintenance KPIs: MTBF, MTTR, Availability %, Reliability %
    const totalOperatingHours = assets.reduce((sum, a) => sum + (Number(a.operatingHours) || 0), 0);
    const totalFailures = Math.max(breakdowns.length, 1);
    const totalDowntimeMinutes = workOrders.reduce((sum, w) => sum + (Number(w.downtimeMinutes) || 0), 0);
    const totalDowntimeHours = totalDowntimeMinutes / 60;

    const mtbfHours = Math.round((totalOperatingHours / totalFailures) * 10) / 10;
    const mttrHours = Math.round((totalDowntimeHours / totalFailures) * 10) / 10;

    const totalTimeHours = totalOperatingHours + totalDowntimeHours;
    const availabilityPercent = totalTimeHours > 0 ? Math.round((totalOperatingHours / totalTimeHours) * 1000) / 10 : 96.8;
    const reliabilityPercent = Math.min(99.4, Math.max(88.0, Math.round((1 - breakdowns.length / (totalAssets || 1)) * 1000) / 10));

    return {
      totalAssets,
      operationalAssets,
      underMaintenanceAssets,
      breakdownAssets,
      criticalClassAAssets,
      totalFleetValueAed,
      totalPurchaseCostAed,
      openWorkOrders,
      completedWorkOrders,
      preventiveWorkOrders,
      correctiveWorkOrders,
      totalMaintenanceCostAed,
      kpis: {
        mtbfHours,
        mttrHours,
        availabilityPercent,
        reliabilityPercent,
        totalDowntimeMinutes,
        totalOperatingHours,
        pmComplianceRate: 95.4,
      },
      calibrationsCount: calibrations.length,
      inspectionsCount: inspections.length,
    };
  }
}

export const eamRepository = new EamRepository();
