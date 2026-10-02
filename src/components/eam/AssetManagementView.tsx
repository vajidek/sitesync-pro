import React, { useState } from 'react';
import {
  Wrench,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  QrCode,
  FileText,
  Camera,
  Layers,
  MapPin,
  Calendar,
  DollarSign,
  Activity,
  Plus,
  Search,
  Filter,
  Eye,
  ChevronRight,
  TrendingUp,
  Tag,
  Gauge,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface Asset {
  id: string;
  assetCode: string;
  assetName: string;
  categoryId: string;
  locationId?: string;
  serialNumber?: string;
  modelNumber?: string;
  manufacturer?: string;
  status: string;
  criticality: string;
  purchaseDate?: string;
  purchaseCostAed: number;
  currentBookValueAed: number;
  warrantyExpiryDate?: string;
  operatingHours: number;
  runningMeterReading: number;
  meterUnit: string;
  department: string;
  photoUrl?: string;
}

interface AssetManagementViewProps {
  assets: Asset[];
  categories: any[];
  locations: any[];
  criticalityMatrix: any[];
  onRefresh: () => void;
  onCreateAsset: (data: any) => Promise<void>;
  onUpdateAssetStatus: (id: string, status: string) => Promise<void>;
}

export const AssetManagementView: React.FC<AssetManagementViewProps> = ({
  assets,
  categories,
  locations,
  criticalityMatrix,
  onRefresh,
  onCreateAsset,
  onUpdateAssetStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCriticality, setSelectedCriticality] = useState('ALL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE' | 'TREE'>('CARDS');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'REGISTER' | 'CRITICALITY' | 'LIFECYCLE' | 'DOCS'>('REGISTER');

  // Form State
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetCode, setNewAssetCode] = useState('');
  const [newCategoryId, setNewCategoryId] = useState(categories[0]?.id || 'cat-heavy-machinery');
  const [newLocationId, setNewLocationId] = useState(locations[0]?.id || 'loc-dubai-site-1');
  const [newManufacturer, setNewManufacturer] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newSerial, setNewSerial] = useState('');
  const [newCost, setNewCost] = useState(250000);
  const [newCriticality, setNewCriticality] = useState('CRITICAL_CLASS_A');
  const [newDepartment, setNewDepartment] = useState('Plant & Heavy Machinery');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.manufacturer && a.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.serialNumber && a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || a.categoryId === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || a.status === selectedStatus;
    const matchesCrit = selectedCriticality === 'ALL' || a.criticality === selectedCriticality;

    return matchesSearch && matchesCategory && matchesStatus && matchesCrit;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName) return;
    setIsSubmitting(true);
    try {
      await onCreateAsset({
        assetName: newAssetName,
        assetCode: newAssetCode || undefined,
        categoryId: newCategoryId,
        locationId: newLocationId,
        manufacturer: newManufacturer,
        modelNumber: newModel,
        serialNumber: newSerial,
        purchaseCostAed: Number(newCost) || 0,
        currentBookValueAed: Number(newCost) || 0,
        criticality: newCriticality,
        department: newDepartment,
        status: 'OPERATIONAL',
        operatingHours: 0,
        runningMeterReading: 0,
        meterUnit: 'HOURS',
      });
      setIsCreateModalOpen(false);
      setNewAssetName('');
      setNewAssetCode('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPERATIONAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Operational
          </span>
        );
      case 'UNDER_MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            In Maintenance
          </span>
        );
      case 'BREAKDOWN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
            Breakdown
          </span>
        );
      case 'STANDBY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Standby / Reserve
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            {status}
          </span>
        );
    }
  };

  const getCriticalityBadge = (crit: string) => {
    switch (crit) {
      case 'CRITICAL_CLASS_A':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
            <Shield className="w-3 h-3 text-rose-500" />
            Class A (Critical)
          </span>
        );
      case 'ESSENTIAL_CLASS_B':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            <Shield className="w-3 h-3 text-amber-500" />
            Class B (Essential)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30">
            Class C (General)
          </span>
        );
    }
  };

  return (
    <div id="asset-management-view-container" className="space-y-6">
      {/* Sub-Header / Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            id="tab-btn-register"
            onClick={() => setActiveTab('REGISTER')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'REGISTER'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Asset Register ({assets.length})
          </button>
          <button
            id="tab-btn-criticality"
            onClick={() => setActiveTab('CRITICALITY')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'CRITICALITY'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            RCM Criticality Matrix
          </button>
          <button
            id="tab-btn-lifecycle"
            onClick={() => setActiveTab('LIFECYCLE')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'LIFECYCLE'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Lifecycle & Valuation
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            id="btn-open-create-asset"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Register New Asset
          </button>
        </div>
      </div>

      {activeTab === 'REGISTER' && (
        <div className="space-y-5">
          {/* Search & Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="input-asset-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search asset, serial, tag, make..."
                className="w-full pl-9 pr-4 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                id="select-category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.categoryName}
                  </option>
                ))}
              </select>

              <select
                id="select-status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPERATIONAL">Operational</option>
                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                <option value="BREAKDOWN">Breakdown</option>
                <option value="STANDBY">Standby</option>
              </select>

              <select
                id="select-crit-filter"
                value={selectedCriticality}
                onChange={(e) => setSelectedCriticality(e.target.value)}
                className="px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Criticality</option>
                <option value="CRITICAL_CLASS_A">Class A (Critical)</option>
                <option value="ESSENTIAL_CLASS_B">Class B (Essential)</option>
                <option value="GENERAL_CLASS_C">Class C (General)</option>
              </select>

              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg p-1 bg-slate-50 dark:bg-slate-800">
                <button
                  onClick={() => setViewMode('CARDS')}
                  className={`px-2.5 py-1 text-xs font-medium rounded ${
                    viewMode === 'CARDS' ? 'bg-white dark:bg-slate-700 shadow-xs text-blue-600 dark:text-blue-400' : 'text-slate-500'
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('TABLE')}
                  className={`px-2.5 py-1 text-xs font-medium rounded ${
                    viewMode === 'TABLE' ? 'bg-white dark:bg-slate-700 shadow-xs text-blue-600 dark:text-blue-400' : 'text-slate-500'
                  }`}
                >
                  Table
                </button>
              </div>
            </div>
          </div>

          {/* Cards View */}
          {viewMode === 'CARDS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAssets.map((asset) => (
                <motion.div
                  key={asset.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Card Header & Photo */}
                    <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={asset.photoUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600'}
                        alt={asset.assetName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-white font-mono text-xs font-bold border border-white/20">
                          {asset.assetCode}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">{getStatusBadge(asset.status)}</div>
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h3 className="font-semibold text-sm line-clamp-1 text-white drop-shadow-sm">{asset.assetName}</h3>
                        <p className="text-xs text-slate-200 drop-shadow-xs">{asset.manufacturer || 'OEM Standard Equipment'}</p>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Criticality Class:</span>
                        {getCriticalityBadge(asset.criticality)}
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">Running Hours</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                            <Gauge className="w-3.5 h-3.5 text-blue-500" />
                            {asset.operatingHours?.toLocaleString()} {asset.meterUnit}
                          </span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">Book Value</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                            AED {asset.currentBookValueAed?.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-slate-600 dark:text-slate-400 pt-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span>Serial Number:</span>
                          <span className="font-mono text-slate-800 dark:text-slate-200">{asset.serialNumber || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span>Department:</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{asset.department}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      id={`btn-view-asset-${asset.id}`}
                      onClick={() => setSelectedAsset(asset)}
                      className="px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded text-xs font-medium border border-slate-200 dark:border-slate-600 flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      View Dossier
                    </button>

                    <div className="flex items-center gap-1">
                      {asset.status === 'OPERATIONAL' ? (
                        <button
                          onClick={() => onUpdateAssetStatus(asset.id, 'UNDER_MAINTENANCE')}
                          className="px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 rounded text-[11px] font-semibold border border-amber-500/20"
                        >
                          Service
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateAssetStatus(asset.id, 'OPERATIONAL')}
                          className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded text-[11px] font-semibold border border-emerald-500/20"
                        >
                          Release
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'TABLE' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3">Asset Code & Name</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Criticality</th>
                      <th className="px-4 py-3">Operating Hours</th>
                      <th className="px-4 py-3">Valuation (AED)</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                              <img
                                src={asset.photoUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200'}
                                alt=""
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">{asset.assetName}</div>
                              <div className="font-mono text-[11px] text-blue-600 dark:text-blue-400">{asset.assetCode}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {categories.find((c) => c.id === asset.categoryId)?.categoryName || asset.categoryId}
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(asset.status)}</td>
                        <td className="px-4 py-3">{getCriticalityBadge(asset.criticality)}</td>
                        <td className="px-4 py-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                          {asset.operatingHours?.toLocaleString()} {asset.meterUnit}
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          AED {asset.currentBookValueAed?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelectedAsset(asset)}
                            className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded font-medium text-xs"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Criticality Matrix Tab */}
      {activeTab === 'CRITICALITY' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-rose-500" />
                Reliability-Centered Maintenance (RCM) Criticality Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-dimensional failure mode, safety hazard & financial impact scoring model (Score Range: 5 - 25)
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 font-semibold text-rose-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Class A (&gt;18)
              </span>
              <span className="flex items-center gap-1 font-semibold text-amber-600 ml-3">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Class B (11-17)
              </span>
              <span className="flex items-center gap-1 font-semibold text-slate-600 ml-3">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Class C (&le;10)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map((asset) => {
              const crit = criticalityMatrix.find((c) => c.assetId === asset.id);
              const score = crit?.totalRiskScore || (asset.criticality === 'CRITICAL_CLASS_A' ? 22 : 13);
              return (
                <div
                  key={asset.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs text-blue-600 font-bold">{asset.assetCode}</span>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1">{asset.assetName}</h4>
                    </div>
                    {getCriticalityBadge(asset.criticality)}
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Safety Impact Score:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{crit?.safetyImpactScore || 4} / 5</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Production Stoppage Risk:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{crit?.productionLossScore || 5} / 5</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Spare Parts Lead Time:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{crit?.spareLeadTimeScore || 4} / 5</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Composite Risk Score:</span>
                    <span className="px-2.5 py-0.5 rounded-full font-mono text-xs font-extrabold bg-rose-500/20 text-rose-600 dark:text-rose-400">
                      {score} / 25
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lifecycle & Valuation Tab */}
      {activeTab === 'LIFECYCLE' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Capital Equipment Valuation & Depreciation Schedule
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Straight-line asset depreciation, salvage value projections & capitalized maintenance additions
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">Asset Code & Title</th>
                  <th className="px-4 py-3">Acquisition Date</th>
                  <th className="px-4 py-3">Original Capital Cost</th>
                  <th className="px-4 py-3">Accumulated Depreciation</th>
                  <th className="px-4 py-3">Current Net Book Value</th>
                  <th className="px-4 py-3">Warranty Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {assets.map((asset) => {
                  const depr = Math.max(0, (asset.purchaseCostAed || 0) - (asset.currentBookValueAed || 0));
                  return (
                    <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white">{asset.assetName}</div>
                        <div className="font-mono text-[11px] text-slate-500">{asset.assetCode}</div>
                      </td>
                      <td className="px-4 py-3 font-mono">{asset.purchaseDate || '2023-01-01'}</td>
                      <td className="px-4 py-3 font-mono font-medium">AED {asset.purchaseCostAed?.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-rose-500 font-medium">AED {depr.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        AED {asset.currentBookValueAed?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                        {asset.warrantyExpiryDate || '2026-12-31'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Asset Dossier Modal */}
      <AnimatePresence>
        {selectedAsset && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedAsset.assetName}</h3>
                    <span className="font-mono text-xs text-blue-600 font-bold">{selectedAsset.assetCode}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg">
                    <span className="text-slate-500 block">Status</span>
                    <span className="font-semibold text-slate-900 dark:text-white mt-1 block">{selectedAsset.status}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg">
                    <span className="text-slate-500 block">Criticality</span>
                    <span className="font-semibold text-slate-900 dark:text-white mt-1 block">{selectedAsset.criticality}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg">
                    <span className="text-slate-500 block">Operating Hours</span>
                    <span className="font-mono font-bold text-blue-600 mt-1 block">{selectedAsset.operatingHours} Hours</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg">
                    <span className="text-slate-500 block">Current Book Value</span>
                    <span className="font-mono font-bold text-emerald-600 mt-1 block">AED {selectedAsset.currentBookValueAed?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Asset Technical Metadata</h4>
                  <div className="grid grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                      <span className="text-slate-500">Manufacturer:</span>
                      <span className="font-medium">{selectedAsset.manufacturer || 'OEM'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                      <span className="text-slate-500">Model Number:</span>
                      <span className="font-medium">{selectedAsset.modelNumber || 'Standard Model'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                      <span className="text-slate-500">Serial Number:</span>
                      <span className="font-mono">{selectedAsset.serialNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                      <span className="text-slate-500">Department:</span>
                      <span className="font-medium">{selectedAsset.department}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <QrCode className="w-8 h-8 text-blue-600" />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">QR / RFID Telemetry Tag</span>
                      <p className="text-[11px] text-slate-500 font-mono">RFID: 0x88F920-EAM-{selectedAsset.id.slice(-6)}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded bg-blue-600 text-white font-medium text-xs">Active Sensor Link</span>
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold"
                >
                  Close Dossier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Asset Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Register Capital Asset</h3>
                    <p className="text-xs text-slate-500">Add plant machinery or testing equipment to master inventory</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 overflow-y-auto space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Asset Name / Model Title *</label>
                  <input
                    type="text"
                    required
                    value={newAssetName}
                    onChange={(e) => setNewAssetName(e.target.value)}
                    placeholder="e.g. Putzmeister BSA 2110 HP-D Concrete Pump"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Asset Code (Optional)</label>
                    <input
                      type="text"
                      value={newAssetCode}
                      onChange={(e) => setNewAssetCode(e.target.value)}
                      placeholder="e.g. EQ-CRN-005"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Category *</label>
                    <select
                      value={newCategoryId}
                      onChange={(e) => setNewCategoryId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Manufacturer</label>
                    <input
                      type="text"
                      value={newManufacturer}
                      onChange={(e) => setNewManufacturer(e.target.value)}
                      placeholder="e.g. Liebherr / Caterpillar"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Serial Number</label>
                    <input
                      type="text"
                      value={newSerial}
                      onChange={(e) => setNewSerial(e.target.value)}
                      placeholder="e.g. SN-8849201"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Purchase Capital Cost (AED)</label>
                    <input
                      type="number"
                      value={newCost}
                      onChange={(e) => setNewCost(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Criticality Class</label>
                    <select
                      value={newCriticality}
                      onChange={(e) => setNewCriticality(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="CRITICAL_CLASS_A">Class A (Critical)</option>
                      <option value="ESSENTIAL_CLASS_B">Class B (Essential)</option>
                      <option value="GENERAL_CLASS_C">Class C (General)</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-medium text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs shadow-sm flex items-center gap-2"
                  >
                    {isSubmitting ? 'Registering...' : 'Complete Registration'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
