import React, { useState } from 'react';
import { WaterProjectDashboard } from './WaterProjectDashboard';
import { WaterPipelineManagement } from './WaterPipelineManagement';
import { WaterValveRegister } from './WaterValveRegister';
import { WaterTestingModule } from './WaterTestingModule';
import { WaterDailySiteReportView } from './WaterDailySiteReportView';
import { WaterDocumentsView } from './WaterDocumentsView';
import { WaterReportsAnalytics } from './WaterReportsAnalytics';
import {
  Droplets,
  Activity,
  Wrench,
  FileCheck2,
  Calendar,
  FileText,
  BarChart3,
  RefreshCw,
  Download
} from 'lucide-react';

export const WaterInfrastructureView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<string>('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: Droplets },
    { id: 'pipelines', label: 'Pipeline Chainages', icon: Activity },
    { id: 'valves', label: 'Valve Register', icon: Wrench },
    { id: 'testing', label: 'Hydro Testing', icon: FileCheck2 },
    { id: 'dpr', label: 'Daily Site DPR', icon: Calendar },
    { id: 'documents', label: 'Documents & RFIs', icon: FileText },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Module Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
            <span>Midland ERP • Water Infrastructure & Engineering</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Mechanical & Water Engineering Operations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Specialized Enterprise ERP suite for Water Infrastructure, WTP, Pumping Stations, MS/DI/HDPE Pipelines, Valve Chambers & SCADA
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition flex items-center space-x-1.5 min-h-[44px]"
            title="Refresh Water Utility Data"
          >
            <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              const csvContent = ["Module,Status,Timestamp"].join(",") + "\n" + `"Water Engineering Ops","Active","${new Date().toISOString()}"`;
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", `water_utility_ops_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition flex items-center space-x-1.5 min-h-[44px]"
            title="Export Utility Summary"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Bar */}
      <div className="flex items-center space-x-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSubTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center space-x-2 whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-View Component Rendering */}
      <div>
        {activeSubTab === 'dashboard' && <WaterProjectDashboard onSelectSubTab={setActiveSubTab} />}
        {activeSubTab === 'pipelines' && <WaterPipelineManagement />}
        {activeSubTab === 'valves' && <WaterValveRegister />}
        {activeSubTab === 'testing' && <WaterTestingModule />}
        {activeSubTab === 'dpr' && <WaterDailySiteReportView />}
        {activeSubTab === 'documents' && <WaterDocumentsView />}
        {activeSubTab === 'reports' && <WaterReportsAnalytics />}
      </div>
    </div>
  );
};
