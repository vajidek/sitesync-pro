import React, { useState, useEffect } from 'react';
import { safeJson } from '../../lib/safeFetch';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Trash2,
  Calendar,
  HardHat,
  MapPin,
  FolderTree,
  Percent,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Briefcase,
} from 'lucide-react';

interface ProjectTeamViewProps {
  projectId: string;
}

export const ProjectTeamView: React.FC<ProjectTeamViewProps> = ({ projectId }) => {
  const [members, setMembers] = useState<any[]>([]);
  const [employeesList, setEmployeesList] = useState<any[]>([]);
  const [sitesList, setSitesList] = useState<any[]>([]);
  const [workPackagesList, setWorkPackagesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    role: 'SITE_ENGINEER',
    siteId: '',
    siteName: '',
    workPackageId: '',
    workPackageTitle: '',
    allocationPercentage: 100,
    joiningDate: new Date().toISOString().slice(0, 10),
    leavingDate: '',
    remarks: '',
  });

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/projects/${projectId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setMembers(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasters = async () => {
    try {
      const token = localStorage.getItem('sitesync_access_token');

      // Fetch Employees
      const empRes = await fetch('/api/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const empJson = await safeJson(empRes);
      if (empJson?.success && Array.isArray(empJson.data)) {
        setEmployeesList(empJson.data);
        if (empJson.data.length > 0 && !formData.employeeId) {
          setFormData((prev) => ({
            ...prev,
            employeeId: empJson.data[0].id,
            employeeName: empJson.data[0].name || empJson.data[0].fullName,
          }));
        }
      }

      // Fetch Sites
      const siteRes = await fetch(`/api/projects/${projectId}/sites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const siteJson = await safeJson(siteRes);
      if (siteJson?.success && Array.isArray(siteJson.data)) {
        setSitesList(siteJson.data);
      }

      // Fetch Work Packages
      const wpRes = await fetch(`/api/projects/${projectId}/work-packages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const wpJson = await safeJson(wpRes);
      if (wpJson?.success && Array.isArray(wpJson.data)) {
        setWorkPackagesList(wpJson.data);
      }
    } catch (e) {
      console.warn('Could not load master dropdowns:', e);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchMembers();
      fetchMasters();
    }
  }, [projectId]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const payload = {
        ...formData,
        projectId,
      };

      const res = await fetch('/api/projects/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowModal(false);
        fetchMembers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReleaseMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to release this member from the project? Their allocation will be marked as RELEASED.')) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      await fetch(`/api/projects/members/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMembers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMembers = members.filter((m) => {
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
    if (roleFilter !== 'ALL' && m.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = m.employeeName?.toLowerCase().includes(q);
      const matchRole = m.role?.toLowerCase().includes(q);
      const matchSite = m.siteName?.toLowerCase().includes(q);
      if (!matchName && !matchRole && !matchSite) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded font-mono font-bold text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              MATRIX RESOURCE ALLOCATION
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-semibold text-slate-500">
              Project Participation Layer
            </span>
          </div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 mt-1">
            <Users className="w-4 h-4 text-blue-500" />
            <span>Site Execution Team & Personnel Matrix</span>
          </h3>
          <p className="text-xs text-slate-500">
            Assign staff from permanent corporate master to project sites & WBS packages with dedicated allocation %
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Assign Team Member</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search member, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white placeholder-slate-400 w-44"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="ALL">All Roles</option>
            <option value="PROJECT_DIRECTOR">Project Director</option>
            <option value="PROJECT_MANAGER">Project Manager</option>
            <option value="RESIDENT_ENGINEER">Resident Engineer</option>
            <option value="SITE_INCHARGE">Site Incharge</option>
            <option value="SITE_ENGINEER">Site Engineer</option>
            <option value="QS_ENGINEER">QS / Commercial</option>
            <option value="QA_QC_INSPECTOR">QA/QC Inspector</option>
            <option value="HSE_OFFICER">HSE Officer</option>
            <option value="SUPERVISOR">Site Supervisor</option>
            <option value="FOREMAN">Foreman</option>
            <option value="STORE_KEEPER">Store Keeper</option>
            <option value="OPERATOR">Heavy Operator</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="ACTIVE">Active Assignments</option>
            <option value="RELEASED">Released / Historic</option>
            <option value="ALL">All Statuses</option>
          </select>
        </div>

        <span className="text-xs font-bold text-slate-500">
          Showing {filteredMembers.length} Members
        </span>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          Loading assigned team members...
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="p-12 text-center border border-dashed rounded-3xl bg-white dark:bg-slate-900 text-xs text-slate-400">
          No team members match the selected criteria.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5 font-bold">Employee Name & Code</th>
                <th className="px-4 py-3.5 font-bold">Project Role</th>
                <th className="px-4 py-3.5 font-bold">Assigned Site / GPS</th>
                <th className="px-4 py-3.5 font-bold">Work Package (WBS)</th>
                <th className="px-4 py-3.5 font-bold text-center">Allocation %</th>
                <th className="px-4 py-3.5 font-bold font-mono">Joining Date</th>
                <th className="px-4 py-3.5 font-bold text-center">Status</th>
                <th className="px-4 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center text-xs shadow-sm">
                        {m.employeeName ? m.employeeName.charAt(0) : 'U'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{m.employeeName || m.employeeId}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{m.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                      {m.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {m.siteName ? (
                      <span className="flex items-center space-x-1 text-slate-700 dark:text-slate-300 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{m.siteName}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">Project-Wide</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {m.workPackageTitle ? (
                      <span className="flex items-center space-x-1 text-slate-700 dark:text-slate-300 font-medium">
                        <FolderTree className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{m.workPackageTitle}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">All Packages</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="inline-flex items-center space-x-1.5">
                      <div className="w-12 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${m.allocationPercentage || 100}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-[11px] text-slate-900 dark:text-white">
                        {m.allocationPercentage || 100}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500">{m.joiningDate}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      m.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {m.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleReleaseMember(m.id)}
                        className="px-2 py-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-bold inline-flex items-center space-x-1 transition"
                        title="Release from project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Release</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-blue-500" />
                <h4 className="font-black text-sm text-slate-900 dark:text-white">
                  Assign Employee to Project Execution Matrix
                </h4>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Employee (from Master HRMS)
                </label>
                {employeesList.length > 0 ? (
                  <select
                    value={formData.employeeId}
                    onChange={(e) => {
                      const emp = employeesList.find((x) => x.id === e.target.value);
                      setFormData({
                        ...formData,
                        employeeId: e.target.value,
                        employeeName: emp ? (emp.name || emp.fullName) : '',
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {employeesList.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.employeeCode || emp.id} — {emp.name || emp.fullName} ({emp.designation || 'Staff'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Enter Employee Name"
                    value={formData.employeeName}
                    onChange={(e) => setFormData({ ...formData, employeeName: e.target.value, employeeId: `EMP-${Date.now().toString().slice(-4)}` })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Project Matrix Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-blue-600 dark:text-blue-400"
                  >
                    <option value="PROJECT_DIRECTOR">Project Director</option>
                    <option value="PROJECT_MANAGER">Project Manager</option>
                    <option value="RESIDENT_ENGINEER">Resident Engineer</option>
                    <option value="SITE_INCHARGE">Site Incharge</option>
                    <option value="SITE_ENGINEER">Site Engineer</option>
                    <option value="QS_ENGINEER">QS / Commercial Engineer</option>
                    <option value="QA_QC_INSPECTOR">QA/QC Inspector</option>
                    <option value="HSE_OFFICER">HSE Officer</option>
                    <option value="SUPERVISOR">Site Supervisor</option>
                    <option value="FOREMAN">Foreman</option>
                    <option value="STORE_KEEPER">Store Keeper</option>
                    <option value="OPERATOR">Heavy Operator</option>
                    <option value="WORKER">Skilled Worker</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Allocation Percentage
                  </label>
                  <select
                    value={formData.allocationPercentage}
                    onChange={(e) => setFormData({ ...formData, allocationPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
                  >
                    <option value={100}>100% (Dedicated Full-time)</option>
                    <option value={75}>75% (Major Time)</option>
                    <option value={50}>50% (Split Matrix)</option>
                    <option value={25}>25% (Supervisory Advisory)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Site (Optional)
                  </label>
                  <select
                    value={formData.siteId}
                    onChange={(e) => {
                      const site = sitesList.find((s) => s.id === e.target.value);
                      setFormData({
                        ...formData,
                        siteId: e.target.value,
                        siteName: site ? site.siteName : '',
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="">Project-Wide (All Sites)</option>
                    {sitesList.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.siteCode ? `${site.siteCode} - ` : ''}{site.siteName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned WBS Package (Optional)
                  </label>
                  <select
                    value={formData.workPackageId}
                    onChange={(e) => {
                      const wp = workPackagesList.find((w) => w.id === e.target.value);
                      setFormData({
                        ...formData,
                        workPackageId: e.target.value,
                        workPackageTitle: wp ? wp.title : '',
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="">All Work Packages</option>
                    {workPackagesList.map((wp) => (
                      <option key={wp.id} value={wp.id}>
                        {wp.packageCode} — {wp.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assignment Effective Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Release Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.leavingDate}
                    onChange={(e) => setFormData({ ...formData, leavingDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  Confirm Project Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
