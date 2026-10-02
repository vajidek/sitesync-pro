import React, { useState, useEffect } from 'react';
import { X, Save, Package, Tag, QrCode, DollarSign, Layers, Image as ImageIcon } from 'lucide-react';
import { MaterialMasterItem } from '../../types/inventory';

interface MaterialMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (materialData: Partial<MaterialMasterItem>) => void;
  material?: MaterialMasterItem | null;
  categories: { id: string; name: string }[];
  units: { id: string; name: string; code: string }[];
}

export const MaterialMasterModal: React.FC<MaterialMasterModalProps> = ({
  isOpen,
  onClose,
  onSave,
  material,
  categories,
  units,
}) => {
  const [formData, setFormData] = useState<Partial<MaterialMasterItem>>({
    itemCode: '',
    name: '',
    categoryId: categories[0]?.id || 'cat-001',
    subCategory: 'Structural & Piping',
    specification: '',
    brand: '',
    model: '',
    manufacturer: '',
    unitId: units[0]?.id || 'unt-001',
    hsnCode: '73041910',
    gstPercentage: 18,
    barcode: '',
    qrCode: '',
    imageUrl: '',
    description: '',
    minStock: 50,
    maxStock: 1000,
    reorderLevel: 100,
    openingStock: 0,
    currentStock: 0,
    unitPrice: 100,
    status: 'ACTIVE',
  });

  useEffect(() => {
    if (material) {
      setFormData(material);
    } else {
      const randomCode = `MAT-${Math.floor(1000 + Math.random() * 9000)}`;
      setFormData({
        itemCode: randomCode,
        name: '',
        categoryId: categories[0]?.id || 'cat-001',
        subCategory: 'Mechanical Piping',
        specification: '',
        brand: 'Tenaris / Emirates Steel',
        model: 'Standard Grade',
        manufacturer: 'Emirates Industrial Group',
        unitId: units[0]?.id || 'unt-001',
        hsnCode: '73041910',
        gstPercentage: 18,
        barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`,
        qrCode: `QR-${randomCode}`,
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=600&q=80',
        description: '',
        minStock: 50,
        maxStock: 1000,
        reorderLevel: 100,
        openingStock: 100,
        currentStock: 100,
        unitPrice: 250,
        status: 'ACTIVE',
      });
    }
  }, [material, isOpen, categories, units]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/30 rounded-xl text-blue-400 border border-blue-500/30">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {material ? `Edit Material SKU (${material.itemCode})` : 'Register New Material Master SKU'}
              </h2>
              <p className="text-xs text-slate-400">Configure catalog specifications, GST/HSN, barcode and min-max thresholds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Identifiers */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Material Classification & Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Material Code *</label>
                <input
                  type="text"
                  required
                  value={formData.itemCode || ''}
                  onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. PIP-CS-001"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Material Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. 12-inch Schedule 80 Carbon Steel Seamless Pipe"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                <select
                  value={formData.categoryId || ''}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Sub-Category</label>
                <input
                  type="text"
                  value={formData.subCategory || ''}
                  onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Seamless Piping"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit of Measurement *</label>
                <select
                  value={formData.unitId || ''}
                  onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Specifications & Brand */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Technical Specifications & Brand
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Brand</label>
                <input
                  type="text"
                  value={formData.brand || ''}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Tenaris"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Model / Grade</label>
                <input
                  type="text"
                  value={formData.model || ''}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. API 5L Grade B"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Manufacturer</label>
                <input
                  type="text"
                  value={formData.manufacturer || ''}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Emirates Seamless Mills"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Specification Details</label>
                <textarea
                  rows={2}
                  value={formData.specification || ''}
                  onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter dimensional tolerances, material standards (ASTM/EN/API), coatings..."
                />
              </div>
            </div>
          </div>

          {/* Pricing, Tax & Barcode */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Pricing, Tax & Barcode/QR Metadata
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit Standard Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unitPrice ?? 0}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">HSN Code</label>
                <input
                  type="text"
                  value={formData.hsnCode || ''}
                  onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="73041910"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GST Tax %</label>
                <input
                  type="number"
                  value={formData.gstPercentage ?? 18}
                  onChange={(e) => setFormData({ ...formData, gstPercentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select
                  value={formData.status || 'ACTIVE'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="DISCONTINUED">DISCONTINUED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">EAN/UPC Barcode</label>
                <input
                  type="text"
                  value={formData.barcode || ''}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="890100192801"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">QR Code Key</label>
                <input
                  type="text"
                  value={formData.qrCode || ''}
                  onChange={(e) => setFormData({ ...formData, qrCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="QR-PIP-CS-001"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
                <input
                  type="text"
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>
          </div>

          {/* Stock Thresholds */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
              <QrCode className="w-4 h-4" /> Stock Control Thresholds & Quantities
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Minimum Stock</label>
                <input
                  type="number"
                  value={formData.minStock ?? 0}
                  onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Maximum Stock</label>
                <input
                  type="number"
                  value={formData.maxStock ?? 0}
                  onChange={(e) => setFormData({ ...formData, maxStock: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Reorder Level Alert</label>
                <input
                  type="number"
                  value={formData.reorderLevel ?? 0}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {material ? 'Current Total Stock' : 'Initial Opening Stock'}
                </label>
                <input
                  type="number"
                  value={formData.currentStock ?? 0}
                  onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 text-xs font-black"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{material ? 'Update Material Master' : 'Save Material SKU'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
