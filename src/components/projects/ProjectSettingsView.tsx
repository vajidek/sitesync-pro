import React, { useState, useEffect } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { 
  Settings, 
  Building2, 
  Layers, 
  ShieldCheck, 
  Calendar, 
  Hash, 
  Save, 
  CheckCircle2, 
  Landmark, 
  DollarSign, 
  Receipt, 
  Info 
} from 'lucide-react';

interface ProjectSettingsViewProps {
  projectId: string;
}

export const ProjectSettingsView: React.FC<ProjectSettingsViewProps> = ({ projectId }) => {
  const [settings, setSettings] = useState<any | null>(null);
  const [allDepartments, setAllDepartments] = useState<any[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [coaAccounts, setCoaAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fallbackCostCenters = [
    { id: 'cc_prj_water', code: 'CC-WAT-01', name: 'CC-101 (Water Infrastructure Project Execution)', domain: 'Water' },
    { id: 'cc_prj_civil', code: 'CC-CIV-02', name: 'CC-102 (Civil Structures & Earthworks)', domain: 'Civil' },
    { id: 'cc_prj_mech', code: 'CC-MEC-03', name: 'CC-103 (Mechanical & Piping Works)', domain: 'Mechanical' },
    { id: 'cc_prj_elec', code: 'CC-ELE-04', name: 'CC-104 (Electrical & Instrumentation)', domain: 'Electrical' },
    { id: 'cc_corp_admin', code: 'CC-CORP-01', name: 'CC-901 (Corporate Overhead & HQ)', domain: 'Corporate' },
  ];

  const fallbackAccounts = [
    { id: 'acc_5000', code: '5000', name: 'Direct Material Cost (Pipes, Valves, Steel, Cement)', type: 'Expense', subType: 'Direct Cost' },
    { id: 'acc_5100', code: '5100', name: 'Direct Site Labor & Operator Wages', type: 'Expense', subType: 'Direct Cost' },
    { id: 'acc_5200', code: '5200', name: 'Subcontractor Execution & Special Works', type: 'Expense', subType: 'Direct Cost' },
    { id: 'acc_5300', code: '5300', name: 'Plant, Machinery & Equipment Fuel Cost', type: 'Expense', subType: 'Direct Cost' },
    { id: 'acc_5400', code: '5400', name: 'Site Consumables, Safety PPE & Welfare', type: 'Expense', subType: 'Direct Cost' },
    { id: 'acc_4000', code: '4000', name: 'Contract Execution Revenue (Client Billing)', type: 'Revenue', subType: 'Operating Revenue' },
    { id: 'acc_2000', code: '2000', name: 'Trade Creditors / Subcontractor Accounts Payable', type: 'Liability', subType: 'Current Liability' },
    { id: 'acc_2200', code: '2200', name: 'Contractor Retention Monies Payable', type: 'Liability', subType: 'Current Liability' },
    { id: 'acc_1010', code: '1010', name: 'Site Petty Cash & Imprest Clearing Account', type: 'Asset', subType: 'Current Asset' },
    { id: 'acc_1020', code: '1020', name: 'Project Escrow / Client Advance Bank Account', type: 'Asset', subType: 'Bank Account' },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('sitesync_access_token');

      // Fetch Project Settings
      const resSet = await fetch(`/api/projects/${projectId}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jsonSet = await safeJson(resSet);
      if (jsonSet?.success && jsonSet.data) {
        setSettings(jsonSet.data);
      }

      // Fetch All Org Departments
      const resDeps = await fetch('/api/org/units?unitType=DEPARTMENT', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jsonDeps = await safeJson(resDeps);
      if (jsonDeps?.success && Array.isArray(jsonDeps.data)) {
        setAllDepartments(jsonDeps.data);
      }

      // Fetch Cost Centers & Chart of Accounts
      const [resCc, resCoa] = await Promise.all([
        fetch('/api/finance/cost-centers', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
        fetch('/api/finance/accounts', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
      ]);
      const jsonCc = resCc ? await safeJson(resCc) : null;
      const jsonCoa = resCoa ? await safeJson(resCoa) : null;

      if (jsonCc?.success && Array.isArray(jsonCc.data) && jsonCc.data.length > 0) {
        setCostCenters(jsonCc.data);
      } else {
        setCostCenters(fallbackCostCenters);
      }

      if (jsonCoa?.success && Array.isArray(jsonCoa.data) && jsonCoa.data.length > 0) {
        setCoaAccounts(jsonCoa.data);
      } else {
        setCoaAccounts(fallbackAccounts);
      }
    } catch (err) {
      console.error(err);
      setCostCenters(fallbackCostCenters);
      setCoaAccounts(fallbackAccounts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchData();
  }, [projectId]);

  const toggleDepartment = (depId: string) => {
    if (!settings) return;
    const current = settings.enabledDepartments || [];
    const updated = current.includes(depId)
      ? current.filter((id: string) => id !== depId)
      : [...current, depId];
    setSettings({ ...settings, enabledDepartments: updated });
  };

  const handleAccountingMappingChange = (key: string, value: string) => {
    if (!settings) return;
    const currentMapping = settings.accountingMapping || {};
    setSettings({
      ...settings,
      accountingMapping: {
        ...currentMapping,
        [key]: value
      }
    });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveSuccess(false);
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/projects/${projectId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading Project Engine Settings...</div>;
  }

  const activeMapping = settings.accountingMapping || {
    costCenterId: 'cc_prj_water',
    materialExpenseAccountId: 'acc_5000',
    laborExpenseAccountId: 'acc_5100',
    subcontractExpenseAccountId: 'acc_5200',
    equipmentExpenseAccountId: 'acc_5300',
    revenueAccountId: 'acc_4000',
    accountsPayableAccountId: 'acc_2000',
    retentionPayableAccountId: 'acc_2200',
    siteImprestAccountId: 'acc_1010',
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Settings className="w-4 h-4 text-blue-600" />
            <span>Project Execution Engine Configurations</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure assigned departments, approval workflows, numbering formats, and calendar parameters.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 shadow-sm transition disabled:opacity-50"
        >
          {saveSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Assigned Departments */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Building2 className="w-4 h-4 text-blue-500" />
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Assigned Project Departments</h4>
          </div>

          <p className="text-slate-500">
            Select departments actively participating in this project execution hierarchy.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {allDepartments.map((dep) => {
              const isChecked = (settings.enabledDepartments || []).includes(dep.id);
              return (
                <div
                  key={dep.id}
                  onClick={() => toggleDepartment(dep.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isChecked
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-500 dark:border-blue-700'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dep.color || '#3b82f6' }} />
                    <span className="font-bold text-slate-900 dark:text-white">{dep.name}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // handled by parent div click
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Approval Workflows */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Approval Workflow Matrix</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Approval Levels</label>
              <select
                value={settings.approvalWorkflow?.levels || 3}
                onChange={(e) => setSettings({
                  ...settings,
                  approvalWorkflow: { ...(settings.approvalWorkflow || {}), levels: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
              >
                <option value={1}>1 Tier (Direct Manager)</option>
                <option value={2}>2 Tiers (Engineer + Manager)</option>
                <option value={3}>3 Tiers (Engineer + PM + Client Rep)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Shift Working Hours (Daily)</label>
              <input
                type="number"
                value={settings.projectCalendar?.shiftHours || 8}
                onChange={(e) => setSettings({
                  ...settings,
                  projectCalendar: { ...(settings.projectCalendar || {}), shiftHours: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Numbering Formats */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Hash className="w-4 h-4 text-amber-500" />
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Configurable Numbering Formats</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Code Format</label>
              <input
                type="text"
                value={settings.projectNumberFormat || 'PRJ-{YYYY}-{SEQ}'}
                onChange={(e) => setSettings({ ...settings, projectNumberFormat: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Document Number Format</label>
              <input
                type="text"
                value={settings.documentNumberFormat || 'DOC-{PRJ}-{SEQ}'}
                onChange={(e) => setSettings({ ...settings, documentNumberFormat: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Project Cost Center & Chart of Accounts (COA) Mapping */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <Landmark className="w-4 h-4 text-indigo-500" />
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Financial Cost Center & Chart of Accounts (COA) Mapping
              </h4>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Phase 2.5 Accounting Foundation
            </span>
          </div>

          <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 rounded-xl text-indigo-900 dark:text-indigo-300 text-xs flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong>ERP Financial Architecture Governance:</strong> Mappings configured here establish the baseline general ledger routing for project expenditures, subcontracts, and client revenue. In accordance with governance controls, automatic journal postings are deferred until formal verification in Phase 2.5-B.
            </div>
          </div>

          {/* Primary Cost Center Selection */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
            <h5 className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Building2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Project Cost Center & Segment Assignment</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Project Cost Center *
                </label>
                <select
                  value={activeMapping.costCenterId || ''}
                  onChange={(e) => handleAccountingMappingChange('costCenterId', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                >
                  {costCenters.map((cc) => (
                    <option key={cc.id} value={cc.id}>
                      {cc.code ? `${cc.code} - ` : ''}{cc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Site Imprest / Clearing Account (Debit)
                </label>
                <select
                  value={activeMapping.siteImprestAccountId || ''}
                  onChange={(e) => handleAccountingMappingChange('siteImprestAccountId', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium font-mono text-[11px]"
                >
                  {coaAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      [{acc.code}] {acc.name} ({acc.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Direct Project Cost Accounts (Debits) */}
          <div className="space-y-3">
            <h5 className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              <span>Default Expense General Ledger Accounts (Debits)</span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Direct Material Cost Account
                </label>
                <select
                  value={activeMapping.materialExpenseAccountId || ''}
                  onChange={(e) => handleAccountingMappingChange('materialExpenseAccountId', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                >
                  {coaAccounts.filter(a => a.type === 'Expense' || a.code?.startsWith('5')).map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      [{acc.code}] {acc.name}
                    </option>
                  ))}
                  {coaAccounts.filter(a => a.type !== 'Expense' && !a.code?.startsWith('5')).map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      [{acc.code}] {acc.name} ({acc.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Direct Labor & Site Operations Account
                </label>
                <select
                  value={activeMapping.laborExpenseAccountId || ''}
                  onChange={(e) => handleAccountingMappingChange('laborExpenseAccountId', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                >
                  {coaAccounts.filter(a => a.type === 'Expense' || a.code?.startsWith('5')).map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      [{acc.code}] {acc.name}
                    </option>
                  ))}
                  {coaAccounts.filter(a => a.type !== 'Expense' && !a.code?.startsWith('5')).map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      [{acc.code}] {acc.name} ({acc.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subcontractor Execution Expense Account
                </label>
                <select
                  value={activeMapping.subcontractExpenseAccountId || ''}
                  onChange={(e) => handleAccountingMappingChange('subcontractExpenseAccountId', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                >
                  {coaAccounts.filter(a => a.type === 'Expense' || a.code?.startsWith('5')).map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      [{acc.code}] {acc.name}
                    </option>
                  ))}
                  {coaAccounts.filter(a => a.type !== 'Expense' && !a.code?.startsWith('5')).map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      [{acc.code}] {acc.name} ({acc.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Plant & Machinery / Equipment Fuel Account
                </label>
                <select
                  value={activeMapping.equipmentExpenseAccountId || ''}
                  onChange={(e) => handleAccountingMappingChange('equipmentExpenseAccountId', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                >
                  {coaAccounts.filter(a => a.type === 'Expense' || a.code?.startsWith('5')).map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      [{acc.code}] {acc.name}
                    </option>
                  ))}
                  {coaAccounts.filter(a => a.type !== 'Expense' && !a.code?.startsWith('5')).map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      [{acc.code}] {acc.name} ({acc.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Revenue & Payables Accounts (Credits) */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h5 className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Receipt className="w-3.5 h-3.5 text-blue-500" />
              <span>Revenue & Payables General Ledger Accounts (Credits)</span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Client Contract Revenue Account
                </label>
                <select
                  value={activeMapping.revenueAccountId || ''}
                  onChange={(e) => handleAccountingMappingChange('revenueAccountId', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                >
                  {coaAccounts.filter(a => a.type === 'Revenue' || a.code?.startsWith('4')).map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      [{acc.code}] {acc.name}
                    </option>
                  ))}
                  {coaAccounts.filter(a => a.type !== 'Revenue' && !a.code?.startsWith('4')).map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      [{acc.code}] {acc.name} ({acc.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Trade Creditors / Payables Account
                </label>
                <select
                  value={activeMapping.accountsPayableAccountId || ''}
                  onChange={(e) => handleAccountingMappingChange('accountsPayableAccountId', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                >
                  {coaAccounts.filter(a => a.type === 'Liability' || a.code?.startsWith('2')).map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      [{acc.code}] {acc.name}
                    </option>
                  ))}
                  {coaAccounts.filter(a => a.type !== 'Liability' && !a.code?.startsWith('2')).map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      [{acc.code}] {acc.name} ({acc.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contractor Retention Payables
                </label>
                <select
                  value={activeMapping.retentionPayableAccountId || ''}
                  onChange={(e) => handleAccountingMappingChange('retentionPayableAccountId', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                >
                  {coaAccounts.filter(a => a.type === 'Liability' || a.code?.startsWith('2')).map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      [{acc.code}] {acc.name}
                    </option>
                  ))}
                  {coaAccounts.filter(a => a.type !== 'Liability' && !a.code?.startsWith('2')).map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      [{acc.code}] {acc.name} ({acc.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
