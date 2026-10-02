import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, Clock, XCircle, AlertTriangle, ShieldCheck, 
  ArrowRight, UserCheck, Eye, RefreshCw, Layers, Lock, Unlock, FileCheck
} from 'lucide-react';
import { safeJson } from '../../lib/safeFetch';

export interface WorkflowStageItem {
  stageNumber: number;
  stageName: string;
  requiredRole: string;
  allowedRoles?: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'BYPASSED' | 'SKIPPED';
  actionTakenBy?: string;
  actionTakenAt?: string;
  remarks?: string;
}

export interface WorkflowChainStatus {
  workflowCode: string;
  workflowName: string;
  workflowVersion: number;
  isApprovalRequired: boolean;
  isVerificationRequired: boolean;
  totalStages: number;
  currentStage: number;
  overallStatus: 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'DISBURSED';
  stages: WorkflowStageItem[];
  separationOfDuties: {
    preventMakerVerification: boolean;
    preventMakerApproval: boolean;
    preventVerifierApproval: boolean;
    isMakerEligibleToApprove: boolean;
  };
  currentUserEligibility?: {
    isEligible: boolean;
    action: string;
    stageIndex?: number;
    reason?: string;
    matchedRole?: string;
  };
}

interface WorkflowApprovalChainWidgetProps {
  entityType: 'LOAN' | 'ATTENDANCE' | 'PAYROLL' | 'PROCUREMENT' | 'INVOICE' | 'LEAVE' | string;
  entityId: string;
  instanceData?: any;
  onActionComplete?: () => void;
  compact?: boolean;
  showEligibilityBadge?: boolean;
}

export const WorkflowApprovalChainWidget: React.FC<WorkflowApprovalChainWidgetProps> = ({
  entityType,
  entityId,
  instanceData,
  onActionComplete,
  compact = false,
  showEligibilityBadge = true,
}) => {
  const [chainStatus, setChainStatus] = useState<WorkflowChainStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChainStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const queryParams = instanceData ? `?instance=${encodeURIComponent(JSON.stringify(instanceData))}` : '';
      const res = await fetch(`/api/workflows/policy/chain/${entityType}/${entityId}${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success && json.data) {
        setChainStatus(json.data);
      } else {
        setError(json?.message || 'Failed to load approval chain status');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching approval chain');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (entityType && entityId) {
      fetchChainStatus();
    }
  }, [entityType, entityId]);

  if (loading) {
    return (
      <div id={`workflow-chain-loading-${entityId}`} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center space-x-3 text-slate-500 text-sm">
        <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
        <span>Evaluating workflow governance chain...</span>
      </div>
    );
  }

  if (error || !chainStatus) {
    return (
      <div id={`workflow-chain-err-${entityId}`} className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-amber-800 text-xs">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Workflow Chain Notice: {error || 'No active workflow policy assigned.'}</span>
        </div>
        <button
          id={`btn-retry-wf-chain-${entityId}`}
          onClick={fetchChainStatus}
          className="px-2 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-rose-600" />;
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-blue-600 animate-pulse" />;
      case 'SKIPPED':
      case 'BYPASSED':
        return <ArrowRight className="w-5 h-5 text-slate-400" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-slate-300 bg-white" />;
    }
  };

  return (
    <div id={`workflow-approval-chain-${entityId}`} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">{chainStatus.workflowName}</span>
              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-mono rounded font-semibold">
                v{chainStatus.workflowVersion}
              </span>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-full">
                {chainStatus.workflowCode}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Governance Policy: {chainStatus.isVerificationRequired ? 'Verification + ' : ''}
              {chainStatus.isApprovalRequired ? `${chainStatus.totalStages}-Stage Approval` : 'Auto-Approve / No Gate'}
            </p>
          </div>
        </div>

        {/* Separation of Duties & User Eligibility Pill */}
        {showEligibilityBadge && chainStatus.currentUserEligibility && (
          <div className="flex items-center space-x-2">
            {chainStatus.currentUserEligibility.isEligible ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Authorized ({chainStatus.currentUserEligibility.action})</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium" title={chainStatus.currentUserEligibility.reason}>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Read-Only / Not Eligible</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Visual Workflow Stage Timeline */}
      <div className="relative pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {(chainStatus.stages || []).map((st, idx) => {
            const isCurrent = idx + 1 === chainStatus.currentStage && chainStatus.overallStatus !== 'APPROVED';
            const isPassed = st.status === 'APPROVED';
            const isFailed = st.status === 'REJECTED';

            let cardBg = 'bg-slate-50 border-slate-200';
            if (isPassed) cardBg = 'bg-emerald-50/60 border-emerald-200';
            if (isFailed) cardBg = 'bg-rose-50/60 border-rose-200';
            if (isCurrent) cardBg = 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20';

            return (
              <div 
                key={`stage-card-${st.stageNumber || idx + 1}`} 
                id={`stage-card-${entityId}-${st.stageNumber || idx + 1}`}
                className={`p-3 rounded-lg border transition-all ${cardBg} flex flex-col justify-between`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                      Stage {st.stageNumber || idx + 1}
                    </span>
                    {getStageIcon(st.status)}
                  </div>
                  <div className="font-semibold text-xs text-slate-900">
                    {st.stageName}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-1.5 py-0.5 bg-white border border-slate-200 text-slate-700 text-[10px] font-medium rounded">
                      Role: {st.requiredRole}
                    </span>
                  </div>
                </div>

                {/* Approver Audit Meta */}
                <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px]">
                  {st.actionTakenBy ? (
                    <div className="text-slate-700">
                      <span className="font-medium">{st.actionTakenBy}</span>
                      {st.actionTakenAt && (
                        <span className="text-slate-400 block text-[10px]">
                          {new Date(st.actionTakenAt).toLocaleDateString()} {new Date(st.actionTakenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      {st.remarks && (
                        <span className="italic text-slate-600 block text-[10px] mt-0.5 truncate" title={st.remarks}>
                          "{st.remarks}"
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[10px]">
                      {isCurrent ? 'Awaiting action...' : 'Pending previous stage'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Governance Controls & Maker-Checker Policy Footnote */}
      <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Maker-Checker: {chainStatus.separationOfDuties?.preventMakerApproval ? 'Strict (Maker cannot approve)' : 'Standard'}</span>
          </span>
          {chainStatus.separationOfDuties?.preventVerifierApproval && (
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-blue-500" />
              <span>4-Eyes Principle Enforced</span>
            </span>
          )}
        </div>
        <button
          id={`btn-refresh-wf-chain-${entityId}`}
          onClick={fetchChainStatus}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Refresh Governance State</span>
        </button>
      </div>
    </div>
  );
};
