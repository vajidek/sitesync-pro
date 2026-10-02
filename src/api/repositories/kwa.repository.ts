import {
  PipelineSection,
  ValveRecord,
  WaterTestReport,
  WaterDailySiteReport,
  WaterDocument,
  WaterProjectDashboardMetrics,
} from '../../types/waterInfrastructureEngine';
import { db } from '../../db';
import { eq, and, ilike, or, desc, sql } from 'drizzle-orm';
import { pgTable, text, boolean, integer, doublePrecision, jsonb } from 'drizzle-orm/pg-core';
import {
  WATER_PROJECTS,
  WATER_PIPELINE_SECTIONS,
  WATER_VALVE_RECORDS,
  WATER_TEST_REPORTS,
  WATER_DAILY_REPORTS,
  WATER_DOCUMENTS,
  WATER_METRICS,
} from '../../data/waterInfrastructureData';

// ====================================================
// DRIZZLE TABLE DEFINITIONS FOR KWA MODULE
// ====================================================

export const kwaProjectsTable = pgTable('kwa_projects', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  client: text('client'),
  type: text('type'),
  location: text('location'),
  status: text('status'),
  progress: doublePrecision('progress').default(0),
  budgetINR: text('budget_inr'),
  spentINR: text('spent_inr'),
  startDate: text('start_date'),
  targetCompletionDate: text('target_completion_date'),
  pipeMaterial: text('pipe_material'),
  pipeDiameterMM: integer('pipe_diameter_mm'),
  totalLengthKm: doublePrecision('total_length_km').default(0),
  laidLengthKm: doublePrecision('laid_length_km').default(0),
  valveCountInstalled: integer('valve_count_installed').default(0),
  pumpsInstalled: integer('pumps_installed').default(0),
  scadaStatus: text('scada_status'),
  civilProgress: doublePrecision('civil_progress').default(0),
  mechanicalProgress: doublePrecision('mechanical_progress').default(0),
  electricalProgress: doublePrecision('electrical_progress').default(0),
  testingProgress: doublePrecision('testing_progress').default(0),
  createdAt: text('created_at').notNull(),
});

export const kwaPipelineSectionsTable = pgTable('kwa_pipeline_sections', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name'),
  sectionName: text('section_name').notNull(),
  pipeMaterial: text('pipe_material'),
  pipeDiameterMM: integer('pipe_diameter_mm'),
  pipeClass: text('pipe_class'),
  totalLengthMeters: doublePrecision('total_length_meters').default(0),
  laidLengthMeters: doublePrecision('laid_length_meters').default(0),
  remainingLengthMeters: doublePrecision('remaining_length_meters').default(0),
  startChainage: text('start_chainage'),
  endChainage: text('end_chainage'),
  gpsStartLocation: text('gps_start_location'),
  gpsEndLocation: text('gps_end_location'),
  totalJoints: integer('total_joints').default(0),
  completedJoints: integer('completed_joints').default(0),
  crossingType: text('crossing_type'),
  status: text('status'),
  createdAt: text('created_at').notNull(),
});

