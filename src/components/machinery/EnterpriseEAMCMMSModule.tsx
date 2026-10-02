import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  ShieldCheck, 
  Truck, 
  Fuel, 
  Gauge, 
  AlertTriangle, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Activity, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  QrCode, 
  Settings, 
  Layers, 
  ArrowRightLeft, 
  UserCheck, 
  FileText 
} from 'lucide-react';
import { safeJson } from '../../lib/safeFetch';

export const EnterpriseEAMCMMSModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'assets' | 'work-orders' | 'maintenance-plans' | 'fuel-logs' | 'calibrations'>('dashboard');
  
  // State
  const [assets, setAssets] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [maintenancePlans, setMaintenancePlans] = useState<any[]>([]);
  const [fuelLogs, setFuelLogs] = useState<any[]>([]);
  const [calibrations, setCalibrations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals
  const [showRegisterAssetModal, setShowRegisterAssetModal] = useState(false);
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [showFuelModal, setShowFuelModal] = useState(false);

  // Form State
  const [assetForm, setAssetForm] = useState({
    name: '',
    category: 'HEAVY_EQUIPMENT',
    manufacturer: '',
    model: '',
    serialNumber: '',
    currentLocation: '',
    purchaseValue: 150000,
    purchaseDate: '2026-01-15',
    criticality: 'HIGH',
  });

  const [workOrderForm, setWorkOrderForm] = useState({
    assetId: '',
    workOrderType: 'PREVENTIVE',
    priority: 'MEDIUM',
    summary: '',
    description: '',
    assignedTechnician: '',
    scheduledStartDate: '2026-08-15',
    scheduledEndDate: '2026-08-16',
  });

  const [fuelForm, setFuelForm] = useState({
    assetId: '',
    fuelType: 'DIESEL',
    quantityLiters: 250,
    pricePerLiter: 3.85,
    fuelStationVendor: 'ENOC Distribution',
    driverOrOperatorName: 'Tariq Al-Mansoori',
    logDate: '2026-08-12',
  });

  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

  const fetchAllData = async () => {
    setLoading(true);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const [resAssets, resWO, resPlans, resFuel, resCal, resStats] = await Promise.all([
        fetch('/api/eam/assets', { headers }),
        fetch('/api/eam/maintenance/work-orders', { headers }),
        fetch('/api/eam/maintenance/plans', { headers }),
        fetch('/api/eam/fuel/logs', { headers }),
        fetch('/api/eam/calibrations', { headers }),
        fetch('/api/eam/stats', { headers }),
      ]);

      const dataAssets = await safeJson(resAssets);
      const dataWO = await safeJson(resWO);
      const dataPlans = await safeJson(resPlans);
      const dataFuel = await safeJson(resFuel);
      const dataCal = await safeJson(resCal);
      const dataStats = await safeJson(resStats);

      if (dataAssets?.data) setAssets(dataAssets.data);
      if (dataWO?.data) setWorkOrders(dataWO.data);
      if (dataPlans?.data) setMaintenancePlans(dataPlans.data);
      if (dataFuel?.data) setFuelLogs(dataFuel.data);
      if (dataCal?.data) setCalibrations(dataCal.data);
      if (dataStats?.data) setStats(dataStats.data);
    } catch (e) {
      console.error('Failed to load EAM data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/eam/assets', {
      method: 'POST',
      headers,
      body: JSON.stringify(assetForm),
    });
    const data = await safeJson(res);
    if (data?.success) {
      setShowRegisterAssetModal(false);
      fetchAllData();
    } else {
      alert(data?.message || 'Failed to register asset');
    }
  };

  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/eam/maintenance/work-orders', {
      method: 'POST',
      headers,
      body: JSON.stringify(workOrderForm),
    });
    const data = await safeJson(res);
    if (data?.success) {
      setShowWorkOrderModal(false);
      fetchAllData();
    } else {
      alert(data?.message || 'Failed to create work order');
    }
  };

  const handleCreateFuelLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/eam/fuel/logs', {
      method: 'POST',
      headers,
      body: JSON.stringify(fuelForm),
    });
    const data = await safeJson(res);
    if (data?.success) {
      setShowFuelModal(false);
      fetchAllData();
    } else {
      alert(data?.message || 'Failed to log fuel');
    }
  };

  const filteredAssets = assets.filter(a => {
    const matchesSearch = !searchQuery || 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.assetNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = !categoryFilter || a.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-blue-500/20 text-blue-400 font-mono text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-blue-500/30">
                Phase 58 • Enterprise EAM / CMMS
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Enterprise Asset & Preventive Maintenance Management
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Plant machinery lifecycle, breakdown work orders, condition monitoring, fuel telemetry & calibration tracking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRegisterAssetModal(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs shadow-lg transition flex items-center gap-2 min-h-[44px]"
            >
              <Plus className="w-4 h-4" /> Register Asset
            </button>
            <button
              onClick={() => setShowWorkOrderModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-xs shadow-lg transition flex items-center gap-2 min-h-[44px]"
            >
              <Wrench className="w-4 h-4" /> Issue Work Order
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'EAM Dashboard', icon: BarChart3 },
            { id: 'assets', label: 'Asset Register', icon: Truck, count: assets.length },
            { id: 'work-orders', label: 'Work Orders', icon: Wrench, count: workOrders.length },
            { id: 'maintenance-plans', label: 'PM Schedules', icon: Calendar, count: maintenancePlans.length },
            { id: 'fuel-logs', label: 'Fuel Logs', icon: Fuel, count: fuelLogs.length },
            { id: 'calibrations', label: 'Calibrations', icon: ShieldCheck, count: calibrations.length },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition min-h-[40px] ${
                  active 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Portfolio Assets</span>
            <div className="text-xl font-black text-slate-900 dark:text-white">{stats.totalAssets}</div>
            <div className="text-[10px] text-emerald-600 font-semibold">{stats.activeAssets} Operational</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Under Maintenance</span>
            <div className="text-xl font-black text-amber-600 dark:text-amber-400">{stats.underMaintenance}</div>
            <div className="text-[10px] text-slate-500">{stats.pendingWorkOrders} Work Orders</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Portfolio Capital Value</span>
            <div className="text-xl font-black text-blue-600 dark:text-blue-400">
              AED {(stats.totalAssetValue / 1000).toFixed(0)}k
            </div>
            <div className="text-[10px] text-slate-500">Asset Valuation</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Maintenance Cost</span>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              AED {stats.totalMaintenanceCost?.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">{stats.totalDowntimeHours} Hrs Downtime</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">MTBF (Mean Time)</span>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{stats.mtbfHours} Hrs</div>
            <div className="text-[10px] text-slate-500">Between Failures</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">MTTR (Repair Time)</span>
            <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">{stats.mttrHours} Hrs</div>
            <div className="text-[10px] text-slate-500">Mean Time To Repair</div>
          </div>
        </div>
      )}

      {/* DASHBOARD SUBTAB */}
      {activeSubTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" /> Active High-Priority Work Orders
                </h3>
                <button onClick={() => setActiveSubTab('work-orders')} className="text-xs font-bold text-blue-600 hover:underline">View All</button>
              </div>

              <div className="space-y-3">
                {workOrders.slice(0, 4).map(wo => (
                  <div key={wo.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{wo.workOrderNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          wo.priority === 'HIGH' || wo.priority === 'EMERGENCY' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {wo.priority}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{wo.summary}</div>
                      <div className="text-xs text-slate-500">Asset: {wo.assetName} • Tech: {wo.assignedTechnician}</div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {wo.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Fuel className="w-5 h-5 text-amber-600" /> Recent Fuel & Meter Readings
              </h3>

              <div className="space-y-3">
                {fuelLogs.slice(0, 4).map(f => (
                  <div key={f.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{f.assetName}</div>
                      <div className="text-slate-500">{f.quantityLiters} Liters @ AED {f.pricePerLiter}/L</div>
                    </div>
                    <div className="font-bold text-emerald-600">AED {f.totalAmount}</div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowFuelModal(true)} 
                className="w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 font-bold text-xs border border-amber-200 dark:border-amber-800 transition"
              >
                + Log Fuel Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSETS REGISTER SUBTAB */}
      {activeSubTab === 'assets' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search asset name, asset tag, serial, manufacturer..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="">All Asset Categories</option>
              <option value="HEAVY_EQUIPMENT">Heavy Equipment</option>
              <option value="VEHICLE">Vehicles & Fleet</option>
              <option value="GENERATOR">Generators & Power</option>
              <option value="PUMP">Pumps & Piping</option>
              <option value="TOOL">Tools & Portable</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map(asset => (
              <div key={asset.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    {asset.assetNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    asset.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {asset.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">{asset.name}</h4>
                  <p className="text-xs text-slate-500">{asset.manufacturer} {asset.model} • S/N: {asset.serialNumber}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[10px]">Location</span>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{asset.currentLocation}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Purchase Value</span>
                    <div className="font-bold text-slate-900 dark:text-white">AED {asset.purchaseValue?.toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1"><QrCode className="w-3.5 h-3.5 text-blue-500" /> QR Code Ready</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{asset.runningHoursMeter} Running Hours</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WORK ORDERS SUBTAB */}
      {activeSubTab === 'work-orders' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">CMMS Maintenance Work Orders</h3>
            <button
              onClick={() => setShowWorkOrderModal(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Issue Work Order
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                  <th className="p-3">WO Number</th>
                  <th className="p-3">Asset</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Summary</th>
                  <th className="p-3">Technician</th>
                  <th className="p-3">Cost (AED)</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {workOrders.map(wo => (
                  <tr key={wo.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="p-3 font-mono font-bold text-blue-600">{wo.workOrderNumber}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{wo.assetName}</td>
                    <td className="p-3">{wo.workOrderType}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        wo.priority === 'HIGH' || wo.priority === 'EMERGENCY' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {wo.priority}
                      </span>
                    </td>
                    <td className="p-3 max-w-xs truncate">{wo.summary}</td>
                    <td className="p-3">{wo.assignedTechnician}</td>
                    <td className="p-3 font-bold">AED {wo.totalCost || 0}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        {wo.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS */}
      {showRegisterAssetModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-black text-lg text-slate-900 dark:text-white">Register New EAM Asset</h3>
            <form onSubmit={handleCreateAsset} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-bold">Asset Name</label>
                <input
                  type="text"
                  required
                  value={assetForm.name}
                  onChange={e => setAssetForm({ ...assetForm, name: e.target.value })}
                  placeholder="e.g., CAT 330 Crawler Excavator"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-bold">Manufacturer</label>
                  <input
                    type="text"
                    required
                    value={assetForm.manufacturer}
                    onChange={e => setAssetForm({ ...assetForm, manufacturer: e.target.value })}
                    placeholder="e.g., Caterpillar"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-bold">Model</label>
                  <input
                    type="text"
                    required
                    value={assetForm.model}
                    onChange={e => setAssetForm({ ...assetForm, model: e.target.value })}
                    placeholder="e.g., 330-07"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-bold">Serial Number</label>
                  <input
                    type="text"
                    required
                    value={assetForm.serialNumber}
                    onChange={e => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
                    placeholder="CAT-992381-X"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-bold">Location</label>
                  <input
                    type="text"
                    required
                    value={assetForm.currentLocation}
                    onChange={e => setAssetForm({ ...assetForm, currentLocation: e.target.value })}
                    placeholder="Dubai South Site Zone A"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-bold">Purchase Value (AED)</label>
                  <input
                    type="number"
                    required
                    value={assetForm.purchaseValue}
                    onChange={e => setAssetForm({ ...assetForm, purchaseValue: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-bold">Category</label>
                  <select
                    value={assetForm.category}
                    onChange={e => setAssetForm({ ...assetForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="HEAVY_EQUIPMENT">Heavy Equipment</option>
                    <option value="VEHICLE">Vehicle & Fleet</option>
                    <option value="GENERATOR">Generator</option>
                    <option value="PUMP">Pump</option>
                    <option value="TOOL">Tool</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterAssetModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
