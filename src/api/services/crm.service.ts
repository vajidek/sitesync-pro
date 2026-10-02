import { CRMRepository } from '../repositories/crm.repository';

export class CRMService {
  private repository: CRMRepository;

  constructor() {
    this.repository = new CRMRepository();
  }

  public async getCRMStats() {
    return this.repository.getCRMStats();
  }

  public async getAllCustomers() {
    return this.repository.getAllCustomers();
  }

  public async getCustomerById(id: string) {
    const customer = await this.repository.getCustomerById(id);
    if (!customer) {
      throw new Error(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  public async createCustomer(data: any) {
    // Business logic: Auto-calculate health score based on credit limit and tier
    let initialHealth = 90;
    if (data.tier === 'PLATINUM') initialHealth = 98;
    else if (data.tier === 'STRATEGIC') initialHealth = 95;

    return this.repository.createCustomer({
      ...data,
      healthScore: initialHealth,
    });
  }

  public async getAllLeads() {
    return this.repository.getAllLeads();
  }

  public async createLead(data: any) {
    return this.repository.createLead(data);
  }

  public async convertLeadToOpportunity(leadId: string, oppData: any) {
    // Conversion Logic
    const leads = await this.repository.getAllLeads();
    const lead = leads.find(l => l.id === leadId);
    if (!lead) {
      throw new Error(`Lead ${leadId} not found`);
    }

    // Create Opportunity from Lead
    const opportunity = await this.repository.createOpportunity({
      oppNumber: oppData.oppNumber || `OPP-CONV-${Date.now().toString().slice(-4)}`,
      title: oppData.title || `Opportunity for ${lead.companyName}`,
      leadId: lead.id,
      estimatedValue: oppData.estimatedValue || lead.estimatedValue,
      probabilityPercent: oppData.probabilityPercent || 60,
      stage: oppData.stage || 'TECHNICAL_PROPOSAL',
      expectedClosingDate: oppData.expectedClosingDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      ownerName: oppData.ownerName || lead.assignedTo,
    });

    return {
      convertedLeadId: leadId,
      opportunity,
    };
  }

  public async getAllOpportunities() {
    return this.repository.getAllOpportunities();
  }

  public async createOpportunity(data: any) {
    return this.repository.createOpportunity(data);
  }

  public async getAllComplaints() {
    return this.repository.getAllComplaints();
  }

  public async createComplaint(data: any) {
    return this.repository.createComplaint(data);
  }

  public async getAllSupportTickets() {
    const tickets = await this.repository.getAllSupportTickets();

    // Check SLA breaches based on SLA hours and created_at date
    const now = new Date().getTime();
    return tickets.map(t => {
      const createdTime = new Date(t.createdAt).getTime();
      const ageHours = (now - createdTime) / (1000 * 3600);
      const slaBreached = ageHours > (t.slaHours || 24) && (t.status === 'OPEN' || t.status === 'IN_PROGRESS');
      return {
        ...t,
        slaBreached,
      };
    });
  }

  public async createSupportTicket(data: any) {
    return this.repository.createSupportTicket(data);
  }

  public async getTicketComments(ticketId: string) {
    return this.repository.getTicketComments(ticketId);
  }

  public async addTicketComment(data: any) {
    return this.repository.createTicketComment(data);
  }

  public async getAllFeedback() {
    return this.repository.getAllFeedback();
  }

  public async createFeedback(data: any) {
    return this.repository.createFeedback(data);
  }

  public async getAllMeetings() {
    return this.repository.getAllMeetings();
  }

  public async createMeeting(data: any) {
    return this.repository.createMeeting(data);
  }

  public async getAllFollowups() {
    return this.repository.getAllFollowups();
  }

  public async createFollowup(data: any) {
    return this.repository.createFollowup(data);
  }

  public async getPortalDashboardData(customerId?: string) {
    return this.repository.getPortalDashboardData(customerId);
  }
}
