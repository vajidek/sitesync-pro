import React, { useState } from 'react';
import { X, QrCode, Barcode, Search, CheckCircle2, AlertCircle, Package, Printer } from 'lucide-react';
import { MaterialMasterItem } from '../../types/inventory';

interface BarcodeQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: MaterialMasterItem[];
  selectedMaterialForCode?: MaterialMasterItem | null;
}

export const BarcodeQrScannerModal: React.FC<BarcodeQrScannerModalProps> = ({
  isOpen,
  onClose,
  materials,
  selectedMaterialForCode,
}) => {
  const [activeTab, setActiveTab] = useState<'SCAN' | 'GENERATE'>(selectedMaterialForCode ? 'GENERATE' : 'SCAN');
  const [scanQuery, setScanQuery] = useState('');
  const [scannedItem, setScannedItem] = useState<MaterialMasterItem | null>(selectedMaterialForCode || null);
  const [selectedGenerateMat, setSelectedGenerateMat] = useState<MaterialMasterItem>(selectedMaterialForCode || materials[0]);

  if (!isOpen) return null;

  const handleScan = (codeToSearch: string) => {
    const code = codeToSearch.trim().toLowerCase();
    const found = materials.find(
      (m) =>
        m.barcode?.toLowerCase() === code ||
        m.qrCode?.toLowerCase() === code ||
        m.itemCode?.toLowerCase() === code ||
        m.id.toLowerCase() === code
    );
    if (found) {
      setScannedItem(found);
    } else {
      setScannedItem(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden my-auto">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/30 rounded-xl text-blue-400 border border-blue-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Barcode & 2D QR Code Center</h2>
              <p className="text-xs text-slate-400">Scan SKU barcodes, verify yard rack locations or generate printable labels</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 pt-3">
          <button
            onClick={() => setActiveTab('SCAN')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'SCAN'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" /> Interactive Barcode/QR Scanner
          </button>
          <button
            onClick={() => setActiveTab('GENERATE')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'GENERATE'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Barcode className="w-4 h-4" /> Barcode & QR Label Generator
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'SCAN' ? (
            <div className="space-y-5">
              {/* Scan Simulator Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Scan or Type Barcode / QR / SKU Code:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={scanQuery}
                      onChange={(e) => {
                        setScanQuery(e.target.value);
                        handleScan(e.target.value);
                      }}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. 890100192801 or QR-PIP-CS-001 or PIP-CS-001"
                    />
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-400">Quick Barcodes to Scan:</span>
                  {materials.slice(0, 3).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setScanQuery(m.barcode || m.itemCode);
                        handleScan(m.barcode || m.itemCode);
                      }}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 font-mono"
                    >
                      {m.barcode || m.itemCode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scan Output */}
              {scannedItem ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                        SKU Found in ERP Store Master
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100">
                      {scannedItem.itemCode}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">{scannedItem.name}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{scannedItem.specification}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs border-t border-emerald-200 dark:border-emerald-800/40">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Current Stock</span>
                      <span className="font-bold text-slate-900 dark:text-white">{scannedItem.currentStock}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Brand</span>
                      <span className="font-bold text-slate-900 dark:text-white">{scannedItem.brand || 'Generic'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Unit Price</span>
                      <span className="font-bold text-slate-900 dark:text-white">${scannedItem.unitPrice}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">HSN Code</span>
                      <span className="font-mono text-slate-900 dark:text-white">{scannedItem.hsnCode || '73041910'}</span>
                    </div>
                  </div>
                </div>
              ) : scanQuery ? (
                <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                  <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300">No SKU item matched standard barcode "{scanQuery}"</h4>
                  <p className="text-[11px] text-slate-500">Verify code from physical tag or register new material master</p>
                </div>
              ) : (
                <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400">
                  <QrCode className="w-10 h-10 mx-auto mb-2 opacity-40 text-blue-500" />
                  <p className="text-xs font-semibold">Ready to scan... Type or select barcode above</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Material SKU</label>
                <select
                  value={selectedGenerateMat?.id || ''}
                  onChange={(e) => {
                    const found = materials.find((m) => m.id === e.target.value);
                    if (found) setSelectedGenerateMat(found);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{m.itemCode}] {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedGenerateMat && (
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-6">
                  {/* SVG Barcode & QR Visualization */}
                  <div className="space-y-4 text-center sm:text-left">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">1D Standard Barcode</span>
                      <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-sm inline-block mt-1">
                        {/* Simulated SVG Barcode */}
                        <svg className="w-48 h-12 mx-auto" viewBox="0 0 200 50">
                          <rect width="200" height="50" fill="white" />
                          <g fill="black">
                            <rect x="10" width="4" height="40" />
                            <rect x="18" width="2" height="40" />
                            <rect x="24" width="6" height="40" />
                            <rect x="34" width="2" height="40" />
                            <rect x="40" width="4" height="40" />
                            <rect x="48" width="8" height="40" />
                            <rect x="60" width="2" height="40" />
                            <rect x="66" width="4" height="40" />
                            <rect x="74" width="6" height="40" />
                            <rect x="84" width="2" height="40" />
                            <rect x="90" width="4" height="40" />
                            <rect x="98" width="2" height="40" />
                            <rect x="104" width="6" height="40" />
                            <rect x="114" width="4" height="40" />
                            <rect x="122" width="2" height="40" />
                            <rect x="128" width="8" height="40" />
                            <rect x="140" width="4" height="40" />
                            <rect x="148" width="2" height="40" />
                            <rect x="154" width="6" height="40" />
                            <rect x="164" width="4" height="40" />
                            <rect x="172" width="2" height="40" />
                            <rect x="178" width="6" height="40" />
                          </g>
                        </svg>
                        <div className="text-center font-mono text-xs font-bold text-slate-800 tracking-widest mt-1">
                          {selectedGenerateMat.barcode || '890100192801'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">2D Matrix QR Code</span>
                      <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-sm inline-block mt-1">
                        {/* Simulated QR Code SVG */}
                        <svg className="w-24 h-24 mx-auto" viewBox="0 0 100 100">
                          <rect width="100" height="100" fill="white" />
                          <path d="M10,10 h30 v30 h-30 z M15,15 h20 v20 h-20 z M20,20 h10 v10 h-10 z" fill="black" />
                          <path d="M60,10 h30 v30 h-30 z M65,15 h20 v20 h-20 z M70,20 h10 v10 h-10 z" fill="black" />
                          <path d="M10,60 h30 v30 h-30 z M15,65 h20 v20 h-20 z M20,70 h10 v10 h-10 z" fill="black" />
                          <rect x="45" y="10" width="8" height="30" fill="black" />
                          <rect x="10" y="45" width="30" height="8" fill="black" />
                          <rect x="50" y="50" width="15" height="15" fill="black" />
                          <rect x="70" y="50" width="20" height="8" fill="black" />
                          <rect x="70" y="65" width="8" height="25" fill="black" />
                          <rect x="50" y="75" width="15" height="15" fill="black" />
                          <rect x="85" y="85" width="8" height="8" fill="black" />
                        </svg>
                        <div className="text-center font-mono text-[10px] font-bold text-slate-800 mt-1">
                          {selectedGenerateMat.qrCode || `QR-${selectedGenerateMat.itemCode}`}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 max-w-xs text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-slate-900 dark:text-white block">{selectedGenerateMat.name}</span>
                      <span className="text-slate-500 block text-[11px]">{selectedGenerateMat.specification}</span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block mt-1">
                        Stock: {selectedGenerateMat.currentStock} | Price: ${selectedGenerateMat.unitPrice}
                      </span>
                    </div>

                    <button
                      onClick={() => alert(`Label sent to thermal label printer for SKU: ${selectedGenerateMat.itemCode}`)}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Thermal Store Label</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
