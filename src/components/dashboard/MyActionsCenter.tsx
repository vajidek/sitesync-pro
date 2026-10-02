import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  ChevronRight,
  ArrowRight,
  Check,
  X,
  Eye,
  Filter,
  RefreshCw,
  Sparkles,
  Calendar,
  Building2,
  UserCheck,
  Receipt,
  ShoppingCart,
  Boxes,
  HelpCircle
} from 'lucide-react';
import { useAuth, getActiveStoredToken } from '../../context/AuthContext';
import { useShell } from '../layout/ShellContext';
import { safeJson } from '../../lib/safeFetch';

export interface ActionItem {
  id: string;
  type: 'APPROVAL' | 'ATTENDANCE_CORRECTION' | 'EXPENSE_CLAIM';
  title: string;
  requesterName: string;
  requesterRole: string;
  department: string;
  date: string;
  amountOrSubject: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  status: string;
  targetTab: string;
  details: string;
}

export interface MyRequestItem {
  id: string;
  requestNumber: string;
  title: string;
  type: 'EXPENSE' | 'PURCHASE_REQ' | 'ADVANCE' | 'MATERIAL_ISSUE';
  amountOrQty: string;
  submittedDate: string;
  currentStatus: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'AWAITING_PAYMENT' | 'PAID';
  statusBadgeLabel: string;
  statusBadgeColor: string;
  whoMustAct: string;
  whatHappensNext: string;
  whyPending: string;
  canEdit: boolean;
  canResubmit: boolean;
  currentStepIndex: number;
  totalSteps: number;
  workflowSteps: { label: string; actor: string; completed: boolean; active: boolean }[];
  targetTab: string;
  rejectionReason?: string;
}

export interface RecentActivityItem {
  id: string;
  title: string;
  actor: string;
  module: string;
  timeAgo: string;
  description: string;
  statusType: 'success' | 'warning' | 'info' | 'error';
  targetTab: string;
}

interface MyActionsCenterProps {
  onNavigateTab: (tab: string) => void;
  onOpenQuickExpense?: () => void;
}

// 1. DEMO ACTION REQUIRED ITEMS (Sample sandbox scenarios)
const INITIAL_DEMO_ACTION_ITEMS: ActionItem[] = [
  {
    id: 'act-001',
    type: 'APPROVAL',
    title: 'Sign-off Purchase Requisition #PR-2026-081',
    requesterName: 'Vikram Singh',
    requesterRole: 'Site Engineer',
    department: 'Civil Infrastructure',
    date: 'Today, 08:30 AM',
    amountOrSubject: '$14,500 (50 MT Structural Steel Rebar)',
    priority: 'CRITICAL',
    status: 'AWAITING_SUPERVISOR',
    targetTab: 'procurement',
    details: 'Material requisition for Pier Foundation 4B. Required on site within 48 hours for concrete pour.',
  },
  {
    id: 'act-002',
    type: 'APPROVAL',
    title: 'Approve Subcontract Measurement Sheet #MS-04',
    requesterName: 'Apex GeoTech & Earthmovers',
    requesterRole: 'Subcontractor',
    department: 'Earthworks & Trenching',
    date: 'Yesterday',
    amountOrSubject: '4,500 m³ Excavation Volume',
    priority: 'HIGH',
    status: 'AWAITING_VERIFICATION',
    targetTab: 'commercial',
    details: 'Joint surveyor measurement verified by Quantity Surveyor. Awaiting PM sign-off before RA Bill release.',
  },
  {
    id: 'act-003',
    type: 'APPROVAL',
    title: 'Authorize Material Issue Slip #MIV-0042',
    requesterName: 'Sunil Kumar',
    requesterRole: 'Foreman',
    department: 'Stores & Yard',
    date: 'Today, 09:15 AM',
    amountOrSubject: '30 Bags OPC 53 Cement',
    priority: 'NORMAL',
    status: 'AWAITING_STORE_DISPATCH',
    targetTab: 'inventory',
    details: 'Issue from Central Warehouse to WTP Pipe trenching zone. Validated against WBS code 2.1.',
  },
  {
    id: 'act-004',
    type: 'ATTENDANCE_CORRECTION',
    title: 'Review Attendance Geofence Override Request',
    requesterName: 'Deepak Verma',
    requesterRole: 'Junior Engineer',
    department: 'Site Engineering',
    date: '28 Sep 2026',
    amountOrSubject: 'Shift 1 (07:00 - 15:30) Off-site Inspection',
    priority: 'HIGH',
    status: 'CORRECTION_REQUIRED',
    targetTab: 'hr',
    details: 'Employee clocked in at auxiliary pumping booster station outside standard site perimeter geofence. Requesting shift validation.',
  },
  {
    id: 'act-005',
    type: 'EXPENSE_CLAIM',
    title: 'Review Employee Expense Claim #EXP-2026-0089',
    requesterName: 'Sunil Kumar',
    requesterRole: 'Site Foreman',
    department: 'Operations',
    date: 'Today, 10:00 AM',
    amountOrSubject: '₹200 (Site Safety Nylon Rope)',
    priority: 'NORMAL',
    status: 'AWAITING_SUPERVISOR',
    targetTab: 'expenses',
    details: 'Emergency nylon barricade rope purchased from Al Madina Hardware. Bill invoice attached with photo.',
  },
  {
    id: 'act-006',
    type: 'EXPENSE_CLAIM',
    title: 'Review Travel & Conveyance Claim #EXP-2026-0085',
    requesterName: 'Kavita Nair',
    requesterRole: 'QA/QC Inspector',
    department: 'Quality Assurance',
    date: 'Yesterday',
    amountOrSubject: '₹1,450 (Laboratory Sample Dispatch)',
    priority: 'HIGH',
    status: 'AWAITING_SUPERVISOR',
    targetTab: 'expenses',
    details: 'Courier and transport fee for concrete cube core compressive strength testing at regional testing lab.',
  },
];

