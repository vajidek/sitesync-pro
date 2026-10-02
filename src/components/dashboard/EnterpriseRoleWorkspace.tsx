import React, { useState, useEffect } from 'react';
import { useAuth, getActiveStoredToken } from '../../context/AuthContext';
import { useShell } from '../layout/ShellContext';
import { UserRole } from '../../types';
import { safeJson } from '../../lib/safeFetch';
import { WorkspaceId, WorkspaceConfig } from '../../types/workspace';
import { WORKSPACE_CONFIGS, getWorkspaceConfig } from '../../data/workspaceData';
import {
  DSPageHeader,
  DSCard,
  DSButton,
  DSStatusChip,
  DSAlert,
  DSProgressBar,
  DSEnterpriseDataGrid,
  DSTabs,
  DSBadge
} from '../ui/design-system';
import {
  Building2,
  Award,
  Briefcase,
  Compass,
  HardHat,
  Boxes,
  FileSpreadsheet,
  Users,
  Truck,
  ShieldCheck,
  ShieldAlert,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Zap,
  History,
  Gauge,
  Layers,
  Clock,
  Star,
  Activity,
  Sliders,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  Fuel,
  Wrench,
  Plus,
  Send,
  BarChart3,
  FileText,
  Calculator,
  UserCheck,
  Search,
  ChevronRight,
  ArrowUpRight,
  Check,
  X,
  RefreshCw,
  LayoutDashboard,
  Bell,
  CheckSquare,
  Sparkles,
  Calendar
} from 'lucide-react';

// Icon map for dynamic icon lookup
const ICON_MAP: Record<string, React.ReactNode> = {
  Building2: <Building2 className="w-5 h-5" />,
  Award: <Award className="w-5 h-5" />,
  Briefcase: <Briefcase className="w-5 h-5" />,
  Compass: <Compass className="w-5 h-5" />,
  HardHat: <HardHat className="w-5 h-5" />,
  Boxes: <Boxes className="w-5 h-5" />,
  FileSpreadsheet: <FileSpreadsheet className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  Truck: <Truck className="w-5 h-5" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5" />,
  DollarSign: <DollarSign className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
  Clock: <Clock className="w-5 h-5" />,
  Star: <Star className="w-5 h-5" />,
  Activity: <Activity className="w-5 h-5" />,
  Sliders: <Sliders className="w-5 h-5" />,
  HelpCircle: <HelpCircle className="w-5 h-5" />,
  CheckCircle2: <CheckCircle2 className="w-5 h-5" />,
  AlertTriangle: <AlertTriangle className="w-5 h-5" />,
  Droplets: <Droplets className="w-5 h-5" />,
  Fuel: <Fuel className="w-5 h-5" />,
  Wrench: <Wrench className="w-5 h-5" />,
  Plus: <Plus className="w-5 h-5" />,
  Send: <Send className="w-5 h-5" />,
  BarChart3: <BarChart3 className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  Calculator: <Calculator className="w-5 h-5" />,
  UserCheck: <UserCheck className="w-5 h-5" />,
};

// Map default UserRole to corresponding WorkspaceId
const ROLE_TO_WORKSPACE_MAP: Record<UserRole, WorkspaceId> = {
  ADMIN: 'ADMINISTRATION',
  MANAGER: 'PROJECT_MANAGER',
  INCHARGE: 'SITE_ENGINEER',
  SUPERVISOR: 'SITE_ENGINEER',
  STORE_KEEPER: 'STORE_OPERATIONS',
  DRIVER: 'FLEET',
  OPERATOR: 'FLEET',
  WORKER: 'SITE_ENGINEER',
};

// Role-specific operational summary cards helper

const getLiveMetricForKpi = (label: string, live?: any): string | null => {
  if (!live) return null;
  const normalized = label.toLowerCase();
  if (normalized.includes('actual cost')) return live.totalPrjSpentUSD !== undefined ? '$' + (Number(live.totalPrjSpentUSD) / 1000000).toFixed(2) + 'M' : null;
  if (normalized.includes('budget') || normalized.includes('capex')) return live.totalPrjBudgetUSD !== undefined ? '$' + (Number(live.totalPrjBudgetUSD) / 1000000).toFixed(2) + 'M' : null;
  if (normalized.includes('progress') || normalized.includes('completion')) return live.avgProgressPercent !== undefined ? Number(live.avgProgressPercent) + '%' : null;
  if (normalized.includes('vendor')) return live.activeVendorsCount !== undefined ? Number(live.activeVendorsCount) + ' Active' : null;
  if (normalized.includes('project')) return live.totalProjects !== undefined ? Number(live.totalProjects) + ' Projects' : null;
  if (normalized.includes('availability')) return null;
  if (normalized.includes('fleet') || normalized.includes('machinery')) return live.totalFleetCount !== undefined ? Number(live.totalFleetCount) + ' Assets' : null;
  if (normalized.includes('requisition') || /\bpr\b/.test(normalized)) return live.pendingPRsCount !== undefined ? Number(live.pendingPRsCount) + ' Pending' : null;
  if (normalized.includes('workforce') || normalized.includes('employee') || normalized.includes('labour') || normalized.includes('labor')) return live.activeEmployeesCount !== undefined ? Number(live.activeEmployeesCount) + ' Employees' : null;
  if (normalized.includes('low stock')) return live.lowStockItemsCount !== undefined ? Number(live.lowStockItemsCount) + ' SKUs' : null;
  if (normalized.includes('active po')) return live.activePOsCount !== undefined ? Number(live.activePOsCount) + ' POs' : null;
  return null;
};

const sanitizeProductionKpis = (kpis: WorkspaceConfig['kpis'], live?: any): WorkspaceConfig['kpis'] =>
  kpis.map((kpi) => {
    const liveValue = getLiveMetricForKpi(kpi.label, live);
    return { ...kpi, value: liveValue ?? '—', change: liveValue ? 'Live repository data' : 'No live metric mapped', isPositive: Boolean(liveValue) };
  });

const sanitizeProductionSummaryCards = (cards: Array<{ label: string; val: string; desc: string; color: string }>, live?: any) =>
  cards.map((card) => {
    const liveValue = getLiveMetricForKpi(card.label, live);
    return { ...card, val: liveValue ?? '—', desc: liveValue ? 'Live repository data' : 'No live metric mapped' };
  });
