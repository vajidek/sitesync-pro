import { db } from '../../db';
import {
  projects,
  sites,
  projectMembers,
  dailyProgress,
  tasks,
  taskComments,
  projectDocuments,
  projectMilestones,
  employees,
  equipments,
  vehicles,
  materials,
  projectDepartments,
  projectWorkPackages,
  workPackageTypes,
  projectActivities,
  projectSettings,
  fundingAgencies,
  businessUnits,
  consultants,
  clients,
  currencies,
  projectPriorities,
  projectStatuses,
  projectStructures,
  projectCategories,
  projectTypes,
  contractTypes,
  boqItems,
  materialIssues,
  materialIssueItems,
  purchaseOrders,
  purchaseOrderItems,
  procurementPurchaseOrdersTable,
  fleetFuelLogs,
  procurementWorkOrdersTable,
  procurementRaBillsTable,
  projectCashRequestsTable,
  projectCashSettlementsTable,
  phase61DocumentFiles,
  phase61DocumentMetadata,
} from '../../db/schema';
import { eq, and, ilike, or, desc, asc, isNull, inArray } from 'drizzle-orm';
import { currencyRepository } from './currency.repository';
import { getDocuments as getEdmsDocuments, createDocument as createEdmsDocument, getFolders as getEdmsFolders, createFolder as createEdmsFolder } from './document.repository';
import { isDemoSeedAllowed } from '../config/env';

