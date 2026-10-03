import { 
  Vendor, 
  RFQ, 
  VendorQuotation, 
  PurchaseRequisition, 
  PurchaseOrder, 
  GoodsReceiptNote, 
  SubcontractWorkOrder, 
  BOQItem, 
  MeasurementEntry, 
  TenderRecord, 
  ProjectCostControl,
  MaterialRequest,
  RABillRecord
} from '../types/procurement';

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'vnd_01',
    vendorCode: 'VND-2026-001',
    name: 'Larsen Steel & Infra Supplies Ltd',
    category: 'Civil & Structural Materials',
    gstin: '27AAACL1234H1Z5',
    pan: 'AAACL1234H',
    address: 'Plot 42, Heavy Industrial Estate, Thane West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400604',
    contactPersons: [
      { id: 'cp_1', name: 'Rajesh Sharma', email: 'rajesh.sharma@larsensteel.com', phone: '+91 98201 44552', designation: 'General Sales Manager' },
      { id: 'cp_2', name: 'Sunita Patel', email: 'accounts@larsensteel.com', phone: '+91 98201 44553', designation: 'Billing Executive' }
    ],
    bankDetails: {
      bankName: 'HDFC Bank',
      accountNumber: '50200012948571',
      ifscCode: 'HDFC0000123',
      branchName: 'Fort Main Branch'
    },
    paymentTerms: 'Net 30 Days',
    creditPeriodDays: 30,
    rating: 4.8,
    status: 'Approved',
    documents: [
      { id: 'doc_1', name: 'GST Certificate', type: 'PDF', uploadedDate: '2026-01-15' },
      { id: 'doc_2', name: 'MSME Registration', type: 'PDF', uploadedDate: '2026-01-15' }
    ],
    performance: {
      totalOrders: 38,
      onTimeDeliveryRate: 97.4,
      qualityComplianceRate: 99.1,
      lastEvaluatedDate: '2026-07-20',
      remarks: 'Tier-1 Supplier. Excellent delivery compliance for TMT bars and structural steel sections.'
    },
    createdAt: '2025-11-10'
  },
  {
    id: 'vnd_02',
    vendorCode: 'VND-2026-002',
    name: 'HydroPiping Technologies Pvt Ltd',
    category: 'Mechanical & Piping Components',
    gstin: '33AABCH9876K1Z9',
    pan: 'AABCH9876K',
    address: '14 Industrial Corridor, Guindy Industrial Estate',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600032',
    contactPersons: [
      { id: 'cp_3', name: 'Karthik Subramanian', email: 'karthik@hydropiping.in', phone: '+91 94440 12890', designation: 'Technical Sales Lead' }
    ],
    bankDetails: {
      bankName: 'State Bank of India',
      accountNumber: '310928471029',
      ifscCode: 'SBIN0000800',
      branchName: 'Guindy Industrial Branch'
    },
    paymentTerms: '50% Advance, 50% on Delivery',
    creditPeriodDays: 15,
    rating: 4.5,
    status: 'Approved',
    documents: [
      { id: 'doc_3', name: 'ISO 9001 Quality Certificate', type: 'PDF', uploadedDate: '2026-02-01' }
    ],
    performance: {
      totalOrders: 24,
      onTimeDeliveryRate: 94.0,
      qualityComplianceRate: 98.0,
      lastEvaluatedDate: '2026-07-15',
      remarks: 'High quality seamless carbon steel pipes and flanges. Minor lead time variability.'
    },
    createdAt: '2025-12-01'
  },
  {
    id: 'vnd_03',
    vendorCode: 'VND-2026-003',
    name: 'Apex Cranes & Heavy Rigging Corp',
    category: 'Heavy Equipment & Rental',
    gstin: '29AAACA4321J1Z2',
    pan: 'AAACA4321J',
    address: '77 Logistics Park, Peenya 3rd Stage',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560058',
    contactPersons: [
      { id: 'cp_4', name: 'Anil Hegde', email: 'anil@apexcranes.com', phone: '+91 98450 77112', designation: 'Fleet Hire Specialist' }
    ],
    bankDetails: {
      bankName: 'ICICI Bank',
      accountNumber: '000905012389',
      ifscCode: 'ICIC0000009',
      branchName: 'Peenya Branch'
    },
    paymentTerms: 'Net 45 Days',
    creditPeriodDays: 45,
    rating: 4.7,
    status: 'Approved',
    documents: [
      { id: 'doc_4', name: 'Third Party Fitness Certification', type: 'PDF', uploadedDate: '2026-03-10' }
    ],
    performance: {
      totalOrders: 19,
      onTimeDeliveryRate: 98.0,
      qualityComplianceRate: 96.5,
      lastEvaluatedDate: '2026-07-28',
      remarks: 'Mobilized 150-Ton Crawler Crane on schedule. Outstanding safety and maintenance records.'
    },
    createdAt: '2026-01-05'
  },
  {
    id: 'vnd_04',
    vendorCode: 'VND-2026-004',
    name: 'Schneider Power & Cables Ltd',
    category: 'Electrical & Instrumentation',
    gstin: '07AAACS5544B1Z8',
    pan: 'AAACS5544B',
    address: '88 Okhla Industrial Area Phase III',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110020',
    contactPersons: [
      { id: 'cp_5', name: 'Vikram Mehta', email: 'v.mehta@schneiderpower.co.in', phone: '+91 98110 33441', designation: 'Enterprise Account Manager' }
    ],
    bankDetails: {
      bankName: 'Axis Bank',
      accountNumber: '91202003948123',
      ifscCode: 'UTIB0000100',
      branchName: 'Okhla Phase 3'
    },
    paymentTerms: 'Net 30 Days',
    creditPeriodDays: 30,
    rating: 4.6,
    status: 'Approved',
    documents: [
      { id: 'doc_5', name: 'CPRI Test Certificate', type: 'PDF', uploadedDate: '2026-04-12' }
    ],
    performance: {
      totalOrders: 15,
      onTimeDeliveryRate: 92.5,
      qualityComplianceRate: 99.5,
      lastEvaluatedDate: '2026-07-10',
      remarks: 'HT Armoured Cables and Motor Control Center panels comply with strict CPRI standards.'
    },
    createdAt: '2026-02-18'
  },
  {
    id: 'vnd_05',
    vendorCode: 'VND-2026-005',
    name: 'Vanguard Civil Subcontractors',
    category: 'Subcontracting Services',
    gstin: '32AABCV6677L1Z4',
    pan: 'AABCV6677L',
    address: '3/102 Subcontractor Arcade, Kalamassery',
    city: 'Kochi',
    state: 'Kerala',
    pincode: '683104',
    contactPersons: [
      { id: 'cp_6', name: 'Mathew Thomas', email: 'mathew@vanguardcivil.in', phone: '+91 94470 88990', designation: 'Managing Director' }
    ],
    bankDetails: {
      bankName: 'Federal Bank',
      accountNumber: '100402008912',
      ifscCode: 'FDRL0001004',
      branchName: 'Kalamassery'
    },
    paymentTerms: 'Running Bill 15 Days',
    creditPeriodDays: 15,
    rating: 4.2,
    status: 'Approved',
    documents: [
      { id: 'doc_6', name: 'Labor Welfare Registration', type: 'PDF', uploadedDate: '2026-03-01' }
    ],
    performance: {
      totalOrders: 11,
      onTimeDeliveryRate: 90.0,
      qualityComplianceRate: 94.0,
      lastEvaluatedDate: '2026-06-30',
      remarks: 'Specialized RCC pier shuttering & excavation workforce.'
    },
    createdAt: '2026-02-22'
  }
];

