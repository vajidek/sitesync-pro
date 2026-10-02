import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Calendar,
  DollarSign,
  Activity,
  Plus,
  Search,
  Filter,
  Eye,
  TrendingUp,
  Gauge,
  Cpu,
  FileCheck,
  FileSpreadsheet,
  RefreshCw,
  Zap,
  Award,
  BarChart3,
  Sliders,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AssetManagementView, Asset } from './AssetManagementView';

export const EnterpriseAssetManagementModule: React.FC = () => {
  const [activeModuleView, setActiveModuleView] = useState<
    'DASHBOARD' | 'ASSETS' | 'WORK_ORDERS' | 'PREVENTIVE' | 'BREAKDOWNS' | 'TELEMETRY' | 'CALIBRATION_INSPECTION' | 'COSTS'
  >('DASHBOARD');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [criticalityMatrix, setCriticalityMatrix] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [pmPlans, setPmPlans] = useState<any[]>([]);
  const [breakdowns, setBreakdowns] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [calibrations, setCalibrations] = useState<any[]>([]);
  const [inspections, setInspections] = useState<any[]>([]);
  const [costs, setCosts] = useState<any[]>([]);

  // Create Work Order Modal State
  const [isWoModalOpen, setIsWoModalOpen] = useState(false);
  const [woTitle, setWoTitle] = useState('');
  const [woType, setWoType] = useState('PREVENTIVE');
  const [woPriority, setWoPriority] = useState('HIGH_P2');
  const [woAssetId, setWoAssetId] = useState('');
  const [woAssignedTo, setWoAssignedTo] = useState('Sr. Electromechanical Lead');
  const [woPlannedStart, setWoPlannedStart] = useState('2026-08-20');
  const [woPlannedEnd, setWoPlannedEnd] = useState('2026-08-21');
  const [woLaborCost, setWoLaborCost] = useState(600);
  const [woPartsCost, setWoPartsCost] = useState(1200);

  // Create Breakdown Modal State
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
  const [bdAssetId, setBdAssetId] = useState('');
  const [bdSymptoms, setBdSymptoms] = useState('');
  const [bdSeverity, setBdSeverity] = useState('CRITICAL_STOPPAGE');
  const [bdReportedBy, setBdReportedBy] = useState('Shift Engineer - Omar Farooq');

  // Create PM Plan Modal State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planTitle, setPlanTitle] = useState('');
  const [planAssetId, setPlanAssetId] = useState('');
  const [planIntervalDays, setPlanIntervalDays] = useState(30);
  const [planEstimatedCost, setPlanEstimatedCost] = useState(1800);

  const getAuthHeader = () => {
    const token =
      localStorage.getItem('sitesync_jwt_access_token') ||
      localStorage.getItem('sitesync_access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const headers = { 'Content-Type': 'application/json', ...getAuthHeader() };

      const [
        statsRes,
        assetsRes,
        catsRes,
        locsRes,
        critRes,
        woRes,
        plansRes,
        bdRes,
        teleRes,
        calRes,
        inspRes,
        costRes,
      ] = await Promise.all([
        fetch('/api/eam/stats', { headers }).then((r) => r.json()).catch(() => ({ data: null })),
        fetch('/api/assets', { headers }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch('/api/eam/categories', { headers }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch('/api/eam/locations', { headers }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch('/api/eam/criticality', { headers }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch('/api/workorders', { headers }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch('/api/eam/plans', { headers }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch('/api/maintenance/breakdowns', { headers }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch('/api/eam/telemetry', { headers }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch('/api/calibration', { headers }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch('/api/inspection', { headers }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch('/api/eam/costs', { headers }).then((r) => r.json()).catch(() => ({ data: [] })),
      ]);

      if (statsRes?.data) setStats(statsRes.data);
      if (assetsRes?.data) {
        setAssets(assetsRes.data);
        if (assetsRes.data[0]) {
          setWoAssetId(assetsRes.data[0].id);
          setBdAssetId(assetsRes.data[0].id);
          setPlanAssetId(assetsRes.data[0].id);
        }
      }
      if (catsRes?.data) setCategories(catsRes.data);
      if (locsRes?.data) setLocations(locsRes.data);
      if (critRes?.data) setCriticalityMatrix(critRes.data);
      if (woRes?.data) setWorkOrders(woRes.data);
      if (plansRes?.data) setPmPlans(plansRes.data);
      if (bdRes?.data) setBreakdowns(bdRes.data);
      if (teleRes?.data) setTelemetry(teleRes.data);
      if (calRes?.data) setCalibrations(calRes.data);
      if (inspRes?.data) setInspections(inspRes.data);
      if (costRes?.data) setCosts(costRes.data);
    } catch (err) {
      console.error('Error fetching EAM data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAsset = async (data: any) => {
    await fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    await fetchData();
  };

  const handleUpdateAssetStatus = async (id: string, status: string) => {
    await fetch(`/api/assets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status }),
    });
    await fetchData();
  };

  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!woTitle || !woAssetId) return;

    await fetch('/api/workorders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({
        title: woTitle,
        workOrderType: woType,
        priority: woPriority,
        assetId: woAssetId,
        assignedTo: woAssignedTo,
        plannedStartDate: woPlannedStart,
        plannedEndDate: woPlannedEnd,
        totalLaborCostAed: Number(woLaborCost) || 0,
        totalPartsCostAed: Number(woPartsCost) || 0,
        status: 'OPEN',
      }),
    });

    setIsWoModalOpen(false);
    setWoTitle('');
    await fetchData();
  };

  const handleCreateBreakdown = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bdAssetId || !bdSymptoms) return;

    const now = new Date();
    await fetch('/api/maintenance/breakdowns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({
        assetId: bdAssetId,
        breakdownDate: now.toISOString().slice(0, 10),
        breakdownTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reportedBy: bdReportedBy,
        initialSymptoms: bdSymptoms,
        severity: bdSeverity,
        productionImpact: 'LINE_HALTED',
        status: 'REPORTED',
      }),
    });

    setIsBreakdownModalOpen(false);
    setBdSymptoms('');
    await fetchData();
  };

  const handleCreatePmPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTitle || !planAssetId) return;

    await fetch('/api/eam/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({
        planTitle,
        assetId: planAssetId,
        frequencyType: 'TIME_BASED',
        intervalDays: Number(planIntervalDays) || 30,
        estimatedCostAed: Number(planEstimatedCost) || 1500,
        status: 'ACTIVE',
      }),
    });

    setIsPlanModalOpen(false);
    setPlanTitle('');
    await fetchData();
  };

  const handleUpdateWoStatus = async (id: string, status: string) => {
    await fetch(`/api/workorders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status }),
    });
    await fetchData();
  };

  return (
    <div id="eam-main-module-container" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-md">
            <Wrench className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                PHASE 71 ENTERPRISE CMMS & EAM
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live Fleet Telemetry Active
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Enterprise Asset Management & Plant Maintenance
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive equipment master, RCM criticality scoring, automated PM scheduling, MTBF/MTTR telemetry & statutory compliance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="btn-eam-refresh"
            onClick={fetchData}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            id="btn-report-breakdown-banner"
            onClick={() => setIsBreakdownModalOpen(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Report Stoppage
          </button>

          <button
            id="btn-new-work-order-banner"
            onClick={() => setIsWoModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Work Order
          </button>
        </div>
      </div>

      {/* Main Module Nav Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'DASHBOARD', label: 'Executive CMMS Dashboard', icon: BarChart3 },
          { id: 'ASSETS', label: 'Asset Register & Hierarchy', icon: Layers },
          { id: 'WORK_ORDERS', label: 'Work Orders Register', icon: Wrench },
          { id: 'PREVENTIVE', label: 'Preventive Maintenance Plans', icon: Calendar },
          { id: 'BREAKDOWNS', label: 'Breakdowns & Downtime', icon: AlertTriangle },
          { id: 'TELEMETRY', label: 'Condition Monitoring & IoT', icon: Activity },
          { id: 'CALIBRATION_INSPECTION', label: 'Calibration & Inspections', icon: Award },
          { id: 'COSTS', label: 'Maintenance Cost Analytics', icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeModuleView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveModuleView(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* VIEW 1: EXECUTIVE DASHBOARD */}
      {activeModuleView === 'DASHBOARD' && (
        <div className="space-y-6">
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Total Fleet Equipment</span>
                <Layers className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
                {stats?.totalAssets || assets.length} <span className="text-xs font-normal text-slate-400">Units</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {stats?.operationalAssets || assets.filter((a) => a.status === 'OPERATIONAL').length} Operational
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Fleet Net Book Value</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
                AED {((stats?.totalFleetValueAed || 7238000) / 1000000).toFixed(2)}M
              </div>
              <div className="text-[11px] text-slate-400 mt-2">Capitalized Enterprise Assets</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Fleet Availability</span>
                <Gauge className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2 font-mono">
                {stats?.kpis?.availabilityPercent || 96.8}%
              </div>
              <div className="text-[11px] text-slate-500 mt-2">Target Benchmark: &ge;95.0%</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Reliability Index</span>
                <Shield className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2 font-mono">
                {stats?.kpis?.reliabilityPercent || 98.4}%
              </div>
              <div className="text-[11px] text-slate-500 mt-2">RCM Operational Score</div>
            </div>
          </div>

          {/* Secondary KPIs: MTBF, MTTR, PM Compliance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-blue-800/50 flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-blue-300 font-bold block">Mean Time Between Failures</span>
                <div className="text-3xl font-black font-mono text-white mt-1">
                  {stats?.kpis?.mtbfHours || 4680} <span className="text-sm font-normal text-blue-200">Operating Hours</span>
                </div>
              </div>
              <p className="text-[11px] text-blue-200/80 mt-4">
                Measures the continuous uptime resilience between unplanned equipment breakdowns.
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-amber-800/50 flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-300 font-bold block">Mean Time To Repair (MTTR)</span>
                <div className="text-3xl font-black font-mono text-white mt-1">
                  {stats?.kpis?.mttrHours || 4.2} <span className="text-sm font-normal text-amber-200">Hours to Recovery</span>
                </div>
              </div>
              <p className="text-[11px] text-amber-200/80 mt-4">
                Average duration to diagnose, supply spare components, repair and re-commission to service.
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-emerald-800/50 flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold block">Preventive Schedule Compliance</span>
                <div className="text-3xl font-black font-mono text-white mt-1">95.4%</div>
              </div>
              <p className="text-[11px] text-emerald-200/80 mt-4">
                Percentage of scheduled preventive work orders completed within tolerance window.
              </p>
            </div>
          </div>

          {/* Quick Overview Tables: Recent Work Orders & Live Telemetry Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Work Orders */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-500" />
                  Active Plant Work Orders
                </h3>
                <button
                  onClick={() => setActiveModuleView('WORK_ORDERS')}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  View All ({workOrders.length})
                </button>
              </div>

              <div className="space-y-3">
                {workOrders.slice(0, 4).map((wo) => (
                  <div
                    key={wo.id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-blue-600">{wo.workOrderNumber}</span>
                        <span className="font-semibold text-slate-900 dark:text-white line-clamp-1">{wo.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 mt-1 text-[11px]">
                        <span>Assigned: {wo.assignedTo}</span>
                        <span>•</span>
                        <span className="font-mono">AED {wo.totalCostAed?.toLocaleString()}</span>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                        wo.status === 'COMPLETED'
                          ? 'bg-emerald-500/15 text-emerald-600'
                          : wo.status === 'IN_PROGRESS'
                          ? 'bg-amber-500/15 text-amber-600'
                          : 'bg-blue-500/15 text-blue-600'
                      }`}
                    >
                      {wo.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Condition Monitoring Alarms */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  Condition Monitoring Telemetry Gauges
                </h3>
                <button
                  onClick={() => setActiveModuleView('TELEMETRY')}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Full Telemetry Suite
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {telemetry.slice(0, 4).map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5"
                  >
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold line-clamp-1">
                      {t.parameterName}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black font-mono text-slate-900 dark:text-white">{t.parameterValue}</span>
                      <span className="text-xs font-semibold text-slate-500">{t.unit}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400">Sensor: {t.sensorId}</span>
                      <span
                        className={`font-bold ${
                          t.alertSeverity === 'CRITICAL_ALARM'
                            ? 'text-rose-600'
                            : t.alertSeverity === 'WARNING'
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {t.alertSeverity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ASSET REGISTER */}
      {activeModuleView === 'ASSETS' && (
        <AssetManagementView
          assets={assets}
          categories={categories}
          locations={locations}
          criticalityMatrix={criticalityMatrix}
          onRefresh={fetchData}
          onCreateAsset={handleCreateAsset}
          onUpdateAssetStatus={handleUpdateAssetStatus}
        />
      )}

      {/* VIEW 3: WORK ORDERS REGISTER */}
      {activeModuleView === 'WORK_ORDERS' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                Work Orders Management Register
              </h3>
              <p className="text-xs text-slate-500">
                Track preventive maintenance tasks, emergency work orders, labor allocation and spare parts requisition
              </p>
            </div>

            <button
              onClick={() => setIsWoModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Generate Work Order
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">Work Order</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Target Asset</th>
                  <th className="px-4 py-3">Assigned Lead</th>
                  <th className="px-4 py-3">Total Cost</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {workOrders.map((wo) => {
                  const targetAsset = assets.find((a) => a.id === wo.assetId);
                  return (
                    <tr key={wo.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white">{wo.title}</div>
                        <div className="font-mono text-[11px] text-blue-600 font-bold">{wo.workOrderNumber}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {wo.workOrderType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-bold text-[11px] ${
                            wo.priority === 'CRITICAL_P1'
                              ? 'text-rose-600'
                              : wo.priority === 'HIGH_P2'
                              ? 'text-amber-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {wo.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {targetAsset?.assetName || wo.assetId}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{wo.assignedTo}</td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-600">
                        AED {wo.totalCostAed?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            wo.status === 'COMPLETED'
                              ? 'bg-emerald-500/15 text-emerald-600'
                              : wo.status === 'IN_PROGRESS'
                              ? 'bg-amber-500/15 text-amber-600'
                              : 'bg-blue-500/15 text-blue-600'
                          }`}
                        >
                          {wo.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {wo.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleUpdateWoStatus(wo.id, 'COMPLETED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold"
                          >
                            Mark Done
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: PREVENTIVE MAINTENANCE PLANS */}
      {activeModuleView === 'PREVENTIVE' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Preventive Maintenance Plans & Schedules
              </h3>
              <p className="text-xs text-slate-500">
                Recurring time & running-hour interval maintenance templates, checklists and safety SOP protocols
              </p>
            </div>

            <button
              onClick={() => setIsPlanModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New PM Protocol
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pmPlans.map((p) => {
              const targetAsset = assets.find((a) => a.id === p.assetId);
              return (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-600">{p.planCode}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                        {p.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{p.planTitle}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">Asset: {targetAsset?.assetName || 'General Fleet'}</p>
                  </div>

                  <div className="space-y-1.5 text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Frequency:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">Every {p.intervalDays} Days</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Est. Duration:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{p.estimatedDurationHours} Hours</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Est. Budget:</span>
                      <span className="font-mono font-bold text-emerald-600">AED {p.estimatedCostAed?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setWoTitle(`PM Trigger: ${p.planTitle}`);
                        setWoAssetId(p.assetId || assets[0]?.id || '');
                        setIsWoModalOpen(true);
                      }}
                      className="w-full py-2 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition-colors"
                    >
                      Trigger Work Order Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 5: BREAKDOWNS & DOWNTIME */}
      {activeModuleView === 'BREAKDOWNS' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                Unplanned Breakdown Reports & Downtime Analytics
              </h3>
              <p className="text-xs text-slate-500">
                Log critical stoppage events, calculate production loss hours and initiate emergency repair work orders
              </p>
            </div>

            <button
              onClick={() => setIsBreakdownModalOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Report Incident
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {breakdowns.map((bd) => {
              const targetAsset = assets.find((a) => a.id === bd.assetId);
              return (
                <div
                  key={bd.id}
                  className="p-5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-rose-600">{bd.breakdownNumber}</span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-700 dark:text-rose-300">
                      {bd.severity}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{targetAsset?.assetName || bd.assetId}</h4>
                    <p className="text-xs text-rose-800 dark:text-rose-300 font-medium mt-1">"{bd.initialSymptoms}"</p>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-rose-200/50 dark:border-rose-900/50">
                    <div className="flex justify-between">
                      <span>Reported By:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{bd.reportedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Timestamp:</span>
                      <span className="font-mono">{bd.breakdownDate} at {bd.breakdownTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Production Impact:</span>
                      <span className="font-bold text-rose-600">{bd.productionImpact}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 6: CONDITION MONITORING & TELEMETRY */}
      {activeModuleView === 'TELEMETRY' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              Live Sensor Telemetry & Condition-Based Monitoring (CBM)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Continuous IoT sensor ingestion (vibration velocity RMS, oil temperatures, pump pressures and line currents)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {telemetry.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-slate-500">{t.sensorId}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.alertSeverity === 'CRITICAL_ALARM'
                        ? 'bg-rose-500/20 text-rose-600 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-600'
                    }`}
                  >
                    {t.alertSeverity}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block line-clamp-1">
                    {t.parameterName}
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">{t.parameterValue}</span>
                    <span className="text-xs font-bold text-slate-500">{t.unit}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 flex justify-between">
                  <span>Threshold Limit:</span>
                  <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{t.thresholdMax} {t.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 7: CALIBRATION & STATUTORY INSPECTIONS */}
      {activeModuleView === 'CALIBRATION_INSPECTION' && (
        <div className="space-y-6">
          {/* Calibrations Table */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Instrument & Surveying Calibration Register (ISO/IEC 17025)
                </h3>
                <p className="text-xs text-slate-500">Traceable master calibration certificates and next calibration due date alarms</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3">Certificate & Instrument</th>
                    <th className="px-4 py-3">Calibrated Agency</th>
                    <th className="px-4 py-3">Calibrated Date</th>
                    <th className="px-4 py-3">Next Due Date</th>
                    <th className="px-4 py-3">Uncertainty</th>
                    <th className="px-4 py-3">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {calibrations.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white">{c.instrumentName}</div>
                        <div className="font-mono text-[11px] text-amber-600 font-bold">{c.certificateNumber}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{c.calibrationAgency}</td>
                      <td className="px-4 py-3 font-mono">{c.calibratedDate}</td>
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">{c.nextDueDate}</td>
                      <td className="px-4 py-3 font-mono">{c.uncertaintyMeasurement}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600">
                          {c.resultStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inspections Table */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-500" />
                  Statutory Third-Party Crane & Plant Inspection Register
                </h3>
                <p className="text-xs text-slate-500">UAE Federal Law 8, BS 7121 and ASME B30.5 statutory proof-load certificates</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3">Inspection # & Standard</th>
                    <th className="px-4 py-3">Inspector Agency</th>
                    <th className="px-4 py-3">Date Tested</th>
                    <th className="px-4 py-3">Next Inspection</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {inspections.map((i) => (
                    <tr key={i.id}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white">{i.complianceStandard}</div>
                        <div className="font-mono text-[11px] text-blue-600 font-bold">{i.inspectionNumber}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{i.inspectorName}</td>
                      <td className="px-4 py-3 font-mono">{i.inspectionDate}</td>
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">{i.nextInspectionDate}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">{i.overallRating}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600">
                          {i.passStatus ? 'PASSED & CERTIFIED' : 'FAILED'}
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

      {/* VIEW 8: MAINTENANCE COSTS */}
      {activeModuleView === 'COSTS' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Maintenance Budget vs Actual Expenditure Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Preventive maintenance vs emergency repair labor, spare parts and external vendor cost variances
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/50">
              <span className="text-xs text-slate-500 block">Preventive Maintenance</span>
              <div className="text-xl font-bold font-mono text-blue-600 mt-1">AED 4,860</div>
            </div>
            <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-900/50">
              <span className="text-xs text-slate-500 block">Emergency Corrective Repairs</span>
              <div className="text-xl font-bold font-mono text-rose-600 mt-1">AED 2,340</div>
            </div>
            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/50">
              <span className="text-xs text-slate-500 block">Spare Parts Consumed</span>
              <div className="text-xl font-bold font-mono text-amber-600 mt-1">AED 4,200</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/50">
              <span className="text-xs text-slate-500 block">Budget Variance (Favorable)</span>
              <div className="text-xl font-bold font-mono text-emerald-600 mt-1">+ AED 1,940</div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE WORK ORDER MODAL */}
      <AnimatePresence>
        {isWoModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  Create Maintenance Work Order
                </h3>
                <button onClick={() => setIsWoModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateWorkOrder} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Work Order Title *</label>
                  <input
                    type="text"
                    required
                    value={woTitle}
                    onChange={(e) => setWoTitle(e.target.value)}
                    placeholder="e.g. 500-Hour Hydraulic Pressure Overhaul"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Type</label>
                    <select
                      value={woType}
                      onChange={(e) => setWoType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="PREVENTIVE">Preventive</option>
                      <option value="CORRECTIVE_BREAKDOWN">Corrective Breakdown</option>
                      <option value="EMERGENCY">Emergency</option>
                      <option value="CALIBRATION">Calibration</option>
                      <option value="INSPECTION">Inspection</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                    <select
                      value={woPriority}
                      onChange={(e) => setWoPriority(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="CRITICAL_P1">P1 - Critical Stoppage</option>
                      <option value="HIGH_P2">P2 - High Priority</option>
                      <option value="MEDIUM_P3">P3 - Medium</option>
                      <option value="LOW_P4">P4 - Routine Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Asset *</label>
                  <select
                    value={woAssetId}
                    onChange={(e) => setWoAssetId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.assetCode} - {a.assetName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Labor Cost (AED)</label>
                    <input
                      type="number"
                      value={woLaborCost}
                      onChange={(e) => setWoLaborCost(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Parts Cost (AED)</label>
                    <input
                      type="number"
                      value={woPartsCost}
                      onChange={(e) => setWoPartsCost(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsWoModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                  >
                    Dispatch Work Order
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE BREAKDOWN MODAL */}
      <AnimatePresence>
        {isBreakdownModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-rose-50 dark:bg-rose-950/30 flex justify-between items-center">
                <h3 className="font-bold text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Report Equipment Stoppage / Incident
                </h3>
                <button onClick={() => setIsBreakdownModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateBreakdown} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Affected Asset *</label>
                  <select
                    value={bdAssetId}
                    onChange={(e) => setBdAssetId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.assetCode} - {a.assetName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Observed Symptoms / Failure Details *</label>
                  <textarea
                    rows={3}
                    required
                    value={bdSymptoms}
                    onChange={(e) => setBdSymptoms(e.target.value)}
                    placeholder="Describe sudden pressure loss, smoke, vibration or hydraulic oil leak..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Severity</label>
                    <select
                      value={bdSeverity}
                      onChange={(e) => setBdSeverity(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="CRITICAL_STOPPAGE">Critical Stoppage</option>
                      <option value="MAJOR_DEGRADATION">Major Degradation</option>
                      <option value="MINOR_ISSUE">Minor Issue</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reported By</label>
                    <input
                      type="text"
                      value={bdReportedBy}
                      onChange={(e) => setBdReportedBy(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsBreakdownModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold"
                  >
                    File Emergency Report
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE PM PLAN MODAL */}
      <AnimatePresence>
        {isPlanModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-indigo-50 dark:bg-indigo-950/30 flex justify-between items-center">
                <h3 className="font-bold text-sm text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Define Preventive Maintenance Protocol
                </h3>
                <button onClick={() => setIsPlanModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePmPlan} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Protocol Title *</label>
                  <input
                    type="text"
                    required
                    value={planTitle}
                    onChange={(e) => setPlanTitle(e.target.value)}
                    placeholder="e.g. Monthly S-Tube Clearance & Lube Service"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Asset</label>
                  <select
                    value={planAssetId}
                    onChange={(e) => setPlanAssetId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.assetCode} - {a.assetName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Interval Cadence (Days)</label>
                    <input
                      type="number"
                      value={planIntervalDays}
                      onChange={(e) => setPlanIntervalDays(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Est. Cost (AED)</label>
                    <input
                      type="number"
                      value={planEstimatedCost}
                      onChange={(e) => setPlanEstimatedCost(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsPlanModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                  >
                    Save Protocol
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
