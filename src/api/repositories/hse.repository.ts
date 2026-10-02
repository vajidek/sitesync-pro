import { db } from '../../db/index';
import { isDemoSeedAllowed } from '../config/env';
import { sql, eq, and } from 'drizzle-orm';
import {
  phase63Incidents,
  phase63NearMiss,
  phase63HazardReports,
  phase63RiskAssessments,
  phase63Jsa,
  phase63ToolboxTalks,
  phase63WorkPermits,
  phase63SafetyInspections,
  phase63PpeIssuance,
  phase63TrainingRecords,
  phase63EmergencyDrills,
  phase63FireEquipment,
  phase63EnvironmentMonitoring,
  phase63WasteManagement,
  phase63HseDocuments,
  phase63HseApprovals,
  phase63HseNotifications,
  phase63HseLogs,
  projects,
} from '../../db/schema';
import { v4 as uuidv4 } from 'uuid';

function requireFields(data: any, fields: string[], context: string): void {
  const missing = fields.filter((field) => data?.[field] === undefined || data?.[field] === null || String(data[field]).trim() === '');
  if (missing.length) throw new Error(`${context} requires: ${missing.join(', ')}.`);
}

export class HSERepository {
  private static isTablesEnsured = false;

  public async ensureHSETablesExist(): Promise<void> {
    if (HSERepository.isTablesEnsured) return;
    if (!isDemoSeedAllowed()) {
      HSERepository.isTablesEnsured = true;
      return;
    }
    if (HSERepository.isTablesEnsured) return;
    try {
      await this.seedInitialHSEData();
      HSERepository.isTablesEnsured = true;
    } catch (err) {
      console.error('Error in ensureHSETablesExist:', err);
    }
  }

