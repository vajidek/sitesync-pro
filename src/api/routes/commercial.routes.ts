import { Router, Request, Response } from 'express';
import { commercialRepository } from '../repositories/commercial.repository';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

// --- Tenders ---
router.get('/tenders', async (req: Request, res: Response) => {
  try {
    const tenders = await commercialRepository.getTenders();
    res.json({ success: true, data: tenders, total: tenders.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tenders', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), async (req: Request, res: Response) => {
  try {
    const created = await commercialRepository.createTender(req.body);
    res.status(201).json({ success: true, data: created, message: 'Commercial tender registered successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/tenders/:id/status', requireRoles('ADMIN', 'MANAGER'), async (req: Request, res: Response) => {
  try {
    const { status, quotedBidAmount, awardDetails } = req.body;
    const updated = await commercialRepository.updateTenderStatus(req.params.id, status, quotedBidAmount, awardDetails);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Tender record not found' });
    }
    res.json({ success: true, data: updated, message: `Tender status updated to ${status}` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Rate Analyses ---
router.get('/rate-analyses', async (req: Request, res: Response) => {
  try {
    const analyses = await commercialRepository.getRateAnalyses();
    res.json({ success: true, data: analyses, total: analyses.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/rate-analyses', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), async (req: Request, res: Response) => {
  try {
    const created = await commercialRepository.createRateAnalysis(req.body);
    res.status(201).json({ success: true, data: created, message: 'BOQ rate analysis calculated & saved' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// --- Subcontracts ---
router.get('/subcontracts', async (req: Request, res: Response) => {
  try {
    const subcontracts = await commercialRepository.getSubcontracts();
    res.json({ success: true, data: subcontracts, total: subcontracts.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/subcontracts', requireRoles('ADMIN', 'MANAGER'), async (req: Request, res: Response) => {
  try {
    const created = await commercialRepository.createSubcontract(req.body);
    res.status(201).json({ success: true, data: created, message: 'Subcontract agreement executed' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// --- Subcontract Bills (RA Bills) ---
router.get('/subcontract-bills', async (req: Request, res: Response) => {
  try {
    const subcontractId = req.query.subcontractId as string | undefined;
    const bills = await commercialRepository.getSubcontractBills(subcontractId);
    res.json({ success: true, data: bills, total: bills.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/subcontract-bills', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), async (req: Request, res: Response) => {
  try {
    const created = await commercialRepository.createSubcontractBill(req.body);
    res.status(201).json({ success: true, data: created, message: 'Subcontractor RA Bill recorded & submitted' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/subcontract-bills/:id/certify', requireRoles('ADMIN', 'MANAGER'), async (req: Request, res: Response) => {
  try {
    const { certifiedAmount, status } = req.body;
    const user = (req as any).user;
    const actor = {
      id: String(user?.id || ''),
      name: String(user?.name || user?.email || ''),
      role: String(user?.role || ''),
    };
    const certified = await commercialRepository.certifySubcontractBill(req.params.id, Number(certifiedAmount), status, actor);
    if (!certified) return res.status(404).json({ success: false, error: 'Subcontract bill not found' });
    res.json({ success: true, data: certified, message: 'Subcontract bill certified successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// --- Variation Orders & Claims ---
router.get('/variations', async (req: Request, res: Response) => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const variations = await commercialRepository.getVariationOrders(projectId);
    res.json({ success: true, data: variations, total: variations.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/variations', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), async (req: Request, res: Response) => {
  try {
    const created = await commercialRepository.createVariationOrder(req.body);
    res.status(201).json({ success: true, data: created, message: 'Variation order registered' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/variations/:id/status', requireRoles('ADMIN', 'MANAGER'), async (req: Request, res: Response) => {
  try {
    const { status, approvedAmount } = req.body;
    const updated = await commercialRepository.updateVariationStatus(req.params.id, status, approvedAmount !== undefined ? Number(approvedAmount) : undefined);
    if (!updated) return res.status(404).json({ success: false, error: 'Variation order not found' });
    res.json({ success: true, data: updated, message: `Variation status updated to ${status}` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Client Interim Payment Certificates (IPC) ---
router.get('/client-ipcs', async (req: Request, res: Response) => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const ipcs = await commercialRepository.getClientIPCs(projectId);
    res.json({ success: true, data: ipcs, total: ipcs.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/client-ipcs', requireRoles('ADMIN', 'MANAGER', 'INCHARGE'), async (req: Request, res: Response) => {
  try {
    const created = await commercialRepository.createClientIPC(req.body);
    res.status(201).json({ success: true, data: created, message: 'Client Interim Payment Certificate created' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/client-ipcs/:id/certify', requireRoles('ADMIN', 'MANAGER'), async (req: Request, res: Response) => {
  try {
    const { certifiedAmount, status } = req.body;
    const user = (req as any).user;
    const actor = {
      id: String(user?.id || ''),
      name: String(user?.name || user?.email || ''),
      role: String(user?.role || ''),
    };
    const certified = await commercialRepository.certifyClientIPC(req.params.id, Number(certifiedAmount), status, actor);
    if (!certified) return res.status(404).json({ success: false, error: 'Client IPC record not found' });
    res.json({ success: true, data: certified, message: 'Client IPC certified successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
