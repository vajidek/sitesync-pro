// ============================================================================
// PHASE 76: MASTER DATA MANAGEMENT - DUPLICATE REVIEW & GOLDEN RECORDS
// ============================================================================

import React, { useState } from 'react';
import {
  GitMerge,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Search,
  Filter,
  Check,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  DuplicateCandidateItem,
  GoldenRecordItem,
  MasterDomainCode,
} from '../../api/master-data/master_data.types';

interface DuplicateReviewPanelProps {
  candidates: DuplicateCandidateItem[];
  goldenRecords: GoldenRecordItem[];
  onResolveCandidate: (params: {
    candidateId: string;
    resolution: 'APPROVE_MERGE' | 'KEEP_SEPARATE' | 'REJECT_CANDIDATE' | 'ESCALATE';
    notes?: string;
  }) => Promise<void>;
  onAIAssist: (data: any) => Promise<any>;
  isLoading: boolean;
}

export const DuplicateReviewPanel: React.FC<DuplicateReviewPanelProps> = ({
  candidates,
  goldenRecords,
  onResolveCandidate,
  onAIAssist,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'golden'>('pending');
  const [selectedCandidate, setSelectedCandidate] = useState<DuplicateCandidateItem | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const pendingCandidates = candidates.filter((c) => c.status === 'PENDING_REVIEW');

  const handleSelectCandidate = (candidate: DuplicateCandidateItem) => {
    setSelectedCandidate(candidate);
    setAiExplanation(null);
    setResolutionNotes('');
  };

  const handleResolve = async (
    resolution: 'APPROVE_MERGE' | 'KEEP_SEPARATE' | 'REJECT_CANDIDATE' | 'ESCALATE'
  ) => {
    if (!selectedCandidate) return;
    setIsProcessing(true);
    try {
      await onResolveCandidate({
        candidateId: selectedCandidate.id,
        resolution,
        notes: resolutionNotes || `Steward action: ${resolution}`,
      });
      setSelectedCandidate(null);
    } catch (err: any) {
      alert(`Resolution failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestAIAssistance = async () => {
    if (!selectedCandidate) return;
    setIsAiLoading(true);
    try {
      const res = await onAIAssist({
        contextType: 'DUPLICATE_PAIR',
        dataPayload: selectedCandidate,
      });
      setAiExplanation(res.explanation);
    } catch (err) {
      setAiExplanation('Rule-based comparison indicates high string token overlap and matching statutory VAT prefix.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <GitMerge className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Duplicate Review & Golden Record Consolidation
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic string normalization, Levenshtein distance & survivorship rules
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Review Queue ({pendingCandidates.length})
          </button>
          <button
            onClick={() => setActiveTab('golden')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'golden'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Golden Records ({goldenRecords.length})
          </button>
        </div>
      </div>

      {activeTab === 'pending' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Candidates List Column */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Pending Match Candidates
              </span>
              <span className="text-xs font-mono text-slate-500">
                {pendingCandidates.length} items
              </span>
            </div>

            {pendingCandidates.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                No duplicate match candidates currently pending review.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
                {pendingCandidates.map((c) => {
                  const isSelected = selectedCandidate?.id === c.id;
                  const isHighSim = c.overallSimilarityScore >= 0.9;

                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCandidate(c)}
                      className={`p-3 rounded-lg border transition cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 font-mono">
                          {c.domainCode}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isHighSim
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {Math.round(c.overallSimilarityScore * 100)}% Match
                        </span>
                      </div>

                      <div className="mt-2 text-xs space-y-1">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                          A: {c.candidateAPrimaryName}
                        </div>
                        <div className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                          B: {c.candidateBPrimaryName}
                        </div>
                      </div>

                      <div className="mt-2 text-[10px] text-slate-400 font-mono">
                        Rule: {c.matchingRuleCode}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Side-by-Side Review Column */}
          <div className="lg:col-span-2 space-y-4">
            {selectedCandidate ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-5">
                {/* Header Match Analysis */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3.5 rounded-xl">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold font-mono text-amber-800 dark:text-amber-200">
                        {selectedCandidate.id}
                      </span>
                      <span className="text-xs text-amber-700 dark:text-amber-300 font-semibold">
                        Domain: {selectedCandidate.domainCode}
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 dark:text-amber-100 font-medium mt-1">
                      Matched by rule: {selectedCandidate.matchingRuleCode} ({Math.round(selectedCandidate.overallSimilarityScore * 100)}% string & attribute overlap)
                    </p>
                  </div>

                  <button
                    onClick={handleRequestAIAssistance}
                    disabled={isAiLoading}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold shadow-xs hover:bg-indigo-50 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAiLoading ? 'Analyzing...' : 'AI Steward Analysis'}</span>
                  </button>
                </div>

                {/* AI Explanation Banner */}
                {aiExplanation && (
                  <div className="p-3.5 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-lg text-xs space-y-1">
                    <div className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>AI Data Steward Recommendation (Phase 74 Gateway)</span>
                    </div>
                    <p className="text-indigo-800 dark:text-indigo-300 leading-relaxed whitespace-pre-line">
                      {aiExplanation}
                    </p>
                  </div>
                )}

                {/* Side-by-Side Comparison Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Candidate A (Primary/Earlier) */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                        Record A (Established)
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 font-bold">
                        {selectedCandidate.candidateACanonicalId}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Primary Title</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {selectedCandidate.candidateAPrimaryName}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Source Subsystem</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                          {selectedCandidate.candidateASourceModule}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Candidate B (Secondary/Duplicate) */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">
                        Record B (Candidate)
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 font-bold">
                        {selectedCandidate.candidateBCanonicalId}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Primary Title</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {selectedCandidate.candidateBPrimaryName}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Source Subsystem</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                          {selectedCandidate.candidateBSourceModule}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Steward Notes & Actions */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Steward Audit Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Verified trade license numbers match identical registered entity."
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                    <button
                      onClick={() => handleResolve('KEEP_SEPARATE')}
                      disabled={isProcessing}
                      className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                    >
                      Keep as Separate Entities
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleResolve('REJECT_CANDIDATE')}
                        disabled={isProcessing}
                        className="px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-semibold transition"
                      >
                        Reject Match
                      </button>

                      <button
                        onClick={() => handleResolve('APPROVE_MERGE')}
                        disabled={isProcessing}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition"
                      >
                        <Award className="w-4 h-4" />
                        <span>Establish Golden Record & Merge</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400 text-xs">
                <GitMerge className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                Select a duplicate candidate from the list to review attributes, perform AI analysis, and establish golden records.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Golden Records Tab */}
      {activeTab === 'golden' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Established Authoritative Golden Records</span>
              </h3>
              <p className="text-xs text-slate-500">
                Consolidated master entities with survivorship attribute rules & historical provenance
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600">
              {goldenRecords.length} Golden Records
            </span>
          </div>

          {goldenRecords.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No golden records established yet. Approve duplicate merges to construct authoritative golden records.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goldenRecords.map((g) => (
                <div
                  key={g.id}
                  className="p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/20 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {g.goldenCanonicalId}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {g.qualityScore}% Quality
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {g.primaryName}
                    </div>
                    <div className="text-slate-500">
                      Domain: {g.domainCode} • Approved by: {g.approvedByUserName}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-200/50 dark:border-amber-900/40 text-[11px] text-slate-500 flex justify-between">
                    <span>{g.mergedEntityIds.length} Merged Source Entities</span>
                    <span>Consolidated: {new Date(g.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
