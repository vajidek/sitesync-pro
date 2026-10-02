import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  Bot,
  Activity,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  Zap,
  Sliders,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  Send,
  RefreshCw,
  Eye,
  Settings,
  Layers,
  BarChart3,
  DollarSign,
  Calendar,
  Truck,
  HardHat,
  Cpu,
  Database,
  ThumbsUp,
  ThumbsDown,
  Info,
  ChevronRight,
  ShieldAlert,
  Wrench,
  Flame,
  Check
} from 'lucide-react';
import { safeJson } from '../../lib/safeFetch';
import { useShell } from '../layout/ShellContext';
import { DomainIntelligenceViews } from './DomainIntelligenceViews';
import { EnterpriseAIGatewayModule } from '../ai-gateway/EnterpriseAIGatewayModule';

export type AIModuleTab =
  | 'command_center'
  | 'gateway'
  | 'copilot'
  | 'project_intelligence'
  | 'risk_intelligence'
  | 'cost_intelligence'
  | 'schedule_intelligence'
  | 'procurement_intelligence'
  | 'vendor_intelligence'
  | 'equipment_intelligence'
  | 'hse_intelligence'
  | 'qaqc_intelligence'
  | 'finance_intelligence'
  | 'workforce_intelligence'
  | 'scada_intelligence'
  | 'anomalies'
  | 'recommendations'
  | 'scenarios'
  | 'reports'
  | 'audit';

interface CopilotMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  classification?: string;
  confidence?: number;
  modelUsed?: string;
  timestamp: string;
  suggestions?: string[];
  evidence?: string[];
}