export const INITIAL_RFQS: RFQ[] = [
  {
    id: 'rfq_01',
    rfqCode: 'RFQ-2026-089',
    title: 'High-Tensile Structural Steel Flanges & Fasteners Procurement',
    projectId: 'prj_01',
    projectName: 'Peruvannamuzhi WTP Pipe Network',
    invitedVendorIds: ['vnd_01', 'vnd_02'],
    invitedVendorNames: ['Larsen Steel & Infra Supplies Ltd', 'HydroPiping Technologies Pvt Ltd'],
    dueDate: '2026-08-15',
    status: 'Under Evaluation',
    approvalStatus: 'Approved for Release',
    createdDate: '2026-07-25',
    createdByName: 'Abdul Vajid EK',
    attachments: ['Structural_Specs_Rev4.pdf', 'Torque_Requirements.pdf'],
    items: [
      { id: 'rfqi_1', itemCode: 'INV-STL-001', description: 'IS 2062 Grade E250 Steel Plates 25mm', unit: 'MT', quantity: 45, estimatedUnitPriceUSD: 950 },
      { id: 'rfqi_2', itemCode: 'INV-FST-002', description: 'M24 High Strength Friction Grip (HSFG) Bolts Grade 10.9', unit: 'Pcs', quantity: 2400, estimatedUnitPriceUSD: 8.5 }
    ]
  },
  {
    id: 'rfq_02',
    rfqCode: 'RFQ-2026-090',
    title: 'Substation HT Power Cable & Switchgear Enclosures',
    projectId: 'prj_02',
    projectName: 'Water Transmission Main & Intake Pump House',
    invitedVendorIds: ['vnd_04'],
    invitedVendorNames: ['Schneider Power & Cables Ltd'],
    dueDate: '2026-08-20',
    status: 'Published',
    approvalStatus: 'Approved for Release',
    createdDate: '2026-07-28',
    createdByName: 'Robert Vance',
    attachments: ['Cable_Schedule_PumpHouse.xlsx'],
    items: [
      { id: 'rfqi_3', itemCode: 'INV-ELE-008', description: '11kV 3C x 300 sq.mm XLPE Armoured HT Cable', unit: 'Meters', quantity: 1200, estimatedUnitPriceUSD: 65 }
    ]
  }
];

