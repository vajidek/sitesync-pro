import { Router } from 'express';
import { currencyController } from '../controllers/currency.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';

const router = Router();

// Public or Authenticated currency listing
router.get('/', (req, res) => currencyController.listCurrencies(req, res));
router.get('/base-currency', (req, res) => currencyController.getBaseCurrency(req, res));
router.get('/convert', (req, res) => currencyController.convertCurrency(req, res));
router.get('/rates', (req, res) => currencyController.listExchangeRates(req, res));
router.get('/exchange-rates', (req, res) => currencyController.listExchangeRates(req, res));
router.get('/rates/latest', (req, res) => currencyController.getLatestRate(req, res));
router.get('/:code', (req, res) => currencyController.getCurrencyByCode(req, res));

// Admin & Finance Management Routes
router.post('/set-base', authenticateJWT, requireRoles('ADMIN', 'MANAGER'), (req, res) =>
  currencyController.setBaseCurrency(req, res)
);
router.post('/', authenticateJWT, requireRoles('ADMIN', 'MANAGER'), (req, res) =>
  currencyController.createCurrency(req, res)
);
router.put('/:id', authenticateJWT, requireRoles('ADMIN', 'MANAGER'), (req, res) =>
  currencyController.updateCurrency(req, res)
);
router.post('/rates', authenticateJWT, requireRoles('ADMIN', 'MANAGER'), (req, res) =>
  currencyController.createExchangeRate(req, res)
);
router.put('/rates/:id', authenticateJWT, requireRoles('ADMIN', 'MANAGER'), (req, res) =>
  currencyController.updateExchangeRate(req, res)
);

export default router;
