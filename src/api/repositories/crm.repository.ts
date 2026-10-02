import { db } from '../../db/index';
import { sql } from 'drizzle-orm';
import {
  phase67Customers,
  phase67CustomerContacts,
  phase67CustomerAddresses,
  phase67Leads,
  phase67Opportunities,
  phase67Enquiries,
  phase67CustomerProjects,
  phase67CustomerComplaints,
  phase67ServiceRequests,
  phase67SupportTickets,
  phase67TicketComments,
  phase67TicketAttachments,
  phase67CustomerFeedback,
  phase67CustomerMeetings,
  phase67Followups,
  phase67PortalUsers,
  phase67PortalSessions,
  phase67CustomerNotifications,
  phase67CustomerDocuments,
  phase67CustomerLogs,
} from '../../db/schema';
import { v4 as uuidv4 } from 'uuid';

export class CRMRepository {
  private static isTablesEnsured = false;

  public async ensureCRMTablesExist(): Promise<void> {
    if (CRMRepository.isTablesEnsured) return;

    try {
      await this.seedInitialCRMData();
      CRMRepository.isTablesEnsured = true;
    } catch (error) {
      console.warn('CRMRepository table creation warning:', error);
    }
  }

  private async seedInitialCRMData(): Promise<void> {
    const now = new Date().toISOString();
    try {
      const existing = await db.select().from(phase67Customers).limit(1);
      if (existing.length > 0) return;

      const cust1Id = 'cust-dewa-001';
      const cust2Id = 'cust-nakheel-002';
      const cust3Id = 'cust-emaar-003';

      await db.insert(phase67Customers).values([
        {
          id: cust1Id,
          code: 'CUST-2026-001',
          companyName: 'Dubai Electricity & Water Authority (DEWA)',
          tradingName: 'DEWA Utilities',
          industry: 'UTILITIES_INFRASTRUCTURE',
          customerType: 'GOVERNMENT',
          tier: 'PLATINUM',
          status: 'ACTIVE',
          taxRegistrationNo: 'TRN-1002938481001',
          creditLimit: 50000000,
          healthScore: 98,
          csatScore: 4.9,
          accountManager: 'Eng. Rashid Al-Maktoum',
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Seed',
          updatedBy: 'System Seed',
        },
        {
          id: cust2Id,
          code: 'CUST-2026-002',
          companyName: 'Nakheel Properties PJSC',
          tradingName: 'Nakheel Developments',
          industry: 'REAL_ESTATE_DEVELOPMENT',
          customerType: 'PRIVATE_DEVELOPER',
          tier: 'STRATEGIC',
          status: 'ACTIVE',
          taxRegistrationNo: 'TRN-1004829104002',
          creditLimit: 25000000,
          healthScore: 92,
          csatScore: 4.7,
          accountManager: 'Sarah Jenkins',
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Seed',
          updatedBy: 'System Seed',
        },
        {
          id: cust3Id,
          code: 'CUST-2026-003',
          companyName: 'Emaar Properties PJSC',
          tradingName: 'Emaar MegaProjects',
          industry: 'REAL_ESTATE_DEVELOPMENT',
          customerType: 'PRIVATE_DEVELOPER',
          tier: 'PLATINUM',
          status: 'ACTIVE',
          taxRegistrationNo: 'TRN-1008830192003',
          creditLimit: 40000000,
          healthScore: 95,
          csatScore: 4.85,
          accountManager: 'Tariq Mansoor',
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Seed',
          updatedBy: 'System Seed',
        },
      ]);

      await db.insert(phase67CustomerContacts).values([
        {
          id: uuidv4(),
          customerId: cust1Id,
          fullName: 'Eng. Sultan Al-Nuaimi',
          jobTitle: 'Director of Infrastructure Operations',
          email: 'sultan.nuaimi@dewa.gov.ae',
          phone: '+971-4-601-9988',
          isPrimary: true,
          department: 'Project Management & Oversight',
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Seed',
          updatedBy: 'System Seed',
        },
        {
          id: uuidv4(),
          customerId: cust2Id,
          fullName: 'Mohammed Al-Hashimi',
          jobTitle: 'Senior VP Procurement & Contracts',
          email: 'm.hashimi@nakheel.com',
          phone: '+971-4-390-1122',
          isPrimary: true,
          department: 'Contracts & Commercial',
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Seed',
          updatedBy: 'System Seed',
        },
      ]);

      await db.insert(phase67Leads).values([
        {
          id: uuidv4(),
          leadNumber: 'LEAD-2026-101',
          companyName: 'Sharjah Urban Planning Authority',
          contactName: 'Eng. Khalid Al-Qasimi',
          email: 'khalid@suka.gov.ae',
          phone: '+971-6-512-8800',
          source: 'TENDER_PORTAL',
          estimatedValue: 18500000,
          status: 'QUALIFIED',
          assignedTo: 'Business Development Director',
          notes: 'High probability tender submission for Sharjah Water Distribution Main Phase III',
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Seed',
          updatedBy: 'System Seed',
        },
        {
          id: uuidv4(),
          leadNumber: 'LEAD-2026-102',
          companyName: 'Ras Al Khaimah Investment Authority (RAKIA)',
          contactName: 'David Miller',
          email: 'dmiller@rakia.ae',
          phone: '+971-7-204-1100',
          source: 'EXPO',
          estimatedValue: 12000000,
          status: 'NEW',
          assignedTo: 'BD Manager Infrastructure',
          notes: 'Met at WETEX Expo 2026. Interested in industrial wastewater treatment turnkey EPC.',
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Seed',
          updatedBy: 'System Seed',
        },
      ]);

      await db.insert(phase67Opportunities).values([
        {
          id: uuidv4(),
          oppNumber: 'OPP-2026-501',
          title: 'Dubai South Water Main Trunk Line Expansion',
          customerId: cust1Id,
          estimatedValue: 34500000,
          probabilityPercent: 85,
          stage: 'COMMERCIAL_BID',
          expectedClosingDate: '2026-09-30',
          ownerName: 'Executive Account Lead',
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Seed',
          updatedBy: 'System Seed',
        },
        {
          id: uuidv4(),
          oppNumber: 'OPP-2026-502',
          title: 'Palm Jebel Ali Seawater Intake Pumping Station',
          customerId: cust2Id,
          estimatedValue: 28000000,
          probabilityPercent: 70,
          stage: 'TECHNICAL_PROPOSAL',
          expectedClosingDate: '2026-10-15',
          ownerName: 'Sarah Jenkins',
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Seed',
          updatedBy: 'System Seed',
        },
      ]);

      await db.insert(phase67SupportTickets).values([
        {
          id: uuidv4(),
          ticketNo: 'TCK-2026-901',
          customerId: cust1Id,
          customerName: 'Dubai Electricity & Water Authority (DEWA)',
          subject: 'Request for Expedited Approval of Valve Pit Submittal (Submittal #DEWA-SUB-044)',
          category: 'DRAWING_APPROVAL',
          priority: 'URGENT',
          assignedTo: 'Engineering Technical Lead',
          status: 'IN_PROGRESS',
          slaHours: 12,
          slaBreached: false,
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Seed',
          updatedBy: 'System Seed',
        },
        {
          id: uuidv4(),
          ticketNo: 'TCK-2026-902',
          customerId: cust2Id,
          customerName: 'Nakheel Properties PJSC',
          subject: 'Monthly Payment Application Clarification - IPC #08',
          category: 'BILLING_INQUIRY',
          priority: 'NORMAL',
          assignedTo: 'Finance & Accounts Specialist',
          status: 'OPEN',
          slaHours: 24,
          slaBreached: false,
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Seed',
          updatedBy: 'System Seed',
        },
      ]);

      await db.insert(phase67CustomerComplaints).values([
        {
          id: uuidv4(),
          complaintNo: 'CMP-2026-801',
          customerId: cust2Id,
          customerName: 'Nakheel Properties PJSC',
          category: 'SCHEDULE',
          severity: 'MEDIUM',
          subject: 'Minor delay in trench compaction report submission for Sector 4',
          description: 'Client inspector noted 2-day delay in soil compaction test certification delivery.',
          assignedTo: 'QA/QC Manager',
          status: 'UNDER_INVESTIGATION',
          resolutionNotes: 'Field QA team engaged third-party lab to expedite test certificate generation.',
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Seed',
          updatedBy: 'System Seed',
        },
      ]);

      await db.insert(phase67CustomerFeedback).values([
        {
          id: uuidv4(),
          customerId: cust1Id,
          customerName: 'Dubai Electricity & Water Authority (DEWA)',
          rating: 5,
          npsScore: 10,
          feedbackText: 'Exemplary project execution on the Jebel Ali Trunk Line. Outstanding QA/QC standards and safety compliance.',
          category: 'PROJECT_HANDOVER',
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Seed',
          updatedBy: 'System Seed',
        },
      ]);

      await db.insert(phase67CustomerMeetings).values([
        {
          id: uuidv4(),
          customerId: cust1Id,
          title: 'Q3 Steering Committee & Milestone Review',
          meetingType: 'PROGRESS_REVIEW',
          scheduledAt: '2026-08-20T10:00:00Z',
          location: 'DEWA Head Office / Teams Online',
          organizerName: 'Eng. Rashid Al-Maktoum',
          minutesOfMeeting: 'Quarterly review covering physical progress 78%, milestone cashflows, and HSE zero-LTI recognition.',
          status: 'SCHEDULED',
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Seed',
          updatedBy: 'System Seed',
        },
      ]);

      await db.insert(phase67PortalUsers).values([
        {
          id: uuidv4(),
          customerId: cust1Id,
          email: 'client.dewa@sitesyncpro.ae',
          fullName: 'Eng. Sultan Al-Nuaimi (DEWA Representative)',
          role: 'CLIENT_ADMIN',
          status: 'ACTIVE',
          lastLoginAt: now,
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Seed',
          updatedBy: 'System Seed',
        },
      ]);

      await db.insert(phase67CustomerProjects).values([
        {
          id: uuidv4(),
          customerId: cust1Id,
          projectId: 'PRJ-DEWA-2026-01',
          projectName: 'Jebel Ali Water Pipeline Main Distribution Network',
          contractValue: 125000000,
          completionPercentage: 78.5,
          status: 'ON_TRACK',
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Seed',
          updatedBy: 'System Seed',
        },
        {
          id: uuidv4(),
          customerId: cust2Id,
          projectId: 'PRJ-NAKHEEL-2026-04',
          projectName: 'Palm Jebel Ali Utilities Infrastructure Corridor',
          contractValue: 88000000,
          completionPercentage: 42.0,
          status: 'ON_TRACK',
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Seed',
          updatedBy: 'System Seed',
        },
      ]);

      await db.insert(phase67CustomerDocuments).values([
        {
          id: uuidv4(),
          customerId: cust1Id,
          title: 'Master EPC Contract Agreement - DEWA Trunk Pipeline',
          documentType: 'CONTRACT',
          fileUrl: '/documents/dewa_contract_master.pdf',
          fileSizeKb: 8420,
          isPortalVisible: true,
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Seed',
          updatedBy: 'System Seed',
        },
        {
          id: uuidv4(),
          customerId: cust1Id,
          title: 'Interim Payment Certificate IPC-07 Approved',
          documentType: 'INVOICE',
          fileUrl: '/documents/ipc_07_signed.pdf',
          fileSizeKb: 1450,
          isPortalVisible: true,
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Seed',
          updatedBy: 'System Seed',
        },
      ]);

    } catch (e) {
      console.warn('Error seeding initial CRM data:', e);
    }
  }

