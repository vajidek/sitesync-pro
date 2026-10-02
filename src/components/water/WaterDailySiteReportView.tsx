import React, { useState, useEffect } from 'react';
import { safeJson, safeFetchJson } from '../../lib/safeFetch';
import { WaterDailySiteReport, MechanicalWorkCategory } from '../../types/waterInfrastructureEngine';
import {
  Calendar,
  Plus,
  Users,
  Truck,
  Wrench,
  AlertTriangle,
  Clock,
  FileText,
  MapPin,
  X,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export const WaterDailySiteReportView: React.FC = () => {
  const [reports, setReports] = useState<WaterDailySiteReport[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    safeFetchJson('/api/kwa/daily-reports')
      .then((data) => {
        if (Array.isArray(data)) setReports(data);
      })
      .catch((err) => console.error(err));

    safeFetchJson('/api/kwa/projects')
      .then((data) => {
        if (Array.isArray(data)) setProjectsList(data);
      })
      .catch((err) => console.error(err));
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    dprNumber: '',
    reportDate: new Date().toISOString().split('T')[0],
    projectId: '',
    projectName: '',
    chainageCovered: '',
    weatherCondition: 'Clear / Sunny',
    siteEngineerName: '',
    contractorSupervisor: '',
    mechanicalCategory: 'PIPELAYING' as MechanicalWorkCategory,
    pipeLengthLaidMeters: 0,
    valvesFittedCount: 0,
    jointingCompletedCount: 0,
    skilledLaborCount: 8,
    unskilledLaborCount: 15,
    equipmentDeployed: 'Excavator CAT-320D (1), Crane 20T (1), DG Set 125kVA (1)',
    hydroTestDone: false,
    testReachCode: '',
    testPressureBar: 10,
    testResultStatus: 'PASS',
    safetyIncidentsCount: 0,
    safetyDetails: 'Zero incidents logged today.',
    delayReason: 'None',
    nextDayPlannedWork: 'Pipeline alignment & concrete thrust block pouring',
    remarks: 'Approved by Resident Engineer'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedProj = projectsList.find((p) => p.id === formData.projectId || p.name === formData.projectName);
      const payload = {
        ...formData,
        dprNumber: formData.dprNumber || `DPR-WATER-${Date.now().toString().slice(-4)}`,
        projectName: selectedProj ? selectedProj.name : (formData.projectName || 'Peruvannamuzhi WTP Project')
      };

      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/kwa/daily-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const json = await safeJson(res);
      if (json?.success && json.data) {
        setReports([json.data, ...reports]);
        setIsModalOpen(false);
      } else {
        // Fallback local update
        setReports([{ id: `dpr_${Date.now()}`, ...payload } as any, ...reports]);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Error submitting DPR:', err);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Daily Site Progress Log (DPR)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Record daily pipe laying meters, valve fitting, jointing, labor deployment, and hydro-test logs
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition flex items-center justify-center space-x-1.5 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>New Daily DPR Log</span>
        </button>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 text-center">
            <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Loading Daily Reports...</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Retrieving logs from SiteSync Pro project service</p>
          </div>
        ) : (
          reports.map((rpt) => (
            <div
              key={rpt.id}
              className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/40 transition"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-bold rounded">
                      {rpt.dprNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {rpt.reportDate}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {rpt.projectName}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-rose-500" /> {rpt.chainageCovered || 'Ch 12+400 to 12+850'}</span>
                    <span>•</span>
                    <span>Weather: {rpt.weatherCondition}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-right">
                  <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="block text-[10px] font-medium text-slate-400 uppercase">Pipe Laid</span>
                    <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{rpt.pipeLengthLaidMeters} m</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="block text-[10px] font-medium text-slate-400 uppercase">Valves / Joints</span>
                    <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">{rpt.valvesFittedCount} V / {rpt.jointingCompletedCount} J</span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-xs">
                <div className="space-y-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-500" /> Workforce Deployed:
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    {rpt.skilledLaborCount} Skilled, {rpt.unskilledLaborCount} Unskilled (Total {rpt.skilledLaborCount + rpt.unskilledLaborCount})
                  </p>
                  <p className="text-slate-500 dark:text-slate-500 text-[11px]">
                    Site Eng: {rpt.siteEngineerName} | Supervisor: {rpt.contractorSupervisor}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-amber-500" /> Equipment & Hydro Test:
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 truncate" title={rpt.equipmentDeployed}>
                    {rpt.equipmentDeployed}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-slate-500">Hydro Test:</span>
                    {rpt.hydroTestDone ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> {rpt.testReachCode} ({rpt.testPressureBar} bar - {rpt.testResultStatus})
                      </span>
                    ) : (
                      <span className="text-slate-400">Not Executed Today</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-purple-500" /> Planned Work & Remarks:
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 line-clamp-1">
                    Next: {rpt.nextDayPlannedWork}
                  </p>
                  <p className="text-slate-500 dark:text-slate-500 text-[11px] line-clamp-1">
                    Remarks: {rpt.remarks}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                New Daily Site Progress Report (DPR)
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Scheme</label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => {
                      const proj = projectsList.find((p) => p.id === e.target.value);
                      setFormData({
                        ...formData,
                        projectId: e.target.value,
                        projectName: proj ? proj.name : ''
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Select Project Scheme</option>
                    {projectsList.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Report Date</label>
                  <input
                    type="date"
                    value={formData.reportDate}
                    onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Chainage Section Covered</label>
                  <input
                    type="text"
                    placeholder="e.g. Ch 14+200 to 14+650"
                    value={formData.chainageCovered}
                    onChange={(e) => setFormData({ ...formData, chainageCovered: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Weather Condition</label>
                  <input
                    type="text"
                    value={formData.weatherCondition}
                    onChange={(e) => setFormData({ ...formData, weatherCondition: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Progress Metrics */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pipe Laid (Meters)</label>
                  <input
                    type="number"
                    value={formData.pipeLengthLaidMeters}
                    onChange={(e) => setFormData({ ...formData, pipeLengthLaidMeters: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Valves Fitted</label>
                  <input
                    type="number"
                    value={formData.valvesFittedCount}
                    onChange={(e) => setFormData({ ...formData, valvesFittedCount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Joints Completed</label>
                  <input
                    type="number"
                    value={formData.jointingCompletedCount}
                    onChange={(e) => setFormData({ ...formData, jointingCompletedCount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              {/* Labor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Skilled Labor Count</label>
                  <input
                    type="number"
                    value={formData.skilledLaborCount}
                    onChange={(e) => setFormData({ ...formData, skilledLaborCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Unskilled Labor Count</label>
                  <input
                    type="number"
                    value={formData.unskilledLaborCount}
                    onChange={(e) => setFormData({ ...formData, unskilledLaborCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Site Engineer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Eng. Suresh Kumar"
                  value={formData.siteEngineerName}
                  onChange={(e) => setFormData({ ...formData, siteEngineerName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Planned Work for Tomorrow</label>
                <input
                  type="text"
                  value={formData.nextDayPlannedWork}
                  onChange={(e) => setFormData({ ...formData, nextDayPlannedWork: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow"
                >
                  Save & Publish DPR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
