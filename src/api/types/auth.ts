import { Request } from 'express';
import { UserRole } from '../../types';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  roleId: string;
  roleName?: string;
  department?: string;
  phone?: string;
  avatarUrl?: string;
  assignedProjectId?: string;
  assignedProjectName?: string;
  permissions: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  token?: string;
}
