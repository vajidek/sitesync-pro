import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  Plus, 
  DollarSign, 
  Clock, 
  HardHat, 
  CheckCircle2, 
  X,
  Briefcase
} from 'lucide-react';
import { LabourWorker, LabourAllocation } from '../../types/hr';

interface LabourSectionProps {
  labourWorkers: LabourWorker[];
  labourAllocations: LabourAllocation[];
  onAllocateLabour: (allocationData: Partial<LabourAllocation>) => void;
}

export const LabourSection: React.FC<LabourSectionProps> = ({
  labourWorkers,
  labourAllocations,
  onAllocateLabour,
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'allocation'>('roster');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectsList, setProjectsList] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => setProjectsList(Array.isArray(data) ? data : data.projects || []))
      .catch((err) => console.error(err));
  }, []);

  // Allocation Form
  const [selectedProjectId, setSelectedProjectId] = useState('');

  useEffect(() => {
    if (projectsList.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projectsList[0].id || '');
    }
  }, [projectsList, selectedProjectId]);
  const [siteName, setSiteName] = useState('Peruvannamuzhi WTP Site 1');
  const [contractorName, setContractorName] = useState('Acme Infra Crafts Ltd');
  const [skilledCount, setSkilledCount] = useState(15);
  const [unskilledCount, setUnskilledCount] = useState(20);
  const [regularHours, setRegularHours] = useState(280);
  const [overtimeHours, setOvertimeHours] = useState(35);

  const totalLabourCostAllProjects = labourAllocations.reduce((sum, a) => sum + a.totalLaborCostUSD, 0);

  const handleAllocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prj = projectsList.find((p) => p.id === selectedProjectId);
    const calculatedCost = skilledCount * 35 * 8 + unskilledCount * 22 * 8 + overtimeHours * 7.5;

    onAllocateLabour({
      projectId: prj?.id || 'prj_01',
      projectName: prj?.name || prj?.projectName || 'Peruvannamuzhi WTP',
      siteName,
      contractorName,
      skilledWorkersCount: Number(skilledCount),
      unskilledWorkersCount: Number(unskilledCount),
      regularHours: Number(regularHours),
      overtimeHours: Number(overtimeHours),
      totalLaborCostUSD: calculatedCost,
      supervisorIncharge: 'Marcus Brody',
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <HardHat className="w-5 h-5 text-amber-500" />
            <span>Site Labour & Contractor Cost Control</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Skilled masons, welders, pipe fitters, daily wage tracking & subcontractor cost allocations per site.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Daily Labour Allocation</span>
        </button>
      </div>

      {/* Metric Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-5 rounded-2xl text-white shadow-md border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Total Project Labour Expense</span>
          <div className="text-2xl font-extrabold text-white mt-1">
            ${totalLabourCostAllProjects.toLocaleString()} USD
          </div>
          <p className="text-xs text-slate-300 mt-0.5">Calculated across active site allocations & daily wage rates</p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg font-semibold">
            46 Active Site Craftsmen
          </span>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg font-semibold">
            2 Subcontractor Agencies
          </span>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('roster')}
          className={`pb-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'roster'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Site Craftsmen & Labour Roster ({labourWorkers.length})
        </button>
        <button
          onClick={() => setActiveTab('allocation')}
          className={`pb-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'allocation'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Project Labour Cost Allocations ({labourAllocations.length})
        </button>
      </div>

      {/* TAB 1: WORKERS ROSTER */}
      {activeTab === 'roster' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3.5">Worker Code & Name</th>
                  <th className="p-3.5">Skill Trade</th>
                  <th className="p-3.5">Contractor Agency</th>
                  <th className="p-3.5">Assigned Project & Site</th>
                  <th className="p-3.5">Daily Wage</th>
                  <th className="p-3.5">Overtime Rate</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {labourWorkers.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      <div>{w.fullName}</div>
                      <span className="text-[10px] font-mono text-slate-400">{w.workerCode}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded font-bold text-[10px]">
                        {w.skillCategory}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">{w.contractorName}</td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300">
                      <div className="font-semibold text-blue-600 dark:text-blue-400">{w.assignedProjectName}</div>
                      <span className="text-[10px] text-slate-400">{w.assignedSite}</span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">${w.dailyWageRateUSD}/day</td>
                    <td className="p-3.5 font-mono text-emerald-600 font-bold">${w.overtimeHourlyRateUSD}/hr</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded text-[10px] font-bold">
                        {w.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ALLOCATIONS TABLE */}
      {activeTab === 'allocation' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Project Site Labour Cost Log</h3>

          <div className="space-y-3">
            {labourAllocations.map((a) => (
              <div
                key={a.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <strong className="text-sm text-slate-900 dark:text-white">{a.projectName}</strong>
                    <span className="text-slate-400">({a.siteName})</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">
                    Agency: <strong>{a.contractorName}</strong> • Staff: {a.skilledWorkersCount} Skilled, {a.unskilledWorkersCount} Helpers
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Supervisor: {a.supervisorIncharge} • Hours: {a.regularHours}h Normal + {a.overtimeHours}h OT
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Day Cost</span>
                  <span className="text-lg font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                    ${a.totalLaborCostUSD.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ALLOCATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center space-x-2">
                <HardHat className="w-5 h-5 text-amber-400" />
                <span>Log Site Labour Allocation</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAllocationSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Project *</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  {projectsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name || p.projectName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contractor Agency</label>
                <input
                  type="text"
                  required
                  value={contractorName}
                  onChange={(e) => setContractorName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Skilled Workers</label>
                  <input
                    type="number"
                    value={skilledCount}
                    onChange={(e) => setSkilledCount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Unskilled Helpers</label>
                  <input
                    type="number"
                    value={unskilledCount}
                    onChange={(e) => setUnskilledCount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
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
                  Log Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
