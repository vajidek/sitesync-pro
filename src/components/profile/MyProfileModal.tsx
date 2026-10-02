import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { safeJson } from '../../lib/safeFetch';
import {
  User,
  Shield,
  Lock,
  KeyRound,
  Clock,
  LogOut,
  X,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Globe,
  Calendar,
  Building,
  Phone,
  Mail,
  ShieldCheck,
  Edit3,
  Save,
  RefreshCw,
  History
} from 'lucide-react';
import { DSAvatar, DSBadge, DSButton } from '../ui/design-system';

interface MyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LoginHistoryItem {
  id: string;
  loginDate: string;
  loginTime: string;
  logoutTime?: string;
  sessionDuration?: string;
  browser?: string;
  device?: string;
  ipAddress?: string;
  status: string;
  failureReason?: string;
}

export const MyProfileModal: React.FC<MyProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, changePassword, logoutAllDevices } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'history' | 'sessions'>('profile');

  // Edit Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [department, setDepartment] = useState(user?.department || 'Operations & Site Engineering');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmittingPwd, setIsSubmittingPwd] = useState(false);

  // History & Sessions State
  const [userHistory, setUserHistory] = useState<LoginHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [sessionMsg, setSessionMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setDepartment(user.department || '');
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user && (activeTab === 'history' || activeTab === 'sessions')) {
      fetchUserHistory();
    }
  }, [isOpen, activeTab, user]);

  const fetchUserHistory = async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    try {
      const token = localStorage.getItem('sitesync_jwt_access_token') || localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/auth/login-history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success && Array.isArray(json.data)) {
        setUserHistory(json.data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingHistory(false);
    }
  };

  if (!isOpen || !user) return null;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setIsUpdatingProfile(true);

    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone, department }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setProfileMsg({ type: 'success', text: 'Profile fields updated successfully!' });
      } else {
        setProfileMsg({ type: 'error', text: json?.message || 'Failed to update profile.' });
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'Error connecting to server.' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (newPassword.length < 6) {
      setPwdMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsSubmittingPwd(true);
    const result = await changePassword(currentPassword, newPassword);
    setIsSubmittingPwd(false);

    if (result.success) {
      setPwdMsg({ type: 'success', text: 'Password changed successfully! Next login will require your new password.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPwdMsg({ type: 'error', text: result.message || 'Current password verification failed.' });
    }
  };

  const handleRevokeSessions = async () => {
    setSessionMsg(null);
    try {
      const count = await logoutAllDevices();
      setSessionMsg(`Successfully revoked all active sessions.`);
    } catch {
      setSessionMsg('Failed to revoke sessions.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0B192C] text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <DSAvatar name={user.name} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{user.name}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                User ID: <span className="font-mono font-bold text-indigo-300">{user.username || user.id}</span> • {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 shrink-0 overflow-x-auto">
          {[
            { id: 'profile', label: 'View & Edit Profile', icon: <User className="w-4 h-4" /> },
            { id: 'password', label: 'Change Password', icon: <KeyRound className="w-4 h-4" /> },
            { id: 'history', label: 'My Login History', icon: <History className="w-4 h-4" /> },
            { id: 'sessions', label: 'Active Sessions', icon: <Smartphone className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap min-h-[44px] ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: VIEW & EDIT PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-4">
              {profileMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    profileMsg.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {profileMsg.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Enterprise User ID (Primary Credentials)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user.username || user.id}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-mono font-bold cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Immutable enterprise identity code</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Corporate Email Address
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user.email}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Project
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user.assignedProjectName || 'Peruvannamuzhi Water Treatment Plant'}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Account Security Status
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div>Status: <span className="font-bold text-emerald-600 dark:text-emerald-400">{user.accountStatus || 'ACTIVE'}</span></div>
                  <div>Role Tier: <span className="font-bold text-blue-600 dark:text-blue-400">{user.roleName || user.role}</span></div>
                  <div>Force Pwd: <span className="font-bold text-amber-600">{user.forcePasswordChange ? 'Yes' : 'No'}</span></div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 min-h-[40px]"
                >
                  <Save className="w-4 h-4" />
                  <span>{isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4 max-w-lg mx-auto">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
                Password change workflow requires verifying your current credential. Updating password revokes old tokens to protect account security.
              </div>

              {pwdMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    pwdMsg.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {pwdMsg.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                  <span>{pwdMsg.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingPwd}
                className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition min-h-[44px]"
              >
                {isSubmittingPwd ? 'Updating Password...' : 'Change Password Credential'}
              </button>
            </form>
          )}

          {/* TAB 3: LOGIN HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your personal login history records and authentication events:
                </p>
                <button
                  onClick={fetchUserHistory}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Date & Time</th>
                      <th className="py-2.5 px-3">Network IP</th>
                      <th className="py-2.5 px-3">Device / Browser</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {isLoadingHistory ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">Loading history...</td>
                      </tr>
                    ) : userHistory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">No login records found.</td>
                      </tr>
                    ) : (
                      userHistory.map((h) => (
                        <tr key={h.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-800 dark:text-slate-200">{h.loginDate}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{h.loginTime}</div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                            {h.ipAddress || '127.0.0.1'}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-500 dark:text-slate-400">
                            {h.device || 'Desktop Browser'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              h.status === 'SUCCESS'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {h.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ACTIVE SESSIONS */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              {sessionMsg && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-semibold">
                  {sessionMsg}
                </div>
              )}

              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-500" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Current Active Web Session</h4>
                      <p className="text-[10px] text-slate-400">Validated with JWT Access Token</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                    THIS DEVICE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div>User Agent: <span className="font-mono text-[11px]">Desktop Chrome / Safari</span></div>
                  <div>IP Address: <span className="font-mono text-[11px]">Active Loopback / Remote IP</span></div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleRevokeSessions}
                  className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout From All Active Devices</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
