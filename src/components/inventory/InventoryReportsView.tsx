import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { FileText, TrendingUp, AlertTriangle, Layers, DollarSign, Download, Calendar } from 'lucide-react';
import { MaterialMasterItem, WarehouseItem, StockTransactionItem } from '../../types/inventory';

interface InventoryReportsViewProps {
  materials: MaterialMasterItem[];
  warehouses: WarehouseItem[];
  transactions: StockTransactionItem[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const InventoryReportsView: React.FC<InventoryReportsViewProps> = ({
  materials,
  warehouses,
  transactions,
}) => {
  const [reportType, setReportType] = useState<'VALUATION' | 'CONSUMPTION' | 'VELOCITY' | 'LOW_STOCK'>('VALUATION');

  // Valuation calculation per material
  const valuationData = materials.map((m) => ({
    name: m.itemCode,
    fullName: m.name,
    valuation: m.currentStock * m.unitPrice,
    stock: m.currentStock,
    unitPrice: m.unitPrice,
  }));

  // Project-wise consumption calculation
  const projectConsumptionMap: Record<string, number> = {};
  transactions
    .filter((t) => t.transactionType === 'GOODS_ISSUE' && t.projectName)
    .forEach((t) => {
      const name = t.projectName || 'General Project';
      projectConsumptionMap[name] = (projectConsumptionMap[name] || 0) + t.totalValue;
    });

  const projectConsumptionData = Object.entries(projectConsumptionMap).map(([name, total]) => ({
    name,
    totalValue: total,
  }));

  // Low stock list
  const lowStockMaterials = materials.filter((m) => m.currentStock <= m.reorderLevel);

  // Velocity classification
  const velocityData = materials.map((m) => {
    const issues = transactions.filter((t) => t.materialId === m.id && t.transactionType === 'GOODS_ISSUE');
    const issuedQty = issues.reduce((acc, curr) => acc + curr.quantity, 0);
    let category = 'Dead Stock (0 Movement)';
    if (issuedQty > 100) category = 'Fast Moving (>100 issued)';
    else if (issuedQty > 0) category = 'Slow Moving (1-100 issued)';

    return {
      ...m,
      issuedQty,
      category,
    };
  });

  return (
    <div className="space-y-6">
      {/* Report Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" /> Executive Inventory & Store Audit Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time stock valuation, consumption patterns, dead stock detection, and reorder warnings
          </p>
        </div>

        <button
          onClick={() => alert('Downloading official Inventory Valuation & Ledger PDF export...')}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 text-xs font-bold flex items-center space-x-2 shadow-md min-h-[44px]"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit PDF / CSV</span>
        </button>
      </div>

      {/* Sub Nav Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setReportType('VALUATION')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            reportType === 'VALUATION'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
          }`}
        >
          Stock Valuation ($)
        </button>
        <button
          onClick={() => setReportType('CONSUMPTION')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            reportType === 'CONSUMPTION'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
          }`}
        >
          Project Consumption
        </button>
        <button
          onClick={() => setReportType('LOW_STOCK')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            reportType === 'LOW_STOCK'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
          }`}
        >
          Low Stock Alerts ({lowStockMaterials.length})
        </button>
        <button
          onClick={() => setReportType('VELOCITY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            reportType === 'VELOCITY'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
          }`}
        >
          Inventory Movement Velocity
        </button>
      </div>

      {/* Report Content */}
      {reportType === 'VALUATION' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" /> Material Stock Financial Valuation Breakdown ($)
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={valuationData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                  />
                  <Bar dataKey="valuation" fill="#10b981" radius={[8, 8, 0, 0]} name="Total Valuation ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Valuation Summary Table</h3>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {valuationData.map((v) => (
                <div key={v.name} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white block">{v.name}</span>
                    <span className="text-slate-500 text-[11px] truncate max-w-[140px] block">{v.fullName}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block">${v.valuation.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400">{v.stock} units @ ${v.unitPrice}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {reportType === 'CONSUMPTION' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" /> Project-wise Material Consumption Summary ($)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectConsumptionData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                />
                <Bar dataKey="totalValue" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Consumption ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {reportType === 'LOW_STOCK' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock & Minimum Reorder Alert Items
          </h3>

          {lowStockMaterials.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">All materials are currently above reorder thresholds!</div>
          ) : (
            <div className="space-y-3">
              {lowStockMaterials.map((m) => (
                <div key={m.id} className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900 px-2 py-0.5 rounded">
                        {m.itemCode}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{m.name}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Reorder Level: {m.reorderLevel} | Min Stock: {m.minStock}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-rose-600 dark:text-rose-400 block">
                      Current: {m.currentStock} units
                    </span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold">
                      Deficit: {m.reorderLevel - m.currentStock} units required
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {reportType === 'VELOCITY' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-500" /> Inventory Movement & Dead Stock Analysis
          </h3>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {velocityData.map((v) => (
              <div key={v.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{v.itemCode}</span> - {v.name}
                  <span className="text-[10px] text-slate-400 block">Category: {v.subCategory}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-slate-500">Total Issued: <strong className="text-slate-900 dark:text-white">{v.issuedQty}</strong></span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    v.category.startsWith('Fast')
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : v.category.startsWith('Slow')
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {v.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
