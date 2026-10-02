// ============================================================================
// PHASE 76: MASTER DATA MANAGEMENT - RECONCILIATION PANEL
// ============================================================================

import React, { useState } from 'react';
import {
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Search,
  Filter,
  Play,
  ArrowRight,
  Clock,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import {
  ReconciliationJobItem,
  MasterDomainCode,
  MasterDomainSummary,
} from '../../api/master-data/master_data.types';

interface ReconciliationPanelProps {
  jobs: ReconciliationJobItem[];
  domains: MasterDomainSummary[];
  onTriggerReconciliation: (domainCode: MasterDomainCode) => Promise<void>;
  isLoading: boolean;
}

export const ReconciliationPanel: React.FC<ReconciliationPanelProps> = ({
  jobs,
  domains,
  onTriggerReconciliation,
  isLoading,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<MasterDomainCode>('VENDORS');
  const [activeJob, setActiveJob] = useState<ReconciliationJobItem | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);

  const handleTrigger = async () => {
    setIsTriggering(true);
    try {
      await onTriggerReconciliation(selectedDomain);
    } catch (err: any) {
      alert(`Reconciliation trigger failed: ${err.message}`);
    } finally {
      setIsTriggering(false);
    }
  };

  const latestJob = jobs[0] || null;

  return (
    <div className="space-y-6">
      {/* Header & Trigger Action Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Cross-Module Multi-System Reconciliation
            </h2>
            <p className="text-xs text-slate-500">
              Synchronizes authoritative canonical master data with Procurement, Finance, HR, EAM & Operations
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value as MasterDomainCode)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold"
          >
            {domains.map((d) => (
              <option key={d.domainCode} value={d.domainCode}>
                {d.displayName} ({d.domainCode})
              </option>
            ))}
          </select>

          <button
            onClick={handleTrigger}
            disabled={isTriggering || isLoading}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition"
          >
            <Play className={`w-3.5 h-3.5 ${isTriggering ? 'animate-spin' : ''}`} />
            <span>Run Reconciliation Scan</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Job History vs Job Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jobs List Column */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Reconciliation History
            </span>
            <span className="text-xs font-mono text-slate-500">{jobs.length} jobs</span>
          </div>

          {jobs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No reconciliation scans recorded yet.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
              {jobs.map((job) => {
                const isSelected = (activeJob?.id || latestJob?.id) === job.id;
                const isComplete = job.status === 'COMPLETED';
                const hasDiscrepancies = job.discrepanciesCount > 0;

                return (
                  <div
                    key={job.id}
                    onClick={() => setActiveJob(job)}
                    className={`p-3 rounded-lg border transition cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
                        {job.jobCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          hasDiscrepancies
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {hasDiscrepancies ? `${job.discrepanciesCount} Discrepancies` : '100% In Sync'}
                      </span>
                    </div>

                    <div className="mt-2 text-xs space-y-1 text-slate-700 dark:text-slate-300">
                      <div className="font-semibold">
                        Domain: {job.domainCode}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {job.recordsScannedCount} Records • {job.participatingModules.length} Modules
                      </div>
                    </div>

                    <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                      <span>{new Date(job.startTime).toLocaleString()}</span>
                      <span className="uppercase">{job.triggerType}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Job Detail & Discrepancies Column */}
        <div className="lg:col-span-2 space-y-4">
          {(activeJob || latestJob) ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-5">
              {/* Job Stats Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Records Scanned</span>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {(activeJob || latestJob)?.recordsScannedCount}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Perfect Matches</span>
                  <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {(activeJob || latestJob)?.matchedRecordsCount}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Discrepancies</span>
                  <div className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                    {(activeJob || latestJob)?.discrepanciesCount}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Orphan Entities</span>
                  <div className="text-base font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                    {(activeJob || latestJob)?.orphanEntitiesCount}
                  </div>
                </div>
              </div>

              {/* Participating Modules Pills */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Participating ERP Subsystems:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(activeJob || latestJob)?.participatingModules.map((m) => (
                    <span
                      key={m}
                      className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-medium"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Discrepancies Breakdown Table */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Detailed Discrepancy Findings
                </h3>

                {(activeJob || latestJob)?.discrepancies.length === 0 ? (
                  <div className="p-6 text-center text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-1.5 text-emerald-500" />
                    All master records match transactional entities with 100% integrity.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                    {(activeJob || latestJob)?.discrepancies.map((d, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {d.canonicalId}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              d.severity === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : d.severity === 'HIGH'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                            }`}
                          >
                            {d.severity}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-400 block font-semibold">Subsystem</span>
                            <span className="font-mono font-medium">{d.targetModule}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-semibold">Discrepancy Field</span>
                            <span className="font-mono font-medium text-slate-900 dark:text-white">
                              {d.fieldName}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-semibold">Master Canonical Value</span>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400">
                              {String(d.masterValue)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-semibold">Subsystem Local Value</span>
                            <span className="font-mono text-rose-600 dark:text-rose-400">
                              {String(d.targetValue)}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-[11px] text-slate-500 font-medium">
                          Remediation Action: {d.remediationAction}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400 text-xs">
              Select a reconciliation scan from the history list to view discrepancies.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