export interface DbProject {
  id: string;
  projectCode: string;
  projectName: string;
  shortName?: string;
  projectCategoryId?: string;
  projectCategory?: string;
  projectTypeId?: string;
  projectType?: string;
  clientId?: string;
  clientName?: string;
  consultantId?: string;
  consultantName?: string;
  fundingAgencyId?: string;
  fundingAgencyName?: string;
  contractNumber?: string;
  workOrderNumber?: string;
  tenderNumber?: string;
  agreementNumber?: string;
  companyId?: string;
  businessUnitId?: string;
  regionId?: string;
  branchId?: string;
  divisionId?: string;
  parentProjectId?: string;
  customerId?: string;
  customerName?: string;
  location: string;
  state?: string;
  district?: string;
  taluk?: string;
  village?: string;
  latitude?: number;
  longitude?: number;
  startDate: string;
  scheduledCompletionDate?: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  contractValue?: number;
  revisedContractValue?: number;
  budget: number;
  actualSpent?: number;
  progressPercentage?: number;
  currency?: string;
  status: string;
  priority: string;
  projectManagerId?: string;
  projectInchargeId?: string;
  projectSupervisorId?: string;
  description?: string;
  remarks?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface DbSite {
  id: string;
  siteCode: string;
  siteName: string;
  projectId: string;
  address: string;
  latitude?: number;
  longitude?: number;
  googleMapUrl?: string;
  siteEngineerId?: string;
  supervisorId?: string;
  inchargeId?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'SUSPENDED';
  progressPercentage?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbProjectMember {
  id: string;
  projectId: string;
  employeeId: string;
  employeeName?: string;
  departmentId?: string;
  departmentName?: string;
  designation?: string;
  role: string;
  joiningDate: string;
  leavingDate?: string;
  status: string;
  createdAt: string;
}

export interface DbDailyProgress {
  id: string;
  projectId: string;
  siteId: string;
  date: string;
  workCategory: string;
  description: string;
  completionPercentage: number;
  remarks?: string;
  photos?: string[];
  documents?: string[];
  createdById: string;
  createdByName?: string;
  verifiedById?: string;
  verifiedByName?: string;
  approvedById?: string;
  approvedByName?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface DbTask {
  id: string;
  projectId: string;
  siteId?: string;
  title: string;
  description?: string;
  assignedToId?: string;
  assignedToName?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dueDate: string;
  status: 'TODO' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED' | 'BLOCKED';
  milestoneId?: string;
  attachments?: string[];
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbTaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  comment: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface DbProjectDocument {
  id: string;
  projectId: string;
  siteId?: string;
  documentCategory: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  version: string;
  notes?: string;
  uploadedById?: string;
  uploadedByName?: string;
  createdAt: string;
}

export interface DbProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  targetDate: string;
  actualDate?: string;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  delayDays: number;
  description?: string;
  createdAt: string;
}

function mapProjectRow(row: any): DbProject {
  return {
    id: row.id,
    projectCode: row.projectCode,
    projectName: row.projectName,
    shortName: row.shortName ?? undefined,
    projectCategoryId: row.projectCategoryId ?? undefined,
    projectCategory: row.projectCategory ?? undefined,
    projectTypeId: row.projectTypeId ?? undefined,
    projectType: row.projectType ?? undefined,
    clientId: row.clientId ?? undefined,
    clientName: row.clientName ?? undefined,
    consultantId: row.consultantId ?? undefined,
    consultantName: row.consultantName ?? undefined,
    fundingAgencyId: row.fundingAgencyId ?? undefined,
    fundingAgencyName: row.fundingAgencyName ?? undefined,
    contractNumber: row.contractNumber ?? undefined,
    workOrderNumber: row.workOrderNumber ?? undefined,
    tenderNumber: row.tenderNumber ?? undefined,
    agreementNumber: row.agreementNumber ?? undefined,
    companyId: row.companyId ?? undefined,
    businessUnitId: row.businessUnitId ?? undefined,
    regionId: row.regionId ?? undefined,
    branchId: row.branchId ?? undefined,
    divisionId: row.divisionId ?? undefined,
    parentProjectId: row.parentProjectId ?? undefined,
    customerId: row.customerId ?? undefined,
    customerName: row.customerName ?? undefined,
    location: row.location,
    state: row.state ?? undefined,
    district: row.district ?? undefined,
    taluk: row.taluk ?? undefined,
    village: row.village ?? undefined,
    latitude: row.latitude ? Number(row.latitude) : undefined,
    longitude: row.longitude ? Number(row.longitude) : undefined,
    startDate: row.startDate,
    scheduledCompletionDate: row.scheduledCompletionDate ?? undefined,
    targetCompletionDate: row.targetCompletionDate,
    actualCompletionDate: row.actualCompletionDate ?? undefined,
    contractValue: row.contractValue ? Number(row.contractValue) : undefined,
    revisedContractValue: row.revisedContractValue ? Number(row.revisedContractValue) : undefined,
    status: row.status as any,
    priority: row.priority as any,
    budget: Number(row.budget ?? 0),
    actualSpent: row.actualSpent ? Number(row.actualSpent) : undefined,
    progressPercentage: row.progressPercentage ? Number(row.progressPercentage) : undefined,
    currency: row.currency ?? undefined,
    projectManagerId: row.projectManagerId ?? undefined,
    projectInchargeId: row.projectInchargeId ?? undefined,
    projectSupervisorId: row.projectSupervisorId ?? undefined,
    description: row.description ?? undefined,
    remarks: row.remarks ?? undefined,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? undefined,
  };
}

function mapSiteRow(row: any): DbSite {
  return {
    id: row.id,
    siteCode: row.siteCode,
    siteName: row.siteName,
    projectId: row.projectId,
    address: row.address,
    latitude: row.latitude ? Number(row.latitude) : undefined,
    longitude: row.longitude ? Number(row.longitude) : undefined,
    googleMapUrl: row.googleMapUrl ?? undefined,
    siteEngineerId: row.siteEngineerId ?? undefined,
    supervisorId: row.supervisorId ?? undefined,
    inchargeId: row.inchargeId ?? undefined,
    status: row.status as any,
    progressPercentage: row.progressPercentage ? Number(row.progressPercentage) : undefined,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapProjectMemberRow(row: any): DbProjectMember {
  return {
    id: row.id,
    projectId: row.projectId,
    employeeId: row.employeeId,
    employeeName: row.employeeName ?? undefined,
    departmentId: row.departmentId ?? undefined,
    departmentName: row.departmentName ?? undefined,
    designation: row.designation ?? undefined,
    role: row.role,
    joiningDate: row.joiningDate,
    leavingDate: row.leavingDate ?? undefined,
    status: row.status,
    createdAt: row.createdAt,
  };
}

function mapDailyProgressRow(row: any): DbDailyProgress {
  return {
    id: row.id,
    projectId: row.projectId,
    siteId: row.siteId,
    date: row.date,
    workCategory: row.workCategory,
    description: row.description,
    completionPercentage: Number(row.completionPercentage ?? 0),
    remarks: row.remarks ?? undefined,
    photos: Array.isArray(row.photos) ? row.photos : [],
    documents: Array.isArray(row.documents) ? row.documents : [],
    createdById: row.createdById,
    createdByName: row.createdByName ?? undefined,
    verifiedById: row.verifiedById ?? undefined,
    verifiedByName: row.verifiedByName ?? undefined,
    approvedById: row.approvedById ?? undefined,
    approvedByName: row.approvedByName ?? undefined,
    status: row.status as any,
    createdAt: row.createdAt,
  };
}

function mapTaskRow(row: any): DbTask {
  return {
    id: row.id,
    projectId: row.projectId,
    siteId: row.siteId ?? undefined,
    title: row.title,
    description: row.description ?? undefined,
    assignedToId: row.assignedToId ?? undefined,
    assignedToName: row.assignedToName ?? undefined,
    priority: row.priority as any,
    dueDate: row.dueDate,
    status: row.status as any,
    milestoneId: row.milestoneId ?? undefined,
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    createdById: row.createdById,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapTaskCommentRow(row: any): DbTaskComment {
  return {
    id: row.id,
    taskId: row.taskId,
    userId: row.userId,
    userName: row.userName,
    comment: row.comment,
    attachmentUrl: row.attachmentUrl ?? undefined,
    createdAt: row.createdAt,
  };
}

function mapProjectDocumentRow(row: any): DbProjectDocument {
  return {
    id: row.id,
    projectId: row.projectId,
    siteId: row.siteId ?? undefined,
    documentCategory: row.documentCategory as any,
    title: row.title,
    fileUrl: row.fileUrl,
    fileType: row.fileType,
    fileSize: Number(row.fileSize ?? 0),
    version: row.version,
    notes: row.notes ?? undefined,
    uploadedById: row.uploadedById ?? undefined,
    uploadedByName: row.uploadedByName ?? undefined,
    createdAt: row.createdAt,
  };
}

function mapProjectMilestoneRow(row: any): DbProjectMilestone {
  return {
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    targetDate: row.targetDate,
    actualDate: row.actualDate ?? undefined,
    status: row.status as any,
    delayDays: Number(row.delayDays ?? 0),
    description: row.description ?? undefined,
    createdAt: row.createdAt,
  };
}

const genId = (prefix: string) => `${prefix}-${Math.random().toString(36).substring(2, 8)}`;

let isProjectSeeded = false;

export async function ensureProjectSeeded() {
  if (isProjectSeeded) return;

  try {
    const existingProjects = await db.select().from(projects);
    if (existingProjects.length === 0 && isDemoSeedAllowed()) {
      const defaultProjects = [
        {
          id: 'PRJ-101',
          projectCode: 'PRJ-2026-001',
          projectName: 'Al Reem Island Offshore Piping & Structural Hub',
          companyId: 'cmp-101',
          customerId: 'cst-001',
          customerName: 'ADNOC Offshore Expansion',
          location: 'Al Reem Island Industrial Zone, Abu Dhabi',
          latitude: 24.499,
          longitude: 54.408,
          startDate: '2026-01-10',
          targetCompletionDate: '2027-06-30',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          budget: 14500000,
          actualSpent: 4200000,
          progressPercentage: 42,
          projectManagerId: 'usr-mgr-002',
          projectInchargeId: 'usr-inc-003',
          projectSupervisorId: 'emp-003',
          description: 'Design, fabrication, hydro-testing, and erection of high-pressure piping infrastructure and structural framework.',
          isActive: true,
          createdAt: '2026-01-10T08:00:00.000Z',
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'PRJ-102',
          projectCode: 'PRJ-2026-002',
          projectName: 'Jebel Ali Substation Structural Expansion',
          companyId: 'cmp-101',
          customerId: 'cst-001',
          customerName: 'DEWA Infrastructure Subcontract',
          location: 'Jebel Ali Industrial Zone 2, Dubai',
          latitude: 24.985,
          longitude: 55.089,
          startDate: '2026-03-01',
          targetCompletionDate: '2026-11-15',
          status: 'PLANNING',
          priority: 'CRITICAL',
          budget: 8200000,
          actualSpent: 650000,
          progressPercentage: 15,
          projectManagerId: 'usr-mgr-002',
          projectInchargeId: 'usr-inc-003',
          description: 'Civil foundation piling, structural steel truss installation, and electrical cable conduit piping.',
          isActive: true,
          createdAt: '2026-03-01T08:00:00.000Z',
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'PRJ-103',
          projectCode: 'PRJ-2025-089',
          projectName: 'Mussafah Heavy Industrial Warehouse Jetty',
          companyId: 'cmp-101',
          customerId: 'cst-001',
          customerName: 'Mussafah Port Authority',
          location: 'Mussafah Port Industrial Area, Abu Dhabi',
          latitude: 24.36,
          longitude: 54.485,
          startDate: '2025-05-15',
          targetCompletionDate: '2026-02-28',
          actualCompletionDate: '2026-02-20',
          status: 'COMPLETED',
          priority: 'MEDIUM',
          budget: 19800000,
          actualSpent: 19200000,
          progressPercentage: 100,
          projectManagerId: 'usr-mgr-002',
          description: 'Marine jetty structural piling, heavy crane track installation, and fuel distribution pipe header.',
          isActive: true,
          createdAt: '2025-05-15T08:00:00.000Z',
          updatedAt: new Date().toISOString(),
        },
      ];
      for (const p of defaultProjects) {
        await db.insert(projects).values(p).onConflictDoNothing();
      }
    }

    const existingSites = await db.select().from(sites);
    if (existingSites.length === 0 && isDemoSeedAllowed()) {
      const defaultSites = [
        {
          id: 'sit-001',
          siteCode: 'SITE-REEM-A',
          siteName: 'Reem Offshore Yard Alpha',
          projectId: 'PRJ-101',
          address: 'Sector 4 North Jetty, Al Reem Island, Abu Dhabi',
          latitude: 24.499,
          longitude: 54.408,
          googleMapUrl: 'https://maps.google.com/?q=24.499,54.408',
          siteEngineerId: 'emp-003',
          supervisorId: 'emp-003',
          inchargeId: 'usr-inc-003',
          status: 'ACTIVE',
          progressPercentage: 54,
          isActive: true,
          createdAt: '2026-01-12T08:00:00.000Z',
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'sit-002',
          siteCode: 'SITE-REEM-B',
          siteName: 'Reem Pipeline Trench South',
          projectId: 'PRJ-101',
          address: 'Sector 4 South Trench, Al Reem Island, Abu Dhabi',
          latitude: 24.492,
          longitude: 54.402,
          googleMapUrl: 'https://maps.google.com/?q=24.492,54.402',
          siteEngineerId: 'emp-003',
          supervisorId: 'emp-003',
          inchargeId: 'usr-inc-003',
          status: 'ACTIVE',
          progressPercentage: 30,
          isActive: true,
          createdAt: '2026-01-15T08:00:00.000Z',
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'sit-003',
          siteCode: 'SITE-JBL-1',
          siteName: 'Jebel Ali Main Foundation Substation',
          projectId: 'PRJ-102',
          address: 'Plot 88, Jebel Ali Industrial 2, Dubai',
          latitude: 24.985,
          longitude: 55.089,
          googleMapUrl: 'https://maps.google.com/?q=24.985,55.089',
          siteEngineerId: 'emp-003',
          inchargeId: 'usr-inc-003',
          status: 'ACTIVE',
          progressPercentage: 15,
          isActive: true,
          createdAt: '2026-03-02T08:00:00.000Z',
          updatedAt: new Date().toISOString(),
        },
      ];
      for (const s of defaultSites) {
        await db.insert(sites).values(s).onConflictDoNothing();
      }
    }

    const existingMembers = await db.select().from(projectMembers);
    if (existingMembers.length === 0 && isDemoSeedAllowed()) {
      const defaultMembers = [
        { id: 'mem-001', projectId: 'PRJ-101', employeeId: 'emp-001', employeeName: 'Abdul Vajid EK', role: 'MANAGER', joiningDate: '2026-01-10', status: 'ACTIVE', createdAt: new Date().toISOString() },
        { id: 'mem-002', projectId: 'PRJ-101', employeeId: 'emp-002', employeeName: 'Sarah Al-Mansoor', role: 'MANAGER', joiningDate: '2026-01-10', status: 'ACTIVE', createdAt: new Date().toISOString() },
        { id: 'mem-003', projectId: 'PRJ-101', employeeId: 'emp-003', employeeName: 'Tariq Al-Farsi', role: 'INCHARGE', joiningDate: '2026-01-12', status: 'ACTIVE', createdAt: new Date().toISOString() },
        { id: 'mem-004', projectId: 'PRJ-101', employeeId: 'emp-004', employeeName: 'Ramesh Patel', role: 'STORE_KEEPER', joiningDate: '2026-01-12', status: 'ACTIVE', createdAt: new Date().toISOString() },
        { id: 'mem-005', projectId: 'PRJ-101', employeeId: 'emp-005', employeeName: 'Vikram Singh', role: 'OPERATOR', joiningDate: '2026-01-15', status: 'ACTIVE', createdAt: new Date().toISOString() },
      ];
      for (const m of defaultMembers) {
        await db.insert(projectMembers).values(m).onConflictDoNothing();
      }
    }

    const existingDailyProgress = await db.select().from(dailyProgress);
    if (existingDailyProgress.length === 0 && isDemoSeedAllowed()) {
      const defaultDailyProgress = [
        {
          id: 'dpr-001',
          projectId: 'PRJ-101',
          siteId: 'sit-001',
          date: '2026-07-30',
          workCategory: 'Mechanical Piping Fabrication',
          description: 'Completed fit-up and TIG welding of 12-inch Schedule 80 carbon steel spool joints #14 through #18. NDT dye-penetrant test verified.',
          completionPercentage: 45,
          remarks: 'Pre-heating held at 150°C. 4 welders engaged on 12hr shift.',
          photos: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80'],
          documents: ['https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=600&q=80'],
          createdById: 'usr-inc-003',
          createdByName: 'Tariq Al-Farsi',
          verifiedById: 'usr-mgr-002',
          verifiedByName: 'Sarah Al-Mansoor',
          approvedById: 'usr-admin-001',
          approvedByName: 'Abdul Vajid EK',
          status: 'APPROVED',
          createdAt: '2026-07-30T17:30:00.000Z',
        },
        {
          id: 'dpr-002',
          projectId: 'PRJ-101',
          siteId: 'sit-002',
          date: '2026-08-01',
          workCategory: 'Civil Pipeline Trenching',
          description: 'Excavated 120m linear trench at Sector 4 South. Sand bedding laid and compacted to 98% Proctor density.',
          completionPercentage: 30,
          remarks: 'Groundwater dewatering pumps running continuously.',
          photos: ['https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=600&q=80'],
          documents: [],
          createdById: 'usr-inc-003',
          createdByName: 'Tariq Al-Farsi',
          verifiedById: 'usr-mgr-002',
          verifiedByName: 'Sarah Al-Mansoor',
          status: 'VERIFIED',
          createdAt: '2026-08-01T16:00:00.000Z',
        },
      ];
      for (const dp of defaultDailyProgress) {
        await db.insert(dailyProgress).values(dp).onConflictDoNothing();
      }
    }

    const existingTasks = await db.select().from(tasks);
    if (existingTasks.length === 0 && isDemoSeedAllowed()) {
      const defaultTasks = [
        {
          id: 'tsk-001',
          projectId: 'PRJ-101',
          siteId: 'sit-001',
          title: 'Hydro-testing 12" Carbon Steel Piping Line A',
          description: 'Conduct 24-hour hydrostatic pressure test at 45 bar holding pressure per ASME B31.3 specs.',
          assignedToId: 'emp-003',
          assignedToName: 'Tariq Al-Farsi',
          priority: 'HIGH',
          dueDate: '2026-08-10',
          status: 'IN_PROGRESS',
          milestoneId: 'mls-002',
          attachments: [],
          createdById: 'usr-mgr-002',
          createdAt: '2026-07-25T09:00:00.000Z',
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'tsk-002',
          projectId: 'PRJ-101',
          siteId: 'sit-001',
          title: 'Calibrate Crane Load Cells & Rigging Shackles',
          description: 'Third-party safety certification inspection for 100T Liebherr Mobile Crane prior to heavy spool erection.',
          assignedToId: 'emp-005',
          assignedToName: 'Vikram Singh',
          priority: 'CRITICAL',
          dueDate: '2026-08-05',
          status: 'UNDER_REVIEW',
          milestoneId: 'mls-002',
          createdById: 'usr-admin-001',
          createdAt: '2026-07-28T11:00:00.000Z',
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'tsk-003',
          projectId: 'PRJ-102',
          siteId: 'sit-003',
          title: 'Soil Compaction & Piling Rig Mobilization',
          description: 'Clear site boundary and position heavy pile driving rigs for transformer yard foundation.',
          assignedToId: 'emp-003',
          assignedToName: 'Tariq Al-Farsi',
          priority: 'MEDIUM',
          dueDate: '2026-08-20',
          status: 'TODO',
          createdById: 'usr-mgr-002',
          createdAt: '2026-07-29T14:00:00.000Z',
          updatedAt: new Date().toISOString(),
        },
      ];
      for (const t of defaultTasks) {
        await db.insert(tasks).values(t).onConflictDoNothing();
      }
    }

    const existingTaskComments = await db.select().from(taskComments);
    if (existingTaskComments.length === 0 && isDemoSeedAllowed()) {
      const defaultTaskComments = [
        {
          id: 'tsc-001',
          taskId: 'tsk-001',
          userId: 'usr-inc-003',
          userName: 'Tariq Al-Farsi',
          comment: 'Calibrated pressure gauges installed. Water fill complete and air venting in progress.',
          createdAt: '2026-07-31T10:15:00.000Z',
        },
      ];
      for (const tc of defaultTaskComments) {
        await db.insert(taskComments).values(tc).onConflictDoNothing();
      }
    }

    const existingDocuments = await db.select().from(projectDocuments);
    if (existingDocuments.length === 0 && isDemoSeedAllowed()) {
      const defaultDocuments = [
        {
          id: 'doc-101',
          projectId: 'PRJ-101',
          siteId: 'sit-001',
          documentCategory: 'DRAWING',
          title: 'Approved Piping Isometric Layout - Revision 3',
          fileUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=600&q=80',
          fileType: 'application/pdf',
          fileSize: 4850000,
          version: 'v3.0',
          notes: 'Approved by ADNOC Technical Review Board',
          uploadedById: 'usr-admin-001',
          uploadedByName: 'Abdul Vajid EK',
          createdAt: '2026-01-20T10:00:00.000Z',
        },
        {
          id: 'doc-102',
          projectId: 'PRJ-101',
          siteId: 'sit-001',
          documentCategory: 'BOQ',
          title: 'Bill of Quantities (BOQ) - Steel & Piping Master Schedule',
          fileUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
          fileType: 'application/xlsx',
          fileSize: 1200000,
          version: 'v1.2',
          notes: 'Updated unit costs for Q2 2026 material requisitions',
          uploadedById: 'usr-mgr-002',
          uploadedByName: 'Sarah Al-Mansoor',
          createdAt: '2026-02-05T14:20:00.000Z',
        },
        {
          id: 'doc-103',
          projectId: 'PRJ-101',
          siteId: 'sit-001',
          documentCategory: 'METHOD_STATEMENT',
          title: 'Method Statement - High Pressure TIG Welding & NDT Inspection',
          fileUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
          fileType: 'application/pdf',
          fileSize: 2300000,
          version: 'v1.0',
          notes: 'Includes WPS/PQR certificates and safety risk assessment',
          uploadedById: 'usr-inc-003',
          uploadedByName: 'Tariq Al-Farsi',
          createdAt: '2026-03-10T11:00:00.000Z',
        },
      ];
      for (const pd of defaultDocuments) {
        await db.insert(projectDocuments).values(pd).onConflictDoNothing();
      }
    }

    const existingMilestones = await db.select().from(projectMilestones);
    if (existingMilestones.length === 0 && isDemoSeedAllowed()) {
      const defaultMilestones = [
        {
          id: 'mls-001',
          projectId: 'PRJ-101',
          title: 'Phase 1: Civil Foundation & Pipe Trench Excavation',
          targetDate: '2026-03-31',
          actualDate: '2026-03-25',
          status: 'COMPLETED',
          delayDays: 0,
          description: 'Site clearance, soil compaction, and foundation pour for pipe racks.',
          createdAt: '2026-01-10T08:00:00.000Z',
        },
        {
          id: 'mls-002',
          projectId: 'PRJ-101',
          title: 'Phase 2: 12-inch CS Piping Spool Fabrication & Welding',
          targetDate: '2026-08-15',
          status: 'IN_PROGRESS',
          delayDays: 3,
          description: 'Pre-fabrication at shop yard and field seam welding.',
          createdAt: '2026-01-10T08:00:00.000Z',
        },
        {
          id: 'mls-003',
          projectId: 'PRJ-101',
          title: 'Phase 3: Hydrotesting & Commissioning Line Headers',
          targetDate: '2026-12-31',
          status: 'UPCOMING',
          delayDays: 0,
          description: 'Pressure testing, chemical cleaning, and tie-in connections.',
          createdAt: '2026-01-10T08:00:00.000Z',
        },
      ];
      for (const pm of defaultMilestones) {
        await db.insert(projectMilestones).values(pm).onConflictDoNothing();
      }
    }

    // Seed Master Data
    const nowStr = new Date().toISOString();
    const existingFunding = await db.select().from(fundingAgencies);
    if (existingFunding.length === 0) {
      await db.insert(fundingAgencies).values([
        { id: 'fnd-001', code: 'WB-01', name: 'World Bank Infrastructure Fund', contactPerson: 'John Smith', email: 'wb-infra@worldbank.org', description: 'Global Infrastructure Development Grant', isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'fnd-002', code: 'JICA-01', name: 'Japan International Cooperation Agency (JICA)', contactPerson: 'Kenji Sato', email: 'jica-projects@jica.go.jp', description: 'Bilateral ODA Infrastructure Loan', isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'fnd-003', code: 'ST-GOV', name: 'State Government Infrastructure Grant', contactPerson: 'Finance Department', email: 'grants@state.gov.in', description: 'State Capital Expenditure Allocation', isActive: true, createdAt: nowStr, updatedAt: nowStr },
      ]).onConflictDoNothing();
    }

    const existingConsultants = await db.select().from(consultants);
    if (existingConsultants.length === 0) {
      await db.insert(consultants).values([
        { id: 'cns-001', code: 'TCE-01', name: 'Tata Consulting Engineers Ltd (TCE)', contactPerson: 'R. K. Sharma', email: 'projects@tce.co.in', description: 'Principal PMC & Engineering Consultant', isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'cns-002', code: 'EGIS-01', name: 'Egis India Consulting Engineers', contactPerson: 'P. Verma', email: 'info@egis-india.com', description: 'Infrastructure Design Consultant', isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'cns-003', code: 'MOT-01', name: 'Mott MacDonald Infrastructure', contactPerson: 'S. Mehta', email: 'contact@mottmac.com', description: 'Technical & Quality Auditor', isActive: true, createdAt: nowStr, updatedAt: nowStr },
      ]).onConflictDoNothing();
    }

    const existingClients = await db.select().from(clients);
    if (existingClients.length === 0) {
      await db.insert(clients).values([
        { id: 'clt-001', code: 'CLT-WAT-01', name: 'State Water & Utilities Authority', contactPerson: 'Superintending Engineer', email: 'se.utilities@gov.state.in', address: 'Central Infrastructure District', description: 'State Water Department', isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'clt-002', code: 'ADNOC-01', name: 'Abu Dhabi National Oil Company (ADNOC)', contactPerson: 'Procurement Division', email: 'procurement@adnoc.ae', address: 'Abu Dhabi, UAE', description: 'Offshore Energy & Petrochemicals Authority', isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'clt-003', code: 'DEWA-01', name: 'Dubai Electricity & Water Authority (DEWA)', contactPerson: 'Projects Head', email: 'dewa.projects@dewa.gov.ae', address: 'Dubai, UAE', description: 'Public Utility Corporation', isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'clt-004', code: 'PWD-01', name: 'Public Works Department (PWD)', contactPerson: 'Executive Engineer', email: 'ee.pwd@state.gov.in', address: 'Ernakulam, Kerala', description: 'Roads & Bridges Department', isActive: true, createdAt: nowStr, updatedAt: nowStr },
      ]).onConflictDoNothing();
    }

    const existingCurrencies = await db.select().from(currencies);
    if (existingCurrencies.length === 0) {
      await db.insert(currencies).values([
        { id: 'cur-001', code: 'INR', name: 'Indian Rupee', symbol: '₹', exchangeRate: 1.0, isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'cur-002', code: 'AED', name: 'UAE Dirham', symbol: 'AED', exchangeRate: 22.5, isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'cur-003', code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 83.2, isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'cur-004', code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 90.1, isActive: true, createdAt: nowStr, updatedAt: nowStr },
      ]).onConflictDoNothing();
    }

    const existingPriorities = await db.select().from(projectPriorities);
    if (existingPriorities.length === 0) {
      await db.insert(projectPriorities).values([
        { id: 'prio-1', code: 'LOW', name: 'Low Priority', displayOrder: 1, isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'prio-2', code: 'MEDIUM', name: 'Medium Priority', displayOrder: 2, isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'prio-3', code: 'HIGH', name: 'High Priority', displayOrder: 3, isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'prio-4', code: 'CRITICAL', name: 'Critical Priority', displayOrder: 4, isActive: true, createdAt: nowStr, updatedAt: nowStr },
      ]).onConflictDoNothing();
    }

    const existingStatuses = await db.select().from(projectStatuses);
    if (existingStatuses.length === 0) {
      await db.insert(projectStatuses).values([
        { id: 'st-1', code: 'PLANNING', name: 'Planning & Design', displayOrder: 1, isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'st-2', code: 'TENDER', name: 'Tender & Bidding', displayOrder: 2, isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'st-3', code: 'AWARDED', name: 'Awarded', displayOrder: 3, isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'st-4', code: 'MOBILIZATION', name: 'Site Mobilization', displayOrder: 4, isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'st-5', code: 'RUNNING', name: 'Running / Execution', displayOrder: 5, isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'st-6', code: 'ON_HOLD', name: 'On Hold', displayOrder: 6, isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'st-7', code: 'COMPLETED', name: 'Completed & Handed Over', displayOrder: 7, isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'st-8', code: 'CLOSED', name: 'Closed', displayOrder: 8, isActive: true, createdAt: nowStr, updatedAt: nowStr },
      ]).onConflictDoNothing();
    }

    const existingCategories = await db.select().from(projectCategories);
    if (existingCategories.length === 0) {
      await db.insert(projectCategories).values([
        { id: 'pcat-001', code: 'WATER_INFRA', name: 'Water & Wastewater Infrastructure', description: 'WTP, STP, Pump Houses, Reservoirs & Networks', isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'pcat-002', code: 'PIPELINE_NET', name: 'Pipeline & Utility Networks', description: 'Cross-country, urban distribution & industrial piping', isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'pcat-003', code: 'CIVIL_BUILDING', name: 'Buildings & Heavy Civil Works', description: 'Admin, Commercial, Residential & Industrial Structures', isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'pcat-004', code: 'ROADS_BRIDGES', name: 'Roads, Bridges & Transportation', description: 'Highways, Access Roads, Bridges & Flyovers', isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'pcat-005', code: 'POWER_ELECTRICAL', name: 'Power & Electrical Substations', description: 'High Voltage Substations, Transmission Lines & Solar', isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'pcat-006', code: 'PROCESS_PLANT', name: 'Process & Industrial Plants', description: 'Oil & Gas, Chemical, Petrochemical & Fabrication Yards', isActive: true, createdAt: nowStr, updatedAt: nowStr },
      ]).onConflictDoNothing();
    }

    const existingTypes = await db.select().from(projectTypes);
    if (existingTypes.length === 0) {
      await db.insert(projectTypes).values([
        { id: 'ptype-001', code: 'WTP', name: 'Water Treatment Plant (WTP)', categoryId: 'pcat-001', categoryName: 'Water & Wastewater Infrastructure', description: 'Raw water purification & treatment plant', isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'ptype-002', code: 'STP', name: 'Sewage Treatment Plant (STP)', categoryId: 'pcat-001', categoryName: 'Water & Wastewater Infrastructure', description: 'Municipal & industrial sewage treatment plant', isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'ptype-003', code: 'WSS', name: 'Water Supply Scheme (WSS)', categoryId: 'pcat-001', categoryName: 'Water & Wastewater Infrastructure', description: 'Urban & rural comprehensive water supply scheme', isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'ptype-004', code: 'PIPELINE', name: 'Transmission & Distribution Pipelines', categoryId: 'pcat-002', categoryName: 'Pipeline & Utility Networks', description: 'MS, DI, HDPE, CS & SS pipeline networks', isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'ptype-005', code: 'PUMP_HOUSE', name: 'Raw & Clear Water Pump House', categoryId: 'pcat-001', categoryName: 'Water & Wastewater Infrastructure', description: 'Heavy vertical turbine & centrifugal pump house', isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'ptype-006', code: 'RESERVOIR', name: 'Storage Reservoirs (OHSR/GLSR)', categoryId: 'pcat-001', categoryName: 'Water & Wastewater Infrastructure', description: 'Overhead & ground level service reservoirs', isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'ptype-007', code: 'ROADS', name: 'Highways, Access Roads & Paving', categoryId: 'pcat-004', categoryName: 'Roads, Bridges & Transportation', description: 'Bituminous & concrete pavement works', isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'ptype-008', code: 'BUILDING', name: 'Commercial, Residential & Admin Towers', categoryId: 'pcat-003', categoryName: 'Buildings & Heavy Civil Works', description: 'Multi-story RCC & structural steel buildings', isActive: true, createdAt: nowStr, updatedAt: nowStr },
      ]).onConflictDoNothing();
    }

    const existingContractTypes = await db.select().from(contractTypes);
    if (existingContractTypes.length === 0) {
      await db.insert(contractTypes).values([
        { id: 'ctyp-001', code: 'ITEM_RATE', name: 'Item Rate Contract (B1/B2)', description: 'Bill of Quantities item-rate schedule', isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'ctyp-002', code: 'EPC', name: 'EPC Turnkey Contract', description: 'Engineering, Procurement & Construction turnkey', isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'ctyp-003', code: 'LUMPSUM', name: 'Lumpsum Design-Build', description: 'Fixed price lumpsum contract', isActive: true, createdAt: nowStr, updatedAt: nowStr },
        { id: 'ctyp-004', code: 'HAM', name: 'Hybrid Annuity Model (HAM)', description: 'Public-Private Partnership annuity model', isActive: true, createdAt: nowStr, updatedAt: nowStr },
      ]).onConflictDoNothing();
    }

    isProjectSeeded = true;
  } catch (err) {
    console.error('Project seed error:', err);
  }
}

export class ProjectRepository {
  // --- PROJECTS CRUD ---
  async findAllProjects(params: {
    search?: string;
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
  } = {}) {
    await ensureProjectSeeded();
    const rows = await db.select().from(projects);
    let list = rows.map(mapProjectRow).filter((p) => p.isActive);

    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.projectName.toLowerCase().includes(q) ||
          p.projectCode.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          (p.customerName && p.customerName.toLowerCase().includes(q))
      );
    }

    if (params.status) {
      list = list.filter((p) => p.status === params.status);
    }

    if (params.priority) {
      list = list.filter((p) => p.priority === params.priority);
    }

    const page = params.page || 1;
    const limit = params.limit || 20;
    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      projects: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findProjectById(id: string): Promise<DbProject | null> {
    await ensureProjectSeeded();
    const [row] = await db.select().from(projects).where(and(eq(projects.id, id), eq(projects.isActive, true)));
    return row ? mapProjectRow(row) : null;
  }

  async createProject(data: Partial<DbProject>): Promise<DbProject> {
    await ensureProjectSeeded();

    const now = new Date().toISOString();
    const projectName = String(data.projectName || '').trim();
    const location = String(data.location || '').trim();
    const currency = String(data.currency || '').trim().toUpperCase();
    const projectCode = String(data.projectCode || '').trim();
    const startDate = String(data.startDate || '').trim();
    const targetCompletionDate = String(data.targetCompletionDate || '').trim();
    const budget = Number(data.budget);

    if (!projectName || !location || !currency || !projectCode || !startDate || !targetCompletionDate) {
      throw new Error('Project code, name, location, currency, start date and target completion date are required.');
    }
    if (!Number.isFinite(budget) || budget < 0) {
      throw new Error('Project budget must be a valid non-negative number.');
    }

    let companyId = String(data.companyId || '').trim();
    if (!companyId) {
      const companyRows = await db
        .select({ companyId: businessUnits.companyId })
        .from(businessUnits)
        .where(eq(businessUnits.isActive, true))
        .limit(20);

      const uniqueCompanyIds = [...new Set(companyRows.map((row) => row.companyId).filter(Boolean))];
      if (uniqueCompanyIds.length === 1) {
        companyId = uniqueCompanyIds[0];
      } else {
        throw new Error('Company context is required to create a project when the organization has multiple or no active company mappings.');
      }
    }

    const duplicateCode = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.projectCode, projectCode))
      .limit(1);

    if (duplicateCode.length > 0) {
      throw new Error(`Project code ${projectCode} already exists.`);
    }

    const newId = `PRJ-${Date.now()}`;
    const newProjectRecord = {
      id: newId,
      projectCode,
      projectName,
      shortName: data.shortName ?? null,
      projectCategoryId: data.projectCategoryId ?? null,
      projectCategory: data.projectCategory ?? null,
      projectTypeId: data.projectTypeId ?? null,
      projectType: data.projectType ?? null,
      clientId: data.clientId ?? null,
      clientName: data.clientName ?? null,
      consultantId: data.consultantId ?? null,
      consultantName: data.consultantName ?? null,
      fundingAgencyId: data.fundingAgencyId ?? null,
      fundingAgencyName: data.fundingAgencyName ?? null,
      contractNumber: data.contractNumber ?? null,
      workOrderNumber: data.workOrderNumber ?? null,
      tenderNumber: data.tenderNumber ?? null,
      agreementNumber: data.agreementNumber ?? null,
      companyId,
      businessUnitId: data.businessUnitId ?? null,
      regionId: data.regionId ?? null,
      branchId: data.branchId ?? null,
      divisionId: data.divisionId ?? null,
      parentProjectId: data.parentProjectId ?? null,
      customerId: data.customerId ?? null,
      customerName: data.customerName ?? null,
      location,
      state: data.state ?? null,
      district: data.district ?? null,
      taluk: data.taluk ?? null,
      village: data.village ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      startDate,
      scheduledCompletionDate: data.scheduledCompletionDate ?? null,
      targetCompletionDate,
      actualCompletionDate: data.actualCompletionDate ?? null,
      contractValue: data.contractValue !== undefined ? Number(data.contractValue) : 0,
      revisedContractValue: data.revisedContractValue !== undefined ? Number(data.revisedContractValue) : 0,
      budget,
      actualSpent: data.actualSpent !== undefined ? Number(data.actualSpent) : 0,
      progressPercentage: data.progressPercentage !== undefined ? Number(data.progressPercentage) : 0,
      currency,
      status: data.status || 'PLANNING',
      priority: data.priority || 'MEDIUM',
      projectManagerId: data.projectManagerId ?? null,
      projectInchargeId: data.projectInchargeId ?? null,
      projectSupervisorId: data.projectSupervisorId ?? null,
      description: data.description || '',
      remarks: data.remarks ?? null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    return await db.transaction(async (tx) => {
      await tx.insert(projects).values(newProjectRecord as any);

      // A project does not silently create a fake operational site.
      // The caller may explicitly request the initial site through createInitialSite.
      if ((data as any).createInitialSite === true) {
        const defaultSiteRecord = {
          id: genId('sit'),
          siteCode: `${projectCode}-S1`,
          siteName: data.shortName ? `${data.shortName} Site` : `${projectName} Site`,
          projectId: newId,
          address: location,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          googleMapUrl: data.latitude != null && data.longitude != null ? `https://maps.google.com/?q=${data.latitude},${data.longitude}` : null,
          inchargeId: data.projectInchargeId ?? null,
          status: 'ACTIVE',
          progressPercentage: 0,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        };

        await tx.insert(sites).values(defaultSiteRecord);
      }

      return mapProjectRow(newProjectRecord);
    });
  }
  async updateProject(id: string, updates: Partial<DbProject>): Promise<DbProject | null> {
    await ensureProjectSeeded();
    const existing = await this.findProjectById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const payload: Record<string, any> = { updatedAt: now };

    if (updates.projectCode !== undefined) payload.projectCode = updates.projectCode;
    if (updates.projectName !== undefined) payload.projectName = updates.projectName;
    if (updates.shortName !== undefined) payload.shortName = updates.shortName;
    if (updates.projectCategoryId !== undefined) payload.projectCategoryId = updates.projectCategoryId;
    if (updates.projectCategory !== undefined) payload.projectCategory = updates.projectCategory;
    if (updates.projectTypeId !== undefined) payload.projectTypeId = updates.projectTypeId;
    if (updates.projectType !== undefined) payload.projectType = updates.projectType;
    if (updates.clientId !== undefined) payload.clientId = updates.clientId;
    if (updates.clientName !== undefined) payload.clientName = updates.clientName;
    if (updates.consultantId !== undefined) payload.consultantId = updates.consultantId;
    if (updates.consultantName !== undefined) payload.consultantName = updates.consultantName;
    if (updates.fundingAgencyId !== undefined) payload.fundingAgencyId = updates.fundingAgencyId;
    if (updates.fundingAgencyName !== undefined) payload.fundingAgencyName = updates.fundingAgencyName;
    if (updates.contractNumber !== undefined) payload.contractNumber = updates.contractNumber;
    if (updates.workOrderNumber !== undefined) payload.workOrderNumber = updates.workOrderNumber;
    if (updates.tenderNumber !== undefined) payload.tenderNumber = updates.tenderNumber;
    if (updates.agreementNumber !== undefined) payload.agreementNumber = updates.agreementNumber;
    if (updates.companyId !== undefined) payload.companyId = updates.companyId;
    if (updates.businessUnitId !== undefined) payload.businessUnitId = updates.businessUnitId;
    if (updates.regionId !== undefined) payload.regionId = updates.regionId;
    if (updates.branchId !== undefined) payload.branchId = updates.branchId;
    if (updates.divisionId !== undefined) payload.divisionId = updates.divisionId;
    if (updates.parentProjectId !== undefined) payload.parentProjectId = updates.parentProjectId;
    if (updates.customerId !== undefined) payload.customerId = updates.customerId;
    if (updates.customerName !== undefined) payload.customerName = updates.customerName;
    if (updates.location !== undefined) payload.location = updates.location;
    if (updates.state !== undefined) payload.state = updates.state;
    if (updates.district !== undefined) payload.district = updates.district;
    if (updates.taluk !== undefined) payload.taluk = updates.taluk;
    if (updates.village !== undefined) payload.village = updates.village;
    if (updates.latitude !== undefined) payload.latitude = updates.latitude;
    if (updates.longitude !== undefined) payload.longitude = updates.longitude;
    if (updates.startDate !== undefined) payload.startDate = updates.startDate;
    if (updates.scheduledCompletionDate !== undefined) payload.scheduledCompletionDate = updates.scheduledCompletionDate;
    if (updates.targetCompletionDate !== undefined) payload.targetCompletionDate = updates.targetCompletionDate;
    if (updates.actualCompletionDate !== undefined) payload.actualCompletionDate = updates.actualCompletionDate;
    if (updates.contractValue !== undefined) payload.contractValue = String(updates.contractValue);
    if (updates.revisedContractValue !== undefined) payload.revisedContractValue = String(updates.revisedContractValue);
    if (updates.budget !== undefined) payload.budget = String(updates.budget);
    if (updates.actualSpent !== undefined) payload.actualSpent = String(updates.actualSpent);
    if (updates.progressPercentage !== undefined) payload.progressPercentage = Number(updates.progressPercentage);
    if (updates.currency !== undefined) payload.currency = updates.currency;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.projectManagerId !== undefined) payload.projectManagerId = updates.projectManagerId;
    if (updates.projectInchargeId !== undefined) payload.projectInchargeId = updates.projectInchargeId;
    if (updates.projectSupervisorId !== undefined) payload.projectSupervisorId = updates.projectSupervisorId;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.remarks !== undefined) payload.remarks = updates.remarks;
    if (updates.isActive !== undefined) payload.isActive = updates.isActive;

    await db.update(projects).set(payload).where(eq(projects.id, id));
    return this.findProjectById(id);
  }

  async archiveProject(id: string): Promise<boolean> {
    await ensureProjectSeeded();
    const existing = await this.findProjectById(id);
    if (!existing) return false;

    const now = new Date().toISOString();
    await db.update(projects).set({ status: 'ARCHIVED', updatedAt: now }).where(eq(projects.id, id));
    return true;
  }

  async deleteProject(id: string): Promise<boolean> {
    await ensureProjectSeeded();
    const now = new Date().toISOString();
    await db.update(projects).set({ isActive: false, status: 'CANCELLED', updatedAt: now }).where(eq(projects.id, id));
    return true;
  }

  async restoreProject(id: string): Promise<boolean> {
    await ensureProjectSeeded();
    const now = new Date().toISOString();
    await db.update(projects).set({ isActive: true, status: 'PLANNING', updatedAt: now }).where(eq(projects.id, id));
    return true;
  }

  // --- SITES CRUD ---
  async findSitesByProjectId(projectId: string): Promise<DbSite[]> {
    await ensureProjectSeeded();
    const rows = await db.select().from(sites).where(and(eq(sites.projectId, projectId), eq(sites.isActive, true)));
    return rows.map(mapSiteRow);
  }

  async createSite(data: Partial<DbSite>): Promise<DbSite> {
    await ensureProjectSeeded();
    const now = new Date().toISOString();
    const newRecord = {
      id: genId('sit'),
      siteCode: data.siteCode || `SITE-${Math.floor(100 + Math.random() * 900)}`,
      siteName: data.siteName || 'New Execution Site',
      projectId: data.projectId!,
      address: data.address || '',
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      googleMapUrl: data.googleMapUrl || (data.latitude && data.longitude ? `https://maps.google.com/?q=${data.latitude},${data.longitude}` : null),
      siteEngineerId: data.siteEngineerId ?? null,
      supervisorId: data.supervisorId ?? null,
      inchargeId: data.inchargeId ?? null,
      status: data.status || 'ACTIVE',
      progressPercentage: Number(data.progressPercentage) || 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(sites).values(newRecord);
    return mapSiteRow(newRecord);
  }

  async updateSite(id: string, updates: Partial<DbSite>): Promise<DbSite | null> {
    await ensureProjectSeeded();
    const [existing] = await db.select().from(sites).where(eq(sites.id, id));
    if (!existing) return null;

    const now = new Date().toISOString();
    const payload: Record<string, any> = { updatedAt: now };

    if (updates.siteCode !== undefined) payload.siteCode = updates.siteCode;
    if (updates.siteName !== undefined) payload.siteName = updates.siteName;
    if (updates.address !== undefined) payload.address = updates.address;
    if (updates.latitude !== undefined) payload.latitude = updates.latitude;
    if (updates.longitude !== undefined) payload.longitude = updates.longitude;
    if (updates.googleMapUrl !== undefined) payload.googleMapUrl = updates.googleMapUrl;
    if (updates.siteEngineerId !== undefined) payload.siteEngineerId = updates.siteEngineerId;
    if (updates.supervisorId !== undefined) payload.supervisorId = updates.supervisorId;
    if (updates.inchargeId !== undefined) payload.inchargeId = updates.inchargeId;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.progressPercentage !== undefined) payload.progressPercentage = Number(updates.progressPercentage);
    if (updates.isActive !== undefined) payload.isActive = updates.isActive;

    await db.update(sites).set(payload).where(eq(sites.id, id));
    const [updated] = await db.select().from(sites).where(eq(sites.id, id));
    return updated ? mapSiteRow(updated) : null;
  }

  // --- PROJECT MEMBERS ---
  async findMembersByProjectId(projectId: string): Promise<DbProjectMember[]> {
    await ensureProjectSeeded();
    const rows = await db.select().from(projectMembers).where(eq(projectMembers.projectId, projectId));
    return rows.map(mapProjectMemberRow);
  }

  async addProjectMember(data: Partial<DbProjectMember>): Promise<DbProjectMember> {
    await ensureProjectSeeded();
    let empName = data.employeeName || 'Project Member';
    if (data.employeeId) {
      const [empRow] = await db.select().from(employees).where(eq(employees.id, data.employeeId));
      if (empRow && empRow.name) {
        empName = empRow.name;
      }
    }

    const newRecord = {
      id: genId('mem'),
      projectId: data.projectId!,
      employeeId: data.employeeId!,
      employeeName: empName,
      departmentId: data.departmentId ?? null,
      departmentName: data.departmentName ?? null,
      designation: data.designation ?? null,
      role: data.role || 'WORKER',
      joiningDate: data.joiningDate || new Date().toISOString().slice(0, 10),
      leavingDate: data.leavingDate ?? null,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    await db.insert(projectMembers).values(newRecord);
    return mapProjectMemberRow(newRecord);
  }

  async removeProjectMember(memberId: string): Promise<boolean> {
    await ensureProjectSeeded();
    const [existing] = await db.select().from(projectMembers).where(eq(projectMembers.id, memberId));
    if (!existing) return false;

    await db
      .update(projectMembers)
      .set({
        status: 'RELEASED',
        leavingDate: new Date().toISOString().slice(0, 10),
      })
      .where(eq(projectMembers.id, memberId));

    return true;
  }

  // --- DAILY PROGRESS ENTRIES ---
  async findDailyProgressByProject(projectId: string): Promise<DbDailyProgress[]> {
    await ensureProjectSeeded();
    const rows = await db.select().from(dailyProgress).where(eq(dailyProgress.projectId, projectId));
    return rows.map(mapDailyProgressRow);
  }

  async createDailyProgress(data: Partial<DbDailyProgress>): Promise<DbDailyProgress> {
    await ensureProjectSeeded();

    const projectId = String(data.projectId || '').trim();
    const siteId = String(data.siteId || '').trim();
    const workCategory = String(data.workCategory || '').trim();
    const description = String(data.description || '').trim();
    const createdById = String(data.createdById || '').trim();
    const createdByName = String(data.createdByName || '').trim();
    const completion = Number(data.completionPercentage);

    if (!projectId || !siteId || !workCategory || !description || !createdById || !createdByName) {
      throw new Error('Project, site, work category, description and authenticated creator identity are required.');
    }
    if (!Number.isFinite(completion) || completion < 0 || completion > 100) {
      throw new Error('Completion percentage must be between 0 and 100.');
    }

    const [project] = await db.select({ id: projects.id, isActive: projects.isActive })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);
    if (!project || !project.isActive) throw new Error('Project not found or inactive.');

    const [site] = await db.select({ id: sites.id, projectId: sites.projectId, isActive: sites.isActive })
      .from(sites)
      .where(eq(sites.id, siteId))
      .limit(1);
    if (!site || !site.isActive || site.projectId !== projectId) {
      throw new Error('Site not found, inactive, or outside the selected project.');
    }

    const now = new Date().toISOString();
    const newRecord = {
      id: genId('dpr'),
      projectId,
      siteId,
      date: data.date || new Date().toISOString().slice(0, 10),
      workCategory,
      description,
      completionPercentage: completion,
      remarks: data.remarks || '',
      photos: data.photos || [],
      documents: data.documents || [],
      createdById,
      createdByName,
      verifiedById: null,
      verifiedByName: null,
      approvedById: null,
      approvedByName: null,
      status: 'SUBMITTED',
      createdAt: now,
    };

    await db.insert(dailyProgress).values(newRecord);
    return mapDailyProgressRow(newRecord);
  }

  async updateDailyProgressStatus(
    id: string,
    status: 'VERIFIED' | 'APPROVED' | 'REJECTED',
    actionUser: { id: string; name: string }
  ): Promise<DbDailyProgress | null> {
    await ensureProjectSeeded();

    if (!actionUser?.id || !actionUser?.name?.trim()) {
      throw new Error('Authenticated workflow actor identity is required.');
    }

    const [existing] = await db.select().from(dailyProgress).where(eq(dailyProgress.id, id));
    if (!existing) return null;

    if (status === 'VERIFIED') {
      if (existing.status !== 'SUBMITTED') {
        throw new Error(`Progress can be verified only from SUBMITTED status. Current status: ${existing.status}`);
      }
      if (existing.createdById === actionUser.id) {
        throw new Error('Maker-checker violation: progress creator cannot verify the same entry.');
      }
    }

    if (status === 'APPROVED') {
      if (existing.status !== 'VERIFIED') {
        throw new Error(`Progress can be approved only after verification. Current status: ${existing.status}`);
      }
      if (existing.createdById === actionUser.id || existing.verifiedById === actionUser.id) {
        throw new Error('Maker-checker violation: progress creator or verifier cannot approve the same entry.');
      }
    }

    if (status === 'REJECTED') {
      if (!['SUBMITTED', 'VERIFIED'].includes(existing.status)) {
        throw new Error(`Progress cannot be rejected from status ${existing.status}`);
      }
      if (existing.createdById === actionUser.id && existing.status === 'SUBMITTED') {
        throw new Error('Maker-checker violation: creator cannot reject their own submitted progress.');
      }
    }

    const payload: Record<string, any> = { status };
    if (status === 'VERIFIED') {
      payload.verifiedById = actionUser.id;
      payload.verifiedByName = actionUser.name.trim();
    } else if (status === 'APPROVED') {
      payload.approvedById = actionUser.id;
      payload.approvedByName = actionUser.name.trim();
    }

    const [updated] = await db.update(dailyProgress).set(payload).where(eq(dailyProgress.id, id)).returning();
    return updated ? mapDailyProgressRow(updated) : null;
  }

  // --- TASKS ---
  async findTasksByProject(projectId: string): Promise<DbTask[]> {
    await ensureProjectSeeded();
    const rows = await db.select().from(tasks).where(eq(tasks.projectId, projectId));
    return rows.map(mapTaskRow);
  }

  async createTask(data: Partial<DbTask>): Promise<DbTask> {
    await ensureProjectSeeded();
    const now = new Date().toISOString();
    const newRecord = {
      id: genId('tsk'),
      projectId: data.projectId!,
      siteId: data.siteId ?? null,
      title: data.title || 'Untitled Site Task',
      description: data.description || '',
      assignedToId: data.assignedToId ?? null,
      assignedToName: data.assignedToName ?? null,
      priority: data.priority || 'MEDIUM',
      dueDate: data.dueDate || new Date().toISOString().slice(0, 10),
      status: data.status || 'TODO',
      milestoneId: data.milestoneId ?? null,
      attachments: data.attachments || [],
      createdById: data.createdById || 'usr-mgr-002',
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(tasks).values(newRecord);
    return mapTaskRow(newRecord);
  }

  async updateTaskStatus(id: string, status: DbTask['status']): Promise<DbTask | null> {
    await ensureProjectSeeded();
    const [existing] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!existing) return null;

    const now = new Date().toISOString();
    await db.update(tasks).set({ status, updatedAt: now }).where(eq(tasks.id, id));
    const [updated] = await db.select().from(tasks).where(eq(tasks.id, id));
    return updated ? mapTaskRow(updated) : null;
  }

  async addTaskComment(taskId: string, userId: string, userName: string, comment: string): Promise<DbTaskComment> {
    await ensureProjectSeeded();
    const newRecord = {
      id: genId('tsc'),
      taskId,
      userId,
      userName,
      comment,
      attachmentUrl: null,
      createdAt: new Date().toISOString(),
    };
    await db.insert(taskComments).values(newRecord);
    return mapTaskCommentRow(newRecord);
  }

  async findTaskComments(taskId: string): Promise<DbTaskComment[]> {
    await ensureProjectSeeded();
    const rows = await db.select().from(taskComments).where(eq(taskComments.taskId, taskId));
    return rows.map(mapTaskCommentRow);
  }

  // --- DOCUMENTS ---
  // --- DOCUMENTS ---
  // Central EDMS is the source of truth. These methods preserve the legacy
  // Project API response shape so existing project screens keep working.
  async findDocumentsByProject(projectId: string): Promise<DbProjectDocument[]> {
    await ensureProjectSeeded();
    if (!projectId?.trim()) throw new Error('Project ID is required to list project documents.');

    const docs = await getEdmsDocuments({ projectId });
    if (!docs.length) return [];

    const documentIds = docs.map((doc: any) => doc.id);
    const metadataRows = await db
      .select()
      .from(phase61DocumentMetadata)
      .where(inArray(phase61DocumentMetadata.documentId, documentIds));

    const metadataByDocument = new Map<string, Record<string, string>>();
    for (const row of metadataRows as any[]) {
      const current = metadataByDocument.get(row.documentId) || {};
      current[row.metaKey] = row.metaValue;
      metadataByDocument.set(row.documentId, current);
    }

    return docs.map((doc: any) => {
      const meta = metadataByDocument.get(doc.id) || {};
      return {
        id: doc.id,
        projectId: doc.projectId,
        siteId: meta.SiteId || undefined,
        documentCategory: meta.ProjectDocumentCategory || 'TECHNICAL',
        title: doc.title,
        fileUrl: doc.fileUrl,
        fileType: doc.fileType,
        fileSize: Number(doc.fileSizeBytes || 0),
        version: doc.currentVersion,
        notes: meta.ProjectDocumentNotes || doc.description || undefined,
        uploadedById: meta.UploadedById || undefined,
        uploadedByName: doc.createdBy || undefined,
        createdAt: doc.createdAt,
      } as DbProjectDocument;
    });
  }

  async createDocument(data: Partial<DbProjectDocument>): Promise<DbProjectDocument> {
    await ensureProjectSeeded();
    const projectId = String(data.projectId || '').trim();
    const title = String(data.title || '').trim();
    const fileUrl = String(data.fileUrl || '').trim();
    const uploadedById = String(data.uploadedById || '').trim();
    const uploadedByName = String(data.uploadedByName || '').trim();

    if (!projectId || !title || !fileUrl || !uploadedById || !uploadedByName) {
      throw new Error('Project, document title, actual file reference and authenticated uploader identity are required.');
    }

    // Reuse an existing project EDMS folder or create one on demand.
    let folders = await getEdmsFolders(projectId);
    let folder = folders.find((f: any) => f.projectId === projectId && !f.isDeleted);
    if (!folder) {
      const project = await this.findProjectById(projectId);
      if (!project) throw new Error('Project not found.');
      folder = await createEdmsFolder({
        folderName: `${project.projectCode} Documents`,
        projectId,
        department: 'Project Controls',
        isSystemFolder: false,
        createdBy: uploadedByName,
      });
    }

    const central = await createEdmsDocument({
      title,
      description: data.notes || undefined,
      folderId: folder.id,
      fileType: data.fileType || 'PDF',
      fileSizeBytes: Number(data.fileSize || 0),
      fileUrl,
      projectId,
      createdBy: uploadedByName,
      metadata: {
        ProjectDocumentCategory: String(data.documentCategory || 'TECHNICAL'),
        ...(data.siteId ? { SiteId: String(data.siteId) } : {}),
        UploadedById: uploadedById,
        ...(data.notes ? { ProjectDocumentNotes: String(data.notes) } : {}),
      },
    } as any);

    return {
      id: central.id,
      projectId: central.projectId,
      siteId: data.siteId || undefined,
      documentCategory: String(data.documentCategory || 'TECHNICAL'),
      title: central.title,
      fileUrl: central.fileUrl,
      fileType: central.fileType,
      fileSize: Number(central.fileSizeBytes || 0),
      version: central.currentVersion,
      notes: data.notes || central.description || undefined,
      uploadedById,
      uploadedByName: central.createdBy,
      createdAt: central.createdAt,
    };
  }
  // --- MILESTONES ---
  async findMilestonesByProject(projectId: string): Promise<DbProjectMilestone[]> {
    await ensureProjectSeeded();
    const rows = await db.select().from(projectMilestones).where(eq(projectMilestones.projectId, projectId));
    return rows.map(mapProjectMilestoneRow);
  }

  async createMilestone(data: Partial<DbProjectMilestone>): Promise<DbProjectMilestone> {
    await ensureProjectSeeded();
    const newRecord = {
      id: genId('mls'),
      projectId: data.projectId!,
      title: data.title || 'New Target Milestone',
      targetDate: data.targetDate || new Date().toISOString().slice(0, 10),
      actualDate: data.actualDate ?? null,
      status: data.status || 'UPCOMING',
      delayDays: Number(data.delayDays) || 0,
      description: data.description || '',
      createdAt: new Date().toISOString(),
    };
    await db.insert(projectMilestones).values(newRecord);
    return mapProjectMilestoneRow(newRecord);
  }

  // --- DASHBOARD AGGREGATED METRICS ---
  async getProjectDashboardMetrics(projectId: string) {
    await ensureProjectSeeded();
    const project = await this.findProjectById(projectId);
    if (!project) return null;

    const sitesList = await this.findSitesByProjectId(projectId);
    const membersList = await this.findMembersByProjectId(projectId);
    const tasksList = await this.findTasksByProject(projectId);
    const progressLogs = await this.findDailyProgressByProject(projectId);
    const milestonesList = await this.findMilestonesByProject(projectId);
    const documentsList = await this.findDocumentsByProject(projectId);

    // Linked machinery & vehicles from database
    const equipmentRows = await db.select().from(equipments).where(eq(equipments.currentProjectId, projectId));
    const vehicleRows = await db.select().from(vehicles);
    const materialRows = await db.select().from(materials);

    // Phase 13 Project Engine aggregates
    const departmentRows = await db.select().from(projectDepartments).where(eq(projectDepartments.projectId, projectId));
    const workPackageRows = await db.select().from(projectWorkPackages).where(and(eq(projectWorkPackages.projectId, projectId), eq(projectWorkPackages.isArchived, false)));
    const activityRows = await db.select().from(projectActivities).where(and(eq(projectActivities.projectId, projectId), eq(projectActivities.isArchived, false)));

    return {
      project,
      sitesCount: sitesList.length,
      sites: sitesList,
      membersCount: membersList.length,
      members: membersList,
      tasksCount: tasksList.length,
      openTasksCount: tasksList.filter((t) => t.status !== 'COMPLETED').length,
      pendingApprovalsCount: progressLogs.filter((p) => p.status === 'SUBMITTED' || p.status === 'VERIFIED').length,
      equipmentCount: equipmentRows.length,
      vehiclesCount: vehicleRows.length,
      laborCount: membersList.filter((m) => m.status === 'ACTIVE').length,
      departmentsCount: departmentRows.length,
      workPackagesCount: workPackageRows.length,
      activitiesCount: activityRows.length,
      budget: project.budget,
      actualSpent: project.actualSpent || 0,
      progressPercentage: project.progressPercentage || 0,
      milestones: milestonesList,
      documentsCount: documentsList.length,
      recentProgressLogs: progressLogs.slice(0, 5),
    };
  }

  // --- COMMERCIAL & COST CONTROL ENGINE (P2.5-B) ---
  async getCommercialCostControl(projectId: string) {
    await ensureProjectSeeded();
    const project = await this.findProjectById(projectId);
    if (!project) return null;

    // 1. WBS & Work Packages
    const workPackageRows = await db
      .select()
      .from(projectWorkPackages)
      .where(and(eq(projectWorkPackages.projectId, projectId), eq(projectWorkPackages.isArchived, false)));

    // 2. BOQ Items
    const boqRows = await db
      .select()
      .from(boqItems)
      .where(and(eq(boqItems.projectId, projectId), eq(boqItems.isActive, true)));

    const executedBoqValue = boqRows.reduce((acc, item) => acc + (Number(item.executedQty || 0) * Number(item.rate || 0)), 0);
    const contractBoqValue = boqRows.reduce((acc, item) => acc + (Number(item.quantity || 0) * Number(item.rate || 0)), 0);

    // 3. Purchase Orders (Committed Material/Equipment)
    const poRows = await db
      .select()
      .from(procurementPurchaseOrdersTable)
      .where(or(eq(procurementPurchaseOrdersTable.projectId, projectId), eq(procurementPurchaseOrdersTable.projectName, project.projectName)));

    const committedPoCost = poRows
      .filter((p) => (p.status || '').toUpperCase() !== 'CANCELLED' && (p.status || '').toUpperCase() !== 'REJECTED')
      .reduce((acc, p) => acc + Number(p.netAmountUSD || 0), 0);

    // 4. Subcontract Work Orders (Committed Subcontract)
    const woRows = await db
      .select()
      .from(procurementWorkOrdersTable)
      .where(or(eq(procurementWorkOrdersTable.projectId, projectId), eq(procurementWorkOrdersTable.projectName, project.projectName)));

    const committedWoCost = woRows
      .filter((w) => w.status !== 'CANCELLED' && w.status !== 'TERMINATED')
      .reduce((acc, w) => acc + Number(w.contractValueUSD || 0), 0);

    const totalCommitted = committedPoCost + committedWoCost;

    // 5. Material Consumption / Issues (Actual Material Cost)
    const issueRows = await db
      .select()
      .from(materialIssues)
      .where(or(eq(materialIssues.projectId, projectId), eq(materialIssues.projectName, project.projectName)));

    const issueIds = issueRows.map((i) => i.id);
    let materialIssueItemsList: any[] = [];
    if (issueIds.length > 0) {
      const allItems = await db.select().from(materialIssueItems);
      materialIssueItemsList = allItems.filter((item) => issueIds.includes(item.issueId));
    }

    const actualMaterialCost = materialIssueItemsList.reduce(
      (acc, item) => acc + Number(item.issuedQty || 0) * Number(item.unitPrice || 0),
      0
    );

    // 6. Fleet / Equipment Fuel & Usage (Actual Plant Cost)
    const fuelRows = await db
      .select()
      .from(fleetFuelLogs)
      .where(or(eq(fleetFuelLogs.projectId, projectId), eq(fleetFuelLogs.projectName, project.projectName)));

    const actualEquipmentFuelCost = fuelRows.reduce((acc, f) => acc + Number(f.totalCost || 0), 0);

    // 7. Contractor RA Bills (Actual Subcontract Incurred Cost)
    const raBillRows = await db
      .select()
      .from(procurementRaBillsTable)
      .where(or(eq(procurementRaBillsTable.projectId, projectId), eq(procurementRaBillsTable.projectName, project.projectName)));

    const actualCertifiedRaBillCost = raBillRows
      .filter((b) => b.status === 'CERTIFIED' || b.status === 'APPROVED' || b.status === 'PAID')
      .reduce((acc, b) => {
        const netPayable = (b.financials as any)?.netPayableAmount || (b.financials as any)?.currentBillAmount || 0;
        return acc + Number(netPayable);
      }, 0);

    const pendingRaBillCost = raBillRows
      .filter((b) => b.status === 'SUBMITTED' || b.status === 'VERIFIED')
      .reduce((acc, b) => {
        const netPayable = (b.financials as any)?.netPayableAmount || (b.financials as any)?.currentBillAmount || 0;
        return acc + Number(netPayable);
      }, 0);

    // 8. Project Local Cash / Imprest Expenses (Actual Site Cash Cost)
    const cashSettlementRows = await db
      .select()
      .from(projectCashSettlementsTable)
      .where(eq(projectCashSettlementsTable.projectId, projectId));

    const actualImprestExpenseCost = cashSettlementRows
      .filter((s) => s.status === 'AUDITED' || s.status === 'APPROVED')
      .reduce((acc, s) => acc + Number(s.totalExpenseAmount || 0), 0);

    // 9. Labour & Other Incurred Costs
    const membersList = await this.findMembersByProjectId(projectId);
    const activeMembersCount = membersList.filter((m) => m.status === 'ACTIVE').length;
    const computedActualTotalWithoutLabor = actualMaterialCost + actualEquipmentFuelCost + actualCertifiedRaBillCost + actualImprestExpenseCost;
    const actualLaborCost = (project.actualSpent && project.actualSpent > computedActualTotalWithoutLabor)
      ? project.actualSpent - computedActualTotalWithoutLabor
      : Math.round(activeMembersCount * 4500);

    const totalActualCost = computedActualTotalWithoutLabor + actualLaborCost;

    // Multi-Currency Resolution for Project Commercials
    const projectCurrency = project.currency || 'AED';
    const baseCurrencyObj = await currencyRepository.getBaseCurrency();
    const baseCurrencyCode = baseCurrencyObj.code || 'AED';
    const rateInfo = await currencyRepository.getLatestRate(projectCurrency, baseCurrencyCode);
    const exchangeRateToBase = rateInfo.rate || 1.0;

    // 10. EVM & Commercial Calculations (in Project Commercial Currency)
    const budget = Number(project.budget || 0);
    const contractValue = Number(project.contractValue || project.budget || 0);
    const progressPct = Number(project.progressPercentage || 0);
    const plannedValue = Math.round((budget * progressPct) / 100);
    const ev = executedBoqValue > 0 ? executedBoqValue : plannedValue;
    const costVariance = ev - totalActualCost;
    const scheduleVariance = ev - plannedValue;
    const cpi = totalActualCost > 0 ? Number((ev / totalActualCost).toFixed(2)) : 1.0;
    const spi = plannedValue > 0 ? Number((ev / plannedValue).toFixed(2)) : 1.0;
    const eac = cpi > 0 ? Math.round(budget / cpi) : budget;
    const vac = budget - eac;
    const remainingBudget = Math.max(0, budget - Math.max(totalCommitted, totalActualCost));

    // 11. Build Normalized Transaction Ledger with Source Documents & Multi-Currency Preservation
    const transactions: any[] = [];

    // Add POs (Commitments)
    poRows.forEach((po) => {
      const amount = Number(po.netAmountUSD || (po as any).totalAmount || 0);
      transactions.push({
        id: `TX-PO-${po.id}`,
        type: 'COMMITTED',
        category: 'PURCHASE_ORDER',
        categoryLabel: 'Purchase Order (Material/Equipment)',
        sourceDocType: 'PURCHASE_ORDER',
        sourceDocNumber: po.poNumber,
        sourceDocId: po.id,
        date: po.poDate || po.createdAt?.slice(0, 10),
        description: `PO for ${po.vendorName || 'Vendor Supply'}`,
        vendorOrPayee: po.vendorName || 'Procurement Vendor',
        amount,
        originalAmount: amount,
        currency: projectCurrency,
        originalCurrency: projectCurrency,
        exchangeRate: exchangeRateToBase,
        baseAmount: Math.round(amount * exchangeRateToBase),
        baseCurrency: baseCurrencyCode,
        status: po.status,
        authorizedBy: (po as any).createdBy || 'Procurement Manager',
      });
    });

    // Add Work Orders (Commitments)
    woRows.forEach((wo) => {
      const amount = Number(wo.contractValueUSD || 0);
      transactions.push({
        id: `TX-WO-${wo.id}`,
        type: 'COMMITTED',
        category: 'SUBCONTRACT_WORK_ORDER',
        categoryLabel: 'Subcontract Work Order',
        sourceDocType: 'WORK_ORDER',
        sourceDocNumber: wo.woNumber,
        sourceDocId: wo.id,
        date: wo.startDate || wo.createdAt?.slice(0, 10),
        description: wo.title || `Subcontract: ${wo.contractorName}`,
        vendorOrPayee: wo.contractorName || 'Subcontractor',
        amount,
        originalAmount: amount,
        currency: projectCurrency,
        originalCurrency: projectCurrency,
        exchangeRate: exchangeRateToBase,
        baseAmount: Math.round(amount * exchangeRateToBase),
        baseCurrency: baseCurrencyCode,
        status: wo.status,
        authorizedBy: 'Contracts & Commercial Dept',
      });
    });

    // Add Material Issues (Actual Material Cost)
    issueRows.forEach((issue) => {
      const issueItems = materialIssueItemsList.filter((item) => item.issueId === issue.id);
      const issueTotal = issueItems.reduce((acc, it) => acc + Number(it.issuedQty || 0) * Number(it.unitPrice || 0), 0);
      transactions.push({
        id: `TX-ISS-${issue.id}`,
        type: 'ACTUAL',
        category: 'DIRECT_MATERIAL',
        categoryLabel: 'Direct Material Issue',
        sourceDocType: 'MATERIAL_ISSUE',
        sourceDocNumber: issue.issueNumber,
        sourceDocId: issue.id,
        date: issue.issueDate || issue.createdAt?.slice(0, 10),
        description: `Material Issue: ${issueItems.map((it) => it.materialName).join(', ') || 'Warehouse Stock'}`,
        vendorOrPayee: `Store: ${issue.warehouseName || 'Central Warehouse'} (To: ${issue.issuedTo})`,
        amount: issueTotal,
        originalAmount: issueTotal,
        currency: projectCurrency,
        originalCurrency: projectCurrency,
        exchangeRate: exchangeRateToBase,
        baseAmount: Math.round(issueTotal * exchangeRateToBase),
        baseCurrency: baseCurrencyCode,
        status: issue.status,
        authorizedBy: issue.issuedBy || 'Store Keeper',
      });
    });

    // Add Fuel Logs (Actual Plant/Equipment Cost)
    fuelRows.forEach((fuel) => {
      const fuelTotal = Number(fuel.totalCost || 0);
      transactions.push({
        id: `TX-FUEL-${fuel.id}`,
        type: 'ACTUAL',
        category: 'EQUIPMENT_FUEL',
        categoryLabel: 'Plant, Fleet & Fuel Expense',
        sourceDocType: 'FUEL_LOG',
        sourceDocNumber: fuel.fuelLogCode,
        sourceDocId: fuel.id,
        date: fuel.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        description: `Fuel & Operating: ${fuel.assetName || fuel.assetCode || 'Heavy Machinery'} (${fuel.quantityLiters}L @ ${fuel.unitPrice}/L)`,
        vendorOrPayee: fuel.fuelStation || 'Site Fuel Depot',
        amount: fuelTotal,
        originalAmount: fuelTotal,
        currency: projectCurrency,
        originalCurrency: projectCurrency,
        exchangeRate: exchangeRateToBase,
        baseAmount: Math.round(fuelTotal * exchangeRateToBase),
        baseCurrency: baseCurrencyCode,
        status: 'LOGGED',
        authorizedBy: 'Fleet Operator',
      });
    });

    // Add Certified RA Bills (Actual Subcontract Cost)
    raBillRows.forEach((bill) => {
      const netAmount = Number((bill.financials as any)?.netPayableAmount || (bill.financials as any)?.currentBillAmount || 0);
      const billCurrency = (bill.financials as any)?.currency || projectCurrency;
      transactions.push({
        id: `TX-RAB-${bill.id}`,
        type: 'ACTUAL',
        category: 'SUBCONTRACTOR_RA_BILL',
        categoryLabel: 'Contractor RA Bill (Certified)',
        sourceDocType: 'RA_BILL',
        sourceDocNumber: bill.billNumber,
        sourceDocId: bill.id,
        date: bill.billDate || bill.createdAt?.slice(0, 10),
        description: `RA Bill #${bill.sequenceNumber || 1} for ${bill.contractorName} (WO: ${bill.workOrderNumber || 'N/A'})`,
        vendorOrPayee: bill.contractorName || 'Contractor',
        amount: netAmount,
        originalAmount: netAmount,
        currency: billCurrency,
        originalCurrency: billCurrency,
        exchangeRate: exchangeRateToBase,
        baseAmount: Math.round(netAmount * exchangeRateToBase),
        baseCurrency: baseCurrencyCode,
        status: bill.status,
        authorizedBy: bill.qsVerifier || bill.projectDirector || 'QS Engineer',
      });
    });

    // Add Audited Imprest Settlement Vouchers (Actual Imprest Site Expense)
    cashSettlementRows.forEach((settlement) => {
      const vouchers = (settlement.voucherItems as any[]) || [];
      const expenseAmount = Number(settlement.totalExpenseAmount || 0);
      const settlementCur = settlement.currency || projectCurrency;
      transactions.push({
        id: `TX-CSH-${settlement.id}`,
        type: 'ACTUAL',
        category: 'PROJECT_IMPREST_CASH',
        categoryLabel: 'Project Imprest Settlement Voucher',
        sourceDocType: 'CASH_VOUCHER',
        sourceDocNumber: settlement.settlementCode,
        sourceDocId: settlement.id,
        date: settlement.submittedAt || settlement.createdAt?.slice(0, 10),
        description: `Site Expense: ${vouchers.map((v: any) => v.itemDescription || v.billNumber).join(', ') || 'Site Local Operations'}`,
        vendorOrPayee: settlement.employeeName || 'Site Engineer',
        amount: expenseAmount,
        originalAmount: expenseAmount,
        currency: settlementCur,
        originalCurrency: settlementCur,
        exchangeRate: exchangeRateToBase,
        baseAmount: Math.round(expenseAmount * exchangeRateToBase),
        baseCurrency: baseCurrencyCode,
        status: settlement.status,
        authorizedBy: settlement.auditorName || 'Internal Auditor',
      });
    });

    // Sort transactions by date descending
    transactions.sort((a, b) => (b.date > a.date ? 1 : -1));

    // 12. WBS & Category Summary Breakdowns
    const wbsBreakdown = workPackageRows.map((wp) => {
      const wpBudget = Number(wp.budget || 0);
      const wpActual = Math.round(wpBudget * (Number(wp.progressPercentage || 0) / 100));
      const wpCommitted = Math.round(wpBudget * 0.85);
      return {
        id: wp.id,
        packageCode: wp.packageCode,
        title: wp.title,
        discipline: wp.discipline || 'General',
        leadEmployeeName: wp.leadEmployeeName || 'Lead Engineer',
        budget: wpBudget,
        committed: wpCommitted,
        actual: wpActual,
        balance: Math.max(0, wpBudget - wpActual),
        variance: wpBudget - wpActual,
        progressPercentage: wp.progressPercentage || 0,
        status: wp.status,
      };
    });

    const categoryBreakdown = [
      { category: 'Direct Materials & Pipe', budget: Math.round(budget * 0.38), committed: committedPoCost, actual: actualMaterialCost, color: '#3b82f6' },
      { category: 'Plant, Machinery & Fuel', budget: Math.round(budget * 0.18), committed: Math.round(budget * 0.16), actual: actualEquipmentFuelCost, color: '#f59e0b' },
      { category: 'Subcontractor Work Orders & RA Bills', budget: Math.round(budget * 0.28), committed: committedWoCost, actual: actualCertifiedRaBillCost, color: '#10b981' },
      { category: 'Direct Site Labour & Supervision', budget: Math.round(budget * 0.10), committed: Math.round(budget * 0.10), actual: actualLaborCost, color: '#8b5cf6' },
      { category: 'Project Imprest & Petty Cash', budget: Math.round(budget * 0.04), committed: Math.round(budget * 0.04), actual: actualImprestExpenseCost, color: '#ec4899' },
      { category: 'Contingency & Site Overheads', budget: Math.round(budget * 0.02), committed: 0, actual: 0, color: '#64748b' },
    ];

    return {
      project: {
        id: project.id,
        projectCode: project.projectCode,
        projectName: project.projectName,
        clientName: project.clientName || project.customerName || 'Client Org',
        consultantName: project.consultantName || 'Consultant Org',
        location: project.location,
        contractValue,
        budget,
        currency: projectCurrency,
        status: project.status,
        progressPercentage: progressPct,
        startDate: project.startDate,
        targetCompletionDate: project.targetCompletionDate,
      },
      multiCurrency: {
        projectCurrency,
        baseCurrency: baseCurrencyCode,
        exchangeRateToBase,
        rateSource: rateInfo.source,
        asOfDate: rateInfo.effectiveDate,
      },
      kpis: {
        contractValue,
        approvedBudget: budget,
        totalCommitted,
        totalActualCost,
        remainingBudget,
        executedBoqValue,
        contractBoqValue,
        plannedValue,
        costVariance,
        scheduleVariance,
        cpi,
        spi,
        eac,
        vac,
        pendingRaBillCost,
        actualMaterialCost,
        actualEquipmentFuelCost,
        actualCertifiedRaBillCost,
        actualImprestExpenseCost,
        actualLaborCost,
        // Converted Base Currency KPIs
        contractValueBase: Math.round(contractValue * exchangeRateToBase),
        approvedBudgetBase: Math.round(budget * exchangeRateToBase),
        totalCommittedBase: Math.round(totalCommitted * exchangeRateToBase),
        totalActualCostBase: Math.round(totalActualCost * exchangeRateToBase),
        remainingBudgetBase: Math.round(remainingBudget * exchangeRateToBase),
        plannedValueBase: Math.round(plannedValue * exchangeRateToBase),
        costVarianceBase: Math.round(costVariance * exchangeRateToBase),
        scheduleVarianceBase: Math.round(scheduleVariance * exchangeRateToBase),
      },
      wbsBreakdown,
      categoryBreakdown,
      transactions,
    };
  }

  // --- PHASE 13 WORK PACKAGE TYPES ---
  async getWorkPackageTypes() {
    await this.ensureWorkPackageTypesSeeded();
    const rows = await db.select().from(workPackageTypes).orderBy(asc(workPackageTypes.displayOrder));
    return rows.filter((r) => r.isActive);
  }

  async ensureWorkPackageTypesSeeded() {
    const existing = await db.select().from(workPackageTypes);
    if (existing.length === 0) {
      const defaultTypes = [
        { id: 'wpt-pipe', typeCode: 'WPT-PIPE', name: 'Pipeline Construction', description: 'Trunk mains, distribution networks, DI/MS/HDPE laying', displayOrder: 1 },
        { id: 'wpt-pumphouse', typeCode: 'WPT-PUMP', name: 'Pump House & Intake Station', description: 'Civil intake, electro-mechanical pumps, suction lines', displayOrder: 2 },
        { id: 'wpt-wtp', typeCode: 'WPT-WTP', name: 'Water Treatment Plant (WTP)', description: 'Clarifiers, filtration units, chemical dosing, sludge beds', displayOrder: 3 },
        { id: 'wpt-reservoir', typeCode: 'WPT-RES', name: 'Reservoirs (OHSR / GLSR)', description: 'Elevated & ground storage tanks, staging, dome slabs', displayOrder: 4 },
        { id: 'wpt-building', typeCode: 'WPT-BLDG', name: 'Buildings & Structures', description: 'Control rooms, staff quarters, administration blocks', displayOrder: 5 },
        { id: 'wpt-elec', typeCode: 'WPT-ELEC', name: 'Electrical & Transformers', description: 'Substations, HT/LT panels, cabling, diesel generators', displayOrder: 6 },
        { id: 'wpt-inst', typeCode: 'WPT-INST', name: 'Instrumentation & SCADA', description: 'Flowmeters, pressure sensors, PLC panels, telemetry', displayOrder: 7 },
        { id: 'wpt-fab', typeCode: 'WPT-FAB', name: 'Fabrication & Welding', description: 'Special pipe fittings, manifolds, structural steel', displayOrder: 8 },
        { id: 'wpt-test', typeCode: 'WPT-TEST', name: 'Hydro Testing & Quality QA/QC', description: 'Pressure testing, weld NDT, disinfection, commissioning', displayOrder: 9 },
        { id: 'wpt-util', typeCode: 'WPT-UTIL', name: 'General Utilities & Site Infra', description: 'Access roads, fencing, drainage, temporary site office', displayOrder: 10 },
      ];
      const now = new Date().toISOString();
      for (const t of defaultTypes) {
        await db.insert(workPackageTypes).values({ ...t, isActive: true, createdAt: now }).onConflictDoNothing();
      }
    }
  }

  async createWorkPackageType(data: { typeCode: string; name: string; description?: string }) {
    const id = `wpt-${Date.now()}`;
    const newType = {
      id,
      typeCode: data.typeCode,
      name: data.name,
      description: data.description || '',
      displayOrder: 99,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    await db.insert(workPackageTypes).values(newType);
    return newType;
  }

  // --- PHASE 13 WORK PACKAGES ---
  async getProjectWorkPackages(projectId: string, departmentId?: string) {
    let rows = await db.select().from(projectWorkPackages).where(and(eq(projectWorkPackages.projectId, projectId), eq(projectWorkPackages.isArchived, false)));
    if (departmentId) {
      rows = rows.filter((r) => r.departmentId === departmentId);
    }
    return rows;
  }

  async createWorkPackage(data: any) {
    const id = `pkg-${Date.now()}`;
    const now = new Date().toISOString();
    const newPkg = {
      id,
      projectId: data.projectId,
      packageCode: data.packageCode || `WP-${Date.now().toString().slice(-4)}`,
      title: data.title,
      departmentId: data.departmentId || null,
      workPackageTypeId: data.workPackageTypeId || null,
      workPackageTypeName: data.workPackageTypeName || null,
      discipline: data.discipline || 'GENERAL',
      assignedTeamId: data.assignedTeamId || null,
      leadEmployeeId: data.leadEmployeeId || null,
      leadEmployeeName: data.leadEmployeeName || null,
      budget: Number(data.budget) || 0,
      startDate: data.startDate || now.slice(0, 10),
      targetDate: data.targetDate || now.slice(0, 10),
      status: data.status || 'PLANNED',
      progressPercentage: Number(data.progressPercentage) || 0,
      isArchived: false,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(projectWorkPackages).values(newPkg as any);
    return newPkg;
  }

  async updateWorkPackage(id: string, updates: any) {
    const now = new Date().toISOString();
    await db.update(projectWorkPackages).set({ ...updates, updatedAt: now }).where(eq(projectWorkPackages.id, id));
    const [updated] = await db.select().from(projectWorkPackages).where(eq(projectWorkPackages.id, id));
    return updated;
  }

  async deleteWorkPackage(id: string) {
    const now = new Date().toISOString();
    await db.update(projectWorkPackages).set({ isArchived: true, deletedAt: now, updatedAt: now }).where(eq(projectWorkPackages.id, id));
    return true;
  }

  // --- PHASE 13 ACTIVITIES ---
  async getActivities(workPackageId: string, projectId?: string) {
    const rows = await db.select().from(projectActivities).where(and(eq(projectActivities.workPackageId, workPackageId), eq(projectActivities.isArchived, false)));
    return rows;
  }

  async createActivity(data: any) {
    const id = `act-${Date.now()}`;
    const now = new Date().toISOString();
    const newAct = {
      id,
      workPackageId: data.workPackageId,
      projectId: data.projectId,
      departmentId: data.departmentId || null,
      activityCode: data.activityCode || `ACT-${Date.now().toString().slice(-4)}`,
      title: data.title,
      description: data.description || '',
      sequenceOrder: Number(data.sequenceOrder) || 1,
      assignedToId: data.assignedToId || null,
      assignedToName: data.assignedToName || null,
      startDate: data.startDate || null,
      targetDate: data.targetDate || null,
      progressPercentage: Number(data.progressPercentage) || 0,
      status: data.status || 'PLANNED',
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(projectActivities).values(newAct as any);
    return newAct;
  }

  async updateActivity(id: string, updates: any) {
    const now = new Date().toISOString();
    await db.update(projectActivities).set({ ...updates, updatedAt: now }).where(eq(projectActivities.id, id));
    const [updated] = await db.select().from(projectActivities).where(eq(projectActivities.id, id));
    return updated;
  }

  async deleteActivity(id: string) {
    const now = new Date().toISOString();
    await db.update(projectActivities).set({ isArchived: true, updatedAt: now }).where(eq(projectActivities.id, id));
    return true;
  }

  // --- PHASE 13 PROJECT SETTINGS ---
  async getProjectSettings(projectId: string) {
    const [settings] = await db.select().from(projectSettings).where(eq(projectSettings.projectId, projectId));
    if (settings) return settings;

    // Return default settings if none exists
    const defaultSettings = {
      id: `set-${projectId}`,
      projectId,
      enabledDepartments: ['unit-dep-mech', 'unit-dep-civil', 'unit-dep-water'],
      enabledModules: ['projects', 'inventory', 'fleet', 'hr', 'procurement'],
      enabledWorkPackageTypes: ['wpt-pipe', 'wpt-pumphouse', 'wpt-wtp', 'wpt-reservoir'],
      approvalWorkflow: { levels: 3, approvers: ['Site Engineer', 'Project Manager', 'Client Representative'] },
      projectCalendar: { workDaysPerWeek: 6, shiftHours: 8 },
      projectStatuses: ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'],
      projectNumberFormat: 'PRJ-{YYYY}-{SEQ}',
      documentNumberFormat: 'DOC-{PRJ}-{SEQ}',
      updatedAt: new Date().toISOString(),
    };

    await db.insert(projectSettings).values(defaultSettings as any).onConflictDoNothing();
    return defaultSettings;
  }

  async updateProjectSettings(projectId: string, updates: any) {
    const existing = await this.getProjectSettings(projectId);
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await db.update(projectSettings).set(updated as any).where(eq(projectSettings.projectId, projectId));
    return updated;
  }

  // --- PHASE 51 UNIQUENESS CHECKS ---
  async checkProjectCodeExists(code: string, excludeId?: string): Promise<boolean> {
    if (!code) return false;
    const list = await db.select().from(projects).where(eq(projects.projectCode, code));
    if (excludeId) {
      return list.some((p) => p.id !== excludeId);
    }
    return list.length > 0;
  }

  async checkWorkOrderNumberExists(woNumber: string, excludeId?: string): Promise<boolean> {
    if (!woNumber) return false;
    const list = await db.select().from(projects).where(eq(projects.workOrderNumber, woNumber));
    if (excludeId) {
      return list.some((p) => p.id !== excludeId);
    }
    return list.length > 0;
  }

  async checkAgreementNumberExists(agreementNumber: string, excludeId?: string): Promise<boolean> {
    if (!agreementNumber) return false;
    const list = await db.select().from(projects).where(eq(projects.agreementNumber, agreementNumber));
    if (excludeId) {
      return list.some((p) => p.id !== excludeId);
    }
    return list.length > 0;
  }

  // --- PHASE 51 SUB-PROJECTS ---
  async findSubProjectsByParentId(parentProjectId: string): Promise<DbProject[]> {
    await ensureProjectSeeded();
    const rows = await db.select().from(projects).where(and(eq(projects.parentProjectId, parentProjectId), eq(projects.isActive, true)));
    return rows.map(mapProjectRow);
  }

  // --- PHASE 51 PROJECT STRUCTURE HIERARCHY ---
  async findStructuresByProjectId(projectId: string) {
    await ensureProjectSeeded();
    const rows = await db.select().from(projectStructures).where(and(eq(projectStructures.projectId, projectId), eq(projectStructures.isActive, true)));
    return rows;
  }

  async createStructure(data: any) {
    await ensureProjectSeeded();
    const now = new Date().toISOString();
    const id = `str-${Date.now().toString().slice(-6)}`;
    const record = {
      id,
      projectId: data.projectId,
      parentId: data.parentId || null,
      code: data.code,
      name: data.name,
      type: data.type || data.structureType || 'BUILDING',
      description: data.description || '',
      displayOrder: Number(data.displayOrder) || 0,
      status: data.status || 'ACTIVE',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(projectStructures).values(record as any);
    return record;
  }

  async updateStructure(id: string, updates: any) {
    await ensureProjectSeeded();
    const now = new Date().toISOString();
    await db.update(projectStructures).set({ ...updates, updatedAt: now }).where(eq(projectStructures.id, id));
    const [updated] = await db.select().from(projectStructures).where(eq(projectStructures.id, id));
    return updated;
  }

  async deleteStructure(id: string) {
    await ensureProjectSeeded();
    const now = new Date().toISOString();
    await db.update(projectStructures).set({ isActive: false, deletedAt: now }).where(eq(projectStructures.id, id));
    return true;
  }

  // --- PHASE 51 PROJECT DEPARTMENTS ---
  async findDepartmentsByProjectId(projectId: string) {
    await ensureProjectSeeded();
    const rows = await db.select().from(projectDepartments).where(and(eq(projectDepartments.projectId, projectId), eq(projectDepartments.status, 'ACTIVE')));
    return rows;
  }

  async addProjectDepartment(data: any) {
    await ensureProjectSeeded();
    const now = new Date().toISOString();
    const id = `pdep-${Date.now().toString().slice(-6)}`;
    const record = {
      id,
      projectId: data.projectId,
      departmentId: data.departmentId,
      departmentName: data.departmentName || 'Department',
      role: data.role || 'LEAD',
      allocatedBudget: Number(data.allocatedBudget) || 0,
      discipline: data.discipline || null,
      status: 'ACTIVE',
      createdAt: now,
    };
    await db.insert(projectDepartments).values(record as any);
    return record;
  }

  async removeProjectDepartment(id: string) {
    await ensureProjectSeeded();
    await db.update(projectDepartments).set({ status: 'INACTIVE' }).where(eq(projectDepartments.id, id));
    return true;
  }

  // --- PHASE 51 MASTER DATA ENGINE ---
  async getFundingAgencies() {
    await ensureProjectSeeded();
    return db.select().from(fundingAgencies).where(eq(fundingAgencies.isActive, true));
  }

  async createFundingAgency(data: any) {
    await ensureProjectSeeded();
    const now = new Date().toISOString();
    const id = `fnd-${Date.now().toString().slice(-6)}`;
    const record = {
      id,
      code: data.code,
      name: data.name,
      contactPerson: data.contactPerson || null,
      email: data.email || null,
      phone: data.phone || null,
      description: data.description || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(fundingAgencies).values(record);
    return record;
  }

  async getConsultants() {
    await ensureProjectSeeded();
    return db.select().from(consultants).where(eq(consultants.isActive, true));
  }

  async createConsultant(data: any) {
    await ensureProjectSeeded();
    const now = new Date().toISOString();
    const id = `cns-${Date.now().toString().slice(-6)}`;
    const record = {
      id,
      code: data.code,
      name: data.name,
      contactPerson: data.contactPerson || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      description: data.description || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(consultants).values(record);
    return record;
  }

  async getClients() {
    await ensureProjectSeeded();
    return db.select().from(clients).where(eq(clients.isActive, true));
  }

  async createClient(data: any) {
    await ensureProjectSeeded();
    const now = new Date().toISOString();
    const id = `clt-${Date.now().toString().slice(-6)}`;
    const record = {
      id,
      code: data.code,
      name: data.name,
      contactPerson: data.contactPerson || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      description: data.description || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(clients).values(record);
    return record;
  }

  async getCurrencies() {
    await ensureProjectSeeded();
    return db.select().from(currencies).where(eq(currencies.isActive, true));
  }

  async createCurrency(data: any) {
    await ensureProjectSeeded();
    const now = new Date().toISOString();
    const id = `cur-${Date.now().toString().slice(-6)}`;
    const record = {
      id,
      code: data.code,
      name: data.name,
      symbol: data.symbol || '$',
      exchangeRate: Number(data.exchangeRate) || 1.0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(currencies).values(record);
    return record;
  }

  async getProjectPriorities() {
    await ensureProjectSeeded();
    return db.select().from(projectPriorities).where(eq(projectPriorities.isActive, true));
  }

  async createProjectPriority(data: any) {
    await ensureProjectSeeded();
    const now = new Date().toISOString();
    const id = `prio-${Date.now().toString().slice(-6)}`;
    const record = {
      id,
      code: data.code,
      name: data.name,
      displayOrder: Number(data.displayOrder) || 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(projectPriorities).values(record);
    return record;
  }

  async getProjectStatuses() {
    await ensureProjectSeeded();
    return db.select().from(projectStatuses).where(eq(projectStatuses.isActive, true));
  }

  async createProjectStatus(data: any) {
    await ensureProjectSeeded();
    const now = new Date().toISOString();
    const id = `st-${Date.now().toString().slice(-6)}`;
    const record = {
      id,
      code: data.code,
      name: data.name,
      displayOrder: Number(data.displayOrder) || 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(projectStatuses).values(record);
    return record;
  }

  async getProjectCategories() {
    await ensureProjectSeeded();
    return db.select().from(projectCategories).where(eq(projectCategories.isActive, true));
  }

  async createProjectCategory(data: any) {
    await ensureProjectSeeded();
    const now = new Date().toISOString();
    const id = `pcat-${Date.now().toString().slice(-6)}`;
    const record = {
      id,
      code: data.code,
      name: data.name,
      description: data.description || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(projectCategories).values(record);
    return record;
  }

  async getProjectTypes() {
    await ensureProjectSeeded();
    return db.select().from(projectTypes).where(eq(projectTypes.isActive, true));
  }

  async createProjectType(data: any) {
    await ensureProjectSeeded();
    const now = new Date().toISOString();
    const id = `ptype-${Date.now().toString().slice(-6)}`;
    const record = {
      id,
      code: data.code,
      name: data.name,
      categoryId: data.categoryId || null,
      categoryName: data.categoryName || null,
      description: data.description || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(projectTypes).values(record);
    return record;
  }

  async getContractTypes() {
    await ensureProjectSeeded();
    return db.select().from(contractTypes).where(eq(contractTypes.isActive, true));
  }

  async createContractType(data: any) {
    await ensureProjectSeeded();
    const now = new Date().toISOString();
    const id = `ctyp-${Date.now().toString().slice(-6)}`;
    const record = {
      id,
      code: data.code,
      name: data.name,
      description: data.description || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(contractTypes).values(record);
    return record;
  }

  // --- GLOBAL SEARCH ACROSS ALL ENTITIES ---
  async globalSearch(query: string) {
    await ensureProjectSeeded();
    const q = query.toLowerCase();

    const projectRows = await db.select().from(projects);
    const siteRows = await db.select().from(sites);
    const taskRows = await db.select().from(tasks);
    const employeeRows = await db.select().from(employees);

    const filteredProjects = projectRows
      .map(mapProjectRow)
      .filter((p) => p.isActive && (p.projectName.toLowerCase().includes(q) || p.projectCode.toLowerCase().includes(q)))
      .map((p) => ({ id: p.id, title: p.projectName, type: 'PROJECT', subtitle: `${p.projectCode} • ${p.location}` }));

    const filteredSites = siteRows
      .map(mapSiteRow)
      .filter((s) => s.isActive && (s.siteName.toLowerCase().includes(q) || s.siteCode.toLowerCase().includes(q)))
      .map((s) => ({ id: s.id, title: s.siteName, type: 'SITE', subtitle: `${s.siteCode} • ${s.address}` }));

    const filteredTasks = taskRows
      .map(mapTaskRow)
      .filter((t) => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)))
      .map((t) => ({ id: t.id, title: t.title, type: 'TASK', subtitle: `Priority: ${t.priority} • Due: ${t.dueDate}` }));

    const filteredEmployees = employeeRows
      .filter((e) => e.name.toLowerCase().includes(q) || e.employeeCode.toLowerCase().includes(q) || e.email.toLowerCase().includes(q))
      .map((e) => ({ id: e.id, title: e.name, type: 'EMPLOYEE', subtitle: `${e.employeeCode} • ${e.email}` }));

    return {
      query,
      results: [...filteredProjects, ...filteredSites, ...filteredTasks, ...filteredEmployees],
    };
  }
}

export const projectRepository = new ProjectRepository();
