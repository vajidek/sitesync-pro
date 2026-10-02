import React, { useState, useEffect } from 'react';
import {
  GitFork,
  ArrowRight,
  Shield,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Sliders,
} from 'lucide-react';

export const TaskRoutingPoliciesTab: React.FC = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const [pRes, mRes] = await Promise.all([
          fetch('/api/ai-gateway/policies'),
          fetch('/api/ai-gateway/models'),
        ]);
        const pJson = await pRes.json();
        const mJson = await mRes.json();

        if (pJson.success) {
          setPolicies(pJson.data);
          if (pJson.data.length > 0) {
            setSelectedPolicy(pJson.data[0]);
          }
        }
        if (mJson.success) {
          setModels(mJson.data);
        }
      } catch (e) {
        console.error('Failed to load policies:', e);
      }
    };
    fetchPolicies();
  }, []);

  const handleSavePolicy = async () => {
    if (!selectedPolicy) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/ai-gateway/policies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedPolicy),
      });
      const json = await res.json();
      if (json.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Failed to save policy:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6" id="ai-task-routing-policies">
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <GitFork className="w-5 h-5 text-indigo-400" />
              Dynamic Task-Based AI Routing Policies & Fallback Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Configures task-to-model dispatching, SLA-based failover chains, and role-based data governance policies.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Total Active Policies:</span>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {policies.length}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Policy Grid */}
        <div className="lg:col-span-2 space-y-3">
          <div className="space-y-2.5">
            {policies.map(policy => {
              const isSelected = selectedPolicy?.taskType === policy.taskType;
              return (
                <div
                  key={policy.taskType}
                  onClick={() => setSelectedPolicy(policy)}
                  className={`cursor-pointer rounded-xl p-4 border transition duration-150 relative ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/50 shadow-md shadow-indigo-950/40'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-indigo-300 border border-slate-700">
                          {policy.taskType}
                        </span>
                        {policy.requiresDeterministic && (
                          <span className="px-1.5 py-0.2 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded">
                            Deterministic Backup
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Route Chain Indicator */}
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <div className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-indigo-300 font-medium">
                        {policy.primaryProvider} ({policy.primaryModel})
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      <div className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-cyan-300 font-medium">
                        {policy.fallbackProvider} ({policy.fallbackModel})
                      </div>
                      {policy.requiresDeterministic && (
                        <>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                          <div className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-emerald-300 font-medium">
                            DETERMINISTIC
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Policy Editor Panel */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur h-fit space-y-4">
          {selectedPolicy ? (
            <>
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Policy Configuration</span>
                <h3 className="text-base font-bold text-white mt-1">{selectedPolicy.taskType}</h3>
              </div>

              <div className="space-y-4 text-xs">
                {/* Primary Provider */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Primary Route Provider</label>
                  <select
                    value={selectedPolicy.primaryProvider}
                    onChange={e => setSelectedPolicy({ ...selectedPolicy, primaryProvider: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="GEMINI">Google Gemini Enterprise</option>
                    <option value="OPENAI">OpenAI Enterprise</option>
                    <option value="LOCAL_DETERMINISTIC">Local Deterministic Engine</option>
                  </select>
                </div>

                {/* Primary Model */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Primary Model Selection</label>
                  <select
                    value={selectedPolicy.primaryModel}
                    onChange={e => setSelectedPolicy({ ...selectedPolicy, primaryModel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {models.map(m => (
                      <option key={m.modelCode} value={m.modelCode}>
                        {m.displayName} ({m.modelCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fallback Provider */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Secondary Fallback Provider</label>
                  <select
                    value={selectedPolicy.fallbackProvider}
                    onChange={e => setSelectedPolicy({ ...selectedPolicy, fallbackProvider: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="OPENAI">OpenAI Enterprise</option>
                    <option value="GEMINI">Google Gemini Enterprise</option>
                    <option value="LOCAL_DETERMINISTIC">Local Deterministic Engine</option>
                  </select>
                </div>

                {/* Fallback Model */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Secondary Fallback Model</label>
                  <select
                    value={selectedPolicy.fallbackModel}
                    onChange={e => setSelectedPolicy({ ...selectedPolicy, fallbackModel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {models.map(m => (
                      <option key={m.modelCode} value={m.modelCode}>
                        {m.displayName} ({m.modelCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Deterministic Backup */}
                <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                  <div>
                    <span className="font-semibold text-slate-200 block">Enforce Deterministic Terminal Backup</span>
                    <span className="text-[11px] text-slate-500">Guarantees zero downtime if cloud LLMs are unreachable</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedPolicy.requiresDeterministic}
                    onChange={e => setSelectedPolicy({ ...selectedPolicy, requiresDeterministic: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSavePolicy}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-md shadow-indigo-600/30 text-xs"
                >
                  {isSaving ? (
                    <span>Applying Policy...</span>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Policy Saved & Synced!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Update Routing Policy</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">Select a policy to edit routing parameters</div>
          )}
        </div>
      </div>
    </div>
  );
};