export const INITIAL_QUOTATIONS: VendorQuotation[] = [
  {
    id: 'qte_01',
    quotationNo: 'LSS-QT-2026-401',
    rfqId: 'rfq_01',
    vendorId: 'vnd_01',
    vendorName: 'Larsen Steel & Infra Supplies Ltd',
    submittedDate: '2026-07-29',
    subtotalUSD: 63150,
    taxUSD: 11367,
    freightUSD: 1200,
    netTotalUSD: 75717,
    leadTimeDays: 7,
    warrantyMonths: 24,
    deliverySchedule: 'Immediate dispatch within 7 days of PO confirmation.',
    technicalCompliance: 'Compliant',
    technicalRemarks: 'Test certificates will be provided from NABL accredited lab for Grade E250.',
    commercialCompliance: 'Fully Accepted',
    commercialRemarks: 'Standard Net 30 days payment term accepted.',
    isL1Bidder: true,
    items: [
      { rfqItemId: 'rfqi_1', itemCode: 'INV-STL-001', description: 'IS 2062 Grade E250 Steel Plates 25mm', unit: 'MT', quantity: 45, unitRateUSD: 910, gstPercent: 18, discountPercent: 2, totalAmountUSD: 40131 },
      { rfqItemId: 'rfqi_2', itemCode: 'INV-FST-002', description: 'M24 High Strength Friction Grip (HSFG) Bolts Grade 10.9', unit: 'Pcs', quantity: 2400, unitRateUSD: 7.9, gstPercent: 18, discountPercent: 0, totalAmountUSD: 22372.8 }
    ]
  },
  {
    id: 'qte_02',
    quotationNo: 'HPT-QT-2026-88',
    rfqId: 'rfq_01',
    vendorId: 'vnd_02',
    vendorName: 'HydroPiping Technologies Pvt Ltd',
    submittedDate: '2026-07-30',
    subtotalUSD: 67200,
    taxUSD: 12096,
    freightUSD: 1800,
    netTotalUSD: 81096,
    leadTimeDays: 14,
    warrantyMonths: 18,
    deliverySchedule: '2 equal consignments over 14 days.',
    technicalCompliance: 'Compliant',
    technicalRemarks: 'Mill test certificates provided.',
    commercialCompliance: 'Conditional',
    commercialRemarks: 'Requesting 20% advance upon PO issuance.',
    isL1Bidder: false,
    items: [
      { rfqItemId: 'rfqi_1', itemCode: 'INV-STL-001', description: 'IS 2062 Grade E250 Steel Plates 25mm', unit: 'MT', quantity: 45, unitRateUSD: 980, gstPercent: 18, discountPercent: 0, totalAmountUSD: 44100 },
      { rfqItemId: 'rfqi_2', itemCode: 'INV-FST-002', description: 'M24 High Strength Friction Grip (HSFG) Bolts Grade 10.9', unit: 'Pcs', quantity: 2400, unitRateUSD: 8.4, gstPercent: 18, discountPercent: 0, totalAmountUSD: 20160 }
    ]
  }
];

export const INITIAL_PURCHASE_REQUISITIONS: PurchaseRequisition[] = [
  {
    id: 'pr_01',
    prNumber: 'PR-2026-042',
    projectId: 'prj_01',
    projectName: 'Peruvannamuzhi WTP Pipe Network',
    siteName: 'Thane North Pier Site',
    requestedByName: 'Abdul Vajid EK',
    department: 'Site Engineering & Stores',
    urgency: 'Urgent',
    status: 'Approved',
    createdDate: '2026-07-20',
    requiredByDate: '2026-08-10',
    budgetAllocatedUSD: 85000,
    remarks: 'Urgent requirement of steel plates and HSFG bolts for Pier 14 steel girder assembly.',
    verifiedByName: 'Robert Vance',
    approvedByName: 'Abdul Vajid EK',
    items: [
      { id: 'pri_1', itemCode: 'INV-STL-001', description: 'IS 2062 Grade E250 Steel Plates 25mm', unit: 'MT', requisitionQty: 45, availableStockQty: 4, estimatedRateUSD: 950, totalEstimatedUSD: 42750, storeLocation: 'Central Store Bay A' },
      { id: 'pri_2', itemCode: 'INV-FST-002', description: 'M24 HSFG Bolts Grade 10.9', unit: 'Pcs', requisitionQty: 2400, availableStockQty: 120, estimatedRateUSD: 8.5, totalEstimatedUSD: 20400, storeLocation: 'Central Store Shelf 12' }
    ]
  },
  {
    id: 'pr_02',
    prNumber: 'PR-2026-043',
    projectId: 'prj_02',
    projectName: 'Water Transmission Main & Intake Pump House',
    siteName: 'WTP Main Gate Store',
    requestedByName: 'Marcus Brody',
    department: 'Piping & Fabrication',
    urgency: 'Normal',
    status: 'Submitted',
    createdDate: '2026-07-29',
    requiredByDate: '2026-08-25',
    budgetAllocatedUSD: 60000,
    remarks: 'Seamless Carbon Steel ASTM A106 Grade B pipes for refinery rack header.',
    verifiedByName: 'Robert Vance',
    items: [
      { id: 'pri_3', itemCode: 'INV-PIP-005', description: '6 inch Sch 40 Seamless CS Pipe ASTM A106', unit: 'Meters', requisitionQty: 600, availableStockQty: 45, estimatedRateUSD: 85, totalEstimatedUSD: 51000, storeLocation: 'Yard Yard 2' }
    ]
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po_01',
    poNumber: 'PO-2026-015',
    prId: 'pr_01',
    rfqId: 'rfq_01',
    vendorId: 'vnd_01',
    vendorName: 'Larsen Steel & Infra Supplies Ltd',
    vendorCode: 'VND-2026-001',
    vendorGstin: '27AAACL1234H1Z5',
    projectId: 'prj_01',
    projectName: 'Peruvannamuzhi WTP Pipe Network',
    siteAddress: 'Pier Site P14, Eastern Express Highway, Thane West, Maharashtra',
    poDate: '2026-07-31',
    deliveryDueDate: '2026-08-08',
    paymentTerms: 'Net 30 Days from date of GRN clearance',
    freightTerms: 'FOR Destination Pier P14 Site Store',
    subtotalUSD: 63150,
    discountUSD: 1263,
    gstUSD: 11139.66,
    freightUSD: 1200,
    netAmountUSD: 74226.66,
    status: 'Issued',
    approvalStatus: 'Approved',
    issuedByName: 'Abdul Vajid EK',
    approvedByName: 'Abdul Vajid EK',
    termsAndConditions: '1. All steel plates must be certified with MTC as per IS 2062.\n2. Inspection by third-party auditor required before unloading.\n3. Late delivery penalty 0.5% per week up to max 5%.',
    items: [
      { id: 'poi_1', itemCode: 'INV-STL-001', description: 'IS 2062 Grade E250 Steel Plates 25mm', unit: 'MT', quantity: 45, unitPriceUSD: 910, gstPercent: 18, discountPercent: 2, totalAmountUSD: 40131 },
      { id: 'poi_2', itemCode: 'INV-FST-002', description: 'M24 High Strength Friction Grip (HSFG) Bolts Grade 10.9', unit: 'Pcs', quantity: 2400, unitPriceUSD: 7.9, gstPercent: 18, discountPercent: 0, totalAmountUSD: 18960 }
    ]
  },
  {
    id: 'po_02',
    poNumber: 'PO-2026-016',
    vendorId: 'vnd_03',
    vendorName: 'Apex Cranes & Heavy Rigging Corp',
    vendorCode: 'VND-2026-003',
    vendorGstin: '29AAACA4321J1Z2',
    projectId: 'prj_01',
    projectName: 'Peruvannamuzhi WTP Pipe Network',
    siteAddress: 'Overpass Span 4 Heavy Lifting Zone',
    poDate: '2026-07-15',
    deliveryDueDate: '2026-07-22',
    paymentTerms: 'Net 45 Days',
    freightTerms: 'Owner Mobilization Included',
    subtotalUSD: 35000,
    discountUSD: 0,
    gstUSD: 6300,
    freightUSD: 0,
    netAmountUSD: 41300,
    status: 'Completed',
    approvalStatus: 'Approved',
    issuedByName: 'Robert Vance',
    approvedByName: 'Abdul Vajid EK',
    termsAndConditions: '1. Operator must carry valid heavy rigging operator licenses.',
    items: [
      { id: 'poi_3', itemCode: 'RENT-CRN-150', description: '150-Ton Crawler Crane Monthly Heavy Mobilization Hire', unit: 'Month', quantity: 1, unitPriceUSD: 35000, gstPercent: 18, discountPercent: 0, totalAmountUSD: 35000 }
    ]
  }
];

