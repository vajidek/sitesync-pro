import React from 'react';
import { UserRole } from '../types';

export type WorkspaceId =
  | 'EXECUTIVE'
  | 'MANAGING_DIRECTOR'
  | 'GENERAL_MANAGER'
  | 'PROJECT_MANAGER'
  | 'PROJECT_ENGINEER'
  | 'SITE_ENGINEER'
  | 'STORE_OPERATIONS'
  | 'PROCUREMENT'
  | 'HR'
  | 'FLEET'
  | 'QA_QC'
  | 'SAFETY'
  | 'ADMINISTRATION';

export interface WorkspaceKPI {
  id: string;
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  iconName: string;
  category: string;
}

export interface WorkspaceTask {
  id: string;
  title: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate: string;
  category: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  assignedTo: string;
}

export interface WorkspaceApproval {
  id: string;
  title: string;
  requester: string;
  amountOrType: string;
  submittedAt: string;
  workflowCode: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface WorkspaceQuickAction {
  id: string;
  label: string;
  iconName: string;
  actionType: string;
  targetTab?: string;
  description: string;
}

export interface WorkspacePinnedReport {
  id: string;
  title: string;
  code: string;
  type: string;
  lastGenerated: string;
}

export interface WorkspacePinnedDashboard {
  id: string;
  title: string;
  widgetsCount: number;
  category: string;
}

export interface WorkspaceNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

export interface WorkspaceConfig {
  id: WorkspaceId;
  name: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  defaultRoleMapping: UserRole;
  themeColor: string;
  todaysWorkCount: number;
  kpis: WorkspaceKPI[];
  tasks: WorkspaceTask[];
  approvals: WorkspaceApproval[];
  quickActions: WorkspaceQuickAction[];
  pinnedReports: WorkspacePinnedReport[];
  pinnedDashboards: WorkspacePinnedDashboard[];
  notifications: WorkspaceNotification[];
  gridData: Record<string, any>[];
  gridColumns: {
    key: string;
    header: string;
    width?: string;
  }[];
}
