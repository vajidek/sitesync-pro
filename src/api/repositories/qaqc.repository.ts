import { db } from '../../db/index';
import { isDemoSeedAllowed } from '../config/env';
import { sql } from 'drizzle-orm';
import {
  phase62ItpMasters,
  phase62ItpChecklists,
  phase62Inspections,
  phase62InspectionItems,
  phase62Ncr,
  phase62CorrectiveActions,
  phase62PreventiveActions,
  phase62MaterialInspections,
  phase62SiteTests,
  phase62WeldingInspections,
  phase62HydroTests,
  phase62PressureTests,
  phase62PunchLists,
  phase62SnagLists,
  phase62QualityDocuments,
  phase62QualityApprovals,
  phase62QualityLogs,
  phase62QualityNotifications,
} from '../../db/schema';
import { v4 as uuidv4 } from 'uuid';

export class QAQCRepository {
  private static isTablesEnsured = false;

  public async ensureQAQCTablesExist(): Promise<void> {
    if (QAQCRepository.isTablesEnsured) return;
    if (!isDemoSeedAllowed()) {
      QAQCRepository.isTablesEnsured = true;
      return;
    }
    if (QAQCRepository.isTablesEnsured) return;
    try {
      // Seed initial ITPs and Inspections if empty
      const existingItp: any = await db.execute(sql`SELECT count(*)::int as count FROM phase62_itp_masters`);
      const count = existingItp.rows?.[0]?.count ?? existingItp[0]?.count ?? 0;
      if (Number(count) === 0) {
        await this.seedInitialQAQCData();
      }

      QAQCRepository.isTablesEnsured = true;
    } catch (err) {
      console.error('Error ensuring QA/QC tables exist:', err);
    }
  }

