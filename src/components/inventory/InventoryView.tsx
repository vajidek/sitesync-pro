import React, { useState, useEffect } from 'react';
import { safeJson } from '../../lib/safeFetch';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Warehouse as WarehouseIcon,
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ShoppingCart,
  FileCheck,
  QrCode,
  FileText,
  AlertTriangle,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Building2,
  Tag,
  DollarSign,
  PackageCheck,
  Layers,
  TrendingUp,
  Download,
  RefreshCw as ReturnIcon,
  Sliders
} from 'lucide-react';
import {
  DSPageHeader,
  DSCard,
  DSButton,
  DSStatusChip,
  DSSearchBox,
  DSTabs
} from '../ui/design-system';
import {
  MaterialMasterItem,
  WarehouseItem,
  StockTransactionItem,
  PurchaseRequestItem,
  PurchaseOrderItem,
  StockVerificationItem,
  GoodsReceiptRecord,
  MaterialIssueRecord,
  MaterialTransferRecord,
  MaterialReturnRecord,
  InventoryAdjustmentRecord,
} from '../../types/inventory';
import { MaterialMasterModal } from './MaterialMasterModal';
import { WarehouseModal } from './WarehouseModal';
import { StockTransactionModal } from './StockTransactionModal';
import { PurchaseRequestModal } from './PurchaseRequestModal';
import { PurchaseOrderModal } from './PurchaseOrderModal';
import { PhysicalAuditModal } from './PhysicalAuditModal';
import { BarcodeQrScannerModal } from './BarcodeQrScannerModal';
import { InventoryReportsView } from './InventoryReportsView';
import { GoodsReceiptModal } from './GoodsReceiptModal';
import { MaterialIssueModal } from './MaterialIssueModal';
import { MaterialTransferModal } from './MaterialTransferModal';
import { MaterialReturnModal } from './MaterialReturnModal';
import { InventoryAdjustmentModal } from './InventoryAdjustmentModal';

