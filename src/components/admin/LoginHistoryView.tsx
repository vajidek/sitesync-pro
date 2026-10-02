import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  Lock,
  Globe,
  Monitor,
  Calendar,
  RefreshCw,
  User,
  KeyRound
} from 'lucide-react';
import { safeJson } from '../../lib/safeFetch';
import { DSSectionHeader, DSBadge, DSButton } from '../ui/design-system';

interface LoginHistoryEntry {
  id: string;
  userId: string;
  username: string;
  userEmail?: string;
  loginDate: string;
  loginTime: string;
  logoutTime?: string;
  sessionDuration?: string;
  browser?: string;
  device?: string;
  ipAddress?: string;
  status: 'SUCCESS' | 'FAILED' | 'LOCKED' | 'REVOKED';
  failureReason?: string;
  createdAt: string;
}

export const LoginHistoryView: React.FC = () => {
  const [history, setHistory] = useState<LoginHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'FAILED' | 'LOCKED'>('ALL');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const token = localStorage.getItem('sitesync_jwt_access_token') || localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/admin/login-history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json && json.success && Array.isArray(json.data)) {
        setHistory(json.data);
      } else {
        setErrorMsg('Failed to load login history records.');
      }
    } catch {
      setErrorMsg('Error connecting to backend audit service.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      (item.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.userId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.ipAddress || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.device || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalAttempts = history.length;
  const successAttempts = history.filter((h) => h.status === 'SUCCESS').length;
  const failedAttempts = history.filter((h) => h.status === 'FAILED' || h.status === 'LOCKED').length;
  const lockedAccountsCount = history.filter((h) => h.status === 'LOCKED').length;

  const handleExportCSV = () => {
    const headers = ['Entry ID', 'User ID', 'Username', 'Email', 'Login Date', 'Login Time', 'Logout Time', 'Session Duration', 'IP Address', 'Device', 'Browser', 'Status', 'Failure Reason'];
    const rows = filteredHistory.map((item) => [
      item.id,
      item.userId,
      item.username,
      item.userEmail || 'N/A',
      item.loginDate,
      item.loginTime,
      item.logoutTime || 'Active/Unrecorded',
      item.sessionDuration || 'N/A',
      item.ipAddress || '127.0.0.1',
      item.device || 'Desktop',
      item.browser || 'Browser',
      item.status,
      item.failureReason || 'None',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((val) => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sitesync_login_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <DSSectionHeader
        title="Enterprise Login Audit & Session History Log"
        description="Monitor user authentication attempts, active device sessions, security locks, and access duration logs."
        actions={
          <div className="flex items-center gap-2">
            <DSButton
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-blue-600" />}
              onClick={fetchHistory}
            >
              Refresh
            </DSButton>
            <DSButton
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5 text-emerald-600" />}
              onClick={handleExportCSV}
            >
              Export CSV
            </DSButton>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Auth Attempts</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalAttempts}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Successful Logins</p>
            <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{successAttempts}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Failed Attempts</p>
            <h4 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{failedAttempts}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Account Lock Triggers</p>
            <h4 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{lockedAccountsCount}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search User ID, Name, Email, IP Address..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['ALL', 'SUCCESS', 'FAILED', 'LOCKED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  statusFilter === status
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Login History Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">User Details</th>
                <th className="py-3.5 px-4">Login Date & Time</th>
                <th className="py-3.5 px-4">Logout / Duration</th>
                <th className="py-3.5 px-4">Network & Device</th>
                <th className="py-3.5 px-4">Auth Status</th>
                <th className="py-3.5 px-4">Details / Security Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading login history logs...
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No login history records match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-500" />
                        <span>{entry.username || entry.userId}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        ID: {entry.userId} {entry.userEmail && `(${entry.userEmail})`}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{entry.loginDate}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{entry.loginTime}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {entry.logoutTime ? (
                        <div>
                          <span className="text-slate-700 dark:text-slate-300">{entry.logoutTime}</span>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Duration: {entry.sessionDuration || 'N/A'}
                          </div>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                          ACTIVE SESSION
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                        <Globe className="w-3.5 h-3.5 text-blue-400" />
                        <span>{entry.ipAddress || '127.0.0.1'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate max-w-[180px]">
                        <Monitor className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{entry.device || 'Desktop Browser'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {entry.status === 'SUCCESS' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                          <CheckCircle className="w-3 h-3 text-emerald-500" /> SUCCESS
                        </span>
                      )}
                      {entry.status === 'FAILED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300">
                          <XCircle className="w-3 h-3 text-rose-500" /> FAILED
                        </span>
                      )}
                      {entry.status === 'LOCKED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                          <Lock className="w-3 h-3 text-amber-500" /> ACCOUNT LOCKED
                        </span>
                      )}
                      {entry.status === 'REVOKED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300">
                          SESSION REVOKED
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      {entry.failureReason ? (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold">{entry.failureReason}</span>
                      ) : (
                        <span>Standard Authentication Logged</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