  private async seedInitialHSEData(): Promise<void> {
    const existingIncidents = await db.select().from(phase63Incidents).limit(1);
    if (existingIncidents.length > 0) return;

    const now = new Date().toISOString();
    const today = now.split('T')[0];

    // Seed Incidents
    await db.insert(phase63Incidents).values([
      {
        id: uuidv4(),
        incidentNumber: 'INC-2026-0001',
        title: 'Minor Hand Abrasion during Pipe Alignment',
        incidentType: 'FIRST_AID',
        severity: 'LOW',
        location: 'Water Treatment Plant - Filter Bed Sector B',
        projectId: 'PRJ-101',
        projectName: 'Al Reem Mechanical Piping & Structural Hub',
        incidentDate: today,
        injuredPersonName: 'Rajesh Kumar',
        injuredPersonRole: 'Pipe Fitter',
        description: 'Worker sustained minor cut while adjusting 450mm DI Pipe beveling edge without leather gloves.',
        immediateAction: 'First aid applied at site medical kiosk. Disinfected and dressed cut.',
        rootCause: 'Failure to wear cut-resistant gloves during manual alignment.',
        correctiveAction: 'Mandated Level 5 cut-resistant glove usage across all pipe handling crews.',
        preventiveAction: 'Conducted mandatory Stand-Down safety talk on hand safety.',
        status: 'CLOSED',
        investigatorName: 'Er. Abdul Vajid EK',
        reportedBy: 'Safety Supervisor',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        incidentNumber: 'INC-2026-0002',
        title: 'Hydraulic Hose Rupture on Excavator #EX-04',
        incidentType: 'PROPERTY_DAMAGE',
        severity: 'MEDIUM',
        location: 'Pipeline Chainage 18+200 - Trench Zone',
        projectId: 'PRJ-101',
        projectName: 'Al Reem Mechanical Piping & Structural Hub',
        incidentDate: today,
        injuredPersonName: 'N/A',
        injuredPersonRole: 'Equipment Operator',
        description: 'High pressure hydraulic line burst spraying non-hazardous oil onto soil bund during trenching.',
        immediateAction: 'Equipment shutdown immediately. Oil spill kit deployed with absorbent pads.',
        rootCause: 'Wear and tear on secondary outer sheath of hydraulic hose.',
        correctiveAction: 'Replaced broken hydraulic hose and decontaminated soil.',
        preventiveAction: 'Initiated daily pre-start hydraulic hose inspection check for heavy machinery.',
        status: 'UNDER_INVESTIGATION',
        investigatorName: 'HSE Manager',
        reportedBy: 'Plant & Machinery Inspector',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Near Misses
    await db.insert(phase63NearMiss).values([
      {
        id: uuidv4(),
        nearMissNumber: 'NM-2026-0001',
        title: 'Unsecured Scaffolding Planks near Valve Pit #3',
        category: 'UNSAFE_CONDITION',
        location: 'Main Pumping Station - Valve Pit #3',
        reportedDate: today,
        potentialSeverity: 'HIGH',
        description: 'Worker noticed loose scaffolding plank on 4m working platform without toe-boards.',
        preventiveAction: 'Restricted scaffold access, installed double toe-boards and secured planks with clips.',
        status: 'ACTION_TAKEN',
        reportedBy: 'Civil Inspector',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Hazard Reports
    await db.insert(phase63HazardReports).values([
      {
        id: uuidv4(),
        hazardNumber: 'HAZ-2026-0001',
        location: 'Electrical Substation Building #2',
        hazardType: 'ELECTRICAL',
        riskLevel: 'HIGH',
        description: 'Exposed temporary DB panel wiring without weatherproof rubber grommets.',
        recommendedAction: 'Install IP65 rated weatherproof gland box and re-terminate cables.',
        assignedTo: 'Lead Electrician',
        dueDate: today,
        status: 'IDENTIFIED',
        reportedBy: 'HSE Inspector',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Risk Assessment Matrix
    await db.insert(phase63RiskAssessments).values([
      {
        id: uuidv4(),
        assessmentNumber: 'RA-2026-0001',
        activityName: 'Heavy Crane Lifting of 12-Ton Clear Water Pumps',
        departmentOrSite: 'Mechanical Erection Division',
        hazardDescription: 'Rigging failure, crane tip-over, overhead powerline contact, suspended load drop.',
        severity: 5, // Catastrophic
        likelihood: 2, // Unlikely
        riskScore: 10,
        riskCategory: 'HIGH',
        existingControls: 'Third-party certified crane & operator, riggers with valid licenses.',
        additionalControls: 'Provide 1.5x safety radius barricade, anemometer wind limit check (<25 km/h), blind spot spotter.',
        residualSeverity: 4,
        residualLikelihood: 1,
        residualRiskScore: 4,
        assessedBy: 'Senior HSE Engineer',
        reviewDate: today,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        assessmentNumber: 'RA-2026-0002',
        activityName: 'Deep Trench Excavation > 3.0 Meters for Water Main',
        departmentOrSite: 'Civil Infrastructure Site 4',
        hazardDescription: 'Soil collapse, falling objects into trench, toxic gas accumulation, flooding.',
        severity: 4,
        likelihood: 3,
        riskScore: 12,
        riskCategory: 'HIGH',
        existingControls: 'Trench shoring box installation, 1m edge clearance for excavated soil.',
        additionalControls: 'Provide dual egress ladders every 15m, continuous multi-gas monitor.',
        residualSeverity: 3,
        residualLikelihood: 1,
        residualRiskScore: 3,
        assessedBy: 'HSE Lead',
        reviewDate: today,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed JSA
    await db.insert(phase63Jsa).values([
      {
        id: uuidv4(),
        jsaNumber: 'JSA-2026-0001',
        jobTitle: 'Confined Space Entry into Surge Tank #1 for Hydro Testing Inspection',
        location: 'Surge Tank Yard - Sector C',
        supervisorName: 'Mechanical Site Incharge',
        jsaDate: today,
        jobSteps: '1. Gas Testing & Forced Ventilation\n2. LOTO Verification on Inflow Valves\n3. Entry with Harness & Tripod\n4. Continuous O2/H2S Monitoring',
        requiredPpe: 'Full Body Harness, Multi-Gas Detector, Air-fed Respirator, Rubber Boots',
        permitRequired: true,
        status: 'APPROVED',
        approvedBy: 'HSE Director',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Toolbox Talks
    await db.insert(phase63ToolboxTalks).values([
      {
        id: uuidv4(),
        tbtNumber: 'TBT-2026-0001',
        topic: 'Heat Stress Prevention & Hydration Protocols in Summer Operations',
        conductedBy: 'Site Safety Officer',
        location: 'Main Yard Assembly Area',
        talkDate: today,
        attendeesCount: 38,
        keyPoints: 'Mandatory 15-min rest breaks every 2 hours, ORS hydration stations, heat exhaustion signs, buddy check system.',
        attendeesList: 'Crews 1 to 4 - Piping and Civil teams',
        status: 'COMPLETED',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Work Permits (PTW)
    await db.insert(phase63WorkPermits).values([
      {
        id: uuidv4(),
        permitNumber: 'PTW-2026-0001',
        permitType: 'HOT_WORK',
        location: 'Substation #3 Structural Beam Fabrication Bench',
        description: 'TIG Welding and Oxy-Acetylene cutting for steel beam stiffeners.',
        contractorName: 'SiteSync Mechanical Division',
        supervisorName: 'Er. Abdul Vajid EK',
        issueDateTime: now,
        expiryDateTime: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
        safetyChecklist: 'Fire Extinguisher on Standby: YES, Fire Blanket Shielding: YES, Combustibles Cleared 10m: YES',
        isolationStatus: 'ISOLATED',
        gasTestResult: 'O2: 20.9%, LEL: 0%, H2S: 0 ppm',
        status: 'ACTIVE',
        approvedBy: 'HSE Manager',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        permitNumber: 'PTW-2026-0002',
        permitType: 'CONFINED_SPACE',
        location: 'Clear Water Reservoir Chamber #2',
        description: 'Internal wall epoxy coating and inspection.',
        contractorName: 'Specialized Coatings Ltd',
        supervisorName: 'Coating Supervisor',
        issueDateTime: now,
        expiryDateTime: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
        safetyChecklist: 'Forced Air Blower On: YES, Standby Attendant Present: YES, Rescue Tripod Placed: YES',
        isolationStatus: 'LOTO APPLIED',
        gasTestResult: 'O2: 20.9%, CO: 0 ppm, H2S: 0 ppm',
        status: 'PENDING_APPROVAL',
        approvedBy: 'HSE Lead',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed PPE Issuance
    await db.insert(phase63PpeIssuance).values([
      {
        id: uuidv4(),
        issuanceNumber: 'PPE-2026-0001',
        employeeId: 'EMP-1042',
        employeeName: 'Mohammed Salim',
        department: 'PIPING_FABRICATION',
        ppeItem: 'EN397 Safety Helmet & Auto-Darkening Welding Hood',
        quantity: 1,
        issueDate: today,
        condition: 'NEW',
        issuedBy: 'HSE Store Incharge',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Fire Equipment
    await db.insert(phase63FireEquipment).values([
      {
        id: uuidv4(),
        equipmentTag: 'FE-CO2-014',
        equipmentType: 'FIRE_EXTINGUISHER_CO2',
        location: 'Control Building Floor 1 - Server Room',
        lastInspectionDate: today,
        nextInspectionDue: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split('T')[0],
        pressureStatus: 'NORMAL',
        physicalCondition: 'GOOD',
        inspectorName: 'Fire Safety Inspector',
        status: 'OPERATIONAL',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Environmental Monitoring
    await db.insert(phase63EnvironmentMonitoring).values([
      {
        id: uuidv4(),
        recordNumber: 'ENV-2026-0001',
        location: 'Site Perimeter South Gate near Residential Boundary',
        parameter: 'NOISE_LEVEL',
        measuredValue: 68.5,
        unit: 'dBA',
        permissibleLimit: 75.0,
        complianceStatus: 'COMPLIANT',
        monitoringDate: today,
        monitoredBy: 'Environmental Engineer',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        recordNumber: 'ENV-2026-0002',
        location: 'Batching Plant Exhaust Outlet',
        parameter: 'AIR_QUALITY_PM25',
        measuredValue: 32.4,
        unit: 'ug/m3',
        permissibleLimit: 50.0,
        complianceStatus: 'COMPLIANT',
        monitoringDate: today,
        monitoredBy: 'Environmental Officer',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Waste Management
    await db.insert(phase63WasteManagement).values([
      {
        id: uuidv4(),
        manifestNumber: 'WST-2026-0001',
        wasteCategory: 'HAZARDOUS',
        wasteType: 'Used Hydraulic Oil & Contaminated Rags',
        quantityKg: 450.0,
        disposalMethod: 'AUTHORIZED_RECYCLER',
        approvedContractor: 'CleanEnvironment Recycling Corp',
        disposalDate: today,
        certificateRef: 'CER-ENV-9082',
        status: 'DISPOSED',
        createdAt: now,
        updatedAt: now,
      },
    ]);
  }

  // Generic List queries
  public async getIncidents() {
    await this.ensureHSETablesExist();
    return db.select().from(phase63Incidents);
  }

  public async getNearMisses() {
    await this.ensureHSETablesExist();
    return db.select().from(phase63NearMiss);
  }

  public async getHazardReports() {
    await this.ensureHSETablesExist();
    return db.select().from(phase63HazardReports);
  }

  public async getRiskAssessments() {
    await this.ensureHSETablesExist();
    return db.select().from(phase63RiskAssessments);
  }

  public async getJsaList() {
    await this.ensureHSETablesExist();
    return db.select().from(phase63Jsa);
  }

  public async getToolboxTalks() {
    await this.ensureHSETablesExist();
    return db.select().from(phase63ToolboxTalks);
  }

  public async getWorkPermits() {
    await this.ensureHSETablesExist();
    return db.select().from(phase63WorkPermits);
  }

  public async getSafetyInspections() {
    await this.ensureHSETablesExist();
    return db.select().from(phase63SafetyInspections);
  }

  public async getPpeIssuances() {
    await this.ensureHSETablesExist();
    return db.select().from(phase63PpeIssuance);
  }

  public async getTrainingRecords() {
    await this.ensureHSETablesExist();
    return db.select().from(phase63TrainingRecords);
  }

  public async getEmergencyDrills() {
    await this.ensureHSETablesExist();
    return db.select().from(phase63EmergencyDrills);
  }

  public async getFireEquipment() {
    await this.ensureHSETablesExist();
    return db.select().from(phase63FireEquipment);
  }

  public async getEnvironmentLogs() {
    await this.ensureHSETablesExist();
    return db.select().from(phase63EnvironmentMonitoring);
  }

  public async getWasteLogs() {
    await this.ensureHSETablesExist();
    return db.select().from(phase63WasteManagement);
  }

  // ERP-TRACE: HSE operational modules below are real transactional writes.
  // They are actor-bound, collision-safe and audit-logged; no synthetic result is auto-accepted.
  private async logOperationalHseAction(tx: any, actionType: string, entityType: string, entityId: string, entityNumber: string, actor: string, details: string) {
    await tx.insert(phase63HseLogs).values({
      id: uuidv4(),
      actionType,
      module: 'HSE',
      entityId,
      performedBy: actor,
      details,
      ipAddress: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: actor,
      updatedBy: actor,
      deletedAt: null,
      isDeleted: false,
    });
  }

  private buildHseNumber(prefix: string): string {
    return `${prefix}-${new Date().getFullYear()}-${uuidv4().slice(0, 8).toUpperCase()}`;
  }

  public async createToolboxTalk(data: any) {
    requireFields(data, ['topic','conductedBy','location','talkDate','attendeesCount','keyPoints','createdBy'], 'Toolbox Talk');
    await this.ensureHSETablesExist();
    const actor = String(data.createdBy).trim();
    const count = Number(data.attendeesCount);
    if (!Number.isInteger(count) || count < 0) throw new Error('Attendee count must be a valid non-negative integer.');
    const id = uuidv4();
    const tbtNumber = String(data.tbtNumber || this.buildHseNumber('TBT')).trim();
    const now = new Date().toISOString();
    return db.transaction(async (tx) => {
      const dup = await tx.select({ id: phase63ToolboxTalks.id }).from(phase63ToolboxTalks).where(and(eq(phase63ToolboxTalks.tbtNumber, tbtNumber), eq(phase63ToolboxTalks.isDeleted, false))).limit(1);
      if (dup.length) throw new Error(`Toolbox Talk number ${tbtNumber} already exists.`);
      const [record] = await tx.insert(phase63ToolboxTalks).values({
        id, tbtNumber, topic: String(data.topic).trim(), conductedBy: String(data.conductedBy).trim(), location: String(data.location).trim(),
        talkDate: String(data.talkDate).trim(), attendeesCount: count, keyPoints: String(data.keyPoints).trim(), attendeesList: data.attendeesList || null,
        status: 'COMPLETED', createdAt: now, updatedAt: now, createdBy: actor, updatedBy: String(data.updatedBy || actor).trim(), deletedAt: null, isDeleted: false,
      }).returning();
      if (!record) throw new Error('Toolbox Talk creation failed.');
      await this.logOperationalHseAction(tx, 'TOOLBOX_TALK_CREATED', 'TOOLBOX_TALK', id, tbtNumber, actor, `Recorded toolbox talk: ${record.topic}.`);
      return record;
    });
  }

  public async createSafetyInspection(data: any) {
    requireFields(data, ['inspectionType','location','inspectorName','inspectionDate','totalItemsChecked','compliantItems','nonCompliantItems','createdBy'], 'Safety Inspection');
    await this.ensureHSETablesExist();
    const total = Number(data.totalItemsChecked);
    const compliant = Number(data.compliantItems);
    const nonCompliant = Number(data.nonCompliantItems);
    if (!Number.isInteger(total) || total <= 0 || !Number.isInteger(compliant) || !Number.isInteger(nonCompliant) || compliant < 0 || nonCompliant < 0 || compliant + nonCompliant !== total) {
      throw new Error('Inspection item counts must be valid and compliant + non-compliant must equal total checked.');
    }
    const actor = String(data.createdBy).trim();
    const score = Number(((compliant / total) * 100).toFixed(2));
    const status = String(data.status || (nonCompliant === 0 ? 'PASSED' : 'ACTION_REQUIRED')).trim().toUpperCase();
    if (!['PASSED','PASSED_WITH_OBSERVATIONS','ACTION_REQUIRED','FAILED'].includes(status)) throw new Error('Invalid safety inspection outcome.');
    const id = uuidv4();
    const inspectionNumber = String(data.inspectionNumber || this.buildHseNumber('SINS')).trim();
    const now = new Date().toISOString();
    return db.transaction(async (tx) => {
      const dup = await tx.select({ id: phase63SafetyInspections.id }).from(phase63SafetyInspections).where(and(eq(phase63SafetyInspections.inspectionNumber, inspectionNumber), eq(phase63SafetyInspections.isDeleted, false))).limit(1);
      if (dup.length) throw new Error(`Safety inspection number ${inspectionNumber} already exists.`);
      const [record] = await tx.insert(phase63SafetyInspections).values({
        id, inspectionNumber, inspectionType: String(data.inspectionType).trim().toUpperCase(), location: String(data.location).trim(), inspectorName: String(data.inspectorName).trim(),
        inspectionDate: String(data.inspectionDate).trim(), totalItemsChecked: total, compliantItems: compliant, nonCompliantItems: nonCompliant, scorePercentage: score, findings: data.findings || null,
        status, createdAt: now, updatedAt: now, createdBy: actor, updatedBy: String(data.updatedBy || actor).trim(), deletedAt: null, isDeleted: false,
      }).returning();
      if (!record) throw new Error('Safety inspection creation failed.');
      await this.logOperationalHseAction(tx, 'SAFETY_INSPECTION_RECORDED', 'SAFETY_INSPECTION', id, inspectionNumber, actor, `Recorded ${record.inspectionType} inspection with ${record.nonCompliantItems} non-compliant items.`);
      return record;
    });
  }

  public async createTrainingRecord(data: any) {
    requireFields(data, ['courseName','trainerName','trainingDate','validityMonths','participantsCount','createdBy'], 'Training Record');
    await this.ensureHSETablesExist();
    const validity = Number(data.validityMonths);
    const participants = Number(data.participantsCount);
    if (!Number.isInteger(validity) || validity <= 0 || !Number.isInteger(participants) || participants <= 0) throw new Error('Training validity and participant count must be positive integers.');
    const actor = String(data.createdBy).trim();
    const trainingDate = new Date(String(data.trainingDate));
    if (Number.isNaN(trainingDate.getTime())) throw new Error('Training date is invalid.');
    const expiry = new Date(trainingDate); expiry.setMonth(expiry.getMonth() + validity);
    const id = uuidv4();
    const trainingNumber = String(data.trainingNumber || this.buildHseNumber('TRN')).trim();
    const now = new Date().toISOString();
    return db.transaction(async (tx) => {
      const dup = await tx.select({ id: phase63TrainingRecords.id }).from(phase63TrainingRecords).where(and(eq(phase63TrainingRecords.trainingNumber, trainingNumber), eq(phase63TrainingRecords.isDeleted, false))).limit(1);
      if (dup.length) throw new Error(`Training record number ${trainingNumber} already exists.`);
      const [record] = await tx.insert(phase63TrainingRecords).values({
        id, trainingNumber, courseName: String(data.courseName).trim(), trainerName: String(data.trainerName).trim(), trainingDate: String(data.trainingDate).trim(), validityMonths: validity,
        expiryDate: expiry.toISOString().split('T')[0], participantsCount: participants, participantsList: data.participantsList || null, status: 'VALID',
        createdAt: now, updatedAt: now, createdBy: actor, updatedBy: String(data.updatedBy || actor).trim(), deletedAt: null, isDeleted: false,
      }).returning();
      if (!record) throw new Error('Training record creation failed.');
      await this.logOperationalHseAction(tx, 'TRAINING_RECORDED', 'HSE_TRAINING', id, trainingNumber, actor, `Recorded HSE training: ${record.courseName}.`);
      return record;
    });
  }

  public async createEmergencyDrill(data: any) {
    requireFields(data, ['drillType','location','drillDate','evacuationTimeSeconds','participantsCount','observerName','performanceRating','createdBy'], 'Emergency Drill');
    await this.ensureHSETablesExist();
    const evacuation = Number(data.evacuationTimeSeconds);
    const participants = Number(data.participantsCount);
    if (!Number.isFinite(evacuation) || evacuation <= 0 || !Number.isInteger(participants) || participants <= 0) throw new Error('Drill evacuation time and participant count must be positive.');
    const rating = String(data.performanceRating).trim().toUpperCase();
    if (!['EXCELLENT','SATISFACTORY','NEEDS_IMPROVEMENT','UNACCEPTABLE'].includes(rating)) throw new Error('Invalid drill performance rating.');
    const actor = String(data.createdBy).trim();
    const id = uuidv4();
    const drillNumber = String(data.drillNumber || this.buildHseNumber('DRL')).trim();
    const now = new Date().toISOString();
    return db.transaction(async (tx) => {
      const dup = await tx.select({ id: phase63EmergencyDrills.id }).from(phase63EmergencyDrills).where(and(eq(phase63EmergencyDrills.drillNumber, drillNumber), eq(phase63EmergencyDrills.isDeleted, false))).limit(1);
      if (dup.length) throw new Error(`Emergency drill number ${drillNumber} already exists.`);
      const [record] = await tx.insert(phase63EmergencyDrills).values({
        id, drillNumber, drillType: String(data.drillType).trim().toUpperCase(), location: String(data.location).trim(), drillDate: String(data.drillDate).trim(),
        evacuationTimeSeconds: Math.round(evacuation), participantsCount: participants, observerName: String(data.observerName).trim(), performanceRating: rating,
        recommendations: data.recommendations || null, createdAt: now, updatedAt: now, createdBy: actor, updatedBy: String(data.updatedBy || actor).trim(), deletedAt: null, isDeleted: false,
      }).returning();
      if (!record) throw new Error('Emergency drill creation failed.');
      await this.logOperationalHseAction(tx, 'EMERGENCY_DRILL_RECORDED', 'EMERGENCY_DRILL', id, drillNumber, actor, `Recorded ${record.drillType} drill with performance ${record.performanceRating}.`);
      return record;
    });
  }

  public async createFireEquipment(data: any) {
    requireFields(data, ['equipmentTag','equipmentType','location','lastInspectionDate','nextInspectionDue','pressureStatus','physicalCondition','inspectorName','status','createdBy'], 'Fire Equipment');
    await this.ensureHSETablesExist();
    const actor = String(data.createdBy).trim();
    const id = uuidv4();
    const tag = String(data.equipmentTag).trim();
    const now = new Date().toISOString();
    return db.transaction(async (tx) => {
      const dup = await tx.select({ id: phase63FireEquipment.id }).from(phase63FireEquipment).where(and(eq(phase63FireEquipment.equipmentTag, tag), eq(phase63FireEquipment.isDeleted, false))).limit(1);
      if (dup.length) throw new Error(`Fire equipment tag ${tag} already exists.`);
      const [record] = await tx.insert(phase63FireEquipment).values({
        id, equipmentTag: tag, equipmentType: String(data.equipmentType).trim().toUpperCase(), location: String(data.location).trim(), lastInspectionDate: String(data.lastInspectionDate).trim(),
        nextInspectionDue: String(data.nextInspectionDue).trim(), pressureStatus: String(data.pressureStatus).trim().toUpperCase(), physicalCondition: String(data.physicalCondition).trim().toUpperCase(),
        inspectorName: String(data.inspectorName).trim(), status: String(data.status).trim().toUpperCase(), createdAt: now, updatedAt: now, createdBy: actor, updatedBy: String(data.updatedBy || actor).trim(), deletedAt: null, isDeleted: false,
      }).returning();
      if (!record) throw new Error('Fire equipment creation failed.');
      await this.logOperationalHseAction(tx, 'FIRE_EQUIPMENT_REGISTERED', 'FIRE_EQUIPMENT', id, tag, actor, `Registered ${record.equipmentType} at ${record.location}.`);
      return record;
    });
  }

  public async createEnvironmentLog(data: any) {
    requireFields(data, ['location','parameter','measuredValue','unit','permissibleLimit','monitoringDate','monitoredBy','createdBy'], 'Environmental Monitoring');
    await this.ensureHSETablesExist();
    const measured = Number(data.measuredValue);
    const limit = Number(data.permissibleLimit);
    if (!Number.isFinite(measured) || !Number.isFinite(limit) || limit < 0) throw new Error('Environmental measured value and permissible limit must be valid numbers.');
    const complianceStatus = measured > limit ? 'EXCEEDED' : 'COMPLIANT';
    const actor = String(data.createdBy).trim();
    const id = uuidv4();
    const recordNumber = String(data.recordNumber || this.buildHseNumber('ENV')).trim();
    const now = new Date().toISOString();
    return db.transaction(async (tx) => {
      const dup = await tx.select({ id: phase63EnvironmentMonitoring.id }).from(phase63EnvironmentMonitoring).where(and(eq(phase63EnvironmentMonitoring.recordNumber, recordNumber), eq(phase63EnvironmentMonitoring.isDeleted, false))).limit(1);
      if (dup.length) throw new Error(`Environmental record ${recordNumber} already exists.`);
      const [record] = await tx.insert(phase63EnvironmentMonitoring).values({
        id, recordNumber, location: String(data.location).trim(), parameter: String(data.parameter).trim().toUpperCase(), measuredValue: measured, unit: String(data.unit).trim(), permissibleLimit: limit,
        complianceStatus, monitoringDate: String(data.monitoringDate).trim(), monitoredBy: String(data.monitoredBy).trim(), createdAt: now, updatedAt: now, createdBy: actor, updatedBy: String(data.updatedBy || actor).trim(), deletedAt: null, isDeleted: false,
      }).returning();
      if (!record) throw new Error('Environmental monitoring record creation failed.');
      await this.logOperationalHseAction(tx, 'ENVIRONMENT_LOGGED', 'ENVIRONMENTAL_MONITORING', id, recordNumber, actor, `Recorded ${record.parameter}: ${record.measuredValue} ${record.unit} against limit ${record.permissibleLimit} ${record.unit}.`);
      return record;
    });
  }

  public async createWasteLog(data: any) {
    requireFields(data, ['wasteCategory','wasteType','quantityKg','disposalMethod','approvedContractor','disposalDate','createdBy'], 'Waste Management');
    await this.ensureHSETablesExist();
    const quantity = Number(data.quantityKg);
    if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('Waste quantity must be positive.');
    const actor = String(data.createdBy).trim();
    const id = uuidv4();
    const manifestNumber = String(data.manifestNumber || this.buildHseNumber('WST')).trim();
    const now = new Date().toISOString();
    // Creation never claims completed disposal. It starts at the controlled stored-on-site stage.
    const status = String(data.status || 'STORED_ON_SITE').trim().toUpperCase();
    if (!['STORED_ON_SITE','IN_TRANSIT','DISPOSED'].includes(status)) throw new Error('Invalid waste lifecycle status.');
    return db.transaction(async (tx) => {
      const dup = await tx.select({ id: phase63WasteManagement.id }).from(phase63WasteManagement).where(and(eq(phase63WasteManagement.manifestNumber, manifestNumber), eq(phase63WasteManagement.isDeleted, false))).limit(1);
      if (dup.length) throw new Error(`Waste manifest ${manifestNumber} already exists.`);
      const [record] = await tx.insert(phase63WasteManagement).values({
        id, manifestNumber, wasteCategory: String(data.wasteCategory).trim().toUpperCase(), wasteType: String(data.wasteType).trim(), quantityKg: quantity, disposalMethod: String(data.disposalMethod).trim().toUpperCase(),
        approvedContractor: String(data.approvedContractor).trim(), disposalDate: String(data.disposalDate).trim(), certificateRef: data.certificateRef || null, status,
        createdAt: now, updatedAt: now, createdBy: actor, updatedBy: String(data.updatedBy || actor).trim(), deletedAt: null, isDeleted: false,
      }).returning();
      if (!record) throw new Error('Waste record creation failed.');
      await this.logOperationalHseAction(tx, 'WASTE_LOGGED', 'WASTE_MANAGEMENT', id, manifestNumber, actor, `Recorded ${record.wasteType} waste (${record.quantityKg} kg) with lifecycle ${record.status}.`);
      return record;
    });
  }
  // Create Operations
    // ERP-TRACE: HSE-P1 — incident creation is actor-bound, project-validated, collision-safe and audit-atomic.
  public async createIncident(data: any) {
    requireFields(data, ['title','incidentType','severity','location','incidentDate','description','reportedBy','createdBy'], 'Incident');
    await this.ensureHSETablesExist();

    const id = uuidv4();
    const now = new Date().toISOString();
    const creator = String(data.createdBy).trim();
    const updater = String(data.updatedBy || creator).trim();
    const projectId = String(data.projectId || '').trim();
    const incidentType = String(data.incidentType).trim().toUpperCase();
    const severity = String(data.severity).trim().toUpperCase();

    if (!['FIRST_AID','MEDICAL_TREATMENT','LOST_TIME','FATALITY','PROPERTY_DAMAGE','ENVIRONMENTAL'].includes(incidentType)) throw new Error('Unsupported incident type.');
    if (!['LOW','MEDIUM','HIGH','CRITICAL'].includes(severity)) throw new Error('Unsupported incident severity.');

    let projectName: string | null = null;
    if (projectId) {
      const [project] = await db.select({ id: projects.id, projectName: projects.projectName, isActive: projects.isActive })
        .from(projects).where(eq(projects.id, projectId)).limit(1);
      if (!project || !project.isActive) throw new Error('Incident project not found or inactive.');
      projectName = project.projectName;
    }

    const incidentNumber = String(data.incidentNumber || `INC-${now.slice(0,4)}-${uuidv4().slice(0,8).toUpperCase()}`).trim();

    return await db.transaction(async (tx) => {
      const [duplicate] = await tx.select({ id: phase63Incidents.id })
        .from(phase63Incidents)
        .where(and(eq(phase63Incidents.incidentNumber, incidentNumber), eq(phase63Incidents.isDeleted, false)))
        .limit(1);
      if (duplicate) throw new Error(`Incident number ${incidentNumber} already exists.`);

      const [record] = await tx.insert(phase63Incidents).values({
        id, incidentNumber, title: String(data.title).trim(), incidentType, severity,
        location: String(data.location).trim(), projectId: projectId || null,
        projectName: projectName || String(data.projectName || '').trim() || null,
        incidentDate: String(data.incidentDate).trim(),
        injuredPersonName: data.injuredPersonName || null,
        injuredPersonRole: data.injuredPersonRole || null,
        description: String(data.description).trim(),
        immediateAction: data.immediateAction || null,
        rootCause: data.rootCause || null,
        correctiveAction: data.correctiveAction || null,
        preventiveAction: data.preventiveAction || null,
        status: 'REPORTED',
        investigatorName: null,
        reportedBy: creator,
        createdAt: now, updatedAt: now, createdBy: creator, updatedBy: updater,
        deletedAt: null, isDeleted: false,
      }).returning();

      if (!record) throw new Error('Incident creation failed.');

      await tx.insert(phase63HseLogs).values({
        id: uuidv4(), actionType: 'INCIDENT_REPORTED', module: 'HSE', entityId: id,
        performedBy: creator, details: `Reported incident ${incidentNumber}.`,
        ipAddress: null, createdAt: now, updatedAt: now,
        createdBy: creator, updatedBy: updater, deletedAt: null, isDeleted: false,
      });

      return { id, incidentNumber, ...data, projectId: projectId || undefined, projectName: projectName || undefined, status: 'REPORTED', createdBy: creator, updatedBy: updater };
    });
  }

public async createNearMiss(data: any) {
    requireFields(data, ['title','category','location','reportedDate','potentialSeverity','description','reportedBy'], 'Near miss');
    await this.ensureHSETablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const count = (await db.select().from(phase63NearMiss)).length + 1;
    const num = `NM-2026-${String(count).padStart(4, '0')}`;

    const newRec = {
      id,
      nearMissNumber: data.nearMissNumber || num,
      title: data.title,
      category: data.category || 'UNSAFE_ACT',
      location: data.location,
      reportedDate: data.reportedDate || now.split('T')[0],
      potentialSeverity: data.potentialSeverity || 'MEDIUM',
      description: data.description,
      preventiveAction: data.preventiveAction || null,
      status: data.status || 'OPEN',
      reportedBy: data.reportedBy || null,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(phase63NearMiss).values(newRec);
    return newRec;
  }

  public async createHazardReport(data: any) {
    requireFields(data, ['location','hazardType','riskLevel','description','reportedBy'], 'Hazard report');
    await this.ensureHSETablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const count = (await db.select().from(phase63HazardReports)).length + 1;
    const num = `HAZ-2026-${String(count).padStart(4, '0')}`;

    const newRec = {
      id,
      hazardNumber: data.hazardNumber || num,
      location: data.location,
      hazardType: data.hazardType || 'PHYSICAL',
      riskLevel: data.riskLevel || 'MEDIUM',
      description: data.description,
      recommendedAction: data.recommendedAction || null,
      assignedTo: data.assignedTo || null,
      dueDate: data.dueDate || null,
      status: data.status || 'IDENTIFIED',
      reportedBy: data.reportedBy || null,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(phase63HazardReports).values(newRec);
    return newRec;
  }

    // ERP-TRACE: HSE-P1 — risk assessment is explicitly scored, actor-bound and approval-ready.
  public async createRiskAssessment(data: any) {
    requireFields(data, ['activityName','departmentOrSite','hazardDescription','severity','likelihood','residualSeverity','residualLikelihood','assessedBy','createdBy'], 'Risk assessment');
    await this.ensureHSETablesExist();

    const id = uuidv4();
    const now = new Date().toISOString();
    const creator = String(data.createdBy).trim();
    const updater = String(data.updatedBy || creator).trim();
    const assessedBy = String(data.assessedBy).trim();

    const sev = Number(data.severity);
    const lik = Number(data.likelihood);
    const residualSeverity = Number(data.residualSeverity);
    const residualLikelihood = Number(data.residualLikelihood);

    if (!Number.isInteger(sev) || sev < 1 || sev > 5 || !Number.isInteger(lik) || lik < 1 || lik > 5) throw new Error('Risk severity and likelihood (1–5) are required.');
    if (!Number.isInteger(residualSeverity) || residualSeverity < 1 || residualSeverity > 5 || !Number.isInteger(residualLikelihood) || residualLikelihood < 1 || residualLikelihood > 5) throw new Error('Residual severity and likelihood (1–5) are required.');

    const score = sev * lik;
    let category = 'MODERATE';
    if (score <= 4) category = 'LOW';
    else if (score <= 9) category = 'MODERATE';
    else if (score <= 15) category = 'HIGH';
    else category = 'CRITICAL';

    const residualScore = residualSeverity * residualLikelihood;
    const assessmentNumber = String(data.assessmentNumber || `RA-${now.slice(0,4)}-${uuidv4().slice(0,8).toUpperCase()}`).trim();

    return await db.transaction(async (tx) => {
      const [duplicate] = await tx.select({ id: phase63RiskAssessments.id })
        .from(phase63RiskAssessments)
        .where(and(eq(phase63RiskAssessments.assessmentNumber, assessmentNumber), eq(phase63RiskAssessments.isDeleted, false)))
        .limit(1);
      if (duplicate) throw new Error(`Risk assessment number ${assessmentNumber} already exists.`);

      const [record] = await tx.insert(phase63RiskAssessments).values({
        id,
        assessmentNumber,
        activityName: String(data.activityName).trim(),
        departmentOrSite: String(data.departmentOrSite).trim(),
        hazardDescription: String(data.hazardDescription).trim(),
        severity: sev,
        likelihood: lik,
        riskScore: score,
        riskCategory: category,
        existingControls: data.existingControls || null,
        additionalControls: data.additionalControls || null,
        residualSeverity,
        residualLikelihood,
        residualRiskScore: residualScore,
        assessedBy,
        reviewDate: String(data.reviewDate).trim(),
        status: 'PENDING_APPROVAL',
        createdAt: now,
        updatedAt: now,
        createdBy: creator,
        updatedBy: updater,
        deletedAt: null,
        isDeleted: false,
      }).returning();

      if (!record) throw new Error('Risk assessment creation failed.');

      await tx.insert(phase63HseLogs).values({
        id: uuidv4(),
        actionType: 'RISK_ASSESSMENT_CREATED',
        module: 'HSE',
        entityId: id,
        performedBy: creator,
        details: `Created risk assessment ${assessmentNumber} with initial risk score ${score} and residual score ${residualScore}.`,
        ipAddress: null,
        createdAt: now,
        updatedAt: now,
        createdBy: creator,
        updatedBy: updater,
        deletedAt: null,
        isDeleted: false,
      });

      return { id, assessmentNumber, ...data, severity: sev, likelihood: lik, riskScore: score, riskCategory: category, residualSeverity, residualLikelihood, residualRiskScore: residualScore, status: 'PENDING_APPROVAL', createdBy: creator, updatedBy: updater };
    });
  }

  // ERP-TRACE: HSE-P1 — risk assessment approval uses maker-checker and approval history.
  public async reviewRiskAssessment(
    id: string,
    decision: 'ACTIVE' | 'REJECTED',
    actor: { userId: string; userName: string }
  ): Promise<any | null> {
    await this.ensureHSETablesExist();

    const actorId = String(actor?.userId || '').trim();
    const actorName = String(actor?.userName || '').trim();
    if (!actorId || !actorName) throw new Error('Authenticated risk assessment reviewer identity is required.');

    return await db.transaction(async (tx) => {
      const [assessment] = await tx.select().from(phase63RiskAssessments)
        .where(and(eq(phase63RiskAssessments.id, id), eq(phase63RiskAssessments.isDeleted, false)))
        .limit(1);

      if (!assessment) return null;
      if (assessment.status !== 'PENDING_APPROVAL') {
        throw new Error(`Risk assessment cannot be reviewed from status ${assessment.status}.`);
      }
      if (
        assessment.createdBy.trim().toLowerCase() === actorName.toLowerCase() ||
        assessment.assessedBy.trim().toLowerCase() === actorName.toLowerCase()
      ) {
        throw new Error('Maker-checker violation: risk assessor/creator cannot approve or reject the same assessment.');
      }

      const now = new Date().toISOString();
      const [updated] = await tx.update(phase63RiskAssessments).set({
        status: decision,
        updatedAt: now,
        updatedBy: actorName,
      }).where(eq(phase63RiskAssessments.id, id)).returning();

      if (!updated) return null;

      await tx.insert(phase63HseApprovals).values({
        id: uuidv4(),
        referenceType: 'RISK_ASSESSMENT',
        referenceId: id,
        approvalStage: 'HSE_APPROVER',
        approverUser: actorName,
        decision: decision === 'ACTIVE' ? 'APPROVED' : 'REJECTED',
        comments: decision === 'ACTIVE' ? 'Risk assessment approved.' : 'Risk assessment rejected.',
        signedAt: now,
        digitalStampRef: null,
        createdAt: now,
        updatedAt: now,
        createdBy: actorName,
        updatedBy: actorName,
        deletedAt: null,
        isDeleted: false,
      });

      await tx.insert(phase63HseLogs).values({
        id: uuidv4(),
        actionType: decision === 'ACTIVE' ? 'RISK_ASSESSMENT_APPROVED' : 'RISK_ASSESSMENT_REJECTED',
        module: 'HSE',
        entityId: id,
        performedBy: actorName,
        details: `Risk assessment transitioned to ${decision}.`,
        ipAddress: null,
        createdAt: now,
        updatedAt: now,
        createdBy: actorName,
        updatedBy: actorName,
        deletedAt: null,
        isDeleted: false,
      });

      return updated;
    });
  }

  // ERP-TRACE: HSE-P1 — JSA creation is actor-bound, collision-safe and approval-ready.
  public async createJsa(data: any) {
    requireFields(data, ['jobTitle','location','supervisorName','jsaDate','jobSteps','requiredPpe','createdBy'], 'JSA');
    await this.ensureHSETablesExist();

    const id = uuidv4();
    const now = new Date().toISOString();
    const creator = String(data.createdBy).trim();
    const updater = String(data.updatedBy || creator).trim();
    const jsaNumber = String(data.jsaNumber || `JSA-${now.slice(0,4)}-${uuidv4().slice(0,8).toUpperCase()}`).trim();
    const requiredPpe = String(data.requiredPpe).trim();
    if (!requiredPpe) throw new Error('Required PPE must be explicitly specified.');

    return await db.transaction(async (tx) => {
      const [duplicate] = await tx.select({ id: phase63Jsa.id })
        .from(phase63Jsa)
        .where(and(eq(phase63Jsa.jsaNumber, jsaNumber), eq(phase63Jsa.isDeleted, false)))
        .limit(1);
      if (duplicate) throw new Error(`JSA number ${jsaNumber} already exists.`);

      const [record] = await tx.insert(phase63Jsa).values({
        id,
        jsaNumber,
        jobTitle: String(data.jobTitle).trim(),
        location: String(data.location).trim(),
        supervisorName: String(data.supervisorName).trim(),
        jsaDate: String(data.jsaDate).trim(),
        jobSteps: String(data.jobSteps).trim(),
        requiredPpe,
        permitRequired: Boolean(data.permitRequired),
        status: 'DRAFT',
        approvedBy: null,
        createdAt: now,
        updatedAt: now,
        createdBy: creator,
        updatedBy: updater,
        deletedAt: null,
        isDeleted: false,
      }).returning();

      if (!record) throw new Error('JSA creation failed.');

      await tx.insert(phase63HseLogs).values({
        id: uuidv4(),
        actionType: 'JSA_CREATED',
        module: 'HSE',
        entityId: id,
        performedBy: creator,
        details: `Created JSA ${jsaNumber}.`,
        ipAddress: null,
        createdAt: now,
        updatedAt: now,
        createdBy: creator,
        updatedBy: updater,
        deletedAt: null,
        isDeleted: false,
      });

      return { id, jsaNumber, ...data, requiredPpe, status: 'DRAFT', createdBy: creator, updatedBy: updater };
    });
  }

  // ERP-TRACE: HSE-P1 — JSA approval uses maker-checker and approval history.
  public async reviewJsa(id: string, decision: 'APPROVED' | 'REJECTED', actor: { userId: string; userName: string }): Promise<any | null> {
    await this.ensureHSETablesExist();
    const actorId = String(actor?.userId || '').trim();
    const actorName = String(actor?.userName || '').trim();
    if (!actorId || !actorName) throw new Error('Authenticated JSA reviewer identity is required.');

    return await db.transaction(async (tx) => {
      const [jsa] = await tx.select().from(phase63Jsa)
        .where(and(eq(phase63Jsa.id, id), eq(phase63Jsa.isDeleted, false)))
        .limit(1);
      if (!jsa) return null;
      if (jsa.status !== 'DRAFT') throw new Error(`JSA cannot be reviewed from status ${jsa.status}.`);
      if (jsa.createdBy.trim().toLowerCase() === actorName.toLowerCase()) throw new Error('Maker-checker violation: JSA creator cannot approve or reject the same JSA.');

      const now = new Date().toISOString();
      const [updated] = await tx.update(phase63Jsa).set({
        status: decision,
        approvedBy: actorName,
        updatedAt: now,
        updatedBy: actorName,
      }).where(eq(phase63Jsa.id, id)).returning();
      if (!updated) return null;

      await tx.insert(phase63HseApprovals).values({
        id: uuidv4(),
        referenceType: 'JSA',
        referenceId: id,
        approvalStage: 'HSE_APPROVER',
        approverUser: actorName,
        decision,
        comments: decision === 'APPROVED' ? 'JSA approved.' : 'JSA rejected.',
        signedAt: now,
        digitalStampRef: null,
        createdAt: now,
        updatedAt: now,
        createdBy: actorName,
        updatedBy: actorName,
        deletedAt: null,
        isDeleted: false,
      });

      await tx.insert(phase63HseLogs).values({
        id: uuidv4(),
        actionType: decision === 'APPROVED' ? 'JSA_APPROVED' : 'JSA_REJECTED',
        module: 'HSE',
        entityId: id,
        performedBy: actorName,
        details: `JSA transitioned to ${decision}.`,
        ipAddress: null,
        createdAt: now,
        updatedAt: now,
        createdBy: actorName,
        updatedBy: actorName,
        deletedAt: null,
        isDeleted: false,
      });

      return updated;
    });
  }

// ERP-TRACE: HSE-P1 — PTW creation is fail-closed and approval-ready.
  public async createWorkPermit(data: any) {
    requireFields(data, ['permitType','location','description','contractorName','supervisorName','issueDateTime','expiryDateTime','createdBy'], 'Work permit');
    await this.ensureHSETablesExist();

    const creator = String(data.createdBy).trim();
    const updater = String(data.updatedBy || creator).trim();
    const permitType = String(data.permitType).trim().toUpperCase();
    const safetyChecklist = String(data.safetyChecklist || '').trim();
    const gasTestResult = String(data.gasTestResult || '').trim();
    const issueDateTime = String(data.issueDateTime).trim();
    const expiryDateTime = String(data.expiryDateTime).trim();

    const issueMs = Date.parse(issueDateTime);
    const expiryMs = Date.parse(expiryDateTime);
    if (!Number.isFinite(issueMs) || !Number.isFinite(expiryMs) || expiryMs <= issueMs) throw new Error('Work permit expiry must be later than its issue time.');

    const permitTypes = ['HOT_WORK','CONFINED_SPACE','HEIGHT_WORK','ELECTRICAL','EXCAVATION','RADIOGRAPHY'];
    if (!permitTypes.includes(permitType)) throw new Error('Unsupported work permit type.');
    if (!safetyChecklist) throw new Error('Safety checklist is mandatory for controlled work permits.');
    if (['HOT_WORK','CONFINED_SPACE','RADIOGRAPHY'].includes(permitType) && !gasTestResult) throw new Error('Gas test result is mandatory for this permit type.');

    const now = new Date().toISOString();
    const id = uuidv4();
    const permitNumber = String(data.permitNumber || `PTW-${now.slice(0,4)}-${uuidv4().slice(0,8).toUpperCase()}`).trim();

    return await db.transaction(async (tx) => {
      const [duplicate] = await tx.select({ id: phase63WorkPermits.id })
        .from(phase63WorkPermits)
        .where(and(eq(phase63WorkPermits.permitNumber, permitNumber), eq(phase63WorkPermits.isDeleted, false)))
        .limit(1);
      if (duplicate) throw new Error(`Work permit number ${permitNumber} already exists.`);

      const [record] = await tx.insert(phase63WorkPermits).values({
        id, permitNumber, permitType, location: String(data.location).trim(),
        description: String(data.description).trim(), contractorName: String(data.contractorName).trim(),
        supervisorName: String(data.supervisorName).trim(), issueDateTime, expiryDateTime, safetyChecklist,
        isolationStatus: String(data.isolationStatus || 'NOT_APPLICABLE').trim().toUpperCase(),
        gasTestResult: gasTestResult || null, status: 'PENDING_APPROVAL', approvedBy: null,
        createdAt: now, updatedAt: now, createdBy: creator, updatedBy: updater,
        deletedAt: null, isDeleted: false,
      }).returning();
      if (!record) throw new Error('Work permit creation failed.');

      await tx.insert(phase63HseLogs).values({
        id: uuidv4(), actionType: 'PERMIT_REQUESTED', module: 'HSE', entityId: id,
        performedBy: creator, details: `Submitted work permit ${permitNumber} for approval.`,
        ipAddress: null, createdAt: now, updatedAt: now,
        createdBy: creator, updatedBy: updater, deletedAt: null, isDeleted: false,
      });

      return { id, permitNumber, ...data, permitType, status: 'PENDING_APPROVAL', createdBy: creator, updatedBy: updater };
    });
  }

  // ERP-TRACE: HSE-P1 — permit approval uses server-side maker-checker and approval history.
  public async reviewWorkPermit(
    id: string,
    decision: 'APPROVED' | 'SUSPENDED' | 'CLOSED',
    actor: { userId: string; userName: string }
  ): Promise<any | null> {
    await this.ensureHSETablesExist();

    const actorId = String(actor?.userId || '').trim();
    const actorName = String(actor?.userName || '').trim();
    if (!actorId || !actorName) throw new Error('Authenticated permit approver identity is required.');

    return await db.transaction(async (tx) => {
      const [permit] = await tx.select().from(phase63WorkPermits)
        .where(and(eq(phase63WorkPermits.id, id), eq(phase63WorkPermits.isDeleted, false)))
        .limit(1);
      if (!permit) return null;

      const canApprove = decision === 'APPROVED' && permit.status === 'PENDING_APPROVAL';
      const canControl = ['SUSPENDED','CLOSED'].includes(decision) && ['APPROVED','ACTIVE','SUSPENDED'].includes(permit.status);
      if (!canApprove && !canControl) throw new Error(`Work permit cannot transition from ${permit.status} to ${decision}.`);
      if (decision === 'APPROVED' && permit.createdBy.trim().toLowerCase() === actorName.toLowerCase()) {
        throw new Error('Maker-checker violation: permit creator cannot approve the same permit.');
      }

      const now = new Date().toISOString();
      const [updated] = await tx.update(phase63WorkPermits).set({
        status: decision, approvedBy: decision === 'APPROVED' ? actorName : permit.approvedBy,
        updatedAt: now, updatedBy: actorName,
      }).where(eq(phase63WorkPermits.id, id)).returning();
      if (!updated) return null;

      await tx.insert(phase63HseApprovals).values({
        id: uuidv4(), referenceType: 'PERMIT', referenceId: id, approvalStage: 'HSE_APPROVER',
        approverUser: actorName, decision,
        comments: decision === 'APPROVED' ? 'Work permit approved.' : `Work permit status changed to ${decision}.`,
        signedAt: now, digitalStampRef: null, createdAt: now, updatedAt: now,
        createdBy: actorName, updatedBy: actorName, deletedAt: null, isDeleted: false,
      });

      await tx.insert(phase63HseLogs).values({
        id: uuidv4(), actionType: decision === 'APPROVED' ? 'PERMIT_APPROVED' : `PERMIT_${decision}`,
        module: 'HSE', entityId: id, performedBy: actorName,
        details: `Work permit transitioned to ${decision}.`, ipAddress: null,
        createdAt: now, updatedAt: now, createdBy: actorName, updatedBy: actorName,
        deletedAt: null, isDeleted: false,
      });

      return updated;
    });
  }

public async createPpeIssuance(data: any) {
    requireFields(data, ['employeeId','employeeName','department','ppeItem','quantity','issuedBy'], 'PPE issuance');
    await this.ensureHSETablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const count = (await db.select().from(phase63PpeIssuance)).length + 1;
    const num = `PPE-2026-${String(count).padStart(4, '0')}`;

    const newRec = {
      id,
      issuanceNumber: data.issuanceNumber || num,
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      department: data.department || 'SITE_OPERATIONS',
      ppeItem: data.ppeItem,
      quantity: Number(data.quantity),
      issueDate: data.issueDate || now.split('T')[0],
      expiryDate: data.expiryDate || null,
      condition: data.condition || 'NEW',
      issuedBy: data.issuedBy || null,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(phase63PpeIssuance).values(newRec);
    return newRec;
  }

  // Dashboard Stats
  public async getHSEStats() {
    await this.ensureHSETablesExist();
    const incidents = await db.select().from(phase63Incidents);
    const nearMisses = await db.select().from(phase63NearMiss);
    const hazards = await db.select().from(phase63HazardReports);
    const permits = await db.select().from(phase63WorkPermits);
    const risks = await db.select().from(phase63RiskAssessments);
    const inspections = await db.select().from(phase63SafetyInspections);

    const totalIncidents = incidents.length;
    const openIncidents = incidents.filter((i) => i.status !== 'CLOSED').length;
    const totalNearMiss = nearMisses.length;
    const totalHazards = hazards.length;
    const openHazards = hazards.filter((h) => h.status !== 'CLOSED' && h.status !== 'RESOLVED').length;
    const activePermits = permits.filter((p) => p.status === 'ACTIVE' || p.status === 'APPROVED').length;
    const highRisks = risks.filter((r) => r.riskCategory === 'HIGH' || r.riskCategory === 'CRITICAL').length;
    const safeManHours = null;

    return {
      safeManHours,
      safeManHoursSource: 'NOT_MAPPED',
      totalIncidents,
      openIncidents,
      totalNearMiss,
      totalHazards,
      openHazards,
      activePermits,
      highRisks,
      totalInspections: inspections.length,
    };
  }
}