export const InventoryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    | 'MATERIALS'
    | 'WAREHOUSES'
    | 'GRN'
    | 'ISSUES'
    | 'TRANSFERS'
    | 'RETURNS'
    | 'ADJUSTMENTS'
    | 'TRANSACTIONS'
    | 'REQUISITIONS'
    | 'PURCHASE_ORDERS'
    | 'VERIFICATION'
    | 'REPORTS'
  >('MATERIALS');

  // Data States
  const [materials, setMaterials] = useState<MaterialMasterItem[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [transactions, setTransactions] = useState<StockTransactionItem[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequestItem[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderItem[]>([]);
  const [verifications, setVerifications] = useState<StockVerificationItem[]>([]);
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceiptRecord[]>([]);
  const [materialIssues, setMaterialIssues] = useState<MaterialIssueRecord[]>([]);
  const [materialTransfers, setMaterialTransfers] = useState<MaterialTransferRecord[]>([]);
  const [materialReturns, setMaterialReturns] = useState<MaterialReturnRecord[]>([]);
  const [adjustments, setAdjustments] = useState<InventoryAdjustmentRecord[]>([]);

  const [projects, setProjects] = useState<{ id: string; projectName: string }[]>([]);
  const [sites, setSites] = useState<{ id: string; siteName: string }[]>([]);
  const [vendors, setVendors] = useState<{ id: string; name: string; paymentTerms?: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [units, setUnits] = useState<{ id: string; name: string; code: string }[]>([]);

  // Analytics State
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

  // Modal States
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [selectedMaterialForEdit, setSelectedMaterialForEdit] = useState<MaterialMasterItem | null>(null);

  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [selectedWarehouseForEdit, setSelectedWarehouseForEdit] = useState<WarehouseItem | null>(null);

  const [isTxnModalOpen, setIsTxnModalOpen] = useState(false);
  const [txnInitialType, setTxnInitialType] = useState<StockTransactionItem['transactionType']>('GOODS_ISSUE');

  const [isPrModalOpen, setIsPrModalOpen] = useState(false);
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [selectedMaterialForCode, setSelectedMaterialForCode] = useState<MaterialMasterItem | null>(null);

  // Helper to get authorization headers safely
  const getAuthHeaders = () => {
    const token = localStorage.getItem('sitesync_access_token') || localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const getJsonAuthHeaders = () => {
    const token = localStorage.getItem('sitesync_access_token') || localStorage.getItem('token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Fetch Inventory Data from API
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();

      const fetchJson = async (url: string) => {
        try {
          const res = await fetch(url, { headers });
          if (!res.ok) return { success: false, data: [] };
          return (await safeJson(res)) || { success: false, data: [] };
        } catch {
          return { success: false, data: [] };
        }
      };

      const [
        matRes,
        whRes,
        txnRes,
        prRes,
        poRes,
        stvRes,
        grnRes,
        mivRes,
        xferRes,
        rtnRes,
        adjRes,
        projRes,
        analyticsRes,
      ] = await Promise.all([
        fetchJson('/api/inventory/materials'),
        fetchJson('/api/inventory/warehouses'),
        fetchJson('/api/inventory/transactions'),
        fetchJson('/api/inventory/purchase-requests'),
        fetchJson('/api/inventory/purchase-orders'),
        fetchJson('/api/inventory/verifications'),
        fetchJson('/api/inventory/goods-receipts'),
        fetchJson('/api/inventory/material-issues'),
        fetchJson('/api/inventory/material-transfers'),
        fetchJson('/api/inventory/material-returns'),
        fetchJson('/api/inventory/adjustments'),
        fetchJson('/api/projects'),
        fetchJson('/api/inventory/analytics'),
      ]);

      if (matRes.success && Array.isArray(matRes.data)) setMaterials(matRes.data);
      if (whRes.success && Array.isArray(whRes.data)) setWarehouses(whRes.data);
      if (txnRes.success && Array.isArray(txnRes.data)) setTransactions(txnRes.data);
      if (prRes.success && Array.isArray(prRes.data)) setPurchaseRequests(prRes.data);
      if (poRes.success && Array.isArray(poRes.data)) setPurchaseOrders(poRes.data);
      if (stvRes.success && Array.isArray(stvRes.data)) setVerifications(stvRes.data);
      if (grnRes.success && Array.isArray(grnRes.data)) setGoodsReceipts(grnRes.data);
      if (mivRes.success && Array.isArray(mivRes.data)) setMaterialIssues(mivRes.data);
      if (xferRes.success && Array.isArray(xferRes.data)) setMaterialTransfers(xferRes.data);
      if (rtnRes.success && Array.isArray(rtnRes.data)) setMaterialReturns(rtnRes.data);
      if (adjRes.success && Array.isArray(adjRes.data)) setAdjustments(adjRes.data);
      if (analyticsRes.success && analyticsRes.data) setAnalytics(analyticsRes.data);

      if (projRes.success && Array.isArray(projRes.data)) {
        setProjects(projRes.data.map((p: any) => ({ id: p.id, projectName: p.projectName })));
      }

      setCategories([
        { id: 'cat-001', name: 'High Pressure Steel Piping' },
        { id: 'cat-002', name: 'Structural Steel Beams' },
        { id: 'cat-003', name: 'Flanges & Valves' },
        { id: 'cat-004', name: 'Fasteners & Welding Consumables' },
      ]);
      setUnits([
        { id: 'unt-001', name: 'Meter', code: 'MTR' },
        { id: 'unt-002', name: 'Pieces', code: 'PCS' },
        { id: 'unt-003', name: 'Metric Tonne', code: 'TON' },
      ]);
      setVendors([
        { id: 'vnd-001', name: 'Emirates Steel Industries PJSC', paymentTerms: 'Net 60 Days' },
        { id: 'vnd-002', name: 'Tenaris Global Pipes UAE', paymentTerms: 'Net 30 Days' },
        { id: 'vnd-003', name: 'Galperti Forging UAE LLC', paymentTerms: 'Net 45 Days' },
      ]);
      setSites([
        { id: 'sit-001', siteName: 'Reem Offshore Yard Alpha' },
        { id: 'sit-002', siteName: 'Mussafah Central Fabricators Yard' },
        { id: 'sit-003', siteName: 'Jebel Ali Main Substation' },
      ]);
    } catch (err) {
      console.error('Error fetching inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handlers
  const handleSaveMaterial = async (data: Partial<MaterialMasterItem>) => {
    const headers = getJsonAuthHeaders();

    if (selectedMaterialForEdit) {
      await fetch(`/api/inventory/materials/${selectedMaterialForEdit.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/inventory/materials', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
    }
    fetchAllData();
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this material SKU?')) return;
    const headers = getAuthHeaders();
    await fetch(`/api/inventory/materials/${id}`, {
      method: 'DELETE',
      headers,
    });
    fetchAllData();
  };

  const handleSaveWarehouse = async (data: Partial<WarehouseItem>) => {
    const headers = getJsonAuthHeaders();

    await fetch('/api/inventory/warehouses', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    fetchAllData();
  };

  const handleSaveTransaction = async (data: Partial<StockTransactionItem>) => {
    const headers = getJsonAuthHeaders();

    await fetch('/api/inventory/transactions', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    fetchAllData();
  };

  const handleSavePurchaseRequest = async (data: Partial<PurchaseRequestItem>) => {
    const headers = getJsonAuthHeaders();

    await fetch('/api/inventory/purchase-requests', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    fetchAllData();
  };

  const handleUpdatePrStatus = async (id: string, status: PurchaseRequestItem['status']) => {
    const headers = getJsonAuthHeaders();
    await fetch(`/api/inventory/purchase-requests/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
    fetchAllData();
  };

  const handleSavePurchaseOrder = async (data: Partial<PurchaseOrderItem>) => {
    const headers = getJsonAuthHeaders();

    await fetch('/api/inventory/purchase-orders', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    fetchAllData();
  };

  const handleSaveAudit = async (data: Partial<StockVerificationItem>) => {
    const headers = getJsonAuthHeaders();

    await fetch('/api/inventory/verifications', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    fetchAllData();
  };

  // Filtered materials
  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.barcode && m.barcode.includes(searchTerm)) ||
      (m.hsnCode && m.hsnCode.includes(searchTerm));
    const matchesCat = selectedCategoryFilter === 'ALL' || m.categoryId === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Title Banner */}
      <DSPageHeader
        title="Material & Store Inventory ERP"
        description="Multi-warehouse stock control, project material issues, requisitions, purchase orders, and barcode tracking"
        breadcrumbs={[{ label: 'ERP' }, { label: 'Inventory' }]}
        actions={
          <>
            <DSButton
              variant="outline"
              size="sm"
              isLoading={loading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={fetchAllData}
            >
              Refresh
            </DSButton>

            <DSButton
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5 text-emerald-600" />}
              onClick={() => {
                const rows = ["Code,Name,Category,UnitPrice,CurrentStock,Status"]
                  .concat(materials.map(m => `"${m.itemCode || ''}","${m.name || ''}","${m.categoryId || ''}","${m.unitPrice || 0}","${m.currentStock || 0}","${m.status || 'Active'}"`));
                const blob = new Blob([rows.join("\n")], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", `inventory_stock_catalog_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
            >
              Export
            </DSButton>

            <DSButton
              variant="secondary"
              size="sm"
              leftIcon={<QrCode className="w-3.5 h-3.5 text-blue-400" />}
              onClick={() => {
                setSelectedMaterialForCode(null);
                setIsScannerModalOpen(true);
              }}
            >
              Scanner
            </DSButton>

            <DSButton
              variant="primary"
              size="sm"
              leftIcon={<ArrowRightLeft className="w-3.5 h-3.5" />}
              onClick={() => {
                setTxnInitialType('GOODS_ISSUE');
                setIsTxnModalOpen(true);
              }}
            >
              Issue Material
            </DSButton>

            <DSButton
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setSelectedMaterialForEdit(null);
                setIsMaterialModalOpen(true);
              }}
            >
              Add SKU
            </DSButton>
          </>
        }
      />

      {/* KPI Executive Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <DSCard className="p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total SKU Catalog</span>
            <Boxes className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{analytics?.totalMaterials || materials.length}</div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Active Store Items</div>
        </DSCard>

        <DSCard className="p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Store Yards</span>
            <WarehouseIcon className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{warehouses.length}</div>
          <div className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">Central & Site Buffers</div>
        </DSCard>

        <DSCard className="p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Valuation ($)</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            ${analytics?.totalValuation ? analytics.totalValuation.toLocaleString() : '689,700'}
          </div>
          <div className="text-[10px] text-slate-400">Total Asset Holding</div>
        </DSCard>

        <DSCard className="p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Reorder Warning</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {materials.filter((m) => m.currentStock <= m.reorderLevel).length}
          </div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Low Stock Items</div>
        </DSCard>

        <DSCard className="p-4 space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pending Requisitions</span>
            <ShoppingCart className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {purchaseRequests.filter((r) => r.status === 'SUBMITTED' || r.status === 'VERIFIED').length}
          </div>
          <div className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">Awaiting Approval</div>
        </DSCard>
      </div>

      {/* Main Module Navigation Tabs */}
      <div className="pb-2">
        <DSTabs
          tabs={[
            { id: 'MATERIALS', label: `Materials (${materials.length})`, icon: <Boxes className="w-4 h-4" /> },
            { id: 'WAREHOUSES', label: `Warehouses (${warehouses.length})`, icon: <WarehouseIcon className="w-4 h-4" /> },
            { id: 'GRN', label: `GRN Receipts (${goodsReceipts.length})`, icon: <PackageCheck className="w-4 h-4 text-emerald-500" /> },
            { id: 'ISSUES', label: `Issues MIV (${materialIssues.length})`, icon: <ArrowUpRight className="w-4 h-4 text-blue-500" /> },
            { id: 'TRANSFERS', label: `Transfers (${materialTransfers.length})`, icon: <ArrowRightLeft className="w-4 h-4 text-purple-500" /> },
            { id: 'RETURNS', label: `Returns (${materialReturns.length})`, icon: <ReturnIcon className="w-4 h-4 text-amber-500" /> },
            { id: 'ADJUSTMENTS', label: `Adjustments (${adjustments.length})`, icon: <AlertTriangle className="w-4 h-4 text-red-500" /> },
            { id: 'TRANSACTIONS', label: `Stock Ledger (${transactions.length})`, icon: <Layers className="w-4 h-4" /> },
            { id: 'REQUISITIONS', label: `PRs (${purchaseRequests.length})`, icon: <ShoppingCart className="w-4 h-4" /> },
            { id: 'PURCHASE_ORDERS', label: `POs (${purchaseOrders.length})`, icon: <FileCheck className="w-4 h-4" /> },
            { id: 'VERIFICATION', label: `Audit (${verifications.length})`, icon: <ClipboardCheck className="w-4 h-4" /> },
            { id: 'REPORTS', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
          ]}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as any)}
          variant="underline"
        />
      </div>

      {/* TAB 1: MATERIAL MASTER CATALOG */}
      {activeTab === 'MATERIALS' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Search code, name, barcode, HSN..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                onClick={fetchAllData}
                className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                title="Refresh Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table View */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3.5 px-4">Item Code / Spec</th>
                    <th className="py-3.5 px-4">Material Name</th>
                    <th className="py-3.5 px-4">Brand / Manufacturer</th>
                    <th className="py-3.5 px-4">Unit Price</th>
                    <th className="py-3.5 px-4">Min - Max Level</th>
                    <th className="py-3.5 px-4">Current Stock</th>
                    <th className="py-3.5 px-4">Barcode / QR</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                  {filteredMaterials.map((m) => {
                    const isLow = m.currentStock <= m.reorderLevel;
                    return (
                      <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                            {m.itemCode}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-1">HSN: {m.hsnCode || '73041910'}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          <div>{m.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{m.specification}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          <div>{m.brand || 'Generic'}</div>
                          <div className="text-[10px] text-slate-400">{m.manufacturer}</div>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          ${m.unitPrice}
                          <span className="text-[10px] text-slate-400 block font-normal">GST: {m.gstPercentage}%</span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-medium">
                          {m.minStock} - {m.maxStock}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-xs font-black inline-flex items-center gap-1.5 ${
                              isLow
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {isLow && <AlertTriangle className="w-3.5 h-3.5" />}
                            {m.currentStock} units
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => {
                              setSelectedMaterialForCode(m);
                              setIsScannerModalOpen(true);
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-blue-600 dark:text-blue-400 font-mono text-[10px] border border-slate-200 dark:border-slate-700 flex items-center gap-1"
                          >
                            <QrCode className="w-3 h-3" /> Label Code
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedMaterialForEdit(m);
                              setIsMaterialModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMaterial(m.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold"
                          >
                            Deactivate
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WAREHOUSE YARDS */}
      {activeTab === 'WAREHOUSES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Store Warehouses & Logistics Depots</h2>
            <button
              onClick={() => {
                setSelectedWarehouseForEdit(null);
                setIsWarehouseModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md"
            >
              + Register Warehouse Yard
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {warehouses.map((wh) => (
              <div
                key={wh.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                      {wh.code}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1">{wh.name}</h3>
                    <p className="text-xs text-slate-500">{wh.location}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {wh.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Manager</span>
                    <span className="font-bold text-slate-900 dark:text-white">{wh.managerName || 'Ramesh Patel'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Capacity</span>
                    <span className="font-bold text-slate-900 dark:text-white">{wh.capacity} SQM</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STOCK TRANSACTION LEDGER */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Real-Time Stock Movement Audit Ledger</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setTxnInitialType('GOODS_RECEIPT');
                  setIsTxnModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                + Goods Receipt (GRN)
              </button>
              <button
                onClick={() => {
                  setTxnInitialType('GOODS_ISSUE');
                  setIsTxnModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                + Goods Issue (GI)
              </button>
              <button
                onClick={() => {
                  setTxnInitialType('TRANSFER');
                  setIsTxnModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
              >
                + Material Transfer
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3.5 px-4">Txn Ref #</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Material SKU</th>
                    <th className="py-3.5 px-4">Warehouse</th>
                    <th className="py-3.5 px-4">Quantity</th>
                    <th className="py-3.5 px-4">Project / Site</th>
                    <th className="py-3.5 px-4">Personnel (Issued / Recv)</th>
                    <th className="py-3.5 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {t.transactionCode}
                        <span className="text-[10px] text-slate-400 block font-normal">{t.referenceDoc}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.transactionType === 'GOODS_RECEIPT'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : t.transactionType === 'GOODS_ISSUE'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          }`}
                        >
                          {t.transactionType}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">{t.materialName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{t.materialCode}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {t.warehouseName}
                        {t.targetWarehouseName && (
                          <span className="text-[10px] text-purple-500 block">→ {t.targetWarehouseName}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-black text-slate-900 dark:text-white">
                        {t.quantity} units (${t.totalValue.toLocaleString()})
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {t.projectName || 'Store Central Yard'}
                        <span className="text-[10px] text-slate-400 block">{t.workCategory}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        <div>By: {t.issuedByName}</div>
                        <div className="text-[10px] text-slate-400">Recv: {t.receivedByName}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{t.transactionDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REQUISITIONS PR */}
      {activeTab === 'REQUISITIONS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Material Requisitions & Approval Workflows</h2>
            <button
              onClick={() => setIsPrModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md"
            >
              + Submit Requisition (PR)
            </button>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3.5 px-4">PR Code</th>
                    <th className="py-3.5 px-4">Project & Site</th>
                    <th className="py-3.5 px-4">Material Required</th>
                    <th className="py-3.5 px-4">Qty & Unit</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Required Date</th>
                    <th className="py-3.5 px-4">Workflow Status</th>
                    <th className="py-3.5 px-4 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                  {purchaseRequests.map((pr) => (
                    <tr key={pr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                        {pr.requisitionCode}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">{pr.projectName}</span>
                        <span className="text-[10px] text-slate-400">{pr.siteName}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{pr.materialName}</td>
                      <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white">
                        {pr.quantity} {pr.unit}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          {pr.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{pr.requiredDate}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          pr.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : pr.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {pr.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        {pr.status === 'SUBMITTED' && (
                          <button
                            onClick={() => handleUpdatePrStatus(pr.id, 'VERIFIED')}
                            className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-[10px] font-bold"
                          >
                            Verify
                          </button>
                        )}
                        {(pr.status === 'SUBMITTED' || pr.status === 'VERIFIED') && (
                          <button
                            onClick={() => handleUpdatePrStatus(pr.id, 'APPROVED')}
                            className="px-2 py-1 rounded bg-emerald-600 text-white text-[10px] font-bold"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PURCHASE ORDERS */}
      {activeTab === 'PURCHASE_ORDERS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Purchase Orders (PO) Foundation</h2>
            <button
              onClick={() => setIsPoModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md"
            >
              + Create Purchase Order
            </button>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3.5 px-4">PO Number</th>
                    <th className="py-3.5 px-4">Vendor Name</th>
                    <th className="py-3.5 px-4">Project</th>
                    <th className="py-3.5 px-4">Amount ($)</th>
                    <th className="py-3.5 px-4">Delivery Date</th>
                    <th className="py-3.5 px-4">Delivery Status</th>
                    <th className="py-3.5 px-4">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                        {po.poNumber}
                        <span className="text-[10px] text-slate-400 block font-normal">Ref: {po.quotationRef}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{po.vendorName}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{po.projectName || 'General Supply'}</td>
                      <td className="py-3 px-4 font-black text-slate-900 dark:text-white">${po.totalAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{po.expectedDeliveryDate}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          {po.deliveryStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                          {po.paymentStatus}
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

      {/* TAB 6: PHYSICAL AUDIT VERIFICATION */}
      {activeTab === 'VERIFICATION' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Physical Stock Verification Audits</h2>
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
            >
              + Record Stock Verification Audit
            </button>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3.5 px-4">Audit Code</th>
                    <th className="py-3.5 px-4">Warehouse</th>
                    <th className="py-3.5 px-4">Material SKU</th>
                    <th className="py-3.5 px-4">System Stock</th>
                    <th className="py-3.5 px-4">Physical Count</th>
                    <th className="py-3.5 px-4">Variance</th>
                    <th className="py-3.5 px-4">Auditor & Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                  {verifications.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {v.verificationCode}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{v.warehouseName}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{v.materialName}</td>
                      <td className="py-3 px-4 font-mono">{v.systemStock}</td>
                      <td className="py-3 px-4 font-mono font-bold">{v.physicalStock}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.discrepancy === 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {v.discrepancy > 0 ? `+${v.discrepancy}` : v.discrepancy}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        <div>{v.verifiedByName}</div>
                        <div className="text-[10px] text-slate-400">{v.reason}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: GOODS RECEIPT NOTES (GRN) */}
      {activeTab === 'GRN' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Goods Receipt Notes (GRN)</h2>
              <p className="text-xs text-slate-400">Incoming stock receipts, PO matching & QC inspection logs</p>
            </div>
            <button
              onClick={() => setIsGrnModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center space-x-1.5"
            >
              <PackageCheck className="w-4 h-4" />
              <span>+ Create Goods Receipt (GRN)</span>
            </button>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3.5 px-4">GRN #</th>
                    <th className="py-3.5 px-4">PO Ref / Vendor</th>
                    <th className="py-3.5 px-4">Warehouse</th>
                    <th className="py-3.5 px-4">Received By</th>
                    <th className="py-3.5 px-4">QC Status</th>
                    <th className="py-3.5 px-4">Total Value</th>
                    <th className="py-3.5 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                  {goodsReceipts.map((grn) => (
                    <tr key={grn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {grn.grnNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white">
                        <div className="font-semibold">{grn.vendorName || 'Direct Store Receipt'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{grn.poNumber ? `PO: ${grn.poNumber}` : 'No PO'}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{grn.warehouseName}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{grn.receivedBy}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {grn.qcStatus || 'PASSED'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        AED {(grn.totalValue || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                        {grn.receivedDate?.split('T')[0] || grn.createdAt?.split('T')[0]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: MATERIAL ISSUE VOUCHERS (MIV) */}
      {activeTab === 'ISSUES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Material Issue Vouchers (MIV)</h2>
              <p className="text-xs text-slate-400">Project site material issues, WBS activity & BOQ tracking</p>
            </div>
            <button
              onClick={() => setIsIssueModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md flex items-center space-x-1.5"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>+ Issue Material (MIV)</span>
            </button>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3.5 px-4">Issue #</th>
                    <th className="py-3.5 px-4">Project / WBS</th>
                    <th className="py-3.5 px-4">Warehouse Yard</th>
                    <th className="py-3.5 px-4">Issued To</th>
                    <th className="py-3.5 px-4">Issued By</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                  {materialIssues.map((miv) => (
                    <tr key={miv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {miv.issueNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white">
                        <div className="font-semibold">{miv.projectName || 'General Work'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{miv.wbsCode ? `WBS: ${miv.wbsCode}` : ''}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{miv.warehouseName}</td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{miv.issuedTo}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{miv.issuedBy}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          {miv.status || 'ISSUED'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                        {miv.issueDate?.split('T')[0] || miv.createdAt?.split('T')[0]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: INTER-WAREHOUSE TRANSFERS */}
      {activeTab === 'TRANSFERS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Inter-Warehouse Stock Transfers</h2>
              <p className="text-xs text-slate-400">Central store to site buffer transfers & waybill dispatches</p>
            </div>
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md flex items-center space-x-1.5"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>+ New Material Transfer</span>
            </button>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3.5 px-4">Transfer #</th>
                    <th className="py-3.5 px-4">Source Warehouse</th>
                    <th className="py-3.5 px-4">Target Warehouse</th>
                    <th className="py-3.5 px-4">Dispatched By</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                  {materialTransfers.map((xfer) => (
                    <tr key={xfer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                        {xfer.transferNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{xfer.sourceWarehouseName}</td>
                      <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-medium">{xfer.targetWarehouseName}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{xfer.dispatchedBy || 'Store Keeper'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          {xfer.status || 'COMPLETED'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                        {xfer.transferDate?.split('T')[0] || xfer.createdAt?.split('T')[0]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: MATERIAL RETURNS */}
      {activeTab === 'RETURNS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Material Returns & Credit Notes</h2>
              <p className="text-xs text-slate-400">Site surplus returns, vendor returns & damaged goods log</p>
            </div>
            <button
              onClick={() => setIsReturnModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md flex items-center space-x-1.5"
            >
              <ReturnIcon className="w-4 h-4" />
              <span>+ Process Return</span>
            </button>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3.5 px-4">Return #</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Warehouse</th>
                    <th className="py-3.5 px-4">Returned By</th>
                    <th className="py-3.5 px-4">Reason / Notes</th>
                    <th className="py-3.5 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                  {materialReturns.map((rtn) => (
                    <tr key={rtn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                        {rtn.returnNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          {rtn.returnType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{rtn.warehouseName}</td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{rtn.returnedBy}</td>
                      <td className="py-3 px-4 text-slate-400">{rtn.reason || 'Surplus store return'}</td>
                      <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                        {rtn.returnDate?.split('T')[0] || rtn.createdAt?.split('T')[0]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: INVENTORY ADJUSTMENTS */}
      {activeTab === 'ADJUSTMENTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Stock Adjustments & Write-Offs</h2>
              <p className="text-xs text-slate-400">Stock count variance, scrap write-offs & manual corrections</p>
            </div>
            <button
              onClick={() => setIsAdjustmentModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md flex items-center space-x-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>+ Post Adjustment</span>
            </button>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3.5 px-4">Adjustment #</th>
                    <th className="py-3.5 px-4">Warehouse</th>
                    <th className="py-3.5 px-4">Material Item</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Qty</th>
                    <th className="py-3.5 px-4">Auditor / Reason</th>
                    <th className="py-3.5 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                  {adjustments.map((adj) => (
                    <tr key={adj.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-red-600 dark:text-red-400">
                        {adj.adjustmentNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{adj.warehouseName}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {adj.materialName} ({adj.materialCode})
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            adj.adjustmentType === 'SURPLUS'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}
                        >
                          {adj.adjustmentType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">{adj.quantity}</td>
                      <td className="py-3 px-4 text-slate-400">
                        <div className="text-slate-300 font-medium">{adj.adjustedBy}</div>
                        <div className="text-[10px]">{adj.reason}</div>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                        {adj.createdAt?.split('T')[0]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: REPORTS */}
      {activeTab === 'REPORTS' && (
        <InventoryReportsView materials={materials} warehouses={warehouses} transactions={transactions} />
      )}

      {/* Modals */}
      <MaterialMasterModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        onSave={handleSaveMaterial}
        material={selectedMaterialForEdit}
        categories={categories}
        units={units}
      />

      <WarehouseModal
        isOpen={isWarehouseModalOpen}
        onClose={() => setIsWarehouseModalOpen(false)}
        onSave={handleSaveWarehouse}
        warehouse={selectedWarehouseForEdit}
        projects={projects}
      />

      <StockTransactionModal
        isOpen={isTxnModalOpen}
        onClose={() => setIsTxnModalOpen(false)}
        onSave={handleSaveTransaction}
        materials={materials}
        warehouses={warehouses}
        projects={projects}
        sites={sites}
        initialType={txnInitialType}
      />

      <PurchaseRequestModal
        isOpen={isPrModalOpen}
        onClose={() => setIsPrModalOpen(false)}
        onSave={handleSavePurchaseRequest}
        materials={materials}
        projects={projects}
        sites={sites}
      />

      <PurchaseOrderModal
        isOpen={isPoModalOpen}
        onClose={() => setIsPoModalOpen(false)}
        onSave={handleSavePurchaseOrder}
        vendors={vendors}
        projects={projects}
      />

      <PhysicalAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        onSave={handleSaveAudit}
        materials={materials}
        warehouses={warehouses}
      />

      <BarcodeQrScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        materials={materials}
        selectedMaterialForCode={selectedMaterialForCode}
      />

      <GoodsReceiptModal
        isOpen={isGrnModalOpen}
        onClose={() => setIsGrnModalOpen(false)}
        materials={materials}
        warehouses={warehouses}
        onSuccess={fetchAllData}
      />

      <MaterialIssueModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        materials={materials}
        warehouses={warehouses}
        projects={projects}
        onSuccess={fetchAllData}
      />

      <MaterialTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        materials={materials}
        warehouses={warehouses}
        onSuccess={fetchAllData}
      />

      <MaterialReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        materials={materials}
        warehouses={warehouses}
        onSuccess={fetchAllData}
      />

      <InventoryAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        materials={materials}
        warehouses={warehouses}
        onSuccess={fetchAllData}
      />
    </div>
  );
};
