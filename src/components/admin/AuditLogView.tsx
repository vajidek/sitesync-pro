import React, { useEffect, useState } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { 
  Activity, 
  Search, 
  RefreshCw, 
  ShieldAlert, 
  Clock, 
  User, 
  Globe, 
  FileText, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  DSSectionHeader,
  DSCard,
  DSButton,
  DSSearchBox,
  DSStatusChip,
  DSModal
} from '../ui/design-system';

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const fetchLogs = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/admin/audit-logs?page=${pageNumber}&limit=15&search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setLogs(json.data);
        if (json.pagination) {
          setPagination(json.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [search]);

  return (
    <div className="space-y-6">
      <DSSectionHeader
        title="Enterprise Security Audit Logs"
        subtitle="Immutable log trail of all user authentication events, permission modifications, record updates, and administrative overrides."
        action={
          <DSButton
            variant="outline"
            size="sm"
            isLoading={loading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => fetchLogs(pagination.page)}
          >
            Refresh
          </DSButton>
        }
      />

      {/* Toolbar Search */}
      <DSCard className="p-4 flex items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <DSSearchBox
            placeholder="Search by action, user email, module..."
            value={search}
            onChange={(val) => setSearch(val)}
          />
        </div>

        <span className="text-xs text-slate-500 hidden sm:inline">
          Showing {logs.length} log entry records
        </span>
      </DSCard>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Action Event</th>
                <th className="py-3.5 px-4">User Email</th>
                <th className="py-3.5 px-4">Module</th>
                <th className="py-3.5 px-4">Log Details</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No security audit logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {log.userEmail || 'System Automatic'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                      {log.module}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                      {log.details}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-200"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchLogs(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchLogs(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Inspect Log Drawer Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <span>Audit Log Inspector Record</span>
              </h3>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-semibold">Log ID</span>
                <span className="font-mono text-slate-900 dark:text-white">{selectedLog.id}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-semibold">Action Event</span>
                <span className="font-mono font-bold text-amber-600">{selectedLog.action}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-semibold">User Email</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedLog.userEmail}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-semibold">ERP Module</span>
                <span className="text-slate-900 dark:text-white">{selectedLog.module}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-semibold">Timestamp</span>
                <span className="font-mono text-slate-900 dark:text-white">{new Date(selectedLog.createdAt).toLocaleString()}</span>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block mb-1">Details & Payload</span>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-mono text-[11px] text-slate-800 dark:text-slate-200">
                  {selectedLog.details}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
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
