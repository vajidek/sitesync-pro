import { Router, Request, Response } from 'express';
import { itManagementRepository } from '../repositories/it_management.repository';

const router = Router();

// --- IT Assets ---
router.get('/assets', async (req: Request, res: Response) => {
  try {
    const assets = await itManagementRepository.getAssets();
    res.json({ success: true, data: assets, total: assets.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/assets', async (req: Request, res: Response) => {
  try {
    const created = await itManagementRepository.createAsset(req.body);
    res.status(201).json({ success: true, data: created, message: 'IT asset registered successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/assets/:id', async (req: Request, res: Response) => {
  try {
    const updated = await itManagementRepository.updateAsset(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }
    res.json({ success: true, data: updated, message: 'IT asset details updated' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Software Licenses ---
router.get('/licenses', async (req: Request, res: Response) => {
  try {
    const licenses = await itManagementRepository.getLicenses();
    res.json({ success: true, data: licenses, total: licenses.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/licenses/:id/allocate', async (req: Request, res: Response) => {
  try {
    const { userId, userName, email } = req.body;
    const updated = await itManagementRepository.allocateLicenseSeat(req.params.id, { userId, userName, email });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'License not found or seats exceeded' });
    }
    res.json({ success: true, data: updated, message: 'License seat allocated to user' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// --- IT Helpdesk Tickets ---
router.get('/tickets', async (req: Request, res: Response) => {
  try {
    const tickets = await itManagementRepository.getTickets();
    res.json({ success: true, data: tickets, total: tickets.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tickets', async (req: Request, res: Response) => {
  try {
    const created = await itManagementRepository.createTicket(req.body);
    res.status(201).json({ success: true, data: created, message: 'IT ticket created successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/tickets/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, resolutionNotes, technicianName } = req.body;
    const updated = await itManagementRepository.updateTicketStatus(req.params.id, status, resolutionNotes, technicianName);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }
    res.json({ success: true, data: updated, message: `Ticket status changed to ${status}` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Access Requests ---
router.get('/access-requests', async (req: Request, res: Response) => {
  try {
    const requests = await itManagementRepository.getAccessRequests();
    res.json({ success: true, data: requests, total: requests.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/access-requests', async (req: Request, res: Response) => {
  try {
    const created = await itManagementRepository.createAccessRequest(req.body);
    res.status(201).json({ success: true, data: created, message: 'Access request submitted' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/access-requests/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, actorName } = req.body;
    const updated = await itManagementRepository.updateAccessRequestStatus(req.params.id, status, actorName || 'Security Administrator');
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }
    res.json({ success: true, data: updated, message: `Access request status updated to ${status}` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
