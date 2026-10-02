import { db } from '../../db/index';
import { sql, eq, desc, inArray } from 'drizzle-orm';
import {
  phase64ProjectsWbs,
  phase64WorkPackages,
  phase64ProjectActivities,
  phase64ActivityRelationships,
  phase64ProjectBaselines,
  phase64ProjectCalendars,
  phase64Resources,
  phase64ResourceAssignments,
  phase64ProjectProgress,
  phase64ProjectDelays,
  phase64ProjectConstraints,
  phase64ProjectMilestones,
  phase64ProjectRisks,
  phase64ProjectIssues,
  phase64ChangeRequests,
  phase64LookaheadPlans,
  phase64DailyProgress,
  phase64WeeklyProgress,
  phase64MonthlyProgress,
  phase64ProjectLogs,
  materialIssues,
  materialIssueItems,
  phase69PurchaseOrders,
  fleetFuelLogs,
  projects,
  boqItems,
} from '../../db/schema';
import { v4 as uuidv4 } from 'uuid';
import { employeeExpenseRepository } from './employee_expense.repository';
import { commercialRepository } from './commercial.repository';
import { isDemoSeedAllowed } from '../config/env';

export class ProjectControlsRepository {
  private static isTablesEnsured = false;

  private resolveProjectId(projectId?: string): string {
    const resolved = String(projectId || '').trim();
    if (resolved) return resolved;
    if (isDemoSeedAllowed()) return 'PRJ-101';
    throw new Error('Explicit projectId is required for project-controls operations outside DEMO mode.');
  }

  public async ensureProjectControlsTablesExist(): Promise<void> {
    if (ProjectControlsRepository.isTablesEnsured) return;

    // Synthetic WBS, schedule and EVM records are DEMO fixtures only.
    // Never populate an empty UAT/PRODUCTION database with sample construction data.
    if (!isDemoSeedAllowed()) {
      ProjectControlsRepository.isTablesEnsured = true;
      return;
    }

    try {
      await this.seedInitialProjectControlsData();
      ProjectControlsRepository.isTablesEnsured = true;
    } catch (err) {
      console.error('Error ensuring demo project-controls fixtures:', err);
    }
  }

