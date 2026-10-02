// ============================================================================
// PHASE 76: MASTER DATA MANAGEMENT - GOVERNANCE PANEL
// ============================================================================

import React, { useState } from 'react';
import {
  Scale,
  ShieldCheck,
  Lock,
  FileCheck,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  Eye,
  FileText,
  History,
  Unlock,
} from 'lucide-react';
import {
  DataStewardItem,
  DataChangeRequestItem,
  RetentionPolicyItem,
  LegalHoldItem,
  GovernanceAuditLogItem,
  MasterDomainSummary,
} from '../../api/master-data/master_data.types';

interface GovernancePanelProps {
  stewards: DataStewardItem[];
  changeRequests: DataChangeRequestItem[];
  retentionPolicies: RetentionPolicyItem[];
  legalHolds: LegalHoldItem[];
  auditLogs: GovernanceAuditLogItem[];
  domains: MasterDomainSummary[];
  onReviewChangeRequest: (params: {
    requestId: string;
    action: 'APPROVE' | 'REJECT';
    rejectionReason?: string;
  }) => Promise<void>;
  onPlaceLegalHold: (params: any) => Promise<void>;
  onReleaseLegalHold: (params: { holdCode: string; releaseReason: string }) => Promise<void>;
  isLoading: boolean;
}

