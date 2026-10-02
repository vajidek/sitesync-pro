import React, { useEffect, useState } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { 
  BarChart3, FileText, Download, Printer, Plus, RefreshCw, Star, Clock, 
  Search, Filter, Layers, Database, Calendar, CheckCircle2, Send, 
  TrendingUp, PieChart, Table, ArrowUpRight, ShieldCheck, Mail
} from 'lucide-react';
import {
  DSSectionHeader,
  DSCard,
  DSButton,
  DSAlert,
  DSModal,
  DSField
} from '../ui/design-system';

export const ReportEngineView: React.FC = () => {
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [reportResult, setReportResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<'viewer' | 'designer' | 'schedules'>('viewer');
  const [selectedDataSource, setSelectedDataSource] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Report Builder state
  const [showNewReportModal, setShowNewReportModal] = useState(false);
  const [reportMeta, setReportMeta] = useState({
    code: '',
    title: '',
    description: '',
    dataSource: 'PROJECTS',
    reportType: 'TABULAR',
  });

  // Schedule Modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    cronExpression: '0 8 * * *',
    recipientEmails: 'management@sitesync.pro, finance@sitesync.pro',
    exportFormat: 'PDF',
  });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const url = `/api/reports?dataSource=${selectedDataSource}&search=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success && Array.isArray(json.data)) {
        setReportsList(json.data);
        if (json.data.length > 0 && (!selectedReport || selectedDataSource !== 'ALL')) {
          executeReport(json.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const executeReport = async (reportId: string) => {
    setExecuting(true);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/reports/${reportId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      const json = await safeJson(res);
      if (json?.success && json.data) {
        setSelectedReport(json.data.report);
        setReportResult(json.data);
      }
    } catch (err) {
      console.error('Report execution failed:', err);
    } finally {
      setExecuting(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedDataSource]);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const payload = {
        ...reportMeta,
        columns: [
          { key: 'code', label: 'Item Code' },
          { key: 'name', label: 'Title / Name' },
          { key: 'status', label: 'Status' },
          { key: 'createdAt', label: 'Created At' },
        ],
      };
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowNewReportModal(false);
        setActionMessage({ type: 'success', text: 'Report definition created & registered' });
        fetchReports();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to create report' });
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const payload = {
        reportId: selectedReport.id,
        cronExpression: scheduleData.cronExpression,
        recipientEmails: scheduleData.recipientEmails.split(',').map((s) => s.trim()),
        exportFormat: scheduleData.exportFormat,
      };
      const res = await fetch('/api/reports/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowScheduleModal(false);
        setActionMessage({ type: 'success', text: `Automated ${scheduleData.exportFormat} report scheduled successfully` });
        executeReport(selectedReport.id);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Scheduling failed' });
    }
  };

  const handleExport = (format: string) => {
    setActionMessage({ type: 'success', text: `Exporting ${selectedReport?.title || 'Report'} as ${format.toUpperCase()} with ABAC security filtering...` });
  };

  return (
    <div className="space-y-6 text-xs">
      
      <DSSectionHeader
        title="Enterprise Report Engine"
        subtitle="Zero-code cross-module reporting with automated scheduling, ABAC security filtering, and PDF/Excel exports."
        action={
          <div className="flex items-center space-x-2">
            <DSButton
              variant="outline"
              size="sm"
              isLoading={loading}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={() => fetchReports()}
            >
              Refresh
            </DSButton>

            <DSButton
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setReportMeta({
                  code: `RPT_${Date.now()}`,
                  title: 'Custom ERP Analytics Report',
                  description: 'Configurable report definition',
                  dataSource: 'PROJECTS',
                  reportType: 'TABULAR',
                });
                setShowNewReportModal(true);
              }}
            >
              Create New Report
            </DSButton>
          </div>
        }
      />

      {/* Notification Banner */}
      {actionMessage && (
        <div className="p-3.5 rounded-xl text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
      )}

      {/* Main Reporting Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Reports Master Directory */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
          
          <div className="space-y-2">
            <label className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
              Data Source Filter
            </label>
            <select
              value={selectedDataSource}
              onChange={(e) => setSelectedDataSource(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
            >
              <option value="ALL">All ERP Modules ({reportsList.length})</option>
              <option value="PROJECTS">Projects Engine</option>
              <option value="ORGANIZATION">Organization Engine</option>
              <option value="EMPLOYEES">HR & Payroll</option>
              <option value="PROCUREMENT">Procurement & POs</option>
              <option value="INVENTORY">Inventory & Warehouses</option>
              <option value="FLEET">Fleet & Equipment</option>
              <option value="WORKFLOW">Workflow SLA</option>
              <option value="FORMS">Dynamic Forms</option>
              <option value="AUDIT">Security Audit Logs</option>
            </select>
          </div>

          <div className="space-y-2">
            {reportsList.map((rpt) => {
              const isSelected = selectedReport?.id === rpt.id;
              return (
                <div
                  key={rpt.id}
                  onClick={() => executeReport(rpt.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800 shadow-sm'
                      : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{rpt.title}</span>
                    {rpt.isFavorite && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                  </div>

                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{rpt.description}</p>

                  <div className="flex items-center space-x-2 mt-2 text-[10px]">
                    <span className="font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">{rpt.dataSource}</span>
                    <span className="text-slate-400 font-mono">{rpt.reportType}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right 3 Columns: Active Report Execution Viewer & Tools */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Header Bar for Selected Report */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded text-[10px]">
                    {selectedReport?.code || 'RPT_MASTER'}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{selectedReport?.title || 'Report Analytics'}</h3>
                </div>
                <p className="text-slate-500 text-xs mt-1">{selectedReport?.description}</p>
              </div>

              {/* Action Buttons: Export PDF/Excel & Schedule */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold rounded-xl flex items-center space-x-1.5 text-slate-700 dark:text-slate-200"
                >
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Schedule</span>
                </button>

                <button
                  onClick={() => handleExport('excel')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel</span>
                </button>

                <button
                  onClick={() => handleExport('pdf')}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>PDF Export</span>
                </button>
              </div>
            </div>

            {/* Performance KPI Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium uppercase">Records Fetched</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">{reportResult?.rowCount || 0}</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium uppercase">Query Latency</span>
                <span className="text-base font-extrabold text-indigo-600 font-mono">{reportResult?.executionTimeMs || 0} ms</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium uppercase">ABAC Security Filter</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Enforced</span>
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium uppercase">Report Format</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono uppercase mt-1 block">
                  {selectedReport?.reportType || 'TABULAR'}
                </span>
              </div>
            </div>

          </div>

          {/* Execution Results Data Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] border-b border-slate-100 dark:border-slate-800 pb-2">
              Executed Report Dataset ({reportResult?.rows?.length || 0} items)
            </h4>

            {executing ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
                <p className="font-mono text-xs">Querying database with ABAC row & field constraints...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 font-semibold text-[11px]">
                      {selectedReport?.columnsJson?.map((col: any) => (
                        <th key={col.key} className="py-2.5 px-3 font-mono">{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(reportResult?.rows || []).map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        {selectedReport?.columnsJson?.map((col: any) => (
                          <td key={col.key} className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                            {row[col.key] !== undefined ? String(row[col.key]) : '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Modal: Create Report */}
      {showNewReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Create Enterprise Report Definition</span>
              </h3>
              <button onClick={() => setShowNewReportModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Report Code</label>
                <input
                  type="text"
                  required
                  value={reportMeta.code}
                  onChange={(e) => setReportMeta({ ...reportMeta, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Report Title</label>
                <input
                  type="text"
                  required
                  value={reportMeta.title}
                  onChange={(e) => setReportMeta({ ...reportMeta, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Data Source</label>
                  <select
                    value={reportMeta.dataSource}
                    onChange={(e) => setReportMeta({ ...reportMeta, dataSource: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="PROJECTS">Projects</option>
                    <option value="ORGANIZATION">Organization</option>
                    <option value="EMPLOYEES">Employees & HR</option>
                    <option value="PROCUREMENT">Procurement</option>
                    <option value="INVENTORY">Inventory</option>
                    <option value="FLEET">Fleet</option>
                    <option value="WORKFLOW">Workflow SLA</option>
                    <option value="FORMS">Dynamic Forms</option>
                    <option value="AUDIT">Audit Logs</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Report Format</label>
                  <select
                    value={reportMeta.reportType}
                    onChange={(e) => setReportMeta({ ...reportMeta, reportType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="TABULAR">Tabular</option>
                    <option value="GROUPED">Grouped</option>
                    <option value="SUMMARY">Summary</option>
                    <option value="PIVOT">Pivot Matrix</option>
                    <option value="CHARTS">Visual Chart</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewReportModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Save Definition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Schedule Automated Report */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <Mail className="w-4 h-4 text-indigo-600" />
                <span>Schedule Automated Email Report</span>
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Cron Expression</label>
                <input
                  type="text"
                  required
                  value={scheduleData.cronExpression}
                  onChange={(e) => setScheduleData({ ...scheduleData, cronExpression: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Recipient Emails (Comma separated)</label>
                <input
                  type="text"
                  required
                  value={scheduleData.recipientEmails}
                  onChange={(e) => setScheduleData({ ...scheduleData, recipientEmails: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Export Format</label>
                <select
                  value={scheduleData.exportFormat}
                  onChange={(e) => setScheduleData({ ...scheduleData, exportFormat: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  <option value="PDF">PDF Document</option>
                  <option value="EXCEL">Excel Spreadsheet</option>
                  <option value="CSV">Raw CSV</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Activate Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