  private async seedInitialQAQCData() {
    const now = new Date().toISOString();
    const itpId = uuidv4();

    await db.execute(sql`
      INSERT INTO phase62_itp_masters (id, itp_number, title, discipline, project_id, project_name, revision_number, standard_reference, status, prepared_by, approved_by, created_at, updated_at)
      VALUES (
        ${itpId},
        'ITP-2026-0001',
        'Water Pipeline Pressure & Weld Inspection Plan',
        'PIPELINE',
        'PRJ-101',
        'Al Reem Mechanical Piping & Structural Hub',
        'R1',
        'ISO 9001 / ASME B31.3',
        'APPROVED',
        'Er. Abdul Vajid EK',
        'QA/QC Manager',
        ${now},
        ${now}
      );

      INSERT INTO phase62_itp_checklists (id, itp_id, item_number, activity_description, reference_doc, acceptance_criteria, inspection_type, contractor_check, consultant_check, client_check, remarks, created_at, updated_at)
      VALUES 
      (${uuidv4()}, ${itpId}, 1, 'Pipe Visual & Material Receiving Verification', 'MIR-2026-001', 'Heat certificates matched, zero surface pitting', 'HOLD_POINT', true, true, true, 'Inspector Stamp Verified', ${now}, ${now}),
      (${uuidv4()}, ${itpId}, 2, 'Joint Fit-up and Root Gap Inspection', 'WPS-MECH-001', 'Gap 2.5mm - 3.2mm, Misalignment < 1.5mm', 'WITNESS_POINT', true, true, false, 'Fit-up gauge verified', ${now}, ${now}),
      (${uuidv4()}, ${itpId}, 3, '100% Radiography / NDT Examination', 'ASME Sec V', 'Zero crack, slag inclusion within ASTM limits', 'HOLD_POINT', true, true, true, 'Film review completed', ${now}, ${now}),
      (${uuidv4()}, ${itpId}, 4, 'Hydrostatic Pressure Test @ 1.5x Design Pressure', 'ASME Sec 4', 'Hold 15 Bar for 24 Hours, zero pressure drop', 'HOLD_POINT', true, true, true, '24hr test chart attached', ${now}, ${now});

      INSERT INTO phase62_inspections (id, inspection_number, itp_id, title, discipline, inspection_type, project_id, location, requested_date, inspection_date, inspector_name, client_representative, result, status, remarks, created_at, updated_at)
      VALUES 
      (${uuidv4()}, 'INS-2026-0001', ${itpId}, 'Main Intake Pipe Trench Weld Visual Inspection', 'PIPELINE', 'WELDING', 'PRJ-101', 'Chainage 12+400 to 12+800', '2026-08-10', '2026-08-11', 'Muhammed Rishad (QA Lead)', 'Er. Suresh (Inspection Authority)', 'PASSED', 'COMPLETED', 'All 12 welds accepted under Radiography Class 1', ${now}, ${now}),
      (${uuidv4()}, 'INS-2026-0002', ${itpId}, 'WTP Concrete Filter Bed Slump & Cube Test', 'CIVIL', 'SITE_INSPECTION', 'PRJ-101', 'Filter House Unit 3', '2026-08-12', '2026-08-12', 'Anil Kumar (Civil QA)', 'Er. Rajan (Consultant Rep)', 'PASSED', 'COMPLETED', '28 day cube strength target 35 N/mm2 achieved', ${now}, ${now}),
      (${uuidv4()}, 'INS-2026-0003', ${itpId}, 'Flange Torque & Gasket Sealing Audit', 'MECHANICAL', 'PRESSURE_TEST', 'PRJ-101', 'Clear Water Pump House 1', '2026-08-13', '2026-08-13', 'Er. Abdul Vajid EK', 'Client Inspection Team', 'PENDING', 'SUBMITTED', 'Scheduled for afternoon witnessing', ${now}, ${now});

      INSERT INTO phase62_ncr (id, ncr_number, inspection_id, project_id, title, severity, description, location, issued_to, issued_by, issue_date, target_close_date, root_cause, disposition, status, remarks, created_at, updated_at)
      VALUES 
      (${uuidv4()}, 'NCR-2026-0001', NULL, 'PRJ-101', 'Coating Thickness Below Specification on 16" Pipe Spool', 'MAJOR', 'DFT measured 180 microns against mandatory requirement of 250 microns dry film thickness.', 'Spool Yard B', 'Piping Subcontractor Alpha', 'Anil Kumar (QA/QC Inspector)', '2026-08-05', '2026-08-15', 'Improper spray gun distance during automated blast coat process.', 'REWORK', 'OPEN', 'Awaiting re-coating and secondary DFT gauge audit', ${now}, ${now});

      INSERT INTO phase62_material_inspections (id, mir_number, material_name, supplier_name, po_number, delivery_note_number, quantity_received, unit_of_measure, heat_number_cert_ref, inspection_date, visual_check, dimensional_check, cert_verification, result, remarks, created_at, updated_at)
      VALUES 
      (${uuidv4()}, 'MIR-2026-0001', 'DN600 Ductile Iron Pipes K9 Class', 'Jindal Saw Water Pipes Ltd', 'PO-MECH-2026-88', 'DN-99411', 45, 'Pcs', 'HEAT-77120-KWA', '2026-08-08', 'PASS', 'PASS', 'VERIFIED', 'ACCEPTED', 'Authority Inspector stamp present on socket ends', ${now}, ${now});

      INSERT INTO phase62_hydro_tests (id, test_package_number, line_or_tank_number, test_medium, design_pressure_bar, test_pressure_bar, test_duration_hours, holding_time_minutes, pressure_drop_observed_bar, allowable_drop_bar, result, kwa_witness_name, consultant_witness_name, status, created_at, updated_at)
      VALUES 
      (${uuidv4()}, 'HYD-2026-0001', 'DN600 Feeder Main Line 01', 'POTABLE_WATER', 10.0, 15.0, 24, 120, 0.05, 0.2, 'PASS', 'Er. K. V. Suresh (Lead Quality EE)', 'Er. Madhavan (Lead Consultant)', 'APPROVED', ${now}, ${now});

      INSERT INTO phase62_punch_lists (id, punch_number, subsystem_ref, category, description, location, assigned_contractor, target_date, status, created_at, updated_at)
      VALUES 
      (${uuidv4()}, 'PCH-2026-0001', 'Clear Water Pump House #1', 'CATEGORY_B', 'Replace missing pressure gauge calibration tags on Pump 2 discharge spool', 'Pump House 1 Floor', 'Piping Subcon Alpha', '2026-08-18', 'OPEN', ${now}, ${now}),
      (${uuidv4()}, 'PCH-2026-0002', 'Raw Water Intake Works', 'CATEGORY_A', 'Re-torque M24 flange bolts on intake manifold before hydro test kickoff', 'Intake Structure', 'Mechanical Team B', '2026-08-14', 'OPEN', ${now}, ${now});
    `);
  }

