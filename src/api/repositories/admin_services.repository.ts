import { v4 as uuidv4 } from 'uuid';

export interface AdminVisitor {
  id: string;
  passNumber: string;
  fullName: string;
  company: string;
  phone: string;
  email?: string;
  hostEmployeeId: string;
  hostEmployeeName: string;
  hostDepartment: string;
  purpose: string;
  idProofType: string;
  idProofNumber?: string;
  badgeNumber: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'CHECKED_IN' | 'CHECKED_OUT' | 'OVERSTAY' | 'CANCELLED';
  hasVehicle: boolean;
  vehiclePlateNumber?: string;
  ndaSigned: boolean;
  belongingsDeclared?: string;
  securityNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminMeetingRoom {
  id: string;
  roomCode: string;
  roomName: string;
  floorLocation: string;
  capacity: number;
  facilities: string[];
  status: 'AVAILABLE' | 'OCCUPIED' | 'UNDER_MAINTENANCE';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminMeeting {
  id: string;
  meetingCode: string;
  roomId: string;
  roomName: string;
  title: string;
  description?: string;
  organizerId: string;
  organizerName: string;
  department: string;
  meetingDate: string;
  startTime: string;
  endTime: string;
  attendees: Array<{ name: string; email: string; department?: string; isExternal?: boolean }>;
  agendaItems: string[];
  minutesOfMeeting?: string;
  actionItems?: Array<{ task: string; assignedTo: string; dueDate: string; status: 'PENDING' | 'COMPLETED' }>;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface AdminNotice {
  id: string;
  noticeNumber: string;
  title: string;
  category: 'CIRCULAR' | 'POLICY' | 'ANNOUNCEMENT' | 'EVENT' | 'SAFETY_ALERT' | 'HOLIDAY';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  targetAudience: string;
  targetDepartment?: string;
  publishDate: string;
  expiryDate?: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  attachmentUrl?: string;
  isPinned: boolean;
  requiresAcknowledgment: boolean;
  acknowledgmentsCount: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface AdminServiceRequest {
  id: string;
  requestNumber: string;
  category: 'TRAVEL' | 'VEHICLE_BOOKING' | 'STATIONERY' | 'COURIER' | 'OFFICE_MAINTENANCE' | 'ACCESS_CARD';
  title: string;
  description: string;
  requesterId: string;
  requesterName: string;
  department: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  neededByDate: string;
  estimatedCost: number;
  requestDetails: Record<string, any>;
  status: 'SUBMITTED' | 'APPROVED' | 'IN_FULFILLMENT' | 'COMPLETED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  adminRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

export class AdminServicesRepository {
  private static instance: AdminServicesRepository;

  private visitors: AdminVisitor[] = [
    {
      id: 'vis-001',
      passNumber: 'VP-2026-0841',
      fullName: 'Vikram Sengupta',
      company: 'Holcim ReadyMix Concrete Ltd',
      phone: '+91 98450 12345',
      email: 'vikram.s@holcim.com',
      hostEmployeeId: 'emp-104',
      hostEmployeeName: 'Rajesh Nair',
      hostDepartment: 'Procurement & Stores',
      purpose: 'MEETING',
      idProofType: 'DRIVING_LICENSE',
      idProofNumber: 'KL-07-2018-98124',
      badgeNumber: 'B-04',
      checkInTime: new Date(Date.now() - 2 * 3600000).toISOString(),
      status: 'CHECKED_IN',
      hasVehicle: true,
      vehiclePlateNumber: 'KL-07-CD-4190',
      ndaSigned: true,
      belongingsDeclared: 'Laptop (Dell Latitude serial DL-98104)',
      securityNotes: 'Escorted to 3rd Floor Conference Room A',
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 'vis-002',
      passNumber: 'VP-2026-0840',
      fullName: 'Dr. Tariq Al Mansoori',
      company: 'TÜV SÜD Middle East Quality Certifications',
      phone: '+971 52 984 7120',
      email: 'tariq.mansoori@tuvsud.com',
      hostEmployeeId: 'emp-102',
      hostEmployeeName: 'Priya Sharma',
      hostDepartment: 'QA/QC & Engineering',
      purpose: 'AUDIT',
      idProofType: 'PASSPORT',
      badgeNumber: 'B-12',
      checkInTime: new Date(Date.now() - 4 * 3600000).toISOString(),
      checkOutTime: new Date(Date.now() - 30 * 60000).toISOString(),
      status: 'CHECKED_OUT',
      hasVehicle: false,
      ndaSigned: true,
      belongingsDeclared: 'Calibration gauges & testing meter kit',
      createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: 'vis-003',
      passNumber: 'VP-2026-0839',
      fullName: 'Ahmad bin Zayed',
      company: 'Schneider Electric Infrastructure Div',
      phone: '+971 50 441 2981',
      email: 'ahmad.zayed@se.com',
      hostEmployeeId: 'emp-101',
      hostEmployeeName: 'Abdul Vajid EK',
      hostDepartment: 'Executive Operations',
      purpose: 'CONTRACTOR',
      idProofType: 'NATIONAL_ID',
      badgeNumber: 'B-01',
      checkInTime: new Date(Date.now() - 5 * 3600000).toISOString(),
      status: 'CHECKED_IN',
      hasVehicle: true,
      vehiclePlateNumber: 'DXB-K-55219',
      ndaSigned: true,
      securityNotes: 'Substation SCADA automation review meeting',
      createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    },
  ];

  private rooms: AdminMeetingRoom[] = [
    {
      id: 'room-001',
      roomCode: 'CR-BOARD',
      roomName: 'Executive Boardroom',
      floorLocation: '4th Floor, Corporate Tower',
      capacity: 22,
      facilities: ['PROJECTOR', 'VIDEO_CONF', 'SMART_TV', 'VOIP_PHONE', 'MOTORIZED_BLINDS'],
      status: 'AVAILABLE',
      notes: 'Reserved primarily for Board & Executive Leadership meetings',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'room-002',
      roomCode: 'CR-INNOVATION',
      roomName: 'Innovation Hub & War Room',
      floorLocation: '3rd Floor, Engineering Wing',
      capacity: 14,
      facilities: ['VIDEO_CONF', 'WHITEBOARD', 'SMART_TV', 'BARCO_CLICKSHARE'],
      status: 'OCCUPIED',
      notes: 'BIM modeling, SCADA telemetry review and project coordination',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'room-003',
      roomCode: 'CR-CON-A',
      roomName: 'Conference Room Alpha',
      floorLocation: '2nd Floor, Operations',
      capacity: 10,
      facilities: ['PROJECTOR', 'WHITEBOARD', 'VOIP_PHONE'],
      status: 'AVAILABLE',
      notes: 'Standard department and vendor negotiations',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'room-004',
      roomCode: 'CR-TRAINING',
      roomName: 'HSE & Technical Training Auditorium',
      floorLocation: 'Ground Floor, Logistics Center',
      capacity: 45,
      facilities: ['DUAL_PROJECTORS', 'MIC_SYSTEM', 'VIDEO_CONF'],
      status: 'AVAILABLE',
      notes: 'Toolbox talks, site safety induction & ERP training sessions',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  private meetings: AdminMeeting[] = [
    {
      id: 'mtg-101',
      meetingCode: 'MTG-2026-041',
      roomId: 'room-002',
      roomName: 'Innovation Hub & War Room',
      title: 'Metro Rail Viaduct 4B Project Execution & Safety Sync',
      description: 'Review structural pier foundation milestones, subcontracts billing & site HSE audits',
      organizerId: 'emp-101',
      organizerName: 'Abdul Vajid EK',
      department: 'Executive Operations',
      meetingDate: new Date().toISOString().split('T')[0],
      startTime: '10:30',
      endTime: '12:00',
      attendees: [
        { name: 'Abdul Vajid EK', email: 'vajidek1@gmail.com', department: 'Executive Management' },
        { name: 'Priya Sharma', email: 'priya.s@sitesyncpro.com', department: 'QA/QC' },
        { name: 'Rajesh Nair', email: 'rajesh.n@sitesyncpro.com', department: 'Procurement' },
        { name: 'Ahmad bin Zayed', email: 'ahmad.zayed@se.com', isExternal: true },
      ],
      agendaItems: [
        'Review pier casting progress against Primavera P6 baseline',
        'Address reinforcement steel supply variance from Jindal Steel',
        'HSE Near-Miss report mitigation on crane lifting zones',
        'Approval of Subcontractor Interim Payment Certificate No. 4',
      ],
      minutesOfMeeting: 'Meeting commenced at 10:35. QA/QC confirmed micro-silica concrete test cubes achieved 42 MPa at 14 days, exceeding specified 35 MPa. Procurement reported steel delivery on track for Thursday.',
      actionItems: [
        { task: 'Issue revised lifting safety permit to crane contractor', assignedTo: 'Priya Sharma', dueDate: '2026-09-21', status: 'COMPLETED' },
        { task: 'Certify subcontractor Measurement Book entries for Pier 18', assignedTo: 'Rajesh Nair', dueDate: '2026-09-22', status: 'PENDING' },
      ],
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mtg-102',
      meetingCode: 'MTG-2026-042',
      roomId: 'room-001',
      roomName: 'Executive Boardroom',
      title: 'Enterprise ERP Phase 80 Governance & Resource Review',
      description: 'Quarterly financial budget variance, commercial tender bids, and IT security audit',
      organizerId: 'emp-admin',
      organizerName: 'System Administrator',
      department: 'Corporate Administration',
      meetingDate: new Date().toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '15:30',
      attendees: [
        { name: 'Chief Executive Officer', email: 'ceo@sitesyncpro.com' },
        { name: 'Head of Finance', email: 'finance@sitesyncpro.com' },
        { name: 'Lead Architect - Abdul Vajid EK', email: 'vajidek1@gmail.com' },
      ],
      agendaItems: [
        'Review Q3 consolidated profit & loss statements across all 3 business divisions',
        'Evaluate 2 new EPC infrastructure tenders for smart water grid submission',
        'Approve annual IT hardware lifecycle replacement budget',
      ],
      status: 'SCHEDULED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  private notices: AdminNotice[] = [
    {
      id: 'not-001',
      noticeNumber: 'CIR-2026-018',
      title: 'Company Statutory Policy Update: Biometric Attendance & Shift Guidelines',
      category: 'CIRCULAR',
      priority: 'HIGH',
      targetAudience: 'ALL',
      publishDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
      expiryDate: '2026-12-31',
      content: 'All direct employees and site engineers are hereby informed that morning punch verification must be completed prior to 08:45 AM. For night shift transitions crossing midnight, the automated overnight shift algorithm will reconcile check-out punches on the following morning duty log.',
      authorId: 'emp-hr',
      authorName: 'HR & Personnel Directorate',
      authorRole: 'Head of Human Resources',
      isPinned: true,
      requiresAcknowledgment: true,
      acknowledgmentsCount: 84,
      status: 'PUBLISHED',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'not-002',
      noticeNumber: 'CIR-2026-019',
      title: 'HSE Safety Alert: Mandatory Fall-Arrest Harness Check for Viaduct & Scaffolding Works',
      category: 'SAFETY_ALERT',
      priority: 'URGENT',
      targetAudience: 'SITE_STAFF',
      targetDepartment: 'Civil & Structural Engineering',
      publishDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
      expiryDate: '2026-10-31',
      content: 'Following monsoon wind advisories across regional infrastructure sites, all double-lanyard harnesses, lifeline anchors, and edge protection toe-boards must undergo 100% pre-shift inspection before work at height commences. Safety officers have full authority to issue stop-work orders for any non-compliance.',
      authorId: 'emp-hse',
      authorName: 'Enterprise HSE Council',
      authorRole: 'Chief Safety Officer',
      isPinned: true,
      requiresAcknowledgment: true,
      acknowledgmentsCount: 112,
      status: 'PUBLISHED',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'not-003',
      noticeNumber: 'CIR-2026-020',
      title: 'Corporate Travel & Site Fleet Vehicle Booking Protocol Revision',
      category: 'POLICY',
      priority: 'NORMAL',
      targetAudience: 'ALL',
      publishDate: new Date().toISOString().split('T')[0],
      expiryDate: '2026-12-31',
      content: 'Requests for corporate utility pickups, inter-site travel, and long-distance technical team transfers must be registered through the Corporate Services Request Portal at least 24 hours in advance to optimize fleet dispatch and fuel logging.',
      authorId: 'emp-admin',
      authorName: 'General Administration Dept',
      authorRole: 'Admin Services Manager',
      isPinned: false,
      requiresAcknowledgment: false,
      acknowledgmentsCount: 42,
      status: 'PUBLISHED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  private serviceRequests: AdminServiceRequest[] = [
    {
      id: 'req-001',
      requestNumber: 'SR-2026-092',
      category: 'VEHICLE_BOOKING',
      title: 'Site Inspection Vehicle Dispatch for Quality Audit Team',
      description: 'Need Toyota Hilux 4x4 pickup for transporting QA/QC core drilling equipment to Metro Viaduct Segment 4B',
      requesterId: 'emp-102',
      requesterName: 'Priya Sharma',
      department: 'QA/QC & Testing',
      priority: 'HIGH',
      neededByDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      estimatedCost: 180,
      requestDetails: {
        destination: 'Metro Viaduct Pier 14 to Pier 28',
        passengersCount: 3,
        vehicleTypePreferred: '4x4 Double Cab Pickup',
        durationHours: 8,
        equipmentToCarry: 'Core drilling machine, concrete rebound hammers, sample cylinders',
      },
      status: 'APPROVED',
      approvedBy: 'Abdul Vajid EK',
      approvedAt: new Date().toISOString(),
      adminRemarks: 'Assigned Fleet Vehicle #FL-108 with Driver Ramesh. Fuel card authorized.',
      createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'req-002',
      requestNumber: 'SR-2026-093',
      category: 'TRAVEL',
      title: 'Corporate Flight & Hotel Booking: Pre-Bid Tender Conference',
      description: 'Round-trip airfare and 2-night lodging for senior bidding team attending client pre-bid meeting in New Delhi',
      requesterId: 'emp-104',
      requesterName: 'Rajesh Nair',
      department: 'Commercial & Tendering',
      priority: 'URGENT',
      neededByDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      estimatedCost: 850,
      requestDetails: {
        departureCity: 'Kochi (COK)',
        arrivalCity: 'New Delhi (DEL)',
        departureDate: '2026-09-23',
        returnDate: '2026-09-25',
        passengers: ['Rajesh Nair', 'K. V. Mohandas (Chief Estimator)'],
        hotelPreference: 'Near Central Secretariat / Ministry of Jal Shakti',
      },
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'req-003',
      requestNumber: 'SR-2026-094',
      category: 'STATIONERY',
      title: 'Field Engineering Drawing Plotter Paper & Survey Consumables',
      description: 'A0 & A1 CAD plotter paper rolls, heavy-duty waterproof site binders, and marker pens for Site Office 2',
      requesterId: 'emp-105',
      requesterName: 'Suresh Menon',
      department: 'Site Engineering & Survey',
      priority: 'NORMAL',
      neededByDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      estimatedCost: 120,
      requestDetails: {
        items: [
          { name: 'HP 80gsm A0 Plotter Rolls (914mm x 50m)', qty: 4, unit: 'Roll' },
          { name: 'Waterproof A4 Site Observation Pads', qty: 20, unit: 'Pcs' },
          { name: 'Fluorescent Survey Marking Spray (Orange & White)', qty: 12, unit: 'Cans' },
        ],
      },
      status: 'IN_FULFILLMENT',
      approvedBy: 'Admin Directorate',
      approvedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      adminRemarks: 'Order placed with Office Depot Corporate Account. Delivery scheduled tomorrow 11 AM.',
      createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  public static getInstance(): AdminServicesRepository {
    if (!AdminServicesRepository.instance) {
      AdminServicesRepository.instance = new AdminServicesRepository();
    }
    return AdminServicesRepository.instance;
  }

  // --- Visitors API ---
  public async getVisitors(): Promise<AdminVisitor[]> {
    return this.visitors;
  }

  public async createVisitor(data: Partial<AdminVisitor>): Promise<AdminVisitor> {
    const count = this.visitors.length + 1;
    const now = new Date().toISOString();
    const newRecord: AdminVisitor = {
      id: `vis-${uuidv4().substring(0, 8)}`,
      passNumber: `VP-2026-${String(840 + count).padStart(4, '0')}`,
      fullName: data.fullName || 'Anonymous Visitor',
      company: data.company || 'Independent',
      phone: data.phone || '+91 00000 00000',
      email: data.email,
      hostEmployeeId: data.hostEmployeeId || 'emp-admin',
      hostEmployeeName: data.hostEmployeeName || 'Duty Officer',
      hostDepartment: data.hostDepartment || 'General Office',
      purpose: data.purpose || 'MEETING',
      idProofType: data.idProofType || 'NATIONAL_ID',
      idProofNumber: data.idProofNumber,
      badgeNumber: data.badgeNumber || `B-${String(count).padStart(2, '0')}`,
      checkInTime: now,
      status: 'CHECKED_IN',
      hasVehicle: Boolean(data.hasVehicle),
      vehiclePlateNumber: data.vehiclePlateNumber,
      ndaSigned: data.ndaSigned !== undefined ? data.ndaSigned : true,
      belongingsDeclared: data.belongingsDeclared,
      securityNotes: data.securityNotes,
      createdAt: now,
      updatedAt: now,
    };
    this.visitors.unshift(newRecord);
    return newRecord;
  }

  public async checkOutVisitor(id: string): Promise<AdminVisitor | null> {
    const visitor = this.visitors.find((v) => v.id === id);
    if (!visitor) return null;
    visitor.status = 'CHECKED_OUT';
    visitor.checkOutTime = new Date().toISOString();
    visitor.updatedAt = new Date().toISOString();
    return visitor;
  }

  // --- Meeting Rooms & Meetings API ---
  public async getMeetingRooms(): Promise<AdminMeetingRoom[]> {
    return this.rooms;
  }

  public async getMeetings(): Promise<AdminMeeting[]> {
    return this.meetings;
  }

  public async createMeeting(data: Partial<AdminMeeting>): Promise<AdminMeeting> {
    const count = this.meetings.length + 1;
    const now = new Date().toISOString();
    const room = this.rooms.find((r) => r.id === data.roomId) || this.rooms[0];
    const newMeeting: AdminMeeting = {
      id: `mtg-${uuidv4().substring(0, 8)}`,
      meetingCode: `MTG-2026-${String(40 + count).padStart(3, '0')}`,
      roomId: room.id,
      roomName: room.roomName,
      title: data.title || 'General Department Meeting',
      description: data.description,
      organizerId: data.organizerId || 'emp-user',
      organizerName: data.organizerName || 'Meeting Organizer',
      department: data.department || 'Operations',
      meetingDate: data.meetingDate || now.split('T')[0],
      startTime: data.startTime || '10:00',
      endTime: data.endTime || '11:00',
      attendees: data.attendees || [],
      agendaItems: data.agendaItems || ['Discussion of operational priorities'],
      minutesOfMeeting: data.minutesOfMeeting,
      actionItems: data.actionItems || [],
      status: 'SCHEDULED',
      createdAt: now,
      updatedAt: now,
    };
    this.meetings.unshift(newMeeting);
    return newMeeting;
  }

  public async updateMeetingMoM(id: string, minutes: string, actionItems?: any[]): Promise<AdminMeeting | null> {
    const meeting = this.meetings.find((m) => m.id === id);
    if (!meeting) return null;
    meeting.minutesOfMeeting = minutes;
    if (actionItems) meeting.actionItems = actionItems;
    meeting.status = 'COMPLETED';
    meeting.updatedAt = new Date().toISOString();
    return meeting;
  }

  // --- Notices API ---
  public async getNotices(): Promise<AdminNotice[]> {
    return this.notices;
  }

  public async createNotice(data: Partial<AdminNotice>): Promise<AdminNotice> {
    const count = this.notices.length + 1;
    const now = new Date().toISOString();
    const newNotice: AdminNotice = {
      id: `not-${uuidv4().substring(0, 8)}`,
      noticeNumber: `CIR-2026-${String(20 + count).padStart(3, '0')}`,
      title: data.title || 'Official Company Notice',
      category: data.category || 'CIRCULAR',
      priority: data.priority || 'NORMAL',
      targetAudience: data.targetAudience || 'ALL',
      targetDepartment: data.targetDepartment,
      publishDate: data.publishDate || now.split('T')[0],
      expiryDate: data.expiryDate,
      content: data.content || '',
      authorId: data.authorId || 'emp-admin',
      authorName: data.authorName || 'Corporate Administration',
      authorRole: data.authorRole || 'Executive Office',
      attachmentUrl: data.attachmentUrl,
      isPinned: Boolean(data.isPinned),
      requiresAcknowledgment: Boolean(data.requiresAcknowledgment),
      acknowledgmentsCount: 0,
      status: 'PUBLISHED',
      createdAt: now,
      updatedAt: now,
    };
    this.notices.unshift(newNotice);
    return newNotice;
  }

  public async acknowledgeNotice(id: string): Promise<AdminNotice | null> {
    const notice = this.notices.find((n) => n.id === id);
    if (!notice) return null;
    notice.acknowledgmentsCount += 1;
    notice.updatedAt = new Date().toISOString();
    return notice;
  }

  // --- Service Requests API ---
  public async getServiceRequests(): Promise<AdminServiceRequest[]> {
    return this.serviceRequests;
  }

  public async createServiceRequest(data: Partial<AdminServiceRequest>): Promise<AdminServiceRequest> {
    const count = this.serviceRequests.length + 1;
    const now = new Date().toISOString();
    const newReq: AdminServiceRequest = {
      id: `req-${uuidv4().substring(0, 8)}`,
      requestNumber: `SR-2026-${String(90 + count).padStart(3, '0')}`,
      category: data.category || 'GENERAL' as any,
      title: data.title || 'Administrative Service Request',
      description: data.description || '',
      requesterId: data.requesterId || 'emp-user',
      requesterName: data.requesterName || 'Staff Member',
      department: data.department || 'Operations',
      priority: data.priority || 'NORMAL',
      neededByDate: data.neededByDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      estimatedCost: data.estimatedCost || 0,
      requestDetails: data.requestDetails || {},
      status: 'SUBMITTED',
      createdAt: now,
      updatedAt: now,
    };
    this.serviceRequests.unshift(newReq);
    return newReq;
  }

  public async updateServiceRequestStatus(
    id: string,
    status: AdminServiceRequest['status'],
    approverName: string,
    remarks?: string
  ): Promise<AdminServiceRequest | null> {
    const req = this.serviceRequests.find((r) => r.id === id);
    if (!req) return null;
    req.status = status;
    req.updatedAt = new Date().toISOString();
    if (status === 'APPROVED') {
      req.approvedBy = approverName;
      req.approvedAt = new Date().toISOString();
    }
    if (remarks) req.adminRemarks = remarks;
    return req;
  }
}

export const adminServicesRepository = AdminServicesRepository.getInstance();
