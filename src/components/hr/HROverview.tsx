import React from 'react';
import { 
  Users, 
  UserCheck, 
  CalendarX, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  Gift, 
  FileText, 
  CheckCircle2, 
  ArrowUpRight,
  Sparkles,
  Layers,
  HardHat
} from 'lucide-react';
import { Employee, DailyAttendanceRecord, HRNotification, LeaveRequest, DailyDutyLog } from '../../types/hr';

interface HROverviewProps {
  employees: Employee[];
  attendanceToday: DailyAttendanceRecord[];
  notifications: HRNotification[];
  pendingLeaves: LeaveRequest[];
  dutyLogs: DailyDutyLog[];
  onNavigateTab: (tab: string) => void;
}

export const HROverview: React.FC<HROverviewProps> = ({
  employees,
  attendanceToday,
  notifications,
  pendingLeaves,
  dutyLogs,
  onNavigateTab,
}) => {
  const activeEmpCount = employees.filter((e) => e.status === 'ACTIVE').length;
  const presentCount = attendanceToday.filter((a) => a.status === 'PRESENT' || a.status === 'LATE_ENTRY').length;
  const lateCount = attendanceToday.filter((a) => a.status === 'LATE_ENTRY').length;
  const absentCount = employees.length - presentCount;

  // Documents expiring soon
  const expiringDocs = employees.flatMap((emp) =>
    emp.documents
      .filter((d) => d.status === 'EXPIRING_SOON' || d.status === 'EXPIRED')
      .map((d) => ({ ...d, empName: emp.fullName, empCode: emp.employeeCode }))
  );

  return (
    <div className="space-y-6">
      
      {/* Top Welcome / Quick Stats Header */}
      <div className="bg-gradient-to-r from-[#0B192C] via-slate-900 to-blue-950 rounded-2xl p-6 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold tracking-wider uppercase mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Enterprise HR & People Operations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Enterprise Workforce Command
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Real-time attendance tracking, ESSL biometric integration, site duty logs, automated payroll calculations & contract labour cost controls.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigateTab('attendance')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center space-x-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>ESSL Live Timecard</span>
            </button>
            <button
              onClick={() => onNavigateTab('payroll')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center space-x-2"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Process Payroll</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Employees
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{employees.length}</span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{activeEmpCount} Active</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Across 5 core engineering divisions
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today's Attendance
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{presentCount}</span>
            <span className="text-xs font-medium text-slate-500">/ {employees.length} Checked In</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-amber-600 dark:text-amber-400 font-medium">{lateCount} Late Entries</span>
            <span className="text-rose-600 dark:text-rose-400 font-medium">{absentCount} Absent</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Approvals
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <CalendarX className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{pendingLeaves.length}</span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Leave Applications</span>
          </div>
          <button
            onClick={() => onNavigateTab('leaves')}
            className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center space-x-1"
          >
            <span>Review Applications</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Site Duty Logs Today
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <HardHat className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{dutyLogs.length}</span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Logged Reports</span>
          </div>
          <button
            onClick={() => onNavigateTab('dutylogs')}
            className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center space-x-1"
          >
            <span>View Duty Logs</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Alerts & Expiries & Notifications */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Document Expiry Warnings */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Document Expiry & Compliance Alerts ({expiringDocs.length})
                </h3>
              </div>
              <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold px-2.5 py-1 rounded-full border border-amber-300 dark:border-amber-800">
                Action Required
              </span>
            </div>

            {expiringDocs.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                All employee passports, licenses, and safety passes are fully compliant.
              </p>
            ) : (
              <div className="space-y-3">
                {expiringDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">{doc.empName}</span>
                        <span className="text-xs text-slate-500">({doc.empCode})</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        <strong className="text-slate-800 dark:text-slate-100">{doc.title}</strong> — No: {doc.documentNumber}
                      </p>
                      {doc.expiryDate && (
                        <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                          Expires on {doc.expiryDate}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => onNavigateTab('employees')}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition self-start sm:self-center"
                    >
                      Update Document
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HR System Notifications */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <span>Recent System & Payroll Feed</span>
              </h3>
            </div>

            <div className="space-y-3">
              {notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                >
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 mt-0.5">
                    {n.type === 'BIRTHDAY' ? <Gift className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Quick Employee Directory Preview & Shortcuts */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Core Engineering Staff
            </h3>
            <div className="space-y-3">
              {employees.slice(0, 4).map((emp) => (
                <div key={emp.id} className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                  <img
                    src={emp.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                    alt={emp.fullName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{emp.fullName}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{emp.designation}</p>
                    <span className="inline-block mt-0.5 text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                      {emp.department}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => onNavigateTab('employees')}
              className="mt-4 w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
            >
              Open Complete Employee Master
            </button>
          </div>

          <div className="bg-blue-950 text-white rounded-2xl p-5 border border-blue-900 shadow-md">
            <div className="flex items-center space-x-2 text-blue-400 mb-2">
              <Layers className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Site Integration Active</span>
            </div>
            <h4 className="text-sm font-bold text-white">Cross-Module Payroll & Duty Link</h4>
            <p className="text-xs text-slate-300 mt-1">
              All duty hours logged here automatically compute labour costs for Peruvannamuzhi WTP & Water Transmission Main projects.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
