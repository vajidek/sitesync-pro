import React, { useEffect, useState } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { 
  LayoutDashboard, Plus, RefreshCw, Star, Copy, Trash2, 
  Settings, Layers, BarChart3, TrendingUp, PieChart, Table, 
  MapPin, Clock, ShieldCheck, CheckCircle2, AlertCircle, 
  Sliders, Calendar, CheckSquare, ArrowUpRight, DollarSign,
  Truck, Package, Users, Activity, FileText
} from 'lucide-react';
import {
  DSSectionHeader,
  DSCard,
  DSButton,
  DSAlert,
  DSModal,
  DSField
} from '../ui/design-system';

export const DashboardEngineView: React.FC = () => {
  const [dashboardsList, setDashboardsList] = useState<any[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<any | null>(null);
  const [widgetDataMap, setWidgetDataMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState('ALL');
  const [autoRefreshSec, setAutoRefreshSec] = useState<number>(0);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Global Filters
  const [globalFilters, setGlobalFilters] = useState({
    companyId: 'ALL',
    branchId: 'ALL',
    projectId: 'ALL',
    dateRange: 'Q3-2026',
  });

  // Modals
  const [showAddWidgetModal, setShowAddWidgetModal] = useState(false);
  const [newWidget, setNewWidget] = useState({
    title: 'New Metric Widget',
    widgetType: 'KPI_CARD',
    dataSource: 'PROJECTS',
    reportId: '',
    chartType: 'BAR',
    refreshIntervalSec: 30,
  });

  const [showNewDashboardModal, setShowNewDashboardModal] = useState(false);
  const [newDashMeta, setNewDashMeta] = useState({
    code: '',
    title: '',
    description: '',
    dashboardType: 'EXECUTIVE',
  });

  const [reportsList, setReportsList] = useState<any[]>([]);

  const fetchDashboards = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const url = `/api/dashboards?type=${selectedType}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const json = await safeJson(res);
      if (json?.success && Array.isArray(json.data)) {
        setDashboardsList(json.data);
        if (json.data.length > 0) {
          loadDashboardDetails(json.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch dashboards:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportsMaster = async () => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/reports', { headers: { Authorization: `Bearer ${token}` } });
      const json = await safeJson(res);
      if (json?.success && Array.isArray(json.data)) {
        setReportsList(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch reports list:', err);
    }
  };

  const loadDashboardDetails = async (id: string) => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/dashboards/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await safeJson(res);
      if (json?.success && json.data) {
        setSelectedDashboard(json.data);
        // Load widget data for each widget
        if (json.data.widgets && json.data.widgets.length > 0) {
          for (const w of json.data.widgets) {
            fetchWidgetData(w.id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard details:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchWidgetData = async (widgetId: string) => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/dashboards/widgets/${widgetId}/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(globalFilters),
      });
      const json = await safeJson(res);
      if (json?.success && json.data) {
        setWidgetDataMap((prev) => ({ ...prev, [widgetId]: json.data }));
      }
    } catch (err) {
      console.error('Widget data fetch failed:', err);
    }
  };

  useEffect(() => {
    fetchDashboards();
    fetchReportsMaster();
  }, [selectedType]);

  // Auto Refresh Interval
  useEffect(() => {
    if (autoRefreshSec <= 0 || !selectedDashboard) return;
    const interval = setInterval(() => {
      if (selectedDashboard.widgets) {
        selectedDashboard.widgets.forEach((w: any) => fetchWidgetData(w.id));
      }
    }, autoRefreshSec * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshSec, selectedDashboard]);

  const handleCreateDashboard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/dashboards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newDashMeta),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowNewDashboardModal(false);
        setActionMessage({ type: 'success', text: 'Custom Enterprise Dashboard created' });
        fetchDashboards();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to create dashboard' });
    }
  };

  const handleCloneDashboard = async () => {
    if (!selectedDashboard) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/dashboards/${selectedDashboard.id}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: `${selectedDashboard.title} (Personal Clone)` }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({ type: 'success', text: 'Dashboard cloned into custom view' });
        fetchDashboards();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Clone failed' });
    }
  };

  const handleToggleFavorite = async () => {
    if (!selectedDashboard) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/dashboards/${selectedDashboard.id}/favorite`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setSelectedDashboard({ ...selectedDashboard, isFavorite: json.data.isFavorite });
        setActionMessage({ type: 'success', text: json.data.isFavorite ? 'Added to favorites' : 'Removed from favorites' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Favorite toggle failed' });
    }
  };

  const handleAddWidget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDashboard) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const payload = {
        ...newWidget,
        dashboardId: selectedDashboard.id,
        position: { x: 0, y: 0, w: 6, h: 4 },
      };
      const res = await fetch('/api/dashboards/widgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowAddWidgetModal(false);
        setActionMessage({ type: 'success', text: 'Widget registered on dashboard' });
        loadDashboardDetails(selectedDashboard.id);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to add widget' });
    }
  };

  const handleDeleteWidget = async (widgetId: string) => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/dashboards/widgets/${widgetId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({ type: 'success', text: 'Widget removed from dashboard' });
        loadDashboardDetails(selectedDashboard.id);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Widget removal failed' });
    }
  };

  return (
    <div className="space-y-6 text-xs">
      
      <DSSectionHeader
        title="Enterprise Dashboard Engine"
        subtitle="Zero-code configurable dashboards, consuming Report Engine outputs with ABAC row security and auto-refresh intervals."
        action={
          <div className="flex items-center space-x-2">
            <DSButton
              variant="outline"
              size="sm"
              leftIcon={<Copy className="w-3.5 h-3.5" />}
              onClick={() => handleCloneDashboard()}
            >
              Clone
            </DSButton>

            <DSButton
              variant={selectedDashboard?.isFavorite ? 'secondary' : 'outline'}
              size="sm"
              leftIcon={<Star className={`w-4 h-4 ${selectedDashboard?.isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />}
              onClick={() => handleToggleFavorite()}
            >
              Favorite
            </DSButton>

            <DSButton
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setNewWidget({
                  title: 'Custom ERP Analytics Widget',
                  widgetType: 'KPI_CARD',
                  dataSource: 'PROJECTS',
                  reportId: reportsList[0]?.id || '',
                  chartType: 'BAR',
                  refreshIntervalSec: 30,
                });
                setShowAddWidgetModal(true);
              }}
            >
              Add Widget
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

      {/* Global Filters & Auto-Refresh Controls Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
        
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Company Scope</label>
          <select
            value={globalFilters.companyId}
            onChange={(e) => setGlobalFilters({ ...globalFilters, companyId: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-xs"
          >
            <option value="ALL">All Group Companies</option>
            <option value="CMP-001">SiteSync Contracting Ltd</option>
            <option value="CMP-002">Apex Infrastructure LLC</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Project Filter</label>
          <select
            value={globalFilters.projectId}
            onChange={(e) => setGlobalFilters({ ...globalFilters, projectId: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-xs"
          >
            <option value="ALL">All Active Projects</option>
            <option value="PRJ-WTP">Peruvannamuzhi WTP Pipe Network</option>
            <option value="PRJ-HARBOR">Harbor Commercial Tower</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reporting Period</label>
          <select
            value={globalFilters.dateRange}
            onChange={(e) => setGlobalFilters({ ...globalFilters, dateRange: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-xs"
          >
            <option value="Q3-2026">Q3 2026 (Current)</option>
            <option value="YTD-2026">2026 Year-to-Date</option>
            <option value="CUSTOM">Custom Date Window</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Auto Refresh Rate</label>
          <select
            value={autoRefreshSec}
            onChange={(e) => setAutoRefreshSec(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-xs text-indigo-600 font-bold"
          >
            <option value={0}>Manual Refresh</option>
            <option value={15}>Every 15 Seconds</option>
            <option value={30}>Every 30 Seconds</option>
            <option value={60}>Every 60 Seconds</option>
          </select>
        </div>

        <div className="flex items-end h-full pt-4">
          <button
            onClick={() => {
              if (selectedDashboard?.widgets) {
                selectedDashboard.widgets.forEach((w: any) => fetchWidgetData(w.id));
              }
            }}
            className="w-full py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded-lg flex items-center justify-center space-x-1.5 text-slate-700 dark:text-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Apply & Refresh Data</span>
          </button>
        </div>

      </div>

      {/* Main Grid: Dashboards Directory (Left) + Live Canvas Widgets (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Dashboard Directory */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
              Enterprise Dashboards ({dashboardsList.length})
            </span>
            <button
              onClick={() => {
                setNewDashMeta({
                  code: `DASH_${Date.now()}`,
                  title: 'Custom ERP Dashboard',
                  description: 'Configurable widget canvas',
                  dashboardType: 'CUSTOM',
                });
                setShowNewDashboardModal(true);
              }}
              className="p-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-lg"
              title="Create Dashboard"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {dashboardsList.map((dash) => {
              const isSelected = selectedDashboard?.id === dash.id;
              return (
                <div
                  key={dash.id}
                  onClick={() => loadDashboardDetails(dash.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800 shadow-sm'
                      : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{dash.title}</span>
                    {dash.isFavorite && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{dash.description}</p>
                  <div className="mt-2 flex items-center space-x-1.5 text-[9px] font-mono">
                    <span className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">{dash.dashboardType}</span>
                    {dash.isSystem && <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded">SYSTEM</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 3 Columns: Active Dashboard Canvas */}
        <div className="lg:col-span-3 space-y-4">
          
          {selectedDashboard ? (
            <div className="space-y-4">
              
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded text-[10px]">
                      {selectedDashboard.code}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{selectedDashboard.title}</h3>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">{selectedDashboard.description}</p>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-400 font-mono">Widgets: {selectedDashboard.widgets?.length || 0}</span>
                  <span className="text-emerald-600 font-bold flex items-center space-x-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>ABAC Row-Filtered</span>
                  </span>
                </div>
              </div>

              {/* Widget Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedDashboard.widgets?.map((widget: any) => {
                  const wData = widgetDataMap[widget.id];
                  return (
                    <div
                      key={widget.id}
                      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3 flex flex-col justify-between transition hover:shadow-md ${
                        widget.positionJson?.w >= 6 ? 'md:col-span-2 lg:col-span-3' : ''
                      }`}
                    >
                      {/* Widget Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <div className="flex items-center space-x-2">
                          <span className="p-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-lg">
                            {widget.widgetType === 'KPI_CARD' && <DollarSign className="w-3.5 h-3.5" />}
                            {widget.widgetType === 'CHART' && <BarChart3 className="w-3.5 h-3.5" />}
                            {widget.widgetType === 'WORKFLOW_QUEUE' && <Clock className="w-3.5 h-3.5" />}
                            {widget.widgetType !== 'KPI_CARD' && widget.widgetType !== 'CHART' && widget.widgetType !== 'WORKFLOW_QUEUE' && <Activity className="w-3.5 h-3.5" />}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white text-xs">{widget.title}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => fetchWidgetData(widget.id)}
                            className="p-1 text-slate-400 hover:text-indigo-600"
                            title="Refresh Widget"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteWidget(widget.id)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                            title="Delete Widget"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Widget Content Body */}
                      <div className="py-2">
                        {widget.widgetType === 'KPI_CARD' && (
                          <div className="space-y-1">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                              {wData?.data?.[0]?.contractValue ? `$${Number(wData.data[0].contractValue).toLocaleString()}` : '$5,000,000'}
                            </span>
                            <div className="flex items-center space-x-1.5 text-[10px] text-emerald-600 font-bold">
                              <TrendingUp className="w-3 h-3" />
                              <span>{widget.configJson?.changeLabel || '+14.2% YTD'}</span>
                            </div>
                          </div>
                        )}

                        {widget.widgetType === 'CHART' && (
                          <div className="space-y-2">
                            <div className="h-28 flex items-end justify-between gap-2 pt-4 px-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                              {(wData?.data || [
                                { projectName: 'Phase 1', progressPercentage: 65 },
                                { projectName: 'Phase 2', progressPercentage: 88 },
                                { projectName: 'Phase 3', progressPercentage: 42 },
                              ]).map((item: any, idx: number) => (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                                  <div
                                    style={{ height: `${item.progressPercentage || item.metric || 50}%` }}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-t transition-all"
                                  />
                                  <span className="text-[9px] text-slate-400 font-mono truncate max-w-[60px]">{item.projectName || item.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {widget.widgetType === 'WORKFLOW_QUEUE' && (
                          <div className="space-y-1.5 text-[11px]">
                            {(wData?.data || [
                              { code: 'WF_PO_APPROVAL', name: 'High Value PO Approval', category: 'FINANCE' },
                              { code: 'WF_SITE_INSPECTION', name: 'Concrete Pour Permit', category: 'QAQC' },
                            ]).map((wf: any, idx: number) => (
                              <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg flex items-center justify-between border border-slate-100 dark:border-slate-800">
                                <div>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{wf.name || wf.title}</span>
                                  <span className="text-[9px] text-slate-400 font-mono">{wf.code || 'WF-NODE-01'}</span>
                                </div>
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded text-[9px] font-bold">
                                  PENDING
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {widget.widgetType !== 'KPI_CARD' && widget.widgetType !== 'CHART' && widget.widgetType !== 'WORKFLOW_QUEUE' && (
                          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                            <span className="font-mono text-[10px] block font-bold text-indigo-600">Report Output Stream ({widget.dataSource})</span>
                            <span className="text-xs">{wData?.data?.length || 0} Records loaded via Report Engine</span>
                          </div>
                        )}
                      </div>

                      {/* Widget Footer */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>DS: {widget.dataSource}</span>
                        <span>Auto Refresh: {widget.refreshIntervalSec ? `${widget.refreshIntervalSec}s` : 'Manual'}</span>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              Select a dashboard definition from the left directory to render live canvas widgets.
            </div>
          )}

        </div>

      </div>

      {/* Modal: Add Widget */}
      {showAddWidgetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Add Widget to Dashboard Canvas</span>
              </h3>
              <button onClick={() => setShowAddWidgetModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleAddWidget} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Widget Title</label>
                <input
                  type="text"
                  required
                  value={newWidget.title}
                  onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Widget Type</label>
                  <select
                    value={newWidget.widgetType}
                    onChange={(e) => setNewWidget({ ...newWidget, widgetType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="KPI_CARD">KPI Card</option>
                    <option value="CHART">Visual Chart</option>
                    <option value="WORKFLOW_QUEUE">Workflow Queue</option>
                    <option value="TABLE">Data Table</option>
                    <option value="MAP">GPS Map View</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Report Engine Output</label>
                  <select
                    value={newWidget.reportId}
                    onChange={(e) => setNewWidget({ ...newWidget, reportId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="">Direct Live ERP Feed</option>
                    {reportsList.map((r) => (
                      <option key={r.id} value={r.id}>{r.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddWidgetModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Save Widget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Dashboard */}
      {showNewDashboardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                <span>Create Enterprise Dashboard Definition</span>
              </h3>
              <button onClick={() => setShowNewDashboardModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleCreateDashboard} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Dashboard Code</label>
                <input
                  type="text"
                  required
                  value={newDashMeta.code}
                  onChange={(e) => setNewDashMeta({ ...newDashMeta, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Dashboard Title</label>
                <input
                  type="text"
                  required
                  value={newDashMeta.title}
                  onChange={(e) => setNewDashMeta({ ...newDashMeta, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Dashboard Type</label>
                <select
                  value={newDashMeta.dashboardType}
                  onChange={(e) => setNewDashMeta({ ...newDashMeta, dashboardType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  <option value="COMPANY">Company Dashboard</option>
                  <option value="BRANCH">Branch Dashboard</option>
                  <option value="DEPARTMENT">Department Dashboard</option>
                  <option value="PROJECT">Project Dashboard</option>
                  <option value="EXECUTIVE">Executive Dashboard</option>
                  <option value="PERSONAL">Personal Dashboard</option>
                  <option value="CUSTOM">Custom Dashboard</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewDashboardModal(false)}
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

    </div>
  );
};
