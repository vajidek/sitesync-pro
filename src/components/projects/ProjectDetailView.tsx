import React, { useState, useEffect } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { 
  Building2, ArrowLeft, MapPin, Users, HardHat, ClipboardList, CheckSquare, 
  FileText, Calendar, DollarSign, Activity, AlertCircle, ExternalLink, Edit3, Archive, Layers, Package, Settings, FolderTree
} from 'lucide-react';
import { ProjectSitesView } from './ProjectSitesView';
import { ProjectTeamView } from './ProjectTeamView';
import { DailyProgressView } from './DailyProgressView';
import { TaskManagementView } from './TaskManagementView';
import { ProjectDocumentsView } from './ProjectDocumentsView';
import { ProjectTimelineView } from './ProjectTimelineView';
import { ProjectWorkPackagesView } from './ProjectWorkPackagesView';
import { ProjectSettingsView } from './ProjectSettingsView';
import { ProjectHierarchyView } from './ProjectHierarchyView';
import { ProjectDepartmentsView } from './ProjectDepartmentsView';
import { ProjectWbsView } from './ProjectWbsView';
import { ProjectDprView } from './ProjectDprView';
import { ProjectCommercialCostView } from './ProjectCommercialCostView';

interface ProjectDetailViewProps {
  projectId: string;
  onBack: () => void;
  onEdit: (project: any) => void;
  onArchive: (projectId: string) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  projectId,
  onBack,
  onEdit,
  onArchive,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'COMMERCIAL_COST' | 'WBS_BOQ' | 'HIERARCHY' | 'WORK_PACKAGES' | 'DEPARTMENTS' | 'SITES' | 'TEAM' | 'PROGRESS' | 'TASKS' | 'DOCUMENTS' | 'TIMELINE' | 'SETTINGS'>('COMMERCIAL_COST');
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch(`/api/projects/${projectId}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setDashboardData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchDashboard();
  }, [projectId]);

  if (loading || !dashboardData) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        Loading project execution engine...
      </div>
    );
  }

  const { project, sitesCount, membersCount, openTasksCount, pendingApprovalsCount, workPackagesCount, departmentsCount } = dashboardData;

  const tabs = [
    { id: 'COMMERCIAL_COST', label: 'Commercial & Cost Control', icon: DollarSign },
    { id: 'OVERVIEW', label: 'Overview & Dashboard', icon: Activity },
    { id: 'WBS_BOQ', label: 'WBS & BOQ Engine', icon: FolderTree },
    { id: 'HIERARCHY', label: 'Structure Breakdown', icon: Layers },
    { id: 'WORK_PACKAGES', label: `Work Packages (${workPackagesCount || 0})`, icon: Package },
    { id: 'DEPARTMENTS', label: `Departments (${departmentsCount || 0})`, icon: Building2 },
    { id: 'SITES', label: `Sites & GPS (${sitesCount})`, icon: MapPin },
    { id: 'TEAM', label: `Team Members (${membersCount})`, icon: Users },
    { id: 'PROGRESS', label: `Daily Progress (${pendingApprovalsCount} pending)`, icon: ClipboardList },
    { id: 'TASKS', label: `Task Tracker (${openTasksCount} open)`, icon: CheckSquare },
    { id: 'DOCUMENTS', label: 'Drawings & Documents', icon: FileText },
    { id: 'TIMELINE', label: 'Timeline & Milestones', icon: Calendar },
    { id: 'SETTINGS', label: 'Engine Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-start space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition mt-0.5"
            title="Back to projects list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {project.projectCode}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                project.status === 'IN_PROGRESS'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                {project.status}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {project.priority} PRIORITY
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {project.projectName}
            </h1>
            <p className="text-xs text-slate-500 flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>{project.location}</span>
              <span>•</span>
              <span>Client: <strong>{project.customerName || 'N/A'}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end md:self-center">
          <button
            onClick={() => onEdit(project)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Scope</span>
          </button>
          <button
            onClick={() => onArchive(project.id)}
            className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 font-bold text-xs flex items-center space-x-1 hover:bg-rose-100 transition"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archive</span>
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center space-x-1.5 overflow-x-auto p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* KPI Dashboard Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Budget</span>
              <div className="text-base font-black text-slate-900 dark:text-white">
                AED {(project.budget / 1000000).toFixed(2)}M
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Actual Spent</span>
              <div className="text-base font-black text-blue-600 dark:text-blue-400">
                AED {((project.actualSpent || 0) / 1000000).toFixed(2)}M
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Progress</span>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                {project.progressPercentage || 0}%
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Active Sites</span>
              <div className="text-base font-black text-slate-900 dark:text-white">{sitesCount}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Team</span>
              <div className="text-base font-black text-slate-900 dark:text-white">{membersCount}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Open Tasks</span>
              <div className="text-base font-black text-amber-600 dark:text-amber-400">{openTasksCount}</div>
            </div>
          </div>

          {/* Description & Scope */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Project Scope & Technical Description</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {project.description || 'No detailed project description recorded.'}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'COMMERCIAL_COST' && <ProjectCommercialCostView projectId={projectId} projectName={project.projectName} />}
      {activeTab === 'WBS_BOQ' && <ProjectWbsView projectId={projectId} projectName={project.projectName} />}
      {activeTab === 'HIERARCHY' && <ProjectHierarchyView projectId={projectId} />}
      {activeTab === 'WORK_PACKAGES' && <ProjectWorkPackagesView projectId={projectId} />}
      {activeTab === 'DEPARTMENTS' && <ProjectDepartmentsView projectId={projectId} />}
      {activeTab === 'SITES' && <ProjectSitesView projectId={projectId} />}
      {activeTab === 'TEAM' && <ProjectTeamView projectId={projectId} />}
      {activeTab === 'PROGRESS' && <ProjectDprView projectId={projectId} projectName={project.projectName} />}
      {activeTab === 'TASKS' && <TaskManagementView projectId={projectId} />}
      {activeTab === 'DOCUMENTS' && <ProjectDocumentsView projectId={projectId} />}
      {activeTab === 'TIMELINE' && <ProjectTimelineView projectId={projectId} />}
      {activeTab === 'SETTINGS' && <ProjectSettingsView projectId={projectId} />}
    </div>
  );
};
