import React, { useEffect, useState } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { EnterpriseOrgStructureView } from '../org/EnterpriseOrgStructureView';
import { EnterpriseCurrencyManager } from './EnterpriseCurrencyManager';
import { 
  Building, 
  MapPin, 
  Briefcase, 
  FileText, 
  Sliders, 
  Bell, 
  ShieldAlert, 
  Save, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  Globe,
  DollarSign,
  Network,
  ChevronRight,
  UserCheck,
  FolderTree,
  Tag
} from 'lucide-react';

import {
  DSSectionHeader,
  DSCard,
  DSButton,
  DSTabs,
  DSAlert,
  DSModal,
  DSField
} from '../ui/design-system';

export const OrgSettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'company' | 'currencies' | 'branches' | 'hierarchy' | 'masters' | 'system'>('company');
  const [settingsData, setSettingsData] = useState<any>(null);
  const [orgUnits, setOrgUnits] = useState<any[]>([]);
  const [orgTree, setOrgTree] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Org Unit Modal State
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [newUnit, setNewUnit] = useState({
    unitCode: '',
    name: '',
    unitType: 'DEPARTMENT',
    parentId: '',
    color: '#0284c7',
    icon: 'FolderTree',
    description: '',
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setSettingsData(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch org settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgUnits = async () => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const resTree = await fetch('/api/org/units/tree', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jsonTree = await safeJson(resTree);
      if (jsonTree?.success) {
        setOrgTree(jsonTree.data || []);
      }

      const resList = await fetch('/api/org/units', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jsonList = await safeJson(resList);
      if (jsonList?.success) {
        setOrgUnits(jsonList.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch org units:', err);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchOrgUnits();
  }, []);

  const handleCreateOrgUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage(null);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/org/units', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUnit),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({ type: 'success', text: `Organization Unit '${newUnit.name}' created successfully` });
        setShowAddUnitModal(false);
        setNewUnit({ unitCode: '', name: '', unitType: 'DEPARTMENT', parentId: '', color: '#0284c7', icon: 'FolderTree', description: '' });
        fetchOrgUnits();
      } else {
        setActionMessage({ type: 'error', text: json?.message || 'Failed to create unit' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Error creating organization unit' });
    }
  };

  const handleSaveSetting = async (key: string, value: string) => {
    setSavingKey(key);
    setActionMessage(null);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ key, value }),
      });
      const json = (await safeJson(res)) || {};
      if (json.success) {
        setActionMessage({ type: 'success', text: `Setting ${key} saved successfully!` });
        fetchSettings();
      } else {
        setActionMessage({ type: 'error', text: json.message || 'Failed to save setting' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Error saving setting' });
    } finally {
      setSavingKey(null);
    }
  };

  const company = settingsData?.companies?.[0] || {
    name: 'SiteSync Infrastructure Contracting LLC',
    taxId: 'TAX-99887766',
    email: 'info@sitesyncpro.com',
    phone: '+971 4 333 4455',
    website: 'https://sitesyncpro.com',
    address: 'Plot 402, Industrial Zone 3, Abu Dhabi, UAE',
    currency: 'AED',
  };

  const branches = settingsData?.branches || [];
  const departments = settingsData?.departments || [];
  const designations = settingsData?.designations || [];
  const settingsList = settingsData?.settings || [];

  return (
    <div className="space-y-6">
      <DSSectionHeader
        title="Organization & ERP System Settings"
        subtitle="Configure legal commercial entity profiles, regional branches, department structures, master designations, and workflow threshold rules."
      />

      {/* Action Notification Alert */}
      {actionMessage && (
        <DSAlert
          variant={actionMessage.type === 'success' ? 'success' : 'danger'}
          title={actionMessage.type === 'success' ? 'Settings Saved' : 'Error'}
          description={actionMessage.text}
          onClose={() => setActionMessage(null)}
        />
      )}

      {/* Navigation Subtabs */}
      <div className="pb-2">
        <DSTabs
          tabs={[
            { id: 'company', label: 'Company Profile', icon: <Building className="w-4 h-4" /> },
            { id: 'currencies', label: 'Multi-Currency & FX Rates', icon: <DollarSign className="w-4 h-4" /> },
            { id: 'branches', label: 'Branches & Departments', icon: <MapPin className="w-4 h-4" /> },
            { id: 'hierarchy', label: 'Organization Engine & Units', icon: <Network className="w-4 h-4" /> },
            { id: 'masters', label: 'Designations & Grades', icon: <Briefcase className="w-4 h-4" /> },
            { id: 'system', label: 'System & Security Rules', icon: <Sliders className="w-4 h-4" /> },
          ]}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as any)}
          variant="underline"
        />
      </div>

      {/* Tab: Multi-Currency & FX Rates */}
      {activeTab === 'currencies' && (
        <EnterpriseCurrencyManager />
      )}

      {/* Tab 1: Company Profile */}
      {activeTab === 'company' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Commercial Entity Configuration</h3>
            <p className="text-xs text-slate-500 mt-1">Primary registered enterprise details used on invoices, purchase orders, and site documents.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company Legal Name</label>
              <input
                type="text"
                defaultValue={company.name}
                onBlur={(e) => handleSaveSetting('COMPANY_LEGAL_NAME', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">TRN / Tax Registration Number</label>
              <input
                type="text"
                defaultValue={company.taxId}
                onBlur={(e) => handleSaveSetting('TAX_REGISTRATION_NO', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Official Contact Email</label>
              <input
                type="email"
                defaultValue={company.email}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary Base Currency</label>
              <input
                type="text"
                defaultValue={company.currency}
                onBlur={(e) => handleSaveSetting('BASE_CURRENCY', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Headquarters Commercial Address</label>
              <textarea
                rows={2}
                defaultValue={company.address}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Branches & Departments */}
      {activeTab === 'branches' && (
        <div className="space-y-6">
          
          {/* Branches Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Regional Operating Branches</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {branches.map((b: any) => (
                <div key={b.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{b.name}</span>
                    <span className="font-mono text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-bold">
                      {b.code}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">{b.address}</p>
                  <div className="mt-3 text-[11px] text-slate-400 flex items-center space-x-4">
                    <span>Phone: {b.phone}</span>
                    <span>Email: {b.email}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Departments Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-indigo-500" />
                <span>Functional ERP Departments</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {departments.map((d: any) => (
                <div key={d.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <div className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-1">{d.code}</div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{d.name}</h4>
                  <p className="text-slate-500 mt-1 line-clamp-2">{d.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: Enterprise Organization Engine & Structure */}
      {activeTab === 'hierarchy' && <EnterpriseOrgStructureView />}


      {/* Modal: Create Org Unit */}
      {showAddUnitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <Network className="w-4 h-4 text-blue-500" />
                <span>Create Dynamic Organizational Unit</span>
              </h3>
              <button onClick={() => setShowAddUnitModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleCreateOrgUnit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ORG-DIV-CIVIL"
                    value={newUnit.unitCode}
                    onChange={(e) => setNewUnit({ ...newUnit, unitCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit Type</label>
                  <select
                    value={newUnit.unitType}
                    onChange={(e) => setNewUnit({ ...newUnit, unitType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="COMPANY">Company</option>
                    <option value="BRANCH">Branch</option>
                    <option value="DIVISION">Division</option>
                    <option value="DEPARTMENT">Department</option>
                    <option value="SUB_DEPARTMENT">Sub Department</option>
                    <option value="TEAM">Team</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heavy Piping & Hydro-Testing Works"
                  value={newUnit.name}
                  onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Parent Entity (Optional)</label>
                <select
                  value={newUnit.parentId}
                  onChange={(e) => setNewUnit({ ...newUnit, parentId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  <option value="">None (Top Level)</option>
                  {orgUnits.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.unitType})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Theme Color</label>
                  <input
                    type="color"
                    value={newUnit.color}
                    onChange={(e) => setNewUnit({ ...newUnit, color: e.target.value })}
                    className="w-full h-9 p-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Icon Key</label>
                  <input
                    type="text"
                    placeholder="e.g. Wrench, Droplets"
                    value={newUnit.icon}
                    onChange={(e) => setNewUnit({ ...newUnit, icon: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe unit scope and operations"
                  value={newUnit.description}
                  onChange={(e) => setNewUnit({ ...newUnit, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddUnitModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Save Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Designations */}
      {activeTab === 'masters' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-emerald-500" />
              <span>Job Titles & Grade Levels</span>
            </h3>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Designation Name</th>
                  <th className="py-3 px-4">Grade Level</th>
                  <th className="py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {designations.map((dsg: any) => (
                  <tr key={dsg.id}>
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{dsg.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{dsg.name}</td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                        {dsg.gradeLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{dsg.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: System Rules */}
      {activeTab === 'system' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Workflow & System Security Enforcements</h3>
            <p className="text-xs text-slate-500 mt-1">Operational thresholds for purchase orders, account lockout policies, and notification dispatchers.</p>
          </div>

          <div className="space-y-4 text-xs">
            {settingsList.map((stg: any) => (
              <div key={stg.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 dark:text-white">{stg.key}</span>
                    <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                      {stg.group}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-1">{stg.description}</p>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <input
                    type="text"
                    defaultValue={stg.value}
                    onBlur={(e) => handleSaveSetting(stg.key, e.target.value)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-xs text-slate-900 dark:text-white w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleSaveSetting(stg.key, stg.value)}
                    disabled={savingKey === stg.key}
                    className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