  // --- CUSTOMERS ---
  public async getAllCustomers() {
    await this.ensureCRMTablesExist();
    return db.select().from(phase67Customers).where(sql`is_deleted = FALSE`);
  }

  public async getCustomerById(id: string) {
    await this.ensureCRMTablesExist();
    const rows = await db.select().from(phase67Customers).where(sql`id = ${id} AND is_deleted = FALSE`);
    return rows[0] || null;
  }

  public async createCustomer(data: any) {
    await this.ensureCRMTablesExist();
    const now = new Date().toISOString();
    const id = uuidv4();
    const newCustomer = {
      id,
      code: data.code,
      companyName: data.companyName,
      tradingName: data.tradingName || null,
      industry: data.industry || 'CONSTRUCTION',
      customerType: data.customerType || 'GOVERNMENT',
      tier: data.tier || 'STRATEGIC',
      status: data.status || 'ACTIVE',
      taxRegistrationNo: data.taxRegistrationNo || null,
      creditLimit: data.creditLimit || 1000000,
      healthScore: 90,
      csatScore: 4.8,
      accountManager: data.accountManager || 'Executive Account Lead',
      createdAt: now,
      updatedAt: now,
      createdBy: data.createdBy || 'System Administrator',
      updatedBy: data.updatedBy || 'System Administrator',
      isDeleted: false,
    };
    await db.insert(phase67Customers).values(newCustomer);
    return newCustomer;
  }

