import React from 'react';
import {
  Users,
  Wrench,
  Truck,
  Building2,
  AlertTriangle,
  BarChart3,
  DollarSign,
  Layers,
  Clock,
  TrendingUp,
  CheckCircle2,
  PieChart as PieIcon,
  ArrowUpRight
} from 'lucide-react';

interface DashboardTabProps {
  kpis: any;
  allocations: any[];
  requests: any[];
  conflicts: any[];
  costs: any[];
  onNavigateTab: (tab: string) => void;
}

export const ResourceDashboardTab: React.FC<DashboardTabProps> = ({
  kpis,
  allocations,
  requests,
  conflicts,
  costs,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Resource Plans</span>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{kpis?.totalPlans || 0}</span>
            <span className="text-xs font-medium text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              {kpis?.activePlans || 0} Active
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Project & department allocation plans</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Allocations</span>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{kpis?.activeAllocations || 0}</span>
            <span className="text-xs text-slate-400">/ {kpis?.totalAllocations || 0} Total</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Machinery, Fleet & Personnel assigned</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Open Conflicts</span>
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-400">{kpis?.openConflicts || 0}</span>
            <span className="text-xs text-rose-400/80 font-medium">Action Required</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Over-allocations & date overlaps</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Est. Monthly Cost</span>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">AED {(kpis?.totalMonthlyCost || 78500).toLocaleString()}</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Avg Utilization: {kpis?.averageUtilization || 85}%</p>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Allocations List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-semibold text-white">Recent Resource Allocations</h3>
              <p className="text-xs text-slate-400">Live deployment of plant, fleet, and manpower across sites</p>
            </div>
            <button
              onClick={() => onNavigateTab('allocation')}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {allocations.slice(0, 5).map((alloc) => (
              <div
                key={alloc.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-slate-800/60 border border-slate-800 hover:border-slate-700 transition-colors gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    {alloc.resourceType === 'EQUIPMENT' ? <Wrench className="w-4 h-4" /> :
                     alloc.resourceType === 'VEHICLE' ? <Truck className="w-4 h-4" /> :
                     <Users className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{alloc.resourceId}</span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-slate-700 text-slate-300">
                        {alloc.resourceType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Project: <span className="text-slate-200">{alloc.projectId || 'Central Department'}</span> • Qty: {alloc.allocatedQty}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-mono block">{alloc.startDate} → {alloc.endDate}</span>
                    <span className="text-[11px] font-medium text-emerald-400">{alloc.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conflicts & Pending Requests */}
        <div className="space-y-6">
          {/* Open Conflicts Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Conflict Monitor
              </h3>
              <button onClick={() => onNavigateTab('conflicts')} className="text-xs text-indigo-400 hover:text-indigo-300">
                Resolve
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {conflicts.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center">No active resource conflicts detected.</div>
              ) : (
                conflicts.slice(0, 3).map((conf) => (
                  <div key={conf.id} className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs">
                    <div className="flex items-center justify-between text-rose-300 font-semibold mb-1">
                      <span>{conf.conflictType}</span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-[10px] uppercase">{conf.severity}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{conf.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Requests */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Pending Requests ({requests.filter(r => r.status === 'PENDING').length})
              </h3>
              <button onClick={() => onNavigateTab('requests')} className="text-xs text-indigo-400 hover:text-indigo-300">
                Manage
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {requests.slice(0, 3).map((req) => (
                <div key={req.id} className="p-3 bg-slate-800/50 border border-slate-800 rounded-lg text-xs">
                  <div className="flex items-center justify-between text-white font-medium mb-1">
                    <span className="truncate max-w-[180px]">{req.title}</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] uppercase font-semibold">
                      {req.priority}
                    </span>
                  </div>
                  <div className="text-slate-400 flex items-center justify-between mt-1">
                    <span>Project: {req.projectId}</span>
                    <span className="font-mono text-[10px]">{req.requiredStartDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
