import React, { useState, useEffect } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { 
  Package, Plus, ChevronRight, ChevronDown, CheckCircle2, Clock, 
  Layers, UserCheck, DollarSign, Calendar, Trash2, Edit3, Tag, Building2, ListTodo, ShieldAlert
} from 'lucide-react';

interface ProjectWorkPackagesViewProps {
  projectId: string;
}

export const ProjectWorkPackagesView: React.FC<ProjectWorkPackagesViewProps> = ({ projectId }) => {
  const [workPackages, setWorkPackages] = useState<any[]>([]);
  const [workPackageTypes, setWorkPackageTypes] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [activitiesMap, setActivitiesMap] = useState<Record<string, any[]>>({});
  const [expandedPkgId, setExpandedPkgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal State for Work Package
  const [showAddPkgModal, setShowAddPkgModal] = useState(false);
  const [newPkg, setNewPkg] = useState({
    packageCode: '',
    title: '',
    departmentId: '',
    workPackageTypeId: '',
    discipline: 'CIVIL_MECH',
    leadEmployeeName: '',
    budget: 0,
    startDate: new Date().toISOString().slice(0, 10),
    targetDate: new Date().toISOString().slice(0, 10),
    status: 'PLANNED',
  });

  // Modal State for Activity
  const [showAddActModal, setShowAddActModal] = useState<string | null>(null); // pkgId
  const [newAct, setNewAct] = useState({
    activityCode: '',
    title: '',
    description: '',
    sequenceOrder: 1,
    assignedToName: '',
    startDate: new Date().toISOString().slice(0, 10),
    targetDate: new Date().toISOString().slice(0, 10),
    status: 'PLANNED',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('sitesync_access_token');
      
      // Fetch Work Packages
      const resPkg = await fetch(`/api/projects/${projectId}/work-packages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jsonPkg = await safeJson(resPkg);
      if (jsonPkg?.success) {
        setWorkPackages(jsonPkg.data || []);
      }

      // Fetch Work Package Types
      const resTypes = await fetch('/api/projects/work-package-types', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jsonTypes = await safeJson(resTypes);
      if (jsonTypes?.success) {
        setWorkPackageTypes(jsonTypes.data || []);
      }

      // Fetch Departments for Project
      const resDeps = await fetch(`/api/org/projects/${projectId}/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jsonDeps = await safeJson(resDeps);
      if (jsonDeps?.success) {
        setDepartments(jsonDeps.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async (workPackageId: string) => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/projects/work-packages/${workPackageId}/activities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setActivitiesMap((prev) => ({ ...prev, [workPackageId]: json.data || [] }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (projectId) fetchData();
  }, [projectId]);

  const toggleExpand = (pkgId: string) => {
    if (expandedPkgId === pkgId) {
      setExpandedPkgId(null);
    } else {
      setExpandedPkgId(pkgId);
      if (!activitiesMap[pkgId]) {
        fetchActivities(pkgId);
      }
    }
  };

  const handleCreateWorkPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const selectedType = workPackageTypes.find((t) => t.id === newPkg.workPackageTypeId);
      const res = await fetch(`/api/projects/${projectId}/work-packages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newPkg,
          workPackageTypeName: selectedType ? selectedType.name : 'General Package',
        }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowAddPkgModal(false);
        setNewPkg({
          packageCode: '',
          title: '',
          departmentId: '',
          workPackageTypeId: '',
          discipline: 'CIVIL_MECH',
          leadEmployeeName: '',
          budget: 0,
          startDate: new Date().toISOString().slice(0, 10),
          targetDate: new Date().toISOString().slice(0, 10),
          status: 'PLANNED',
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateActivity = async (e: React.FormEvent, pkgId: string) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/projects/work-packages/${pkgId}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newAct,
          projectId,
        }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowAddActModal(null);
        setNewAct({
          activityCode: '',
          title: '',
          description: '',
          sequenceOrder: 1,
          assignedToName: '',
          startDate: new Date().toISOString().slice(0, 10),
          targetDate: new Date().toISOString().slice(0, 10),
          status: 'PLANNED',
        });
        fetchActivities(pkgId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteWorkPackage = async (pkgId: string) => {
    if (!window.confirm('Deactivate work package?')) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      await fetch(`/api/projects/work-packages/${pkgId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading Enterprise Work Packages...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Package className="w-4 h-4 text-blue-600" />
            <span>Configurable Work Packages & Activities</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Break down project scope across departments into work packages, activities, and tasks.
          </p>
        </div>

        <button
          onClick={() => setShowAddPkgModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Work Package</span>
        </button>
      </div>

      {workPackages.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Layers className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-500">No work packages configured for this project yet.</p>
          <button
            onClick={() => setShowAddPkgModal(true)}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
          >
            Create First Work Package
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {workPackages.map((pkg) => {
            const isExpanded = expandedPkgId === pkg.id;
            const activities = activitiesMap[pkg.id] || [];

            return (
              <div
                key={pkg.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-xs"
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleExpand(pkg.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border-b border-slate-100 dark:border-slate-800/50"
                >
                  <div className="flex items-center space-x-3">
                    <button className="text-slate-400 hover:text-slate-600">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{pkg.packageCode}</span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{pkg.title}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {pkg.workPackageTypeName || 'Package'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Lead: <strong className="text-slate-600 dark:text-slate-300">{pkg.leadEmployeeName || 'Unassigned'}</strong> • Discipline: {pkg.discipline || 'GENERAL'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] uppercase text-slate-400 block font-semibold">Budget</span>
                      <span className="font-bold text-slate-900 dark:text-white">AED {pkg.budget?.toLocaleString()}</span>
                    </div>

                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {pkg.status}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWorkPackage(pkg.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      title="Deactivate package"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Activities List */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/50 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider flex items-center space-x-1.5">
                        <ListTodo className="w-3.5 h-3.5 text-blue-500" />
                        <span>Work Package Activities ({activities.length})</span>
                      </span>

                      <button
                        onClick={() => setShowAddActModal(pkg.id)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-semibold flex items-center space-x-1 shadow-sm"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Activity</span>
                      </button>
                    </div>

                    {activities.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic py-2">No activities added to this package yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {activities.map((act) => (
                          <div
                            key={act.id}
                            className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between space-x-2"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-mono font-bold text-[10px] text-blue-500">#{act.sequenceOrder}</span>
                                <span className="font-bold text-slate-900 dark:text-white">{act.title}</span>
                              </div>
                              <p className="text-[10px] text-slate-400">
                                Assignee: {act.assignedToName || 'Unassigned'} • Due: {act.targetDate || 'TBD'}
                              </p>
                            </div>

                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {act.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Work Package */}
      {showAddPkgModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <Package className="w-4 h-4 text-blue-500" />
                <span>Create Enterprise Work Package</span>
              </h3>
              <button onClick={() => setShowAddPkgModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleCreateWorkPackage} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Package Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WP-CIV-001"
                    value={newPkg.packageCode}
                    onChange={(e) => setNewPkg({ ...newPkg, packageCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Package Type</label>
                  <select
                    value={newPkg.workPackageTypeId}
                    onChange={(e) => setNewPkg({ ...newPkg, workPackageTypeId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="">Select Package Type</option>
                    {workPackageTypes.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500mm DI Pipeline Laying & Valve Chambers"
                  value={newPkg.title}
                  onChange={(e) => setNewPkg({ ...newPkg, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Lead Engineer</label>
                  <input
                    type="text"
                    placeholder="e.g. Eng. Rahul Sharma"
                    value={newPkg.leadEmployeeName}
                    onChange={(e) => setNewPkg({ ...newPkg, leadEmployeeName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Allocated Budget (AED)</label>
                  <input
                    type="number"
                    value={newPkg.budget}
                    onChange={(e) => setNewPkg({ ...newPkg, budget: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newPkg.startDate}
                    onChange={(e) => setNewPkg({ ...newPkg, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={newPkg.targetDate}
                    onChange={(e) => setNewPkg({ ...newPkg, targetDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddPkgModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Save Work Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Activity */}
      {showAddActModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <ListTodo className="w-4 h-4 text-blue-500" />
                <span>Add Activity to Package</span>
              </h3>
              <button onClick={() => setShowAddActModal(null)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={(e) => handleCreateActivity(e, showAddActModal)} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Activity Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trench Excavation & Bedding"
                  value={newAct.title}
                  onChange={(e) => setNewAct({ ...newAct, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Sequence Order</label>
                  <input
                    type="number"
                    value={newAct.sequenceOrder}
                    onChange={(e) => setNewAct({ ...newAct, sequenceOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assignee</label>
                  <input
                    type="text"
                    placeholder="e.g. Site Supervisor"
                    value={newAct.assignedToName}
                    onChange={(e) => setNewAct({ ...newAct, assignedToName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Date</label>
                <input
                  type="date"
                  value={newAct.targetDate}
                  onChange={(e) => setNewAct({ ...newAct, targetDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddActModal(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
