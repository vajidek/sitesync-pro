import { db } from '../../db';
import {
  orgUnits,
  departments,
  projectDepartments,
  projectWorkPackages,
  moduleAssignments,
  employees,
  projects,
  businessUnits,
  regions,
  divisions,
  employeeGrades,
  employmentTypes,
  skills,
  trades,
  disciplines,
  projectCategories,
  projectTypes,
  contractTypes,
  costCenters,
  profitCenters,
  reportingLevels,
  designations,
  companies,
  branches,
  auditLogs,
} from '../../db/schema';
import { eq, and, desc, asc, inArray } from 'drizzle-orm';
import { paginateArray, PaginationParams } from '../utils/pagination';

export interface DbDivision {
  id: string;
  code: string;
  name: string;
  branchId?: string;
  regionId?: string;
  headEmployeeId?: string;
  headEmployeeName?: string;
  description?: string;
  displayOrder?: number;
  isActive: boolean;
  departmentCount?: number;
  activeDepartmentCount?: number;
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DbDepartment {
  id: string;
  code: string;
  name: string;
  branchId?: string;
  parentId?: string;
  divisionId?: string;
  divisionName?: string;
  divisionCode?: string;
  type: string;
  headEmployeeId?: string;
  headEmployeeName?: string;
  color?: string;
  icon?: string;
  displayOrder: number;
  description?: string;
  isActive: boolean;
  employeeCount?: number;
  projectCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DbOrgUnit {
  id: string;
  unitCode: string;
  name: string;
  unitType: 'COMPANY' | 'BUSINESS_UNIT' | 'REGION' | 'BRANCH' | 'DIVISION' | 'DEPARTMENT' | 'SUB_DEPARTMENT' | 'TEAM';
  parentId?: string;
  companyId?: string;
  branchId?: string;
  divisionId?: string;
  headEmployeeId?: string;
  headEmployeeName?: string;
  color?: string;
  icon?: string;
  displayOrder: number;
  hierarchyLevel?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbProjectDepartment {
  id: string;
  projectId: string;
  departmentId: string;
  departmentName?: string;
  role: 'LEAD' | 'SUPPORT' | 'SUBCONTRACT';
  allocatedBudget: number;
  discipline?: string;
  status: string;
  createdAt: string;
}

export interface DbProjectWorkPackage {
  id: string;
  projectId: string;
  packageCode: string;
  title: string;
  departmentId?: string;
  discipline?: string;
  assignedTeamId?: string;
  leadEmployeeId?: string;
  leadEmployeeName?: string;
  budget: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbModuleAssignment {
  id: string;
  moduleCode: string;
  targetType: 'COMPANY' | 'BRANCH' | 'DEPARTMENT' | 'PROJECT' | 'ROLE' | 'USER';
  targetId: string;
  isEnabled: boolean;
  configJson?: any;
  createdAt: string;
  updatedAt: string;
}

let isOrgSeeded = false;

export async function ensureOrgSeeded() {
  if (isOrgSeeded) return;

  try {
    const existing = await db.select().from(orgUnits);
    if (existing.length === 0) {
      const now = new Date().toISOString();
      const defaultOrgUnits = [
        {
          id: 'unit-comp-01',
          unitCode: 'CMP-01',
          name: 'SiteSync Infrastructure Group',
          unitType: 'COMPANY',
          color: '#1e3a8a',
          icon: 'Building',
          displayOrder: 1,
          hierarchyLevel: 1,
          description: 'Global infrastructure corporate parent entity',
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'unit-bu-01',
          unitCode: 'BU-CIVIL-INFRA',
          name: 'Civil & Heavy Infrastructure Business Unit',
          unitType: 'BUSINESS_UNIT',
          parentId: 'unit-comp-01',
          companyId: 'unit-comp-01',
          color: '#0f766e',
          icon: 'Briefcase',
          displayOrder: 2,
          hierarchyLevel: 2,
          description: 'Roads, bridges, water treatment plants, dams & pipelines',
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'unit-bu-02',
          unitCode: 'BU-MECH-ELEC',
          name: 'Mechanical & Electrical Projects Business Unit',
          unitType: 'BUSINESS_UNIT',
          parentId: 'unit-comp-01',
          companyId: 'unit-comp-01',
          color: '#d97706',
          icon: 'Wrench',
          displayOrder: 3,
          hierarchyLevel: 2,
          description: 'Pumping stations, SCADA, industrial plant fabrication & MEP',
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'unit-reg-01',
          unitCode: 'REG-GCC-WEST',
          name: 'GCC Western Region',
          unitType: 'REGION',
          parentId: 'unit-bu-01',
          companyId: 'unit-comp-01',
          color: '#2563eb',
          icon: 'MapPin',
          displayOrder: 4,
          hierarchyLevel: 3,
          description: 'UAE, Oman & Qatar regional execution projects',
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'unit-brn-01',
          unitCode: 'BRN-AUH',
          name: 'Abu Dhabi Main Branch',
          unitType: 'BRANCH',
          parentId: 'unit-reg-01',
          companyId: 'unit-comp-01',
          color: '#0284c7',
          icon: 'Building2',
          displayOrder: 5,
          hierarchyLevel: 4,
          description: 'Headquarters for municipal water, roads & building contracts',
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'unit-div-eng',
          unitCode: 'DIV-ENG',
          name: 'Engineering & EPC Division',
          unitType: 'DIVISION',
          parentId: 'unit-brn-01',
          companyId: 'unit-comp-01',
          branchId: 'unit-brn-01',
          color: '#0d9488',
          icon: 'Layers',
          displayOrder: 6,
          hierarchyLevel: 5,
          description: 'Division overseeing detail engineering, design & project management',
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'unit-dep-civil',
          unitCode: 'DEP-CIVIL',
          name: 'Civil & Structural Engineering',
          unitType: 'DEPARTMENT',
          parentId: 'unit-div-eng',
          companyId: 'unit-comp-01',
          branchId: 'unit-brn-01',
          divisionId: 'unit-div-eng',
          color: '#059669',
          icon: 'HardHat',
          displayOrder: 7,
          hierarchyLevel: 6,
          description: 'Earthworks, concrete structures, buildings & reservoirs',
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'unit-dep-mech',
          unitCode: 'DEP-MECH',
          name: 'Mechanical & Piping Engineering',
          unitType: 'DEPARTMENT',
          parentId: 'unit-div-eng',
          companyId: 'unit-comp-01',
          branchId: 'unit-brn-01',
          divisionId: 'unit-div-eng',
          color: '#ea580c',
          icon: 'Wrench',
          displayOrder: 8,
          hierarchyLevel: 6,
          description: 'Process equipment, pumps, valves, piping & plant fabrication',
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'unit-dep-elec',
          unitCode: 'DEP-ELEC',
          name: 'Electrical, Instrumentation & SCADA',
          unitType: 'DEPARTMENT',
          parentId: 'unit-div-eng',
          companyId: 'unit-comp-01',
          branchId: 'unit-brn-01',
          divisionId: 'unit-div-eng',
          color: '#7c3aed',
          icon: 'Zap',
          displayOrder: 9,
          hierarchyLevel: 6,
          description: 'HT/LT panels, sub-stations, PLC controllers & SCADA networks',
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'unit-sub-pipe',
          unitCode: 'SUB-PIPE-FAB',
          name: 'Piping Fabrication & Hydro-Testing',
          unitType: 'SUB_DEPARTMENT',
          parentId: 'unit-dep-mech',
          color: '#c2410c',
          icon: 'Pipette',
          displayOrder: 10,
          hierarchyLevel: 7,
          description: 'High-pressure trunk main welding, spool fabrication & hydro-testing',
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'unit-sub-struct',
          unitCode: 'SUB-CIVIL-STRUCT',
          name: 'Structural Concrete & Reinforcement',
          unitType: 'SUB_DEPARTMENT',
          parentId: 'unit-dep-civil',
          color: '#15803d',
          icon: 'FolderTree',
          displayOrder: 11,
          hierarchyLevel: 7,
          description: 'Sub-structure concrete, shuttering & rebar tying',
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'unit-sub-finish',
          unitCode: 'SUB-CIVIL-FINISH',
          name: 'Building Finishing & Architecture',
          unitType: 'SUB_DEPARTMENT',
          parentId: 'unit-sub-struct',
          color: '#047857',
          icon: 'FolderTree',
          displayOrder: 12,
          hierarchyLevel: 8,
          description: 'Masonry, plastering, tiling, painting & waterproofing',
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      ];

      for (const unit of defaultOrgUnits) {
        await db.insert(orgUnits).values(unit as any).onConflictDoNothing();
      }

      // Seed Picklists
      await db.insert(employeeGrades).values([
        { id: 'grd-01', code: 'GRD-EXEC-01', name: 'E1 - Executive Leadership', rank: 1, salaryRangeMin: 25000, salaryRangeMax: 60000, description: 'C-Level & Managing Directors', isActive: true, createdAt: now, updatedAt: now },
        { id: 'grd-02', code: 'GRD-MGR-02', name: 'M1 - Senior Project Manager', rank: 2, salaryRangeMin: 18000, salaryRangeMax: 30000, description: 'Project Managers & Division Heads', isActive: true, createdAt: now, updatedAt: now },
        { id: 'grd-03', code: 'GRD-ENG-03', name: 'P1 - Lead Site Engineer', rank: 3, salaryRangeMin: 10000, salaryRangeMax: 18000, description: 'Resident Engineers & Site Leads', isActive: true, createdAt: now, updatedAt: now },
        { id: 'grd-04', code: 'GRD-SUP-04', name: 'S1 - Site Supervisor / Foreman', rank: 4, salaryRangeMin: 5000, salaryRangeMax: 10000, description: 'Trade supervisors & shift leads', isActive: true, createdAt: now, updatedAt: now },
      ] as any).onConflictDoNothing();

      await db.insert(trades).values([
        { id: 'trd-01', code: 'TRD-PIPE-FIT', name: 'Piping Fitter / Fabricator', discipline: 'MECHANICAL', description: 'Heavy MS/DI pipe alignment & fitting', isActive: true, createdAt: now, updatedAt: now },
        { id: 'trd-02', code: 'TRD-6G-WELD', name: '6G TIG & ARC Welder', discipline: 'MECHANICAL', description: 'Certified pressure pipe welding', isActive: true, createdAt: now, updatedAt: now },
        { id: 'trd-03', code: 'TRD-MASON', name: 'Civil Mason / Shuttering Carpenter', discipline: 'CIVIL', description: 'Concrete shuttering & brickwork', isActive: true, createdAt: now, updatedAt: now },
        { id: 'trd-04', code: 'TRD-ELEC-TECH', name: 'HT/LT Electrical Technician', discipline: 'ELECTRICAL', description: 'Panel wiring & transformer termination', isActive: true, createdAt: now, updatedAt: now },
        { id: 'trd-05', code: 'TRD-SCADA-ENG', name: 'SCADA & Automation Technician', discipline: 'INSTRUMENTATION', description: 'PLC programming, sensor calibration & telemetry', isActive: true, createdAt: now, updatedAt: now },
      ] as any).onConflictDoNothing();

      await db.insert(projectCategories).values([
        { id: 'pcat-01', code: 'PCAT-WATER', name: 'Water & Utilities Infrastructure', description: 'WTP, STP, Pump Houses, Reservoirs & Pipelines', isActive: true, createdAt: now, updatedAt: now },
        { id: 'pcat-02', code: 'PCAT-BLDG', name: 'Building & Commercial Construction', description: 'High-rise, residential, institutional & industrial structures', isActive: true, createdAt: now, updatedAt: now },
        { id: 'pcat-03', code: 'PCAT-ROAD', name: 'Roads, Highways & Bridges', description: 'Asphalt paving, flyovers, bridges & earthworks', isActive: true, createdAt: now, updatedAt: now },
        { id: 'pcat-04', code: 'PCAT-MECH', name: 'Industrial & Mechanical Plants', description: 'Refinery piping, fabrication & heavy machinery erection', isActive: true, createdAt: now, updatedAt: now },
      ] as any).onConflictDoNothing();

      await db.insert(projectTypes).values([
        { id: 'ptype-01', code: 'PTYPE-WTP', name: 'Water Treatment Plant (WTP)', categoryId: 'pcat-01', categoryName: 'Water & Utilities Infrastructure', description: 'Clear water, filtration & chemical dosing facilities', isActive: true, createdAt: now, updatedAt: now },
        { id: 'ptype-02', code: 'PTYPE-STP', name: 'Sewage Treatment Plant (STP)', categoryId: 'pcat-01', categoryName: 'Water & Utilities Infrastructure', description: 'Effluent treatment, sludge handling & bioreactors', isActive: true, createdAt: now, updatedAt: now },
        { id: 'ptype-03', code: 'PTYPE-PUMP', name: 'High Lift Pumping Station', categoryId: 'pcat-01', categoryName: 'Water & Utilities Infrastructure', description: 'Pumps, surge vessels, valve chambers & electrical substation', isActive: true, createdAt: now, updatedAt: now },
        { id: 'ptype-04', code: 'PTYPE-ROAD', name: 'Expressway & Highway Construction', categoryId: 'pcat-03', categoryName: 'Roads, Highways & Bridges', description: 'Multi-lane roads, culverts & traffic signaling', isActive: true, createdAt: now, updatedAt: now },
        { id: 'ptype-05', code: 'PTYPE-BLDG', name: 'Multi-Story Residential / Office Complex', categoryId: 'pcat-02', categoryName: 'Building & Commercial Construction', description: 'Reinforced concrete frame with full MEP services', isActive: true, createdAt: now, updatedAt: now },
      ] as any).onConflictDoNothing();

      await db.insert(contractTypes).values([
        { id: 'cnt-01', code: 'CNT-EPC', name: 'EPC / Turnkey Contract', description: 'Engineering, Procurement & Construction lump sum', isActive: true, createdAt: now, updatedAt: now },
        { id: 'cnt-02', code: 'CNT-ITEM', name: 'Item Rate / BOQ Contract', description: 'Unit price schedule with measured quantities', isActive: true, createdAt: now, updatedAt: now },
        { id: 'cnt-03', code: 'CNT-BOT', name: 'BOT / PPP Concession', description: 'Build-Operate-Transfer long-term infrastructure', isActive: true, createdAt: now, updatedAt: now },
      ] as any).onConflictDoNothing();

      await db.insert(disciplines).values([
        { id: 'disc-01', code: 'DISC-CIVIL', name: 'Civil & Structural Engineering', description: 'Earthworks, concrete structures, substructures, roads & drainage', isActive: true, createdAt: now, updatedAt: now },
        { id: 'disc-02', code: 'DISC-MECH', name: 'Mechanical & Piping Engineering', description: 'Process equipment, static/rotary machinery, pressure piping & hydro-testing', isActive: true, createdAt: now, updatedAt: now },
        { id: 'disc-03', code: 'DISC-ELEC', name: 'Electrical & Power Systems', description: 'HT/LT distribution, substations, switchgear, transformers & cabling', isActive: true, createdAt: now, updatedAt: now },
        { id: 'disc-04', code: 'DISC-INST', name: 'Instrumentation & Automation', description: 'Sensors, transmitters, PLC, DCS, SCADA & telemetry systems', isActive: true, createdAt: now, updatedAt: now },
        { id: 'disc-05', code: 'DISC-HVAC', name: 'HVAC & Building MEP', description: 'Chillers, AHUs, ducting, VRV systems, plumbing & fire-fighting', isActive: true, createdAt: now, updatedAt: now },
        { id: 'disc-06', code: 'DISC-ARCH', name: 'Architectural & Finishing', description: 'Facades, masonry, partitions, interior fit-outs & landscaping', isActive: true, createdAt: now, updatedAt: now },
        { id: 'disc-07', code: 'DISC-HSE', name: 'Health, Safety & Environment (HSE)', description: 'Site safety, hazard controls, environmental compliance & audits', isActive: true, createdAt: now, updatedAt: now },
        { id: 'disc-08', code: 'DISC-QAQC', name: 'Quality Assurance & Quality Control (QA/QC)', description: 'Material testing, ITP inspections, NDT & compliance certification', isActive: true, createdAt: now, updatedAt: now },
        { id: 'disc-09', code: 'DISC-INFRA', name: 'Utilities & Water Infrastructure', description: 'Water networks, pipelines, WTP, STP, reservoirs & pump stations', isActive: true, createdAt: now, updatedAt: now },
      ] as any).onConflictDoNothing();

      await db.insert(costCenters).values([
        { id: 'cc-01', code: 'CC-OPS-01', name: 'General Site Operations & Machinery', branchId: 'unit-brn-01', description: 'Direct operational expenses for site execution', isActive: true, createdAt: now, updatedAt: now },
        { id: 'cc-02', code: 'CC-ENG-02', name: 'Engineering & Design Services', branchId: 'unit-brn-01', description: 'Technical design, drafting and engineering overheads', isActive: true, createdAt: now, updatedAt: now },
        { id: 'cc-03', code: 'CC-LOG-03', name: 'Logistics, Warehouse & Fleet', branchId: 'unit-brn-01', description: 'Material storage, transport and plant logistics', isActive: true, createdAt: now, updatedAt: now },
      ] as any).onConflictDoNothing();

      await db.insert(profitCenters).values([
        { id: 'pc-01', code: 'PC-EPC-INFRA', name: 'EPC Heavy Infrastructure Profit Center', branchId: 'unit-brn-01', description: 'Major EPC turnkey infrastructure revenue stream', isActive: true, createdAt: now, updatedAt: now },
        { id: 'pc-02', code: 'PC-MEP-COMM', name: 'Industrial MEP & Plant Contracts', branchId: 'unit-brn-01', description: 'Specialized MEP and mechanical erection revenue', isActive: true, createdAt: now, updatedAt: now },
      ] as any).onConflictDoNothing();

      await db.insert(reportingLevels).values([
        { id: 'rl-01', level: 1, name: 'Executive Leadership (Level 1)', description: 'Board of Directors & Managing Directors', isActive: true, createdAt: now, updatedAt: now },
        { id: 'rl-02', level: 2, name: 'Senior Management (Level 2)', description: 'Division Heads & General Managers', isActive: true, createdAt: now, updatedAt: now },
        { id: 'rl-03', level: 3, name: 'Project & Operations Management (Level 3)', description: 'Project Managers & Section Heads', isActive: true, createdAt: now, updatedAt: now },
        { id: 'rl-04', level: 4, name: 'Site Engineering & Technical Leads (Level 4)', description: 'Resident Engineers, Quality & Safety Leads', isActive: true, createdAt: now, updatedAt: now },
        { id: 'rl-05', level: 5, name: 'Frontline Site Supervision (Level 5)', description: 'Foremen, Supervisors & Field Incharges', isActive: true, createdAt: now, updatedAt: now },
      ] as any).onConflictDoNothing();

      await db.insert(employmentTypes).values([
        { id: 'et-01', code: 'ET-FULL', name: 'Permanent / Full-Time Direct Employee', description: 'Standard company direct employment', isActive: true, createdAt: now, updatedAt: now },
        { id: 'et-02', code: 'ET-PROJ', name: 'Project-Specific Fixed Term Contract', description: 'Contract tied to project timeline', isActive: true, createdAt: now, updatedAt: now },
        { id: 'et-03', code: 'ET-SUBCON', name: 'Subcontractor / Third-Party Deputed Staff', description: 'Deputed specialized trade manpower', isActive: true, createdAt: now, updatedAt: now },
      ] as any).onConflictDoNothing();

      await db.insert(skills).values([
        { id: 'skl-01', code: 'SKL-CONC', name: 'Structural Concrete & Reinforcement Pouring', category: 'Civil', description: 'High-grade concrete compaction, shuttering and curing', isActive: true, createdAt: now, updatedAt: now },
        { id: 'skl-02', code: 'SKL-WELD', name: '6G TIG/ARC Pressure Pipe Butt-Welding', category: 'Mechanical', description: 'Certified joint welding for pressure water & gas mains', isActive: true, createdAt: now, updatedAt: now },
        { id: 'skl-03', code: 'SKL-SCADA', name: 'PLC, SCADA & Telemetry Instrumentation', category: 'Instrumentation', description: 'Automation instrumentation and telemetry commissioning', isActive: true, createdAt: now, updatedAt: now },
        { id: 'skl-04', code: 'SKL-HSE-AUD', name: 'HSE Risk Assessment & Confined Space Safety', category: 'HSE', description: 'Confined space entry, hazard identification & safety auditing', isActive: true, createdAt: now, updatedAt: now },
      ] as any).onConflictDoNothing();
    }

    isOrgSeeded = true;
  } catch (err) {
    console.error('Failed to seed organization units:', err);
  }
}

export class OrgRepository {
  // --- Org Units Hierarchy CRUD & Move/Merge ---
  async getOrgUnits(params: PaginationParams & { unitType?: string; parentId?: string }) {
    await ensureOrgSeeded();
    let rows = await db.select().from(orgUnits).orderBy(asc(orgUnits.displayOrder));

    if (params.unitType) {
      rows = rows.filter((u) => u.unitType === params.unitType);
    }
    if (params.parentId !== undefined) {
      rows = rows.filter((u) => u.parentId === params.parentId);
    }

    const activeOnly = rows.filter((u) => u.isActive);
    return paginateArray(activeOnly, params, ['unitCode', 'name', 'unitType', 'description']);
  }

  async getOrgUnitTree() {
    await ensureOrgSeeded();
    const rows = await db.select().from(orgUnits).orderBy(asc(orgUnits.displayOrder));
    const empRows = await db.select().from(employees);
    const prjDeptRows = await db.select().from(projectDepartments);

    // Calculate counts
    const empCountMap = new Map<string, number>();
    empRows.forEach((emp) => {
      if (emp.departmentId) {
        empCountMap.set(emp.departmentId, (empCountMap.get(emp.departmentId) || 0) + 1);
      }
    });

    const prjCountMap = new Map<string, number>();
    prjDeptRows.forEach((pd) => {
      if (pd.departmentId) {
        prjCountMap.set(pd.departmentId, (prjCountMap.get(pd.departmentId) || 0) + 1);
      }
    });

    // Build hierarchical tree with recursive depth
    const map = new Map<string, any>();
    rows.forEach((unit) => {
      map.set(unit.id, {
        ...unit,
        employeeCount: empCountMap.get(unit.id) || 0,
        projectCount: prjCountMap.get(unit.id) || 0,
        children: [],
      });
    });

    const rootNodes: any[] = [];
    map.forEach((node) => {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId).children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  }

  async getOrgUnitById(id: string): Promise<DbOrgUnit | null> {
    await ensureOrgSeeded();
    const [row] = await db.select().from(orgUnits).where(eq(orgUnits.id, id));
    return (row as any) || null;
  }

  async createOrgUnit(data: Omit<DbOrgUnit, 'id' | 'createdAt' | 'updatedAt'>): Promise<DbOrgUnit> {
    await ensureOrgSeeded();
    const id = `unit-${data.unitType.toLowerCase().replace(/_/g, '-')}-${Date.now()}`;
    const now = new Date().toISOString();

    // Calculate hierarchy level based on parent
    let hierarchyLevel = 1;
    if (data.parentId) {
      const parent = await this.getOrgUnitById(data.parentId);
      if (parent) hierarchyLevel = (parent.hierarchyLevel || 1) + 1;
    }

    const newUnit = {
      ...data,
      id,
      displayOrder: data.displayOrder ?? 0,
      hierarchyLevel,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(orgUnits).values(newUnit as any);
    return newUnit as any;
  }

  async updateOrgUnit(id: string, updates: Partial<DbOrgUnit>): Promise<DbOrgUnit | null> {
    await ensureOrgSeeded();
    const existing = await this.getOrgUnitById(id);
    if (!existing) return null;

    const updated = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.update(orgUnits).set(updated as any).where(eq(orgUnits.id, id));
    return this.getOrgUnitById(id);
  }

  async moveOrgUnit(id: string, newParentId: string | null): Promise<DbOrgUnit | null> {
    await ensureOrgSeeded();
    const unit = await this.getOrgUnitById(id);
    if (!unit) throw new Error('Department / Unit not found');

    if (newParentId) {
      // Prevent moving unit into itself or one of its descendants
      let currentParentId: string | null | undefined = newParentId;
      while (currentParentId) {
        if (currentParentId === id) {
          throw new Error('Cannot move a department inside its own sub-department hierarchy');
        }
        const parentNode = await this.getOrgUnitById(currentParentId);
        currentParentId = parentNode?.parentId;
      }
    }

    let newHierarchyLevel = 1;
    if (newParentId) {
      const targetParent = await this.getOrgUnitById(newParentId);
      if (targetParent) newHierarchyLevel = (targetParent.hierarchyLevel || 1) + 1;
    }

    await db.update(orgUnits).set({
      parentId: newParentId || null,
      hierarchyLevel: newHierarchyLevel,
      updatedAt: new Date().toISOString(),
    } as any).where(eq(orgUnits.id, id));

    return this.getOrgUnitById(id);
  }

  async mergeOrgUnits(sourceId: string, targetId: string): Promise<boolean> {
    await ensureOrgSeeded();
    if (sourceId === targetId) throw new Error('Source and Target departments cannot be identical');

    const source = await this.getOrgUnitById(sourceId);
    const target = await this.getOrgUnitById(targetId);
    if (!source || !target) throw new Error('Source or Target department not found');

    const now = new Date().toISOString();

    // Reassign all employees in source department to target department
    await db.update(employees).set({ departmentId: targetId, updatedAt: now }).where(eq(employees.departmentId, sourceId));

    // Reassign project departments
    await db.update(projectDepartments).set({ departmentId: targetId }).where(eq(projectDepartments.departmentId, sourceId));

    // Reassign sub-departments of source to target
    await db.update(orgUnits).set({ parentId: targetId, updatedAt: now }).where(eq(orgUnits.parentId, sourceId));

    // Deactivate source department
    await db.update(orgUnits).set({ isActive: false, description: `[Merged into ${target.name}] ${source.description || ''}`, updatedAt: now }).where(eq(orgUnits.id, sourceId));

    // Audit log
    await db.insert(auditLogs).values({
      id: `audit-${Date.now()}`,
      action: 'MERGE_DEPARTMENTS',
      module: 'ORGANIZATION',
      details: `Merged department '${source.name}' (${source.unitCode}) into '${target.name}' (${target.unitCode})`,
      createdAt: now,
    } as any);

    return true;
  }

  async bulkImportOrgUnits(items: any[]): Promise<{ importedCount: number }> {
    await ensureOrgSeeded();
    const now = new Date().toISOString();
    let count = 0;

    for (const item of items) {
      if (!item.name || !item.unitCode || !item.unitType) continue;

      const id = item.id || `unit-${item.unitType.toLowerCase().replace(/_/g, '-')}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newUnit = {
        id,
        unitCode: item.unitCode,
        name: item.name,
        unitType: item.unitType,
        parentId: item.parentId || null,
        companyId: item.companyId || null,
        branchId: item.branchId || null,
        divisionId: item.divisionId || null,
        headEmployeeId: item.headEmployeeId || null,
        headEmployeeName: item.headEmployeeName || null,
        color: item.color || '#0284c7',
        icon: item.icon || 'FolderTree',
        displayOrder: item.displayOrder || 0,
        hierarchyLevel: item.hierarchyLevel || 1,
        description: item.description || '',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      await db.insert(orgUnits).values(newUnit as any).onConflictDoNothing();
      count++;
    }

    return { importedCount: count };
  }

  async softDeleteOrgUnit(id: string): Promise<boolean> {
    await ensureOrgSeeded();
    const existing = await this.getOrgUnitById(id);
    if (!existing) return false;

    await db.update(orgUnits).set({ isActive: false, updatedAt: new Date().toISOString() }).where(eq(orgUnits.id, id));
    return true;
  }

  // --- Master Tables Picklists (Business Units, Regions, Divisions, Grades, Trades, Disciplines, Cost Centers, Profit Centers, etc.) ---
  async getMasterList(category: string) {
    await ensureOrgSeeded();
    const normalized = category
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase()
      .replace(/_/g, '-');

    switch (normalized) {
      case 'business-units':
      case 'businessunits':
        return db.select().from(businessUnits);
      case 'regions':
        return db.select().from(regions);
      case 'divisions':
        return db.select().from(divisions);
      case 'grades':
      case 'employee-grades':
      case 'employeegrades':
        return db.select().from(employeeGrades);
      case 'employment-types':
      case 'employmenttypes':
        return db.select().from(employmentTypes);
      case 'skills':
        return db.select().from(skills);
      case 'trades':
        return db.select().from(trades);
      case 'disciplines':
        return db.select().from(disciplines);
      case 'project-categories':
      case 'projectcategories':
        return db.select().from(projectCategories);
      case 'project-types':
      case 'projecttypes':
        return db.select().from(projectTypes);
      case 'contract-types':
      case 'contracttypes':
        return db.select().from(contractTypes);
      case 'cost-centers':
      case 'costcenters':
        return db.select().from(costCenters);
      case 'profit-centers':
      case 'profitcenters':
        return db.select().from(profitCenters);
      case 'reporting-levels':
      case 'reportinglevels':
        return db.select().from(reportingLevels);
      case 'designations':
        return db.select().from(designations);
      case 'companies':
        return db.select().from(companies);
      case 'branches':
        return db.select().from(branches);
      default:
        throw new Error(`Unknown master category: ${category}`);
    }
  }

  async createMasterRecord(category: string, data: any) {
    await ensureOrgSeeded();
    const now = new Date().toISOString();
    const id = `${category.substring(0, 4)}-${Date.now()}`;

    const record = {
      ...data,
      id,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    const normalized = category
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase()
      .replace(/_/g, '-');

    switch (normalized) {
      case 'business-units':
      case 'businessunits':
        await db.insert(businessUnits).values(record);
        break;
      case 'regions':
        await db.insert(regions).values(record);
        break;
      case 'divisions':
        await db.insert(divisions).values(record);
        break;
      case 'grades':
      case 'employee-grades':
      case 'employeegrades':
        await db.insert(employeeGrades).values(record);
        break;
      case 'employment-types':
      case 'employmenttypes':
        await db.insert(employmentTypes).values(record);
        break;
      case 'skills':
        await db.insert(skills).values(record);
        break;
      case 'trades':
        await db.insert(trades).values(record);
        break;
      case 'disciplines':
        await db.insert(disciplines).values(record);
        break;
      case 'project-categories':
      case 'projectcategories':
        await db.insert(projectCategories).values(record);
        break;
      case 'project-types':
      case 'projecttypes':
        await db.insert(projectTypes).values(record);
        break;
      case 'contract-types':
      case 'contracttypes':
        await db.insert(contractTypes).values(record);
        break;
      case 'cost-centers':
      case 'costcenters':
        await db.insert(costCenters).values(record);
        break;
      case 'profit-centers':
      case 'profitcenters':
        await db.insert(profitCenters).values(record);
        break;
      case 'reporting-levels':
      case 'reportinglevels':
        await db.insert(reportingLevels).values(record);
        break;
      default:
        throw new Error(`Creation for category '${category}' not supported`);
    }

    return record;
  }

  async updateMasterRecord(category: string, id: string, data: any) {
    await ensureOrgSeeded();
    const now = new Date().toISOString();
    const updates = { ...data, updatedAt: now };
    delete updates.id;
    delete updates.createdAt;

    const normalized = category
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase()
      .replace(/_/g, '-');

    switch (normalized) {
      case 'business-units':
      case 'businessunits':
        await db.update(businessUnits).set(updates).where(eq(businessUnits.id, id));
        break;
      case 'regions':
        await db.update(regions).set(updates).where(eq(regions.id, id));
        break;
      case 'divisions':
        await db.update(divisions).set(updates).where(eq(divisions.id, id));
        break;
      case 'grades':
      case 'employee-grades':
      case 'employeegrades':
        await db.update(employeeGrades).set(updates).where(eq(employeeGrades.id, id));
        break;
      case 'employment-types':
      case 'employmenttypes':
        await db.update(employmentTypes).set(updates).where(eq(employmentTypes.id, id));
        break;
      case 'skills':
        await db.update(skills).set(updates).where(eq(skills.id, id));
        break;
      case 'trades':
        await db.update(trades).set(updates).where(eq(trades.id, id));
        break;
      case 'disciplines':
        await db.update(disciplines).set(updates).where(eq(disciplines.id, id));
        break;
      case 'project-categories':
      case 'projectcategories':
        await db.update(projectCategories).set(updates).where(eq(projectCategories.id, id));
        break;
      case 'project-types':
      case 'projecttypes':
        await db.update(projectTypes).set(updates).where(eq(projectTypes.id, id));
        break;
      case 'contract-types':
      case 'contracttypes':
        await db.update(contractTypes).set(updates).where(eq(contractTypes.id, id));
        break;
      case 'cost-centers':
      case 'costcenters':
        await db.update(costCenters).set(updates).where(eq(costCenters.id, id));
        break;
      case 'profit-centers':
      case 'profitcenters':
        await db.update(profitCenters).set(updates).where(eq(profitCenters.id, id));
        break;
      case 'reporting-levels':
      case 'reportinglevels':
        await db.update(reportingLevels).set(updates).where(eq(reportingLevels.id, id));
        break;
      case 'designations':
        await db.update(designations).set(updates).where(eq(designations.id, id));
        break;
      default:
        throw new Error(`Update for category '${category}' not supported`);
    }

    return { id, ...updates };
  }

  async deleteMasterRecord(category: string, id: string) {
    await ensureOrgSeeded();
    return this.updateMasterRecord(category, id, { isActive: false });
  }

  // --- Database Driven Employee Reporting Hierarchy ---
  async getReportingTree() {
    await ensureOrgSeeded();
    const empRows = await db.select().from(employees);
    const desigRows = await db.select().from(designations);
    const deptRows = await db.select().from(departments);

    const desigMap = new Map(desigRows.map((d) => [d.id, d.name]));
    const deptMap = new Map(deptRows.map((d) => [d.id, d.name]));

    const map = new Map<string, any>();
    empRows.forEach((emp) => {
      map.set(emp.id, {
        ...emp,
        designationName: emp.designationId ? desigMap.get(emp.designationId) || 'Employee' : 'Employee',
        departmentName: emp.departmentId ? deptMap.get(emp.departmentId) || 'General' : 'General',
        directReports: [],
      });
    });

    const rootNodes: any[] = [];
    map.forEach((node) => {
      if (node.reportingManagerId && map.has(node.reportingManagerId)) {
        map.get(node.reportingManagerId).directReports.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  }

  // --- Dynamic Departments & Project Preparation ---
  async getProjectDepartments(projectId: string) {
    const rows = await db.select().from(projectDepartments).where(and(eq(projectDepartments.projectId, projectId), eq(projectDepartments.status, 'ACTIVE')));
    return rows;
  }

  async assignDepartmentToProject(data: Omit<DbProjectDepartment, 'id' | 'createdAt'>): Promise<DbProjectDepartment> {
    const id = `prj-dep-${Date.now()}`;
    const newAssignment = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    await db.insert(projectDepartments).values(newAssignment as any);
    return newAssignment as any;
  }

  async removeDepartmentFromProject(id: string): Promise<boolean> {
    await db.update(projectDepartments).set({ status: 'INACTIVE' }).where(eq(projectDepartments.id, id));
    return true;
  }

  // --- Project Work Packages ---
  async getProjectWorkPackages(projectId: string) {
    const rows = await db.select().from(projectWorkPackages).where(eq(projectWorkPackages.projectId, projectId));
    return rows;
  }

  async createWorkPackage(data: Omit<DbProjectWorkPackage, 'id' | 'createdAt' | 'updatedAt'>): Promise<DbProjectWorkPackage> {
    const id = `pkg-${Date.now()}`;
    const now = new Date().toISOString();
    const newPkg = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(projectWorkPackages).values(newPkg as any);
    return newPkg as any;
  }

  // --- Dynamic Module Assignments ---
  async getModuleAssignments(targetType?: string, targetId?: string) {
    let rows = await db.select().from(moduleAssignments);
    if (targetType) rows = rows.filter((m) => m.targetType === targetType);
    if (targetId) rows = rows.filter((m) => m.targetId === targetId);
    return rows;
  }

  async assignModule(data: Omit<DbModuleAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<DbModuleAssignment> {
    const id = `mod-assign-${Date.now()}`;
    const now = new Date().toISOString();
    const newAssign = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(moduleAssignments).values(newAssign as any);
    return newAssign as any;
  }

  // =========================================================================
  // ENTERPRISE DIVISION MASTER CRUD & GOVERNANCE
  // =========================================================================

  async getDivisions(params: { search?: string; isActive?: boolean } = {}): Promise<DbDivision[]> {
    await ensureOrgSeeded();
    const divRows = await db.select().from(divisions);
    const orgUnitDivs = await db.select().from(orgUnits).where(eq(orgUnits.unitType, 'DIVISION'));
    const deptRows = await db.select().from(departments);
    const empRows = await db.select().from(employees);

    // Map departments to their employee counts
    const deptEmpCountMap = new Map<string, number>();
    empRows.forEach((emp) => {
      if (emp.departmentId && emp.isActive) {
        deptEmpCountMap.set(emp.departmentId, (deptEmpCountMap.get(emp.departmentId) || 0) + 1);
      }
    });

    // Merge divisions from both tables
    const divisionMap = new Map<string, DbDivision>();

    // Add from divisions table
    divRows.forEach((d) => {
      divisionMap.set(d.id, {
        id: d.id,
        code: d.code,
        name: d.name,
        branchId: d.branchId || undefined,
        regionId: d.regionId || undefined,
        headEmployeeId: d.headEmployeeId || undefined,
        headEmployeeName: d.headEmployeeName || undefined,
        description: d.description || '',
        displayOrder: 0,
        isActive: d.isActive,
        departmentCount: 0,
        activeDepartmentCount: 0,
        employeeCount: 0,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      });
    });

    // Merge or populate from orgUnits table
    orgUnitDivs.forEach((u) => {
      const existing = divisionMap.get(u.id);
      if (existing) {
        existing.displayOrder = u.displayOrder ?? 0;
        if (!existing.description) existing.description = u.description || '';
        if (!existing.headEmployeeName) existing.headEmployeeName = u.headEmployeeName || '';
      } else {
        divisionMap.set(u.id, {
          id: u.id,
          code: u.unitCode,
          name: u.name,
          branchId: u.branchId || undefined,
          headEmployeeId: u.headEmployeeId || undefined,
          headEmployeeName: u.headEmployeeName || undefined,
          description: u.description || '',
          displayOrder: u.displayOrder ?? 0,
          isActive: u.isActive,
          departmentCount: 0,
          activeDepartmentCount: 0,
          employeeCount: 0,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        });
      }
    });

    // Calculate department counts and employee counts per division
    deptRows.forEach((dept) => {
      const parentDivId = dept.parentId || (dept as any).divisionId;
      if (parentDivId && divisionMap.has(parentDivId)) {
        const div = divisionMap.get(parentDivId)!;
        div.departmentCount = (div.departmentCount || 0) + 1;
        if (dept.isActive) {
          div.activeDepartmentCount = (div.activeDepartmentCount || 0) + 1;
        }
        const empCount = deptEmpCountMap.get(dept.id) || 0;
        div.employeeCount = (div.employeeCount || 0) + empCount;
      }
    });

    let results = Array.from(divisionMap.values());

    if (params.isActive !== undefined) {
      results = results.filter((d) => d.isActive === params.isActive);
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      results = results.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q) ||
          (d.description && d.description.toLowerCase().includes(q))
      );
    }

    return results.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name));
  }

  async getDivisionById(id: string): Promise<(DbDivision & { departments: DbDepartment[] }) | null> {
    await ensureOrgSeeded();
    const divisionsList = await this.getDivisions();
    const div = divisionsList.find((d) => d.id === id);
    if (!div) return null;

    const allDepts = await this.getDepartments({ divisionId: id });
    return {
      ...div,
      departments: allDepts,
    };
  }

  async createDivision(data: {
    code: string;
    name: string;
    description?: string;
    headEmployeeId?: string;
    headEmployeeName?: string;
    displayOrder?: number;
    branchId?: string;
  }): Promise<DbDivision> {
    await ensureOrgSeeded();
    if (!data.code || !data.name) {
      throw new Error('Division Code and Name are required');
    }

    const cleanCode = data.code.trim().toUpperCase();
    const cleanName = data.name.trim();

    // Check unique code
    const existing = await db.select().from(divisions).where(eq(divisions.code, cleanCode));
    if (existing.length > 0) {
      throw new Error(`Division code '${cleanCode}' already exists`);
    }

    const id = `div-${Date.now()}`;
    const now = new Date().toISOString();

    const divisionRecord = {
      id,
      code: cleanCode,
      name: cleanName,
      branchId: data.branchId || null,
      regionId: null,
      headEmployeeId: data.headEmployeeId || null,
      headEmployeeName: data.headEmployeeName || null,
      description: data.description || '',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(divisions).values(divisionRecord as any);

    // Sync with orgUnits hierarchy
    const orgUnitRecord = {
      id,
      unitCode: cleanCode,
      name: cleanName,
      unitType: 'DIVISION' as const,
      parentId: data.branchId || 'unit-comp-01',
      companyId: 'unit-comp-01',
      branchId: data.branchId || null,
      divisionId: id,
      headEmployeeId: data.headEmployeeId || null,
      headEmployeeName: data.headEmployeeName || null,
      color: '#0d9488',
      icon: 'Layers',
      displayOrder: data.displayOrder ?? 0,
      hierarchyLevel: 5,
      description: data.description || '',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(orgUnits).values(orgUnitRecord as any).onConflictDoNothing();

    // Audit log
    await db.insert(auditLogs).values({
      id: `audit-${Date.now()}`,
      action: 'CREATE_DIVISION',
      module: 'ORGANIZATION',
      details: `Created enterprise division '${cleanName}' (${cleanCode})`,
      createdAt: now,
    } as any);

    return {
      ...divisionRecord,
      displayOrder: data.displayOrder ?? 0,
      departmentCount: 0,
      activeDepartmentCount: 0,
      employeeCount: 0,
    } as DbDivision;
  }

  async updateDivision(
    id: string,
    updates: Partial<{
      code: string;
      name: string;
      description: string;
      headEmployeeId: string;
      headEmployeeName: string;
      displayOrder: number;
      isActive: boolean;
      branchId: string;
    }>
  ): Promise<DbDivision | null> {
    await ensureOrgSeeded();
    const [existing] = await db.select().from(divisions).where(eq(divisions.id, id));
    const now = new Date().toISOString();

    if (!existing) {
      // Check orgUnits
      const [existingUnit] = await db.select().from(orgUnits).where(eq(orgUnits.id, id));
      if (!existingUnit) return null;
    }

    const payload: any = { updatedAt: now };
    if (updates.name !== undefined) payload.name = updates.name.trim();
    if (updates.code !== undefined) payload.code = updates.code.trim().toUpperCase();
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.headEmployeeId !== undefined) payload.headEmployeeId = updates.headEmployeeId || null;
    if (updates.headEmployeeName !== undefined) payload.headEmployeeName = updates.headEmployeeName || null;
    if (updates.branchId !== undefined) payload.branchId = updates.branchId || null;
    if (updates.isActive !== undefined) payload.isActive = updates.isActive;

    await db.update(divisions).set(payload).where(eq(divisions.id, id));

    // Also update orgUnits
    const orgUnitPayload: any = { updatedAt: now };
    if (payload.name) orgUnitPayload.name = payload.name;
    if (payload.code) orgUnitPayload.unitCode = payload.code;
    if (payload.description !== undefined) orgUnitPayload.description = payload.description;
    if (payload.headEmployeeId !== undefined) orgUnitPayload.headEmployeeId = payload.headEmployeeId;
    if (payload.headEmployeeName !== undefined) orgUnitPayload.headEmployeeName = payload.headEmployeeName;
    if (updates.displayOrder !== undefined) orgUnitPayload.displayOrder = updates.displayOrder;
    if (payload.isActive !== undefined) orgUnitPayload.isActive = payload.isActive;

    await db.update(orgUnits).set(orgUnitPayload).where(eq(orgUnits.id, id));

    // Audit log
    await db.insert(auditLogs).values({
      id: `audit-${Date.now()}`,
      action: 'UPDATE_DIVISION',
      module: 'ORGANIZATION',
      details: `Updated division ID ${id}: ${JSON.stringify(updates)}`,
      createdAt: now,
    } as any);

    return this.getDivisionById(id);
  }

  async deactivateDivision(id: string, force = false): Promise<{ success: boolean; activeDepartmentsCount: number; message: string }> {
    await ensureOrgSeeded();
    const div = await this.getDivisionById(id);
    if (!div) throw new Error('Division not found');

    const activeDepts = div.departments.filter((d) => d.isActive);
    if (activeDepts.length > 0 && !force) {
      return {
        success: false,
        activeDepartmentsCount: activeDepts.length,
        message: `Division '${div.name}' contains ${activeDepts.length} active department(s) (${activeDepts.map((d) => d.name).join(', ')}). Please reassign or deactivate departments first.`,
      };
    }

    const now = new Date().toISOString();
    await db.update(divisions).set({ isActive: false, updatedAt: now }).where(eq(divisions.id, id));
    await db.update(orgUnits).set({ isActive: false, updatedAt: now }).where(eq(orgUnits.id, id));

    // If force, soft deactivate departments
    if (force && activeDepts.length > 0) {
      for (const dept of activeDepts) {
        await db.update(departments).set({ isActive: false, updatedAt: now }).where(eq(departments.id, dept.id));
        await db.update(orgUnits).set({ isActive: false, updatedAt: now }).where(eq(orgUnits.id, dept.id));
      }
    }

    await db.insert(auditLogs).values({
      id: `audit-${Date.now()}`,
      action: 'DEACTIVATE_DIVISION',
      module: 'ORGANIZATION',
      details: `Soft-deactivated division '${div.name}' (${div.code})`,
      createdAt: now,
    } as any);

    return {
      success: true,
      activeDepartmentsCount: activeDepts.length,
      message: `Division '${div.name}' successfully deactivated`,
    };
  }

  async activateDivision(id: string): Promise<boolean> {
    await ensureOrgSeeded();
    const now = new Date().toISOString();
    await db.update(divisions).set({ isActive: true, updatedAt: now }).where(eq(divisions.id, id));
    await db.update(orgUnits).set({ isActive: true, updatedAt: now }).where(eq(orgUnits.id, id));

    await db.insert(auditLogs).values({
      id: `audit-${Date.now()}`,
      action: 'ACTIVATE_DIVISION',
      module: 'ORGANIZATION',
      details: `Activated division ID ${id}`,
      createdAt: now,
    } as any);

    return true;
  }

  // =========================================================================
  // ENTERPRISE DEPARTMENT MASTER CRUD & SAFE REASSIGNMENT
  // =========================================================================

  async getDepartments(params: { divisionId?: string; search?: string; isActive?: boolean } = {}): Promise<DbDepartment[]> {
    await ensureOrgSeeded();
    const deptRows = await db.select().from(departments);
    const orgUnitDepts = await db.select().from(orgUnits).where(eq(orgUnits.unitType, 'DEPARTMENT'));
    const divRows = await db.select().from(divisions);
    const orgUnitDivs = await db.select().from(orgUnits).where(eq(orgUnits.unitType, 'DIVISION'));
    const empRows = await db.select().from(employees);
    const prjDeptRows = await db.select().from(projectDepartments);

    // Build division lookup
    const divisionLookup = new Map<string, { name: string; code: string }>();
    divRows.forEach((d) => divisionLookup.set(d.id, { name: d.name, code: d.code }));
    orgUnitDivs.forEach((u) => {
      if (!divisionLookup.has(u.id)) {
        divisionLookup.set(u.id, { name: u.name, code: u.unitCode });
      }
    });

    // Employee count per department
    const empCountMap = new Map<string, number>();
    empRows.forEach((emp) => {
      if (emp.departmentId && emp.isActive) {
        empCountMap.set(emp.departmentId, (empCountMap.get(emp.departmentId) || 0) + 1);
      }
    });

    // Project count per department
    const prjCountMap = new Map<string, number>();
    prjDeptRows.forEach((pd) => {
      if (pd.departmentId && pd.status === 'ACTIVE') {
        prjCountMap.set(pd.departmentId, (prjCountMap.get(pd.departmentId) || 0) + 1);
      }
    });

    const deptMap = new Map<string, DbDepartment>();

    // Populate from departments table
    deptRows.forEach((d) => {
      const parentDivId = d.parentId || '';
      const divInfo = divisionLookup.get(parentDivId) || { name: 'General', code: 'GEN' };

      deptMap.set(d.id, {
        id: d.id,
        code: d.code,
        name: d.name,
        branchId: d.branchId || undefined,
        parentId: parentDivId,
        divisionId: parentDivId,
        divisionName: divInfo.name,
        divisionCode: divInfo.code,
        type: d.type || 'DEPARTMENT',
        headEmployeeId: d.headEmployeeId || undefined,
        headEmployeeName: d.headEmployeeName || undefined,
        color: d.color || '#0284c7',
        icon: d.icon || 'FolderTree',
        displayOrder: d.displayOrder ?? 0,
        description: d.description || '',
        isActive: d.isActive,
        employeeCount: empCountMap.get(d.id) || 0,
        projectCount: prjCountMap.get(d.id) || 0,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      });
    });

    // Merge from orgUnits table where unitType is DEPARTMENT
    orgUnitDepts.forEach((u) => {
      const parentDivId = (u as any).divisionId || u.parentId || '';
      const divInfo = divisionLookup.get(parentDivId) || { name: 'General', code: 'GEN' };

      const existing = deptMap.get(u.id);
      if (existing) {
        existing.displayOrder = u.displayOrder ?? existing.displayOrder;
        if (!existing.color) existing.color = u.color || '#0284c7';
        if (!existing.icon) existing.icon = u.icon || 'FolderTree';
        if (!existing.description) existing.description = u.description || '';
      } else {
        deptMap.set(u.id, {
          id: u.id,
          code: u.unitCode,
          name: u.name,
          branchId: u.branchId || undefined,
          parentId: parentDivId,
          divisionId: parentDivId,
          divisionName: divInfo.name,
          divisionCode: divInfo.code,
          type: 'DEPARTMENT',
          headEmployeeId: u.headEmployeeId || undefined,
          headEmployeeName: u.headEmployeeName || undefined,
          color: u.color || '#0284c7',
          icon: u.icon || 'FolderTree',
          displayOrder: u.displayOrder ?? 0,
          description: u.description || '',
          isActive: u.isActive,
          employeeCount: empCountMap.get(u.id) || 0,
          projectCount: prjCountMap.get(u.id) || 0,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        });
      }
    });

    let results = Array.from(deptMap.values());

    if (params.divisionId) {
      results = results.filter((d) => d.divisionId === params.divisionId || d.parentId === params.divisionId);
    }

    if (params.isActive !== undefined) {
      results = results.filter((d) => d.isActive === params.isActive);
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      results = results.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q) ||
          (d.divisionName && d.divisionName.toLowerCase().includes(q)) ||
          (d.description && d.description.toLowerCase().includes(q))
      );
    }

    return results.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name));
  }

  async getDepartmentById(id: string): Promise<DbDepartment | null> {
    await ensureOrgSeeded();
    const depts = await this.getDepartments();
    return depts.find((d) => d.id === id) || null;
  }

  async createDepartment(data: {
    code: string;
    name: string;
    divisionId: string;
    description?: string;
    headEmployeeId?: string;
    headEmployeeName?: string;
    displayOrder?: number;
    color?: string;
    icon?: string;
    branchId?: string;
  }): Promise<DbDepartment> {
    await ensureOrgSeeded();
    if (!data.code || !data.name || !data.divisionId) {
      throw new Error('Department Code, Name, and Parent Division are required');
    }

    const cleanCode = data.code.trim().toUpperCase();
    const cleanName = data.name.trim();

    // Validate parent division exists
    const [division] = await db.select().from(divisions).where(eq(divisions.id, data.divisionId));
    const [divOrgUnit] = await db.select().from(orgUnits).where(eq(orgUnits.id, data.divisionId));
    if (!division && !divOrgUnit) {
      throw new Error(`Parent Division with ID '${data.divisionId}' does not exist`);
    }

    const divName = division?.name || divOrgUnit?.name || 'General';
    const divCode = division?.code || divOrgUnit?.unitCode || 'GEN';

    // Check unique code
    const existingDept = await db.select().from(departments).where(eq(departments.code, cleanCode));
    if (existingDept.length > 0) {
      throw new Error(`Department code '${cleanCode}' already exists`);
    }

    const id = `dep-${Date.now()}`;
    const now = new Date().toISOString();

    const deptRecord = {
      id,
      code: cleanCode,
      name: cleanName,
      branchId: data.branchId || null,
      parentId: data.divisionId,
      type: 'DEPARTMENT',
      headEmployeeId: data.headEmployeeId || null,
      headEmployeeName: data.headEmployeeName || null,
      color: data.color || '#0284c7',
      icon: data.icon || 'FolderTree',
      displayOrder: data.displayOrder ?? 0,
      description: data.description || '',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(departments).values(deptRecord as any);

    // Sync with orgUnits table
    const orgUnitRecord = {
      id,
      unitCode: cleanCode,
      name: cleanName,
      unitType: 'DEPARTMENT' as const,
      parentId: data.divisionId,
      companyId: 'unit-comp-01',
      branchId: data.branchId || null,
      divisionId: data.divisionId,
      headEmployeeId: data.headEmployeeId || null,
      headEmployeeName: data.headEmployeeName || null,
      color: data.color || '#0284c7',
      icon: data.icon || 'FolderTree',
      displayOrder: data.displayOrder ?? 0,
      hierarchyLevel: 6,
      description: data.description || '',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(orgUnits).values(orgUnitRecord as any).onConflictDoNothing();

    // Audit log
    await db.insert(auditLogs).values({
      id: `audit-${Date.now()}`,
      action: 'CREATE_DEPARTMENT',
      module: 'ORGANIZATION',
      details: `Created department '${cleanName}' (${cleanCode}) under division '${divName}'`,
      createdAt: now,
    } as any);

    return {
      ...deptRecord,
      divisionId: data.divisionId,
      divisionName: divName,
      divisionCode: divCode,
      employeeCount: 0,
      projectCount: 0,
    } as DbDepartment;
  }

  async updateDepartment(
    id: string,
    updates: Partial<{
      code: string;
      name: string;
      divisionId: string;
      description: string;
      headEmployeeId: string;
      headEmployeeName: string;
      displayOrder: number;
      color: string;
      icon: string;
      isActive: boolean;
      branchId: string;
    }>
  ): Promise<DbDepartment | null> {
    await ensureOrgSeeded();
    const existing = await this.getDepartmentById(id);
    if (!existing) return null;

    const now = new Date().toISOString();

    // If division is changing, run safe reassignment
    if (updates.divisionId && updates.divisionId !== existing.divisionId) {
      await this.reassignDepartmentDivision(id, updates.divisionId, 'Reassigned via Department update');
    }

    const payload: any = { updatedAt: now };
    if (updates.name !== undefined) payload.name = updates.name.trim();
    if (updates.code !== undefined) payload.code = updates.code.trim().toUpperCase();
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.headEmployeeId !== undefined) payload.headEmployeeId = updates.headEmployeeId || null;
    if (updates.headEmployeeName !== undefined) payload.headEmployeeName = updates.headEmployeeName || null;
    if (updates.displayOrder !== undefined) payload.displayOrder = updates.displayOrder;
    if (updates.color !== undefined) payload.color = updates.color;
    if (updates.icon !== undefined) payload.icon = updates.icon;
    if (updates.isActive !== undefined) payload.isActive = updates.isActive;
    if (updates.branchId !== undefined) payload.branchId = updates.branchId || null;

    await db.update(departments).set(payload).where(eq(departments.id, id));

    // Also update orgUnits
    const orgUnitPayload: any = { updatedAt: now };
    if (payload.name) orgUnitPayload.name = payload.name;
    if (payload.code) orgUnitPayload.unitCode = payload.code;
    if (payload.description !== undefined) orgUnitPayload.description = payload.description;
    if (payload.headEmployeeId !== undefined) orgUnitPayload.headEmployeeId = payload.headEmployeeId;
    if (payload.headEmployeeName !== undefined) orgUnitPayload.headEmployeeName = payload.headEmployeeName;
    if (payload.displayOrder !== undefined) orgUnitPayload.displayOrder = payload.displayOrder;
    if (payload.color) orgUnitPayload.color = payload.color;
    if (payload.icon) orgUnitPayload.icon = payload.icon;
    if (payload.isActive !== undefined) orgUnitPayload.isActive = payload.isActive;

    await db.update(orgUnits).set(orgUnitPayload).where(eq(orgUnits.id, id));

    // Audit log
    await db.insert(auditLogs).values({
      id: `audit-${Date.now()}`,
      action: 'UPDATE_DEPARTMENT',
      module: 'ORGANIZATION',
      details: `Updated department ID ${id}: ${JSON.stringify(updates)}`,
      createdAt: now,
    } as any);

    return this.getDepartmentById(id);
  }

  async reassignDepartmentDivision(
    departmentId: string,
    newDivisionId: string,
    reason?: string
  ): Promise<DbDepartment> {
    await ensureOrgSeeded();
    const dept = await this.getDepartmentById(departmentId);
    if (!dept) throw new Error('Department not found');

    const targetDiv = await this.getDivisionById(newDivisionId);
    if (!targetDiv) throw new Error('Target division not found');
    if (!targetDiv.isActive) throw new Error('Target division is inactive and cannot accept departments');

    const previousDivisionName = dept.divisionName || dept.parentId || 'None';
    const now = new Date().toISOString();

    // 1. Update department's parent division in departments table
    await db.update(departments).set({
      parentId: newDivisionId,
      updatedAt: now,
    }).where(eq(departments.id, departmentId));

    // 2. Update parentId in orgUnits table
    await db.update(orgUnits).set({
      parentId: newDivisionId,
      updatedAt: now,
    }).where(eq(orgUnits.id, departmentId));

    // 3. Employee references (`employees.departmentId`) remain completely untouched and valid!
    // 4. Project assignments (`projectDepartments.departmentId`) remain completely untouched and valid!

    // 5. Record immutable audit log
    await db.insert(auditLogs).values({
      id: `audit-${Date.now()}`,
      action: 'REASSIGN_DEPARTMENT_DIVISION',
      module: 'ORGANIZATION',
      details: `Moved department '${dept.name}' (${dept.code}) from division '${previousDivisionName}' to '${targetDiv.name}' (${targetDiv.code}). Reason: ${reason || 'Administrative reorganization'}`,
      createdAt: now,
    } as any);

    const updated = await this.getDepartmentById(departmentId);
    if (!updated) throw new Error('Failed to retrieve updated department');
    return updated;
  }

  async deactivateDepartment(id: string): Promise<{ success: boolean; employeeCount: number; message: string }> {
    await ensureOrgSeeded();
    const dept = await this.getDepartmentById(id);
    if (!dept) throw new Error('Department not found');

    const now = new Date().toISOString();
    await db.update(departments).set({ isActive: false, updatedAt: now }).where(eq(departments.id, id));
    await db.update(orgUnits).set({ isActive: false, updatedAt: now }).where(eq(orgUnits.id, id));

    await db.insert(auditLogs).values({
      id: `audit-${Date.now()}`,
      action: 'DEACTIVATE_DEPARTMENT',
      module: 'ORGANIZATION',
      details: `Soft-deactivated department '${dept.name}' (${dept.code}) with ${dept.employeeCount || 0} employees`,
      createdAt: now,
    } as any);

    return {
      success: true,
      employeeCount: dept.employeeCount || 0,
      message: `Department '${dept.name}' soft-deactivated successfully (historical records preserved)`,
    };
  }

  async activateDepartment(id: string): Promise<boolean> {
    await ensureOrgSeeded();
    const dept = await this.getDepartmentById(id);
    if (!dept) throw new Error('Department not found');

    // Check if parent division is active
    if (dept.divisionId) {
      const parentDiv = await this.getDivisionById(dept.divisionId);
      if (parentDiv && !parentDiv.isActive) {
        throw new Error(`Cannot activate department because parent division '${parentDiv.name}' is inactive. Please activate the division first.`);
      }
    }

    const now = new Date().toISOString();
    await db.update(departments).set({ isActive: true, updatedAt: now }).where(eq(departments.id, id));
    await db.update(orgUnits).set({ isActive: true, updatedAt: now }).where(eq(orgUnits.id, id));

    await db.insert(auditLogs).values({
      id: `audit-${Date.now()}`,
      action: 'ACTIVATE_DEPARTMENT',
      module: 'ORGANIZATION',
      details: `Activated department '${dept.name}' (${dept.code})`,
      createdAt: now,
    } as any);

    return true;
  }

  // =========================================================================
  // ENTERPRISE ORGANIZATION HIERARCHY TREE
  // Company -> Division -> Department (with stats)
  // =========================================================================

  async getEnterpriseHierarchyTree() {
    await ensureOrgSeeded();
    const [company] = await db.select().from(companies);
    const divisionsList = await this.getDivisions();
    const departmentsList = await this.getDepartments();

    const companyNode = {
      id: company?.id || 'unit-comp-01',
      code: company?.code || 'CMP-01',
      name: company?.name || 'SiteSync Pro Infrastructure Group',
      type: 'COMPANY',
      isActive: true,
      totalDivisions: divisionsList.length,
      activeDivisions: divisionsList.filter((d) => d.isActive).length,
      totalDepartments: departmentsList.length,
      activeDepartments: departmentsList.filter((d) => d.isActive).length,
      totalEmployees: departmentsList.reduce((acc, d) => acc + (d.employeeCount || 0), 0),
      divisions: divisionsList.map((div) => {
        const childDepts = departmentsList.filter((d) => d.divisionId === div.id || d.parentId === div.id);
        return {
          id: div.id,
          code: div.code,
          name: div.name,
          type: 'DIVISION',
          description: div.description,
          displayOrder: div.displayOrder,
          headEmployeeId: div.headEmployeeId,
          headEmployeeName: div.headEmployeeName,
          isActive: div.isActive,
          departmentCount: childDepts.length,
          activeDepartmentCount: childDepts.filter((d) => d.isActive).length,
          employeeCount: childDepts.reduce((sum, d) => sum + (d.employeeCount || 0), 0),
          departments: childDepts.map((d) => ({
            id: d.id,
            code: d.code,
            name: d.name,
            type: 'DEPARTMENT',
            divisionId: div.id,
            divisionName: div.name,
            divisionCode: div.code,
            headEmployeeId: d.headEmployeeId,
            headEmployeeName: d.headEmployeeName,
            color: d.color,
            icon: d.icon,
            displayOrder: d.displayOrder,
            description: d.description,
            isActive: d.isActive,
            employeeCount: d.employeeCount || 0,
            projectCount: d.projectCount || 0,
          })),
        };
      }),
    };

    return companyNode;
  }
}

export const orgRepository = new OrgRepository();

