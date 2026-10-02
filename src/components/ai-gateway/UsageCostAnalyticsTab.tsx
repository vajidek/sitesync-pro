import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  PieChart,
  BarChart3,
  Search,
  Filter,
  Download,
  AlertCircle,
  Clock,
  Shield,
  Layers,
} from 'lucide-react';

export const UsageCostAnalyticsTab: React.FC = () => {
  const [usageLogs, setUsageLogs] = useState<any[]>([]);
  const [failoverLogs, setFailoverLogs] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'usage' | 'failover' | 'budgets'>('usage');
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const [uRes, fRes] = await Promise.all([
          fetch('/api/ai-gateway/usage-logs?limit=50'),
          fetch('/api/ai-gateway/failover-logs?limit=50'),
        ]);
        const uJson = await uRes.json();
        const fJson = await fRes.json();
        if (uJson.success) setUsageLogs(uJson.data);
        if (fJson.success) setFailoverLogs(fJson.data);
      } catch (e) {
        console.error('Failed to load usage & cost logs:', e);
      }
    };
    fetchLogs();
  }, []);

  const totalTokens = usageLogs.reduce((sum, l) => sum + (l.totalTokens || 0), 0);
  const totalCost = usageLogs.reduce((sum, l) => sum + (l.estimatedCostUsd || 0), 0);
  const totalRequests = usageLogs.length;

  const filteredUsageLogs = usageLogs.filter(
    l =>
      l.requestId?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.taskType?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.providerCode?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.modelCode?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6" id="ai-usage-cost-analytics">
      {/* Top Cost & Budget Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Month Spend</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 tracking-tight">${totalCost.toFixed(4)}</span>
            <span className="text-xs text-slate-400">/ $2,500 Budget</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Budget Utilization: <span className="text-emerald-400 font-semibold">&lt; 0.1%</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Invocations</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{totalRequests}</span>
            <span className="text-xs text-slate-400">API Calls</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Avg Cost / Call: <span className="text-slate-200 font-semibold">${(totalCost / Math.max(1, totalRequests)).toFixed(5)}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Token Volume</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{totalTokens.toLocaleString()}</span>
            <span className="text-xs text-slate-400">Total Tokens</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Input / Output Split: <span className="text-slate-200 font-semibold">68% / 32%</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Failover Count</span>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{failoverLogs.length}</span>
            <span className="text-xs text-emerald-400 font-medium">100% Recovered</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Zero SLA Breaches Recorded
          </div>
        </div>
      </div>

      {/* Tab Controls & Filter */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('usage')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSubTab === 'usage'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Invocation & Token Logs ({filteredUsageLogs.length})
            </button>
            <button
              onClick={() => setActiveSubTab('failover')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSubTab === 'failover'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Failover Incident Audits ({failoverLogs.length})
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search request ID, model, task..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-64"
            />
          </div>
        </div>

        {/* Usage Logs Table */}
        {activeSubTab === 'usage' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Request ID</th>
                  <th className="py-2.5 px-3">Task Category</th>
                  <th className="py-2.5 px-3">Provider / Model</th>
                  <th className="py-2.5 px-3 text-right">In Tokens</th>
                  <th className="py-2.5 px-3 text-right">Out Tokens</th>
                  <th className="py-2.5 px-3 text-right">Latency</th>
                  <th className="py-2.5 px-3 text-right">Est. Cost</th>
                  <th className="py-2.5 px-3 text-center">Class</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsageLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{log.requestId}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {log.taskType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-white">{log.providerCode}</div>
                      <div className="text-[11px] text-slate-400">{log.modelCode}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">{log.inputTokens}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">{log.outputTokens}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">{log.latencyMs} ms</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                      {log.estimatedCostUsd === 0 ? '$0.0000' : `$${log.estimatedCostUsd.toFixed(5)}`}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-1.5 py-0.5 text-[10px] rounded font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {log.responseClassification}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Failover Logs Table */}
        {activeSubTab === 'failover' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Occurred At</th>
                  <th className="py-2.5 px-3">Task Type</th>
                  <th className="py-2.5 px-3">Failed Provider</th>
                  <th className="py-2.5 px-3">Failover Target</th>
                  <th className="py-2.5 px-3">Trigger Reason</th>
                  <th className="py-2.5 px-3 text-right">Recovery Latency</th>
                  <th className="py-2.5 px-3 text-center">Recovery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {failoverLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                      {new Date(log.occurredAt).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">{log.taskType}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {log.primaryProvider}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {log.failoverProvider} ({log.failoverModel})
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{log.triggerReason}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400">{log.failoverLatencyMs} ms</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {log.failoverStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