export const kwaValvesTable = pgTable('kwa_valves', {
  id: text('id').primaryKey(),
  valveNumber: text('valve_number').notNull(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name'),
  valveType: text('valve_type'),
  sizeMM: integer('size_mm'),
  ratingPN: text('rating_pn'),
  actuator: text('actuator'),
  chainageLocation: text('chainage_location'),
  gpsCoordinates: text('gps_coordinates'),
  installationDate: text('installation_date'),
  chamberBuilt: boolean('chamber_built').default(false),
  testingStatus: text('testing_status').default('Pending'),
  inspectedBy: text('inspected_by'),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
});

export const kwaTestReportsTable = pgTable('kwa_test_reports', {
  id: text('id').primaryKey(),
  testNo: text('test_no').notNull(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name'),
  testType: text('test_type'),
  chainageSection: text('chainage_section'),
  pipeDiameterMM: integer('pipe_diameter_mm'),
  testPressureBar: doublePrecision('test_pressure_bar'),
  holdingDurationMinutes: integer('holding_duration_minutes'),
  allowableDropBar: doublePrecision('allowable_drop_bar'),
  actualDropBar: doublePrecision('actual_drop_bar'),
  testResult: text('test_result'),
  kwaWitnessOfficer: text('kwa_witness_officer'),
  testDate: text('test_date'),
  certificateRef: text('certificate_ref'),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
});

export const kwaDailyReportsTable = pgTable('kwa_daily_reports', {
  id: text('id').primaryKey(),
  dprNumber: text('dpr_number').notNull(),
  date: text('date').notNull(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name'),
  siteLocation: text('site_location'),
  weather: text('weather'),
  startChainage: text('start_chainage'),
  endChainage: text('end_chainage'),
  workCategory: text('work_category'),
  workDoneDetails: text('work_done_details'),
  quantityLaidMeters: doublePrecision('quantity_laid_meters').default(0),
  jointsCompletedCount: integer('joints_completed_count').default(0),
  manpowerCount: jsonb('manpower_count'),
  equipmentUsed: jsonb('equipment_used'),
  vehiclesUsed: jsonb('vehicles_used'),
  materialsConsumed: jsonb('materials_consumed'),
  photoUrls: jsonb('photo_urls'),
  remarks: text('remarks'),
  delayReason: text('delay_reason'),
  tomorrowPlan: text('tomorrow_plan'),
  preparedByName: text('prepared_by_name'),
  approvedByName: text('approved_by_name'),
  createdAt: text('created_at').notNull(),
});

export const kwaDocumentsTable = pgTable('kwa_documents', {
  id: text('id').primaryKey(),
  docNumber: text('doc_number').notNull(),
  title: text('title').notNull(),
  category: text('category'),
  projectId: text('project_id').notNull(),
  projectName: text('project_name'),
  revisionNo: text('revision_no'),
  fileType: text('file_type'),
  sizeBytes: integer('size_bytes'),
  uploadedBy: text('uploaded_by'),
  uploadDate: text('upload_date'),
  status: text('status'),
  downloadUrl: text('download_url'),
  createdAt: text('created_at').notNull(),
});

// ====================================================
// TABLE INITIALIZATION & SEEDING
// ====================================================

let isKWASeeded = false;

export async function ensureKWASeeded() {
  if (isKWASeeded) return;

  try {
    // Seed KWA Projects
    const existingProjects = await db.select().from(kwaProjectsTable).limit(1);
    if (existingProjects.length === 0) {
      const now = new Date().toISOString();
      for (const p of WATER_PROJECTS) {
        await db.insert(kwaProjectsTable).values({
          id: p.id,
          code: p.code,
          name: p.name,
          client: p.client,
          type: p.type,
          location: p.location,
          status: p.status,
          progress: p.progress,
          budgetINR: p.budgetINR,
          spentINR: p.spentINR,
          startDate: p.startDate,
          targetCompletionDate: p.targetCompletionDate,
          pipeMaterial: p.pipeMaterial,
          pipeDiameterMM: p.pipeDiameterMM,
          totalLengthKm: (p as any).totalLengthKM || (p as any).totalLengthKm || 0,
          laidLengthKm: (p as any).laidLengthKM || (p as any).laidLengthKm || 0,
          valveCountInstalled: (p as any).valveCountInstalled || 0,
          pumpsInstalled: (p as any).pumpsInstalled || 0,
          scadaStatus: (p as any).scadaStatus || 'Pending',
          civilProgress: (p as any).civilProgress || 0,
          mechanicalProgress: (p as any).mechanicalProgress || 0,
          electricalProgress: (p as any).electricalProgress || 0,
          testingProgress: (p as any).testingProgress || 0,
          createdAt: p.startDate || now,
        } as any).onConflictDoNothing();
      }
    }

    // Seed Pipeline Sections
    const existingPipelines = await db.select().from(kwaPipelineSectionsTable).limit(1);
    if (existingPipelines.length === 0) {
      const now = new Date().toISOString();
      for (const pipe of WATER_PIPELINE_SECTIONS) {
        await db.insert(kwaPipelineSectionsTable).values({
          id: pipe.id,
          projectId: pipe.projectId,
          projectName: pipe.projectName,
          sectionName: pipe.sectionName,
          pipeMaterial: pipe.pipeMaterial,
          pipeDiameterMM: pipe.pipeDiameterMM,
          pipeClass: pipe.pipeClass,
          totalLengthMeters: pipe.totalLengthMeters,
          laidLengthMeters: pipe.laidLengthMeters,
          remainingLengthMeters: pipe.remainingLengthMeters,
          startChainage: pipe.startChainage,
          endChainage: pipe.endChainage,
          gpsStartLocation: pipe.gpsStartLocation,
          gpsEndLocation: pipe.gpsEndLocation,
          totalJoints: pipe.totalJoints,
          completedJoints: pipe.completedJoints,
          crossingType: pipe.crossingType,
          status: pipe.status,
          createdAt: now,
        } as any).onConflictDoNothing();
      }
    }

    // Seed Valves
    const existingValves = await db.select().from(kwaValvesTable).limit(1);
    if (existingValves.length === 0) {
      const now = new Date().toISOString();
      for (const v of WATER_VALVE_RECORDS) {
        await db.insert(kwaValvesTable).values({
          id: v.id,
          valveNumber: v.valveNumber,
          projectId: v.projectId,
          projectName: v.projectName,
          valveType: v.valveType,
          sizeMM: v.sizeMM,
          ratingPN: v.ratingPN,
          actuator: v.actuator,
          chainageLocation: v.chainageLocation,
          gpsCoordinates: v.gpsCoordinates,
          installationDate: v.installationDate,
          chamberBuilt: v.chamberBuilt,
          testingStatus: v.testingStatus,
          inspectedBy: v.inspectedBy,
          remarks: v.remarks || '',
          createdAt: v.installationDate || now,
        } as any).onConflictDoNothing();
      }
    }

    // Seed Test Reports
    const existingTests = await db.select().from(kwaTestReportsTable).limit(1);
    if (existingTests.length === 0) {
      const now = new Date().toISOString();
      for (const t of WATER_TEST_REPORTS) {
        await db.insert(kwaTestReportsTable).values({
          id: t.id,
          testNo: t.testNo,
          projectId: t.projectId,
          projectName: t.projectName,
          testType: t.testType,
          chainageSection: t.chainageSection,
          pipeDiameterMM: t.pipeDiameterMM,
          testPressureBar: t.testPressureBar,
          holdingDurationMinutes: t.holdingDurationMinutes,
          allowableDropBar: t.allowableDropBar,
          actualDropBar: t.actualDropBar,
          testResult: t.testResult,
          kwaWitnessOfficer: t.witnessOfficer || t.kwaWitnessOfficer,
          testDate: t.testDate,
          certificateRef: t.certificateRef || null,
          remarks: t.remarks || '',
          createdAt: t.testDate || now,
        } as any).onConflictDoNothing();
      }
    }

    // Seed Daily Reports
    const existingDPRs = await db.select().from(kwaDailyReportsTable).limit(1);
    if (existingDPRs.length === 0) {
      const now = new Date().toISOString();
      for (const d of WATER_DAILY_REPORTS) {
        await db.insert(kwaDailyReportsTable).values({
          id: d.id,
          dprNumber: d.dprNumber,
          date: d.date,
          projectId: d.projectId,
          projectName: d.projectName,
          siteLocation: d.siteLocation,
          weather: d.weather,
          startChainage: d.startChainage,
          endChainage: d.endChainage,
          workCategory: d.workCategory,
          workDoneDetails: d.workDoneDetails,
          quantityLaidMeters: d.quantityLaidMeters || 0,
          jointsCompletedCount: d.jointsCompletedCount || 0,
          manpowerCount: d.manpowerCount || {},
          equipmentUsed: d.equipmentUsed || [],
          vehiclesUsed: d.vehiclesUsed || [],
          materialsConsumed: d.materialsConsumed || [],
          photoUrls: d.photoUrls || [],
          remarks: d.remarks || '',
          delayReason: d.delayReason || '',
          tomorrowPlan: d.tomorrowPlan || '',
          preparedByName: d.preparedByName,
          approvedByName: d.approvedByName,
          createdAt: d.date || now,
        } as any).onConflictDoNothing();
      }
    }

    // Seed Documents
    const existingDocs = await db.select().from(kwaDocumentsTable).limit(1);
    if (existingDocs.length === 0) {
      const now = new Date().toISOString();
      for (const doc of WATER_DOCUMENTS) {
        await db.insert(kwaDocumentsTable).values({
          id: doc.id,
          docNumber: doc.docNumber,
          title: doc.title,
          category: doc.category,
          projectId: doc.projectId,
          projectName: doc.projectName,
          revisionNo: doc.revisionNo,
          fileType: doc.fileType,
          sizeBytes: doc.sizeBytes,
          uploadedBy: doc.uploadedBy,
          uploadDate: doc.uploadDate,
          status: doc.status,
          downloadUrl: doc.downloadUrl,
          createdAt: doc.uploadDate || now,
        } as any).onConflictDoNothing();
      }
    }

    isKWASeeded = true;
  } catch (err: any) {
    console.error('Error in ensureKWASeeded:', err);
  }
}

// ====================================================
// REPOSITORY CLASS & METHODS
// ====================================================

export class KWARepository {
  // --- DASHBOARD METRICS ---
  async getDashboardMetrics(): Promise<WaterProjectDashboardMetrics> {
    await ensureKWASeeded();
    const projects = await db.select().from(kwaProjectsTable);
    const pipelineSections = await db.select().from(kwaPipelineSectionsTable);
    const valves = await db.select().from(kwaValvesTable);
    const testReports = await db.select().from(kwaTestReportsTable);

    const activeKms = pipelineSections.reduce((acc, sec) => acc + (Number(sec.laidLengthMeters) || 0) / 1000, 0);
    const valvesCount = valves.length;
    const testPassCount = testReports.filter((t) => t.testResult === 'PASS').length;

    const overallTesting = testReports.length > 0 ? Math.round((testPassCount / testReports.length) * 100) : 0;

    return {
      ...WATER_METRICS,
      totalProjectsCount: projects.length,
      activeKWAPipelinesKms: Number(activeKms.toFixed(1)),
      totalValvesInstalled: valvesCount,
      overallTestingProgress: overallTesting,
    };
  }

  // --- KWA PROJECTS ---
  async getProjects(params: { type?: string; search?: string }) {
    await ensureKWASeeded();
    let rows = await db.select().from(kwaProjectsTable).orderBy(desc(kwaProjectsTable.createdAt));

    if (params.type) {
      rows = rows.filter((p) => p.type === params.type);
    }
    if (params.search) {
      const query = params.search.toLowerCase();
      rows = rows.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.code.toLowerCase().includes(query) ||
          (p.location && p.location.toLowerCase().includes(query))
      );
    }

    return rows;
  }

  async createProject(data: any) {
    await ensureKWASeeded();
    const now = new Date().toISOString().split('T')[0];
    const newId = `kwa_prj_${Date.now()}`;
    const code = data.code || `KWA-PRJ-${Math.floor(100 + Math.random() * 900)}`;

    const newProject = {
      id: newId,
      code,
      name: data.name || 'New Water Infrastructure Project',
      client: data.client || 'State Water Department',
      type: data.type || 'MS Pipeline',
      location: data.location || 'Kerala, India',
      status: data.status || 'In Progress',
      progress: Number(data.progress) || 10,
      budgetINR: data.budgetINR || '₹ 50.00 Cr',
      spentINR: data.spentINR || '₹ 5.00 Cr',
      startDate: data.startDate || now,
      targetCompletionDate: data.targetCompletionDate || '2027-12-31',
      pipeMaterial: data.pipeMaterial || 'MS (Mild Steel)',
      pipeDiameterMM: Number(data.pipeDiameterMM) || 800,
      totalLengthKm: Number(data.totalLengthKm) || 10.0,
      laidLengthKm: 0,
      valveCountInstalled: 0,
      pumpsInstalled: 0,
      scadaStatus: data.scadaStatus || 'SCADA Design Phase',
      civilProgress: Number(data.civilProgress) || 10,
      mechanicalProgress: Number(data.mechanicalProgress) || 5,
      electricalProgress: Number(data.electricalProgress) || 0,
      testingProgress: Number(data.testingProgress) || 0,
      createdAt: now,
    };

    await db.insert(kwaProjectsTable).values(newProject as any);
    return newProject;
  }

  // --- PIPELINE SECTIONS ---
  async getPipelines(params: { projectId?: string; pipeMaterial?: string }): Promise<PipelineSection[]> {
    await ensureKWASeeded();
    let rows = (await db.select().from(kwaPipelineSectionsTable).orderBy(desc(kwaPipelineSectionsTable.createdAt))) as unknown as PipelineSection[];

    if (params.projectId) {
      rows = rows.filter((p) => p.projectId === params.projectId);
    }
    if (params.pipeMaterial) {
      rows = rows.filter((p) => p.pipeMaterial.includes(params.pipeMaterial!));
    }

    return rows;
  }

  async createPipeline(data: any): Promise<PipelineSection> {
    await ensureKWASeeded();
    const now = new Date().toISOString().split('T')[0];
    const newId = `pipe_sec_${Date.now()}`;
    const totalLen = Number(data.totalLengthMeters) || 1000;
    const laidLen = Number(data.laidLengthMeters) || 0;

    const newSection: PipelineSection = {
      id: newId,
      projectId: data.projectId || 'kwa_prj_01',
      projectName: data.projectName || '120 MLD WTP Aruvikkara',
      sectionName: data.sectionName || 'New Pipeline Section',
      pipeMaterial: data.pipeMaterial || 'MS (Mild Steel)',
      pipeDiameterMM: Number(data.pipeDiameterMM) || 1000,
      pipeClass: data.pipeClass || 'IS 3589 Fe 410',
      totalLengthMeters: totalLen,
      laidLengthMeters: laidLen,
      remainingLengthMeters: Math.max(0, totalLen - laidLen),
      startChainage: data.startChainage || 'Ch 0+000',
      endChainage: data.endChainage || 'Ch 1+000',
      gpsStartLocation: data.gpsStartLocation || '8.5671° N, 77.0125° E',
      gpsEndLocation: data.gpsEndLocation || '8.5725° N, 77.0398° E',
      totalJoints: Number(data.totalJoints) || 100,
      completedJoints: Number(data.completedJoints) || 0,
      crossingType: data.crossingType || 'None',
      status: data.status || 'Laying In Progress',
    };

    await db.insert(kwaPipelineSectionsTable).values({
      ...newSection,
      createdAt: now,
    } as any);

    return newSection;
  }

  // --- VALVES ---
  async getValves(params: { projectId?: string; status?: string }): Promise<ValveRecord[]> {
    await ensureKWASeeded();
    let rows = (await db.select().from(kwaValvesTable).orderBy(desc(kwaValvesTable.createdAt))) as unknown as ValveRecord[];

    if (params.projectId) {
      rows = rows.filter((v) => v.projectId === params.projectId);
    }
    if (params.status) {
      rows = rows.filter((v) => v.testingStatus === params.status);
    }

    return rows;
  }

  async createValve(data: any): Promise<ValveRecord> {
    await ensureKWASeeded();
    const now = new Date().toISOString().split('T')[0];
    const newId = `vlv_${Date.now()}`;

    const newValve: ValveRecord = {
      id: newId,
      valveNumber: data.valveNumber || `VLV-KWA-${Math.floor(100 + Math.random() * 900)}`,
      projectId: data.projectId || 'kwa_prj_01',
      projectName: data.projectName || '120 MLD WTP Aruvikkara',
      valveType: data.valveType || 'Butterfly Valve (BFV)',
      sizeMM: Number(data.sizeMM) || 600,
      ratingPN: data.ratingPN || 'PN16',
      actuator: data.actuator || 'Manual Gearbox',
      chainageLocation: data.chainageLocation || 'Ch 1+200',
      gpsCoordinates: data.gpsCoordinates || '8.5675° N, 77.0128° E',
      installationDate: data.installationDate || now,
      chamberBuilt: Boolean(data.chamberBuilt),
      testingStatus: data.testingStatus || 'Pending',
      inspectedBy: data.inspectedBy || 'Lead Inspection Engineer',
      remarks: data.remarks || '',
    };

    await db.insert(kwaValvesTable).values({
      ...newValve,
      createdAt: now,
    } as any);

    // Update project valve count inside transaction
    await db.transaction(async (tx) => {
      const prjValves = await tx.select().from(kwaValvesTable).where(eq(kwaValvesTable.projectId, newValve.projectId));
      await tx.update(kwaProjectsTable)
        .set({ valveCountInstalled: prjValves.length } as any)
        .where(eq(kwaProjectsTable.id, newValve.projectId));
    });

    return newValve;
  }

  // --- HYDROSTATIC & TESTING REPORTS (TRANSACTION WORKFLOW #1) ---
  async getTestingReports(params: { projectId?: string; testResult?: string }): Promise<WaterTestReport[]> {
    await ensureKWASeeded();
    let rows = (await db.select().from(kwaTestReportsTable).orderBy(desc(kwaTestReportsTable.createdAt))) as unknown as WaterTestReport[];

    if (params.projectId) {
      rows = rows.filter((t) => t.projectId === params.projectId);
    }
    if (params.testResult) {
      rows = rows.filter((t) => t.testResult === params.testResult);
    }

    return rows;
  }

  /**
   * TRANSACTION WORKFLOW: Create Hydro Test -> Update Certificates / Project Testing Progress
   */
  async createTestReport(data: any): Promise<WaterTestReport> {
    await ensureKWASeeded();
    const now = new Date().toISOString().split('T')[0];
    const newId = `test_rep_${Date.now()}`;

    const newReport: WaterTestReport = {
      id: newId,
      testNo: data.testNo || `KWA-TR-HT-${Date.now().toString().slice(-4)}`,
      projectId: data.projectId || 'kwa_prj_01',
      projectName: data.projectName || '120 MLD WTP Aruvikkara',
      testType: data.testType || 'Hydro Test',
      chainageSection: data.chainageSection || 'Ch 0+000 to Ch 1+000',
      pipeDiameterMM: Number(data.pipeDiameterMM) || 600,
      testPressureBar: Number(data.testPressureBar) || 15.0,
      holdingDurationMinutes: Number(data.holdingDurationMinutes) || 120,
      allowableDropBar: Number(data.allowableDropBar) || 0.1,
      actualDropBar: Number(data.actualDropBar) || 0.02,
      testResult: data.testResult || 'PASS',
      witnessOfficer: data.kwaWitnessOfficer || data.witnessOfficer || 'Er. Jayakrishnan S (AEE)',
      testDate: data.testDate || now,
      certificateRef: data.certificateRef || `KWA/HT-${Date.now().toString().slice(-4)}`,
      remarks: data.remarks || 'Hydro hydrostatic testing verified without leakage.',
    };

    return await db.transaction(async (tx) => {
      await tx.insert(kwaTestReportsTable).values({
        ...newReport,
        createdAt: now,
      } as any);

      // Recalculate testing progress for project
      const allTests = await tx.select().from(kwaTestReportsTable).where(eq(kwaTestReportsTable.projectId, newReport.projectId));
      const passedCount = allTests.filter((t) => t.testResult === 'PASS').length;
      const progress = allTests.length > 0 ? Math.min(100, Math.round((passedCount / allTests.length) * 100)) : 0;

      await tx.update(kwaProjectsTable)
        .set({ testingProgress: progress } as any)
        .where(eq(kwaProjectsTable.id, newReport.projectId));

      return newReport;
    });
  }

  // --- DAILY SITE REPORTS (DPR) (TRANSACTION WORKFLOW #2) ---
  async getDailySiteReports(params: { projectId?: string; date?: string }): Promise<WaterDailySiteReport[]> {
    await ensureKWASeeded();
    let rows = (await db.select().from(kwaDailyReportsTable).orderBy(desc(kwaDailyReportsTable.createdAt))) as unknown as WaterDailySiteReport[];

    if (params.projectId) {
      rows = rows.filter((d) => d.projectId === params.projectId);
    }
    if (params.date) {
      rows = rows.filter((d) => d.date === params.date);
    }

    return rows;
  }

  /**
   * TRANSACTION WORKFLOW: Create DPR -> Update Pipeline Laid Length & Project Progress
   */
  async createDailySiteReport(data: any): Promise<WaterDailySiteReport> {
    await ensureKWASeeded();
    const now = new Date().toISOString().split('T')[0];
    const newId = `dpr_kwa_${Date.now()}`;

    const newDPR: WaterDailySiteReport = {
      id: newId,
      dprNumber: data.dprNumber || `DPR-KWA-${now}`,
      date: data.date || now,
      projectId: data.projectId || 'kwa_prj_01',
      projectName: data.projectName || '120 MLD WTP Aruvikkara',
      siteLocation: data.siteLocation || 'Aruvikkara Reach',
      weather: data.weather || 'Clear / Sunny',
      startChainage: data.startChainage || 'Ch 0+000',
      endChainage: data.endChainage || 'Ch 0+300',
      workCategory: data.workCategory || 'Pipe Laying',
      workDoneDetails: data.workDoneDetails || 'Trenching and laying of pipes completed.',
      quantityLaidMeters: Number(data.quantityLaidMeters) || 100,
      jointsCompletedCount: Number(data.jointsCompletedCount) || 10,
      manpowerCount: data.manpowerCount || {
        siteEngineers: 2,
        fitters: 4,
        welders: 4,
        riggers: 2,
        helpers: 10,
        masons: 2,
        total: 24,
      },
      equipmentUsed: data.equipmentUsed || [],
      vehiclesUsed: data.vehiclesUsed || [],
      materialsConsumed: data.materialsConsumed || [],
      remarks: data.remarks || '',
      delayReason: data.delayReason || '',
      tomorrowPlan: data.tomorrowPlan || 'Continue trenching and joint welding.',
      preparedByName: data.preparedByName || 'Site Engineer',
      approvedByName: data.approvedByName || 'Project Manager',
    };

    return await db.transaction(async (tx) => {
      await tx.insert(kwaDailyReportsTable).values({
        ...newDPR,
        createdAt: now,
      } as any);

      // Update pipeline section if matching project
      const sections = await tx.select().from(kwaPipelineSectionsTable).where(eq(kwaPipelineSectionsTable.projectId, newDPR.projectId));
      if (sections.length > 0 && newDPR.quantityLaidMeters) {
        const sec = sections[0];
        const newLaidMeters = (Number(sec.laidLengthMeters) || 0) + newDPR.quantityLaidMeters;
        const newCompletedJoints = (Number(sec.completedJoints) || 0) + (newDPR.jointsCompletedCount || 0);
        const newRemaining = Math.max(0, (Number(sec.totalLengthMeters) || 0) - newLaidMeters);

        await tx.update(kwaPipelineSectionsTable)
          .set({
            laidLengthMeters: newLaidMeters,
            completedJoints: newCompletedJoints,
            remainingLengthMeters: newRemaining,
          } as any)
          .where(eq(kwaPipelineSectionsTable.id, sec.id));

        // Update project total laid km
        const allSections = await tx.select().from(kwaPipelineSectionsTable).where(eq(kwaPipelineSectionsTable.projectId, newDPR.projectId));
        const totalLaidKm = allSections.reduce((acc, s) => acc + (Number(s.laidLengthMeters) || 0) / 1000, 0);

        await tx.update(kwaProjectsTable)
          .set({ laidLengthKm: Number(totalLaidKm.toFixed(1)) } as any)
          .where(eq(kwaProjectsTable.id, newDPR.projectId));
      }

      return newDPR;
    });
  }

  // --- ENGINEERING DOCUMENTS ---
  async getDocuments(params: { projectId?: string; category?: string }): Promise<WaterDocument[]> {
    await ensureKWASeeded();
    let rows = (await db.select().from(kwaDocumentsTable).orderBy(desc(kwaDocumentsTable.createdAt))) as unknown as WaterDocument[];

    if (params.projectId) {
      rows = rows.filter((d) => d.projectId === params.projectId);
    }
    if (params.category) {
      rows = rows.filter((d) => d.category === params.category);
    }

    return rows;
  }

  async createDocument(data: any): Promise<WaterDocument> {
    await ensureKWASeeded();
    const now = new Date().toISOString().split('T')[0];
    const newId = `kwa_doc_${Date.now()}`;

    const newDoc: WaterDocument = {
      id: newId,
      docNumber: data.docNumber || `KWA-DOC-${Date.now().toString().slice(-4)}`,
      title: data.title || 'New KWA Document',
      category: data.category || 'GADP & Civil Drawings',
      projectId: data.projectId || 'kwa_prj_01',
      projectName: data.projectName || '120 MLD WTP Aruvikkara',
      revisionNo: data.revisionNo || 'R0',
      fileType: data.fileType || 'application/pdf',
      sizeBytes: Number(data.sizeBytes) || 1024000,
      uploadedBy: data.uploadedBy || 'Site Engineer',
      uploadDate: data.uploadDate || now,
      status: data.status || 'Under Review',
      downloadUrl: data.downloadUrl || '#',
    };

    await db.insert(kwaDocumentsTable).values({
      ...newDoc,
      createdAt: now,
    } as any);

    return newDoc;
  }
}

export const kwaRepository = new KWARepository();
