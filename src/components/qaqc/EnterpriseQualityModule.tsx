import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Flame,
  Droplets,
  Gauge,
  ListChecks,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Calendar,
  UserCheck,
  ArrowUpRight,
  ClipboardList,
  AlertCircle,
  FileText,
  Clock,
  ExternalLink,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface QAQCStats {
  totalInspections: number;
  passedInspections: number;
  pendingInspections: number;
  openNcrs: number;
  totalNcrs: number;
  totalItps: number;
  passedHydroTests: number;
  openPunchItems: number;
  passRatePercentage: number;
}

export const EnterpriseQualityModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'inspections' | 'itp' | 'ncr' | 'mir' | 'site_tests' | 'welding' | 'hydro' | 'punch_list'
  >('dashboard');

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<QAQCStats>({
    totalInspections: 14,
    passedInspections: 12,
    pendingInspections: 2,
    openNcrs: 1,
    totalNcrs: 3,
    totalItps: 4,
    passedHydroTests: 2,
    openPunchItems: 2,
    passRatePercentage: 86,
  });

  const [inspections, setInspections] = useState<any[]>([]);
  const [ncrs, setNcrs] = useState<any[]>([]);
  const [itps, setItps] = useState<any[]>([]);
  const [mirs, setMirs] = useState<any[]>([]);
  const [siteTests, setSiteTests] = useState<any[]>([]);
  const [weldingReports, setWeldingReports] = useState<any[]>([]);
  const [hydroTests, setHydroTests] = useState<any[]>([]);
  const [punchItems, setPunchItems] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showNewInspectionModal, setShowNewInspectionModal] = useState(false);
  const [showNewNcrModal, setShowNewNcrModal] = useState(false);
  const [showNewHydroModal, setShowNewHydroModal] = useState(false);

  // Modal form states
  const [newInsForm, setNewInsForm] = useState({
    title: '',
    discipline: 'MECHANICAL',
    inspectionType: 'SITE_INSPECTION',
    location: '',
    requestedDate: new Date().toISOString().split('T')[0],
    inspectorName: 'Er. Abdul Vajid EK',
    clientRepresentative: 'Client Inspection Engineer',
    remarks: '',
  });

  const [newNcrForm, setNewNcrForm] = useState({
    title: '',
    severity: 'MAJOR',
    description: '',
    location: '',
    issuedTo: 'Piping Subcontractor Alpha',
    targetCloseDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    rootCause: '',
    disposition: 'REWORK',
  });

  const [newHydroForm, setNewHydroForm] = useState({
    lineOrTankNumber: 'DN600 Main Header Line 02',
    testMedium: 'POTABLE_WATER',
    designPressureBar: 10,
    testPressureBar: 15,
    testDurationHours: 24,
    holdingTimeMinutes: 120,
    kwaWitnessName: 'Er. K. V. Suresh (Lead Quality EE)',
  });

  useEffect(() => {
    fetchQAQCData();
  }, []);

  const fetchQAQCData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, insRes, ncrRes, itpRes, mirRes, testRes, wldRes, hydRes, pchRes] = await Promise.all([
        fetch('/api/qaqc/stats', { headers }),
        fetch('/api/qaqc/inspections', { headers }),
        fetch('/api/qaqc/ncr', { headers }),
        fetch('/api/qaqc/itp', { headers }),
        fetch('/api/qaqc/material-inspections', { headers }),
        fetch('/api/qaqc/site-tests', { headers }),
        fetch('/api/qaqc/welding-inspections', { headers }),
        fetch('/api/qaqc/hydro-tests', { headers }),
        fetch('/api/qaqc/punch-list', { headers }),
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        if (d.data) setStats(d.data);
      }
      if (insRes.ok) {
        const d = await insRes.json();
        if (d.data) setInspections(d.data);
      }
      if (ncrRes.ok) {
        const d = await ncrRes.json();
        if (d.data) setNcrs(d.data);
      }
      if (itpRes.ok) {
        const d = await itpRes.json();
        if (d.data) setItps(d.data);
      }
      if (mirRes.ok) {
        const d = await mirRes.json();
        if (d.data) setMirs(d.data);
      }
      if (testRes.ok) {
        const d = await testRes.json();
        if (d.data) setSiteTests(d.data);
      }
      if (wldRes.ok) {
        const d = await wldRes.json();
        if (d.data) setWeldingReports(d.data);
      }
      if (hydRes.ok) {
        const d = await hydRes.json();
        if (d.data) setHydroTests(d.data);
      }
      if (pchRes.ok) {
        const d = await pchRes.json();
        if (d.data) setPunchItems(d.data);
      }
    } catch (err) {
      console.error('Error loading QA/QC data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch('/api/qaqc/inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newInsForm),
      });

      if (res.ok) {
        setShowNewInspectionModal(false);
        fetchQAQCData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNcr = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch('/api/qaqc/ncr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newNcrForm),
      });

      if (res.ok) {
        setShowNewNcrModal(false);
        fetchQAQCData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateHydro = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch('/api/qaqc/hydro-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newHydroForm),
      });

      if (res.ok) {
        setShowNewHydroModal(false);
        fetchQAQCData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <ShieldCheck className="w-96 h-96 text-blue-300" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold rounded-full uppercase tracking-wider">
                Phase 62 – Quality Assurance & Control
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Quality & ISO 9001 Compliant
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Enterprise QA/QC Management System
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Quality Assurance, Inspection & Test Plans (ITP), Non-Conformance Reports (NCR), Hydrostatic Testing, Welding NDT, Material Receiving Inspections & Punch List Tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchQAQCData}
              className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowNewInspectionModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Request Inspection
            </button>
            <button
              onClick={() => setShowNewNcrModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-600/30 transition flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" /> Issue NCR
            </button>
          </div>
        </div>
      </div>

      {/* Primary Module Navigation Tabs */}
      <div className="flex overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 gap-1">
        {[
          { id: 'dashboard', label: 'Executive Dashboard', icon: Gauge },
          { id: 'inspections', label: 'Inspection Register', icon: ClipboardList, badge: stats.pendingInspections },
          { id: 'itp', label: 'ITP Plans', icon: FileCheck, badge: stats.totalItps },
          { id: 'ncr', label: 'NCR & CAPA', icon: AlertTriangle, badge: stats.openNcrs },
          { id: 'mir', label: 'Material Inspections (MIR)', icon: Building2 },
          { id: 'site_tests', label: 'Site Lab Tests', icon: ListChecks },
          { id: 'welding', label: 'Welding & NDT', icon: Flame },
          { id: 'hydro', label: 'Hydro & Pressure Tests', icon: Droplets },
          { id: 'punch_list', label: 'Punch & Snag List', icon: AlertCircle, badge: stats.openPunchItems },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quality Pass Rate</p>
                  <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    {stats.passRatePercentage}%
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {stats.passedInspections} of {stats.totalInspections} passed
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${stats.passRatePercentage}%` }} />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Open NCRs</p>
                  <h3 className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                    {stats.openNcrs}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> {stats.totalNcrs} total registered
                  </p>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Passed Hydro Tests</p>
                  <h3 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                    {stats.passedHydroTests}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" /> 100% Client Witnessed
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-xl">
                  <Droplets className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Open Punch List</p>
                  <h3 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                    {stats.openPunchItems}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" /> Pre-Commissioning Defect
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 rounded-xl">
                  <ListChecks className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Middle Overview Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Inspections Feed */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-blue-600" /> Recent Site Inspections
                  </h3>
                  <p className="text-xs text-slate-500">Live site quality requests and inspection logs</p>
                </div>
                <button
                  onClick={() => setActiveTab('inspections')}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                >
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {inspections.slice(0, 5).map((ins) => (
                  <div key={ins.id} className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl px-3 transition">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-xl mt-0.5 ${
                          ins.result === 'PASSED'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : ins.result === 'REJECTED'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                        }`}
                      >
                        {ins.result === 'PASSED' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : ins.result === 'REJECTED' ? (
                          <AlertTriangle className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{ins.inspectionNumber}</span>
                          <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded font-medium">
                            {ins.discipline}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{ins.title}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                          <span>📍 {ins.location}</span>
                          <span>•</span>
                          <span>📅 {ins.requestedDate}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full inline-block ${
                          ins.result === 'PASSED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : ins.result === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}
                      >
                        {ins.result}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Standard Badges & Discipline Breakdown */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" /> Applicable Standards
                </h3>
                <div className="space-y-2.5">
                  {[
                    { code: 'Water Quality Standard 2026', desc: 'Engineering & Mandatory Pipeline Specs' },
                    { code: 'ASME B31.3', desc: 'Process Piping & Pressure Tests' },
                    { code: 'ISO 9001:2015', desc: 'Quality Management Systems' },
                    { code: 'AWS D1.1', desc: 'Structural Welding Code Steel' },
                    { code: 'IS 456 / IS 10262', desc: 'Concrete Mix Design & Testing' },
                  ].map((std, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{std.code}</p>
                        <p className="text-[11px] text-slate-500">{std.desc}</p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons Box */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-800/40">
                <h3 className="text-base font-bold text-white mb-1">Quick Actions</h3>
                <p className="text-xs text-indigo-200 mb-4">Execute QA/QC workflow tasks</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowNewInspectionModal(true)}
                    className="p-3 bg-blue-600/80 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold text-center transition"
                  >
                    + Request Inspection
                  </button>
                  <button
                    onClick={() => setShowNewHydroModal(true)}
                    className="p-3 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold text-center transition"
                  >
                    + Log Hydro Test
                  </button>
                  <button
                    onClick={() => setShowNewNcrModal(true)}
                    className="p-3 bg-amber-600/80 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold text-center transition col-span-2"
                  >
                    + Issue Non-Conformance (NCR)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inspections Tab */}
      {activeTab === 'inspections' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Inspection Request Register</h3>
              <p className="text-xs text-slate-500">Track all site, mechanical, civil, electrical and pipe inspection requests</p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search inspections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowNewInspectionModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition whitespace-nowrap"
              >
                + Request Inspection
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="p-3">Inspection #</th>
                  <th className="p-3">Title & Discipline</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Requested Date</th>
                  <th className="p-3">Inspector</th>
                  <th className="p-3">Client Rep</th>
                  <th className="p-3 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {inspections
                  .filter((i) => i.title.toLowerCase().includes(searchTerm.toLowerCase()) || i.inspectionNumber.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((ins) => (
                    <tr key={ins.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{ins.inspectionNumber}</td>
                      <td className="p-3">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{ins.title}</p>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                          {ins.discipline} • {ins.inspectionType}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{ins.location}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{ins.requestedDate}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{ins.inspectorName || 'Unassigned'}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{ins.clientRepresentative || 'Inspection Engineer'}</td>
                      <td className="p-3 text-right">
                        <span
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                            ins.result === 'PASSED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : ins.result === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {ins.result}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ITP Plans Tab */}
      {activeTab === 'itp' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Inspection & Test Plans (ITP Masters)</h3>
            <p className="text-xs text-slate-500">Approved quality plans containing hold points, witness points and acceptance criteria</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {itps.map((itp) => (
              <div key={itp.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{itp.itpNumber}</span>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{itp.title}</h4>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold rounded-full">
                    {itp.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <p><strong>Discipline:</strong> {itp.discipline} • <strong>Rev:</strong> {itp.revisionNumber}</p>
                  <p><strong>Standard:</strong> {itp.standardReference || 'ASME / ISO'}</p>
                  <p><strong>Prepared By:</strong> {itp.preparedBy} • <strong>Approved By:</strong> {itp.approvedBy}</p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Includes Hold & Witness Points</span>
                  <button className="text-blue-600 hover:underline font-semibold flex items-center gap-1">
                    View Checklist <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NCR Tab */}
      {activeTab === 'ncr' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Non-Conformance Reports (NCR)</h3>
              <p className="text-xs text-slate-500">Track and close quality non-conformances and root causes</p>
            </div>
            <button
              onClick={() => setShowNewNcrModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition"
            >
              + Issue NCR
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="p-3">NCR #</th>
                  <th className="p-3">Title & Severity</th>
                  <th className="p-3">Issued To</th>
                  <th className="p-3">Target Close Date</th>
                  <th className="p-3">Disposition</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {ncrs.map((ncr) => (
                  <tr key={ncr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-amber-600 dark:text-amber-400">{ncr.ncrNumber}</td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{ncr.title}</p>
                      <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded font-bold">
                        {ncr.severity}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{ncr.issuedTo}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{ncr.targetCloseDate}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{ncr.disposition || 'REWORK'}</td>
                    <td className="p-3 text-right">
                      <span
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                          ncr.status === 'OPEN'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {ncr.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MIR Tab */}
      {activeTab === 'mir' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Material Receiving Inspections (MIR)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                  <th className="p-3">MIR #</th>
                  <th className="p-3">Material Name</th>
                  <th className="p-3">Supplier</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Mill Cert / Heat #</th>
                  <th className="p-3 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mirs.map((mir) => (
                  <tr key={mir.id}>
                    <td className="p-3 font-bold text-blue-600">{mir.mirNumber}</td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{mir.materialName}</td>
                    <td className="p-3 text-slate-600">{mir.supplierName}</td>
                    <td className="p-3 text-slate-600">{mir.quantityReceived} {mir.unitOfMeasure}</td>
                    <td className="p-3 text-slate-600">{mir.heatNumberCertRef || 'HEAT-77120'}</td>
                    <td className="p-3 text-right">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 text-[11px] font-bold rounded-full">
                        {mir.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Site Tests Tab */}
      {activeTab === 'site_tests' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Site & Lab Quality Testing</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                  <th className="p-3">Test #</th>
                  <th className="p-3">Test Type</th>
                  <th className="p-3">Location / Chainage</th>
                  <th className="p-3">Required Target</th>
                  <th className="p-3">Obtained Value</th>
                  <th className="p-3 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {siteTests.map((t) => (
                  <tr key={t.id}>
                    <td className="p-3 font-bold text-indigo-600">{t.testNumber}</td>
                    <td className="p-3 font-semibold">{t.testType}</td>
                    <td className="p-3 text-slate-600">{t.locationChainage}</td>
                    <td className="p-3 text-slate-600">{t.requiredValue}</td>
                    <td className="p-3 font-bold text-emerald-600">{t.obtainedValue}</td>
                    <td className="p-3 text-right">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                        {t.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Welding Tab */}
      {activeTab === 'welding' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Welding Inspection & NDT Reports</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                  <th className="p-3">Report #</th>
                  <th className="p-3">Joint #</th>
                  <th className="p-3">Welder ID</th>
                  <th className="p-3">Pipe Material</th>
                  <th className="p-3">NDT Method</th>
                  <th className="p-3 text-right">NDT Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {weldingReports.map((w) => (
                  <tr key={w.id}>
                    <td className="p-3 font-bold text-blue-600">{w.reportNumber}</td>
                    <td className="p-3 font-semibold">{w.jointNumber}</td>
                    <td className="p-3 text-slate-600">{w.welderId}</td>
                    <td className="p-3 text-slate-600">{w.pipeDiameterInch}" {w.pipeMaterial}</td>
                    <td className="p-3 font-medium text-indigo-600">{w.ndtMethod}</td>
                    <td className="p-3 text-right">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                        {w.ndtResult}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hydro Test Tab */}
      {activeTab === 'hydro' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Hydrostatic & Pressure Testing</h3>
              <p className="text-xs text-slate-500">Pipeline pressure test certifications witnessed by Authority</p>
            </div>
            <button
              onClick={() => setShowNewHydroModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
            >
              + Log Hydro Test
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hydroTests.map((h) => (
              <div key={h.id} className="p-5 rounded-2xl border border-blue-100 dark:border-slate-800 bg-blue-50/30 dark:bg-slate-800/20 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-blue-600">{h.testPackageNumber}</span>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{h.lineOrTankNumber}</h4>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                    {h.result}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div>
                    <p className="text-slate-400">Design Pressure:</p>
                    <p className="font-bold text-slate-700 dark:text-slate-200">{h.designPressureBar} Bar</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Test Pressure:</p>
                    <p className="font-bold text-blue-600">{h.testPressureBar} Bar</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Duration:</p>
                    <p className="font-bold text-slate-700 dark:text-slate-200">{h.testDurationHours} Hours</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Pressure Drop:</p>
                    <p className="font-bold text-emerald-600">{h.pressureDropObservedBar} Bar (Pass)</p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 pt-1">
                  <p><strong>Witnessed By:</strong> {h.kwaWitnessName || 'Inspection Engineer'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Punch List Tab */}
      {activeTab === 'punch_list' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Pre-Commissioning Punch & Snag List</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                  <th className="p-3">Punch #</th>
                  <th className="p-3">Subsystem / Location</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Assigned Subcon</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {punchItems.map((p) => (
                  <tr key={p.id}>
                    <td className="p-3 font-bold text-indigo-600">{p.punchNumber}</td>
                    <td className="p-3 font-semibold">{p.subsystemRef}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold rounded">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{p.description}</td>
                    <td className="p-3 text-slate-600">{p.assignedContractor}</td>
                    <td className="p-3 text-right">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: New Inspection */}
      {showNewInspectionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Request Site Inspection</h3>
            <form onSubmit={handleCreateInspection} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-medium">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pump Discharge Flange Torque Test"
                  value={newInsForm.title}
                  onChange={(e) => setNewInsForm({ ...newInsForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Discipline</label>
                  <select
                    value={newInsForm.discipline}
                    onChange={(e) => setNewInsForm({ ...newInsForm, discipline: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="MECHANICAL">MECHANICAL</option>
                    <option value="PIPELINE">PIPELINE</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="ELECTRICAL">ELECTRICAL</option>
                    <option value="WATER_TREATMENT">WATER_TREATMENT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Type</label>
                  <select
                    value={newInsForm.inspectionType}
                    onChange={(e) => setNewInsForm({ ...newInsForm, inspectionType: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="SITE_INSPECTION">SITE_INSPECTION</option>
                    <option value="WELDING">WELDING</option>
                    <option value="PRESSURE_TEST">PRESSURE_TEST</option>
                    <option value="MATERIAL_RECEIVING">MATERIAL_RECEIVING</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chainage 14+200 or Pump House"
                  value={newInsForm.location}
                  onChange={(e) => setNewInsForm({ ...newInsForm, location: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewInspectionModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: New NCR */}
      {showNewNcrModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Issue Non-Conformance Report (NCR)</h3>
            <form onSubmit={handleCreateNcr} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-medium">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inadequate Pipe Support Anchor Embedding"
                  value={newNcrForm.title}
                  onChange={(e) => setNewNcrForm({ ...newNcrForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the quality non-conformance..."
                  value={newNcrForm.description}
                  onChange={(e) => setNewNcrForm({ ...newNcrForm, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Location</label>
                  <input
                    type="text"
                    required
                    value={newNcrForm.location}
                    onChange={(e) => setNewNcrForm({ ...newNcrForm, location: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Issued To</label>
                  <input
                    type="text"
                    required
                    value={newNcrForm.issuedTo}
                    onChange={(e) => setNewNcrForm({ ...newNcrForm, issuedTo: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewNcrModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-xl font-semibold">
                  Issue NCR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: New Hydro Test */}
      {showNewHydroModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Log Hydrostatic Test Certificate</h3>
            <form onSubmit={handleCreateHydro} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-medium">Line or Tank Number</label>
                <input
                  type="text"
                  required
                  value={newHydroForm.lineOrTankNumber}
                  onChange={(e) => setNewHydroForm({ ...newHydroForm, lineOrTankNumber: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Design Pressure (Bar)</label>
                  <input
                    type="number"
                    value={newHydroForm.designPressureBar}
                    onChange={(e) => setNewHydroForm({ ...newHydroForm, designPressureBar: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Test Pressure (Bar)</label>
                  <input
                    type="number"
                    value={newHydroForm.testPressureBar}
                    onChange={(e) => setNewHydroForm({ ...newHydroForm, testPressureBar: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Witnessing Authority Name</label>
                <input
                  type="text"
                  value={newHydroForm.kwaWitnessName}
                  onChange={(e) => setNewHydroForm({ ...newHydroForm, kwaWitnessName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewHydroModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold">
                  Record Hydro Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
