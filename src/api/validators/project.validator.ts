import { z } from 'zod';

export const createProjectSchema = z.object({
  projectCode: z.string().trim().min(2, 'Project code is required'),
  projectName: z.string().min(2, 'Project name must be at least 2 characters'),
  shortName: z.string().optional(),
  projectCategoryId: z.string().optional(),
  projectCategory: z.string().optional(),
  projectTypeId: z.string().optional(),
  projectType: z.string().optional(),
  clientId: z.string().optional(),
  clientName: z.string().optional(),
  consultantId: z.string().optional(),
  consultantName: z.string().optional(),
  fundingAgencyId: z.string().optional(),
  fundingAgencyName: z.string().optional(),
  contractNumber: z.string().optional(),
  workOrderNumber: z.string().optional(),
  tenderNumber: z.string().optional(),
  agreementNumber: z.string().optional(),
  companyId: z.string().trim().min(1, 'Company context is required'),
  businessUnitId: z.string().optional(),
  regionId: z.string().optional(),
  branchId: z.string().optional(),
  divisionId: z.string().optional(),
  parentProjectId: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  location: z.string().min(2, 'Location is required'),
  state: z.string().optional(),
  district: z.string().optional(),
  taluk: z.string().optional(),
  village: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  scheduledCompletionDate: z.string().optional(),
  targetCompletionDate: z.string().min(1, 'Target completion date is required'),
  actualCompletionDate: z.string().optional(),
  contractValue: z.number().min(0).optional(),
  revisedContractValue: z.number().min(0).optional(),
  budget: z.number().min(0, 'Budget must be non-negative'),
  actualSpent: z.number().optional(),
  progressPercentage: z.number().min(0).max(100).optional(),
  currency: z.string().trim().min(3, 'Currency is required'),
  status: z.string().optional(),
  priority: z.string().optional(),
  projectManagerId: z.string().optional(),
  projectInchargeId: z.string().optional(),
  projectSupervisorId: z.string().optional(),
  description: z.string().optional(),
  remarks: z.string().optional(),
  createInitialSite: z.boolean().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const createProjectStructureSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  parentId: z.string().nullable().optional(),
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['PACKAGE', 'ZONE', 'AREA', 'SECTION', 'LOCATION', 'ACTIVITY']),
  description: z.string().optional(),
  displayOrder: z.number().optional(),
  status: z.string().optional(),
});

export const createProjectDepartmentSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  departmentId: z.string().min(1, 'Department ID is required'),
  departmentName: z.string().optional(),
  role: z.enum(['LEAD', 'SUPPORT', 'SUBCONTRACT']).optional(),
  allocatedBudget: z.number().optional(),
  discipline: z.string().optional(),
});

export const createMasterItemSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  contactPerson: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  symbol: z.string().optional(),
  exchangeRate: z.number().optional(),
  displayOrder: z.number().optional(),
  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
});

export const createSiteSchema = z.object({
  siteCode: z.string().optional(),
  siteName: z.string().min(2, 'Site name is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  address: z.string().min(2, 'Address is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  googleMapUrl: z.string().optional(),
  siteEngineerId: z.string().optional(),
  supervisorId: z.string().optional(),
  inchargeId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'COMPLETED', 'SUSPENDED']).optional(),
  progressPercentage: z.number().optional(),
});

export const addProjectMemberSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  role: z.string().min(1, 'Role is required'),
  departmentId: z.string().optional(),
  departmentName: z.string().optional(),
  designation: z.string().optional(),
  joiningDate: z.string().optional(),
});

export const createDailyProgressSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  siteId: z.string().min(1, 'Site ID is required'),
  date: z.string().min(1, 'Date is required'),
  workCategory: z.string().min(2, 'Work category is required'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  completionPercentage: z.number().min(0).max(100),
  remarks: z.string().optional(),
  photos: z.array(z.string()).optional(),
  documents: z.array(z.string()).optional(),
});

export const createTaskSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  siteId: z.string().optional(),
  title: z.string().min(2, 'Task title is required'),
  description: z.string().optional(),
  assignedToId: z.string().optional(),
  assignedToName: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED', 'BLOCKED']).optional(),
  milestoneId: z.string().optional(),
});

export const createDocumentSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  siteId: z.string().optional(),
  documentCategory: z.enum(['DRAWING', 'BOQ', 'WORK_ORDER', 'LETTER', 'APPROVAL', 'INSPECTION', 'SITE_PHOTO', 'METHOD_STATEMENT', 'TECHNICAL']),
  title: z.string().min(2, 'Document title is required'),
  fileUrl: z.string().min(1, 'File URL is required'),
  fileType: z.string().optional(),
  fileSize: z.number().optional(),
  version: z.string().optional(),
  notes: z.string().optional(),
});

export const createMilestoneSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  title: z.string().min(2, 'Milestone title is required'),
  targetDate: z.string().min(1, 'Target date is required'),
  actualDate: z.string().optional(),
  status: z.enum(['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED']).optional(),
  delayDays: z.number().optional(),
  description: z.string().optional(),
});
