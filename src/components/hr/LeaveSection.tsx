import React, { useState } from 'react';
import { 
  CalendarX, 
  Plus, 
  CheckCircle2, 
  Clock, 
  X, 
  Calendar as CalendarIcon, 
  User, 
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { LeaveRequest, LeaveBalance, Employee, LeaveCategory } from '../../types/hr';

interface LeaveSectionProps {
  leaveRequests: LeaveRequest[];
  leaveBalances: Record<string, LeaveBalance>;
  employees: Employee[];
  onApplyLeave: (leaveData: Partial<LeaveRequest>) => void;
  onReviewLeave: (id: string, action: 'APPROVED' | 'REJECTED') => void;
}

export const LeaveSection: React.FC<LeaveSectionProps> = ({
  leaveRequests,
  leaveBalances,
  employees,
  onApplyLeave,
  onReviewLeave,
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'requests' | 'balances' | 'calendar'>('requests');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Apply form state
  const [category, setCategory] = useState<LeaveCategory>('CASUAL');
  const [startDate, setStartDate] = useState('2026-08-15');
  const [endDate, setEndDate] = useState('2026-08-17');
  const [reason, setReason] = useState('');

  const currentBal = leaveBalances[selectedEmpId] || {
    casualLeave: { total: 12, taken: 2, remaining: 10 },
    sickLeave: { total: 10, taken: 1, remaining: 9 },
    annualLeave: { total: 15, taken: 4, remaining: 11 },
    emergencyLeave: { total: 5, taken: 0, remaining: 5 },
    maternityPaternity: { total: 30, taken: 0, remaining: 30 },
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === selectedEmpId);
    onApplyLeave({
      employeeId: emp?.id || 'emp_101',
      employeeName: emp?.fullName || 'Staff Member',
      leaveCategory: category,
      startDate,
      endDate,
      totalDays: 3,
      reason,
    });
    setIsApplyModalOpen(false);
    setReason('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <CalendarX className="w-5 h-5 text-amber-500" />
            <span>Leave Management & Approval Engine</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Casual, Sick, Annual & Emergency leave balances, workflow approvals, and team availability calendar.
          </p>
        </div>
        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Apply Leave Application</span>
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'requests'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Leave Applications & Approvals ({leaveRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('balances')}
          className={`pb-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'balances'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Employee Leave Balances
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`pb-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'calendar'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Team Leave & Holiday Calendar
        </button>
      </div>

      {/* TAB 1: LEAVE APPLICATIONS */}
      {activeTab === 'requests' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Leave Application Queue</h3>

          <div className="space-y-3">
            {leaveRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <strong className="text-sm text-slate-900 dark:text-white">{req.employeeName}</strong>
                    <span className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold px-2 py-0.5 rounded uppercase text-[10px]">
                      {req.leaveCategory} LEAVE
                    </span>
                    <span className="text-slate-400">({req.totalDays} Days)</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">
                    Dates: <strong>{req.startDate}</strong> to <strong>{req.endDate}</strong>
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    Reason: <em>"{req.reason}"</em>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {req.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => onReviewLeave(req.id, 'APPROVED')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onReviewLeave(req.id, 'REJECTED')}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                      req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {req.status} {req.approvedBy && `by ${req.approvedBy}`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LEAVE BALANCES */}
      {activeTab === 'balances' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Staff Member:</span>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs font-semibold"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.fullName} ({e.designation})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 uppercase">Casual Leave (CL)</span>
              <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {currentBal.casualLeave.remaining} <span className="text-xs text-slate-400 font-normal">/ {currentBal.casualLeave.total} Days Left</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 uppercase">Sick Leave (SL)</span>
              <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {currentBal.sickLeave.remaining} <span className="text-xs text-slate-400 font-normal">/ {currentBal.sickLeave.total} Days Left</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 uppercase">Annual Earned Leave (AL)</span>
              <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {currentBal.annualLeave.remaining} <span className="text-xs text-slate-400 font-normal">/ {currentBal.annualLeave.total} Days Left</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 uppercase">Emergency Leave</span>
              <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {currentBal.emergencyLeave.remaining} <span className="text-xs text-slate-400 font-normal">/ {currentBal.emergencyLeave.total} Days Left</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CALENDAR VIEW */}
      {activeTab === 'calendar' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-blue-500" />
              <span>August 2026 Site Roster & Leave Schedule</span>
            </h3>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 border-b pb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-xs font-medium">
            {Array.from({ length: 31 }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `2026-08-${String(dayNum).padStart(2, '0')}`;
              const onLeaveToday = leaveRequests.filter(
                (l) => l.status === 'APPROVED' && dateStr >= l.startDate && dateStr <= l.endDate
              );

              return (
                <div
                  key={dayNum}
                  className={`min-h-[64px] p-1.5 rounded-xl border flex flex-col justify-between ${
                    dayNum === 1
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="font-bold text-slate-900 dark:text-white text-[11px]">{dayNum}</span>
                  {onLeaveToday.map((l) => (
                    <span key={l.id} className="text-[9px] bg-amber-500 text-white px-1 rounded truncate">
                      {l.employeeName}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* APPLY LEAVE MODAL */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center space-x-2">
                <CalendarX className="w-5 h-5 text-amber-400" />
                <span>Apply Employee Leave Application</span>
              </h3>
              <button onClick={() => setIsApplyModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Employee *</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.fullName} ({e.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Leave Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as LeaveCategory)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="CASUAL">Casual Leave (CL)</option>
                  <option value="SICK">Sick Leave (SL)</option>
                  <option value="ANNUAL">Annual Earned Leave (AL)</option>
                  <option value="EMERGENCY">Emergency Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason for Leave *</label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  placeholder="State reason..."
                />
              </div>

              <div className="pt-3 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/30"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
