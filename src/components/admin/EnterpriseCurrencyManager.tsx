import React, { useEffect, useState } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { 
  DollarSign, 
  RefreshCw, 
  ArrowRightLeft, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Plus, 
  ShieldCheck, 
  Building2, 
  ArrowUpRight,
  Calculator,
  Search
} from 'lucide-react';
import {
  DSSectionHeader,
  DSCard,
  DSButton,
  DSBadge,
  DSModal,
  DSField,
  DSAlert
} from '../ui/design-system';

interface CurrencyItem {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimalPrecision?: number;
  isBaseCurrency?: boolean;
  isActive: boolean;
  displayOrder?: number;
}

interface ExchangeRateItem {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveDate: string;
  rateType: string;
  source?: string;
  isLocked?: boolean;
  notes?: string;
}

export const EnterpriseCurrencyManager: React.FC = () => {
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRateItem[]>([]);
  const [baseCurrency, setBaseCurrency] = useState<CurrencyItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Conversion calculator state
  const [calcAmount, setCalcAmount] = useState<number>(100000);
  const [calcFrom, setCalcFrom] = useState<string>('USD');
  const [calcTo, setCalcTo] = useState<string>('AED');
  const [calcResult, setCalcResult] = useState<any>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // Rate Update Modal
  const [showRateModal, setShowRateModal] = useState(false);
  const [newRate, setNewRate] = useState({
    fromCurrency: 'USD',
    toCurrency: 'AED',
    rate: 3.6725,
    effectiveDate: new Date().toISOString().slice(0, 10),
    rateType: 'CORPORATE',
    source: 'Central Bank of the UAE / Treasury',
    notes: 'Standard Corporate Fixed Peg Rate',
  });

  const getHeaders = () => {
    const token = localStorage.getItem('sitesync_access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [curRes, rateRes, baseRes] = await Promise.all([
        fetch('/api/currencies', { headers: getHeaders() }),
        fetch('/api/currencies/exchange-rates', { headers: getHeaders() }),
        fetch('/api/currencies/base-currency', { headers: getHeaders() }),
      ]);

      const curData = await safeJson(curRes);
      const rateData = await safeJson(rateRes);
      const baseData = await safeJson(baseRes);

      if (curData?.data) setCurrencies(curData.data);
      if (rateData?.data) setExchangeRates(rateData.data);
      if (baseData?.data) {
        setBaseCurrency(baseData.data);
        setCalcTo(baseData.data.code);
      }
    } catch (err: any) {
      console.error('Failed to load currency data:', err);
      setAlert({ type: 'error', text: 'Failed to load enterprise currencies and exchange rates.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Run real-time calculation whenever inputs change
  useEffect(() => {
    const runCalculation = async () => {
      if (!calcAmount || !calcFrom || !calcTo) return;
      setCalcLoading(true);
      try {
        const res = await fetch(
          `/api/currencies/convert?amount=${calcAmount}&from=${calcFrom}&to=${calcTo}`,
          { headers: getHeaders() }
        );
        const data = await safeJson(res);
        if (data?.data) {
          setCalcResult(data.data);
        }
      } catch (err) {
        console.error('Conversion calculator error:', err);
      } finally {
        setCalcLoading(false);
      }
    };
    runCalculation();
  }, [calcAmount, calcFrom, calcTo]);

  const handleSaveRate = async () => {
    try {
      const res = await fetch('/api/currencies/exchange-rates', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newRate),
      });
      const json = await safeJson(res);
      if (!res.ok) throw new Error(json?.error || 'Failed to save rate');

      setAlert({ type: 'success', text: `Exchange rate for ${newRate.fromCurrency} / ${newRate.toCurrency} recorded successfully with audit trail.` });
      setShowRateModal(false);
      loadData();
    } catch (err: any) {
      setAlert({ type: 'error', text: err.message || 'Failed to save exchange rate' });
    }
  };

  const handleSetBaseCurrency = async (code: string) => {
    if (!window.confirm(`Are you sure you want to designate ${code} as Midland Enterprise's Reporting Base Currency? All consolidated financial reports will aggregate in ${code}.`)) {
      return;
    }
    try {
      const res = await fetch('/api/currencies/set-base', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ currencyCode: code }),
      });
      const json = await safeJson(res);
      if (!res.ok) throw new Error(json?.error || 'Failed to set base currency');

      setAlert({ type: 'success', text: `Reporting Base Currency updated to ${code}.` });
      loadData();
    } catch (err: any) {
      setAlert({ type: 'error', text: err.message || 'Failed to update base currency' });
    }
  };

  const filteredCurrencies = currencies.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="enterprise-currency-manager">
      {/* Header & Status */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Enterprise Multi-Currency & Treasury FX Foundation
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure enterprise reporting base currencies, ISO ISO-4217 master currencies, and corporate exchange rate ledgers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DSButton
            variant="outline"
            size="sm"
            onClick={loadData}
            loading={loading}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh Rates
          </DSButton>
          <DSButton
            variant="primary"
            size="sm"
            onClick={() => setShowRateModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Exchange Rate
          </DSButton>
        </div>
      </div>

      {alert && (
        <DSAlert
          variant={alert.type === 'success' ? 'info' : 'destructive'}
          title={alert.type === 'success' ? 'Treasury Configuration Updated' : 'Configuration Notice'}
          onClose={() => setAlert(null)}
        >
          {alert.text}
        </DSAlert>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DSCard className="p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 tracking-wider">BASE REPORTING CURRENCY</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{baseCurrency?.code || 'AED'}</span>
            <span className="text-xs text-slate-500 font-medium">{baseCurrency?.name || 'UAE Dirham'}</span>
          </div>
          <p className="text-xs text-emerald-700 mt-2 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> Corporate Consolidation Standard
          </p>
        </DSCard>

        <DSCard className="p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 tracking-wider">ACTIVE MASTER CURRENCIES</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {currencies.filter(c => c.isActive).length}
            </span>
            <span className="text-xs text-slate-500 font-medium">of {currencies.length} ISO Currencies</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Available across Projects & Procurement</p>
        </DSCard>

        <DSCard className="p-4 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 tracking-wider">FX RATE MATRICES</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{exchangeRates.length}</span>
            <span className="text-xs text-slate-500 font-medium">Corporate Rate Pairs</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Historical rate lookups & triangulation</p>
        </DSCard>

        <DSCard className="p-4 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 tracking-wider">PRECISION & ROUNDING</span>
            <ArrowRightLeft className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{baseCurrency?.decimalPrecision ?? 2}</span>
            <span className="text-xs text-slate-500 font-medium">Decimals (Half-Up)</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Enterprise Audit Strict Invariance</p>
        </DSCard>
      </div>

      {/* Real-time FX Conversion Calculator */}
      <DSCard className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl shadow-md border-0">
        <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white tracking-tight">Live Enterprise Currency Conversion Simulator</h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
            Direct & Triangulated Treasury Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">Source Amount</label>
            <input
              type="number"
              value={calcAmount}
              onChange={(e) => setCalcAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
              placeholder="e.g. 50000"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">From Currency</label>
            <select
              value={calcFrom}
              onChange={(e) => setCalcFrom(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium text-sm focus:outline-none focus:border-emerald-500"
            >
              {currencies.map(c => (
                <option key={`from-${c.code}`} value={c.code}>
                  {c.code} - {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">To Currency</label>
            <select
              value={calcTo}
              onChange={(e) => setCalcTo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium text-sm focus:outline-none focus:border-emerald-500"
            >
              {currencies.map(c => (
                <option key={`to-${c.code}`} value={c.code}>
                  {c.code} - {c.name} ({c.symbol}) {c.isBaseCurrency ? '★ (Base)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 flex flex-col justify-center">
            <span className="text-xs text-slate-400 font-medium">Converted Result:</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
              {calcLoading ? (
                <span className="text-xs text-slate-400 animate-pulse">Calculating...</span>
              ) : calcResult ? (
                `${calcTo} ${Number(calcResult.convertedAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              ) : (
                '--'
              )}
            </div>
            {calcResult && (
              <span className="text-[11px] text-slate-400 mt-1 font-mono">
                1 {calcFrom} = {calcResult.exchangeRate} {calcTo} ({calcResult.source || 'Direct Rate'})
              </span>
            )}
          </div>
        </div>
      </DSCard>

      {/* Main Tables Grid: Active Currencies & Exchange Rate Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currencies Master */}
        <DSCard className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Enterprise Currency Registry
            </h3>
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search currency..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-3.5 py-2.5">Code</th>
                  <th className="px-3.5 py-2.5">Name</th>
                  <th className="px-3.5 py-2.5">Symbol</th>
                  <th className="px-3.5 py-2.5">Status</th>
                  <th className="px-3.5 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                {filteredCurrencies.map((cur) => (
                  <tr key={cur.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3.5 py-2.5 font-bold font-mono text-slate-900 flex items-center gap-1.5">
                      {cur.code}
                      {cur.isBaseCurrency && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-sans font-semibold">
                          BASE
                        </span>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-800">{cur.name}</td>
                    <td className="px-3.5 py-2.5 font-mono text-slate-600">{cur.symbol}</td>
                    <td className="px-3.5 py-2.5">
                      <DSBadge variant={cur.isActive ? 'success' : 'neutral'}>
                        {cur.isActive ? 'Active' : 'Disabled'}
                      </DSBadge>
                    </td>
                    <td className="px-3.5 py-2.5 text-right">
                      {!cur.isBaseCurrency ? (
                        <button
                          onClick={() => handleSetBaseCurrency(cur.code)}
                          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded transition-colors"
                        >
                          Set Base
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Current Base</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DSCard>

        {/* Corporate Exchange Rates Table */}
        <DSCard className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Corporate Treasury Exchange Rates
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {exchangeRates.length} Active Pairs
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-3.5 py-2.5">Pair</th>
                  <th className="px-3.5 py-2.5">Rate</th>
                  <th className="px-3.5 py-2.5">Type</th>
                  <th className="px-3.5 py-2.5">Effective Date</th>
                  <th className="px-3.5 py-2.5">Source / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                {exchangeRates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3.5 py-2.5 font-bold font-mono text-slate-900">
                      {rate.fromCurrency} / {rate.toCurrency}
                    </td>
                    <td className="px-3.5 py-2.5 font-mono font-bold text-indigo-700">
                      {Number(rate.rate).toFixed(4)}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <DSBadge variant="neutral">{rate.rateType}</DSBadge>
                    </td>
                    <td className="px-3.5 py-2.5 font-mono text-slate-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {rate.effectiveDate}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-500 text-[11px] truncate max-w-[140px]" title={rate.notes || rate.source}>
                      {rate.source || rate.notes || 'Corporate Matrix'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DSCard>
      </div>

      {/* Add / Update Rate Modal */}
      {showRateModal && (
        <DSModal
          title="Add Corporate Exchange Rate"
          isOpen={showRateModal}
          onClose={() => setShowRateModal(false)}
        >
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <DSField label="From Currency">
                <select
                  value={newRate.fromCurrency}
                  onChange={(e) => setNewRate({ ...newRate, fromCurrency: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold"
                >
                  {currencies.map(c => (
                    <option key={`modal-from-${c.code}`} value={c.code}>{c.code} ({c.name})</option>
                  ))}
                </select>
              </DSField>

              <DSField label="To Currency">
                <select
                  value={newRate.toCurrency}
                  onChange={(e) => setNewRate({ ...newRate, toCurrency: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold"
                >
                  {currencies.map(c => (
                    <option key={`modal-to-${c.code}`} value={c.code}>{c.code} ({c.name})</option>
                  ))}
                </select>
              </DSField>
            </div>

            <DSField label="Exchange Rate (e.g. 1 USD = 3.6725 AED)">
              <input
                type="number"
                step="0.000001"
                value={newRate.rate}
                onChange={(e) => setNewRate({ ...newRate, rate: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono font-bold"
                placeholder="3.6725"
              />
            </DSField>

            <div className="grid grid-cols-2 gap-3">
              <DSField label="Effective Date">
                <input
                  type="date"
                  value={newRate.effectiveDate}
                  onChange={(e) => setNewRate({ ...newRate, effectiveDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
              </DSField>

              <DSField label="Rate Type">
                <select
                  value={newRate.rateType}
                  onChange={(e) => setNewRate({ ...newRate, rateType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                >
                  <option value="CORPORATE">Corporate Treasury</option>
                  <option value="CENTRAL_BANK">Central Bank Official</option>
                  <option value="PROJECT_FIXED">Project Fixed Peg</option>
                  <option value="CUSTOM">Custom Contract</option>
                </select>
              </DSField>
            </div>

            <DSField label="Rate Source / Authority">
              <input
                type="text"
                value={newRate.source}
                onChange={(e) => setNewRate({ ...newRate, source: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                placeholder="e.g. Central Bank of UAE / Corporate Treasury"
              />
            </DSField>

            <DSField label="Audit Remarks">
              <input
                type="text"
                value={newRate.notes}
                onChange={(e) => setNewRate({ ...newRate, notes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                placeholder="e.g. Q3 corporate budgeting rate"
              />
            </DSField>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <DSButton variant="outline" onClick={() => setShowRateModal(false)}>
                Cancel
              </DSButton>
              <DSButton variant="primary" onClick={handleSaveRate}>
                Save Exchange Rate
              </DSButton>
            </div>
          </div>
        </DSModal>
      )}
    </div>
  );
};
