import React from 'react';
import { Building2, Plus, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface RequestsTabProps {
  requests: any[];
  onOpenRequestModal: () => void;
  onApproveRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
}

export const ResourceRequestsTab: React.FC<RequestsTabProps> = ({
  requests,
  onOpenRequestModal,
  onApproveRequest,
  onRejectRequest,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h3 className="text-base font-semibold text-white">Department & Site Resource Requests</h3>
          <p className="text-xs text-slate-400 mt-0.5">Submit, review, and approve resource requisition tickets</p>
        </div>

        <button
          onClick={onOpenRequestModal}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-600/20"
        >
          <Plus className="w-4 h-4" />
          New Resource Request
        </button>
      </div>

      {/* Requests Cards List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs">
            No resource requests found.
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{req.title}</h4>
                    <span className="font-mono text-[11px] text-amber-400 font-semibold">{req.requestNumber}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Requested By: <span className="text-slate-200">{req.requestedBy}</span> • Project: <span className="text-slate-200">{req.projectId || 'General'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      req.priority === 'CRITICAL' || req.priority === 'HIGH'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {req.priority} Priority
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      req.status === 'APPROVED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : req.status === 'REJECTED'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              </div>

              {/* Items Breakdown */}
              {Array.isArray(req.items) && req.items.length > 0 && (
                <div className="mt-3 bg-slate-800/40 p-3 rounded-lg border border-slate-800 text-xs">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block mb-1">Requested Items:</span>
                  <div className="space-y-1">
                    {req.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-slate-300">
                        <span>Quantity: {item.requestedQty} {item.unit}</span>
                        <span className="font-mono text-slate-400">Est. Cost: AED {item.estimatedCost?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {req.status === 'PENDING' && (
                <div className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => onRejectRequest(req.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/50 text-rose-400 rounded-md text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject Request
                  </button>
                  <button
                    onClick={() => onApproveRequest(req.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold transition-colors flex items-center gap-1 shadow-md shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve Request
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