  // Dashboard Aggregates
  public async getStats() {
    await this.ensureQAQCTablesExist();
    const statsRes: any = await db.execute(sql`
      SELECT 
        (SELECT COUNT(*)::int FROM phase62_inspections WHERE is_deleted = false) as total_inspections,
        (SELECT COUNT(*)::int FROM phase62_inspections WHERE result = 'PASSED' AND is_deleted = false) as passed_inspections,
        (SELECT COUNT(*)::int FROM phase62_inspections WHERE status = 'SUBMITTED' AND is_deleted = false) as pending_inspections,
        (SELECT COUNT(*)::int FROM phase62_ncr WHERE status = 'OPEN' AND is_deleted = false) as open_ncrs,
        (SELECT COUNT(*)::int FROM phase62_ncr WHERE is_deleted = false) as total_ncrs,
        (SELECT COUNT(*)::int FROM phase62_itp_masters WHERE is_deleted = false) as total_itps,
        (SELECT COUNT(*)::int FROM phase62_hydro_tests WHERE result = 'PASS' AND is_deleted = false) as passed_hydro_tests,
        (SELECT COUNT(*)::int FROM phase62_punch_lists WHERE status = 'OPEN' AND is_deleted = false) as open_punch_items
    `);
    const row = statsRes.rows?.[0] || statsRes[0] || {};
    return {
      totalInspections: Number(row.total_inspections || 0),
      passedInspections: Number(row.passed_inspections || 0),
      pendingInspections: Number(row.pending_inspections || 0),
      openNcrs: Number(row.open_ncrs || 0),
      totalNcrs: Number(row.total_ncrs || 0),
      totalItps: Number(row.total_itps || 0),
      passedHydroTests: Number(row.passed_hydro_tests || 0),
      openPunchItems: Number(row.open_punch_items || 0),
      passRatePercentage: Number(row.total_inspections) > 0 
        ? Math.round((Number(row.passed_inspections || 0) / Number(row.total_inspections)) * 100) 
        : 100,
    };
  }

  // Inspections
  public async getInspections(limit = 100) {
    await this.ensureQAQCTablesExist();
    const res: any = await db.execute(sql`
      SELECT * FROM phase62_inspections 
      WHERE is_deleted = false 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `);
    return res.rows || res[0] || [];
  }

  public async getNextInspectionNumber(): Promise<string> {
    await this.ensureQAQCTablesExist();
    const countRes: any = await db.execute(sql`SELECT COUNT(*)::int as count FROM phase62_inspections`);
    const count = (countRes.rows?.[0]?.count || countRes[0]?.count || 0) + 1;
    return `INS-2026-${String(count).padStart(4, '0')}`;
  }

  public async createInspection(data: any) {
    await this.ensureQAQCTablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const insNumber = data.inspectionNumber || await this.getNextInspectionNumber();

    await db.execute(sql`
      INSERT INTO phase62_inspections (
        id, inspection_number, itp_id, title, discipline, inspection_type, 
        project_id, location, requested_date, inspection_date, inspector_name, 
        client_representative, result, status, remarks, created_at, updated_at
      ) VALUES (
        ${id}, ${insNumber}, ${data.itpId || null}, ${data.title}, ${data.discipline || 'MECHANICAL'},
        ${data.inspectionType || 'SITE_INSPECTION'}, ${data.projectId || 'PRJ-101'}, ${data.location},
        ${data.requestedDate || now.split('T')[0]}, ${data.inspectionDate || null}, ${data.inspectorName || null},
        ${data.clientRepresentative || null}, ${data.result || 'PENDING'}, ${data.status || 'SUBMITTED'},
        ${data.remarks || null}, ${now}, ${now}
      )
    `);

    if (data.items && Array.isArray(data.items)) {
      for (const item of data.items) {
        await db.execute(sql`
          INSERT INTO phase62_inspection_items (
            id, inspection_id, check_point, acceptance_criteria, observed_result, status, comments, created_at, updated_at
          ) VALUES (
            ${uuidv4()}, ${id}, ${item.checkPoint}, ${item.acceptanceCriteria}, ${item.observedResult || null},
            ${item.status || 'PASS'}, ${item.comments || null}, ${now}, ${now}
          )
        `);
      }
    }

    return { id, inspectionNumber: insNumber, ...data };
  }

