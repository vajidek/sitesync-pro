import React, { useState } from 'react';
import { BOQItem } from '../../types/procurement';
import { Project } from '../../types';
import { 
  BarChart4, 
  Plus, 
  Search, 
  TrendingUp, 
  PieChart, 
  CheckCircle2, 
  Building2, 
  Layers, 
  X
} from 'lucide-react';

interface BOQManagementProps {
  boqItems: BOQItem[];
  projects: Project[];
  onCreateBOQItem: (item: Partial<BOQItem>) => void;
}

export const BOQManagementView: React.FC<BOQManagementProps> = ({
  boqItems,
  projects,
  onCreateBOQItem
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [itemCode, setItemCode] = useState('BOQ-CIV-003');
  const [description, setDescription] = useState('M35 Grade Concrete Pouring for Bridge Substructure');
  const [category, setCategory] = useState('Civil & Structural');
  const [unit, setUnit] = useState('Cum');
  const [boqQuantity, setBoqQuantity] = useState(2500);
  const [unitRate, setUnitRate] = useState(140);

  const filteredItems = boqItems.filter((b) => {
    const matchesProject = b.projectId === selectedProjectId;
    const matchesSearch = 
      b.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProject && matchesSearch;
  });

  const activeProject = projects.find(p => p.id === selectedProjectId);

  // Totals
  const totalBoqAmount = filteredItems.reduce((acc, curr) => acc + curr.totalAmountUSD, 0);
  const totalExecutedAmount = filteredItems.reduce((acc, curr) => acc + curr.executedAmountUSD, 0);
  const overallProgressPct = totalBoqAmount > 0 ? Math.round((totalExecutedAmount / totalBoqAmount) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    const amt = Number(boqQuantity) * Number(unitRate);

    onCreateBOQItem({
      projectId: selectedProjectId,
      itemCode,
      description,
      category,
      unit,
      boqQuantity: Number(boqQuantity),
      unitRateUSD: Number(unitRate),
      totalAmountUSD: amt,
      executedQuantity: 0,
      executedAmountUSD: 0,
      balanceQuantity: Number(boqQuantity),
      variationQuantity: 0,
      progressPercent: 0
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <BarChart4 className="w-6 h-6 text-blue-600" />
            <span>Bill of Quantities (BOQ) Master Register</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Structural BOQ line items, contract rates, executed quantities, physical progress tracking & variation control
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add BOQ Item</span>
        </button>
      </div>

      {/* Project Selector & Progress KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm md:col-span-1 space-y-2">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Project</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total BOQ Contract Value</span>
            <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-white mt-1 block">
              ${totalBoqAmount.toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Executed Valuation</span>
            <span className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
              ${totalExecutedAmount.toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Physical Completion</span>
            <span className="text-xl font-extrabold font-mono text-blue-600 dark:text-blue-400 mt-1 block">
              {overallProgressPct}%
            </span>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-xl">
            <PieChart className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search item code, description, category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* BOQ Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">BOQ Item Code</th>
                <th className="p-3 min-w-[200px]">Description & Work Specs</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-center">Unit</th>
                <th className="p-3 text-right">BOQ Qty</th>
                <th className="p-3 text-right">Unit Rate ($)</th>
                <th className="p-3 text-right">Total Amount ($)</th>
                <th className="p-3 text-right text-emerald-600 dark:text-emerald-400">Executed Qty</th>
                <th className="p-3 text-right text-amber-600 dark:text-amber-400">Balance Qty</th>
                <th className="p-3 min-w-[120px]">Physical Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                  <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{item.itemCode}</td>
                  <td className="p-3 font-sans font-medium text-slate-900 dark:text-white">{item.description}</td>
                  <td className="p-3 font-sans text-slate-400 text-[11px]">{item.category}</td>
                  <td className="p-3 text-center">{item.unit}</td>
                  <td className="p-3 text-right font-bold">{item.boqQuantity.toLocaleString()}</td>
                  <td className="p-3 text-right">${item.unitRateUSD.toLocaleString()}</td>
                  <td className="p-3 text-right font-bold">${item.totalAmountUSD.toLocaleString()}</td>
                  <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20">
                    {item.executedQuantity.toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-bold text-amber-600 dark:text-amber-400">
                    {item.balanceQuantity.toLocaleString()}
                  </td>
                  <td className="p-3 font-sans">
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, item.progressPercent)}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400 min-w-[32px]">
                        {item.progressPercent}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add BOQ Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <BarChart4 className="w-5 h-5 text-blue-400" />
                <span>Add BOQ Contract Item</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Item Code *</label>
                  <input
                    type="text"
                    required
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Work Description & Specs *</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-center"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Contract BOQ Qty</label>
                  <input
                    type="number"
                    required
                    value={boqQuantity}
                    onChange={(e) => setBoqQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Contract Unit Rate ($)</label>
                  <input
                    type="number"
                    required
                    value={unitRate}
                    onChange={(e) => setUnitRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md"
                >
                  Add to BOQ Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