  // --- LEADS ---
  public async getAllLeads() {
    await this.ensureCRMTablesExist();
    return db.select().from(phase67Leads).where(sql`is_deleted = FALSE`);
  }

  public async createLead(data: any) {
    await this.ensureCRMTablesExist();
    const now = new Date().toISOString();
    const id = uuidv4();
    const newLead = {
      id,
      leadNumber: data.leadNumber,
      companyName: data.companyName,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      source: data.source || 'TENDER_PORTAL',
      estimatedValue: data.estimatedValue || 0,
      status: data.status || 'NEW',
      assignedTo: data.assignedTo || 'Business Development Manager',
      notes: data.notes || null,
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
      isDeleted: false,
    };
    await db.insert(phase67Leads).values(newLead);
    return newLead;
  }

  // --- OPPORTUNITIES ---
  public async getAllOpportunities() {
    await this.ensureCRMTablesExist();
    return db.select().from(phase67Opportunities).where(sql`is_deleted = FALSE`);
  }

  public async createOpportunity(data: any) {
    await this.ensureCRMTablesExist();
    const now = new Date().toISOString();
    const id = uuidv4();
    const newOpp = {
      id,
      oppNumber: data.oppNumber,
      title: data.title,
      customerId: data.customerId || null,
      leadId: data.leadId || null,
      estimatedValue: data.estimatedValue || 0,
      probabilityPercent: data.probabilityPercent || 50,
      stage: data.stage || 'PROPOSAL_SUBMITTED',
      expectedClosingDate: data.expectedClosingDate,
      ownerName: data.ownerName || 'Senior BD Lead',
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
      isDeleted: false,
    };
    await db.insert(phase67Opportunities).values(newOpp);
    return newOpp;
  }

