import React, { useState, useEffect } from 'react';
import { safeJson, safeFetchJson } from '../../lib/safeFetch';
import { PipelineSection, PipeMaterial, PipeClass, CrossingType } from '../../types/waterInfrastructureEngine';
import {
  Activity,
  Plus,
  MapPin,
  Compass,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Check,
  TrendingUp,
  X,
  ChevronRight
} from 'lucide-react';

export const WaterPipelineManagement: React.FC = () => {
  const [sections, setSections] = useState<PipelineSection[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [filterMaterial, setFilterMaterial] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    safeFetchJson('/api/kwa/pipelines')
      .then((data) => {
        if (Array.isArray(data)) setSections(data);
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
    sectionCode: '',
    sectionName: '',
    projectId: '',
    projectName: '',
    startChainageKm: 0,
    endChainageKm: 5,
    totalLengthMeters: 5000,
    diameterMm: 400,
    pipeMaterial: 'MS' as PipeMaterial,
    pipeClass: 'K9' as PipeClass,
    trenchDepthMeters: 2.2,
    beddingType: 'Granular Sand Cushion',
    crossingType: 'NATIONAL_HIGHWAY_HDD' as CrossingType,
    layingStatus: 'IN_PROGRESS' as 'NOT_STARTED' | 'TRENCHING' | 'LOWERING' | 'JOINTING' | 'IN_PROGRESS' | 'COMPLETED',
    laidLengthMeters: 3200,
    jointingCompletedCount: 260,
    hydroTestStatus: 'PENDING' as 'NOT_TESTED' | 'PENDING' | 'PASSED' | 'FAILED',
    hydroTestPressureBar: 10,
    witnessOfficialName: 'Senior Resident Engineer',
    remarks: 'Trenching along PWD corridor'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedProj = projectsList.find((p) => p.id === formData.projectId || p.name === formData.projectName);
      const payload = {
        ...formData,
        sectionCode: formData.sectionCode || `SEC-WATER-${Date.now().toString().slice(-4)}`,
        projectName: selectedProj ? selectedProj.name : (formData.projectName || 'Peruvannamuzhi WTP Scheme')
      };

      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/kwa/pipelines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const json = await safeJson(res);
      if (json?.success && json.data) {
        setSections([json.data, ...sections]);
        setIsModalOpen(false);
      } else {
        setSections([{ id: `sec_${Date.now()}`, ...payload } as any, ...sections]);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Error creating pipeline section:', err);
      setIsModalOpen(false);
    }
  };

  const filteredSections = sections.filter((sec) => {
    const matchesMat = filterMaterial === 'ALL' || sec.pipeMaterial === filterMaterial;
    const matchesSearch = sec.sectionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sec.sectionCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sec.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Pipeline Chainages & Transmission Network
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track MS, DI & HDPE pipeline lowering, jointing, trenching depth, bedding cushion, and highway/rail HDD crossings
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition flex items-center justify-center space-x-1.5 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Pipeline Chainage Section</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search chainage code, section name or scheme..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterMaterial}
            onChange={(e) => setFilterMaterial(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            <option value="ALL">All Materials (MS, DI, HDPE)</option>
            <option value="MS">Mild Steel (MS)</option>
            <option value="DI">Ductile Iron (DI)</option>
            <option value="HDPE">HDPE Polyethylene</option>
            <option value="PSC">Pre-stressed Concrete (PSC)</option>
          </select>
        </div>
      </div>

      {/* Pipeline Sections Grid */}
      <div className="space-y-4">
        {filteredSections.map((sec) => {
          const progressPercent = Math.min(100, Math.round((sec.laidLengthMeters / (sec.totalLengthMeters || 1)) * 100));

          return (
            <div
              key={sec.id}
              className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/40 transition"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-mono font-bold rounded">
                      {sec.sectionCode}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded">
                      {sec.pipeMaterial} {sec.diameterMm}mm ({sec.pipeClass || 'Class K9'})
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      sec.layingStatus === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {sec.layingStatus}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                    {sec.sectionName}
                  </h3>

                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-rose-500" /> KM {sec.startChainageKm} to KM {sec.endChainageKm}</span>
                    <span>•</span>
                    <span>{sec.projectName}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="block text-[11px] text-slate-400 font-medium">Laying Progress</span>
                    <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                      {sec.laidLengthMeters} / {sec.totalLengthMeters} m ({progressPercent}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 space-y-1">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              {/* Technical Specifications Footer */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                  <span className="block text-[10px] text-slate-400 font-medium">Trench & Cushion</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {sec.trenchDepthMeters}m depth • {sec.beddingType || 'Sand Cushion'}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                  <span className="block text-[10px] text-slate-400 font-medium">Crossing Specification</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {sec.crossingType || 'Standard Trenching'}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                  <span className="block text-[10px] text-slate-400 font-medium">Jointing Complete</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {sec.jointingCompletedCount || 0} Joints Welded/Coupled
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                  <span className="block text-[10px] text-slate-400 font-medium">Hydro Test Status</span>
                  <span className={`font-bold ${
                    sec.hydroTestStatus === 'PASSED' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {sec.hydroTestStatus} ({sec.hydroTestPressureBar || 10} bar)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Add Pipeline Section / Chainage Segment
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Section Name</label>
                <input
                  type="text"
                  placeholder="e.g. WTP Clear Water Gravity Main Segment B"
                  value={formData.sectionName}
                  onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pipe Material</label>
                  <select
                    value={formData.pipeMaterial}
                    onChange={(e) => setFormData({ ...formData, pipeMaterial: e.target.value as PipeMaterial })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  >
                    <option value="MS">Mild Steel (MS)</option>
                    <option value="DI">Ductile Iron (DI)</option>
                    <option value="HDPE">HDPE Polyethylene</option>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Length (Meters)</label>
                  <input
                    type="number"
                    value={formData.totalLengthMeters}
                    onChange={(e) => setFormData({ ...formData, totalLengthMeters: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Laid Length (Meters)</label>
                  <input
                    type="number"
                    value={formData.laidLengthMeters}
                    onChange={(e) => setFormData({ ...formData, laidLengthMeters: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow"
                >
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
