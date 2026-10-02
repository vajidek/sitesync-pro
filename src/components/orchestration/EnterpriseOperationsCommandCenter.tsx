import React, { useState, useEffect } from 'react';
import {
  Activity,
  Gauge,
  Layers,
  ShieldAlert,
  CheckCircle2,
  Server,
  Zap,
  RotateCw,
  Plus,
  Search,
  Sparkles,
  Sliders,
  Send,
  X,
} from 'lucide-react';
import { OperationsCommandCenterView } from './OperationsCommandCenterView';
import { CrossModuleEventTimeline } from './CrossModuleEventTimeline';
import { ProjectHealthPanel } from './ProjectHealthPanel';
import { ActionCenter } from './ActionCenter';
import { EnterpriseAlertsPanel } from './EnterpriseAlertsPanel';
import { IntegrationHealthPanel } from './IntegrationHealthPanel';
import {
  OperationsCommandCenterSummary,
  DomainEventRecord,
  ActionStatus,
  DomainEventType,
  SourceModule,
  EventSeverity,
} from '../../api/orchestration/orchestration.types';
import { NavTab } from '../layout/Sidebar';

export const EnterpriseOperationsCommandCenter: React.FC<{ onNavigateTab?: (tab: NavTab) => void }> = ({
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'timeline' | 'health' | 'actions' | 'alerts' | 'topology'
  >('overview');
  const [summary, setSummary] = useState<OperationsCommandCenterSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // New Event Form State
  const [newEvent, setNewEvent] = useState<{
    eventType: DomainEventType;
    sourceModule: SourceModule;
    entityType: string;
    entityId: string;
    projectId: string;
    severity: EventSeverity;
    payloadText: string;
  }>({
    eventType: 'PO_DELIVERY_DELAYED',
    sourceModule: 'PROCUREMENT',
    entityType: 'PURCHASE_ORDER',
    entityId: 'PO-2026-999',
    projectId: 'PRJ-101',
    severity: 'HIGH',
    payloadText: JSON.stringify({ delayDays: 10, isZeroFloatImpact: true, reason: 'Port congestion' }, null, 2),
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/orchestration/summary');
      const data = await res.json();
      if (data.success) {
        setSummary(data.data);
      } else {
        setError(data.error || 'Failed to load command center data');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error loading command center data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReplayEvent = async (eventId: string) => {
    try {
      const res = await fetch('/api/orchestration/events/replay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });
      await res.json();
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateActionStatus = async (actionId: string, status: ActionStatus, resolutionNotes?: string) => {
    try {
      await fetch(`/api/orchestration/actions/${actionId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolutionNotes }),
      });
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await fetch(`/api/orchestration/alerts/${alertId}/ack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolveAlert = async (alertId: string, resolutionSummary: string) => {
    try {
      await fetch(`/api/orchestration/alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolutionSummary }),
      });
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRecalculateHealth = async (projectId: string) => {
    try {
      await fetch('/api/orchestration/health/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePublishEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(newEvent.payloadText);
      } catch (pErr) {
        parsedPayload = { note: newEvent.payloadText };
      }

      await fetch('/api/orchestration/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: newEvent.eventType,
          sourceModule: newEvent.sourceModule,
          entityType: newEvent.entityType,
          entityId: newEvent.entityId,
          projectId: newEvent.projectId,
          severity: newEvent.severity,
          payload: parsedPayload,
        }),
      });

      setIsEventModalOpen(false);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="enterprise-operations-command-center" className="min-h-screen bg-[#070F1E] text-slate-100 p-4 md:p-6 space-y-5">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                Enterprise ERP Operations Command Center
              </h1>
              <p className="text-xs text-slate-400">
                Phase 75 Orchestration Layer · Cross-Module Event Bus · 11-Dimension Health Engine · Action Center
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEventModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Emit Domain Event</span>
          </button>

          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition border border-slate-700 disabled:opacity-50"
            title="Refresh command center state"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition shrink-0 ${
            activeSubTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Gauge className="w-4 h-4" />
          <span>Operations Command</span>
        </button>

        <button
          onClick={() => setActiveSubTab('timeline')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition shrink-0 ${
            activeSubTab === 'timeline'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Event Bus Timeline</span>
          {summary && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-indigo-300 font-mono">
              {summary.recentDomainEvents.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('health')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition shrink-0 ${
            activeSubTab === 'health'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Project Health Engine</span>
        </button>

        <button
          onClick={() => setActiveSubTab('actions')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition shrink-0 ${
            activeSubTab === 'actions'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Enterprise Action Center</span>
          {summary && summary.overview.openActionItems > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-950 text-sky-300 font-mono font-bold">
              {summary.overview.openActionItems}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('alerts')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition shrink-0 ${
            activeSubTab === 'alerts'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Correlated Incidents</span>
          {summary && summary.overview.activeCorrelatedAlerts > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-300 font-mono font-bold">
              {summary.overview.activeCorrelatedAlerts}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('topology')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition shrink-0 ${
            activeSubTab === 'topology'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Module Topology</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {error ? (
        <div className="bg-rose-950/40 border border-rose-500/40 text-rose-300 p-4 rounded-xl text-sm">
          {error}
        </div>
      ) : !summary ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <Activity className="w-8 h-8 mx-auto text-indigo-400 animate-pulse mb-3" />
          <span>Loading Enterprise Operations Command Center...</span>
        </div>
      ) : (
        <>
          {activeSubTab === 'overview' && (
            <OperationsCommandCenterView
              summary={summary}
              onNavigateTab={onNavigateTab}
              onSelectSubTab={(tab) => setActiveSubTab(tab as any)}
            />
          )}

          {activeSubTab === 'timeline' && (
            <CrossModuleEventTimeline
              events={summary.recentDomainEvents}
              onReplayEvent={handleReplayEvent}
              onRefresh={fetchData}
              isLoading={isLoading}
            />
          )}

          {activeSubTab === 'health' && (
            <ProjectHealthPanel
              scorecards={summary.projectHealthRanking}
              onRecalculate={handleRecalculateHealth}
            />
          )}

          {activeSubTab === 'actions' && (
            <ActionCenter
              actions={summary.urgentActionItems}
              onUpdateStatus={handleUpdateActionStatus}
              onNavigateTab={onNavigateTab}
              isLoading={isLoading}
            />
          )}

          {activeSubTab === 'alerts' && (
            <EnterpriseAlertsPanel
              alerts={summary.criticalCorrelatedAlerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onResolveAlert={handleResolveAlert}
              isLoading={isLoading}
            />
          )}

          {activeSubTab === 'topology' && (
            <IntegrationHealthPanel
              healthList={summary.integrationHealth}
              onRefresh={fetchData}
              isLoading={isLoading}
            />
          )}
        </>
      )}

      {/* Emit Domain Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100">Emit Test Cross-Module Domain Event</h3>
              </div>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublishEventSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Event Type</label>
                  <select
                    value={newEvent.eventType}
                    onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded focus:outline-none"
                  >
                    <option value="PO_DELIVERY_DELAYED">PO_DELIVERY_DELAYED</option>
                    <option value="SCADA_ALARM_CRITICAL">SCADA_ALARM_CRITICAL</option>
                    <option value="NCR_OVERDUE">NCR_OVERDUE</option>
                    <option value="PERMIT_EXPIRED">PERMIT_EXPIRED</option>
                    <option value="BUDGET_THRESHOLD_EXCEEDED">BUDGET_THRESHOLD_EXCEEDED</option>
                    <option value="EMPLOYEE_ABSENCE">EMPLOYEE_ABSENCE</option>
                    <option value="DOCUMENT_REJECTED">DOCUMENT_REJECTED</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Source Module</label>
                  <select
                    value={newEvent.sourceModule}
                    onChange={(e) => setNewEvent({ ...newEvent, sourceModule: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded focus:outline-none"
                  >
                    <option value="PROCUREMENT">PROCUREMENT</option>
                    <option value="SCADA">SCADA</option>
                    <option value="QAQC">QAQC</option>
                    <option value="HSE">HSE</option>
                    <option value="FINANCE">FINANCE</option>
                    <option value="HRMS">HRMS</option>
                    <option value="EDMS">EDMS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Entity Type</label>
                  <input
                    type="text"
                    value={newEvent.entityType}
                    onChange={(e) => setNewEvent({ ...newEvent, entityType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Entity ID</label>
                  <input
                    type="text"
                    value={newEvent.entityId}
                    onChange={(e) => setNewEvent({ ...newEvent, entityId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Severity</label>
                  <select
                    value={newEvent.severity}
                    onChange={(e) => setNewEvent({ ...newEvent, severity: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded focus:outline-none"
                  >
                    <option value="INFO">INFO</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">JSON Payload</label>
                <textarea
                  rows={4}
                  value={newEvent.payloadText}
                  onChange={(e) => setNewEvent({ ...newEvent, payloadText: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-indigo-300 font-mono p-2 rounded focus:outline-none text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded transition"
                >
                  Publish to Event Bus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
