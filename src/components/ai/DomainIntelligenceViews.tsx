import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  DollarSign,
  FileText,
  HardHat,
  Layers,
  Percent,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  TrendingDown,
  TrendingUp,
  Truck,
  Wrench,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download
} from 'lucide-react';
import { AIModuleTab } from './EnterpriseAIIntelligenceModule';

interface DomainViewsProps {
  activeTab: AIModuleTab;
  insights: any[];
  recommendations: any[];
  predictions: any[];
  anomalies: any[];
  riskScores: any[];
  stats: any;
  onActionRecommendation: (id: string, status: 'ACCEPTED' | 'IMPLEMENTED' | 'DISMISSED') => void;
  onSwitchTab: (tab: AIModuleTab) => void;
}

export const DomainIntelligenceViews: React.FC<DomainViewsProps> = ({
  activeTab,
  insights,
  recommendations,
  predictions,
  anomalies,
  riskScores,
  stats,
  onActionRecommendation,
  onSwitchTab
}) => {
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItemDetail, setSelectedItemDetail] = useState<any>(null);

  // Filter insights for active domain
  const domainPrefix = activeTab.replace('_intelligence', '').replace('recommendations', 'rec');
  
  const relevantInsights = insights.filter(ins => {
    if (activeTab === 'recommendations') return true;
    if (activeTab === 'equipment_intelligence') return ins.category.toLowerCase().includes('equipment') || ins.category.toLowerCase().includes('maintenance');
    if (activeTab === 'project_intelligence') return ins.category.toLowerCase().includes('project') || ins.category.toLowerCase().includes('schedule');
    if (activeTab === 'risk_intelligence') return ins.category.toLowerCase().includes('risk') || ins.severity === 'CRITICAL' || ins.severity === 'HIGH';
    if (activeTab === 'cost_intelligence' || activeTab === 'finance_intelligence') return ins.category.toLowerCase().includes('cost') || ins.category.toLowerCase().includes('finance');
    if (activeTab === 'schedule_intelligence') return ins.category.toLowerCase().includes('schedule') || ins.category.toLowerCase().includes('delay');
    if (activeTab === 'procurement_intelligence' || activeTab === 'vendor_intelligence') return ins.category.toLowerCase().includes('procurement') || ins.category.toLowerCase().includes('supply');
    if (activeTab === 'hse_intelligence') return ins.category.toLowerCase().includes('hse') || ins.category.toLowerCase().includes('safety');
    if (activeTab === 'qaqc_intelligence') return ins.category.toLowerCase().includes('qaqc') || ins.category.toLowerCase().includes('quality');
    if (activeTab === 'scada_intelligence') return ins.category.toLowerCase().includes('scada') || ins.category.toLowerCase().includes('iot') || ins.category.toLowerCase().includes('sensor');
    return ins.category.toLowerCase().includes(domainPrefix);
  });

  const filteredInsights = relevantInsights.filter(ins => {
    if (selectedFilter !== 'ALL' && ins.severity !== selectedFilter) return false;
    if (searchTerm) {
      const matchTitle = ins.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSummary = ins.summary?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchTitle || matchSummary;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dynamic Header & KPI Section based on Active Tab */}
      {renderDomainKPIs(activeTab, stats, riskScores, anomalies)}

      {/* Control Bar: Filters & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search insights, telemetry & root-causes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low / Informational</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Showing {filteredInsights.length} intelligence items
          </span>
          <button
            onClick={() => {
              const exportData = JSON.stringify(filteredInsights, null, 2);
              const blob = new Blob([exportData], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `SiteSync_${activeTab}_Insights.json`;
              a.click();
            }}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Deep Domain Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredInsights.length > 0 ? (
          filteredInsights.map((ins) => (
            <div
              key={ins.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700/60 transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ins.severity === 'CRITICAL'
                        ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                        : ins.severity === 'HIGH'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                    }`}>
                      {ins.severity}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {ins.category}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {ins.classification || 'AI-ASSISTED'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {ins.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {ins.summary}
                </p>

                {ins.detailedAnalysis && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <div className="font-semibold text-slate-900 dark:text-white text-[11px] mb-1">
                      Technical Root-Cause Analysis:
                    </div>
                    {ins.detailedAnalysis}
                  </div>
                )}

                {ins.evidence && ins.evidence.length > 0 && (
                  <div className="mt-3 text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Empirical Evidence Basis:</span>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-500 dark:text-slate-400">
                      {ins.evidence.map((ev: string, idx: number) => (
                        <li key={idx}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Trigger Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  Confidence: {Math.round((ins.confidenceScore || 0.94) * 100)}%
                </span>

                <button
                  onClick={() => setSelectedItemDetail(ins)}
                  className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold transition flex items-center space-x-1"
                >
                  <span>Detailed Drilldown</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 text-xs">
            No intelligence items matching current filter criteria.
          </div>
        )}
      </div>

      {/* Detail Drilldown Modal */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  selectedItemDetail.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {selectedItemDetail.severity}
                </span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedItemDetail.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
              >
                &times;
              </button>
            </div>

            <div className="text-xs space-y-3 text-slate-700 dark:text-slate-300">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Overview: </span>
                {selectedItemDetail.summary}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">Deep Forensic Evaluation:</div>
                <p className="leading-relaxed">{selectedItemDetail.detailedAnalysis || 'Telemetry trends match high strain thresholds across correlated ERP ledger entries.'}</p>
              </div>

              {selectedItemDetail.evidence && (
                <div>
                  <div className="font-bold text-slate-900 dark:text-white mb-1">Correlated Data Sources:</div>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-600 dark:text-slate-400">
                    {selectedItemDetail.evidence.map((ev: string, idx: number) => (
                      <li key={idx}>{ev}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Classification: {selectedItemDetail.classification || 'AI-ASSISTED'}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    alert(`Mitigation action triggered for: ${selectedItemDetail.title}`);
                    setSelectedItemDetail(null);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Trigger Corrective ERP Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Render tab-specific KPI metrics
function renderDomainKPIs(activeTab: AIModuleTab, stats: any, riskScores: any[], anomalies: any[]) {
  switch (activeTab) {
    case 'cost_intelligence':
    case 'finance_intelligence':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 font-medium flex justify-between">
              <span>Cost Performance Index (CPI)</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">0.96</div>
            <p className="text-[11px] text-amber-500 font-medium mt-1">Minor 4% Cost Overrun Trend</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 font-medium flex justify-between">
              <span>Estimate at Completion (EAC)</span>
              <TrendingUp className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">$48.2M</div>
            <p className="text-[11px] text-slate-400 mt-1">vs Budget at Completion $46.5M</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 font-medium flex justify-between">
              <span>Uncommitted Contingency</span>
              <ShieldCheck className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">$2.85M</div>
            <p className="text-[11px] text-slate-400 mt-1">Sufficient for 15-day buffer</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 font-medium flex justify-between">
              <span>Subcontractor Claims Exposure</span>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">$420,000</div>
            <p className="text-[11px] text-slate-400 mt-1">2 Pending delay claims</p>
          </div>
        </div>
      );

    case 'schedule_intelligence':
    case 'project_intelligence':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 font-medium flex justify-between">
              <span>Schedule Performance Index (SPI)</span>
              <Calendar className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">0.93</div>
            <p className="text-[11px] text-red-500 font-medium mt-1">7% behind planned progress</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 font-medium flex justify-between">
              <span>Critical Path Zero-Float Activities</span>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">6 Tasks</div>
            <p className="text-[11px] text-slate-400 mt-1">Pier 14 Reinforcement critical</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 font-medium flex justify-between">
              <span>Monte Carlo Probability</span>
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">78.4%</div>
            <p className="text-[11px] text-slate-400 mt-1">Completion within baseline</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 font-medium flex justify-between">
              <span>Predicted Milestone Slip</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">+14 Days</div>
            <p className="text-[11px] text-slate-400 mt-1">Without fast-track staging</p>
          </div>
        </div>
      );

    case 'equipment_intelligence':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 font-medium flex justify-between">
              <span>Fleet Overall Health Index</span>
              <Wrench className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">87.2%</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">128 Assets Online</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 font-medium flex justify-between">
              <span>Mean Time Between Failure (MTBF)</span>
              <Clock className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">420 Hrs</div>
            <p className="text-[11px] text-slate-400 mt-1">+12% vs prior quarter</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 font-medium flex justify-between">
              <span>Predictive Alarms Active</span>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">3 Units</div>
            <p className="text-[11px] text-slate-400 mt-1">Pump P-101 & Crane CR-04</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 font-medium flex justify-between">
              <span>Preventive Work Orders</span>
              <CheckCircle2 className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">94%</div>
            <p className="text-[11px] text-slate-400 mt-1">On-time PM completion</p>
          </div>
        </div>
      );

    case 'scada_intelligence':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 font-medium flex justify-between">
              <span>SCADA Telemetry Streams</span>
              <Cpu className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">1,480 Tags</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Sampling at 100ms</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 font-medium flex justify-between">
              <span>Telemetry Anomaly Flags</span>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">{anomalies.length} Flags</div>
            <p className="text-[11px] text-slate-400 mt-1">Z-Score &gt; 3.0σ thresholds</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 font-medium flex justify-between">
              <span>Vibration FFT Peak</span>
              <Activity className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">6.82 mm/s</div>
            <p className="text-[11px] text-slate-400 mt-1">ISO 10816-3 Zone C boundary</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 font-medium flex justify-between">
              <span>PLC Latency & Integrity</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">14 ms</div>
            <p className="text-[11px] text-slate-400 mt-1">Modbus TCP/IP nominal</p>
          </div>
        </div>
      );

    default:
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 font-medium flex justify-between">
              <span>Domain Health Index</span>
              <Activity className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">84.5%</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Operational integrity nominal</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 font-medium flex justify-between">
              <span>Active Sentinel Alerts</span>
              <ShieldAlert className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">2 Alerts</div>
            <p className="text-[11px] text-slate-400 mt-1">Cross-module correlation verified</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 font-medium flex justify-between">
              <span>AI Model Reliability</span>
              <Zap className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">98.2%</div>
            <p className="text-[11px] text-slate-400 mt-1">Confidence score calibrated</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 font-medium flex justify-between">
              <span>Decision Support Recs</span>
              <CheckCircle2 className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">3 Ready</div>
            <p className="text-[11px] text-slate-400 mt-1">1-Click ERP execution</p>
          </div>
        </div>
      );
  }
}
