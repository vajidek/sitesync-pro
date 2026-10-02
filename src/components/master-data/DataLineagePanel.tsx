// ============================================================================
// PHASE 76: MASTER DATA MANAGEMENT - DATA LINEAGE PANEL
// ============================================================================

import React, { useState } from 'react';
import {
  GitBranch,
  Layers,
  Database,
  ArrowRight,
  Sparkles,
  BarChart3,
  FileText,
  Search,
  CheckCircle2,
  Share2,
  Box,
} from 'lucide-react';
import {
  MasterRecordItem,
  DataLineageItem,
} from '../../api/master-data/master_data.types';

interface DataLineagePanelProps {
  records: MasterRecordItem[];
  onFetchLineage: (id: string) => Promise<DataLineageItem | null>;
  isLoading: boolean;
}

export const DataLineagePanel: React.FC<DataLineagePanelProps> = ({
  records,
  onFetchLineage,
  isLoading,
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>(records[0]?.id || '');
  const [lineage, setLineage] = useState<DataLineageItem | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const selectedRecord = records.find((r) => r.id === selectedRecordId) || records[0];

  React.useEffect(() => {
    if (selectedRecordId) {
      handleLoadLineage(selectedRecordId);
    }
  }, [selectedRecordId]);

  const handleLoadLineage = async (id: string) => {
    setIsFetching(true);
    try {
      const data = await onFetchLineage(id);
      setLineage(data);
    } catch (err) {
      console.error('Failed to load lineage:', err);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Selector */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              End-to-End Enterprise Data Lineage & Provenance
            </h2>
            <p className="text-xs text-slate-500">
              Graph tracking from Source Subsystems → Canonical Master → Transactional Operations → BI & AI Feeds
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-500">Select Entity:</label>
          <select
            value={selectedRecordId}
            onChange={(e) => setSelectedRecordId(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold max-w-xs"
          >
            {records.map((r) => (
              <option key={r.id} value={r.id}>
                [{r.domainCode}] {r.canonicalId} - {r.primaryName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Lineage Graph Pipeline */}
      {lineage ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                {lineage.canonicalId}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Lineage Provenance Map for '{selectedRecord?.primaryName}'
              </h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
              {lineage.qualityScore}% Provenance Quality
            </span>
          </div>

          {/* Pipeline Flow Stages */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Stage 1: Origin Subsystem */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">1. Origin Source</span>
                <Database className="w-4 h-4 text-slate-400" />
              </div>
              <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                {lineage.sourceSubsystem}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Entity: {lineage.sourceEntity}
              </div>
            </div>

            {/* Stage 2: Canonical Master */}
            <div className="p-4 rounded-xl border-2 border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/40 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">2. Canonical Master</span>
                <Box className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300">
                {lineage.canonicalId}
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400">
                Domain: {lineage.domainCode}
              </div>
            </div>

            {/* Stage 3: Consuming ERP Modules */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">3. Consuming Modules</span>
                <Share2 className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex flex-wrap gap-1">
                {lineage.consumingModules.map((m) => (
                  <span key={m} className="px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 font-mono text-[10px] font-bold">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Stage 4: Transactions */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">4. Downstream Entities</span>
                <FileText className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex flex-wrap gap-1">
                {lineage.transactionalEntities.map((t) => (
                  <span key={t} className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono text-[10px]">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Stage 5: BI & AI Pipelines */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">5. Analytics & AI Feeds</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                <div className="flex items-center space-x-1">
                  <BarChart3 className="w-3 h-3 text-indigo-500" />
                  <span>Executive BI Cockpit</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Phase 73/74 Copilot</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400 text-xs">
          Loading data lineage graph...
        </div>
      )}
    </div>
  );
};
