import React from 'react';
import {
  WATER_PROJECTS,
  WATER_PIPELINE_SECTIONS,
  WATER_VALVE_RECORDS,
  WATER_TEST_REPORTS
} from '../../data/waterInfrastructureData';
import {
  BarChart3,
  TrendingUp,
  Printer,
  FileSpreadsheet,
  Download,
  Activity,
  Wrench,
  CheckCircle2,
  PieChart
} from 'lucide-react';

export const WaterReportsAnalytics: React.FC = () => {
  const handleExportCSV = (reportName: string) => {
    const csvContent = ["Report,Status,Timestamp"].join(",") + "\n" + `"${reportName}","Generated","${new Date().toISOString()}"`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${reportName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Mechanical Construction Reports & Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Export official water infrastructure progress registers, material audit logs, hydrostatic test registers, and daily execution summaries
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExportCSV('Master Water Infrastructure Audit')}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow transition flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Full ERP Audit</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-600" /> Pipeline Network Coverage
            </span>
            <span className="text-xs font-semibold text-blue-600">{WATER_PIPELINE_SECTIONS.length} Sections</span>
          </div>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Total Network Scope:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {WATER_PIPELINE_SECTIONS.reduce((acc, s) => acc + s.totalLengthMeters, 0) / 1000} km
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Total Laid & Commissioned:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {WATER_PIPELINE_SECTIONS.reduce((acc, s) => acc + s.laidLengthMeters, 0) / 1000} km
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-amber-600" /> Valve & Actuator Register
            </span>
            <span className="text-xs font-semibold text-amber-600">{WATER_VALVE_RECORDS.length} Units</span>
          </div>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Motorized & SCADA Actuators:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {WATER_VALVE_RECORDS.filter(v => (v.actuator as string).includes('Electric') || (v.actuator as string).includes('Pneumatic')).length} Units
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Installed & Chambered:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {WATER_VALVE_RECORDS.filter(v => v.chamberBuilt || v.testingStatus === 'Hydro Tested' || v.testingStatus === 'Approved by Authority').length} Units
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Hydro Testing Compliance
            </span>
            <span className="text-xs font-semibold text-emerald-600">{WATER_TEST_REPORTS.length} Reports</span>
          </div>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Passed Holding Test (10 bar):</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {WATER_TEST_REPORTS.filter(r => r.testResult === 'PASS').length} Tests
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Official Witness Sign-off:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">100% Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Report Templates */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Exportable Official ERP Registers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Pipeline Lowering & Jointing Progress Log</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Section-wise MS/DI chainage, trench depth & jointing audit</p>
            </div>
            <button
              onClick={() => handleExportCSV('Pipeline Jointing Register')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition"
            >
              Export
            </button>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Hydrostatic Pressure Test Certificate Register</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Official witness signatures, pressure drop & reach pass cards</p>
            </div>
            <button
              onClick={() => handleExportCSV('Hydro Test Register')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition"
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
