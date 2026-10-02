import React from 'react';
import {
  Activity,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Shield,
  Zap,
  Gauge,
  Building2,
} from 'lucide-react';
import { OperationsCommandCenterSummary } from '../../api/orchestration/orchestration.types';
import { NavTab } from '../layout/Sidebar';

interface OperationsCommandCenterViewProps {
  summary: OperationsCommandCenterSummary;
  onNavigateTab?: (tab: NavTab) => void;
  onSelectSubTab?: (subTab: string) => void;
}

export const OperationsCommandCenterView: React.FC<OperationsCommandCenterViewProps> = ({
  summary,
  onNavigateTab,
  onSelectSubTab,
}) => {
  const { overview, projectHealthRanking, criticalCorrelatedAlerts, urgentActionItems, aiOperationsInsight } = summary;

  return (
    <div id="operations-command-center-view" className="space-y-4">
      {/* 1. Executive Operations KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">System Health Index</span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-100 tracking-tight">{overview.overallSystemHealth}</span>
            <span className="text-xs text-slate-400">/100</span>
            <span className="text-xs text-emerald-400 font-bold ml-auto">NOMINAL</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${overview.overallSystemHealth}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Monitored Projects</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-100 tracking-tight">{overview.activeProjectsCount}</span>
            <span className="text-xs text-amber-400 font-semibold ml-auto">{overview.projectsAtRiskCount} at risk</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">EVM Critical Path Governed</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Active Correlated Alerts</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-100 tracking-tight">{overview.activeCorrelatedAlerts}</span>
            <span className="text-xs text-rose-400 font-bold ml-auto">HIGH PRIORITY</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Multi-Source Incident Correlation</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Open Action Center Tasks</span>
            <Zap className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-100 tracking-tight">{overview.openActionItems}</span>
            <span className="text-xs text-sky-400 font-bold ml-auto">ASSIGNED</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Cross-Module Workflow Engine</p>
        </div>
      </div>

      {/* 2. AI Operations Insight Executive Card (Phase 74 Connected) */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900/95 border border-indigo-500/30 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-100">Enterprise AI Operations Synthesis & Root Causes</h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30 font-semibold">
              CLASSIFICATION: {aiOperationsInsight.classification}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Updated: {new Date(aiOperationsInsight.generatedAt).toLocaleTimeString()}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">{aiOperationsInsight.narrative}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Identified Root Causes:</span>
            <ul className="space-y-1">
              {aiOperationsInsight.rootCauses.map((rc, idx) => (
                <li key={idx} className="text-slate-300 flex items-start gap-1.5">
                  <span className="text-indigo-400 font-bold shrink-0">•</span>
                  <span>{rc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Recommended Operational Priorities:</span>
            <ul className="space-y-1">
              {aiOperationsInsight.recommendedPriorities.map((rec, idx) => (
                <li key={idx} className="text-slate-300 flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Two Column Layout: Project Portfolio Health & Critical Correlated Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Project Health Portfolio List */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">Project Portfolio Health Scorecards</h3>
            </div>
            {onSelectSubTab && (
              <button
                onClick={() => onSelectSubTab('health')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                <span>Full Scorecards</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {projectHealthRanking.map((p) => (
              <div
                key={p.projectId}
                className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-slate-100 text-xs">{p.projectName}</span>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Code: {p.projectId} · SPI: {(p.dimensionScores.schedule / 100).toFixed(2)} · CPI: {(p.dimensionScores.cost / 100).toFixed(2)}
                    </div>
                  </div>

                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border shrink-0 ${
                    p.overallStatus === 'GREEN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    p.overallStatus === 'AMBER' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                    'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    {p.overallScore}% · {p.overallStatus}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      p.overallScore >= 85 ? 'bg-emerald-500' : p.overallScore >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${p.overallScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Correlated Alerts & Action Center preview */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-slate-100">Critical Cross-Module Incidents</h3>
            </div>
            {onSelectSubTab && (
              <button
                onClick={() => onSelectSubTab('alerts')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                <span>All Alerts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {criticalCorrelatedAlerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 space-y-1.5 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-100 truncate">{alert.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                    {alert.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{alert.impactAssessment}</p>
                <div className="text-[11px] text-emerald-400 font-medium">
                  Recommendation: {alert.recommendedAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
