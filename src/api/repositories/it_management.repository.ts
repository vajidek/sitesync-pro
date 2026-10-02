import { v4 as uuidv4 } from 'uuid';

export interface ITAsset {
  id: string;
  assetTag: string;
  assetName: string;
  category: 'LAPTOP' | 'WORKSTATION' | 'SERVER' | 'NETWORK_SWITCH' | 'FIREWALL' | 'PRINTER' | 'MOBILE_DEVICE' | 'MONITOR' | 'STORAGE';
  brand: string;
  model: string;
  serialNumber: string;
  macAddress?: string;
  ipAddress?: string;
  operatingSystem?: string;
  specifications: Record<string, string>;
  assignedToEmployeeId?: string;
  assignedToEmployeeName?: string;
  department?: string;
  location: string;
  purchaseDate: string;
  purchaseCost: number;
  warrantyExpiryDate: string;
  status: 'ALLOCATED' | 'IN_STORE' | 'UNDER_REPAIR' | 'RETIRED' | 'LOST';
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITSoftwareLicense {
  id: string;
  licenseCode: string;
  softwareName: string;
  publisher: string;
  category: 'CAD_BIM' | 'ERP_FINANCE' | 'PRODUCTIVITY' | 'SECURITY' | 'OS' | 'CLOUD_SAAS' | 'DEV_TOOLS';
  licenseType: 'PERPETUAL' | 'ANNUAL_SUBSCRIPTION' | 'MONTHLY_SUBSCRIPTION' | 'OPEN_SOURCE';
  totalSeats: number;
  allocatedSeats: number;
  licenseKey?: string;
  purchaseDate: string;
  renewalDate?: string;
  annualCost: number;
  allocatedUsers: Array<{ userId: string; userName: string; email: string; assignedDate: string }>;
  complianceStatus: 'COMPLIANT' | 'OVERALLOCATED' | 'EXPIRING_SOON' | 'EXPIRED';
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
}

export interface ITServiceTicket {
  id: string;
  ticketNumber: string;
  title: string;
  category: 'HARDWARE_FAILURE' | 'SOFTWARE_INSTALL' | 'NETWORK_CONNECTIVITY' | 'EMAIL_COLLAB' | 'ACCESS_PRIVILEGE' | 'SECURITY_INCIDENT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  slaHours: number;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  department: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_USER' | 'RESOLVED' | 'CLOSED';
  resolutionNotes?: string;
  resolvedAt?: string;
  slaBreached: boolean;
  activityLog: Array<{ author: string; message: string; timestamp: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface ITAccessRequest {
  id: string;
  requestNumber: string;
  requestType: 'NEW_ACCOUNT' | 'ROLE_ELEVATION' | 'VPN_ACCESS' | 'FOLDER_SHARE' | 'SOFTWARE_ACCESS';
  targetSystem: string;
  requestedRole: string;
  requesterId: string;
  requesterName: string;
  beneficiaryEmployeeId: string;
  beneficiaryEmployeeName: string;
  businessJustification: string;
  durationDays: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'PROVISIONED' | 'REJECTED' | 'REVOKED';
  approvedBy?: string;
  approvedAt?: string;
  provisionedBy?: string;
  provisionedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export class ITManagementRepository {
  private static instance: ITManagementRepository;

  private assets: ITAsset[] = [
    {
      id: 'ita-001',
      assetTag: 'IT-NB-2026-081',
      assetName: 'Lenovo ThinkPad P16s Mobile Workstation',
      category: 'LAPTOP',
      brand: 'Lenovo',
      model: 'ThinkPad P16s Gen 2 AMD',
      serialNumber: 'PF-49X821K',
      macAddress: '3C:52:82:1B:4F:90',
      ipAddress: '192.168.10.142',
      operatingSystem: 'Windows 11 Pro 64-bit',
      specifications: {
        cpu: 'AMD Ryzen 7 PRO 7840U (8C/16T, up to 5.1GHz)',
        ram: '32GB LPDDR5x 6400MHz',
        storage: '1TB NVMe PCIe 4.0 SSD',
        display: '16-inch WQXGA (2560x1600) IPS 400 nits 100% sRGB',
        gpu: 'AMD Radeon 780M Graphics',
      },
      assignedToEmployeeId: 'emp-101',
      assignedToEmployeeName: 'Abdul Vajid EK',
      department: 'Executive Operations',
      location: 'Corporate HQ, Suite 402',
      purchaseDate: '2026-01-15',
      purchaseCost: 1950,
      warrantyExpiryDate: '2029-01-14',
      status: 'ALLOCATED',
      condition: 'EXCELLENT',
      notes: 'Encrypted with BitLocker, enrolled in Enterprise Endpoint Management (MDM).',
      createdAt: '2026-01-15T09:00:00Z',
      updatedAt: '2026-01-15T09:00:00Z',
    },
    {
      id: 'ita-002',
      assetTag: 'IT-WS-2026-042',
      assetName: 'Dell Precision 5860 Tower Workstation (BIM Modeling)',
      category: 'WORKSTATION',
      brand: 'Dell',
      model: 'Precision 5860 Tower',
      serialNumber: 'CN-0X981L-7128',
      macAddress: '24:4B:FE:61:9A:12',
      ipAddress: '192.168.10.88',
      operatingSystem: 'Windows 11 Pro for Workstations',
      specifications: {
        cpu: 'Intel Xeon W5-2455X (12C/24T, 3.20GHz base)',
        ram: '64GB DDR5 4800MHz ECC RDIMM',
        storage: '2TB NVMe SSD + 8TB Enterprise SATA RAID',
        gpu: 'NVIDIA RTX A4500 20GB GDDR6',
      },
      assignedToEmployeeId: 'emp-102',
      assignedToEmployeeName: 'Priya Sharma',
      department: 'Engineering & BIM',
      location: 'Design Studio 3B',
      purchaseDate: '2025-11-20',
      purchaseCost: 4200,
      warrantyExpiryDate: '2028-11-19',
      status: 'ALLOCATED',
      condition: 'EXCELLENT',
      notes: 'Autodesk Revit & Civil 3D rendering workstation.',
      createdAt: '2025-11-20T10:00:00Z',
      updatedAt: '2025-11-20T10:00:00Z',
    },
    {
      id: 'ita-003',
      assetTag: 'IT-SRV-2026-009',
      assetName: 'HPE ProLiant DL380 Gen11 SCADA Gateway Server',
      category: 'SERVER',
      brand: 'Hewlett Packard Enterprise',
      model: 'ProLiant DL380 Gen11',
      serialNumber: 'CZ-28198Y-A01',
      macAddress: '00:1E:67:D4:33:88',
      ipAddress: '10.200.1.5',
      operatingSystem: 'Red Hat Enterprise Linux 9.4 LTS',
      specifications: {
        cpu: 'Dual Intel Xeon Silver 4410Y (12C each, 24C total)',
        ram: '128GB DDR5 ECC Registered',
        storage: '8x 1.92TB SAS SSD RAID 10 (Encrypted)',
        network: 'Quad 10GbE SFP+ Fiber Transceivers',
      },
      assignedToEmployeeId: 'emp-it-lead',
      assignedToEmployeeName: 'IT Infrastructure Operations',
      department: 'IT & SCADA Telemetry',
      location: 'Primary Data Center, Rack 04-U18',
      purchaseDate: '2025-08-10',
      purchaseCost: 9800,
      warrantyExpiryDate: '2030-08-09',
      status: 'ALLOCATED',
      condition: 'EXCELLENT',
      notes: 'Hosts MQTT broker, TimescaleDB telemetry ingestion, and SCADA redundancy cluster.',
      createdAt: '2025-08-10T12:00:00Z',
      updatedAt: '2025-08-10T12:00:00Z',
    },
    {
      id: 'ita-004',
      assetTag: 'IT-SW-2026-015',
      assetName: 'Cisco Catalyst 9300 48-Port PoE+ Core Switch',
      category: 'NETWORK_SWITCH',
      brand: 'Cisco Systems',
      model: 'C9300-48P-A',
      serialNumber: 'FOC-2419X812',
      macAddress: '70:69:79:84:11:AB',
      ipAddress: '10.200.1.254',
      operatingSystem: 'Cisco IOS-XE 17.9.4a',
      specifications: {
        ports: '48x 10/100/1000 PoE+ (740W power budget)',
        uplink: '8x 10G SFP+ Network Module',
        switchingCapacity: '480 Gbps',
      },
      location: 'Primary Data Center, Rack 01-U40',
      purchaseDate: '2025-06-01',
      purchaseCost: 5400,
      warrantyExpiryDate: '2028-05-31',
      status: 'ALLOCATED',
      condition: 'EXCELLENT',
      createdAt: '2025-06-01T08:00:00Z',
      updatedAt: '2025-06-01T08:00:00Z',
    },
    {
      id: 'ita-005',
      assetTag: 'IT-NB-2026-092',
      assetName: 'Dell Latitude 5540 Field Rugged Laptop',
      category: 'LAPTOP',
      brand: 'Dell',
      model: 'Latitude 5540',
      serialNumber: '8X912KL-002',
      macAddress: 'B8:85:84:66:32:EE',
      operatingSystem: 'Windows 11 Pro',
      specifications: {
        cpu: 'Intel Core i7-1365U',
        ram: '16GB DDR5',
        storage: '512GB NVMe SSD',
        display: '15.6 FHD Outdoor Sunlight Readable',
      },
      location: 'IT Stores - Ready for Deployment',
      purchaseDate: '2026-02-10',
      purchaseCost: 1450,
      warrantyExpiryDate: '2029-02-09',
      status: 'IN_STORE',
      condition: 'EXCELLENT',
      notes: 'Available for site project engineer allocation.',
      createdAt: '2026-02-10T11:00:00Z',
      updatedAt: '2026-02-10T11:00:00Z',
    },
  ];

  private licenses: ITSoftwareLicense[] = [
    {
      id: 'lic-001',
      licenseCode: 'LIC-AUTODESK-AEC',
      softwareName: 'Autodesk Architecture, Engineering & Construction (AEC) Collection',
      publisher: 'Autodesk Inc.',
      category: 'CAD_BIM',
      licenseType: 'ANNUAL_SUBSCRIPTION',
      totalSeats: 15,
      allocatedSeats: 12,
      licenseKey: '792-91827402-AEC-2026',
      purchaseDate: '2026-01-01',
      renewalDate: '2027-01-01',
      annualCost: 28500,
      complianceStatus: 'COMPLIANT',
      status: 'ACTIVE',
      allocatedUsers: [
        { userId: 'emp-102', userName: 'Priya Sharma', email: 'priya.s@sitesyncpro.com', assignedDate: '2026-01-02' },
        { userId: 'emp-105', userName: 'Suresh Menon', email: 'suresh.m@sitesyncpro.com', assignedDate: '2026-01-02' },
      ],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'lic-002',
      licenseCode: 'LIC-ORACLE-P6',
      softwareName: 'Oracle Primavera P6 Enterprise Project Portfolio Management (EPPM)',
      publisher: 'Oracle Corporation',
      category: 'ERP_FINANCE',
      licenseType: 'PERPETUAL',
      totalSeats: 10,
      allocatedSeats: 8,
      licenseKey: 'ORA-P6-EPPM-9812-PRO',
      purchaseDate: '2024-05-15',
      renewalDate: '2027-05-14',
      annualCost: 8400,
      complianceStatus: 'COMPLIANT',
      status: 'ACTIVE',
      allocatedUsers: [
        { userId: 'emp-101', userName: 'Abdul Vajid EK', email: 'vajidek1@gmail.com', assignedDate: '2024-05-20' },
        { userId: 'emp-104', userName: 'Rajesh Nair', email: 'rajesh.n@sitesyncpro.com', assignedDate: '2024-06-01' },
      ],
      createdAt: '2024-05-15T00:00:00Z',
      updatedAt: '2024-05-15T00:00:00Z',
    },
    {
      id: 'lic-003',
      licenseCode: 'LIC-M365-E5',
      softwareName: 'Microsoft 365 E5 Enterprise Suite & Azure AD Identity',
      publisher: 'Microsoft Corporation',
      category: 'PRODUCTIVITY',
      licenseType: 'ANNUAL_SUBSCRIPTION',
      totalSeats: 100,
      allocatedSeats: 94,
      licenseKey: 'MS-CSP-TENANT-SITESYNC-2026',
      purchaseDate: '2025-07-01',
      renewalDate: '2026-07-01',
      annualCost: 45600,
      complianceStatus: 'COMPLIANT',
      status: 'ACTIVE',
      allocatedUsers: [],
      createdAt: '2025-07-01T00:00:00Z',
      updatedAt: '2025-07-01T00:00:00Z',
    },
    {
      id: 'lic-004',
      licenseCode: 'LIC-CROWDSTRIKE-FALCON',
      softwareName: 'CrowdStrike Falcon Enterprise EDR & Threat Hunting',
      publisher: 'CrowdStrike Inc.',
      category: 'SECURITY',
      licenseType: 'ANNUAL_SUBSCRIPTION',
      totalSeats: 120,
      allocatedSeats: 118,
      licenseKey: 'CS-CID-49182-EDR-FALCON',
      purchaseDate: '2025-10-01',
      renewalDate: '2026-10-01',
      annualCost: 14200,
      complianceStatus: 'COMPLIANT',
      status: 'ACTIVE',
      allocatedUsers: [],
      createdAt: '2025-10-01T00:00:00Z',
      updatedAt: '2025-10-01T00:00:00Z',
    },
  ];

  private tickets: ITServiceTicket[] = [
    {
      id: 'tkt-001',
      ticketNumber: 'INC-2026-0312',
      title: 'Site Office 4G/LTE Router VPN Tunnel Dropping Intermittently',
      category: 'NETWORK_CONNECTIVITY',
      priority: 'HIGH',
      slaHours: 8,
      requesterId: 'emp-105',
      requesterName: 'Suresh Menon',
      requesterEmail: 'suresh.m@sitesyncpro.com',
      department: 'Site Execution & Water Network',
      assignedTechnicianId: 'tech-01',
      assignedTechnicianName: 'Kiran Patel (Network Specialist)',
      description: 'Site office in Peruvannamuzhi experiences IPsec VPN drops every 45-60 minutes when uploading high-res drone orthophotos to EDMS. Need dual-SIM failover check.',
      status: 'IN_PROGRESS',
      slaBreached: false,
      activityLog: [
        { author: 'Suresh Menon', message: 'Ticket opened with diagnostic logs', timestamp: new Date(Date.now() - 4 * 3600000).toISOString() },
        { author: 'Kiran Patel', message: 'Configured secondary Airtel 5G SIM as active-active load balance tunnel. Monitoring packet loss.', timestamp: new Date(Date.now() - 2 * 3600000).toISOString() },
      ],
      createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 'tkt-002',
      ticketNumber: 'REQ-2026-0313',
      title: 'Provision Primavera P6 EPPM Cloud Client for New Estimator',
      category: 'SOFTWARE_INSTALL',
      priority: 'MEDIUM',
      slaHours: 24,
      requesterId: 'emp-104',
      requesterName: 'Rajesh Nair',
      requesterEmail: 'rajesh.n@sitesyncpro.com',
      department: 'Commercial & Tendering',
      assignedTechnicianId: 'tech-02',
      assignedTechnicianName: 'Farhan Al Blooshi (App Admin)',
      description: 'Please install Oracle Primavera P6 Client version 23.12 and configure JDBC database profile pointing to production server.',
      status: 'RESOLVED',
      resolutionNotes: 'Software installed via Microsoft Endpoint Configuration Manager silently. User verified login successfully.',
      resolvedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
      slaBreached: false,
      activityLog: [
        { author: 'Farhan Al Blooshi', message: 'Deployed package and verified license seat count.', timestamp: new Date(Date.now() - 1 * 3600000).toISOString() },
      ],
      createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    },
    {
      id: 'tkt-003',
      ticketNumber: 'INC-2026-0314',
      title: 'Water Treatment Plant Pump Station RTU Telemetry Communication Timeout',
      category: 'HARDWARE_FAILURE',
      priority: 'CRITICAL',
      slaHours: 4,
      requesterId: 'emp-101',
      requesterName: 'Abdul Vajid EK',
      requesterEmail: 'vajidek1@gmail.com',
      department: 'SCADA Operations',
      assignedTechnicianId: 'tech-01',
      assignedTechnicianName: 'Kiran Patel (Network Specialist)',
      description: 'Modbus RS485 to Ethernet gateway at Intake Well #2 is not sending telemetry packets. High priority as reservoir level telemetry is paused.',
      status: 'OPEN',
      slaBreached: false,
      activityLog: [
        { author: 'Abdul Vajid EK', message: 'Auto-alert triggered from IoT SCADA telemetry broker.', timestamp: new Date(Date.now() - 30 * 60000).toISOString() },
      ],
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    },
  ];

  private accessRequests: ITAccessRequest[] = [
    {
      id: 'acc-001',
      requestNumber: 'AR-2026-088',
      requestType: 'ROLE_ELEVATION',
      targetSystem: 'ERP_FINANCE',
      requestedRole: 'COMMERCIAL_MANAGER',
      requesterId: 'emp-104',
      requesterName: 'Rajesh Nair',
      beneficiaryEmployeeId: 'emp-104',
      beneficiaryEmployeeName: 'Rajesh Nair',
      businessJustification: 'Required to authorize subcontractor Payment Certificates and perform rate analysis for the new smart highway bid.',
      durationDays: 365,
      status: 'APPROVED',
      approvedBy: 'Executive Office (Abdul Vajid EK)',
      approvedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      provisionedBy: 'System Administrator',
      provisionedAt: new Date(Date.now() - 22 * 3600000).toISOString(),
      createdAt: new Date(Date.now() - 26 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 22 * 3600000).toISOString(),
    },
    {
      id: 'acc-002',
      requestNumber: 'AR-2026-089',
      requestType: 'VPN_ACCESS',
      targetSystem: 'SCADA_IOT',
      requestedRole: 'SCADA_READ_OPERATOR',
      requesterId: 'emp-105',
      requesterName: 'Suresh Menon',
      beneficiaryEmployeeId: 'emp-105',
      beneficiaryEmployeeName: 'Suresh Menon',
      businessJustification: 'Remote emergency monitoring of water pipeline pressure transducers from mobile tablet.',
      durationDays: 180,
      status: 'PENDING_APPROVAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  public static getInstance(): ITManagementRepository {
    if (!ITManagementRepository.instance) {
      ITManagementRepository.instance = new ITManagementRepository();
    }
    return ITManagementRepository.instance;
  }

  // --- Assets API ---
  public async getAssets(): Promise<ITAsset[]> {
    return this.assets;
  }

  public async createAsset(data: Partial<ITAsset>): Promise<ITAsset> {
    const count = this.assets.length + 1;
    const now = new Date().toISOString();
    const newAsset: ITAsset = {
      id: `ita-${uuidv4().substring(0, 8)}`,
      assetTag: data.assetTag || `IT-${(data.category || 'ASSET').substring(0, 3)}-2026-${String(80 + count).padStart(3, '0')}`,
      assetName: data.assetName || 'Enterprise IT Device',
      category: data.category || 'LAPTOP',
      brand: data.brand || 'Generic',
      model: data.model || 'Standard Edition',
      serialNumber: data.serialNumber || `SN-${uuidv4().substring(0, 8).toUpperCase()}`,
      macAddress: data.macAddress,
      ipAddress: data.ipAddress,
      operatingSystem: data.operatingSystem,
      specifications: data.specifications || {},
      assignedToEmployeeId: data.assignedToEmployeeId,
      assignedToEmployeeName: data.assignedToEmployeeName,
      department: data.department,
      location: data.location || 'Central IT Stores',
      purchaseDate: data.purchaseDate || now.split('T')[0],
      purchaseCost: data.purchaseCost || 1200,
      warrantyExpiryDate: data.warrantyExpiryDate || new Date(Date.now() + 3 * 365 * 86400000).toISOString().split('T')[0],
      status: data.assignedToEmployeeId ? 'ALLOCATED' : 'IN_STORE',
      condition: data.condition || 'GOOD',
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };
    this.assets.unshift(newAsset);
    return newAsset;
  }

  public async updateAsset(id: string, updates: Partial<ITAsset>): Promise<ITAsset | null> {
    const asset = this.assets.find((a) => a.id === id);
    if (!asset) return null;
    Object.assign(asset, updates, { updatedAt: new Date().toISOString() });
    return asset;
  }

  // --- Licenses API ---
  public async getLicenses(): Promise<ITSoftwareLicense[]> {
    return this.licenses;
  }

  public async allocateLicenseSeat(licenseId: string, user: { userId: string; userName: string; email: string }): Promise<ITSoftwareLicense | null> {
    const lic = this.licenses.find((l) => l.id === licenseId);
    if (!lic) return null;
    if (lic.allocatedSeats < lic.totalSeats) {
      lic.allocatedSeats += 1;
      lic.allocatedUsers.push({ ...user, assignedDate: new Date().toISOString().split('T')[0] });
      lic.updatedAt = new Date().toISOString();
    }
    return lic;
  }

  // --- Tickets API ---
  public async getTickets(): Promise<ITServiceTicket[]> {
    return this.tickets;
  }

  public async createTicket(data: Partial<ITServiceTicket>): Promise<ITServiceTicket> {
    const count = this.tickets.length + 1;
    const now = new Date().toISOString();
    const newTkt: ITServiceTicket = {
      id: `tkt-${uuidv4().substring(0, 8)}`,
      ticketNumber: `INC-2026-${String(310 + count).padStart(4, '0')}`,
      title: data.title || 'IT Support Ticket',
      category: data.category || 'HARDWARE_FAILURE',
      priority: data.priority || 'MEDIUM',
      slaHours: data.priority === 'CRITICAL' ? 4 : data.priority === 'HIGH' ? 8 : 24,
      requesterId: data.requesterId || 'emp-user',
      requesterName: data.requesterName || 'Staff Member',
      requesterEmail: data.requesterEmail || 'staff@sitesyncpro.com',
      department: data.department || 'Operations',
      description: data.description || '',
      status: 'OPEN',
      slaBreached: false,
      activityLog: [{ author: data.requesterName || 'Staff Member', message: 'Ticket opened', timestamp: now }],
      createdAt: now,
      updatedAt: now,
    };
    this.tickets.unshift(newTkt);
    return newTkt;
  }

  public async updateTicketStatus(
    id: string,
    status: ITServiceTicket['status'],
    resolutionNotes?: string,
    technicianName?: string
  ): Promise<ITServiceTicket | null> {
    const tkt = this.tickets.find((t) => t.id === id);
    if (!tkt) return null;
    tkt.status = status;
    tkt.updatedAt = new Date().toISOString();
    if (technicianName) tkt.assignedTechnicianName = technicianName;
    if (resolutionNotes) {
      tkt.resolutionNotes = resolutionNotes;
      if (status === 'RESOLVED' || status === 'CLOSED') {
        tkt.resolvedAt = new Date().toISOString();
      }
    }
    tkt.activityLog.push({
      author: technicianName || 'IT Support Team',
      message: `Ticket status updated to ${status}${resolutionNotes ? ': ' + resolutionNotes : ''}`,
      timestamp: new Date().toISOString(),
    });
    return tkt;
  }

  // --- Access Requests API ---
  public async getAccessRequests(): Promise<ITAccessRequest[]> {
    return this.accessRequests;
  }

  public async createAccessRequest(data: Partial<ITAccessRequest>): Promise<ITAccessRequest> {
    const count = this.accessRequests.length + 1;
    const now = new Date().toISOString();
    const newReq: ITAccessRequest = {
      id: `acc-${uuidv4().substring(0, 8)}`,
      requestNumber: `AR-2026-${String(85 + count).padStart(3, '0')}`,
      requestType: data.requestType || 'NEW_ACCOUNT',
      targetSystem: data.targetSystem || 'ERP',
      requestedRole: data.requestedRole || 'STANDARD_USER',
      requesterId: data.requesterId || 'emp-user',
      requesterName: data.requesterName || 'Staff Member',
      beneficiaryEmployeeId: data.beneficiaryEmployeeId || data.requesterId || 'emp-user',
      beneficiaryEmployeeName: data.beneficiaryEmployeeName || data.requesterName || 'Staff Member',
      businessJustification: data.businessJustification || 'Standard departmental operations requirement',
      durationDays: data.durationDays || 365,
      status: 'PENDING_APPROVAL',
      createdAt: now,
      updatedAt: now,
    };
    this.accessRequests.unshift(newReq);
    return newReq;
  }

  public async updateAccessRequestStatus(
    id: string,
    status: ITAccessRequest['status'],
    actorName: string
  ): Promise<ITAccessRequest | null> {
    const req = this.accessRequests.find((r) => r.id === id);
    if (!req) return null;
    req.status = status;
    req.updatedAt = new Date().toISOString();
    if (status === 'APPROVED') {
      req.approvedBy = actorName;
      req.approvedAt = new Date().toISOString();
    } else if (status === 'PROVISIONED') {
      req.provisionedBy = actorName;
      req.provisionedAt = new Date().toISOString();
    }
    return req;
  }
}

export const itManagementRepository = ITManagementRepository.getInstance();
