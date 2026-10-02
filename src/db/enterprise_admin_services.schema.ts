import { pgTable, text, integer, doublePrecision, boolean, jsonb } from 'drizzle-orm/pg-core';

// ============================================================================
// ENTERPRISE OFFICE ADMINISTRATION & CORPORATE SERVICES SCHEMA
// ============================================================================

export const adminVisitorsTable = pgTable('admin_visitors', {
  id: text('id').primaryKey(),
  passNumber: text('pass_number').notNull(),
  fullName: text('full_name').notNull(),
  company: text('company').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  hostEmployeeId: text('host_employee_id').notNull(),
  hostEmployeeName: text('host_employee_name').notNull(),
  hostDepartment: text('host_department').notNull(),
  purpose: text('purpose').notNull(), // MEETING, INTERVIEW, AUDIT, DELIVERY, CONTRACTOR, OTHER
  idProofType: text('id_proof_type').default('NATIONAL_ID'), // NATIONAL_ID, PASSPORT, DRIVING_LICENSE
  idProofNumber: text('id_proof_number'),
  badgeNumber: text('badge_number').notNull(),
  checkInTime: text('check_in_time').notNull(),
  checkOutTime: text('check_out_time'),
  status: text('status').notNull().default('CHECKED_IN'), // CHECKED_IN, CHECKED_OUT, OVERSTAY, CANCELLED
  hasVehicle: boolean('has_vehicle').default(false),
  vehiclePlateNumber: text('vehicle_plate_number'),
  ndaSigned: boolean('nda_signed').default(true),
  belongingsDeclared: text('belongings_declared'),
  securityNotes: text('security_notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const adminMeetingRoomsTable = pgTable('admin_meeting_rooms', {
  id: text('id').primaryKey(),
  roomCode: text('room_code').notNull().unique(),
  roomName: text('room_name').notNull(),
  floorLocation: text('floor_location').notNull(),
  capacity: integer('capacity').notNull(),
  facilities: jsonb('facilities').notNull(), // ['PROJECTOR', 'VIDEO_CONF', 'WHITEBOARD', 'SMART_TV', 'VOIP_PHONE']
  status: text('status').notNull().default('AVAILABLE'), // AVAILABLE, OCCUPIED, UNDER_MAINTENANCE
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const adminMeetingsTable = pgTable('admin_meetings', {
  id: text('id').primaryKey(),
  meetingCode: text('meeting_code').notNull(),
  roomId: text('room_id').notNull(),
  roomName: text('room_name').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  organizerId: text('organizer_id').notNull(),
  organizerName: text('organizer_name').notNull(),
  department: text('department').notNull(),
  meetingDate: text('meeting_date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  attendees: jsonb('attendees').notNull(), // array of { name, email, department, isExternal }
  agendaItems: jsonb('agenda_items').notNull(), // array of strings
  minutesOfMeeting: text('minutes_of_meeting'),
  actionItems: jsonb('action_items'), // array of { task, assignedTo, dueDate, status }
  status: text('status').notNull().default('SCHEDULED'), // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const adminNoticesTable = pgTable('admin_notices', {
  id: text('id').primaryKey(),
  noticeNumber: text('notice_number').notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(), // CIRCULAR, POLICY, ANNOUNCEMENT, EVENT, SAFETY_ALERT, HOLIDAY
  priority: text('priority').notNull().default('NORMAL'), // LOW, NORMAL, HIGH, URGENT
  targetAudience: text('target_audience').notNull().default('ALL'), // ALL, HO_STAFF, SITE_STAFF, MANAGERS, DEPT_SPECIFIC
  targetDepartment: text('target_department'),
  publishDate: text('publish_date').notNull(),
  expiryDate: text('expiry_date'),
  content: text('content').notNull(),
  authorId: text('author_id').notNull(),
  authorName: text('author_name').notNull(),
  authorRole: text('author_role').notNull(),
  attachmentUrl: text('attachment_url'),
  isPinned: boolean('is_pinned').default(false),
  requiresAcknowledgment: boolean('requires_acknowledgment').default(false),
  acknowledgmentsCount: integer('acknowledgments_count').default(0),
  status: text('status').notNull().default('PUBLISHED'), // DRAFT, PUBLISHED, ARCHIVED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const adminServiceRequestsTable = pgTable('admin_service_requests', {
  id: text('id').primaryKey(),
  requestNumber: text('request_number').notNull(),
  category: text('category').notNull(), // TRAVEL, VEHICLE_BOOKING, STATIONERY, COURIER, OFFICE_MAINTENANCE, ACCESS_CARD
  title: text('title').notNull(),
  description: text('description').notNull(),
  requesterId: text('requester_id').notNull(),
  requesterName: text('requester_name').notNull(),
  department: text('department').notNull(),
  priority: text('priority').notNull().default('NORMAL'), // LOW, NORMAL, HIGH, URGENT
  neededByDate: text('needed_by_date').notNull(),
  estimatedCost: doublePrecision('estimated_cost').default(0),
  requestDetails: jsonb('request_details').notNull(), // Specific payload for travel / vehicle / stationery items
  status: text('status').notNull().default('SUBMITTED'), // DRAFT, SUBMITTED, APPROVED, IN_FULFILLMENT, COMPLETED, REJECTED
  approvedBy: text('approved_by'),
  approvedAt: text('approved_at'),
  rejectionReason: text('rejection_reason'),
  adminRemarks: text('admin_remarks'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ============================================================================
// ENTERPRISE IT & DIGITAL ASSET MANAGEMENT (ITAM / ITSM) SCHEMA
// ============================================================================

export const itAssetsTable = pgTable('it_assets', {
  id: text('id').primaryKey(),
  assetTag: text('asset_tag').notNull().unique(),
  assetName: text('asset_name').notNull(),
  category: text('category').notNull(), // LAPTOP, WORKSTATION, SERVER, NETWORK_SWITCH, FIREWALL, PRINTER, MOBILE_DEVICE, MONITOR, STORAGE
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  serialNumber: text('serial_number').notNull(),
  macAddress: text('mac_address'),
  ipAddress: text('ip_address'),
  operatingSystem: text('operating_system'),
  specifications: jsonb('specifications').notNull(), // { cpu, ram, storage, display }
  assignedToEmployeeId: text('assigned_to_employee_id'),
  assignedToEmployeeName: text('assigned_to_employee_name'),
  department: text('department'),
  location: text('location').notNull(),
  purchaseDate: text('purchase_date').notNull(),
  purchaseCost: doublePrecision('purchase_cost').notNull(),
  warrantyExpiryDate: text('warranty_expiry_date').notNull(),
  status: text('status').notNull().default('ALLOCATED'), // ALLOCATED, IN_STORE, UNDER_REPAIR, RETIRED, LOST
  condition: text('condition').notNull().default('GOOD'), // EXCELLENT, GOOD, FAIR, POOR
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const itSoftwareLicensesTable = pgTable('it_software_licenses', {
  id: text('id').primaryKey(),
  licenseCode: text('license_code').notNull().unique(),
  softwareName: text('software_name').notNull(),
  publisher: text('publisher').notNull(), // Microsoft, Autodesk, Oracle, Adobe, Atlassian, Google, etc.
  category: text('category').notNull(), // CAD_BIM, ERP_FINANCE, PRODUCTIVITY, SECURITY, OS, CLOUD_SAAS, DEV_TOOLS
  licenseType: text('license_type').notNull(), // PERPETUAL, ANNUAL_SUBSCRIPTION, MONTHLY_SUBSCRIPTION, OPEN_SOURCE
  totalSeats: integer('total_seats').notNull(),
  allocatedSeats: integer('allocated_seats').notNull().default(0),
  licenseKey: text('license_key'),
  purchaseDate: text('purchase_date').notNull(),
  renewalDate: text('renewal_date'),
  annualCost: doublePrecision('annual_cost').notNull().default(0),
  allocatedUsers: jsonb('allocated_users').notNull().default([]), // array of { userId, userName, email, assignedDate }
  complianceStatus: text('compliance_status').notNull().default('COMPLIANT'), // COMPLIANT, OVERALLOCATED, EXPIRING_SOON, EXPIRED
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, SUSPENDED, EXPIRED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const itServiceTicketsTable = pgTable('it_service_tickets', {
  id: text('id').primaryKey(),
  ticketNumber: text('ticket_number').notNull().unique(),
  title: text('title').notNull(),
  category: text('category').notNull(), // HARDWARE_FAILURE, SOFTWARE_INSTALL, NETWORK_CONNECTIVITY, EMAIL_COLLAB, ACCESS_PRIVILEGE, SECURITY_INCIDENT
  priority: text('priority').notNull().default('MEDIUM'), // LOW, MEDIUM, HIGH, CRITICAL
  slaHours: integer('sla_hours').notNull().default(24),
  requesterId: text('requester_id').notNull(),
  requesterName: text('requester_name').notNull(),
  requesterEmail: text('requester_email').notNull(),
  department: text('department').notNull(),
  assignedTechnicianId: text('assigned_technician_id'),
  assignedTechnicianName: text('assigned_technician_name'),
  description: text('description').notNull(),
  status: text('status').notNull().default('OPEN'), // OPEN, IN_PROGRESS, WAITING_USER, RESOLVED, CLOSED
  resolutionNotes: text('resolution_notes'),
  resolvedAt: text('resolved_at'),
  slaBreached: boolean('sla_breached').default(false),
  activityLog: jsonb('activity_log').notNull().default([]), // array of { author, message, timestamp }
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const itAccessRequestsTable = pgTable('it_access_requests', {
  id: text('id').primaryKey(),
  requestNumber: text('request_number').notNull().unique(),
  requestType: text('request_type').notNull(), // NEW_ACCOUNT, ROLE_ELEVATION, VPN_ACCESS, FOLDER_SHARE, SOFTWARE_ACCESS
  targetSystem: text('target_system').notNull(), // ERP, SCADA_IOT, EDMS_DOCS, ACTIVE_DIRECTORY, VPN, EMAIL
  requestedRole: text('requested_role').notNull(),
  requesterId: text('requester_id').notNull(),
  requesterName: text('requester_name').notNull(),
  beneficiaryEmployeeId: text('beneficiary_employee_id').notNull(),
  beneficiaryEmployeeName: text('beneficiary_employee_name').notNull(),
  businessJustification: text('business_justification').notNull(),
  durationDays: integer('duration_days').default(365), // 0 = permanent
  status: text('status').notNull().default('PENDING_APPROVAL'), // PENDING_APPROVAL, APPROVED, PROVISIONED, REJECTED, REVOKED
  approvedBy: text('approved_by'),
  approvedAt: text('approved_at'),
  provisionedBy: text('provisioned_by'),
  provisionedAt: text('provisioned_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ============================================================================
// ENTERPRISE COMMERCIAL, TENDERS & SUBCONTRACT MANAGEMENT SCHEMA
// ============================================================================

export const commercialTendersTable = pgTable('commercial_tenders', {
  id: text('id').primaryKey(),
  tenderRefNumber: text('tender_ref_number').notNull().unique(),
  tenderTitle: text('tender_title').notNull(),
  clientAuthority: text('client_authority').notNull(),
  clientType: text('client_type').notNull(), // GOVERNMENT, SEMI_GOV, PRIVATE, MULTINATIONAL, INFRA_DEVELOPER
  sector: text('sector').notNull(), // WATER_SANITATION, HIGHWAY_ROAD, METRO_RAIL, COMMERCIAL_BUILDING, POWER_ENERGY, TELECOM
  tenderType: text('tender_type').notNull(), // EPC_TURNKEY, ITEM_RATE_BOQ, DESIGN_BUILD, PMC_CONSULTANCY, SUPPLY_INSTALL
  estimatedProjectValue: doublePrecision('estimated_project_value').notNull(),
  currency: text('currency').notNull().default('INR'),
  emdAmount: doublePrecision('emd_amount').notNull().default(0), // Earned Money Deposit
  tenderFee: doublePrecision('tender_fee').notNull().default(0),
  emdMode: text('emd_mode').default('BANK_GUARANTEE'), // BANK_GUARANTEE, DD, ONLINE_TRANSFER, EXEMPTED
  publicationDate: text('publication_date').notNull(),
  preBidMeetingDate: text('pre_bid_meeting_date'),
  submissionDeadline: text('submission_deadline').notNull(),
  bidValidityDays: integer('bid_validity_days').default(120),
  eligibilityCriteria: text('eligibility_criteria'),
  technicalScoreThreshold: doublePrecision('technical_score_threshold').default(75.0),
  quotedBidAmount: doublePrecision('quoted_bid_amount'),
  expectedGrossMarginPercent: doublePrecision('expected_gross_margin_percent').default(14.5),
  bidManagerId: text('bid_manager_id').notNull(),
  bidManagerName: text('bid_manager_name').notNull(),
  status: text('status').notNull().default('IN_ESTIMATION'), // DISCOVERED, IN_ESTIMATION, UNDER_MANAGEMENT_REVIEW, BID_SUBMITTED, EVALUATION_STAGE, AWARDED, LOST, CANCELLED
  awardDetails: jsonb('award_details'), // { contractNumber, awardedValue, effectiveDate, remarks }
  documents: jsonb('documents').notNull().default([]), // array of { title, type, url, uploadDate }
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const commercialRateAnalysesTable = pgTable('commercial_rate_analyses', {
  id: text('id').primaryKey(),
  analysisCode: text('analysis_code').notNull().unique(),
  tenderId: text('tender_id'),
  itemCode: text('item_code').notNull(),
  itemDescription: text('item_description').notNull(),
  unit: text('unit').notNull(), // cum, sq.m, rmt, MT, kg, nos, set
  materialCostPerUnit: doublePrecision('material_cost_per_unit').notNull().default(0),
  laborCostPerUnit: doublePrecision('labor_cost_per_unit').notNull().default(0),
  machineryCostPerUnit: doublePrecision('machinery_cost_per_unit').notNull().default(0),
  subcontractCostPerUnit: doublePrecision('subcontract_cost_per_unit').notNull().default(0),
  overheadPercent: doublePrecision('overhead_percent').notNull().default(10.0),
  profitPercent: doublePrecision('profit_percent').notNull().default(12.0),
  netRatePerUnit: doublePrecision('net_rate_per_unit').notNull(),
  quotedRatePerUnit: doublePrecision('quoted_rate_per_unit').notNull(),
  componentsBreakdown: jsonb('components_breakdown').notNull(), // line items for cement, sand, steel, labor gang, plant hours
  status: text('status').notNull().default('APPROVED'), // DRAFT, REVIEW_PENDING, APPROVED, REVISED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const commercialSubcontractsTable = pgTable('commercial_subcontracts', {
  id: text('id').primaryKey(),
  agreementNumber: text('agreement_number').notNull().unique(),
  subcontractorName: text('subcontractor_name').notNull(),
  subcontractorCode: text('subcontractor_code').notNull(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name').notNull(),
  packageTitle: text('package_title').notNull(),
  tradeCategory: text('trade_category').notNull(), // CIVIL_MASONRY, REINFORCEMENT_TMT, PIPELINE_TRENCHING, MEP_ELECTRICAL, STRUCTURAL_FABRICATION, WATERPROOFING
  contractType: text('contract_type').notNull().default('ITEM_RATE_BOQ'), // ITEM_RATE_BOQ, LUMPSUM_MILESTONE, COST_PLUS
  contractValue: doublePrecision('contract_value').notNull(),
  retentionPercent: doublePrecision('retention_percent').notNull().default(5.0),
  mobilizationAdvancePercent: doublePrecision('mobilization_advance_percent').default(10.0),
  mobilizationAdvancePaid: doublePrecision('mobilization_advance_paid').default(0),
  mobilizationAdvanceRecovered: doublePrecision('mobilization_advance_recovered').default(0),
  totalBilledAmount: doublePrecision('total_billed_amount').default(0),
  totalCertifiedAmount: doublePrecision('total_certified_amount').default(0),
  totalPaidAmount: doublePrecision('total_paid_amount').default(0),
  totalRetentionWithheld: doublePrecision('total_retention_withheld').default(0),
  startDate: text('start_date').notNull(),
  completionDate: text('completion_date').notNull(),
  status: text('status').notNull().default('ACTIVE'), // DRAFT, ACTIVE, SUSPENDED, SUBSTANTIALLY_COMPLETE, CLOSED, TERMINATED
  performanceRating: doublePrecision('performance_rating').default(4.2), // out of 5.0
  complianceDocumentsVerified: boolean('compliance_documents_verified').default(true),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