// 2. DEMO MY REQUESTS
const INITIAL_DEMO_MY_REQUESTS: MyRequestItem[] = [
  {
    id: 'req-001',
    requestNumber: 'EXP-2026-0091',
    title: 'Site Emergency Safety Rope & Ties',
    type: 'EXPENSE',
    amountOrQty: '₹200.00',
    submittedDate: 'Today, 09:30 AM',
    currentStatus: 'SUBMITTED',
    statusBadgeLabel: 'Submitted · In Review',
    statusBadgeColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300',
    whoMustAct: 'Rajesh Kumar (Site Supervisor)',
    whatHappensNext: 'Supervisor validates the bill photo, then forwards to Finance for bank reimbursement.',
    whyPending: 'Awaiting shift supervisor first-tier sign-off.',
    canEdit: true,
    canResubmit: false,
    currentStepIndex: 1,
    totalSteps: 5,
    targetTab: 'expenses',
    workflowSteps: [
      { label: 'Submitted', actor: 'You', completed: true, active: false },
      { label: 'Supervisor Review', actor: 'Supervisor', completed: false, active: true },
      { label: 'Finance Verification', actor: 'Finance Officer', completed: false, active: false },
      { label: 'Disbursement', actor: 'Cashier / Bank', completed: false, active: false },
      { label: 'General Ledger Posted', actor: 'System Core', completed: false, active: false },
    ],
  },
  {
    id: 'req-002',
    requestNumber: 'PR-2026-0104',
    title: 'M40 Ready-Mix Concrete Pour Batch',
    type: 'PURCHASE_REQ',
    amountOrQty: '40 m³ ($6,200)',
    submittedDate: 'Yesterday',
    currentStatus: 'APPROVED',
    statusBadgeLabel: 'Approved · PO Processing',
    statusBadgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300',
    whoMustAct: 'Procurement Officer (Vendor PO Release)',
    whatHappensNext: 'Procurement issues the purchase order to the batching plant for scheduled transit mix trucks.',
    whyPending: 'Approved by PM. Supplier PO generation underway.',
    canEdit: false,
    canResubmit: false,
    currentStepIndex: 2,
    totalSteps: 5,
    targetTab: 'procurement',
    workflowSteps: [
      { label: 'Requisition', actor: 'You', completed: true, active: false },
      { label: 'PM Approved', actor: 'Project Manager', completed: true, active: false },
      { label: 'PO Issued', actor: 'Procurement', completed: false, active: true },
      { label: 'Site GRN Delivery', actor: 'Storekeeper', completed: false, active: false },
      { label: 'AP Match & Settled', actor: 'Finance', completed: false, active: false },
    ],
  },
  {
    id: 'req-003',
    requestNumber: 'EXP-2026-0078',
    title: 'Hardware Tools & Welding Rods',
    type: 'EXPENSE',
    amountOrQty: '₹3,400.00',
    submittedDate: '26 Sep 2026',
    currentStatus: 'REJECTED',
    statusBadgeLabel: 'Rejected · Action Needed',
    statusBadgeColor: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300',
    whoMustAct: 'You (Resubmission Required)',
    whatHappensNext: 'Click "Resubmit with Bill" to attach a clear vendor receipt showing the shop GST number.',
    whyPending: 'Rejected by Finance: Missing printed GST tax receipt (handwritten memo was illegible).',
    rejectionReason: 'The bill image uploaded was blurry and lacked the shop tax invoice header. Please resubmit with a clear camera photo of the original GST cash memo.',
    canEdit: false,
    canResubmit: true,
    currentStepIndex: 2,
    totalSteps: 5,
    targetTab: 'expenses',
    workflowSteps: [
      { label: 'Submitted', actor: 'You', completed: true, active: false },
      { label: 'Supervisor Approved', actor: 'Supervisor', completed: true, active: false },
      { label: 'Finance Rejected', actor: 'Finance Auditor', completed: false, active: true },
      { label: 'Disbursement', actor: 'Cashier', completed: false, active: false },
      { label: 'GL Settled', actor: 'System', completed: false, active: false },
    ],
  },
  {
    id: 'req-004',
    requestNumber: 'ADV-2026-0012',
    title: 'Site Mobilization Travel Cash Advance',
    type: 'ADVANCE',
    amountOrQty: '₹5,000.00',
    submittedDate: '28 Sep 2026',
    currentStatus: 'AWAITING_PAYMENT',
    statusBadgeLabel: 'Verified · Awaiting Payment',
    statusBadgeColor: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300',
    whoMustAct: 'Finance Cashier (Disbursement)',
    whatHappensNext: 'Cashier will release ₹5,000 via UPI/NEFT transfer or site petty cash voucher today.',
    whyPending: 'Approved by Incharge and audited by Finance. Queued in daily cash disbursement run.',
    canEdit: false,
    canResubmit: false,
    currentStepIndex: 3,
    totalSteps: 4,
    targetTab: 'expenses',
    workflowSteps: [
      { label: 'Requested', actor: 'You', completed: true, active: false },
      { label: 'Incharge Approved', actor: 'Site Incharge', completed: true, active: false },
      { label: 'Finance Verified', actor: 'Finance Officer', completed: true, active: false },
      { label: 'Payment Queued', actor: 'Cashier', completed: false, active: true },
    ],
  },
];

