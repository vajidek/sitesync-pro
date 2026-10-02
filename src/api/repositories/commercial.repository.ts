import { v4 as uuidv4 } from 'uuid';
import { financeRepository } from './finance.repository';
import { db } from '../../db';
import { desc, eq, sql } from 'drizzle-orm';
import { commercialTenders, commercialRateAnalyses, commercialSubcontracts, commercialSubcontractBills, commercialVariationOrders, commercialClientIpcs } from '../../db/schema';
import { isDemoSeedAllowed } from '../config/env';

export interface CommercialTender {
  id: string;
  tenderRefNumber: string;
  tenderTitle: string;
  clientAuthority: string;
  clientType: 'GOVERNMENT' | 'SEMI_GOV' | 'PRIVATE' | 'MULTINATIONAL' | 'INFRA_DEVELOPER';
  sector: 'WATER_SANITATION' | 'HIGHWAY_ROAD' | 'METRO_RAIL' | 'COMMERCIAL_BUILDING' | 'POWER_ENERGY' | 'TELECOM';
  tenderType: 'EPC_TURNKEY' | 'ITEM_RATE_BOQ' | 'DESIGN_BUILD' | 'PMC_CONSULTANCY' | 'SUPPLY_INSTALL';
  estimatedProjectValue: number;
  currency: string;
  emdAmount: number;
  tenderFee: number;
  emdMode: string;
  publicationDate: string;
  preBidMeetingDate?: string;
  submissionDeadline: string;
  bidValidityDays: number;
  eligibilityCriteria?: string;
  technicalScoreThreshold: number;
  quotedBidAmount?: number;
  expectedGrossMarginPercent: number;
  bidManagerId: string;
  bidManagerName: string;
  status: 'DISCOVERED' | 'IN_ESTIMATION' | 'UNDER_MANAGEMENT_REVIEW' | 'BID_SUBMITTED' | 'EVALUATION_STAGE' | 'AWARDED' | 'LOST' | 'CANCELLED';
  awardDetails?: Record<string, any>;
  documents: Array<{ title: string; type: string; url?: string; uploadDate: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface CommercialRateAnalysis {
  id: string;
  analysisCode: string;
  tenderId?: string;
  itemCode: string;
  itemDescription: string;
  unit: string;
  materialCostPerUnit: number;
  laborCostPerUnit: number;
  machineryCostPerUnit: number;
  subcontractCostPerUnit: number;
  overheadPercent: number;
  profitPercent: number;
  netRatePerUnit: number;
  quotedRatePerUnit: number;
  componentsBreakdown: Array<{ description: string; qty: number; unit: string; rate: number; amount: number }>;
  status: 'DRAFT' | 'REVIEW_PENDING' | 'APPROVED' | 'REVISED';
  createdAt: string;
  updatedAt: string;
}

export interface CommercialSubcontract {
  id: string;
  agreementNumber: string;
  subcontractorName: string;
  subcontractorCode: string;
  projectId: string;
  projectName: string;
  packageTitle: string;
  tradeCategory: 'CIVIL_MASONRY' | 'REINFORCEMENT_TMT' | 'PIPELINE_TRENCHING' | 'MEP_ELECTRICAL' | 'STRUCTURAL_FABRICATION' | 'WATERPROOFING';
  contractType: 'ITEM_RATE_BOQ' | 'LUMPSUM_MILESTONE' | 'COST_PLUS';
  contractValue: number;
  retentionPercent: number;
  mobilizationAdvancePercent: number;
  mobilizationAdvancePaid: number;
  mobilizationAdvanceRecovered: number;
  totalBilledAmount: number;
  totalCertifiedAmount: number;
  totalPaidAmount: number;
  totalRetentionWithheld: number;
  startDate: string;
  completionDate: string;
  status: 'DRAFT' | 'ACTIVE' | 'SUSPENDED' | 'SUBSTANTIALLY_COMPLETE' | 'CLOSED' | 'TERMINATED';
  performanceRating: number;
  complianceDocumentsVerified: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommercialSubcontractBill {
  id: string;
  subcontractId: string;
  subcontractNumber: string;
  subcontractorName: string;
  billNumber: string;
  billPeriodStart: string;
  billPeriodEnd: string;
  submissionDate: string;
  grossClaimedAmount: number;
  certifiedAmount: number;
  retentionPercent: number;
  retentionAmount: number;
  mobilizationRecovery: number;
  otherDeductions: number;
  netCertifiedPayable: number;
  status: 'SUBMITTED' | 'UNDER_MEASUREMENT' | 'CERTIFIED' | 'APPROVED_FOR_PAYMENT' | 'PAID';
  certifiedBy?: string;
  certifiedDate?: string;
  remarks?: string;
  createdAt: string;
}

export interface CommercialVariationOrder {
  id: string;
  projectId: string;
  projectName: string;
  voNumber: string;
  title: string;
  scopeDescription: string;
  variationType: 'ADDITION' | 'OMISSION' | 'RATE_REVISION' | 'NEW_ITEM';
  claimedAmount: number;
  approvedAmount: number;
  timeExtensionDays: number;
  impactOnCriticalPath: boolean;
  status: 'SUBMITTED' | 'CLIENT_REVIEW' | 'ENGINEER_APPROVED' | 'DISPUTED' | 'FORMALLY_INCORPORATED';
  clientReference?: string;
  submittedDate: string;
  approvedDate?: string;
  createdAt: string;
}

export interface CommercialClientIPC {
  id: string;
  projectId: string;
  projectName: string;
  ipcNumber: string;
  billingPeriod: string;
  grossWorkDoneClaimed: number;
  grossWorkDoneCertified: number;
  materialsOnSiteValue: number;
  retentionDeduction: number;
  mobilizationRecovery: number;
  statutoryTDS: number;
  netReceivableAmount: number;
  status: 'SUBMITTED' | 'CONSULTANT_CHECKED' | 'CERTIFIED' | 'PAYMENT_RECEIVED';
  submissionDate: string;
  certificationDate?: string;
  dueDate?: string;
  createdAt: string;
}

export class CommercialRepository {
  private static instance: CommercialRepository;

  private tenders: CommercialTender[] = [
    {
      id: 'tnd-001',
      tenderRefNumber: 'TND-KWA-2026-081',
      tenderTitle: 'Design, Build & Commissioning of 45 MLD Water Treatment Plant & Transmission Mains',
      clientAuthority: 'Kerala Water Authority (KWA) / Jal Jeevan Mission',
      clientType: 'GOVERNMENT',
      sector: 'WATER_SANITATION',
      tenderType: 'EPC_TURNKEY',
      estimatedProjectValue: 142000000,
      currency: 'INR',
      emdAmount: 2840000,
      tenderFee: 25000,
      emdMode: 'BANK_GUARANTEE',
      publicationDate: '2026-08-10',
      preBidMeetingDate: '2026-08-25',
      submissionDeadline: '2026-10-15',
      bidValidityDays: 120,
      eligibilityCriteria: 'Previous completion of at least one 30+ MLD drinking water plant with SCADA automation within the last 5 financial years.',
      technicalScoreThreshold: 80.0,
      quotedBidAmount: 136500000,
      expectedGrossMarginPercent: 16.2,
      bidManagerId: 'emp-104',
      bidManagerName: 'Rajesh Nair',
      status: 'UNDER_MANAGEMENT_REVIEW',
      documents: [
        { title: 'Notice Inviting Tender (NIT)', type: 'PDF', uploadDate: '2026-08-10' },
        { title: 'Technical Specifications & BOQ Vol II', type: 'PDF', uploadDate: '2026-08-10' },
        { title: 'Pre-Bid Clarification Addendum #1', type: 'PDF', uploadDate: '2026-08-28' },
      ],
      createdAt: '2026-08-10T10:00:00Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tnd-002',
      tenderRefNumber: 'TND-KMRL-2026-019',
      tenderTitle: 'Kochi Metro Rail Phase II Viaduct & 4 Elevated Stations Civil Works (Package KC-04)',
      clientAuthority: 'Kochi Metro Rail Limited (KMRL)',
      clientType: 'GOVERNMENT',
      sector: 'METRO_RAIL',
      tenderType: 'ITEM_RATE_BOQ',
      estimatedProjectValue: 245000000,
      currency: 'INR',
      emdAmount: 4900000,
      tenderFee: 35000,
      emdMode: 'BANK_GUARANTEE',
      publicationDate: '2026-07-01',
      preBidMeetingDate: '2026-07-20',
      submissionDeadline: '2026-08-30',
      bidValidityDays: 180,
      technicalScoreThreshold: 75.0,
      quotedBidAmount: 238000000,
      expectedGrossMarginPercent: 14.8,
      bidManagerId: 'emp-101',
      bidManagerName: 'Abdul Vajid EK',
      status: 'AWARDED',
      awardDetails: {
        letterOfAcceptanceNumber: 'KMRL/CIVIL/KC04/LOA/2026/89',
        awardedValue: 238000000,
        effectiveDate: '2026-09-01',
        completionPeriodMonths: 24,
      },
      documents: [
        { title: 'Letter of Acceptance (LoA)', type: 'PDF', uploadDate: '2026-09-01' },
      ],
      createdAt: '2026-07-01T08:00:00Z',
      updatedAt: '2026-09-01T14:00:00Z',
    },
    {
      id: 'tnd-003',
      tenderRefNumber: 'TND-DEWA-2026-442',
      tenderTitle: 'Expansion of 1200mm Ductile Iron Potable Water Distribution Corridor - Jebel Ali Sector',
      clientAuthority: 'Dubai Electricity & Water Authority (DEWA)',
      clientType: 'SEMI_GOV',
      sector: 'WATER_SANITATION',
      tenderType: 'EPC_TURNKEY',
      estimatedProjectValue: 48000000,
      currency: 'AED',
      emdAmount: 960000,
      tenderFee: 5000,
      emdMode: 'BANK_GUARANTEE',
      publicationDate: '2026-09-05',
      submissionDeadline: '2026-11-10',
      bidValidityDays: 90,
      technicalScoreThreshold: 85.0,
      expectedGrossMarginPercent: 18.5,
      bidManagerId: 'emp-104',
      bidManagerName: 'Rajesh Nair',
      status: 'IN_ESTIMATION',
      documents: [
        { title: 'Tender Dossier & Soil Investigation Report', type: 'PDF', uploadDate: '2026-09-05' },
      ],
      createdAt: '2026-09-05T09:00:00Z',
      updatedAt: new Date().toISOString(),
    },
  ];

  private rateAnalyses: CommercialRateAnalysis[] = [
    {
      id: 'ra-001',
      analysisCode: 'RA-M40-PUMP',
      tenderId: 'tnd-002',
      itemCode: 'BOQ-CIV-041',
      itemDescription: 'Design Mix Concrete Grade M40 using 20mm graded crushed aggregate with micro-silica for pier caps, including pumping & mechanical vibratory consolidation',
      unit: 'cum',
      materialCostPerUnit: 5200,
      laborCostPerUnit: 850,
      machineryCostPerUnit: 620,
      subcontractCostPerUnit: 0,
      overheadPercent: 10.0,
      profitPercent: 12.0,
      netRatePerUnit: 6670,
      quotedRatePerUnit: 8137.4,
      componentsBreakdown: [
        { description: 'OPC 53 Grade Cement (420 kg/cum)', qty: 8.4, unit: 'Bags', rate: 380, amount: 3192 },
        { description: 'Micro-silica Additive (35 kg/cum)', qty: 35, unit: 'kg', rate: 22, amount: 770 },
        { description: 'Coarse Aggregate 20mm/10mm (1150 kg)', qty: 1.15, unit: 'MT', rate: 750, amount: 862.5 },
        { description: 'Crushed Manufactured Sand (M-Sand)', qty: 0.78, unit: 'MT', rate: 480, amount: 374.4 },
        { description: 'Concrete Pump + Stationary Boom Hire', qty: 1, unit: 'cum', rate: 350, amount: 350 },
        { description: 'Transit Mixer Truck haulage (8 km)', qty: 1, unit: 'cum', rate: 270, amount: 270 },
        { description: 'Mason, Vibrator Operator & Labor gang', qty: 1, unit: 'cum', rate: 850, amount: 850 },
      ],
      status: 'APPROVED',
      createdAt: '2026-07-15T10:00:00Z',
      updatedAt: '2026-07-15T10:00:00Z',
    },
    {
      id: 'ra-002',
      analysisCode: 'RA-DI-PIPE-600',
      tenderId: 'tnd-001',
      itemCode: 'BOQ-MEC-108',
      itemDescription: 'Supplying, lowering, laying and jointing Class K9 Ductile Iron pipes of 600mm nominal diameter with push-on rubber tyton gasket joints including hydraulic testing to 15 bar',
      unit: 'rmt',
      materialCostPerUnit: 7800,
      laborCostPerUnit: 920,
      machineryCostPerUnit: 1150,
      subcontractCostPerUnit: 0,
      overheadPercent: 10.0,
      profitPercent: 12.0,
      netRatePerUnit: 9870,
      quotedRatePerUnit: 12041.4,
      componentsBreakdown: [
        { description: 'DI K9 Pipe 600mm dia (Electrosteel/Jindal)', qty: 1, unit: 'rmt', rate: 7400, amount: 7400 },
        { description: 'EPDM Tyton Jointing Gaskets', qty: 0.18, unit: 'nos', rate: 1200, amount: 216 },
        { description: 'Excavator & Crane pipe lowering', qty: 1, unit: 'rmt', rate: 1150, amount: 1150 },
        { description: 'Hydrostatic pressure testing manifold', qty: 1, unit: 'rmt', rate: 184, amount: 184 },
        { description: 'Rigging gang & pipe fitter labor', qty: 1, unit: 'rmt', rate: 920, amount: 920 },
      ],
      status: 'APPROVED',
      createdAt: '2026-08-18T11:00:00Z',
      updatedAt: '2026-08-18T11:00:00Z',
    },
  ];

  private subcontracts: CommercialSubcontract[] = [
    {
      id: 'sub-001',
      agreementNumber: 'SUB-2026-KWA-04',
      subcontractorName: 'Apex Civil Infra & Earthworks LLP',
      subcontractorCode: 'VND-2026-089',
      projectId: 'p-101',
      projectName: 'Peruvannamuzhi WTP Pipe Network',
      packageTitle: 'Trench Excavation, Shoring & Pipe Bedding in Hard Rock & Soil',
      tradeCategory: 'PIPELINE_TRENCHING',
      contractType: 'ITEM_RATE_BOQ',
      contractValue: 18500000,
      retentionPercent: 5.0,
      mobilizationAdvancePercent: 10.0,
      mobilizationAdvancePaid: 1850000,
      mobilizationAdvanceRecovered: 1110000,
      totalBilledAmount: 11100000,
      totalCertifiedAmount: 10750000,
      totalPaidAmount: 9350000,
      totalRetentionWithheld: 537500,
      startDate: '2026-02-01',
      completionDate: '2026-11-30',
      status: 'ACTIVE',
      performanceRating: 4.6,
      complianceDocumentsVerified: true,
      notes: 'Excellent trenching progress along National Highway corridor with zero utility damage.',
      createdAt: '2026-02-01T09:00:00Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sub-002',
      agreementNumber: 'SUB-2026-KMRL-12',
      subcontractorName: 'Stahlwerk Prestressing & Reinforcement Systems',
      subcontractorCode: 'VND-2026-042',
      projectId: 'p-102',
      projectName: 'Kochi Metro Rail Viaduct Package KC-04',
      packageTitle: 'Post-Tensioning Prestressing Cable Threading & Grouting for U-Girders',
      tradeCategory: 'STRUCTURAL_FABRICATION',
      contractType: 'LUMPSUM_MILESTONE',
      contractValue: 34200000,
      retentionPercent: 5.0,
      mobilizationAdvancePercent: 10.0,
      mobilizationAdvancePaid: 3420000,
      mobilizationAdvanceRecovered: 855000,
      totalBilledAmount: 8550000,
      totalCertifiedAmount: 8550000,
      totalPaidAmount: 7695000,
      totalRetentionWithheld: 427500,
      startDate: '2026-09-15',
      completionDate: '2027-08-31',
      status: 'ACTIVE',
      performanceRating: 4.8,
      complianceDocumentsVerified: true,
      notes: 'Specialist German hydraulic jacks and calibrated load cells deployed on casting yard.',
      createdAt: '2026-09-10T11:00:00Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sub-003',
      agreementNumber: 'SUB-2026-DXB-02',
      subcontractorName: 'Al Khaleej Dewatering & Shoring LLC',
      subcontractorCode: 'VND-2026-015',
      projectId: 'p-103',
      projectName: 'DEWA Potable Water Distribution Corridor',
      packageTitle: 'Deep Wellpoint Dewatering & Micro-Tunneling Thrust Pit Works',
      tradeCategory: 'CIVIL_MASONRY',
      contractType: 'ITEM_RATE_BOQ',
      contractValue: 7800000,
      retentionPercent: 5.0,
      mobilizationAdvancePercent: 10.0,
      mobilizationAdvancePaid: 780000,
      mobilizationAdvanceRecovered: 780000,
      totalBilledAmount: 7800000,
      totalCertifiedAmount: 7800000,
      totalPaidAmount: 7410000,
      totalRetentionWithheld: 390000,
      startDate: '2025-10-01',
      completionDate: '2026-08-31',
      status: 'SUBSTANTIALLY_COMPLETE',
      performanceRating: 4.5,
      complianceDocumentsVerified: true,
      notes: 'Final retention release due upon completion of defect liability period in 2027.',
      createdAt: '2025-10-01T10:00:00Z',
      updatedAt: new Date().toISOString(),
    },
  ];

  private subcontractBills: CommercialSubcontractBill[] = [
    {
      id: 'sb-001',
      subcontractId: 'sub-001',
      subcontractNumber: 'SUB-2026-001',
      subcontractorName: 'Apex GeoTech & Earthmovers LLP',
      billNumber: 'RA-03',
      billPeriodStart: '2026-08-01',
      billPeriodEnd: '2026-08-31',
      submissionDate: '2026-09-02',
      grossClaimedAmount: 2450000,
      certifiedAmount: 2400000,
      retentionPercent: 5.0,
      retentionAmount: 120000,
      mobilizationRecovery: 240000,
      otherDeductions: 15000,
      netCertifiedPayable: 2025000,
      status: 'APPROVED_FOR_PAYMENT',
      certifiedBy: 'Chief Resident Engineer',
      certifiedDate: '2026-09-08',
      remarks: 'Joint measurements verified for Chainage 0+000 to 1+450 rock trenching.',
      createdAt: '2026-09-02T14:30:00Z',
    },
    {
      id: 'sb-002',
      subcontractId: 'sub-002',
      subcontractNumber: 'SUB-2026-002',
      subcontractorName: 'Kaveri Steel Fabricators & Rebar Works',
      billNumber: 'RA-04',
      billPeriodStart: '2026-08-15',
      billPeriodEnd: '2026-08-31',
      submissionDate: '2026-09-04',
      grossClaimedAmount: 1850000,
      certifiedAmount: 1800000,
      retentionPercent: 5.0,
      retentionAmount: 90000,
      mobilizationRecovery: 180000,
      otherDeductions: 0,
      netCertifiedPayable: 1530000,
      status: 'CERTIFIED',
      certifiedBy: 'Civil Project Manager',
      certifiedDate: '2026-09-10',
      remarks: 'Bending schedules and BBS reconciled with site inventory issues.',
      createdAt: '2026-09-04T11:20:00Z',
    },
    {
      id: 'sb-003',
      subcontractId: 'sub-003',
      subcontractNumber: 'SUB-2026-003',
      subcontractorName: 'Deccan Electro-Mechanical Solutions',
      billNumber: 'RA-02',
      billPeriodStart: '2026-08-01',
      billPeriodEnd: '2026-08-31',
      submissionDate: '2026-09-05',
      grossClaimedAmount: 980000,
      certifiedAmount: 950000,
      retentionPercent: 5.0,
      retentionAmount: 47500,
      mobilizationRecovery: 95000,
      otherDeductions: 5000,
      netCertifiedPayable: 802500,
      status: 'UNDER_MEASUREMENT',
      remarks: 'Cable trench laying inspection in progress with client engineer.',
      createdAt: '2026-09-05T09:15:00Z',
    },
  ];

  private variationOrders: CommercialVariationOrder[] = [
    {
      id: 'vo-001',
      projectId: 'p-101',
      projectName: 'Peruvannamuzhi Water Treatment Plant',
      voNumber: 'VO-KWA-001',
      title: 'Additional Hard Rock Chiselling & Controlled Blasting for Clariflocculator Foundation',
      scopeDescription: 'Encountered unanticipated massive granite strata requiring specialized hydraulic splitter and controlled blasting beyond tender borehole logs.',
      variationType: 'ADDITION',
      claimedAmount: 4850000,
      approvedAmount: 4500000,
      timeExtensionDays: 28,
      impactOnCriticalPath: true,
      status: 'ENGINEER_APPROVED',
      clientReference: 'KWA/CE/NR/WTP/VO-01/2026',
      submittedDate: '2026-07-15',
      approvedDate: '2026-08-20',
      createdAt: '2026-07-15T10:00:00Z',
    },
    {
      id: 'vo-002',
      projectId: 'p-101',
      projectName: 'Peruvannamuzhi Water Treatment Plant',
      voNumber: 'VO-KWA-002',
      title: 'Upgrade Filter Media to Dual Media Anthracite & High-Density Garnet',
      scopeDescription: 'Client requested upgraded effluent turbidity compliance (< 0.1 NTU) necessitating anthracite dual media filtration instead of standard silica sand.',
      variationType: 'RATE_REVISION',
      claimedAmount: 6200000,
      approvedAmount: 0,
      timeExtensionDays: 14,
      impactOnCriticalPath: false,
      status: 'CLIENT_REVIEW',
      clientReference: 'KWA/SE/TECH/VO-02-REV',
      submittedDate: '2026-08-10',
      createdAt: '2026-08-10T15:30:00Z',
    },
    {
      id: 'vo-003',
      projectId: 'p-102',
      projectName: 'Karapuzha Irrigation Canal Concrete Lining',
      voNumber: 'VO-IRR-001',
      title: 'Realignment of Aqueduct Cross-Drainage Structure due to Highway Widening',
      scopeDescription: 'NHAI highway bypass intersecting canal alignment necessitated 120m realignment and deeper RCC box culvert.',
      variationType: 'NEW_ITEM',
      claimedAmount: 8900000,
      approvedAmount: 8400000,
      timeExtensionDays: 45,
      impactOnCriticalPath: true,
      status: 'FORMALLY_INCORPORATED',
      clientReference: 'IRR/ID-WYD/VO-2026-04',
      submittedDate: '2026-06-05',
      approvedDate: '2026-07-28',
      createdAt: '2026-06-05T09:00:00Z',
    },
  ];

  private clientIPCs: CommercialClientIPC[] = [
    {
      id: 'ipc-001',
      projectId: 'p-101',
      projectName: 'Peruvannamuzhi Water Treatment Plant',
      ipcNumber: 'IPC-05',
      billingPeriod: 'July 2026',
      grossWorkDoneClaimed: 18500000,
      grossWorkDoneCertified: 18000000,
      materialsOnSiteValue: 3200000,
      retentionDeduction: 900000,
      mobilizationRecovery: 1800000,
      statutoryTDS: 360000,
      netReceivableAmount: 14940000,
      status: 'PAYMENT_RECEIVED',
      submissionDate: '2026-08-05',
      certificationDate: '2026-08-22',
      dueDate: '2026-09-05',
      createdAt: '2026-08-05T11:00:00Z',
    },
    {
      id: 'ipc-002',
      projectId: 'p-101',
      projectName: 'Peruvannamuzhi Water Treatment Plant',
      ipcNumber: 'IPC-06',
      billingPeriod: 'August 2026',
      grossWorkDoneClaimed: 22400000,
      grossWorkDoneCertified: 21800000,
      materialsOnSiteValue: 4100000,
      retentionDeduction: 1090000,
      mobilizationRecovery: 2180000,
      statutoryTDS: 436000,
      netReceivableAmount: 18094000,
      status: 'CERTIFIED',
      submissionDate: '2026-09-05',
      certificationDate: '2026-09-18',
      dueDate: '2026-10-05',
      createdAt: '2026-09-05T16:00:00Z',
    },
    {
      id: 'ipc-003',
      projectId: 'p-102',
      projectName: 'Karapuzha Irrigation Canal Concrete Lining',
      ipcNumber: 'IPC-04',
      billingPeriod: 'August 2026',
      grossWorkDoneClaimed: 9600000,
      grossWorkDoneCertified: 9400000,
      materialsOnSiteValue: 1200000,
      retentionDeduction: 470000,
      mobilizationRecovery: 940000,
      statutoryTDS: 188000,
      netReceivableAmount: 7802000,
      status: 'CONSULTANT_CHECKED',
      submissionDate: '2026-09-07',
      dueDate: '2026-10-10',
      createdAt: '2026-09-07T12:00:00Z',
    },
  ];

  public static getInstance(): CommercialRepository {
    if (!CommercialRepository.instance) {
      CommercialRepository.instance = new CommercialRepository();
    }
    return CommercialRepository.instance;
  }

  // --- Tenders API ---
  private static persistenceReady = false;

  private async ensureCommercialPersistence(): Promise<void> {
    if (CommercialRepository.persistenceReady) return;
    const ddlStatements = [
      `CREATE TABLE IF NOT EXISTS commercial_tenders (id TEXT PRIMARY KEY, tender_ref_number TEXT NOT NULL UNIQUE, tender_title TEXT NOT NULL, client_authority TEXT NOT NULL, client_type TEXT NOT NULL, sector TEXT NOT NULL, tender_type TEXT NOT NULL, estimated_project_value DOUBLE PRECISION NOT NULL, currency TEXT NOT NULL, emd_amount DOUBLE PRECISION DEFAULT 0, tender_fee DOUBLE PRECISION DEFAULT 0, emd_mode TEXT, publication_date TEXT NOT NULL, pre_bid_meeting_date TEXT, submission_deadline TEXT NOT NULL, bid_validity_days INTEGER DEFAULT 0, eligibility_criteria TEXT, technical_score_threshold DOUBLE PRECISION, quoted_bid_amount DOUBLE PRECISION, expected_gross_margin_percent DOUBLE PRECISION, bid_manager_id TEXT, bid_manager_name TEXT, status TEXT NOT NULL, award_details JSONB, documents JSONB, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS commercial_rate_analyses (id TEXT PRIMARY KEY, analysis_code TEXT NOT NULL UNIQUE, tender_id TEXT, boq_item_id TEXT, item_code TEXT NOT NULL, item_description TEXT NOT NULL, unit TEXT NOT NULL, material_cost_per_unit DOUBLE PRECISION DEFAULT 0, labor_cost_per_unit DOUBLE PRECISION DEFAULT 0, machinery_cost_per_unit DOUBLE PRECISION DEFAULT 0, subcontract_cost_per_unit DOUBLE PRECISION DEFAULT 0, overhead_percent DOUBLE PRECISION DEFAULT 0, profit_percent DOUBLE PRECISION DEFAULT 0, net_rate_per_unit DOUBLE PRECISION NOT NULL, quoted_rate_per_unit DOUBLE PRECISION NOT NULL, components_breakdown JSONB, currency TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS commercial_subcontracts (id TEXT PRIMARY KEY, agreement_number TEXT NOT NULL UNIQUE, subcontractor_name TEXT NOT NULL, subcontractor_code TEXT NOT NULL, project_id TEXT NOT NULL, project_name TEXT, contract_id TEXT, wbs_id TEXT, package_title TEXT NOT NULL, trade_category TEXT NOT NULL, contract_type TEXT NOT NULL, contract_value DOUBLE PRECISION NOT NULL, currency TEXT NOT NULL, retention_percent DOUBLE PRECISION DEFAULT 0, mobilization_advance_percent DOUBLE PRECISION DEFAULT 0, mobilization_advance_paid DOUBLE PRECISION DEFAULT 0, mobilization_advance_recovered DOUBLE PRECISION DEFAULT 0, total_billed_amount DOUBLE PRECISION DEFAULT 0, total_certified_amount DOUBLE PRECISION DEFAULT 0, total_paid_amount DOUBLE PRECISION DEFAULT 0, total_retention_withheld DOUBLE PRECISION DEFAULT 0, start_date TEXT NOT NULL, completion_date TEXT, status TEXT NOT NULL, performance_rating DOUBLE PRECISION, compliance_documents_verified BOOLEAN DEFAULT FALSE, notes TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS commercial_subcontract_bills (id TEXT PRIMARY KEY, subcontract_id TEXT NOT NULL, subcontract_number TEXT NOT NULL, subcontractor_name TEXT NOT NULL, bill_number TEXT NOT NULL, bill_period_start TEXT NOT NULL, bill_period_end TEXT NOT NULL, submission_date TEXT NOT NULL, gross_claimed_amount DOUBLE PRECISION NOT NULL, certified_amount DOUBLE PRECISION DEFAULT 0, currency TEXT NOT NULL, retention_percent DOUBLE PRECISION DEFAULT 0, retention_amount DOUBLE PRECISION DEFAULT 0, mobilization_recovery DOUBLE PRECISION DEFAULT 0, other_deductions DOUBLE PRECISION DEFAULT 0, net_certified_payable DOUBLE PRECISION DEFAULT 0, status TEXT NOT NULL, certified_by TEXT, certified_date TEXT, remarks TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, CONSTRAINT uq_commercial_subcontract_bill UNIQUE (subcontract_id, bill_number))`,
      `CREATE TABLE IF NOT EXISTS commercial_variation_orders (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, project_name TEXT, contract_id TEXT, wbs_id TEXT, boq_item_id TEXT, vo_number TEXT NOT NULL UNIQUE, title TEXT NOT NULL, scope_description TEXT NOT NULL, variation_type TEXT NOT NULL, claimed_amount DOUBLE PRECISION NOT NULL, approved_amount DOUBLE PRECISION DEFAULT 0, currency TEXT NOT NULL, time_extension_days INTEGER DEFAULT 0, impact_on_critical_path BOOLEAN DEFAULT FALSE, status TEXT NOT NULL, client_reference TEXT, submitted_date TEXT NOT NULL, approved_date TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS commercial_client_ipcs (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, project_name TEXT, contract_id TEXT, ipc_number TEXT NOT NULL UNIQUE, billing_period TEXT NOT NULL, gross_work_done_claimed DOUBLE PRECISION NOT NULL, gross_work_done_certified DOUBLE PRECISION DEFAULT 0, materials_on_site_value DOUBLE PRECISION DEFAULT 0, retention_deduction DOUBLE PRECISION DEFAULT 0, mobilization_recovery DOUBLE PRECISION DEFAULT 0, statutory_tds DOUBLE PRECISION DEFAULT 0, net_receivable_amount DOUBLE PRECISION DEFAULT 0, currency TEXT NOT NULL, status TEXT NOT NULL, submission_date TEXT NOT NULL, certification_date TEXT, due_date TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
    ];
    for (const statement of ddlStatements) await db.execute(sql.raw(statement));
    if (isDemoSeedAllowed()) await this.seedDemoCommercialDataIfEmpty();
    CommercialRepository.persistenceReady = true;
  }

  private async seedDemoCommercialDataIfEmpty(): Promise<void> {
    if ((await db.select({ id: commercialTenders.id }).from(commercialTenders).limit(1)).length === 0) {
      await db.insert(commercialTenders).values(this.tenders.map((t) => ({ ...t } as any))).onConflictDoNothing();
    }
    if ((await db.select({ id: commercialRateAnalyses.id }).from(commercialRateAnalyses).limit(1)).length === 0) {
      await db.insert(commercialRateAnalyses).values(this.rateAnalyses.map((r) => ({ ...r, boqItemId: null, currency: 'INR' } as any))).onConflictDoNothing();
    }
    if ((await db.select({ id: commercialSubcontracts.id }).from(commercialSubcontracts).limit(1)).length === 0) {
      await db.insert(commercialSubcontracts).values(this.subcontracts.map((s) => ({ ...s, contractId: null, wbsId: null, currency: 'INR' } as any))).onConflictDoNothing();
    }
    if ((await db.select({ id: commercialSubcontractBills.id }).from(commercialSubcontractBills).limit(1)).length === 0) {
      await db.insert(commercialSubcontractBills).values(this.subcontractBills.map((b) => ({ ...b, currency: 'INR', updatedAt: b.createdAt } as any))).onConflictDoNothing();
    }
    if ((await db.select({ id: commercialVariationOrders.id }).from(commercialVariationOrders).limit(1)).length === 0) {
      await db.insert(commercialVariationOrders).values(this.variationOrders.map((v) => ({ ...v, contractId: null, wbsId: null, boqItemId: null, currency: 'INR', updatedAt: v.createdAt } as any))).onConflictDoNothing();
    }
    if ((await db.select({ id: commercialClientIpcs.id }).from(commercialClientIpcs).limit(1)).length === 0) {
      await db.insert(commercialClientIpcs).values(this.clientIPCs.map((i) => ({ ...i, contractId: null, statutoryTds: i.statutoryTDS, currency: 'INR', updatedAt: i.createdAt } as any))).onConflictDoNothing();
    }
  }

  private mapRateAnalysis(row: any): CommercialRateAnalysis {
    return { ...row, status: row.status, componentsBreakdown: row.componentsBreakdown || [] } as CommercialRateAnalysis;
  }

  private mapSubcontract(row: any): CommercialSubcontract {
    return { ...row } as CommercialSubcontract;
  }

  private mapSubcontractBill(row: any): CommercialSubcontractBill {
    return { ...row } as CommercialSubcontractBill;
  }

  private mapVariation(row: any): CommercialVariationOrder {
    return { ...row } as CommercialVariationOrder;
  }

  private mapIPC(row: any): CommercialClientIPC {
    return { ...row, statutoryTDS: row.statutoryTds } as CommercialClientIPC;
  }
  public async getTenders(): Promise<CommercialTender[]> {
    await this.ensureCommercialPersistence();
    const rows = await db.select().from(commercialTenders).orderBy(desc(commercialTenders.createdAt));
    return rows.map((row) => ({
      id: row.id,
      tenderRefNumber: row.tenderRefNumber,
      tenderTitle: row.tenderTitle,
      clientAuthority: row.clientAuthority,
      clientType: row.clientType,
      sector: row.sector,
      tenderType: row.tenderType,
      estimatedProjectValue: row.estimatedProjectValue,
      currency: row.currency,
      emdAmount: row.emdAmount || 0,
      tenderFee: row.tenderFee || 0,
      emdMode: row.emdMode || '',
      publicationDate: row.publicationDate,
      preBidMeetingDate: row.preBidMeetingDate || undefined,
      submissionDeadline: row.submissionDeadline,
      bidValidityDays: row.bidValidityDays || 0,
      eligibilityCriteria: row.eligibilityCriteria || undefined,
      technicalScoreThreshold: row.technicalScoreThreshold || 0,
      quotedBidAmount: row.quotedBidAmount ?? undefined,
      expectedGrossMarginPercent: row.expectedGrossMarginPercent || 0,
      bidManagerId: row.bidManagerId || '',
      bidManagerName: row.bidManagerName || '',
      status: row.status,
      awardDetails: row.awardDetails || undefined,
      documents: row.documents || [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as CommercialTender));
  }

  public async createTender(data: Partial<CommercialTender>): Promise<CommercialTender> {
    await this.ensureCommercialPersistence();
    if (!data.tenderRefNumber || !data.tenderTitle || !data.clientAuthority || !data.clientType || !data.sector || !data.tenderType || !data.currency || !data.publicationDate || !data.submissionDeadline) {
      throw new Error('Tender reference, title, client, classification, currency, publication date and submission deadline are required.');
    }
    const amount = Number(data.estimatedProjectValue);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Estimated project value must be greater than zero.');
    const now = new Date().toISOString();
    const id = `tnd-${uuidv4().slice(0, 8)}`;
    await db.insert(commercialTenders).values({
      id,
      tenderRefNumber: data.tenderRefNumber,
      tenderTitle: data.tenderTitle,
      clientAuthority: data.clientAuthority,
      clientType: data.clientType,
      sector: data.sector,
      tenderType: data.tenderType,
      estimatedProjectValue: amount,
      currency: data.currency.toUpperCase(),
      emdAmount: Number(data.emdAmount || 0),
      tenderFee: Number(data.tenderFee || 0),
      emdMode: data.emdMode || null,
      publicationDate: data.publicationDate,
      preBidMeetingDate: data.preBidMeetingDate || null,
      submissionDeadline: data.submissionDeadline,
      bidValidityDays: Number(data.bidValidityDays || 0),
      eligibilityCriteria: data.eligibilityCriteria || null,
      technicalScoreThreshold: Number(data.technicalScoreThreshold || 0),
      quotedBidAmount: data.quotedBidAmount == null ? null : Number(data.quotedBidAmount),
      expectedGrossMarginPercent: data.expectedGrossMarginPercent == null ? null : Number(data.expectedGrossMarginPercent),
      bidManagerId: data.bidManagerId || null,
      bidManagerName: data.bidManagerName || null,
      status: data.status || 'DISCOVERED',
      awardDetails: data.awardDetails || null,
      documents: data.documents || [],
      createdAt: now,
      updatedAt: now,
    });
    const [row] = await db.select().from(commercialTenders).where(eq(commercialTenders.id, id)).limit(1);
    if (!row) throw new Error('Tender was not persisted.');
    return {
      id: row.id, tenderRefNumber: row.tenderRefNumber, tenderTitle: row.tenderTitle, clientAuthority: row.clientAuthority,
      clientType: row.clientType, sector: row.sector, tenderType: row.tenderType, estimatedProjectValue: row.estimatedProjectValue,
      currency: row.currency, emdAmount: row.emdAmount || 0, tenderFee: row.tenderFee || 0, emdMode: row.emdMode || '',
      publicationDate: row.publicationDate, preBidMeetingDate: row.preBidMeetingDate || undefined, submissionDeadline: row.submissionDeadline,
      bidValidityDays: row.bidValidityDays || 0, eligibilityCriteria: row.eligibilityCriteria || undefined, technicalScoreThreshold: row.technicalScoreThreshold || 0,
      quotedBidAmount: row.quotedBidAmount ?? undefined, expectedGrossMarginPercent: row.expectedGrossMarginPercent || 0, bidManagerId: row.bidManagerId || '',
      bidManagerName: row.bidManagerName || '', status: row.status, awardDetails: row.awardDetails || undefined, documents: row.documents || [],
      createdAt: row.createdAt, updatedAt: row.updatedAt,
    } as CommercialTender;
  }

  public async updateTenderStatus(
    id: string,
    status: CommercialTender['status'],
    quotedBidAmount?: number,
    awardDetails?: any
  ): Promise<CommercialTender | null> {
    await this.ensureCommercialPersistence();
    const rows = await db.select().from(commercialTenders).where(eq(commercialTenders.id, id)).limit(1);
    if (!rows.length) return null;
    const transitions: Record<string, string[]> = {
      DISCOVERED: ['IN_ESTIMATION', 'CANCELLED'],
      IN_ESTIMATION: ['UNDER_MANAGEMENT_REVIEW', 'CANCELLED'],
      UNDER_MANAGEMENT_REVIEW: ['BID_SUBMITTED', 'CANCELLED'],
      BID_SUBMITTED: ['EVALUATION_STAGE', 'LOST', 'CANCELLED'],
      EVALUATION_STAGE: ['AWARDED', 'LOST', 'CANCELLED'],
      AWARDED: [],
      LOST: [],
      CANCELLED: [],
    };
    if (!transitions[rows[0].status]?.includes(status)) {
      throw new Error(`Invalid tender status transition: ${rows[0].status} → ${status}`);
    }
    const [updated] = await db.update(commercialTenders).set({
      status,
      quotedBidAmount: quotedBidAmount === undefined ? rows[0].quotedBidAmount : Number(quotedBidAmount),
      awardDetails: awardDetails === undefined ? rows[0].awardDetails : awardDetails,
      updatedAt: new Date().toISOString(),
    }).where(eq(commercialTenders.id, id)).returning();
    if (!updated) return null;
    return {
      id: updated.id, tenderRefNumber: updated.tenderRefNumber, tenderTitle: updated.tenderTitle, clientAuthority: updated.clientAuthority,
      clientType: updated.clientType, sector: updated.sector, tenderType: updated.tenderType, estimatedProjectValue: updated.estimatedProjectValue,
      currency: updated.currency, emdAmount: updated.emdAmount || 0, tenderFee: updated.tenderFee || 0, emdMode: updated.emdMode || '',
      publicationDate: updated.publicationDate, preBidMeetingDate: updated.preBidMeetingDate || undefined, submissionDeadline: updated.submissionDeadline,
      bidValidityDays: updated.bidValidityDays || 0, eligibilityCriteria: updated.eligibilityCriteria || undefined, technicalScoreThreshold: updated.technicalScoreThreshold || 0,
      quotedBidAmount: updated.quotedBidAmount ?? undefined, expectedGrossMarginPercent: updated.expectedGrossMarginPercent || 0, bidManagerId: updated.bidManagerId || '',
      bidManagerName: updated.bidManagerName || '', status: updated.status, awardDetails: updated.awardDetails || undefined, documents: updated.documents || [],
      createdAt: updated.createdAt, updatedAt: updated.updatedAt,
    } as CommercialTender;
  }

  // --- Rate Analyses API ---

  // --- Rate Analyses API ---
  public async getRateAnalyses(): Promise<CommercialRateAnalysis[]> {
    await this.ensureCommercialPersistence();
    const rows = await db.select().from(commercialRateAnalyses).orderBy(desc(commercialRateAnalyses.createdAt));
    return rows.map((row) => this.mapRateAnalysis(row));
  }

  public async createRateAnalysis(data: Partial<CommercialRateAnalysis>): Promise<CommercialRateAnalysis> {
    await this.ensureCommercialPersistence();
    if (!data.analysisCode || !data.itemCode || !data.itemDescription || !data.unit || !(data as any).currency) {
      throw new Error('Analysis code, item code, description, unit and currency are required.');
    }
    const mat = Number(data.materialCostPerUnit || 0);
    const lab = Number(data.laborCostPerUnit || 0);
    const mach = Number(data.machineryCostPerUnit || 0);
    const sub = Number(data.subcontractCostPerUnit || 0);
    const overheadPct = Number(data.overheadPercent || 0);
    const profitPct = Number(data.profitPercent || 0);
    if ([mat, lab, mach, sub].some((n) => !Number.isFinite(n) || n < 0) || !Number.isFinite(overheadPct) || overheadPct < 0 || !Number.isFinite(profitPct) || profitPct < 0) {
      throw new Error('Rate analysis costs and percentages must be valid non-negative numbers.');
    }
    const direct = mat + lab + mach + sub;
    const withOverhead = direct + (direct * overheadPct) / 100;
    const quoted = withOverhead + (withOverhead * profitPct) / 100;
    const now = new Date().toISOString();
    const id = `ra-${uuidv4().slice(0, 8)}`;
    await db.insert(commercialRateAnalyses).values({
      id,
      analysisCode: data.analysisCode,
      tenderId: data.tenderId || null,
      boqItemId: (data as any).boqItemId || null,
      itemCode: data.itemCode,
      itemDescription: data.itemDescription,
      unit: data.unit,
      materialCostPerUnit: mat,
      laborCostPerUnit: lab,
      machineryCostPerUnit: mach,
      subcontractCostPerUnit: sub,
      overheadPercent: overheadPct,
      profitPercent: profitPct,
      netRatePerUnit: direct,
      quotedRatePerUnit: Math.round(quoted * 100) / 100,
      componentsBreakdown: data.componentsBreakdown || [],
      currency: String((data as any).currency).toUpperCase(),
      status: data.status || 'DRAFT',
      createdAt: now,
      updatedAt: now,
    });
    const [row] = await db.select().from(commercialRateAnalyses).where(eq(commercialRateAnalyses.id, id)).limit(1);
    if (!row) throw new Error('Rate analysis was not persisted.');
    return this.mapRateAnalysis(row);
  }

  // --- Subcontracts API ---

  // --- Subcontracts API ---
  public async getSubcontracts(): Promise<CommercialSubcontract[]> {
    await this.ensureCommercialPersistence();
    const rows = await db.select().from(commercialSubcontracts).orderBy(desc(commercialSubcontracts.createdAt));
    return rows.map((row) => this.mapSubcontract(row));
  }

  public async createSubcontract(data: Partial<CommercialSubcontract>): Promise<CommercialSubcontract> {
    await this.ensureCommercialPersistence();
    if (!data.agreementNumber || !data.subcontractorName || !data.subcontractorCode || !data.projectId || !data.packageTitle || !data.tradeCategory || !data.contractType || !data.startDate || !(data as any).currency) {
      throw new Error('Subcontract number, subcontractor, project, package, classification, start date and currency are required.');
    }
    const value = Number(data.contractValue);
    if (!Number.isFinite(value) || value <= 0) throw new Error('Contract value must be greater than zero.');
    const retention = Number(data.retentionPercent || 0);
    const advancePct = Number(data.mobilizationAdvancePercent || 0);
    if (retention < 0 || retention > 100 || advancePct < 0 || advancePct > 100) throw new Error('Retention and mobilization percentages must be between 0 and 100.');
    const now = new Date().toISOString();
    const id = `sub-${uuidv4().slice(0, 8)}`;
    await db.insert(commercialSubcontracts).values({
      id, agreementNumber: data.agreementNumber, subcontractorName: data.subcontractorName, subcontractorCode: data.subcontractorCode,
      projectId: data.projectId, projectName: data.projectName || null, contractId: (data as any).contractId || null, wbsId: (data as any).wbsId || null,
      packageTitle: data.packageTitle, tradeCategory: data.tradeCategory, contractType: data.contractType, contractValue: value,
      currency: String((data as any).currency).toUpperCase(), retentionPercent: retention, mobilizationAdvancePercent: advancePct,
      mobilizationAdvancePaid: Number(data.mobilizationAdvancePaid || 0), mobilizationAdvanceRecovered: 0, totalBilledAmount: 0, totalCertifiedAmount: 0,
      totalPaidAmount: 0, totalRetentionWithheld: 0, startDate: data.startDate, completionDate: data.completionDate || null, status: data.status || 'DRAFT',
      performanceRating: data.performanceRating == null ? null : Number(data.performanceRating), complianceDocumentsVerified: Boolean(data.complianceDocumentsVerified),
      notes: data.notes || null, createdAt: now, updatedAt: now,
    });
    const [row] = await db.select().from(commercialSubcontracts).where(eq(commercialSubcontracts.id, id)).limit(1);
    if (!row) throw new Error('Subcontract was not persisted.');
    return this.mapSubcontract(row);
  }

  // --- Subcontract Bills (RA Bills) API ---

  // --- Subcontract Bills (RA Bills) API ---
  public async getSubcontractBills(subcontractId?: string): Promise<CommercialSubcontractBill[]> {
    await this.ensureCommercialPersistence();
    const rows = subcontractId
      ? await db.select().from(commercialSubcontractBills).where(eq(commercialSubcontractBills.subcontractId, subcontractId)).orderBy(desc(commercialSubcontractBills.createdAt))
      : await db.select().from(commercialSubcontractBills).orderBy(desc(commercialSubcontractBills.createdAt));
    return rows.map((row) => this.mapSubcontractBill(row));
  }

  public async createSubcontractBill(data: Partial<CommercialSubcontractBill>): Promise<CommercialSubcontractBill> {
    await this.ensureCommercialPersistence();
    if (!data.subcontractId || !data.billNumber || !data.billPeriodStart || !data.billPeriodEnd || !data.submissionDate || !(data as any).currency) {
      throw new Error('Subcontract, bill number, period, submission date and currency are required.');
    }
    const [parent] = await db.select().from(commercialSubcontracts).where(eq(commercialSubcontracts.id, data.subcontractId)).limit(1);
    if (!parent) throw new Error('Subcontract not found.');
    const gross = Number(data.grossClaimedAmount);
    if (!Number.isFinite(gross) || gross <= 0) throw new Error('Gross claimed amount must be greater than zero.');
    const retentionPct = Number(data.retentionPercent ?? parent.retentionPercent ?? 0);
    const mobilization = Number(data.mobilizationRecovery || 0);
    const deductions = Number(data.otherDeductions || 0);
    if (retentionPct < 0 || retentionPct > 100 || mobilization < 0 || deductions < 0) throw new Error('Bill deduction values are invalid.');
    const now = new Date().toISOString();
    const id = `sb-${uuidv4().slice(0, 8)}`;
    await db.insert(commercialSubcontractBills).values({
      id, subcontractId: parent.id, subcontractNumber: data.subcontractNumber || parent.agreementNumber,
      subcontractorName: data.subcontractorName || parent.subcontractorName, billNumber: data.billNumber,
      billPeriodStart: data.billPeriodStart, billPeriodEnd: data.billPeriodEnd, submissionDate: data.submissionDate,
      grossClaimedAmount: gross, certifiedAmount: 0, currency: String((data as any).currency).toUpperCase(),
      retentionPercent: retentionPct, retentionAmount: 0, mobilizationRecovery: mobilization, otherDeductions: deductions,
      netCertifiedPayable: 0, status: 'SUBMITTED', certifiedBy: null, certifiedDate: null, remarks: data.remarks || null, createdAt: now, updatedAt: now,
    });
    return (await this.getSubcontractBills(parent.id)).find((bill) => bill.id === id)!;
  }

  // --- Subcontract certification ---

  public async certifySubcontractBill(id: string, certifiedAmount: number, status = 'CERTIFIED'): Promise<CommercialSubcontractBill | null> {
    await this.ensureCommercialPersistence();
    const [bill] = await db.select().from(commercialSubcontractBills).where(eq(commercialSubcontractBills.id, id)).limit(1);
    if (!bill) return null;
    if (!['SUBMITTED', 'UNDER_MEASUREMENT'].includes(bill.status)) throw new Error(`Subcontract bill cannot be certified from status ${bill.status}.`);
    const cert = Number(certifiedAmount);
    if (!Number.isFinite(cert) || cert < 0 || cert > bill.grossClaimedAmount) throw new Error('Certified amount is invalid.');
    const retentionAmount = Math.round((cert * (bill.retentionPercent || 0)) / 100 * 100) / 100;
    const net = Math.max(0, cert - retentionAmount - (bill.mobilizationRecovery || 0) - (bill.otherDeductions || 0));
    const certDate = new Date().toISOString().split('T')[0];

    if (status === 'CERTIFIED' && cert > 0) {
      await financeRepository.createAPInvoice({
        invoiceNumber: bill.billNumber,
        vendorName: bill.subcontractorName,
        totalAmount: net,
        taxAmount: 0,
        dueDate: certDate,
      });
      const lines: any[] = [
        { accountCode: '5020', accountName: 'Subcontractor Works Incurred', debitAmount: cert, creditAmount: 0, lineDescription: `Certified subcontract bill ${bill.billNumber}` },
        { accountCode: '2010', accountName: 'Accounts Payable Control - Trade Creditors', debitAmount: 0, creditAmount: net, lineDescription: `Payable for bill ${bill.billNumber}` },
      ];
      if (retentionAmount > 0) lines.push({ accountCode: '2040', accountName: 'Subcontractor Retention Payable', debitAmount: 0, creditAmount: retentionAmount, lineDescription: `Retention for bill ${bill.billNumber}` });
      const deductions = (bill.mobilizationRecovery || 0) + (bill.otherDeductions || 0);
      if (deductions > 0) lines.push({ accountCode: '2060', accountName: 'Client Mobilization Advance', debitAmount: 0, creditAmount: deductions, lineDescription: `Advance/deductions for bill ${bill.billNumber}` });
      const debits = lines.reduce((sum, line) => sum + Number(line.debitAmount || 0), 0);
      const credits = lines.reduce((sum, line) => sum + Number(line.creditAmount || 0), 0);
      if (Math.abs(debits - credits) > 0.01) throw new Error('Subcontract certification journal is not balanced.');
      await financeRepository.createJournalEntry({ voucherType: 'SUBCONTRACT_JOURNAL', postingDate: certDate, referenceNumber: bill.billNumber, narration: `Commercial subcontract certification ${bill.billNumber}` }, lines);
    }

    const [updated] = await db.update(commercialSubcontractBills).set({
      certifiedAmount: cert,
      retentionAmount,
      netCertifiedPayable: net,
      status,
      certifiedBy: status === 'CERTIFIED' ? 'Authenticated workflow actor' : null,
      certifiedDate: status === 'CERTIFIED' ? certDate : null,
      updatedAt: new Date().toISOString(),
    }).where(eq(commercialSubcontractBills.id, id)).returning();

    if (!updated) return null;
    const bills = await this.getSubcontractBills(updated.subcontractId);
    const totals = bills.reduce((a, b) => ({ billed: a.billed + b.grossClaimedAmount, certified: a.certified + b.certifiedAmount, retention: a.retention + b.retentionAmount }), { billed: 0, certified: 0, retention: 0 });
    await db.update(commercialSubcontracts).set({ totalBilledAmount: totals.billed, totalCertifiedAmount: totals.certified, totalRetentionWithheld: totals.retention, updatedAt: new Date().toISOString() }).where(eq(commercialSubcontracts.id, updated.subcontractId));
    return this.mapSubcontractBill(updated);
  }

  // --- Variation Orders & Claims API ---

  // --- Variation Orders & Claims API ---
  public async getVariationOrders(projectId?: string): Promise<CommercialVariationOrder[]> {
    await this.ensureCommercialPersistence();
    const rows = projectId
      ? await db.select().from(commercialVariationOrders).where(eq(commercialVariationOrders.projectId, projectId)).orderBy(desc(commercialVariationOrders.createdAt))
      : await db.select().from(commercialVariationOrders).orderBy(desc(commercialVariationOrders.createdAt));
    return rows.map((row) => this.mapVariation(row));
  }

  public async createVariationOrder(data: Partial<CommercialVariationOrder>): Promise<CommercialVariationOrder> {
    await this.ensureCommercialPersistence();
    if (!data.projectId || !data.voNumber || !data.title || !data.scopeDescription || !data.variationType || !(data as any).currency || !data.submittedDate) {
      throw new Error('Project, VO number, title, scope, variation type, currency and submission date are required.');
    }
    const amount = Number(data.claimedAmount);
    if (!Number.isFinite(amount) || amount < 0) throw new Error('Claimed variation amount must be a valid non-negative number.');
    const now = new Date().toISOString();
    const id = `vo-${uuidv4().slice(0, 8)}`;
    await db.insert(commercialVariationOrders).values({
      id, projectId: data.projectId, projectName: data.projectName || null, contractId: (data as any).contractId || null,
      wbsId: (data as any).wbsId || null, boqItemId: (data as any).boqItemId || null, voNumber: data.voNumber, title: data.title,
      scopeDescription: data.scopeDescription, variationType: data.variationType, claimedAmount: amount, approvedAmount: 0,
      currency: String((data as any).currency).toUpperCase(), timeExtensionDays: Number(data.timeExtensionDays || 0),
      impactOnCriticalPath: Boolean(data.impactOnCriticalPath), status: 'SUBMITTED', clientReference: data.clientReference || null,
      submittedDate: data.submittedDate, approvedDate: null, createdAt: now, updatedAt: now,
    });
    return (await this.getVariationOrders(data.projectId)).find((v) => v.id === id)!;
  }

  public async updateVariationStatus(id: string, status: CommercialVariationOrder['status'], approvedAmount?: number): Promise<CommercialVariationOrder | null> {
    await this.ensureCommercialPersistence();
    const [current] = await db.select().from(commercialVariationOrders).where(eq(commercialVariationOrders.id, id)).limit(1);
    if (!current) return null;
    const transitions: Record<string, string[]> = {
      SUBMITTED: ['CLIENT_REVIEW', 'DISPUTED'],
      CLIENT_REVIEW: ['ENGINEER_APPROVED', 'DISPUTED'],
      ENGINEER_APPROVED: ['FORMALLY_INCORPORATED', 'DISPUTED'],
      DISPUTED: ['CLIENT_REVIEW'],
      FORMALLY_INCORPORATED: [],
    };
    if (!transitions[current.status]?.includes(status)) throw new Error(`Invalid variation status transition: ${current.status} → ${status}`);
    const nextAmount = approvedAmount === undefined ? (current.approvedAmount || 0) : Number(approvedAmount);
    if (!Number.isFinite(nextAmount) || nextAmount < 0 || nextAmount > current.claimedAmount) throw new Error('Approved variation amount is invalid.');
    if (['ENGINEER_APPROVED', 'FORMALLY_INCORPORATED'].includes(status) && current.claimedAmount > 0 && nextAmount === 0) throw new Error('Approved variation amount is required before approval.');
    const [updated] = await db.update(commercialVariationOrders).set({
      status, approvedAmount: nextAmount,
      approvedDate: ['ENGINEER_APPROVED', 'FORMALLY_INCORPORATED'].includes(status) ? new Date().toISOString().split('T')[0] : current.approvedDate,
      updatedAt: new Date().toISOString(),
    }).where(eq(commercialVariationOrders.id, id)).returning();
    return updated ? this.mapVariation(updated) : null;
  }

  // --- Client Interim Payment Certificates (IPC) API ---

  // --- Client Interim Payment Certificates (IPC) API ---
  public async getClientIPCs(projectId?: string): Promise<CommercialClientIPC[]> {
    await this.ensureCommercialPersistence();
    const rows = projectId
      ? await db.select().from(commercialClientIpcs).where(eq(commercialClientIpcs.projectId, projectId)).orderBy(desc(commercialClientIpcs.createdAt))
      : await db.select().from(commercialClientIpcs).orderBy(desc(commercialClientIpcs.createdAt));
    return rows.map((row) => this.mapIPC(row));
  }

  public async createClientIPC(data: Partial<CommercialClientIPC>): Promise<CommercialClientIPC> {
    await this.ensureCommercialPersistence();
    if (!data.projectId || !data.ipcNumber || !data.billingPeriod || !data.submissionDate || !(data as any).currency) {
      throw new Error('Project, IPC number, billing period, submission date and currency are required.');
    }
    const gross = Number(data.grossWorkDoneClaimed);
    const certified = Number(data.grossWorkDoneCertified || 0);
    if (!Number.isFinite(gross) || gross <= 0 || !Number.isFinite(certified) || certified < 0 || certified > gross) throw new Error('IPC claimed/certified amounts are invalid.');
    const materials = Number(data.materialsOnSiteValue || 0);
    const retention = Number(data.retentionDeduction || 0);
    const mob = Number(data.mobilizationRecovery || 0);
    const tds = Number(data.statutoryTDS || 0);
    if ([materials, retention, mob, tds].some((n) => !Number.isFinite(n) || n < 0)) throw new Error('IPC deduction and material values must be valid non-negative numbers.');
    const now = new Date().toISOString();
    const id = `ipc-${uuidv4().slice(0, 8)}`;
    const net = certified + materials - retention - mob - tds;
    await db.insert(commercialClientIpcs).values({
      id, projectId: data.projectId, projectName: data.projectName || null, contractId: (data as any).contractId || null,
      ipcNumber: data.ipcNumber, billingPeriod: data.billingPeriod, grossWorkDoneClaimed: gross, grossWorkDoneCertified: certified,
      materialsOnSiteValue: materials, retentionDeduction: retention, mobilizationRecovery: mob, statutoryTds: tds, netReceivableAmount: net,
      currency: String((data as any).currency).toUpperCase(), status: 'SUBMITTED', submissionDate: data.submissionDate,
      certificationDate: null, dueDate: data.dueDate || null, createdAt: now, updatedAt: now,
    });
    return (await this.getClientIPCs(data.projectId)).find((i) => i.id === id)!;
  }

  public async certifyClientIPC(id: string, certifiedAmount: number, status = 'CERTIFIED'): Promise<CommercialClientIPC | null> {
    await this.ensureCommercialPersistence();
    const [current] = await db.select().from(commercialClientIpcs).where(eq(commercialClientIpcs.id, id)).limit(1);
    if (!current) return null;
    if (!['SUBMITTED', 'CONSULTANT_CHECKED'].includes(current.status)) throw new Error(`Client IPC cannot be certified from status ${current.status}.`);
    const cert = Number(certifiedAmount);
    if (!Number.isFinite(cert) || cert < 0 || cert > current.grossWorkDoneClaimed) throw new Error('Certified IPC amount is invalid.');
    const net = cert + (current.materialsOnSiteValue || 0) - (current.retentionDeduction || 0) - (current.mobilizationRecovery || 0) - (current.statutoryTds || 0);
    const certDate = new Date().toISOString().split('T')[0];

    if (status === 'CERTIFIED' && cert > 0) {
      await financeRepository.createARInvoice({
        invoiceNumber: current.ipcNumber,
        customerName: 'Employer / Client Authority',
        projectId: current.projectId,
        projectName: current.projectName || '',
        totalAmount: net,
        taxAmount: current.statutoryTds || 0,
        dueDate: current.dueDate || certDate,
      });
      const lines: any[] = [
        { accountCode: '1030', accountName: 'Accounts Receivable Control', debitAmount: net, creditAmount: 0, lineDescription: `Net certified receivable for ${current.ipcNumber}` },
        { accountCode: '1040', accountName: 'Contract Retention Receivable', debitAmount: current.retentionDeduction || 0, creditAmount: 0, lineDescription: `Retention on ${current.ipcNumber}` },
      ];
      if ((current.statutoryTds || 0) > 0) lines.push({ accountCode: '2030', accountName: 'Statutory Taxes & Social Security Payable', debitAmount: current.statutoryTds, creditAmount: 0, lineDescription: `TDS on ${current.ipcNumber}` });
      if ((current.mobilizationRecovery || 0) > 0) lines.push({ accountCode: '2060', accountName: 'Client Mobilization Advance', debitAmount: current.mobilizationRecovery, creditAmount: 0, lineDescription: `Mobilization recovery on ${current.ipcNumber}` });
      lines.push({ accountCode: '4010', accountName: 'Construction Contract Revenue (IPC)', debitAmount: 0, creditAmount: cert, lineDescription: `Certified revenue for ${current.ipcNumber}` });
      if ((current.materialsOnSiteValue || 0) > 0) lines.push({ accountCode: '1060', accountName: 'Construction Inventory & Stores', debitAmount: 0, creditAmount: current.materialsOnSiteValue, lineDescription: `Materials on site ${current.ipcNumber}` });
      const debits = lines.reduce((sum, line) => sum + Number(line.debitAmount || 0), 0);
      const credits = lines.reduce((sum, line) => sum + Number(line.creditAmount || 0), 0);
      if (Math.abs(debits - credits) > 0.01) throw new Error('Client IPC journal is not balanced.');
      await financeRepository.createJournalEntry({ voucherType: 'REVENUE_JOURNAL', postingDate: certDate, referenceNumber: current.ipcNumber, narration: `Client IPC revenue recognition ${current.ipcNumber}` }, lines);
    }

    const [updated] = await db.update(commercialClientIpcs).set({
      grossWorkDoneCertified: cert,
      netReceivableAmount: net,
      status,
      certificationDate: status === 'CERTIFIED' ? certDate : null,
      updatedAt: new Date().toISOString(),
    }).where(eq(commercialClientIpcs.id, id)).returning();
    return updated ? this.mapIPC(updated) : null;
  }
}

export const commercialRepository = CommercialRepository.getInstance();
