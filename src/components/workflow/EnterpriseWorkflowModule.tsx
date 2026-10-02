import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Bell,
  ShieldAlert,
  UserCheck,
  Send,
  Plus,
  Search,
  Filter,
  RefreshCw,
  GitPullRequest,
  Check,
  Calendar,
  MessageSquare,
  Zap,
  TrendingUp,
  Sliders,
  FileText,
  User,
  Users,
  ChevronRight,
  Pin,
  Mail,
  Smartphone,
  Layers,
  Award,
  ArrowUpRight,
  Sparkles,
  DollarSign,
  AlertCircle,
  RotateCcw,
  CornerUpRight,
  Building,
  Briefcase,
  Shield,
  HelpCircle
} from 'lucide-react';
import { safeJson } from '../../lib/safeFetch';

interface WorkflowStats {
  activeWorkflows: number;
  pendingApprovalsCount: number;
  myPendingTasksCount: number;
  escalatedCount: number;
  delegationsCount: number;
  announcementsCount: number;
  unreadNotificationsCount: number;
  avgApprovalSlaHours: number;
  approvalSuccessRatePercent: number;
}

interface WorkflowItem {
  id: string;
  code: string;
  name: string;
  module: string;
  description: string;
  minApprovalAmount: number;
  slaHours: number;
  isActive: boolean;
  triggerType?: string;
}

interface TaskItem {
  id: string;
  instanceId: string;
  stepId: string;
  assignedRoleId: string;
  assignedUserName: string;
  status: string;
  dueDate: string;
  createdAt: string;
  title?: string;
  entityType?: string;
  entityId?: string;
  priority?: string;
  requesterName?: string;
  originalAmount?: number;
  originalCurrency?: string;
  baseAmount?: number;
  exchangeRate?: number;
  projectName?: string;
  department?: string;
  hoursRemaining?: number;
  isOverdue?: boolean;
  context?: any;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: string;
  severity: string;
  createdAt: string;
  isRead?: boolean;
}

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  authorName: string;
  targetAudience: string;
  priority: string;
  publishedAt: string;
  isPinned: boolean;
}

interface DelegationItem {
  id: string;
  delegatorName: string;
  delegateeName: string;
  moduleScope: string;
  startDate: string;
  endDate: string;
  status: string;
  reason: string;
}

interface ActivityItem {
  id: string;
  actorName: string;
  actionType: string;
  module: string;
  summary: string;
  timestamp: string;
}

