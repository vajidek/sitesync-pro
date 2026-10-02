import React, { useState, useEffect } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { 
  Users, 
  Search, 
  Plus, 
  UserCheck, 
  UserX, 
  Key, 
  Edit3, 
  Shield, 
  Building2, 
  Mail, 
  Phone, 
  Check, 
  X, 
  Lock, 
  Unlock,
  RefreshCw,
  AlertCircle,
  Trash2,
  RotateCcw,
  LogOut,
  KeyRound,
  History,
  User,
  CheckCircle2,
  Layers,
  Briefcase,
  ArrowRight,
  HelpCircle,
  FileText
} from 'lucide-react';
import {
  DSSectionHeader,
  DSCard,
  DSButton,
  DSStatusChip,
  DSSearchBox,
  DSAlert,
  DSModal,
  DSField
} from '../ui/design-system';

export const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
  const [isEffectivePermModalOpen, setIsEffectivePermModalOpen] = useState(false);
  const [effectivePermsLoading, setEffectivePermsLoading] = useState(false);
  const [effectivePermsData, setEffectivePermsData] = useState<{ role?: string; permissions: string[] } | null>(null);
  const [activeUser, setActiveUser] = useState<any>(null);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: 'Civil & Mechanical Engineering',
    roleId: 'role-uuid-002',
    employeeId: '',
    assignedProjectId: 'PRJ-101',
    isActive: true,
  });

  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setUsers(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/admin/roles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setRoles(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/hr/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success && Array.isArray(json.data)) {
        setEmployees(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch HR employees:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchEmployees();
  }, [search]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage(null);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const json = (await safeJson(res)) || {};
      if (json.success) {
        setActionMessage({ type: 'success', text: `User ${formData.name} created successfully!` });
        setIsCreateModalOpen(false);
        fetchUsers();
      } else {
        setActionMessage({ type: 'error', text: json.message || 'Failed to create user' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Error creating user' });
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;
    setActionMessage(null);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/admin/users/${activeUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          roleId: formData.roleId,
          employeeId: formData.employeeId || null,
          assignedProjectId: formData.assignedProjectId,
        }),
      });
      const json = (await safeJson(res)) || {};
      if (json.success) {
        setActionMessage({ type: 'success', text: `Updated user profile successfully` });
        setIsEditModalOpen(false);
        fetchUsers();
      } else {
        setActionMessage({ type: 'error', text: json.message || 'Failed to update user' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Error updating user' });
    }
  };

  // Action Handlers
  const handleGenerateTempPassword = async (user: any) => {
    setActionMessage(null);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/admin/users/${user.id}/generate-temp-password`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await safeJson(res)) || {};
      if (json.success) {
        setActionMessage({
          type: 'success',
          text: `Temporary Password Generated for ${user.name}: ${json.temporaryPassword}. User must change password on next login.`,
        });
        fetchUsers();
      } else {
        setActionMessage({ type: 'error', text: json.message || 'Failed to generate temporary password' });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Error generating temporary password' });
    }
  };

  const handleToggleLock = async (user: any) => {
    setActionMessage(null);
    const isLocked = Boolean(user.isLocked || user.accountStatus === 'LOCKED');
    const endpoint = isLocked ? 'unlock' : 'lock';
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/admin/users/${user.id}/${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await safeJson(res)) || {};
      if (json.success) {
        setActionMessage({
          type: 'success',
          text: `Account ${user.name} (${user.username || user.email}) was successfully ${isLocked ? 'Unlocked' : 'Locked'}.`,
        });
        fetchUsers();
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Failed to update account lock status' });
    }
  };

  const handleToggleForcePasswordChange = async (user: any) => {
    setActionMessage(null);
    const nextVal = !user.forcePasswordChange;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/admin/users/${user.id}/force-password-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ forcePasswordChange: nextVal }),
      });
      const json = (await safeJson(res)) || {};
      if (json.success) {
        setActionMessage({
          type: 'success',
          text: `Force password change ${nextVal ? 'enabled' : 'disabled'} for ${user.name}.`,
        });
        fetchUsers();
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Failed to toggle force password change' });
    }
  };

  const handleLogoutAllUserDevices = async (user: any) => {
    setActionMessage(null);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/admin/users/${user.id}/logout-all-devices`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await safeJson(res)) || {};
      if (json.success) {
        setActionMessage({
          type: 'success',
          text: `Revoked all active login sessions for ${user.name} (${json.revokedCount || 0} sessions).`,
        });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Failed to revoke user sessions' });
    }
  };

  const handleSoftDeleteOrRestore = async (user: any) => {
    setActionMessage(null);
    const isDeleted = user.accountStatus === 'DELETED';
    const method = isDeleted ? 'POST' : 'DELETE';
    const url = isDeleted ? `/api/admin/users/${user.id}/restore` : `/api/admin/users/${user.id}`;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await safeJson(res)) || {};
      if (json.success) {
        setActionMessage({
          type: 'success',
          text: `User account ${user.name} was successfully ${isDeleted ? 'Restored' : 'Soft Deleted'}.`,
        });
        fetchUsers();
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Failed to perform account deletion/restoration' });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser || !resetPasswordValue) return;
    setActionMessage(null);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/admin/users/${activeUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword: resetPasswordValue }),
      });
      const json = (await safeJson(res)) || {};
      if (json.success) {
        setActionMessage({ type: 'success', text: `Password successfully reset for ${activeUser.name}` });
        setIsResetPassModalOpen(false);
        setResetPasswordValue('');
      } else {
        setActionMessage({ type: 'error', text: json.message || 'Failed to reset password' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Error resetting password' });
    }
  };

  const openEditModal = (user: any) => {
    setActiveUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone || '',
      department: user.department || '',
      roleId: user.roleId || 'role-uuid-002',
      employeeId: user.employeeId || '',
      assignedProjectId: user.assignedProjectId || '',
      isActive: user.isActive,
    });
    setIsEditModalOpen(true);
  };

  const openResetPassModal = (user: any) => {
    setActiveUser(user);
    setResetPasswordValue('');
    setIsResetPassModalOpen(true);
  };

  const openEffectivePermsModal = async (user: any) => {
    setActiveUser(user);
    setIsEffectivePermModalOpen(true);
    setEffectivePermsLoading(true);
    setEffectivePermsData(null);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/admin/users/${user.id}/effective-permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setEffectivePermsData(json.data);
      } else {
        setEffectivePermsData(null);
      }
    } catch (err) {
      console.error('Failed to fetch effective permissions:', err);
      setEffectivePermsData(null);
    } finally {
      setEffectivePermsLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (selectedRoleFilter && u.roleId !== selectedRoleFilter) return false;
    if (selectedStatusFilter === 'active' && !u.isActive) return false;
    if (selectedStatusFilter === 'inactive' && u.isActive) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <DSSectionHeader
        title="Enterprise User Management"
        subtitle="Provision users, manage department assignments, set active status, and perform admin password resets."
        action={
          <DSButton
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setFormData({
                name: '',
                email: '',
                password: 'Password123!',
                phone: '',
                department: 'Mechanical & Piping Engineering',
                roleId: 'role-uuid-002',
                employeeId: 'emp-001',
                assignedProjectId: 'PRJ-101',
                isActive: true,
              });
              setIsCreateModalOpen(true);
            }}
          >
            Create New User
          </DSButton>
        }
      />

      {/* Action Notification Alert */}
      {actionMessage && (
        <DSAlert
          variant={actionMessage.type === 'success' ? 'success' : 'danger'}
          title={actionMessage.type === 'success' ? 'Operation Completed' : 'Operation Error'}
          description={actionMessage.text}
          onClose={() => setActionMessage(null)}
        />
      )}

      {/* Filter and Search Toolbar */}
      <DSCard className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <DSSearchBox
            placeholder="Search by name, email, department..."
            value={search}
            onChange={(val) => setSearch(val)}
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <DSButton
            variant="outline"
            size="sm"
            isLoading={loading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchUsers}
          >
            Refresh
          </DSButton>
        </div>
      </DSCard>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">User & Identifiers</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Department & Project</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">IAM Security Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No users matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleObj = roles.find((r) => r.id === user.roleId);
                  const isLocked = Boolean(user.isLocked || user.accountStatus === 'LOCKED');
                  const isDeleted = user.accountStatus === 'DELETED';
                  const isForcePwd = Boolean(user.forcePasswordChange);

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isForcePwd && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300">
                                  FORCE PWD CHANGE
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-2 mt-0.5">
                              <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-700 dark:text-slate-300">
                                ID: {user.username || user.id}
                              </span>
                              {user.employeeId && (
                                <span className="font-mono text-[10px] text-slate-400">
                                  Emp Code: {user.employeeId}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase tracking-wide">
                          {roleObj?.name || user.roleId || 'USER'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">{user.department}</div>
                        <div className="text-[10px] text-slate-400">{user.assignedProjectName || user.assignedProjectId}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                              isDeleted
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300'
                                : isLocked
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300'
                                : user.isActive
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              isDeleted ? 'bg-slate-400' : isLocked ? 'bg-amber-500' : user.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                            }`} />
                            <span>
                              {isDeleted ? 'DELETED' : isLocked ? 'LOCKED' : user.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {/* Inspect Effective Permissions */}
                          <button
                            onClick={() => openEffectivePermsModal(user)}
                            title="Inspect Computed Effective Permissions"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition"
                          >
                            <Shield className="w-4 h-4" />
                          </button>

                          {/* Generate Temp Password */}
                          <button
                            onClick={() => handleGenerateTempPassword(user)}
                            title="Generate Temporary Password"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Lock / Unlock */}
                          <button
                            onClick={() => handleToggleLock(user)}
                            title={isLocked ? 'Unlock User Account' : 'Lock User Account'}
                            className={`p-1.5 rounded-lg transition ${
                              isLocked
                                ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50'
                                : 'text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50'
                            }`}
                          >
                            {isLocked ? <Unlock className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4" />}
                          </button>

                          {/* Force Password Change Toggle */}
                          <button
                            onClick={() => handleToggleForcePasswordChange(user)}
                            title={isForcePwd ? 'Disable Force Password Change' : 'Enable Force Password Change'}
                            className={`p-1.5 rounded-lg transition ${
                              isForcePwd
                                ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/50'
                                : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50'
                            }`}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>

                          {/* Logout All Devices */}
                          <button
                            onClick={() => handleLogoutAllUserDevices(user)}
                            title="Revoke All Active Login Sessions"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                          >
                            <LogOut className="w-4 h-4" />
                          </button>

                          {/* Edit User */}
                          <button
                            onClick={() => openEditModal(user)}
                            title="Edit User Profile"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Soft Delete / Restore */}
                          <button
                            onClick={() => handleSoftDeleteOrRestore(user)}
                            title={isDeleted ? 'Restore Account' : 'Soft Delete Account'}
                            className={`p-1.5 rounded-lg transition ${
                              isDeleted
                                ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                            }`}
                          >
                            {isDeleted ? <RotateCcw className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create User */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-blue-500" />
                <span>Create ERP User Account</span>
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Link to HR Employee Master (Optional)
                </label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => {
                    const empId = e.target.value;
                    const selectedEmp = employees.find((emp) => emp.id === empId);
                    if (selectedEmp) {
                      setFormData({
                        ...formData,
                        employeeId: empId,
                        name: formData.name || `${selectedEmp.firstName} ${selectedEmp.lastName}`,
                        email: formData.email || selectedEmp.email || '',
                        phone: formData.phone || selectedEmp.phone || '',
                        department: formData.department || selectedEmp.department || 'General Administration',
                      });
                    } else {
                      setFormData({ ...formData, employeeId: empId });
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                >
                  <option value="">-- No Employee Linked (System User / Auditor / Partner) --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employeeCode} - {emp.firstName} {emp.lastName} ({emp.department || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Eng. Khalid Al-Mutawa"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="khalid@sitesyncpro.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Assigned Role</label>
                  <select
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {isEditModalOpen && activeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-blue-500" />
                <span>Edit User Profile: {activeUser.name}</span>
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Link to HR Employee Master (Optional)
                </label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => {
                    const empId = e.target.value;
                    const selectedEmp = employees.find((emp) => emp.id === empId);
                    if (selectedEmp) {
                      setFormData({
                        ...formData,
                        employeeId: empId,
                        name: formData.name || `${selectedEmp.firstName} ${selectedEmp.lastName}`,
                        department: formData.department || selectedEmp.department || 'General Administration',
                      });
                    } else {
                      setFormData({ ...formData, employeeId: empId });
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                >
                  <option value="">-- No Employee Linked (System User / Auditor / Partner) --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employeeCode} - {emp.firstName} {emp.lastName} ({emp.department || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Assigned Role</label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Password */}
      {isResetPassModalOpen && activeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Key className="w-5 h-5 text-amber-500" />
                <span>Reset User Password</span>
              </h3>
              <button onClick={() => setIsResetPassModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Set a new secure password for <strong className="text-slate-800 dark:text-slate-200">{activeUser.name}</strong> ({activeUser.email}).
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={resetPasswordValue}
                  onChange={(e) => setResetPasswordValue(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsResetPassModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl shadow-md"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Effective Permissions Inspector */}
      {isEffectivePermModalOpen && activeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Effective Access Inspector: {activeUser.name}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-normal">
                      {activeUser.email}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Calculated in real-time from Role Master, Direct User Overrides, HR Employee Link, and ABAC scopes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEffectivePermModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-5 text-xs">
              {effectivePermsLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                  <span>Computing real-time IAM, Role, and ABAC permissions hierarchy...</span>
                </div>
              ) : effectivePermsData ? (
                <div className="space-y-5">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-4 gap-2.5">
                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                      <div className="text-[10px] uppercase font-bold text-indigo-500">Effective Perms</div>
                      <div className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                        {effectivePermsData.effectivePermissions?.length ?? (effectivePermsData.permissions?.length || 0)}
                      </div>
                      <div className="text-[10px] text-indigo-400">Total active keys</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Assigned Role</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {effectivePermsData.roleName || effectivePermsData.roleCode || activeUser.roleId}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {effectivePermsData.roleBasePermissions?.length || 0} base keys
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">HR Linkage</div>
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {effectivePermsData.employee?.fullName || activeUser.employeeId || 'Standalone User'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {effectivePermsData.employee?.designation || 'No HR profile'}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Org & Project Scope</div>
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {activeUser.department || 'General'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {activeUser.assignedProjectId || 'All Projects'}
                      </div>
                    </div>
                  </div>

                  {/* Diagnostic Resolution Pipeline: Why does this user have access? */}
                  <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                        <Layers className="w-4 h-4 text-indigo-500" />
                        <span>Resolution Trail: Why does this user have access?</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Evaluated top-to-bottom
                      </span>
                    </div>

                    <div className="space-y-2 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                      {(effectivePermsData.explanationTrail || [
                        { step: 1, title: 'User Account Identity', detail: `Account verified: ${activeUser.name} (${activeUser.email})`, status: 'PASSED' },
                        { step: 2, title: 'HR Employee Link', detail: activeUser.employeeId ? `Bound to employee code: ${activeUser.employeeId}` : 'Standalone system user account', status: 'INFO' },
                        { step: 3, title: 'Org Hierarchy Scope', detail: `Department: ${activeUser.department}`, status: 'INFO' },
                        { step: 4, title: 'Role Permissions Inheritance', detail: `Role: ${activeUser.roleId}`, status: 'INFO' },
                        { step: 5, title: 'Direct Overrides', detail: `${effectivePermsData.overrides?.length || 0} direct overrides applied`, status: 'INFO' },
                        { step: 6, title: 'Project Scope', detail: `Assigned project: ${activeUser.assignedProjectId || 'PRJ-101'}`, status: 'INFO' },
                        { step: 7, title: 'Final Effective Rights', detail: `${(effectivePermsData.effectivePermissions || effectivePermsData.permissions || []).length} active permissions granted`, status: 'PASSED' },
                      ]).map((item: any) => (
                        <div key={item.step} className="flex items-start space-x-3 relative pl-6">
                          <span className={`absolute left-1.5 top-0.5 w-3 h-3 rounded-full border-2 bg-white dark:bg-slate-900 ${
                            item.status === 'PASSED' ? 'border-emerald-500' : item.status === 'BLOCKED' ? 'border-rose-500' : 'border-indigo-500'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-900 dark:text-slate-100">
                                {item.step}. {item.title}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                              {item.detail}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Permission Keys Listing */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Granted Effective Permissions ({((effectivePermsData.effectivePermissions || effectivePermsData.permissions) || []).length})</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-52 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800">
                      {((effectivePermsData.effectivePermissions || effectivePermsData.permissions) || []).length > 0 ? (
                        (effectivePermsData.effectivePermissions || effectivePermsData.permissions).map((perm: string) => (
                          <span
                            key={perm}
                            className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                          >
                            {perm}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">No permissions active for this user identity.</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">
                  Failed to compute permissions. Please ensure the user has a valid active role.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsEffectivePermModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
