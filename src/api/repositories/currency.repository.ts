import { db } from '../../db';
import { currencies, exchangeRates, auditLogs, projects, companies } from '../../db/schema';
import { eq, and, desc, sql, asc, or } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { isDemoSeedAllowed } from '../config/env';

export interface CurrencyItem {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  decimalPrecision: number;
  isBaseCurrency: boolean;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRateItem {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveDate: string;
  rateType: string;
  source?: string | null;
  isActive: boolean;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export class CurrencyRepository {
  /**
   * Seed standard currencies and historical exchange rates if empty or heal base currency
   */
  async ensureCurrenciesSeeded(): Promise<void> {
    if (!isDemoSeedAllowed()) return;
    try {
      const now = new Date().toISOString();
      const existing = await db.select().from(currencies);

      if (existing.length === 0) {
        const initialCurrencies = [
          { id: 'cur-001', code: 'INR', name: 'Indian Rupee', symbol: '₹', exchangeRate: 1.0, decimalPrecision: 2, isBaseCurrency: true, displayOrder: 1, isActive: true, createdAt: now, updatedAt: now },
          { id: 'cur-002', code: 'AED', name: 'UAE Dirham', symbol: 'AED', exchangeRate: 22.70, decimalPrecision: 2, isBaseCurrency: false, displayOrder: 2, isActive: true, createdAt: now, updatedAt: now },
          { id: 'cur-003', code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 84.20, decimalPrecision: 2, isBaseCurrency: false, displayOrder: 3, isActive: true, createdAt: now, updatedAt: now },
          { id: 'cur-004', code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 91.50, decimalPrecision: 2, isBaseCurrency: false, displayOrder: 4, isActive: true, createdAt: now, updatedAt: now },
          { id: 'cur-005', code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', exchangeRate: 22.45, decimalPrecision: 2, isBaseCurrency: false, displayOrder: 5, isActive: true, createdAt: now, updatedAt: now },
          { id: 'cur-006', code: 'QAR', name: 'Qatari Riyal', symbol: 'QAR', exchangeRate: 23.10, decimalPrecision: 2, isBaseCurrency: false, displayOrder: 6, isActive: true, createdAt: now, updatedAt: now },
          { id: 'cur-007', code: 'OMR', name: 'Omani Rial', symbol: 'OMR', exchangeRate: 218.70, decimalPrecision: 3, isBaseCurrency: false, displayOrder: 7, isActive: true, createdAt: now, updatedAt: now },
          { id: 'cur-008', code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KWD', exchangeRate: 274.50, decimalPrecision: 3, isBaseCurrency: false, displayOrder: 8, isActive: true, createdAt: now, updatedAt: now },
          { id: 'cur-009', code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 109.80, decimalPrecision: 2, isBaseCurrency: false, displayOrder: 9, isActive: true, createdAt: now, updatedAt: now },
          { id: 'cur-010', code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', exchangeRate: 63.20, decimalPrecision: 2, isBaseCurrency: false, displayOrder: 10, isActive: true, createdAt: now, updatedAt: now },
        ];
        await db.insert(currencies).values(initialCurrencies);
      } else {
        // Self-healing: Ensure INR is designated as enterprise base currency
        const inr = existing.find((c) => c.code === 'INR');
        const aed = existing.find((c) => c.code === 'AED');
        if (aed && aed.isBaseCurrency) {
          await db.update(currencies).set({ isBaseCurrency: false, exchangeRate: 22.70, updatedAt: now }).where(eq(currencies.code, 'AED'));
        }
        if (inr && !inr.isBaseCurrency) {
          await db.update(currencies).set({ isBaseCurrency: true, exchangeRate: 1.0, updatedAt: now }).where(eq(currencies.code, 'INR'));
        }
      }

      // Seed Exchange Rates Master & History if empty
      const existingRates = await db.select().from(exchangeRates);
      if (existingRates.length === 0) {
        const seedRates: ExchangeRateItem[] = [
          // Direct Pairs to Base INR (Corporate Standard)
          { id: 'xr-usd-inr-curr', fromCurrency: 'USD', toCurrency: 'INR', rate: 84.20, effectiveDate: '2026-06-01', rateType: 'CORPORATE', source: 'Midland Corporate Treasury Benchmark', isActive: true, createdBy: 'System Administrator', createdAt: now, updatedAt: now },
          { id: 'xr-usd-inr-hist', fromCurrency: 'USD', toCurrency: 'INR', rate: 83.40, effectiveDate: '2026-01-01', rateType: 'CORPORATE', source: 'Historical Central Bank Reference', isActive: true, createdBy: 'System Administrator', createdAt: now, updatedAt: now },
          { id: 'xr-usd-inr-proj', fromCurrency: 'USD', toCurrency: 'INR', rate: 84.00, effectiveDate: '2026-01-01', rateType: 'PROJECT_FIXED', source: 'Contractual Fixed FX Peg', isActive: true, createdBy: 'System Administrator', createdAt: now, updatedAt: now },
          
          { id: 'xr-eur-inr-curr', fromCurrency: 'EUR', toCurrency: 'INR', rate: 91.50, effectiveDate: '2026-06-01', rateType: 'CORPORATE', source: 'ECB Reference Benchmark', isActive: true, createdBy: 'System Administrator', createdAt: now, updatedAt: now },
          { id: 'xr-eur-inr-hist', fromCurrency: 'EUR', toCurrency: 'INR', rate: 90.80, effectiveDate: '2026-01-01', rateType: 'CORPORATE', source: 'Historical Central Bank Reference', isActive: true, createdBy: 'System Administrator', createdAt: now, updatedAt: now },
          
          { id: 'xr-aed-inr-curr', fromCurrency: 'AED', toCurrency: 'INR', rate: 22.70, effectiveDate: '2026-06-01', rateType: 'CORPORATE', source: 'Central Bank of UAE / RBI', isActive: true, createdBy: 'System Administrator', createdAt: now, updatedAt: now },
          { id: 'xr-aed-inr-hist', fromCurrency: 'AED', toCurrency: 'INR', rate: 22.65, effectiveDate: '2026-01-01', rateType: 'CORPORATE', source: 'Historical Central Bank Reference', isActive: true, createdBy: 'System Administrator', createdAt: now, updatedAt: now },
          
          { id: 'xr-sar-inr-curr', fromCurrency: 'SAR', toCurrency: 'INR', rate: 22.45, effectiveDate: '2026-06-01', rateType: 'CORPORATE', source: 'SAMA / Corporate Treasury', isActive: true, createdBy: 'System Administrator', createdAt: now, updatedAt: now },
          { id: 'xr-sar-inr-hist', fromCurrency: 'SAR', toCurrency: 'INR', rate: 22.20, effectiveDate: '2026-01-01', rateType: 'CORPORATE', source: 'Historical Central Bank Reference', isActive: true, createdBy: 'System Administrator', createdAt: now, updatedAt: now },
          
          { id: 'xr-gbp-inr-curr', fromCurrency: 'GBP', toCurrency: 'INR', rate: 109.80, effectiveDate: '2026-06-01', rateType: 'CORPORATE', source: 'Bank of England Benchmark', isActive: true, createdBy: 'System Administrator', createdAt: now, updatedAt: now },
          { id: 'xr-gbp-inr-hist', fromCurrency: 'GBP', toCurrency: 'INR', rate: 108.20, effectiveDate: '2026-01-01', rateType: 'CORPORATE', source: 'Historical Central Bank Reference', isActive: true, createdBy: 'System Administrator', createdAt: now, updatedAt: now },

          // Direct Non-Base Cross-Pairs for fast access
          { id: 'xr-usd-aed-curr', fromCurrency: 'USD', toCurrency: 'AED', rate: 3.6725, effectiveDate: '2026-01-01', rateType: 'CENTRAL_BANK', source: 'UAE Central Bank Official Peg', isActive: true, createdBy: 'System Administrator', createdAt: now, updatedAt: now },
        ];
        await db.insert(exchangeRates).values(seedRates);
      }
    } catch (err) {
      console.warn('ensureCurrenciesSeeded note:', err);
    }
  }

  async getAllCurrencies(includeInactive = false): Promise<CurrencyItem[]> {
    await this.ensureCurrenciesSeeded();
    const rows = await db.select().from(currencies).orderBy(asc(currencies.displayOrder), asc(currencies.code));
    if (includeInactive) return rows;
    return rows.filter((r) => r.isActive);
  }

  async getCurrencyByCode(code: string): Promise<CurrencyItem | null> {
    if (!code) return null;
    const rows = await db.select().from(currencies).where(eq(currencies.code, code.toUpperCase()));
    return rows[0] || null;
  }

  async getCurrencyById(id: string): Promise<CurrencyItem | null> {
    const rows = await db.select().from(currencies).where(eq(currencies.id, id));
    return rows[0] || null;
  }

  async getBaseCurrency(): Promise<CurrencyItem> {
    await this.ensureCurrenciesSeeded();
    const baseRows = await db.select().from(currencies).where(eq(currencies.isBaseCurrency, true));
    if (baseRows.length > 0) return baseRows[0];

    throw new Error('Enterprise base currency is not configured. Configure an active base currency before financial reporting.');
  }
  /**
   * Controlled administrative operation to set enterprise base reporting currency
   */
  async setBaseCurrency(currencyCode: string, actor = 'System Administrator'): Promise<CurrencyItem> {
    const code = currencyCode.toUpperCase().trim();
    const target = await this.getCurrencyByCode(code);
    if (!target) {
      throw new Error(`Currency ${code} does not exist in master ledger`);
    }
    if (!target.isActive) {
      throw new Error(`Cannot set inactive currency ${code} as enterprise base currency`);
    }

    const now = new Date().toISOString();
    // Unset all previous base currencies
    await db.update(currencies).set({ isBaseCurrency: false, updatedAt: now });

    // Set new base currency
    await db.update(currencies).set({ isBaseCurrency: true, exchangeRate: 1.0, updatedAt: now }).where(eq(currencies.code, code));

    const updated = await this.getCurrencyByCode(code);

    await this.logAudit({
      action: 'SET_BASE_CURRENCY',
      entityId: target.id,
      entityType: 'CURRENCY',
      actor,
      details: {
        previousBase: (await db.select().from(currencies).where(eq(currencies.isBaseCurrency, true)))[0]?.code,
        newBase: code,
      },
    });

    return updated!;
  }

  async createCurrency(data: {
    code: string;
    name: string;
    symbol: string;
    exchangeRate?: number;
    decimalPrecision?: number;
    isBaseCurrency?: boolean;
    displayOrder?: number;
    isActive?: boolean;
    actor?: string;
  }): Promise<CurrencyItem> {
    const code = data.code.toUpperCase().trim();
    const existing = await this.getCurrencyByCode(code);
    if (existing) {
      throw new Error(`Currency with ISO code ${code} already exists`);
    }

    const id = `cur-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    if (data.isBaseCurrency) {
      // Unset any previous base currency
      await db.update(currencies).set({ isBaseCurrency: false, updatedAt: now });
    }

    const newRecord: CurrencyItem = {
      id,
      code,
      name: data.name.trim(),
      symbol: data.symbol.trim(),
      exchangeRate: Number(data.exchangeRate) || 1.0,
      decimalPrecision: data.decimalPrecision !== undefined ? Number(data.decimalPrecision) : 2,
      isBaseCurrency: Boolean(data.isBaseCurrency),
      displayOrder: Number(data.displayOrder) || 0,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(currencies).values(newRecord);

    // Audit log
    await this.logAudit({
      action: 'CREATE_CURRENCY',
      entityId: id,
      entityType: 'CURRENCY',
      actor: data.actor || 'System Admin',
      details: { newRecord },
    });

    return newRecord;
  }

  async updateCurrency(
    id: string,
    data: {
      name?: string;
      symbol?: string;
      exchangeRate?: number;
      decimalPrecision?: number;
      isBaseCurrency?: boolean;
      displayOrder?: number;
      isActive?: boolean;
      actor?: string;
    }
  ): Promise<CurrencyItem> {
    const existing = await this.getCurrencyById(id);
    if (!existing) {
      throw new Error(`Currency not found with ID ${id}`);
    }

    // Protection: Cannot deactivate the currently active enterprise base currency
    if (existing.isBaseCurrency && data.isActive === false) {
      throw new Error(`Cannot deactivate ${existing.code} because it is the designated enterprise base reporting currency.`);
    }

    const now = new Date().toISOString();

    if (data.isBaseCurrency && !existing.isBaseCurrency) {
      await db.update(currencies).set({ isBaseCurrency: false, updatedAt: now });
    }

    const updates: Partial<CurrencyItem> = {
      updatedAt: now,
    };

    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.symbol !== undefined) updates.symbol = data.symbol.trim();
    if (data.exchangeRate !== undefined) updates.exchangeRate = Number(data.exchangeRate);
    if (data.decimalPrecision !== undefined) updates.decimalPrecision = Number(data.decimalPrecision);
    if (data.isBaseCurrency !== undefined) updates.isBaseCurrency = Boolean(data.isBaseCurrency);
    if (data.displayOrder !== undefined) updates.displayOrder = Number(data.displayOrder);
    if (data.isActive !== undefined) updates.isActive = Boolean(data.isActive);

    await db.update(currencies).set(updates).where(eq(currencies.id, id));

    const updated = await this.getCurrencyById(id);

    await this.logAudit({
      action: 'UPDATE_CURRENCY',
      entityId: id,
      entityType: 'CURRENCY',
      actor: data.actor || 'System Admin',
      details: { before: existing, after: updated },
    });

    return updated!;
  }

  // ==========================================================================
  // EXCHANGE RATES & HISTORICAL CONVERSIONS
  // ==========================================================================

  async getAllExchangeRates(filter?: { fromCurrency?: string; toCurrency?: string; rateType?: string }): Promise<ExchangeRateItem[]> {
    let query = db.select().from(exchangeRates).orderBy(desc(exchangeRates.effectiveDate), desc(exchangeRates.createdAt));
    const rows = await query;
    return rows.filter((r) => {
      if (filter?.fromCurrency && r.fromCurrency !== filter.fromCurrency.toUpperCase()) return false;
      if (filter?.toCurrency && r.toCurrency !== filter.toCurrency.toUpperCase()) return false;
      if (filter?.rateType && r.rateType !== filter.rateType) return false;
      return true;
    });
  }

  async getLatestRate(
    fromCurrency: string,
    toCurrency: string,
    asOfDate?: string,
    rateType?: string
  ): Promise<{ rate: number; source: string; effectiveDate: string; rateType?: string }> {
    const from = fromCurrency.toUpperCase().trim();
    const to = toCurrency.toUpperCase().trim();

    if (from === to) {
      return { rate: 1.0, source: 'IDENTITY', effectiveDate: asOfDate || new Date().toISOString().slice(0, 10), rateType: rateType || 'CORPORATE' };
    }

    const allRates = await db
      .select()
      .from(exchangeRates)
      .where(eq(exchangeRates.isActive, true))
      .orderBy(desc(exchangeRates.effectiveDate), desc(exchangeRates.createdAt));

    const targetDate = asOfDate || new Date().toISOString().slice(0, 10);

    // 1. Direct match: from -> to on or before targetDate (matching rateType if provided)
    if (rateType) {
      const directTyped = allRates.find((r) => r.fromCurrency === from && r.toCurrency === to && r.rateType === rateType && r.effectiveDate <= targetDate);
      if (directTyped) {
        return { rate: Number(directTyped.rate), source: directTyped.source || directTyped.rateType || 'DIRECT', effectiveDate: directTyped.effectiveDate, rateType: directTyped.rateType };
      }
    }

    const direct = allRates.find((r) => r.fromCurrency === from && r.toCurrency === to && r.effectiveDate <= targetDate);
    if (direct) {
      return { rate: Number(direct.rate), source: direct.source || direct.rateType || 'DIRECT', effectiveDate: direct.effectiveDate, rateType: direct.rateType };
    }

    // 2. Inverse match: to -> from
    if (rateType) {
      const inverseTyped = allRates.find((r) => r.fromCurrency === to && r.toCurrency === from && r.rateType === rateType && r.effectiveDate <= targetDate);
      if (inverseTyped && Number(inverseTyped.rate) > 0) {
        return { rate: 1 / Number(inverseTyped.rate), source: `INVERSE_${inverseTyped.source || inverseTyped.rateType || 'DIRECT'}`, effectiveDate: inverseTyped.effectiveDate, rateType: inverseTyped.rateType };
      }
    }

    const inverse = allRates.find((r) => r.fromCurrency === to && r.toCurrency === from && r.effectiveDate <= targetDate);
    if (inverse && Number(inverse.rate) > 0) {
      return { rate: 1 / Number(inverse.rate), source: `INVERSE_${inverse.source || inverse.rateType || 'DIRECT'}`, effectiveDate: inverse.effectiveDate, rateType: inverse.rateType };
    }

    // 3. Triangulate via base currency (INR)
    const baseCur = await this.getBaseCurrency();
    const baseCode = baseCur.code || 'INR';

    if (from !== baseCode && to !== baseCode) {
      const fromToBase = await this.getLatestRate(from, baseCode, targetDate, rateType);
      const toToBase = await this.getLatestRate(to, baseCode, targetDate, rateType);
      if (fromToBase && toToBase && toToBase.rate > 0) {
        return {
          rate: fromToBase.rate / toToBase.rate,
          source: `TRIANGULATED_${baseCode}`,
          effectiveDate: targetDate,
          rateType: rateType || 'CORPORATE',
        };
      }
    }

    // 4. Fallback: Currency Master exchangeRate relative to default Base (INR)
    const fromCur = await this.getCurrencyByCode(from);
    const toCur = await this.getCurrencyByCode(to);

    if (fromCur && toCur && Number(toCur.exchangeRate) > 0) {
      const triangulatedRate = Number(fromCur.exchangeRate) / Number(toCur.exchangeRate);
      return { rate: triangulatedRate, source: 'CURRENCY_MASTER_FALLBACK', effectiveDate: targetDate, rateType: rateType || 'CORPORATE' };
    }

    return { rate: 1.0, source: 'FALLBACK_UNITY', effectiveDate: targetDate, rateType: rateType || 'CORPORATE' };
  }

  /**
   * Convert an amount between currencies using historical or latest FX rates
   */
  async convertCurrency(params: {
    amount: number;
    fromCurrency: string;
    toCurrency?: string;
    asOfDate?: string;
    rateType?: string;
  }): Promise<{
    originalAmount: number;
    fromCurrency: string;
    toCurrency: string;
    exchangeRate: number;
    convertedAmount: number;
    asOfDate: string;
    rateType: string;
    source: string;
  }> {
    const from = params.fromCurrency.toUpperCase().trim();
    let to = (params.toCurrency || '').toUpperCase().trim();
    if (!to) {
      const base = await this.getBaseCurrency();
      to = base.code || 'INR';
    }

    const amount = Number(params.amount) || 0;
    const rateInfo = await this.getLatestRate(from, to, params.asOfDate, params.rateType);

    const convertedAmount = Number((amount * rateInfo.rate).toFixed(4));

    return {
      originalAmount: amount,
      fromCurrency: from,
      toCurrency: to,
      exchangeRate: rateInfo.rate,
      convertedAmount,
      asOfDate: rateInfo.effectiveDate,
      rateType: rateInfo.rateType || 'CORPORATE',
      source: rateInfo.source,
    };
  }

  async createExchangeRate(data: {
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    effectiveDate: string;
    rateType?: string;
    source?: string;
    actor?: string;
  }): Promise<ExchangeRateItem> {
    const from = data.fromCurrency.toUpperCase().trim();
    const to = data.toCurrency.toUpperCase().trim();
    const rate = Number(data.rate);
    if (rate <= 0 || isNaN(rate)) {
      throw new Error('Exchange rate must be a positive number');
    }

    const id = `xr-${from.toLowerCase()}-${to.toLowerCase()}-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    const newRecord: ExchangeRateItem = {
      id,
      fromCurrency: from,
      toCurrency: to,
      rate,
      effectiveDate: data.effectiveDate || now.slice(0, 10),
      rateType: data.rateType || 'CORPORATE',
      source: data.source || 'Manual User Entry',
      isActive: true,
      createdBy: data.actor || 'System Admin',
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(exchangeRates).values(newRecord);

    await this.logAudit({
      action: 'CREATE_EXCHANGE_RATE',
      entityId: id,
      entityType: 'EXCHANGE_RATE',
      actor: data.actor || 'System Admin',
      details: { newRecord },
    });

    return newRecord;
  }

  async updateExchangeRate(
    id: string,
    data: {
      rate?: number;
      effectiveDate?: string;
      rateType?: string;
      source?: string;
      isActive?: boolean;
      actor?: string;
    }
  ): Promise<ExchangeRateItem> {
    const existingRows = await db.select().from(exchangeRates).where(eq(exchangeRates.id, id));
    if (existingRows.length === 0) {
      throw new Error(`Exchange rate record not found with ID ${id}`);
    }
    const existing = existingRows[0];

    const now = new Date().toISOString();
    const updates: Partial<ExchangeRateItem> = {
      updatedAt: now,
    };

    if (data.rate !== undefined) {
      const r = Number(data.rate);
      if (r <= 0) throw new Error('Exchange rate must be positive');
      updates.rate = r;
    }
    if (data.effectiveDate !== undefined) updates.effectiveDate = data.effectiveDate;
    if (data.rateType !== undefined) updates.rateType = data.rateType;
    if (data.source !== undefined) updates.source = data.source;
    if (data.isActive !== undefined) updates.isActive = Boolean(data.isActive);

    await db.update(exchangeRates).set(updates).where(eq(exchangeRates.id, id));

    const updated = (await db.select().from(exchangeRates).where(eq(exchangeRates.id, id)))[0];

    await this.logAudit({
      action: 'UPDATE_EXCHANGE_RATE',
      entityId: id,
      entityType: 'EXCHANGE_RATE',
      actor: data.actor || 'System Admin',
      details: { before: existing, after: updated },
    });

    return updated;
  }

  private async logAudit(params: { action: string; entityId: string; entityType: string; actor: string; details: any }) {
    try {
      await db.insert(auditLogs).values({
        id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        action: params.action,
        module: 'FINANCIAL_CONFIGURATION',
        details: JSON.stringify({
          entityType: params.entityType,
          entityId: params.entityId,
          ...params.details,
        }),
        userId: 'ADMIN',
        userEmail: 'finance-admin@midland.com',
        userRole: 'FINANCE_ADMIN',
        ipAddress: '127.0.0.1',
        userAgent: 'SiteSync ERP System',
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Currency audit log error:', err);
    }
  }
}

export const currencyRepository = new CurrencyRepository();
