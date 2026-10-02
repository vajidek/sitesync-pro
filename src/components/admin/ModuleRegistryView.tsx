import React, { useEffect, useState } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { 
  Package, LayoutDashboard, Building2, ClipboardCheck, Truck, Boxes, 
  ShieldCheck, Database, Eye, EyeOff, Plus, Layers, Sliders, CheckCircle2, 
  AlertCircle, RefreshCw, Trash2, Edit3, Tag, Key, ChevronRight, ChevronDown, ListTodo
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

export const ModuleRegistryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'MODULES' | 'SUB_MODULES' | 'FEATURES'>('MODULES');
  const [modules, setModules] = useState<any[]>([]);
  const [subModules, setSubModules] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal States
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [newModule, setNewModule] = useState({
    moduleCode: '',
    name: '',
    category: 'CORE',
    icon: 'Package',
    color: '#3b82f6',
    displayOrder: 10,
    description: '',
    routePath: '',
  });

  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [newSubModule, setNewSubModule] = useState({
    moduleId: '',
    subModuleCode: '',
    name: '',
    icon: 'Layers',
    displayOrder: 1,
  });

  const [showAddFeatureModal, setShowAddFeatureModal] = useState(false);
  const [newFeature, setNewFeature] = useState({
    subModuleId: '',
    featureCode: '',
    name: '',
    description: '',
    requiredPermission: '',
    displayOrder: 1,
  });

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      
      // Fetch Modules
      const resMod = await fetch('/api/modules', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jsonMod = await safeJson(resMod);
      if (jsonMod?.success) setModules(jsonMod.data || []);

      // Fetch Sub-Modules
      const resSub = await fetch('/api/modules/sub-modules/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jsonSub = await safeJson(resSub);
      if (jsonSub?.success) setSubModules(jsonSub.data || []);

      // Fetch Features
      const resFeat = await fetch('/api/modules/features/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jsonFeat = await safeJson(resFeat);
      if (jsonFeat?.success) setFeatures(jsonFeat.data || []);
    } catch (err) {
      console.error('Failed to fetch module registry data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newModule),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowAddModuleModal(false);
        setNewModule({
          moduleCode: '',
          name: '',
          category: 'CORE',
          icon: 'Package',
          color: '#3b82f6',
          displayOrder: 10,
          description: '',
          routePath: '',
        });
        setActionMessage({ type: 'success', text: 'Module created successfully' });
        fetchAllData();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to create module' });
    }
  };

  const handleToggleModuleStatus = async (id: string, isEnabled: boolean) => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      await fetch(`/api/modules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isEnabled: !isEnabled }),
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/modules/sub-modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSubModule),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowAddSubModal(false);
        setNewSubModule({
          moduleId: '',
          subModuleCode: '',
          name: '',
          icon: 'Layers',
          displayOrder: 1,
        });
        setActionMessage({ type: 'success', text: 'Sub-module created successfully' });
        fetchAllData();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to create sub-module' });
    }
  };

  const handleCreateFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/modules/features', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newFeature),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowAddFeatureModal(false);
        setNewFeature({
          subModuleId: '',
          featureCode: '',
          name: '',
          description: '',
          requiredPermission: '',
          displayOrder: 1,
        });
        setActionMessage({ type: 'success', text: 'Feature registered successfully' });
        fetchAllData();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to register feature' });
    }
  };

  return (
    <div className="space-y-6 text-xs">
      
      {/* Top Header */}
      <DSSectionHeader
        title="Enterprise Module Engine & Feature Registry"
        subtitle="Database-driven module architecture. Configure modules, sub-modules, and granular feature visibility without code changes."
        action={
          <div className="flex items-center space-x-2">
            <DSButton
              variant="outline"
              size="sm"
              isLoading={loading}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={fetchAllData}
            >
              Refresh
            </DSButton>

            {activeTab === 'MODULES' && (
              <DSButton
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowAddModuleModal(true)}
              >
                Create Module
              </DSButton>
            )}

            {activeTab === 'SUB_MODULES' && (
              <DSButton
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowAddSubModal(true)}
              >
                Add Sub-Module
              </DSButton>
            )}

            {activeTab === 'FEATURES' && (
              <DSButton
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowAddFeatureModal(true)}
              >
                Register Feature
              </DSButton>
            )}
          </div>
        }
      />

      {/* Tabs */}
      <div className="pb-2">
        <DSTabs
          tabs={[
            { id: 'MODULES', label: `Modules (${modules.length})`, icon: <Package className="w-4 h-4" /> },
            { id: 'SUB_MODULES', label: `Sub-Modules (${subModules.length})`, icon: <Layers className="w-4 h-4" /> },
            { id: 'FEATURES', label: `Feature Registry (${features.length})`, icon: <ListTodo className="w-4 h-4" /> },
          ]}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as any)}
          variant="underline"
        />
      </div>

      {/* Notification Banner */}
      {actionMessage && (
        <DSAlert
          variant={actionMessage.type === 'success' ? 'success' : 'danger'}
          title={actionMessage.type === 'success' ? 'Success' : 'Error'}
          description={actionMessage.text}
          onClose={() => setActionMessage(null)}
        />
      )}

      {/* TAB 1: MODULES ENGINE TABLE */}
      {activeTab === 'MODULES' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Module Code & Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Route Path</th>
                  <th className="py-3 px-4 text-center">Order</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {modules.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color || '#3b82f6' }} />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                            <span>{m.name}</span>
                            <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400">
                              {m.moduleCode}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{m.description || 'No description'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {m.category || 'CORE'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {m.routePath || `/${m.moduleCode?.toLowerCase()}`}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold font-mono">
                      #{m.displayOrder}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        m.isEnabled 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {m.isEnabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleModuleStatus(m.id, m.isEnabled)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition ${
                          m.isEnabled 
                            ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950 dark:border-rose-900 dark:text-rose-300'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950 dark:border-emerald-900 dark:text-emerald-300'
                        }`}
                      >
                        {m.isEnabled ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SUB-MODULES TABLE */}
      {activeTab === 'SUB_MODULES' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Parent Module</th>
                  <th className="py-3 px-4">Sub-Module Name & Code</th>
                  <th className="py-3 px-4 text-center">Order</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {subModules.map((sm) => {
                  const parentMod = modules.find((m) => m.id === sm.moduleId);
                  return (
                    <tr key={sm.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {parentMod ? parentMod.name : 'Unknown Module'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{sm.name}</span>
                          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-blue-500">
                            {sm.subModuleCode}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold">#{sm.displayOrder}</td>

                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          ENABLED
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FEATURES REGISTRY TABLE */}
      {activeTab === 'FEATURES' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Feature Code & Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Required Permission</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {features.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 dark:text-white">{f.name}</span>
                        <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-blue-500">
                          {f.featureCode}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-500">{f.description || 'N/A'}</td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                        {f.requiredPermission || 'NONE'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Module */}
      {showAddModuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span>Create New Module</span>
              </h3>
              <button onClick={() => setShowAddModuleModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleCreateModule} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Module Code (Unique)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PIPELINE_QA"
                  value={newModule.moduleCode}
                  onChange={(e) => setNewModule({ ...newModule, moduleCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Module Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pipeline Quality Control"
                  value={newModule.name}
                  onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={newModule.category}
                    onChange={(e) => setNewModule({ ...newModule, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="CORE">CORE</option>
                    <option value="ENGINEERING">ENGINEERING</option>
                    <option value="OPERATIONS">OPERATIONS</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={newModule.displayOrder}
                    onChange={(e) => setNewModule({ ...newModule, displayOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModuleModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Create Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Sub Module */}
      {showAddSubModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Add Sub-Module</span>
              </h3>
              <button onClick={() => setShowAddSubModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleCreateSubModule} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Parent Module</label>
                <select
                  required
                  value={newSubModule.moduleId}
                  onChange={(e) => setNewSubModule({ ...newSubModule, moduleId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  <option value="">Select Module</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Sub-Module Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HYDRO_TEST"
                  value={newSubModule.subModuleCode}
                  onChange={(e) => setNewSubModule({ ...newSubModule, subModuleCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Sub-Module Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hydrostatic Testing"
                  value={newSubModule.name}
                  onChange={(e) => setNewSubModule({ ...newSubModule, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Save Sub-Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Feature */}
      {showAddFeatureModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <ListTodo className="w-4 h-4 text-blue-600" />
                <span>Register Feature</span>
              </h3>
              <button onClick={() => setShowAddFeatureModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleCreateFeature} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Parent Sub-Module</label>
                <select
                  required
                  value={newFeature.subModuleId}
                  onChange={(e) => setNewFeature({ ...newFeature, subModuleId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  <option value="">Select Sub-Module</option>
                  {subModules.map((sm) => (
                    <option key={sm.id} value={sm.id}>{sm.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Feature Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WELD_FITUP_LOG"
                  value={newFeature.featureCode}
                  onChange={(e) => setNewFeature({ ...newFeature, featureCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Feature Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fit-Up & Welding Inspection Log"
                  value={newFeature.name}
                  onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddFeatureModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Register Feature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
