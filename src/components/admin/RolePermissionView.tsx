import React, { useEffect, useState } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { 
  Shield, 
  ShieldCheck, 
  Copy, 
  Plus, 
  Edit, 
  Check, 
  X, 
  Save, 
  Grid, 
  Users, 
  Lock, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import {
  DSSectionHeader,
  DSCard,
  DSButton,
  DSAlert,
  DSModal,
  DSField
} from '../ui/design-system';

export const RolePermissionView: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [matrixData, setMatrixData] = useState<Record<string, Record<string, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [savingMatrix, setSavingMatrix] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals state
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [isCloneRoleOpen, setIsCloneRoleOpen] = useState(false);
  const [selectedRoleForClone, setSelectedRoleForClone] = useState<any>(null);

  const [newRoleForm, setNewRoleForm] = useState({
    code: '',
    name: '',
    description: '',
  });

  const [cloneRoleForm, setCloneRoleForm] = useState({
    newRoleCode: '',
    newRoleName: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/admin/permission-matrix', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setPermissions(json.data.permissions);
        setRoles(json.data.roles);

        // Transform matrix array into a lookup dict: { [roleId]: { [permCode]: boolean } }
        const map: Record<string, Record<string, boolean>> = {};
        json.data.matrix.forEach((item: any) => {
          map[item.roleId] = item.permissions;
        });
        setMatrixData(map);
      }
    } catch (err) {
      console.error('Failed to fetch permission matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleMatrixCheckbox = (roleId: string, permCode: string) => {
    setMatrixData((prev) => {
      const rolePerms = { ...(prev[roleId] || {}) };
      rolePerms[permCode] = !rolePerms[permCode];
      return {
        ...prev,
        [roleId]: rolePerms,
      };
    });
  };

  const handleSaveRolePermissions = async (roleId: string) => {
    setSavingMatrix(true);
    setActionMessage(null);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const rolePermObj = matrixData[roleId] || {};
      
      // Convert active true keys to permission IDs
      const activePermIds = permissions
        .filter((p) => rolePermObj[p.code])
        .map((p) => p.id);

      const res = await fetch('/api/admin/permission-matrix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roleId,
          permissionIds: activePermIds,
        }),
      });
      const json = (await safeJson(res)) || {};
      if (json.success) {
        setActionMessage({ type: 'success', text: `Role permission matrix saved successfully!` });
        fetchData();
      } else {
        setActionMessage({ type: 'error', text: json.message || 'Failed to update permissions' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Error saving role permissions' });
    } finally {
      setSavingMatrix(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage(null);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newRoleForm),
      });
      const json = (await safeJson(res)) || {};
      if (res.status === 201 || json.success) {
        setActionMessage({ type: 'success', text: `Role ${newRoleForm.name} created!` });
        setIsCreateRoleOpen(false);
        setNewRoleForm({ code: '', name: '', description: '' });
        fetchData();
      } else {
        setActionMessage({ type: 'error', text: json.message || 'Failed to create role' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Error creating role' });
    }
  };

  const handleCloneRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleForClone) return;
    setActionMessage(null);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/admin/roles/${selectedRoleForClone.id}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cloneRoleForm),
      });
      const json = (await safeJson(res)) || {};
      if (json.success) {
        setActionMessage({ type: 'success', text: `Cloned role to ${cloneRoleForm.newRoleName}` });
        setIsCloneRoleOpen(false);
        setCloneRoleForm({ newRoleCode: '', newRoleName: '' });
        fetchData();
      } else {
        setActionMessage({ type: 'error', text: json.message || 'Failed to clone role' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Error cloning role' });
    }
  };

  // Group permissions by module
  const groupedPermissions: Record<string, any[]> = {};
  permissions.forEach((p) => {
    const mod = p.module || 'General';
    if (!groupedPermissions[mod]) groupedPermissions[mod] = [];
    groupedPermissions[mod].push(p);
  });

  return (
    <div className="space-y-6">
      
      <DSSectionHeader
        title="Role & Database Permission Matrix"
        subtitle="Configure dynamic database-driven authorization rules across all 8 ERP roles. Toggle individual matrix rights in real time."
        action={
          <div className="flex items-center space-x-2">
            <DSButton
              variant="outline"
              size="sm"
              isLoading={loading}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={fetchData}
            >
              Refresh
            </DSButton>

            <DSButton
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateRoleOpen(true)}
            >
              Create Custom Role
            </DSButton>
          </div>
        }
      />

      {/* Action Notification Alert */}
      {actionMessage && (
        <DSAlert
          variant={actionMessage.type === 'success' ? 'success' : 'danger'}
          title={actionMessage.type === 'success' ? 'Success' : 'Error'}
          description={actionMessage.text}
          onClose={() => setActionMessage(null)}
        />
      )}

      {/* Role Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((role) => (
          <div key={role.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {role.code}
                </span>
                <span className="text-[10px] text-slate-400">
                  {role.userCount || 0} User{(role.userCount || 0) !== 1 ? 's' : ''}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2">{role.name}</h4>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{role.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setSelectedRoleForClone(role);
                  setCloneRoleForm({ newRoleCode: `${role.code}_COPY`, newRoleName: `${role.name} (Copy)` });
                  setIsCloneRoleOpen(true);
                }}
                className="text-purple-600 dark:text-purple-400 hover:underline flex items-center space-x-1 font-semibold text-[11px]"
              >
                <Copy className="w-3 h-3" />
                <span>Clone Role</span>
              </button>

              <button
                onClick={() => handleSaveRolePermissions(role.id)}
                disabled={savingMatrix}
                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold flex items-center space-x-1 shadow-sm"
              >
                <Save className="w-3 h-3" />
                <span>Save Perms</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Permission Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
            <Grid className="w-4 h-4 text-purple-500" />
            <span>Database Permission Matrix Grid</span>
          </h3>
          <span className="text-xs text-slate-500">
            Check or uncheck permissions to grant/deny capabilities.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 min-w-[220px]">Permission Name & Code</th>
                {roles.map((role) => (
                  <th key={role.id} className="py-3 px-3 text-center min-w-[120px] font-mono text-[11px]">
                    {role.code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {Object.keys(groupedPermissions).map((moduleName) => (
                <React.Fragment key={moduleName}>
                  {/* Category Header Row */}
                  <tr className="bg-slate-50 dark:bg-slate-800/40 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                    <td colSpan={roles.length + 1} className="py-2 px-4 bg-slate-100/80 dark:bg-slate-800/80 border-y border-slate-200 dark:border-slate-700">
                      Module: {moduleName}
                    </td>
                  </tr>

                  {groupedPermissions[moduleName].map((perm) => (
                    <tr key={perm.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{perm.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{perm.code}</div>
                        <div className="text-[10px] text-slate-500">{perm.description}</div>
                      </td>

                      {roles.map((role) => {
                        const isGranted = Boolean(matrixData[role.id]?.[perm.code]);
                        return (
                          <td key={role.id} className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isGranted}
                              onChange={() => handleToggleMatrixCheckbox(role.id, perm.code)}
                              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Role */}
      {isCreateRoleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-purple-500" />
                <span>Create Custom ERP Role</span>
              </h3>
              <button onClick={() => setIsCreateRoleOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Role Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  value={newRoleForm.code}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SAFETY_OFFICER"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Role Display Name</label>
                <input
                  type="text"
                  required
                  value={newRoleForm.name}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
                  placeholder="e.g. Site Safety & Quality Inspector"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={newRoleForm.description}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, description: e.target.value })}
                  placeholder="Describe role responsibilities and authority bounds..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateRoleOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-md"
                >
                  Save Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Clone Role */}
      {isCloneRoleOpen && selectedRoleForClone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Copy className="w-5 h-5 text-purple-500" />
                <span>Clone Role: {selectedRoleForClone.name}</span>
              </h3>
              <button onClick={() => setIsCloneRoleOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCloneRole} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">New Role Code</label>
                <input
                  type="text"
                  required
                  value={cloneRoleForm.newRoleCode}
                  onChange={(e) => setCloneRoleForm({ ...cloneRoleForm, newRoleCode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">New Role Name</label>
                <input
                  type="text"
                  required
                  value={cloneRoleForm.newRoleName}
                  onChange={(e) => setCloneRoleForm({ ...cloneRoleForm, newRoleName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCloneRoleOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-md"
                >
                  Clone Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
