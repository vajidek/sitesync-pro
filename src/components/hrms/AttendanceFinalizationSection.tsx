import React, { useState, useEffect } from 'react';
import { safeJson } from '../../lib/safeFetch';
import {
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  RefreshCw,
  FileCheck2,
  Calendar,
  Layers,
  ChevronDown,
  UserCheck
} from 'lucide-react';

interface AttendanceFinalizationSectionProps {
  currSymbol: string;
  payrollPeriods: any[];
  employees: any[];
  onAttendanceFinalized?: () => void;
}

export const AttendanceFinalizationSection: React.FC<AttendanceFinalizationSectionProps> = ({
  currSymbol,
  payrollPeriods,
  employees,
  onAttendanceFinalized,
}) => {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [finalizations, setFinalizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockReason, setUnlockReason] = useState('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (payrollPeriods && payrollPeriods.length > 0 && !selectedPeriodId) {
      setSelectedPeriodId(payrollPeriods[0].id);
    }
  }, [payrollPeriods]);

  useEffect(() => {
    if (selectedPeriodId) {
      fetchFinalizations(selectedPeriodId);
    }
  }, [selectedPeriodId]);

  const fetchFinalizations = async (periodId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hrms/attendance/finalizations?periodId=${periodId}`).then(safeJson);
      if (res?.data) {
        setFinalizations(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch attendance finalizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeAttendance = async () => {
    if (!selectedPeriodId) return;
    setIsFinalizing(true);
    setActionMessage(null);
    try {
      const currentPeriod = payrollPeriods.find((p) => p.id === selectedPeriodId);
      const res = await fetch('/api/hrms/attendance/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodId: selectedPeriodId,
          monthYear: currentPeriod?.periodName || 'August 2026',
          remarks: 'Pre-payroll attendance verification completed by HR Operations.',
        }),
      });
      const data = await safeJson(res);
      if (data?.success) {
        setActionMessage({
          type: 'success',
          text: `Attendance for ${currentPeriod?.periodName || 'period'} finalized and locked successfully for payroll processing.`,
        });
        fetchFinalizations(selectedPeriodId);
        if (onAttendanceFinalized) onAttendanceFinalized();
      } else {
        setActionMessage({
          type: 'error',
          text: data?.message || data?.error || 'Failed to finalize attendance.',
        });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.message || 'Error finalizing attendance.' });
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleUnlockAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeriodId || !unlockReason.trim()) return;
    setLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/hrms/attendance/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodId: selectedPeriodId,
          reason: unlockReason,
        }),
      });
      const data = await safeJson(res);
      if (data?.success) {
        setActionMessage({
          type: 'success',
          text: 'Attendance finalization unlocked for adjustments. Audit trail record logged.',
        });
        setIsUnlockModalOpen(false);
        setUnlockReason('');
        fetchFinalizations(selectedPeriodId);
        if (onAttendanceFinalized) onAttendanceFinalized();
      } else {
        setActionMessage({
          type: 'error',
          text: data?.message || data?.error || 'Failed to unlock attendance.',
        });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.message || 'Error unlocking attendance.' });
    } finally {
      setLoading(false);
    }
  };

  const isCurrentPeriodLocked = finalizations.length > 0 && finalizations.every((f) => f.status === 'FINALIZED');
  const totalPayableDays = finalizations.reduce((acc, curr) => acc + Number(curr.payableDutyDays || 0), 0);
  const totalOvertimeHours = finalizations.reduce((acc, curr) => acc + Number(curr.overtimeHours || 0), 0);
  const totalLopDays = finalizations.reduce((acc, curr) => acc + Number(curr.lossOfPayDays || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Monthly Attendance Finalization & Payroll Lock</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Governed attendance baseline required before executing statutory payroll runs
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Period selector */}
          <div className="relative">
            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 pr-8 cursor-pointer"
            >
              {payrollPeriods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.periodName} ({p.month}/{p.year})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fetchFinalizations(selectedPeriodId)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {isCurrentPeriodLocked ? (
            <button
              onClick={() => setIsUnlockModalOpen(true)}
              className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Unlock for Audit</span>
            </button>
          ) : (
            <button
              onClick={handleFinalizeAttendance}
              disabled={isFinalizing || loading}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isFinalizing ? 'Finalizing...' : 'Finalize & Lock Period'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium block">Finalization Status</span>
          <div className="flex items-center gap-2 mt-1">
            {isCurrentPeriodLocked ? (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Lock className="w-3 h-3" /> LOCKED
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Unlock className="w-3 h-3" /> OPEN / DRAFT
              </span>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium block">Total Payable Duty Days</span>
          <div className="text-lg font-bold text-white font-mono mt-0.5">{totalPayableDays} Days</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium block">Total Overtime Logged</span>
          <div className="text-lg font-bold text-indigo-400 font-mono mt-0.5">{totalOvertimeHours} Hrs</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium block">Loss of Pay (LOP) Days</span>
          <div className="text-lg font-bold text-rose-400 font-mono mt-0.5">{totalLopDays} Days</div>
        </div>
      </div>

      {/* Finalizations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-3 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-indigo-400" />
            <span>Employee Duty Days & Finalized Payroll Input Baseline</span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {finalizations.length} Records Finalized
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4 text-center">Calendar Days</th>
                <th className="py-3 px-4 text-center">Present</th>
                <th className="py-3 px-4 text-center">Paid Leaves</th>
                <th className="py-3 px-4 text-center">LOP</th>
                <th className="py-3 px-4 text-center font-bold text-white">Payable Duty Days</th>
                <th className="py-3 px-4 text-center">OT Hours</th>
                <th className="py-3 px-4">Finalized Status</th>
                <th className="py-3 px-4">Audit Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {finalizations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No finalized attendance records found for this period. Click "Finalize & Lock Period" above to compute and snapshot the baseline.
                  </td>
                </tr>
              ) : (
                finalizations.map((fin) => (
                  <tr key={fin.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{fin.employeeName || fin.employeeId}</div>
                      <div className="font-mono text-[10px] text-indigo-400">{fin.employeeCode || fin.employeeId}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">{fin.totalCalendarDays}</td>
                    <td className="py-3 px-4 text-center font-mono text-emerald-400 font-semibold">{fin.presentDays}</td>
                    <td className="py-3 px-4 text-center font-mono text-sky-400">{fin.paidLeaveDays}</td>
                    <td className="py-3 px-4 text-center font-mono text-rose-400 font-semibold">{fin.lossOfPayDays}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-white text-sm bg-indigo-950/30">
                      {fin.payableDutyDays}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-amber-400">{fin.overtimeHours || 0}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit ${
                          fin.status === 'FINALIZED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {fin.status === 'FINALIZED' ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                        <span>{fin.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-500 truncate max-w-[120px]" title={fin.snapshotHash || 'N/A'}>
                      {fin.snapshotHash ? fin.snapshotHash.slice(0, 12) + '...' : 'GEN-SNAPSHOT'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UNLOCK MODAL */}
      {isUnlockModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Unlock className="w-4 h-4" />
                <span>Unlock Attendance Finalization</span>
              </div>
              <button onClick={() => setIsUnlockModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Unlocking will allow adjustments to duty days and punch logs. An immutable audit record will be logged with your justification reason.
            </p>

            <form onSubmit={handleUnlockAttendance} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Audit Justification Reason *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g., Manual punch reconciliation for site team approved by Operations Manager"
                  value={unlockReason}
                  onChange={(e) => setUnlockReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUnlockModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !unlockReason.trim()}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold disabled:opacity-50"
                >
                  {loading ? 'Unlocking...' : 'Confirm Unlock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