export const EnterpriseAIIntelligenceModule: React.FC = () => {
  const { currentCompany } = useShell();
  const [activeTab, setActiveTab] = useState<AIModuleTab>('command_center');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [riskScores, setRiskScores] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);

  // Copilot State
  const [chatMessages, setChatMessages] = useState<CopilotMessage[]>([
    {
      id: 'init-msg',
      sender: 'ai',
      text: 'Welcome to SiteSync Pro Executive AI Intelligence. I have synthesized live data from Phases 1-72 (Project Controls, Finance, Procurement, EAM, SCADA, HSE, and QA/QC). How can I support your operational decisions today?',
      classification: 'AI-ASSISTED',
      confidence: 0.98,
      modelUsed: 'gemini-3.6-flash',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'Analyze cost variance for Metro Line 4',
        'Review cavitation warning on Intake Pump P-101',
        'Check rebar delivery delay on HSR Viaduct',
        'Run 15-day procurement delay what-if simulation'
      ]
    }
  ]);
  const [copilotInput, setCopilotInput] = useState('');
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);

  // NLP Search State
  const [nlpQuery, setNlpQuery] = useState('');
  const [nlpResult, setNlpResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Scenario Simulator State
  const [simProject, setSimProject] = useState('proj-hsr-002');
  const [simTitle, setSimTitle] = useState('Critical Path Lead-Time Extension');
  const [procDelay, setProcDelay] = useState(15);
  const [prodShift, setProdShift] = useState(-5);
  const [eqDowntime, setEqDowntime] = useState(10);
  const [matCostShift, setMatCostShift] = useState(8);
  const [actSlip, setActSlip] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeSimResult, setActiveSimResult] = useState<any>(null);

  // Report Generator State
  const [selectedReportType, setSelectedReportType] = useState('DAILY_PROJECT_BRIEF');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [previewReport, setPreviewReport] = useState<any>(null);

  // Fetch initial enterprise data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        insRes,
        recsRes,
        predsRes,
        anomsRes,
        risksRes,
        scensRes,
        repsRes,
        auditsRes,
        provsRes
      ] = await Promise.all([
        fetch('/api/ai-intelligence/stats').then(safeJson),
        fetch('/api/ai-intelligence/insights').then(safeJson),
        fetch('/api/ai-intelligence/recommendations').then(safeJson),
        fetch('/api/ai-intelligence/predictions').then(safeJson),
        fetch('/api/ai-intelligence/anomalies').then(safeJson),
        fetch('/api/ai-intelligence/risk-scores').then(safeJson),
        fetch('/api/ai-intelligence/scenarios').then(safeJson),
        fetch('/api/ai-intelligence/reports').then(safeJson),
        fetch('/api/ai-intelligence/audit-logs').then(safeJson),
        fetch('/api/ai-intelligence/providers').then(safeJson)
      ]);

      if (statsRes?.data) setStats(statsRes.data);
      if (insRes?.data) setInsights(insRes.data);
      if (recsRes?.data) setRecommendations(recsRes.data);
      if (predsRes?.data) setPredictions(predsRes.data);
      if (anomsRes?.data) setAnomalies(anomsRes.data);
      if (risksRes?.data) setRiskScores(risksRes.data);
      if (scensRes?.data) {
        setScenarios(scensRes.data);
        if (scensRes.data.length > 0) setActiveSimResult(scensRes.data[0]);
      }
      if (repsRes?.data) {
        setReports(repsRes.data);
        if (repsRes.data.length > 0) setPreviewReport(repsRes.data[0]);
      }
      if (auditsRes?.data) setAuditLogs(auditsRes.data);
      if (provsRes?.data) setProviders(provsRes.data);
    } catch (err) {
      console.error('Error fetching AI Intelligence data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Copilot Send
  const handleSendCopilot = async (text?: string) => {
    const messageToSend = text || copilotInput;
    if (!messageToSend.trim() || isCopilotThinking) return;

    const userMsg: CopilotMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: messageToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!text) setCopilotInput('');
    setIsCopilotThinking(true);

    try {
      const res = await fetch('/api/ai-intelligence/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend }),
      });
      const data = await safeJson(res);

      if (data?.data) {
        const aiMsg: CopilotMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.data.reply || 'Analysis complete.',
          classification: data.data.classification || 'AI-ASSISTED',
          confidence: data.data.confidence || 0.95,
          modelUsed: data.data.modelUsed || 'gemini-3.6-flash',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: data.data.suggestions,
          evidence: data.data.evidence,
        };
        setChatMessages(prev => [...prev, aiMsg]);
      }
    } catch (e) {
      setChatMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: 'AI Service currently operating in offline deterministic mode.',
          classification: 'RULE-BASED',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsCopilotThinking(false);
    }
  };

  // Handle NLP Search
  const handleNLPSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlpQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch('/api/ai-intelligence/nlp-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: nlpQuery }),
      });
      const data = await safeJson(res);
      if (data?.data) {
        setNlpResult(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  // Run What-If Simulation
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/ai-intelligence/scenarios/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: simTitle,
          projectId: simProject,
          simulationParameters: {
            procurementDelayDays: procDelay,
            productivityShiftPct: prodShift,
            equipmentDowntimeShiftPct: eqDowntime,
            materialCostShiftPct: matCostShift,
            activitySlipDays: actSlip,
          }
        }),
      });
      const data = await safeJson(res);
      if (data?.data) {
        setActiveSimResult(data.data);
        setScenarios(prev => [data.data, ...prev]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Action Recommendation
  const handleRecommendationAction = async (id: string, status: 'ACCEPTED' | 'IMPLEMENTED' | 'DISMISSED') => {
    try {
      const res = await fetch(`/api/ai-intelligence/recommendations/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, actionNotes: `Marked as ${status} from Enterprise AI Command Center.` }),
      });
      const data = await safeJson(res);
      if (data?.data) {
        setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Generate Report
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const res = await fetch('/api/ai-intelligence/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: selectedReportType,
          audience: 'EXECUTIVE',
        }),
      });
      const data = await safeJson(res);
      if (data?.data) {
        setPreviewReport(data.data);
        setReports(prev => [data.data, ...prev]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const navTabs: { key: AIModuleTab; label: string; icon: any; badge?: number }[] = [
    { key: 'command_center', label: 'AI Command Center', icon: Brain },
    { key: 'gateway', label: 'Multi-Model AI Gateway', icon: Cpu, badge: 74 },
    { key: 'copilot', label: 'AI Executive Copilot', icon: Bot },
    { key: 'project_intelligence', label: 'Project Intelligence', icon: Activity },
    { key: 'risk_intelligence', label: 'Risk Intelligence', icon: ShieldAlert },
    { key: 'cost_intelligence', label: 'Cost Intelligence', icon: DollarSign },
    { key: 'schedule_intelligence', label: 'Schedule Intelligence', icon: Calendar },
    { key: 'procurement_intelligence', label: 'Procurement Intelligence', icon: Truck },
    { key: 'equipment_intelligence', label: 'Equipment & EAM', icon: Wrench },
    { key: 'hse_intelligence', label: 'HSE Safety Intelligence', icon: HardHat },
    { key: 'qaqc_intelligence', label: 'QA/QC Quality Intelligence', icon: CheckCircle2 },
    { key: 'scada_intelligence', label: 'IoT / SCADA Sentinel', icon: Cpu },
    { key: 'anomalies', label: 'Anomaly Sentinel', icon: AlertTriangle, badge: stats?.activeAnomaliesCount },
    { key: 'recommendations', label: 'Actionable Recs', icon: Zap, badge: stats?.pendingRecommendationsCount },
    { key: 'scenarios', label: 'What-If Simulator', icon: Sliders },
    { key: 'reports', label: 'Executive AI Reports', icon: FileText },
    { key: 'audit', label: 'AI Governance & Audit', icon: ShieldCheck },
  ];

  return (
    <div id="enterprise-ai-intelligence-module" className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* Top Header Banner */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200 dark:border-indigo-800/40">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight">Enterprise AI Intelligence & Decision Support</h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Gemini 3.6 Flash + EVM Sentinel
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Consuming live transactional telemetry across Project Controls, Finance, Procurement, EAM, and SCADA.
              </p>
            </div>
          </div>

          {/* Quick NLP Query Bar */}
          <form onSubmit={handleNLPSearch} className="flex items-center space-x-2 w-full md:w-96">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="ai-quick-nlp-search"
                type="text"
                value={nlpQuery}
                onChange={(e) => setNlpQuery(e.target.value)}
                placeholder="Ask ERP: 'Why is pump P-101 vibrating?' or 'Show delay risks'..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              id="ai-quick-nlp-submit"
              type="submit"
              disabled={isSearching}
              className="px-3 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition flex items-center shrink-0"
            >
              {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Analyze'}
            </button>
          </form>
        </div>

        {/* NLP Search Result Card (if query active) */}
        {nlpResult && (
          <div className="mt-3 p-4 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl animate-fade-in text-xs">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2 font-semibold text-indigo-900 dark:text-indigo-200">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>NLP Query Result: &quot;{nlpResult.query}&quot;</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100">
                  {nlpResult.provenance}
                </span>
              </div>
              <button
                onClick={() => setNlpResult(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                &times;
              </button>
            </div>
            <p className="text-slate-700 dark:text-slate-300 mb-2 font-medium">{nlpResult.summaryText}</p>
            {nlpResult.structuredData && (
              <pre className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg text-[11px] font-mono text-slate-800 dark:text-slate-200 overflow-x-auto border border-indigo-100 dark:border-indigo-900">
                {JSON.stringify(nlpResult.structuredData, null, 2)}
              </pre>
            )}
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 italic">{nlpResult.disclaimer}</p>
          </div>
        )}

        {/* Tab Navigation Scrollbar */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none mt-4 pt-1 border-t border-slate-100 dark:border-slate-800/60">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                id={`ai-tab-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 ? (
                  <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white text-indigo-700' : 'bg-red-500 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main View Body */}
      <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* ========================================================= */}
        {/* 1. AI COMMAND CENTER */}
        {/* ========================================================= */}
        {activeTab === 'command_center' && (
          <div className="space-y-6">
            
            {/* Top KPI Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Enterprise Health Score */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                  <span>Enterprise Health Index</span>
                  <Activity className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {stats?.enterpriseHealthScore ?? 82.4}
                  </span>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">/ 100</span>
                </div>
                <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${stats?.enterpriseHealthScore ?? 82.4}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                  Calculated from EVM SPI/CPI, MTBF reliability & HSE ratings.
                </p>
              </div>

              {/* Composite Risk Score */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                  <span>Composite Risk Rating</span>
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                </div>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {stats?.overallRiskScore ?? 55}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    Moderate
                  </span>
                </div>
                <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${stats?.overallRiskScore ?? 55}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                  Driven by zero-float Pier 14 rebar staging & TBM grout variance.
                </p>
              </div>

              {/* Active Anomalies Sentinel */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                  <span>Telemetry Anomalies Logged</span>
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {stats?.activeAnomaliesCount ?? 4}
                  </span>
                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">1 Critical</span>
                </div>
                <div className="mt-2 flex items-center space-x-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>Pump P-101 Cavitation (6.82 mm/s RMS)</span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                  Z-score statistical engine continuous scan.
                </p>
              </div>

              {/* Actionable Recommendations */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                  <span>Actionable AI Directives</span>
                  <Zap className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {stats?.pendingRecommendationsCount ?? 3}
                  </span>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Pending Review</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-1">
                  Rebar yard transfer & Work Order dispatch ready.
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                  1-Click trigger into EAM & Procurement modules.
                </p>
              </div>

            </div>

            {/* Middle Section: Top Insights & Project Risk Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Top Operational Insights List (2 Cols) */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Priority AI Operational Insights
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400">Live Synthesis</span>
                </div>

                <div className="space-y-3">
                  {insights.slice(0, 4).map((ins) => (
                    <div
                      key={ins.id}
                      className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ins.severity === 'CRITICAL'
                              ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                              : ins.severity === 'HIGH'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                          }`}>
                            {ins.severity}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {ins.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {ins.classification}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {ins.summary}
                      </p>
                      {ins.evidence && ins.evidence.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Evidence Basis: </span>
                          {ins.evidence[0]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Risk Breakdown Matrix (1 Col) */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Cross-Project Risk Matrix
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400">4 Active Sites</span>
                </div>

                <div className="space-y-3">
                  {riskScores.map((proj) => (
                    <div key={proj.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-900 dark:text-slate-100 truncate pr-2">
                          {proj.projectName}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          proj.compositeRiskScore > 60
                            ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}>
                          {proj.compositeRiskScore}/100
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                        <div>Sched: <span className="font-semibold text-slate-700 dark:text-slate-300">{proj.scheduleRiskScore}</span></div>
                        <div>Cost: <span className="font-semibold text-slate-700 dark:text-slate-300">{proj.costRiskScore}</span></div>
                        <div>Asset: <span className="font-semibold text-slate-700 dark:text-slate-300">{proj.equipmentRiskScore}</span></div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setActiveTab('scenarios')}
                  className="w-full py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl border border-indigo-200 dark:border-indigo-800/50 transition flex items-center justify-center space-x-1"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Launch What-If Delay Simulator</span>
                </button>
              </div>

            </div>

            {/* Bottom Section: Quick Action Directives */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Actionable Decision Support Recommendations
                  </h2>
                </div>
                <span className="text-xs text-slate-400">Direct ERP Integration</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                          {rec.targetModule}
                        </span>
                        <span className={`text-[10px] font-bold ${
                          rec.priority === 'URGENT' ? 'text-red-500' : 'text-amber-500'
                        }`}>
                          {rec.priority} PRIORITY
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                        {rec.title}
                      </h3>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-3">
                        {rec.actionText}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {rec.status}
                      </span>
                      {rec.status === 'PENDING_REVIEW' && (
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => handleRecommendationAction(rec.id, 'ACCEPTED')}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-medium transition"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRecommendationAction(rec.id, 'DISMISSED')}
                            className="px-2 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-lg text-[10px] transition"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* MULTI-MODEL AI GATEWAY & INTEGRATION MESH */}
        {/* ========================================================= */}
        {activeTab === 'gateway' && (
          <div className="animate-fade-in">
            <EnterpriseAIGatewayModule />
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. AI EXECUTIVE COPILOT */}
        {/* ========================================================= */}
        {activeTab === 'copilot' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[720px] overflow-hidden">
            
            {/* Copilot Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-600 text-white rounded-xl">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">SiteSync Pro Executive Copilot</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Conversational reasoning across CPM Schedules, General Ledger, EAM, and SCADA Telemetry</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-medium">
                  {stats?.aiProviderStatus === 'LIVE_GEMINI_ACTIVE' ? 'Gemini 3.6 Flash Active' : 'Deterministic Mode'}
                </span>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-2xl rounded-2xl p-4 text-xs ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700/60'
                  }`}>
                    {msg.sender === 'ai' && (
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1.5 pb-1 border-b border-slate-200/60 dark:border-slate-700">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">SiteSync Intelligence Copilot</span>
                        <div className="flex items-center space-x-1.5 font-mono">
                          <span className="px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 rounded">{msg.classification || 'AI-ASSISTED'}</span>
                          <span>{msg.timestamp}</span>
                        </div>
                      </div>
                    )}
                    
                    <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>

                    {/* Evidence Tags */}
                    {msg.evidence && msg.evidence.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-[10px]">
                        <span className="font-bold text-slate-600 dark:text-slate-300">Data Basis: </span>
                        <ul className="list-disc pl-4 mt-0.5 space-y-0.5 text-slate-500 dark:text-slate-400">
                          {msg.evidence.map((ev, idx) => (
                            <li key={idx}>{ev}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggested Follow-Ups */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex flex-wrap gap-1.5">
                        {msg.suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendCopilot(sug)}
                            className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-700 transition text-[10px] font-medium text-left"
                          >
                            + {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isCopilotThinking && (
                <div className="flex justify-start">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-none text-xs text-slate-500 flex items-center space-x-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    <span>Analyzing multi-module ERP datasets...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center space-x-2">
                <input
                  id="ai-copilot-input"
                  type="text"
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendCopilot()}
                  placeholder="Ask a question about project health, schedule float, cost variances, or SCADA telemetry..."
                  className="flex-1 px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  id="ai-copilot-send"
                  onClick={() => handleSendCopilot()}
                  disabled={isCopilotThinking || !copilotInput.trim()}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* 3. WHAT-IF SCENARIO SIMULATOR */}
        {/* ========================================================= */}
        {activeTab === 'scenarios' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Simulation Parameter Controls */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Scenario Parameters</h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adjust project risk factors to compute deterministic schedule delay, cost overrun, and cash flow strain.
              </p>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Target Project</label>
                  <select
                    value={simProject}
                    onChange={(e) => setSimProject(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="proj-hsr-002">High-Speed Rail Viaduct Package 2</option>
                    <option value="proj-metro-003">Metro Line 4 Underground Tunnel Package</option>
                    <option value="proj-kwa-wtp-001">Peruvannamuzhi 100 MLD WTP</option>
                    <option value="proj-desal-004">Cochin 50 MLD Desalination Facility</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Scenario Title</label>
                  <input
                    type="text"
                    value={simTitle}
                    onChange={(e) => setSimTitle(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold">
                    <span>Procurement Lead-Time Delay:</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{procDelay} days</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={procDelay}
                    onChange={(e) => setProcDelay(Number(e.target.value))}
                    className="w-full mt-1 accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold">
                    <span>Labor Productivity Shift:</span>
                    <span className={prodShift < 0 ? 'text-red-500' : 'text-emerald-500'}>{prodShift}%</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    value={prodShift}
                    onChange={(e) => setProdShift(Number(e.target.value))}
                    className="w-full mt-1 accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold">
                    <span>Equipment Downtime Increase:</span>
                    <span className="text-amber-500">+{eqDowntime}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={eqDowntime}
                    onChange={(e) => setEqDowntime(Number(e.target.value))}
                    className="w-full mt-1 accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold">
                    <span>Material Price Inflation:</span>
                    <span className="text-red-500">+{matCostShift}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={matCostShift}
                    onChange={(e) => setMatCostShift(Number(e.target.value))}
                    className="w-full mt-1 accent-indigo-600"
                  />
                </div>

                <button
                  id="ai-run-simulation-btn"
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition flex items-center justify-center space-x-2"
                >
                  {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>Run Deterministic Simulation</span>
                </button>
              </div>
            </div>

            {/* Simulation Results Output */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Simulation Impact Projection</h2>
                </div>
                {activeSimResult && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    Computed: {new Date(activeSimResult.computedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>

              {activeSimResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="text-slate-400 text-[10px]">Net Schedule Delay</div>
                      <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
                        +{activeSimResult.scheduleImpactDays} Days
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="text-slate-400 text-[10px]">Projected Cost Variance</div>
                      <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                        +${activeSimResult.costImpactAmount.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="text-slate-400 text-[10px]">Risk Score Shift</div>
                      <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                        +{activeSimResult.riskScoreShift} pts
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <h3 className="font-bold text-slate-900 dark:text-white">AI Engineering Explanation:</h3>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {activeSimResult.aiExplanationText}
                    </p>
                  </div>

                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/40 space-y-2 text-xs">
                    <h3 className="font-bold text-emerald-900 dark:text-emerald-300">Recommended Mitigations:</h3>
                    <ul className="list-disc pl-4 space-y-1 text-emerald-800 dark:text-emerald-200">
                      {activeSimResult.mitigationRecommendations?.map((mit: string, idx: number) => (
                        <li key={idx}>{mit}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Adjust parameters on the left and click &quot;Run Deterministic Simulation&quot; to view impact.
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* 4. ANOMALIES SENTINEL */}
        {/* ========================================================= */}
        {activeTab === 'anomalies' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Continuous Anomaly Sentinel</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Statistical Z-Score & Moving Average telemetry deviation tracker</p>
              </div>
              <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-lg font-bold">
                {anomalies.length} Total Deviations Flagged
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2.5 px-3">Module</th>
                    <th className="py-2.5 px-3">Entity & Parameter</th>
                    <th className="py-2.5 px-3">Observed vs Expected</th>
                    <th className="py-2.5 px-3">Z-Score</th>
                    <th className="py-2.5 px-3">Severity</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {anomalies.map((anom) => (
                    <tr key={anom.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {anom.sourceModule}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">{anom.entityName}</div>
                        <div className="text-[11px] text-slate-400">{anom.parameterName}</div>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className="text-red-500 font-bold">{anom.observedValue}</span> / <span className="text-slate-400">{anom.expectedValue}</span> (+{anom.deviationPercent}%)
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {anom.zScore}σ
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          anom.severity === 'CRITICAL' ? 'bg-red-100 dark:bg-red-950 text-red-700' : 'bg-amber-100 dark:bg-amber-950 text-amber-700'
                        }`}>
                          {anom.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-600 dark:text-slate-300">
                        {anom.status}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => alert(`Recommended Engineering Action: ${anom.recommendedAction}`)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-lg text-[11px] font-medium transition"
                        >
                          View Action
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. EXECUTIVE AI REPORTS */}
        {/* ========================================================= */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Generate Controls */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Generate Executive Brief</h2>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Report Template</label>
                  <select
                    value={selectedReportType}
                    onChange={(e) => setSelectedReportType(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="DAILY_PROJECT_BRIEF">Daily Project AI Brief (All Sites)</option>
                    <option value="WEEKLY_MANAGEMENT_BRIEF">Weekly Management Synthesis</option>
                    <option value="MONTHLY_EXECUTIVE">Monthly Executive Portfolio Review</option>
                    <option value="RISK_INTELLIGENCE">Comprehensive Risk Exposure Matrix</option>
                    <option value="FINANCIAL_RISK">Financial Cost Variance & Claims Brief</option>
                    <option value="EQUIPMENT_HEALTH">EAM & Plant Telemetry Health Brief</option>
                  </select>
                </div>

                <button
                  id="ai-generate-report-btn"
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition flex items-center justify-center space-x-2"
                >
                  {isGeneratingReport ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  <span>Generate AI Brief</span>
                </button>
              </div>

              {/* Historical Reports Archive */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Recent Generated Briefs</h3>
                <div className="space-y-1.5">
                  {reports.map((rep) => (
                    <button
                      key={rep.id}
                      onClick={() => setPreviewReport(rep)}
                      className={`w-full text-left p-2 rounded-lg text-xs transition ${
                        previewReport?.id === rep.id
                          ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="truncate">{rep.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{rep.reportCode}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Report Preview */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              {previewReport ? (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{previewReport.title}</h2>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">Code: {previewReport.reportCode}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(previewReport.fullReportMarkdown);
                        alert('Report Markdown copied to clipboard.');
                      }}
                      className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg transition"
                    >
                      Copy Markdown
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs leading-relaxed space-y-3 font-sans">
                    <div className="font-bold text-slate-900 dark:text-white">Executive Summary:</div>
                    <p className="text-slate-700 dark:text-slate-300">{previewReport.executiveSummary}</p>
                    
                    <div className="font-bold text-slate-900 dark:text-white pt-2">Key Findings:</div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                      {previewReport.keyFindings?.map((kf: string, idx: number) => (
                        <li key={idx}>{kf}</li>
                      ))}
                    </ul>

                    <div className="font-bold text-slate-900 dark:text-white pt-2">Identified Risks:</div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                      {previewReport.identifiedRisks?.map((ir: string, idx: number) => (
                        <li key={idx}>{ir}</li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-[10px] text-slate-400 italic">
                    {previewReport.disclaimer}
                  </p>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 text-xs">
                  Select or generate an executive report to view contents.
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* 6. AI GOVERNANCE & AUDIT */}
        {/* ========================================================= */}
        {activeTab === 'audit' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">AI Governance, RBAC Isolation & Prompt Defense Audit</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Immutable trace of all AI inferences, data sources touched, and prompt injection defense interventions.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">User & Role</th>
                    <th className="py-2.5 px-3">Prompt Summary</th>
                    <th className="py-2.5 px-3">Data Sources</th>
                    <th className="py-2.5 px-3">Model</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="py-2.5 px-3 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="py-2.5 px-3 font-bold text-indigo-600 dark:text-indigo-400">{log.action}</td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{log.userRole}</td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 truncate max-w-xs font-sans">{log.promptSummary}</td>
                        <td className="py-2.5 px-3 text-slate-500">{log.dataSourcesAccessed?.join(', ') || 'N/A'}</td>
                        <td className="py-2.5 px-3 text-slate-400">{log.aiModelUsed}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.responseStatus === 'SUCCESS' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700' : 'bg-red-100 dark:bg-red-950 text-red-700'
                          }`}>
                            {log.responseStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                        AI Audit Logger active. Telemetry queries and Copilot actions will log here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Domain-Specific Deep Intelligence Views */}
        {['project_intelligence', 'risk_intelligence', 'cost_intelligence', 'schedule_intelligence', 'procurement_intelligence', 'vendor_intelligence', 'equipment_intelligence', 'hse_intelligence', 'qaqc_intelligence', 'finance_intelligence', 'workforce_intelligence', 'scada_intelligence', 'recommendations'].includes(activeTab) && (
          <DomainIntelligenceViews
            activeTab={activeTab}
            insights={insights}
            recommendations={recommendations}
            predictions={predictions}
            anomalies={anomalies}
            riskScores={riskScores}
            stats={stats}
            onActionRecommendation={handleRecommendationAction}
            onSwitchTab={setActiveTab}
          />
        )}

      </div>
    </div>
  );
};

export default EnterpriseAIIntelligenceModule;
