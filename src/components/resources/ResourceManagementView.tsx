import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Layers,
  Wrench,
  Activity,
  Calendar as CalendarIcon,
  AlertTriangle,
  Building2,
  BarChart3,
  DollarSign,
  Plus,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { safeFetchJson } from '../../lib/safeFetch';
import { ResourceDashboardTab } from './ResourceDashboardTab';
import { ResourcePlanningTab } from './ResourcePlanningTab';
import { ResourceAllocationTab } from './ResourceAllocationTab';
import { ResourceAvailabilityTab } from './ResourceAvailabilityTab';
import { ResourceCalendarTab } from './ResourceCalendarTab';
import { ResourceConflictTab } from './ResourceConflictTab';
import { ResourceRequestsTab } from './ResourceRequestsTab';
import { ResourceUtilizationTab } from './ResourceUtilizationTab';
import { ResourceCostTab } from './ResourceCostTab';
import {
  CreatePlanModal,
  AllocateResourceModal,
  RequestResourceModal,
} from './ResourceModals';

export const ResourceManagementView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    'dashboard' | 'planning' | 'allocation' | 'availability' | 'calendar' | 'conflicts' | 'requests' | 'utilization' | 'costs'
  >('dashboard');

  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [calendars, setCalendars] = useState<any[]>([]);
  const [shiftTemplates, setShiftTemplates] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [utilizations, setUtilizations] = useState<any[]>([]);
  const [costs, setCosts] = useState<any[]>([]);

  // Modals state
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kpiRes, planRes, allocRes, availRes, calRes, shiftRes, holRes, confRes, reqRes, utilRes, costRes] =
        await Promise.all([
          safeFetchJson('/api/resources/kpis'),
          safeFetchJson('/api/resources/plans'),
          safeFetchJson('/api/resources/allocations'),
          safeFetchJson('/api/resources/availability'),
          safeFetchJson('/api/resources/calendars'),
          safeFetchJson('/api/resources/shift-templates'),
          safeFetchJson('/api/resources/holidays'),
          safeFetchJson('/api/resources/conflicts'),
          safeFetchJson('/api/resources/requests'),
          safeFetchJson('/api/resources/utilization'),
          safeFetchJson('/api/resources/costs'),
        ]);

      if (kpiRes?.data) setKpis(kpiRes.data);
      if (planRes?.data) setPlans(planRes.data);
      if (allocRes?.data) setAllocations(allocRes.data);
      if (availRes?.data) setAvailabilities(availRes.data);
      if (calRes?.data) setCalendars(calRes.data);
      if (shiftRes?.data) setShiftTemplates(shiftRes.data);
      if (holRes?.data) setHolidays(holRes.data);
      if (confRes?.data) setConflicts(confRes.data);
      if (reqRes?.data) setRequests(reqRes.data);
      if (utilRes?.data) setUtilizations(utilRes.data);
      if (costRes?.data) setCosts(costRes.data);
    } catch (err) {
      console.error('Error loading resource management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers for Plan actions
  const handleCreatePlan = async (data: any) => {
    try {
      await safeFetchJson('/api/resources/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setIsPlanModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create plan');
    }
  };

  const handleClonePlan = async (id: string) => {
    try {
      await safeFetchJson(`/api/resources/plans/${id}/clone`, { method: 'POST' });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to clone plan');
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to soft delete this plan?')) return;
    try {
      await safeFetchJson(`/api/resources/plans/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete plan');
    }
  };

  const handleRestorePlan = async (id: string) => {
    try {
      await safeFetchJson(`/api/resources/plans/${id}/restore`, { method: 'POST' });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to restore plan');
    }
  };

  // Handlers for Allocation actions
  const handleAllocateResource = async (data: any) => {
    try {
      await safeFetchJson('/api/resources/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setIsAllocateModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to allocate resource');
    }
  };

  const handleReleaseAllocation = async (id: string) => {
    try {
      await safeFetchJson(`/api/resources/allocations/${id}/release`, { method: 'POST' });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to release allocation');
    }
  };

  const handleTransferAllocation = async (id: string, newProjectId: string) => {
    try {
      await safeFetchJson(`/api/resources/allocations/${id}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newProjectId }),
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to transfer allocation');
    }
  };

  // Handlers for Request actions
  const handleCreateRequest = async (data: any) => {
    try {
      await safeFetchJson('/api/resources/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setIsRequestModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit request');
    }
  };

  const handleApproveRequest = async (id: string) => {
    try {
      await safeFetchJson(`/api/resources/requests/${id}/approve`, { method: 'POST' });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      await safeFetchJson(`/api/resources/requests/${id}/reject`, { method: 'POST' });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to reject request');
    }
  };

  // Handlers for Conflict Resolution
  const handleResolveConflict = async (id: string, notes?: string) => {
    try {
      await safeFetchJson(`/api/resources/conflicts/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve conflict');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Phase 54 ERP Core
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">Enterprise Resource Planning Engine</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Centralized planning, allocation, capacity, calendar, requests, and cost control across all projects & workforce
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800 text-xs">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeSubTab === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>

        <button
          onClick={() => setActiveSubTab('planning')}
          className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeSubTab === 'planning'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Resource Planning
        </button>

        <button
          onClick={() => setActiveSubTab('allocation')}
          className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeSubTab === 'allocation'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Allocations
        </button>

        <button
          onClick={() => setActiveSubTab('availability')}
          className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeSubTab === 'availability'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          Availability View
        </button>

        <button
          onClick={() => setActiveSubTab('calendar')}
          className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeSubTab === 'calendar'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          Calendar
        </button>

        <button
          onClick={() => setActiveSubTab('conflicts')}
          className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-2 whitespace-nowrap transition-colors relative ${
            activeSubTab === 'conflicts'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          Conflict Monitor
          {conflicts.filter((c) => c.resolutionStatus === 'UNRESOLVED').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('requests')}
          className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeSubTab === 'requests'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Resource Requests
        </button>

        <button
          onClick={() => setActiveSubTab('utilization')}
          className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeSubTab === 'utilization'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Utilization
        </button>

        <button
          onClick={() => setActiveSubTab('costs')}
          className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeSubTab === 'costs'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Cost Engine
        </button>
      </div>

      {/* Tab Content Rendering */}
      {activeSubTab === 'dashboard' && (
        <ResourceDashboardTab
          kpis={kpis}
          allocations={allocations}
          requests={requests}
          conflicts={conflicts}
          costs={costs}
          onNavigateTab={(tab) => setActiveSubTab(tab as any)}
        />
      )}

      {activeSubTab === 'planning' && (
        <ResourcePlanningTab
          plans={plans}
          onOpenCreateModal={() => setIsPlanModalOpen(true)}
          onClonePlan={handleClonePlan}
          onDeletePlan={handleDeletePlan}
          onRestorePlan={handleRestorePlan}
        />
      )}

      {activeSubTab === 'allocation' && (
        <ResourceAllocationTab
          allocations={allocations}
          onOpenAllocateModal={() => setIsAllocateModalOpen(true)}
          onReleaseAllocation={handleReleaseAllocation}
          onTransferAllocation={handleTransferAllocation}
          onDeleteAllocation={handleDeletePlan}
        />
      )}

      {activeSubTab === 'availability' && (
        <ResourceAvailabilityTab availabilities={availabilities} />
      )}

      {activeSubTab === 'calendar' && (
        <ResourceCalendarTab calendars={calendars} shiftTemplates={shiftTemplates} holidays={holidays} />
      )}

      {activeSubTab === 'conflicts' && (
        <ResourceConflictTab conflicts={conflicts} onResolveConflict={handleResolveConflict} />
      )}

      {activeSubTab === 'requests' && (
        <ResourceRequestsTab
          requests={requests}
          onOpenRequestModal={() => setIsRequestModalOpen(true)}
          onApproveRequest={handleApproveRequest}
          onRejectRequest={handleRejectRequest}
        />
      )}

      {activeSubTab === 'utilization' && (
        <ResourceUtilizationTab utilizations={utilizations} />
      )}

      {activeSubTab === 'costs' && (
        <ResourceCostTab costs={costs} />
      )}

      {/* Global Modals */}
      <CreatePlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        onSubmit={handleCreatePlan}
      />

      <AllocateResourceModal
        isOpen={isAllocateModalOpen}
        onClose={() => setIsAllocateModalOpen(false)}
        onSubmit={handleAllocateResource}
      />

      <RequestResourceModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSubmit={handleCreateRequest}
      />
    </div>
  );
};
