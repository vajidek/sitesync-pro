import React, { useState } from 'react';
import {
  ShieldAlert,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Radio,
  RotateCcw,
  Zap,
  Cpu,
  Server,
  ArrowRight,
} from 'lucide-react';

export const FailoverChaosLabTab: React.FC = () => {
  const [providerToFail, setProviderToFail] = useState<'GEMINI' | 'OPENAI'>('GEMINI');
  const [taskType, setTaskType] = useState('COPILOT');
  const [testPrompt, setTestPrompt] = useState(
    'Simulate critical path risk analysis for viaduct span pier 14 slipform assembly with 0 float.'
  );
  const [isInjecting, setIsInjecting] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);

  const handleRunChaosTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInjecting(true);
    setSimulationResult(null);

    try {
      const res = await fetch('/api/ai-gateway/simulate-failover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerToFail,
          taskType,
          testPrompt,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSimulationResult(json.data);
      }
    } catch (err) {
      console.error('Chaos simulation failed:', err);
    } finally {
      setIsInjecting(false);
    }
  };

  return (
    <div className="space-y-6" id="ai-failover-chaos-lab">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-rose-950/40 via-slate-900/80 to-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-400" />
              Gateway Failover & Chaos Resilience Simulator
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Simulate cloud provider outages, API rate limits, or network timeouts to verify real-time circuit breaker tripping and zero-downtime deterministic recovery.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Chaos Lab Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulation Injection Form */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Chaos Fault Injection Controls
          </h3>

          <form onSubmit={handleRunChaosTest} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Target Provider to Sabotage</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setProviderToFail('GEMINI')}
                  className={`p-3 rounded-lg border text-left transition ${
                    providerToFail === 'GEMINI'
                      ? 'bg-indigo-950/40 border-indigo-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-sm text-indigo-400">Google Gemini API</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Inject API 500 / Network Latency Spike</div>
                </button>

                <button
                  type="button"
                  onClick={() => setProviderToFail('OPENAI')}
                  className={`p-3 rounded-lg border text-left transition ${
                    providerToFail === 'OPENAI'
                      ? 'bg-cyan-950/40 border-cyan-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-sm text-cyan-400">OpenAI API</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Inject Rate Limit (429) / Circuit Trip</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Target ERP Task Category</label>
              <select
                value={taskType}
                onChange={e => setTaskType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="COPILOT">COPILOT (AI Assistant Queries)</option>
                <option value="TECHNICAL_ANALYSIS">TECHNICAL_ANALYSIS (EVM / CPM Delays)</option>
                <option value="REPORT_GENERATION">REPORT_GENERATION (Site Progress Reports)</option>
                <option value="PREDICTION">PREDICTION (Asset Vibration Anomaly)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Test Prompt for Reroute Verification</label>
              <textarea
                rows={3}
                value={testPrompt}
                onChange={e => setTestPrompt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isInjecting}
              className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-md shadow-rose-600/30 text-xs"
            >
              {isInjecting ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Executing Chaos Test & Failover Chain...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4" />
                  <span>Inject Fault & Test Failover Chain</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Real-time Failover Output Display */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            Failover Execution Telemetry
          </h3>

          {simulationResult ? (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300">
                <span className="font-bold block">✓ Zero-Downtime SLA Preservation</span>
                {simulationResult.simulationMessage}
              </div>

              {/* Reroute path */}
              <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 space-y-3 font-mono">
                <div className="text-slate-400 flex items-center justify-between">
                  <span>Simulated Failure:</span>
                  <span className="text-rose-400 font-bold">{providerToFail} (TRIPPED)</span>
                </div>
                <div className="text-slate-400 flex items-center justify-between">
                  <span>Recovered By Provider:</span>
                  <span className="text-cyan-400 font-bold">{simulationResult.result.providerUsed}</span>
                </div>
                <div className="text-slate-400 flex items-center justify-between">
                  <span>Model Executed:</span>
                  <span className="text-white font-bold">{simulationResult.result.modelUsed}</span>
                </div>
                <div className="text-slate-400 flex items-center justify-between">
                  <span>Response Classification:</span>
                  <span className="text-indigo-300 font-bold">{simulationResult.result.responseClassification}</span>
                </div>
                <div className="text-slate-400 flex items-center justify-between">
                  <span>Total Latency:</span>
                  <span className="text-emerald-400 font-bold">{simulationResult.result.latencyMs} ms</span>
                </div>
              </div>

              {/* Returned response */}
              <div>
                <span className="text-slate-400 font-semibold block mb-1">Generated Output:</span>
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-slate-200 font-sans text-xs max-h-48 overflow-y-auto leading-relaxed">
                  {simulationResult.result.text}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500 text-xs">
              Configure parameters and click "Inject Fault" to observe automated gateway rerouting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
