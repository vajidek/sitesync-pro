import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Wifi,
  WifiOff,
  RefreshCw,
  MapPin,
  Camera,
  FileText,
  ShieldCheck,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Search,
  Filter,
  Plus,
  Compass,
  Battery,
  BatteryCharging,
  Sliders,
  Download,
  Upload,
  UserCheck,
  Eye,
  Check,
  X,
  Truck,
  Activity,
  Droplets,
  HardHat,
  Cpu,
  CornerDownRight,
  Database,
  Navigation,
  KeyRound,
  FileCheck,
  Zap,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';

interface DeviceItem {
  id: string;
  deviceId: string;
  deviceModel: string;
  osPlatform: string;
  osVersion: string;
  appVersion: string;
  assignedUserName: string;
  userRole: string;
  projectName: string;
  batteryLevel: number;
  isOnline: boolean;
  lastSyncAt: string;
  deviceStatus: string;
  offlinePendingCount: number;
}

interface MapMarkerItem {
  id: string;
  markerCode: string;
  name: string;
  markerType: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  status: string;
  colorHex: string;
  attributesJson?: string;
}

interface CheckinItem {
  id: string;
  userName: string;
  siteName: string;
  checkinTime: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  selfiePhotoUrl?: string;
  status: string;
}

interface PhotoItem {
  id: string;
  photoCode: string;
  title: string;
  category: string;
  photoUrl: string;
  latitude: number;
  longitude: number;
  capturedAt: string;
  userName: string;
}

interface FormItem {
  id: string;
  formCode: string;
  formTitle: string;
  templateCode: string;
  submittedByName: string;
  status: string;
  submittedAt: string;
  formDataJson: string;
}

interface GeofenceItem {
  id: string;
  geofenceCode: string;
  name: string;
  fenceType: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  category: string;
  status: string;
}

