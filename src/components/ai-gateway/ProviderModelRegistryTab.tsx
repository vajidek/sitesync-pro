import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Shield,
  Zap,
  Info,
  Sliders,
  ExternalLink,
} from 'lucide-react';

export const ProviderModelRegistryTab: React.FC = () => {
  const [models, setModels] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRegistry = async () => {
      try {
        const [modelsRes, provRes] = await Promise.all([
          fetch('/api/ai-gateway/models'),
          fetch('/api/ai-gateway/providers'),
        ]);
        const mJson = await modelsRes.json();
        const pJson = await provRes.json();

        if (mJson.success) {
          setModels(mJson.data);
          if (mJson.data.length > 0) {
            setSelectedModel(mJson.data[0]);
          }
        }
        if (pJson.success) {
          setProviders(pJson.data);
        }
      } catch (e) {
        console.error('Failed to load registry:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRegistry();
  }, []);

  return (
    <div className="space-y-6" id="ai-provider-model-registry">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              Multi-Model AI Provider & Foundation Model Catalog
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Enterprise registry mapping Google Gemini, OpenAI, and Local Deterministic mathematical engines with transparent pricing, context windows, and quality benchmarks.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300">
              <span className="text-slate-500 mr-1.5">Registered Models:</span>
              <span className="font-bold text-white">{models.length}</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300">
              <span className="text-slate-500 mr-1.5">Live Providers:</span>
              <span className="font-bold text-emerald-400">{providers.length} Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model List */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Registered Models & Engines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {models.map(model => {
              const isSelected = selectedModel?.modelCode === model.modelCode;
              return (
                <div
                  key={model.modelCode}
                  onClick={() => setSelectedModel(model)}
                  className={`cursor-pointer rounded-xl p-4 border transition duration-150 relative ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-950/30'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${
                        model.providerCode === 'GEMINI' ? 'text-indigo-400' : model.providerCode === 'OPENAI' ? 'text-cyan-400' : 'text-emerald-400'
                      }`}>
                        {model.providerCode}
                      </span>
                      <h4 className="text-sm font-semibold text-white mt-0.5">{model.displayName}</h4>
                    </div>
                    {model.isDefault && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs border-t border-slate-800/60 pt-3">
                    <div>
                      <span className="text-[11px] text-slate-500">Latency:</span>
                      <p className="font-semibold text-slate-200 mt-0.5">{model.latencyAverageMs} ms</p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500">Context:</span>
                      <p className="font-semibold text-slate-200 mt-0.5">{(model.contextWindowTokens / 1000).toFixed(0)}k tok</p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500">Input Cost:</span>
                      <p className="font-semibold text-emerald-400 mt-0.5">
                        {model.pricing.costPer1kInputTokensUsd === 0 ? 'Free' : `$${model.pricing.costPer1kInputTokensUsd}/1k`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {model.recommendedTasks?.slice(0, 3).map((task: string) => (
                      <span key={task} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700/60">
                        {task}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Model Deep-Dive Detail Panel */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur h-fit space-y-4">
          {selectedModel ? (
            <>
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{selectedModel.providerCode} MODEL SPEC</span>
                <h3 className="text-base font-bold text-white mt-1">{selectedModel.displayName}</h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">{selectedModel.modelCode}</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Architecture Archetype</span>
                  <span className="font-semibold text-slate-200">{selectedModel.modelType}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Context Window</span>
                  <span className="font-semibold text-slate-200">{selectedModel.contextWindowTokens.toLocaleString()} tokens</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Max Generation Limit</span>
                  <span className="font-semibold text-slate-200">{selectedModel.maxOutputTokens.toLocaleString()} tokens</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Structured JSON Schema</span>
                  <span className={`font-semibold ${selectedModel.supportsStructuredOutput ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {selectedModel.supportsStructuredOutput ? 'Supported (Guaranteed)' : 'Not Supported'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Function Calling Tools</span>
                  <span className={`font-semibold ${selectedModel.supportsFunctionCalling ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {selectedModel.supportsFunctionCalling ? 'Supported' : 'Not Supported'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Multi-Modal Vision & PDF</span>
                  <span className={`font-semibold ${selectedModel.supportsVision ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {selectedModel.supportsVision ? 'Supported' : 'Text Only'}
                  </span>
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-2 text-xs">
                <span className="font-semibold text-slate-300 block">Unit Cost Schedule</span>
                <div className="flex justify-between text-slate-400">
                  <span>Input (Prompt):</span>
                  <span className="font-mono text-slate-200">
                    {selectedModel.pricing.costPer1kInputTokensUsd === 0 ? '$0.00' : `$${selectedModel.pricing.costPer1kInputTokensUsd} / 1k tok`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Output (Completion):</span>
                  <span className="font-mono text-slate-200">
                    {selectedModel.pricing.costPer1kOutputTokensUsd === 0 ? '$0.00' : `$${selectedModel.pricing.costPer1kOutputTokensUsd} / 1k tok`}
                  </span>
                </div>
              </div>

              {/* Recommended Tasks */}
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1.5">Optimized ERP Tasks</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedModel.recommendedTasks?.map((task: string) => (
                    <span key={task} className="px-2 py-1 rounded text-[11px] font-medium bg-slate-800 text-indigo-300 border border-slate-700">
                      {task}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">Select a model to view full specification</div>
          )}
        </div>
      </div>
    </div>
  );
};
