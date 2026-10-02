import React, { useState } from 'react';
import { useShell } from '../layout/ShellContext';
import {
  Users,
  CheckCircle2,
  Clock,
  DollarSign,
  Receipt,
  FileText,
  Boxes,
  Truck,
  HardHat,
  Building2,
  ShieldCheck,
  Calendar,
  Wallet,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Award,
  Plus,
  RefreshCw,
  FolderGit2,
  Layers,
  Sparkles,
  GitPullRequest,
  Check,
  AlertTriangle,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { UserRole } from '../../types';

interface RoleWorkspaceViewsProps {
  activeRole: UserRole | string;
  onNavigateTab: (tab: string) => void;
  onOpenQuickExpense?: () => void;
}

export const RoleWorkspaceViews: React.FC<RoleWorkspaceViewsProps> = ({
  activeRole,
  onNavigateTab,
  onOpenQuickExpense,
}) => {
  const { isDemo } = useShell();
  const [punchState, setPunchState] = useState<'CLOCKED_IN' | 'CLOCKED_OUT' | 'UNKNOWN'>(isDemo ? 'CLOCKED_IN' : 'UNKNOWN');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. EMPLOYEE WORKSPACE
  const renderEmployeeWorkspace = () => (
    <div className="space-y-4">
      {/* Attendance & Self-Service Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300">
            Employee Self-Service Desk
          </span>
          <h3 className="text-xl font-black text-white">
            Daily Attendance & Field Tasks
          </h3>
          <p className="text-xs text-slate-300">
            {isDemo ? (
              <>Current Shift: <strong className="text-emerald-400">Demo Shift (07:00 - 15:30)</strong> · Demo geofence</>
            ) : (
              <>Live attendance status and shift details are loaded from the configured attendance source.</>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => {
              if (!isDemo) {
                showToast('Manual demo punching is disabled. Use the configured attendance source for live punches.');
                return;
              }
              const next = punchState === 'CLOCKED_IN' ? 'CLOCKED_OUT' : 'CLOCKED_IN';
              setPunchState(next);
              showToast(next === 'CLOCKED_IN' ? 'Demo clock-in recorded.' : 'Demo clock-out recorded.');
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center space-x-2 shadow-md ${
              punchState === 'CLOCKED_IN'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>
              {punchState === 'UNKNOWN'
                ? 'Attendance status unavailable'
                : punchState === 'CLOCKED_IN'
                ? 'Clocked In (Demo)'
                : 'Punch Clock In (Demo)'}
            </span>
          </button>
        </div>
      </div>

      {/* Employee 7 Core Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* 1. My Attendance */}
        <button
          onClick={() => onNavigateTab('hr')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 w-fit">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
              My Attendance
            </h4>
            <p className="text-[10px] text-slate-500">22 Days Present · 0 Overdue</p>
          </div>
        </button>

        {/* 2. Submit Expense */}
        <button
          onClick={() => {
            if (onOpenQuickExpense) onOpenQuickExpense();
            else onNavigateTab('expenses');
          }}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 w-fit">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
              {isDemo ? 'Try Expense Demo' : 'Claim an Expense'}
            </h4>
            <p className="text-[10px] text-slate-500">
              {isDemo ? '₹200 Quick Rope Preset' : 'Out-of-pocket project reimbursement'}
            </p>
          </div>
        </button>

        {/* 3. Request Advance */}
        <button
          onClick={() => onNavigateTab('expenses')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 w-fit">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
              Request Cash Advance
            </h4>
            <p className="text-[10px] text-slate-500">Site travel & urgent supplies</p>
          </div>
        </button>

        {/* 4. My Requests */}
        <button
          onClick={() => onNavigateTab('expenses')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 w-fit">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
              My Requests Tracker
            </h4>
            <p className="text-[10px] text-slate-500">4 Submitted · 2 Approved</p>
          </div>
        </button>

        {/* 5. My Payslips */}
        <button
          onClick={() => onNavigateTab('hr')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 w-fit">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
              My Payslips
            </h4>
            <p className="text-[10px] text-slate-500">Latest: August 2026</p>
          </div>
        </button>

        {/* 6. My Documents */}
        <button
          onClick={() => onNavigateTab('documents')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <div className="p-2.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 w-fit">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
              My Documents & ID
            </h4>
            <p className="text-[10px] text-slate-500">Contract, Passport, Safety Badge</p>
          </div>
        </button>

        {/* 7. Notifications */}
        <button
          onClick={() => onNavigateTab('admin')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-2 sm:col-span-2 lg:col-span-2"
        >
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 w-fit">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
              Site Safety Notices & Circulars
            </h4>
            <p className="text-[10px] text-slate-500">
              {isDemo ? 'Mandatory PPE inspection scheduled for 10:00 AM' : 'Live safety notices will appear here'}
            </p>
          </div>
        </button>
      </div>
    </div>
  );

  // 2. SUPERVISOR WORKSPACE
  const renderSupervisorWorkspace = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          onClick={() => onNavigateTab('workflow')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 w-fit">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
              {isDemo ? 'Demo Approval Queue' : 'Pending Approvals'}
            </h4>
            <p className="text-[10px] text-slate-500">
              {isDemo ? '3 Demo Sign-offs' : 'Live workflow queue'}
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('hr')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 w-fit">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
              Team Attendance
            </h4>
            <p className="text-[10px] text-slate-500">Active Shift Attendance</p>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('expenses')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 w-fit">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
              Expense Claims
            </h4>
            <p className="text-[10px] text-slate-500">2 Awaiting Review</p>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('workorders')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 w-fit">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
              Site Updates (DPR)
            </h4>
            <p className="text-[10px] text-slate-500">Daily Duty Log Active</p>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('workorders')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 w-fit">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
              Assigned Tasks
            </h4>
            <p className="text-[10px] text-slate-500">5 Duty Work Orders</p>
          </div>
        </button>
      </div>
    </div>
  );

  // 3. PROJECT MANAGER WORKSPACE
  const renderPMWorkspace = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <button
          onClick={() => onNavigateTab('projects')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-1.5"
        >
          <Building2 className="w-5 h-5 text-indigo-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Project Overview</h4>
          <p className="text-[10px] text-slate-500">3 Sites Active</p>
        </button>

        <button
          onClick={() => onNavigateTab('workflow')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-1.5"
        >
          <Clock className="w-5 h-5 text-amber-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
            {isDemo ? 'Demo Approval Queue' : 'Pending Approvals'}
          </h4>
          <p className="text-[10px] text-slate-500">
            {isDemo ? 'Demo PRs & Orders' : 'PRs & Work Orders'}
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('projectcontrols')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-1.5"
        >
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Project Progress</h4>
          <p className="text-[10px] text-slate-500">68% S-Curve Status</p>
        </button>

        <button
          onClick={() => onNavigateTab('projectcontrols')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-1.5"
        >
          <DollarSign className="w-5 h-5 text-indigo-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Budget vs Actual</h4>
          <p className="text-[10px] text-slate-500">$5.78M vs $14.5M</p>
        </button>

        <button
          onClick={() => onNavigateTab('projectcontrols')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-1.5"
        >
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Cost Control (EVM)</h4>
          <p className="text-[10px] text-slate-500">CPI 1.02 · SPI 1.04</p>
        </button>

        <button
          onClick={() => onNavigateTab('workorders')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-1.5"
        >
          <HardHat className="w-5 h-5 text-teal-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Site Updates</h4>
          <p className="text-[10px] text-slate-500">Shift Execution</p>
        </button>

        <button
          onClick={() => onNavigateTab('commercial')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-1.5"
        >
          <Award className="w-5 h-5 text-purple-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Commercial</h4>
          <p className="text-[10px] text-slate-500">RA Bills & Tenders</p>
        </button>
      </div>
    </div>
  );

  // 4. STORE WORKSPACE
  const renderStoreWorkspace = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => onNavigateTab('inventory')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <Boxes className="w-5 h-5 text-amber-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Material Requests</h4>
          <p className="text-[10px] text-slate-500">3 Pending Slips</p>
        </button>

        <button
          onClick={() => onNavigateTab('inventory')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <Truck className="w-5 h-5 text-emerald-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Receive Materials (GRN)</h4>
          <p className="text-[10px] text-slate-500">Delivery Challans</p>
        </button>

        <button
          onClick={() => onNavigateTab('inventory')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <CheckCircle2 className="w-5 h-5 text-indigo-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Issue Material (MIV)</h4>
          <p className="text-[10px] text-slate-500">Site Work Packages</p>
        </button>

        <button
          onClick={() => onNavigateTab('inventory')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <Layers className="w-5 h-5 text-cyan-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Stock Inventory</h4>
          <p className="text-[10px] text-slate-500">Bin Card Ledger</p>
        </button>

        <button
          onClick={() => onNavigateTab('inventory')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Low Stock Alerts</h4>
          <p className="text-[10px] text-slate-500">2 SKUs Action Needed</p>
        </button>

        <button
          onClick={() => onNavigateTab('inventory')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <RefreshCw className="w-5 h-5 text-purple-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Inter-Site Transfers</h4>
          <p className="text-[10px] text-slate-500">Gate Passes</p>
        </button>
      </div>
    </div>
  );

  // 5. PROCUREMENT WORKSPACE
  const renderProcurementWorkspace = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => onNavigateTab('procurement')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <FileText className="w-5 h-5 text-indigo-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Purchase Requests (PR)</h4>
          <p className="text-[10px] text-slate-500">Site Requisitions</p>
        </button>

        <button
          onClick={() => onNavigateTab('procurement')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <GitPullRequest className="w-5 h-5 text-cyan-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Issue RFQ</h4>
          <p className="text-[10px] text-slate-500">3 RFQs Open</p>
        </button>

        <button
          onClick={() => onNavigateTab('procurement')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <Receipt className="w-5 h-5 text-amber-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Vendor Quotations</h4>
          <p className="text-[10px] text-slate-500">Bidding Submissions</p>
        </button>

        <button
          onClick={() => onNavigateTab('procurement')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <BarChart3 className="w-5 h-5 text-emerald-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Comparisons</h4>
          <p className="text-[10px] text-slate-500">Commercial Evaluation</p>
        </button>

        <button
          onClick={() => onNavigateTab('procurement')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <CheckCircle2 className="w-5 h-5 text-indigo-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Purchase Orders (PO)</h4>
          <p className="text-[10px] text-slate-500">Issued to Vendors</p>
        </button>

        <button
          onClick={() => onNavigateTab('workflow')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <Clock className="w-5 h-5 text-rose-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
            {isDemo ? 'Demo Approval Queue' : 'Pending Approvals'}
          </h4>
          <p className="text-[10px] text-slate-500">
            {isDemo ? 'Demo Sign-off Queue' : 'Sign-off Queue'}
          </p>
        </button>
      </div>
    </div>
  );

  // 6. FINANCE WORKSPACE
  const renderFinanceWorkspace = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <button
          onClick={() => onNavigateTab('expenses')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-1.5"
        >
          <CheckCircle2 className="w-5 h-5 text-indigo-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Pending Verification</h4>
          <p className="text-[10px] text-slate-500">2 Claims Waiting</p>
        </button>

        <button
          onClick={() => onNavigateTab('expenses')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 text-left transition shadow-sm group cursor-pointer space-y-1.5"
        >
          <Receipt className="w-5 h-5 text-emerald-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Employee Expenses</h4>
          <p className="text-[10px] text-slate-500">Claims & Audit</p>
        </button>

        <button
          onClick={() => onNavigateTab('expenses')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 text-left transition shadow-sm group cursor-pointer space-y-1.5"
        >
          <Wallet className="w-5 h-5 text-amber-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Advances & Float</h4>
          <p className="text-[10px] text-slate-500">Petty Cash Ledger</p>
        </button>

        <button
          onClick={() => onNavigateTab('finance')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 text-left transition shadow-sm group cursor-pointer space-y-1.5"
        >
          <FileText className="w-5 h-5 text-blue-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Accounts Payable (AP)</h4>
          <p className="text-[10px] text-slate-500">Vendor Invoices</p>
        </button>

        <button
          onClick={() => onNavigateTab('finance')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 text-left transition shadow-sm group cursor-pointer space-y-1.5"
        >
          <DollarSign className="w-5 h-5 text-cyan-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Accounts Receivable</h4>
          <p className="text-[10px] text-slate-500">Client IPC Bills</p>
        </button>

        <button
          onClick={() => onNavigateTab('finance')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 text-left transition shadow-sm group cursor-pointer space-y-1.5"
        >
          <BarChart3 className="w-5 h-5 text-purple-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">General Ledger & TB</h4>
          <p className="text-[10px] text-slate-500">Trial Balance Balanced</p>
        </button>
      </div>
    </div>
  );

  // 7. HR WORKSPACE
  const renderHRWorkspace = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => onNavigateTab('hr')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <Users className="w-5 h-5 text-indigo-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Employees Directory</h4>
          <p className="text-[10px] text-slate-500">10 Direct Records</p>
        </button>

        <button
          onClick={() => onNavigateTab('hr')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <Calendar className="w-5 h-5 text-emerald-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Biometric Attendance</h4>
          <p className="text-[10px] text-slate-500">Shift Clock In/Out</p>
        </button>

        <button
          onClick={() => onNavigateTab('hr')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <Clock className="w-5 h-5 text-amber-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Shift Verification</h4>
          <p className="text-[10px] text-slate-500">Overtime & Correction</p>
        </button>

        <button
          onClick={() => onNavigateTab('hr')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <DollarSign className="w-5 h-5 text-blue-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Monthly Payroll</h4>
          <p className="text-[10px] text-slate-500">Salary & Statutory GL</p>
        </button>

        <button
          onClick={() => onNavigateTab('hr')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <FileText className="w-5 h-5 text-purple-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Leave Requests</h4>
          <p className="text-[10px] text-slate-500">Approval Queue</p>
        </button>

        <button
          onClick={() => onNavigateTab('documents')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <FileSpreadsheet className="w-5 h-5 text-cyan-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Staff Documents</h4>
          <p className="text-[10px] text-slate-500">Visas, Badges, ID</p>
        </button>
      </div>
    </div>
  );

  // 8. ADMIN WORKSPACE
  const renderAdminWorkspace = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <button
          onClick={() => onNavigateTab('admin')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <Users className="w-5 h-5 text-indigo-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Users & Directory</h4>
          <p className="text-[10px] text-slate-500">Provision & Manage</p>
        </button>

        <button
          onClick={() => onNavigateTab('admin')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Roles & 8-Tier ABAC</h4>
          <p className="text-[10px] text-slate-500">Permission Policies</p>
        </button>

        <button
          onClick={() => onNavigateTab('admin')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <Building2 className="w-5 h-5 text-blue-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Organization & Sites</h4>
          <p className="text-[10px] text-slate-500">Companies & Branches</p>
        </button>

        <button
          onClick={() => onNavigateTab('workflow')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <GitPullRequest className="w-5 h-5 text-amber-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Approval Workflows</h4>
          <p className="text-[10px] text-slate-500">Threshold Rules</p>
        </button>

        <button
          onClick={() => onNavigateTab('masterData')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <Layers className="w-5 h-5 text-purple-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Master Data (MDM)</h4>
          <p className="text-[10px] text-slate-500">Golden Records & Catalogs</p>
        </button>

        <button
          onClick={() => onNavigateTab('admin')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <Sparkles className="w-5 h-5 text-cyan-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">System Settings</h4>
          <p className="text-[10px] text-slate-500">Configuration</p>
        </button>

        <button
          onClick={() => onNavigateTab('admin')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-400 text-left transition shadow-sm group cursor-pointer space-y-2"
        >
          <Clock className="w-5 h-5 text-rose-500" />
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Security Audit Logs</h4>
          <p className="text-[10px] text-slate-500">Realtime Sentinel</p>
        </button>

        <button
          onClick={() => onNavigateTab('helpCenter')}
          className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 text-left transition shadow-sm group cursor-pointer space-y-2 sm:col-span-2 lg:col-span-3"
        >
          <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h4 className="font-extrabold text-xs text-indigo-950 dark:text-white group-hover:text-indigo-600 transition">
            Enterprise Help Center & Complete Admin User Manual
          </h4>
          <p className="text-[10px] text-slate-500">Role guides, ERP jargon glossary & full system governance guide</p>
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-3.5 bg-slate-900 text-white border border-slate-700 rounded-xl shadow-2xl text-xs flex items-center space-x-2 animate-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Role Adaptive Section */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Personalized Workspace:
            </span>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {activeRole === 'ADMIN'
                ? 'System Administrator Workspace'
                : activeRole === 'MANAGER'
                ? 'Project Manager Workspace'
                : activeRole === 'STORE_KEEPER'
                ? 'Store & Materials Workspace'
                : activeRole === 'SUPERVISOR' || activeRole === 'INCHARGE'
                ? 'Supervisor Operational Workspace'
                : 'Employee Self-Service Workspace'}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Role: {activeRole}
          </span>
        </div>

        {/* Dynamic Role Render */}
        {activeRole === 'ADMIN' && renderAdminWorkspace()}
        {activeRole === 'MANAGER' && renderPMWorkspace()}
        {activeRole === 'STORE_KEEPER' && renderStoreWorkspace()}
        {(activeRole === 'SUPERVISOR' || activeRole === 'INCHARGE') && renderSupervisorWorkspace()}
        {activeRole !== 'ADMIN' && activeRole !== 'MANAGER' && activeRole !== 'STORE_KEEPER' && activeRole !== 'SUPERVISOR' && activeRole !== 'INCHARGE' && renderEmployeeWorkspace()}
      </div>
    </div>
  );
};
