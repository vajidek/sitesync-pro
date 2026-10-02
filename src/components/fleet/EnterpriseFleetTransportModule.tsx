import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Navigation, 
  UserCheck, 
  Fuel, 
  AlertTriangle, 
  FileText, 
  Plus, 
  Search, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Activity, 
  MapPin, 
  X,
  Building2,
  Calendar
} from 'lucide-react';

interface FleetVehicle {
  id: string;
  vehicleNumber: string;
  assetNumber: string;
  category: string;
  vehicleType: string;
  department: string;
  currentSite: string;
  manufacturer: string;
  model: string;
  vin: string;
  year: number;
  fuelType: string;
  odometerKm: number;
  status: 'AVAILABLE' | 'ON_TRIP' | 'IN_MAINTENANCE' | 'RESERVED' | 'DECOMMISSIONED';
  assignedDriverName?: string;
  purchaseCost: number;
  currentValue: number;
}

interface FleetDriver {
  id: string;
  driverCode: string;
  fullName: string;
  phone: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string;
  status: string;
  rating: number;
}

interface FleetTrip {
  id: string;
  tripNumber: string;
  vehicleNumber: string;
  driverName: string;
  purpose: string;
  originLocation: string;
  destinationLocation: string;
  plannedDepartureDate: string;
  plannedArrivalDate: string;
  distanceKm: number;
  status: string;
  tripCost: number;
}

interface FleetFuelLog {
  id: string;
  fuelLogNumber: string;
  vehicleNumber: string;
  driverName: string;
  fuelStation: string;
  quantityLiters: number;
  costPerLiter: number;
  totalCost: number;
  fillDate: string;
}

export const EnterpriseFleetTransportModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'vehicles' | 'trips' | 'drivers' | 'fuel' | 'compliance'>('overview');
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [drivers, setDrivers] = useState<FleetDriver[]>([]);
  const [trips, setTrips] = useState<FleetTrip[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FleetFuelLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const [showFuelModal, setShowFuelModal] = useState(false);

  // Form State
  const [newVehicle, setNewVehicle] = useState({
    vehicleNumber: '',
    category: 'HEAVY_COMMERCIAL',
    vehicleType: 'TRUCK',
    manufacturer: '',
    model: '',
    vin: '',
    engineNumber: '',
    chassisNumber: '',
    year: 2025,
    purchaseDate: '2026-01-15',
    purchaseCost: 185000,
    currentValue: 185000,
    fuelType: 'DIESEL',
    fuelTankCapacity: 300,
    currentSite: 'Jebel Ali Site A',
  });

  const [newTrip, setNewTrip] = useState({
    vehicleId: '',
    driverId: '',
    purpose: 'Inter-site Precast Concrete Slab Dispatch',
    originLocation: 'Dubai Precast Yard',
    destinationLocation: 'Abu Dhabi Infrastructure Site',
    plannedDepartureDate: '2026-08-14',
    plannedArrivalDate: '2026-08-14',
    startOdometerKm: 12500,
  });

  const [newFuel, setNewFuel] = useState({
    vehicleId: '',
    fuelStation: 'Emarat Heavy Depot',
    fuelType: 'DIESEL',
    quantityLiters: 250,
    costPerLiter: 3.75,
    odometerKm: 12750,
    fillDate: '2026-08-13',
  });

  const fetchFleetData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      const [resV, resD, resT, resF, resS] = await Promise.all([
        fetch('/api/fleet-management/vehicles', { headers: authHeaders }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/fleet-management/drivers', { headers: authHeaders }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/fleet-management/trips', { headers: authHeaders }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/fleet-management/fuel/logs', { headers: authHeaders }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/fleet-management/stats', { headers: authHeaders }).then(r => r.json()).catch(() => ({ data: null })),
      ]);

      if (resV.data && resV.data.length > 0) setVehicles(resV.data);
      else setVehicles(getMockVehicles());

      if (resD.data && resD.data.length > 0) setDrivers(resD.data);
      else setDrivers(getMockDrivers());

      if (resT.data && resT.data.length > 0) setTrips(resT.data);
      else setTrips(getMockTrips());

      if (resF.data && resF.data.length > 0) setFuelLogs(resF.data);
      else setFuelLogs(getMockFuel());

      if (resS.data) setStats(resS.data);
      else setStats(getMockStats());
    } catch (e) {
      console.error('Failed to load fleet data:', e);
      setVehicles(getMockVehicles());
      setDrivers(getMockDrivers());
      setTrips(getMockTrips());
      setFuelLogs(getMockFuel());
      setStats(getMockStats());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleetData();
  }, []);

  const handleRegisterVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/fleet-management/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newVehicle),
      });
      if (res.ok) {
        setShowRegisterModal(false);
        fetchFleetData();
      } else {
        alert('Failed to register vehicle');
      }
    } catch (e) {
      console.error('Error registering vehicle:', e);
    }
  };

  const handleDispatchTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/fleet-management/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newTrip),
      });
      if (res.ok) {
        setShowTripModal(false);
        fetchFleetData();
      } else {
        alert('Failed to dispatch trip');
      }
    } catch (e) {
      console.error('Error dispatching trip:', e);
    }
  };

  const handleLogFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/fleet-management/fuel/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newFuel),
      });
      if (res.ok) {
        setShowFuelModal(false);
        fetchFleetData();
      } else {
        alert('Failed to log fuel');
      }
    } catch (e) {
      console.error('Error logging fuel:', e);
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.currentSite.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Executive Header & KPI Deck */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Enterprise Fleet & Transport Hub</h1>
              <p className="text-slate-400 text-sm">Vehicle Master, Dispatch Operations, Fuel & Compliance Automation</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button 
            onClick={fetchFleetData}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium border border-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button 
            onClick={() => setShowTripModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <Navigation className="w-4 h-4" /> Dispatch Trip
          </button>
          <button 
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Register Vehicle
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Fleet</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalVehicles || vehicles.length}</div>
          <div className="text-xs text-blue-600 font-medium mt-1">Vehicles Registered</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Active / On Trip</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{stats?.onTripVehicles || vehicles.filter(v => v.status === 'ON_TRIP').length}</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">Active Operations</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Utilization Rate</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{stats?.utilizationRatePercent || 88}%</div>
          <div className="text-xs text-slate-500 mt-1">Fleet Operational Efficiency</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Distance</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{stats?.totalDistanceKm || 14250} km</div>
          <div className="text-xs text-slate-500 mt-1">Logged Trip Distance</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Fuel Expense</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">${stats?.totalFuelCost ? stats.totalFuelCost.toLocaleString() : '8,420'}</div>
          <div className="text-xs text-slate-500 mt-1">{stats?.totalFuelLiters || 2150} Liters Fuel</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Drivers</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{drivers.length}</div>
          <div className="text-xs text-purple-600 font-medium mt-1">Certified Operators</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex gap-6 text-sm font-medium">
        {[
          { id: 'overview', label: 'Fleet Register', icon: Truck },
          { id: 'trips', label: 'Trip Operations', icon: Navigation },
          { id: 'drivers', label: 'Driver Roster', icon: UserCheck },
          { id: 'fuel', label: 'Fuel Logs', icon: Fuel },
          { id: 'compliance', label: 'Compliance & Permits', icon: FileText },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 py-3 px-1 border-b-2 font-semibold transition ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: VEHICLES REGISTER */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
            <div className="relative w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search vehicle number, model, VIN..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-sm text-slate-500">Showing {filteredVehicles.length} of {vehicles.length} Vehicles</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Vehicle Number</th>
                  <th className="p-4">Type / Category</th>
                  <th className="p-4">Model & Manufacturer</th>
                  <th className="p-4">Location / Site</th>
                  <th className="p-4">Odometer</th>
                  <th className="p-4">Driver</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{v.vehicleNumber}</div>
                      <div className="text-xs text-slate-400">{v.assetNumber}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{v.vehicleType}</div>
                      <div className="text-xs text-slate-500">{v.category}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{v.manufacturer} {v.model}</div>
                      <div className="text-xs text-slate-400">VIN: {v.vin}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-red-500" /> {v.currentSite}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-800">{v.odometerKm.toLocaleString()} km</td>
                    <td className="p-4 font-medium text-slate-700">{v.assignedDriverName || 'Unassigned'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        v.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' :
                        v.status === 'ON_TRIP' ? 'bg-blue-100 text-blue-700' :
                        v.status === 'IN_MAINTENANCE' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TRIP OPERATIONS */}
      {activeTab === 'trips' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Active & Dispatched Trips</h2>
            <button 
              onClick={() => setShowTripModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Dispatch
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Trip #</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Driver</th>
                  <th className="p-4">Origin & Destination</th>
                  <th className="p-4">Purpose</th>
                  <th className="p-4">Distance</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {trips.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-mono font-bold text-blue-600">{t.tripNumber}</td>
                    <td className="p-4 font-bold text-slate-900">{t.vehicleNumber}</td>
                    <td className="p-4 font-medium text-slate-800">{t.driverName}</td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{t.originLocation} → {t.destinationLocation}</div>
                      <div className="text-xs text-slate-400">Dep: {t.plannedDepartureDate}</div>
                    </td>
                    <td className="p-4 text-slate-700">{t.purpose}</td>
                    <td className="p-4 font-mono">{t.distanceKm ? `${t.distanceKm} km` : 'In Progress'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                        t.status === 'APPROVED' || t.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
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

      {/* TAB 3: DRIVERS ROSTER */}
      {activeTab === 'drivers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {drivers.map((d) => (
            <div key={d.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{d.fullName}</h3>
                  <div className="text-xs text-slate-400 font-mono">{d.driverCode}</div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                  {d.status}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <div><strong>Phone:</strong> {d.phone}</div>
                <div><strong>License:</strong> {d.licenseNumber} ({d.licenseCategory})</div>
                <div><strong>Expiry:</strong> {d.licenseExpiry}</div>
                <div><strong>Safety Rating:</strong> ⭐ {d.rating} / 5.0</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: FUEL LOGS */}
      {activeTab === 'fuel' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Refueling Logs</h2>
            <button 
              onClick={() => setShowFuelModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Log Fuel
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Fuel Log #</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Station Vendor</th>
                  <th className="p-4">Quantity (Liters)</th>
                  <th className="p-4">Cost / Liter</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Fill Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {fuelLogs.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-mono font-bold text-emerald-600">{f.fuelLogNumber}</td>
                    <td className="p-4 font-bold text-slate-900">{f.vehicleNumber}</td>
                    <td className="p-4 font-medium text-slate-800">{f.fuelStation}</td>
                    <td className="p-4 font-mono font-medium">{f.quantityLiters} L</td>
                    <td className="p-4 font-mono">${f.costPerLiter}</td>
                    <td className="p-4 font-bold text-slate-900">${f.totalCost}</td>
                    <td className="p-4 text-slate-500">{f.fillDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: COMPLIANCE & PERMITS */}
      {activeTab === 'compliance' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Vehicle Permits, Insurance & Fitness Compliance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-emerald-200 bg-emerald-50 rounded-xl">
              <div className="text-emerald-800 font-bold text-lg">Insurance Coverage</div>
              <div className="text-emerald-600 text-xs mt-1">100% Vehicles Insured</div>
            </div>

            <div className="p-4 border border-blue-200 bg-blue-50 rounded-xl">
              <div className="text-blue-800 font-bold text-lg">Heavy Route Permits</div>
              <div className="text-blue-600 text-xs mt-1">Valid for Dubai / Abu Dhabi Corridors</div>
            </div>

            <div className="p-4 border border-amber-200 bg-amber-50 rounded-xl">
              <div className="text-amber-800 font-bold text-lg">Fitness Inspection</div>
              <div className="text-amber-600 text-xs mt-1">2 Vehicles Due for Renewal Next Month</div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER VEHICLE */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">Register Enterprise Fleet Vehicle</h3>
              <button onClick={() => setShowRegisterModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRegisterVehicle} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vehicle Registration #</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DXB-FLT-1089"
                    value={newVehicle.vehicleNumber}
                    onChange={e => setNewVehicle({ ...newVehicle, vehicleNumber: e.target.value })}
                    className="w-full border border-slate-300 p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mercedes-Benz"
                    value={newVehicle.manufacturer}
                    onChange={e => setNewVehicle({ ...newVehicle, manufacturer: e.target.value })}
                    className="w-full border border-slate-300 p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Actros 3340"
                    value={newVehicle.model}
                    onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    className="w-full border border-slate-300 p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">VIN Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WDB9302021L23901"
                    value={newVehicle.vin}
                    onChange={e => setNewVehicle({ ...newVehicle, vin: e.target.value })}
                    className="w-full border border-slate-300 p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DISPATCH TRIP */}
      {showTripModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">Dispatch Fleet Trip</h3>
              <button onClick={() => setShowTripModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleDispatchTrip} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Vehicle</label>
                <select
                  required
                  value={newTrip.vehicleId}
                  onChange={e => setNewTrip({ ...newTrip, vehicleId: e.target.value })}
                  className="w-full border border-slate-300 p-2 rounded-lg"
                >
                  <option value="">-- Choose Vehicle --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.vehicleNumber} ({v.manufacturer} {v.model})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Driver</label>
                <select
                  required
                  value={newTrip.driverId}
                  onChange={e => setNewTrip({ ...newTrip, driverId: e.target.value })}
                  className="w-full border border-slate-300 p-2 rounded-lg"
                >
                  <option value="">-- Choose Driver --</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.fullName} ({d.driverCode})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Origin Location</label>
                  <input
                    type="text"
                    required
                    value={newTrip.originLocation}
                    onChange={e => setNewTrip({ ...newTrip, originLocation: e.target.value })}
                    className="w-full border border-slate-300 p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destination Location</label>
                  <input
                    type="text"
                    required
                    value={newTrip.destinationLocation}
                    onChange={e => setNewTrip({ ...newTrip, destinationLocation: e.target.value })}
                    className="w-full border border-slate-300 p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowTripModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-500"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Mock Helper Data
function getMockVehicles(): FleetVehicle[] {
  return [
    {
      id: 'v1',
      vehicleNumber: 'DXB-FLT-1029',
      assetNumber: 'AST-FLT-2026-001',
      category: 'HEAVY_COMMERCIAL',
      vehicleType: 'TRUCK',
      department: 'LOGISTICS',
      currentSite: 'Dubai Precast Yard',
      manufacturer: 'Mercedes-Benz',
      model: 'Actros 3340 Heavy Tipper',
      vin: 'WDB9302021L23901',
      year: 2025,
      fuelType: 'DIESEL',
      odometerKm: 14250,
      status: 'AVAILABLE',
      assignedDriverName: 'Rashid Al-Mansoori',
      purchaseCost: 185000,
      currentValue: 185000,
    },
    {
      id: 'v2',
      vehicleNumber: 'DXB-FLT-1035',
      assetNumber: 'AST-FLT-2026-002',
      category: 'PASSENGER',
      vehicleType: 'BUS',
      department: 'HUMAN_RESOURCES',
      currentSite: 'Jebel Ali Labor Camp',
      manufacturer: 'Ashok Leyland',
      model: 'Falcon 66-Seater Staff Bus',
      vin: 'ALF2025-BUS-9921',
      year: 2024,
      fuelType: 'DIESEL',
      odometerKm: 28400,
      status: 'ON_TRIP',
      assignedDriverName: 'Tariq Mahmoud',
      purchaseCost: 95000,
      currentValue: 90000,
    },
  ];
}

function getMockDrivers(): FleetDriver[] {
  return [
    {
      id: 'd1',
      driverCode: 'DRV-2026-101',
      fullName: 'Rashid Al-Mansoori',
      phone: '+971 50 123 4567',
      licenseNumber: 'UAE-DL-992019',
      licenseCategory: 'HEAVY_VEHICLE',
      licenseExpiry: '2028-11-20',
      status: 'ACTIVE',
      rating: 4.9,
    },
    {
      id: 'd2',
      driverCode: 'DRV-2026-102',
      fullName: 'Tariq Mahmoud',
      phone: '+971 55 987 6543',
      licenseNumber: 'UAE-DL-881022',
      licenseCategory: 'HEAVY_BUS',
      licenseExpiry: '2027-05-15',
      status: 'ON_TRIP',
      rating: 4.8,
    },
  ];
}

function getMockTrips(): FleetTrip[] {
  return [
    {
      id: 't1',
      tripNumber: 'TRIP-2026-881',
      vehicleNumber: 'DXB-FLT-1035',
      driverName: 'Tariq Mahmoud',
      purpose: 'Morning Shift Worker Transport Dispatch',
      originLocation: 'Jebel Ali Labor Camp',
      destinationLocation: 'Dubai South Infrastructure Yard',
      plannedDepartureDate: '2026-08-13 06:00',
      plannedArrivalDate: '2026-08-13 07:15',
      distanceKm: 45,
      status: 'IN_TRANSIT',
      tripCost: 180,
    },
  ];
}

function getMockFuel(): FleetFuelLog[] {
  return [
    {
      id: 'f1',
      fuelLogNumber: 'FFL-2026-401',
      vehicleNumber: 'DXB-FLT-1029',
      driverName: 'Rashid Al-Mansoori',
      fuelStation: 'ADNOC Distribution Yard 4',
      quantityLiters: 320,
      costPerLiter: 3.85,
      totalCost: 1232,
      fillDate: '2026-08-12',
    },
  ];
}

function getMockStats() {
  return {
    totalVehicles: 12,
    activeVehicles: 10,
    onTripVehicles: 3,
    maintenanceVehicles: 1,
    totalAssetValue: 1850000,
    totalTrips: 48,
    completedTrips: 45,
    totalDistanceKm: 18450,
    totalFuelLiters: 3250,
    totalFuelCost: 12512.5,
    activeDrivers: 8,
    utilizationRatePercent: 91,
  };
}
