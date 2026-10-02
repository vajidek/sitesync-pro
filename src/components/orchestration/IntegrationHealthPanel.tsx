import React, { useState } from 'react';
import {
  Activity,
  Server,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCw,
  Cpu,
  Zap,
  Gauge,
  Clock,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { IntegrationModuleHealth, SourceModule } from '../../api/orchestration/orchestration.types';

interface IntegrationHealthPanelProps {
  healthList: IntegrationModuleHealth[];
  onRefresh: () => void;
  isLoading: boolean;
}

export const IntegrationHealthPanel: React.FC<IntegrationHealthPanelProps> = ({
  healthList,
  onRefresh,
  isLoading,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered = healthList.filter((m) => {
    if (filterStatus !== 'ALL' && m.healthStatus !== filterStatus) return false;
    return true;
  });

  const totalInbound = healthList.reduce((acc, m) => acc + m.eventsInbound24h, 0);
  const totalOutbound = healthList.reduce((acc, m) => acc + m.eventsOutbound24h, 0);
  const totalFailed = healthList.reduce((acc, m) => acc + m.failedEvents24h, 0);
  const avgLatency = Math.round(
    healthList.reduce((acc, m) => acc + m.avgProcessingLatencyMs, 0) / (healthList.length || 1)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'DEGRADED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'OFFLINE':
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div id="integration-health-panel" className="space-y-4">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>24h Inbound Events</span>
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{totalInbound.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-medium">100% Ingestion Rate</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>24h Dispatched Actions</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{totalOutbound.toLocaleString()}</div>
          <div className="text-[11px] text-sky-400 mt-1 font-medium">Cross-Module Flow</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Average Bus Latency</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{avgLatency} ms</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-medium">Sub-50ms SLA Target</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Dead-Letter Failures</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{totalFailed}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Bounded Retry Active</div>
        </div>
      </div>

      {/* Filter and Refresh Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-100">Enterprise ERP Module Integration Topology</h3>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 text-xs text-slate-300 px-3 py-1.5 rounded-lg focus:outline-none"
          >
            <option value="ALL">All Health States</option>
            <option value="HEALTHY">Healthy</option>
            <option value="DEGRADED">Degraded</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition border border-slate-700 disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Health Probe</span>
          </button>
        </div>
      </div>

      {/* 17 Modules Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((mod) => (
          <div
            key={mod.moduleCode}
            className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition space-y-2.5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-100">{mod.moduleName}</h4>
                <span className="font-mono text-[11px] text-slate-400">{mod.moduleCode}</span>
              </div>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${getStatusBadge(mod.healthStatus)}`}>
                {mod.healthStatus}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center font-mono">
              <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                <div className="text-xs font-bold text-slate-200">{mod.eventsInbound24h}</div>
                <div className="text-[10px] text-slate-500">Inbound</div>
              </div>
              <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                <div className="text-xs font-bold text-slate-200">{mod.eventsOutbound24h}</div>
                <div className="text-[10px] text-slate-500">Outbound</div>
              </div>
              <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                <div className="text-xs font-bold text-slate-200">{mod.avgProcessingLatencyMs}ms</div>
                <div className="text-[10px] text-slate-500">Latency</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Last Event: {new Date(mod.lastEventTimestamp).toLocaleTimeString()}</span>
              <span>Queue: {mod.queueDepth}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