const getRoleSummaryCards = (ws: WorkspaceConfig, live?: any, isDemo: boolean = true) => {
  switch (ws.id) {
    case 'MANAGING_DIRECTOR':
      return [
        { label: 'Tender Pipeline', val: `${ws.gridData?.length || 0} Tenders`, desc: live?.totalPrjBudgetUSD ? `$${(live.totalPrjBudgetUSD / 1000000).toFixed(1)}M Est Value` : (isDemo ? '$18.5M Est Value' : '$0.00'), color: 'text-amber-300' },
        { label: 'Approved Vendors', val: live?.activeVendorsCount !== undefined ? `${live.activeVendorsCount} Vendors` : (isDemo ? '24 Vendors' : '0 Vendors'), desc: 'SLA Compliant', color: 'text-indigo-300' },
        { label: 'PO Approvals', val: live?.activePOsCount !== undefined ? `${live.activePOsCount} Active` : `${ws.approvals.length} Pending`, desc: 'Sign-off Queue', color: 'text-rose-300' },
        { label: 'Active Divisions', val: isDemo ? '3 Sectors' : 'Corporate HQ', desc: '100% Operational', color: 'text-emerald-300' },
        { label: 'Strategic KPIs', val: '4 Metrics', desc: 'Corporate Board', color: 'text-cyan-300' },
        { label: 'Compliance Audit', val: 'Verified', desc: 'ISO & Governance', color: 'text-teal-300' },
      ];
    case 'GENERAL_MANAGER':
      return [
        { label: 'Schedule Index (SPI)', val: '1.04', desc: '+0.02 vs target', color: 'text-emerald-300' },
        { label: 'Cost Index (CPI)', val: '1.02', desc: 'Under Budget', color: 'text-indigo-300' },
        { label: 'Fleet Availability', val: live?.totalFleetCount !== undefined ? `${live.totalFleetCount} Assets` : (isDemo ? '12 Machine Assets' : '0 Assets'), desc: 'Tracked Assets', color: 'text-cyan-300' },
        { label: 'Requisitions (PR)', val: live?.pendingPRsCount !== undefined ? `${live.pendingPRsCount} Pending` : `${ws.approvals.length} Pending`, desc: 'Sign-off Queue', color: 'text-amber-300' },
        { label: 'Active Projects', val: live?.totalProjects !== undefined ? `${live.totalProjects} Sites` : (isDemo ? '3 Sites' : '0 Sites'), desc: 'Live Project Sites', color: 'text-teal-300' },
        { label: 'Department Orders', val: `${ws.tasks.length} Orders`, desc: 'Cross-Department', color: 'text-rose-300' },
      ];
    case 'PROJECT_MANAGER':
      return [
        { label: 'Earned Value (EV)', val: live?.totalPrjSpentUSD ? `$${(live.totalPrjSpentUSD / 1000000).toFixed(2)}M` : (isDemo ? '$5.78M' : '$0.00'), desc: live?.avgProgressPercent !== undefined ? `${live.avgProgressPercent}% Progress` : (isDemo ? '68% Progress' : '0% Progress'), color: 'text-emerald-300' },
        { label: 'Actual Cost (AC)', val: live?.totalPrjBudgetUSD ? `$${(live.totalPrjBudgetUSD / 1000000).toFixed(2)}M` : (isDemo ? '$5.78M' : '$0.00'), desc: 'Budget Baseline', color: 'text-indigo-300' },
        { label: 'Work Packages', val: `${ws.tasks.length} Active`, desc: 'Site Operations', color: 'text-amber-300' },
        { label: 'Pending PRs', val: live?.pendingPRsCount !== undefined ? `${live.pendingPRsCount} Requests` : `${ws.approvals.length} Requests`, desc: 'Requisition Approval', color: 'text-rose-300' },
        { label: 'Site Safety Record', val: '0 Incidents', desc: 'Zero Harm', color: 'text-teal-300' },
        { label: 'Subcontractor Bills', val: 'Verified', desc: 'Payment Certified', color: 'text-cyan-300' },
      ];
    case 'PROJECT_ENGINEER':
      return [
        { label: 'Technical RFIs', val: '0 Open', desc: 'Design Queries', color: 'text-amber-300' },
        { label: 'Drawing Submittals', val: 'Verified', desc: 'Structural & Civil', color: 'text-indigo-300' },
        { label: 'Test Certificates', val: `${ws.approvals.length} Verified`, desc: 'Hydro & Slump', color: 'text-emerald-300' },
        { label: 'Inspector Witness Logs', val: 'Signed', desc: 'Signoff Complete', color: 'text-cyan-300' },
        { label: 'Active Machinery', val: live?.totalFleetCount !== undefined ? `${live.totalFleetCount} Units` : (isDemo ? '12 Units' : '0 Units'), desc: 'On Site Assets', color: 'text-teal-300' },
        { label: 'Pour Card Status', val: 'Active', desc: 'Pier Concrete', color: 'text-rose-300' },
      ];
    case 'SITE_ENGINEER':
      return [
        { label: 'Daily DPR Logs', val: `${ws.tasks.length} Submitted`, desc: 'Shift Production', color: 'text-indigo-300' },
        { label: 'Site Labour Crew', val: live?.activeEmployeesCount !== undefined ? `${live.activeEmployeesCount} Workers` : (isDemo ? '118 Workers' : '0 Workers'), desc: 'Shift Attendance', color: 'text-emerald-300' },
        { label: 'Pending Material PRs', val: live?.pendingPRsCount !== undefined ? `${live.pendingPRsCount} Pending` : `${ws.approvals.length} Pending`, desc: 'Site Store', color: 'text-amber-300' },
        { label: 'Concrete Deliveries', val: 'Logged', desc: 'Mix Grade', color: 'text-cyan-300' },
        { label: 'Site Safety Brief', val: 'Complete', desc: 'Shift Briefed', color: 'text-teal-300' },
        { label: 'Issue Flags', val: '0 Critical', desc: 'Clear Site', color: 'text-rose-300' },
      ];
    case 'STORE_OPERATIONS':
      return [
        { label: 'Catalog SKUs', val: `${ws.gridData?.length || 0} Items`, desc: 'Central Store', color: 'text-indigo-300' },
        { label: 'Low Stock Alerts', val: live?.lowStockItemsCount !== undefined ? `${live.lowStockItemsCount} SKUs` : (isDemo ? '2 SKUs' : '0 SKUs'), desc: 'Action Required', color: 'text-amber-300' },
        { label: 'Stock Valuation', val: isDemo ? '$68.4K' : 'Audited', desc: 'Audit Verified', color: 'text-emerald-300' },
        { label: 'GRNs Processed', val: `${ws.approvals.length} Records`, desc: 'Vendor Deliveries', color: 'text-cyan-300' },
        { label: 'Pending Issues', val: '0 Slips', desc: 'To Site Sectors', color: 'text-teal-300' },
        { label: 'Gate Passes', val: 'Active', desc: 'Dispatch Log', color: 'text-rose-300' },
      ];
    case 'PROCUREMENT':
      return [
        { label: 'Active POs', val: live?.activePOsCount !== undefined ? `${live.activePOsCount} POs` : `${ws.gridData?.length || 0} POs`, desc: 'Released to Vendors', color: 'text-indigo-300' },
        { label: 'Approved Vendors', val: live?.activeVendorsCount !== undefined ? `${live.activeVendorsCount} Active` : (isDemo ? '18 Active' : '0 Active'), desc: 'Vetted Partners', color: 'text-emerald-300' },
        { label: 'Pending PRs', val: live?.pendingPRsCount !== undefined ? `${live.pendingPRsCount} Requests` : `${ws.tasks.length} Requests`, desc: 'Requisition Queue', color: 'text-amber-300' },
        { label: 'RFQs Open', val: 'Active', desc: 'Bidding Window', color: 'text-cyan-300' },
        { label: 'PO Value Total', val: live?.totalPrjSpentUSD ? `$${(live.totalPrjSpentUSD / 1000).toFixed(0)}K` : (isDemo ? '$420K' : '$0.00'), desc: 'Issued Capex', color: 'text-teal-300' },
        { label: 'Pending Approvals', val: `${ws.approvals.length} Signoffs`, desc: 'Review Queue', color: 'text-rose-300' },
      ];
    case 'HR':
      return [
        { label: 'Active Workforce', val: live?.activeEmployeesCount !== undefined ? `${live.activeEmployeesCount} Employees` : `${ws.gridData?.length || 0} Employees`, desc: 'Direct Hire', color: 'text-indigo-300' },
        { label: 'Today Attendance', val: 'Active', desc: 'Shift Roster', color: 'text-emerald-300' },
        { label: 'Leave Requests', val: `${ws.approvals.length} Pending`, desc: 'Sign-off Queue', color: 'text-amber-300' },
        { label: 'Monthly Payroll', val: 'Processed', desc: 'Statutory Ledger', color: 'text-cyan-300' },
        { label: 'Site Allocations', val: live?.totalProjects !== undefined ? `${live.totalProjects} Sites` : (isDemo ? '3 Sites' : '0 Sites'), desc: 'Labour Shift', color: 'text-teal-300' },
        { label: 'Open Requisitions', val: 'Recruitment', desc: 'Active Roles', color: 'text-rose-300' },
      ];
    case 'FLEET':
      return [
        { label: 'Heavy Assets', val: live?.totalFleetCount !== undefined ? `${live.totalFleetCount} Machines` : `${ws.gridData?.length || 0} Machines`, desc: 'Tracked Fleet', color: 'text-indigo-300' },
        { label: 'Operational Status', val: 'Operational', desc: 'Live Units Active', color: 'text-emerald-300' },
        { label: 'In Maintenance', val: '0 Machines', desc: 'Service Bay', color: 'text-amber-300' },
        { label: 'Avg Fuel Level', val: 'Normal', desc: 'Diesel Float', color: 'text-cyan-300' },
        { label: 'Active Operators', val: 'Assigned', desc: 'Rostered', color: 'text-teal-300' },
        { label: 'Dispatch Approvals', val: `${ws.approvals.length} Requests`, desc: 'Fleet Signoff', color: 'text-rose-300' },
      ];
    case 'QA_QC':
      return [
        { label: 'Quality Test Reports', val: `${ws.gridData?.length || 0} Reports`, desc: 'Verified Certificates', color: 'text-emerald-300' },
        { label: 'Test Pass Rate', val: '100%', desc: 'Zero Defect Rate', color: 'text-indigo-300' },
        { label: 'Pending Inspections', val: `${ws.tasks.length} Orders`, desc: 'Site Inspection', color: 'text-amber-300' },
        { label: 'Open NCRs', val: '0 Flags', desc: 'Fully Compliant', color: 'text-teal-300' },
        { label: 'Hydrostatic Tests', val: 'Passed', desc: 'Pipeline Sector', color: 'text-cyan-300' },
        { label: 'Signoff Queue', val: `${ws.approvals.length} Certificates`, desc: 'Witness Officer', color: 'text-rose-300' },
      ];
    case 'SAFETY':
      return [
        { label: 'Cumulative Safe Hrs', val: isDemo ? '14,280 Hrs' : 'Compliant', desc: 'Zero LTI Record', color: 'text-emerald-300' },
        { label: 'Safety Incidents', val: '0 Incidents', desc: 'Target Achieved', color: 'text-teal-300' },
        { label: 'PPE Compliance', val: '100%', desc: 'Site Audit Pass', color: 'text-indigo-300' },
        { label: 'Toolbox Talks', val: 'Active', desc: 'Daily Briefings', color: 'text-cyan-300' },
        { label: 'Permit to Work', val: `${ws.approvals.length} Active`, desc: 'Hot Work Clearance', color: 'text-amber-300' },
        { label: 'Safety Tasks', val: `${ws.tasks.length} Actions`, desc: 'HSE Routine', color: 'text-rose-300' },
      ];
    case 'ADMINISTRATION':
      return [
        { label: 'Provisioned Users', val: live?.activeEmployeesCount !== undefined ? `${live.activeEmployeesCount} Users` : `${ws.gridData?.length || 0} Users`, desc: 'Enterprise Directory', color: 'text-indigo-300' },
        { label: 'Security Roles', val: '8 Core Roles', desc: 'RBAC Enforced', color: 'text-emerald-300' },
        { label: 'ABAC Policies', val: 'Enforced', desc: 'Row-Level Policy', color: 'text-cyan-300' },
        { label: 'System Health', val: '100% Operational', desc: 'Zero Outages', color: 'text-teal-300' },
        { label: 'Role Escalations', val: `${ws.approvals.length} Pending`, desc: 'Security Approvals', color: 'text-amber-300' },
        { label: 'Audit Trail', val: 'Active', desc: 'Realtime Logging', color: 'text-rose-300' },
      ];
    default:
      return [
        { label: 'Pending Approvals', val: `${ws.approvals.length} Requests`, desc: 'Workflow Queue', color: 'text-amber-300' },
        { label: 'Open Work Orders', val: `${ws.tasks.length} Orders`, desc: 'Task Queue', color: 'text-indigo-300' },
        { label: 'Active Labour', val: live?.activeEmployeesCount !== undefined ? `${live.activeEmployeesCount} Workers` : (isDemo ? '118 Workers' : '0 Workers'), desc: 'Shift Attendance', color: 'text-emerald-300' },
        { label: 'Active Machinery', val: live?.totalFleetCount !== undefined ? `${live.totalFleetCount} Assets` : (isDemo ? '14 Assets' : '0 Assets'), desc: 'Fleet Status', color: 'text-cyan-300' },
        { label: 'Material Requests', val: `${live?.pendingPRsCount || 0} Pending`, desc: 'Store Requisition', color: 'text-teal-300' },
        { label: 'Procurement Queue', val: live?.totalPrjSpentUSD ? `$${(live.totalPrjSpentUSD / 1000).toFixed(0)}K` : (isDemo ? '$420K POs' : '$0.00 POs'), desc: 'Vendor Approvals', color: 'text-rose-300' },
      ];
  }
};

interface EnterpriseRoleWorkspaceProps {
  onNavigateToTab?: (tab: string) => void;
  onOpenAbout?: () => void;
}

