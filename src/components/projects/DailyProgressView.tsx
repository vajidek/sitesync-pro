import React, { useState, useEffect } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { 
  ClipboardList, 
  Plus, 
  CheckCircle, 
  ShieldCheck, 
  AlertCircle, 
  FileText, 
  Camera, 
  UserCheck, 
  Ruler, 
  Send, 
  X, 
  CheckCheck 
} from 'lucide-react';

interface DailyProgressViewProps {
  projectId: string;
}

export const DailyProgressView: React.FC<DailyProgressViewProps> = ({ projectId }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [boqItems, setBoqItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    siteId: '',
    date: new Date().toISOString().slice(0, 10),
    workCategory: 'Piping Fabrication & Welding',
    description: '',
    completionPercentage: 10,
    remarks: '',
  });

  // Export to MB Modal State
  const [selectedDprForMb, setSelectedDprForMb] = useState<any | null>(null);
  const [mbFormData, setMbFormData] = useState({
    boqItemId: '',
    boqItemCode: '',
    locationChainage: 'Ch 14+200 Valve Chamber Area',
    lengthMeters: 10,
    breadthMeters: 2.5,
    heightMeters: 1.2,
    quantity: 30,
    unit: 'Cum',
    unitRateUSD: 180,
    remarks: 'Physical progress verified from Daily Progress Report (DPR).',
  });
  const [syncingMb, setSyncingMb] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('sitesync_access_token');
      const [logsRes, sitesRes, boqRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/daily-progress`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/projects/${projectId}/sites`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/procurement/boq?projectId=${projectId}`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
      ]);
      const logsJson = await safeJson(logsRes);
      const sitesJson = await safeJson(sitesRes);
      const boqJson = boqRes ? await safeJson(boqRes) : null;

      if (logsJson?.success) setLogs(logsJson.data || []);
      if (sitesJson?.success) {
        setSites(sitesJson.data || []);
        if (sitesJson.data && sitesJson.data.length > 0) {
          setFormData((prev) => ({ ...prev, siteId: sitesJson.data[0].id }));
        }
      }
      if (boqJson?.success && Array.isArray(boqJson.data)) {
        setBoqItems(boqJson.data);
      } else {
        // Standard BOQ items fallback
        setBoqItems([
          { id: 'boq_01', itemCode: 'BOQ-CIV-001', description: 'Earthwork excavation in all types of soil including disposal', unit: 'Cum', unitRateUSD: 45 },
          { id: 'boq_02', itemCode: 'BOQ-CIV-002', description: 'Plain Cement Concrete (PCC 1:4:8) for pipe bed foundation', unit: 'Cum', unitRateUSD: 120 },
          { id: 'boq_03', itemCode: 'BOQ-CIV-003', description: 'Reinforced Cement Concrete (RCC M30) in valve chambers & piers', unit: 'Cum', unitRateUSD: 240 },
          { id: 'boq_04', itemCode: 'BOQ-MEC-004', description: 'Laying, jointing & testing 500mm DI K9 pressure piping', unit: 'Meters', unitRateUSD: 310 },
          { id: 'boq_05', itemCode: 'BOQ-MEC-005', description: 'Installation & testing of 300mm PN16 flanged sluice valves', unit: 'Nos', unitRateUSD: 850 },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchData();
  }, [projectId]);

  const handleCreateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/projects/daily-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, projectId }),
      });
      const json = await safeJson(res);
      if (json?.success) {
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'VERIFIED' | 'APPROVED' | 'REJECTED') => {
    try {
      const token = localStorage.getItem('sitesync_access_token');
      await fetch(`/api/projects/daily-progress/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenMbModal = (log: any) => {
    setSelectedDprForMb(log);
    const site = sites.find((s) => s.id === log.siteId);
    const matchingBoq = boqItems.find(b => 
      b.description?.toLowerCase().includes('pipe') || 
      b.description?.toLowerCase().includes('excavation') || 
      b.itemCode?.toLowerCase().includes('civ')
    ) || boqItems[0];

    const l = 12;
    const b = 3;
    const h = 1.5;
    const qty = l * b * h;

    setMbFormData({
      boqItemId: matchingBoq?.id || 'boq_01',
      boqItemCode: matchingBoq?.itemCode || 'BOQ-CIV-001',
      locationChainage: site ? `${site.siteName} (Chainage Ch 12+400)` : 'Section 4 - Valve Chamber Alpha',
      lengthMeters: l,
      breadthMeters: b,
      heightMeters: h,
      quantity: qty,
      unit: matchingBoq?.unit || 'Cum',
      unitRateUSD: matchingBoq?.unitRateUSD || 180,
      remarks: `DPR Sync: ${log.workCategory} progress on ${log.date}. Logged by ${log.createdByName || 'Site Supervisor'}. Verified by ${log.verifiedByName || 'Site Engineer'}.`
    });
  };

  const handleSyncToMbSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDprForMb) return;

    try {
      setSyncingMb(true);
      const token = localStorage.getItem('sitesync_access_token');
      const mbNumber = `MB-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
      const calcQty = Number(mbFormData.lengthMeters) * Number(mbFormData.breadthMeters) * Number(mbFormData.heightMeters);
      const valuation = calcQty * Number(mbFormData.unitRateUSD);

      const payload = {
        mbNumber,
        projectId,
        boqItemId: mbFormData.boqItemId,
        boqItemCode: mbFormData.boqItemCode,
        measurementDate: selectedDprForMb.date || new Date().toISOString().slice(0, 10),
        locationChainage: mbFormData.locationChainage,
        lengthMeters: Number(mbFormData.lengthMeters),
        breadthMeters: Number(mbFormData.breadthMeters),
        heightMeters: Number(mbFormData.heightMeters),
        quantity: calcQty,
        unit: mbFormData.unit,
        valuationUSD: valuation,
        recordedByName: selectedDprForMb.verifiedByName || selectedDprForMb.createdByName || 'Field Engineer',
        status: 'Recorded', // Draft MB status
        sourceDprId: selectedDprForMb.id,
        remarks: mbFormData.remarks
      };

      // Call MB API
      const res = await fetch('/api/procurement/measurements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const json = await safeJson(res);

      // Also persist sync state on local DPR log
      const updatedLogs = logs.map(l => {
        if (l.id === selectedDprForMb.id) {
          return {
            ...l,
            isMbSynced: true,
            syncedMbNumber: mbNumber,
            syncedMbAt: new Date().toISOString()
          };
        }
        return l;
      });
      setLogs(updatedLogs);

      setSyncSuccessMsg(`Successfully exported DPR record to Measurement Book as draft entry ${mbNumber}!`);
      setTimeout(() => {
        setSyncSuccessMsg('');
        setSelectedDprForMb(null);
      }, 2000);
    } catch (err) {
      console.error('Error syncing DPR to MB:', err);
    } finally {
      setSyncingMb(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-blue-500" /> Daily Work Progress & Verification Log
          </h3>
          <p className="text-xs text-slate-500">
            Field progress records, category updates, site photos & multi-tier approval workflow
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Daily Progress</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading daily progress logs...</div>
      ) : logs.length === 0 ? (
        <div className="p-8 text-center border border-dashed rounded-2xl text-xs text-slate-400">
          No progress logs entered for this project yet.
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => {
            const site = sites.find((s) => s.id === log.siteId);
            return (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[11px] font-bold">
                      {log.workCategory}
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {site ? site.siteName : 'Site Location'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="font-mono text-slate-400">{log.date}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : log.status === 'VERIFIED'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{log.description}</p>
                  {log.remarks && (
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-slate-600 dark:text-slate-400 text-[11px] italic">
                      Remarks: {log.remarks}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-xs border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-4 text-slate-500 text-[11px]">
                    <span>Logged by: <strong>{log.createdByName || 'Site Incharge'}</strong></span>
                    {log.verifiedByName && <span>Verified: <strong className="text-indigo-600">{log.verifiedByName}</strong></span>}
                    {log.approvedByName && <span>Approved: <strong className="text-emerald-600">{log.approvedByName}</strong></span>}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* MB Sync Status Badge / Action */}
                    {(log.status === 'VERIFIED' || log.status === 'APPROVED') && (
                      log.isMbSynced ? (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg text-[10px] font-bold flex items-center space-x-1">
                          <CheckCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>MB Synced ({log.syncedMbNumber})</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenMbModal(log)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[11px] flex items-center space-x-1 shadow-sm transition"
                        >
                          <Ruler className="w-3 h-3" />
                          <span>Export to MB</span>
                        </button>
                      )
                    )}

                    {log.status === 'SUBMITTED' && (
                      <button
                        onClick={() => handleUpdateStatus(log.id, 'VERIFIED')}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-[11px] flex items-center space-x-1"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Verify Entry</span>
                      </button>
                    )}
                    {log.status === 'VERIFIED' && (
                      <button
                        onClick={() => handleUpdateStatus(log.id, 'APPROVED')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] flex items-center space-x-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Approve Entry</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Log Site Execution Work Progress</h4>
            <form onSubmit={handleCreateProgress} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Target Site</label>
                  <select
                    value={formData.siteId}
                    onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  >
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.siteName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Work Category</label>
                <select
                  value={formData.workCategory}
                  onChange={(e) => setFormData({ ...formData, workCategory: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                >
                  <option value="Mechanical Piping Fabrication">Mechanical Piping Fabrication</option>
                  <option value="Structural Steel Welding">Structural Steel Welding</option>
                  <option value="Civil Foundation & Concrete Pour">Civil Foundation & Concrete Pour</option>
                  <option value="Hydrostatic Pressure Testing">Hydrostatic Pressure Testing</option>
                  <option value="Equipment & Vessel Erection">Equipment & Vessel Erection</option>
                  <option value="Electrical & Instrumentation Conduit">Electrical & Instrumentation Conduit</option>
                  <option value="HSE & Safety Inspection">HSE & Safety Inspection</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Work Executed Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail joints welded, linear meters excavated, cubic meters poured, NDT results..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Completion Added (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.completionPercentage}
                  onChange={(e) => setFormData({ ...formData, completionPercentage: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Site Remarks / Obstacles</label>
                <input
                  type="text"
                  placeholder="Weather conditions, crew shift size, equipment pre-heat..."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-xl shadow"
                >
                  Submit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Verified Progress to Measurement Book (MB) Modal */}
      {selectedDprForMb && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-600 text-white rounded-xl shadow">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Export Verified Progress to Measurement Book (MB)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Creates draft MB entry from DPR record ({selectedDprForMb.date} - {selectedDprForMb.workCategory})
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedDprForMb(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {syncSuccessMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center space-x-2">
                <CheckCheck className="w-4 h-4" />
                <span>{syncSuccessMsg}</span>
              </div>
            )}

            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl text-blue-800 dark:text-blue-300 text-[11px]">
              <strong>Quantity Surveying Governance Rule:</strong> This action records physical measurements into the Project Measurement Book in <em>'Recorded'</em> status. It does NOT automatically generate contractor bills or general ledger postings until verified by the Quantity Surveyor (QS) and certified by the Project Manager.
            </div>

            <form onSubmit={handleSyncToMbSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Select Project BOQ Line Item *</label>
                <select
                  value={mbFormData.boqItemId}
                  onChange={(e) => {
                    const sel = boqItems.find(b => b.id === e.target.value);
                    setMbFormData({
                      ...mbFormData,
                      boqItemId: e.target.value,
                      boqItemCode: sel?.itemCode || '',
                      unit: sel?.unit || 'Cum',
                      unitRateUSD: sel?.unitRateUSD || 150
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                >
                  {boqItems.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.itemCode} - {b.description} (${b.unitRateUSD}/{b.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Location / Chainage Description *</label>
                <input
                  type="text"
                  required
                  value={mbFormData.locationChainage}
                  onChange={(e) => setMbFormData({ ...mbFormData, locationChainage: e.target.value })}
                  placeholder="e.g. Chainage Ch 12+400 to Ch 12+850 Valve Chamber Area"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Length (L) (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={mbFormData.lengthMeters}
                    onChange={(e) => setMbFormData({ ...mbFormData, lengthMeters: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Breadth (B) (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={mbFormData.breadthMeters}
                    onChange={(e) => setMbFormData({ ...mbFormData, breadthMeters: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Height (H) (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={mbFormData.heightMeters}
                    onChange={(e) => setMbFormData({ ...mbFormData, heightMeters: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Calculated Quantity & Unit</span>
                  <span className="font-mono text-sm font-black text-blue-600 dark:text-blue-400">
                    {(Number(mbFormData.lengthMeters) * Number(mbFormData.breadthMeters) * Number(mbFormData.heightMeters)).toLocaleString()} {mbFormData.unit}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Valuation</span>
                  <span className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400">
                    ${(Number(mbFormData.lengthMeters) * Number(mbFormData.breadthMeters) * Number(mbFormData.heightMeters) * Number(mbFormData.unitRateUSD)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Measurement Remarks</label>
                <textarea
                  rows={2}
                  value={mbFormData.remarks}
                  onChange={(e) => setMbFormData({ ...mbFormData, remarks: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedDprForMb(null)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={syncingMb}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow flex items-center space-x-2 transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{syncingMb ? 'Exporting...' : 'Export to Measurement Book'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
