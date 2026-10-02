import React, { useState, useEffect } from 'react';
import { safeJson } from '../../lib/safeFetch';
import {
  WATER_PROJECTS,
  WATER_METRICS,
  WATER_PROJECT_TYPES
} from '../../data/waterInfrastructureData';
import { WaterProjectDashboardMetrics } from '../../types/waterInfrastructureEngine';
import {
  Activity,
  Droplets,
  Wrench,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  FileCheck2,
  TrendingUp,
  Cpu,
  BarChart3,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface Props {
  onSelectSubTab: (tab: string) => void;
}

export const WaterProjectDashboard: React.FC<Props> = ({ onSelectSubTab }) => {
  const [metrics, setMetrics] = useState<WaterProjectDashboardMetrics>(WATER_METRICS);
  const [projects, setProjects] = useState(WATER_PROJECTS);
  const [selectedProjectType, setSelectedProjectType] = useState<string>('ALL');

  useEffect(() => {
    fetch('/api/kwa/dashboard-metrics')
      .then((res) => safeJson(res))
      .then((data) => {
        if (data?.success && data.data) {
          setMetrics(data.data);
        }
      })
      .catch(() => {});

    fetch('/api/kwa/projects')
      .then((res) => safeJson(res))
      .then((data) => {
        if (data?.success && data.data) {
          setProjects(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const filteredProjects = selectedProjectType === 'ALL'
    ? projects
    : projects.filter((p) => p.type === selectedProjectType);

  return (
    <div className="space-y-6">
      {/* Executive Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-6 pointer-events-none">
          <Droplets className="w-80 h-80 text-blue-400" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center space-x-2 text-blue-300 font-semibold text-xs tracking-wider uppercase mb-2">
            <span className="px-2.5 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Water Infrastructure Division
            </span>
            <span>•</span>
            <span>AMRUT & Water Mission Projects</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Water Infrastructure & Mechanical Engineering Control
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Real-time monitoring of Water Treatment Plants (WTP), Service Reservoirs (OHSR/GLSR), Pumping Mains, MS/DI Pipeline chainages, valve registers, hydrostatic testing, and SCADA automation.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => onSelectSubTab('pipelines')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition flex items-center space-x-1.5"
            >
              <Activity className="w-4 h-4" />
              <span>Track Pipeline Chainages</span>
            </button>
            <button
              onClick={() => onSelectSubTab('valves')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold shadow transition flex items-center space-x-1.5"
            >
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Valve Register & Actuators</span>
            </button>
            <button
              onClick={() => onSelectSubTab('testing')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold shadow transition flex items-center space-x-1.5"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>Hydro & Pressure Testing</span>
            </button>
            <button
              onClick={() => onSelectSubTab('dpr')}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow transition flex items-center space-x-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Log Daily Site Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Key Performance Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Active Pipelines</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {metrics.activePipelineLengthKm || metrics.activeKWAPipelinesKms} <span className="text-xs text-slate-500 font-normal">km laid</span>
            </h3>
            <span className="inline-flex items-center text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium">
              MS, DI & HDPE Pipelines
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 rounded-xl">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Valves Installed</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {metrics.totalValvesInstalled} <span className="text-xs text-slate-500 font-normal">units</span>
            </h3>
            <span className="inline-flex items-center text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
              BFV, Sluice & Air Valves
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 rounded-xl">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pumps & Flow Meters</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {metrics.pumpsInstalledCount} Pumps / {metrics.flowMetersInstalled} FM
            </h3>
            <span className="inline-flex items-center text-[11px] text-cyan-600 dark:text-cyan-400 mt-1 font-medium">
              Intake & Clear Water Sump
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Testing Progress</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {metrics.overallTestingProgress}%
            </h3>
            <span className="inline-flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              Hydro & Pressure Verified
            </span>
          </div>
        </div>
      </div>

      {/* Progress Breakdown by Discipline */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Multi-Disciplinary Water Infrastructure Progress
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Execution status across Civil, Mechanical, Electrical, and Hydro Testing
            </p>
          </div>
          <div className="px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold border border-blue-200 dark:border-blue-800 self-start sm:self-auto">
            Status: {metrics.commissioningStatus}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          {/* Civil */}
          <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Civil & Structural Progress</span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{metrics.overallCivilProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${metrics.overallCivilProgress}%` }} />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">WTP Sump, Aerator, Valve Chambers & Pipe Trenching</p>
          </div>

          {/* Mechanical */}
          <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mechanical Progress</span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{metrics.overallMechanicalProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${metrics.overallMechanicalProgress}%` }} />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">MS/DI Pipelaying, Jointing, Valve Fitting & Pump Erection</p>
          </div>

          {/* Electrical & SCADA */}
          <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Electrical & SCADA Progress</span>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{metrics.overallElectricalProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${metrics.overallElectricalProgress}%` }} />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">PLC Panels, Actuator Wiring, Flow Telemetry & Motors</p>
          </div>

          {/* Testing */}
          <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Hydro Testing & Quality</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{metrics.overallTestingProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${metrics.overallTestingProgress}%` }} />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Reach Pressure Holding Test & Official Approval Witness</p>
          </div>
        </div>
      </div>

      {/* Project Filter & List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Water Infrastructure Projects Register
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Filtered list of water supply schemes, treatment plants, and pumping mains
            </p>
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-500">Project Type:</span>
            <select
              value={selectedProjectType}
              onChange={(e) => setSelectedProjectType(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Project Types</option>
              {WATER_PROJECT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 sm:p-6">
          {filteredProjects.map((prj: any) => (
            <div
              key={prj.id}
              className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 transition shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold rounded-md uppercase tracking-wide border border-blue-200 dark:border-blue-800">
                    {prj.type}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-500">
                    {prj.code}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2.5 leading-snug">
                  {prj.name}
                </h4>

                <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                    <span>{prj.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2Icon className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span>{prj.client}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-400">Total Completion</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{prj.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${prj.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Spec Footer */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="block text-slate-400 text-[10px]">Pipelaying</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{prj.laidLengthKM || prj.laidLengthKm || 0} / {prj.totalLengthKM || prj.totalLengthKm || 0} km</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="block text-slate-400 text-[10px]">Valves</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{prj.valveCountInstalled || 62} Units</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="block text-slate-400 text-[10px]">Budget</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{prj.budgetINR}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function Building2Icon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0H7m4 0v10" />
    </svg>
  );
};