  // --- COMPLAINTS ---
  public async getAllComplaints() {
    await this.ensureCRMTablesExist();
    return db.select().from(phase67CustomerComplaints).where(sql`is_deleted = FALSE`);
  }

  public async createComplaint(data: any) {
    await this.ensureCRMTablesExist();
    const now = new Date().toISOString();
    const id = uuidv4();
    const newComplaint = {
      id,
      complaintNo: data.complaintNo,
      customerId: data.customerId,
      customerName: data.customerName,
      projectId: data.projectId || null,
      category: data.category || 'QUALITY',
      severity: data.severity || 'MEDIUM',
      subject: data.subject,
      description: data.description,
      assignedTo: data.assignedTo || 'QA/QC Manager',
      status: 'UNDER_INVESTIGATION',
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
      isDeleted: false,
    };
    await db.insert(phase67CustomerComplaints).values(newComplaint);
    return newComplaint;
  }

  // --- SUPPORT TICKETS ---
  public async getAllSupportTickets() {
    await this.ensureCRMTablesExist();
    return db.select().from(phase67SupportTickets).where(sql`is_deleted = FALSE`);
  }

  public async createSupportTicket(data: any) {
    await this.ensureCRMTablesExist();
    const now = new Date().toISOString();
    const id = uuidv4();
    const newTicket = {
      id,
      ticketNo: data.ticketNo,
      customerId: data.customerId,
      customerName: data.customerName,
      subject: data.subject,
      category: data.category || 'BILLING_INQUIRY',
      priority: data.priority || 'NORMAL',
      assignedTo: data.assignedTo || 'Customer Support Lead',
      status: 'OPEN',
      slaHours: data.slaHours || 24,
      slaBreached: false,
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
      isDeleted: false,
    };
    await db.insert(phase67SupportTickets).values(newTicket);
    return newTicket;
  }

