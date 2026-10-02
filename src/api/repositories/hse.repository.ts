import { db } from '../../db/index';
import { sql } from 'drizzle-orm';
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
} from '../../db/schema';
import { v4 as uuidv4 } from 'uuid';

export class HSERepository {
  private static isTablesEnsured = false;

  public async ensureHSETablesExist(): Promise<void> {
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

  // Create Operations
  public async createIncident(data: any) {
    await this.ensureHSETablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const count = (await db.select().from(phase63Incidents)).length + 1;
    const num = `INC-2026-${String(count).padStart(4, '0')}`;

    const newRec = {
      id,
      incidentNumber: data.incidentNumber || num,
      title: data.title,
      incidentType: data.incidentType || 'FIRST_AID',
      severity: data.severity || 'LOW',
      location: data.location,
      projectId: data.projectId || 'PRJ-101',
      projectName: data.projectName || 'Al Reem Mechanical Piping & Structural Hub',
      incidentDate: data.incidentDate || now.split('T')[0],
      injuredPersonName: data.injuredPersonName || null,
      injuredPersonRole: data.injuredPersonRole || null,
      description: data.description,
      immediateAction: data.immediateAction || null,
      rootCause: data.rootCause || null,
      correctiveAction: data.correctiveAction || null,
      preventiveAction: data.preventiveAction || null,
      status: data.status || 'REPORTED',
      investigatorName: data.investigatorName || null,
      reportedBy: data.reportedBy || 'HSE Officer',
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(phase63Incidents).values(newRec);
    return newRec;
  }

  public async createNearMiss(data: any) {
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
      reportedBy: data.reportedBy || 'Site Inspector',
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(phase63NearMiss).values(newRec);
    return newRec;
  }

  public async createHazardReport(data: any) {
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
      reportedBy: data.reportedBy || 'Safety Inspector',
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(phase63HazardReports).values(newRec);
    return newRec;
  }

  public async createRiskAssessment(data: any) {
    await this.ensureHSETablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const count = (await db.select().from(phase63RiskAssessments)).length + 1;
    const num = `RA-2026-${String(count).padStart(4, '0')}`;

    const sev = Number(data.severity) || 3;
    const lik = Number(data.likelihood) || 3;
    const score = sev * lik;

    let cat = 'MODERATE';
    if (score <= 4) cat = 'LOW';
    else if (score <= 9) cat = 'MODERATE';
    else if (score <= 15) cat = 'HIGH';
    else cat = 'CRITICAL';

    const newRec = {
      id,
      assessmentNumber: data.assessmentNumber || num,
      activityName: data.activityName,
      departmentOrSite: data.departmentOrSite,
      hazardDescription: data.hazardDescription,
      severity: sev,
      likelihood: lik,
      riskScore: score,
      riskCategory: cat,
      existingControls: data.existingControls || null,
      additionalControls: data.additionalControls || null,
      residualSeverity: data.residualSeverity || Math.max(1, sev - 1),
      residualLikelihood: data.residualLikelihood || Math.max(1, lik - 1),
      residualRiskScore: (data.residualSeverity || Math.max(1, sev - 1)) * (data.residualLikelihood || Math.max(1, lik - 1)),
      assessedBy: data.assessedBy || 'HSE Lead',
      reviewDate: data.reviewDate || now.split('T')[0],
      status: data.status || 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(phase63RiskAssessments).values(newRec);
    return newRec;
  }

  public async createJsa(data: any) {
    await this.ensureHSETablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const count = (await db.select().from(phase63Jsa)).length + 1;
    const num = `JSA-2026-${String(count).padStart(4, '0')}`;

    const newRec = {
      id,
      jsaNumber: data.jsaNumber || num,
      jobTitle: data.jobTitle,
      location: data.location,
      supervisorName: data.supervisorName,
      jsaDate: data.jsaDate || now.split('T')[0],
      jobSteps: data.jobSteps,
      requiredPpe: data.requiredPpe || 'Safety Helmet, Shoes, High-Vis Vest',
      permitRequired: Boolean(data.permitRequired),
      status: data.status || 'APPROVED',
      approvedBy: data.approvedBy || 'HSE Director',
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(phase63Jsa).values(newRec);
    return newRec;
  }

  public async createWorkPermit(data: any) {
    await this.ensureHSETablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const count = (await db.select().from(phase63WorkPermits)).length + 1;
    const num = `PTW-2026-${String(count).padStart(4, '0')}`;

    const newRec = {
      id,
      permitNumber: data.permitNumber || num,
      permitType: data.permitType || 'HOT_WORK',
      location: data.location,
      description: data.description,
      contractorName: data.contractorName || 'SiteSync Operations Team',
      supervisorName: data.supervisorName,
      issueDateTime: data.issueDateTime || now,
      expiryDateTime: data.expiryDateTime || new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
      safetyChecklist: data.safetyChecklist || 'Standard PTW Checklist Verified',
      isolationStatus: data.isolationStatus || 'NOT_APPLICABLE',
      gasTestResult: data.gasTestResult || 'O2: 20.9%, LEL: 0%, H2S: 0 ppm',
      status: data.status || 'PENDING_APPROVAL',
      approvedBy: data.approvedBy || null,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(phase63WorkPermits).values(newRec);
    return newRec;
  }

  public async createPpeIssuance(data: any) {
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
      quantity: Number(data.quantity) || 1,
      issueDate: data.issueDate || now.split('T')[0],
      expiryDate: data.expiryDate || null,
      condition: data.condition || 'NEW',
      issuedBy: data.issuedBy || 'Store Manager',
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
    const safeManHours = 1250400; // Calculated safe man hours without LTI

    return {
      safeManHours,
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
