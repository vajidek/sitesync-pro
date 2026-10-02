import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Layers,
  GitBranch,
  DollarSign,
  Users,
  Target,
  ShieldAlert,
  FileText,
  Plus,
  RefreshCw,
  Activity,
  Building2,
  ChevronRight,
  PieChart,
  Filter,
  Check,
  AlertCircle,
  HelpCircle,
  Briefcase
} from 'lucide-react';

export function EnterpriseProjectControlsModule() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cost_control' | 'wbs' | 'activities' | 'milestones' | 'resources' | 'progress' | 'lookahead' | 'governance'>('dashboard');
  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<any>(null);
  const [costControlData, setCostControlData] = useState<any>(null);
  const [wbsList, setWbsList] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [delays, setDelays] = useState<any[]>([]);
  const [risks, setRisks] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [lookahead, setLookahead] = useState<any[]>([]);

  // Modals
  const [showWbsModal, setShowWbsModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);

  // New Record Forms State
  const [newWbs, setNewWbs] = useState({ code: '', name: '', budgetAmount: 100000 });
  const [newAct, setNewAct] = useState({ activityCode: '', name: '', durationDays: 10, plannedStartDate: '2026-08-15', plannedEndDate: '2026-08-25', wbsId: 'wbs-001' });
  const [newMilestone, setNewMilestone] = useState({ name: '', targetDate: '2026-09-30', paymentPercentage: 10 });
  const [newDelay, setNewDelay] = useState({ description: '', delayDays: 3, delayCategory: 'CLIENT', impactOnCriticalPath: false });
  const [newRisk, setNewRisk] = useState({ title: '', category: 'SCHEDULE', probability: 3, impact: 3, mitigationStrategy: '' });

  const getToken = () => localStorage.getItem('token') || '';

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' };

      const [resStats, resCc, resWbs, resAct, resMs, resRes, resDly, resRsk, resIss, resLak] = await Promise.all([
        fetch('/api/project-controls/stats', { headers }),
        fetch('/api/project-controls/cost-control', { headers }),
        fetch('/api/project-controls/wbs', { headers }),
        fetch('/api/project-controls/activities', { headers }),
        fetch('/api/project-controls/milestones', { headers }),
        fetch('/api/project-controls/resources', { headers }),
        fetch('/api/project-controls/delays', { headers }),
        fetch('/api/project-controls/risks', { headers }),
        fetch('/api/project-controls/issues', { headers }),
        fetch('/api/project-controls/lookahead', { headers })
      ]);

      if (resStats.ok) setStats((await resStats.json()).data);
      if (resCc.ok) setCostControlData((await resCc.json()).data);
      if (resWbs.ok) setWbsList((await resWbs.json()).data || []);
      if (resAct.ok) setActivities((await resAct.json()).data || []);
      if (resMs.ok) setMilestones((await resMs.json()).data || []);
      if (resRes.ok) setResources((await resRes.json()).data || []);
      if (resDly.ok) setDelays((await resDly.json()).data || []);
      if (resRsk.ok) setRisks((await resRsk.json()).data || []);
      if (resIss.ok) setIssues((await resIss.json()).data || []);
      if (resLak.ok) setLookahead((await resLak.json()).data || []);
    } catch (err) {
      console.error('Error fetching project controls data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleCreateWbs = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/project-controls/wbs', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newWbs)
      });
      if (res.ok) {
        setShowWbsModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/project-controls/activities', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newAct)
      });
      if (res.ok) {
        setShowActivityModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/project-controls/milestones', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newMilestone)
      });
      if (res.ok) {
        setShowMilestoneModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDelay = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/project-controls/delays', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newDelay)
      });
      if (res.ok) {
        setShowDelayModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/project-controls/risks', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newRisk)
      });
      if (res.ok) {
        setShowRiskModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-900 space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full uppercase tracking-wider">
              PRJ-101 | Al Reem Mechanical Piping Hub
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-md">
              Baseline V1.0 Active
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Enterprise Project Planning, Scheduling & Project Controls
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Primavera P6 / MS Project Compatible CPM Scheduling, Earned Value Management (EVM), S-Curves & Risk Registers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors border border-slate-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
          <button
            onClick={() => setShowActivityModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add CPM Activity
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Planned vs Actual */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Progress %</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {stats ? `${stats.actualProgressPercent}%` : '51.2%'}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>Target:</span>
              <span className="font-semibold text-slate-700">{stats ? `${stats.plannedProgressPercent}%` : '54.5%'}</span>
              <span className="text-rose-600 font-medium">(-3.3%)</span>
            </div>
          </div>
        </div>

        {/* SPI Index */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Schedule Index (SPI)</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">
              {stats ? stats.spi : '0.94'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {stats && stats.spi < 1.0 ? 'Behind Schedule (EV < PV)' : 'On Schedule'}
            </div>
          </div>
        </div>

        {/* CPI Index */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cost Index (CPI)</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">
              {stats ? stats.cpi : '1.03'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {stats && stats.cpi >= 1.0 ? 'Under Budget (EV > AC)' : 'Over Cost'}
            </div>
          </div>
        </div>

        {/* Critical Path Activities */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Critical Activities</span>
            <GitBranch className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-600">
              {stats ? stats.criticalActivities : '3'} / {stats ? stats.totalActivities : '4'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Zero Float Precedences
            </div>
          </div>
        </div>

        {/* Open Delays / Risks */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Project Delays & Risks</span>
            <ShieldAlert className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-700 flex items-center gap-2">
              <span>{stats ? stats.totalDelays : '1'} Delays</span>
              <span className="text-sm font-medium text-slate-400">|</span>
              <span className="text-rose-600">{stats ? stats.openRisks : '1'} Risks</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Impact Analyzed via CPM
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 bg-white px-4 rounded-xl shadow-sm">
        <nav className="flex space-x-6 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Executive Dashboard & EVM', icon: BarChart3 },
            { id: 'cost_control', label: 'Multi-Dimensional Cost Control', icon: DollarSign },
            { id: 'wbs', label: 'WBS & Work Packages', icon: Layers },
            { id: 'activities', label: 'CPM Activity Register', icon: GitBranch },
            { id: 'milestones', label: 'Milestones & Baselines', icon: Target },
            { id: 'resources', label: 'Resource Assignments', icon: Users },
            { id: 'progress', label: 'EVM Progress & S-Curve', icon: TrendingUp },
            { id: 'lookahead', label: 'Lookahead & Delays', icon: Calendar },
            { id: 'governance', label: 'Risks, Issues & Changes', icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB 1: EXECUTIVE DASHBOARD & EVM */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* EVM Earned Value Overview */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Earned Value Management (EVM) Core
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">Planned Value (PV)</span>
                  <span className="text-base font-bold text-slate-900">$2,725,000</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-800">Earned Value (EV)</span>
                  <span className="text-base font-bold text-blue-900">$2,560,000</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                  <span className="text-sm font-medium text-emerald-800">Actual Cost (AC)</span>
                  <span className="text-base font-bold text-emerald-900">$2,480,000</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-sm font-medium text-amber-900">Schedule Variance (SV = EV - PV)</span>
                  <span className="text-base font-bold text-amber-700">-$165,000 (Behind)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="text-sm font-medium text-emerald-900">Cost Variance (CV = EV - AC)</span>
                  <span className="text-base font-bold text-emerald-700">+$80,000 (Under Budget)</span>
                </div>
              </div>
            </div>

            {/* S-Curve Graph Placeholder */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 lg:col-span-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Project Planned vs. Actual Cumulative S-Curve
                  </h2>
                  <p className="text-xs text-slate-500">
                    Cumulative Progress Baseline vs Actual Work Accomplishment
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                    <span>Planned S-Curve</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                    <span>Actual S-Curve</span>
                  </div>
                </div>
              </div>

              {/* Graphical Canvas Placeholder */}
              <div className="h-56 bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 flex flex-col justify-end relative overflow-hidden">
                <div className="absolute inset-x-8 bottom-6 top-8 flex items-end justify-between opacity-80">
                  {/* Mock S-Curve SVG paths */}
                  <svg className="w-full h-full overflow-visible">
                    {/* Planned line */}
                    <path
                      d="M 0 180 Q 150 140 300 80 T 600 10"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3"
                      strokeDasharray="6 3"
                    />
                    {/* Actual line */}
                    <path
                      d="M 0 180 Q 150 150 300 95"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                    />
                  </svg>
                </div>
                <div className="flex justify-between text-xs text-slate-400 border-t border-slate-200 pt-2 z-10">
                  <span>Jan 2026</span>
                  <span>Mar 2026</span>
                  <span>May 2026</span>
                  <span>Jul 2026</span>
                  <span>Sep 2026</span>
                  <span>Nov 2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gantt Schedule Timeline Placeholder */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-slate-700" />
                Critical Path Gantt Timeline Overview
              </h2>
              <span className="text-xs text-rose-600 font-semibold bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                Red Bars = Critical Path Activities (Zero Float)
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-28">Activity Code</th>
                    <th className="p-3 w-64">Activity Description</th>
                    <th className="p-3 w-20">Dur</th>
                    <th className="p-3 w-24">Early Start</th>
                    <th className="p-3 w-24">Early Finish</th>
                    <th className="p-3 w-20">Float</th>
                    <th className="p-3">Schedule Timeline Bar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {activities.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-800">{act.activityCode}</td>
                      <td className="p-3 font-medium text-slate-900">{act.name}</td>
                      <td className="p-3">{act.durationDays}d</td>
                      <td className="p-3 text-slate-500">{act.plannedStartDate}</td>
                      <td className="p-3 text-slate-500">{act.plannedEndDate}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-bold ${act.isCritical ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'}`}>
                          {act.totalFloat || 0}d
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="w-full bg-slate-100 h-4 rounded relative overflow-hidden">
                          <div
                            className={`h-full rounded ${act.isCritical ? 'bg-rose-500' : 'bg-blue-500'}`}
                            style={{
                              marginLeft: `${act.activityCode === 'A1010' ? '0%' : act.activityCode === 'A1020' ? '25%' : act.activityCode === 'A1030' ? '50%' : '75%'}`,
                              width: `${Math.max(15, act.durationDays * 2)}%`
                            }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: MULTI-DIMENSIONAL PROJECT COST CONTROL (Budget vs Committed vs Actual vs Certified vs Revenue vs Forecast) */}
      {activeTab === 'cost_control' && (
        <div className="space-y-6">
          {/* Executive Cost Control Metric Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Baseline Budget</span>
              <p className="text-xl font-bold text-slate-900 mt-1">
                ${(costControlData?.summary?.totalBudget || 0).toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-500 mt-1 block">Contract Master Baseline</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Committed Cost</span>
              <p className="text-xl font-bold text-indigo-700 mt-1">
                ${(costControlData?.summary?.totalCommitted || 0).toLocaleString()}
              </p>
              <span className="text-[11px] text-indigo-600/80 mt-1 block">
                {costControlData?.summary?.committedPercentage || 0}% of Budget (POs + Subs)
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Actual Incurred</span>
              <p className="text-xl font-bold text-amber-700 mt-1">
                ${(costControlData?.summary?.totalActual || 0).toLocaleString()}
              </p>
              <span className="text-[11px] text-amber-600/80 mt-1 block">
                {costControlData?.summary?.actualPercentage || 0}% spent (GRN + Site + Plant)
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">Certified Work</span>
              <p className="text-xl font-bold text-teal-700 mt-1">
                ${(costControlData?.summary?.totalCertified || 0).toLocaleString()}
              </p>
              <span className="text-[11px] text-teal-600/80 mt-1 block">Verified subcontractor bills</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Billed Revenue</span>
              <p className="text-xl font-bold text-emerald-700 mt-1">
                ${(costControlData?.summary?.totalRevenue || 0).toLocaleString()}
              </p>
              <span className="text-[11px] text-emerald-600/80 mt-1 block">Client IPC & AR Invoices</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Estimate at Completion</span>
              <p className="text-xl font-bold text-purple-700 mt-1">
                ${(costControlData?.summary?.totalEAC || 0).toLocaleString()}
              </p>
              <span className={`text-[11px] font-semibold mt-1 block ${(costControlData?.summary?.totalVarianceAtCompletion || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                VAC: {(costControlData?.summary?.totalVarianceAtCompletion || 0) >= 0 ? '+' : ''}${(costControlData?.summary?.totalVarianceAtCompletion || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Integration Audit Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Multi-Dimensional Project Cost Control Engine</h4>
                <p className="text-xs text-slate-600">
                  Real-time synchronization across Purchase Orders (Committed), Stores GRN/Issues (Actuals), Subcontract RA Bills (Certified), and Client IPCs (Revenue).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-slate-700 font-medium">
                Overall CPI: <strong className="text-blue-600">{costControlData?.summary?.overallCPI || 1.0}</strong>
              </span>
              <span className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-slate-700 font-medium">
                Daily Burn Rate: <strong className="text-amber-600">${(costControlData?.summary?.burnRateUSDPerDay || 0).toLocaleString()}/day</strong>
              </span>
            </div>
          </div>

          {/* Cost Control Matrix Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">WBS & Work Package Cost Performance Matrix</h3>
                <p className="text-xs text-slate-500">Live breakdown of budget variance, commitment utilization, and forecast to complete</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchData}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh Control Matrix
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">WBS Package</th>
                    <th className="py-3 px-3 text-right">Baseline Budget</th>
                    <th className="py-3 px-3 text-right">Committed</th>
                    <th className="py-3 px-3 text-right">Actual Incurred</th>
                    <th className="py-3 px-3 text-right">Certified</th>
                    <th className="py-3 px-3 text-right">Billed Revenue</th>
                    <th className="py-3 px-3 text-right">Earned Value</th>
                    <th className="py-3 px-3 text-right">Cost Variance</th>
                    <th className="py-3 px-3 text-right">EAC Forecast</th>
                    <th className="py-3 px-3 text-center">CPI</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {(costControlData?.wbsBreakdown || []).map((row: any) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-sans font-medium text-slate-900">
                        <div className="font-semibold">{row.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{row.wbsCode} • {row.wbsNumber}</div>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-800 font-semibold">
                        ${row.budget.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-indigo-700">
                        ${row.committedCost.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-amber-700 font-semibold">
                        ${row.actualCost.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-teal-700">
                        ${row.certifiedCost.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-700">
                        ${row.billedRevenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-blue-700">
                        ${row.earnedValue.toLocaleString()}
                      </td>
                      <td className={`py-3 px-3 text-right font-semibold ${row.costVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {row.costVariance >= 0 ? '+' : ''}${row.costVariance.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-purple-700 font-semibold">
                        ${row.estimateAtCompletion.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${row.cpi >= 1.0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                          {row.cpi}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          row.costStatus === 'UNDER_BUDGET'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.costStatus === 'COST_OVERRUN'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {row.costStatus.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WBS & WORK PACKAGES */}
      {activeTab === 'wbs' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Work Breakdown Structure (WBS) & Packages</h2>
              <p className="text-xs text-slate-500">Multi-level hierarchical decomposition of project deliverables</p>
            </div>
            <button
              onClick={() => setShowWbsModal(true)}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
            >
              + Create WBS Element
            </button>
          </div>

          <div className="space-y-4">
            {wbsList.map((wbs) => (
              <div key={wbs.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-slate-200 text-slate-800 text-xs font-mono font-bold rounded">
                      {wbs.code}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{wbs.name}</h3>
                    <span className="text-xs text-slate-400 font-mono">({wbs.wbsNumber})</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-700">
                    Budget: ${wbs.budgetAmount?.toLocaleString() || '0'}
                  </div>
                </div>
                <p className="text-xs text-slate-600">{wbs.description}</p>

                {/* Sub Work Packages */}
                <div className="mt-3 pl-6 border-l-2 border-slate-200 space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Subordinated Work Packages
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-blue-600">WP-2.1</span>
                        <span className="ml-2 font-medium text-slate-800">Main Intake Pipe Delivery</span>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold">IN_PROGRESS</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CPM ACTIVITY REGISTER */}
      {activeTab === 'activities' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Critical Path Method (CPM) Activity Register</h2>
              <p className="text-xs text-slate-500">Activities, Durations, Early/Late Dates & Float Calculation</p>
            </div>
            <button
              onClick={() => setShowActivityModal(true)}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
            >
              + Add CPM Activity
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Act Code</th>
                  <th className="p-3">Activity Name</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Planned Dates</th>
                  <th className="p-3">Total Float</th>
                  <th className="p-3">Critical?</th>
                  <th className="p-3">Progress %</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {activities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-800">{act.activityCode}</td>
                    <td className="p-3 font-medium text-slate-900">{act.name}</td>
                    <td className="p-3 font-semibold">{act.durationDays} Days</td>
                    <td className="p-3 text-slate-500">{act.plannedStartDate} to {act.plannedEndDate}</td>
                    <td className="p-3 font-bold text-slate-700">{act.totalFloat || 0}d</td>
                    <td className="p-3">
                      {act.isCritical ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded">YES</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded">NO</span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-blue-600">{act.percentComplete}%</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded font-semibold ${
                        act.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        act.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {act.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: MILESTONES & BASELINES */}
      {activeTab === 'milestones' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Contract Key Milestones</h2>
              <button
                onClick={() => setShowMilestoneModal(true)}
                className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
              >
                + Add Milestone
              </button>
            </div>
            <div className="space-y-3">
              {milestones.map((ms) => (
                <div key={ms.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-600">{ms.milestoneNumber}</span>
                      <h4 className="text-sm font-bold text-slate-900">{ms.name}</h4>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Target Date: <span className="font-semibold">{ms.targetDate}</span> | Payment Release: <span className="font-semibold text-emerald-700">{ms.paymentPercentage}%</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    ms.status === 'ACHIEVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {ms.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Baselines Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Approved Master Baseline Schedules</h2>
            <div className="p-4 border border-blue-200 bg-blue-50/50 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">
                  BL-2026-0001 (Active)
                </span>
                <span className="text-xs text-blue-800 font-semibold">Approved Jan 15, 2026</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">Approved Contract Master Schedule Baseline V1.0</h4>
              <p className="text-xs text-slate-600">
                Authorized by Lead Project Director. Baseline Duration: 210 Days | Total Budget: $5,000,000
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: RESOURCE ASSIGNMENTS */}
      {activeTab === 'resources' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Resource Library & Activity Assignments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((res) => (
              <div key={res.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-500">{res.resourceCode}</span>
                  <h4 className="text-sm font-bold text-slate-900">{res.name}</h4>
                  <span className="text-xs text-slate-500">Type: {res.type} | Unit: {res.unitOfMeasure}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-600">${res.unitRate}/unit</div>
                  <div className="text-xs text-slate-400">Cap: {res.capacityPerDay}/day</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: LOOKAHEAD & DELAYS */}
      {activeTab === 'lookahead' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lookahead */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">3-Week Lookahead Plans</h2>
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-blue-600">LAK-2026-0001</span>
                <span className="text-emerald-700">Status: READY</span>
              </div>
              <div className="text-sm font-semibold text-slate-800">
                Aug 15, 2026 to Sep 05, 2026
              </div>
              <p className="text-xs text-slate-500">
                6 Planned Activities Ready for Site Execution with Zero Precedence Constraint Blocks.
              </p>
            </div>
          </div>

          {/* Delays Register */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Project Delay Event Register</h2>
              <button
                onClick={() => setShowDelayModal(true)}
                className="px-3.5 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700"
              >
                + Log Delay
              </button>
            </div>
            <div className="space-y-3">
              {delays.map((dly) => (
                <div key={dly.id} className="p-4 border border-rose-200 bg-rose-50/40 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-rose-700">{dly.delayNumber} ({dly.delayCategory})</span>
                    <span className="text-rose-800">{dly.delayDays} Days Delay</span>
                  </div>
                  <p className="text-xs font-medium text-slate-800">{dly.description}</p>
                  <p className="text-xs text-slate-500">
                    Mitigation: <span className="font-semibold text-slate-700">{dly.mitigationPlan || 'None'}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: GOVERNANCE (RISKS & ISSUES) */}
      {activeTab === 'governance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risks */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Schedule & Cost Risk Register</h2>
              <button
                onClick={() => setShowRiskModal(true)}
                className="px-3.5 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700"
              >
                + Log Risk
              </button>
            </div>
            <div className="space-y-3">
              {risks.map((rsk) => (
                <div key={rsk.id} className="p-4 border border-amber-200 bg-amber-50/40 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-amber-800">{rsk.riskNumber} | {rsk.category}</span>
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded">Risk Score: {rsk.riskScore}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{rsk.title}</h4>
                  <p className="text-xs text-slate-600">Mitigation: {rsk.mitigationStrategy}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Issues */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Active Site Issues & Technical Blockers</h2>
            <div className="space-y-3">
              {issues.map((iss) => (
                <div key={iss.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-blue-600">{iss.issueNumber}</span>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded">{iss.priority}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{iss.title}</h4>
                  <p className="text-xs text-slate-500">Assigned To: {iss.assignedTo}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD WBS */}
      {showWbsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Create New WBS Element</h3>
            <form onSubmit={handleCreateWbs} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">WBS Code (e.g., 4.0)</label>
                <input
                  type="text"
                  required
                  value={newWbs.code}
                  onChange={(e) => setNewWbs({ ...newWbs, code: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">WBS Element Name</label>
                <input
                  type="text"
                  required
                  value={newWbs.name}
                  onChange={(e) => setNewWbs({ ...newWbs, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Budget Amount ($)</label>
                <input
                  type="number"
                  required
                  value={newWbs.budgetAmount}
                  onChange={(e) => setNewWbs({ ...newWbs, budgetAmount: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWbsModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ACTIVITY */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add CPM Schedule Activity</h3>
            <form onSubmit={handleCreateActivity} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Activity Code (e.g. A1050)</label>
                <input
                  type="text"
                  required
                  value={newAct.activityCode}
                  onChange={(e) => setNewAct({ ...newAct, activityCode: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Activity Description</label>
                <input
                  type="text"
                  required
                  value={newAct.name}
                  onChange={(e) => setNewAct({ ...newAct, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Duration (Days)</label>
                <input
                  type="number"
                  required
                  value={newAct.durationDays}
                  onChange={(e) => setNewAct({ ...newAct, durationDays: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                >
                  Add Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD MILESTONE */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add Key Contract Milestone</h3>
            <form onSubmit={handleCreateMilestone} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Milestone Name</label>
                <input
                  type="text"
                  required
                  value={newMilestone.name}
                  onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Target Date</label>
                <input
                  type="date"
                  required
                  value={newMilestone.targetDate}
                  onChange={(e) => setNewMilestone({ ...newMilestone, targetDate: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Payment Release (%)</label>
                <input
                  type="number"
                  required
                  value={newMilestone.paymentPercentage}
                  onChange={(e) => setNewMilestone({ ...newMilestone, paymentPercentage: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMilestoneModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG DELAY */}
      {showDelayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Log Project Delay Event</h3>
            <form onSubmit={handleCreateDelay} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Delay Description</label>
                <input
                  type="text"
                  required
                  value={newDelay.description}
                  onChange={(e) => setNewDelay({ ...newDelay, description: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Delay Duration (Days)</label>
                <input
                  type="number"
                  required
                  value={newDelay.delayDays}
                  onChange={(e) => setNewDelay({ ...newDelay, delayDays: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="critImp"
                  checked={newDelay.impactOnCriticalPath}
                  onChange={(e) => setNewDelay({ ...newDelay, impactOnCriticalPath: e.target.checked })}
                />
                <label htmlFor="critImp" className="font-semibold text-rose-700">Impacts Critical Path Schedule</label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDelayModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 font-semibold"
                >
                  Log Delay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG RISK */}
      {showRiskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Log Project Schedule / Cost Risk</h3>
            <form onSubmit={handleCreateRisk} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Risk Title</label>
                <input
                  type="text"
                  required
                  value={newRisk.title}
                  onChange={(e) => setNewRisk({ ...newRisk, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Mitigation Strategy</label>
                <textarea
                  required
                  value={newRisk.mitigationStrategy}
                  onChange={(e) => setNewRisk({ ...newRisk, mitigationStrategy: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                  rows={3}
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRiskModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 font-semibold"
                >
                  Record Risk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