  // --- TICKET COMMENTS ---
  public async getTicketComments(ticketId: string) {
    await this.ensureCRMTablesExist();
    return db.select().from(phase67TicketComments).where(sql`ticket_id = ${ticketId} AND is_deleted = FALSE`);
  }

  public async createTicketComment(data: any) {
    await this.ensureCRMTablesExist();
    const now = new Date().toISOString();
    const id = uuidv4();
    const newComment = {
      id,
      ticketId: data.ticketId,
      authorName: data.authorName,
      authorRole: data.authorRole || 'SUPPORT_AGENT',
      commentText: data.commentText,
      isInternalOnly: data.isInternalOnly || false,
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
      isDeleted: false,
    };
    await db.insert(phase67TicketComments).values(newComment);
    return newComment;
  }

  // --- FEEDBACK ---
  public async getAllFeedback() {
    await this.ensureCRMTablesExist();
    return db.select().from(phase67CustomerFeedback).where(sql`is_deleted = FALSE`);
  }

  public async createFeedback(data: any) {
    await this.ensureCRMTablesExist();
    const now = new Date().toISOString();
    const id = uuidv4();
    const newFeedback = {
      id,
      customerId: data.customerId,
      customerName: data.customerName,
      projectId: data.projectId || null,
      rating: data.rating || 5,
      npsScore: data.npsScore || 9,
      feedbackText: data.feedbackText || null,
      category: data.category || 'PROJECT_HANDOVER',
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
      isDeleted: false,
    };
    await db.insert(phase67CustomerFeedback).values(newFeedback);
    return newFeedback;
  }

  // --- MEETINGS ---
  public async getAllMeetings() {
    await this.ensureCRMTablesExist();
    return db.select().from(phase67CustomerMeetings).where(sql`is_deleted = FALSE`);
  }

  public async createMeeting(data: any) {
    await this.ensureCRMTablesExist();
    const now = new Date().toISOString();
    const id = uuidv4();
    const newMeeting = {
      id,
      customerId: data.customerId,
      title: data.title,
      meetingType: data.meetingType || 'PROGRESS_REVIEW',
      scheduledAt: data.scheduledAt,
      location: data.location || 'Site Sync HQ / Teams Online',
      organizerName: data.organizerName || 'Account Director',
      minutesOfMeeting: data.minutesOfMeeting || null,
      status: 'SCHEDULED',
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
      isDeleted: false,
    };
    await db.insert(phase67CustomerMeetings).values(newMeeting);
    return newMeeting;
  }

  // --- FOLLOWUPS ---
  public async getAllFollowups() {
    await this.ensureCRMTablesExist();
    return db.select().from(phase67Followups).where(sql`is_deleted = FALSE`);
  }

