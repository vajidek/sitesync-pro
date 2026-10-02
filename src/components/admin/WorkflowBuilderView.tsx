import React, { useEffect, useState } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { 
  GitMerge, Plus, RefreshCw, Layers, ArrowRight, ShieldCheck, CheckCircle2, 
  AlertCircle, Copy, FileText, Settings, Play, ChevronRight, CornerDownRight, Check,
  Trash2, Send, Clock, DollarSign, UserCheck, ShieldAlert, Cpu
} from 'lucide-react';
import {
  DSSectionHeader,
  DSCard,
  DSButton,
  DSAlert,
  DSModal,
  DSField
} from '../ui/design-system';

export const WorkflowBuilderView: React.FC = () => {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedWf, setSelectedWf] = useState<any | null>(null);
  const [states, setStates] = useState<any[]>([]);
  const [transitions, setTransitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'governance' | 'states' | 'transitions' | 'sla' | 'simulator'>('governance');

  // Governance Policy State
  const [policyConfig, setPolicyConfig] = useState<any | null>(null);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [savingPolicy, setSavingPolicy] = useState(false);

  // Simulator state
  const [simAmount, setSimAmount] = useState<number>(45000);
  const [simCurrency, setSimCurrency] = useState<string>('AED');
  const [simRole, setSimRole] = useState<string>('SUPERVISOR');
  const [simUserId, setSimUserId] = useState<string>('usr-sim-01');
  const [simDepartment, setSimDepartment] = useState<string>('HR');
  const [simAction, setSimAction] = useState<string>('APPROVE');
  const [simResult, setSimResult] = useState<any | null>(null);

  // Modals
  const [showAddWfModal, setShowAddWfModal] = useState(false);
  const [newWf, setNewWf] = useState({
    code: '',
    name: '',
    description: '',
    category: 'APPROVAL',
    moduleCode: 'PROCUREMENT',
    triggerType: 'THRESHOLD',
    minApprovalAmount: 10000,
    slaHours: 24,
  });

  const [showAddStateModal, setShowAddStateModal] = useState(false);
  const [newState, setNewState] = useState({
    stateCode: '',
    name: '',
    type: 'INTERMEDIATE',
    color: '#3b82f6',
    displayOrder: 1,
  });

  const [showAddTrModal, setShowAddTrModal] = useState(false);
  const [newTr, setNewTr] = useState({
    fromStateCode: 'DRAFT',
    toStateCode: 'APPROVED',
    actionLabel: 'Approve Item',
    requiredRole: 'MANAGER',
    requiresComments: true,
    requiresSignature: false,
  });

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/workflows', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success && Array.isArray(json.data)) {
        setWorkflows(json.data);
        if (json.data.length > 0 && !selectedWf) {
          setSelectedWf(json.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPolicy = async (codeOrEntity: string) => {
    setPolicyLoading(true);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/workflows/policy/${codeOrEntity}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success && json.data) {
        setPolicyConfig(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch governance policy:', err);
    } finally {
      setPolicyLoading(false);
    }
  };

  const fetchWfDetails = async (wf: any) => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const wfId = wf.id;
      // Fetch States
      const resSt = await fetch(`/api/workflows/${wfId}/states`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jsonSt = await safeJson(resSt);
      if (jsonSt?.success) setStates(jsonSt.data || []);

      // Fetch Transitions
      const resTr = await fetch(`/api/workflows/${wfId}/transitions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jsonTr = await safeJson(resTr);
      if (jsonTr?.success) setTransitions(jsonTr.data || []);

      // Fetch Governance Policy
      await fetchPolicy(wf.code || wf.moduleCode || wf.id);
    } catch (err) {
      console.error('Failed to fetch workflow states/transitions:', err);
    }
  };

  const handleSavePolicy = async () => {
    if (!selectedWf || !policyConfig) return;
    setSavingPolicy(true);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/workflows/policy/${selectedWf.code || selectedWf.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(policyConfig),
      });
      const json = await safeJson(res);
      if (json?.success && json.data) {
        setPolicyConfig(json.data);
        setActionMessage({ type: 'success', text: `Governance policy v${json.data.version} updated successfully` });
      } else {
        setActionMessage({ type: 'error', text: json?.message || 'Failed to save governance policy' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to save governance policy' });
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleAddStage = () => {
    if (!policyConfig) return;
    const currentStages = policyConfig.stages || [];
    const newStageNumber = currentStages.length + 1;
    const newStage = {
      stageNumber: newStageNumber,
      stageName: `Stage ${newStageNumber} Review`,
      requiredRole: 'MANAGER',
      allowedRoles: ['MANAGER', 'ADMIN'],
      slaHours: 24,
      autoEscalateTo: 'ADMIN',
    };
    setPolicyConfig({
      ...policyConfig,
      totalStages: newStageNumber,
      stages: [...currentStages, newStage],
    });
  };

  const handleRemoveStage = (stageNumber: number) => {
    if (!policyConfig || !policyConfig.stages || policyConfig.stages.length <= 1) return;
    const filtered = policyConfig.stages
      .filter((s: any) => s.stageNumber !== stageNumber)
      .map((s: any, idx: number) => ({
        ...s,
        stageNumber: idx + 1,
      }));
    setPolicyConfig({
      ...policyConfig,
      totalStages: filtered.length,
      stages: filtered,
    });
  };

  const handleStageFieldChange = (stageNumber: number, field: string, value: any) => {
    if (!policyConfig || !policyConfig.stages) return;
    const updated = policyConfig.stages.map((s: any) => {
      if (s.stageNumber === stageNumber) {
        return { ...s, [field]: value };
      }
      return s;
    });
    setPolicyConfig({
      ...policyConfig,
      stages: updated,
    });
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  useEffect(() => {
    if (selectedWf) {
      fetchWfDetails(selectedWf.id);
    }
  }, [selectedWf]);

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newWf),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowAddWfModal(false);
        setNewWf({ code: '', name: '', description: '', category: 'APPROVAL', moduleCode: 'PROCUREMENT', triggerType: 'THRESHOLD', minApprovalAmount: 10000, slaHours: 24 });
        setActionMessage({ type: 'success', text: 'Workflow created successfully' });
        fetchWorkflows();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to create workflow' });
    }
  };

  const handleDuplicateWorkflow = async (wfId: string) => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/workflows/${wfId}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({ type: 'success', text: 'Workflow duplicated successfully' });
        fetchWorkflows();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to duplicate workflow' });
    }
  };

  const handlePublishWorkflow = async (wfId: string) => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/workflows/${wfId}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({ type: 'success', text: 'Workflow version 1 published to production' });
        fetchWorkflows();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to publish workflow' });
    }
  };

  const handleCreateState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWf) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/workflows/states', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newState, workflowId: selectedWf.id }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowAddStateModal(false);
        setNewState({ stateCode: '', name: '', type: 'INTERMEDIATE', color: '#3b82f6', displayOrder: states.length + 1 });
        setActionMessage({ type: 'success', text: 'State added to workflow' });
        fetchWfDetails(selectedWf.id);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to create state' });
    }
  };

  const handleDeleteState = async (stateId: string) => {
    if (!confirm('Are you sure you want to remove this workflow state?')) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/workflows/states/${stateId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({ type: 'success', text: 'State deleted' });
        fetchWfDetails(selectedWf.id);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to delete state' });
    }
  };

  const handleCreateTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWf) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/workflows/transitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newTr, workflowId: selectedWf.id }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowAddTrModal(false);
        setActionMessage({ type: 'success', text: 'Transition configured successfully' });
        fetchWfDetails(selectedWf.id);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to create transition' });
    }
  };

  const handleDeleteTransition = async (transitionId: string) => {
    if (!confirm('Are you sure you want to delete this transition rule?')) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/workflows/transitions/${transitionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({ type: 'success', text: 'Transition deleted' });
        fetchWfDetails(selectedWf.id);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to delete transition' });
    }
  };

  const runSimulation = async () => {
    if (!selectedWf) return;
    const rates: Record<string, number> = { AED: 1, USD: 3.6725, EUR: 4.02, SAR: 0.98, GBP: 4.75, INR: 0.044 };
    const rate = rates[simCurrency] || 1;
    const baseVal = simAmount * rate;

    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/workflows/policy/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          entityType: selectedWf.code || selectedWf.moduleCode,
          user: {
            id: simUserId,
            role: simRole,
            department: simDepartment,
          },
          action: simAction,
          currentStage: 1,
          entityData: {
            creatorId: 'usr-sim-creator',
            verifierId: simAction === 'APPROVE' ? 'usr-sim-verifier' : undefined,
            department: simDepartment,
            amount: baseVal,
          },
        }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setSimResult({
          inputAmount: simAmount,
          currency: simCurrency,
          exchangeRate: rate,
          baseAmountAED: baseVal,
          requesterRole: simRole,
          action: simAction,
          isEligible: json.data.isEligible,
          reason: json.data.reason,
          activeStage: json.data.activeStage,
          policyVersion: json.data.policyVersion,
          slaHours: json.data.activeStage?.slaHours || 24,
        });
      }
    } catch (err) {
      console.error('Simulation evaluation failed:', err);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      
      <DSSectionHeader
        title="Enterprise Workflow Engine & State Machine Builder"
        subtitle="Admin-controlled state machine, dynamic approver matrices, multi-currency limits, SLA rules & delegation governance."
        action={
          <div className="flex items-center space-x-2">
            <DSButton
              variant="outline"
              size="sm"
              isLoading={loading}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={fetchWorkflows}
            >
              Refresh
            </DSButton>

            <DSButton
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowAddWfModal(true)}
            >
              Create Workflow
            </DSButton>
          </div>
        }
      />

      {/* Notification Banner */}
      {actionMessage && (
        <div className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
          actionMessage.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
        }`}>
          <div className="flex items-center space-x-2">
            {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span className="font-semibold">{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
      )}

      {/* Main Layout: Master Workflows List on Left, Detail Canvas on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left List of Configured Workflows */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Workflows ({workflows.length})
            </h3>
            <span className="text-purple-600 font-mono text-[10px] bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
              Admin Mode
            </span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {workflows.map((wf) => {
              const isSelected = selectedWf?.id === wf.id;
              return (
                <div
                  key={wf.id}
                  onClick={() => setSelectedWf(wf)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-300 dark:border-purple-800 shadow-sm'
                      : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-purple-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{wf.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateWorkflow(wf.id);
                      }}
                      className="p-1 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                      title="Clone Workflow"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 mt-2">
                    <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                      {wf.code}
                    </span>
                    <span className="text-[10px] text-slate-500">{wf.moduleCode || wf.module}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      wf.isEnabled !== false ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {wf.isEnabled !== false ? 'ACTIVE' : 'DRAFT'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Canvas: Details, States, Transitions, SLA & Simulator */}
        {selectedWf && (
          <div className="lg:col-span-2 space-y-5">
            
            {/* Selected Workflow Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                      {selectedWf.moduleCode || selectedWf.module || 'CROSS_MODULE'}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">{selectedWf.code}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">{selectedWf.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedWf.description || 'Configurable multi-level governance workflow.'}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePublishWorkflow(selectedWf.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-sm transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Publish v1.0</span>
                  </button>

                  <button
                    onClick={() => setShowAddStateModal(true)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-xl flex items-center space-x-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5 text-purple-600" />
                    <span>Add State</span>
                  </button>

                  <button
                    onClick={() => setShowAddTrModal(true)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-sm transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Transition</span>
                  </button>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex items-center space-x-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  id="tab-btn-governance-policy"
                  onClick={() => setActiveTab('governance')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                    activeTab === 'governance' ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Universal Governance Policy</span>
                </button>

                <button
                  id="tab-btn-states"
                  onClick={() => setActiveTab('states')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                    activeTab === 'states' ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>States ({states.length})</span>
                </button>

                <button
                  id="tab-btn-transitions"
                  onClick={() => setActiveTab('transitions')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                    activeTab === 'transitions' ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <GitMerge className="w-3.5 h-3.5" />
                  <span>Transitions ({transitions.length})</span>
                </button>

                <button
                  id="tab-btn-sla"
                  onClick={() => setActiveTab('sla')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                    activeTab === 'sla' ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>SLA & Escalation</span>
                </button>

                <button
                  id="tab-btn-simulator"
                  onClick={() => {
                    setActiveTab('simulator');
                    runSimulation();
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                    activeTab === 'simulator' ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Rule Simulator</span>
                </button>
              </div>
            </div>

            {/* TAB: GOVERNANCE POLICY */}
            {activeTab === 'governance' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-6">
                
                {/* Header & Save Action */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                        Administrator Workflow Governance Policy
                      </h4>
                      {policyConfig && (
                        <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-[10px] font-mono font-bold rounded-full">
                          Policy v{policyConfig.version || 1}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Configure dynamic approval stages, separation of duties, role requirements, and scope matching without hardcoding.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <DSButton
                      id="btn-save-workflow-policy"
                      variant="primary"
                      size="sm"
                      isLoading={savingPolicy}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                      onClick={handleSavePolicy}
                    >
                      Save & Apply Policy
                    </DSButton>
                  </div>
                </div>

                {policyLoading ? (
                  <div className="p-8 text-center text-slate-400 flex items-center justify-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                    <span>Loading governance policy matrix...</span>
                  </div>
                ) : policyConfig ? (
                  <div className="space-y-6">
                    
                    {/* 1. Gate Requirements */}
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                      <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] block">
                        1. Gate Requirements
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white text-xs block">Approval Required</span>
                            <span className="text-[10px] text-slate-500 block">Enforce formal multi-stage approval for transactions</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={policyConfig.approvalRequired !== false}
                            onChange={(e) => setPolicyConfig({ ...policyConfig, approvalRequired: e.target.checked })}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white text-xs block">Verification Required</span>
                            <span className="text-[10px] text-slate-500 block">Mandate an initial verification checkpoint prior to approval</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={policyConfig.verificationRequired === true}
                            onChange={(e) => setPolicyConfig({ ...policyConfig, verificationRequired: e.target.checked })}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                        </label>
                      </div>
                    </div>

                    {/* 2. Multi-Step Approval Stages & Role Assignment */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] block">
                            2. Configurable Multi-Step Approval Stages ({policyConfig.stages?.length || 0})
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Configure each stage's title, mandatory role, SLA limits, and auto-escalation targets.
                          </span>
                        </div>
                        <button
                          id="btn-add-approval-stage"
                          type="button"
                          onClick={handleAddStage}
                          className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg font-bold text-xs flex items-center space-x-1 hover:bg-purple-100 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Stage</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {policyConfig.stages?.map((st: any) => (
                          <div
                            key={`stage-config-${st.stageNumber}`}
                            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded text-[10px]">
                                  Stage {st.stageNumber}
                                </span>
                                <input
                                  type="text"
                                  value={st.stageName || ''}
                                  onChange={(e) => handleStageFieldChange(st.stageNumber, 'stageName', e.target.value)}
                                  placeholder="Stage Name (e.g. Finance Controller Review)"
                                  className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold w-64"
                                />
                              </div>

                              {policyConfig.stages.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStage(st.stageNumber)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                                  title="Remove Stage"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Required Approver Role</label>
                                <select
                                  value={st.requiredRole || 'MANAGER'}
                                  onChange={(e) => handleStageFieldChange(st.stageNumber, 'requiredRole', e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                                >
                                  <option value="ADMIN">ADMIN (System Administrator)</option>
                                  <option value="MANAGER">MANAGER (Department Manager)</option>
                                  <option value="HR_MANAGER">HR_MANAGER (Human Resources In-Charge)</option>
                                  <option value="FINANCE_CONTROLLER">FINANCE_CONTROLLER (Finance Controller)</option>
                                  <option value="PROJECT_MANAGER">PROJECT_MANAGER (Project Manager)</option>
                                  <option value="SUPERVISOR">SUPERVISOR (Site Supervisor)</option>
                                  <option value="INCHARGE">INCHARGE (Site In-Charge)</option>
                                  <option value="STORE_KEEPER">STORE_KEEPER (Warehouse Keeper)</option>
                                  <option value="DIRECTOR">DIRECTOR (Commercial Director)</option>
                                  <option value="TREASURY_OFFICER">TREASURY_OFFICER (Treasury & Disbursements)</option>
                                  <option value="ENGINEER">ENGINEER (Site Engineer)</option>
                                  <option value="ACCOUNTANT">ACCOUNTANT (Accounts Officer)</option>
                                  <option value="AUDITOR">AUDITOR (Internal QA Auditor)</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-semibold text-slate-500 mb-1">SLA Turnaround (Hours)</label>
                                <input
                                  type="number"
                                  value={st.slaHours || 24}
                                  onChange={(e) => handleStageFieldChange(st.stageNumber, 'slaHours', Number(e.target.value))}
                                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Auto-Escalate To</label>
                                <select
                                  value={st.autoEscalateTo || 'ADMIN'}
                                  onChange={(e) => handleStageFieldChange(st.stageNumber, 'autoEscalateTo', e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                                >
                                  <option value="ADMIN">ADMIN</option>
                                  <option value="DIRECTOR">DIRECTOR</option>
                                  <option value="MANAGER">MANAGER</option>
                                  <option value="FINANCE_CONTROLLER">FINANCE_CONTROLLER</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3. Separation of Duties (Maker-Checker & 4-Eyes Governance) */}
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                      <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] block">
                        3. Separation of Duties & Anti-Fraud Governance
                      </span>
                      <div className="space-y-2">
                        <label className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white text-xs block">
                              Prevent Maker from Verifying
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              The user who created or entered the transaction cannot perform the verification step
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={policyConfig.separationOfDuties?.preventMakerVerification !== false}
                            onChange={(e) => setPolicyConfig({
                              ...policyConfig,
                              separationOfDuties: {
                                ...policyConfig.separationOfDuties,
                                preventMakerVerification: e.target.checked,
                              },
                            })}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white text-xs block">
                              Prevent Maker from Approving (Strict Maker-Checker)
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              The user who created or prepared the transaction cannot approve it, regardless of administrative permissions
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={policyConfig.separationOfDuties?.preventMakerApproval !== false}
                            onChange={(e) => setPolicyConfig({
                              ...policyConfig,
                              separationOfDuties: {
                                ...policyConfig.separationOfDuties,
                                preventMakerApproval: e.target.checked,
                              },
                            })}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white text-xs block">
                              Prevent Verifier from Approving (4-Eyes Principle)
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              The user who performed the verification step cannot also be the final approver (Mandates at least two distinct individuals)
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={policyConfig.separationOfDuties?.preventVerifierApproval !== false}
                            onChange={(e) => setPolicyConfig({
                              ...policyConfig,
                              separationOfDuties: {
                                ...policyConfig.separationOfDuties,
                                preventVerifierApproval: e.target.checked,
                              },
                            })}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                        </label>
                      </div>
                    </div>

                    {/* 4. Scope Matching & Context Routing */}
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                      <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] block">
                        4. Scope Matching & Organizational Context
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white text-xs block">
                              Match Department
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              Approver must belong to the requester's department
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={policyConfig.scopeMatching?.matchDepartment === true}
                            onChange={(e) => setPolicyConfig({
                              ...policyConfig,
                              scopeMatching: {
                                ...policyConfig.scopeMatching,
                                matchDepartment: e.target.checked,
                              },
                            })}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white text-xs block">
                              Match Project / Site Location
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              Approver must be assigned to the same project/site
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={policyConfig.scopeMatching?.matchProject === true}
                            onChange={(e) => setPolicyConfig({
                              ...policyConfig,
                              scopeMatching: {
                                ...policyConfig.scopeMatching,
                                matchProject: e.target.checked,
                              },
                            })}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                        </label>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No active policy loaded for this workflow module. Click Refresh to synchronize.
                  </div>
                )}
              </div>
            )}

            {/* TAB: STATES */}
            {activeTab === 'states' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-purple-600" />
                    <span>State Machine Lifecycle Nodes</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Total {states.length} states registered</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {states.map((st) => (
                    <div key={st.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 relative group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color || '#3b82f6' }} />
                          <span className="font-bold text-slate-900 dark:text-white text-xs">{st.name}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteState(st.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Delete State"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 mt-1">{st.stateCode}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          st.type === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                          st.type === 'REJECTED' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                          st.type === 'INITIAL' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                          'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {st.type || 'INTERMEDIATE'}
                        </span>
                        <span className="text-[10px] text-slate-400">Order: {st.displayOrder}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: TRANSITIONS */}
            {activeTab === 'transitions' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center space-x-2">
                    <GitMerge className="w-4 h-4 text-purple-600" />
                    <span>State Transitions & Approver Routing Matrix</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">{transitions.length} transition rules</span>
                </div>

                <div className="space-y-2.5">
                  {transitions.map((tr) => (
                    <div key={tr.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 px-2.5 py-1 rounded">
                          {tr.fromStateCode}
                        </span>
                        <ArrowRight className="w-4 h-4 text-purple-500" />
                        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded">
                          {tr.toStateCode}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-xs bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800">
                          {tr.actionLabel}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          Role: {tr.requiredRole || 'ANY'}
                        </span>
                        <button
                          onClick={() => handleDeleteTransition(tr.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Delete Transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: SLA & ESCALATIONS */}
            {activeTab === 'sla' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>SLA Governance & Threshold Policies</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Target SLA Duration</span>
                    <div className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span>{selectedWf.slaHours || 24} Hours</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Tasks exceeding this turnaround limit are automatically flagged as OVERDUE with notifications.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Min Financial Threshold</span>
                    <div className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                      <span>AED {(selectedWf.minApprovalAmount || 10000).toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Commercial transactions above this threshold require tiered manager sign-off.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/20 space-y-2">
                  <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-300 font-bold">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Auto-Escalation Hierarchy</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    If an approval remains unacknowledged past SLA duration, the engine automatically notifies the <strong>Commercial Director</strong> and copies the <strong>Project Manager</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* TAB: RULE SIMULATOR */}
            {activeTab === 'simulator' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-purple-600" />
                    <span>Workflow Engine Rule & Threshold Simulator</span>
                  </h4>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 px-2 py-0.5 rounded font-mono">
                    Zero Hardcoding Testbench
                  </span>
                </div>

                {/* Simulator Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Transaction Amount</label>
                    <input
                      type="number"
                      value={simAmount}
                      onChange={(e) => setSimAmount(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Currency</label>
                    <select
                      value={simCurrency}
                      onChange={(e) => setSimCurrency(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                    >
                      <option value="AED">AED (Base Currency)</option>
                      <option value="USD">USD (Rate: 3.6725)</option>
                      <option value="EUR">EUR (Rate: 4.0200)</option>
                      <option value="SAR">SAR (Rate: 0.9800)</option>
                      <option value="GBP">GBP (Rate: 4.7500)</option>
                      <option value="INR">INR (Rate: 0.0440)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Simulated User Role</label>
                    <select
                      value={simRole}
                      onChange={(e) => setSimRole(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="HR_MANAGER">HR_MANAGER</option>
                      <option value="FINANCE_CONTROLLER">FINANCE_CONTROLLER</option>
                      <option value="PROJECT_MANAGER">PROJECT_MANAGER</option>
                      <option value="SUPERVISOR">SUPERVISOR</option>
                      <option value="INCHARGE">INCHARGE</option>
                      <option value="DIRECTOR">DIRECTOR</option>
                      <option value="ENGINEER">ENGINEER</option>
                      <option value="ACCOUNTANT">ACCOUNTANT</option>
                      <option value="AUDITOR">AUDITOR</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Workflow Action</label>
                    <select
                      value={simAction}
                      onChange={(e) => setSimAction(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                    >
                      <option value="CREATE">CREATE (Maker)</option>
                      <option value="VERIFY">VERIFY (Checker)</option>
                      <option value="APPROVE">APPROVE (Authorizer)</option>
                      <option value="REJECT">REJECT</option>
                    </select>
                  </div>
                </div>

                <DSButton
                  variant="primary"
                  size="sm"
                  leftIcon={<Play className="w-3.5 h-3.5" />}
                  onClick={runSimulation}
                >
                  Evaluate Policy Governance Path
                </DSButton>

                {/* Simulation Output */}
                {simResult && (
                  <div className={`p-4 rounded-xl border space-y-3 ${
                    simResult.isEligible 
                      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20' 
                      : 'border-rose-200 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20'
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                      <div className="flex items-center space-x-2">
                        {simResult.isEligible ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                        )}
                        <span className={`font-bold ${simResult.isEligible ? 'text-emerald-900 dark:text-emerald-300' : 'text-rose-900 dark:text-rose-300'}`}>
                          {simResult.isEligible ? 'User Authorization Granted' : 'User Authorization Denied'}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-bold">
                        Policy v{simResult.policyVersion || 1}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <strong>Evaluation Reason:</strong> {simResult.reason}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Simulated Role / Action:</span>
                        <span className="font-bold font-mono">{simResult.requesterRole} ({simResult.action})</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Base Value (AED):</span>
                        <span className="font-bold font-mono text-emerald-600">AED {simResult.baseAmountAED?.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Active Target Stage:</span>
                        <span className="font-bold text-purple-700 dark:text-purple-300">
                          {simResult.activeStage?.stageName || `Stage ${simResult.activeStage?.stageNumber || 1}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">SLA Turnaround:</span>
                        <span className="font-bold">{simResult.slaHours} Hours</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>

      {/* Modal: Create Workflow */}
      {showAddWfModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <GitMerge className="w-4 h-4 text-purple-600" />
                <span>Create Enterprise Workflow</span>
              </h3>
              <button onClick={() => setShowAddWfModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleCreateWorkflow} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Workflow Code (Unique)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WF-CIVIL-PO"
                  value={newWf.code}
                  onChange={(e) => setNewWf({ ...newWf, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Workflow Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Material Requisition Approval"
                  value={newWf.name}
                  onChange={(e) => setNewWf({ ...newWf, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={newWf.category}
                    onChange={(e) => setNewWf({ ...newWf, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="APPROVAL">APPROVAL</option>
                    <option value="REVIEW">REVIEW</option>
                    <option value="INSPECTION">INSPECTION</option>
                    <option value="FINANCE">FINANCE</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Module</label>
                  <select
                    value={newWf.moduleCode}
                    onChange={(e) => setNewWf({ ...newWf, moduleCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="PROCUREMENT">PROCUREMENT</option>
                    <option value="FINANCE">FINANCE</option>
                    <option value="PROJECTS">PROJECTS</option>
                    <option value="INVENTORY">INVENTORY</option>
                    <option value="HR">HR</option>
                    <option value="QAQC">QAQC</option>
                    <option value="HSE">HSE</option>
                    <option value="CROSS_MODULE">CROSS MODULE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">SLA Limit (Hours)</label>
                  <input
                    type="number"
                    value={newWf.slaHours}
                    onChange={(e) => setNewWf({ ...newWf, slaHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Min Threshold (AED)</label>
                  <input
                    type="number"
                    value={newWf.minApprovalAmount}
                    onChange={(e) => setNewWf({ ...newWf, minApprovalAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe governance limits or conditions..."
                  value={newWf.description}
                  onChange={(e) => setNewWf({ ...newWf, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddWfModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Create Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add State */}
      {showAddStateModal && selectedWf && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>Add Workflow State</span>
              </h3>
              <button onClick={() => setShowAddStateModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleCreateState} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">State Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TECHNICAL_REVIEW"
                  value={newState.stateCode}
                  onChange={(e) => setNewState({ ...newState, stateCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">State Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Technical Engineering Review"
                  value={newState.name}
                  onChange={(e) => setNewState({ ...newState, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">State Type</label>
                  <select
                    value={newState.type}
                    onChange={(e) => setNewState({ ...newState, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="INITIAL">INITIAL</option>
                    <option value="INTERMEDIATE">INTERMEDIATE</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="RETURNED">RETURNED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Color</label>
                  <input
                    type="color"
                    value={newState.color}
                    onChange={(e) => setNewState({ ...newState, color: e.target.value })}
                    className="w-full h-9 p-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddStateModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Save State
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Transition */}
      {showAddTrModal && selectedWf && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <GitMerge className="w-4 h-4 text-purple-600" />
                <span>Configure State Transition</span>
              </h3>
              <button onClick={() => setShowAddTrModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleCreateTransition} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">From State</label>
                  <select
                    value={newTr.fromStateCode}
                    onChange={(e) => setNewTr({ ...newTr, fromStateCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    {states.map((st) => (
                      <option key={st.id} value={st.stateCode}>{st.name} ({st.stateCode})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">To State</label>
                  <select
                    value={newTr.toStateCode}
                    onChange={(e) => setNewTr({ ...newTr, toStateCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    {states.map((st) => (
                      <option key={st.id} value={st.stateCode}>{st.name} ({st.stateCode})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Action Button Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Approve & Release PO"
                  value={newTr.actionLabel}
                  onChange={(e) => setNewTr({ ...newTr, actionLabel: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Required Approver Role</label>
                <select
                  value={newTr.requiredRole}
                  onChange={(e) => setNewTr({ ...newTr, requiredRole: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  <option value="SUPERVISOR">SUPERVISOR</option>
                  <option value="INCHARGE">SITE INCHARGE</option>
                  <option value="ENGINEER">ENGINEER</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="DIRECTOR">DIRECTOR / COMMERCIAL HEAD</option>
                  <option value="ADMIN">ADMIN / EXECUTIVE</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddTrModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Save Transition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
