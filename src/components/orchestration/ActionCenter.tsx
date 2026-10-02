import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  User,
  Tag,
  Filter,
  Search,
  Plus,
  ChevronRight,
  Check,
  Shield,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { EnterpriseActionItem, ActionStatus, ActionPriority } from '../../api/orchestration/orchestration.types';
import { NavTab } from '../layout/Sidebar';

interface ActionCenterProps {
  actions: EnterpriseActionItem[];
  onUpdateStatus: (actionId: string, status: ActionStatus, resolutionNotes?: string) => Promise<void>;
  onAssignAction?: (actionId: string, userId: string, role: string) => Promise<void>;
  onNavigateTab?: (tab: NavTab) => void;
  isLoading: boolean;
}

export const ActionCenter: React.FC<ActionCenterProps> = ({
  actions,
  onUpdateStatus,
  onAssignAction,
  onNavigateTab,
  isLoading,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [resolvingActionId, setResolvingActionId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const filteredActions = actions.filter((act) => {
    if (selectedStatus !== 'ALL' && act.status !== selectedStatus) return false;
    if (selectedPriority !== 'ALL' && act.priority !== selectedPriority) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = act.title.toLowerCase().includes(q);
      const matchNum = act.actionNumber.toLowerCase().includes(q);
      const matchDesc = act.description.toLowerCase().includes(q);
      if (!matchTitle && !matchNum && !matchDesc) return false;
    }
    return true;
  });

  const getPriorityBadge = (prio: ActionPriority) => {
    switch (prio) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'URGENT':
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'LOW':
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const getStatusBadge = (st: ActionStatus) => {
    switch (st) {
      case 'RESOLVED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'IN_PROGRESS':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'PENDING_APPROVAL':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'ESCALATED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'CANCELLED':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      case 'OPEN':
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    }
  };

  const handleResolveSubmit = async (actionId: string) => {
    await onUpdateStatus(actionId, 'RESOLVED', resolutionNotes || 'Resolved through Enterprise Action Center.');
    setResolvingActionId(null);
    setResolutionNotes('');
  };

  return (
    <div id="enterprise-action-center" className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="flex flex-1 items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search action items by title, ID, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 text-sm text-slate-200 pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500/50"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500/50"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <strong className="text-slate-200">{filteredActions.length}</strong> items
        </div>
      </div>

      {/* Action Items List */}
      <div className="space-y-3">
        {filteredActions.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
            <Layers className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <p className="font-medium text-slate-300">No enterprise action items found</p>
            <p className="text-xs text-slate-500 mt-1">All cross-module operational tasks are currently in sync</p>
          </div>
        ) : (
          filteredActions.map((act) => (
            <div
              key={act.id}
              className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 rounded-xl p-4.5 transition shadow-sm"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-indigo-400 font-bold">{act.actionNumber}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border ${getPriorityBadge(act.priority)}`}>
                      {act.priority}
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium border ${getStatusBadge(act.status)}`}>
                      {act.status}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                      {act.sourceModule} → {act.targetModule}
                    </span>
                    {act.projectId && (
                      <span className="text-xs text-slate-400 font-medium">Project: {act.projectId}</span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100">{act.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{act.description}</p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      Assigned: <strong className="text-slate-300">{act.assignedToName || act.assignedToRole || 'Unassigned'}</strong>
                    </span>
                    {act.dueDate && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Due: {act.dueDate}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Interactive Action Controls */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-center">
                  {act.actionButtons?.map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => {
                        if (btn.targetTab && onNavigateTab) {
                          onNavigateTab(btn.targetTab as NavTab);
                        }
                      }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        btn.variant === 'primary'
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                          : btn.variant === 'secondary'
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                    >
                      <span>{btn.label}</span>
                      {btn.targetTab && <ExternalLink className="w-3 h-3 text-slate-400" />}
                    </button>
                  ))}

                  {act.status !== 'RESOLVED' ? (
                    <button
                      onClick={() => setResolvingActionId(act.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium px-2 py-1 bg-emerald-950/40 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolved
                    </span>
                  )}
                </div>
              </div>

              {/* Resolution Form Modal Inline */}
              {resolvingActionId === act.id && (
                <div className="mt-3 pt-3 border-t border-slate-800/90 bg-slate-950 p-3 rounded-lg space-y-2">
                  <div className="text-xs font-semibold text-slate-200">Resolution Summary & Audit Note:</div>
                  <input
                    type="text"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Enter action close-out notes..."
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setResolvingActionId(null)}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleResolveSubmit(act.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded"
                    >
                      Confirm Resolution
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