export const INITIAL_GRNS: GoodsReceiptNote[] = [
  {
    id: 'grn_01',
    grnNumber: 'GRN-2026-104',
    poId: 'po_01',
    poNumber: 'PO-2026-015',
    vendorId: 'vnd_01',
    vendorName: 'Larsen Steel & Infra Supplies Ltd',
    projectId: 'prj_01',
    projectName: 'Peruvannamuzhi WTP Pipe Network',
    warehouseId: 'wh-central',
    warehouseName: 'Central Mechanical Store Bay 1',
    receivedDate: '2026-08-01',
    challanNo: 'LSS-DC-9921',
    challanDate: '2026-07-31',
    inspectedByName: 'Vikram Singh (Site Incharge)',
    qualityStatus: 'Passed',
    stockUpdated: true,
    remarks: 'All 45 MT steel plates physical dimensions verified. Ultrasonic flaw test certificate clear.',
    items: [
      { id: 'grni_1', poItemId: 'poi_1', itemCode: 'INV-STL-001', description: 'IS 2062 Grade E250 Steel Plates 25mm', unit: 'MT', poQty: 45, receivedQty: 45, acceptedQty: 45, rejectedQty: 0, returnedQty: 0, remarks: 'Verified NABL test report ok.' },
      { id: 'grni_2', poItemId: 'poi_2', itemCode: 'INV-FST-002', description: 'M24 High Strength Friction Grip (HSFG) Bolts Grade 10.9', unit: 'Pcs', poQty: 2400, receivedQty: 2400, acceptedQty: 2380, rejectedQty: 20, returnedQty: 20, remarks: '20 pcs thread damaged during transit.' }
    ]
  }
];

export const INITIAL_WORK_ORDERS: SubcontractWorkOrder[] = [
  {
    id: 'wo_01',
    woNumber: 'WO-2026-008',
    title: 'Pier P14 & P15 High-Rise Steel Structure Fabrication & Erection',
    category: 'Mechanical Work Order',
    projectId: 'prj_01',
    projectName: 'Peruvannamuzhi WTP Pipe Network',
    contractorName: 'Vanguard Civil Subcontractors',
    contractorCode: 'VND-2026-005',
    startDate: '2026-06-01',
    targetCompletionDate: '2026-09-30',
    contractValueUSD: 185000,
    revisedValueUSD: 197000,
    executedValueUSD: 124000,
    status: 'Under Execution',
    scopeOfWork: 'Complete erection, NDT weld testing, alignment, and final torque tightening of 420 MT structural steel girders across Spans 3 & 4.',
    attachments: ['WPS_Weld_Procedure_Rev2.pdf', 'Safety_Heights_Permit.pdf'],
    variations: [
      { id: 'var_1', variationCode: 'VO-01', title: 'Additional Ultrasonic Testing at Pier P14 Splice Joints', description: 'Extra NDT testing mandatory by Water Resources Quality Inspectorate.', amountChangeUSD: 12000, status: 'Approved', approvedDate: '2026-07-10' }
    ],
    completionCertificate: undefined
  },
  {
    id: 'wo_02',
    woNumber: 'WO-2026-009',
    title: 'Intake Pump House Foundation RCC & Deep Excavation Package',
    category: 'Civil Work Order',
    projectId: 'prj_02',
    projectName: 'Water Transmission Main & Intake Pump House',
    contractorName: 'Vanguard Civil Subcontractors',
    contractorCode: 'VND-2026-005',
    startDate: '2026-05-15',
    targetCompletionDate: '2026-08-15',
    contractValueUSD: 240000,
    revisedValueUSD: 240000,
    executedValueUSD: 240000,
    status: 'Completed',
    scopeOfWork: 'Excavation of 8500 Cum earth, M30 RCC foundation pedestals, anchor bolt embedding.',
    attachments: ['Structural_Drawing_PumpHouse_R1.pdf'],
    variations: [],
    completionCertificate: {
      certificateNo: 'CC-2026-REF-04',
      completionDate: '2026-07-25',
      certifiedValueUSD: 240000,
      retainageAmountUSD: 12000,
      certifiedByName: 'Robert Vance',
      status: 'Issued'
    }
  }
];

