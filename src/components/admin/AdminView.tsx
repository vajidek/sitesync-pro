import React, { useState } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Users, 
  Lock, 
  Package, 
  Building, 
  Activity,
  RefreshCw,
  Download,
  GitMerge, 
  KeyRound, 
  FileText, 
  BarChart3, 
  Sliders, 
  Zap, 
  Network
} from 'lucide-react';
import { DSPageHeader, DSButton, DSTabs } from '../ui/design-system';
import { AdminDashboard } from './AdminDashboard';
import { UserManagementView } from './UserManagementView';
import { RolePermissionView } from './RolePermissionView';
import { ModuleRegistryView } from './ModuleRegistryView';
import { WorkflowBuilderView } from './WorkflowBuilderView';
import { OrgSettingsView } from './OrgSettingsView';
import { AuditLogView } from './AuditLogView';
import { LoginHistoryView } from './LoginHistoryView';
import { AbacPermissionManagerView } from './AbacPermissionManagerView';
import { FormDesignerEngineView } from './FormDesignerEngineView';
import { ReportEngineView } from './ReportEngineView';
import { DashboardEngineView } from './DashboardEngineView';
import { AutomationEngineView } from './AutomationEngineView';
import { IntegrationHubView } from './IntegrationHubView';
import { OfficeAdminModule } from '../office-admin/OfficeAdminModule';
import { EnterpriseITManagementModule } from '../it/EnterpriseITManagementModule';
import { Laptop } from 'lucide-react';

import { safeJson } from '../../lib/safeFetch';
import { NavTab } from '../layout/Sidebar';

export type AdminSubtab = 'dashboard' | 'users' | 'adminServices' | 'itManagement' | 'loginHistory' | 'roles' | 'abac' | 'modules' | 'workflows' | 'forms' | 'reports' | 'dashboards' | 'automations' | 'integrations' | 'settings' | 'audit';

export interface AdminViewProps {
  onNavigateTab?: (tab: NavTab) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onNavigateTab }) => {
  const [activeSubtab, setActiveSubtab] = useState<AdminSubtab>('dashboard');

  const navItems: { id: AdminSubtab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'adminServices', label: 'Office Administration & Services', icon: <Building className="w-4 h-4 text-emerald-500" /> },
    { id: 'itManagement', label: 'IT & Digital Assets (ITAM / ITSM)', icon: <Laptop className="w-4 h-4 text-indigo-500" /> },
    { id: 'users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
    { id: 'loginHistory', label: 'Login History Log', icon: <KeyRound className="w-4 h-4 text-amber-500" /> },
    { id: 'roles', label: 'Roles & Permissions Matrix', icon: <Lock className="w-4 h-4" /> },
    { id: 'abac', label: 'ABAC Policy Engine', icon: <KeyRound className="w-4 h-4" /> },
    { id: 'modules', label: 'ERP Module Registry', icon: <Package className="w-4 h-4" /> },
    { id: 'workflows', label: 'Workflow Engine Builder', icon: <GitMerge className="w-4 h-4" /> },
    { id: 'forms', label: 'Dynamic Form Designer', icon: <FileText className="w-4 h-4" /> },
    { id: 'reports', label: 'Enterprise Report Engine', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'dashboards', label: 'Dashboard Builder Engine', icon: <Sliders className="w-4 h-4" /> },
    { id: 'automations', label: 'Notification & Automation', icon: <Zap className="w-4 h-4 text-amber-500" /> },
    { id: 'integrations', label: 'Enterprise Integration Hub', icon: <Network className="w-4 h-4 text-indigo-500" /> },
    { id: 'settings', label: 'Org & System Settings', icon: <Building className="w-4 h-4" /> },
    { id: 'audit', label: 'Security Audit Logs', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Module Title Banner & Actions */}
      <DSPageHeader
        title="System Governance & RBAC Administration"
        description="User provisioning, dynamic role creation, permissions matrix, module registry & audit logs"
        breadcrumbs={[{ label: 'ERP' }, { label: 'Administration' }]}
        actions={
          <>
            <DSButton
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-blue-600" />}
              onClick={() => window.location.reload()}
            >
              Refresh
            </DSButton>

            <DSButton
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5 text-emerald-600" />}
              onClick={() => {
                const csvContent = ["Subtab,Timestamp"].join(",") + "\n" + `"${activeSubtab}","${new Date().toISOString()}"`;
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", `admin_${activeSubtab}_export_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
            >
              Export
            </DSButton>
          </>
        }
      />

      {/* Top Admin Subtab Header */}
      <div className="pb-2">
        <DSTabs
          tabs={navItems.map((item) => ({
            id: item.id,
            label: item.label,
            icon: item.icon,
          }))}
          activeTab={activeSubtab}
          onChange={(id) => setActiveSubtab(id as AdminSubtab)}
          variant="underline"
        />
      </div>

      {/* Render Active Subtab Content */}
      <div className="min-w-0">
        {activeSubtab === 'dashboard' && (
          <AdminDashboard onNavigateSubtab={(subtab) => setActiveSubtab(subtab)} />
        )}
        {activeSubtab === 'adminServices' && <OfficeAdminModule />}
        {activeSubtab === 'itManagement' && <EnterpriseITManagementModule />}
        {activeSubtab === 'users' && <UserManagementView />}
        {activeSubtab === 'loginHistory' && <LoginHistoryView />}
        {activeSubtab === 'roles' && <RolePermissionView />}
        {activeSubtab === 'abac' && <AbacPermissionManagerView />}
        {activeSubtab === 'modules' && <ModuleRegistryView />}
        {activeSubtab === 'workflows' && <WorkflowBuilderView />}
        {activeSubtab === 'forms' && <FormDesignerEngineView />}
        {activeSubtab === 'reports' && <ReportEngineView />}
        {activeSubtab === 'dashboards' && <DashboardEngineView />}
        {activeSubtab === 'automations' && <AutomationEngineView />}
        {activeSubtab === 'integrations' && <IntegrationHubView />}
        {activeSubtab === 'settings' && <OrgSettingsView />}
        {activeSubtab === 'audit' && <AuditLogView />}
      </div>
    </div>
  );
};
