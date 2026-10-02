import React, { useState } from 'react';
import { Wrench, Plus, Search, Filter, Truck, Users, ArrowRightLeft, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface AllocationTabProps {
  allocations: any[];
  onOpenAllocateModal: () => void;
  onReleaseAllocation: (id: string) => void;
  onTransferAllocation: (id: string, newProjectId: string) => void;
  onDeleteAllocation: (id: string) => void;
}

export const ResourceAllocationTab: React.FC<AllocationTabProps> = ({
  allocations,
  onOpenAllocateModal,
  onReleaseAllocation,
  onTransferAllocation,
  onDeleteAllocation,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [transferModalId, setTransferModalId] = useState<string | null>(null);
  const [targetProject, setTargetProject] = useState('PRJ-102');

  const filteredAllocations = allocations.filter((a) => {
    const matchSearch =
      a.resourceId.toLowerCase().includes(search.toLowerCase()) ||
      a.allocationNumber.toLowerCase().includes(search.toLowerCase()) ||
      (a.projectId && a.projectId.toLowerCase().includes(search.toLowerCase()));
    const matchType = typeFilter === 'ALL' || a.resourceType === typeFilter;
    return matchSearch && matchType;
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
              placeholder="Search by resource code, allocation #, project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Resource Types</option>
            <option value="EQUIPMENT">Equipment</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="CREW">Crew</option>
            <option value="VEHICLE">Vehicle</option>
            <option value="CONTRACTOR">Contractor</option>
          </select>
        </div>

        <button
          onClick={onOpenAllocateModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          Allocate Resource
        </button>
      </div>

      {/* Allocation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAllocations.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-xl">
            No allocations match your filter criteria.
          </div>
        ) : (
          filteredAllocations.map((alloc) => (
            <div
              key={alloc.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition-colors shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                      {alloc.resourceType === 'EQUIPMENT' ? <Wrench className="w-4 h-4" /> :
                       alloc.resourceType === 'VEHICLE' ? <Truck className="w-4 h-4" /> :
                       <Users className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{alloc.resourceId}</h4>
                      <span className="text-[10px] font-mono text-slate-400">{alloc.allocationNumber}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                      alloc.status === 'ALLOCATED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : alloc.status === 'RELEASED'
                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {alloc.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs border-t border-b border-slate-800 py-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Project:</span>
                    <span className="font-semibold text-white">{alloc.projectId || 'Department'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Allocated Qty & Hours:</span>
                    <span className="font-semibold text-slate-200">{alloc.allocatedQty} units ({alloc.workingHoursPerDay} hrs/day)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Duration:</span>
                    <span className="font-mono text-slate-300">{alloc.startDate} → {alloc.endDate}</span>
                  </div>
                  {alloc.remarks && (
                    <p className="text-[11px] text-slate-400 bg-slate-800/50 p-2 rounded italic mt-2">
                      "{alloc.remarks}"
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-1">
                <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                  Priority: <span className="text-amber-400">{alloc.priority}</span>
                </span>
                <div className="flex items-center gap-2">
                  {alloc.status === 'ALLOCATED' && (
                    <>
                      <button
                        onClick={() => setTransferModalId(alloc.id)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-indigo-900/40 text-indigo-300 rounded-md transition-colors flex items-center gap-1"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        Transfer
                      </button>
                      <button
                        onClick={() => onReleaseAllocation(alloc.id)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
                      >
                        Release
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Transfer Modal */}
      {transferModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-2">Transfer Resource Allocation</h3>
            <p className="text-xs text-slate-400 mb-4">Select target project for immediate site transfer.</p>
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-400 mb-1">Target Project ID</label>
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={targetProject}
                onChange={(e) => setTargetProject(e.target.value)}
              >
                <option value="PRJ-101">PRJ-101: Water Transmission Pipeline Phase 2</option>
                <option value="PRJ-102">PRJ-102: Central Water Reservoir Construction</option>
                <option value="PRJ-103">PRJ-103: Pumping Station Refurbishment</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setTransferModalId(null)}
                className="px-3 py-1.5 bg-slate-800 text-xs font-medium text-slate-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onTransferAllocation(transferModalId, targetProject);
                  setTransferModalId(null);
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white rounded-md"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