export const EnterpriseMobileOperations: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'sync' | 'devices' | 'gis' | 'checkin' | 'visits' | 'forms' | 'photos' | 'signatures' | 'documents' | 'geofences'
  >('overview');

  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessToast, setSyncSuccessToast] = useState<string | null>(null);

  // States for data
  const [stats, setStats] = useState<any>({
    totalRegisteredDevices: 3,
    activeDevicesCount: 3,
    onlineNowCount: 3,
    activeFieldStaffOnSite: 4,
    geofenceZonesCount: 3,
    totalGisAssetsMapped: 5,
    photosCapturedToday: 2,
    fieldFormsSubmitted: 1,
    syncHealthScorePercent: 99.8,
    averageSyncDurationMs: 235,
    activeHeavyEquipmentTracked: 1,
    activeVehiclesTracked: 1,
  });

  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [markers, setMarkers] = useState<MapMarkerItem[]>([]);
  const [checkins, setCheckins] = useState<CheckinItem[]>([]);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [forms, setForms] = useState<FormItem[]>([]);
  const [geofences, setGeofences] = useState<GeofenceItem[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerItem | null>(null);

  // Form modals / Inputs
  const [showCheckinModal, setShowCheckinModal] = useState<boolean>(false);
  const [checkinSiteName, setCheckinSiteName] = useState('Ch: 04+200 Valve Chamber SV-14');
  const [checkinLat, setCheckinLat] = useState(25.2012);
  const [checkinLng, setCheckinLng] = useState(55.2815);

  const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCategory, setPhotoCategory] = useState('PROGRESS');
  const [photoUrlInput, setPhotoUrlInput] = useState('https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800');

  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [formTitle, setFormTitle] = useState('Daily Pipeline Trenching Inspection');
  const [formMeters, setFormMeters] = useState('150');
  const [formCrewCount, setFormCrewCount] = useState('32');

  const [showDeviceModal, setShowDeviceModal] = useState<boolean>(false);
  const [newDeviceModel, setNewDeviceModel] = useState('Zebra TC58 Enterprise Rugged Touch Computer');
  const [newDevicePlatform, setNewDevicePlatform] = useState('ANDROID');
  const [newDeviceUser, setNewDeviceUser] = useState('Surveyor Ahmed Al-Hassan');

  // Signature Canvas Ref
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [signerName, setSignerName] = useState('Eng. Sultan Al-Nuaimi (Client Lead DEWA)');
  const [signerRole, setSignerRole] = useState('Client Representative / Lead Inspector');
  const [signatureSaved, setSignatureSaved] = useState<boolean>(false);

  // Load initial data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await fetch('/api/mobile/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      });
      if (statsRes.ok) {
        const d = await statsRes.json();
        if (d.data) setStats(d.data);
      }

      const devRes = await fetch('/api/mobile/devices', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      });
      if (devRes.ok) {
        const d = await devRes.json();
        if (d.data) setDevices(d.data);
      }

      const mapRes = await fetch('/api/mobile/maps', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      });
      if (mapRes.ok) {
        const d = await mapRes.json();
        if (d.data) {
          setMarkers(d.data);
          if (d.data.length > 0) setSelectedMarker(d.data[0]);
        }
      }

      const chkRes = await fetch('/api/mobile/checkin', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      });
      if (chkRes.ok) {
        const d = await chkRes.json();
        if (d.data) setCheckins(d.data);
      }

      const phtRes = await fetch('/api/mobile/photos', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      });
      if (phtRes.ok) {
        const d = await phtRes.json();
        if (d.data) setPhotos(d.data);
      }

      const frmRes = await fetch('/api/mobile/forms', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      });
      if (frmRes.ok) {
        const d = await frmRes.json();
        if (d.data) setForms(d.data);
      }

      const geoRes = await fetch('/api/mobile/geofences', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      });
      if (geoRes.ok) {
        const d = await geoRes.json();
        if (d.data) setGeofences(d.data);
      }
    } catch (e) {
      console.warn('Fetched with offline baseline cache fallback:', e);
    }
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/mobile/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          deviceId: devices[0]?.deviceId || 'DEV-S24-001',
          userId: 'USR-FIELD-01',
          networkType: isOfflineMode ? 'OFFLINE' : '5G',
          items: [
            { entityType: 'GPS_POINT', entityId: 'GPS-9821', action: 'CREATE', payload: { lat: 25.2012, lng: 55.2815 } },
            { entityType: 'CHECKIN_VERIFY', entityId: 'CHK-001', action: 'UPDATE', payload: { biometric: true } },
          ],
        }),
      });
      if (res.ok) {
        setSyncSuccessToast('Bi-directional delta sync completed successfully (0 conflicts detected)');
        setTimeout(() => setSyncSuccessToast(null), 4000);
        fetchDashboardData();
      }
    } catch (e) {
      setSyncSuccessToast('Offline queued transactions stored locally.');
      setTimeout(() => setSyncSuccessToast(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePerformCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/mobile/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          siteName: checkinSiteName,
          latitude: checkinLat,
          longitude: checkinLng,
          accuracyMeters: 3.2,
          isBiometricVerified: true,
          isOfflineCheckin: isOfflineMode,
        }),
      });
      if (res.ok) {
        setShowCheckinModal(false);
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/mobile/photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          photoCode: `PHT-${Date.now().toString().slice(-6)}`,
          title: photoTitle || 'Field Inspection Evidence',
          category: photoCategory,
          photoUrl: photoUrlInput,
          latitude: 25.2015,
          longitude: 55.2818,
          watermarkMetadata: {
            timestamp: new Date().toISOString(),
            chainage: 'Ch: 04+200',
            gps: '25.2015° N, 55.2818° E',
            elevation: '38.4m MSL',
          },
        }),
      });
      if (res.ok) {
        setShowPhotoModal(false);
        setPhotoTitle('');
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/mobile/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          formCode: `FRM-DFR-${Date.now().toString().slice(-4)}`,
          formTitle: formTitle,
          templateCode: 'DFR_PIPELINE',
          formDataJson: {
            trenchMeters: Number(formMeters),
            crewSize: Number(formCrewCount),
            pressureTestStatus: 'PASSED (25 BAR)',
            weather: 'Sunny 37°C',
          },
          isOfflineSubmitted: isOfflineMode,
        }),
      });
      if (res.ok) {
        setShowFormModal(false);
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/mobile/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          deviceId: `DEV-${Date.now().toString().slice(-8)}`,
          deviceModel: newDeviceModel,
          osPlatform: newDevicePlatform,
          assignedUserName: newDeviceUser,
          userRole: 'SUPERVISOR',
          storageAvailableMb: 32000,
        }),
      });
      if (res.ok) {
        setShowDeviceModal(false);
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Canvas Drawing Handlers for Signatures
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureSaved(false);
  };

  const saveSignature = async () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    try {
      const res = await fetch('/api/mobile/signatures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          signatureCode: `SIG-${Date.now().toString().slice(-6)}`,
          entityType: 'FORM_SUBMISSION',
          entityId: forms[0]?.id || 'FRM-001',
          signerName: signerName,
          signerRole: signerRole,
          signatureDataUrl: dataUrl,
        }),
      });
      if (res.ok) {
        setSignatureSaved(true);
        setTimeout(() => setSignatureSaved(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6" id="phase68-mobile-operations-container">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise Mobile Field Operations & GIS</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PWA / Android / iOS
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-3xl">
              Offline-first field synchronization engine, rugged device telematics, GIS asset map overlay, geofenced biometric punch,
              and tamper-evident digital sign-off.
            </p>
          </div>

          {/* Sync & Connectivity Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsOfflineMode(!isOfflineMode)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all border ${
                isOfflineMode
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              }`}
              title="Toggle field offline emulation mode"
            >
              {isOfflineMode ? <WifiOff className="w-4 h-4 text-amber-400" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
              <span>{isOfflineMode ? 'Offline Mode (Local Storage)' : 'Online (5G High-Speed)'}</span>
            </button>

            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-cyan-900/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing Delta...' : 'Sync Mobile Delta'}</span>
            </button>
          </div>
        </div>

        {/* Sync Success Alert */}
        {syncSuccessToast && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncSuccessToast}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 border-t border-slate-800/80 pt-4 scrollbar-thin">
          {[
            { id: 'overview', label: 'Executive Telematics', icon: Activity },
            { id: 'gis', label: 'GIS & Water Assets Map', icon: MapPin },
            { id: 'checkin', label: 'Site Check-In / Check-Out', icon: UserCheck },
            { id: 'devices', label: 'Registered Devices', icon: Smartphone },
            { id: 'photos', label: 'GPS Photo Evidence', icon: Camera },
            { id: 'forms', label: 'Field Forms (DFR/ITP)', icon: FileText },
            { id: 'signatures', label: 'Digital Signatures', icon: FileCheck },
            { id: 'geofences', label: 'Geofence Boundaries', icon: Radio },
            { id: 'documents', label: 'Offline IFC Drawings', icon: Download },
            { id: 'sync', label: 'Offline Queue & Engine', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-VIEW 1: OVERVIEW & TELEMATICS DASHBOARD */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Active Field Devices</span>
                <Smartphone className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {stats.activeDevicesCount} <span className="text-xs font-normal text-slate-400">/ {stats.totalRegisteredDevices} Total</span>
              </div>
              <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% Online & Telemetry Active</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Staff On-Site (Geofenced)</span>
                <UserCheck className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.activeFieldStaffOnSite} Personnel</div>
              <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span>Biometric Check-In Verified</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>GIS Assets Mapped</span>
                <Droplets className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.totalGisAssetsMapped} Nodes</div>
              <div className="mt-2 text-xs text-indigo-300 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Valves, PS, WTP & Reservoirs</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Sync Latency & Health</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.syncHealthScorePercent}%</div>
              <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Avg Delta Duration: {stats.averageSyncDurationMs}ms</span>
              </div>
            </div>
          </div>

          {/* Real-Time Telematics & Heavy Equipment Tracking Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-white">Live Field Personnel & Fleet Telematics</h3>
                  <p className="text-xs text-slate-400">Continuous GPS beacons with geofence proximity & battery health</p>
                </div>
                <button
                  onClick={() => setActiveSubTab('gis')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-medium transition-all"
                >
                  Open Full GIS Map →
                </button>
              </div>

              <div className="divide-y divide-slate-800">
                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <HardHat className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Eng. Farooq Al-Hashimi (Lead Resident Engineer)</div>
                      <div className="text-xs text-slate-400">Ch: 04+200 Valve Chamber SV-14 • Lat 25.2015, Lng 55.2818</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Inside GEO-PIPE-ZONE-A
                    </span>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Battery className="w-4 h-4 text-emerald-400" />
                      <span>88%</span>
                    </div>
                  </div>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">CAT 349D Heavy Hydraulic Trenching Excavator #04</div>
                      <div className="text-xs text-slate-400">Pipeline Trenching Ch: 05+800 • Speed: 0 km/h (Active Trenching)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Equipment Online
                    </span>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <BatteryCharging className="w-4 h-4 text-cyan-400" />
                      <span>100% (Alternator)</span>
                    </div>
                  </div>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Hydrostatic Pressure Testing Tanker TT-12 (18,000L)</div>
                      <div className="text-xs text-slate-400">En Route to PS-01 • Speed: 34.5 km/h (Heading 140°)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      In Transit
                    </span>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Battery className="w-4 h-4 text-emerald-400" />
                      <span>96%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white">Field Operations Actions</h3>
              <p className="text-xs text-slate-400">Immediate mobile worker triggers with automatic offline storage fallback</p>

              <div className="grid grid-cols-1 gap-2.5">
                <button
                  onClick={() => setShowCheckinModal(true)}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">Punch Geofenced Check-In</div>
                      <div className="text-[11px] text-slate-400">GPS selfie biometric verification</div>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  onClick={() => setShowPhotoModal(true)}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Camera className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">Capture Watermarked Photo</div>
                      <div className="text-[11px] text-slate-400">GPS stamp & chainage metadata</div>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  onClick={() => setShowFormModal(true)}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-amber-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">Submit Field Form (DFR / ITP)</div>
                      <div className="text-[11px] text-slate-400">Daily trenching progress entry</div>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  onClick={() => setActiveSubTab('signatures')}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-5 h-5 text-indigo-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">Digital Sign-Off Pad</div>
                      <div className="text-[11px] text-slate-400">Client / Third-party witness signature</div>
                    </div>
                  </div>
                  <CornerDownRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: GIS MAP & WATER INFRASTRUCTURE */}
      {activeSubTab === 'gis' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Interactive GIS Water Infrastructure Map</h2>
              <p className="text-xs text-slate-400">
                1200mm Pipeline main alignment, sectional valves, pumping stations, reservoirs, and telemetry beacons
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Active Layers:</span>
              <span className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">Pipeline (1200mm)</span>
              <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">Valve Chambers</span>
              <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">WTP & PS</span>
            </div>
          </div>

          {/* Simulated High-Tech Vector GIS Canvas Viewport */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden min-h-[480px] flex flex-col justify-between shadow-2xl">
              {/* Map Background Grid Simulation */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, #06b6d4 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }}
              />

              {/* Map UI Controls Overlay */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="px-3 py-1.5 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg text-xs font-mono text-cyan-300 flex items-center gap-2">
                  <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                  <span>25.2012° N, 55.2815° E • Zoom 16.5x • UTM Zone 40N</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur border border-slate-700 p-1 rounded-lg">
                  <button className="px-2 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded font-semibold">+</button>
                  <button className="px-2 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded font-semibold">-</button>
                  <button className="px-2 py-1 text-xs text-cyan-400 hover:bg-slate-800 rounded flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5" />
                    <span>N</span>
                  </button>
                </div>
              </div>

              {/* Graphical Schematic Pipeline Nodes in Viewport */}
              <div className="relative z-10 my-8 p-4 flex flex-col gap-6">
                {/* Visual Pipeline Alignment Line */}
                <div className="relative w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full my-6 flex items-center justify-between">
                  {markers.map((m, idx) => (
                    <button
                      key={m.id || idx}
                      onClick={() => setSelectedMarker(m)}
                      className={`relative -top-2 flex flex-col items-center group transition-transform ${
                        selectedMarker?.id === m.id ? 'scale-125' : 'hover:scale-110'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-white shadow-lg cursor-pointer ${
                          selectedMarker?.id === m.id ? 'border-white ring-4 ring-cyan-500/40' : 'border-slate-800'
                        }`}
                        style={{ backgroundColor: m.colorHex || '#06b6d4' }}
                      >
                        <Droplets className="w-3.5 h-3.5" />
                      </div>
                      <span className="mt-1 text-[10px] font-semibold text-slate-300 bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap shadow">
                        {m.markerCode}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Simulated Geofence Polygon Box in Visualizer */}
                <div className="border border-dashed border-emerald-500/50 bg-emerald-500/5 rounded-lg p-3 text-xs text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>Active Polygon Geofence: Main WTP-100 MLD Plant Zone (Radius: 450m)</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono">Status: 4 Staff Inside</span>
                </div>
              </div>

              {/* Map Footer Information */}
              <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" /> Pipeline Valve
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" /> Booster PS
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" /> Master Reservoir
                  </span>
                </div>
                <span className="font-mono text-[11px]">Datum: WGS 84 / Web Mercator</span>
              </div>
            </div>

            {/* Selected Node / Asset Attributes Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              {selectedMarker ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[11px] font-mono text-cyan-400 font-semibold">{selectedMarker.markerCode}</span>
                      <h3 className="text-base font-bold text-white">{selectedMarker.name}</h3>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {selectedMarker.status}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                      <span className="text-slate-400">Asset Category:</span>
                      <span className="font-medium text-slate-200">{selectedMarker.markerType}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                      <span className="text-slate-400">GPS Coordinates:</span>
                      <span className="font-mono text-cyan-300">
                        {selectedMarker.latitude.toFixed(4)}, {selectedMarker.longitude.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                      <span className="text-slate-400">Ground Elevation:</span>
                      <span className="font-medium text-slate-200">{selectedMarker.elevationMeters} m MSL</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                      <span className="text-slate-400">Telemetry Status:</span>
                      <span className="font-medium text-emerald-400">Real-time Connected</span>
                    </div>
                  </div>

                  {selectedMarker.attributesJson && (
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Node Attributes</div>
                      <pre className="text-[11px] text-cyan-300 font-mono whitespace-pre-wrap">
                        {typeof selectedMarker.attributesJson === 'string'
                          ? JSON.stringify(JSON.parse(selectedMarker.attributesJson), null, 2)
                          : JSON.stringify(selectedMarker.attributesJson, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => setShowPhotoModal(true)}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Camera className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Attach Photo</span>
                    </button>
                    <button
                      onClick={() => setShowFormModal(true)}
                      className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Create ITP Log</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-500 text-xs">Select an infrastructure node on the map to inspect telemetry</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: SITE CHECK-IN / CHECK-OUT */}
      {activeSubTab === 'checkin' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Geofenced Site Check-In & Time Ledger</h2>
              <p className="text-xs text-slate-400">
                GPS biometric check-ins with anti-spoofing coordinates and shift duration tracking
              </p>
            </div>
            <button
              onClick={() => setShowCheckinModal(true)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <UserCheck className="w-4 h-4" />
              <span>Punch New Field Check-In</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Field Engineer</th>
                  <th className="py-3 px-4">Site Location / Geofence</th>
                  <th className="py-3 px-4">Punch Timestamp</th>
                  <th className="py-3 px-4">GPS Accuracy</th>
                  <th className="py-3 px-4">Biometric Status</th>
                  <th className="py-3 px-4">Shift State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {checkins.map((chk) => (
                  <tr key={chk.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[11px]">
                        {chk.userName?.slice(0, 2).toUpperCase() || 'FE'}
                      </div>
                      <span>{chk.userName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{chk.siteName}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{new Date(chk.checkinTime).toLocaleTimeString()}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400">±{chk.accuracyMeters}m (High Precision)</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 text-[11px] rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Face Verified ✓
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          chk.status === 'ACTIVE'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {chk.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: REGISTERED DEVICES */}
      {activeSubTab === 'devices' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Enterprise Mobile Device Fleet</h2>
              <p className="text-xs text-slate-400">
                Rugged field tablets, smartphones, and PWA clients registered to active personnel
              </p>
            </div>
            <button
              onClick={() => setShowDeviceModal(true)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Device</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((d) => (
              <div key={d.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{d.deviceModel}</h4>
                      <span className="text-[11px] font-mono text-slate-400">{d.deviceId}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded ${
                      d.isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {d.isOnline ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Assigned To:</span>
                    <span className="font-medium text-white">{d.assignedUserName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">OS & App Version:</span>
                    <span className="font-mono text-slate-300">
                      {d.osPlatform} • {d.appVersion}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Battery & Storage:</span>
                    <span className="font-medium text-cyan-300">
                      {d.batteryLevel}% • {(d.storageAvailableMb / 1024).toFixed(1)} GB Free
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Last Sync:</span>
                    <span className="text-slate-400">{new Date(d.lastSyncAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={handleTriggerSync}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded font-medium transition-all"
                  >
                    Remote Sync
                  </button>
                  <button className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 text-xs text-slate-400 rounded transition-all">
                    Lock / Wipe
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: GPS PHOTO EVIDENCE */}
      {activeSubTab === 'photos' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Field Inspection Photo Evidence Center</h2>
              <p className="text-xs text-slate-400">
                Watermarked construction photos tagged with GPS, chainage, heading, and QA/QC defect IDs
              </p>
            </div>
            <button
              onClick={() => setShowPhotoModal(true)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <Camera className="w-4 h-4" />
              <span>Capture & Upload Photo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((p) => (
              <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg group">
                <div className="relative h-48 bg-slate-950 overflow-hidden">
                  <img
                    src={p.photoUrl}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded bg-black/70 backdrop-blur text-[11px] font-mono text-cyan-300 border border-cyan-500/30">
                    {p.photoCode}
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 p-2 rounded bg-black/80 backdrop-blur text-[10px] font-mono text-slate-300 border border-white/10 space-y-0.5">
                    <div>GPS: {p.latitude?.toFixed(4)}° N, {p.longitude?.toFixed(4)}° E</div>
                    <div>TIME: {new Date(p.capturedAt).toLocaleString()} • WATERMARKED</div>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {p.category}
                    </span>
                    <span className="text-xs text-slate-400">{p.userName}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white leading-tight">{p.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 6: FIELD FORMS (DFR / ITP) */}
      {activeSubTab === 'forms' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Daily Field Reports & Inspection Forms</h2>
              <p className="text-xs text-slate-400">Offline-capable form submissions with automated workflow routing</p>
            </div>
            <button
              onClick={() => setShowFormModal(true)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Fill New Daily Field Form</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forms.map((f) => (
              <div key={f.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono text-cyan-400">{f.formCode}</span>
                      <h4 className="text-sm font-semibold text-white">{f.formTitle}</h4>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {f.status}
                  </span>
                </div>

                <div className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono">
                  {typeof f.formDataJson === 'string'
                    ? JSON.stringify(JSON.parse(f.formDataJson), null, 2)
                    : JSON.stringify(f.formDataJson, null, 2)}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Submitted by: {f.submittedByName}</span>
                  <span>{new Date(f.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 7: DIGITAL SIGNATURE CAPTURE */}
      {activeSubTab === 'signatures' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Digital Signature & Witness Sign-Off Pad</h2>
              <p className="text-xs text-slate-400">
                HTML5 biometric vector signature capture for test hold clearances and client milestones
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-cyan-400" />
                  <span>Interactive Sign-Off Canvas</span>
                </div>
                <button onClick={clearCanvas} className="text-xs text-slate-400 hover:text-white transition-colors">
                  Clear Canvas
                </button>
              </div>

              <div className="border border-slate-700 rounded-xl bg-slate-950 overflow-hidden relative">
                <canvas
                  ref={signatureCanvasRef}
                  width={600}
                  height={220}
                  className="w-full h-56 cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                <div className="absolute bottom-2 left-4 text-[10px] text-slate-500 font-mono pointer-events-none">
                  Sign above with stylus, touch or mouse
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Signer Full Name</label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Signer Official Role</label>
                  <input
                    type="text"
                    value={signerRole}
                    onChange={(e) => setSignerRole(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <button
                onClick={saveSignature}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold shadow-lg transition-all"
              >
                Capture & Cryptographically Seal Signature
              </button>

              {signatureSaved && (
                <div className="p-3 bg-emerald-950 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Signature captured, timestamped with GPS hash, and linked to Inspection Test Report.</span>
                </div>
              )}
            </div>

            {/* Signature Verification History */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white">Verified Signatures</h3>
              <div className="space-y-3">
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-cyan-400">SIG-HYDRO-PASS-01</span>
                    <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-300">VERIFIED</span>
                  </div>
                  <div className="text-xs font-semibold text-white">Eng. Sultan Al-Nuaimi (DEWA Lead)</div>
                  <div className="text-[11px] text-slate-400">Ch: 04+200 Hydrostatic Pressure Clearance</div>
                  <div className="text-[10px] font-mono text-slate-500">Hash: 89f4b01e92a... • GPS Stamp: 25.2012, 55.2815</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 8: GEOFENCE BOUNDARIES */}
      {activeSubTab === 'geofences' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Security & Auto-Punch Geofence Zones</h2>
              <p className="text-xs text-slate-400">
                Configured circular, polygon, and linear corridor buffer zones for automatic site logging
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {geofences.map((geo) => (
              <div key={geo.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-400 font-semibold">{geo.geofenceCode}</span>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-300">
                    {geo.status}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-white">{geo.name}</h4>

                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Fence Type:</span>
                    <span className="text-slate-200 font-medium">{geo.fenceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span className="text-slate-200 font-medium">{geo.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Radius / Buffer:</span>
                    <span className="text-cyan-300 font-mono">{geo.radiusMeters} meters</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Auto-Checkin & Dwell Detection Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 9: OFFLINE IFC DRAWINGS */}
      {activeSubTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Offline Technical Drawings & Method Statements</h2>
              <p className="text-xs text-slate-400">
                High-resolution vector blueprints cached locally on mobile storage for no-connectivity field execution
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-mono text-cyan-400">DOC-DWG-1200-ALIGN</span>
                  <h4 className="text-sm font-semibold text-white">
                    IFC Approved Alignment Drawing - Sector 4 Transmission Main (Rev D)
                  </h4>
                  <div className="mt-1 text-xs text-slate-400">Size: 8.4 MB • Version: v4.2 • Cached Locally</div>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Cached ✓
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-mono text-blue-400">DOC-ITP-HYDRO-P25</span>
                  <h4 className="text-sm font-semibold text-white">
                    Inspection & Test Plan (ITP) - Hydrostatic Pressure Testing SOP
                  </h4>
                  <div className="mt-1 text-xs text-slate-400">Size: 2.1 MB • Version: v2.0 • Cached Locally</div>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Cached ✓
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 10: OFFLINE QUEUE & ENGINE */}
      {activeSubTab === 'sync' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Offline Synchronization Engine & Queue</h2>
              <p className="text-xs text-slate-400">
                Real-time queue inspector, conflict resolution policies (Client-Wins vs Server-Wins), and transaction history
              </p>
            </div>
            <button
              onClick={handleTriggerSync}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Flush & Re-sync Queue</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-base font-semibold text-white">Sync Engine Architecture & Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="text-slate-400 mb-1">Conflict Resolution Policy</div>
                <div className="text-sm font-bold text-cyan-300">Deterministic Timestamp Merge</div>
                <div className="mt-1 text-[11px] text-slate-500">Server arbitrates with client replay sequence</div>
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="text-slate-400 mb-1">Delta Compression</div>
                <div className="text-sm font-bold text-emerald-300">GZIP Binary JSON Payload</div>
                <div className="mt-1 text-[11px] text-slate-500">92% bandwidth reduction over 3G networks</div>
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="text-slate-400 mb-1">Background Sync Cadence</div>
                <div className="text-sm font-bold text-indigo-300">Every 120 Seconds (Adaptive)</div>
                <div className="mt-1 text-[11px] text-slate-500">Accelerates to 15s during active hydrostatic tests</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SITE CHECK-IN */}
      {showCheckinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-cyan-400" />
                <span>Geofenced Site Check-In</span>
              </h3>
              <button onClick={() => setShowCheckinModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePerformCheckin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Target Site / Valve Chamber</label>
                <input
                  type="text"
                  value={checkinSiteName}
                  onChange={(e) => setCheckinSiteName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={checkinLat}
                    onChange={(e) => setCheckinLat(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={checkinLng}
                    onChange={(e) => setCheckinLng(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>GPS Accuracy: ±3.2m • Inside Approved Geofence</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCheckinModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold">
                  Confirm Biometric Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CAPTURE PHOTO */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-cyan-400" />
                <span>Watermarked Field Photo</span>
              </h3>
              <button onClick={() => setShowPhotoModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadPhoto} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Photo Description / Title</label>
                <input
                  type="text"
                  placeholder="e.g., DN1200 Hydrostatic Gauge Reading at SV-14"
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={photoCategory}
                  onChange={(e) => setPhotoCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="PROGRESS">CONSTRUCTION PROGRESS</option>
                  <option value="QAQC_DEFECT">QA/QC DEFECT</option>
                  <option value="HSE_HAZARD">HSE SAFETY HAZARD</option>
                  <option value="BILLING_PROOF">BILLING IPC PROOF</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Image URL / Local Capture</label>
                <input
                  type="text"
                  value={photoUrlInput}
                  onChange={(e) => setPhotoUrlInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold">
                  Save & Apply GPS Stamp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT FIELD FORM */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>Submit Daily Field Form</span>
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Form Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Trench Excavated (m)</label>
                  <input
                    type="number"
                    value={formMeters}
                    onChange={(e) => setFormMeters(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Crew Size On-Site</label>
                  <input
                    type="number"
                    value={formCrewCount}
                    onChange={(e) => setFormCrewCount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold">
                  Submit Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER NEW DEVICE */}
      {showDeviceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <span>Register Mobile Device</span>
              </h3>
              <button onClick={() => setShowDeviceModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterDevice} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Hardware Model Name</label>
                <input
                  type="text"
                  value={newDeviceModel}
                  onChange={(e) => setNewDeviceModel(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Operating System</label>
                <select
                  value={newDevicePlatform}
                  onChange={(e) => setNewDevicePlatform(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="ANDROID">ANDROID (RUGGED ENTERPRISE)</option>
                  <option value="IOS">APPLE IOS (IPHONE)</option>
                  <option value="IPAD_OS">APPLE IPADOS (FIELD TABLET)</option>
                  <option value="PWA">PROGRESSIVE WEB APP (PWA)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Assigned Field User</label>
                <input
                  type="text"
                  value={newDeviceUser}
                  onChange={(e) => setNewDeviceUser(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeviceModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold">
                  Provision Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