export const INITIAL_BOQ_ITEMS: BOQItem[] = [
  {
    id: 'boq_01',
    itemCode: 'BOQ-MEC-014',
    projectId: 'prj_01',
    projectName: 'Peruvannamuzhi WTP Pipe Network',
    category: 'Structural Fabrication',
    description: 'Fabrication, alignment & erection of structural steel girders IS 2062 Grade E250 including 100% Radiography and Ultrasonic Weld Tests.',
    unit: 'MT',
    quantity: 420,
    rateUSD: 450,
    sanctionedAmountUSD: 189000,
    executedQuantity: 285,
    balanceQuantity: 135,
    variationQuantity: 0,
    runningQuantity: 285,
    executedAmountUSD: 128250,
    progressPercent: 67.8
  },
  {
    id: 'boq_02',
    itemCode: 'BOQ-CIV-008',
    projectId: 'prj_01',
    projectName: 'Peruvannamuzhi WTP Pipe Network',
    category: 'Civil & Foundation',
    description: 'Providing and laying M35 grade Reinforced Cement Concrete for Pier Caps including shuttering, staging and curing.',
    unit: 'Cum',
    quantity: 1250,
    rateUSD: 180,
    sanctionedAmountUSD: 225000,
    executedQuantity: 1100,
    balanceQuantity: 150,
    variationQuantity: 0,
    runningQuantity: 1100,
    executedAmountUSD: 198000,
    progressPercent: 88.0
  },
  {
    id: 'boq_03',
    itemCode: 'BOQ-PIP-022',
    projectId: 'prj_02',
    projectName: 'Water Transmission Main & Intake Pump House',
    category: 'Piping & Plumbing',
    description: 'Hydro-testing and pneumatically testing 8 inch Sch 40 Carbon Steel pipe network at 45 bar working pressure.',
    unit: 'Meters',
    quantity: 1800,
    rateUSD: 95,
    sanctionedAmountUSD: 171000,
    executedQuantity: 1450,
    balanceQuantity: 350,
    variationQuantity: 50,
    runningQuantity: 1450,
    executedAmountUSD: 137750,
    progressPercent: 80.5
  }
];

export const INITIAL_MEASUREMENT_ENTRIES: MeasurementEntry[] = [
  {
    id: 'mb_01',
    mbNumber: 'MB-2026-031',
    entryDate: '2026-08-01',
    projectId: 'prj_01',
    projectName: 'Peruvannamuzhi WTP Pipe Network',
    boqItemId: 'boq_01',
    boqItemCode: 'BOQ-MEC-014',
    boqDescription: 'Fabrication, alignment & erection of structural steel girders IS 2062',
    contractorName: 'Vanguard Civil Subcontractors',
    chainageLocation: 'Span 3 Pier P14 Steel Girder Assembly G-04',
    lengthMeters: 24.5,
    breadthMeters: 1.2,
    depthMeters: 0.8,
    calculatedQuantity: 18.5, // MT
    unit: 'MT',
    status: 'Approved by Project Manager',
    recordedByName: 'Vikram Singh (Site Incharge)',
    verifiedByName: 'Robert Vance',
    remarks: 'Girder G-04 torque wrench calibration checked. 100% NDT clear.'
  },
  {
    id: 'mb_02',
    mbNumber: 'MB-2026-032',
    entryDate: '2026-08-01',
    projectId: 'prj_01',
    projectName: 'Peruvannamuzhi WTP Pipe Network',
    boqItemId: 'boq_02',
    boqItemCode: 'BOQ-CIV-008',
    boqDescription: 'Providing & laying M35 grade RCC for Pier Caps',
    contractorName: 'Vanguard Civil Subcontractors',
    chainageLocation: 'Pier P15 Top Pier Cap Shuttering Bay',
    lengthMeters: 12.0,
    breadthMeters: 3.5,
    depthMeters: 1.8,
    calculatedQuantity: 75.6, // Cum
    unit: 'Cum',
    status: 'Verified by Site Incharge',
    recordedByName: 'Devraj Nair (Supervisor)',
    verifiedByName: 'Vikram Singh',
    remarks: 'Cube test specimens 7-day strength achieved 28.5 MPa.'
  }
];

export const INITIAL_TENDERS: TenderRecord[] = [
  {
    id: 'tnd_01',
    tenderNo: 'MIDLAND/2026/WTP-704',
    title: 'Design, Supply, Fabrication & Erection of Water Transmission Main Steel Structures (Phase II)',
    clientAuthority: 'Midland Water Resources Authority',
    category: 'Heavy Infrastructure & Mechanical',
    estimatedValueUSD: 4500000,
    emdAmountUSD: 90000,
    emdInstrument: 'Bank Guarantee',
    publishDate: '2026-06-15',
    submissionDueDate: '2026-08-20',
    eligibilityCriteria: 'Must have successfully executed minimum 2 elevated steel bridge projects worth >$3M in last 5 years with ISO 3834 welding certification.',
    tenderStatus: 'Bidding Open',
    bidSubmission: {
      technicalBidStatus: 'Submitted',
      financialBidAmountUSD: 4280000,
      submissionDate: '2026-07-28',
      validityDays: 120
    },
    tenderDocumentsUrl: ['MIDLAND_Tender_Notice_704.pdf', 'Technical_Specs_Volume2.pdf']
  },
  {
    id: 'tnd_02',
    tenderNo: 'IOCL/REFINERY/2026/PIPE-91',
    title: 'Turnkey Mechanical Piping & Offsite Storage Tank Fabrication Contract',
    clientAuthority: 'Indian Oil Corporation Limited (IOCL)',
    category: 'Water & Process Piping',
    estimatedValueUSD: 2800000,
    emdAmountUSD: 56000,
    emdInstrument: 'Demand Draft',
    publishDate: '2026-05-01',
    submissionDueDate: '2026-06-15',
    eligibilityCriteria: 'ASME Stamp Certification and Class 1 Boiler & Pressure Vessel License.',
    tenderStatus: 'Awarded',
    bidSubmission: {
      technicalBidStatus: 'Qualified',
      financialBidAmountUSD: 2650000,
      submissionDate: '2026-06-10',
      validityDays: 90
    },
    awardDetails: {
      awardeeName: 'SiteSync Infra Projects Ltd (Us)',
      awardValueUSD: 2650000,
      loiDate: '2026-07-02',
      agreementDate: '2026-07-15',
      commencementDate: '2026-08-01'
    }
  }
];

