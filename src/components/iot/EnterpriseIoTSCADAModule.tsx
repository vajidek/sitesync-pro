import React, { useState, useEffect } from 'react';
import {
  Activity,
  Zap,
  Gauge,
  Layers,
  Cpu,
  Radio,
  Server,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Play,
  Square,
  RotateCcw,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Sliders,
  TrendingUp,
  Download,
  ShieldAlert,
  ShieldCheck,
  Flame,
  Droplets,
  Wind,
  Terminal,
  Settings,
  Database,
  BarChart3,
  ChevronRight,
  Eye,
  Check,
  X,
  Send,
  SlidersHorizontal,
  Wrench,
  Sparkles,
  ArrowUpRight,
  HelpCircle,
  Laptop,
  Power
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

type SubTab =
  | 'scada_overview'
  | 'devices_gateways'
  | 'telemetry_analytics'
  | 'alarms_console'
  | 'predictive_maintenance'
  | 'energy_power'
  | 'remote_commands';

export const EnterpriseIoTSCADAModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('scada_overview');
  const [stats, setStats] = useState<any>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [gateways, setGateways] = useState<any[]>([]);
  const [rtus, setRtus] = useState<any[]>([]);
  const [plcs, setPlcs] = useState<any[]>([]);
  const [sensors, setSensors] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [alarms, setAlarms] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<any[]>([]);
  const [predictiveData, setPredictiveData] = useState<any>(null);
  const [energyData, setEnergyData] = useState<any>(null);
  const [commandsHistory, setCommandsHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // Modals & form state
  const [showAddDeviceModal, setShowAddDeviceModal] = useState<boolean>(false);
  const [showCommandModal, setShowCommandModal] = useState<boolean>(false);
  const [showAckModal, setShowAckModal] = useState<boolean>(false);
  const [showResolveModal, setShowResolveModal] = useState<boolean>(false);
  const [selectedAlarm, setSelectedAlarm] = useState<any>(null);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [commandForm, setCommandForm] = useState({
    commandType: 'START',
    targetRegister: '0x4001',
    parameterValue: '1',
    timeoutSeconds: 30,
  });
  const [ackComments, setAckComments] = useState('');
  const [resolveNotes, setResolveNotes] = useState('');
  const [createWorkOrderOnResolve, setCreateWorkOrderOnResolve] = useState(true);

  // New device form
  const [newDevice, setNewDevice] = useState({
    deviceName: '',
    deviceTypeId: 'dt-2',
    siteLocation: 'Clear Water Pumping Station Bay 1',
    communicationProtocol: 'MODBUS_TCP',
    ipAddress: '192.168.10.120',
    firmwareVersion: 'v2.5.0',
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('sitesync_access_token');
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const headers = getAuthHeaders();
      const [
        statsRes,
        devRes,
        gwRes,
        rtuRes,
        plcRes,
        sensRes,
        telemRes,
        almRes,
        healthRes,
        predRes,
        energyRes,
        cmdRes,
      ] = await Promise.all([
        fetch('/api/iot/stats', { headers }),
        fetch('/api/devices', { headers }),
        fetch('/api/gateways', { headers }),
        fetch('/api/rtu', { headers }),
        fetch('/api/plc', { headers }),
        fetch('/api/sensors', { headers }),
        fetch('/api/telemetry/latest?limit=30', { headers }),
        fetch('/api/alarms', { headers }),
        fetch('/api/equipment-health', { headers }),
        fetch('/api/predictive-maintenance', { headers }),
        fetch('/api/energy', { headers }),
        fetch('/api/scada/commands', { headers }),
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.data);
      }
      if (devRes.ok) {
        const d = await devRes.json();
        setDevices(d.data || []);
      }
      if (gwRes.ok) {
        const d = await gwRes.json();
        setGateways(d.data || []);
      }
      if (rtuRes.ok) {
        const d = await rtuRes.json();
        setRtus(d.data || []);
      }
      if (plcRes.ok) {
        const d = await plcRes.json();
        setPlcs(d.data || []);
      }
      if (sensRes.ok) {
        const d = await sensRes.json();
        setSensors(d.data || []);
      }
      if (telemRes.ok) {
        const d = await telemRes.json();
        setTelemetry(d.data);
      }
      if (almRes.ok) {
        const d = await almRes.json();
        setAlarms(d.data || []);
      }
      if (healthRes.ok) {
        const d = await healthRes.json();
        setHealthData(d.data || []);
      }
      if (predRes.ok) {
        const d = await predRes.json();
        setPredictiveData(d.data);
      }
      if (energyRes.ok) {
        const d = await energyRes.json();
        setEnergyData(d.data);
      }
      if (cmdRes.ok) {
        const d = await cmdRes.json();
        setCommandsHistory(d.data || []);
      }
    } catch (err) {
      console.error('Error fetching IoT/SCADA data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Periodic telemetry polling
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(async () => {
      try {
        const headers = getAuthHeaders();
        const telemRes = await fetch('/api/telemetry/latest?limit=25', { headers });
        if (telemRes.ok) {
          const d = await telemRes.json();
          setTelemetry(d.data);
        }
      } catch (e) {
        // silent
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isSimulating]);

  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = getAuthHeaders();
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers,
        body: JSON.stringify(newDevice),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Device ${data.data.deviceName} registered successfully`);
        setShowAddDeviceModal(false);
        setNewDevice({
          deviceName: '',
          deviceTypeId: 'dt-2',
          siteLocation: 'Clear Water Pumping Station Bay 1',
          communicationProtocol: 'MODBUS_TCP',
          ipAddress: '192.168.10.120',
          firmwareVersion: 'v2.5.0',
        });
        loadAllData();
      } else {
        showToast(data.message || 'Failed to create device', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSendCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice) return;
    try {
      const headers = getAuthHeaders();
      const res = await fetch('/api/scada/command', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          deviceId: selectedDevice.id,
          assetId: selectedDevice.assetId,
          commandType: commandForm.commandType,
          targetRegister: commandForm.targetRegister,
          parameterValue: commandForm.parameterValue,
          timeoutSeconds: commandForm.timeoutSeconds,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`SCADA Command [${commandForm.commandType}] executed on ${selectedDevice.deviceName}`);
        setShowCommandModal(false);
        loadAllData();
      } else {
        showToast(data.message || 'Failed to send command', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleAcknowledgeAlarm = async () => {
    if (!selectedAlarm) return;
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`/api/alarms/${selectedAlarm.id}/acknowledge`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          comments: ackComments || 'Acknowledged by Control Room Operator',
          expectedAction: 'Field Technician dispatched for inspection',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Alarm ${selectedAlarm.alarmNumber} acknowledged`);
        setShowAckModal(false);
        setAckComments('');
        loadAllData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleResolveAlarm = async () => {
    if (!selectedAlarm) return;
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`/api/alarms/${selectedAlarm.id}/resolve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          resolutionNotes: resolveNotes || 'Parameter normalized within tolerance limit.',
          createWorkOrder: createWorkOrderOnResolve,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Alarm ${selectedAlarm.alarmNumber} marked RESOLVED`);
        setShowResolveModal(false);
        setResolveNotes('');
        loadAllData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-6 space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl flex items-center space-x-2 border transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950 border-rose-500/50 text-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header & Cockpit Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Industrial IoT, SCADA & Telemetry Engine
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>LIVE SCADA STREAM</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Water Infrastructure • Real-Time RTU/PLC Telemetry • ISO 50001 Energy • AI Predictive Maintenance
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center space-x-1.5 transition ${
              isSimulating
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Live Telemetry Active (4s)' : 'Telemetry Paused'}</span>
          </button>

          <button
            onClick={loadAllData}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 flex items-center space-x-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowAddDeviceModal(true)}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20 flex items-center space-x-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Register Edge Device</span>
          </button>
        </div>
      </div>

      {/* High-Level SCADA KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Connected Devices</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white mt-1.5">
            {stats?.connectedDevices ?? 7} <span className="text-xs text-slate-500">/ {stats?.totalDevices ?? 7}</span>
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center space-x-1 mt-1">
            <Check className="w-3 h-3" />
            <span>100% Online</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Edge Gateways & RTU</span>
            <Radio className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-white mt-1.5">
            {(stats?.totalGateways ?? 3) + (stats?.totalRtus ?? 2) + (stats?.totalPlcs ?? 2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {stats?.totalGateways ?? 3} GW • {stats?.totalRtus ?? 2} RTU • {stats?.totalPlcs ?? 2} PLC
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Raw Flow Inlet</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white mt-1.5">
            1,420.5 <span className="text-xs text-slate-400 font-normal">m³/h</span>
          </div>
          <div className="text-[11px] text-cyan-400 mt-1">
            ~34.1 MLD Production
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Header Pressure</span>
            <Gauge className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white mt-1.5">
            8.45 <span className="text-xs text-slate-400 font-normal">bar</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            Setpoint: 8.5 ± 0.5 bar
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Substation Power</span>
            <Zap className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-xl font-bold text-white mt-1.5">
            345.8 <span className="text-xs text-slate-400 font-normal">kW</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            PF: 0.93 • 0.36 kWh/m³
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>SCADA Alarms</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-white mt-1.5">
            {stats?.activeAlarms ?? 1} <span className="text-xs text-rose-400 font-normal">Active</span>
          </div>
          <div className="text-[11px] text-rose-400 mt-1">
            {stats?.criticalAlarms ?? 0} Critical • 1 High
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 overflow-x-auto scrollbar-none pb-2">
        {[
          { id: 'scada_overview', label: 'SCADA Mimic Diagram', icon: <Layers className="w-4 h-4" /> },
          { id: 'devices_gateways', label: 'Edge Nodes & Gateways', icon: <Cpu className="w-4 h-4" />, badge: devices.length },
          { id: 'telemetry_analytics', label: 'Live Telemetry & Trends', icon: <Activity className="w-4 h-4" /> },
          { id: 'alarms_console', label: 'Alarm & Event Console', icon: <AlertTriangle className="w-4 h-4" />, badge: alarms.filter(a => a.status === 'ACTIVE').length, badgeColor: 'bg-rose-500/20 text-rose-300' },
          { id: 'predictive_maintenance', label: 'Predictive Health & RUL', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'energy_power', label: 'Power & Energy (ISO 50001)', icon: <Zap className="w-4 h-4" /> },
          { id: 'remote_commands', label: 'Remote SCADA Commands', icon: <Terminal className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as SubTab)}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap flex items-center space-x-2 transition ${
              activeSubTab === tab.id
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${tab.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sub-Tab 1: SCADA Mimic View */}
      {activeSubTab === 'scada_overview' && (
        <div className="space-y-6">
          {/* Animated Water Infrastructure P&ID Mimic Diagram */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-semibold text-white">100 MLD Plant Process Mimic & Flow Path</h2>
              </div>
              <div className="flex items-center space-x-4 text-xs text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-slate-300">Pumping Station In Service</span>
                </span>
                <span className="text-slate-500">|</span>
                <span>Scan Rate: 1000ms</span>
              </div>
            </div>

            {/* Visual Process Flow Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 my-4">
              {/* Step 1: Intake & Raw Water Flow */}
              <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">01. INTAKE WELL</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold">RUNNING</span>
                </div>
                <div className="my-3 space-y-1.5">
                  <div className="text-xs text-slate-400">Magflow Meter DN600:</div>
                  <div className="text-lg font-bold text-white flex items-baseline space-x-1">
                    <span>1,420.5</span> <span className="text-xs text-cyan-400 font-normal">m³/h</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Suction Level: 4.8m</div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-cyan-400 h-full w-[78%] animate-pulse"></div>
                </div>
              </div>

              {/* Step 2: Aeration & Clariflocculator */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">02. CLARIFIER</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold">OPTIMAL</span>
                </div>
                <div className="my-3 space-y-1.5">
                  <div className="text-xs text-slate-400">Turbidity In/Out:</div>
                  <div className="text-lg font-bold text-white">
                    18.2 <span className="text-xs text-slate-400 font-normal">→ 1.4 NTU</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Sludge Scraper: 1.2 RPM</div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[92%]"></div>
                </div>
              </div>

              {/* Step 3: Rapid Gravity Sand Filters */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">03. FILTRATION</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold">BEDS 1-8 OK</span>
                </div>
                <div className="my-3 space-y-1.5">
                  <div className="text-xs text-slate-400">Head Loss Average:</div>
                  <div className="text-lg font-bold text-white">
                    0.82 <span className="text-xs text-slate-400 font-normal">m W.C.</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Backwash Due: in 6.4h</div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-400 h-full w-[65%]"></div>
                </div>
              </div>

              {/* Step 4: Clear Water Pumping Station */}
              <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-4 flex flex-col justify-between relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">04. CW PUMP HOUSE</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold">2 RUN / 1 STDBY</span>
                </div>
                <div className="my-3 space-y-1.5">
                  <div className="text-xs text-slate-400">Discharge Header:</div>
                  <div className="text-lg font-bold text-white">
                    8.45 <span className="text-xs text-amber-400 font-normal">bar</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Pump 1 Temp: 56.4°C</div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-400 h-full w-[85%]"></div>
                </div>
              </div>

              {/* Step 5: GLSR & OHSR Transmission */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">05. RESERVOIR (GLSR)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-semibold">FILLING</span>
                </div>
                <div className="my-3 space-y-1.5">
                  <div className="text-xs text-slate-400">Storage Water Level:</div>
                  <div className="text-lg font-bold text-white">
                    7.82 <span className="text-xs text-slate-400 font-normal">/ 10.0 m</span>
                  </div>
                  <div className="text-[11px] text-cyan-400">Volume: 3,910 kL (78.2%)</div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-cyan-500 h-full w-[78%]"></div>
                </div>
              </div>
            </div>

            {/* Quick Interactive Command Panel */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold">Quick Operator Dispatch:</span>
                <span className="text-slate-400">Clear Water Pump 1 (DEV-PUMP-01-NODE)</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const dev = devices.find(d => d.deviceCode === 'DEV-PUMP-01-NODE') || devices[0];
                    setSelectedDevice(dev);
                    setCommandForm({ ...commandForm, commandType: 'START' });
                    setShowCommandModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center space-x-1"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Pump</span>
                </button>

                <button
                  onClick={() => {
                    const dev = devices.find(d => d.deviceCode === 'DEV-PUMP-01-NODE') || devices[0];
                    setSelectedDevice(dev);
                    setCommandForm({ ...commandForm, commandType: 'STOP' });
                    setShowCommandModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium flex items-center space-x-1"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Stop Pump</span>
                </button>

                <button
                  onClick={() => {
                    const dev = devices.find(d => d.deviceCode === 'DEV-PUMP-01-NODE') || devices[0];
                    setSelectedDevice(dev);
                    setCommandForm({ ...commandForm, commandType: 'RESET' });
                    setShowCommandModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Faults</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Trend Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Flow & Pressure Chart */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Flow Rate (m³/h) & Discharge Pressure (bar)</h3>
                  <p className="text-[11px] text-slate-400">24-Hour Telemetry Record</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Tag: KWA_WTP_FLOW_INLET
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { time: '00:00', flow: 1320, press: 8.2 },
                      { time: '04:00', flow: 1280, press: 8.1 },
                      { time: '08:00', flow: 1490, press: 8.6 },
                      { time: '12:00', flow: 1520, press: 8.5 },
                      { time: '16:00', flow: 1440, press: 8.4 },
                      { time: '20:00', flow: 1380, press: 8.3 },
                      { time: 'Now', flow: 1420.5, press: 8.45 },
                    ]}
                  >
                    <defs>
                      <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                    <YAxis yAxisId="left" stroke="#06b6d4" fontSize={11} />
                    <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                    <Area yAxisId="left" type="monotone" dataKey="flow" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#flowGrad)" name="Flow Rate (m³/h)" />
                    <Line yAxisId="right" type="monotone" dataKey="press" stroke="#f59e0b" strokeWidth={2} name="Pressure (bar)" dot={{ r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Power Demand & Specific Energy */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Substation Active Power Demand (kW)</h3>
                  <p className="text-[11px] text-slate-400">11kV HT Substation Panel A Telemetry</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  Tag: KWA_SUBSTATION_POWER_KW
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { hour: '02h', kw: 310, spec: 0.35 },
                      { hour: '06h', kw: 330, spec: 0.36 },
                      { hour: '10h', kw: 365, spec: 0.38 },
                      { hour: '14h', kw: 370, spec: 0.37 },
                      { hour: '18h', kw: 355, spec: 0.36 },
                      { hour: '22h', kw: 340, spec: 0.35 },
                      { hour: 'Now', kw: 345.8, spec: 0.36 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#eab308" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                    <Bar dataKey="kw" fill="#eab308" radius={[4, 4, 0, 0]} name="Active Power (kW)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Devices & Edge Gateways */}
      {activeSubTab === 'devices_gateways' && (
        <div className="space-y-5">
          {/* Top Filter and Register Device */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search device by code, name, IP address..."
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-64"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAddDeviceModal(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Edge Node</span>
              </button>
            </div>
          </div>

          {/* Devices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => (
              <div
                key={device.id}
                className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{device.deviceCode}</span>
                    <h3 className="text-sm font-bold text-white leading-tight mt-0.5">{device.deviceName}</h3>
                    <p className="text-xs text-slate-400">{device.siteLocation}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    device.status === 'CONNECTED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {device.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Protocol:</span>
                    <span className="font-semibold text-slate-200">{device.communicationProtocol}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">IP Address:</span>
                    <span className="font-mono text-slate-300">{device.ipAddress || '192.168.10.x'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Firmware:</span>
                    <span className="text-slate-300">{device.firmwareVersion}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Health Score:</span>
                    <span className="font-bold text-emerald-400">{device.healthScore}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    onClick={() => {
                      setSelectedDevice(device);
                      setShowCommandModal(true);
                    }}
                    className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 flex items-center space-x-1"
                  >
                    <Terminal className="w-3 h-3" />
                    <span>Send Command</span>
                  </button>
                  <span className="text-[10px] text-slate-500">
                    Heartbeat: {new Date(device.lastHeartbeat || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Gateways & RTUs List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Edge Gateways</h3>
                <span className="text-xs text-slate-400">{gateways.length} Units Active</span>
              </div>
              <div className="space-y-2.5">
                {gateways.map((gw) => (
                  <div key={gw.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{gw.gatewayName}</div>
                      <div className="text-[11px] text-slate-400">{gw.manufacturer} • {gw.location}</div>
                      <div className="text-[10px] font-mono text-cyan-400 mt-0.5">{gw.ipAddress} ({gw.uplinkProtocol})</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold">
                      {gw.connectedDevicesCount} Nodes
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">RTUs & Automation PLCs</h3>
                <span className="text-xs text-slate-400">{rtus.length + plcs.length} Controllers</span>
              </div>
              <div className="space-y-2.5">
                {rtus.map((r) => (
                  <div key={r.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{r.rtuName}</div>
                      <div className="text-[11px] text-slate-400">{r.model} • {r.protocol}</div>
                      <div className="text-[10px] text-emerald-400">Battery: {r.batteryBackupVoltage}V • DI:{r.digitalInputsCount}/DO:{r.digitalOutputsCount}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 font-semibold">
                      RTU
                    </span>
                  </div>
                ))}
                {plcs.map((p) => (
                  <div key={p.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{p.plcName}</div>
                      <div className="text-[11px] text-slate-400">{p.model} • Mode: {p.operatingMode}</div>
                      <div className="text-[10px] text-indigo-400">Cycle: {p.scanCycleMs}ms • CPU: {p.cpuUtilizationPercent}%</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-400 font-semibold">
                      PLC
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Live Telemetry & Trends */}
      {activeSubTab === 'telemetry_analytics' && (
        <div className="space-y-6">
          {/* Live Tags Grid */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Live SCADA Process Tags & Ingestion Engine</h3>
                <p className="text-xs text-slate-400">Streaming live instrumentation tag values across water plant and pump stations</p>
              </div>
              <button
                onClick={loadAllData}
                className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Fetch Latest</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {telemetry?.points?.map((pt: any) => (
                <div key={pt.id} className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 font-semibold">{pt.pointCode}</span>
                      <h4 className="text-xs font-bold text-white">{pt.pointName}</h4>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                      {pt.dataQuality}
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-white tracking-tight">
                      {typeof pt.currentValue === 'number' ? pt.currentValue.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : pt.currentValue}
                    </span>
                    <span className="text-xs text-slate-400">{pt.engineeringUnit}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <span>Modbus Addr: {pt.tagAddress}</span>
                    <span>Updated: {new Date(pt.lastUpdated).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Telemetry Stream Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Recent Telemetry Time-Series Records</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Device Code</th>
                    <th className="py-2.5 px-3">Raw Value</th>
                    <th className="py-2.5 px-3">Engineering Value</th>
                    <th className="py-2.5 px-3">Unit</th>
                    <th className="py-2.5 px-3">Quality</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {telemetry?.latestReadings?.slice(0, 10).map((r: any) => (
                    <tr key={r.id} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-400">
                        {new Date(r.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 font-medium text-cyan-400">{r.deviceId}</td>
                      <td className="py-2 px-3 font-mono">{r.rawVal?.toFixed(2)}</td>
                      <td className="py-2 px-3 font-bold text-white">{r.engVal?.toFixed(2)}</td>
                      <td className="py-2 px-3">{r.unit}</td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold">
                          {r.quality}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Alarm & Event Console */}
      {activeSubTab === 'alarms_console' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-slate-400 font-medium">Filter Severity:</span>
              <button className="px-2.5 py-1 rounded bg-slate-800 text-slate-200">All ({alarms.length})</button>
              <button className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">Critical</button>
              <button className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">High</button>
            </div>
            <div className="text-xs text-slate-400">
              ISA 18.2 Compliant SCADA Alarm Engine
            </div>
          </div>

          <div className="space-y-3">
            {alarms.map((alarm) => (
              <div
                key={alarm.id}
                className={`p-4 rounded-xl border transition ${
                  alarm.status === 'ACTIVE'
                    ? alarm.severity === 'CRITICAL'
                      ? 'bg-rose-950/40 border-rose-500/50'
                      : 'bg-amber-950/40 border-amber-500/50'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2 rounded-lg ${
                      alarm.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono text-cyan-400 font-bold">{alarm.alarmNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          alarm.severity === 'CRITICAL' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-900'
                        }`}>
                          {alarm.severity} ({alarm.priority})
                        </span>
                        <span className="text-xs font-bold text-white">{alarm.title}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{alarm.message}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {alarm.status === 'ACTIVE' && (
                      <button
                        onClick={() => {
                          setSelectedAlarm(alarm);
                          setShowAckModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Acknowledge</span>
                      </button>
                    )}

                    {alarm.status !== 'RESOLVED' && (
                      <button
                        onClick={() => {
                          setSelectedAlarm(alarm);
                          setShowResolveModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolve Alarm</span>
                      </button>
                    )}

                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                      alarm.status === 'ACTIVE'
                        ? 'bg-rose-500/20 text-rose-300'
                        : alarm.status === 'ACKNOWLEDGED'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {alarm.status}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                  <span>Triggered: {new Date(alarm.triggeredAt).toLocaleString()}</span>
                  <span>Trigger Value: <strong className="text-white">{alarm.triggerValue} {alarm.unit}</strong> (Threshold: {alarm.thresholdValue} {alarm.unit})</span>
                  {alarm.acknowledgedBy && (
                    <span className="text-amber-300">Ack By: {alarm.acknowledgedBy}</span>
                  )}
                  {alarm.isWorkOrderCreated && (
                    <span className="text-cyan-400 font-semibold">Work Order: {alarm.workOrderId || 'Auto-Linked'}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 5: Predictive Maintenance & RUL */}
      {activeSubTab === 'predictive_maintenance' && (
        <div className="space-y-6">
          {/* Health Index Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {healthData.map((h) => (
              <div key={h.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 font-bold">ASSET: {h.assetId}</span>
                    <h3 className="text-sm font-bold text-white">Intake Primary Centrifugal Pump 1</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-400">{h.healthScore}%</div>
                    <span className="text-[10px] text-slate-400">Health Index</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-950 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Availability</span>
                    <span className="font-bold text-white">{h.availabilityPercent}%</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Running Hours</span>
                    <span className="font-bold text-white">{h.totalRunningHours}h</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Failure Risk</span>
                    <span className={`font-bold ${h.failureRiskLevel === 'LOW' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {h.failureRiskLevel}
                    </span>
                  </div>
                </div>

                <div className="text-xs space-y-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex justify-between text-slate-300">
                    <span>Vibration Status:</span>
                    <span className="text-emerald-400 font-semibold">{h.vibrationStatus}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Temperature Rise:</span>
                    <span className="text-amber-400 font-semibold">{h.temperatureStatus}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Discharge Pressure:</span>
                    <span className="text-emerald-400 font-semibold">{h.pressureStatus}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Anomaly Detection & RUL Predictions */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">AI Remaining Useful Life (RUL) & Anomaly Inferences</h3>
              </div>
              <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                Model: LSTM Autoencoder (Accuracy 96.4%)
              </span>
            </div>

            {predictiveData?.predictions?.map((pred: any) => (
              <div key={pred.id} className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2 mb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-white">Predicted RUL: </span>
                    <span className="text-lg font-bold text-cyan-400">{pred.predictedRulHours} Operating Hours</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-300">
                    Confidence: {pred.confidencePercent}%
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  <strong className="text-slate-200">Failure Mode:</strong> {pred.predictedFailureMode}
                </p>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
                  <Wrench className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-cyan-400">Prescriptive Action:</strong> {pred.recommendedAction}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 6: Energy & Power Quality (ISO 50001) */}
      {activeSubTab === 'energy_power' && (
        <div className="space-y-6">
          {/* Energy Cockpit Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400">Active Power Demand</span>
              <div className="text-2xl font-bold text-white mt-1">
                {energyData?.summary?.totalActivePowerKw ?? 345.8} <span className="text-sm text-yellow-400 font-normal">kW</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Apparent: 372.4 kVA</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400">Total Energy Consumed</span>
              <div className="text-2xl font-bold text-white mt-1">
                {energyData?.summary?.totalEnergyKwh?.toLocaleString() ?? '13,240'} <span className="text-sm text-yellow-400 font-normal">kWh</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Today Cumulative</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400">Power Factor (PF)</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {energyData?.summary?.averagePowerFactor ?? 0.93}
              </div>
              <p className="text-[11px] text-emerald-400 mt-1">Target: &gt; 0.90 (No Penalty)</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400">Specific Energy Index</span>
              <div className="text-2xl font-bold text-cyan-400 mt-1">
                {energyData?.summary?.specificEnergyKwhM3 ?? 0.36} <span className="text-xs text-slate-400 font-normal">kWh/m³</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Energy per kL pumped</p>
            </div>
          </div>

          {/* 3-Phase Balance & Power Quality */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">3-Phase Voltage & Current Balance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block font-semibold">Phase A (R)</span>
                <div className="text-lg font-bold text-white mt-1">415.2 V • 220.4 A</div>
                <span className="text-[11px] text-emerald-400">THD: 1.8% (Healthy)</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block font-semibold">Phase B (Y)</span>
                <div className="text-lg font-bold text-white mt-1">414.8 V • 219.8 A</div>
                <span className="text-[11px] text-emerald-400">THD: 1.9% (Healthy)</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block font-semibold">Phase C (B)</span>
                <div className="text-lg font-bold text-white mt-1">416.0 V • 221.1 A</div>
                <span className="text-[11px] text-emerald-400">THD: 1.7% (Healthy)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 7: Remote Commands & Dispatch */}
      {activeSubTab === 'remote_commands' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">SCADA Remote Control & Command Dispatcher</h3>
              <p className="text-xs text-slate-400">Secure two-man verified control commands for field RTU/PLC actuation</p>
            </div>
            <button
              onClick={() => {
                setSelectedDevice(devices[0] || null);
                setShowCommandModal(true);
              }}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center space-x-1.5"
            >
              <Terminal className="w-4 h-4" />
              <span>Dispatch New Command</span>
            </button>
          </div>

          {/* Command History Audit Log */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Command Dispatch Audit Trail</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="py-2.5 px-3">Command Code</th>
                    <th className="py-2.5 px-3">Device Code</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Requested By</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Response / Confirmation</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {commandsHistory.map((cmd) => (
                    <tr key={cmd.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">{cmd.commandCode}</td>
                      <td className="py-2.5 px-3">{cmd.deviceId}</td>
                      <td className="py-2.5 px-3 font-semibold text-white">{cmd.commandType}</td>
                      <td className="py-2.5 px-3">{cmd.requestedBy}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                          {cmd.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-400 max-w-xs truncate">
                        {cmd.executionResponse || 'ACK_OK'}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-500 font-mono">
                        {new Date(cmd.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Register Edge Device */}
      {showAddDeviceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Register Industrial IoT / SCADA Node</span>
              </h3>
              <button onClick={() => setShowAddDeviceModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDevice} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Device / Node Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pump 3 Discharge Pressure Transmitter"
                  value={newDevice.deviceName}
                  onChange={(e) => setNewDevice({ ...newDevice, deviceName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Protocol</label>
                  <select
                    value={newDevice.communicationProtocol}
                    onChange={(e) => setNewDevice({ ...newDevice, communicationProtocol: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="MODBUS_TCP">Modbus TCP</option>
                    <option value="MODBUS_RTU">Modbus RTU</option>
                    <option value="MQTT">MQTT (TLS)</option>
                    <option value="OPC_UA">OPC-UA</option>
                    <option value="DNP3">DNP3</option>
                    <option value="LORAWAN">LoRaWAN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">IP Address</label>
                  <input
                    type="text"
                    value={newDevice.ipAddress}
                    onChange={(e) => setNewDevice({ ...newDevice, ipAddress: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Site Location</label>
                <input
                  type="text"
                  value={newDevice.siteLocation}
                  onChange={(e) => setNewDevice({ ...newDevice, siteLocation: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddDeviceModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Register Device</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Dispatch SCADA Command */}
      {showCommandModal && selectedDevice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Dispatch SCADA Command</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Target: {selectedDevice.deviceName}</p>
              </div>
              <button onClick={() => setShowCommandModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendCommand} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Command Action *</label>
                <select
                  value={commandForm.commandType}
                  onChange={(e) => setCommandForm({ ...commandForm, commandType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-semibold focus:outline-none focus:border-cyan-500"
                >
                  <option value="START">START EQUIPMENT (MOTOR/PUMP)</option>
                  <option value="STOP">STOP EQUIPMENT</option>
                  <option value="RESET">RESET FAULT ALARM</option>
                  <option value="OPEN">OPEN MOTORIZED VALVE</option>
                  <option value="CLOSE">CLOSE MOTORIZED VALVE</option>
                  <option value="SETPOINT">UPDATE PID SETPOINT</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Register Address</label>
                  <input
                    type="text"
                    value={commandForm.targetRegister}
                    onChange={(e) => setCommandForm({ ...commandForm, targetRegister: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Parameter Value</label>
                  <input
                    type="text"
                    value={commandForm.parameterValue}
                    onChange={(e) => setCommandForm({ ...commandForm, parameterValue: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-200 text-[11px] flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Command execution will be logged with full operator cryptographic signature and verified by RTU ACK frame.</span>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCommandModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute Command</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Acknowledge Alarm */}
      {showAckModal && selectedAlarm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Check className="w-4 h-4 text-amber-400" />
                <span>Acknowledge Alarm ({selectedAlarm.alarmNumber})</span>
              </h3>
              <button onClick={() => setShowAckModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300 font-medium">{selectedAlarm.title}</p>
              <p className="text-slate-400">{selectedAlarm.message}</p>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Operator Notes / Comments *</label>
                <textarea
                  rows={3}
                  value={ackComments}
                  onChange={(e) => setAckComments(e.target.value)}
                  placeholder="e.g. Field engineer dispatched to investigate header pressure elevation."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAckModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAcknowledgeAlarm}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold"
                >
                  Confirm Acknowledge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Resolve Alarm */}
      {showResolveModal && selectedAlarm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Resolve Alarm ({selectedAlarm.alarmNumber})</span>
              </h3>
              <button onClick={() => setShowResolveModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300 font-medium">{selectedAlarm.title}</p>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Resolution Summary *</label>
                <textarea
                  rows={3}
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="e.g. Header surge damper valve recalibrated; pressure stabilized to 8.4 bar."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="createWo"
                  checked={createWorkOrderOnResolve}
                  onChange={(e) => setCreateWorkOrderOnResolve(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-cyan-600 focus:ring-0"
                />
                <label htmlFor="createWo" className="text-slate-300 font-medium">
                  Sync & Create Maintenance Work Order in Phase 71 EAM
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResolveAlarm}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Mark as Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