  // NCR
  public async getNcrs(limit = 100) {
    await this.ensureQAQCTablesExist();
    const res: any = await db.execute(sql`
      SELECT * FROM phase62_ncr 
      WHERE is_deleted = false 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `);
    return res.rows || res[0] || [];
  }

  public async getNextNcrNumber(): Promise<string> {
    await this.ensureQAQCTablesExist();
    const countRes: any = await db.execute(sql`SELECT COUNT(*)::int as count FROM phase62_ncr`);
    const count = (countRes.rows?.[0]?.count || countRes[0]?.count || 0) + 1;
    return `NCR-2026-${String(count).padStart(4, '0')}`;
  }

  public async createNcr(data: any) {
    await this.ensureQAQCTablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const ncrNum = data.ncrNumber || await this.getNextNcrNumber();

    await db.execute(sql`
      INSERT INTO phase62_ncr (
        id, ncr_number, inspection_id, project_id, title, severity, description,
        location, issued_to, issued_by, issue_date, target_close_date, root_cause,
        disposition, status, remarks, created_at, updated_at
      ) VALUES (
        ${id}, ${ncrNum}, ${data.inspectionId || null}, ${data.projectId || 'PRJ-101'},
        ${data.title}, ${data.severity || 'MAJOR'}, ${data.description}, ${data.location},
        ${data.issuedTo}, ${data.issuedBy || 'QA/QC Inspector'}, ${now.split('T')[0]},
        ${data.targetCloseDate}, ${data.rootCause || null}, ${data.disposition || 'REWORK'},
        ${data.status || 'OPEN'}, ${data.remarks || null}, ${now}, ${now}
      )
    `);

    return { id, ncrNumber: ncrNum, ...data };
  }

  // CAPA
  public async getCapas() {
    await this.ensureQAQCTablesExist();
    const res: any = await db.execute(sql`
      SELECT * FROM phase62_corrective_actions WHERE is_deleted = false ORDER BY created_at DESC
    `);
    return res.rows || res[0] || [];
  }

  public async createCapa(data: any) {
    await this.ensureQAQCTablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const capaNum = `CAPA-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    await db.execute(sql`
      INSERT INTO phase62_corrective_actions (
        id, capa_number, ncr_id, action_plan, assigned_to, due_date, status, created_at, updated_at
      ) VALUES (
        ${id}, ${capaNum}, ${data.ncrId}, ${data.actionPlan}, ${data.assignedTo}, ${data.dueDate},
        ${data.status || 'IN_PROGRESS'}, ${now}, ${now}
      )
    `);

    if (data.preventiveMeasure) {
      await db.execute(sql`
        INSERT INTO phase62_preventive_actions (
          id, preventive_action_number, ncr_id, risk_category, preventive_measure,
          responsible_person, implementation_date, status, created_at, updated_at
        ) VALUES (
          ${uuidv4()}, ${'PA-2026-' + Math.floor(1000 + Math.random() * 9000)}, ${data.ncrId},
          ${data.riskCategory || 'PROCESS_FAILURE'}, ${data.preventiveMeasure},
          ${data.assignedTo}, ${data.dueDate}, 'ACTIVE', ${now}, ${now}
        )
      `);
    }

    return { id, capaNumber: capaNum, ...data };
  }

  // ITP Masters
  public async getItps() {
    await this.ensureQAQCTablesExist();
    const res: any = await db.execute(sql`
      SELECT * FROM phase62_itp_masters WHERE is_deleted = false ORDER BY created_at DESC
    `);
    return res.rows || res[0] || [];
  }

  public async createItp(data: any) {
    await this.ensureQAQCTablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const itpNum = `ITP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    await db.execute(sql`
      INSERT INTO phase62_itp_masters (
        id, itp_number, title, discipline, project_id, project_name, revision_number,
        standard_reference, status, prepared_by, approved_by, created_at, updated_at
      ) VALUES (
        ${id}, ${itpNum}, ${data.title}, ${data.discipline || 'MECHANICAL'}, ${data.projectId || 'PRJ-101'},
        ${data.projectName || 'Al Reem Mechanical Piping & Structural Hub'}, ${data.revisionNumber || 'R0'},
        ${data.standardReference || null}, ${data.status || 'APPROVED'}, ${data.preparedBy || 'Quality Inspector'},
        ${data.approvedBy || 'QA/QC Manager'}, ${now}, ${now}
      )
    `);

    return { id, itpNumber: itpNum, ...data };
  }

