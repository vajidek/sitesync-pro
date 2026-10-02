import React, { useState, useEffect } from 'react';
import { safeJson } from '../../lib/safeFetch';
import {
  Building2,
  Plus,
  Trash2,
  DollarSign,
  Briefcase,
  ShieldAlert,
  CheckCircle2,
  Layers,
  Search,
  Filter,
  Users,
  Info,
  SlidersHorizontal,
  CheckSquare,
  Sparkles
} from 'lucide-react';
import { DSButton, DSCard, DSBadge, DSSearchBox, DSField, DSModal } from '../ui/design-system';

interface ProjectDepartmentsViewProps {
  projectId: string;
}

const COMMON_DISCIPLINES = [
  'Civil & Structural',
  'Mechanical & Piping',
  'Electrical & Power',
  'Instrumentation & SCADA',
  'Pipeline & Trunk Mains',
  'QA/QC Quality Assurance',
  'HSE & Environmental Safety',
  'Commercial & Contracts',
  'Pre-Commissioning & Testing',
  'Surveying & Geotechnical'
];

export const ProjectDepartmentsView: React.FC<ProjectDepartmentsViewProps> = ({ projectId }) => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [orgUnits, setOrgUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Single Add Form
  const [formData, setFormData] = useState({
    departmentId: '',
    departmentName: '',
    role: 'LEAD',
    allocatedBudget: 500000,
    discipline: 'Civil & Structural',
  });

  // Bulk Allocation Modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedBulkUnits, setSelectedBulkUnits] = useState<string[]>([]);
  const [bulkRole, setBulkRole] = useState('SUPPORT');
  const [bulkBudgetPerDept, setBulkBudgetPerDept] = useState(250000);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('sitesync_access_token');
      const [depRes, orgRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/departments`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/org/units`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const depJson = await safeJson(depRes);
      const orgJson = await safeJson(orgRes);

      if (depJson?.success) setDepartments(depJson.data || []);
      if (orgJson?.success) {
        const units = orgJson.data || [];
        setOrgUnits(units);
        if (units.length > 0) {
          setFormData((prev) => ({
            ...prev,
            departmentId: prev.departmentId || units[0].id,
            departmentName: prev.departmentName || units[0].name,
          }));
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching project departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchData();
  }, [projectId]);

  const handleSelectOrgUnit = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedUnit = orgUnits.find((u) => u.id === selectedId);
    setFormData((prev) => ({
      ...prev,
      departmentId: selectedId,
      departmentName: selectedUnit ? selectedUnit.name : '',
    }));
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.departmentId) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/projects/${projectId}/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const json = await safeJson(res);
      if (json?.success) {
        setSuccessMsg(`Department "${formData.departmentName}" allocated to project successfully.`);
        setTimeout(() => setSuccessMsg(null), 4000);
        fetchData();
      } else {
        setError(json?.message || 'Failed to add department');
      }
    } catch (err: any) {
      setError(err.message || 'Server error adding department');
    }
  };

  const handleBulkAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBulkUnits.length === 0) return;
    setBulkSubmitting(true);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      let successCount = 0;

      for (const unitId of selectedBulkUnits) {
        const unit = orgUnits.find((u) => u.id === unitId);
        if (!unit) continue;

        const payload = {
          departmentId: unit.id,
          departmentName: unit.name,
          role: bulkRole,
          allocatedBudget: bulkBudgetPerDept,
          discipline: unit.unitType === 'DIVISION' ? 'Cross-Disciplinary' : unit.name,
        };

        const res = await fetch(`/api/projects/${projectId}/departments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const json = await safeJson(res);
        if (json?.success) successCount++;
      }

      setShowBulkModal(false);
      setSelectedBulkUnits([]);
      setSuccessMsg(`Successfully allocated ${successCount} departments in bulk to project matrix.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to complete bulk allocation');
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleRemove = async (id: string, name: string) => {
    if (!confirm(`Remove department allocation "${name}" from this project? (Note: Permanent company department structure will remain completely unaffected)`)) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/projects/departments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        fetchData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove department');
    }
  };

  // Filtered List
  const filteredDepartments = departments.filter((d) => {
    const matchesSearch =
      d.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.discipline?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || d.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Aggregated Stats
  const totalBudget = departments.reduce((acc, curr) => acc + (Number(curr.allocatedBudget) || 0), 0);
  const leadCount = departments.filter((d) => d.role === 'LEAD').length;
  const supportCount = departments.filter((d) => d.role === 'SUPPORT').length;
  const subcontractCount = departments.filter((d) => d.role === 'SUBCONTRACT').length;

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading cross-department project matrix...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header & Architectural Notice */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 bg-blue-100 dark:bg-blue-950/50 rounded-2xl text-blue-600 dark:text-blue-400">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Project Organization & Department Matrix
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Matrix Participation Model
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Cross-disciplinary allocation of permanent company divisions & departments (Civil, Mechanical, Electrical, HSE, QA/QC) to this project with ring-fenced budgets.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowBulkModal(true)}
            className="px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition flex items-center space-x-1.5"
          >
            <Layers className="w-4 h-4 text-indigo-500" />
            <span>Bulk Allocation</span>
          </button>
        </div>
      </div>

      {/* Principle Reminder Banner */}
      <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-start space-x-3 text-xs text-emerald-800 dark:text-emerald-300">
        <Info className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Architectural Integrity Guarantee:</strong> Project participation is strictly dynamic. Assigning departments or engineers to this project matrix does <strong>NOT</strong> mutate their permanent company division, department, or reporting manager in HRMS.
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Matrix Budget</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-mono">
            AED {totalBudget.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Across {departments.length} departments</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-blue-500">Lead Departments</div>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
            {leadCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Primary execution owners</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-amber-500">Support Units</div>
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">
            {supportCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Consulting & QA/HSE teams</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-purple-500">Subcontract Packages</div>
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-1">
            {subcontractCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Specialized scopes</div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center space-x-2 border border-rose-200">
          <ShieldAlert className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center space-x-2 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add Allocation Form */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Assign Department to Project Scope</span>
          </h3>
          <span className="text-[11px] text-slate-400">Database-driven assignment</span>
        </div>

        <form onSubmit={handleAddDepartment} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company Unit / Department</label>
            <select
              value={formData.departmentId}
              onChange={handleSelectOrgUnit}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              {orgUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.unitType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Matrix Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
            >
              <option value="LEAD">LEAD (Primary Deliverable Owner)</option>
              <option value="SUPPORT">SUPPORT (Collaborator & Support)</option>
              <option value="SUBCONTRACT">SUBCONTRACT (Specialized Discipline)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Discipline / Scope</label>
            <input
              type="text"
              list="discipline-suggestions"
              required
              value={formData.discipline}
              onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              placeholder="e.g. Civil, Mechanical, SCADA..."
            />
            <datalist id="discipline-suggestions">
              {COMMON_DISCIPLINES.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Allocated Budget (AED)</label>
            <input
              type="number"
              required
              min="0"
              step="5000"
              value={formData.allocatedBudget}
              onChange={(e) => setFormData({ ...formData, allocatedBudget: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department to Matrix</span>
            </button>
          </div>
        </form>
      </div>

      {/* Allocated Departments List */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Assigned Project Departments ({filteredDepartments.length} of {departments.length})
            </h3>
            <p className="text-[11px] text-slate-400">All departments participating in this project's execution</p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search matrix..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
            >
              <option value="ALL">All Roles</option>
              <option value="LEAD">LEAD</option>
              <option value="SUPPORT">SUPPORT</option>
              <option value="SUBCONTRACT">SUBCONTRACT</option>
            </select>
          </div>
        </div>

        {filteredDepartments.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            {departments.length === 0 ? 'No departments assigned to this project yet.' : 'No departments match your search filter.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredDepartments.map((d) => (
              <div
                key={d.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-600 transition"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {d.departmentName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        d.role === 'LEAD'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : d.role === 'SUPPORT'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      }`}
                    >
                      {d.role}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="flex items-center space-x-1">
                      <span className="text-slate-400">Discipline:</span>
                      <strong className="text-slate-700 dark:text-slate-300">{d.discipline || 'General'}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <span className="text-slate-400">Budget:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                        AED {Number(d.allocatedBudget || 0).toLocaleString()}
                      </strong>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(d.id, d.departmentName)}
                  className="p-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition shrink-0"
                  title="Remove department from project matrix"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BULK ALLOCATION MODAL */}
      <DSModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Bulk Assign Departments to Project Matrix"
        size="lg"
      >
        <form onSubmit={handleBulkAllocate} className="space-y-4 text-xs">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center space-x-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>Select multiple organizational units to assign them simultaneously to this project matrix.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Matrix Role for All</label>
              <select
                value={bulkRole}
                onChange={(e) => setBulkRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              >
                <option value="LEAD">LEAD (Primary Delivery)</option>
                <option value="SUPPORT">SUPPORT (Collaborator)</option>
                <option value="SUBCONTRACT">SUBCONTRACT (Specialized Scope)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Budget Allocation per Unit (AED)</label>
              <input
                type="number"
                min="0"
                step="10000"
                value={bulkBudgetPerDept}
                onChange={(e) => setBulkBudgetPerDept(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Select Units ({selectedBulkUnits.length} selected)
              </label>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedBulkUnits(orgUnits.map((u) => u.id))}
                  className="text-blue-600 hover:underline"
                >
                  Select All
                </button>
                <span>|</span>
                <button
                  type="button"
                  onClick={() => setSelectedBulkUnits([])}
                  className="text-slate-500 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {orgUnits.map((unit) => {
                const isSelected = selectedBulkUnits.includes(unit.id);
                return (
                  <label
                    key={unit.id}
                    className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition ${
                      isSelected
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-200 font-semibold'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBulkUnits([...selectedBulkUnits, unit.id]);
                        } else {
                          setSelectedBulkUnits(selectedBulkUnits.filter((id) => id !== unit.id));
                        }
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="truncate">
                      {unit.name} <span className="text-[10px] text-slate-400">({unit.unitType})</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowBulkModal(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedBulkUnits.length === 0 || bulkSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold shadow-md transition flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{bulkSubmitting ? 'Allocating...' : `Allocate ${selectedBulkUnits.length} Departments`}</span>
            </button>
          </div>
        </form>
      </DSModal>
    </div>
  );
};
