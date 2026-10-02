import React from 'react';
import { DollarSign, TrendingUp, AlertCircle, Coins, CreditCard } from 'lucide-react';

interface CostTabProps {
  costs: any[];
}

export const ResourceCostTab: React.FC<CostTabProps> = ({ costs }) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Enterprise Resource Cost Engine</h3>
          <p className="text-xs text-slate-400 mt-0.5">Hourly, daily, and monthly rate cards including idle cost rates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {costs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-xl">
            No cost definitions found.
          </div>
        ) : (
          costs.map((c) => (
            <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-sm text-white">{c.resourceId}</span>
                <span className="px-2 py-0.5 text-[10px] font-mono text-amber-400 bg-amber-500/10 rounded border border-amber-500/20">
                  {c.currency || 'AED'}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Hourly Cost Rate:</span>
                  <span className="font-bold text-white">AED {c.hourlyCost}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Daily Cost Rate:</span>
                  <span className="font-bold text-white">AED {c.dailyCost}/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly Budget Rate:</span>
                  <span className="font-bold text-indigo-400">AED {c.monthlyCost?.toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Idle Cost Penalty Rate:</span>
                  <span className="font-bold text-rose-400">AED {c.idleCostPerHour}/hr</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
                <span>Effective From:</span>
                <span className="font-mono text-slate-300">{c.effectiveDate}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
