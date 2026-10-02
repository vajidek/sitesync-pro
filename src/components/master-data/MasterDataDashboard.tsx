// ============================================================================
// PHASE 76: MASTER DATA MANAGEMENT - EXECUTIVE DASHBOARD
// ============================================================================

import React, { useState } from 'react';
import {
  Database,
  ShieldCheck,
  Sparkles,
  GitMerge,
  AlertTriangle,
  Layers,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  FileCheck,
  Scale,
  Lock,
  ArrowUpRight,
  Filter,
  BarChart3,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import {
  MDMStatsSummary,
  MasterDomainCode,
  QualityDimension,
} from '../../api/master-data/master_data.types';

interface MasterDataDashboardProps {
  stats: MDMStatsSummary | null;
  onSelectDomain: (domainCode: MasterDomainCode) => void;
  onNavigateTab: (tab: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const MasterDataDashboard: React.FC<MasterDataDashboardProps> = ({
  stats,
  onSelectDomain,
  onNavigateTab,
  onRefresh,
  isLoading,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3 text-slate-500">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
          <span>Loading Enterprise Master Data & Governance Analytics...</span>
        </div>
      </div>
    );
  }

  const dimensionLabels: Record<QualityDimension, string> = {
    COMPLETENESS: 'Completeness',
    ACCURACY: 'Accuracy',
    CONSISTENCY: 'Consistency',
    UNIQUENESS: 'Uniqueness',
    VALIDITY: 'Validity',
    TIMELINESS: 'Timeliness',
    REFERENTIAL: 'Referential Integrity',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Master Records
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.totalMasterRecords.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-0.5" />
              {stats.activeMasterRecords} Active
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Across {stats.domainsMonitored} Enterprise Domains
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Data Quality Index
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.averageQualityScore}%
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              Target: 95.0%
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Weighted across 7 deterministic dimensions
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Duplicate Review Queue
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <GitMerge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.duplicateCandidatesCount}
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              Pending Resolution
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {stats.goldenRecordsCount} Golden Records established
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Governance & Compliance
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.governanceComplianceScore}%
            </span>
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
              {stats.pendingChangeApprovalsCount} Approvals Pending
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Statutory retention & legal hold active
          </p>
        </div>
      </div>

      {/* Quality Dimensions Radar Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Data Quality Dimensions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deterministic scoring weights
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('quality')}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
            >
              Scan Rules <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {Object.entries(stats.qualityDimensionAverages).map(([dim, rawScore]) => {
              const score = typeof rawScore === 'number' ? rawScore : Number(rawScore) || 0;
              const label = dimensionLabels[dim as QualityDimension] || dim;
              const isHigh = score >= 95;
              const isGood = score >= 85 && score < 95;
              return (
                <div key={dim} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {label}
                    </span>
                    <span
                      className={`font-semibold ${
                        isHigh
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isGood
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {score}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh
                          ? 'bg-emerald-500'
                          : isGood
                          ? 'bg-indigo-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Domain Health Scorecards Grid */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Domain Health Scorecards
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                17 Authoritative Master Domains
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('registry')}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
            >
              View Full Registry <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {stats.domainScorecards.map((card) => {
              const isExcellent = card.qualityScore >= 95;
              const isGood = card.qualityScore >= 85 && card.qualityScore < 95;
              const isWarning = card.qualityScore < 85;

              return (
                <div
                  key={card.domainCode}
                  onClick={() => {
                    onSelectDomain(card.domainCode);
                    onNavigateTab('registry');
                  }}
                  className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {card.domainName}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {card.domainCode}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isExcellent
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : isGood
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {card.qualityScore}% Quality
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
                    <span>{card.recordsCount} Records</span>
                    <div className="flex items-center space-x-2">
                      {card.duplicateCount > 0 && (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          {card.duplicateCount} Dupes
                        </span>
                      )}
                      {card.openIssuesCount > 0 && (
                        <span className="text-rose-600 dark:text-rose-400 font-medium">
                          {card.openIssuesCount} Issues
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actionable Quick Links Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateTab('duplicates')}
          className="p-4 bg-linear-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl cursor-pointer hover:border-amber-500/40 transition"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <GitMerge className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Duplicate Review & Golden Records
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {stats.duplicateCandidatesCount} candidate pairs pending steward action
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('reconciliation')}
          className="p-4 bg-linear-to-r from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-xl cursor-pointer hover:border-indigo-500/40 transition"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Cross-Module Reconciliation
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Multi-system sync across Procurement, Finance, HR & EAM
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('governance')}
          className="p-4 bg-linear-to-r from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl cursor-pointer hover:border-purple-500/40 transition"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Data Stewards & Retention
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Statutory policies, legal holds & change approvals
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
