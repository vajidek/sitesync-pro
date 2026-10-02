import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  HardHat, 
  Plus, 
  Building2, 
  Truck, 
  Boxes, 
  CheckCircle2, 
  Clock, 
  Image as ImageIcon,
  X,
  FileCheck,
  UserCheck
} from 'lucide-react';
import { DailyDutyLog, Employee } from '../../types/hr';
import { safeJson } from '../../lib/safeFetch';

interface DutyLogsSectionProps {
  dutyLogs: DailyDutyLog[];
  employees: Employee[];
  onSubmitDutyLog: (logData: Partial<DailyDutyLog>) => void;
  onVerifyDutyLog: (id: string, status: 'VERIFIED' | 'APPROVED') => void;
}

export const DutyLogsSection: React.FC<DutyLogsSectionProps> = ({
  dutyLogs,
  employees,
  onSubmitDutyLog,
  onVerifyDutyLog,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('prj_01');
  const [siteName, setSiteName] = useState('Pier 3 Structural Deck');
  const [workDescription, setWorkDescription] = useState('');
  const [workingHours, setWorkingHours] = useState(8.5);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => safeJson(res))
      .then((data) => {
        if (data?.success && data.data) {
          setProjects(data.data);
          if (data.data.length > 0) setSelectedProjectId(data.data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === selectedEmpId);
    const prj = projects.find((p) => p.id === selectedProjectId);

    onSubmitDutyLog({
      employeeId: emp?.id || 'emp_101',
      employeeName: emp?.fullName || 'Staff Member',
      projectId: prj?.id || 'prj_01',
      projectName: prj?.name || 'Peruvannamuzhi WTP Project',
      siteName,
      workDescription,
      workingHours: Number(workingHours),
      equipmentUsed: selectedEquipment,
      remarks,
      photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=600&q=80',
    });

    setIsModalOpen(false);
    setWorkDescription('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <HardHat className="w-5 h-5 text-indigo-500" />
            <span>Field Employee Daily Duty Logs</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log daily project site tasks, hours worked, heavy machinery utilized & material consumption.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Daily Field Duty Log</span>
        </button>
      </div>

      {/* Duty Logs Feed Cards */}
      <div className="space-y-4">
        {dutyLogs.map((log) => (
          <div
            key={log.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                  {log.employeeName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{log.employeeName}</h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{log.projectName}</span>
                    <span>• {log.siteName}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 self-end sm:self-auto">
                <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                  {log.workingHours} Hours Logged
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                  log.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : log.status === 'VERIFIED'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {log.status}
                </span>
              </div>
            </div>

            {/* Description & Assets Used */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-2 space-y-2">
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {log.workDescription}
                </p>

                {log.equipmentUsed && log.equipmentUsed.length > 0 && (
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 pt-1">
                    <Truck className="w-4 h-4 text-amber-500" />
                    <span><strong>Equipment Used:</strong> {log.equipmentUsed.join(', ')}</span>
                  </div>
                )}

                {log.materialsUsed && log.materialsUsed.length > 0 && (
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <Boxes className="w-4 h-4 text-blue-500" />
                    <span>
                      <strong>Materials:</strong>{' '}
                      {log.materialsUsed.map((m) => `${m.quantity} ${m.unit} ${m.itemName}`).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Photo Preview if any */}
              {log.photoUrl && (
                <div>
                  <img
                    src={log.photoUrl}
                    alt="Site Work"
                    className="w-full h-24 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                </div>
              )}
            </div>

            {/* Verification Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-4 text-slate-500 text-[11px]">
                {log.verifiedBy && <span>Verified By: <strong>{log.verifiedBy}</strong></span>}
                {log.approvedBy && <span>Approved By: <strong>{log.approvedBy}</strong></span>}
              </div>

              {log.status === 'SUBMITTED' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onVerifyDutyLog(log.id, 'VERIFIED')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
                  >
                    Verify (Site Incharge)
                  </button>
                  <button
                    onClick={() => onVerifyDutyLog(log.id, 'APPROVED')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
                  >
                    Approve (Project Manager)
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* SUBMIT DUTY LOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center space-x-2">
                <HardHat className="w-5 h-5 text-indigo-400" />
                <span>Submit Field Work & Duty Report</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
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
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Project *</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Site / Location *</label>
                <input
                  type="text"
                  required
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Detailed Work Description *</label>
                <textarea
                  required
                  rows={3}
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  placeholder="Describe tasks completed, safety checks conducted, flange torquing..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Working Hours Logged</label>
                <input
                  type="number"
                  step="0.5"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="pt-3 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/30"
                >
                  Submit Duty Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
