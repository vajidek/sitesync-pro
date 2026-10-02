// ============================================================================
// PHASE 76: ENTERPRISE MASTER DATA MANAGEMENT & GOVERNANCE MODULE
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  ShieldCheck,
  Sparkles,
  GitMerge,
  Layers,
  Scale,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Award,
  GitBranch,
  FileCheck,
  Lock,
  Plus,
  ArrowRight,
  Info,
} from 'lucide-react';
import { MasterDataDashboard } from './MasterDataDashboard';
import { MasterRegistry } from './MasterRegistry';
import { DuplicateReviewPanel } from './DuplicateReviewPanel';
import { ReconciliationPanel } from './ReconciliationPanel';
import { DataLineagePanel } from './DataLineagePanel';
import { GovernancePanel } from './GovernancePanel';
import {
  MDMStatsSummary,
  MasterDomainSummary,
  MasterRecordItem,
  MasterDomainCode,
  DuplicateCandidateItem,
  GoldenRecordItem,
  ReconciliationJobItem,
  DataStewardItem,
  DataChangeRequestItem,
  RetentionPolicyItem,
  LegalHoldItem,
  GovernanceAuditLogItem,
  DataQualityEvaluationResult,
  DataLineageItem,
  MasterRecordVersion,
} from '../../api/master-data/master_data.types';
import { safeJson } from '../../lib/safeFetch';
import { NavTab } from '../layout/Sidebar';

export type MDMSubTab =
  | 'dashboard'
  | 'registry'
  | 'duplicates'
  | 'reconciliation'
  | 'lineage'
  | 'governance';

interface EnterpriseMasterDataModuleProps {
  onNavigateTab?: (tab: NavTab) => void;
}

