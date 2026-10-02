import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address format'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  roleCode: z.enum(['ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR', 'STORE_KEEPER', 'DRIVER', 'OPERATOR', 'WORKER']),
  department: z.string().min(2, 'Department is required'),
  phone: z.string().min(5, 'Valid phone number required'),
  assignedProjectId: z.string().optional(),
  assignedProjectName: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  assignedProjectId: z.string().optional(),
  assignedProjectName: z.string().optional(),
  isActive: z.boolean().optional(),
  roleCode: z.enum(['ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR', 'STORE_KEEPER', 'DRIVER', 'OPERATOR', 'WORKER']).optional(),
});
