import React, { useState } from 'react';
import { MeasurementBookEntry, BOQItem, MBStatus } from '../../types/procurement';
import { Project } from '../../types';
import { 
  Ruler, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Building2, 
  FileCheck2, 
  TrendingUp, 
  X,
  FileSpreadsheet
} from 'lucide-react';

interface MeasurementBookProps {
  entries: MeasurementBookEntry[];
  boqItems: BOQItem[];
  projects: Project[];
  onCreateEntry: (entry: Partial<MeasurementBookEntry>) => void;
  onUpdateStatus: (id: string, status: MBStatus, verifiedBy?: string, approvedBy?: string) => void;
}

export const MeasurementBookView: React.FC<MeasurementBookProps> = ({
  entries,
  boqItems,
  projects,
  onCreateEntry,
  onUpdateStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [boqItemId, setBoqItemId] = useState(boqItems[0]?.id || '');
  const [locationChainage, setLocationChainage] = useState('Ch 14+200 Pier P14 North');
  const [length, setLength] = useState(25);
  const [breadth, setBreadth] = useState(4);
  const [height, setHeight] = useState(2);
  const [remarks, setRemarks] = useState('Reinforcement & concrete pour measured at site.');

  const projectBoqItems = boqItems.filter(b => b.projectId === selectedProjectId);

  const filteredEntries = entries.filter((m) => {
    const matchesProject = m.projectId === selectedProjectId;
    const matchesSearch = 
      m.mbNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.boqItemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.locationChainage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.recordedByName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProject && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const boq = boqItems.find(b => b.id === boqItemId);
    const proj = projects.find(p => p.id === selectedProjectId);
    if (!boq || !proj) return;

    const calcQty = Number(length) * Number(breadth) * Number(height);
    const valuation = calcQty * boq.unitRateUSD;

    onCreateEntry({
      boqItemId: boq.id,
      boqItemCode: boq.itemCode,
      projectId: proj.id,
      projectName: proj.name,
      measurementDate: new Date().toISOString().split('T')[0],
      recordedByName: 'Eng. Ramesh Kumar (Quality Site Inspector)',
      locationChainage,
      lengthMeters: Number(length),
      breadthMeters: Number(breadth),
      heightMeters: Number(height),
      quantity: calcQty,
      unit: boq.unit,
      valuationUSD: valuation,
      status: 'Recorded',
      remarks
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Ruler className="w-6 h-6 text-blue-600" />
            <span>Digital Measurement Book (MB) & Work Verification</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Site chainage measurements, L x B x H physical dimension logs, contractor billing verification & BOQ sync
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Record New MB Entry</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Project MB Context</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="relative flex items-end">
          <Search className="w-4 h-4 absolute left-3.5 bottom-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search MB number, BOQ item code, chainage location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Measurement Book Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">MB No. & Date</th>
                <th className="p-3">BOQ Line Item</th>
                <th className="p-3">Location / Chainage</th>
                <th className="p-3 text-right">L (m)</th>
                <th className="p-3 text-right">B (m)</th>
                <th className="p-3 text-right">H (m)</th>
                <th className="p-3 text-right text-blue-600 dark:text-blue-400">Measured Qty</th>
                <th className="p-3 text-right text-emerald-600 dark:text-emerald-400">Valuation ($)</th>
                <th className="p-3">Recorded Inspector</th>
                <th className="p-3 text-center">Verification Workflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {filteredEntries.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                  <td className="p-3 font-bold">
                    <span className="text-blue-600 dark:text-blue-400 block">{m.mbNumber}</span>
                    <span className="text-[10px] font-normal text-slate-400 block">{m.measurementDate}</span>
                  </td>
                  <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{m.boqItemCode}</td>
                  <td className="p-3 font-sans text-slate-700 dark:text-slate-300 font-medium">{m.locationChainage}</td>
                  <td className="p-3 text-right">{m.lengthMeters}</td>
                  <td className="p-3 text-right">{m.breadthMeters}</td>
                  <td className="p-3 text-right">{m.heightMeters}</td>
                  <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/20">
                    {m.quantity.toLocaleString()} {m.unit}
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    ${m.valuationUSD.toLocaleString()}
                  </td>
                  <td className="p-3 font-sans text-slate-400 text-[11px]">{m.recordedByName}</td>
                  <td className="p-3 font-sans text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        m.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' :
                        m.status === 'Verified' ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300' :
                        'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {m.status}
                      </span>

                      {m.status === 'Recorded' && (
                        <button
                          onClick={() => onUpdateStatus(m.id, 'Verified', 'Eng. Vikram Vance (Senior QS)')}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded transition"
                        >
                          Verify MB
                        </button>
                      )}
                      {m.status === 'Verified' && (
                        <button
                          onClick={() => onUpdateStatus(m.id, 'Approved', m.verifiedByName, 'Abdul Vajid EK (Project Director)')}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded transition"
                        >
                          Approve MB
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record MB Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <Ruler className="w-5 h-5 text-blue-400" />
                <span>Record Site Measurement Book (MB) Entry</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Select BOQ Item Line *</label>
                <select
                  value={boqItemId}
                  onChange={(e) => setBoqItemId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                >
                  {projectBoqItems.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.itemCode} - {b.description} (Rate: ${b.unitRateUSD}/{b.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Location / Site Chainage *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pier P14 Pier Cap Concrete Pour"
                  value={locationChainage}
                  onChange={(e) => setLocationChainage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Length (L) (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Breadth (B) (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={breadth}
                    onChange={(e) => setBreadth(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Height (H) (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Site Inspection Remarks</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md"
                >
                  Submit MB Measurement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