  // Material Inspections (MIR)
  public async getMaterialInspections() {
    await this.ensureQAQCTablesExist();
    const res: any = await db.execute(sql`
      SELECT * FROM phase62_material_inspections WHERE is_deleted = false ORDER BY created_at DESC
    `);
    return res.rows || res[0] || [];
  }

  public async createMaterialInspection(data: any) {
    await this.ensureQAQCTablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const mirNum = `MIR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    await db.execute(sql`
      INSERT INTO phase62_material_inspections (
        id, mir_number, material_name, supplier_name, po_number, delivery_note_number,
        quantity_received, unit_of_measure, heat_number_cert_ref, inspection_date,
        visual_check, dimensional_check, cert_verification, result, remarks, created_at, updated_at
      ) VALUES (
        ${id}, ${mirNum}, ${data.materialName}, ${data.supplierName}, ${data.poNumber || null},
        ${data.deliveryNoteNumber || null}, ${data.quantityReceived || 0}, ${data.unitOfMeasure || 'Pcs'},
        ${data.heatNumberCertRef || null}, ${data.inspectionDate || now.split('T')[0]},
        ${data.visualCheck || 'PASS'}, ${data.dimensionalCheck || 'PASS'}, ${data.certVerification || 'VERIFIED'},
        ${data.result || 'ACCEPTED'}, ${data.remarks || null}, ${now}, ${now}
      )
    `);

    return { id, mirNumber: mirNum, ...data };
  }

  // Site Tests
  public async getSiteTests() {
    await this.ensureQAQCTablesExist();
    const res: any = await db.execute(sql`
      SELECT * FROM phase62_site_tests WHERE is_deleted = false ORDER BY created_at DESC
    `);
    return res.rows || res[0] || [];
  }

  public async createSiteTest(data: any) {
    await this.ensureQAQCTablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const tstNum = `TST-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    await db.execute(sql`
      INSERT INTO phase62_site_tests (
        id, test_number, test_type, location_chainage, tested_by_lab, sample_date,
        test_date, required_value, obtained_value, result, witnessed_by, remarks, created_at, updated_at
      ) VALUES (
        ${id}, ${tstNum}, ${data.testType || 'CONCRETE_CUBE'}, ${data.locationChainage},
        ${data.testedByLab || 'Site QA Lab'}, ${data.sampleDate || now.split('T')[0]},
        ${data.testDate || now.split('T')[0]}, ${data.requiredValue}, ${data.obtainedValue},
        ${data.result || 'PASS'}, ${data.witnessedBy || null}, ${data.remarks || null}, ${now}, ${now}
      )
    `);

    return { id, testNumber: tstNum, ...data };
  }

  // Welding Inspections
  public async getWeldingInspections() {
    await this.ensureQAQCTablesExist();
    const res: any = await db.execute(sql`
      SELECT * FROM phase62_welding_inspections WHERE is_deleted = false ORDER BY created_at DESC
    `);
    return res.rows || res[0] || [];
  }

  public async createWeldingInspection(data: any) {
    await this.ensureQAQCTablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const reportNum = `WLD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    await db.execute(sql`
      INSERT INTO phase62_welding_inspections (
        id, report_number, joint_number, welder_id, pipe_diameter_inch, pipe_material,
        wps_number, fitup_status, visual_status, ndt_method, ndt_result, repair_count, created_at, updated_at
      ) VALUES (
        ${id}, ${reportNum}, ${data.jointNumber || 'J-101'}, ${data.welderId || 'W-809'},
        ${data.pipeDiameterInch || 12}, ${data.pipeMaterial || 'Carbon Steel A106 Gr B'},
        ${data.wpsNumber || 'WPS-MECH-001'}, ${data.fitupStatus || 'ACCEPTED'},
        ${data.visualStatus || 'ACCEPTED'}, ${data.ndtMethod || 'RADIOGRAPHY_RT'},
        ${data.ndtResult || 'PASS'}, ${data.repairCount || 0}, ${now}, ${now}
      )
    `);

    return { id, reportNumber: reportNum, ...data };
  }

  // Hydro & Pressure Tests
  public async getHydroTests() {
    await this.ensureQAQCTablesExist();
    const res: any = await db.execute(sql`
      SELECT * FROM phase62_hydro_tests WHERE is_deleted = false ORDER BY created_at DESC
    `);
    return res.rows || res[0] || [];
  }

  public async createHydroTest(data: any) {
    await this.ensureQAQCTablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const hydNum = `HYD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    await db.execute(sql`
      INSERT INTO phase62_hydro_tests (
        id, test_package_number, line_or_tank_number, test_medium, design_pressure_bar,
        test_pressure_bar, test_duration_hours, holding_time_minutes, pressure_drop_observed_bar,
        allowable_drop_bar, result, kwa_witness_name, consultant_witness_name, status, created_at, updated_at
      ) VALUES (
        ${id}, ${hydNum}, ${data.lineOrTankNumber || 'Line 14-PL-201'}, ${data.testMedium || 'POTABLE_WATER'},
        ${data.designPressureBar || 10}, ${data.testPressureBar || 15}, ${data.testDurationHours || 24},
        ${data.holdingTimeMinutes || 120}, ${data.pressureDropObservedBar || 0.0}, ${data.allowableDropBar || 0.2},
        ${data.result || 'PASS'}, ${data.kwaWitnessName || null}, ${data.consultantWitnessName || null},
        ${data.status || 'APPROVED'}, ${now}, ${now}
      )
    `);

    return { id, testPackageNumber: hydNum, ...data };
  }