// 3. DEMO RECENT ACTIVITY TIMELINE
const INITIAL_DEMO_RECENT_ACTIVITIES: RecentActivityItem[] = [
  {
    id: 'act-log-1',
    title: 'Expense Claim #EXP-2026-0004 Paid ($600)',
    actor: 'David Chen',
    module: 'Finance & Expenses',
    timeAgo: '12 mins ago',
    description: 'Reimbursement for pipeline testing equipment parts disbursed via wire transfer WIRE-1790753954234.',
    statusType: 'success',
    targetTab: 'expenses',
  },
  {
    id: 'act-log-2',
    title: 'Three-Way Match Approved for PO #PO-2026-INT-001 ($48,500)',
    actor: 'System Bot & AP Auditor',
    module: 'Procurement & AP',
    timeAgo: '28 mins ago',
    description: 'Automated 3-way match verified 50 MT cement delivered at site. AP invoice INV-VEND-3WM-INT-6186 created.',
    statusType: 'info',
    targetTab: 'procurement',
  },
  {
    id: 'act-log-3',
    title: 'Subcontract RA Bill #RA-03 Certified ($2,072,500 Payable)',
    actor: 'Abdul Vajid EK',
    module: 'Commercial & Contracts',
    timeAgo: '45 mins ago',
    description: 'Apex GeoTech excavation verified. 5% retention ($122,500) and mobilization recovery ($240,000) applied.',
    statusType: 'success',
    targetTab: 'commercial',
  },
  {
    id: 'act-log-4',
    title: 'Material Issue Voucher #MIV-0037 Dispatched',
    actor: 'Central Stores Custodian',
    module: 'Stores & Inventory',
    timeAgo: '1 hour ago',
    description: 'Materials released to Structural Concrete Team for Site Pier 4 under Dubai Creek Harbor WTP.',
    statusType: 'info',
    targetTab: 'inventory',
  },
];

