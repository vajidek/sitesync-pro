import { Request, Response } from 'express';
import { currencyRepository } from '../repositories/currency.repository';

export class CurrencyController {
  async listCurrencies(req: Request, res: Response): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const items = await currencyRepository.getAllCurrencies(includeInactive);
      const base = await currencyRepository.getBaseCurrency();
      res.json({
        success: true,
        data: items,
        items,
        baseCurrency: base,
        total: items.length,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to list currencies' });
    }
  }

  async getBaseCurrency(req: Request, res: Response): Promise<void> {
    try {
      const base = await currencyRepository.getBaseCurrency();
      res.json({ success: true, data: base, baseCurrency: base });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async convertCurrency(req: Request, res: Response): Promise<void> {
    try {
      const amount = Number(req.query.amount || req.body.amount || 1);
      const from = String(req.query.from || req.body.from || 'USD').toUpperCase();
      const to = String(req.query.to || req.body.to || 'INR').toUpperCase();
      const asOfDate = (req.query.asOfDate || req.body.asOfDate) as string | undefined;
      const rateType = (req.query.rateType || req.body.rateType) as string | undefined;

      const result = await currencyRepository.convertCurrency({
        amount,
        fromCurrency: from,
        toCurrency: to,
        asOfDate,
        rateType,
      });

      res.json({
        success: true,
        data: {
          amount: result.originalAmount,
          from: result.fromCurrency,
          to: result.toCurrency,
          rate: result.exchangeRate,
          convertedAmount: result.convertedAmount,
          effectiveDate: result.asOfDate,
          rateType: result.rateType,
          source: result.source,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async setBaseCurrency(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { currencyCode } = req.body;
      if (!currencyCode) {
        res.status(400).json({ success: false, error: 'currencyCode is required' });
        return;
      }
      const updated = await currencyRepository.setBaseCurrency(
        currencyCode,
        user?.name || user?.email || 'System Administrator'
      );
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to update enterprise base currency' });
    }
  }

  async getCurrencyByCode(req: Request, res: Response): Promise<void> {
    try {
      const code = req.params.code;
      const item = await currencyRepository.getCurrencyByCode(code);
      if (!item) {
        res.status(404).json({ success: false, error: `Currency ${code} not found` });
        return;
      }
      res.json({ success: true, data: item });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async createCurrency(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const created = await currencyRepository.createCurrency({
        ...req.body,
        actor: user?.name || user?.email || 'Admin',
      });
      res.status(201).json({ success: true, data: created });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to create currency' });
    }
  }

  async updateCurrency(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const id = req.params.id;
      const updated = await currencyRepository.updateCurrency(id, {
        ...req.body,
        actor: user?.name || user?.email || 'Admin',
      });
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to update currency' });
    }
  }

  async listExchangeRates(req: Request, res: Response): Promise<void> {
    try {
      const { fromCurrency, toCurrency, rateType } = req.query as Record<string, string>;
      const items = await currencyRepository.getAllExchangeRates({ fromCurrency, toCurrency, rateType });
      res.json({ success: true, items, total: items.length });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to list exchange rates' });
    }
  }

  async getLatestRate(req: Request, res: Response): Promise<void> {
    try {
      const { fromCurrency, toCurrency, asOfDate } = req.query as Record<string, string>;
      if (!fromCurrency || !toCurrency) {
        res.status(400).json({ success: false, error: 'fromCurrency and toCurrency query params are required' });
        return;
      }
      const result = await currencyRepository.getLatestRate(fromCurrency, toCurrency, asOfDate);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async createExchangeRate(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const created = await currencyRepository.createExchangeRate({
        ...req.body,
        actor: user?.name || user?.email || 'Admin',
      });
      res.status(201).json({ success: true, data: created });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to create exchange rate' });
    }
  }

  async updateExchangeRate(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const id = req.params.id;
      const updated = await currencyRepository.updateExchangeRate(id, {
        ...req.body,
        actor: user?.name || user?.email || 'Admin',
      });
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to update exchange rate' });
    }
  }
}

export const currencyController = new CurrencyController();