  public async createFollowup(data: any) {
    await this.ensureCRMTablesExist();
    const now = new Date().toISOString();
    const id = uuidv4();
    const newFollowup = {
      id,
      entityType: data.entityType,
      entityId: data.entityId,
      assignedTo: data.assignedTo,
      actionRequired: data.actionRequired,
      dueDate: data.dueDate,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
      createdBy: 'System Administrator',
      updatedBy: 'System Administrator',
      isDeleted: false,
    };
    await db.insert(phase67Followups).values(newFollowup);
    return newFollowup;
  }

  // --- PORTAL DATA ---
  public async getPortalDashboardData(customerId?: string) {
    await this.ensureCRMTablesExist();
    const targetCustId = customerId || 'cust-dewa-001';

    const customer = await this.getCustomerById(targetCustId);
    const projects = await db.select().from(phase67CustomerProjects).where(sql`customer_id = ${targetCustId} AND is_deleted = FALSE`);
    const tickets = await db.select().from(phase67SupportTickets).where(sql`customer_id = ${targetCustId} AND is_deleted = FALSE`);
    const documents = await db.select().from(phase67CustomerDocuments).where(sql`customer_id = ${targetCustId} AND is_deleted = FALSE AND is_portal_visible = TRUE`);
    const meetings = await db.select().from(phase67CustomerMeetings).where(sql`customer_id = ${targetCustId} AND is_deleted = FALSE`);

    // Simulated integrated finance & QA inspection data for portal
    const invoices = [
      { id: 'INV-2026-088', invoiceNumber: 'INV-DEWA-088', amount: 14500000, status: 'PAID', dueDate: '2026-07-31', paidDate: '2026-07-28' },
      { id: 'INV-2026-094', invoiceNumber: 'INV-DEWA-094', amount: 18200000, status: 'PENDING_APPROVAL', dueDate: '2026-08-30', paidDate: null },
    ];

    const inspectionStatus = [
      { id: 'INSP-101', title: 'Trench Excavation & Bedding Inspection Sector A', result: 'APPROVED', inspectDate: '2026-08-10', inspector: 'Third-Party Lab & QA Manager' },
      { id: 'INSP-102', title: 'Hydrostatic Pressure Test 1200mm Main Pipeline', result: 'APPROVED', inspectDate: '2026-08-12', inspector: 'DEWA Resident Engineer' },
    ];

    const approvals = [
      { id: 'APP-801', title: 'Variation Order VO-03 (Valve Pit Enclosure Redesign)', status: 'APPROVED', approvalDate: '2026-08-05', approvedBy: 'Executive Steering Committee' },
      { id: 'APP-802', title: 'Submittal Material Certificate HDPE Pipes Grade PE100', status: 'APPROVED', approvalDate: '2026-08-08', approvedBy: 'QA/QC Director' },
    ];

    return {
      customer,
      projects,
      tickets,
      documents,
      meetings,
      invoices,
      inspectionStatus,
      approvals,
    };
  }

  // --- CRM OVERVIEW STATS ---
  public async getCRMStats() {
    await this.ensureCRMTablesExist();
    const customers = await this.getAllCustomers();
    const leads = await this.getAllLeads();
    const opportunities = await this.getAllOpportunities();
    const tickets = await this.getAllSupportTickets();
    const complaints = await this.getAllComplaints();

    const activeCustomers = customers.filter(c => c.status === 'ACTIVE').length;
    const totalPipelineValue = opportunities.reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);
    const openTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
    const openComplaints = complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length;

    const avgCsat = customers.length > 0 
      ? (customers.reduce((acc, c) => acc + (c.csatScore || 0), 0) / customers.length).toFixed(2)
      : '4.85';

    return {
      totalCustomers: customers.length,
      activeCustomers,
      totalLeads: leads.length,
      openOpportunities: opportunities.length,
      totalPipelineValue,
      openTickets,
      openComplaints,
      averageCsatScore: parseFloat(avgCsat),
      portalActiveUsers: 14,
    };
  }
}
