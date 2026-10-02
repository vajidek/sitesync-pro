import { Router, Request, Response } from 'express';
import { adminServicesRepository } from '../repositories/admin_services.repository';

const router = Router();

// --- Visitors ---
router.get('/visitors', async (req: Request, res: Response) => {
  try {
    const visitors = await adminServicesRepository.getVisitors();
    res.json({ success: true, data: visitors, total: visitors.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/visitors', async (req: Request, res: Response) => {
  try {
    const created = await adminServicesRepository.createVisitor(req.body);
    res.status(201).json({ success: true, data: created, message: 'Visitor pass issued successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/visitors/:id/checkout', async (req: Request, res: Response) => {
  try {
    const updated = await adminServicesRepository.checkOutVisitor(req.params.id);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Visitor record not found' });
    }
    res.json({ success: true, data: updated, message: 'Visitor checked out successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Meeting Rooms & Meetings ---
router.get('/meeting-rooms', async (req: Request, res: Response) => {
  try {
    const rooms = await adminServicesRepository.getMeetingRooms();
    res.json({ success: true, data: rooms, total: rooms.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/meetings', async (req: Request, res: Response) => {
  try {
    const meetings = await adminServicesRepository.getMeetings();
    res.json({ success: true, data: meetings, total: meetings.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/meetings', async (req: Request, res: Response) => {
  try {
    const created = await adminServicesRepository.createMeeting(req.body);
    res.status(201).json({ success: true, data: created, message: 'Meeting scheduled successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/meetings/:id/mom', async (req: Request, res: Response) => {
  try {
    const { minutesOfMeeting, actionItems } = req.body;
    const updated = await adminServicesRepository.updateMeetingMoM(req.params.id, minutesOfMeeting, actionItems);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }
    res.json({ success: true, data: updated, message: 'Minutes of Meeting recorded successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Notices ---
router.get('/notices', async (req: Request, res: Response) => {
  try {
    const notices = await adminServicesRepository.getNotices();
    res.json({ success: true, data: notices, total: notices.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/notices', async (req: Request, res: Response) => {
  try {
    const created = await adminServicesRepository.createNotice(req.body);
    res.status(201).json({ success: true, data: created, message: 'Company circular/notice published' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/notices/:id/acknowledge', async (req: Request, res: Response) => {
  try {
    const updated = await adminServicesRepository.acknowledgeNotice(req.params.id);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Notice not found' });
    }
    res.json({ success: true, data: updated, message: 'Notice read & acknowledged' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Corporate Service Requests ---
router.get('/service-requests', async (req: Request, res: Response) => {
  try {
    const requests = await adminServicesRepository.getServiceRequests();
    res.json({ success: true, data: requests, total: requests.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/service-requests', async (req: Request, res: Response) => {
  try {
    const created = await adminServicesRepository.createServiceRequest(req.body);
    res.status(201).json({ success: true, data: created, message: 'Corporate service request submitted' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/service-requests/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, approverName, remarks } = req.body;
    const updated = await adminServicesRepository.updateServiceRequestStatus(req.params.id, status, approverName || 'Administrator', remarks);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }
    res.json({ success: true, data: updated, message: `Request status updated to ${status}` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
