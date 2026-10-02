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
    return this.tenders;
  }

  public async createTender(data: Partial<CommercialTender>): Promise<CommercialTender> {
    const count = this.tenders.length + 1;
    const now = new Date().toISOString();
    const newTnd: CommercialTender = {
      id: `tnd-${uuidv4().substring(0, 8)}`,
      tenderRefNumber: data.tenderRefNumber || `TND-CORP-2026-${String(80 + count).padStart(3, '0')}`,
      tenderTitle: data.tenderTitle || 'Infrastructure EPC Project Tender',
      clientAuthority: data.clientAuthority || 'National Infrastructure Authority',
      clientType: data.clientType || 'GOVERNMENT',
      sector: data.sector || 'HIGHWAY_ROAD',
      tenderType: data.tenderType || 'EPC_TURNKEY',
      estimatedProjectValue: data.estimatedProjectValue || 50000000,
      currency: data.currency || 'INR',
      emdAmount: data.emdAmount || 1000000,
      tenderFee: data.tenderFee || 20000,
      emdMode: data.emdMode || 'BANK_GUARANTEE',
      publicationDate: data.publicationDate || now.split('T')[0],
      preBidMeetingDate: data.preBidMeetingDate,
      submissionDeadline: data.submissionDeadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      bidValidityDays: data.bidValidityDays || 120,
      eligibilityCriteria: data.eligibilityCriteria,
      technicalScoreThreshold: data.technicalScoreThreshold || 75.0,
      quotedBidAmount: data.quotedBidAmount,
      expectedGrossMarginPercent: data.expectedGrossMarginPercent || 15.0,
      bidManagerId: data.bidManagerId || 'emp-user',
      bidManagerName: data.bidManagerName || 'Bid Director',
      status: 'IN_ESTIMATION',
      documents: data.documents || [],
      createdAt: now,
      updatedAt: now,
    };
    this.tenders.unshift(newTnd);
    return newTnd;
  }

  public async updateTenderStatus(
    id: string,
    status: CommercialTender['status'],
    quotedBidAmount?: number,
    awardDetails?: any
  ): Promise<CommercialTender | null> {
    const tnd = this.tenders.find((t) => t.id === id);
    if (!tnd) return null;
    tnd.status = status;
    if (quotedBidAmount !== undefined) tnd.quotedBidAmount = quotedBidAmount;
    if (awardDetails) tnd.awardDetails = awardDetails;
    tnd.updatedAt = new Date().toISOString();
    return tnd;
  }

  // --- Rate Analyses API ---
  public async getRateAnalyses(): Promise<CommercialRateAnalysis[]> {
    return this.rateAnalyses;
  }

  public async createRateAnalysis(data: Partial<CommercialRateAnalysis>): Promise<CommercialRateAnalysis> {
    const count = this.rateAnalyses.length + 1;
    const now = new Date().toISOString();
    const mat = data.materialCostPerUnit || 0;
    const lab = data.laborCostPerUnit || 0;
    const mach = data.machineryCostPerUnit || 0;
    const sub = data.subcontractCostPerUnit || 0;
    const directCost = mat + lab + mach + sub;
    const overhead = (directCost * (data.overheadPercent || 10)) / 100;
    const costWithOverhead = directCost + overhead;
    const profit = (costWithOverhead * (data.profitPercent || 12)) / 100;
    const quoted = costWithOverhead + profit;

    const newAnalysis: CommercialRateAnalysis = {
      id: `ra-${uuidv4().substring(0, 8)}`,
      analysisCode: data.analysisCode || `RA-BOQ-2026-${String(10 + count).padStart(3, '0')}`,
      tenderId: data.tenderId,
      itemCode: data.itemCode || `BOQ-ITM-${count}`,
      itemDescription: data.itemDescription || 'Standard Construction Item',
      unit: data.unit || 'cum',
      materialCostPerUnit: mat,
      laborCostPerUnit: lab,
      machineryCostPerUnit: mach,
      subcontractCostPerUnit: sub,
      overheadPercent: data.overheadPercent || 10,
      profitPercent: data.profitPercent || 12,
      netRatePerUnit: directCost,
      quotedRatePerUnit: Math.round(quoted * 100) / 100,
      componentsBreakdown: data.componentsBreakdown || [],
      status: 'APPROVED',
      createdAt: now,
      updatedAt: now,
    };
    this.rateAnalyses.unshift(newAnalysis);
    return newAnalysis;
  }

  // --- Subcontracts API ---
  public async getSubcontracts(): Promise<CommercialSubcontract[]> {
    return this.subcontracts;
  }

  public async createSubcontract(data: Partial<CommercialSubcontract>): Promise<CommercialSubcontract> {
    const count = this.subcontracts.length + 1;
    const now = new Date().toISOString();
    const newSub: CommercialSubcontract = {
      id: `sub-${uuidv4().substring(0, 8)}`,
      agreementNumber: data.agreementNumber || `SUB-2026-${String(20 + count).padStart(3, '0')}`,
      subcontractorName: data.subcontractorName || 'Specialist Subcontractor',
      subcontractorCode: data.subcontractorCode || `VND-2026-${String(100 + count).padStart(3, '0')}`,
      projectId: data.projectId || 'p-101',
      projectName: data.projectName || 'Infrastructure Project',
      packageTitle: data.packageTitle || 'Execution Package',
      tradeCategory: data.tradeCategory || 'CIVIL_MASONRY',
      contractType: data.contractType || 'ITEM_RATE_BOQ',
      contractValue: data.contractValue || 10000000,
      retentionPercent: data.retentionPercent || 5.0,
      mobilizationAdvancePercent: data.mobilizationAdvancePercent || 10.0,
      mobilizationAdvancePaid: data.mobilizationAdvancePaid || 0,
      mobilizationAdvanceRecovered: 0,
      totalBilledAmount: 0,
      totalCertifiedAmount: 0,
      totalPaidAmount: 0,
      totalRetentionWithheld: 0,
      startDate: data.startDate || now.split('T')[0],
      completionDate: data.completionDate || new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      status: 'ACTIVE',
      performanceRating: 4.5,
      complianceDocumentsVerified: true,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };
    this.subcontracts.unshift(newSub);
    return newSub;
  }

  // --- Subcontract Bills (RA Bills) API ---
  public async getSubcontractBills(subcontractId?: string): Promise<CommercialSubcontractBill[]> {
    if (subcontractId) {
      return this.subcontractBills.filter(b => b.subcontractId === subcontractId);
    }
    return this.subcontractBills;
  }

  public async createSubcontractBill(data: Partial<CommercialSubcontractBill>): Promise<CommercialSubcontractBill> {
    const count = this.subcontractBills.length + 1;
    const now = new Date().toISOString();
    const gross = data.grossClaimedAmount || 1000000;
    const cert = data.certifiedAmount || gross;
    const retPct = data.retentionPercent || 5.0;
    const retAmt = Math.round((cert * retPct) / 100);
    const mobRec = data.mobilizationRecovery || Math.round(cert * 0.10);
    const ded = data.otherDeductions || 0;
    const net = cert - retAmt - mobRec - ded;

    const newBill: CommercialSubcontractBill = {
      id: `sb-${uuidv4().substring(0, 8)}`,
      subcontractId: data.subcontractId || 'sub-001',
      subcontractNumber: data.subcontractNumber || 'SUB-2026-001',
      subcontractorName: data.subcontractorName || 'Subcontractor Partner',
      billNumber: data.billNumber || `RA-0${count}`,
      billPeriodStart: data.billPeriodStart || now.split('T')[0],
      billPeriodEnd: data.billPeriodEnd || now.split('T')[0],
      submissionDate: data.submissionDate || now.split('T')[0],
      grossClaimedAmount: gross,
      certifiedAmount: cert,
      retentionPercent: retPct,
      retentionAmount: retAmt,
      mobilizationRecovery: mobRec,
      otherDeductions: ded,
      netCertifiedPayable: net,
      status: data.status || 'SUBMITTED',
      remarks: data.remarks,
      createdAt: now,
    };
    this.subcontractBills.unshift(newBill);

    // Update subcontract totals
    const parentSub = this.subcontracts.find(s => s.id === newBill.subcontractId);
    if (parentSub) {
      parentSub.totalBilledAmount += gross;
      parentSub.totalCertifiedAmount += cert;
      parentSub.totalRetentionWithheld += retAmt;
      parentSub.mobilizationAdvanceRecovered += mobRec;
    }

    return newBill;
  }

  public async certifySubcontractBill(id: string, certifiedAmount: number, status = 'CERTIFIED'): Promise<CommercialSubcontractBill | null> {
    const bill = this.subcontractBills.find(b => b.id === id);
    if (!bill) return null;
    bill.certifiedAmount = certifiedAmount;
    bill.retentionAmount = Math.round((certifiedAmount * bill.retentionPercent) / 100);
    bill.netCertifiedPayable = certifiedAmount - bill.retentionAmount - bill.mobilizationRecovery - bill.otherDeductions;
    bill.status = status as any;
    bill.certifiedDate = new Date().toISOString().split('T')[0];
    bill.certifiedBy = 'Commercial Manager';

    // Cross-Module Integration: Post Subcontract Certified Bill to Finance AP & GL
    if (status === 'CERTIFIED' && certifiedAmount > 0) {
      try {
        await financeRepository.createAPInvoice({
          invoiceNumber: bill.billNumber,
          vendorName: bill.subcontractorName,
          totalAmount: bill.netCertifiedPayable,
          taxAmount: 0,
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        });

        const jvLines: any[] = [
          {
            accountCode: '5020',
            accountName: 'Subcontractor Works Incurred',
            debitAmount: certifiedAmount,
            creditAmount: 0,
            lineDescription: `Certified subcontract bill ${bill.billNumber} (${bill.subcontractorName})`,
          },
          {
            accountCode: '2010',
            accountName: 'Accounts Payable Control - Trade Creditors',
            debitAmount: 0,
            creditAmount: bill.netCertifiedPayable,
            lineDescription: `Trade payable for bill ${bill.billNumber}`,
          },
        ];

        if (bill.retentionAmount > 0) {
          jvLines.push({
            accountCode: '2040',
            accountName: 'Subcontractor Retention Payable',
            debitAmount: 0,
            creditAmount: bill.retentionAmount,
            lineDescription: `Retention deduction withheld (${bill.retentionPercent}%)`,
          });
        }

        const advanceAndDeductions = (bill.mobilizationRecovery || 0) + (bill.otherDeductions || 0);
        if (advanceAndDeductions > 0) {
          jvLines.push({
            accountCode: '2060',
            accountName: 'Client Mobilization Advance',
            debitAmount: 0,
            creditAmount: advanceAndDeductions,
            lineDescription: `Advance recovery / deductions for bill ${bill.billNumber}`,
          });
        }

        await financeRepository.createJournalEntry(
          {
            voucherType: 'SUBCONTRACT_JOURNAL',
            postingDate: bill.certifiedDate,
            referenceNumber: bill.billNumber,
            narration: `Commercial Subcontract certification for ${bill.subcontractorName} (${bill.billNumber})`,
          },
          jvLines
        );
      } catch (err) {
        console.warn('[Commercial->Finance] Subcontract bill certification JV notice:', err);
      }
    }

    return bill;
  }

  // --- Variation Orders & Claims API ---
  public async getVariationOrders(projectId?: string): Promise<CommercialVariationOrder[]> {
    if (projectId) {
      return this.variationOrders.filter(v => v.projectId === projectId);
    }
    return this.variationOrders;
  }

  public async createVariationOrder(data: Partial<CommercialVariationOrder>): Promise<CommercialVariationOrder> {
    const count = this.variationOrders.length + 1;
    const now = new Date().toISOString();
    const newVO: CommercialVariationOrder = {
      id: `vo-${uuidv4().substring(0, 8)}`,
      projectId: data.projectId || 'p-101',
      projectName: data.projectName || 'Infrastructure Project',
      voNumber: data.voNumber || `VO-SITE-${String(count).padStart(3, '0')}`,
      title: data.title || 'Site Variation Order',
      scopeDescription: data.scopeDescription || 'Authorized variation to original contract BOQ scope',
      variationType: data.variationType || 'ADDITION',
      claimedAmount: data.claimedAmount || 500000,
      approvedAmount: data.approvedAmount || 0,
      timeExtensionDays: data.timeExtensionDays || 0,
      impactOnCriticalPath: data.impactOnCriticalPath || false,
      status: data.status || 'SUBMITTED',
      clientReference: data.clientReference,
      submittedDate: data.submittedDate || now.split('T')[0],
      createdAt: now,
    };
    this.variationOrders.unshift(newVO);
    return newVO;
  }

  public async updateVariationStatus(id: string, status: any, approvedAmount?: number): Promise<CommercialVariationOrder | null> {
    const vo = this.variationOrders.find(v => v.id === id);
    if (!vo) return null;
    vo.status = status;
    if (approvedAmount !== undefined) vo.approvedAmount = approvedAmount;
    if (status === 'ENGINEER_APPROVED' || status === 'FORMALLY_INCORPORATED') {
      vo.approvedDate = new Date().toISOString().split('T')[0];
    }
    return vo;
  }

  // --- Client Interim Payment Certificates (IPC) API ---
  public async getClientIPCs(projectId?: string): Promise<CommercialClientIPC[]> {
    if (projectId) {
      return this.clientIPCs.filter(i => i.projectId === projectId);
    }
    return this.clientIPCs;
  }

  public async createClientIPC(data: Partial<CommercialClientIPC>): Promise<CommercialClientIPC> {
    const count = this.clientIPCs.length + 1;
    const now = new Date().toISOString();
    const gross = data.grossWorkDoneClaimed || 10000000;
    const cert = data.grossWorkDoneCertified || gross;
    const mos = data.materialsOnSiteValue || 0;
    const ret = data.retentionDeduction || Math.round(cert * 0.05);
    const mob = data.mobilizationRecovery || Math.round(cert * 0.10);
    const tds = data.statutoryTDS || Math.round(cert * 0.02);
    const net = cert + mos - ret - mob - tds;

    const newIPC: CommercialClientIPC = {
      id: `ipc-${uuidv4().substring(0, 8)}`,
      projectId: data.projectId || 'p-101',
      projectName: data.projectName || 'Infrastructure Project',
      ipcNumber: data.ipcNumber || `IPC-0${count}`,
      billingPeriod: data.billingPeriod || 'Current Month',
      grossWorkDoneClaimed: gross,
      grossWorkDoneCertified: cert,
      materialsOnSiteValue: mos,
      retentionDeduction: ret,
      mobilizationRecovery: mob,
      statutoryTDS: tds,
      netReceivableAmount: net,
      status: data.status || 'SUBMITTED',
      submissionDate: data.submissionDate || now.split('T')[0],
      dueDate: data.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      createdAt: now,
    };
    this.clientIPCs.unshift(newIPC);
    return newIPC;
  }

  public async certifyClientIPC(id: string, certifiedAmount: number, status = 'CERTIFIED'): Promise<CommercialClientIPC | null> {
    const ipc = this.clientIPCs.find(i => i.id === id);
    if (!ipc) return null;
    ipc.grossWorkDoneCertified = certifiedAmount;
    ipc.retentionDeduction = Math.round(certifiedAmount * 0.05);
    ipc.mobilizationRecovery = Math.round(certifiedAmount * 0.10);
    ipc.statutoryTDS = Math.round(certifiedAmount * 0.02);
    ipc.netReceivableAmount = certifiedAmount + ipc.materialsOnSiteValue - ipc.retentionDeduction - ipc.mobilizationRecovery - ipc.statutoryTDS;
    ipc.status = status as any;
    ipc.certificationDate = new Date().toISOString().split('T')[0];

    // Cross-Module Integration: Post Certified Client IPC to Finance AR & GL Revenue Recognition
    if (status === 'CERTIFIED' && certifiedAmount > 0) {
      try {
        await financeRepository.createARInvoice({
          invoiceNumber: ipc.ipcNumber,
          customerName: 'Employer / Client Authority',
          projectId: ipc.projectId,
          projectName: ipc.projectName,
          totalAmount: ipc.netReceivableAmount,
          taxAmount: ipc.statutoryTDS,
          dueDate: ipc.dueDate,
        });

        // Double-entry balancing:
        // Dr. 1030 Accounts Receivable Control: netReceivableAmount
        // Dr. 1040 Contract Retention Receivable: retentionDeduction
        // Dr. 2030 Statutory Taxes & Social Security Payable: statutoryTDS
        // Dr. 2060 Client Mobilization Advance: mobilizationRecovery
        // Cr. 4010 Construction Contract Revenue (IPC): certifiedAmount
        // Cr. 1060 Construction Inventory & Stores: materialsOnSiteValue
        const jvLines: any[] = [
          {
            accountCode: '1030',
            accountName: 'Accounts Receivable Control',
            debitAmount: ipc.netReceivableAmount,
            creditAmount: 0,
            lineDescription: `Net certified claim receivable for ${ipc.ipcNumber}`,
          },
          {
            accountCode: '1040',
            accountName: 'Contract Retention Receivable',
            debitAmount: ipc.retentionDeduction,
            creditAmount: 0,
            lineDescription: `Retention deduction withheld by client (5%)`,
          },
        ];

        if (ipc.statutoryTDS > 0) {
          jvLines.push({
            accountCode: '2030',
            accountName: 'Statutory Taxes & Social Security Payable',
            debitAmount: ipc.statutoryTDS,
            creditAmount: 0,
            lineDescription: `Statutory TDS withheld on ${ipc.ipcNumber}`,
          });
        }

        if (ipc.mobilizationRecovery > 0) {
          jvLines.push({
            accountCode: '2060',
            accountName: 'Client Mobilization Advance',
            debitAmount: ipc.mobilizationRecovery,
            creditAmount: 0,
            lineDescription: `Mobilization advance recovery on ${ipc.ipcNumber}`,
          });
        }

        jvLines.push({
          accountCode: '4010',
          accountName: 'Construction Contract Revenue (IPC)',
          debitAmount: 0,
          creditAmount: certifiedAmount,
          lineDescription: `Progress revenue certified under IPC ${ipc.ipcNumber} (${ipc.projectName})`,
        });

        if (ipc.materialsOnSiteValue > 0) {
          jvLines.push({
            accountCode: '1060',
            accountName: 'Construction Inventory & Stores',
            debitAmount: 0,
            creditAmount: ipc.materialsOnSiteValue,
            lineDescription: `Materials on site recovery for ${ipc.ipcNumber}`,
          });
        }

        await financeRepository.createJournalEntry(
          {
            voucherType: 'REVENUE_JOURNAL',
            postingDate: ipc.certificationDate,
            referenceNumber: ipc.ipcNumber,
            narration: `Client IPC Revenue recognition for ${ipc.ipcNumber} - Project ${ipc.projectName}`,
          },
          jvLines
        );
      } catch (err) {
        console.warn('[Commercial->Finance] Client IPC certification JV notice:', err);
      }
    }

    return ipc;
  }
}

export const commercialRepository = CommercialRepository.getInstance();