export const EnterpriseMasterDataModule: React.FC<EnterpriseMasterDataModuleProps> = ({
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<MDMSubTab>('dashboard');
  const [stats, setStats] = useState<MDMStatsSummary | null>(null);
  const [domains, setDomains] = useState<MasterDomainSummary[]>([]);
  const [records, setRecords] = useState<MasterRecordItem[]>([]);
  const [duplicateCandidates, setDuplicateCandidates] = useState<DuplicateCandidateItem[]>([]);
  const [goldenRecords, setGoldenRecords] = useState<GoldenRecordItem[]>([]);
  const [reconciliationJobs, setReconciliationJobs] = useState<ReconciliationJobItem[]>([]);
  const [stewards, setStewards] = useState<DataStewardItem[]>([]);
  const [changeRequests, setChangeRequests] = useState<DataChangeRequestItem[]>([]);
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicyItem[]>([]);
  const [legalHolds, setLegalHolds] = useState<LegalHoldItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<GovernanceAuditLogItem[]>([]);

  const [selectedDomainCode, setSelectedDomainCode] = useState<MasterDomainCode | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const getAuthHeaders = (): HeadersInit => {
    const token =
      localStorage.getItem('sitesync_jwt_access_token') ||
      localStorage.getItem('sitesync_access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4500);
  };

  // Master Data Initial Load
  const fetchAllMDMData = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers = getAuthHeaders();

      // Parallelize fetches
      const [
        statsRes,
        domainsRes,
        recordsRes,
        duplicatesRes,
        reconciliationRes,
        stewardsRes,
        requestsRes,
        policiesRes,
        holdsRes,
        auditRes,
      ] = await Promise.all([
        fetch('/api/master-data/dashboard-stats', { headers }),
        fetch('/api/master-data/domains', { headers }),
        fetch('/api/master-data/records', { headers }),
        fetch('/api/master-data/duplicates', { headers }),
        fetch('/api/master-data/reconciliation-jobs', { headers }),
        fetch('/api/master-data/stewards', { headers }),
        fetch('/api/master-data/change-requests', { headers }),
        fetch('/api/master-data/retention-policies', { headers }),
        fetch('/api/master-data/legal-holds', { headers }),
        fetch('/api/master-data/audit-logs', { headers }),
      ]);

      const [
        statsJson,
        domainsJson,
        recordsJson,
        duplicatesJson,
        reconciliationJson,
        stewardsJson,
        requestsJson,
        policiesJson,
        holdsJson,
        auditJson,
      ] = await Promise.all([
        safeJson(statsRes),
        safeJson(domainsRes),
        safeJson(recordsRes),
        safeJson(duplicatesRes),
        safeJson(reconciliationRes),
        safeJson(stewardsRes),
        safeJson(requestsRes),
        safeJson(policiesRes),
        safeJson(holdsRes),
        safeJson(auditRes),
      ]);

      if (statsJson?.success) setStats(statsJson.data);
      if (domainsJson?.success) setDomains(domainsJson.data || []);
      if (recordsJson?.success) setRecords(recordsJson.data || []);
      if (duplicatesJson?.success) {
        setDuplicateCandidates(duplicatesJson.data?.candidates || []);
        setGoldenRecords(duplicatesJson.data?.goldenRecords || []);
      }
      if (reconciliationJson?.success) setReconciliationJobs(reconciliationJson.data || []);
      if (stewardsJson?.success) setStewards(stewardsJson.data || []);
      if (requestsJson?.success) setChangeRequests(requestsJson.data || []);
      if (policiesJson?.success) setRetentionPolicies(policiesJson.data || []);
      if (holdsJson?.success) setLegalHolds(holdsJson.data || []);
      if (auditJson?.success) setAuditLogs(auditJson.data || []);
    } catch (err: any) {
      console.error('[MDM] Failed to load initial data:', err);
      showToast('error', 'Failed to synchronize with Enterprise Master Data engine');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllMDMData();
  }, [fetchAllMDMData]);

  // Handler: Create Master Record
  const handleCreateRecord = async (data: any) => {
    try {
      const res = await fetch('/api/master-data/records', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const json = await safeJson(res);
      if (json?.success) {
        showToast('success', `Master record '${json.data?.entityCode}' created successfully`);
        await fetchAllMDMData();
      } else {
        showToast('error', json?.message || 'Failed to create master record');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error executing record creation');
    }
  };

  // Handler: Update Master Record
  const handleUpdateRecord = async (id: string, data: any) => {
    try {
      const res = await fetch(`/api/master-data/records/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const json = await safeJson(res);
      if (json?.success) {
        showToast('success', `Master record updated with high-integrity audit trail`);
        await fetchAllMDMData();
      } else {
        showToast('error', json?.message || 'Failed to update master record');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error updating record');
    }
  };

  // Handler: Scan Quality
  const handleScanQuality = async (id: string): Promise<DataQualityEvaluationResult> => {
    try {
      const res = await fetch(`/api/master-data/records/${id}/quality-scan`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const json = await safeJson(res);
      if (json?.success) {
        showToast(
          'info',
          `Quality evaluated: Score ${json.data?.overallScore}/100 (${json.data?.classification})`
        );
        fetchAllMDMData();
        return json.data;
      }
      throw new Error(json?.message || 'Quality scan failed');
    } catch (err: any) {
      showToast('error', err.message || 'Error running quality scan');
      throw err;
    }
  };

  // Handler: Fetch Lineage
  const handleFetchLineage = async (id: string): Promise<DataLineageItem | null> => {
    try {
      const res = await fetch(`/api/master-data/records/${id}/lineage`, {
        headers: getAuthHeaders(),
      });
      const json = await safeJson(res);
      if (json?.success) {
        return json.data;
      }
      return null;
    } catch (err) {
      console.error('[MDM] Lineage fetch error:', err);
      return null;
    }
  };

  // Handler: Fetch Versions
  const handleFetchVersions = async (id: string): Promise<MasterRecordVersion[]> => {
    try {
      const res = await fetch(`/api/master-data/records/${id}/versions`, {
        headers: getAuthHeaders(),
      });
      const json = await safeJson(res);
      if (json?.success) {
        return json.data || [];
      }
      return [];
    } catch (err) {
      console.error('[MDM] Versions fetch error:', err);
      return [];
    }
  };

  // Handler: Submit Change Request
  const handleSubmitChangeRequest = async (data: any) => {
    try {
      const res = await fetch('/api/master-data/change-requests', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const json = await safeJson(res);
      if (json?.success) {
        showToast('success', `Change Request '${json.data?.requestCode}' submitted to Data Steward`);
        await fetchAllMDMData();
      } else {
        showToast('error', json?.message || 'Failed to submit change request');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error submitting change request');
    }
  };

  // Handler: Resolve Duplicate Candidate
  const handleResolveCandidate = async (params: {
    candidateId: string;
    resolution: 'APPROVE_MERGE' | 'KEEP_SEPARATE' | 'REJECT_CANDIDATE' | 'ESCALATE';
    notes?: string;
  }) => {
    try {
      const res = await fetch('/api/master-data/duplicates/resolve', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(params),
      });
      const json = await safeJson(res);
      if (json?.success) {
        showToast('success', `Candidate resolved: ${params.resolution.replace('_', ' ')}`);
        await fetchAllMDMData();
      } else {
        showToast('error', json?.message || 'Failed to resolve duplicate candidate');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error resolving duplicate candidate');
    }
  };

  // Handler: Trigger Cross-Module Reconciliation
  const handleTriggerReconciliation = async (domainCode: MasterDomainCode) => {
    try {
      const res = await fetch('/api/master-data/reconciliation-jobs', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ domainCode, reconciliationType: 'FULL' }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        showToast(
          'success',
          `Reconciliation job '${json.data?.jobCode}' dispatched for domain ${domainCode}`
        );
        await fetchAllMDMData();
      } else {
        showToast('error', json?.message || 'Failed to dispatch reconciliation job');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error triggering reconciliation job');
    }
  };

  // Handler: Review Change Request
  const handleReviewChangeRequest = async (params: {
    requestId: string;
    action: 'APPROVE' | 'REJECT';
    rejectionReason?: string;
  }) => {
    try {
      const res = await fetch('/api/master-data/change-requests/review', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(params),
      });
      const json = await safeJson(res);
      if (json?.success) {
        showToast(
          'success',
          `Change request has been ${params.action === 'APPROVE' ? 'Approved & Applied' : 'Rejected'}`
        );
        await fetchAllMDMData();
      } else {
        showToast('error', json?.message || 'Failed to process change request review');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error reviewing change request');
    }
  };

  // Handler: Place Legal Hold
  const handlePlaceLegalHold = async (params: any) => {
    try {
      const res = await fetch('/api/master-data/legal-holds', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(params),
      });
      const json = await safeJson(res);
      if (json?.success) {
        showToast('success', `Legal hold '${json.data?.holdCode}' placed securely on domain entities`);
        await fetchAllMDMData();
      } else {
        showToast('error', json?.message || 'Failed to place legal hold');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error placing legal hold');
    }
  };

  // Handler: Release Legal Hold
  const handleReleaseLegalHold = async (params: { holdCode: string; releaseReason: string }) => {
    try {
      const res = await fetch('/api/master-data/legal-holds/release', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(params),
      });
      const json = await safeJson(res);
      if (json?.success) {
        showToast('success', `Legal hold released with audit justification`);
        await fetchAllMDMData();
      } else {
        showToast('error', json?.message || 'Failed to release legal hold');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error releasing legal hold');
    }
  };

  // Handler: AI Assisted Insights
  const handleAIAssist = async (data: any) => {
    try {
      const res = await fetch('/api/master-data/ai-explain', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const json = await safeJson(res);
      return json?.data;
    } catch (err) {
      console.error('[MDM] AI Assist error:', err);
      return null;
    }
  };

  const navTabs = [
    {
      id: 'dashboard' as MDMSubTab,
      label: 'Executive Dashboard',
      icon: <Database className="w-4.5 h-4.5 text-indigo-400" />,
      badge: stats?.systemHealth || 'HEALTHY',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'registry' as MDMSubTab,
      label: 'Master Registry',
      icon: <Layers className="w-4.5 h-4.5 text-blue-400" />,
      badgeCount: records.length,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
      id: 'duplicates' as MDMSubTab,
      label: 'Duplicate Match & Golden Records',
      icon: <GitMerge className="w-4.5 h-4.5 text-amber-400" />,
      badgeCount: duplicateCandidates.filter((c) => c.status === 'PENDING_REVIEW').length,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'reconciliation' as MDMSubTab,
      label: 'Cross-Module Reconciliation',
      icon: <FileCheck className="w-4.5 h-4.5 text-emerald-400" />,
      badgeCount: reconciliationJobs.length,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'lineage' as MDMSubTab,
      label: 'Data Lineage & Provenance',
      icon: <GitBranch className="w-4.5 h-4.5 text-cyan-400" />,
    },
    {
      id: 'governance' as MDMSubTab,
      label: 'Governance, Stewards & Holds',
      icon: <Scale className="w-4.5 h-4.5 text-purple-400" />,
      badgeCount: changeRequests.filter((r) => r.status === 'PENDING').length,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
  ];

  return (
    <div id="enterprise-mdm-module" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Database className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Enterprise Master Data Management & Governance
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Phase 76 Active
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Centralized single source of truth (SSOT), golden record resolution, 6-dimension data
              quality scoring, automated cross-module reconciliation, and cryptographic lineage
              auditing across the SiteSync Pro ERP ecosystem.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-end md:self-auto">
          <button
            id="btn-refresh-mdm"
            onClick={fetchAllMDMData}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition font-medium text-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Sync Data</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border animate-in fade-in transition ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
              : feedbackMessage.type === 'error'
              ? 'bg-rose-950/70 border-rose-800 text-rose-200'
              : 'bg-indigo-950/70 border-indigo-800 text-indigo-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : feedbackMessage.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            ) : (
              <Info className="w-5 h-5 text-indigo-400" />
            )}
            <span className="text-sm font-medium">{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs opacity-75 hover:opacity-100 uppercase font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 overflow-x-auto pb-2 scrollbar-none">
        {navTabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-mdm-${tab.id}`}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tab.badgeColor}`}
                >
                  {tab.badge}
                </span>
              )}
              {typeof tab.badgeCount === 'number' && tab.badgeCount > 0 && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tab.badgeColor}`}
                >
                  {tab.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="transition-all">
        {activeSubTab === 'dashboard' && (
          <MasterDataDashboard
            stats={stats}
            onSelectDomain={(domainCode) => {
              setSelectedDomainCode(domainCode);
              setActiveSubTab('registry');
            }}
            onNavigateTab={(tabCode) => {
              if (tabCode === 'registry') setActiveSubTab('registry');
              else if (tabCode === 'duplicates') setActiveSubTab('duplicates');
              else if (tabCode === 'reconciliation') setActiveSubTab('reconciliation');
              else if (tabCode === 'governance') setActiveSubTab('governance');
              else if (tabCode === 'lineage') setActiveSubTab('lineage');
              else if (onNavigateTab) onNavigateTab(tabCode as NavTab);
            }}
            onRefresh={fetchAllMDMData}
            isLoading={isLoading}
          />
        )}

        {activeSubTab === 'registry' && (
          <MasterRegistry
            domains={domains}
            records={records}
            selectedDomainCode={selectedDomainCode}
            onSelectDomainCode={setSelectedDomainCode}
            onRefresh={fetchAllMDMData}
            onCreateRecord={handleCreateRecord}
            onUpdateRecord={handleUpdateRecord}
            onScanQuality={handleScanQuality}
            onFetchLineage={handleFetchLineage}
            onFetchVersions={handleFetchVersions}
            onSubmitChangeRequest={handleSubmitChangeRequest}
            isLoading={isLoading}
          />
        )}

        {activeSubTab === 'duplicates' && (
          <DuplicateReviewPanel
            candidates={duplicateCandidates}
            goldenRecords={goldenRecords}
            onResolveCandidate={handleResolveCandidate}
            onAIAssist={handleAIAssist}
            isLoading={isLoading}
          />
        )}

        {activeSubTab === 'reconciliation' && (
          <ReconciliationPanel
            jobs={reconciliationJobs}
            domains={domains}
            onTriggerReconciliation={handleTriggerReconciliation}
            isLoading={isLoading}
          />
        )}

        {activeSubTab === 'lineage' && (
          <DataLineagePanel
            records={records}
            onFetchLineage={handleFetchLineage}
            isLoading={isLoading}
          />
        )}

        {activeSubTab === 'governance' && (
          <GovernancePanel
            stewards={stewards}
            changeRequests={changeRequests}
            retentionPolicies={retentionPolicies}
            legalHolds={legalHolds}
            auditLogs={auditLogs}
            domains={domains}
            onReviewChangeRequest={handleReviewChangeRequest}
            onPlaceLegalHold={handlePlaceLegalHold}
            onReleaseLegalHold={handleReleaseLegalHold}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};
