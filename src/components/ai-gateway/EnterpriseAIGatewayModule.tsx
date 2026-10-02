import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  GitFork,
  Scale,
  Flame,
  BarChart3,
  Key,
  ShieldCheck,
  Zap,
  Activity,
} from 'lucide-react';
import { GatewayOverviewTab } from './GatewayOverviewTab';
import { ProviderModelRegistryTab } from './ProviderModelRegistryTab';
import { TaskRoutingPoliciesTab } from './TaskRoutingPoliciesTab';
import { QualityBenchmarkTab } from './QualityBenchmarkTab';
import { FailoverChaosLabTab } from './FailoverChaosLabTab';
import { UsageCostAnalyticsTab } from './UsageCostAnalyticsTab';
import { ApiClientsWebhooksTab } from './ApiClientsWebhooksTab';

export type GatewaySubTab =
  | 'overview'
  | 'registry'
  | 'routing'
  | 'benchmarks'
  | 'chaos'
  | 'analytics'
  | 'clients_webhooks';

export const EnterpriseAIGatewayModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<GatewaySubTab>('overview');

  const tabs = [
    {
      id: 'overview' as GatewaySubTab,
      label: 'Gateway Overview',
      icon: <Activity className="w-4 h-4 text-emerald-400" />,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'registry' as GatewaySubTab,
      label: 'Provider & Model Registry',
      icon: <Layers className="w-4 h-4 text-blue-400" />,
    },
    {
      id: 'routing' as GatewaySubTab,
      label: 'Task Routing Policies',
      icon: <GitFork className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'benchmarks' as GatewaySubTab,
      label: 'Quality & Benchmarks',
      icon: <Scale className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'chaos' as GatewaySubTab,
      label: 'Failover Chaos Lab',
      icon: <Flame className="w-4 h-4 text-rose-400" />,
      badge: 'Sim',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      id: 'analytics' as GatewaySubTab,
      label: 'Usage & Cost Analytics',
      icon: <BarChart3 className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'clients_webhooks' as GatewaySubTab,
      label: 'API Clients & Webhooks',
      icon: <Key className="w-4 h-4 text-indigo-400" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0B132B]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/10">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Enterprise Multi-Model AI Gateway
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Phase 74
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Hub
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Multi-model routing, automatic failover chains, deterministic zero-downtime fallback, token quota governance & real-time webhook dispatch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Deterministic Safeguard: <strong>ONLINE</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Multi-Provider Mesh</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto mt-6 pt-4 border-t border-white/5 scrollbar-thin">
          {tabs.map((t) => {
            const isActive = activeSubTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveSubTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
                {t.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold border ${
                      isActive ? 'bg-white/20 text-white border-white/30' : t.badgeColor
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="transition-all duration-200">
        {activeSubTab === 'overview' && (
          <GatewayOverviewTab onNavigateTab={(tab) => setActiveSubTab(tab as GatewaySubTab)} />
        )}
        {activeSubTab === 'registry' && <ProviderModelRegistryTab />}
        {activeSubTab === 'routing' && <TaskRoutingPoliciesTab />}
        {activeSubTab === 'benchmarks' && <QualityBenchmarkTab />}
        {activeSubTab === 'chaos' && <FailoverChaosLabTab />}
        {activeSubTab === 'analytics' && <UsageCostAnalyticsTab />}
        {activeSubTab === 'clients_webhooks' && <ApiClientsWebhooksTab />}
      </div>
    </div>
  );
};
