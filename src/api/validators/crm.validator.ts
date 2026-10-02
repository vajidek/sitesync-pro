import { z } from 'zod';

export const CreateCustomerSchema = z.object({
  code: z.string().min(2, 'Customer code is required'),
  companyName: z.string().min(2, 'Company name is required'),
  tradingName: z.string().optional(),
  industry: z.string().default('CONSTRUCTION'),
  customerType: z.enum(['GOVERNMENT', 'PRIVATE_DEVELOPER', 'MAIN_CONTRACTOR', 'INFRASTRUCTURE']).default('GOVERNMENT'),
  tier: z.enum(['PLATINUM', 'STRATEGIC', 'KEY_ACCOUNT', 'STANDARD']).default('STRATEGIC'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PROSPECT']).default('ACTIVE'),
  taxRegistrationNo: z.string().optional(),
  creditLimit: z.number().nonnegative().default(1000000),
  accountManager: z.string().default('Executive Account Lead'),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();

export const CreateCustomerContactSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  fullName: z.string().min(2, 'Full name is required'),
  jobTitle: z.string().min(2, 'Job title is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(5, 'Phone is required'),
  isPrimary: z.boolean().default(false),
  department: z.string().optional().default('Procurement'),
});

export const CreateLeadSchema = z.object({
  leadNumber: z.string().min(2, 'Lead number is required'),
  companyName: z.string().min(2, 'Company name is required'),
  contactName: z.string().min(2, 'Contact name is required'),
  email: z.string().email(),
  phone: z.string().min(5),
  source: z.enum(['TENDER_PORTAL', 'DIRECT_ENQUIRY', 'REFERRAL', 'EXPO']).default('TENDER_PORTAL'),
  estimatedValue: z.number().nonnegative().default(0),
  status: z.enum(['NEW', 'QUALIFIED', 'UNQUALIFIED', 'CONVERTED']).default('NEW'),
  assignedTo: z.string().default('Business Development Manager'),
  notes: z.string().optional(),
});

export const CreateOpportunitySchema = z.object({
  oppNumber: z.string().min(2, 'Opportunity number is required'),
  title: z.string().min(2, 'Title is required'),
  customerId: z.string().optional(),
  leadId: z.string().optional(),
  estimatedValue: z.number().nonnegative().default(0),
  probabilityPercent: z.number().min(0).max(100).default(50),
  stage: z.enum(['QUALIFICATION', 'TECHNICAL_PROPOSAL', 'COMMERCIAL_BID', 'NEGOTIATION', 'WON', 'LOST']).default('TECHNICAL_PROPOSAL'),
  expectedClosingDate: z.string(),
  ownerName: z.string().default('Senior BD Lead'),
});

export const CreateComplaintSchema = z.object({
  complaintNo: z.string().min(2, 'Complaint number is required'),
  customerId: z.string().min(1, 'Customer ID is required'),
  customerName: z.string().min(2, 'Customer name is required'),
  projectId: z.string().optional(),
  category: z.enum(['QUALITY', 'SCHEDULE', 'BILLING', 'SAFETY', 'SERVICE']).default('QUALITY'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  subject: z.string().min(2, 'Subject is required'),
  description: z.string().min(5, 'Description is required'),
  assignedTo: z.string().default('QA/QC Manager'),
});

export const CreateSupportTicketSchema = z.object({
  ticketNo: z.string().min(2, 'Ticket number is required'),
  customerId: z.string().min(1, 'Customer ID is required'),
  customerName: z.string().min(2, 'Customer name is required'),
  subject: z.string().min(2, 'Subject is required'),
  category: z.enum(['BILLING_INQUIRY', 'DRAWING_APPROVAL', 'SITE_ACCESS', 'VARIATION', 'GENERAL']).default('BILLING_INQUIRY'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  assignedTo: z.string().default('Customer Support Lead'),
  slaHours: z.number().int().positive().default(24),
});

export const CreateTicketCommentSchema = z.object({
  ticketId: z.string().min(1, 'Ticket ID is required'),
  authorName: z.string().min(1, 'Author name is required'),
  authorRole: z.enum(['CLIENT', 'SUPPORT_AGENT', 'PROJECT_MANAGER']).default('SUPPORT_AGENT'),
  commentText: z.string().min(1, 'Comment text is required'),
  isInternalOnly: z.boolean().default(false),
});

export const CreateFeedbackSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  customerName: z.string().min(2, 'Customer name is required'),
  projectId: z.string().optional(),
  rating: z.number().min(1).max(5).default(5),
  npsScore: z.number().min(0).max(10).default(9),
  feedbackText: z.string().optional(),
  category: z.enum(['PROJECT_HANDOVER', 'MONTHLY_REVIEW', 'SUPPORT']).default('PROJECT_HANDOVER'),
});

export const CreateMeetingSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  title: z.string().min(2, 'Title is required'),
  meetingType: z.enum(['PROGRESS_REVIEW', 'COMMERCIAL_BID', 'DISPUTE_RESOLUTION', 'SITE_WALK']).default('PROGRESS_REVIEW'),
  scheduledAt: z.string(),
  location: z.string().default('Site Sync HQ / Teams Online'),
  organizerName: z.string().default('Account Director'),
  minutesOfMeeting: z.string().optional(),
});

export const CreateFollowupSchema = z.object({
  entityType: z.string().min(1, 'Entity type is required'),
  entityId: z.string().min(1, 'Entity ID is required'),
  assignedTo: z.string().min(1, 'Assigned to is required'),
  actionRequired: z.string().min(1, 'Action required is required'),
  dueDate: z.string(),
});

export const PortalLoginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(4, 'Password is required'),
});
