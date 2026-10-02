import React from 'react';
import { ChevronRight, Home, Building2, Layers } from 'lucide-react';
import { NavTab } from './Sidebar';
import { useShell } from './ShellContext';

export interface AppBreadcrumbProps {
  activeTab: NavTab;
  onNavigateTab: (tab: NavTab) => void;
}

const TAB_META: Record<NavTab, { category: string; label: string }> = {
  commandCenter: { category: 'Overview & Command', label: 'Operations Command Center' },
  dashboard: { category: 'Overview & Command', label: 'Executive Dashboard' },
  hr: { category: 'Organization & HR', label: 'Enterprise HRMS & Payroll' },
  resources: { category: 'Organization & HR', label: 'Enterprise Resource Management' },
  projects: { category: 'Projects & Engineering', label: 'Projects & Sites' },
  projectcontrols: { category: 'Projects & Engineering', label: 'Project Controls & Planning' },
  waterInfrastructure: { category: 'Projects & Engineering', label: 'Water & Utility Engineering' },
  workorders: { category: 'Projects & Engineering', label: 'Work Orders & Site Execution' },
  mobile: { category: 'Projects & Engineering', label: 'Mobile Field Ops & GIS' },
  procurement: { category: 'Procurement & Contracts', label: 'Enterprise Procurement & Contracts' },
  inventory: { category: 'Stores & Materials', label: 'Materials & Warehouse Store' },
  fleet: { category: 'Plant, Fleet & EAM', label: 'Fleet & Heavy Logistics' },
  eam: { category: 'Plant, Fleet & EAM', label: 'EAM & Plant Maintenance' },
  machinery: { category: 'Plant, Fleet & EAM', label: 'Machinery & Equipment' },
  finance: { category: 'Commercial & Finance', label: 'Finance & Cost Control' },
  expenses: { category: 'Commercial & Finance', label: 'Employee Expenses & Petty Cash' },
  commercial: { category: 'Commercial & Finance', label: 'Commercial, Tenders & Subcontracts' },
  qaqc: { category: 'Quality & HSE Safety', label: 'QA/QC Quality Management' },
  quality: { category: 'Quality & HSE Safety', label: 'QA/QC Quality Management' },
  hse: { category: 'Quality & HSE Safety', label: 'HSE Safety & Environment' },
  safety: { category: 'Quality & HSE Safety', label: 'HSE Safety & Environment' },
  iot: { category: 'IoT, SCADA & Automation', label: 'Industrial IoT & SCADA' },
  scada: { category: 'IoT, SCADA & Automation', label: 'Industrial IoT & SCADA' },
  aiIntelligence: { category: 'Intelligence & EDMS', label: 'AI Intelligence & Decisions' },
  aiGateway: { category: 'Intelligence & EDMS', label: 'Multi-Model AI Gateway' },
  analytics: { category: 'Intelligence & EDMS', label: 'Executive BI & Analytics' },
  documents: { category: 'Intelligence & EDMS', label: 'Document System (EDMS)' },
  crm: { category: 'CRM & Stakeholders', label: 'Enterprise CRM & Client Portal' },
  admin: { category: 'Administration & Governance', label: 'System Governance & RBAC' },
  adminServices: { category: 'Administration & Governance', label: 'Office Administration & General Services' },
  itManagement: { category: 'Administration & Governance', label: 'IT & Digital Asset Management' },
  masterData: { category: 'Administration & Governance', label: 'Master Data Governance (MDM)' },
  workflow: { category: 'Administration & Governance', label: 'Workflow Engine & Approvals' },
  helpCenter: { category: 'Administration & Governance', label: 'Enterprise Help Center & Admin Manual' },
  schema: { category: 'Administration & Governance', label: 'ERP Schema Inspector' },
  about: { category: 'Administration & Governance', label: 'System & Architecture' },
};

export const AppBreadcrumb: React.FC<AppBreadcrumbProps> = ({ activeTab, onNavigateTab }) => {
  const { currentCompany, currentBranch } = useShell();
  const meta = TAB_META[activeTab] || { category: 'Enterprise', label: activeTab };

  const companyLabels: Record<string, string> = {
    APEX_GLOBAL: 'SiteSync Global Corporate HQ',
    APEX_ME: 'Middle East Division',
    APEX_INDIA: 'South Asia Division',
  };

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 py-2 overflow-x-auto scrollbar-none font-medium">
      <button
        onClick={() => onNavigateTab('dashboard')}
        className="flex items-center space-x-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{companyLabels[currentCompany] || 'SiteSync Pro'}</span>
      </button>

      <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />

      <span className="text-slate-400 dark:text-slate-500 flex items-center space-x-1 whitespace-nowrap">
        <Layers className="w-3 h-3 text-slate-400" />
        <span>{meta.category}</span>
      </span>

      <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />

      <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800/60">
        {meta.label}
      </span>
    </nav>
  );
};
