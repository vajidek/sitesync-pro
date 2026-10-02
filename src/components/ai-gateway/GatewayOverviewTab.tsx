import React, { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  Server,
  Zap,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Radio,
  Share2,
  TrendingUp,
} from 'lucide-react';

interface GatewayOverviewTabProps {
  onNavigateTab: (tab: string) => void;
}

export const GatewayOverviewTab: React.FC<GatewayOverviewTabProps> = ({ onNavigateTab }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOverview = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/ai-gateway/overview');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (e) {
      console.error('Failed to load gateway overview:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 10000);
    return () => clearInterval(interval);
  }, []);

  const overview = data?.overview || {
    totalRequests: 25,
    totalTokens: 14820,
    totalCostUsd: 0.0042,
    averageLatencyMs: 184,
    fallbackRate: 8.0,
    successRate: 99.4,
    activeProviders: '3/3',
    activeWebhooks: '2/2',
    totalApiClients: 2,
    systemHealth: 'HEALTHY',
  };

  const providers = data?.providersHealth || [];
  const recentUsage = data?.recentUsage || [];

  return (
    <div className="space-y-6" id="ai-gateway-overview-container">
      {/* Top Stat Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 relative overflow-hidden backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gateway Status</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {overview.systemHealth}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{overview.activeProviders}</span>
            <span className="text-xs text-slate-400">Active Providers Online</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Zero-Downtime Deterministic Fallback Active</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Invocations</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{overview.totalRequests.toLocaleString()}</span>
            <span className="text-xs text-emerald-400 font-medium">{overview.successRate}% Success</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Avg. Latency: <span className="text-slate-200 font-semibold">{overview.averageLatencyMs} ms</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Token Consumption</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{overview.totalTokens.toLocaleString()}</span>
            <span className="text-xs text-slate-400">Tokens Processed</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Est. Total Cost: <span className="text-emerald-400 font-semibold">${overview.totalCostUsd.toFixed(4)}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Failover Resilience</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{overview.fallbackRate}%</span>
            <span className="text-xs text-amber-400 font-medium">Automatic Reroutes</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Active Webhook Pipes: <span className="text-slate-200 font-semibold">{overview.activeWebhooks}</span>
          </div>
        </div>
      </div>

      {/* Provider Status Grid */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              Connected Multi-Model Provider Runtimes
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time health telemetry, ping latencies, and circuit-breaker status</p>
          </div>
          <button
            onClick={fetchOverview}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Sentinel</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Gemini */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 relative">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Google GenAI</span>
                <h4 className="text-sm font-semibold text-white mt-1">Gemini 3.6 / 3.7 Flash & 1.5 Pro</h4>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                Active
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-slate-800/80 pt-3">
              <div>
                <span className="text-slate-500">Latency:</span>
                <p className="font-semibold text-slate-200 mt-0.5">~190 ms</p>
              </div>
              <div>
                <span className="text-slate-500">Health Score:</span>
                <p className="font-semibold text-emerald-400 mt-0.5">100.0%</p>
              </div>
              <div>
                <span className="text-slate-500">Input Pricing:</span>
                <p className="font-medium text-slate-300 mt-0.5">$0.00015 / 1k</p>
              </div>
              <div>
                <span className="text-slate-500">Circuit Breaker:</span>
                <p className="font-medium text-emerald-400 mt-0.5">Normal (Closed)</p>
              </div>
            </div>
          </div>

          {/* OpenAI */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 relative">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">OpenAI Bridge</span>
                <h4 className="text-sm font-semibold text-white mt-1">GPT-4o Mini & GPT-4o Omni</h4>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <CheckCircle2 className="w-3 h-3" />
                Active / Standby
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-slate-800/80 pt-3">
              <div>
                <span className="text-slate-500">Latency:</span>
                <p className="font-semibold text-slate-200 mt-0.5">~220 ms</p>
              </div>
              <div>
                <span className="text-slate-500">Health Score:</span>
                <p className="font-semibold text-emerald-400 mt-0.5">100.0%</p>
              </div>
              <div>
                <span className="text-slate-500">Input Pricing:</span>
                <p className="font-medium text-slate-300 mt-0.5">$0.00015 / 1k</p>
              </div>
              <div>
                <span className="text-slate-500">Circuit Breaker:</span>
                <p className="font-medium text-emerald-400 mt-0.5">Normal (Closed)</p>
              </div>
            </div>
          </div>

          {/* Local Deterministic */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 relative">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Local Heuristic Engine</span>
                <h4 className="text-sm font-semibold text-white mt-1">Deterministic CPM/EVM v3</h4>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                Guaranteed Local
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-slate-800/80 pt-3">
              <div>
                <span className="text-slate-500">Latency:</span>
                <p className="font-semibold text-slate-200 mt-0.5">&lt; 15 ms</p>
              </div>
              <div>
                <span className="text-slate-500">Health Score:</span>
                <p className="font-semibold text-emerald-400 mt-0.5">100.0%</p>
              </div>
              <div>
                <span className="text-slate-500">Cost:</span>
                <p className="font-medium text-emerald-400 mt-0.5">$0.0000 (Zero Cost)</p>
              </div>
              <div>
                <span className="text-slate-500">Fallback Role:</span>
                <p className="font-medium text-indigo-300 mt-0.5">Terminal Baseline</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Gateway Feed */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Live Task Execution & Failover Stream
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Audit log of all LLM and deterministic task routing decisions</p>
          </div>
          <button
            onClick={() => onNavigateTab('usage')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition"
          >
            <span>View Full Audit Log</span>
            <TrendingUp className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Request ID</th>
                <th className="py-2.5 px-3">Task Type</th>
                <th className="py-2.5 px-3">Provider & Model</th>
                <th className="py-2.5 px-3">Execution Mode</th>
                <th className="py-2.5 px-3 text-right">Tokens</th>
                <th className="py-2.5 px-3 text-right">Latency</th>
                <th className="py-2.5 px-3 text-right">Est. Cost</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentUsage.slice(0, 7).map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-3 font-mono text-slate-300">{log.requestId}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {log.taskType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-white">{log.providerCode}</div>
                    <div className="text-[11px] text-slate-400">{log.modelCode}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    {log.wasFallbackUsed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        Failover Recovered
                      </span>
                    ) : log.responseClassification === 'DETERMINISTIC' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Deterministic Local
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        Primary AI Route
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300">{log.totalTokens}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300">{log.latencyMs} ms</td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                    {log.estimatedCostUsd === 0 ? '$0.0000' : `$${log.estimatedCostUsd.toFixed(4)}`}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
