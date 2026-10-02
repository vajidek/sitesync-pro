import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

interface ConflictTabProps {
  conflicts: any[];
  onResolveConflict: (id: string, notes?: string) => void;
}

export const ResourceConflictTab: React.FC<ConflictTabProps> = ({ conflicts, onResolveConflict }) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Automated Conflict & Over-Allocation Monitor
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Detects simultaneous bookings, double allocations, shift collisions, and leave overlaps
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {conflicts.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            All resource allocations are clear! No scheduling conflicts detected.
          </div>
        ) : (
          conflicts.map((conf) => (
            <div
              key={conf.id}
              className={`p-5 rounded-xl border transition-all ${
                conf.resolutionStatus === 'RESOLVED'
                  ? 'bg-slate-900 border-slate-800 text-slate-400 opacity-75'
                  : 'bg-rose-950/20 border-rose-900/40 text-slate-100 shadow-lg'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{conf.resourceId}</span>
                      <span className="px-2 py-0.5 text-[10px] uppercase font-semibold rounded bg-rose-500/20 text-rose-300">
                        {conf.conflictType}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">Date: {conf.conflictDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase rounded-full ${
                      conf.severity === 'CRITICAL' || conf.severity === 'HIGH'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {conf.severity} Severity
                  </span>
                  <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase rounded bg-slate-800 text-slate-300">
                    {conf.resolutionStatus}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 mt-3 leading-relaxed">{conf.description}</p>

              {conf.resolutionStatus === 'UNRESOLVED' && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => onResolveConflict(conf.id, 'Resolved via allocation re-assignment')}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-md shadow-rose-600/20 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Resolve Conflict
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
