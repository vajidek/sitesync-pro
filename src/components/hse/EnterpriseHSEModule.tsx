import React, { useState, useEffect } from 'react';
import { HseOperationalRecordModal, type HseOperationalRecordType } from './HseOperationalRecordModal';
import {
  ShieldAlert,
  Flame,
  AlertTriangle,
  FileCheck,
  HardHat,
  Activity,
  Award,
  Users,
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
  CheckCircle2,
  Wind,
  Trash2,
  LifeBuoy,
  HeartPulse,
  Eye,
  Sliders,
  Shield,
  ShieldCheck,
  Layers,
} from 'lucide-react';

interface HSEStats {
  safeManHours: number;
  totalIncidents: number;
  openIncidents: number;
  totalNearMiss: number;
  totalHazards: number;
  openHazards: number;
  activePermits: number;
  highRisks: number;
  totalInspections: number;
}

export const EnterpriseHSEModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'incidents'
    | 'near_miss'
    | 'hazards'
    | 'risk_matrix'
    | 'jsa'
    | 'ptw'
    | 'toolbox'
    | 'inspections'
    | 'ppe'
    | 'training'
    | 'drills'
    | 'fire'
    | 'environmental'
    | 'waste'
  >('dashboard');

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<HSEStats>({
    safeManHours: 0,
    totalIncidents: 0,
    openIncidents: 0,
    totalNearMiss: 0,
    totalHazards: 0,
    openHazards: 0,
    activePermits: 0,
    highRisks: 0,
    totalInspections: 0,
  });

  const [incidents, setIncidents] = useState<any[]>([]);
  const [nearMisses, setNearMisses] = useState<any[]>([]);
  const [hazards, setHazards] = useState<any[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<any[]>([]);
  const [jsaList, setJsaList] = useState<any[]>([]);
  const [toolboxTalks, setToolboxTalks] = useState<any[]>([]);
  const [workPermits, setWorkPermits] = useState<any[]>([]);
  const [safetyInspections, setSafetyInspections] = useState<any[]>([]);
  const [ppeIssuances, setPpeIssuances] = useState<any[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<any[]>([]);
  const [emergencyDrills, setEmergencyDrills] = useState<any[]>([]);
  const [fireEquipment, setFireEquipment] = useState<any[]>([]);
  const [environmentLogs, setEnvironmentLogs] = useState<any[]>([]);
  const [wasteLogs, setWasteLogs] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showNewIncidentModal, setShowNewIncidentModal] = useState(false);
  const [showNewPermitModal, setShowNewPermitModal] = useState(false);
  const [showNewRiskModal, setShowNewRiskModal] = useState(false);
  const [operationalRecordType, setOperationalRecordType] = useState<HseOperationalRecordType | null>(null);

  // Forms
  const [newIncidentForm, setNewIncidentForm] = useState({
    title: '',
    incidentType: 'FIRST_AID',
    severity: 'LOW',
    location: '',
    injuredPersonName: '',
    description: '',
    immediateAction: '',
    reportedBy: '',
  });

  const [newPermitForm, setNewPermitForm] = useState({
    permitType: 'HOT_WORK',
    location: '',
    description: '',
    contractorName: '',
    supervisorName: '',
    isolationStatus: 'NOT_APPLICABLE',
    gasTestResult: '',
  });

  const [newRiskForm, setNewRiskForm] = useState({
    activityName: '',
    departmentOrSite: '',
    hazardDescription: '',
    severity: 3,
    likelihood: 3,
    existingControls: '',
    additionalControls: '',
    assessedBy: '',
  });

  const fetchHSEData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const headers = { Authorization: `Bearer ${token}` };

      const [
        statsRes,
        incRes,
        nmRes,
        hazRes,
        riskRes,
        jsaRes,
        tbtRes,
        ptwRes,
        inspRes,
        ppeRes,
        trnRes,
        drlRes,
        feRes,
        envRes,
        wstRes,
      ] = await Promise.all([
        fetch('/api/hse/stats', { headers }),
        fetch('/api/hse/incidents', { headers }),
        fetch('/api/hse/near-miss', { headers }),
        fetch('/api/hse/hazards', { headers }),
        fetch('/api/hse/risk', { headers }),
        fetch('/api/hse/jsa', { headers }),
        fetch('/api/hse/toolbox-talks', { headers }),
        fetch('/api/hse/permits', { headers }),
        fetch('/api/hse/safety-inspections', { headers }),
        fetch('/api/hse/ppe', { headers }),
        fetch('/api/hse/training', { headers }),
        fetch('/api/hse/drills', { headers }),
        fetch('/api/hse/fire-equipment', { headers }),
        fetch('/api/hse/environment', { headers }),
        fetch('/api/hse/waste', { headers }),
      ]);

      if (statsRes.ok) setStats((await statsRes.json()).data || stats);
      if (incRes.ok) setIncidents((await incRes.json()).data || []);
      if (nmRes.ok) setNearMisses((await nmRes.json()).data || []);
      if (hazRes.ok) setHazards((await hazRes.json()).data || []);
      if (riskRes.ok) setRiskAssessments((await riskRes.json()).data || []);
      if (jsaRes.ok) setJsaList((await jsaRes.json()).data || []);
      if (tbtRes.ok) setToolboxTalks((await tbtRes.json()).data || []);
      if (ptwRes.ok) setWorkPermits((await ptwRes.json()).data || []);
      if (inspRes.ok) setSafetyInspections((await inspRes.json()).data || []);
      if (ppeRes.ok) setPpeIssuances((await ppeRes.json()).data || []);
      if (trnRes.ok) setTrainingRecords((await trnRes.json()).data || []);
      if (drlRes.ok) setEmergencyDrills((await drlRes.json()).data || []);
      if (feRes.ok) setFireEquipment((await feRes.json()).data || []);
      if (envRes.ok) setEnvironmentLogs((await envRes.json()).data || []);
      if (wstRes.ok) setWasteLogs((await wstRes.json()).data || []);
    } catch (err) {
      console.error('Error fetching HSE data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHSEData();
  }, []);

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch('/api/hse/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newIncidentForm),
      });
      if (res.ok) {
        setShowNewIncidentModal(false);
                setNewIncidentForm({
          title: '',
          incidentType: 'FIRST_AID',
          severity: 'LOW',
          location: '',
          injuredPersonName: '',
          description: '',
          immediateAction: '',
          reportedBy: '',
        });
        fetchHSEData();
      }
    } catch (err) {
      console.error('Failed to create incident:', err);
    }
  };

  const handleCreatePermit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch('/api/hse/permits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPermitForm),
      });
      if (res.ok) {
        setShowNewPermitModal(false);
                setNewPermitForm({
          permitType: 'HOT_WORK',
          location: '',
          description: '',
          contractorName: '',
          supervisorName: '',
          isolationStatus: 'NOT_APPLICABLE',
          gasTestResult: '',
        });
        fetchHSEData();
      }
    } catch (err) {
      console.error('Failed to create permit:', err);
    }
  };

  const handleCreateRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch('/api/hse/risk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newRiskForm),
      });
      if (res.ok) {
        setShowNewRiskModal(false);
        setNewRiskForm({
          activityName: '',
          departmentOrSite: '',
          hazardDescription: '',
          severity: 3,
          likelihood: 3,
          existingControls: '',
          additionalControls: '',
          assessedBy: '',
        });
        fetchHSEData();
      }
    } catch (err) {
      console.error('Failed to create risk assessment:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 text-slate-800">
      {/* Module Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-600 text-white rounded-lg shadow-md">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">Health, Safety & Environment (HSE) Engine</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                Phase 63 Enterprise
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Zero-Harm Governance, PTW Controls, Risk Assessment Matrix, OSHA / ISO 45001 / ISO 14001 Compliance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchHSEData}
            className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
            title="Refresh HSE Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowNewIncidentModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow transition"
          >
            <AlertTriangle className="w-4 h-4" />
            Report Incident
          </button>
          <button
            onClick={() => setShowNewPermitModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow transition"
          >
            <Flame className="w-4 h-4" />
            Issue PTW
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-200 text-sm font-medium">
        {[
          { id: 'dashboard', label: 'Dashboard & KPIs', icon: Activity },
          { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
          { id: 'near_miss', label: 'Near Miss', icon: LifeBuoy },
          { id: 'hazards', label: 'Hazards', icon: ShieldAlert },
          { id: 'risk_matrix', label: 'Risk Matrix', icon: Sliders },
          { id: 'jsa', label: 'JSA', icon: FileCheck },
          { id: 'ptw', label: 'Work Permits (PTW)', icon: Flame },
          { id: 'toolbox', label: 'Toolbox Talks', icon: Users },
          { id: 'inspections', label: 'Safety Audits', icon: ClipboardList },
          { id: 'ppe', label: 'PPE Issuance', icon: HardHat },
          { id: 'training', label: 'Training Matrix', icon: Award },
          { id: 'drills', label: 'Emergency Drills', icon: HeartPulse },
          { id: 'fire', label: 'Fire Equipment', icon: Shield },
          { id: 'environmental', label: 'Environmental', icon: Wind },
          { id: 'waste', label: 'Waste Disposal', icon: Trash2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg whitespace-nowrap transition ${
                isActive
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-emerald-700 to-teal-800 text-white p-5 rounded-xl shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200">LTI-Free Safe Hours</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.safeManHours.toLocaleString()} Hrs</h3>
                </div>
                <div className="p-2 bg-white/10 rounded-lg">
                  <ShieldCheck className="w-6 h-6 text-emerald-200" />
                </div>
              </div>
              <p className="text-xs text-emerald-100 mt-3 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Zero Lost Time Injury Record
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Work Permits</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.activePermits} Active</h3>
                </div>
                <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                  <Flame className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3">Hot Work, Confined Space & Height</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Reported Incidents</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalIncidents} Total</h3>
                </div>
                <div className="p-2 bg-red-100 rounded-lg text-red-700">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-red-600 mt-3 font-medium">{stats.openIncidents} Open Investigation</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">High Risk Activities</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.highRisks} Tracked</h3>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
                  <Sliders className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3">Mitigated via Risk Matrix & JSA</p>
            </div>
          </div>

          {/* Compliance Standards Badges & Recent Incidents Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Recent Incident & Near-Miss Log
                </h2>
                <button onClick={() => setActiveTab('incidents')} className="text-xs font-semibold text-emerald-600 hover:underline">
                  View Full Register &rarr;
                </button>
              </div>

              {incidents.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">No incidents recorded. All sites safe.</div>
              ) : (
                <div className="space-y-3">
                  {incidents.map((inc) => (
                    <div key={inc.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-700">{inc.incidentNumber}</span>
                          <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-800 rounded">
                            {inc.incidentType}
                          </span>
                          <span className="text-xs text-slate-500">{inc.incidentDate}</span>
                        </div>
                        <h4 className="font-semibold text-slate-900 mt-1">{inc.title}</h4>
                        <p className="text-xs text-slate-600 mt-0.5">{inc.location}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded ${
                          inc.status === 'CLOSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inc.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Regulatory & Safety Standards Bar */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                HSE Regulatory Certifications
              </h2>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-emerald-900">ISO 45001:2018 Certified</p>
                    <p className="text-emerald-700">Occupational Health & Safety Management</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-blue-900">ISO 14001:2015 Compliant</p>
                    <p className="text-blue-700">Environmental Management System</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">OSHA 1926 Construction Standard</p>
                    <p className="text-slate-600">Heavy Engineering & Excavation</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-slate-600" />
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-amber-900">Site HSE Guidelines 2026</p>
                    <p className="text-amber-700">Enterprise Site Safety & Environmental Protocols</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INCIDENTS REGISTER */}
      {activeTab === 'incidents' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-900">Incident Register</h2>
            <button
              onClick={() => setShowNewIncidentModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
            >
              <Plus className="w-4 h-4" /> Report Incident
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Incident #</th>
                  <th className="p-3">Title & Location</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Injured Person</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{inc.incidentNumber}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{inc.title}</p>
                      <p className="text-slate-500">{inc.location}</p>
                    </td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-slate-200 rounded font-semibold">{inc.incidentType}</span></td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded">{inc.severity}</span></td>
                    <td className="p-3">{inc.injuredPersonName || 'N/A'}</td>
                    <td className="p-3">{inc.incidentDate}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 font-bold rounded ${
                        inc.status === 'CLOSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: NEAR MISS */}
      {activeTab === 'near_miss' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Near Miss Register</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Near Miss #</th>
                  <th className="p-3">Title & Category</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Potential Severity</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {nearMisses.map((nm) => (
                  <tr key={nm.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold">{nm.nearMissNumber}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{nm.title}</p>
                      <p className="text-slate-500">{nm.category}</p>
                    </td>
                    <td className="p-3">{nm.location}</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded">{nm.potentialSeverity}</span></td>
                    <td className="p-3"><span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-bold rounded">{nm.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: HAZARDS */}
      {activeTab === 'hazards' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Hazard Identification & Mitigation</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Hazard #</th>
                  <th className="p-3">Type & Location</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Risk Level</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {hazards.map((haz) => (
                  <tr key={haz.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold">{haz.hazardNumber}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{haz.hazardType}</p>
                      <p className="text-slate-500">{haz.location}</p>
                    </td>
                    <td className="p-3 max-w-xs truncate">{haz.description}</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded">{haz.riskLevel}</span></td>
                    <td className="p-3"><span className="px-2.5 py-1 bg-slate-200 font-bold rounded">{haz.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: RISK MATRIX ENGINE */}
      {activeTab === 'risk_matrix' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-600" />
                5x5 Risk Matrix Assessment Engine
              </h2>
              <p className="text-xs text-slate-500 mt-1">Severity (1 to 5) x Likelihood (1 to 5) = Risk Score (1 to 25)</p>
            </div>
            <button
              onClick={() => setShowNewRiskModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition"
            >
              <Plus className="w-4 h-4" /> Add Risk Assessment
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Assessment #</th>
                  <th className="p-3">Activity & Site</th>
                  <th className="p-3">Hazard Description</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Likelihood</th>
                  <th className="p-3">Risk Score</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Residual Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {riskAssessments.map((ra) => (
                  <tr key={ra.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{ra.assessmentNumber}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{ra.activityName}</p>
                      <p className="text-slate-500">{ra.departmentOrSite}</p>
                    </td>
                    <td className="p-3 max-w-xs truncate">{ra.hazardDescription}</td>
                    <td className="p-3 font-bold">{ra.severity} / 5</td>
                    <td className="p-3 font-bold">{ra.likelihood} / 5</td>
                    <td className="p-3 font-bold text-base">{ra.riskScore}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded ${
                        ra.riskCategory === 'CRITICAL' ? 'bg-red-200 text-red-900' :
                        ra.riskCategory === 'HIGH' ? 'bg-red-100 text-red-800' :
                        ra.riskCategory === 'MODERATE' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {ra.riskCategory}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-emerald-700">{ra.residualRiskScore || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: JSA MANAGEMENT */}
      {activeTab === 'jsa' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Job Safety Analysis (JSA)</h2>
          <div className="space-y-4">
            {jsaList.map((j) => (
              <div key={j.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-600">{j.jsaNumber}</span>
                    <h3 className="text-base font-bold text-slate-900">{j.jobTitle}</h3>
                    <p className="text-xs text-slate-500">{j.location} | Supervisor: {j.supervisorName}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded">{j.status}</span>
                </div>
                <div className="text-xs bg-white p-3 rounded border text-slate-700 whitespace-pre-line font-mono">
                  {j.jobSteps}
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                  <span>PPE: {j.requiredPpe}</span>
                  <span>Permit Required: {j.permitRequired ? 'YES' : 'NO'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: WORK PERMITS (PTW) */}
      {activeTab === 'ptw' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-600" />
              Permit To Work (PTW) System
            </h2>
            <button
              onClick={() => setShowNewPermitModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition"
            >
              <Plus className="w-4 h-4" /> Issue New PTW
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Permit #</th>
                  <th className="p-3">Permit Type</th>
                  <th className="p-3">Location & Description</th>
                  <th className="p-3">Supervisor</th>
                  <th className="p-3">Gas Test Result</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {workPermits.map((ptw) => (
                  <tr key={ptw.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{ptw.permitNumber}</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded">{ptw.permitType}</span></td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{ptw.location}</p>
                      <p className="text-slate-500">{ptw.description}</p>
                    </td>
                    <td className="p-3">{ptw.supervisorName}</td>
                    <td className="p-3 font-mono">{ptw.gasTestResult || 'N/A'}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded ${
                        ptw.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ptw.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: TOOLBOX TALKS */}
      {activeTab === 'toolbox' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Toolbox Talks (TBT) Register</h2>
            <button
              type="button"
              onClick={() => setOperationalRecordType('toolbox' as HseOperationalRecordType)}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Record Toolbox Talk
            </button>
          </div>
          <div className="space-y-3">
            {toolboxTalks.map((tbt) => (
              <div key={tbt.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-mono text-xs font-bold">{tbt.tbtNumber}</span>
                  <h3 className="font-bold text-slate-900">{tbt.topic}</h3>
                  <p className="text-xs text-slate-500">Conducted by: {tbt.conductedBy} | Location: {tbt.location}</p>
                  <p className="text-xs text-slate-700 mt-1">Key Points: {tbt.keyPoints}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-700">{tbt.attendeesCount} Workers Attended</span>
                  <p className="text-xs text-slate-500">{tbt.talkDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: SAFETY INSPECTIONS */}
      {activeTab === 'inspections' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Safety Inspections & Site Audits</h2>
            <button
              type="button"
              onClick={() => setOperationalRecordType('inspections' as HseOperationalRecordType)}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Record Safety Inspection
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Inspection #</th>
                  <th className="p-3">Type & Location</th>
                  <th className="p-3">Inspector</th>
                  <th className="p-3">Checked Items</th>
                  <th className="p-3">Score %</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {safetyInspections.map((insp) => (
                  <tr key={insp.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold">{insp.inspectionNumber}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{insp.inspectionType}</p>
                      <p className="text-slate-500">{insp.location}</p>
                    </td>
                    <td className="p-3">{insp.inspectorName}</td>
                    <td className="p-3">{insp.compliantItems} / {insp.totalItemsChecked} Compliant</td>
                    <td className="p-3 font-bold text-emerald-700">{insp.scorePercentage}%</td>
                    <td className="p-3"><span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded">{insp.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 10: PPE ISSUANCE */}
      {activeTab === 'ppe' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">PPE Issuance Register</h2>
            <button
              type="button"
              onClick={() => setOperationalRecordType('ppe' as HseOperationalRecordType)}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Record PPE Issuance
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Issuance #</th>
                  <th className="p-3">Employee Name</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">PPE Item</th>
                  <th className="p-3">Condition</th>
                  <th className="p-3">Issue Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ppeIssuances.map((ppe) => (
                  <tr key={ppe.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold">{ppe.issuanceNumber}</td>
                    <td className="p-3 font-bold text-slate-900">{ppe.employeeName} ({ppe.employeeId})</td>
                    <td className="p-3">{ppe.department}</td>
                    <td className="p-3 font-semibold">{ppe.ppeItem}</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">{ppe.condition}</span></td>
                    <td className="p-3">{ppe.issueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 11: TRAINING MATRIX */}
      {activeTab === 'training' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">HSE Safety Training & Certifications</h2>
            <button
              type="button"
              onClick={() => setOperationalRecordType('training' as HseOperationalRecordType)}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Record Training
            </button>
          </div>
          <div className="space-y-3">
            {trainingRecords.map((t) => (
              <div key={t.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-mono text-xs font-bold">{t.trainingNumber}</span>
                  <h3 className="font-bold text-slate-900">{t.courseName}</h3>
                  <p className="text-xs text-slate-500">Trainer: {t.trainerName} | Valid for {t.validityMonths} months</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded">{t.status}</span>
                  <p className="text-xs text-slate-500 mt-1">Expiry: {t.expiryDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 12: EMERGENCY DRILLS */}
      {activeTab === 'drills' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Emergency Mock Drills Register</h2>
            <button
              type="button"
              onClick={() => setOperationalRecordType('drills' as HseOperationalRecordType)}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Record Emergency Drill
            </button>
          </div>
          <div className="space-y-3">
            {emergencyDrills.map((d) => (
              <div key={d.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-mono text-xs font-bold">{d.drillNumber}</span>
                  <h3 className="font-bold text-slate-900">{d.drillType}</h3>
                  <p className="text-xs text-slate-500">Location: {d.location} | Evacuation Time: {d.evacuationTimeSeconds}s</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-bold text-xs rounded">{d.performanceRating}</span>
                  <p className="text-xs text-slate-500 mt-1">{d.participantsCount} Participants</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 13: FIRE EQUIPMENT */}
      {activeTab === 'fire' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Fire Protection Equipment Master</h2>
            <button
              type="button"
              onClick={() => setOperationalRecordType('fire' as HseOperationalRecordType)}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Register Fire Equipment
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Equipment Tag</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Pressure Status</th>
                  <th className="p-3">Next Due</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {fireEquipment.map((fe) => (
                  <tr key={fe.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold">{fe.equipmentTag}</td>
                    <td className="p-3 font-semibold">{fe.equipmentType}</td>
                    <td className="p-3">{fe.location}</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">{fe.pressureStatus}</span></td>
                    <td className="p-3">{fe.nextInspectionDue}</td>
                    <td className="p-3"><span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded">{fe.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 14: ENVIRONMENTAL MONITORING */}
      {activeTab === 'environmental' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Environmental Parameters Log</h2>
            <button
              type="button"
              onClick={() => setOperationalRecordType('environmental' as HseOperationalRecordType)}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Record Environment
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Record #</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Parameter</th>
                  <th className="p-3">Measured Value</th>
                  <th className="p-3">Permissible Limit</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {environmentLogs.map((env) => (
                  <tr key={env.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold">{env.recordNumber}</td>
                    <td className="p-3 font-bold text-slate-900">{env.location}</td>
                    <td className="p-3 font-semibold">{env.parameter}</td>
                    <td className="p-3 font-bold">{env.measuredValue} {env.unit}</td>
                    <td className="p-3">{env.permissibleLimit} {env.unit}</td>
                    <td className="p-3"><span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded">{env.complianceStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 15: WASTE DISPOSAL */}
      {activeTab === 'waste' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Waste Disposal Tracking & Manifests</h2>
            <button
              type="button"
              onClick={() => setOperationalRecordType('waste' as HseOperationalRecordType)}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Record Waste Manifest
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Manifest #</th>
                  <th className="p-3">Waste Category & Type</th>
                  <th className="p-3">Quantity (kg)</th>
                  <th className="p-3">Approved Contractor</th>
                  <th className="p-3">Certificate Ref</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {wasteLogs.map((wst) => (
                  <tr key={wst.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold">{wst.manifestNumber}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{wst.wasteType}</p>
                      <p className="text-slate-500">{wst.wasteCategory}</p>
                    </td>
                    <td className="p-3 font-bold">{wst.quantityKg} kg</td>
                    <td className="p-3">{wst.approvedContractor}</td>
                    <td className="p-3 font-mono">{wst.certificateRef || 'N/A'}</td>
                    <td className="p-3"><span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded">{wst.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {operationalRecordType && (
        <HseOperationalRecordModal
          type={operationalRecordType}
          onClose={() => setOperationalRecordType(null)}
          onCreated={fetchHSEData}
        />
      )}

      {/* MODAL: REPORT INCIDENT */}
      {showNewIncidentModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Report Health & Safety Incident</h3>
            <form onSubmit={handleCreateIncident} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Incident Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scaffolding plank slipped during dismantling"
                  value={newIncidentForm.title}
                  onChange={(e) => setNewIncidentForm({ ...newIncidentForm, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Incident Type</label>
                  <select
                    value={newIncidentForm.incidentType}
                    onChange={(e) => setNewIncidentForm({ ...newIncidentForm, incidentType: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="FIRST_AID">FIRST_AID</option>
                    <option value="MEDICAL_TREATMENT">MEDICAL_TREATMENT</option>
                    <option value="LOST_TIME">LOST_TIME</option>
                    <option value="PROPERTY_DAMAGE">PROPERTY_DAMAGE</option>
                    <option value="ENVIRONMENTAL">ENVIRONMENTAL</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Severity</label>
                  <select
                    value={newIncidentForm.severity}
                    onChange={(e) => setNewIncidentForm({ ...newIncidentForm, severity: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Location / Sector</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Filter Bed Sector 3 - Chainage 12+400"
                  value={newIncidentForm.location}
                  onChange={(e) => setNewIncidentForm({ ...newIncidentForm, location: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Description of Event</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed chronological sequence of events..."
                  value={newIncidentForm.description}
                  onChange={(e) => setNewIncidentForm({ ...newIncidentForm, description: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewIncidentModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 shadow"
                >
                  Submit Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE WORK PERMIT */}
      {showNewPermitModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Issue Permit To Work (PTW)</h3>
            <form onSubmit={handleCreatePermit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Permit Type</label>
                  <select
                    value={newPermitForm.permitType}
                    onChange={(e) => setNewPermitForm({ ...newPermitForm, permitType: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="HOT_WORK">HOT_WORK</option>
                    <option value="CONFINED_SPACE">CONFINED_SPACE</option>
                    <option value="HEIGHT_WORK">HEIGHT_WORK</option>
                    <option value="ELECTRICAL">ELECTRICAL</option>
                    <option value="EXCAVATION">EXCAVATION</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Supervisor Name</label>
                  <input
                    type="text"
                    required
                    value={newPermitForm.supervisorName}
                    onChange={(e) => setNewPermitForm({ ...newPermitForm, supervisorName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Location / Equipment</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pump Room #2 High Pressure Line"
                  value={newPermitForm.location}
                  onChange={(e) => setNewPermitForm({ ...newPermitForm, location: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Work Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Arc welding pipe elbow joints with 10m hot work shield"
                  value={newPermitForm.description}
                  onChange={(e) => setNewPermitForm({ ...newPermitForm, description: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewPermitModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700 shadow"
                >
                  Issue PTW
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW RISK ASSESSMENT */}
      {showNewRiskModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Add Risk Assessment Matrix Item</h3>
            <form onSubmit={handleCreateRisk} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Activity Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lifting Heavy Intake Valve Assembly with 20T Mobile Crane"
                  value={newRiskForm.activityName}
                  onChange={(e) => setNewRiskForm({ ...newRiskForm, activityName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Hazard Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Identify potential hazards, failure points, and exposure risks..."
                  value={newRiskForm.hazardDescription}
                  onChange={(e) => setNewRiskForm({ ...newRiskForm, hazardDescription: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Severity (1 to 5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={newRiskForm.severity}
                    onChange={(e) => setNewRiskForm({ ...newRiskForm, severity: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Likelihood (1 to 5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={newRiskForm.likelihood}
                    onChange={(e) => setNewRiskForm({ ...newRiskForm, likelihood: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded border border-purple-200 text-purple-900 font-bold flex justify-between">
                <span>Calculated Risk Score: {newRiskForm.severity * newRiskForm.likelihood}</span>
                <span>
                  Category:{' '}
                  {newRiskForm.severity * newRiskForm.likelihood <= 4
                    ? 'LOW'
                    : newRiskForm.severity * newRiskForm.likelihood <= 9
                    ? 'MODERATE'
                    : newRiskForm.severity * newRiskForm.likelihood <= 15
                    ? 'HIGH'
                    : 'CRITICAL'}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewRiskModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white font-semibold rounded hover:bg-purple-700 shadow"
                >
                  Save Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
