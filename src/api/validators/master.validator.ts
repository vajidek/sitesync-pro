import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
  limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 20)),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const CreateCompanySchema = z.object({
  code: z.string().min(2, 'Company code must be at least 2 characters'),
  name: z.string().min(3, 'Company name must be at least 3 characters'),
  taxId: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  logoUrl: z.string().optional(),
  currency: z.string().default('AED'),
  isActive: z.boolean().default(true),
});

export const CreateEmployeeSchema = z.object({
  employeeCode: z.string().min(3, 'Employee code required'),
  name: z.string().min(2, 'Full name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(5, 'Phone number required'),
  dateOfJoining: z.string(),
  departmentId: z.string().optional(),
  designationId: z.string().optional(),
  reportingManagerId: z.string().optional(),
  status: z.enum(['ACTIVE', 'ON_LEAVE', 'PROBATION', 'TERMINATED']).default('ACTIVE'),
  baseSalary: z.number().nonnegative().default(0),
  hourlyRate: z.number().nonnegative().default(0),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  passportNumber: z.string().optional(),
  nationalId: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const CreateProjectSchema = z.object({
  projectCode: z.string().min(3, 'Project code required'),
  projectName: z.string().min(3, 'Project name required'),
  companyId: z.string().optional(),
  customerId: z.string().optional(),
  location: z.string().min(2, 'Location required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).default('PLANNING'),
  budget: z.number().nonnegative().default(0),
  projectManagerId: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const CreateDocumentSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  fileUrl: z.string().url('Valid document URL is required'),
  fileType: z.string(),
  fileSize: z.number().nonnegative().default(0),
  entityType: z.enum(['EMPLOYEE', 'PROJECT', 'SITE', 'VEHICLE', 'EQUIPMENT', 'MATERIAL', 'CONTRACTOR', 'VENDOR', 'CUSTOMER']),
  entityId: z.string().min(1, 'Target Entity ID is required'),
  notes: z.string().optional(),
});
