import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Award,
  AlertTriangle,
  FileText,
  Calendar,
  Sparkles,
  Download,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Briefcase,
  DollarSign,
  ShieldCheck,
  Truck,
  HardHat,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  Mail,
  Layers,
  Zap,
} from 'lucide-react';

export const EnterpriseAnalyticsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'role_dashboards' | 'kpi_matrix' | 'reports'>('overview');
  const [selectedRole, setSelectedRole] = useState<string>('CEO');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddWidgetModal, setShowAddWidgetModal] = useState<boolean>(false);
  const [showNewReportModal, setShowNewReportModal] = useState<boolean>(false);

  // Filter / KPI States
  const [widgets, setWidgets] = useState([
    { id: 'w1', title: 'Schedule Performance Index (SPI)', type: 'KPI', value: '0.96', trend: '+0.02 vs last month', status: 'HEALTHY' },
    { id: 'w2', title: 'Cost Performance Index (CPI)', type: 'KPI', value: '1.04', trend: '+0.01 vs last month', status: 'EXCELLENT' },
    { id: 'w3', title: 'Lost Time Injury Rate (LTIR)', type: 'KPI', value: '0.00', trend: 'Zero Incident Benchmark', status: 'EXCELLENT' },
    { id: 'w4', title: 'Equipment Utilization Rate', type: 'KPI', value: '84.5%', trend: '+3.2% optimization', status: 'HEALTHY' },
  ]);

  const [aiInsights, setAiInsights] = useState([
    {
      id: 'ins-1',
      category: 'FINANCIAL_RISK',
      title: 'Project PRJ-101 Cash Flow Deficit Forecast',
      insightText: 'Subcontractor retention payments due in Q4 exceed projected milestone release cash inflows by 14.2%.',
      recommendedAction: 'Authorize early release of Milestone M2 invoice or renegotiate Subcontractor payment terms to 60 days.',
      confidenceScore: '96%',
      severity: 'HIGH',
    },
    {
      id: 'ins-2',
      category: 'SCHEDULE_SLIPPAGE',
      title: 'Critical Path Piping Delivery Delay Risk',
      insightText: 'Main Intake Pipe Work Package (WP-2.1) has zero float. Current vendor lead time extended by 4 days.',
      recommendedAction: 'Expedite air freight delivery for remaining 400m ductile iron piping to avoid 7-day project critical delay.',
      confidenceScore: '92%',
      severity: 'CRITICAL',
    },
    {
      id: 'ins-3',
      category: 'SAFETY_ANOMALY',
      title: 'Toolbox Talk Attendance Slip at Site B',
      insightText: 'Site B logged 3 consecutive weeks of <80% contractor attendance at mandatory morning safety briefings.',
      recommendedAction: 'Issue formal HSE non-conformance warning to Site Supervisor B and require mandatory retraining.',
      confidenceScore: '98%',
      severity: 'MEDIUM',
    },
  ]);

  const [reports, setReports] = useState([
    { id: 'rep-1', title: 'Q3 2026 Enterprise Financial & Operational Executive Summary', module: 'CROSS_MODULE', period: 'Q3-2026', format: 'PDF', status: 'PUBLISHED', date: '2026-08-10' },
    { id: 'rep-2', title: 'Monthly Project Controls & Earned Value Variance Analysis', module: 'PROJECT_CONTROLS', period: 'Jul 2026', format: 'EXCEL', status: 'SCHEDULED', date: '2026-08-01' },
    { id: 'rep-3', title: 'HSE Safety Compliance & Environmental Monitoring Audit', module: 'HSE', period: 'Jul 2026', format: 'PDF', status: 'PUBLISHED', date: '2026-07-31' },
    { id: 'rep-4', title: 'Corporate Fleet Utilization & Fuel Cost Breakdown', module: 'FLEET', period: 'Q2-2026', format: 'PDF', status: 'ARCHIVED', date: '2026-07-01' },
  ]);

  // Form States
  const [newWidgetTitle, setNewWidgetTitle] = useState('');
  const [newWidgetType, setNewWidgetType] = useState('KPI_CARD');
  const [newWidgetCategory, setNewWidgetCategory] = useState('EXECUTIVE');

  const [newReportTitle, setNewReportTitle] = useState('');
  const [newReportModule, setNewReportModule] = useState('CROSS_MODULE');
  const [newReportFormat, setNewReportFormat] = useState('PDF');

  const handleAddWidget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWidgetTitle) return;
    setWidgets([
      ...widgets,
      {
        id: `w-${Date.now()}`,
        title: newWidgetTitle,
        type: newWidgetType,
        value: '92.4%',
        trend: 'Custom Configured',
        status: 'HEALTHY',
      },
    ]);
    setNewWidgetTitle('');
    setShowAddWidgetModal(false);
  };

  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportTitle) return;
    setReports([
      {
        id: `rep-${Date.now()}`,
        title: newReportTitle,
        module: newReportModule,
        period: 'Q3-2026',
        format: newReportFormat,
        status: 'PUBLISHED',
        date: new Date().toISOString().split('T')[0],
      },
      ...reports,
    ]);
    setNewReportTitle('');
    setShowNewReportModal(false);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-700 font-semibold text-xs px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Phase 65 Enterprise Module
            </span>
            <span className="text-slate-400 text-xs">Live BI Engine v4.2</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Enterprise Business Intelligence & Executive Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Cross-module aggregation, real-time executive command center, automated KPI tracking & AI insights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddWidgetModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Widget
          </button>
          <button
            onClick={() => setShowNewReportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4" /> Generate Report
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-5 py-3.5 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" /> Executive Command Center
        </button>
        <button
          onClick={() => setActiveTab('role_dashboards')}
          className={`flex items-center gap-2 px-5 py-3.5 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'role_dashboards'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" /> Role-Based Dashboards
        </button>
        <button
          onClick={() => setActiveTab('kpi_matrix')}
          className={`flex items-center gap-2 px-5 py-3.5 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'kpi_matrix'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Cross-Module KPI Matrix
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-5 py-3.5 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'reports'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" /> Saved & Scheduled Reports
        </button>
      </div>

      {/* TAB 1: EXECUTIVE COMMAND CENTER */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">YTD Portfolio Revenue</span>
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <DollarSign className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900">$24,500,000</div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" /> +12.4% vs annual target
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Schedule Performance (SPI)</span>
                <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Clock className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900">0.96</div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-blue-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Portfolio Target: 1.00
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cost Performance (CPI)</span>
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Briefcase className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900">1.04</div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-indigo-600 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" /> 4.0% cost efficiency gain
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Site Safety LTIR</span>
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900">0.00</div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 1,240,000 Safe Hours Logged
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights & Anomaly Detection Panel */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-xl shadow-md border border-indigo-900/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Autonomous AI Executive Insights</h2>
                  <p className="text-indigo-200/70 text-xs">Real-time cross-module pattern recognition & financial risk forecast</p>
                </div>
              </div>
              <span className="text-xs bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-3 py-1 rounded-full font-mono">
                3 Active Detection Alerts
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiInsights.map((ins) => (
                <div key={ins.id} className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:border-indigo-400/50 transition-all">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      ins.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      ins.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {ins.category}
                    </span>
                    <span className="text-xs text-indigo-300 font-mono">Confidence: {ins.confidenceScore}</span>
                  </div>
                  <h3 className="font-semibold text-sm text-white mt-2.5">{ins.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{ins.insightText}</p>
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-start gap-1.5 text-xs text-indigo-200">
                    <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Action:</strong> {ins.recommendedAction}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Trend Charts & EVM Visualizer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Earned Value Management (EVM) Portfolio Trend</h3>
                  <p className="text-xs text-slate-500">Planned Value (PV) vs Earned Value (EV) vs Actual Cost (AC)</p>
                </div>
                <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">Monthly Horizon 2026</span>
              </div>

              {/* Visual SVG Chart */}
              <div className="h-64 w-full flex flex-col justify-between pt-4">
                <div className="relative h-48 w-full border-b border-l border-slate-200 flex items-end justify-between px-4 pb-2">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                    <div className="border-b border-slate-900 w-full"></div>
                    <div className="border-b border-slate-900 w-full"></div>
                    <div className="border-b border-slate-900 w-full"></div>
                    <div className="border-b border-slate-900 w-full"></div>
                  </div>

                  {/* Monthly Bars / Peaks */}
                  {[
                    { m: 'Jan', pv: 40, ev: 38, ac: 36 },
                    { m: 'Feb', pv: 52, ev: 50, ac: 48 },
                    { m: 'Mar', pv: 65, ev: 62, ac: 59 },
                    { m: 'Apr', pv: 78, ev: 75, ac: 72 },
                    { m: 'May', pv: 88, ev: 86, ac: 81 },
                    { m: 'Jun', pv: 98, ev: 96, ac: 92 },
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1 z-10 w-12">
                      <div className="flex items-end gap-1 h-36">
                        <div style={{ height: `${item.pv}%` }} className="w-2.5 bg-slate-300 rounded-t" title={`PV: $${item.pv}00k`} />
                        <div style={{ height: `${item.ev}%` }} className="w-2.5 bg-indigo-600 rounded-t" title={`EV: $${item.ev}00k`} />
                        <div style={{ height: `${item.ac}%` }} className="w-2.5 bg-emerald-500 rounded-t" title={`AC: $${item.ac}00k`} />
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">{item.m}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-6 mt-4 text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-slate-300 rounded-sm" />
                    <span className="text-slate-600">Planned Value (PV)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-indigo-600 rounded-sm" />
                    <span className="text-slate-600">Earned Value (EV)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-emerald-500 rounded-sm" />
                    <span className="text-slate-600">Actual Cost (AC)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* High-Performing Projects & Vendors Ranking */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Project Performance Rankings</h3>
                <p className="text-xs text-slate-500">Sorted by Earned Schedule Efficiency</p>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Al Reem Mechanical Piping Hub', code: 'PRJ-101', spi: '0.96', cpi: '1.03', status: 'ON_TRACK' },
                  { name: 'Dubai Marina Substation Civils', code: 'PRJ-102', spi: '1.02', cpi: '1.08', status: 'AHEAD' },
                  { name: 'Sharjah Water Transmission Line', code: 'PRJ-103', spi: '0.91', cpi: '0.98', status: 'WATCH' },
                ].map((p, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-slate-900">{p.name}</div>
                      <div className="text-[11px] text-slate-500">{p.code} • SPI: {p.spi} • CPI: {p.cpi}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      p.status === 'AHEAD' ? 'bg-emerald-100 text-emerald-800' :
                      p.status === 'ON_TRACK' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Corporate Vendor Health</h4>
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between"><span>Top Vendor:</span> <strong className="text-slate-900">Emirates Steel (98.4%)</strong></div>
                  <div className="flex justify-between"><span>On-Time Fulfillment:</span> <strong className="text-slate-900">96.8%</strong></div>
                  <div className="flex justify-between"><span>Active Vendor NCRs:</span> <strong className="text-emerald-600">0 Open Major</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROLE-BASED DASHBOARDS */}
      {activeTab === 'role_dashboards' && (
        <div className="space-y-6">
          {/* Role Selector */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">Executive View Mode:</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="CEO">Chief Executive Officer (CEO)</option>
                <option value="MD">Managing Director (MD)</option>
                <option value="PROJECT">Project Director</option>
                <option value="FINANCE">Finance Controller</option>
                <option value="PROCUREMENT">Procurement Manager</option>
                <option value="QAQC">QA/QC Quality Director</option>
                <option value="HSE">HSE Safety Director</option>
                <option value="FLEET">Fleet & Heavy Equipment Manager</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddWidgetModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-medium rounded-lg text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Customize Layout
            </button>
          </div>

          {/* Dynamic Role Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {widgets.map((w) => (
              <div key={w.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>{w.title}</span>
                  <span className="p-1 bg-slate-100 rounded text-slate-600"><BarChart3 className="w-4 h-4" /></span>
                </div>
                <div className="text-2xl font-bold text-slate-900">{w.value}</div>
                <div className="text-xs text-slate-500">{w.trend}</div>
              </div>
            ))}
          </div>

          {/* Role Specific Deep-Dive Panel */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">{selectedRole} Executive Focus Area</h3>
            <p className="text-xs text-slate-500 mb-4">Tailored operational oversight metrics and decision indicators</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 uppercase font-bold">Key Risk Factor</span>
                <div className="text-sm font-semibold text-slate-900 mt-1">Material Supply Chain Inflation</div>
                <p className="text-xs text-slate-600 mt-1">Steel rebar prices fluctuated +4.1% in Q3.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 uppercase font-bold">Schedule Contingency</span>
                <div className="text-sm font-semibold text-slate-900 mt-1">14 Days Buffer Remaining</div>
                <p className="text-xs text-slate-600 mt-1">Critical path tasks consuming float within tolerances.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 uppercase font-bold">Resource Allocation</span>
                <div className="text-sm font-semibold text-slate-900 mt-1">88.4% Manpower Active</div>
                <p className="text-xs text-slate-600 mt-1">Direct labor productivity rate at 94.2%.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CROSS-MODULE KPI MATRIX */}
      {activeTab === 'kpi_matrix' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">SiteSync Pro Cross-Module Scorecard</h3>
              <p className="text-xs text-slate-500">Live aggregated metrics across all 10 site management modules</p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search KPI or Module..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Module Domain</th>
                  <th className="py-3 px-4">Primary KPI Indicator</th>
                  <th className="py-3 px-4">Current Value</th>
                  <th className="py-3 px-4">Benchmark Target</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Drilldown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                {[
                  { module: '1. Project Controls & CPM', kpi: 'Schedule Performance Index (SPI)', val: '0.96', target: '1.00', status: 'HEALTHY' },
                  { module: '2. Corporate Finance', kpi: 'Cost Performance Index (CPI)', val: '1.04', target: '1.00', status: 'EXCELLENT' },
                  { module: '3. HSE Safety Management', kpi: 'Lost Time Injury Rate (LTIR)', val: '0.00', target: '0.00', status: 'EXCELLENT' },
                  { module: '4. QA/QC Quality System', kpi: 'Inspection Pass Rate', val: '96.8%', target: '95.0%', status: 'EXCELLENT' },
                  { module: '5. Fleet & Heavy Assets', kpi: 'Fleet Equipment Utilization', val: '84.5%', target: '80.0%', status: 'HEALTHY' },
                  { module: '6. Materials & Inventory', kpi: 'Stock Turnover Ratio', val: '12.4x', target: '10.0x', status: 'HEALTHY' },
                  { module: '7. Procurement & POs', kpi: 'On-Time Vendor Fulfillment', val: '96.8%', target: '95.0%', status: 'HEALTHY' },
                  { module: '8. Subcontractor Management', kpi: 'Workmanship Pass Rate', val: '94.1%', target: '92.0%', status: 'HEALTHY' },
                  { module: '9. Fixed Assets & Depreciation', kpi: 'Asset Maintenance Compliance', val: '98.2%', target: '95.0%', status: 'EXCELLENT' },
                  { module: '10. EDMS Documents & RFCs', kpi: 'Drawing Approval Cycle Time', val: '3.2 Days', target: '5.0 Days', status: 'EXCELLENT' },
                ]
                  .filter((item) => item.module.toLowerCase().includes(searchQuery.toLowerCase()) || item.kpi.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{r.module}</td>
                      <td className="py-3 px-4 text-slate-700">{r.kpi}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{r.val}</td>
                      <td className="py-3 px-4 text-slate-500">{r.target}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.status === 'EXCELLENT' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center justify-end gap-1 ml-auto text-xs">
                          View Log <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SAVED & SCHEDULED REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Executive Report Archive & Distribution</h3>
                <p className="text-xs text-slate-500">Generate on-demand PDF summaries or configure cron email distribution</p>
              </div>
            </div>

            <button
              onClick={() => setShowNewReportModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Create New Report
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Report Title</th>
                  <th className="py-3.5 px-4">Module Context</th>
                  <th className="py-3.5 px-4">Period</th>
                  <th className="py-3.5 px-4">Format</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Generated Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                {reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{rep.title}</td>
                    <td className="py-3.5 px-4 text-slate-600">{rep.module}</td>
                    <td className="py-3.5 px-4 text-slate-500">{rep.period}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{rep.format}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rep.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' :
                        rep.status === 'SCHEDULED' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {rep.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{rep.date}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-xs transition-colors flex items-center gap-1 ml-auto">
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Widget Modal */}
      {showAddWidgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add Custom Dashboard Widget</h3>
            <form onSubmit={handleAddWidget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Widget Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily Concrete Output vs Target"
                  value={newWidgetTitle}
                  onChange={(e) => setNewWidgetTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Widget Type</label>
                <select
                  value={newWidgetType}
                  onChange={(e) => setNewWidgetType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="KPI_CARD">KPI Highlight Card</option>
                  <option value="TREND_CHART">EVM Trend Chart</option>
                  <option value="BAR_CHART">Comparison Bar Chart</option>
                  <option value="RANKING_TABLE">Performance Ranking Table</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category Domain</label>
                <select
                  value={newWidgetCategory}
                  onChange={(e) => setNewWidgetCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="EXECUTIVE">Executive / Cross-Module</option>
                  <option value="PROJECT">Project Controls</option>
                  <option value="FINANCE">Corporate Finance</option>
                  <option value="HSE">HSE Safety</option>
                  <option value="FLEET">Fleet & Assets</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddWidgetModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700"
                >
                  Save Widget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Report Modal */}
      {showNewReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Generate Executive Report</h3>
            <form onSubmit={handleAddReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Report Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Executive Cost & Performance Audit"
                  value={newReportTitle}
                  onChange={(e) => setNewReportTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Module Context</label>
                <select
                  value={newReportModule}
                  onChange={(e) => setNewReportModule(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="CROSS_MODULE">Cross-Module Enterprise</option>
                  <option value="PROJECT_CONTROLS">Project Planning & Controls</option>
                  <option value="FINANCE">Finance & Cash Flow</option>
                  <option value="HSE">HSE & Environmental</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Output Format</label>
                <select
                  value={newReportFormat}
                  onChange={(e) => setNewReportFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="PDF">PDF Executive Document</option>
                  <option value="EXCEL">Excel Data Sheet (.xlsx)</option>
                  <option value="CSV">Raw CSV</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewReportModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700"
                >
                  Generate Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