export const EnterpriseWorkflowModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'approvals'
    | 'tasks'
    | 'history'
    | 'designer'
    | 'activity'
    | 'notifications'
    | 'announcements'
    | 'delegations'
  >('dashboard');

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<WorkflowStats>({
    activeWorkflows: 8,
    pendingApprovalsCount: 4,
    myPendingTasksCount: 2,
    escalatedCount: 1,
    delegationsCount: 1,
    announcementsCount: 2,
    unreadNotificationsCount: 3,
    avgApprovalSlaHours: 14.2,
    approvalSuccessRatePercent: 94.8,
  });

  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [delegations, setDelegations] = useState<DelegationItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Search & Filters in Approvals Inbox
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterOverdueOnly, setFilterOverdueOnly] = useState(false);

  // Modals & Forms
  const [showNewSubmissionModal, setShowNewSubmissionModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [approvalDecision, setApprovalDecision] = useState<
    'APPROVED' | 'REJECTED' | 'RETURN_FOR_CORRECTION' | 'REQUEST_CLARIFICATION' | 'DELEGATED' | 'ESCALATED'
  >('APPROVED');
  const [approvalComment, setApprovalComment] = useState('');
  const [delegateToUser, setDelegateToUser] = useState('');

  // New Submission state with Multi-Currency
  const [subCode, setSubCode] = useState('WF-PROC-PO');
  const [subType, setSubType] = useState('PO');
  const [subEntityId, setSubEntityId] = useState('PO-2026-9001');
  const [subTitle, setSubTitle] = useState('PO #9001 - High Pressure Valves (Valvitalia)');
  const [subPriority, setSubPriority] = useState('NORMAL');
  const [subAmount, setSubAmount] = useState(2500000);
  const [subCurrency, setSubCurrency] = useState('INR');
  const [subProject, setSubProject] = useState('Metro Rail Viaduct Package-3');
  const [subDept, setSubDept] = useState('Procurement & Commercial');

  // New Delegation state
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [delName, setDelName] = useState('');
  const [delScope, setDelScope] = useState('ALL');
  const [delStart, setDelStart] = useState(new Date().toISOString().split('T')[0]);
  const [delEnd, setDelEnd] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [delReason, setDelReason] = useState('');

  // New Announcement state
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [ancTitle, setAncTitle] = useState('');
  const [ancContent, setAncContent] = useState('');
  const [ancPriority, setAncPriority] = useState('NORMAL');

  // Currency Exchange Rates lookup (to Enterprise Base INR)
  const currencyRates: Record<string, number> = {
    INR: 1,
    USD: 86.5,
    AED: 23.55,
    EUR: 93.8,
    SAR: 23.05,
    GBP: 109.2,
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const [resStats, resWf, resTasks, resNotif, resAnc, resDel, resAct, resHist] = await Promise.all([
        fetch('/api/workflow/stats', { headers }).then((r) => safeJson(r)),
        fetch('/api/workflow', { headers }).then((r) => safeJson(r)),
        fetch('/api/workflow/tasks', { headers }).then((r) => safeJson(r)),
        fetch('/api/workflow/notifications', { headers }).then((r) => safeJson(r)),
        fetch('/api/workflow/announcements', { headers }).then((r) => safeJson(r)),
        fetch('/api/workflow/delegations', { headers }).then((r) => safeJson(r)),
        fetch('/api/workflow/activity', { headers }).then((r) => safeJson(r)),
        fetch('/api/workflow/history', { headers }).then((r) => safeJson(r)),
      ]);

      if (resStats?.success && resStats.data) setStats(resStats.data);
      if (resWf?.success && resWf.data) setWorkflows(resWf.data);
      if (resTasks?.success && resTasks.data) setTasks(resTasks.data);
      if (resNotif?.success && resNotif.data) setNotifications(resNotif.data);
      if (resAnc?.success && resAnc.data) setAnnouncements(resAnc.data);
      if (resDel?.success && resDel.data) setDelegations(resDel.data);
      if (resAct?.success && resAct.data) setActivities(resAct.data);
      if (resHist?.success && resHist.data) setHistoryRecords(resHist.data);
    } catch (err) {
      console.error('Failed to load Workflow data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const rate = currencyRates[subCurrency] || 1;
      const baseAmount = subAmount * rate;

      const res = await fetch('/api/workflow/instances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workflowCode: subCode,
          entityType: subType,
          entityId: subEntityId,
          title: subTitle,
          priority: subPriority,
          amount: subAmount,
          currency: subCurrency,
          baseAmount,
          exchangeRate: rate,
          projectId: subProject,
          department: subDept,
          dataContextJson: JSON.stringify({
            projectName: subProject,
            department: subDept,
            originalAmount: subAmount,
            originalCurrency: subCurrency,
            baseAmount,
            exchangeRate: rate,
          }),
        }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowNewSubmissionModal(false);
        fetchData();
      }
    } catch (err) {
      console.error('Error submitting workflow request:', err);
    }
  };

  const handleProcessApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/workflow/approvals/decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskId: selectedTask.id,
          decision: approvalDecision,
          comments: approvalComment,
          delegateToUserId: approvalDecision === 'DELEGATED' ? delegateToUser : undefined,
        }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowApprovalModal(false);
        setSelectedTask(null);
        setApprovalComment('');
        fetchData();
      }
    } catch (err) {
      console.error('Error processing approval:', err);
    }
  };

  const handleCreateDelegation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/workflow/delegations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          delegateeId: 'usr-del-new',
          delegateeName: delName,
          moduleScope: delScope,
          startDate: delStart,
          endDate: delEnd,
          reason: delReason,
        }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowDelegationModal(false);
        setDelName('');
        setDelReason('');
        fetchData();
      }
    } catch (err) {
      console.error('Error creating delegation:', err);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/workflow/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: ancTitle,
          content: ancContent,
          priority: ancPriority,
        }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowAnnouncementModal(false);
        setAncTitle('');
        setAncContent('');
        fetchData();
      }
    } catch (err) {
      console.error('Error creating announcement:', err);
    }
  };

  // Filtered Tasks for Approvals Inbox
  const filteredTasks = tasks.filter((t) => {
    if (filterModule !== 'ALL' && t.entityType !== filterModule && t.workflowCode !== filterModule) {
      return false;
    }
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) {
      return false;
    }
    if (filterOverdueOnly && !t.isOverdue) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title?.toLowerCase().includes(q);
      const matchId = t.entityId?.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
      const matchReq = t.requesterName?.toLowerCase().includes(q);
      if (!matchTitle && !matchId && !matchReq) return false;
    }
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-xs">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-full uppercase tracking-wider">
              Generic Workflow Governance
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-xs">• Cross-Module Multi-Level Approval Engine</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <GitPullRequest className="w-6 h-6 text-purple-600" />
            Enterprise Workflow & Approvals Workspace
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
            Dynamic approver resolution, multi-currency value thresholds, SLA tracking, active delegations, and immutable audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3.5 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowNewSubmissionModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Submit Approval Request
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-slate-500 text-[11px] font-bold">Active Workflows</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">{stats.activeWorkflows}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-purple-600 dark:text-purple-400 text-[11px] font-bold">Pending Approvals</div>
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.pendingApprovalsCount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-blue-600 dark:text-blue-400 text-[11px] font-bold">My Tasks</div>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.myPendingTasksCount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-rose-600 dark:text-rose-400 text-[11px] font-bold">Escalated (SLA)</div>
          <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-1">{stats.escalatedCount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-indigo-600 dark:text-indigo-400 text-[11px] font-bold">Active Delegations</div>
          <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">{stats.delegationsCount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">Announcements</div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.announcementsCount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-amber-600 dark:text-amber-400 text-[11px] font-bold">Notifications</div>
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.unreadNotificationsCount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-slate-500 text-[11px] font-bold">Avg SLA Turnaround</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">{stats.avgApprovalSlaHours}h</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-1 overflow-x-auto pb-1">
        {[
          { id: 'dashboard', label: 'Executive Overview', icon: TrendingUp },
          { id: 'approvals', label: 'My Approvals Inbox', icon: CheckCircle2, badge: stats.pendingApprovalsCount },
          { id: 'tasks', label: 'Assigned Tasks', icon: Clock, badge: stats.myPendingTasksCount },
          { id: 'history', label: 'Audit Trail & History', icon: FileText },
          { id: 'designer', label: 'Workflow Rules', icon: Sliders },
          { id: 'activity', label: 'Activity Feed', icon: Zap },
          { id: 'notifications', label: 'Notifications', icon: Bell, badge: stats.unreadNotificationsCount },
          { id: 'announcements', label: 'Announcements', icon: Pin, badge: stats.announcementsCount },
          { id: 'delegations', label: 'Delegations & SLA', icon: UserCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-purple-600 text-purple-700 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-950/40'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-purple-600 text-white rounded-full ml-1">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Executive Overview */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                  Active Cross-Module Workflows
                </h3>
                <span className="text-[11px] text-slate-400">{workflows.length} Configured</span>
              </div>

              <div className="space-y-3">
                {workflows.map((wf) => (
                  <div
                    key={wf.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                          {wf.code}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{wf.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{wf.description}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        SLA: {wf.slaHours || 24}h
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Threshold: ₹ {(wf.minApprovalAmount || 0).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                Governance & Controls
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1">
                  <div className="font-bold text-emerald-800 dark:text-emerald-300">Immutability Protected</div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">All approval decisions & comments are sealed with cryptographic timestamps.</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl space-y-1">
                  <div className="font-bold text-purple-800 dark:text-purple-300">Multi-Currency Evaluation</div>
                  <p className="text-[11px] text-purple-700 dark:text-purple-400">Original transaction currency is preserved alongside converted enterprise base (INR ₹) thresholds.</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl space-y-1">
                  <div className="font-bold text-blue-800 dark:text-blue-300">Active Delegation Routing</div>
                  <p className="text-[11px] text-blue-700 dark:text-blue-400">Automatic surrogate routing during authorized leave periods.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: My Approvals Inbox (Unified Workspace) */}
      {activeTab === 'approvals' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Unified My Approvals Workspace</h3>
              <p className="text-xs text-slate-500">Commercial & Operational transactions awaiting your scrutiny, signature, or review</p>
            </div>
            <span className="text-xs font-mono font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-xl border border-purple-200 dark:border-purple-800">
              {filteredTasks.length} Actionable Items
            </span>
          </div>

          {/* Search & Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search reference or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>

            <div>
              <select
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
              >
                <option value="ALL">All Modules</option>
                <option value="PO">Procurement (PO)</option>
                <option value="REQUISITION">Material Requisition (MR)</option>
                <option value="RA_BILL">RA Bill / Valuations</option>
                <option value="CASH_REQUEST">Imprest & Cash</option>
                <option value="FINANCE">Finance & Accounts</option>
                <option value="HR">HR & Leave</option>
                <option value="QAQC">QA/QC NCRs</option>
                <option value="HSE">HSE Incidents</option>
              </select>
            </div>

            <div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
              >
                <option value="ALL">All Priorities</option>
                <option value="URGENT">URGENT</option>
                <option value="HIGH">HIGH</option>
                <option value="NORMAL">NORMAL</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={filterOverdueOnly}
                  onChange={(e) => setFilterOverdueOnly(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Overdue SLA Only</span>
              </label>
            </div>
          </div>

          {/* Pending Approvals Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 text-[11px] uppercase font-bold">
                <tr>
                  <th className="p-3 rounded-l-lg">Reference / Type</th>
                  <th className="p-3">Title & Requester</th>
                  <th className="p-3">Value / Multi-Currency</th>
                  <th className="p-3">Project & Dept</th>
                  <th className="p-3">SLA Due Date</th>
                  <th className="p-3 text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono">
                      <span className="font-bold text-purple-600 dark:text-purple-400 block">{task.entityId || task.id}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-sans font-semibold">
                        {task.entityType || 'TRANSACTION'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{task.title || 'Approval Task'}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3" />
                        <span>By {task.requesterName || 'Site Staff'}</span>
                        <span className={`ml-1 text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          task.priority === 'URGENT' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                          task.priority === 'HIGH' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {task.priority || 'NORMAL'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 font-mono">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {task.originalCurrency || 'INR'} {(task.originalAmount || 0).toLocaleString()}
                      </div>
                      {task.originalCurrency && task.originalCurrency !== (task.thresholdCurrency || 'INR') && (
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          ≈ {task.thresholdCurrency || 'INR'} {(task.baseAmount || 0).toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{task.projectName || 'General Site'}</div>
                      <div className="text-[10px] text-slate-400">{task.department || 'Operations'}</div>
                    </td>
                    <td className="p-3">
                      <div className={`flex items-center gap-1 font-semibold ${task.isOverdue ? 'text-rose-600' : 'text-slate-600 dark:text-slate-400'}`}>
                        <Clock className="w-3 h-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                      {task.hoursRemaining !== undefined && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded inline-block mt-0.5 ${
                          task.isOverdue ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {task.isOverdue ? 'OVERDUE' : `${task.hoursRemaining}h remaining`}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowApprovalModal(true);
                        }}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        Review & Act
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Tab 3: Assigned Tasks */}
      {activeTab === 'tasks' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Assigned Direct Execution Tasks</h3>
            <p className="text-xs text-slate-500">Tasks assigned to your user account and delegated responsibilities.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((t) => (
              <div key={t.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{t.id}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg">
                      {t.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-2">{t.title || 'Action Task'}</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Ref: {t.entityId || t.instanceId} • Requester: {t.requesterName || 'Staff'}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Due: {new Date(t.dueDate).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedTask(t);
                      setShowApprovalModal(true);
                    }}
                    className="px-3 py-1 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-500"
                  >
                    Open Action Panel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Audit Trail & History */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Immutable Workflow History & Audit Trail</h3>
            <p className="text-xs text-slate-500">Every decision, delegation, rework request, and rejection is recorded permanently.</p>
          </div>

          <div className="space-y-3">
            {(historyRecords.length > 0 ? historyRecords : [
              { id: 'hist-01', entityType: 'PO', entityId: 'PO-2026-8819', performedByUserName: 'Tariq Rashid', actionTaken: 'APPROVED', fromState: 'UNDER_REVIEW', toState: 'APPROVED', comments: 'Commercial terms verified and within budget limit.', timestamp: '2026-08-20T14:30:00Z' },
              { id: 'hist-02', entityType: 'RA_BILL', entityId: 'RA-2026-004', performedByUserName: 'Deepak Sharma', actionTaken: 'SUBMIT', fromState: 'DRAFT', toState: 'UNDER_REVIEW', comments: 'Measurement sheet certified by Site Surveyor.', timestamp: '2026-08-19T10:15:00Z' },
              { id: 'hist-03', entityType: 'CASH_REQUEST', entityId: 'CPR-2026-108', performedByUserName: 'Suresh Kumar', actionTaken: 'RETURN_FOR_CORRECTION', fromState: 'UNDER_REVIEW', toState: 'RETURNED', comments: 'Attach official fuel permit from Civil Defence.', timestamp: '2026-08-18T16:45:00Z' },
            ]).map((h: any) => (
              <div key={h.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{h.entityId || h.entityType}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      h.actionTaken === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                      h.actionTaken === 'REJECTED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                      h.actionTaken === 'RETURN_FOR_CORRECTION' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                      'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                    }`}>
                      {h.actionTaken}
                    </span>
                    <span className="text-[10px] text-slate-400">({h.fromState} → {h.toState})</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">Action By: <strong>{h.performedByUserName}</strong> ({h.performedByUserRole || 'Approver'})</p>
                  <p className="italic text-slate-500">"{h.comments || 'No remarks entered'}"</p>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{new Date(h.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Workflow Rules */}
      {activeTab === 'designer' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Workflow Rules & Thresholds</h3>
              <p className="text-xs text-slate-500">Full state machine configurations available in Admin &gt; Workflow Engine Builder</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflows.map((wf) => (
              <div key={wf.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                    {wf.code}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    ACTIVE
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">{wf.name}</h4>
                <p className="text-[11px] text-slate-500">{wf.description}</p>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                  <span>Trigger: {wf.triggerType || 'THRESHOLD'}</span>
                  <span>SLA: {wf.slaHours || 24} Hours</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Activity Feed */}
      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Real-Time Enterprise Activity Stream
          </h3>

          <div className="space-y-3">
            {activities.map((act) => (
              <div key={act.id} className="p-3.5 border-l-4 border-purple-600 bg-slate-50 dark:bg-slate-800/50 rounded-r-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{act.summary}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">By {act.actorName} • Module: {act.module}</div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{new Date(act.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Notification Center */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Enterprise Notification Center</h3>
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full">
              {notifications.length} Messages
            </span>
          </div>

          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-purple-50/20 dark:bg-purple-950/10 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{n.title}</span>
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-purple-600 text-white rounded">
                      {n.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">{n.message}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 8: System Announcements */}
      {activeTab === 'announcements' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">System Broadcast Announcements</h3>
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Publish Announcement
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{a.title}</span>
                    {a.isPinned && (
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-500 text-white rounded">PINNED</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{new Date(a.publishedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-xs">{a.content}</p>
                <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                  By {a.authorName} • Audience: {a.targetAudience}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 9: Delegations & SLA Governance */}
      {activeTab === 'delegations' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Authority Delegations</h3>
              <p className="text-xs text-slate-500">Temporarily transfer approval authority to authorized delegatees.</p>
            </div>
            <button
              onClick={() => setShowDelegationModal(true)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Register Delegation
            </button>
          </div>

          <div className="space-y-3">
            {delegations.map((d) => (
              <div key={d.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {d.delegatorName} → {d.delegateeName}
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded">
                      {d.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Scope: {d.moduleScope} • Reason: {d.reason || 'Executive site leave'}</p>
                </div>

                <div className="text-right text-[11px] text-slate-400 font-mono">
                  Period: {d.startDate} to {d.endDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Process Approval (Comprehensive Action Drawer) */}
      {showApprovalModal && selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">{selectedTask.entityType || 'TRANSACTION'} APPROVAL</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{selectedTask.title}</h3>
              </div>
              <button onClick={() => setShowApprovalModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            {/* Context Summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Reference ID:</span>
                <span className="font-bold font-mono text-purple-600 dark:text-purple-400">{selectedTask.entityId || selectedTask.id}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Requester:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTask.requesterName || 'Staff'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Financial Commitment:</span>
                <span className="font-bold font-mono text-emerald-600">
                  {selectedTask.originalCurrency || 'INR'} {(selectedTask.originalAmount || 0).toLocaleString()}
                </span>
                {selectedTask.originalCurrency && selectedTask.originalCurrency !== (selectedTask.thresholdCurrency || 'INR') && (
                  <span className="text-[10px] text-slate-500 block">
                    ≈ {selectedTask.thresholdCurrency || 'INR'} {(selectedTask.baseAmount || 0).toLocaleString()}
                  </span>
                )}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">SLA Due Date:</span>
                <span className="font-bold">{new Date(selectedTask.dueDate).toLocaleDateString()}</span>
              </div>
            </div>

            <form onSubmit={handleProcessApproval} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Approval Action</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'APPROVED', label: 'Approve & Certify', color: 'border-emerald-500 text-emerald-700 dark:text-emerald-400' },
                    { id: 'RETURN_FOR_CORRECTION', label: 'Return for Rework', color: 'border-purple-500 text-purple-700 dark:text-purple-400' },
                    { id: 'REQUEST_CLARIFICATION', label: 'Clarification', color: 'border-blue-500 text-blue-700 dark:text-blue-400' },
                    { id: 'DELEGATED', label: 'Delegate', color: 'border-indigo-500 text-indigo-700 dark:text-indigo-400' },
                    { id: 'ESCALATED', label: 'Escalate', color: 'border-amber-500 text-amber-700 dark:text-amber-400' },
                    { id: 'REJECTED', label: 'Reject', color: 'border-rose-500 text-rose-700 dark:text-rose-400' },
                  ].map((act) => (
                    <button
                      type="button"
                      key={act.id}
                      onClick={() => setApprovalDecision(act.id as any)}
                      className={`p-2 rounded-xl border text-[11px] font-bold text-center transition ${
                        approvalDecision === act.id
                          ? `bg-purple-50 dark:bg-purple-950/60 ${act.color} ring-2 ring-purple-400`
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>

              {approvalDecision === 'DELEGATED' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Delegate To (User / Role)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariq Rashid (Commercial Manager)"
                    value={delegateToUser}
                    onChange={(e) => setDelegateToUser(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Remarks / Justification {approvalDecision !== 'APPROVED' && <span className="text-rose-500">*</span>}
                </label>
                <textarea
                  rows={3}
                  required={approvalDecision !== 'APPROVED'}
                  placeholder="Enter audit remarks, compliance notes, or reason for return/rejection..."
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-sm"
                >
                  Confirm Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Approval Submission (Multi-Currency & Multi-Module) */}
      {showNewSubmissionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <Plus className="w-4 h-4 text-purple-600" />
                <span>Submit Enterprise Approval Request</span>
              </h3>
              <button onClick={() => setShowNewSubmissionModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleCreateSubmission} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Workflow Matrix</label>
                  <select
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="WF-PROC-PO">Purchase Order (PO)</option>
                    <option value="WF-PROC-PR">Material Requisition (MR)</option>
                    <option value="WF-COMM-RA">RA Bill Certification</option>
                    <option value="WF-FIN-CASH">Imprest Cash Request</option>
                    <option value="WF-HR-LEAVE">Staff Leave</option>
                    <option value="WF-QAQC-NCR">QA/QC Non-Conformance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Entity Reference ID</label>
                  <input
                    type="text"
                    required
                    value={subEntityId}
                    onChange={(e) => setSubEntityId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Request Title</label>
                <input
                  type="text"
                  required
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              {/* Multi-Currency Value Configuration */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount</label>
                  <input
                    type="number"
                    required
                    value={subAmount}
                    onChange={(e) => setSubAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Currency</label>
                  <select
                    value={subCurrency}
                    onChange={(e) => setSubCurrency(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="INR">INR (₹ Base)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="AED">AED (د.إ)</option>
                    <option value="SAR">SAR (﷼)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project</label>
                  <input
                    type="text"
                    value={subProject}
                    onChange={(e) => setSubProject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={subPriority}
                    onChange={(e) => setSubPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewSubmissionModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-sm"
                >
                  Submit for Approval Routing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Delegation */}
      {showDelegationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-purple-600" />
                <span>Register Authority Delegation</span>
              </h3>
              <button onClick={() => setShowDelegationModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleCreateDelegation} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Delegatee Name & Role</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Rashid (Commercial Manager)"
                  value={delName}
                  onChange={(e) => setDelName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Module Scope</label>
                <select
                  value={delScope}
                  onChange={(e) => setDelScope(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  <option value="ALL">All ERP Modules</option>
                  <option value="PROCUREMENT">Procurement Only</option>
                  <option value="FINANCE">Finance & Accounts Only</option>
                  <option value="HR">HR & Leave Only</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={delStart}
                    onChange={(e) => setDelStart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={delEnd}
                    onChange={(e) => setDelEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason / Justification</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Annual leave / Site audit trip"
                  value={delReason}
                  onChange={(e) => setDelReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowDelegationModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-sm"
                >
                  Activate Delegation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Announcement */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <Pin className="w-4 h-4 text-purple-600" />
                <span>Publish Broadcast Announcement</span>
              </h3>
              <button onClick={() => setShowAnnouncementModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Commercial Sign-Off Notice"
                  value={ancTitle}
                  onChange={(e) => setAncTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Content</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Announcement body text..."
                  value={ancContent}
                  onChange={(e) => setAncContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                <select
                  value={ancPriority}
                  onChange={(e) => setAncPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  <option value="NORMAL">NORMAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-sm"
                >
                  Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
