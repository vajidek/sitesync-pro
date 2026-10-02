import React from 'react';
import { Activity, Clock, CheckCircle2, AlertCircle, Percent, Wrench, Truck, Users } from 'lucide-react';

interface AvailabilityTabProps {
  availabilities: any[];
}

export const ResourceAvailabilityTab: React.FC<AvailabilityTabProps> = ({ availabilities }) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Resource Availability & Capacity Matrix</h3>
          <p className="text-xs text-slate-400 mt-0.5">Real-time breakdown of total capacity, allocated hours, and remaining site buffer</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
            <span className="text-slate-300">Allocated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-slate-300">Reserved</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availabilities.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-xl">
            No availability records available for the selected period.
          </div>
        ) : (
          availabilities.map((item) => (
            <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                    {item.resourceType === 'EQUIPMENT' ? <Wrench className="w-4 h-4" /> :
                     item.resourceType === 'VEHICLE' ? <Truck className="w-4 h-4" /> :
                     <Users className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.resourceId}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {item.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Utilization Rate</span>
                  <span className="font-bold text-white">{item.utilizationPercentage}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-indigo-500 h-full transition-all" style={{ width: `${item.utilizationPercentage}%` }} />
                  <div className="bg-amber-500 h-full transition-all" style={{ width: `${(item.reservedCapacity / item.totalCapacity) * 100}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center">
                <div className="bg-slate-800/50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase block">Total</span>
                  <span className="text-xs font-bold text-white">{item.totalCapacity}h</span>
                </div>
                <div className="bg-slate-800/50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase block">Allocated</span>
                  <span className="text-xs font-bold text-indigo-400">{item.allocatedCapacity}h</span>
                </div>
                <div className="bg-slate-800/50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase block">Remaining</span>
                  <span className="text-xs font-bold text-emerald-400">{item.availableCapacity}h</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
