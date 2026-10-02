import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useShell, CompanyOption, BranchOption } from '../layout/ShellContext';
import { useDeviceProfile } from '../../hooks/useDeviceProfile';
import { UserRole } from '../../types';
import { safeJson } from '../../lib/safeFetch';
import { EnterpriseRoleWorkspace } from './EnterpriseRoleWorkspace';
import { MyActionsCenter } from './MyActionsCenter';
import { RoleWorkspaceViews } from './RoleWorkspaceViews';
import { 
  ROLE_CONFIG,
  CREATOR_INFO,
  DEMO_PROJECTS
} from '../../data/mockData';
import { 
  Building2, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Truck, 
  Boxes, 
  FileText, 
  TrendingUp, 
  Wrench, 
  Plus, 
  ChevronRight, 
  ArrowUpRight, 
  HardHat, 
  Database,
  Calendar,
  Fuel,
  Play,
  Droplets,
  FolderGit2,
  MapPin,
  ChevronDown,
  X,
  Receipt,
  Camera,
  UploadCloud,
  Sparkles,
  Check
} from 'lucide-react';

interface RoleDashboardProps {
  onNavigateToTab: (tab: any) => void;
  onOpenAbout: () => void;
}

export const RoleDashboard: React.FC<RoleDashboardProps> = ({ onNavigateToTab, onOpenAbout }) => {
  const { user, activeRole } = useAuth();
  const { 
    currentCompany, 
    setCurrentCompany, 
    currentBranch, 
    setCurrentBranch, 
    selectedProjectId, 
    setSelectedProjectId 
  } = useShell();

  const [punchedIn, setPunchedIn] = useState(true);
  const [siteLogSubmitted, setSiteLogSubmitted] = useState(false);
  const [logNotes, setLogNotes] = useState('');
  const [viewMode, setViewMode] = useState<'workspace' | 'legacy'>('workspace');
  const [projects, setProjects] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const { isDemo } = useShell();

  // Quick Expense Modal state - defaults blank in UAT/Production, with sample prefill in Demo
  const [isQuickExpenseModalOpen, setIsQuickExpenseModalOpen] = useState(false);
  const [quickExpenseLoading, setQuickExpenseLoading] = useState(false);
  const [quickExpenseSuccess, setQuickExpenseSuccess] = useState(false);
  const [quickExpenseForm, setQuickExpenseForm] = useState(() => ({
    amount: isDemo ? '200' : '',
    category: 'MATERIAL_PURCHASE',
    vendorShop: isDemo ? 'Al Madina Hardware & Industrial Tools' : '',
    description: isDemo ? 'Purchased nylon safety rope (15mm, 30m) for site trench barricade and hoisting assistance.' : '',
    billInvoiceNumber: isDemo ? 'INV-ALM-8921' : '',
    receiptUrl: isDemo ? 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=60' : '',
    expenseDate: new Date().toISOString().split('T')[0],
  }));

  // Synchronize expense form fields when environment switches
  useEffect(() => {
    if (!isDemo) {
      setQuickExpenseForm({
        amount: '',
        category: 'MATERIAL_PURCHASE',
        vendorShop: '',
        description: '',
        billInvoiceNumber: '',
        receiptUrl: '',
        expenseDate: new Date().toISOString().split('T')[0],
      });
    } else {
      setQuickExpenseForm({
        amount: '200',
        category: 'MATERIAL_PURCHASE',
        vendorShop: 'Al Madina Hardware & Industrial Tools',
        description: 'Purchased nylon safety rope (15mm, 30m) for site trench barricade and hoisting assistance.',
        billInvoiceNumber: 'INV-ALM-8921',
        receiptUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=60',
        expenseDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [isDemo]);

  const loadDemoExpenseSample = () => {
    setQuickExpenseForm({
      amount: '200',
      category: 'MATERIAL_PURCHASE',
      vendorShop: 'Al Madina Hardware & Industrial Tools',
      description: 'Purchased nylon safety rope (15mm, 30m) for site trench barricade and hoisting assistance.',
      billInvoiceNumber: 'INV-ALM-8921',
      receiptUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=60',
      expenseDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleQuickExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickExpenseLoading(true);
    try {
      const payload = {
        employeeName: user?.name || 'Field Engineer',
        employeeId: user?.id || 'emp-101',
        employeeCode: user?.employeeId || 'EMP-049',
        department: user?.department || 'SITE_OPERATIONS',
        projectId: selectedProjectId === 'ALL' ? 'PRJ-101' : selectedProjectId,
        projectName: projectOptions.find(p => p.id === selectedProjectId)?.label || 'Dubai Creek Harbor Desalination WTP',
        costCenterCode: 'CC-CIVIL-01',
        category: quickExpenseForm.category,
        amount: Number(quickExpenseForm.amount),
        currency: 'INR',
        expenseDate: quickExpenseForm.expenseDate,
        vendorShop: quickExpenseForm.vendorShop,
        description: quickExpenseForm.description,
        billInvoiceNumber: quickExpenseForm.billInvoiceNumber,
        receiptUrl: quickExpenseForm.receiptUrl,
        attachments: [
          {
            id: `att-${Date.now()}`,
            name: `receipt_${quickExpenseForm.billInvoiceNumber || 'rope'}.jpg`,
            size: 256000,
            type: 'image/jpeg',
            url: quickExpenseForm.receiptUrl,
            uploadDate: new Date().toISOString(),
          }
        ],
      };

      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await safeJson(res);
      if (data?.success) {
        setQuickExpenseSuccess(true);
        setTimeout(() => {
          setQuickExpenseSuccess(false);
          setIsQuickExpenseModalOpen(false);
        }, 1800);
      }
    } catch (err) {
      console.error('Failed to submit quick expense:', err);
    } finally {
      setQuickExpenseLoading(false);
    }
  };

  const device = useDeviceProfile();

  const companyLabels: Record<CompanyOption, string> = {
    APEX_GLOBAL: 'SiteSync Global Corporate HQ',
    APEX_ME: 'Middle East Infrastructure Division',
    APEX_INDIA: 'South Asia Construction Division',
  };

  const branchLabels: Record<BranchOption, string> = {
    KOCHI_HQ: 'Central Engineering & Project Office',
    TRIVANDRUM_REG: 'Regional Operations Hub',
    CALICUT_SITE: 'Metropolitan Logistics Yard',
    DUBAI_OFFSHORE: 'International Infrastructure Office',
  };

  const projectOptions = [
    { id: 'ALL', label: isDemo ? 'All Active Sites (3)' : 'All Active Sites' },
    { id: 'proj-001', label: 'Metro Rail Viaduct Segment 4B' },
    { id: 'proj-002', label: 'Water Treatment & Transmission Main' },
    { id: 'proj-003', label: 'Commercial Complex & Energy Substation' },
  ];

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => safeJson(res))
      .then((data) => {
        if (data?.success && Array.isArray(data.data)) {
          setProjects(data.data);
        } else if (Array.isArray(data)) {
          setProjects(data);
        } else if (data?.projects && Array.isArray(data.projects)) {
          setProjects(data.projects);
        } else if (isDemo) {
          setProjects(DEMO_PROJECTS);
        } else {
          setProjects([]);
        }
      })
      .catch(() => {
        if (isDemo) setProjects(DEMO_PROJECTS);
        else setProjects([]);
      });

    fetch('/api/inventory')
      .then((res) => safeJson(res))
      .then((data) => {
        if (data?.success && data.data) {
          setInventory(data.data);
        }
      })
      .catch(() => {});
  }, [isDemo]);

  if (!user) return null;

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      
      {/* Enterprise Company, Branch & Project Context Selector Bar */}
      {device.isLandscapePhone ? (
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              {companyLabels[currentCompany]} • {branchLabels[currentBranch]} • {projectOptions.find((p) => p.id === selectedProjectId)?.label || 'All Projects'}
            </span>
          </div>
          <button
            onClick={() => setIsContextModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 flex items-center space-x-1 min-h-[36px]"
          >
            <span>Change</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Enterprise Context:
              </span>
            </div>
            {device.isPortraitPhone && (
              <button
                onClick={() => setIsContextModalOpen(true)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 underline"
              >
                Quick Switch
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full">
            {/* Company Selector */}
            <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 w-full">
              <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
              <select
                value={currentCompany}
                onChange={(e) => setCurrentCompany(e.target.value as CompanyOption)}
                className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 border-none focus:outline-none cursor-pointer truncate"
              >
                {(['APEX_GLOBAL', 'APEX_ME', 'APEX_INDIA'] as CompanyOption[]).map((co) => (
                  <option key={co} value={co} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    {companyLabels[co]}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Selector */}
            <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 w-full">
              <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
              <select
                value={currentBranch}
                onChange={(e) => setCurrentBranch(e.target.value as BranchOption)}
                className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 border-none focus:outline-none cursor-pointer truncate"
              >
                {(['KOCHI_HQ', 'TRIVANDRUM_REG', 'CALICUT_SITE', 'DUBAI_OFFSHORE'] as BranchOption[]).map((br) => (
                  <option key={br} value={br} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    {branchLabels[br]}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Context Selector */}
            <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 w-full sm:col-span-2 lg:col-span-1">
              <FolderGit2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 border-none focus:outline-none cursor-pointer truncate"
              >
                {projectOptions.map((p) => (
                  <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Context Selector Modal */}
      {isContextModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsContextModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 w-full max-w-md shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-indigo-500" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Change Enterprise Context
                </h3>
              </div>
              <button
                onClick={() => setIsContextModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Company</label>
                <select
                  value={currentCompany}
                  onChange={(e) => setCurrentCompany(e.target.value as CompanyOption)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  {(['APEX_GLOBAL', 'APEX_ME', 'APEX_INDIA'] as CompanyOption[]).map((co) => (
                    <option key={co} value={co}>
                      {companyLabels[co]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Branch</label>
                <select
                  value={currentBranch}
                  onChange={(e) => setCurrentBranch(e.target.value as BranchOption)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  {(['KOCHI_HQ', 'TRIVANDRUM_REG', 'CALICUT_SITE', 'DUBAI_OFFSHORE'] as BranchOption[]).map((br) => (
                    <option key={br} value={br}>
                      {branchLabels[br]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Project Site</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  {projectOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setIsContextModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
            >
              Apply Context
            </button>
          </div>
        </div>
      )}

      {/* View Mode Toggle Command Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 px-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-extrabold text-indigo-300 uppercase tracking-wider shrink-0">Enterprise View Mode:</span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 uppercase tracking-wider shrink-0">
            {viewMode === 'workspace' ? '13 Role-Centric Workspaces Active' : 'Legacy Module View Active'}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setViewMode('workspace')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
              viewMode === 'workspace'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Role Workspaces
          </button>
          <button
            onClick={() => setViewMode('legacy')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
              viewMode === 'legacy'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Legacy View
          </button>
        </div>
      </div>

      {/* Unified My Actions Center (Action Required, My Requests, Recent Activity) */}
      <MyActionsCenter
        onNavigateTab={onNavigateToTab}
        onOpenQuickExpense={() => setIsQuickExpenseModalOpen(true)}
      />

      {/* Role-Centric Landing Workspace (Employee, Supervisor, PM, Store, Procurement, Finance, HR, Admin) */}
      <RoleWorkspaceViews
        activeRole={activeRole || 'WORKER'}
        onNavigateTab={onNavigateToTab}
        onOpenQuickExpense={() => setIsQuickExpenseModalOpen(true)}
      />

      {viewMode === 'workspace' ? (
        <EnterpriseRoleWorkspace
          onNavigateToTab={onNavigateToTab}
          onOpenAbout={onOpenAbout}
        />
      ) : (
        <>
          {/* Top Executive Context Banner (Legacy Mode) */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 shadow-xl border border-slate-800">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${activeRole && ROLE_CONFIG[activeRole] ? ROLE_CONFIG[activeRole].badgeColor : 'bg-slate-800 text-slate-200 border-slate-700'}`}>
                    {(activeRole && ROLE_CONFIG[activeRole]?.label) || activeRole || 'Authorized User'}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-300 font-semibold">{user?.department || 'Operations'}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    {todayDateString}
                  </span>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Welcome back, {user?.name || 'Authorized Engineer'}
                </h1>
                <p className="text-xs text-slate-300">
                  Assigned Project: <strong className="text-indigo-300 font-semibold">{user?.assignedProjectName || 'All Regional Projects'}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onNavigateToTab('waterInfrastructure')}
                  className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-extrabold transition shadow-md flex items-center space-x-1.5 min-h-[42px] cursor-pointer"
                >
                  <Droplets className="w-4 h-4 text-cyan-200" />
                  <span>Water Utilities ERP</span>
                </button>
                <button
                  onClick={() => onNavigateToTab('schema')}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center space-x-1.5 min-h-[42px] cursor-pointer"
                >
                  <Database className="w-4 h-4 text-blue-400" />
                  <span>ERP Schema</span>
                </button>
                <button
                  onClick={onOpenAbout}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center space-x-1.5 min-h-[42px] cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span>About System</span>
                </button>
              </div>
            </div>
          </div>

      {/* ----------------- ROLE 1: ADMIN DASHBOARD ----------------- */}
      {activeRole === 'ADMIN' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>Active Projects</span>
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums">{projects.length}</div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> 2 Projects In Progress
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>Security Roles</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums">8 Roles</div>
              <p className="text-[11px] text-slate-500">Admin, Manager, Engineer, etc.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>ERP Data Schema</span>
                <Database className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums">5 Models</div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">PostgreSQL & Prisma Sync</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>System Developer</span>
                <ShieldCheck className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white truncate">Abdul Vajid EK</div>
              <p className="text-[11px] text-slate-500 truncate">Enterprise Solution Architect</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Status & Admin Controls */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" /> Admin System Command & Control
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                You possess global administrative privileges for SiteSync Pro. Manage project infrastructure, inspect raw Prisma ERP database schemas, and monitor user role assignments.
              </p>
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => onNavigateToTab('schema')}
                  className="w-full text-left p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <Database className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        Inspect PostgreSQL & Prisma ERP Schema
                      </div>
                      <div className="text-[11px] text-slate-500">
                        View table definitions DDL, foreign keys, and relations
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                </button>

                <button
                  onClick={() => onNavigateToTab('projects')}
                  className="w-full text-left p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-indigo-500" />
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        Project & Site Operations Control
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Track progress on enterprise project sites and construction infrastructure
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                </button>
              </div>
            </div>

            {/* Quick Active Projects Summary */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center justify-between">
                <span>Active Construction Sites</span>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-extrabold cursor-pointer hover:underline" onClick={() => onNavigateToTab('projects')}>View All</span>
              </h2>
              {projects.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center space-y-2">
                  <Building2 className="w-7 h-7 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No active projects</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    There are no projects logged in this environment. Create a new project in the Projects view to begin tracking site progress.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map((p) => (
                    <div key={p.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-900 dark:text-white truncate">{p.name}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 shrink-0">
                          {p.progress || 0}% Complete
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${p.progress || 0}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{p.location || 'Site Location'}</span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                          Budget: ${(((p.budgetUSD || p.budget || 0) / 1000000)).toFixed(1)}M
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- ROLE 2: MANAGER DASHBOARD ----------------- */}
      {activeRole === 'MANAGER' && (
        <div className="space-y-6">
          {(() => {
            const totalBudget = projects.reduce((s, p) => s + (p.budgetUSD || p.budget || 0), 0);
            const totalSpent = projects.reduce((s, p) => s + (p.spentUSD || p.spent || 0), 0);
            const totalWorkers = projects.reduce((s, p) => s + (p.activeWorkersCount || 0), 0);
            const execPercent = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : '0.0';

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Portfolio Budget</span>
                  <div className="text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
                    ${(totalBudget / 1000000).toFixed(2)} M
                  </div>
                  <p className="text-[11px] text-slate-500">{projects.length} Active Capital Contracts</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Spent to Date</span>
                  <div className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono tabular-nums">
                    ${(totalSpent / 1000000).toFixed(2)} M
                  </div>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">{execPercent}% Budget Execution</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Field Personnel</span>
                  <div className="text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
                    {totalWorkers} Workers
                  </div>
                  <p className="text-[11px] text-slate-500">Across {projects.length} Operating Sectors</p>
                </div>
              </div>
            );
          })()}

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="font-extrabold text-slate-900 dark:text-white text-base">Project Milestone Status & Cashflow</h2>
            {projects.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center space-y-2">
                <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">No active projects</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  There are currently no capital infrastructure projects in this instance. Budget baselines, cashflow burn, and milestone progress will show here once registered.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{proj.name}</h3>
                        <p className="text-xs text-slate-500">Client: {proj.client} • Category: {proj.category}</p>
                      </div>
                      <span className="self-start sm:self-center px-2.5 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        {proj.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-700/60">
                      <div>
                        <span className="text-slate-400 text-[10px] font-semibold uppercase">Progress</span>
                        <div className="font-mono font-extrabold text-slate-900 dark:text-white">{proj.progress}%</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] font-semibold uppercase">Budget</span>
                        <div className="font-mono font-extrabold text-slate-900 dark:text-white">${((proj.budgetUSD || proj.budget || 0) / 1000000).toFixed(2)}M</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] font-semibold uppercase">Target Date</span>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{proj.targetCompletionDate || 'Active Phase'}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] font-semibold uppercase">Incharge</span>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{proj.inchargeName || 'Project Lead'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- ROLE 3: INCHARGE DASHBOARD ----------------- */}
      {activeRole === 'INCHARGE' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" /> Engineering Site Approvals & Quality Control
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Site Incharge Technical Queue for <strong className="text-slate-900 dark:text-white">{projects[0]?.name || user?.assignedProjectName || 'Active Infrastructure Scheme'}</strong>.
            </p>

            {!isDemo ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <div className="font-bold text-xs text-slate-700 dark:text-slate-300">Technical Approval Queue Clear</div>
                <p className="text-[11px] text-slate-500">No QA inspections or site work sign-offs currently pending for your project.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-200 uppercase">
                      QA Inspection Required
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Hydrostatic Pressure Testing on Cooling Loop 2</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Piping & Fabrication • Target 150 PSI for 4 Hours</p>
                  </div>
                  <button className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition min-h-[42px] cursor-pointer">
                    Sign Off Inspection
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 uppercase">
                      Structural Torque Audit
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">M24 High Tensile Bolt Inspection - Pier 3 Flange</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Checked 64 Bolts @ 450 Nm torque spec</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Passed Engineering
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- ROLE 4: SUPERVISOR DASHBOARD ----------------- */}
      {activeRole === 'SUPERVISOR' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Daily Site Log Entry Box */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" /> Submit Daily Field Progress Log
              </h2>
              {siteLogSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium space-y-1">
                  <p className="font-extrabold flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Daily Site Log Submitted & Synced!
                  </p>
                  <p>Recorded 42 workers, 0 safety incidents, progress saved to PWA local storage.</p>
                  <button onClick={() => setSiteLogSubmitted(false)} className="underline font-extrabold mt-2 text-emerald-700 dark:text-emerald-400 cursor-pointer">
                    Submit Another Log Entry
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSiteLogSubmitted(true);
                  }}
                  className="space-y-3 text-xs"
                >
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Today's Site Progress Highlights
                    </label>
                    <textarea
                      rows={3}
                      value={logNotes}
                      onChange={(e) => setLogNotes(e.target.value)}
                      placeholder="e.g., Completed Girder alignment #A4-A7, torqued 40 bolts, clear weather..."
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Workers On Site</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">42 Technicians</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Safety Incidents</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">0 Incidents</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs transition shadow-md min-h-[42px] cursor-pointer"
                  >
                    Submit Daily Site Log
                  </button>
                </form>
              )}
            </div>

            {/* Field Shift Crew Allocation */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center justify-between">
                <span>Field Crew Allocations</span>
                <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-bold">
                  Day Shift
                </span>
              </h2>
              {!isDemo ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                  <p className="font-bold text-xs text-slate-700 dark:text-slate-300">No Shift Crews Allocated</p>
                  <p className="text-[11px] text-slate-500">Field trade crews and sub-gangs will show here when dispatched for the active shift.</p>
                </div>
              ) : (
                <div className="space-y-2.5 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Piping & Fabrication Team</div>
                      <div className="text-[11px] text-slate-500">14 Fitters • Lead: Kiran Kumar</div>
                    </div>
                    <span className="text-emerald-600 font-bold">Active</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Crane & Heavy Lift Rigging</div>
                      <div className="text-[11px] text-slate-500">6 Operators & Riggers • Lead: Alexei Ivanov</div>
                    </div>
                    <span className="text-emerald-600 font-bold">Active</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ----------------- ROLE 5: STORE KEEPER DASHBOARD ----------------- */}
      {activeRole === 'STORE_KEEPER' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Store SKUs</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums">{inventory.length} SKUs</div>
              <p className="text-[11px] text-slate-500">{inventory.length > 0 ? 'Active tracked inventory items' : 'No catalog items'}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Low Stock Alerts</span>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                {inventory.filter((i) => (Number(i.quantityInStock) || 0) <= (Number(i.minThreshold) || 0)).length} Items
              </div>
              <p className="text-[11px] text-amber-600 font-bold">
                {inventory.filter((i) => (Number(i.quantityInStock) || 0) <= (Number(i.minThreshold) || 0)).length > 0 ? 'Requisition Recommended' : 'Inventory Optimal'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Issue Passes</span>
              <div className="text-3xl font-black text-teal-600 dark:text-teal-400 font-mono tabular-nums">{isDemo ? '3 Passes' : '0 Passes'}</div>
              <p className="text-[11px] text-slate-500">{isDemo ? 'Grid A-4 Assembly' : 'No pending passes'}</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-teal-600" /> Mechanical Store Inventory Control
              </span>
              <button onClick={() => onNavigateToTab('inventory')} className="text-xs text-teal-600 font-bold hover:underline cursor-pointer">
                Full Store View
              </button>
            </h2>

            {inventory.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                <Boxes className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="font-bold text-xs text-slate-700 dark:text-slate-300">No inventory records</div>
                <p className="text-[11px] text-slate-500">Materials, spare parts, and site consumables will appear here once registered.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inventory.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</span>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                          {item.itemCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Location: {item.storeLocation} • Category: {item.category}</p>
                    </div>
                    <div className="flex items-center space-x-3 self-end sm:self-center">
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                          {item.quantityInStock} {item.unit}
                        </div>
                        <div className="text-[10px] text-slate-400">Min: {item.minThreshold}</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        item.status === 'In Stock' 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300' 
                          : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- ROLE 6: DRIVER DASHBOARD ----------------- */}
      {activeRole === 'DRIVER' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Truck className="w-5 h-5 text-cyan-600" /> Logistics Driver Dispatch Queue & Safety Check
            </h2>
            {!isDemo ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                <Truck className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="font-bold text-xs text-slate-700 dark:text-slate-300">No Logistics Trips Dispatched</div>
                <p className="text-[11px] text-slate-500">Fleet hauling runs and material transport dispatches will appear here when scheduled.</p>
              </div>
            ) : (
              <div className="p-4.5 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">Trip #LOG-991: Transport 60T Steel Beam</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-200 text-cyan-900 dark:bg-cyan-900 dark:text-cyan-200">
                    Assigned Today
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  <strong>Route:</strong> Central Fabrication Yard → {projects[0]?.name ? `${projects[0].name} Site 1` : 'Active Project Site 1'}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <button className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs shadow-md transition min-h-[42px] cursor-pointer">
                    Start Trip Navigation
                  </button>
                  <button className="px-3.5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
                    Pre-Trip Safety Inspection (Passed)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- ROLE 7: OPERATOR DASHBOARD ----------------- */}
      {activeRole === 'OPERATOR' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-600" /> Plant Equipment Operator Control
              </span>
              <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
                {isDemo ? '100T Mobile Crane' : 'Asset Control'}
              </span>
            </h2>

            {!isDemo ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                <Wrench className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="font-bold text-xs text-slate-700 dark:text-slate-300">No Plant Machinery Assigned</div>
                <p className="text-[11px] text-slate-500">No mobile cranes, excavators, or plant equipment currently assigned to your shift.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <span className="text-xs text-slate-400 font-bold uppercase">Hour Meter</span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">1,420 Hours</div>
                    <span className="text-[10px] text-slate-500">Next Service in 80 hrs</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <span className="text-xs text-slate-400 font-bold uppercase">Fuel Level</span>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">82% Full</div>
                    <span className="text-[10px] text-slate-500">Liebherr LTM 1100</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <span className="text-xs text-slate-400 font-bold uppercase">Rigging Safety Check</span>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">Verified</div>
                    <span className="text-[10px] text-slate-500">Outriggers Locked</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active Crane Hoist Assignment</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    WO-MECH-8821: Lift & position Girder #A4 on Pier 3 flange. (75% completed)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ----------------- ROLE 8: WORKER DASHBOARD ----------------- */}
      {activeRole === 'WORKER' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Digital Timecard Punch */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" /> Digital Timecard & Attendance
                </span>
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Shift Active
                </span>
              </h2>

              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-center">
                <div className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                  07:30 AM
                </div>
                <p className="text-xs text-slate-500">
                  Punched in at {projects[0]?.name ? `${projects[0].name} Gate 2` : 'Site Security Gate'}
                </p>
                <button
                  onClick={() => setPunchedIn(!punchedIn)}
                  className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs transition min-h-[44px] cursor-pointer ${
                    punchedIn 
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                  }`}
                >
                  {punchedIn ? 'Punch Out for Shift' : 'Punch In to Shift'}
                </button>
              </div>
            </div>

            {/* My Assigned Tasks */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <HardHat className="w-5 h-5 text-amber-600" /> My Assigned Site Work Orders
              </h2>
              {!isDemo ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                  <HardHat className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="font-bold text-xs text-slate-700 dark:text-slate-300">No Work Orders Assigned</div>
                  <p className="text-[11px] text-slate-500">Your site supervisor has not dispatched any active work orders to you today.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">Install AHU 04 Dampers & Filters</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        In Progress
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">WTP Pump House Unit #2 • Due Aug 05</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
        </>
      )}

      {/* ========================================================================= */}
      {/* QUICK EXPENSE MODAL (TASK-FIRST, ZERO ACCOUNTING JARGON)                   */}
      {/* ========================================================================= */}
      {isQuickExpenseModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => !quickExpenseLoading && setIsQuickExpenseModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    {isDemo ? 'Try Expense Demo' : 'Claim an Expense'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isDemo
                      ? 'Simulate one-click ₹200 out-of-pocket project site purchase reimbursement'
                      : 'Fast reimbursement for out-of-pocket project site purchases'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsQuickExpenseModalOpen(false)}
                disabled={quickExpenseLoading}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              
              {quickExpenseSuccess ? (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Expense Claim Submitted!
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Your claim for ₹{quickExpenseForm.amount} was saved and routed to your supervisor for review. You can track its live progress in My Actions Center.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleQuickExpenseSubmit} className="space-y-4">
                  
                  {/* 1-Click Demo Test Preset Banner (Demo/Sandbox Only) */}
                  {isDemo && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-xs text-amber-900 dark:text-amber-300">
                          Demo Sandbox Test Preset:
                        </div>
                        <div className="text-[11px] text-amber-700 dark:text-amber-400">
                          Sample ₹200 site safety supplies receipt
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={loadDemoExpenseSample}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 transition shadow-sm cursor-pointer"
                      >
                        Load Demo Sample
                      </button>
                    </div>
                  )}

                  {/* Amount & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Amount Spent (₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          required
                          value={quickExpenseForm.amount}
                          onChange={(e) => setQuickExpenseForm({ ...quickExpenseForm, amount: e.target.value })}
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Category *
                      </label>
                      <select
                        value={quickExpenseForm.category}
                        onChange={(e) => setQuickExpenseForm({ ...quickExpenseForm, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="MATERIAL_PURCHASE">Site Consumables & Materials</option>
                        <option value="SITE_SAFETY">Safety Gear & PPE</option>
                        <option value="LOCAL_TRAVEL">Local Travel & Conveyance</option>
                        <option value="MEALS_REFRESHMENT">Crew Meals & Refreshment</option>
                        <option value="TOOLS_HARDWARE">Hardware Tools & Fasteners</option>
                      </select>
                    </div>
                  </div>

                  {/* Vendor Shop & Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Vendor / Shop Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={quickExpenseForm.vendorShop}
                        onChange={(e) => setQuickExpenseForm({ ...quickExpenseForm, vendorShop: e.target.value })}
                        placeholder="e.g. Al Madina Hardware"
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Date Purchased *
                      </label>
                      <input
                        type="date"
                        required
                        value={quickExpenseForm.expenseDate}
                        onChange={(e) => setQuickExpenseForm({ ...quickExpenseForm, expenseDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      What was purchased & why? *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={quickExpenseForm.description}
                      onChange={(e) => setQuickExpenseForm({ ...quickExpenseForm, description: e.target.value })}
                      placeholder="e.g. Rope purchased for site trench barricade"
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  {/* Bill Attachment Preview */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Attach Bill / Cash Memo (Camera / File)
                    </label>
                    <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-between gap-3">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        {quickExpenseForm.receiptUrl ? (
                          <img
                            src={quickExpenseForm.receiptUrl}
                            alt="Receipt"
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <Camera className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0 truncate">
                          <div className="font-bold text-xs truncate">
                            {quickExpenseForm.billInvoiceNumber || 'Bill Receipt'}
                          </div>
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            Photo Attached · Ready to Submit
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setQuickExpenseForm({
                            ...quickExpenseForm,
                            receiptUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=60',
                            billInvoiceNumber: 'INV-ALM-8921',
                          });
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold shrink-0"
                      >
                        Capture Camera
                      </button>
                    </div>
                  </div>

                  {/* Plain-English Next Step Helper */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 space-y-1">
                    <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>What happens after submitting?</span>
                    </div>
                    <p>
                      Your supervisor approves the claim, Finance verifies the receipt and classifies the accounting code, and reimbursement is disbursed to your bank or cash.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsQuickExpenseModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={quickExpenseLoading}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {quickExpenseLoading ? (
                        <span>Submitting...</span>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Submit Expense (₹{quickExpenseForm.amount})</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
