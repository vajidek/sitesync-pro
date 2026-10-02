import { Request, Response } from 'express';
import { FinanceService } from '../services/finance.service';
import {
  createAccountSchema,
  createCostCenterSchema,
  createJournalEntrySchema,
  createAPInvoiceSchema,
  createARInvoiceSchema,
  createBankAccountSchema,
  createCashTransactionSchema,
  createBudgetMasterSchema,
  createTaxRecordSchema,
} from '../validators/finance.validator';

const service = new FinanceService();

export class FinanceController {
  async getAccounts(req: Request, res: Response) {
    try {
      const accounts = await service.getAccounts();
      res.json({ success: true, count: accounts.length, data: accounts });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async createAccount(req: Request, res: Response) {
    try {
      const validated = createAccountSchema.parse(req.body);
      const acc = await service.createAccount(validated);
      res.status(201).json({ success: true, data: acc });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async getCostCenters(req: Request, res: Response) {
    try {
      const centers = await service.getCostCenters();
      res.json({ success: true, count: centers.length, data: centers });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async createCostCenter(req: Request, res: Response) {
    try {
      const validated = createCostCenterSchema.parse(req.body);
      const cc = await service.createCostCenter(validated);
      res.status(201).json({ success: true, data: cc });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async getJournalEntries(req: Request, res: Response) {
    try {
      const journals = await service.getJournalEntries();
      res.json({ success: true, count: journals.length, data: journals });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async postJournalEntry(req: Request, res: Response) {
    try {
      const validated = createJournalEntrySchema.parse(req.body);
      const user = (req as any).user;
      const actor = String(user?.name || user?.email || '').trim();
      if (!actor) {
        res.status(401).json({ success: false, message: 'Authenticated finance actor identity is required.' });
        return;
      }

      const journal = await service.postJournalEntry({
        ...validated,
        postedBy: actor,
        createdBy: actor,
        updatedBy: actor,
      });
      res.status(201).json({ success: true, data: journal });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async getGeneralLedger(req: Request, res: Response) {
    try {
      const gl = await service.getGeneralLedger();
      res.json({ success: true, count: gl.length, data: gl });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async getAPInvoices(req: Request, res: Response) {
    try {
      const invoices = await service.getAPInvoices();
      res.json({ success: true, count: invoices.length, data: invoices });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async createAPInvoice(req: Request, res: Response) {
    try {
      const validated = createAPInvoiceSchema.parse(req.body);
      const invoice = await service.createAPInvoice(validated);
      res.status(201).json({ success: true, data: invoice });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async getARInvoices(req: Request, res: Response) {
    try {
      const invoices = await service.getARInvoices();
      res.json({ success: true, count: invoices.length, data: invoices });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async createARInvoice(req: Request, res: Response) {
    try {
      const validated = createARInvoiceSchema.parse(req.body);
      const invoice = await service.createARInvoice(validated);
      res.status(201).json({ success: true, data: invoice });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async getBankAccounts(req: Request, res: Response) {
    try {
      const accounts = await service.getBankAccounts();
      res.json({ success: true, count: accounts.length, data: accounts });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async createBankAccount(req: Request, res: Response) {
    try {
      const validated = createBankAccountSchema.parse(req.body);
      const account = await service.createBankAccount(validated);
      res.status(201).json({ success: true, data: account });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async getCashTransactions(req: Request, res: Response) {
    try {
      const txs = await service.getCashTransactions();
      res.json({ success: true, count: txs.length, data: txs });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async createCashTransaction(req: Request, res: Response) {
    try {
      const validated = createCashTransactionSchema.parse(req.body);
      const tx = await service.createCashTransaction(validated);
      res.status(201).json({ success: true, data: tx });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async getBudgets(req: Request, res: Response) {
    try {
      const budgets = await service.getBudgets();
      res.json({ success: true, count: budgets.length, data: budgets });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async createBudget(req: Request, res: Response) {
    try {
      const validated = createBudgetMasterSchema.parse(req.body);
      const budget = await service.createBudget(validated);
      res.status(201).json({ success: true, data: budget });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async getTaxes(req: Request, res: Response) {
    try {
      const taxes = await service.getTaxes();
      res.json({ success: true, count: taxes.length, data: taxes });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async createTax(req: Request, res: Response) {
    try {
      const validated = createTaxRecordSchema.parse(req.body);
      const tax = await service.createTax(validated);
      res.status(201).json({ success: true, data: tax });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async getFinanceStats(req: Request, res: Response) {
    try {
      const stats = await service.getFinanceStats();
      res.json({ success: true, data: stats });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async getTrialBalance(req: Request, res: Response) {
    try {
      const data = await service.getTrialBalance();
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async getProfitAndLoss(req: Request, res: Response) {
    try {
      const year = req.query.year as string;
      const data = await service.getProfitAndLoss(year);
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async getBalanceSheet(req: Request, res: Response) {
    try {
      const asOfDate = req.query.asOfDate as string;
      const data = await service.getBalanceSheet(asOfDate);
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async getCashFlowStatement(req: Request, res: Response) {
    try {
      const data = await service.getCashFlowStatement();
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
}