export const MyActionsCenter: React.FC<MyActionsCenterProps> = ({
  onNavigateTab,
  onOpenQuickExpense,
}) => {
  const { user, activeRole } = useAuth();
  const { isDemo } = useShell();

  const [activeSection, setActiveSection] = useState<'ACTIONS' | 'REQUESTS' | 'ACTIVITY'>('ACTIONS');
  const [selectedRequest, setSelectedRequest] = useState<MyRequestItem | null>(null);
  const [selectedActionItem, setSelectedActionItem] = useState<ActionItem | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  const [actionItems, setActionItems] = useState<ActionItem[]>(() => isDemo ? INITIAL_DEMO_ACTION_ITEMS : []);
  const [myRequests, setMyRequests] = useState<MyRequestItem[]>(() => isDemo ? INITIAL_DEMO_MY_REQUESTS : []);
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>(() => isDemo ? INITIAL_DEMO_RECENT_ACTIVITIES : []);

  useEffect(() => {
    if (isDemo) {
      setActionItems(INITIAL_DEMO_ACTION_ITEMS);
      setMyRequests(INITIAL_DEMO_MY_REQUESTS);
      setRecentActivities(INITIAL_DEMO_RECENT_ACTIVITIES);
      return;
    }

    const token = getActiveStoredToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      fetch('/api/workflow/tasks/pending', { headers })
        .then((r) => safeJson(r))
        .catch(() => null),
      fetch('/api/audit/logs?limit=10', { headers })
        .then((r) => safeJson(r))
        .catch(() => null),
    ]).then(([tasksData, auditData]) => {
      if (tasksData?.success && Array.isArray(tasksData.data)) {
        const mappedTasks: ActionItem[] = tasksData.data.map((t: any) => ({
          id: t.id || `task-${Math.random()}`,
          type: 'APPROVAL',
          title: t.title || t.name || 'Pending Approval Task',
          requesterName: t.creatorName || t.requester || 'User',
          requesterRole: t.role || 'Staff',
          department: t.department || 'Operations',
          date: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Recent',
          amountOrSubject: t.amount ? `$${t.amount}` : t.subject || 'Action Required',
          priority: t.priority || 'NORMAL',
          status: t.status || 'PENDING',
          targetTab: t.targetTab || 'workflow',
          details: t.description || t.notes || 'Approval required per corporate governance policy.',
        }));
        setActionItems(mappedTasks);
      } else {
        setActionItems([]);
      }

      if (auditData?.success && Array.isArray(auditData.data)) {
        const mappedLogs: RecentActivityItem[] = auditData.data.map((l: any) => ({
          id: l.id || `log-${Math.random()}`,
          title: `${l.action || 'TRANSACTION'} on ${l.entityType || l.entity || 'Record'}`,
          actor: l.userName || l.user || 'System User',
          module: l.module || 'Enterprise ERP',
          timeAgo: l.createdAt ? new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
          description: l.details || l.description || `State transition executed by ${l.userName || 'authorized user'}.`,
          statusType: l.status === 'FAILED' ? 'error' : 'success',
          targetTab: 'admin',
        }));
        setRecentActivities(mappedLogs);
      } else {
        setRecentActivities([]);
      }

      setMyRequests([]);
    });
  }, [isDemo]);

  // Quick Action Handler
  const handleApproveAction = (item: ActionItem) => {
    setActionItems((prev) => prev.filter((a) => a.id !== item.id));
    setSelectedActionItem(null);
    setActionNotice({
      type: 'success',
      message: `Successfully approved "${item.title}". The request has been forwarded to the next workflow stage.`,
    });
  };

  const handleRejectAction = (item: ActionItem) => {
    setActionItems((prev) => prev.filter((a) => a.id !== item.id));
    setSelectedActionItem(null);
    setActionNotice({
      type: 'info',
      message: `Action item "${item.title}" was declined and returned to requester with note.`,
    });
  };

  const approvalsCount = actionItems.filter((i) => i.type === 'APPROVAL').length;
  const attendanceCorrectionCount = actionItems.filter((i) => i.type === 'ATTENDANCE_CORRECTION').length;
  const expenseClaimsCount = actionItems.filter((i) => i.type === 'EXPENSE_CLAIM').length;

  return (
    <div className="space-y-4">
      
      {/* Top Banner Notice */}
      {actionNotice && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between shadow-sm animate-in fade-in ${
          actionNotice.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
            : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200'
        }`}>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Unified Header & Section Switcher */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                My Actions Center
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Your centralized operational inbox: pending approvals, submitted requests, and live audit timeline.
            </p>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center space-x-2">
            {onOpenQuickExpense && (
              <button
                onClick={onOpenQuickExpense}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>{isDemo ? 'Try Expense Demo' : 'Claim an Expense'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Main Action Segment Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          
          {/* Tab 1: ACTION REQUIRED / DEMO APPROVAL QUEUE */}
          <button
            onClick={() => {
              setActiveSection('ACTIONS');
              setSelectedRequest(null);
            }}
            className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
              activeSection === 'ACTIONS'
                ? 'bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/60 dark:to-slate-900 border-indigo-500 text-indigo-950 dark:text-white shadow-sm ring-1 ring-indigo-500/20'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {isDemo ? '1. Demo Approval Queue' : '1. Action Required'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white">
                {actionItems.length}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">
              {actionItems.length === 0
                ? (isDemo ? 'No demo tasks pending' : 'No pending approvals')
                : (isDemo
                    ? `${actionItems.length} demo approvals & sample tasks`
                    : `${approvalsCount} approvals · ${attendanceCorrectionCount} attendance · ${expenseClaimsCount} expenses`)}
            </div>
          </button>

          {/* Tab 2: MY REQUESTS */}
          <button
            onClick={() => {
              setActiveSection('REQUESTS');
              if (!selectedRequest && myRequests.length > 0) {
                setSelectedRequest(myRequests[0]);
              }
            }}
            className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
              activeSection === 'REQUESTS'
                ? 'bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/60 dark:to-slate-900 border-indigo-500 text-indigo-950 dark:text-white shadow-sm ring-1 ring-indigo-500/20'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                2. My Requests
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-indigo-600 text-white">
                {myRequests.length}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">
              {myRequests.length === 0
                ? 'No active requests'
                : `${myRequests.filter((r) => r.currentStatus === 'SUBMITTED').length} pending · ${myRequests.filter((r) => r.currentStatus === 'APPROVED').length} approved`}
            </div>
          </button>

          {/* Tab 3: RECENT ACTIVITY */}
          <button
            onClick={() => {
              setActiveSection('ACTIVITY');
              setSelectedRequest(null);
            }}
            className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
              activeSection === 'ACTIVITY'
                ? 'bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/60 dark:to-slate-900 border-indigo-500 text-indigo-950 dark:text-white shadow-sm ring-1 ring-indigo-500/20'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {isDemo ? '3. Demo Activity' : '3. Recent Activity'}
              </span>
              <span className="text-[10px] font-mono text-emerald-500 font-bold">
                {isDemo ? 'Demo Activity' : 'Live Audit Trail'}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">
              {isDemo ? 'Simulated workflow activity' : 'Real-time enterprise cross-module log'}
            </div>
          </button>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: ACTION REQUIRED VIEW                                          */}
      {/* ========================================================================= */}
      {activeSection === 'ACTIONS' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {isDemo ? `Demo Tasks (${actionItems.length})` : `Tasks Awaiting Your Action (${actionItems.length})`}
              </h3>
              {isDemo && (
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  Demo Workflow Preview
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">
              {isDemo ? 'Interactive demonstration approval items' : 'Click any item to inspect details & approve'}
            </span>
          </div>

          {actionItems.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                No pending approvals
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You have no pending approvals, attendance corrections, or expense reviews outstanding.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedActionItem(item)}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition shadow-sm cursor-pointer space-y-3 flex flex-col justify-between group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          item.type === 'APPROVAL'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            : item.type === 'ATTENDANCE_CORRECTION'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        }`}>
                          {item.type.replace('_', ' ')}
                        </span>
                        {isDemo && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            DEMO DATA
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.date}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {item.title}
                    </h4>

                    <div className="text-[11px] text-slate-500 flex items-center space-x-1.5">
                      <span>By: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{item.requesterName}</strong></span>
                      <span>·</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{item.amountOrSubject}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {item.details}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateTab(item.targetTab);
                      }}
                      className="text-slate-400 hover:text-indigo-600 text-[11px] font-bold flex items-center gap-1"
                    >
                      <span>Open in {item.targetTab}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleApproveAction(item)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleRejectAction(item)}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Item Inspection Modal */}
          {selectedActionItem && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
              onClick={() => setSelectedActionItem(null)}
            >
              <div
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 w-full max-w-lg shadow-2xl space-y-4 my-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Action Item Inspection
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {selectedActionItem.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedActionItem(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Requester:</span>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{selectedActionItem.requesterName} ({selectedActionItem.requesterRole})</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Department:</span>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{selectedActionItem.department}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Value / Amount:</span>
                      <div className="font-bold text-indigo-600 dark:text-indigo-400">{selectedActionItem.amountOrSubject}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Date Submitted:</span>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{selectedActionItem.date}</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Description & Context:</span>
                    <p className="mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-200 dark:border-slate-700/60">
                      {selectedActionItem.details}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      onNavigateTab(selectedActionItem.targetTab);
                      setSelectedActionItem(null);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition mr-auto"
                  >
                    Open in Full Screen
                  </button>

                  <button
                    onClick={() => handleRejectAction(selectedActionItem)}
                    className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 text-slate-700 dark:text-slate-300 hover:text-rose-600 text-xs font-bold transition"
                  >
                    Decline
                  </button>

                  <button
                    onClick={() => handleApproveAction(selectedActionItem)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md flex items-center space-x-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Approval</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: MY REQUESTS & WORKFLOW STEPPER VIEW                           */}
      {/* ========================================================================= */}
      {activeSection === 'REQUESTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Left Column: My Requests List (1 Col) */}
          <div className="lg:col-span-1 space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {isDemo ? `Demo Workflow Preview (${myRequests.length})` : `My Submitted Requests (${myRequests.length})`}
              </h3>
              <span className="text-[10px] text-slate-400">
                {isDemo ? 'Sample trackable workflows' : 'Select to trace'}
              </span>
            </div>

            {myRequests.length === 0 ? (
              <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <FileText className="w-7 h-7 text-slate-400 mx-auto" />
                <div className="font-bold text-xs text-slate-700 dark:text-slate-300">
                  {isDemo ? 'No Demo Requests' : 'No expense claims yet'}
                </div>
                <p className="text-[11px] text-slate-500">
                  {isDemo ? 'Explore simulated approvals in Tab 1.' : 'You have not submitted any approval or expense claims.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {myRequests.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer space-y-2 ${
                      selectedRequest?.id === req.id
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-[10px] font-bold text-slate-500">
                          {req.requestNumber}
                        </span>
                        {isDemo && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            DEMO DATA
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${req.statusBadgeColor}`}>
                        {req.statusBadgeLabel}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                      {req.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{req.amountOrQty}</span>
                      <span>{req.submittedDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Interactive Workflow Stepper & Full Status Breakdown (2 Cols) */}
          <div className="lg:col-span-2">
            {selectedRequest ? (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                
                {/* Header Details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">
                        {selectedRequest.requestNumber}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-xs text-slate-500">Submitted {selectedRequest.submittedDate}</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                      {selectedRequest.title}
                    </h3>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${selectedRequest.statusBadgeColor}`}>
                    {selectedRequest.statusBadgeLabel}
                  </span>
                </div>

                {/* VISUAL WORKFLOW PROGRESS STEPPER */}
                <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
                    <span>Workflow Stage Progress</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      Stage {selectedRequest.currentStepIndex} of {selectedRequest.totalSteps}
                    </span>
                  </div>

                  {/* Horizontal / Wrapped Step Indicator */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {selectedRequest.workflowSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg border text-center space-y-1 transition ${
                          step.completed
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                            : step.active
                            ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-400/30'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-center">
                          {step.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                              step.active ? 'bg-white text-indigo-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                            }`}>
                              {idx + 1}
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-[10px] truncate leading-tight">
                          {step.label}
                        </div>
                        <div className={`text-[9px] truncate ${step.active ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {step.actor}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4 Critical Status Visibility Questions Answered in Plain English */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  
                  {/* Who must act next */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Who Must Act Next?
                    </div>
                    <div className="font-extrabold text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <UserCheck className="w-4 h-4 text-indigo-500" />
                      <span>{selectedRequest.whoMustAct}</span>
                    </div>
                  </div>

                  {/* What happens next */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      What Happens Next?
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">
                      {selectedRequest.whatHappensNext}
                    </div>
                  </div>

                  {/* Why it is pending */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Why Is It Pending?
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">
                      {selectedRequest.whyPending}
                    </div>
                  </div>

                  {/* Rejection Clarification if applicable */}
                  {selectedRequest.rejectionReason && (
                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 space-y-1 md:col-span-2">
                      <div className="text-[10px] font-black uppercase tracking-wider text-rose-700 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Rejection Explanation:
                      </div>
                      <p className="text-xs leading-relaxed">
                        {selectedRequest.rejectionReason}
                      </p>
                    </div>
                  )}

                </div>

                {/* Action Buttons for Resubmit / Edit / Navigate */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onNavigateTab(selectedRequest.targetTab)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>View in {selectedRequest.targetTab} module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center space-x-2">
                    {selectedRequest.canResubmit && (
                      <button
                        onClick={() => {
                          onNavigateTab('expenses');
                          if (onOpenQuickExpense) onOpenQuickExpense();
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm flex items-center space-x-1"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Resubmit with Bill</span>
                      </button>
                    )}

                    {selectedRequest.canEdit && (
                      <button
                        onClick={() => onNavigateTab('expenses')}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
                      >
                        Edit Draft
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                {myRequests.length === 0 
                  ? 'No submitted requests to trace. When you submit expenses, requisitions, or attendance corrections, their live progress will show here.'
                  : 'Select a request from the list to view its real-time workflow status and next steps.'}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: RECENT ACTIVITY VIEW                                          */}
      {/* ========================================================================= */}
      {activeSection === 'ACTIVITY' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {isDemo ? 'Demo Activity & Simulated Timeline' : 'Recent ERP Activity & Cross-Module Timeline'}
              </h3>
              <p className="text-xs text-slate-500">
                {isDemo
                  ? 'Sample cross-module activity records demonstrating audit traceability.'
                  : 'Click any log entry to jump straight into the corresponding transaction.'}
              </p>
            </div>
            <span className="text-[10px] font-bold text-slate-400">
              {isDemo ? 'Demo Feed' : 'Live Feed'}
            </span>
          </div>

          {recentActivities.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
              <Clock className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="font-bold text-xs text-slate-700 dark:text-slate-300">No recent activity</div>
              <p className="text-[11px] text-slate-500">
                {isDemo
                  ? 'Demo activity log is empty.'
                  : 'Actual system audit events and transaction entries will appear here in real time.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => onNavigateTab(act.targetTab)}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700/80 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${
                        act.statusType === 'success'
                          ? 'bg-emerald-500'
                          : act.statusType === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-indigo-500'
                      }`} />
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        {act.title}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {act.module}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      {act.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {act.timeAgo}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
