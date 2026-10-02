import React, { useEffect, useState } from 'react';
import { safeJson } from '../../lib/safeFetch';
import {
  Network, ShieldCheck, Mail, MessageSquare, Send, Bell, MapPin, 
  Radio, HardDrive, Cpu, FileSpreadsheet, FileText, CheckCircle2, 
  AlertCircle, RefreshCw, Play, RotateCcw, Sliders, Activity, Settings, 
  Clock, Database, Plus, Search, Lock, Key, ChevronRight, Layers, ArrowUpRight
} from 'lucide-react';
import {
  DSSectionHeader,
  DSCard,
  DSButton,
  DSTabs,
  DSAlert,
  DSModal,
  DSField
} from '../ui/design-system';

export const IntegrationHubView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'connectors' | 'health' | 'sync' | 'logs'>('connectors');
  const [connectorsList, setConnectorsList] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<any>(null);
  const [syncJobsList, setSyncJobsList] = useState<any[]>([]);
  const [logsList, setLogsList] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals & Active Edit States
  const [selectedConnector, setSelectedConnector] = useState<any | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configItems, setConfigItems] = useState<{ key: string; value: string; isSecret: boolean }[]>([]);

  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    jobCode: '',
    connectorId: '',
    jobType: 'SCHEDULED_IMPORT',
    scheduleCron: '0 */1 * * *',
    conflictResolution: 'OVERWRITE_TARGET',
  });

  const fetchConnectors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/integrations/connectors?category=${selectedCategory}&search=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success && Array.isArray(json.data)) {
        setConnectorsList(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch connectors:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthDashboard = async () => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/integrations/health', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setHealthData(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch health dashboard:', err);
    }
  };

  const fetchSyncJobs = async () => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/integrations/jobs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success && Array.isArray(json.data)) {
        setSyncJobsList(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch sync jobs:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/integrations/logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success && Array.isArray(json.data)) {
        setLogsList(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch integration logs:', err);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'connectors') fetchConnectors();
    if (activeSubTab === 'health') fetchHealthDashboard();
    if (activeSubTab === 'sync') fetchSyncJobs();
    if (activeSubTab === 'logs') fetchLogs();
  }, [activeSubTab, selectedCategory, searchQuery]);

  const handleToggleConnector = async (id: string, currentState: boolean) => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/integrations/connectors/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isEnabled: !currentState }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({ type: 'success', text: `Connector ${!currentState ? 'enabled' : 'disabled'} successfully` });
        fetchConnectors();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to toggle connector status' });
    }
  };

  const handleTestConnection = async (id: string) => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/integrations/connectors/${id}/test`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({
          type: 'success',
          text: `Ping ${json.data?.status} (${json.data?.latencyMs}ms): ${json.data?.message}`,
        });
        fetchConnectors();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Connection test failed' });
    }
  };

  const handleOpenConfigModal = (connector: any) => {
    setSelectedConnector(connector);
    if (connector.configs && connector.configs.length > 0) {
      setConfigItems(connector.configs.map((c: any) => ({ key: c.configKey, value: c.configValue || '', isSecret: c.isSecret })));
    } else {
      setConfigItems([
        { key: 'API_ENDPOINT', value: 'https://api.external-provider.com/v1', isSecret: false },
        { key: 'AUTH_TOKEN', value: '****************', isSecret: true },
      ]);
    }
    setConfigModalOpen(true);
  };

  const handleSaveConfigs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConnector) return;
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/integrations/connectors/${selectedConnector.id}/configs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          configs: configItems.map((ci) => ({ configKey: ci.key, configValue: ci.value, isSecret: ci.isSecret })),
        }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setConfigModalOpen(false);
        setActionMessage({ type: 'success', text: 'Connector configurations saved successfully' });
        fetchConnectors();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to save configurations' });
    }
  };

  const handleCreateSyncJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/integrations/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newJob),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setJobModalOpen(false);
        setActionMessage({ type: 'success', text: 'Sync job scheduled successfully' });
        fetchSyncJobs();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to create sync job' });
    }
  };

  const handleTriggerSync = async (jobId: string) => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/integrations/jobs/${jobId}/trigger`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({ type: 'success', text: `Sync completed: Processed ${json.data?.recordsProcessed} records.` });
        fetchSyncJobs();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Manual sync trigger failed' });
    }
  };

  const handleRetryLog = async (logId: string) => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/integrations/logs/${logId}/retry`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setActionMessage({ type: 'success', text: 'Integration action retried through Hub' });
        fetchLogs();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Retry failed' });
    }
  };

  return (
    <div className="space-y-6 text-xs">
      
      <DSSectionHeader
        title="Centralized Enterprise Integration Hub"
        subtitle="Single gateway architecture connecting all external providers (Auth, M365, Gmail, Push, SMS, WhatsApp, Webhooks, Maps, GPS, ESSL, IoT, SCADA, Cloud, Govt APIs)."
        action={
          activeSubTab === 'sync' ? (
            <DSButton
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setNewJob({
                  jobCode: `JOB_${Date.now().toString().slice(-4)}`,
                  connectorId: connectorsList[0]?.id || 'conn-essl',
                  jobType: 'SCHEDULED_IMPORT',
                  scheduleCron: '0 */1 * * *',
                  conflictResolution: 'OVERWRITE_TARGET',
                });
                setJobModalOpen(true);
              }}
            >
              Schedule Sync Job
            </DSButton>
          ) : undefined
        }
      />

      {/* Action Notification */}
      {actionMessage && (
        <div className="p-3.5 rounded-xl text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('connectors')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 ${
            activeSubTab === 'connectors'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Connector Manager (18+)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('health')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 ${
            activeSubTab === 'health'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Health Dashboard</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sync')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 ${
            activeSubTab === 'sync'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sync & Import/Export Monitor</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 ${
            activeSubTab === 'logs'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Log Viewer & Retry Queue</span>
        </button>
      </div>

      {/* Sub-Tab 1: Connector Manager */}
      {activeSubTab === 'connectors' && (
        <div className="space-y-4">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <span className="font-bold text-slate-700 dark:text-slate-300">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
              >
                <option value="ALL">All Categories</option>
                <option value="AUTH">Authentication & SSO</option>
                <option value="COMMUNICATION">Communication & Messaging</option>
                <option value="GEOSPATIAL">Geospatial & GPS</option>
                <option value="HARDWARE_IOT">Hardware, Biometrics & IoT</option>
                <option value="STORAGE_FILES">Cloud Storage & Files</option>
                <option value="COMPLIANCE_GOVT">Compliance & Govt APIs</option>
                <option value="DATA_SYNC">Data Sync & REST/Webhooks</option>
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search connector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectorsList.map((conn) => (
              <div
                key={conn.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded text-[10px]">
                      {conn.code}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      conn.isEnabled ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {conn.isEnabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-xs mt-2">{conn.name}</h3>

                  <div className="mt-2 flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                    <span>Category: {conn.category}</span>
                    <span>•</span>
                    <span>v{conn.version}</span>
                  </div>

                  <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Auth Type:</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{conn.authType}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleToggleConnector(conn.id, conn.isEnabled)}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-[10px]"
                    >
                      {conn.isEnabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleOpenConfigModal(conn)}
                      className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-bold rounded-lg text-[10px] flex items-center space-x-1"
                    >
                      <Settings className="w-3 h-3" />
                      <span>Config</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleTestConnection(conn.id)}
                    className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-bold rounded-lg text-[10px] flex items-center space-x-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>Test Ping</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Health Dashboard */}
      {activeSubTab === 'health' && healthData && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-semibold text-[10px] uppercase block">Healthy Connectors</span>
                <span className="text-xl font-extrabold text-emerald-600 mt-1 block">{healthData.healthSummary?.healthy || 0}</span>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500/30" />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-semibold text-[10px] uppercase block">Degraded / Latency Warning</span>
                <span className="text-xl font-extrabold text-amber-500 mt-1 block">{healthData.healthSummary?.degraded || 0}</span>
              </div>
              <AlertCircle className="w-8 h-8 text-amber-500/30" />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-semibold text-[10px] uppercase block">Offline / Disabled</span>
                <span className="text-xl font-extrabold text-rose-600 mt-1 block">{healthData.healthSummary?.offline || 0}</span>
              </div>
              <AlertCircle className="w-8 h-8 text-rose-500/30" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
              Live Latency & Connector Status Ping List
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                    <th className="py-2 px-3">Connector ID</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Measured Latency</th>
                    <th className="py-2 px-3">Last Pinged</th>
                    <th className="py-2 px-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {healthData.connectorsHealth?.map((h: any) => (
                    <tr key={h.id}>
                      <td className="py-2.5 px-3 font-mono text-indigo-600 font-bold">{h.connectorId}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          h.status === 'HEALTHY'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {h.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">{h.latencyMs} ms</td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">{h.lastPingAt}</td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">{JSON.stringify(h.detailsJson)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Sync & Import/Export Monitor */}
      {activeSubTab === 'sync' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
              Scheduled Sync Jobs & Conflict Resolution
            </span>
            <button onClick={() => fetchSyncJobs()} className="p-1 text-slate-400 hover:text-slate-600">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                  <th className="py-2 px-3">Job Code</th>
                  <th className="py-2 px-3">Connector</th>
                  <th className="py-2 px-3">Job Type</th>
                  <th className="py-2 px-3">Cron / Schedule</th>
                  <th className="py-2 px-3">Processed</th>
                  <th className="py-2 px-3">Conflict Resolution</th>
                  <th className="py-2 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {syncJobsList.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-mono text-indigo-600 font-bold">{job.jobCode}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{job.connectorId}</td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">{job.jobType}</td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">{job.scheduleCron}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-600 font-bold">{job.recordsProcessed} recs</td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-600">{job.conflictResolution}</td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => handleTriggerSync(job.id)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold text-[10px] flex items-center space-x-1"
                      >
                        <Play className="w-3 h-3" />
                        <span>Manual Sync</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Log Viewer & Retry Queue */}
      {activeSubTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
              Integration Traffic Audit & Retry Queue
            </span>
            <button onClick={() => fetchLogs()} className="p-1 text-slate-400 hover:text-slate-600">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                  <th className="py-2 px-3">Log ID</th>
                  <th className="py-2 px-3">Connector</th>
                  <th className="py-2 px-3">Direction</th>
                  <th className="py-2 px-3">HTTP Status</th>
                  <th className="py-2 px-3">Latency</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Payload / Result</th>
                  <th className="py-2 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {logsList.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-mono text-[10px] text-indigo-600 font-bold">{log.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{log.connectorId}</td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">{log.direction}</td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-700 dark:text-slate-300">{log.httpStatus || 200}</td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">{log.latencyMs} ms</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500 max-w-xs truncate">
                      {JSON.stringify(log.responsePayloadJson || log.requestPayloadJson)}
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => handleRetryLog(log.id)}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded font-bold text-[10px] flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Edit Connector Configuration */}
      {configModalOpen && selectedConnector && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <Settings className="w-4 h-4 text-indigo-600" />
                <span>Configure {selectedConnector.name}</span>
              </h3>
              <button onClick={() => setConfigModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleSaveConfigs} className="space-y-3">
              {configItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={item.key}
                      onChange={(e) => {
                        const next = [...configItems];
                        next[idx].key = e.target.value;
                        setConfigItems(next);
                      }}
                      className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono font-bold"
                    />
                    <label className="flex items-center space-x-1 text-[10px] text-slate-500">
                      <input
                        type="checkbox"
                        checked={item.isSecret}
                        onChange={(e) => {
                          const next = [...configItems];
                          next[idx].isSecret = e.target.checked;
                          setConfigItems(next);
                        }}
                      />
                      <span>Secret</span>
                    </label>
                  </div>

                  <input
                    type={item.isSecret ? 'password' : 'text'}
                    value={item.value}
                    onChange={(e) => {
                      const next = [...configItems];
                      next[idx].value = e.target.value;
                      setConfigItems(next);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() => setConfigItems([...configItems, { key: 'NEW_KEY', value: '', isSecret: false }])}
                className="w-full py-1.5 border border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 font-bold rounded-xl text-xs hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
              >
                + Add Configuration Parameter
              </button>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setConfigModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Save Credentials & Configs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Schedule Sync Job */}
      {jobModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-indigo-600" />
                <span>Schedule Data Sync Job</span>
              </h3>
              <button onClick={() => setJobModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleCreateSyncJob} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Code</label>
                <input
                  type="text"
                  required
                  value={newJob.jobCode}
                  onChange={(e) => setNewJob({ ...newJob, jobCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Connector</label>
                <select
                  value={newJob.connectorId}
                  onChange={(e) => setNewJob({ ...newJob, connectorId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  {connectorsList.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Type</label>
                  <select
                    value={newJob.jobType}
                    onChange={(e) => setNewJob({ ...newJob, jobType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="SCHEDULED_IMPORT">Scheduled Import</option>
                    <option value="SCHEDULED_EXPORT">Scheduled Export</option>
                    <option value="MANUAL_SYNC">Manual Sync</option>
                    <option value="INCREMENTAL_SYNC">Incremental Sync</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Conflict Resolution</label>
                  <select
                    value={newJob.conflictResolution}
                    onChange={(e) => setNewJob({ ...newJob, conflictResolution: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="OVERWRITE_TARGET">Overwrite Target</option>
                    <option value="KEEP_EXISTING">Keep Existing</option>
                    <option value="MANUAL_REVIEW">Manual Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Cron Expression</label>
                <input
                  type="text"
                  required
                  value={newJob.scheduleCron}
                  onChange={(e) => setNewJob({ ...newJob, scheduleCron: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setJobModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Save Sync Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
