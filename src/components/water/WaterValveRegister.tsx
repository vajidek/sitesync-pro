import React, { useState, useEffect } from 'react';
import { safeJson, safeFetchJson } from '../../lib/safeFetch';
import { ValveRecord, ValveType, ActuatorType } from '../../types/waterInfrastructureEngine';
import {
  Wrench,
  Plus,
  MapPin,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ShieldCheck,
  X,
  FileCheck2,
  AlertCircle
} from 'lucide-react';

export const WaterValveRegister: React.FC = () => {
  const [valves, setValves] = useState<ValveRecord[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    safeFetchJson('/api/kwa/valves')
      .then((data) => {
        if (Array.isArray(data)) setValves(data);
      })
      .catch((err) => console.error(err));

    safeFetchJson('/api/kwa/projects')
      .then((data) => {
        if (Array.isArray(data)) setProjectsList(data);
      })
      .catch((err) => console.error(err));
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    valveTagNo: '',
    valveType: 'SLUICE' as ValveType,
    diameterMm: 300,
    pressureRating: 'PN16',
    actuatorType: 'MANUAL_HANDWHEEL' as ActuatorType,
    chamberLocation: 'Ch 11+450 Main Highway Junction',
    projectId: '',
    projectName: '',
    installationDate: new Date().toISOString().split('T')[0],
    status: 'INSTALLED' as 'DELIVERED' | 'CHAMBER_READY' | 'INSTALLED' | 'TESTED' | 'COMMISSIONED',
    scadaIntegrated: false,
    remarks: 'RCC Chamber cast with MH cover'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedProj = projectsList.find((p) => p.id === formData.projectId || p.name === formData.projectName);
      const payload = {
        ...formData,
        valveTagNo: formData.valveTagNo || `VLV-WATER-${Date.now().toString().slice(-4)}`,
        projectName: selectedProj ? selectedProj.name : (formData.projectName || 'Peruvannamuzhi WTP Scheme')
      };

      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/kwa/valves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const json = await safeJson(res);
      if (json?.success && json.data) {
        setValves([json.data, ...valves]);
        setIsModalOpen(false);
      } else {
        setValves([{ id: `vlv_${Date.now()}`, ...payload } as any, ...valves]);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Error adding valve:', err);
      setIsModalOpen(false);
    }
  };

  const filteredValves = valves.filter((v) => {
    const matchesType = filterType === 'ALL' || v.valveType === filterType;
    const matchesSearch = v.valveTagNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.chamberLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            Valve Chamber & Actuator Register
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log butterfly valves (BFV), sluice valves, air release valves, non-return valves (NRV), motorized actuators & RCC chambers
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow transition flex items-center justify-center space-x-1.5 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Valve to Chamber Register</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search valve tag, chamber location or scheme..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            <option value="ALL">All Valve Types</option>
            <option value="SLUICE">Sluice / Gate Valve</option>
            <option value="BUTTERFLY">Butterfly Valve (BFV)</option>
            <option value="AIR_RELEASE">Air Release Valve</option>
            <option value="NON_RETURN">Non-Return Valve (NRV)</option>
            <option value="SCOUR">Scour Valve</option>
            <option value="PRESSURE_REDUCING">Pressure Reducing Valve (PRV)</option>
          </select>
        </div>
      </div>

      {/* Valves Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredValves.map((v) => (
          <div
            key={v.id}
            className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500/40 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-mono font-bold rounded">
                  {v.valveTagNo}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  v.status === 'COMMISSIONED' || v.status === 'TESTED'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {v.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                {v.valveType} Valve ({v.diameterMm}mm - {v.pressureRating || 'PN16'})
              </h3>

              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="truncate" title={v.chamberLocation}>{v.chamberLocation}</span>
              </div>

              <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex justify-between"><span>Actuator:</span><span className="font-semibold text-slate-800 dark:text-slate-200">{v.actuatorType}</span></div>
                <div className="flex justify-between"><span>Scheme:</span><span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{v.projectName}</span></div>
                <div className="flex justify-between"><span>SCADA Telemetry:</span><span className={`font-bold ${v.scadaIntegrated ? 'text-emerald-600' : 'text-slate-400'}`}>{v.scadaIntegrated ? 'Linked' : 'Manual'}</span></div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Date: {v.installationDate}</span>
              <span className="text-slate-500 dark:text-slate-400 italic truncate max-w-[150px]">{v.remarks}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                Add Valve to Chamber Register
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Valve Type</label>
                  <select
                    value={formData.valveType}
                    onChange={(e) => setFormData({ ...formData, valveType: e.target.value as ValveType })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  >
                    <option value="SLUICE">Sluice / Gate</option>
                    <option value="BUTTERFLY">Butterfly (BFV)</option>
                    <option value="AIR_RELEASE">Air Release</option>
                    <option value="NON_RETURN">Non-Return (NRV)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Diameter (mm)</label>
                  <input
                    type="number"
                    value={formData.diameterMm}
                    onChange={(e) => setFormData({ ...formData, diameterMm: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Chamber Location / Chainage</label>
                <input
                  type="text"
                  placeholder="e.g. Ch 14+850 Valve Chamber #4"
                  value={formData.chamberLocation}
                  onChange={(e) => setFormData({ ...formData, chamberLocation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Scheme</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => {
                    const proj = projectsList.find((p) => p.id === e.target.value);
                    setFormData({
                      ...formData,
                      projectId: e.target.value,
                      projectName: proj ? proj.name : ''
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  required
                >
                  <option value="">Select Project Scheme</option>
                  {projectsList.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow"
                >
                  Save Valve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