export const INITIAL_COST_CONTROLS: ProjectCostControl[] = [
  {
    projectId: 'prj_01',
    projectName: 'Peruvannamuzhi WTP Pipe Network',
    totalBudgetUSD: 1250000,
    purchaseCostUSD: 485000,
    materialCostUSD: 210000,
    labourCostUSD: 180000,
    equipmentCostUSD: 95000,
    vehicleCostUSD: 35000,
    runningCostUSD: 42000,
    totalSpentUSD: 1047000,
    committedPOUSD: 74226.66,
    remainingBudgetUSD: 128773.34,
    costVarianceUSD: 128773.34,
    variancePercent: 10.3,
    costStatus: 'Optimal'
  },
  {
    projectId: 'prj_02',
    projectName: 'Water Transmission Main & Intake Pump House',
    totalBudgetUSD: 850000,
    purchaseCostUSD: 310000,
    materialCostUSD: 185000,
    labourCostUSD: 140000,
    equipmentCostUSD: 65000,
    vehicleCostUSD: 28000,
    runningCostUSD: 32000,
    totalSpentUSD: 760000,
    committedPOUSD: 51000,
    remainingBudgetUSD: 39000,
    costVarianceUSD: 39000,
    variancePercent: 4.5,
    costStatus: 'Optimal'
  }
];

export const INITIAL_MATERIAL_REQUESTS: MaterialRequest[] = [
  {
    id: 'mr_01',
    requestNo: 'MR-20260809-001',
    requestDate: '2026-08-08',
    requestedByUserId: 'usr_supervisor_01',
    requestedByUserName: 'Siddharth Nair',
    employeeId: 'EMP-1004',
    designation: 'Site Supervisor',
    department: 'Water Infrastructure & Piping',
    company: 'SiteSync Infrastructure Pvt Ltd',
    branch: 'Kerala Zone - Calicut',
    projectId: 'prj_01',
    projectName: 'Peruvannamuzhi WTP Pipe Network',
    siteName: 'Section 4 - Valve Station Alpha',
    unloadingPoint: 'Yard 2, Near Pump House',
    contactNumber: '+91 98470 12345',
    requiredDate: '2026-08-15',
    priority: 'Urgent',
    remarks: 'Required for pipeline flange coupling installation ahead of monsoon inspection.',
    status: 'Pending Incharge',
    currentApproverRole: 'INCHARGE',
    currentApproverName: 'Robert Vance (Incharge)',
    items: [
      {
        id: 'mri_1',
        slNo: 1,
        materialId: 'mat_01',
        itemCode: 'MAT-PIP-001',
        itemDescription: '500mm DI K9 Pressure Pipe PN16',
        sizeSpecification: '500mm Outer Diameter x 6m Length',
        manufacturer: 'Electrosteel Castings Ltd',
        quantity: 15,
        receivedQuantity: 0,
        unit: 'Meters',
        remarks: 'Class K9 Socket & Spigot Joint'
      },
      {
        id: 'mri_2',
        slNo: 2,
        materialId: 'mat_02',
        itemCode: 'MAT-VLV-002',
        itemDescription: '300mm Sluice Valve PN16 Flanged',
        sizeSpecification: 'Class 150 PN16 Resilient Seated Gate Valve',
        manufacturer: 'Kirloskar Brothers',
        quantity: 2,
        receivedQuantity: 0,
        unit: 'Nos',
        remarks: 'Includes EPDM Gaskets & High Tensile Bolts'
      }
    ],
    approvalHistory: [
      {
        id: 'aph_1',
        step: 'Initiation',
        actorId: 'usr_supervisor_01',
        actorName: 'Siddharth Nair',
        actorRole: 'SUPERVISOR',
        action: 'Submitted',
        remarks: 'Material Request initiated for urgent valve station piping work.',
        timestamp: '2026-08-08T10:30:00Z'
      }
    ],
    createdAt: '2026-08-08T10:30:00Z',
    updatedAt: '2026-08-08T10:30:00Z'
  },
  {
    id: 'mr_02',
    requestNo: 'MR-20260807-002',
    requestDate: '2026-08-07',
    requestedByUserId: 'usr_incharge_01',
    requestedByUserName: 'Vikram Singh',
    employeeId: 'EMP-1008',
    designation: 'Site Incharge',
    department: 'Civil Infrastructure',
    company: 'SiteSync Infrastructure Pvt Ltd',
    branch: 'Gujarat Zone - Surat',
    projectId: 'prj_02',
    projectName: 'High-Speed Rail Viaduct Segment B',
    siteName: 'Pier 42 Casting Yard',
    unloadingPoint: 'Batching Plant 1 Yard',
    contactNumber: '+91 98980 67890',
    requiredDate: '2026-08-12',
    priority: 'Normal',
    remarks: '43 Grade Cement for Pier Cap Concreting Batch.',
    status: 'Approved',
    currentApproverRole: 'STORE',
    currentApproverName: 'Store Incharge',
    items: [
      {
        id: 'mri_3',
        slNo: 1,
        materialId: 'mat_03',
        itemCode: 'MAT-CEM-003',
        itemDescription: 'OPC 53 Grade Cement Bags (50kg)',
        sizeSpecification: '50kg HDPE Moisture Resistant Bag',
        manufacturer: 'UltraTech Cement',
        quantity: 500,
        receivedQuantity: 300,
        unit: 'Bags',
        remarks: 'Fresh batch less than 14 days old'
      }
    ],
    approvalHistory: [
      {
        id: 'aph_2',
        step: 'Initiation',
        actorId: 'usr_incharge_01',
        actorName: 'Vikram Singh',
        actorRole: 'INCHARGE',
        action: 'Submitted',
        remarks: 'Submitted for Pier Cap Batch 4.',
        timestamp: '2026-08-07T08:15:00Z'
      },
      {
        id: 'aph_3',
        step: 'Manager Approval',
        actorId: 'usr_manager_01',
        actorName: 'Robert Vance',
        actorRole: 'MANAGER',
        action: 'Approved',
        remarks: 'Approved for immediate dispatch to Pier 42 Yard.',
        timestamp: '2026-08-07T11:45:00Z'
      }
    ],
    receipts: [
      {
        id: 'mrr_1',
        receivedDate: '2026-08-08',
        deliveryProjectId: 'prj_02',
        deliveryProjectName: 'High-Speed Rail Viaduct Segment B',
        storeId: 'str_02',
        storeName: 'Surat Pier 42 Project Yard Store',
        receiverName: 'Ramesh Kumar (Store Keeper)',
        vehicleNumber: 'GJ-05-XX-8899',
        deliveryNoteNumber: 'DN-2026-0899',
        items: [
          {
            itemId: 'mri_3',
            itemDescription: 'OPC 53 Grade Cement Bags (50kg)',
            receivedQty: 300,
            unit: 'Bags'
          }
        ],
        remarks: 'Partial delivery 300 bags received in good condition.',
        createdAt: '2026-08-08T14:20:00Z'
      }
    ],
    createdAt: '2026-08-07T08:15:00Z',
    updatedAt: '2026-08-08T14:20:00Z'
  }
];

