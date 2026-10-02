import React, { useEffect, useState } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { 
  ShieldCheck, KeyRound, Plus, RefreshCw, Sliders, Eye, EyeOff, Lock, Play, 
  Layers, CheckCircle2, AlertCircle, FileSpreadsheet, Building2, UserCheck, Sparkles,
  User, Calendar, Clock, Copy, Trash2, ArrowRight, ShieldAlert, Check
} from 'lucide-react';
import {
  DSSectionHeader,
  DSCard,
  DSButton,
  DSAlert,
  DSModal,
  DSField
} from '../ui/design-system';

export const AbacPermissionManagerView: React.FC = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<any | null>(null);
  const [fieldPerms, setFieldPerms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // User Overrides State
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [userEffectiveSummary, setUserEffectiveSummary] = useState<any | null>(null);
  const [allSystemPermissions, setAllSystemPermissions] = useState<any[]>([]);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);

  // Form State for Override
  const [overrideForm, setOverrideForm] = useState({
    permissionId: 'perm-001',
    granted: true,
    startDate: '',
    endDate: '',
    reason: '',
  });

  // Form State for Copy
  const [copyForm, setCopyForm] = useState({
    sourceId: '',
    isSourceRole: false,
  });

  // Modals
  const [showAddPolicyModal, setShowAddPolicyModal] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    code: '',
    name: '',
    description: '',
    effect: 'ALLOW',
    priority: 100,
  });

  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [newFieldRule, setNewFieldRule] = useState({
    moduleCode: 'HR',
    entityName: 'EMPLOYEE',
    fieldName: 'salary',
    visibility: 'MASKED',
  });

  // Simulator State
  const [simParams, setSimParams] = useState({
    userId: 'usr-eng-101',
    role: 'ENGINEER',
    departmentId: 'dept-site-ops',
    projectId: 'proj-water-01',
    moduleCode: 'PROJECTS',
    featureCode: 'BOQ_RATES',
  });
  const [simResult, setSimResult] = useState<any | null>(null);
  const [simulating, setSimulating] = useState(false);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/abac/policies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success && Array.isArray(json.data)) {
        setPolicies(json.data);
        if (json.data.length > 0 && !selectedPolicy) {
          setSelectedPolicy(json.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch ABAC policies:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFieldPerms = async () => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/abac/field-permissions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) setFieldPerms(json.data || []);
    } catch (err) {
      console.error('Failed to fetch field permissions:', err);
    }
  };

  const fetchUsersAndPermissions = async () => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const [uRes, pRes] = await Promise.all([
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/permissions', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const uJson = await safeJson(uRes);
      const pJson = await safeJson(pRes);

      if (uJson?.success && Array.isArray(uJson.data)) {
        setUsers(uJson.data);
        if (uJson.data.length > 0 && !selectedUserId) {
          setSelectedUserId(uJson.data[0].id);
        }
      }
      if (pJson?.success && Array.isArray(pJson.data)) {
        setAllSystemPermissions(pJson.data);
      }
    } catch (err) {
      console.error('Failed to fetch users or permissions:', err);
    }
  };

  const fetchUserEffectiveSummary = async (userId: string) => {
    if (!userId) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/admin/users/${userId}/effective-permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setUserEffectiveSummary(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch user effective permissions summary:', err);
    }
  };

  useEffect(() => {
    fetchPolicies();
    fetchFieldPerms();
    fetchUsersAndPermissions();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserEffectiveSummary(selectedUserId);
    }
  }, [selectedUserId]);

  const handleSaveUserOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/admin/user-permission-override', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUserId,
          permissionId: overrideForm.permissionId,
          granted: overrideForm.granted,
          startDate: overrideForm.startDate || undefined,
          endDate: overrideForm.endDate || undefined,
          expiresAt: overrideForm.endDate || undefined,
          reason: overrideForm.reason,
        }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowOverrideModal(false);
        setActionMessage({ type: 'success', text: `Permission override saved for user.` });
        fetchUserEffectiveSummary(selectedUserId);
      } else {
        setActionMessage({ type: 'error', text: json?.message || 'Failed to save override' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Error saving user permission override' });
    }
  };

  const handleDeleteOverride = async (permissionId: string) => {
    if (!selectedUserId) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/admin/users/${selectedUserId}/permission-overrides/${permissionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({ type: 'success', text: 'User permission override removed' });
        fetchUserEffectiveSummary(selectedUserId);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to delete permission override' });
    }
  };

  const handleCopyPermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !copyForm.sourceId) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/admin/copy-permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sourceId: copyForm.sourceId,
          targetUserId: selectedUserId,
          isSourceRole: copyForm.isSourceRole,
        }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowCopyModal(false);
        setActionMessage({ type: 'success', text: 'Permissions copied successfully!' });
        fetchUserEffectiveSummary(selectedUserId);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Error copying permissions' });
    }
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/abac/policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPolicy),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowAddPolicyModal(false);
        setNewPolicy({ code: '', name: '', description: '', effect: 'ALLOW', priority: 100 });
        setActionMessage({ type: 'success', text: 'ABAC Policy created successfully' });
        fetchPolicies();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to create ABAC policy' });
    }
  };

  const handleCreateFieldRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolicy) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/abac/field-permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newFieldRule, policyId: selectedPolicy.id }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowAddFieldModal(false);
        setActionMessage({ type: 'success', text: 'Field-level security rule created' });
        fetchFieldPerms();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to save field security rule' });
    }
  };

  const handleRunSimulation = async () => {
    setSimulating(true);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/abac/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(simParams),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setSimResult(json.data?.evaluationResult);
        setActionMessage({ type: 'success', text: 'ABAC Permission simulation evaluated' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Simulation failed' });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      
      <DSSectionHeader
        title="Enterprise ABAC Permission Engine"
        subtitle="Attribute-Based Access Control extending RBAC with Row-Level, Field-Level, & Ownership Scopes."
        action={
          <div className="flex items-center space-x-2">
            <DSButton
              variant="outline"
              size="sm"
              isLoading={loading}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={() => { fetchPolicies(); fetchFieldPerms(); }}
            >
              Refresh
            </DSButton>

            <DSButton
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowAddPolicyModal(true)}
            >
              New Security Policy
            </DSButton>
          </div>
        }
      />

      {/* Notification Banner */}
      {actionMessage && (
        <div className="p-3.5 rounded-xl text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
      )}

      {/* User Specific Permission Override & Effective Permissions Inspector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              User Specific Permission Override & Effective Permissions Engine
            </h3>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <label className="font-semibold text-slate-600 dark:text-slate-400">Select User:</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email}) - {u.roleName || u.role}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowOverrideModal(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Set User Override</span>
            </button>

            <button
              onClick={() => setShowCopyModal(true)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold rounded-xl flex items-center space-x-1.5 border border-slate-200 dark:border-slate-700"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Permissions</span>
            </button>
          </div>
        </div>

        {userEffectiveSummary ? (
          <div className="space-y-4">
            {/* User Overview Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50/70 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Target User</span>
                <span className="font-bold text-slate-900 dark:text-white text-xs">{userEffectiveSummary.userName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Role</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">{userEffectiveSummary.roleName} ({userEffectiveSummary.roleCode})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Overrides</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 text-xs">{userEffectiveSummary.overrides?.length || 0} Override Rule(s)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Effective Perms</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">{userEffectiveSummary.effectivePermissions?.length || 0} Granted Permission(s)</span>
              </div>
            </div>

            {/* Overrides Table */}
            {userEffectiveSummary.overrides && userEffectiveSummary.overrides.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider">Active User Overrides</h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {userEffectiveSummary.overrides.map((ov: any) => (
                    <div key={ov.id} className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          ov.granted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {ov.granted ? 'ALLOW GRANT' : 'EXPLICIT DENY'}
                        </span>
                        <div>
                          <span className="font-mono font-bold text-indigo-600 text-xs">{ov.permissionCode || ov.permissionId}</span>
                          {ov.reason && <p className="text-[10px] text-slate-500">{ov.reason}</p>}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-[10px] text-slate-500">
                        {(ov.startDate || ov.endDate || ov.expiresAt) && (
                          <div className="flex items-center space-x-1 font-mono">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span>{ov.startDate ? `From: ${ov.startDate.split('T')[0]}` : ''} {ov.endDate || ov.expiresAt ? `To: ${(ov.endDate || ov.expiresAt).split('T')[0]}` : ''}</span>
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteOverride(ov.permissionId)}
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded-lg"
                          title="Remove Override"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Calculated Effective Permissions Chips */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider">Computed Effective Permissions Matrix</h4>
              <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                {userEffectiveSummary.effectivePermissions.map((code: string) => (
                  <span key={code} className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono font-bold text-[10px] rounded-lg shadow-2xs flex items-center space-x-1">
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span>{code}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-slate-400">Loading user permission profile...</div>
        )}
      </div>

      {/* Policy Master & Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Configured ABAC Policies */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center justify-between">
            <span>Dynamic Policies ({policies.length})</span>
            <span className="text-indigo-600 font-mono text-[10px]">Active</span>
          </h3>

          <div className="space-y-2">
            {policies.map((pol) => {
              const isSelected = selectedPolicy?.id === pol.id;
              return (
                <div
                  key={pol.id}
                  onClick={() => setSelectedPolicy(pol)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800 shadow-sm'
                      : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{pol.name}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      pol.effect === 'ALLOW' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {pol.effect}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{pol.description}</p>

                  <div className="flex items-center space-x-2 mt-2">
                    <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                      {pol.code}
                    </span>
                    <span className="text-[10px] text-slate-400">Prio: {pol.priority}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Field Level Security Rules & Permission Simulator */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Field Level Security Rules Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center space-x-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                <span>Field-Level Security Rules ({fieldPerms.length})</span>
              </h3>

              <button
                onClick={() => setShowAddFieldModal(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Field Rule</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {fieldPerms.map((fp) => (
                <div key={fp.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-indigo-600 font-mono text-[11px]">{fp.moduleCode}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{fp.entityName}.{fp.fieldName}</span>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    fp.visibility === 'VISIBLE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    fp.visibility === 'MASKED' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    fp.visibility === 'READ_ONLY' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {fp.visibility}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ABAC Real-Time Permission Simulator */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Enterprise ABAC Permission Simulator</span>
              </h3>
              <button
                onClick={handleRunSimulation}
                disabled={simulating}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center space-x-2 shadow-sm"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{simulating ? 'Evaluating...' : 'Simulate Policy'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Role</label>
                <select
                  value={simParams.role}
                  onChange={(e) => setSimParams({ ...simParams, role: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ENGINEER">ENGINEER</option>
                  <option value="INSPECTOR">INSPECTOR</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Module</label>
                <select
                  value={simParams.moduleCode}
                  onChange={(e) => setSimParams({ ...simParams, moduleCode: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  <option value="PROJECTS">PROJECTS</option>
                  <option value="PROCUREMENT">PROCUREMENT</option>
                  <option value="HR">HR</option>
                  <option value="FLEET">FLEET</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Project</label>
                <input
                  type="text"
                  value={simParams.projectId}
                  onChange={(e) => setSimParams({ ...simParams, projectId: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Simulation Result Output Box */}
            {simResult && (
              <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-2">
                  <span>EVALUATION RESULT: {simResult.effect}</span>
                  <span className="text-purple-400 text-[10px]">SCOPE: {simResult.scope}</span>
                </div>
                <div className="text-[11px] text-slate-300 space-y-1">
                  <div>• Feature Visibility: <span className="text-amber-300">{simResult.featureVisibility}</span></div>
                  <div>• Permitted Actions: <span className="text-blue-300">{simResult.actions.join(', ')}</span></div>
                  <div>• Restricted Fields Count: <span className="text-emerald-300">{simResult.fieldRestrictions.length}</span></div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Modal: Create Policy */}
      {showAddPolicyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <span>Create Enterprise ABAC Policy</span>
              </h3>
              <button onClick={() => setShowAddPolicyModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleCreatePolicy} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Policy Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. POLICY_STORE_KEEPER_ROW_LIMIT"
                  value={newPolicy.code}
                  onChange={(e) => setNewPolicy({ ...newPolicy, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Policy Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Store Keeper Warehouse Row Limit"
                  value={newPolicy.name}
                  onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Policy Effect</label>
                  <select
                    value={newPolicy.effect}
                    onChange={(e) => setNewPolicy({ ...newPolicy, effect: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="ALLOW">ALLOW</option>
                    <option value="DENY">DENY</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <input
                    type="number"
                    value={newPolicy.priority}
                    onChange={(e) => setNewPolicy({ ...newPolicy, priority: parseInt(e.target.value) || 100 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newPolicy.description}
                  onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddPolicyModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Field Level Security Rule */}
      {showAddFieldModal && selectedPolicy && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                <span>Add Field Level Security Rule</span>
              </h3>
              <button onClick={() => setShowAddFieldModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleCreateFieldRule} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Module</label>
                  <select
                    value={newFieldRule.moduleCode}
                    onChange={(e) => setNewFieldRule({ ...newFieldRule, moduleCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="HR">HR</option>
                    <option value="PROJECTS">PROJECTS</option>
                    <option value="PROCUREMENT">PROCUREMENT</option>
                    <option value="FLEET">FLEET</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Visibility</label>
                  <select
                    value={newFieldRule.visibility}
                    onChange={(e) => setNewFieldRule({ ...newFieldRule, visibility: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="VISIBLE">VISIBLE</option>
                    <option value="READ_ONLY">READ_ONLY</option>
                    <option value="MASKED">MASKED</option>
                    <option value="HIDDEN">HIDDEN</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Entity Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EMPLOYEE, PURCHASE_ORDER, BOQ_ITEM"
                  value={newFieldRule.entityName}
                  onChange={(e) => setNewFieldRule({ ...newFieldRule, entityName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono uppercase text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Field Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. salary, bankDetails, unitRate"
                  value={newFieldRule.fieldName}
                  onChange={(e) => setNewFieldRule({ ...newFieldRule, fieldName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddFieldModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Save Field Security
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Set User Permission Override */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Configure User Permission Override</span>
              </h3>
              <button onClick={() => setShowOverrideModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleSaveUserOverride} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Permission</label>
                <select
                  value={overrideForm.permissionId}
                  onChange={(e) => setOverrideForm({ ...overrideForm, permissionId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-xs"
                >
                  {allSystemPermissions.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.module}] {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Override Action / Effect</label>
                <select
                  value={overrideForm.granted ? 'GRANT' : 'DENY'}
                  onChange={(e) => setOverrideForm({ ...overrideForm, granted: e.target.value === 'GRANT' })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs"
                >
                  <option value="GRANT">ALLOW / FORCE GRANT (Explicit Permission)</option>
                  <option value="DENY">DENY / FORCE REVOKE (Explicit Denial)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date (Optional)</label>
                  <input
                    type="date"
                    value={overrideForm.startDate}
                    onChange={(e) => setOverrideForm({ ...overrideForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">End / Expiry Date</label>
                  <input
                    type="date"
                    value={overrideForm.endDate}
                    onChange={(e) => setOverrideForm({ ...overrideForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Override Justification / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Temporary site audit override, Emergency access"
                  value={overrideForm.reason}
                  onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-sm text-xs"
                >
                  Apply Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Copy Permissions */}
      {showCopyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <Copy className="w-4 h-4 text-indigo-600" />
                <span>Copy Permissions Engine</span>
              </h3>
              <button onClick={() => setShowCopyModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleCopyPermissions} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Source Type</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-1.5 font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="copySourceType"
                      checked={!copyForm.isSourceRole}
                      onChange={() => setCopyForm({ ...copyForm, isSourceRole: false, sourceId: users[0]?.id || '' })}
                    />
                    <span>Copy from Another User</span>
                  </label>
                  <label className="flex items-center space-x-1.5 font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="copySourceType"
                      checked={copyForm.isSourceRole}
                      onChange={() => setCopyForm({ ...copyForm, isSourceRole: true, sourceId: 'role-uuid-001' })}
                    />
                    <span>Copy from Role Template</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Source</label>
                {copyForm.isSourceRole ? (
                  <select
                    value={copyForm.sourceId}
                    onChange={(e) => setCopyForm({ ...copyForm, sourceId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-xs"
                  >
                    <option value="role-uuid-001">System Administrator (ADMIN)</option>
                    <option value="role-uuid-002">Project Manager (MANAGER)</option>
                    <option value="role-uuid-003">Site Incharge (INCHARGE)</option>
                    <option value="role-uuid-005">Store Keeper (STORE_KEEPER)</option>
                  </select>
                ) : (
                  <select
                    value={copyForm.sourceId}
                    onChange={(e) => setCopyForm({ ...copyForm, sourceId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-xs"
                  >
                    {users.filter((u) => u.id !== selectedUserId).map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email}) - {u.roleName || u.role}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCopyModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-sm text-xs"
                >
                  Copy Permissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
