import React, { useState } from 'react';
import { ProjectCostControl } from '../../types/procurement';
import { Project } from '../../types';
import { 
  Calculator, 
  TrendingUp, 
  AlertTriangle, 
  PieChart, 
  DollarSign, 
  CheckCircle2, 
  Building2, 
  Layers 
} from 'lucide-react';

interface ProjectCostControlProps {
  costControls: ProjectCostControl[];
  projects: Project[];
}

export const ProjectCostControlView: React.FC<ProjectCostControlProps> = ({
  costControls,
  projects
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');

  const activeControl = costControls.find(c => c.projectId === selectedProjectId) || costControls[0];
  const activeProject = projects.find(p => p.id === selectedProjectId);

  if (!activeControl) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
        No Cost Control record available for this project.
      </div>
    );
  }

  const budgetUsedPct = Math.min(100, Math.round((activeControl.totalCommittedAndActualUSD / activeControl.approvedBudgetUSD) * 100));
  const isOverBudget = activeControl.costVarianceUSD < 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Calculator className="w-6 h-6 text-blue-600" />
            <span>Project Cost Control & Budget Variance Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time financial commitments, PO actuals, Labour/Equipment/Vehicle running cost aggregations & remaining budget forecasting
          </p>
        </div>

        <div>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Approved Budget</span>
          <span className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1 block">
            ${activeControl.approvedBudgetUSD.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Baseline Allocation</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Committed & Actual Spend</span>
          <span className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400 mt-1 block">
            ${activeControl.totalCommittedAndActualUSD.toLocaleString()}
          </span>
          <span className="text-[11px] text-blue-500 font-bold mt-1 block">{budgetUsedPct}% of Budget Utilized</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remaining Uncommitted Budget</span>
          <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
            ${activeControl.remainingBudgetUSD.toLocaleString()}
          </span>
          <span className="text-[11px] text-emerald-500 font-bold mt-1 block">Available for Procurement</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cost Variance Status</span>
          <span className={`text-2xl font-black font-mono mt-1 block ${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
            ${Math.abs(activeControl.costVarianceUSD).toLocaleString()} {isOverBudget ? 'OVER' : 'SAVINGS'}
          </span>
          <span className={`text-[11px] font-bold mt-1 block ${isOverBudget ? 'text-rose-500' : 'text-emerald-500'}`}>
            {isOverBudget ? 'Budget Overrun Alert' : 'Within Budget Safe Zone'}
          </span>
        </div>

      </div>

      {/* Spend Breakdown Cards */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
          <PieChart className="w-5 h-5 text-blue-600" />
          <span>Cost Allocation & Module Cost Center Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Material PO Commitments</span>
            <span className="text-lg font-extrabold font-mono text-slate-800 dark:text-slate-200 mt-1 block">
              ${activeControl.materialPurchaseCostUSD.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Subcontract Work Orders</span>
            <span className="text-lg font-extrabold font-mono text-slate-800 dark:text-slate-200 mt-1 block">
              ${activeControl.subcontractCostUSD.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Labour & Payroll Cost</span>
            <span className="text-lg font-extrabold font-mono text-slate-800 dark:text-slate-200 mt-1 block">
              ${activeControl.labourCostUSD.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Fleet & Machinery Fuel</span>
            <span className="text-lg font-extrabold font-mono text-slate-800 dark:text-slate-200 mt-1 block">
              ${activeControl.fleetEquipmentCostUSD.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Overheads & Site Running</span>
            <span className="text-lg font-extrabold font-mono text-slate-800 dark:text-slate-200 mt-1 block">
              ${activeControl.siteOverheadCostUSD.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Budget Progress Meter */}
        <div className="pt-4 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">Project Budget Consumption Meter</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{budgetUsedPct}% Expended</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                budgetUsedPct > 90 ? 'bg-rose-500' : budgetUsedPct > 75 ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${budgetUsedPct}%` }}
            />
          </div>
        </div>
      </div>

    </div>
  );
};
