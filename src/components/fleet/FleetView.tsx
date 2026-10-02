import React, { useState, useEffect } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { DSPageHeader, DSButton, DSTabs } from '../ui/design-system';
import { 
  Vehicle, 
  Driver, 
  Equipment, 
  MaintenanceRecord, 
  FuelLog, 
  TripLog, 
  FleetNotification, 
  FleetAnalytics 
} from '../../types/fleet';
import { 
  Truck, 
  Wrench, 
  UserCheck, 
  Fuel, 
  Navigation, 
  AlertTriangle, 
  BarChart3, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Building2, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  MapPin,
  FileText
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

import { VehicleModal } from './VehicleModal';
import { DriverModal } from './DriverModal';
import { EquipmentModal } from './EquipmentModal';
import { MaintenanceModal } from './MaintenanceModal';
import { FuelModal } from './FuelModal';
import { TripLogModal } from './TripLogModal';
import { EnterpriseFleetTransportModule } from './EnterpriseFleetTransportModule';

export const FleetView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'phase59' | 'vehicles' | 'drivers' | 'equipment' | 'maintenance' | 'fuel' | 'trips' | 'notifications' | 'reports'
  >('phase59');

  // State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [tripLogs, setTripLogs] = useState<TripLog[]>([]);
  const [notifications, setNotifications] = useState<FleetNotification[]>([]);
  const [analytics, setAnalytics] = useState<FleetAnalytics | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modals
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);

  // Projects list for linking
  const activeProjectsList = [
    { id: 'proj-001', name: 'Peruvannamuzhi WTP Pipe Network' },
    { id: 'proj-002', name: 'Water Transmission Main Project' },
  ];

  const fetchFleetData = async () => {
    setLoading(true);
    try {
      const [vRes, dRes, eRes, mRes, fRes, tRes, nRes, aRes] = await Promise.all([
        fetch('/api/fleet/vehicles'),
        fetch('/api/fleet/drivers'),
        fetch('/api/fleet/equipment'),
        fetch('/api/fleet/maintenance'),
        fetch('/api/fleet/fuel-logs'),
        fetch('/api/fleet/trip-logs'),
        fetch('/api/fleet/notifications'),
        fetch('/api/fleet/analytics'),
      ]);

      if (vRes.ok) {
        const vData = await safeJson(vRes);
        setVehicles(vData?.data || []);
      }
      if (dRes.ok) {
        const dData = await safeJson(dRes);
        setDrivers(dData?.data || []);
      }
      if (eRes.ok) {
        const eData = await safeJson(eRes);
        setEquipment(eData?.data || []);
      }
      if (mRes.ok) {
        const mData = await safeJson(mRes);
        setMaintenanceRecords(mData?.data || []);
      }
      if (fRes.ok) {
        const fData = await safeJson(fRes);
        setFuelLogs(fData?.data || []);
      }
      if (tRes.ok) {
        const tData = await safeJson(tRes);
        setTripLogs(tData?.data || []);
      }
      if (nRes.ok) {
        const nData = await safeJson(nRes);
        setNotifications(nData?.data || []);
      }
      if (aRes.ok) {
        const aData = await safeJson(aRes);
        setAnalytics(aData?.data || null);
      }
    } catch (err) {
      console.error('Failed to load fleet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleetData();
  }, []);

  // Handlers for Save
  const handleSaveVehicle = async (vData: Partial<Vehicle>) => {
    try {
      if (editingVehicle) {
        await fetch(`/api/fleet/vehicles/${editingVehicle.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vData),
        });
      } else {
        await fetch('/api/fleet/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vData),
        });
      }
      fetchFleetData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveDriver = async (dData: Partial<Driver>) => {
    try {
      if (editingDriver) {
        await fetch(`/api/fleet/drivers/${editingDriver.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dData),
        });
      } else {
        await fetch('/api/fleet/drivers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dData),
        });
      }
      fetchFleetData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEquipment = async (eData: Partial<Equipment>) => {
    try {
      if (editingEquipment) {
        await fetch(`/api/fleet/equipment/${editingEquipment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eData),
        });
      } else {
        await fetch('/api/fleet/equipment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eData),
        });
      }
      fetchFleetData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveMaintenance = async (mRecord: Partial<MaintenanceRecord>) => {
    try {
      await fetch('/api/fleet/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mRecord),
      });
      fetchFleetData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveFuel = async (fLog: Partial<FuelLog>) => {
    try {
      await fetch('/api/fleet/fuel-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fLog),
      });
      fetchFleetData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveTrip = async (tLog: Partial<TripLog>) => {
    try {
      await fetch('/api/fleet/trip-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tLog),
      });
      fetchFleetData();
    } catch (err) {
      console.error(err);
    }
  };

  // Helper arrays for modals
  const vehicleListForSelect = vehicles.map(v => ({ id: v.id, number: v.vehicleNumber, driverId: v.assignedDriverId, driverName: v.assignedDriverName }));
  const driverListForSelect = drivers.map(d => ({ id: d.id, name: d.driverName }));
  const assetListForSelect = [
    ...vehicles.map(v => ({ id: v.id, name: `${v.manufacturer} ${v.model}`, code: v.vehicleNumber, type: 'VEHICLE' as const })),
    ...equipment.map(e => ({ id: e.id, name: e.equipmentName, code: e.equipmentCode, type: 'EQUIPMENT' as const })),
  ];

  // Filtering helpers
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch =
      v.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.assignedDriverName && v.assignedDriverName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredDrivers = drivers.filter(d => {
    const matchesSearch =
      d.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredEquipment = equipment.filter(e => {
    const matchesSearch =
      e.equipmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || e.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pie chart COLORS
  const COLORS = ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED'];

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <DSPageHeader
        title="Enterprise Fleet & Equipment Management"
        description="Heavy trucks, excavators, cranes, drivers, maintenance schedules, fuel logs, and statutory compliance"
        breadcrumbs={[{ label: 'ERP' }, { label: 'Fleet & Logistics' }]}
        actions={
          <>
            <DSButton
              variant="outline"
              size="sm"
              isLoading={loading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={fetchFleetData}
            >
              Refresh
            </DSButton>

            <DSButton
              variant="outline"
              size="sm"
              leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
              onClick={() => {
                const rows = ["Number,Type,Make/Model,Driver,Status,Compliance"]
                  .concat(vehicles.map(v => `"${v.vehicleNumber || ''}","${v.vehicleType || ''}","${v.manufacturer || ''} ${v.model || ''}","${v.assignedDriverName || 'Unassigned'}","${v.status || ''}","${v.statutoryComplianceStatus || ''}"`));
                const blob = new Blob([rows.join("\n")], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", `fleet_register_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
            >
              Export
            </DSButton>

            <DSButton
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setEditingVehicle(null);
                setIsVehicleModalOpen(true);
              }}
            >
              Vehicle
            </DSButton>

            <DSButton
              variant="secondary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setEditingEquipment(null);
                setIsEquipmentModalOpen(true);
              }}
            >
              Equipment
            </DSButton>
          </>
        }
      />

      {/* Expiry Alerts Banner (if notifications exist) */}
      {notifications.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl flex-shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                  Critical Compliance & Statutory Expiry Alerts ({notifications.length})
                </h3>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                {notifications[0]?.message}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('notifications')}
            className="self-start md:self-center px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition flex items-center gap-1 min-h-[36px]"
          >
            Review All Alerts <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Total Vehicles</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {analytics?.totalVehicles || vehicles.length}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {analytics?.activeVehicles || 0} Operational
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Heavy Machinery</span>
            <Wrench className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {analytics?.totalEquipment || equipment.length}
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {analytics?.operationalEquipment || 0} Working
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>On-Duty Drivers</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {analytics?.activeDrivers || drivers.length}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">Licensed Operators</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Fuel Spend (Mo)</span>
            <Fuel className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            ₹ {(analytics?.totalFuelSpendThisMonth || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold">
            {analytics?.totalFuelLitersThisMonth || 0} Liters
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Maintenance Cost</span>
            <Wrench className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            ₹ {(analytics?.totalMaintenanceCostThisMonth || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
            {analytics?.vehiclesInMaintenance || 0} In Repair
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Alerts & Expiries</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono text-rose-600">
            {analytics?.pendingExpiriesCount || notifications.length}
          </div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">Action Needed</div>
        </div>
      </div>

      {/* Primary Module Navigation Tabs */}
      <div className="pb-2">
        <DSTabs
          tabs={[
            { id: 'phase59', label: 'Enterprise Fleet Hub (Phase 59)', icon: <Truck className="w-4 h-4 text-blue-600" /> },
            { id: 'vehicles', label: `Vehicles Master (${vehicles.length})`, icon: <Truck className="w-4 h-4" /> },
            { id: 'drivers', label: `Drivers & Operators (${drivers.length})`, icon: <UserCheck className="w-4 h-4" /> },
            { id: 'equipment', label: `Heavy Machinery (${equipment.length})`, icon: <Wrench className="w-4 h-4" /> },
            { id: 'maintenance', label: `Maintenance Logs (${maintenanceRecords.length})`, icon: <Wrench className="w-4 h-4" /> },
            { id: 'fuel', label: `Fuel Management (${fuelLogs.length})`, icon: <Fuel className="w-4 h-4" /> },
            { id: 'trips', label: `Trip Movement Logs (${tripLogs.length})`, icon: <Navigation className="w-4 h-4" /> },
            { id: 'notifications', label: `Expiries & Alerts (${notifications.length})`, icon: <ShieldAlert className="w-4 h-4 text-rose-500" /> },
            { id: 'reports', label: 'Analytics & Utilization', icon: <BarChart3 className="w-4 h-4" /> },
          ]}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as any)}
          variant="underline"
        />
      </div>

      {activeTab === 'phase59' && (
        <EnterpriseFleetTransportModule />
      )}

      {/* Global Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search vehicle number, driver name, equipment..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto overflow-x-auto">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available / Operational</option>
              <option value="IN_USE">In Use</option>
              <option value="MAINTENANCE">Maintenance / Repair</option>
              <option value="BREAKDOWN">Breakdown</option>
              <option value="ACTIVE">Active (Drivers)</option>
            </select>
          </div>

          <button
            onClick={fetchFleetData}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium transition flex items-center gap-1 min-h-[36px]"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* TAB 1: VEHICLES MASTER */}
      {activeTab === 'vehicles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map(veh => (
            <div
              key={veh.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-blue-500/50 transition duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                  {veh.vehicleNumber}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    veh.status === 'AVAILABLE'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : veh.status === 'IN_USE'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : veh.status === 'MAINTENANCE'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {veh.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {veh.manufacturer} {veh.model} ({veh.year})
                </h3>
                <p className="text-xs text-slate-500 font-medium">{veh.vehicleType} • Tank: {veh.tankCapacityLiters}L</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 text-[10px]">Assigned Driver</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {veh.assignedDriverName || 'Unassigned'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Odometer Meter</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                    {veh.currentOdometerKm.toLocaleString()} Km
                  </div>
                </div>
              </div>

              <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-[11px] text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Assigned Project:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 truncate max-w-[150px]">
                    {veh.assignedProjectName || 'Central Pool'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Insurance Expiry:</span>
                  <span className={`font-mono font-bold ${
                    new Date(veh.insuranceExpiry) < new Date('2026-09-01') ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'
                  }`}>
                    {veh.insuranceExpiry}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Fitness Expiry:</span>
                  <span className="font-mono">{veh.fitnessExpiry}</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setEditingVehicle(veh);
                    setIsVehicleModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
                >
                  Edit Master
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: DRIVERS & OPERATORS */}
      {activeTab === 'drivers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map(drv => (
            <div
              key={drv.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-emerald-500/50 transition duration-150"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center justify-center font-mono">
                    {drv.driverName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{drv.driverName}</h3>
                    <p className="text-xs text-slate-500">{drv.experienceYears} Years Exp • {drv.licenseCategory}</p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    drv.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {drv.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Commercial License:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{drv.licenseNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">License Expiry:</span>
                  <span
                    className={`font-mono font-bold ${
                      new Date(drv.licenseExpiry) < new Date('2026-09-01')
                        ? 'text-rose-600 dark:text-rose-400 animate-pulse'
                        : 'text-emerald-600'
                    }`}
                  >
                    {drv.licenseExpiry}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Vehicle:</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                    {drv.assignedVehicleNumber || 'Spare / Floating Driver'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mobile Contact:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{drv.contactNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Emergency Contact:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {drv.emergencyContactName} ({drv.emergencyContactPhone})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  onClick={() => {
                    setEditingDriver(drv);
                    setIsDriverModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: HEAVY MACHINERY ASSETS */}
      {activeTab === 'equipment' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map(eqp => (
            <div
              key={eqp.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-indigo-500/50 transition duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  {eqp.equipmentCode}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    eqp.status === 'OPERATIONAL'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : eqp.status === 'IDLE'
                      ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {eqp.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{eqp.equipmentName}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {eqp.manufacturer} {eqp.model} • SN: {eqp.serialNumber}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 text-[10px]">Assigned Operator</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {eqp.assignedOperatorName || 'Unassigned'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Hour Meter</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                    {eqp.runningHours.toLocaleString()} Hours
                  </div>
                </div>
              </div>

              <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-[11px] text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Current Site Location:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{eqp.currentLocation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Project:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 truncate max-w-[150px]">
                    {eqp.assignedProjectName || 'Main Yard'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Warranty Expiry:</span>
                  <span className="font-mono">{eqp.warrantyExpiry}</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  onClick={() => {
                    setEditingEquipment(eqp);
                    setIsEquipmentModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
                >
                  Edit Asset
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: MAINTENANCE LOGS & REPAIRS */}
      {activeTab === 'maintenance' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 bg-[#0B192C] text-white flex items-center justify-between border-b border-slate-800">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" /> Maintenance & Workshop Repair Logs
            </h3>
            <span className="text-xs text-slate-400">{maintenanceRecords.length} Active Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Log Ref</th>
                  <th className="p-3">Asset</th>
                  <th className="p-3">Type & Category</th>
                  <th className="p-3">Service Date</th>
                  <th className="p-3">Vendor / Workshop</th>
                  <th className="p-3">Cost (₹)</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {maintenanceRecords.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">{m.maintenanceCode}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white">{m.assetName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{m.assetCode}</div>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-amber-600 dark:text-amber-400">{m.maintenanceType}</span>
                      <div className="text-[10px] text-slate-500">{m.category}</div>
                    </td>
                    <td className="p-3 font-mono">{m.serviceDate}</td>
                    <td className="p-3 font-medium">{m.vendorName}</td>
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                      ₹ {m.costAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: FUEL MANAGEMENT */}
      {activeTab === 'fuel' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Fuel className="w-4 h-4 text-orange-600" /> Project-wise Fuel Consumption Breakdown
              </h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.projectFuelBreakdown || []}>
                    <XAxis dataKey="projectName" stroke="#94a3b8" fontSize={10} tickFormatter={val => val.slice(0, 15) + '...'} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="spend" fill="#f97316" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Fuel className="w-4 h-4 text-orange-600" /> Fuel Summary & Efficiency Rates
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-orange-50 dark:bg-orange-950/40 rounded-xl border border-orange-200 dark:border-orange-800 flex justify-between items-center">
                  <span className="font-medium text-orange-900 dark:text-orange-200">Average Heavy Fleet Mileage:</span>
                  <span className="font-mono font-bold text-orange-600 dark:text-orange-400 text-sm">
                    {analytics?.avgVehicleMileageKmPerLiter} Km/Liter
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Total Fuel Issued This Month:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                    {analytics?.totalFuelLitersThisMonth} Liters
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 bg-[#0B192C] text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Fuel className="w-4 h-4 text-orange-400" /> Fuel Issue & Refill Log History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Refill Code</th>
                    <th className="p-3">Asset</th>
                    <th className="p-3">Quantity (L)</th>
                    <th className="p-3">Rate (₹)</th>
                    <th className="p-3">Total Cost (₹)</th>
                    <th className="p-3">Meter Reading</th>
                    <th className="p-3">Station / Bowser</th>
                    <th className="p-3">Fill Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                  {fuelLogs.map(f => (
                    <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3 font-bold text-orange-600 dark:text-orange-400">{f.fuelLogCode}</td>
                      <td className="p-3 font-sans">
                        <div className="font-bold text-slate-900 dark:text-white">{f.assetName}</div>
                        <div className="text-[10px] text-slate-400">{f.assetCode}</div>
                      </td>
                      <td className="p-3 font-bold">{f.quantityLiters} L</td>
                      <td className="p-3">₹ {f.unitPrice}</td>
                      <td className="p-3 font-bold text-emerald-600">₹ {f.totalCost.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-slate-500">
                        {f.odometerReadingKm ? `${f.odometerReadingKm} Km` : `${f.runningHours} Hrs`}
                      </td>
                      <td className="p-3 font-sans font-medium">{f.fuelStation}</td>
                      <td className="p-3">{f.fillDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: TRIP MOVEMENT LOGS */}
      {activeTab === 'trips' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 bg-[#0B192C] text-white flex items-center justify-between border-b border-slate-800">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Navigation className="w-4 h-4 text-teal-400" /> Vehicle Movement & Dispatch Log
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Trip Code</th>
                  <th className="p-3">Vehicle</th>
                  <th className="p-3">Driver</th>
                  <th className="p-3">Origin</th>
                  <th className="p-3">Destination</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Gate Pass</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {tripLogs.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3 font-mono font-bold text-teal-600 dark:text-teal-400">{t.tripCode}</td>
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{t.vehicleNumber}</td>
                    <td className="p-3 font-medium">{t.driverName}</td>
                    <td className="p-3 font-medium text-slate-600 dark:text-slate-300">{t.origin}</td>
                    <td className="p-3 font-medium text-blue-600 dark:text-blue-400">{t.destination}</td>
                    <td className="p-3 text-[11px] font-semibold">{t.purpose}</td>
                    <td className="p-3 font-mono text-slate-500">{t.gatePassRef || 'N/A'}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: NOTIFICATIONS & COMPLIANCE ALERTS */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" /> Compliance Expiries & Maintenance Reminders
            </h3>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-mono">
              {notifications.length} Action Items
            </span>
          </div>

          <div className="space-y-3">
            {notifications.map(n => (
              <div
                key={n.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start space-x-4"
              >
                <div
                  className={`p-2.5 rounded-xl flex-shrink-0 ${
                    n.urgency === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                  }`}
                >
                  <AlertCircle className="w-5 h-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{n.title}</h4>
                    <span className="text-[10px] font-mono text-slate-400">{n.createdAt.slice(0, 10)}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>
                  <div className="mt-2 flex items-center space-x-4 text-[11px]">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">Asset: {n.assetName}</span>
                    <span className="font-mono font-bold text-amber-600">Due Date: {n.dueDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: ANALYTICS & UTILIZATION REPORTS */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" /> Fleet Category Utilization (%)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.utilizationRates || []}>
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} unit="%" />
                  <Tooltip />
                  <Bar dataKey="ratePercent" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" /> Asset Availability Breakdown
            </h3>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Operational Vehicles', value: analytics?.activeVehicles || 3 },
                      { name: 'Under Maintenance', value: analytics?.vehiclesInMaintenance || 1 },
                      { name: 'Heavy Machinery', value: analytics?.operationalEquipment || 4 },
                      { name: 'Idle Machinery', value: analytics?.idleEquipment || 1 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        onSave={handleSaveVehicle}
        initialData={editingVehicle}
        drivers={driverListForSelect}
        projects={activeProjectsList}
      />

      <DriverModal
        isOpen={isDriverModalOpen}
        onClose={() => setIsDriverModalOpen(false)}
        onSave={handleSaveDriver}
        initialData={editingDriver}
        vehicles={vehicleListForSelect}
      />

      <EquipmentModal
        isOpen={isEquipmentModalOpen}
        onClose={() => setIsEquipmentModalOpen(false)}
        onSave={handleSaveEquipment}
        initialData={editingEquipment}
        projects={activeProjectsList}
      />

      <MaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        onSave={handleSaveMaintenance}
        assets={assetListForSelect}
      />

      <FuelModal
        isOpen={isFuelModalOpen}
        onClose={() => setIsFuelModalOpen(false)}
        onSave={handleSaveFuel}
        assets={assetListForSelect}
        projects={activeProjectsList}
      />

      <TripLogModal
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
        onSave={handleSaveTrip}
        vehicles={vehicleListForSelect}
        drivers={driverListForSelect}
        projects={activeProjectsList}
      />
    </div>
  );
};
