import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Clock,
  DollarSign,
  Package,
  Wrench,
  Activity,
  Users,
  FileText,
  HeartHandshake,
  CheckCircle2,
  RefreshCw,
  Info,
  ChevronRight,
} from 'lucide-react';
import { ProjectHealthScorecard, ProjectHealthStatus, RiskLevel } from '../../api/orchestration/orchestration.types';

interface ProjectHealthPanelProps {
  scorecards: ProjectHealthScorecard[];
  onRecalculate?: (projectId: string) => Promise<void>;
}

export const ProjectHealthPanel: React.FC<ProjectHealthPanelProps> = ({ scorecards, onRecalculate }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(scorecards[0]?.projectId || 'PRJ-101');
  const [isRecalculating, setIsRecalculating] = useState(false);

  const selectedProject = scorecards.find((p) => p.projectId === selectedProjectId) || scorecards[0];

  const getStatusColor = (status: ProjectHealthStatus) => {
    switch (status) {
      case 'GREEN':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'AMBER':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'RED':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'CRITICAL':
        return 'text-rose-300 bg-rose-950/80 border-rose-500 ring-2 ring-rose-500/30 animate-pulse';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'LOW':
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  const handleRecalculate = async () => {
    if (!onRecalculate || !selectedProject) return;
    setIsRecalculating(true);
    try {
      await onRecalculate(selectedProject.projectId);
    } finally {
      setIsRecalculating(false);
    }
  };

  if (!selectedProject) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        No project health records available.
      </div>
    );
  }

  const dimensions = [
    { label: 'Schedule (SPI)', score: selectedProject.dimensionScores.schedule, risk: selectedProject.risks.scheduleRisk, icon: Clock, weight: '20%' },
    { label: 'Cost & EVM (CPI)', score: selectedProject.dimensionScores.cost, risk: selectedProject.risks.costRisk, icon: DollarSign, weight: '20%' },
    { label: 'Strategic Procurement', score: selectedProject.dimensionScores.procurement, risk: selectedProject.risks.procurementRisk, icon: Package, weight: '12%' },
    { label: 'QA/QC Quality Index', score: selectedProject.dimensionScores.qaqc, risk: selectedProject.risks.qualityRisk, icon: ShieldCheck, weight: '12%' },
    { label: 'HSE & Safety Standards', score: selectedProject.dimensionScores.hse, risk: selectedProject.risks.safetyRisk, icon: Activity, weight: '12%' },
    { label: 'Cash Flow & Working Capital', score: selectedProject.dimensionScores.cashFlow, risk: 'LOW' as RiskLevel, icon: DollarSign, weight: '8%' },
    { label: 'Equipment & Machinery (EAM)', score: selectedProject.dimensionScores.equipment, risk: selectedProject.risks.equipmentRisk, icon: Wrench, weight: '6%' },
    { label: 'Manpower & Labor Health', score: selectedProject.dimensionScores.manpower, risk: selectedProject.risks.manpowerRisk, icon: Users, weight: '4%' },
    { label: 'Document & Engineering (EDMS)', score: selectedProject.dimensionScores.document, risk: 'LOW' as RiskLevel, icon: FileText, weight: '3%' },
    { label: 'Client Satisfaction (CRM)', score: selectedProject.dimensionScores.client, risk: selectedProject.risks.clientRisk, icon: HeartHandshake, weight: '3%' },
  ];

  return (
    <div id="project-health-panel" className="space-y-4">
      {/* Project Selector Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto">
          {scorecards.map((p) => (
            <button
              key={p.projectId}
              onClick={() => setSelectedProjectId(p.projectId)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 shrink-0 ${
                selectedProjectId === p.projectId
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <span>{p.projectId}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                p.overallStatus === 'GREEN' ? 'bg-emerald-950 text-emerald-300' :
                p.overallStatus === 'AMBER' ? 'bg-amber-950 text-amber-300' : 'bg-rose-950 text-rose-300'
              }`}>
                {p.overallScore}%
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={handleRecalculate}
          disabled={isRecalculating}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition border border-slate-700 shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
          <span>Recalculate Health Engine</span>
        </button>
      </div>

      {/* Selected Project Overview Card */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-semibold text-slate-100">{selectedProject.projectName}</h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getStatusColor(selectedProject.overallStatus)}`}>
                {selectedProject.overallStatus} STATUS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Project Code: <strong className="text-slate-200">{selectedProject.projectId}</strong> · Deterministic EVM Weighted Scoring Model
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-black text-slate-100 tracking-tight">
                {selectedProject.overallScore}
                <span className="text-sm font-normal text-slate-400">/100</span>
              </div>
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Composite Health Index</div>
            </div>

            <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
              <div className={`text-xl font-bold ${
                selectedProject.overallScore >= 85 ? 'text-emerald-400' :
                selectedProject.overallScore >= 70 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {selectedProject.overallScore >= 85 ? 'A' : selectedProject.overallScore >= 70 ? 'B' : 'C'}
              </div>
            </div>
          </div>
        </div>

        {/* 11-Dimension Health Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
          {dimensions.map((dim, idx) => {
            const Icon = dim.icon;
            return (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="truncate max-w-[110px]" title={dim.label}>{dim.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{dim.weight}</span>
                </div>

                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg font-bold text-slate-100">{dim.score}%</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${getRiskBadge(dim.risk)}`}>
                    {dim.risk}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      dim.score >= 85 ? 'bg-emerald-500' : dim.score >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Narrative & Calculation Footnote */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              <strong>Deterministic Calculation Policy:</strong> Health indexes are calculated strictly from verified ERP transaction data (EVM CPI/SPI, SCADA alarm logs, NCR open cycles, HSE permit states).
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono shrink-0">
            Calculated: {new Date(selectedProject.lastCalculatedAt).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};