export const GovernancePanel: React.FC<GovernancePanelProps> = ({
  stewards,
  changeRequests,
  retentionPolicies,
  legalHolds,
  auditLogs,
  domains,
  onReviewChangeRequest,
  onPlaceLegalHold,
  onReleaseLegalHold,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<
    'approvals' | 'stewards' | 'retention' | 'legal-holds' | 'audit-logs'
  >('approvals');

  // Legal Hold Modal State
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [holdTitle, setHoldTitle] = useState('');
  const [holdReason, setHoldReason] = useState('');
  const [holdDomain, setHoldDomain] = useState<string>('ORGANIZATION');
  const [holdTargetId, setHoldTargetId] = useState('');
  const [isHoldSubmitting, setIsHoldSubmitting] = useState(false);

  // Review CR State
  const [selectedCr, setSelectedCr] = useState<DataChangeRequestItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  const pendingCrList = changeRequests.filter((c) => c.status === 'PENDING_APPROVAL');

  const handleReviewCr = async (action: 'APPROVE' | 'REJECT') => {
    if (!selectedCr) return;
    setIsReviewing(true);
    try {
      await onReviewChangeRequest({
        requestId: selectedCr.id,
        action,
        rejectionReason: action === 'REJECT' ? rejectionReason || 'Rejected by steward' : undefined,
      });
      setSelectedCr(null);
      setRejectionReason('');
    } catch (err: any) {
      alert(`Failed to review change request: ${err.message}`);
    } finally {
      setIsReviewing(false);
    }
  };

  const handlePlaceHoldSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holdTitle.trim() || !holdReason.trim()) return;
    setIsHoldSubmitting(true);
    try {
      await onPlaceLegalHold({
        title: holdTitle,
        reason: holdReason,
        domainCode: holdDomain,
        targetCanonicalId: holdTargetId.trim() || undefined,
        isGlobalForDomain: !holdTargetId.trim(),
      });
      setIsHoldModalOpen(false);
      setHoldTitle('');
      setHoldReason('');
      setHoldTargetId('');
    } catch (err: any) {
      alert(`Failed to place legal hold: ${err.message}`);
    } finally {
      setIsHoldSubmitting(false);
    }
  };

  const handleReleaseHold = async (holdCode: string) => {
    const reason = prompt('Please enter the compliance reason for releasing this legal hold:');
    if (!reason) return;
    try {
      await onReleaseLegalHold({ holdCode, releaseReason: reason });
    } catch (err: any) {
      alert(`Failed to release legal hold: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Enterprise Data Governance, Retention & Stewards
            </h2>
            <p className="text-xs text-slate-500">
              Statutory retention policies, change request approvals, legal holds & audit logs
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'approvals', label: `Approvals (${pendingCrList.length})` },
            { id: 'stewards', label: `Stewards (${stewards.length})` },
            { id: 'retention', label: `Retention (${retentionPolicies.length})` },
            { id: 'legal-holds', label: `Legal Holds (${legalHolds.filter((h) => h.status === 'ACTIVE').length})` },
            { id: 'audit-logs', label: 'Audit Trail' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Change Request Approvals */}
      {activeTab === 'approvals' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Change Request Queue
              </span>
              <span className="text-xs font-mono text-slate-500">
                {changeRequests.length} total
              </span>
            </div>

            {changeRequests.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No change requests submitted.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {changeRequests.map((cr) => {
                  const isSelected = selectedCr?.id === cr.id;
                  const isPending = cr.status === 'PENDING_APPROVAL';

                  return (
                    <div
                      key={cr.id}
                      onClick={() => setSelectedCr(cr)}
                      className={`p-3 rounded-lg border transition cursor-pointer ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/40 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                          {cr.requestCode}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPending
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : cr.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {cr.status}
                        </span>
                      </div>

                      <div className="mt-2 text-xs space-y-1 text-slate-700 dark:text-slate-300">
                        <div className="font-semibold">{cr.requestType}</div>
                        <div className="text-[11px] text-slate-500 truncate">{cr.reason}</div>
                      </div>

                      <div className="mt-2 text-[10px] text-slate-400 font-mono flex justify-between">
                        <span>{cr.canonicalId}</span>
                        <span>{new Date(cr.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {selectedCr ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                      {selectedCr.requestCode} • {selectedCr.domainCode}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      Change Request for {selectedCr.canonicalId}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">
                    Submitted by: {selectedCr.submittedByUserName}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-semibold text-slate-500 block mb-1">Business Justification</span>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-slate-800 dark:text-slate-200">
                      {selectedCr.reason}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <span className="font-semibold text-slate-500 block mb-1">Current State</span>
                      <pre className="p-3 bg-slate-950 text-slate-300 font-mono text-[11px] rounded-lg overflow-x-auto max-h-48">
                        {JSON.stringify(selectedCr.currentValue, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block mb-1">Proposed Value</span>
                      <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto max-h-48">
                        {JSON.stringify(selectedCr.proposedValue, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>

                {selectedCr.status === 'PENDING_APPROVAL' && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                    <button
                      onClick={() => handleReviewCr('REJECT')}
                      disabled={isReviewing}
                      className="px-4 py-2 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-50"
                    >
                      Reject Request
                    </button>
                    <button
                      onClick={() => handleReviewCr('APPROVE')}
                      disabled={isReviewing}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Apply Master Update</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400 text-xs">
                Select a change request to review current vs proposed attributes and take governance action.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Domain Data Stewards Matrix */}
      {activeTab === 'stewards' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Enterprise Data Stewards Governance Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Designated subject matter authorities responsible for quality, reconciliations & merges
              </p>
            </div>
            <span className="text-xs font-mono text-indigo-600 font-bold">
              {stewards.length} Stewards Assigned
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stewards.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    {s.domainCode}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600">ACTIVE</span>
                </div>

                <div className="text-xs space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {s.primaryStewardName}
                  </div>
                  <div className="text-slate-500">{s.primaryStewardEmail}</div>
                  <div className="text-slate-600 dark:text-slate-400 font-medium">
                    Department: {s.department}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 space-y-0.5">
                  <div>Backup: <span className="font-medium text-slate-700 dark:text-slate-300">{s.backupStewardName || 'N/A'}</span></div>
                  <div>Escalation: <span className="font-medium text-purple-600 dark:text-purple-400">{s.escalationRole}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Statutory Retention Policies */}
      {activeTab === 'retention' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Statutory Data Retention & Lifecycle Policies
              </h3>
              <p className="text-xs text-slate-500">
                Enforces legal minimum retention spans and archive triggers per regulatory mandates
              </p>
            </div>
            <span className="text-xs font-mono text-purple-600 font-bold">
              {retentionPolicies.length} Policies Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Policy Code</th>
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4">Policy Title</th>
                  <th className="py-3 px-4">Retention Span</th>
                  <th className="py-3 px-4">Statutory Basis</th>
                  <th className="py-3 px-4">End Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {retentionPolicies.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                      {p.policyCode}
                    </td>
                    <td className="py-3 px-4 font-semibold">{p.domainCode}</td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      {p.title}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {p.retentionYears} Years
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {p.statutoryReference}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {p.actionAfterRetention}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Legal Holds Manager */}
      {activeTab === 'legal-holds' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Lock className="w-4 h-4 text-rose-500" />
                <span>Active Legal Injunctions & Preservation Holds</span>
              </h3>
              <p className="text-xs text-slate-500">
                Overrides automatic purge and blocks record modification during active litigation or audit
              </p>
            </div>

            <button
              onClick={() => setIsHoldModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center space-x-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Place Legal Hold</span>
            </button>
          </div>

          <div className="space-y-3">
            {legalHolds.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No active legal holds or litigation preservation orders.
              </div>
            ) : (
              legalHolds.map((h) => {
                const isActive = h.status === 'ACTIVE';

                return (
                  <div
                    key={h.id}
                    className={`p-4 rounded-xl border ${
                      isActive
                        ? 'border-rose-200 dark:border-rose-900 bg-rose-50/20 dark:bg-rose-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/40'
                    } flex flex-col md:flex-row md:items-center justify-between gap-4`}
                  >
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                          {h.holdCode}
                        </span>
                        <span className="font-semibold text-slate-500">
                          Domain: {h.domainCode}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {h.status}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {h.title}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">{h.reason}</p>
                      <div className="text-[11px] text-slate-400">
                        Placed by: {h.placedByUserName} • Target: {h.targetCanonicalId || 'Domain Global'}
                      </div>
                    </div>

                    {isActive && (
                      <button
                        onClick={() => handleReleaseHold(h.holdCode)}
                        className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition flex items-center space-x-1"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Release Hold</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Immutable Governance Audit Sentinel Logs */}
      {activeTab === 'audit-logs' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Immutable Governance Audit Sentinel Trail
              </h3>
              <p className="text-xs text-slate-500">
                Cryptographically verifiable, tamper-evident record of all master data modifications
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">{auditLogs.length} events</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Domain / Canonical</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Change Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {log.domainCode} / {log.canonicalId || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {log.userName} ({log.userRole})
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {log.changeSummary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Place Legal Hold Modal */}
      {isHoldModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/30">
              <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-rose-600" />
                <span>Place Statutory Legal Preservation Hold</span>
              </h3>
            </div>

            <form onSubmit={handlePlaceHoldSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hold Title / Matter Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dubai Commercial Court Case Ref 2026-88"
                  value={holdTitle}
                  onChange={(e) => setHoldTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Legal Justification & Injunction Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Preserve all transactional and master records pending official audit..."
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Master Domain
                  </label>
                  <select
                    value={holdDomain}
                    onChange={(e) => setHoldDomain(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    {domains.map((d) => (
                      <option key={d.domainCode} value={d.domainCode}>
                        {d.displayName} ({d.domainCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Canonical ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Leave blank for domain-wide hold"
                    value={holdTargetId}
                    onChange={(e) => setHoldTargetId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsHoldModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isHoldSubmitting}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                >
                  Confirm Legal Hold
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