  public async getPressureTests() {
    await this.ensureQAQCTablesExist();
    const res: any = await db.execute(sql`
      SELECT * FROM phase62_pressure_tests WHERE is_deleted = false ORDER BY created_at DESC
    `);
    return res.rows || res[0] || [];
  }

  public async createPressureTest(data: any) {
    await this.ensureQAQCTablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const prtNum = `PRT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    await db.execute(sql`
      INSERT INTO phase62_pressure_tests (
        id, test_number, equipment_pipeline_ref, test_medium, test_pressure_bar,
        gauge_calib_cert_ref, start_pressure_bar, end_pressure_bar, result, remarks, created_at, updated_at
      ) VALUES (
        ${id}, ${prtNum}, ${data.equipmentPipelineRef}, ${data.testMedium || 'COMPRESSED_AIR'},
        ${data.testPressureBar || 3.5}, ${data.gaugeCalibCertRef || 'CAL-2026-881'},
        ${data.startPressureBar || 3.5}, ${data.endPressureBar || 3.5},
        ${data.result || 'PASS'}, ${data.remarks || null}, ${now}, ${now}
      )
    `);

    return { id, testNumber: prtNum, ...data };
  }

  // Punch & Snag Lists
  public async getPunchLists() {
    await this.ensureQAQCTablesExist();
    const res: any = await db.execute(sql`
      SELECT * FROM phase62_punch_lists WHERE is_deleted = false ORDER BY created_at DESC
    `);
    return res.rows || res[0] || [];
  }

  public async createPunchList(data: any) {
    await this.ensureQAQCTablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const pchNum = `PCH-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    await db.execute(sql`
      INSERT INTO phase62_punch_lists (
        id, punch_number, subsystem_ref, category, description, location,
        assigned_contractor, target_date, status, created_at, updated_at
      ) VALUES (
        ${id}, ${pchNum}, ${data.subsystemRef}, ${data.category || 'CATEGORY_B'},
        ${data.description}, ${data.location}, ${data.assignedContractor},
        ${data.targetDate}, ${data.status || 'OPEN'}, ${now}, ${now}
      )
    `);

    return { id, punchNumber: pchNum, ...data };
  }

  public async getSnagLists() {
    await this.ensureQAQCTablesExist();
    const res: any = await db.execute(sql`
      SELECT * FROM phase62_snag_lists WHERE is_deleted = false ORDER BY created_at DESC
    `);
    return res.rows || res[0] || [];
  }

  public async createSnagList(data: any) {
    await this.ensureQAQCTablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const sngNum = `SNG-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    await db.execute(sql`
      INSERT INTO phase62_snag_lists (
        id, snag_number, building_zone, snag_detail, severity, trade, status, created_at, updated_at
      ) VALUES (
        ${id}, ${sngNum}, ${data.buildingZone}, ${data.snagDetail}, ${data.severity || 'LOW'},
        ${data.trade || 'CIVIL'}, ${data.status || 'PENDING'}, ${now}, ${now}
      )
    `);

    return { id, snagNumber: sngNum, ...data };
  }
}