export const EnterpriseRoleWorkspace: React.FC<EnterpriseRoleWorkspaceProps> = ({
  onNavigateToTab,
  onOpenAbout,
}) => {
  const { user, activeRole } = useAuth();

  // Active workspace selection state
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<WorkspaceId>(
    () => (activeRole && ROLE_TO_WORKSPACE_MAP[activeRole]) || 'EXECUTIVE'
  );

  // Sync workspace if active role changes
  useEffect(() => {
    if (activeRole && ROLE_TO_WORKSPACE_MAP[activeRole]) {
      setSelectedWorkspaceId(ROLE_TO_WORKSPACE_MAP[activeRole]);
    }
  }, [activeRole]);

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Tab inside workspace
  const [activeWorkspaceSubTab, setActiveWorkspaceSubTab] = useState<
    'overview' | 'work' | 'approvals' | 'data' | 'reports'
  >('overview');

  // Interactive task completion state
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'info'; msg: string } | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<any>(null);
  const [liveProjects, setLiveProjects] = useState<any[]>([]);
  const [liveMetricsStatus, setLiveMetricsStatus] = useState<'LOADING' | 'LIVE' | 'UNAVAILABLE'>('LOADING');
  const { isDemo } = useShell();

  useEffect(() => {
    const token = getActiveStoredToken();
    setLiveMetricsStatus('LOADING');
    fetch(`/api/dashboards/workspace/${selectedWorkspaceId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => safeJson(res))
      .then((data) => {
        if (data?.success && data.data) {
          setLiveMetrics(data.data.summaryMetrics || {});
          if (Array.isArray(data.data.projects)) setLiveProjects(data.data.projects);
          else setLiveProjects([]);
          setLiveMetricsStatus('LIVE');
        } else {
          setLiveMetricsStatus('UNAVAILABLE');
        }
      })
      .catch(() => {
        setLiveMetricsStatus('UNAVAILABLE');
        setLiveMetrics(null);
        setLiveProjects([]);
      });
  }, [selectedWorkspaceId]);

  const baseWorkspace: WorkspaceConfig = getWorkspaceConfig(selectedWorkspaceId, user, isDemo) || WORKSPACE_CONFIGS.EXECUTIVE;

  const activeWorkspace: WorkspaceConfig = isDemo
    ? {
        ...baseWorkspace,
        kpis: baseWorkspace.kpis.map((kpi, idx) => {
          if (!liveMetrics) return kpi;
          if (idx === 0 && liveMetrics.totalPrjBudgetUSD !== undefined) {
            return { ...kpi, value: '

  const toggleTaskComplete = (taskId: string, title: string) => {
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
        setActionAlert({ type: 'info', msg: `Task "${title}" marked as pending.` });
      } else {
        next.add(taskId);
        setActionAlert({ type: 'success', msg: `Task "${title}" completed successfully!` });
      }
      return next;
    });
  };

  const allWorkspaceList: { id: WorkspaceId; label: string; icon: string }[] = [
    { id: 'EXECUTIVE', label: 'Executive Workspace', icon: 'Building2' },
    { id: 'MANAGING_DIRECTOR', label: 'Managing Director', icon: 'Award' },
    { id: 'GENERAL_MANAGER', label: 'General Manager', icon: 'Briefcase' },
    { id: 'PROJECT_MANAGER', label: 'Project Manager', icon: 'Building2' },
    { id: 'PROJECT_ENGINEER', label: 'Project Engineer', icon: 'Compass' },
    { id: 'SITE_ENGINEER', label: 'Site Engineer', icon: 'HardHat' },
    { id: 'STORE_OPERATIONS', label: 'Store Operations', icon: 'Boxes' },
    { id: 'PROCUREMENT', label: 'Procurement', icon: 'FileSpreadsheet' },
    { id: 'HR', label: 'HR & Payroll', icon: 'Users' },
    { id: 'FLEET', label: 'Fleet & Machinery', icon: 'Truck' },
    { id: 'QA_QC', label: 'QA / QC', icon: 'ShieldCheck' },
    { id: 'SAFETY', label: 'Safety (HSE)', icon: 'ShieldAlert' },
    { id: 'ADMINISTRATION', label: 'Administration', icon: 'ShieldCheck' },
  ];

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const criticalAlertsCount = (activeWorkspace.notifications || []).filter(
    (n) => n.severity === 'error' || n.severity === 'warning' || n.title.toLowerCase().includes('alert') || n.title.toLowerCase().includes('safety')
  ).length;

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* SECTION 1: EXECUTIVE HERO COMMAND CENTER BANNER (COMPRESSED 45%)          */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-3.5 sm:p-4 shadow-xl border border-slate-700/80">
        {/* Subtle grid pattern background overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                SiteSync Pro — Construction & Infrastructure Project Management Platform
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300 font-medium flex items-center gap-1 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                {todayFormatted}
              </span>
              <span className="text-slate-400">•</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                liveMetricsStatus === 'LIVE'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : liveMetricsStatus === 'LOADING'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  liveMetricsStatus === 'LIVE' ? 'bg-emerald-400 animate-pulse' : liveMetricsStatus === 'LOADING' ? 'bg-amber-400' : 'bg-slate-400'
                }`} />
                {liveMetricsStatus === 'LIVE' ? 'Live Data Connected' : liveMetricsStatus === 'LOADING' ? 'Syncing Workspace Data' : 'Live Data Unavailable'}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2 pt-0.5">
              <span>Welcome, {user?.name || 'Executive'}</span>
            </h1>
            <p className="text-xs text-slate-300">
              Active Context: <strong className="text-indigo-300 font-semibold">{activeWorkspace.name}</strong> ({activeWorkspace.code}) — {activeWorkspace.title}
            </p>
          </div>

          {/* Header Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setActionAlert({ type: 'info', msg: `${activeWorkspace.name} intelligence synced with ERP backend.` })}
              className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-600 text-xs font-bold transition flex items-center space-x-1.5 min-h-[36px] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sync Intelligence</span>
            </button>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('waterInfrastructure')}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-extrabold transition shadow-md flex items-center space-x-1.5 min-h-[36px] cursor-pointer"
              >
                <Droplets className="w-3.5 h-3.5 text-cyan-200" />
                <span>Water Utilities ERP</span>
              </button>
            )}
            {onOpenAbout && (
              <button
                onClick={onOpenAbout}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md flex items-center space-x-1.5 min-h-[36px] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>About System</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: WORKSPACE CONTEXT SELECTOR                                     */}
      {/* ========================================================================= */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {(isDemo || activeRole === 'ADMIN') ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3">
              <div className="flex items-center space-x-2">
                <LayoutDashboard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Workspace Context
                </span>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'EXECUTIVE', label: 'Executive' },
                  { id: 'MANAGEMENT', label: 'Management' },
                  { id: 'ENGINEERING', label: 'Engineering' },
                  { id: 'PROJECTS', label: 'Projects' },
                  { id: 'OPERATIONS', label: 'Operations' },
                  { id: 'ADMIN', label: 'Admin' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold whitespace-nowrap transition cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {allWorkspaceList
                .filter((ws) => {
                  if (selectedCategory === 'ALL') return true;
                  if (selectedCategory === 'EXECUTIVE') return ['EXECUTIVE', 'MANAGING_DIRECTOR'].includes(ws.id);
                  if (selectedCategory === 'MANAGEMENT') return ['GENERAL_MANAGER', 'PROCUREMENT', 'HR'].includes(ws.id);
                  if (selectedCategory === 'ENGINEERING') return ['PROJECT_ENGINEER', 'QA_QC', 'SAFETY'].includes(ws.id);
                  if (selectedCategory === 'PROJECTS') return ['PROJECT_MANAGER'].includes(ws.id);
                  if (selectedCategory === 'OPERATIONS') return ['SITE_ENGINEER', 'STORE_OPERATIONS', 'FLEET'].includes(ws.id);
                  if (selectedCategory === 'ADMIN') return ['ADMINISTRATION'].includes(ws.id);
                  return true;
                })
                .map((ws) => {
                  const isSelected = selectedWorkspaceId === ws.id;
                  return (
                    <button
                      key={ws.id}
                      onClick={() => {
                        setSelectedWorkspaceId(ws.id);
                        setActionAlert(null);
                      }}
                      className={`flex items-center space-x-2 p-2 rounded-xl text-xs font-bold text-left transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-md ring-2 ring-indigo-500'
                          : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span className="shrink-0 p-1 rounded-lg bg-white/10">{ICON_MAP[ws.icon] || <Building2 className="w-3.5 h-3.5" />}</span>
                      <span className="truncate text-[11px] font-semibold">{ws.label}</span>
                    </button>
                  );
                })}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider font-black text-slate-400">Authorized Workspace</div>
              <div className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">{baseWorkspace.name}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{baseWorkspace.description}</div>
            </div>
            <div className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
              {activeRole || 'Assigned Role'}
            </div>
          </div>
        )}
      </div>

      {/* Action Feedback Banner */}
      {actionAlert && (
        <DSAlert
          variant={actionAlert.type === 'success' ? 'success' : 'info'}
          title={actionAlert.type === 'success' ? 'Action Executed' : 'Workspace Sync'}
          description={actionAlert.msg}
          onClose={() => setActionAlert(null)}
        />
      )}

      {/* ========================================================================= */}
      {/* NAVIGATION SUB-TABS FOR ACTIVE WORKSPACE                                 */}
      {/* ========================================================================= */}
      <DSTabs
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'work', label: `Tasks (${activeWorkspace.tasks.length})` },
          { id: 'approvals', label: `Approvals (${activeWorkspace.approvals.length})` },
          { id: 'data', label: 'Data' },
          { id: 'reports', label: 'Reports' },
        ]}
        activeTab={activeWorkspaceSubTab}
        onChange={(tabId) => setActiveWorkspaceSubTab(tabId as any)}
      />

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & INTELLIGENCE SURFACING (PHASE 31B COMMAND CENTER)        */}
      {/* ========================================================================= */}
      {activeWorkspaceSubTab === 'overview' && (
        <div className="space-y-6">

          {/* ========================================================================= */}
          {/* SECTION 2: TODAY'S OPERATIONS SUMMARY BAR (OPERATIONAL COUNTERS)          */}
          {/* ========================================================================= */}
          <DSCard variant="default" padding="md" className="space-y-3 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white border-slate-800 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm uppercase tracking-wider text-white">
                  Today's Operational Command Summary
                </h3>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400">System Mode:</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {liveMetricsStatus === 'LIVE' ? 'LIVE DATA CONNECTED' : liveMetricsStatus === 'LOADING' ? 'SYNCING WORKSPACE DATA' : 'LIVE DATA UNAVAILABLE'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
              {isDemo ? getRoleSummaryCards(activeWorkspace, liveMetrics, true) : sanitizeProductionSummaryCards(getRoleSummaryCards(activeWorkspace, liveMetrics, false), liveMetrics).map((card, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{card.label}</div>
                  <div className={`text-lg font-black font-mono mt-1 ${card.color}`}>{card.val}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">{card.desc}</div>
                </div>
              ))}
            </div>
          </DSCard>

          {/* ========================================================================= */}
          {/* SECTION 4: EXECUTIVE ANALYTICS & IMPROVED KPI CARDS AREA                  */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 landscape:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {activeWorkspace.kpis.map((kpi, index) => {
              const isPrimary = index === 0;
              return (
                <div
                  key={kpi.id}
                  className={`p-5 rounded-2xl border transition-all duration-200 shadow-sm flex flex-col justify-between space-y-3 ${
                    isPrimary
                      ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white border-indigo-600/60 ring-1 ring-indigo-500/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isPrimary ? 'text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}>
                      {kpi.label}
                    </span>
                    <div className={`p-2 rounded-xl ${isPrimary ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'}`}>
                      {ICON_MAP[kpi.iconName] || <Activity className="w-4 h-4" />}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-3xl font-black tracking-tight tabular-nums font-mono">
                      {kpi.value}
                    </div>
                    {/* Progress Bar visual indicator inside KPI */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${kpi.isPositive ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: isPrimary ? '88%' : `${70 + (index * 8)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <span className={`font-extrabold flex items-center gap-1 ${
                      kpi.isPositive
                        ? (isPrimary ? 'text-emerald-400' : 'text-emerald-600 dark:text-emerald-400')
                        : (isPrimary ? 'text-rose-400' : 'text-rose-600 dark:text-rose-400')
                    }`}>
                      {kpi.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {kpi.change}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      isPrimary ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      {kpi.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 1 & SECTION 6: DEDICATED PROJECT HEALTH & CONSTRUCTION COMMAND   */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Project Health Dedicated Matrix (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              
              <DSCard variant="default" padding="md" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Enterprise Project Health & Status Matrix
                    </h3>
                  </div>
                  <DSBadge variant={isDemo ? 'primary' : 'neutral'} size="xs">
                    {isDemo ? '3 Active Projects Monitored' : `${liveProjects.length} Projects Monitored`}
                  </DSBadge>
                </div>

                {!isDemo && liveProjects.length === 0 ? (
                  <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-center space-y-2">
                    <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">No active projects</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      There are currently no capital infrastructure projects logged in this production instance. Real project health cards and milestone progress will populate here as projects are created.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {liveProjects.length > 0 ? (
                      liveProjects.map((proj: any) => (
                        <div key={proj.id || proj.code} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <DSStatusChip status={proj.status === 'In Progress' ? 'ON_TRACK' : 'COMPLETED'} size="xs" />
                            <span className="text-[10px] font-bold text-slate-500 font-mono">{proj.code || 'PROJ'}</span>
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{proj.name}</h4>
                            <p className="text-[11px] text-slate-500 truncate">{proj.client || 'Infrastructure Client'}</p>
                          </div>
                          <DSProgressBar value={proj.progress || 0} label="Progress" color="indigo" size="xs" />
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                            <span>Budget: ${((proj.budgetUSD || proj.budget || 0) / 1000000).toFixed(2)}M</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{proj.status || 'Active'}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        {/* Health Card 1: WTP Network */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <DSStatusChip status="ON_TRACK" size="xs" />
                            <span className="text-[10px] font-bold text-slate-500 font-mono">PROJ-WTP</span>
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Peruvannamuzhi WTP Pipe Network</h4>
                            <p className="text-[11px] text-slate-500">Phase II Distribution Network (Demo Sample)</p>
                          </div>
                          <DSProgressBar value={68} label="Corridor Progress" color="indigo" size="xs" />
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                            <span>Budget: $8.50M</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">Healthy</span>
                          </div>
                        </div>

                        {/* Health Card 2: Transmission Main */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <DSStatusChip status="COMPLETED" size="xs" />
                            <span className="text-[10px] font-bold text-slate-500 font-mono">PROJ-WTM</span>
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Water Transmission Main Project</h4>
                            <p className="text-[11px] text-slate-500">Intake & Pumping Main (Demo Sample)</p>
                          </div>
                          <DSProgressBar value={84} label="Pipeline Progress" color="cyan" size="xs" />
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                            <span>Budget: $4.20M</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">Optimal</span>
                          </div>
                        </div>

                        {/* Health Card 3: Booster Substation */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <DSStatusChip status="DELAYED" size="xs" />
                            <span className="text-[10px] font-bold text-slate-500 font-mono">PROJ-SUB</span>
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Booster Substation Infrastructure</h4>
                            <p className="text-[11px] text-slate-500">Central Substation Sector (Demo Sample)</p>
                          </div>
                          <DSProgressBar value={32} label="Construction Progress" color="amber" size="xs" />
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                            <span>Budget: $1.80M</span>
                            <span className="font-bold text-amber-600 dark:text-amber-400">Under Review</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </DSCard>

              {/* ========================================================================= */}
              {/* SECTION 5: CHARTS & VISUAL ANALYTICS (PORTFOLIO PROGRESS & BUDGET)       */}
              {/* ========================================================================= */}
              <DSCard variant="default" padding="md" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Portfolio Analytics & Cashflow Execution
                    </h3>
                  </div>
                  <DSBadge variant="info" size="xs">
                    Lightweight SVG Visualizers
                  </DSBadge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                  
                  {/* Progress Comparison Bar Chart */}
                  <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                      Completion Comparison (%)
                    </h4>
                    <div className="space-y-2.5">
                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          <span>Peruvannamuzhi WTP</span>
                          <span>68%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full" style={{ width: '68%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          <span>Water Transmission Main</span>
                          <span>84%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-cyan-600 h-full rounded-full" style={{ width: '84%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          <span>Booster Substation</span>
                          <span>32%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: '32%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Portfolio Budget Execution Visual Bar */}
                  <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                      Budget Execution ($14.5M Total)
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Allocated Budget:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">$14.50 M</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Spent to Date:</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">$6.43 M (44.3%)</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden flex">
                        <div className="bg-emerald-600 h-full" style={{ width: '44.3%' }} />
                        <div className="bg-slate-300 dark:bg-slate-600 h-full" style={{ width: '55.7%' }} />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>Spent: $6.43M</span>
                        <span>Remaining: $8.07M</span>
                      </div>
                    </div>
                  </div>

                </div>
              </DSCard>

            </div>

            {/* Construction Command Center & Fleet Status (1 col) */}
            <div className="space-y-6">
              
              <DSCard variant="default" padding="md" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HardHat className="w-5 h-5 text-amber-500" />
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Construction Command Center
                    </h3>
                  </div>
                  <DSBadge variant="warning" size="xs">
                    Engineering
                  </DSBadge>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Active Construction Sites</div>
                      <div className="text-[11px] text-slate-500">WTP, Water Main, Substation</div>
                    </div>
                    <span className="font-mono font-black text-lg text-indigo-600 dark:text-indigo-400">3 Sites</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Heavy Fleet Asset Status</div>
                      <div className="text-[11px] text-slate-500">12 Operational • 2 Maintenance</div>
                    </div>
                    <span className="font-mono font-black text-lg text-emerald-600 dark:text-emerald-400">88% Avail</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Store SKU Stock Alerts</div>
                      <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">2 SKUs Low Stock</div>
                    </div>
                    <span className="font-mono font-black text-lg text-amber-500">Requisition</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Field Personnel On Site</div>
                      <div className="text-[11px] text-slate-500">Day Shift Technicians</div>
                    </div>
                    <span className="font-mono font-black text-lg text-slate-900 dark:text-white">
                      {liveMetrics?.activeEmployeesCount !== undefined ? `${liveMetrics.activeEmployeesCount} Workers` : (isDemo ? '118 Workers' : '0 Workers')}
                    </span>
                  </div>
                </div>
              </DSCard>

            </div>

          </div>

          {/* ========================================================================= */}
          {/* MAIN GRID: TODAY'S WORK, PENDING APPROVALS, RECENT ACTIVITY TIMELINE       */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Col 1 & 2: Today's Work & Pending Approvals */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Today's Work Checklist */}
              <DSCard variant="default" padding="md" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckSquare className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Today's Work & Operational Queue
                    </h3>
                  </div>
                  <DSBadge variant="primary" size="xs">
                    {completedTaskIds.size} of {activeWorkspace.tasks.length} Completed
                  </DSBadge>
                </div>

                <DSProgressBar
                  value={
                    activeWorkspace.tasks.length > 0
                      ? (completedTaskIds.size / activeWorkspace.tasks.length) * 100
                      : 0
                  }
                  label="Execution Progress"
                  color="indigo"
                  size="sm"
                />

                <div className="space-y-2.5 pt-1">
                  {activeWorkspace.tasks.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
                      <div className="font-bold text-xs text-slate-900 dark:text-white">No Assigned Work Outstanding</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                        All assigned operational tasks for {activeWorkspace.name} are verified and up to date.
                      </p>
                    </div>
                  ) : (
                    activeWorkspace.tasks.map((task) => {
                      const isDone = completedTaskIds.has(task.id);
                      return (
                        <div
                          key={task.id}
                          onClick={() => toggleTaskComplete(task.id, task.title)}
                          className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                            isDone
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-slate-400 line-through'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <button
                              type="button"
                              className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                                isDone
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-indigo-500'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <div>
                              <div className="font-bold text-xs text-slate-900 dark:text-white">
                                {task.title}
                              </div>
                              <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-slate-500">
                                <span>Due: {task.dueDate}</span>
                                <span>•</span>
                                <span>Category: {task.category}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <DSStatusChip
                              status={task.priority === 'CRITICAL' ? 'CRITICAL' : task.priority === 'HIGH' ? 'HIGH' : 'PENDING'}
                              size="xs"
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </DSCard>

              {/* Pending Approvals Queue */}
              <DSCard variant="default" padding="md" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {isDemo ? 'Demo Approval Queue' : 'Pending Approvals & Workflow Queue'}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isDemo && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        Demo Workflow Preview
                      </span>
                    )}
                    <DSBadge variant="warning" size="xs">
                      {activeWorkspace.approvals.length} Pending
                    </DSBadge>
                  </div>
                </div>

                <div className="space-y-3">
                  {activeWorkspace.approvals.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                      <Clock className="w-8 h-8 text-indigo-500 mx-auto opacity-80" />
                      <div className="font-bold text-xs text-slate-900 dark:text-white">No pending approvals</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                        There are no active sign-off workflows or pending approvals requiring action for this role.
                      </p>
                    </div>
                  ) : (
                    activeWorkspace.approvals.map((app) => (
                      <div
                        key={app.id}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-2">
                            <span>{app.title}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-300 font-bold">
                              {app.workflowCode}
                            </span>
                            {isDemo && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                DEMO DATA
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                            <span>Requester: {app.requester}</span>
                            <span>•</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{app.amountOrType}</span>
                            <span>•</span>
                            <span>{app.submittedAt}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <DSButton
                            variant="primary"
                            size="xs"
                            leftIcon={<Check className="w-3.5 h-3.5" />}
                            onClick={() => setActionAlert({ type: 'success', msg: `Approved "${app.title}"!` })}
                          >
                            Approve
                          </DSButton>
                          <DSButton
                            variant="outline"
                            size="xs"
                            leftIcon={<X className="w-3.5 h-3.5" />}
                            onClick={() => setActionAlert({ type: 'info', msg: `Rejected "${app.title}".` })}
                          >
                            Reject
                          </DSButton>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DSCard>
            </div>

            {/* Col 3: Quick Actions, RECENT ACTIVITY TIMELINE & Realtime Alerts */}
            <div className="space-y-6">
              
              {/* Workspace Quick Actions */}
              <DSCard variant="default" padding="md" className="space-y-3">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>Workspace Quick Actions</span>
                </h3>
                <div className="space-y-2">
                  {activeWorkspace.quickActions.map((qa) => (
                    <button
                      key={qa.id}
                      onClick={() => {
                        if (qa.targetTab && onNavigateToTab) {
                          onNavigateToTab(qa.targetTab);
                        } else {
                          setActionAlert({ type: 'success', msg: `Triggered quick action: ${qa.label}` });
                        }
                      }}
                      className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-sm">
                          {ICON_MAP[qa.iconName] || <Plus className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                            {qa.label}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {qa.description}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                    </button>
                  ))}
                </div>
              </DSCard>

              {/* SECTION 3: RECENT ACTIVITY TIMELINE FEED */}
              <DSCard variant="default" padding="md" className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <History className="w-4 h-4 text-emerald-500" />
                    <span>Recent Activity & Audit Timeline</span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400">Live Log</span>
                </div>

                <div className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-800 space-y-3 py-1">
                  {isDemo ? (
                    <>
                      <div className="relative space-y-0.5">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Material Requisition Approved</div>
                        <div className="text-[11px] text-slate-500">Req #REQ-4091 ($14,500) approved by Senior Manager</div>
                        <div className="text-[10px] text-slate-400 font-mono">Demo activity • Stores & PO</div>
                      </div>
                      <div className="relative space-y-0.5">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-900" />
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{liveProjects[0]?.name ? liveProjects[0].name + ' Milestone Complete' : 'Project Milestone Complete'}</div>
                        <div className="text-[11px] text-slate-500">Pier 12 concrete pour signed off by QA Incharge</div>
                        <div className="text-[10px] text-slate-400 font-mono">Demo activity • Engineering</div>
                      </div>
                      <div className="relative space-y-0.5">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-white dark:ring-slate-900" />
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Inventory Fastener Issue Pass</div>
                        <div className="text-[11px] text-slate-500">M24 Bolts issued to Grid A-4 Assembly</div>
                        <div className="text-[10px] text-slate-400 font-mono">Demo activity • Store Keeper</div>
                      </div>
                      <div className="relative space-y-0.5">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900" />
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Day Shift Safety Clearance</div>
                        <div className="text-[11px] text-slate-500">Site Safety Audit passed with 0 incidents</div>
                        <div className="text-[10px] text-slate-400 font-mono">Demo activity • Safety</div>
                      </div>
                    </>
                  ) : (
                    <div className="p-5 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                      Live activity and audit events will appear here once the activity feed is connected.
                    </div>
                  )}
                </div>
              </DSCard>

              {/* Workspace Realtime Alerts */}
              <DSCard variant="default" padding="md" className="space-y-3">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <span>Realtime Workspace Alerts</span>
                </h3>

                <div className="space-y-2">
                  {activeWorkspace.notifications.length === 0 ? (
                    <div className="p-4 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 space-y-1">
                      <CheckSquare className="w-5 h-5 text-emerald-500 mx-auto opacity-80" />
                      <div className="font-semibold text-xs text-slate-700 dark:text-slate-300">No live system alerts available</div>
                      <p className="text-[11px] text-slate-400">An empty feed does not imply that all systems are clear.</p>
                    </div>
                  ) : (
                    activeWorkspace.notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs space-y-1"
                      >
                        <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center justify-between">
                          <span>{notif.title}</span>
                          <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </DSCard>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TODAY'S WORK & ASSIGNED TASKS */}
      {activeWorkspaceSubTab === 'work' && (
        <DSCard variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Detailed Task Breakdown for {activeWorkspace.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Actionable tasks assigned to your role context. Toggle completion status in real-time.
              </p>
            </div>
            <DSButton
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setActionAlert({ type: 'success', msg: 'New task created in workspace queue.' })}
            >
              Add Task
            </DSButton>
          </div>

          <div className="space-y-3 pt-2">
            {activeWorkspace.tasks.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
                <div className="font-bold text-sm text-slate-900 dark:text-white">No live tasks available</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  No transactional task records are currently available for {activeWorkspace.name}.
                </p>
              </div>
            ) : (
              activeWorkspace.tasks.map((task) => {
                const isDone = completedTaskIds.has(task.id);
                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isDone
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 opacity-75'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <DSBadge variant={task.priority === 'CRITICAL' ? 'danger' : task.priority === 'HIGH' ? 'warning' : 'primary'} size="xs">
                          {task.priority}
                        </DSBadge>
                        <span className={`font-bold text-sm ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {task.title}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center space-x-3">
                        <span>Assigned: {task.assignedTo}</span>
                        <span>•</span>
                        <span>Category: {task.category}</span>
                        <span>•</span>
                        <span>Due: {task.dueDate}</span>
                      </div>
                    </div>

                    <DSButton
                      variant={isDone ? 'outline' : 'primary'}
                      size="xs"
                      leftIcon={isDone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Check className="w-3.5 h-3.5" />}
                      onClick={() => toggleTaskComplete(task.id, task.title)}
                    >
                      {isDone ? 'Mark Pending' : 'Mark Completed'}
                    </DSButton>
                  </div>
                );
              })
            )}
          </div>
        </DSCard>
      )}

      {/* TAB 3: PENDING APPROVALS */}
      {activeWorkspaceSubTab === 'approvals' && (
        <DSCard variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {isDemo ? 'Demo Approval Queue' : 'Pending Approvals & Sign-Off Workflows'}
                </h3>
                {isDemo && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    Demo Workflow Preview
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isDemo
                  ? 'Sample simulated approvals for testing role governance workflows.'
                  : 'Active governance approvals requiring your role authorization.'}
              </p>
            </div>
            <DSBadge variant="warning" size="sm">
              {activeWorkspace.approvals.length} Pending
            </DSBadge>
          </div>

          <div className="space-y-3 pt-2">
            {activeWorkspace.approvals.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                <Clock className="w-8 h-8 text-indigo-500 mx-auto opacity-80" />
                <div className="font-bold text-sm text-slate-900 dark:text-white">No pending approvals</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  There are no active sign-off workflows or pending approvals requiring action for this role.
                </p>
              </div>
            ) : (
              activeWorkspace.approvals.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                      <span>{app.title}</span>
                      <span className="text-xs font-mono px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-indigo-600 dark:text-indigo-400 font-bold">
                        {app.workflowCode}
                      </span>
                      {isDemo && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          DEMO DATA
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center space-x-3">
                      <span>Requester: {app.requester}</span>
                      <span>•</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{app.amountOrType}</span>
                      <span>•</span>
                      <span>Submitted: {app.submittedAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <DSButton
                      variant="primary"
                      size="sm"
                      leftIcon={<Check className="w-4 h-4" />}
                      onClick={() => setActionAlert({ type: 'success', msg: `Approved "${app.title}"!` })}
                    >
                      Approve Request
                    </DSButton>
                    <DSButton
                      variant="outline"
                      size="sm"
                      leftIcon={<X className="w-4 h-4" />}
                      onClick={() => setActionAlert({ type: 'info', msg: `Rejected "${app.title}".` })}
                    >
                      Reject
                    </DSButton>
                  </div>
                </div>
              ))
            )}
          </div>
        </DSCard>
      )}

      {/* TAB 4: PRIMARY DATA GRID & ENTITIES */}
      {activeWorkspaceSubTab === 'data' && (
        <DSEnterpriseDataGrid
          title={`${activeWorkspace.name} - Primary Data Entities Grid`}
          data={activeWorkspace.gridData}
          columns={activeWorkspace.gridColumns.map((col) => ({
            key: col.key,
            header: col.header,
            width: col.width,
            sortable: true,
            render: (row) => {
              const val = row[col.key];
              if (col.key === 'status') {
                return <DSStatusChip status={val} size="xs" />;
              }
              return <span className="font-semibold">{val}</span>;
            },
          }))}
          keyExtractor={(row) => row.id}
          exportFilename={`${activeWorkspace.code}_Data_Grid`}
        />
      )}

      {/* TAB 5: PINNED REPORTS & DASHBOARDS */}
      {activeWorkspaceSubTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DSCard variant="default" padding="lg" className="space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>Workspace Pinned Reports</span>
            </h3>

            <div className="space-y-3">
              {activeWorkspace.pinnedReports.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 space-y-1">
                  <FileText className="w-6 h-6 text-slate-400 mx-auto" />
                  <div className="font-bold text-xs text-slate-700 dark:text-slate-300">No Pinned Reports</div>
                  <p className="text-[11px] text-slate-400">No reports pinned for {activeWorkspace.name}.</p>
                </div>
              ) : (
                activeWorkspace.pinnedReports.map((rpt) => (
                  <div
                    key={rpt.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{rpt.title}</span>
                      <DSBadge variant="primary" size="xs">{rpt.type}</DSBadge>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center justify-between">
                      <span>Code: {rpt.code}</span>
                      <span>Last Run: {rpt.lastGenerated}</span>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <DSButton
                        variant="primary"
                        size="xs"
                        leftIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                        onClick={() => setActionAlert({ type: 'info', msg: `Generating PDF for ${rpt.title}...` })}
                      >
                        Export Report
                      </DSButton>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DSCard>

          <DSCard variant="default" padding="lg" className="space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <LayoutDashboard className="w-5 h-5 text-blue-500" />
              <span>Workspace Pinned Dashboards</span>
            </h3>

            <div className="space-y-3">
              {activeWorkspace.pinnedDashboards.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 space-y-1">
                  <LayoutDashboard className="w-6 h-6 text-slate-400 mx-auto" />
                  <div className="font-bold text-xs text-slate-700 dark:text-slate-300">No Pinned Dashboards</div>
                  <p className="text-[11px] text-slate-400">No custom dashboards pinned for {activeWorkspace.name}.</p>
                </div>
              ) : (
                activeWorkspace.pinnedDashboards.map((dash) => (
                  <div
                    key={dash.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{dash.title}</span>
                      <DSBadge variant="info" size="xs">{dash.category}</DSBadge>
                    </div>
                    <div className="text-xs text-slate-400">
                      Includes {dash.widgetsCount} configured analytics widgets.
                    </div>
                    <div className="pt-2 flex justify-end">
                      <DSButton
                        variant="outline"
                        size="xs"
                        leftIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                        onClick={() => setActionAlert({ type: 'info', msg: `Launching dashboard view "${dash.title}"...` })}
                      >
                        Open Dashboard
                      </DSButton>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DSCard>
        </div>
      )}

    </div>
  );
};
 + (Number(liveMetrics.totalPrjBudgetUSD) / 1000000).toFixed(1) + 'M' };
          }
          if (idx === 1 && liveMetrics.avgProgressPercent !== undefined) {
            return { ...kpi, value: Number(liveMetrics.avgProgressPercent) + '%' };
          }
          return kpi;
        }),
      }
    : {
        ...baseWorkspace,
        todaysWorkCount: Number(liveMetrics?.todaysWorkCount ?? 0),
        kpis: sanitizeProductionKpis(baseWorkspace.kpis, liveMetrics),
        tasks: [],
        approvals: [],
        notifications: [],
        gridData: liveProjects.map((p: any) => ({
          id: p.id || p.projectId || p.projectCode,
          name: p.projectName || p.name || p.projectCode || 'Project',
          code: p.projectCode || p.code || '',
          client: p.clientName || p.client || '',
          budget: p.budget ?? p.contractValue ?? null,
          progress: p.progressPercentage ?? p.progress ?? null,
          status: p.status || '',
        })),
      };

  const toggleTaskComplete = (taskId: string, title: string) => {
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
        setActionAlert({ type: 'info', msg: `Task "${title}" marked as pending.` });
      } else {
        next.add(taskId);
        setActionAlert({ type: 'success', msg: `Task "${title}" completed successfully!` });
      }
      return next;
    });
  };

  const allWorkspaceList: { id: WorkspaceId; label: string; icon: string }[] = [
    { id: 'EXECUTIVE', label: 'Executive Workspace', icon: 'Building2' },
    { id: 'MANAGING_DIRECTOR', label: 'Managing Director', icon: 'Award' },
    { id: 'GENERAL_MANAGER', label: 'General Manager', icon: 'Briefcase' },
    { id: 'PROJECT_MANAGER', label: 'Project Manager', icon: 'Building2' },
    { id: 'PROJECT_ENGINEER', label: 'Project Engineer', icon: 'Compass' },
    { id: 'SITE_ENGINEER', label: 'Site Engineer', icon: 'HardHat' },
    { id: 'STORE_OPERATIONS', label: 'Store Operations', icon: 'Boxes' },
    { id: 'PROCUREMENT', label: 'Procurement', icon: 'FileSpreadsheet' },
    { id: 'HR', label: 'HR & Payroll', icon: 'Users' },
    { id: 'FLEET', label: 'Fleet & Machinery', icon: 'Truck' },
    { id: 'QA_QC', label: 'QA / QC', icon: 'ShieldCheck' },
    { id: 'SAFETY', label: 'Safety (HSE)', icon: 'ShieldAlert' },
    { id: 'ADMINISTRATION', label: 'Administration', icon: 'ShieldCheck' },
  ];

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const criticalAlertsCount = (activeWorkspace.notifications || []).filter(
    (n) => n.severity === 'error' || n.severity === 'warning' || n.title.toLowerCase().includes('alert') || n.title.toLowerCase().includes('safety')
  ).length;

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* SECTION 1: EXECUTIVE HERO COMMAND CENTER BANNER (COMPRESSED 45%)          */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-3.5 sm:p-4 shadow-xl border border-slate-700/80">
        {/* Subtle grid pattern background overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                SiteSync Infrastructure & Engineering Ltd.
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300 font-medium flex items-center gap-1 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                {todayFormatted}
              </span>
              <span className="text-slate-400">•</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Operational Mode
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2 pt-0.5">
              <span>Welcome, {user?.name || 'Executive'}</span>
            </h1>
            <p className="text-xs text-slate-300">
              Active Context: <strong className="text-indigo-300 font-semibold">{activeWorkspace.name}</strong> ({activeWorkspace.code}) — {activeWorkspace.title}
            </p>
          </div>

          {/* Header Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setActionAlert({ type: 'info', msg: `${activeWorkspace.name} intelligence synced with ERP backend.` })}
              className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-600 text-xs font-bold transition flex items-center space-x-1.5 min-h-[36px] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sync Intelligence</span>
            </button>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('waterInfrastructure')}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-extrabold transition shadow-md flex items-center space-x-1.5 min-h-[36px] cursor-pointer"
              >
                <Droplets className="w-3.5 h-3.5 text-cyan-200" />
                <span>Water Utilities ERP</span>
              </button>
            )}
            {onOpenAbout && (
              <button
                onClick={onOpenAbout}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md flex items-center space-x-1.5 min-h-[36px] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>About System</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: SEGMENTED WORKSPACE ROLE SELECTOR                             */}
      {/* ========================================================================= */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Role Workspaces (13 Role Modules)
            </span>
          </div>

          {/* Category Segment Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {[
              { id: 'ALL', label: 'All Roles (13)' },
              { id: 'EXECUTIVE', label: 'Executive' },
              { id: 'MANAGEMENT', label: 'Management' },
              { id: 'ENGINEERING', label: 'Engineering' },
              { id: 'PROJECTS', label: 'Projects' },
              { id: 'OPERATIONS', label: 'Operations' },
              { id: 'ADMIN', label: 'Admin' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Role Workspace Grid Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 pt-0.5">
          {allWorkspaceList
            .filter((ws) => {
              if (selectedCategory === 'ALL') return true;
              if (selectedCategory === 'EXECUTIVE') return ['EXECUTIVE', 'MANAGING_DIRECTOR'].includes(ws.id);
              if (selectedCategory === 'MANAGEMENT') return ['GENERAL_MANAGER', 'PROCUREMENT', 'HR'].includes(ws.id);
              if (selectedCategory === 'ENGINEERING') return ['PROJECT_ENGINEER', 'QA_QC', 'SAFETY'].includes(ws.id);
              if (selectedCategory === 'PROJECTS') return ['PROJECT_MANAGER'].includes(ws.id);
              if (selectedCategory === 'OPERATIONS') return ['SITE_ENGINEER', 'STORE_OPERATIONS', 'FLEET'].includes(ws.id);
              if (selectedCategory === 'ADMIN') return ['ADMINISTRATION'].includes(ws.id);
              return true;
            })
            .map((ws) => {
              const isSelected = selectedWorkspaceId === ws.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => {
                    setSelectedWorkspaceId(ws.id);
                    setActionAlert(null);
                  }}
                  className={`flex items-center space-x-2 p-2 rounded-xl text-xs font-bold text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-md ring-2 ring-indigo-500'
                      : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="shrink-0 p-1 rounded-lg bg-white/10">{ICON_MAP[ws.icon] || <Building2 className="w-3.5 h-3.5" />}</span>
                  <span className="truncate text-[11px] font-semibold">{ws.label}</span>
                </button>
              );
            })}
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionAlert && (
        <DSAlert
          variant={actionAlert.type === 'success' ? 'success' : 'info'}
          title={actionAlert.type === 'success' ? 'Action Executed' : 'Workspace Sync'}
          description={actionAlert.msg}
          onClose={() => setActionAlert(null)}
        />
      )}

      {/* ========================================================================= */}
      {/* NAVIGATION SUB-TABS FOR ACTIVE WORKSPACE                                 */}
      {/* ========================================================================= */}
      <DSTabs
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'work', label: `Tasks (${activeWorkspace.tasks.length})` },
          { id: 'approvals', label: `Approvals (${activeWorkspace.approvals.length})` },
          { id: 'data', label: 'Data' },
          { id: 'reports', label: 'Reports' },
        ]}
        activeTab={activeWorkspaceSubTab}
        onChange={(tabId) => setActiveWorkspaceSubTab(tabId as any)}
      />

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & INTELLIGENCE SURFACING (PHASE 31B COMMAND CENTER)        */}
      {/* ========================================================================= */}
      {activeWorkspaceSubTab === 'overview' && (
        <div className="space-y-6">

          {/* ========================================================================= */}
          {/* SECTION 2: TODAY'S OPERATIONS SUMMARY BAR (OPERATIONAL COUNTERS)          */}
          {/* ========================================================================= */}
          <DSCard variant="default" padding="md" className="space-y-3 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white border-slate-800 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm uppercase tracking-wider text-white">
                  Today's Operational Command Summary
                </h3>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400">System Mode:</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  REAL-TIME SYNC ACTIVE
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
              {getRoleSummaryCards(activeWorkspace, liveMetrics, isDemo).map((card, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{card.label}</div>
                  <div className={`text-lg font-black font-mono mt-1 ${card.color}`}>{card.val}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">{card.desc}</div>
                </div>
              ))}
            </div>
          </DSCard>

          {/* ========================================================================= */}
          {/* SECTION 4: EXECUTIVE ANALYTICS & IMPROVED KPI CARDS AREA                  */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 landscape:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {activeWorkspace.kpis.map((kpi, index) => {
              const isPrimary = index === 0;
              return (
                <div
                  key={kpi.id}
                  className={`p-5 rounded-2xl border transition-all duration-200 shadow-sm flex flex-col justify-between space-y-3 ${
                    isPrimary
                      ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white border-indigo-600/60 ring-1 ring-indigo-500/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isPrimary ? 'text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}>
                      {kpi.label}
                    </span>
                    <div className={`p-2 rounded-xl ${isPrimary ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'}`}>
                      {ICON_MAP[kpi.iconName] || <Activity className="w-4 h-4" />}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-3xl font-black tracking-tight tabular-nums font-mono">
                      {kpi.value}
                    </div>
                    {/* Progress Bar visual indicator inside KPI */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${kpi.isPositive ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: isPrimary ? '88%' : `${70 + (index * 8)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <span className={`font-extrabold flex items-center gap-1 ${
                      kpi.isPositive
                        ? (isPrimary ? 'text-emerald-400' : 'text-emerald-600 dark:text-emerald-400')
                        : (isPrimary ? 'text-rose-400' : 'text-rose-600 dark:text-rose-400')
                    }`}>
                      {kpi.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {kpi.change}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      isPrimary ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      {kpi.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 1 & SECTION 6: DEDICATED PROJECT HEALTH & CONSTRUCTION COMMAND   */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Project Health Dedicated Matrix (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              
              <DSCard variant="default" padding="md" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Enterprise Project Health & Status Matrix
                    </h3>
                  </div>
                  <DSBadge variant={isDemo ? 'primary' : 'neutral'} size="xs">
                    {isDemo ? '3 Active Projects Monitored' : `${liveProjects.length} Projects Monitored`}
                  </DSBadge>
                </div>

                {!isDemo && liveProjects.length === 0 ? (
                  <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-center space-y-2">
                    <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">No active projects</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      There are currently no capital infrastructure projects logged in this production instance. Real project health cards and milestone progress will populate here as projects are created.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {liveProjects.length > 0 ? (
                      liveProjects.map((proj: any) => (
                        <div key={proj.id || proj.code} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <DSStatusChip status={proj.status === 'In Progress' ? 'ON_TRACK' : 'COMPLETED'} size="xs" />
                            <span className="text-[10px] font-bold text-slate-500 font-mono">{proj.code || 'PROJ'}</span>
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{proj.name}</h4>
                            <p className="text-[11px] text-slate-500 truncate">{proj.client || 'Infrastructure Client'}</p>
                          </div>
                          <DSProgressBar value={proj.progress || 0} label="Progress" color="indigo" size="xs" />
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                            <span>Budget: ${((proj.budgetUSD || proj.budget || 0) / 1000000).toFixed(2)}M</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{proj.status || 'Active'}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        {/* Health Card 1: WTP Network */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <DSStatusChip status="ON_TRACK" size="xs" />
                            <span className="text-[10px] font-bold text-slate-500 font-mono">PROJ-WTP</span>
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Peruvannamuzhi WTP Pipe Network</h4>
                            <p className="text-[11px] text-slate-500">Phase II Distribution Network (Demo Sample)</p>
                          </div>
                          <DSProgressBar value={68} label="Corridor Progress" color="indigo" size="xs" />
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                            <span>Budget: $8.50M</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">Healthy</span>
                          </div>
                        </div>

                        {/* Health Card 2: Transmission Main */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <DSStatusChip status="COMPLETED" size="xs" />
                            <span className="text-[10px] font-bold text-slate-500 font-mono">PROJ-WTM</span>
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Water Transmission Main Project</h4>
                            <p className="text-[11px] text-slate-500">Intake & Pumping Main (Demo Sample)</p>
                          </div>
                          <DSProgressBar value={84} label="Pipeline Progress" color="cyan" size="xs" />
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                            <span>Budget: $4.20M</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">Optimal</span>
                          </div>
                        </div>

                        {/* Health Card 3: Booster Substation */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <DSStatusChip status="DELAYED" size="xs" />
                            <span className="text-[10px] font-bold text-slate-500 font-mono">PROJ-SUB</span>
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Booster Substation Infrastructure</h4>
                            <p className="text-[11px] text-slate-500">Central Substation Sector (Demo Sample)</p>
                          </div>
                          <DSProgressBar value={32} label="Construction Progress" color="amber" size="xs" />
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                            <span>Budget: $1.80M</span>
                            <span className="font-bold text-amber-600 dark:text-amber-400">Under Review</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </DSCard>

              {/* ========================================================================= */}
              {/* SECTION 5: CHARTS & VISUAL ANALYTICS (PORTFOLIO PROGRESS & BUDGET)       */}
              {/* ========================================================================= */}
              <DSCard variant="default" padding="md" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Portfolio Analytics & Cashflow Execution
                    </h3>
                  </div>
                  <DSBadge variant="info" size="xs">
                    Lightweight SVG Visualizers
                  </DSBadge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                  
                  {/* Progress Comparison Bar Chart */}
                  <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                      Completion Comparison (%)
                    </h4>
                    <div className="space-y-2.5">
                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          <span>Peruvannamuzhi WTP</span>
                          <span>68%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full" style={{ width: '68%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          <span>Water Transmission Main</span>
                          <span>84%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-cyan-600 h-full rounded-full" style={{ width: '84%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          <span>Booster Substation</span>
                          <span>32%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: '32%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Portfolio Budget Execution Visual Bar */}
                  <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                      Budget Execution ($14.5M Total)
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Allocated Budget:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">$14.50 M</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Spent to Date:</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">$6.43 M (44.3%)</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden flex">
                        <div className="bg-emerald-600 h-full" style={{ width: '44.3%' }} />
                        <div className="bg-slate-300 dark:bg-slate-600 h-full" style={{ width: '55.7%' }} />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>Spent: $6.43M</span>
                        <span>Remaining: $8.07M</span>
                      </div>
                    </div>
                  </div>

                </div>
              </DSCard>

            </div>

            {/* Construction Command Center & Fleet Status (1 col) */}
            <div className="space-y-6">
              
              <DSCard variant="default" padding="md" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HardHat className="w-5 h-5 text-amber-500" />
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Construction Command Center
                    </h3>
                  </div>
                  <DSBadge variant="warning" size="xs">
                    Engineering
                  </DSBadge>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Active Construction Sites</div>
                      <div className="text-[11px] text-slate-500">WTP, Water Main, Substation</div>
                    </div>
                    <span className="font-mono font-black text-lg text-indigo-600 dark:text-indigo-400">3 Sites</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Heavy Fleet Asset Status</div>
                      <div className="text-[11px] text-slate-500">12 Operational • 2 Maintenance</div>
                    </div>
                    <span className="font-mono font-black text-lg text-emerald-600 dark:text-emerald-400">88% Avail</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Store SKU Stock Alerts</div>
                      <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">2 SKUs Low Stock</div>
                    </div>
                    <span className="font-mono font-black text-lg text-amber-500">Requisition</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Field Personnel On Site</div>
                      <div className="text-[11px] text-slate-500">Day Shift Technicians</div>
                    </div>
                    <span className="font-mono font-black text-lg text-slate-900 dark:text-white">
                      {liveMetrics?.activeEmployeesCount !== undefined ? `${liveMetrics.activeEmployeesCount} Workers` : (isDemo ? '118 Workers' : '0 Workers')}
                    </span>
                  </div>
                </div>
              </DSCard>

            </div>

          </div>

          {/* ========================================================================= */}
          {/* MAIN GRID: TODAY'S WORK, PENDING APPROVALS, RECENT ACTIVITY TIMELINE       */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Col 1 & 2: Today's Work & Pending Approvals */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Today's Work Checklist */}
              <DSCard variant="default" padding="md" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckSquare className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Today's Work & Operational Queue
                    </h3>
                  </div>
                  <DSBadge variant="primary" size="xs">
                    {completedTaskIds.size} of {activeWorkspace.tasks.length} Completed
                  </DSBadge>
                </div>

                <DSProgressBar
                  value={
                    activeWorkspace.tasks.length > 0
                      ? (completedTaskIds.size / activeWorkspace.tasks.length) * 100
                      : 0
                  }
                  label="Execution Progress"
                  color="indigo"
                  size="sm"
                />

                <div className="space-y-2.5 pt-1">
                  {activeWorkspace.tasks.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
                      <div className="font-bold text-xs text-slate-900 dark:text-white">No Assigned Work Outstanding</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                        All assigned operational tasks for {activeWorkspace.name} are verified and up to date.
                      </p>
                    </div>
                  ) : (
                    activeWorkspace.tasks.map((task) => {
                      const isDone = completedTaskIds.has(task.id);
                      return (
                        <div
                          key={task.id}
                          onClick={() => toggleTaskComplete(task.id, task.title)}
                          className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                            isDone
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-slate-400 line-through'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <button
                              type="button"
                              className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                                isDone
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-indigo-500'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <div>
                              <div className="font-bold text-xs text-slate-900 dark:text-white">
                                {task.title}
                              </div>
                              <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-slate-500">
                                <span>Due: {task.dueDate}</span>
                                <span>•</span>
                                <span>Category: {task.category}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <DSStatusChip
                              status={task.priority === 'CRITICAL' ? 'CRITICAL' : task.priority === 'HIGH' ? 'HIGH' : 'PENDING'}
                              size="xs"
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </DSCard>

              {/* Pending Approvals Queue */}
              <DSCard variant="default" padding="md" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {isDemo ? 'Demo Approval Queue' : 'Pending Approvals & Workflow Queue'}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isDemo && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        Demo Workflow Preview
                      </span>
                    )}
                    <DSBadge variant="warning" size="xs">
                      {activeWorkspace.approvals.length} Pending
                    </DSBadge>
                  </div>
                </div>

                <div className="space-y-3">
                  {activeWorkspace.approvals.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                      <Clock className="w-8 h-8 text-indigo-500 mx-auto opacity-80" />
                      <div className="font-bold text-xs text-slate-900 dark:text-white">No pending approvals</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                        There are no active sign-off workflows or pending approvals requiring action for this role.
                      </p>
                    </div>
                  ) : (
                    activeWorkspace.approvals.map((app) => (
                      <div
                        key={app.id}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-2">
                            <span>{app.title}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-300 font-bold">
                              {app.workflowCode}
                            </span>
                            {isDemo && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                DEMO DATA
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                            <span>Requester: {app.requester}</span>
                            <span>•</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{app.amountOrType}</span>
                            <span>•</span>
                            <span>{app.submittedAt}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <DSButton
                            variant="primary"
                            size="xs"
                            leftIcon={<Check className="w-3.5 h-3.5" />}
                            onClick={() => setActionAlert({ type: 'success', msg: `Approved "${app.title}"!` })}
                          >
                            Approve
                          </DSButton>
                          <DSButton
                            variant="outline"
                            size="xs"
                            leftIcon={<X className="w-3.5 h-3.5" />}
                            onClick={() => setActionAlert({ type: 'info', msg: `Rejected "${app.title}".` })}
                          >
                            Reject
                          </DSButton>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DSCard>
            </div>

            {/* Col 3: Quick Actions, RECENT ACTIVITY TIMELINE & Realtime Alerts */}
            <div className="space-y-6">
              
              {/* Workspace Quick Actions */}
              <DSCard variant="default" padding="md" className="space-y-3">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>Workspace Quick Actions</span>
                </h3>
                <div className="space-y-2">
                  {activeWorkspace.quickActions.map((qa) => (
                    <button
                      key={qa.id}
                      onClick={() => {
                        if (qa.targetTab && onNavigateToTab) {
                          onNavigateToTab(qa.targetTab);
                        } else {
                          setActionAlert({ type: 'success', msg: `Triggered quick action: ${qa.label}` });
                        }
                      }}
                      className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-sm">
                          {ICON_MAP[qa.iconName] || <Plus className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                            {qa.label}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {qa.description}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                    </button>
                  ))}
                </div>
              </DSCard>

              {/* SECTION 3: RECENT ACTIVITY TIMELINE FEED */}
              <DSCard variant="default" padding="md" className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <History className="w-4 h-4 text-emerald-500" />
                    <span>Recent Activity & Audit Timeline</span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400">Live Log</span>
                </div>

                <div className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-800 space-y-3 py-1">
                  
                  {/* Activity Item 1 */}
                  <div className="relative space-y-0.5">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Material Requisition Approved
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Req #REQ-4091 ($14,500) approved by Senior Manager
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">10 mins ago • Stores & PO</div>
                  </div>

                  {/* Activity Item 2 */}
                  <div className="relative space-y-0.5">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-900" />
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {liveProjects[0]?.name ? `${liveProjects[0].name} Milestone Complete` : (isDemo ? 'Peruvannamuzhi WTP Milestone Complete' : 'Project Structural Milestone Complete')}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Pier 12 concrete pour signed off by QA Incharge
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">42 mins ago • Engineering</div>
                  </div>

                  {/* Activity Item 3 */}
                  <div className="relative space-y-0.5">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-white dark:ring-slate-900" />
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Inventory Fastener Issue Pass
                    </div>
                    <div className="text-[11px] text-slate-500">
                      M24 Bolts issued to Grid A-4 Assembly
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">1 hour ago • Store Keeper</div>
                  </div>

                  {/* Activity Item 4 */}
                  <div className="relative space-y-0.5">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900" />
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Day Shift Safety Clearance
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Site Safety Audit passed with 0 incidents
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">2 hours ago • Safety HSE</div>
                  </div>

                </div>
              </DSCard>

              {/* Workspace Realtime Alerts */}
              <DSCard variant="default" padding="md" className="space-y-3">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <span>Realtime Workspace Alerts</span>
                </h3>

                <div className="space-y-2">
                  {activeWorkspace.notifications.length === 0 ? (
                    <div className="p-4 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 space-y-1">
                      <CheckSquare className="w-5 h-5 text-emerald-500 mx-auto opacity-80" />
                      <div className="font-semibold text-xs text-slate-700 dark:text-slate-300">No Active System Alerts</div>
                      <p className="text-[11px] text-slate-400">All system events are operating within normal parameters.</p>
                    </div>
                  ) : (
                    activeWorkspace.notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs space-y-1"
                      >
                        <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center justify-between">
                          <span>{notif.title}</span>
                          <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </DSCard>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TODAY'S WORK & ASSIGNED TASKS */}
      {activeWorkspaceSubTab === 'work' && (
        <DSCard variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Detailed Task Breakdown for {activeWorkspace.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Actionable tasks assigned to your role context. Toggle completion status in real-time.
              </p>
            </div>
            <DSButton
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setActionAlert({ type: 'success', msg: 'New task created in workspace queue.' })}
            >
              Add Task
            </DSButton>
          </div>

          <div className="space-y-3 pt-2">
            {activeWorkspace.tasks.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
                <div className="font-bold text-sm text-slate-900 dark:text-white">No Assigned Tasks Outstanding</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  All assigned operational tasks for {activeWorkspace.name} are up to date and verified.
                </p>
              </div>
            ) : (
              activeWorkspace.tasks.map((task) => {
                const isDone = completedTaskIds.has(task.id);
                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isDone
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 opacity-75'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <DSBadge variant={task.priority === 'CRITICAL' ? 'danger' : task.priority === 'HIGH' ? 'warning' : 'primary'} size="xs">
                          {task.priority}
                        </DSBadge>
                        <span className={`font-bold text-sm ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {task.title}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center space-x-3">
                        <span>Assigned: {task.assignedTo}</span>
                        <span>•</span>
                        <span>Category: {task.category}</span>
                        <span>•</span>
                        <span>Due: {task.dueDate}</span>
                      </div>
                    </div>

                    <DSButton
                      variant={isDone ? 'outline' : 'primary'}
                      size="xs"
                      leftIcon={isDone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Check className="w-3.5 h-3.5" />}
                      onClick={() => toggleTaskComplete(task.id, task.title)}
                    >
                      {isDone ? 'Mark Pending' : 'Mark Completed'}
                    </DSButton>
                  </div>
                );
              })
            )}
          </div>
        </DSCard>
      )}

      {/* TAB 3: PENDING APPROVALS */}
      {activeWorkspaceSubTab === 'approvals' && (
        <DSCard variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {isDemo ? 'Demo Approval Queue' : 'Pending Approvals & Sign-Off Workflows'}
                </h3>
                {isDemo && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    Demo Workflow Preview
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isDemo
                  ? 'Sample simulated approvals for testing role governance workflows.'
                  : 'Active governance approvals requiring your role authorization.'}
              </p>
            </div>
            <DSBadge variant="warning" size="sm">
              {activeWorkspace.approvals.length} Pending
            </DSBadge>
          </div>

          <div className="space-y-3 pt-2">
            {activeWorkspace.approvals.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                <Clock className="w-8 h-8 text-indigo-500 mx-auto opacity-80" />
                <div className="font-bold text-sm text-slate-900 dark:text-white">No pending approvals</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  There are no active sign-off workflows or pending approvals requiring action for this role.
                </p>
              </div>
            ) : (
              activeWorkspace.approvals.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                      <span>{app.title}</span>
                      <span className="text-xs font-mono px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-indigo-600 dark:text-indigo-400 font-bold">
                        {app.workflowCode}
                      </span>
                      {isDemo && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          DEMO DATA
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center space-x-3">
                      <span>Requester: {app.requester}</span>
                      <span>•</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{app.amountOrType}</span>
                      <span>•</span>
                      <span>Submitted: {app.submittedAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <DSButton
                      variant="primary"
                      size="sm"
                      leftIcon={<Check className="w-4 h-4" />}
                      onClick={() => setActionAlert({ type: 'success', msg: `Approved "${app.title}"!` })}
                    >
                      Approve Request
                    </DSButton>
                    <DSButton
                      variant="outline"
                      size="sm"
                      leftIcon={<X className="w-4 h-4" />}
                      onClick={() => setActionAlert({ type: 'info', msg: `Rejected "${app.title}".` })}
                    >
                      Reject
                    </DSButton>
                  </div>
                </div>
              ))
            )}
          </div>
        </DSCard>
      )}

      {/* TAB 4: PRIMARY DATA GRID & ENTITIES */}
      {activeWorkspaceSubTab === 'data' && (
        <DSEnterpriseDataGrid
          title={`${activeWorkspace.name} - Primary Data Entities Grid`}
          data={activeWorkspace.gridData}
          columns={activeWorkspace.gridColumns.map((col) => ({
            key: col.key,
            header: col.header,
            width: col.width,
            sortable: true,
            render: (row) => {
              const val = row[col.key];
              if (col.key === 'status') {
                return <DSStatusChip status={val} size="xs" />;
              }
              return <span className="font-semibold">{val}</span>;
            },
          }))}
          keyExtractor={(row) => row.id}
          exportFilename={`${activeWorkspace.code}_Data_Grid`}
        />
      )}

      {/* TAB 5: PINNED REPORTS & DASHBOARDS */}
      {activeWorkspaceSubTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DSCard variant="default" padding="lg" className="space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>Workspace Pinned Reports</span>
            </h3>

            <div className="space-y-3">
              {activeWorkspace.pinnedReports.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 space-y-1">
                  <FileText className="w-6 h-6 text-slate-400 mx-auto" />
                  <div className="font-bold text-xs text-slate-700 dark:text-slate-300">No Pinned Reports</div>
                  <p className="text-[11px] text-slate-400">No reports pinned for {activeWorkspace.name}.</p>
                </div>
              ) : (
                activeWorkspace.pinnedReports.map((rpt) => (
                  <div
                    key={rpt.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{rpt.title}</span>
                      <DSBadge variant="primary" size="xs">{rpt.type}</DSBadge>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center justify-between">
                      <span>Code: {rpt.code}</span>
                      <span>Last Run: {rpt.lastGenerated}</span>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <DSButton
                        variant="primary"
                        size="xs"
                        leftIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                        onClick={() => setActionAlert({ type: 'info', msg: `Generating PDF for ${rpt.title}...` })}
                      >
                        Export Report
                      </DSButton>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DSCard>

          <DSCard variant="default" padding="lg" className="space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <LayoutDashboard className="w-5 h-5 text-blue-500" />
              <span>Workspace Pinned Dashboards</span>
            </h3>

            <div className="space-y-3">
              {activeWorkspace.pinnedDashboards.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 space-y-1">
                  <LayoutDashboard className="w-6 h-6 text-slate-400 mx-auto" />
                  <div className="font-bold text-xs text-slate-700 dark:text-slate-300">No Pinned Dashboards</div>
                  <p className="text-[11px] text-slate-400">No custom dashboards pinned for {activeWorkspace.name}.</p>
                </div>
              ) : (
                activeWorkspace.pinnedDashboards.map((dash) => (
                  <div
                    key={dash.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{dash.title}</span>
                      <DSBadge variant="info" size="xs">{dash.category}</DSBadge>
                    </div>
                    <div className="text-xs text-slate-400">
                      Includes {dash.widgetsCount} configured analytics widgets.
                    </div>
                    <div className="pt-2 flex justify-end">
                      <DSButton
                        variant="outline"
                        size="xs"
                        leftIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                        onClick={() => setActionAlert({ type: 'info', msg: `Launching dashboard view "${dash.title}"...` })}
                      >
                        Open Dashboard
                      </DSButton>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DSCard>
        </div>
      )}

    </div>
  );
};
