import React, { useState, useEffect } from 'react';
import { safeJson, safeFetchJson } from '../../lib/safeFetch';
import { WaterTestReport, TestType } from '../../types/waterInfrastructureEngine';
import {
  FileCheck2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  ShieldCheck,
  Search,
  X,
  Award,
  ChevronRight
} from 'lucide-react';

export const WaterTestingModule: React.FC = () => {
  const [testReports, setTestReports] = useState<WaterTestReport[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedReportForCert, setSelectedReportForCert] = useState<WaterTestReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    safeFetchJson('/api/kwa/testing')
      .then((data) => {
        if (Array.isArray(data)) setTestReports(data);
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
    testNo: '',
    testType: 'HYDROSTATIC_REACH' as TestType,
    projectId: '',
    projectName: '',
    chainageSection: 'Ch 10+000 to 11+500',
    testDate: new Date().toISOString().split('T')[0],
    testPressureBar: 12,
    holdingDurationHours: 4,
    allowablePressureDropBar: 0.2,
    actualPressureDropBar: 0.05,
    testResult: 'PASS' as 'PASS' | 'FAIL' | 'RE_TEST_REQUIRED',
    witnessOfficer: 'Chief Resident Engineer',
    witnessOfficialName: 'Chief Resident Engineer',
    contractorEngineerName: 'Lead Project Manager',
    remarks: 'Reach held pressure without leakage.'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedProj = projectsList.find((p) => p.id === formData.projectId || p.name === formData.projectName);
      const payload = {
        ...formData,
        testNo: formData.testNo || `TEST-WATER-${Date.now().toString().slice(-4)}`,
        projectName: selectedProj ? selectedProj.name : (formData.projectName || 'Peruvannamuzhi WTP Scheme')
      };

      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/kwa/testing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const json = await safeJson(res);
      if (json?.success && json.data) {
        setTestReports([json.data, ...testReports]);
        setIsModalOpen(false);
      } else {
        setTestReports([{ id: `tst_${Date.now()}`, ...payload } as any, ...testReports]);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Error recording test report:', err);
      setIsModalOpen(false);
    }
  };

  const filteredReports = testReports.filter((r) => {
    return filterType === 'ALL' || r.testType === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Hydrostatic Pressure & Quality Testing Register
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log reach pressure holding tests, concrete slump/cube strength, disinfections & witness approvals
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition flex items-center justify-center space-x-1.5 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Record Hydro / Quality Test</span>
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.map((rpt) => (
          <div
            key={rpt.id}
            className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/40 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold rounded">
                  {rpt.testNo}
                </span>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                  rpt.testResult === 'PASS'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  {rpt.testResult}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                {rpt.testType}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                {rpt.chainageSection} • {rpt.projectName}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                <div>Test Pressure: <span className="font-bold text-blue-600 dark:text-blue-400">{rpt.testPressureBar} bar</span></div>
                <div>Holding Time: <span className="font-bold text-slate-800 dark:text-slate-200">{rpt.holdingDurationHours} hrs</span></div>
                <div>Actual Drop: <span className="font-bold text-emerald-600">{rpt.actualPressureDropBar} bar</span></div>
                <div>Witness: <span className="font-semibold text-slate-800 dark:text-slate-200">{rpt.witnessOfficer || rpt.witnessOfficialName || rpt.kwaWitnessOfficer}</span></div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Tested: {rpt.testDate}
              </span>

              <button
                onClick={() => setSelectedReportForCert(rpt)}
                className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-lg transition flex items-center space-x-1"
              >
                <Award className="w-3.5 h-3.5" />
                <span>View Certificate</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Certificate Modal */}
      {selectedReportForCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Official Test Certificate</span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                  Hydrostatic Reach Pass Certificate #{selectedReportForCert.testNo}
                </h3>
              </div>
              <button onClick={() => setSelectedReportForCert(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <p>
                This certifies that section <strong className="text-slate-900 dark:text-white">{selectedReportForCert.chainageSection}</strong> under <strong className="text-slate-900 dark:text-white">{selectedReportForCert.projectName}</strong> has successfully completed hydrostatic pressure holding test in accordance with Indian Standard specifications.
              </p>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1 text-[11px]">
                <div className="flex justify-between"><span>Test Pressure Applied:</span><span className="font-bold">{selectedReportForCert.testPressureBar} bar</span></div>
                <div className="flex justify-between"><span>Holding Duration:</span><span className="font-bold">{selectedReportForCert.holdingDurationHours} Hours</span></div>
                <div className="flex justify-between"><span>Allowable Drop:</span><span className="font-bold">{selectedReportForCert.allowablePressureDropBar} bar</span></div>
                <div className="flex justify-between"><span>Observed Pressure Drop:</span><span className="font-bold text-emerald-600">{selectedReportForCert.actualPressureDropBar} bar</span></div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1 mt-1"><span>Official Witness:</span><span className="font-bold">{selectedReportForCert.witnessOfficer || selectedReportForCert.witnessOfficialName || selectedReportForCert.kwaWitnessOfficer}</span></div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedReportForCert(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Test Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Record New Quality / Hydro Test
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Chainage Section / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Ch 12+400 to 13+100"
                  value={formData.chainageSection}
                  onChange={(e) => setFormData({ ...formData, chainageSection: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Test Pressure (Bar)</label>
                  <input
                    type="number"
                    value={formData.testPressureBar}
                    onChange={(e) => setFormData({ ...formData, testPressureBar: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Holding Time (Hours)</label>
                  <input
                    type="number"
                    value={formData.holdingDurationHours}
                    onChange={(e) => setFormData({ ...formData, holdingDurationHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Official Witness Officer</label>
                <input
                  type="text"
                  value={formData.witnessOfficer}
                  onChange={(e) => setFormData({ ...formData, witnessOfficer: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow"
                >
                  Save Test Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