export const INITIAL_RA_BILLS: RABillRecord[] = [
  {
    id: 'ra_bill_01',
    billNumber: 'RA-2026-001',
    workOrderId: 'wo_01',
    workOrderNumber: 'WO-2026-001',
    projectId: 'prj_01',
    projectName: 'Peruvannamuzhi WTP Pipe Network',
    contractorName: 'Vanguard Civil Subcontractors',
    contractorCode: 'CNT-01',
    billDate: '2026-07-25',
    billingPeriodStart: '2026-07-01',
    billingPeriodEnd: '2026-07-20',
    billType: 'Progress / Running Account (RA)',
    sequenceNumber: 1,
    isFinalBill: false,
    status: 'Disbursed / Paid',
    items: [
      {
        id: 'ra_item_1',
        boqItemId: 'boq_01',
        itemCode: 'BOQ-MEC-014',
        description: 'Fabrication, alignment & erection of structural steel girders IS 2062',
        unit: 'MT',
        boqQuantity: 450,
        boqRateUSD: 1450,
        previousCumulativeQty: 0,
        currentMeasuredQty: 18.5,
        totalCumulativeQty: 18.5,
        currentAmountUSD: 26825,
        cumulativeAmountUSD: 26825,
        mbReference: 'MB-2026-031'
      }
    ],
    financials: {
      grossWorkDoneCurrentUSD: 26825,
      grossWorkDoneCumulativeUSD: 26825,
      previousCertifiedGrossUSD: 0,
      mobilizationAdvanceRecoveryRatePercent: 10,
      mobilizationAdvanceRecoveryUSD: 2682.5,
      retentionMoneyRatePercent: 5,
      retentionMoneyWithheldUSD: 1341.25,
      materialAdvanceRecoveryUSD: 0,
      statutoryTdsPercent: 2,
      statutoryTdsUSD: 536.5,
      statutoryGstTdsPercent: 2,
      statutoryGstTdsUSD: 536.5,
      laborWelfareCessPercent: 1,
      laborWelfareCessUSD: 268.25,
      liquidatedDamagesOrPenaltyUSD: 0,
      otherWithholdingsUSD: 0,
      totalDeductionsUSD: 5365,
      netPayableCurrentUSD: 21460,
      netPayableCumulativeUSD: 21460
    },
    contractorRepresentative: 'Ajay Varma (Contractor Project Lead)',
    qsVerifier: 'Robert Vance (Lead Quantity Surveyor)',
    siteEngineer: 'Vikram Singh (Site Incharge)',
    projectDirector: 'Dr. Anand Joshi (Project Director)',
    financeApprover: 'K. N. Moorthy (Chief Finance Controller)',
    paymentReferenceNumber: 'UTR-HDFC-20260728-98442',
    paymentDisbursedDate: '2026-07-28',
    remarks: 'RA Bill #1 certified after 100% NDT inspection clear. Payment cleared via NEFT/RTGS.',
    attachments: ['RA_01_Measurement_Joint_Signoff.pdf', 'NDT_Inspection_Report.pdf'],
    createdAt: '2026-07-25T10:00:00Z',
    updatedAt: '2026-07-28T16:45:00Z'
  },
  {
    id: 'ra_bill_02',
    billNumber: 'RA-2026-002',
    workOrderId: 'wo_01',
    workOrderNumber: 'WO-2026-001',
    projectId: 'prj_01',
    projectName: 'Peruvannamuzhi WTP Pipe Network',
    contractorName: 'Vanguard Civil Subcontractors',
    contractorCode: 'CNT-01',
    billDate: '2026-08-05',
    billingPeriodStart: '2026-07-21',
    billingPeriodEnd: '2026-08-04',
    billType: 'Progress / Running Account (RA)',
    sequenceNumber: 2,
    isFinalBill: false,
    status: 'Approved by Incharge',
    items: [
      {
        id: 'ra_item_2',
        boqItemId: 'boq_01',
        itemCode: 'BOQ-MEC-014',
        description: 'Fabrication, alignment & erection of structural steel girders IS 2062',
        unit: 'MT',
        boqQuantity: 450,
        boqRateUSD: 1450,
        previousCumulativeQty: 18.5,
        currentMeasuredQty: 22.0,
        totalCumulativeQty: 40.5,
        currentAmountUSD: 31900,
        cumulativeAmountUSD: 58725,
        mbReference: 'MB-2026-033'
      },
      {
        id: 'ra_item_3',
        boqItemId: 'boq_02',
        itemCode: 'BOQ-CIV-008',
        description: 'Providing & laying M35 grade RCC for Pier Caps',
        unit: 'Cum',
        boqQuantity: 1250,
        boqRateUSD: 180,
        previousCumulativeQty: 0,
        currentMeasuredQty: 75.6,
        totalCumulativeQty: 75.6,
        currentAmountUSD: 13608,
        cumulativeAmountUSD: 13608,
        mbReference: 'MB-2026-032'
      }
    ],
    financials: {
      grossWorkDoneCurrentUSD: 45508,
      grossWorkDoneCumulativeUSD: 72333,
      previousCertifiedGrossUSD: 26825,
      mobilizationAdvanceRecoveryRatePercent: 10,
      mobilizationAdvanceRecoveryUSD: 4550.8,
      retentionMoneyRatePercent: 5,
      retentionMoneyWithheldUSD: 2275.4,
      materialAdvanceRecoveryUSD: 1000,
      statutoryTdsPercent: 2,
      statutoryTdsUSD: 910.16,
      statutoryGstTdsPercent: 2,
      statutoryGstTdsUSD: 910.16,
      laborWelfareCessPercent: 1,
      laborWelfareCessUSD: 455.08,
      liquidatedDamagesOrPenaltyUSD: 0,
      otherWithholdingsUSD: 0,
      totalDeductionsUSD: 10101.6,
      netPayableCurrentUSD: 35406.4,
      netPayableCumulativeUSD: 56866.4
    },
    contractorRepresentative: 'Ajay Varma (Contractor Project Lead)',
    qsVerifier: 'Robert Vance (Lead Quantity Surveyor)',
    siteEngineer: 'Vikram Singh (Site Incharge)',
    projectDirector: 'Dr. Anand Joshi (Project Director)',
    remarks: 'RA Bill #2 under final finance authorization for disbursement release.',
    attachments: ['RA_02_Joint_Measurement_Sheet.pdf'],
    createdAt: '2026-08-05T09:30:00Z',
    updatedAt: '2026-08-07T11:20:00Z'
  },
  {
    id: 'ra_bill_03',
    billNumber: 'RA-2026-003',
    workOrderId: 'wo_02',
    workOrderNumber: 'WO-2026-002',
    projectId: 'prj_02',
    projectName: 'Water Transmission Main & Intake Pump House',
    contractorName: 'Apex Pipeline & Heavy Infra Corp',
    contractorCode: 'CNT-02',
    billDate: '2026-08-08',
    billingPeriodStart: '2026-07-15',
    billingPeriodEnd: '2026-08-07',
    billType: 'Progress / Running Account (RA)',
    sequenceNumber: 1,
    isFinalBill: false,
    status: 'Under Technical Scrutiny',
    items: [
      {
        id: 'ra_item_4',
        boqItemId: 'boq_03',
        itemCode: 'BOQ-PIP-022',
        description: 'Hydro-testing and pneumatically testing 8 inch Sch 40 Carbon Steel pipe network at 45 bar working pressure',
        unit: 'Meters',
        boqQuantity: 1800,
        boqRateUSD: 95,
        previousCumulativeQty: 0,
        currentMeasuredQty: 320,
        totalCumulativeQty: 320,
        currentAmountUSD: 30400,
        cumulativeAmountUSD: 30400,
        mbReference: 'MB-2026-039'
      }
    ],
    financials: {
      grossWorkDoneCurrentUSD: 30400,
      grossWorkDoneCumulativeUSD: 30400,
      previousCertifiedGrossUSD: 0,
      mobilizationAdvanceRecoveryRatePercent: 10,
      mobilizationAdvanceRecoveryUSD: 3040,
      retentionMoneyRatePercent: 5,
      retentionMoneyWithheldUSD: 1520,
      materialAdvanceRecoveryUSD: 0,
      statutoryTdsPercent: 2,
      statutoryTdsUSD: 608,
      statutoryGstTdsPercent: 2,
      statutoryGstTdsUSD: 608,
      laborWelfareCessPercent: 1,
      laborWelfareCessUSD: 304,
      liquidatedDamagesOrPenaltyUSD: 0,
      otherWithholdingsUSD: 0,
      totalDeductionsUSD: 6080,
      netPayableCurrentUSD: 24320,
      netPayableCumulativeUSD: 24320
    },
    contractorRepresentative: 'Sunil Nair (Subcontractor PM)',
    qsVerifier: 'Robert Vance (Lead Quantity Surveyor)',
    remarks: 'Hydrostatic pressure log verification in progress at pump house station.',
    attachments: ['Pressure_Log_Charts_320M.pdf'],
    createdAt: '2026-08-08T15:00:00Z',
    updatedAt: '2026-08-08T15:00:00Z'
  }
];

