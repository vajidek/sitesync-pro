import React from 'react';
import { BarChart3, TrendingUp, Clock, Zap, Percent } from 'lucide-react';

interface UtilizationTabProps {
  utilizations: any[];
}

export const ResourceUtilizationTab: React.FC<UtilizationTabProps> = ({ utilizations }) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Resource Utilization Analytics</h3>
          <p className="text-xs text-slate-400 mt-0.5">Planned vs Actual working hours, idle time, and productivity efficiency scores</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Resource Code</th>
                <th className="px-4 py-3">Project / Dept</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Planned Hrs</th>
                <th className="px-4 py-3">Actual Hrs</th>
                <th className="px-4 py-3">Idle Hrs</th>
                <th className="px-4 py-3">Utilization %</th>
                <th className="px-4 py-3">Efficiency Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {utilizations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No utilization logs recorded yet.
                  </td>
                </tr>
              ) : (
                utilizations.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-white">{u.resourceId}</td>
                    <td className="px-4 py-3 text-slate-300">{u.projectId || 'General Site'}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{u.date}</td>
                    <td className="px-4 py-3 font-semibold text-slate-200">{u.plannedHours}h</td>
                    <td className="px-4 py-3 font-semibold text-indigo-400">{u.actualHours}h</td>
                    <td className="px-4 py-3 font-semibold text-rose-400">{u.idleHours}h</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">{u.utilizationPercentage}%</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {u.efficiencyScore || 100}%
                      </span>
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
