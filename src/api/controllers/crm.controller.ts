import { Request, Response } from 'express';
import { CRMService } from '../services/crm.service';
import {
  CreateCustomerSchema,
  CreateLeadSchema,
  CreateOpportunitySchema,
  CreateComplaintSchema,
  CreateSupportTicketSchema,
  CreateTicketCommentSchema,
  CreateFeedbackSchema,
  CreateMeetingSchema,
  CreateFollowupSchema,
} from '../validators/crm.validator';

const service = new CRMService();

export class CRMController {
  public async getStats(req: Request, res: Response) {
    try {
      const stats = await service.getCRMStats();
      return res.status(200).json({ success: true, data: stats });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getCustomers(req: Request, res: Response) {
    try {
      const customers = await service.getAllCustomers();
      return res.status(200).json({ success: true, data: customers });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getCustomerById(req: Request, res: Response) {
    try {
      const customer = await service.getCustomerById(req.params.id);
      return res.status(200).json({ success: true, data: customer });
    } catch (err: any) {
      return res.status(404).json({ success: false, error: err.message });
    }
  }

  public async createCustomer(req: Request, res: Response) {
    try {
      const validated = CreateCustomerSchema.parse(req.body);
      const customer = await service.createCustomer(validated);
      return res.status(201).json({ success: true, data: customer });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  }

  public async getLeads(req: Request, res: Response) {
    try {
      const leads = await service.getAllLeads();
      return res.status(200).json({ success: true, data: leads });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createLead(req: Request, res: Response) {
    try {
      const validated = CreateLeadSchema.parse(req.body);
      const lead = await service.createLead(validated);
      return res.status(201).json({ success: true, data: lead });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  }

  public async convertLead(req: Request, res: Response) {
    try {
      const result = await service.convertLeadToOpportunity(req.params.id, req.body);
      return res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  }

  public async getOpportunities(req: Request, res: Response) {
    try {
      const opportunities = await service.getAllOpportunities();
      return res.status(200).json({ success: true, data: opportunities });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createOpportunity(req: Request, res: Response) {
    try {
      const validated = CreateOpportunitySchema.parse(req.body);
      const opp = await service.createOpportunity(validated);
      return res.status(201).json({ success: true, data: opp });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  }

  public async getComplaints(req: Request, res: Response) {
    try {
      const complaints = await service.getAllComplaints();
      return res.status(200).json({ success: true, data: complaints });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createComplaint(req: Request, res: Response) {
    try {
      const validated = CreateComplaintSchema.parse(req.body);
      const complaint = await service.createComplaint(validated);
      return res.status(201).json({ success: true, data: complaint });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  }

  public async getTickets(req: Request, res: Response) {
    try {
      const tickets = await service.getAllSupportTickets();
      return res.status(200).json({ success: true, data: tickets });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createTicket(req: Request, res: Response) {
    try {
      const validated = CreateSupportTicketSchema.parse(req.body);
      const ticket = await service.createSupportTicket(validated);
      return res.status(201).json({ success: true, data: ticket });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  }

  public async getTicketComments(req: Request, res: Response) {
    try {
      const comments = await service.getTicketComments(req.params.id);
      return res.status(200).json({ success: true, data: comments });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async addTicketComment(req: Request, res: Response) {
    try {
      const validated = CreateTicketCommentSchema.parse(req.body);
      const comment = await service.addTicketComment(validated);
      return res.status(201).json({ success: true, data: comment });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  }

  public async getFeedback(req: Request, res: Response) {
    try {
      const feedback = await service.getAllFeedback();
      return res.status(200).json({ success: true, data: feedback });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createFeedback(req: Request, res: Response) {
    try {
      const validated = CreateFeedbackSchema.parse(req.body);
      const feedback = await service.createFeedback(validated);
      return res.status(201).json({ success: true, data: feedback });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  }

  public async getMeetings(req: Request, res: Response) {
    try {
      const meetings = await service.getAllMeetings();
      return res.status(200).json({ success: true, data: meetings });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createMeeting(req: Request, res: Response) {
    try {
      const validated = CreateMeetingSchema.parse(req.body);
      const meeting = await service.createMeeting(validated);
      return res.status(201).json({ success: true, data: meeting });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  }

  public async getFollowups(req: Request, res: Response) {
    try {
      const followups = await service.getAllFollowups();
      return res.status(200).json({ success: true, data: followups });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createFollowup(req: Request, res: Response) {
    try {
      const validated = CreateFollowupSchema.parse(req.body);
      const followup = await service.createFollowup(validated);
      return res.status(201).json({ success: true, data: followup });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  }

  public async getPortalDashboard(req: Request, res: Response) {
    try {
      const customerId = req.query.customerId as string | undefined;
      const data = await service.getPortalDashboardData(customerId);
      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}
