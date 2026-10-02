import React, { useState } from 'react';
import { 
  UserCheck, 
  Clock, 
  RefreshCw, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  ShieldCheck, 
  Calendar, 
  ArrowRight,
  Plus,
  X
} from 'lucide-react';
import { DailyAttendanceRecord, ESSLDevice, AttendanceCorrectionRequest, Employee } from '../../types/hr';

interface AttendanceSectionProps {
  attendanceRecords: DailyAttendanceRecord[];
  esslDevices: ESSLDevice[];
  correctionRequests: AttendanceCorrectionRequest[];
  employees: Employee[];
  onPunchAttendance: (employeeId: string, type: 'CHECK_IN' | 'CHECK_OUT') => void;
  onSyncESSL: () => void;
  onReviewCorrection: (id: string, action: 'APPROVED' | 'REJECTED') => void;
}

export const AttendanceSection: React.FC<AttendanceSectionProps> = ({
  attendanceRecords,
  esslDevices,
  correctionRequests,
  employees,
  onPunchAttendance,
  onSyncESSL,
  onReviewCorrection,
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'daily' | 'essl' | 'corrections'>('daily');

  const selectedEmpRecord = attendanceRecords.find(
    (a) => a.employeeId === selectedEmpId && a.date === new Date().toISOString().split('T')[0]
  );

  return (
    <div className="space-y-6">
      
      {/* Top Punch & ESSL Action Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-emerald-500" />
            <span>Daily Attendance & ESSL Timecard Engine</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            ESSL biometric turnstile sync, manual timecard punches, shifts & late entry auditing.
          </p>
        </div>

        {/* Live Manual Punch Simulator */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <select
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="py-1.5 px-3 bg-white dark:bg-slate-900 border rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.fullName} ({e.employeeCode})
              </option>
            ))}
          </select>

          <button
            onClick={() => onPunchAttendance(selectedEmpId, 'CHECK_IN')}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition"
          >
            Check In Now
          </button>
          <button
            onClick={() => onPunchAttendance(selectedEmpId, 'CHECK_OUT')}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow transition"
          >
            Check Out Now
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('daily')}
          className={`pb-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'daily'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Today's Attendance Roll Call ({attendanceRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('essl')}
          className={`pb-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'essl'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          ESSL Biometric Devices ({esslDevices.length})
        </button>
        <button
          onClick={() => setActiveTab('corrections')}
          className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'corrections'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>Correction Requests</span>
          {correctionRequests.filter((c) => c.status === 'PENDING').length > 0 && (
            <span className="bg-amber-500 text-white px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {correctionRequests.filter((c) => c.status === 'PENDING').length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: DAILY ROLL CALL TABLE */}
      {activeTab === 'daily' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Live Daily Punch Log • Date: {new Date().toISOString().split('T')[0]}
            </span>
            <span className="text-[11px] text-slate-400">Auto-synced from ESSL SDK</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3.5">Employee</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Check In</th>
                  <th className="p-3.5">Check Out</th>
                  <th className="p-3.5">Shift</th>
                  <th className="p-3.5">Late / OT</th>
                  <th className="p-3.5">Location / ESSL</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {attendanceRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      <div>{rec.employeeName}</div>
                      <span className="text-[10px] font-mono text-slate-400">{rec.employeeCode}</span>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{rec.department}</td>
                    <td className="p-3.5 text-slate-900 dark:text-white font-mono font-semibold">
                      {rec.checkIn || '--:--'}
                    </td>
                    <td className="p-3.5 text-slate-900 dark:text-white font-mono font-semibold">
                      {rec.checkOut || '--:--'}
                    </td>
                    <td className="p-3.5">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        {rec.shift}
                      </span>
                    </td>
                    <td className="p-3.5 space-y-0.5">
                      {rec.lateMinutes > 0 && (
                        <div className="text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                          +{rec.lateMinutes}m Late
                        </div>
                      )}
                      {rec.overtimeHours > 0 && (
                        <div className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                          +{rec.overtimeHours}h Overtime
                        </div>
                      )}
                      {rec.lateMinutes === 0 && rec.overtimeHours === 0 && (
                        <span className="text-slate-400 text-[10px]">On Time</span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {rec.locationPunchIn || rec.esslDeviceId || 'Mobile Geo-Punch'}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        rec.status === 'PRESENT'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : rec.status === 'LATE_ENTRY'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ESSL BIOMETRIC DEVICES */}
      {activeTab === 'essl' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-blue-950 text-white p-4 rounded-xl border border-blue-900">
            <div>
              <h3 className="text-sm font-bold">ESSL Biometric Hardware Gateway</h3>
              <p className="text-xs text-slate-300">TCP/IP Port 4370 Direct Push Protocol Integration</p>
            </div>
            <button
              onClick={onSyncESSL}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              <span>Trigger Sync All Devices</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {esslDevices.map((dev) => (
              <div key={dev.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{dev.deviceId}</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded text-[10px] font-bold border border-emerald-300 dark:border-emerald-800">
                    {dev.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{dev.deviceName}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{dev.siteLocation}</p>
                
                <div className="pt-3 border-t text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
                  <div>IP Address: <strong>{dev.ipAddress}:{dev.port}</strong></div>
                  <div>Logs Today: <strong>{dev.totalLogsToday} Punches</strong></div>
                  <div className="text-slate-400">Last Sync: {dev.lastSyncTime}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CORRECTION REQUESTS */}
      {activeTab === 'corrections' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Attendance Correction & Punch Adjustment Requests</h3>

          {correctionRequests.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No correction requests pending.</p>
          ) : (
            <div className="space-y-3">
              {correctionRequests.map((req) => (
                <div key={req.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <strong className="text-sm text-slate-900 dark:text-white">{req.employeeName}</strong>
                      <span className="text-slate-400">({req.date})</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">
                      Reason: <em>"{req.reason}"</em>
                    </p>
                    <div className="mt-2 flex items-center space-x-4 text-[11px] text-slate-500">
                      <span>Original: {req.originalCheckIn || '--'} to {req.originalCheckOut || '--'}</span>
                      <ArrowRight className="w-3 h-3 text-blue-500" />
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        Requested: {req.requestedCheckIn} to {req.requestedCheckOut}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {req.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => onReviewCorrection(req.id, 'APPROVED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
                        >
                          Approve Adjustment
                        </button>
                        <button
                          onClick={() => onReviewCorrection(req.id, 'REJECTED')}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                        req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {req.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
