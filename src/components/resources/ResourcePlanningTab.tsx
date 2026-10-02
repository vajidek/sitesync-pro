import React, { useState } from 'react';
import { Layers, Plus, Search, Filter, Copy, RefreshCw, Trash2, Calendar, Building2, CheckCircle, Clock } from 'lucide-react';

interface PlanningTabProps {
  plans: any[];
  onOpenCreateModal: () => void;
  onClonePlan: (id: string) => void;
  onDeletePlan: (id: string) => void;
  onRestorePlan: (id: string) => void;
}

export const ResourcePlanningTab: React.FC<PlanningTabProps> = ({
  plans,
  onOpenCreateModal,
  onClonePlan,
  onDeletePlan,
  onRestorePlan,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredPlans = plans.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.planNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              placeholder="Search plans by title or number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="APPROVED">Approved</option>
            <option value="DRAFT">Draft</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          Create New Plan
        </button>
      </div>

      {/* Plans List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Plan Number & Title</th>
                <th className="px-4 py-3">Project / Dept</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No resource plans found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white text-sm">{plan.title}</div>
                      <div className="text-[11px] font-mono text-indigo-400 mt-0.5">{plan.planNumber}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-200 font-medium">{plan.projectId || 'N/A'}</div>
                      <div className="text-slate-400 text-[11px]">{plan.departmentId || 'General'}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {plan.startDate} → {plan.endDate}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {plan.planType} {plan.isRecurring ? '(Recurring)' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          plan.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : plan.status === 'APPROVED'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onClonePlan(plan.id)}
                          title="Clone Plan"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeletePlan(plan.id)}
                          title="Delete Plan"
                          className="p-1.5 bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