  private async seedInitialProjectControlsData(): Promise<void> {
    const checkWbs = await db.select().from(phase64ProjectsWbs).limit(1);
    if (checkWbs.length > 0) return;

    const now = new Date().toISOString();
    const nowShort = now.split('T')[0];

    // Seed WBS
    const wbs1Id = 'wbs-001';
    const wbs2Id = 'wbs-002';
    const wbs3Id = 'wbs-003';

    await db.insert(phase64ProjectsWbs).values([
      {
        id: wbs1Id,
        wbsNumber: 'WBS-2026-0001',
        projectId: 'PRJ-101',
        code: '1.0',
        name: 'Engineering & Detailed Design',
        description: 'Piping schematics, structural stress analysis & ISO approvals',
        level: 1,
        budgetAmount: 450000,
        plannedStartDate: '2026-01-01',
        plannedEndDate: '2026-03-31',
        status: 'COMPLETED',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: wbs2Id,
        wbsNumber: 'WBS-2026-0002',
        projectId: 'PRJ-101',
        code: '2.0',
        name: 'Procurement & Material Delivery',
        description: 'Duplex stainless steel pipes, high pressure valves & flanges',
        level: 1,
        budgetAmount: 1850000,
        plannedStartDate: '2026-02-15',
        plannedEndDate: '2026-06-30',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: wbs3Id,
        wbsNumber: 'WBS-2026-0003',
        projectId: 'PRJ-101',
        code: '3.0',
        name: 'Site Erection & Mechanical Installation',
        description: 'Pump house header piping, filter bed sector welding & hydrostatic tests',
        level: 1,
        budgetAmount: 2700000,
        plannedStartDate: '2026-04-01',
        plannedEndDate: '2026-11-30',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Work Packages
    const wp1Id = 'wp-001';
    const wp2Id = 'wp-002';
    await db.insert(phase64WorkPackages).values([
      {
        id: wp1Id,
        wpNumber: 'WP-2026-0001',
        wbsId: wbs2Id,
        projectId: 'PRJ-101',
        code: 'WP-2.1',
        name: 'Main Intake Pipe Procurement Package',
        deliverable: '1200mm Heavy Wall Duplex Steel Pipes Delivery',
        responsiblePerson: 'Procurement Engineer - Rahul S',
        estimatedCost: 1200000,
        plannedStartDate: '2026-02-15',
        plannedEndDate: '2026-05-15',
        status: 'IN_PROGRESS',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: wp2Id,
        wpNumber: 'WP-2026-0002',
        wbsId: wbs3Id,
        projectId: 'PRJ-101',
        code: 'WP-3.1',
        name: 'Sector 4 Hydrotest & Joint Tie-in Package',
        deliverable: '100% NDT Clean Hydrotest Sign-off',
        responsiblePerson: 'Lead Site Engineer - Abdul Vajid EK',
        estimatedCost: 850000,
        plannedStartDate: '2026-05-01',
        plannedEndDate: '2026-08-30',
        status: 'IN_PROGRESS',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Activities (CPM Schedule)
    const act1Id = 'act-001';
    const act2Id = 'act-002';
    const act3Id = 'act-003';
    const act4Id = 'act-004';

    await db.insert(phase64ProjectActivities).values([
      {
        id: act1Id,
        activityNumber: 'ACT-2026-0001',
        projectId: 'PRJ-101',
        wbsId: wbs2Id,
        wpId: wp1Id,
        activityCode: 'A1010',
        name: 'Piping Inspection & Factory Acceptance Testing (FAT)',
        description: 'Third-party ultrasonic NDT and mill test certifications',
        durationDays: 14,
        plannedStartDate: '2026-04-01',
        plannedEndDate: '2026-04-15',
        actualStartDate: '2026-04-01',
        actualEndDate: '2026-04-14',
        earlyStart: '2026-04-01',
        earlyFinish: '2026-04-15',
        lateStart: '2026-04-01',
        lateFinish: '2026-04-15',
        totalFloat: 0,
        freeFloat: 0,
        isCritical: true,
        percentComplete: 100,
        plannedCost: 150000,
        actualCost: 142000,
        status: 'COMPLETED',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: act2Id,
        activityNumber: 'ACT-2026-0002',
        projectId: 'PRJ-101',
        wbsId: wbs3Id,
        wpId: wp2Id,
        activityCode: 'A1020',
        name: 'Pump House Valve Header Alignment & Fitting',
        description: 'Precision laser alignment for main suction & discharge lines',
        durationDays: 20,
        plannedStartDate: '2026-05-01',
        plannedEndDate: '2026-05-22',
        actualStartDate: '2026-05-03',
        earlyStart: '2026-05-01',
        earlyFinish: '2026-05-22',
        lateStart: '2026-05-01',
        lateFinish: '2026-05-22',
        totalFloat: 0,
        freeFloat: 0,
        isCritical: true,
        percentComplete: 75,
        plannedCost: 280000,
        actualCost: 265000,
        status: 'IN_PROGRESS',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: act3Id,
        activityNumber: 'ACT-2026-0003',
        projectId: 'PRJ-101',
        wbsId: wbs3Id,
        wpId: wp2Id,
        activityCode: 'A1030',
        name: 'Filter Bed Sector 4 Main Header TIG Welding',
        description: 'Full penetration TIG root + SMAW fill for 42-inch joints',
        durationDays: 30,
        plannedStartDate: '2026-05-25',
        plannedEndDate: '2026-06-30',
        earlyStart: '2026-05-25',
        earlyFinish: '2026-06-30',
        lateStart: '2026-05-25',
        lateFinish: '2026-06-30',
        totalFloat: 0,
        freeFloat: 0,
        isCritical: true,
        percentComplete: 40,
        plannedCost: 420000,
        actualCost: 180000,
        status: 'IN_PROGRESS',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: act4Id,
        activityNumber: 'ACT-2026-0004',
        projectId: 'PRJ-101',
        wbsId: wbs3Id,
        wpId: wp2Id,
        activityCode: 'A1040',
        name: 'Hydrostatic Pressure Testing (45 Bar)',
        description: '24-hour pressure holding test with calibrated digital loggers',
        durationDays: 10,
        plannedStartDate: '2026-07-01',
        plannedEndDate: '2026-07-12',
        earlyStart: '2026-07-01',
        earlyFinish: '2026-07-12',
        lateStart: '2026-07-05',
        lateFinish: '2026-07-16',
        totalFloat: 4,
        freeFloat: 4,
        isCritical: false,
        percentComplete: 0,
        plannedCost: 95000,
        actualCost: 0,
        status: 'NOT_STARTED',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Activity Precedences
    await db.insert(phase64ActivityRelationships).values([
      {
        id: uuidv4(),
        predecessorActivityId: act1Id,
        successorActivityId: act2Id,
        relationshipType: 'FS',
        lagDays: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        predecessorActivityId: act2Id,
        successorActivityId: act3Id,
        relationshipType: 'FS',
        lagDays: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        predecessorActivityId: act3Id,
        successorActivityId: act4Id,
        relationshipType: 'FS',
        lagDays: 1,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Baselines
    await db.insert(phase64ProjectBaselines).values([
      {
        id: 'bl-001',
        baselineNumber: 'BL-2026-0001',
        projectId: 'PRJ-101',
        baselineName: 'Approved Contract Master Schedule Baseline V1.0',
        approvedBy: 'Client Representative / Lead Project Director',
        approvedDate: '2026-01-15',
        version: 'V1.0',
        isCurrentActive: true,
        totalDurationDays: 210,
        totalPlannedCost: 5000000,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Calendars
    await db.insert(phase64ProjectCalendars).values([
      {
        id: 'cal-001',
        projectId: 'PRJ-101',
        calendarName: 'Standard Project 6-Day Site Working Calendar',
        workingDaysPerWeek: 6,
        workingHoursPerDay: 8,
        holidaysJson: JSON.stringify(['2026-01-01', '2026-05-01', '2026-12-25']),
        isDefault: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Resources
    const res1Id = 'res-001';
    const res2Id = 'res-002';
    await db.insert(phase64Resources).values([
      {
        id: res1Id,
        resourceCode: 'RES-2026-0001',
        name: 'Certified 6G Pipe Welder Team',
        type: 'LABOR',
        unitOfMeasure: 'MANHOURS',
        unitRate: 45,
        capacityPerDay: 48,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: res2Id,
        resourceCode: 'RES-2026-0002',
        name: '100-Ton Mobile Hydraulic Crane',
        type: 'EQUIPMENT',
        unitOfMeasure: 'HOURS',
        unitRate: 280,
        capacityPerDay: 10,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Resource Assignments
    await db.insert(phase64ResourceAssignments).values([
      {
        id: uuidv4(),
        activityId: act3Id,
        resourceId: res1Id,
        allocatedQuantity: 240,
        actualQuantity: 110,
        unitRate: 45,
        totalCost: 10800,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        activityId: act2Id,
        resourceId: res2Id,
        allocatedQuantity: 40,
        actualQuantity: 32,
        unitRate: 280,
        totalCost: 11200,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed EVM Core Progress Snapshots
    await db.insert(phase64ProjectProgress).values([
      {
        id: 'prg-001',
        projectId: 'PRJ-101',
        asOfDate: nowShort,
        plannedProgressPercent: 54.5,
        actualProgressPercent: 51.2,
        plannedValue: 2725000,
        earnedValue: 2560000,
        actualCost: 2480000,
        spi: 0.94,
        cpi: 1.03,
        scheduleVariance: -165000,
        costVariance: 80000,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Delays
    await db.insert(phase64ProjectDelays).values([
      {
        id: 'dly-001',
        delayNumber: 'DLY-2026-0001',
        projectId: 'PRJ-101',
        activityId: act3Id,
        delayCategory: 'SITE_ACCESS',
        description: 'Delayed civil foundation handover for Sector 4 pump pit manifold',
        delayDays: 4,
        impactOnCriticalPath: true,
        mitigationPlan: 'Deployed double shift welding team with high-capacity diesel generators',
        status: 'MITIGATED',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Milestones
    await db.insert(phase64ProjectMilestones).values([
      {
        id: 'ms-001',
        milestoneNumber: 'MS-2026-0001',
        projectId: 'PRJ-101',
        name: 'Completion of Detailed Design & ISO Approvals',
        targetDate: '2026-03-31',
        actualDate: '2026-03-28',
        paymentPercentage: 15,
        isKeyMilestone: true,
        status: 'ACHIEVED',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'ms-002',
        milestoneNumber: 'MS-2026-0002',
        projectId: 'PRJ-101',
        name: 'Pump Station Pipe Header Fit-Up & Initial Alignment',
        targetDate: '2026-05-30',
        actualDate: null,
        paymentPercentage: 25,
        isKeyMilestone: true,
        status: 'PENDING',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'ms-003',
        milestoneNumber: 'MS-2026-0003',
        projectId: 'PRJ-101',
        name: 'Successful 45-Bar Hydrotest Sign-Off',
        targetDate: '2026-07-20',
        actualDate: null,
        paymentPercentage: 30,
        isKeyMilestone: true,
        status: 'PENDING',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Risks
    await db.insert(phase64ProjectRisks).values([
      {
        id: 'rsk-001',
        riskNumber: 'RSK-2026-0001',
        projectId: 'PRJ-101',
        title: 'Monsoon Flooding in Filter Bed Excavation Area',
        category: 'SCHEDULE',
        probability: 4,
        impact: 4,
        riskScore: 16,
        mitigationStrategy: 'Install dual 75HP dewatering sump pumps and elevated gravel bunds',
        owner: 'Er. Abdul Vajid EK',
        status: 'OPEN',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Issues
    await db.insert(phase64ProjectIssues).values([
      {
        id: 'iss-001',
        issueNumber: 'ISS-2026-0001',
        projectId: 'PRJ-101',
        activityId: act3Id,
        title: 'Minor misalignment on 42-inch Sector 4 flange alignment',
        priority: 'HIGH',
        assignedTo: 'Senior QC Inspector',
        resolutionPlan: 'Use hydraulic flange puller and re-torque with calibrated torque wrench',
        status: 'IN_PROGRESS',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Lookahead Plans
    await db.insert(phase64LookaheadPlans).values([
      {
        id: 'lak-001',
        planNumber: 'LAK-2026-0001',
        projectId: 'PRJ-101',
        periodWeeks: 3,
        startDate: '2026-08-15',
        endDate: '2026-09-05',
        plannedActivitiesCount: 6,
        readinessStatus: 'READY',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Daily Progress
    await db.insert(phase64DailyProgress).values([
      {
        id: uuidv4(),
        projectId: 'PRJ-101',
        activityId: act3Id,
        reportDate: nowShort,
        workDoneQty: 18.5,
        unit: 'MTRS',
        manpowerCount: 14,
        equipmentHours: 10,
        remarks: 'Completed 3 root passes and 2 filler passes on Joint 14B',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Weekly Progress
    await db.insert(phase64WeeklyProgress).values([
      {
        id: uuidv4(),
        projectId: 'PRJ-101',
        weekNumber: 32,
        year: 2026,
        plannedPercent: 54.5,
        actualPercent: 51.2,
        weeklyRemarks: 'TIG welding speed improved following night shift illumination deployment',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Monthly Progress
    await db.insert(phase64MonthlyProgress).values([
      {
        id: uuidv4(),
        projectId: 'PRJ-101',
        month: 7,
        year: 2026,
        monthlyPlannedValue: 450000,
        monthlyEarnedValue: 420000,
        monthlyActualCost: 395000,
        status: 'APPROVED',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed Project Logs
    await db.insert(phase64ProjectLogs).values([
      {
        id: uuidv4(),
        projectId: 'PRJ-101',
        actionType: 'SCHEDULE_INITIALIZED',
        module: 'PROJECT_CONTROLS',
        performedBy: 'System Administrator',
        details: 'Baseline V1.0 imported with 4 critical path activities',
        createdAt: now,
        updatedAt: now,
      },
    ]);
  }

  // --- CRUD Methods ---

  // 1. WBS
  public async getWbsList(projectId: string | undefined) {
    await this.ensureProjectControlsTablesExist();
    projectId = this.resolveProjectId(projectId);
    return db.select().from(phase64ProjectsWbs).where(sql`project_id = ${projectId} AND is_deleted = false`);
  }

  public async createWbs(data: any) {
    await this.ensureProjectControlsTablesExist();
    const id = uuidv4();
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(phase64ProjectsWbs);
    const count = Number(countRes[0]?.count || 0) + 1;
    const wbsNumber = `WBS-2026-${String(count).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const record = {
      id,
      wbsNumber,
      projectId: data.projectId || 'PRJ-101',
      code: data.code,
      name: data.name,
      description: data.description || '',
      level: data.level || 1,
      parentId: data.parentId || null,
      budgetAmount: data.budgetAmount || 0,
      plannedStartDate: data.plannedStartDate || null,
      plannedEndDate: data.plannedEndDate || null,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
      deletedAt: null,
      isDeleted: false,
    };

    await db.insert(phase64ProjectsWbs).values(record);
    return record;
  }

  // 2. Work Packages
  public async getWorkPackages(wbsId?: string, projectId?: string) {
    await this.ensureProjectControlsTablesExist();
    projectId = this.resolveProjectId(projectId);
    if (wbsId) {
      return db.select().from(phase64WorkPackages).where(sql`wbs_id = ${wbsId} AND is_deleted = false`);
    }
    return db.select().from(phase64WorkPackages).where(sql`project_id = ${projectId} AND is_deleted = false`);
  }

  public async createWorkPackage(data: any) {
    await this.ensureProjectControlsTablesExist();
    const id = uuidv4();
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(phase64WorkPackages);
    const count = Number(countRes[0]?.count || 0) + 1;
    const wpNumber = `WP-2026-${String(count).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const record = {
      id,
      wpNumber,
      wbsId: data.wbsId,
      projectId: data.projectId || 'PRJ-101',
      code: data.code,
      name: data.name,
      deliverable: data.deliverable || '',
      responsiblePerson: data.responsiblePerson || 'Project Manager',
      estimatedCost: data.estimatedCost || 0,
      plannedStartDate: data.plannedStartDate || null,
      plannedEndDate: data.plannedEndDate || null,
      status: 'PLANNED',
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
      deletedAt: null,
      isDeleted: false,
    };

    await db.insert(phase64WorkPackages).values(record);
    return record;
  }

  // 3. Project Activities & CPM
  public async getActivities(projectId: string | undefined) {
    await this.ensureProjectControlsTablesExist();
    projectId = this.resolveProjectId(projectId);
    return db.select().from(phase64ProjectActivities).where(sql`project_id = ${projectId} AND is_deleted = false`);
  }

  public async createActivity(data: any) {
    await this.ensureProjectControlsTablesExist();
    const id = uuidv4();
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(phase64ProjectActivities);
    const count = Number(countRes[0]?.count || 0) + 1;
    const activityNumber = `ACT-2026-${String(count).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const record = {
      id,
      activityNumber,
      projectId: data.projectId || 'PRJ-101',
      wbsId: data.wbsId,
      wpId: data.wpId || null,
      activityCode: data.activityCode,
      name: data.name,
      description: data.description || '',
      durationDays: data.durationDays || 1,
      plannedStartDate: data.plannedStartDate,
      plannedEndDate: data.plannedEndDate,
      actualStartDate: null,
      actualEndDate: null,
      earlyStart: data.plannedStartDate,
      earlyFinish: data.plannedEndDate,
      lateStart: data.plannedStartDate,
      lateFinish: data.plannedEndDate,
      totalFloat: 0,
      freeFloat: 0,
      isCritical: true, // Default to critical path until CPM recache
      percentComplete: 0,
      plannedCost: data.plannedCost || 0,
      actualCost: 0,
      status: 'NOT_STARTED',
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
      deletedAt: null,
      isDeleted: false,
    };

    await db.insert(phase64ProjectActivities).values(record);
    return record;
  }

  // 4. Relationships
  public async getRelationships(projectId: string | undefined) {
    await this.ensureProjectControlsTablesExist();
    projectId = this.resolveProjectId(projectId);
    return db.select().from(phase64ActivityRelationships).where(sql`is_deleted = false`);
  }

  public async createRelationship(data: any) {
    await this.ensureProjectControlsTablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();

    const record = {
      id,
      predecessorActivityId: data.predecessorActivityId,
      successorActivityId: data.successorActivityId,
      relationshipType: data.relationshipType || 'FS',
      lagDays: data.lagDays || 0,
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
      deletedAt: null,
      isDeleted: false,
    };

    await db.insert(phase64ActivityRelationships).values(record);
    return record;
  }

  // 5. Baselines
  public async getBaselines(projectId: string | undefined) {
    await this.ensureProjectControlsTablesExist();
    projectId = this.resolveProjectId(projectId);
    return db.select().from(phase64ProjectBaselines).where(sql`project_id = ${projectId} AND is_deleted = false`);
  }

  public async createBaseline(data: any) {
    await this.ensureProjectControlsTablesExist();
    const id = uuidv4();
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(phase64ProjectBaselines);
    const count = Number(countRes[0]?.count || 0) + 1;
    const baselineNumber = `BL-2026-${String(count).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const record = {
      id,
      baselineNumber,
      projectId: data.projectId || 'PRJ-101',
      baselineName: data.baselineName,
      approvedBy: data.approvedBy || 'Project Director',
      approvedDate: data.approvedDate || now.split('T')[0],
      version: data.version || 'V1.0',
      isCurrentActive: true,
      totalDurationDays: data.totalDurationDays || 180,
      totalPlannedCost: data.totalPlannedCost || 5000000,
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
      deletedAt: null,
      isDeleted: false,
    };

    await db.insert(phase64ProjectBaselines).values(record);
    return record;
  }

  // 6. Calendars
  public async getCalendars(projectId: string | undefined) {
    await this.ensureProjectControlsTablesExist();
    projectId = this.resolveProjectId(projectId);
    return db.select().from(phase64ProjectCalendars).where(sql`project_id = ${projectId} AND is_deleted = false`);
  }

  public async createCalendar(data: any) {
    await this.ensureProjectControlsTablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();

    const record = {
      id,
      projectId: data.projectId || 'PRJ-101',
      calendarName: data.calendarName,
      workingDaysPerWeek: data.workingDaysPerWeek || 6,
      workingHoursPerDay: data.workingHoursPerDay || 8,
      holidaysJson: data.holidaysJson || '[]',
      isDefault: data.isDefault !== undefined ? data.isDefault : true,
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
      deletedAt: null,
      isDeleted: false,
    };

    await db.insert(phase64ProjectCalendars).values(record);
    return record;
  }

  // 7. Resources & Assignments
  public async getResources() {
    await this.ensureProjectControlsTablesExist();
    return db.select().from(phase64Resources).where(sql`is_deleted = false`);
  }

  public async createResource(data: any) {
    await this.ensureProjectControlsTablesExist();
    const id = uuidv4();
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(phase64Resources);
    const count = Number(countRes[0]?.count || 0) + 1;
    const resourceCode = `RES-2026-${String(count).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const record = {
      id,
      resourceCode,
      name: data.name,
      type: data.type || 'LABOR',
      unitOfMeasure: data.unitOfMeasure || 'HOURS',
      unitRate: data.unitRate || 0,
      capacityPerDay: data.capacityPerDay || 8,
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
      deletedAt: null,
      isDeleted: false,
    };

    await db.insert(phase64Resources).values(record);
    return record;
  }

  public async getResourceAssignments(activityId?: string) {
    await this.ensureProjectControlsTablesExist();
    if (activityId) {
      return db.select().from(phase64ResourceAssignments).where(sql`activity_id = ${activityId} AND is_deleted = false`);
    }
    return db.select().from(phase64ResourceAssignments).where(sql`is_deleted = false`);
  }

  public async assignResource(data: any) {
    await this.ensureProjectControlsTablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();
    const totalCost = (data.allocatedQuantity || 1) * (data.unitRate || 0);

    const record = {
      id,
      activityId: data.activityId,
      resourceId: data.resourceId,
      allocatedQuantity: data.allocatedQuantity || 1,
      actualQuantity: 0,
      unitRate: data.unitRate || 0,
      totalCost,
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
      deletedAt: null,
      isDeleted: false,
    };

    await db.insert(phase64ResourceAssignments).values(record);
    return record;
  }

  // 8. EVM Progress Snapshots
  public async getProgress(projectId: string | undefined) {
    await this.ensureProjectControlsTablesExist();
    projectId = this.resolveProjectId(projectId);
    return db.select().from(phase64ProjectProgress).where(sql`project_id = ${projectId} AND is_deleted = false`);
  }

  public async addProgressSnapshot(data: any) {
    await this.ensureProjectControlsTablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();

    const pv = data.plannedValue || 0;
    const ev = data.earnedValue || 0;
    const ac = data.actualCost || 0;

    const spi = pv > 0 ? Number((ev / pv).toFixed(2)) : 1.0;
    const cpi = ac > 0 ? Number((ev / ac).toFixed(2)) : 1.0;
    const scheduleVariance = ev - pv;
    const costVariance = ev - ac;

    const record = {
      id,
      projectId: data.projectId || 'PRJ-101',
      asOfDate: data.asOfDate,
      plannedProgressPercent: data.plannedProgressPercent || 0,
      actualProgressPercent: data.actualProgressPercent || 0,
      plannedValue: pv,
      earnedValue: ev,
      actualCost: ac,
      spi,
      cpi,
      scheduleVariance,
      costVariance,
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
      deletedAt: null,
      isDeleted: false,
    };

    await db.insert(phase64ProjectProgress).values(record);
    return record;
  }

  // 9. Delays & Constraints
  public async getDelays(projectId: string | undefined) {
    await this.ensureProjectControlsTablesExist();
    projectId = this.resolveProjectId(projectId);
    return db.select().from(phase64ProjectDelays).where(sql`project_id = ${projectId} AND is_deleted = false`);
  }

  public async createDelay(data: any) {
    await this.ensureProjectControlsTablesExist();
    const id = uuidv4();
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(phase64ProjectDelays);
    const count = Number(countRes[0]?.count || 0) + 1;
    const delayNumber = `DLY-2026-${String(count).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const record = {
      id,
      delayNumber,
      projectId: data.projectId || 'PRJ-101',
      activityId: data.activityId || null,
      delayCategory: data.delayCategory || 'CLIENT',
      description: data.description,
      delayDays: data.delayDays || 1,
      impactOnCriticalPath: data.impactOnCriticalPath || false,
      mitigationPlan: data.mitigationPlan || '',
      status: 'OPEN',
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
      deletedAt: null,
      isDeleted: false,
    };

    await db.insert(phase64ProjectDelays).values(record);
    return record;
  }

  // 10. Milestones
  public async getMilestones(projectId: string | undefined) {
    await this.ensureProjectControlsTablesExist();
    projectId = this.resolveProjectId(projectId);
    return db.select().from(phase64ProjectMilestones).where(sql`project_id = ${projectId} AND is_deleted = false`);
  }

  public async createMilestone(data: any) {
    await this.ensureProjectControlsTablesExist();
    const id = uuidv4();
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(phase64ProjectMilestones);
    const count = Number(countRes[0]?.count || 0) + 1;
    const milestoneNumber = `MS-2026-${String(count).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const record = {
      id,
      milestoneNumber,
      projectId: data.projectId || 'PRJ-101',
      name: data.name,
      targetDate: data.targetDate,
      actualDate: null,
      paymentPercentage: data.paymentPercentage || 0,
      isKeyMilestone: data.isKeyMilestone !== undefined ? data.isKeyMilestone : true,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
      deletedAt: null,
      isDeleted: false,
    };

    await db.insert(phase64ProjectMilestones).values(record);
    return record;
  }

  // 11. Risks & Issues
  public async getRisks(projectId: string | undefined) {
    await this.ensureProjectControlsTablesExist();
    projectId = this.resolveProjectId(projectId);
    return db.select().from(phase64ProjectRisks).where(sql`project_id = ${projectId} AND is_deleted = false`);
  }

  public async createRisk(data: any) {
    await this.ensureProjectControlsTablesExist();
    const id = uuidv4();
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(phase64ProjectRisks);
    const count = Number(countRes[0]?.count || 0) + 1;
    const riskNumber = `RSK-2026-${String(count).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const probability = data.probability || 3;
    const impact = data.impact || 3;
    const riskScore = probability * impact;

    const record = {
      id,
      riskNumber,
      projectId: data.projectId || 'PRJ-101',
      title: data.title,
      category: data.category || 'SCHEDULE',
      probability,
      impact,
      riskScore,
      mitigationStrategy: data.mitigationStrategy || '',
      owner: data.owner || 'Planning Manager',
      status: 'OPEN',
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
      deletedAt: null,
      isDeleted: false,
    };

    await db.insert(phase64ProjectRisks).values(record);
    return record;
  }

  public async getIssues(projectId: string | undefined) {
    await this.ensureProjectControlsTablesExist();
    projectId = this.resolveProjectId(projectId);
    return db.select().from(phase64ProjectIssues).where(sql`project_id = ${projectId} AND is_deleted = false`);
  }

  public async createIssue(data: any) {
    await this.ensureProjectControlsTablesExist();
    const id = uuidv4();
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(phase64ProjectIssues);
    const count = Number(countRes[0]?.count || 0) + 1;
    const issueNumber = `ISS-2026-${String(count).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const record = {
      id,
      issueNumber,
      projectId: data.projectId || 'PRJ-101',
      activityId: data.activityId || null,
      title: data.title,
      priority: data.priority || 'MEDIUM',
      assignedTo: data.assignedTo || 'Site Engineer',
      resolutionPlan: data.resolutionPlan || '',
      status: 'OPEN',
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
      deletedAt: null,
      isDeleted: false,
    };

    await db.insert(phase64ProjectIssues).values(record);
    return record;
  }

  // 12. Change Requests
  public async getChangeRequests(projectId: string | undefined) {
    await this.ensureProjectControlsTablesExist();
    projectId = this.resolveProjectId(projectId);
    return db.select().from(phase64ChangeRequests).where(sql`project_id = ${projectId} AND is_deleted = false`);
  }

  public async createChangeRequest(data: any) {
    await this.ensureProjectControlsTablesExist();
    const id = uuidv4();
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(phase64ChangeRequests);
    const count = Number(countRes[0]?.count || 0) + 1;
    const crNumber = `CR-2026-${String(count).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const record = {
      id,
      crNumber,
      projectId: data.projectId || 'PRJ-101',
      title: data.title,
      reason: data.reason,
      timeExtensionDays: data.timeExtensionDays || 0,
      costImpact: data.costImpact || 0,
      approvalStatus: 'SUBMITTED',
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
      deletedAt: null,
      isDeleted: false,
    };

    await db.insert(phase64ChangeRequests).values(record);
    return record;
  }

  // 13. Lookahead Plans
  public async getLookaheadPlans(projectId: string | undefined) {
    await this.ensureProjectControlsTablesExist();
    projectId = this.resolveProjectId(projectId);
    return db.select().from(phase64LookaheadPlans).where(sql`project_id = ${projectId} AND is_deleted = false`);
  }

  public async createLookaheadPlan(data: any) {
    await this.ensureProjectControlsTablesExist();
    const id = uuidv4();
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(phase64LookaheadPlans);
    const count = Number(countRes[0]?.count || 0) + 1;
    const planNumber = `LAK-2026-${String(count).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const record = {
      id,
      planNumber,
      projectId: data.projectId || 'PRJ-101',
      periodWeeks: data.periodWeeks || 3,
      startDate: data.startDate,
      endDate: data.endDate,
      plannedActivitiesCount: data.plannedActivitiesCount || 0,
      readinessStatus: data.readinessStatus || 'READY',
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
      deletedAt: null,
      isDeleted: false,
    };

    await db.insert(phase64LookaheadPlans).values(record);
    return record;
  }

  // 14. Daily, Weekly, Monthly Progress Records
  public async getDailyProgress(projectId: string | undefined) {
    await this.ensureProjectControlsTablesExist();
    projectId = this.resolveProjectId(projectId);
    return db.select().from(phase64DailyProgress).where(sql`project_id = ${projectId} AND is_deleted = false`);
  }

  public async createDailyProgress(data: any) {
    await this.ensureProjectControlsTablesExist();
    const id = uuidv4();
    const now = new Date().toISOString();

    const record = {
      id,
      projectId: data.projectId || 'PRJ-101',
      activityId: data.activityId,
      reportDate: data.reportDate,
      workDoneQty: data.workDoneQty || 0,
      unit: data.unit || 'MTRS',
      manpowerCount: data.manpowerCount || 0,
      equipmentHours: data.equipmentHours || 0,
      remarks: data.remarks || '',
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
      deletedAt: null,
      isDeleted: false,
    };

    await db.insert(phase64DailyProgress).values(record);
    return record;
  }

  public async getWeeklyProgress(projectId: string | undefined) {
    await this.ensureProjectControlsTablesExist();
    projectId = this.resolveProjectId(projectId);
    return db.select().from(phase64WeeklyProgress).where(sql`project_id = ${projectId} AND is_deleted = false`);
  }

  public async getMonthlyProgress(projectId: string | undefined) {
    await this.ensureProjectControlsTablesExist();
    projectId = this.resolveProjectId(projectId);
    return db.select().from(phase64MonthlyProgress).where(sql`project_id = ${projectId} AND is_deleted = false`);
  }

  // 15. Stats / Dashboard KPIs
  public async getStats(projectId: string | undefined) {
    await this.ensureProjectControlsTablesExist();
    projectId = this.resolveProjectId(projectId);

    const wbsCount = await db.select({ count: sql<number>`count(*)` }).from(phase64ProjectsWbs).where(sql`project_id = ${projectId} AND is_deleted = false`);
    const actCount = await db.select({ count: sql<number>`count(*)` }).from(phase64ProjectActivities).where(sql`project_id = ${projectId} AND is_deleted = false`);
    const criticalCount = await db.select({ count: sql<number>`count(*)` }).from(phase64ProjectActivities).where(sql`project_id = ${projectId} AND is_critical = true AND is_deleted = false`);
    const msCount = await db.select({ count: sql<number>`count(*)` }).from(phase64ProjectMilestones).where(sql`project_id = ${projectId} AND is_deleted = false`);
    const msAchieved = await db.select({ count: sql<number>`count(*)` }).from(phase64ProjectMilestones).where(sql`project_id = ${projectId} AND status = 'ACHIEVED' AND is_deleted = false`);
    const delayCount = await db.select({ count: sql<number>`count(*)` }).from(phase64ProjectDelays).where(sql`project_id = ${projectId} AND is_deleted = false`);
    const openRisks = await db.select({ count: sql<number>`count(*)` }).from(phase64ProjectRisks).where(sql`project_id = ${projectId} AND status = 'OPEN' AND is_deleted = false`);
    const openIssues = await db.select({ count: sql<number>`count(*)` }).from(phase64ProjectIssues).where(sql`project_id = ${projectId} AND status = 'OPEN' AND is_deleted = false`);

    const latestProgress = await db
      .select()
      .from(phase64ProjectProgress)
      .where(sql`project_id = ${projectId} AND is_deleted = false`)
      .orderBy(sql`created_at DESC`)
      .limit(1);

    const prg = latestProgress[0] || {
      plannedProgressPercent: 54.5,
      actualProgressPercent: 51.2,
      spi: 0.94,
      cpi: 1.03,
      plannedValue: 2725000,
      earnedValue: 2560000,
      actualCost: 2480000,
      scheduleVariance: -165000,
      costVariance: 80000,
    };

    return {
      totalWbs: Number(wbsCount[0]?.count || 0),
      totalActivities: Number(actCount[0]?.count || 0),
      criticalActivities: Number(criticalCount[0]?.count || 0),
      totalMilestones: Number(msCount[0]?.count || 0),
      achievedMilestones: Number(msAchieved[0]?.count || 0),
      totalDelays: Number(delayCount[0]?.count || 0),
      openRisks: Number(openRisks[0]?.count || 0),
      openIssues: Number(openIssues[0]?.count || 0),
      plannedProgressPercent: prg.plannedProgressPercent,
      actualProgressPercent: prg.actualProgressPercent,
      spi: prg.spi,
      cpi: prg.cpi,
      plannedValue: prg.plannedValue,
      earnedValue: prg.earnedValue,
      actualCost: prg.actualCost,
      scheduleVariance: prg.scheduleVariance,
      costVariance: prg.costVariance,
    };
  }

  // 21. Multi-Dimensional Project Cost Control Matrix (Budget vs Committed vs Actual vs Certified vs Revenue vs Forecast)
  public async getCostControlMatrix(projectId?: string) {
    await this.ensureProjectControlsTablesExist();

    const resolvedProjectId = String(projectId || '').trim();
    if (!resolvedProjectId) throw new Error('Project ID is required for cost control reporting.');

    const [project] = await db.select().from(projects).where(eq(projects.id, resolvedProjectId)).limit(1);
    if (!project) throw new Error('Project not found.');

    // WBS budget is sourced from the project-controls WBS master only; never invent a fallback budget.
    const wbsRows = await this.getWbsList(resolvedProjectId);
    const activities = await this.getActivities(resolvedProjectId);
    const boqRows = await db.select().from(boqItems).where(eq(boqItems.projectId, resolvedProjectId));

    // Actual material cost from issued quantities.
    const issueRows = await db.select().from(materialIssues).where(eq(materialIssues.projectId, resolvedProjectId));
    const issueIds = issueRows.map((row) => row.id);
    let realMaterialsCost = 0;
    if (issueIds.length > 0) {
      const issueItems = await db.select().from(materialIssueItems).where(inArray(materialIssueItems.issueId, issueIds));
      realMaterialsCost = issueItems.reduce((sum, item) => sum + Number(item.issuedQty || 0) * Number(item.unitPrice || 0), 0);
    }

    const poRows = await db.select().from(phase69PurchaseOrders).where(eq(phase69PurchaseOrders.projectId, resolvedProjectId));
    const realPOCommitments = poRows.filter((row) => row.status !== 'CANCELLED').reduce((sum, row) => sum + Number(row.totalAmount || 0), 0);

    const subcontractRows = await commercialRepository.getSubcontracts();
    const projectSubcontracts = subcontractRows.filter((row: any) => row.projectId === resolvedProjectId);
    const realSubcontractCommitments = projectSubcontracts.reduce((sum: number, row: any) => sum + Number(row.contractValue || 0), 0);
    const subcontractBills = await commercialRepository.getSubcontractBills();
    const projectSubcontractBills = subcontractBills.filter((bill: any) => projectSubcontracts.some((sub: any) => sub.id === bill.subcontractId));
    const realSubcontractCertified = projectSubcontractBills.reduce((sum: number, bill: any) => sum + Number(bill.certifiedAmount || 0), 0);
    const realSubcontractActual = projectSubcontractBills.filter((bill: any) => ['PAID', 'CERTIFIED'].includes(bill.status)).reduce((sum: number, bill: any) => sum + Number(bill.certifiedAmount || 0), 0);

    const claims = await employeeExpenseRepository.getExpenseClaims({ projectId: resolvedProjectId });
    const realEmployeeExpenses = claims.filter((claim: any) => ['APPROVED_FOR_PAYMENT', 'PAID', 'FINANCE_VERIFIED'].includes(claim.status)).reduce((sum: number, claim: any) => sum + Number(claim.amount || 0), 0);

    const vouchers = await employeeExpenseRepository.getPettyCashVouchers();
    const realPettyCashExpenses = vouchers.filter((voucher: any) => ['POSTED', 'DISBURSED'].includes(voucher.status) && voucher.projectId === resolvedProjectId).reduce((sum: number, voucher: any) => sum + Number(voucher.totalAmount || 0), 0);

    const fuelRows = await db.select().from(fleetFuelLogs).where(eq(fleetFuelLogs.projectId, resolvedProjectId));
    const realFleetFuelCost = fuelRows.reduce((sum, row: any) => sum + Number(row.totalCost || 0), 0);

    const ipcs = await commercialRepository.getClientIPCs(resolvedProjectId);
    const realBilledRevenue = ipcs.filter((ipc: any) => ['CERTIFIED', 'PAID'].includes(ipc.status)).reduce((sum: number, ipc: any) => sum + Number(ipc.grossWorkDoneCertified || 0), 0);

    // Project-level actual cost from real operational postings. This is intentionally kept
    // separate from WBS actuals when source records do not carry a WBS ID, avoiding false allocation.
    const projectActualCost = realMaterialsCost + realSubcontractActual + realEmployeeExpenses + realPettyCashExpenses + realFleetFuelCost;
    const projectCommittedCost = realPOCommitments + realSubcontractCommitments;

    // Build a real source-document ledger for management drill-down.
    // No synthetic transactions are created here; every row originates from a persisted operational record.
    const transactions: any[] = [];

    for (const po of poRows as any[]) {
      if (String(po.status || '').toUpperCase() === 'CANCELLED') continue;
      const amount = Number(po.totalAmount || 0);
      if (amount <= 0) continue;
      transactions.push({
        id: `TX-PO-${po.id}`, type: 'COMMITTED', category: 'PURCHASE_ORDER', categoryLabel: 'Purchase Order',
        sourceDocType: 'PURCHASE_ORDER', sourceDocNumber: po.poNumber, sourceDocId: po.id, date: po.poDate || po.createdAt?.slice(0, 10) || '',
        description: `PO for ${po.vendorName}`, vendorOrPayee: po.vendorName, amount, originalAmount: amount,
        currency: po.currency || project.currency || '', originalCurrency: po.currency || project.currency || '', status: po.status || '',
        authorizedBy: po.approvedBy || po.createdBy || 'SYSTEM_SOURCE',
      });
    }

    for (const issue of issueRows as any[]) {
      const rows = (await db.select().from(materialIssueItems).where(eq(materialIssueItems.issueId, issue.id))) as any[];
      const amount = rows.reduce((sum, item) => sum + Number(item.issuedQty || 0) * Number(item.unitPrice || 0), 0);
      if (amount <= 0) continue;
      transactions.push({
        id: `TX-ISS-${issue.id}`, type: 'ACTUAL', category: 'DIRECT_MATERIAL', categoryLabel: 'Material Issue',
        sourceDocType: 'MATERIAL_ISSUE', sourceDocNumber: issue.issueNumber, sourceDocId: issue.id, date: issue.issueDate || issue.createdAt?.slice(0, 10) || '',
        description: rows.map((item) => item.materialName || item.description).filter(Boolean).join(', ') || 'Material issue',
        vendorOrPayee: issue.issuedTo || issue.warehouseName || 'Site', amount, originalAmount: amount,
        currency: project.currency || '', originalCurrency: project.currency || '', status: issue.status || '', authorizedBy: issue.issuedBy || 'SYSTEM_SOURCE',
      });
    }

    for (const subcontract of projectSubcontracts as any[]) {
      const amount = Number(subcontract.contractValue || 0);
      if (amount <= 0) continue;
      transactions.push({
        id: `TX-SUB-${subcontract.id}`, type: 'COMMITTED', category: 'SUBCONTRACT', categoryLabel: 'Subcontract Agreement',
        sourceDocType: 'WORK_ORDER', sourceDocNumber: subcontract.agreementNumber, sourceDocId: subcontract.id,
        date: subcontract.startDate || subcontract.createdAt?.slice(0, 10) || '', description: subcontract.packageTitle,
        vendorOrPayee: subcontract.subcontractorName, amount, originalAmount: amount, currency: subcontract.currency || project.currency || '',
        originalCurrency: subcontract.currency || project.currency || '', status: subcontract.status || '', authorizedBy: subcontract.createdBy || 'SYSTEM_SOURCE',
      });
    }

    for (const bill of projectSubcontractBills as any[]) {
      const amount = Number(bill.certifiedAmount || 0);
      if (amount <= 0 || !['CERTIFIED', 'PAID'].includes(String(bill.status || '').toUpperCase())) continue;
      transactions.push({
        id: `TX-SUBBILL-${bill.id}`, type: 'ACTUAL', category: 'SUBCONTRACT_BILL', categoryLabel: 'Subcontract Bill',
        sourceDocType: 'SUBCONTRACT_BILL', sourceDocNumber: bill.billNumber, sourceDocId: bill.id, date: bill.submissionDate || bill.createdAt?.slice(0, 10) || '',
        description: `Certified subcontract bill ${bill.billNumber}`, vendorOrPayee: bill.subcontractorName, amount, originalAmount: amount,
        currency: bill.currency || project.currency || '', originalCurrency: bill.currency || project.currency || '', status: bill.status || '', authorizedBy: bill.certifiedBy || 'SYSTEM_SOURCE',
      });
    }

    for (const claim of claims as any[]) {
      if (!['APPROVED_FOR_PAYMENT', 'PAID', 'FINANCE_VERIFIED'].includes(claim.status) || Number(claim.amount || 0) <= 0) continue;
      const amount = Number(claim.amount);
      transactions.push({
        id: `TX-EXP-${claim.id}`, type: 'ACTUAL', category: 'EMPLOYEE_EXPENSE', categoryLabel: 'Employee Expense',
        sourceDocType: 'EMPLOYEE_EXPENSE', sourceDocNumber: claim.claimNumber || claim.id, sourceDocId: claim.id, date: claim.expenseDate || claim.createdAt?.slice(0, 10) || '',
        description: claim.description || 'Employee expense', vendorOrPayee: claim.employeeName || claim.employeeId, amount, originalAmount: amount,
        currency: claim.currency || project.currency || '', originalCurrency: claim.currency || project.currency || '', status: claim.status || '', authorizedBy: claim.approvedBy?.name || claim.financeVerification?.verifiedBy || 'SYSTEM_SOURCE',
      });
    }

    for (const voucher of vouchers as any[]) {
      if (!['POSTED', 'DISBURSED'].includes(voucher.status) || Number(voucher.totalAmount || 0) <= 0) continue;
      const amount = Number(voucher.totalAmount);
      transactions.push({
        id: `TX-PC-${voucher.id}`, type: 'ACTUAL', category: 'PETTY_CASH', categoryLabel: 'Project Petty Cash',
        sourceDocType: 'CASH_VOUCHER', sourceDocNumber: voucher.voucherNumber || voucher.id, sourceDocId: voucher.id, date: voucher.voucherDate || voucher.createdAt?.slice(0, 10) || '',
        description: voucher.description || 'Project petty cash', vendorOrPayee: voucher.payeeName || voucher.requestedByName || 'Project Cash', amount, originalAmount: amount,
        currency: voucher.currency || project.currency || '', originalCurrency: voucher.currency || project.currency || '', status: voucher.status || '', authorizedBy: voucher.approvedByName || voucher.auditedByName || 'SYSTEM_SOURCE',
      });
    }

    for (const fuel of fuelRows as any[]) {
      const amount = Number(fuel.totalCost || 0);
      if (amount <= 0) continue;
      transactions.push({
        id: `TX-FUEL-${fuel.id}`, type: 'ACTUAL', category: 'EQUIPMENT_FUEL', categoryLabel: 'Equipment & Fuel',
        sourceDocType: 'FUEL_LOG', sourceDocNumber: fuel.fuelLogCode || fuel.id, sourceDocId: fuel.id, date: fuel.createdAt?.slice(0, 10) || '',
        description: `Fuel for ${fuel.assetName || fuel.assetCode || 'equipment'}`, vendorOrPayee: fuel.fuelStation || 'Site Fuel', amount, originalAmount: amount,
        currency: fuel.currency || project.currency || '', originalCurrency: fuel.currency || project.currency || '', status: 'LOGGED', authorizedBy: fuel.createdBy || 'SYSTEM_SOURCE',
      });
    }

    for (const ipc of ipcs as any[]) {
      if (!['CERTIFIED', 'PAID'].includes(String(ipc.status || '').toUpperCase()) || Number(ipc.grossWorkDoneCertified || 0) <= 0) continue;
      const amount = Number(ipc.grossWorkDoneCertified);
      transactions.push({
        id: `TX-IPC-${ipc.id}`, type: 'ACTUAL', category: 'CLIENT_IPC', categoryLabel: 'Client IPC Revenue',
        sourceDocType: 'CLIENT_IPC', sourceDocNumber: ipc.ipcNumber, sourceDocId: ipc.id, date: ipc.certificationDate || ipc.submissionDate || ipc.createdAt?.slice(0, 10) || '',
        description: `Certified client IPC ${ipc.ipcNumber}`, vendorOrPayee: project.clientName || project.customerName || 'Client', amount, originalAmount: amount,
        currency: ipc.currency || project.currency || '', originalCurrency: ipc.currency || project.currency || '', status: ipc.status || '', authorizedBy: ipc.certifiedBy || 'SYSTEM_SOURCE',
      });
    }

    transactions.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    const now = new Date();
    const elapsedDays = Math.max(1, Math.ceil((now.getTime() - new Date(project.startDate).getTime()) / 86400000));
    const burnRate = projectActualCost / elapsedDays;

    const activityByWbs = new Map<string, any[]>();
    for (const activity of activities as any[]) {
      const list = activityByWbs.get(activity.wbsId) || [];
      list.push(activity);
      activityByWbs.set(activity.wbsId, list);
    }

    const boqByWbs = new Map<string, any[]>();
    for (const item of boqRows as any[]) {
      const list = boqByWbs.get(item.wbsId) || [];
      list.push(item);
      boqByWbs.set(item.wbsId, list);
    }

    const items = (wbsRows as any[]).map((wbs: any) => {
      const wbsActivities = activityByWbs.get(wbs.id) || [];
      const wbsBoq = boqByWbs.get(wbs.id) || [];
      const budgetFromWbs = Number(wbs.budgetAmount || 0);
      const budgetFromBoq = wbsBoq.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
      const budget = budgetFromWbs > 0 ? budgetFromWbs : budgetFromBoq;

      const plannedActivityCost = wbsActivities.reduce((sum: number, activity: any) => sum + Number(activity.plannedCost || 0), 0);
      const actualActivityCost = wbsActivities.reduce((sum: number, activity: any) => sum + Number(activity.actualCost || 0), 0);
      const weightedProgress = plannedActivityCost > 0
        ? wbsActivities.reduce((sum: number, activity: any) => sum + Number(activity.plannedCost || 0) * Number(activity.percentComplete || 0), 0) / plannedActivityCost
        : wbsBoq.reduce((sum: number, item: any) => sum + Number(item.quantity || 0) * Number(item.rate || 0) * (Number(item.executedQty || 0) / Math.max(1, Number(item.quantity || 0))), 0) / Math.max(1, budgetFromBoq) * 100;

      const progressPercent = Math.max(0, Math.min(100, Number(weightedProgress || 0)));
      const earnedValue = budget > 0 ? budget * progressPercent / 100 : 0;

      let plannedPercent = 0;
      if (wbsActivities.length > 0) {
        const plannedStartDates = wbsActivities.map((a: any) => a.plannedStartDate).filter(Boolean).map((d: string) => new Date(d));
        const plannedEndDates = wbsActivities.map((a: any) => a.plannedEndDate).filter(Boolean).map((d: string) => new Date(d));
        const startDate = plannedStartDates.length ? new Date(Math.min(...plannedStartDates.map((d) => d.getTime()))) : null;
        const endDate = plannedEndDates.length ? new Date(Math.max(...plannedEndDates.map((d) => d.getTime()))) : null;
        if (startDate && endDate && endDate > startDate) {
          plannedPercent = Math.max(0, Math.min(100, ((now.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100));
        }
      }
      const plannedValue = budget * plannedPercent / 100;

      // Only WBS-tagged activity actuals are shown here. Project-level transactions without WBS tags
      // remain in the transparent unallocated project-cost figure below.
      const actualCost = actualActivityCost;
      const costVariance = earnedValue - actualCost;
      const scheduleVariance = earnedValue - plannedValue;
      const cpi = actualCost > 0 ? Number((earnedValue / actualCost).toFixed(2)) : null;
      const spi = plannedValue > 0 ? Number((earnedValue / plannedValue).toFixed(2)) : null;
      const estimateAtCompletion = cpi && cpi > 0 ? budget / cpi : budget;
      const costToComplete = Math.max(0, estimateAtCompletion - actualCost);
      const varianceAtCompletion = budget - estimateAtCompletion;

      return {
        id: wbs.id, wbsNumber: wbs.wbsNumber, wbsCode: wbs.code, name: wbs.name, projectId: resolvedProjectId,
        progressPercent, budget, committedCost: 0, actualCost, certifiedCost: 0, billedRevenue: 0,
        earnedValue, plannedValue, costVariance, scheduleVariance, costToComplete, estimateAtCompletion, varianceAtCompletion,
        cpi, spi, costStatus: cpi === null ? 'NO_ACTUAL_COST' : cpi >= 1 ? 'UNDER_BUDGET' : 'COST_PRESSURE',
        actualCostAllocationStatus: actualActivityCost > 0 ? 'WBS_ALLOCATED' : 'PROJECT_LEVEL_UNALLOCATED',
        plannedCostSource: plannedActivityCost > 0 ? 'ACTIVITY_PLAN' : 'BOQ_TIME_PHASING_UNAVAILABLE',
      };
    });

    const wbsBudgetTotal = items.reduce((sum: number, item: any) => sum + item.budget, 0);
    const totalBudget = wbsBudgetTotal > 0 ? wbsBudgetTotal : Number(project.budget || 0);
    const totalActualWbs = items.reduce((sum: number, item: any) => sum + item.actualCost, 0);
    const totalEarnedValue = items.reduce((sum: number, item: any) => sum + item.earnedValue, 0);
    const totalPlannedValue = items.reduce((sum: number, item: any) => sum + item.plannedValue, 0);
    const overallCPI = projectActualCost > 0 ? Number((totalEarnedValue / projectActualCost).toFixed(2)) : null;
    const totalEAC = overallCPI && overallCPI > 0 ? projectActualCost + Math.max(0, totalBudget - totalEarnedValue) / overallCPI : totalBudget;
    const totalCTC = Math.max(0, totalEAC - projectActualCost);

    return {
      projectId: resolvedProjectId,
      project: {
        id: project.id,
        projectCode: project.projectCode,
        projectName: project.projectName,
        clientName: project.clientName || project.customerName || '',
        consultantName: project.consultantName || '',
        location: project.location,
        contractValue: Number(project.contractValue || 0),
        budget: Number(project.budget || 0),
        currency: project.currency || '',
        status: project.status,
        progressPercentage: Number(project.progressPercentage || 0),
        startDate: project.startDate,
        targetCompletionDate: project.targetCompletionDate,
      },
      summary: {
        totalBudget,
        totalCommitted: projectCommittedCost,
        totalActual: projectActualCost,
        totalCertified: realSubcontractCertified,
        totalRevenue: realBilledRevenue,
        totalEarnedValue,
        totalPlannedValue,
        totalWbsAllocatedActualCost: totalActualWbs,
        unallocatedProjectActualCost: Math.max(0, projectActualCost - totalActualWbs),
        totalCostVariance: totalEarnedValue - projectActualCost,
        totalEAC,
        totalCTC,
        totalVarianceAtCompletion: totalBudget - totalEAC,
        overallCPI,
        overallSPI: totalPlannedValue > 0 ? Number((totalEarnedValue / totalPlannedValue).toFixed(2)) : null,
        committedPercentage: totalBudget > 0 ? Math.round((projectCommittedCost / totalBudget) * 100) : 0,
        actualPercentage: totalBudget > 0 ? Math.round((projectActualCost / totalBudget) * 100) : 0,
        burnRatePerElapsedDay: Number(burnRate.toFixed(2)),
        realTimeMargin: realBilledRevenue - projectActualCost,
        realTimeMarginPercent: realBilledRevenue > 0 ? Number((((realBilledRevenue - projectActualCost) / realBilledRevenue) * 100).toFixed(1)) : 0,
        costBreakdown: { realMaterialsCost, realPOCommitments, realSubcontractCommitments, realSubcontractCertified, realSubcontractActual, realEmployeeExpenses, realPettyCashExpenses, realFleetFuelCost, realBilledRevenue }, 
        transactionCount: transactions.length,
      },
      wbsBreakdown: items,
      transactions,
    };
  }
}

export const projectControlsRepository = new ProjectControlsRepository();
