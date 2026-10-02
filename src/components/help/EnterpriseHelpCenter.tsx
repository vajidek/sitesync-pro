import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Search,
  BookOpen,
  GitBranch,
  ShieldCheck,
  Users,
  Building2,
  DollarSign,
  Boxes,
  Truck,
  HardHat,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Laptop,
  Database,
  Lock,
  Compass,
  Sparkles,
  Layers,
  Activity,
  Award,
  Calendar,
  Clock,
  Printer
} from 'lucide-react';
import { UserRole } from '../../types';

// ============================================================================
// 1. Plain-English ERP Glossary for Normal Employees & Non-Accountants
// ============================================================================
export interface GlossaryTerm {
  term: string;
  abbreviation?: string;
  category: 'Accounting' | 'Procurement' | 'Site & Store' | 'Commercial' | 'Projects' | 'General';
  definition: string;
  plainEnglishExplanation: string;
  example: string;
}

export const ERP_GLOSSARY: GlossaryTerm[] = [
  {
    term: 'Purchase Requisition',
    abbreviation: 'PR',
    category: 'Procurement',
    definition: 'An internal formal request created by a site engineer or department to purchase materials or services.',
    plainEnglishExplanation: 'A shopping wish-list for your site. You tell the procurement team what you need before they spend company money.',
    example: 'A site engineer creates PR-2026-081 requesting 50 bags of OPC 53 Grade cement.',
  },
  {
    term: 'Purchase Order',
    abbreviation: 'PO',
    category: 'Procurement',
    definition: 'A legally binding contract issued to a vendor committing to purchase specified goods or services at agreed prices.',
    plainEnglishExplanation: 'The official promise sent to the shop or supplier asking them to deliver the items with guaranteed payment.',
    example: 'SiteSync generates PO-2026-014 to Emirates Cement for 50 bags at ₹380/bag.',
  },
  {
    term: 'Goods Receipt Note',
    abbreviation: 'GRN',
    category: 'Site & Store',
    definition: 'A document acknowledging the delivery and physical receipt of goods at a warehouse or site after inspection.',
    plainEnglishExplanation: 'Proof of arrival. When the truck drops off the bags, the storekeeper counts them and signs the GRN.',
    example: 'GRN-2026-004 verifies 50 cement bags arrived undamaged at Site Yard B.',
  },
  {
    term: 'Material Issue Voucher',
    abbreviation: 'MIV',
    category: 'Site & Store',
    definition: 'A warehouse record releasing materials from inventory storage to a specific work site, vehicle, or job package.',
    plainEnglishExplanation: 'Taking items from the store cupboard to use on the job. Records who took what so nothing goes missing.',
    example: 'Storekeeper issues 10 bags of cement to Pier 4 foundation crew under MIV-0037.',
  },
  {
    term: 'Running Account Bill',
    abbreviation: 'RA Bill',
    category: 'Commercial',
    definition: 'An interim progress payment bill submitted by a contractor or subcontractor based on physical measurements of work completed.',
    plainEnglishExplanation: 'A progress bill. For large jobs taking months, the subcontractor bills periodically for what they finished this month.',
    example: 'Excavation contractor submits RA Bill #3 for 4,500 cubic meters of earth moved.',
  },
  {
    term: 'Interim Payment Certificate',
    abbreviation: 'IPC',
    category: 'Commercial',
    definition: 'A certification issued by the client or project consultant confirming measured work values and authorizing payment to the contractor.',
    plainEnglishExplanation: 'Client approval ticket. The client signs this stating they agree with our work and are paying us.',
    example: 'Client engineer certifies IPC-05 for ₹1.85 Cr after inspecting completed bridge piers.',
  },
  {
    term: 'Bill of Quantities',
    abbreviation: 'BOQ',
    category: 'Commercial',
    definition: 'An itemized schedule of materials, parts, and labor with unit prices used in tendering and project cost control.',
    plainEnglishExplanation: 'The master rate card and recipe of everything the project will construct and what each unit costs.',
    example: 'BOQ Item 2.4: M30 Grade Reinforced Concrete — 1,200 m³ at ₹6,500/m³.',
  },
  {
    term: 'Retention Money',
    abbreviation: 'Retention',
    category: 'Commercial',
    definition: 'A portion (typically 5% to 10%) of each progress payment withheld until the project is successfully completed and the defect liability period ends.',
    plainEnglishExplanation: 'Security deposit held back. A small percentage kept until the job is proven defect-free, then paid in full.',
    example: 'On a ₹10,00,000 subcontractor bill, ₹50,000 (5%) is held as retention until final handover.',
  },
  {
    term: 'Mobilization Advance Recovery',
    abbreviation: 'Advance Recovery',
    category: 'Commercial',
    definition: 'Proportional deduction from interim bills to recover upfront mobilization capital paid to the contractor at project start.',
    plainEnglishExplanation: 'Paying back the loan. If the company gave you money to set up camp at the start, small amounts are deducted from each monthly bill.',
    example: 'Deducting ₹2,40,000 mobilization recovery from RA Bill #3 as agreed in contract.',
  },
  {
    term: 'Three-Way Matching',
    abbreviation: '3-Way Match',
    category: 'Accounting',
    definition: 'Automated accounts payable verification comparing the Purchase Order, Goods Receipt Note, and Supplier Invoice before payment.',
    plainEnglishExplanation: 'The fraud prevention check: Did we order it (PO)? Did we receive it (GRN)? Does the bill match both (Invoice)?',
    example: 'Matching PO-001 (50 bags @ ₹380) with GRN-004 (50 bags) and Vendor Invoice #8921 (₹19,000).',
  },
  {
    term: 'General Ledger',
    abbreviation: 'GL',
    category: 'Accounting',
    definition: 'The central master repository of all financial accounts and double-entry postings recording assets, liabilities, equity, revenues, and expenses.',
    plainEnglishExplanation: 'The master company financial ledger. Every single rupee spent or earned is permanently recorded here.',
    example: 'GL Account 5020 (Subcontract Direct Cost) debited with ₹24,50,000 upon bill certification.',
  },
  {
    term: 'Work Breakdown Structure',
    abbreviation: 'WBS',
    category: 'Projects',
    definition: 'A hierarchical decomposition of the total scope of work to be carried out by the project team to accomplish project objectives.',
    plainEnglishExplanation: 'Breaking a massive project into bite-sized tasks (e.g. 1.0 Civil -> 1.1 Foundation -> 1.1.2 Piling).',
    example: 'Expenses for steel rebar are coded directly to WBS 1.1.2 for precise cost tracking.',
  },
  {
    term: 'Earned Value Management',
    abbreviation: 'EVM',
    category: 'Projects',
    definition: 'A methodology combining measurements of scope, schedule, and cost in a single integrated system to assess project performance.',
    plainEnglishExplanation: 'Are you getting what you paid for? Compares how much you planned to spend vs how much you actually spent vs how much work is actually done.',
    example: 'Cost Performance Index (CPI) of 1.04 indicates the project is currently 4% under budget.',
  },
  {
    term: 'Petty Cash Float',
    abbreviation: 'Imprest Float',
    category: 'Accounting',
    definition: 'A fixed fund of physical cash held at a site or office for paying small, incidental expenses, regularly replenished upon audit.',
    plainEnglishExplanation: 'The emergency cash box on site. Kept at ₹10,000. When ₹6,000 of bills accumulate, Finance tops it back to ₹10,000.',
    example: 'Site cashier pays ₹200 cash for emergency rope using the site petty cash box.',
  },
];

// ============================================================================
// 2. Role-Based Step-by-Step Guides
// ============================================================================
export interface RoleGuide {
  roleId: UserRole | 'EMPLOYEE';
  roleName: string;
  badge: string;
  targetAudience: string;
  coreResponsibilities: string[];
  frequentTasks: {
    title: string;
    description: string;
    stepByStep: string[];
    whatHappensNext: string;
    troubleshootingTip: string;
  }[];
}

export const ROLE_GUIDES: RoleGuide[] = [
  {
    roleId: 'EMPLOYEE',
    roleName: 'Standard Employee / Field Worker',
    badge: 'Everyone',
    targetAudience: 'Every employee submitting expenses, checking attendance, or reviewing payslips.',
    coreResponsibilities: [
      'Record daily site attendance on time',
      'Submit expense claims promptly with original bill photos',
      'Request cash advances for project travel or emergency site expenses',
      'Check monthly payslips and leave balance',
    ],
    frequentTasks: [
      {
        title: 'How to Claim an Expense (e.g. ₹200 for Site Supplies)',
        description: 'Submit an out-of-pocket expense claim with bill photo in under 60 seconds.',
        stepByStep: [
          'Open "My Expenses" or click "Claim an Expense" on your dashboard.',
          'Click the "Submit Expense Claim" button.',
          'Type the amount (e.g. 200) and pick the category (e.g. Site Consumables or Material Purchase).',
          'Enter the shop name (e.g. Al Madina Hardware) and a short note ("Rope purchased for site trench safety").',
          'Attach a clear photo of the cash receipt or bill from your phone camera or gallery.',
          'Click "Submit Claim".',
        ],
        whatHappensNext: 'Your supervisor receives an approval notification. Once approved, Finance verifies the receipt and disburses payment to your bank account or cash.',
        troubleshootingTip: 'Make sure the receipt image shows the date, vendor name, and total amount clearly so your supervisor can approve it without delays.',
      },
      {
        title: 'How to Punch Attendance on Site',
        description: 'Clock in for your morning shift using site GPS or biometric sync.',
        stepByStep: [
          'Open "My Attendance" from the mobile bottom bar or dashboard.',
          'Allow location permission if prompted so the app verifies you are within the project geofence.',
          'Click "Clock In" and take a quick selfie verification if requested.',
          'At the end of your shift, click "Clock Out" to log your total hours.',
        ],
        whatHappensNext: 'Your hours are recorded in the HRMS shift log and used automatically for end-of-month payroll and overtime calculation.',
        troubleshootingTip: 'If your GPS fails or you worked off-site, click "Request Attendance Correction" and select your shift supervisor to review.',
      },
      {
        title: 'How to Request a Cash Advance',
        description: 'Request travel or emergency material cash before heading out to a remote site.',
        stepByStep: [
          'Navigate to "Expenses & Petty Cash" -> "Advances & Settlements".',
          'Click "Request Cash Advance".',
          'Enter requested amount (e.g. ₹5,000), target project, and the required date.',
          'Write a brief purpose (e.g. "Pipeline sector emergency diesel and travel").',
          'Click "Submit Request".',
        ],
        whatHappensNext: 'The Site Incharge and Finance Cashier approve the request and issue cash or bank transfer with an advance voucher.',
        troubleshootingTip: 'Keep all receipts while spending the advance! You will submit them under "Settle Advance" to clear your balance.',
      },
    ],
  },
  {
    roleId: 'SUPERVISOR',
    roleName: 'Site Supervisor / Field Incharge',
    badge: 'Operations',
    targetAudience: 'Engineers and foremen supervising crews, equipment, and day-to-day site execution.',
    coreResponsibilities: [
      'Review and approve employee daily attendance and overtime',
      'Approve site expense claims under your threshold',
      'Issue daily material requisitions to storekeeper',
      'Log site progress, weather, and safety toolbox talks',
    ],
    frequentTasks: [
      {
        title: 'How to Review & Approve Expense Claims',
        description: 'Ensure staff claims are legitimate site costs with clear bills.',
        stepByStep: [
          'Go to "My Actions Center" or "Expenses & Petty Cash" -> "Manager Approvals".',
          'Click on any pending claim to preview details and bill image.',
          'Check: Does the amount match the receipt? Was this for project work?',
          'Click "Approve" to forward to Finance, or "Reject / Request Clarification" with a reason.',
        ],
        whatHappensNext: 'Approved claims move immediately to the Finance Verification queue for accounting ledger coding.',
        troubleshootingTip: 'If an employee forgot the receipt, do not approve. Click "Clarify" so they can upload the photo without losing their draft.',
      },
      {
        title: 'How to Request Materials from Site Store (Issue Request)',
        description: 'Get cement, rebar, or fittings delivered from the store to your work area.',
        stepByStep: [
          'Go to "Stores & Materials" -> "Material Requests".',
          'Click "Request Material Issue".',
          'Select the Project Site, WBS activity (e.g. Pier Foundation), and items needed.',
          'Specify requested quantities and needed date.',
          'Click "Submit Request".',
        ],
        whatHappensNext: 'The Storekeeper receives an alert, checks inventory in stock, and prepares the Material Issue Voucher (MIV) for dispatch.',
        troubleshootingTip: 'Check the stock indicator before requesting. If stock is low, create a Purchase Requisition instead.',
      },
    ],
  },
  {
    roleId: 'MANAGER',
    roleName: 'Project Manager (PM)',
    badge: 'Management',
    targetAudience: 'Project Managers in charge of budget, schedule, commercial contracts, and milestone delivery.',
    coreResponsibilities: [
      'Monitor Earned Value (CPI, SPI) and cost variance',
      'Approve high-value Purchase Requisitions (PR) and Subcontract Work Orders',
      'Certify subcontractor interim bills and client IPCs',
      'Track risk, safety compliance, and site progress curves',
    ],
    frequentTasks: [
      {
        title: 'How to Certify a Subcontractor RA Bill',
        description: 'Review measured quantities, apply retention and advance recovery, and certify payable amount.',
        stepByStep: [
          'Open "Commercial & Finance" -> "Commercial & Tenders" -> "Subcontractor RA Bills".',
          'Select the pending bill (e.g. RA-03 from Apex GeoTech).',
          'Verify measured work against BOQ rates (Certified Gross Amount).',
          'The system automatically computes 5% Retention and applies Mobilization Recovery.',
          'Review the Net Payable calculation.',
          'Click "Certify & Generate AP Invoice".',
        ],
        whatHappensNext: 'A balanced double-entry Journal Entry is created in GL (Dr Subcontract Cost, Cr AP Subcontractor, Cr Retention, Cr Mobilization Recovery).',
        troubleshootingTip: 'Always verify joint measurement sheets attached in the EDMS tab before certification.',
      },
    ],
  },
  {
    roleId: 'STORE_KEEPER',
    roleName: 'Store Keeper & Warehouse Officer',
    badge: 'Supply Chain',
    targetAudience: 'Warehouse in-charge receiving, storing, and issuing materials and spare parts.',
    coreResponsibilities: [
      'Receive vendor delivery trucks and verify goods against Purchase Orders',
      'Generate Goods Receipt Notes (GRN) with inspection remarks',
      'Issue materials to site crews against authorized vouchers',
      'Monitor bin locations, safety stock levels, and physical stock count',
    ],
    frequentTasks: [
      {
        title: 'How to Receive Materials (Create GRN)',
        description: 'Acknowledge supplier delivery truck arrival on site.',
        stepByStep: [
          'Navigate to "Stores & Materials" -> "Goods Receipt (GRN)".',
          'Click "Receive Goods (New GRN)".',
          'Select the supplier Purchase Order (PO) number.',
          'Enter delivered quantity, delivery challan number, and inspection status (Accepted / Rejected / Damaged).',
          'Upload photo of delivery challan.',
          'Click "Save & Post GRN".',
        ],
        whatHappensNext: 'Warehouse stock balance updates immediately in the stock ledger, and a 3-way match notification is sent to Finance AP.',
        troubleshootingTip: 'If materials arrive damaged, mark condition as "DAMAGED" and accept only the sound quantity.',
      },
    ],
  },
  {
    roleId: 'ADMIN',
    roleName: 'System Administrator',
    badge: 'Governance',
    targetAudience: 'IT and ERP Administrators configuring security, roles, organizations, and workflows.',
    coreResponsibilities: [
      'User provisioning, password resets, and 8-tier ABAC assignment',
      'Multi-company and branch configuration',
      'Approval workflow threshold rules',
      'Master data golden records governance (32 MDM domains)',
      'Security audit logs inspection and diagnostic monitoring',
    ],
    frequentTasks: [
      {
        title: 'How to Provision a New User & Assign Role',
        description: 'Create an employee account with precise module access and project scoping.',
        stepByStep: [
          'Open "Administration & Governance" -> "System Governance & RBAC".',
          'Click "Add New User".',
          'Fill in Full Name, Email, Department, and Employee Code.',
          'Assign Primary Role (ADMIN, MANAGER, INCHARGE, SUPERVISOR, STORE_KEEPER, etc.).',
          'Select Assigned Project Site or "All Projects" for regional managers.',
          'Set temporary password (or enable force password change on first login).',
          'Click "Save User".',
        ],
        whatHappensNext: 'User receives login credentials and permissions are enforced automatically across UI tabs and REST APIs.',
        troubleshootingTip: 'To restrict an engineer to only see their own site, ensure their assignedProjectId matches the target site ID.',
      },
    ],
  },
];

// ============================================================================
// 3. Visual Workflow Stepper Data (Interactive Life Cycles)
// ============================================================================
export interface WorkflowLifecycle {
  id: string;
  name: string;
  category: string;
  description: string;
  steps: {
    stepNumber: number;
    title: string;
    actor: string;
    description: string;
    outcome: string;
  }[];
}

export const WORKFLOW_LIFECYCLES: WorkflowLifecycle[] = [
  {
    id: 'wf-expense',
    name: 'Employee Expense & Reimbursement Lifecycle',
    category: 'Finance & HR',
    description: 'How an employee claims money back for site purchases without needing accounting knowledge.',
    steps: [
      {
        stepNumber: 1,
        title: 'Claim an Expense',
        actor: 'Employee / Field Worker',
        description: 'User enters amount (e.g. ₹200), selects category (Site Consumables), writes a note, and attaches receipt photo.',
        outcome: 'Status: SUBMITTED. Notification dispatched to Site Supervisor.',
      },
      {
        stepNumber: 2,
        title: 'Supervisor Approval',
        actor: 'Site Supervisor / Incharge',
        description: 'Supervisor reviews expense reasonableness and validates bill photo.',
        outcome: 'Status: SUPERVISOR_APPROVED. Claim routed to Finance.',
      },
      {
        stepNumber: 3,
        title: 'Finance Verification',
        actor: 'Finance Officer',
        description: 'Finance classifies accounting codes (Debit GL 5010 Site Expense, Credit GL 1010 Bank/Cash) and checks tax/GST.',
        outcome: 'Status: APPROVED_FOR_PAYMENT. Ready for disbursement.',
      },
      {
        stepNumber: 4,
        title: 'Payment Disbursement',
        actor: 'Cashier / Finance Accounts',
        description: 'Payment made via Bank Transfer (NEFT/UPI) or Cash with payment reference recorded.',
        outcome: 'Status: PAID. Employee receives confirmation.',
      },
      {
        stepNumber: 5,
        title: 'General Ledger Posting',
        actor: 'SiteSync Core Engine (Automatic)',
        description: 'System automatically posts balanced double-entry Journal Entry (Total Dr = Total Cr) and updates Project Actual Cost.',
        outcome: 'Status: COMPLETED. Audit trail permanently logged.',
      },
    ],
  },
  {
    id: 'wf-procurement',
    name: 'Procurement & 3-Way Matching Supply Chain',
    category: 'Procurement',
    description: 'From site material requisition to supplier purchase order, goods delivery, and final vendor payment.',
    steps: [
      {
        stepNumber: 1,
        title: 'Request Purchase (PR)',
        actor: 'Site Engineer / Store',
        description: 'Site requests items with required specifications and delivery date.',
        outcome: 'Status: PR_SUBMITTED.',
      },
      {
        stepNumber: 2,
        title: 'PR Approval',
        actor: 'Project Manager / Incharge',
        description: 'PM verifies budget availability and authorizes procurement.',
        outcome: 'Status: PR_APPROVED.',
      },
      {
        stepNumber: 3,
        title: 'RFQ & Vendor Quotations',
        actor: 'Procurement Officer',
        description: 'Requests quotes from approved suppliers and enters prices into Comparative Statement.',
        outcome: 'Status: COMPARISON_COMPLETE.',
      },
      {
        stepNumber: 4,
        title: 'Issue Purchase Order (PO)',
        actor: 'Procurement Head',
        description: 'Official Purchase Order generated and sent to winning supplier.',
        outcome: 'Status: PO_ISSUED.',
      },
      {
        stepNumber: 5,
        title: 'Goods Receipt (GRN)',
        actor: 'Storekeeper',
        description: 'Storekeeper inspects physical shipment upon truck arrival and records GRN.',
        outcome: 'Status: GRN_RECORDED. Stock balance incremented.',
      },
      {
        stepNumber: 6,
        title: '3-Way Match & AP Invoice',
        actor: 'Finance Accounts Payable',
        description: 'Automated matching verifies PO == GRN == Vendor Bill. Generates AP invoice and balanced GL journal.',
        outcome: 'Status: AP_INVOICE_POSTED.',
      },
      {
        stepNumber: 7,
        title: 'Vendor Payment',
        actor: 'Finance Accounts',
        description: 'Payment released to vendor bank account according to credit terms.',
        outcome: 'Status: SETTLED.',
      },
    ],
  },
  {
    id: 'wf-commercial',
    name: 'Commercial Subcontract RA Bill & Certification',
    category: 'Commercial',
    description: 'Contractor progress billing with joint measurement, retention deduction, and GL cost attribution.',
    steps: [
      {
        stepNumber: 1,
        title: 'Work Measurement',
        actor: 'Quantity Surveyor / Site Engineer',
        description: 'Joint physical measurement of completed work quantities against BOQ line items.',
        outcome: 'Status: MEASUREMENT_RECORDED.',
      },
      {
        stepNumber: 2,
        title: 'RA Bill Submission',
        actor: 'Subcontractor / Commercial Team',
        description: 'Subcontractor submits monthly interim bill for certified work volume.',
        outcome: 'Status: UNDER_REVIEW.',
      },
      {
        stepNumber: 3,
        title: 'Certification & Deductions',
        actor: 'Project Manager',
        description: 'PM certifies payable volume, deducts 5% retention money and mobilization advance recovery.',
        outcome: 'Status: BILL_CERTIFIED.',
      },
      {
        stepNumber: 4,
        title: 'AP Invoice & GL Posting',
        actor: 'Finance Engine',
        description: 'System automatically creates AP invoice and posts balanced entry (Dr Subcontract Cost 5020, Cr AP 2010, Cr Retention 2020, Cr Recovery 2060).',
        outcome: 'Status: AP_POSTED. Project actual cost updated.',
      },
    ],
  },
  {
    id: 'wf-store',
    name: 'Stores Stock & Material Issue Voucher (MIV)',
    category: 'Stores',
    description: 'Releasing materials from central warehouse to site work zones with accurate cost code tagging.',
    steps: [
      {
        stepNumber: 1,
        title: 'Material Issue Request',
        actor: 'Site Foreman / Supervisor',
        description: 'Crew requests stock specifying project, site zone, and cost code / WBS activity.',
        outcome: 'Status: REQUESTED.',
      },
      {
        stepNumber: 2,
        title: 'Stock Availability Check',
        actor: 'Storekeeper',
        description: 'Storekeeper verifies bin location and checks batch/serial number availability.',
        outcome: 'Status: ALLOCATED.',
      },
      {
        stepNumber: 3,
        title: 'Issue Voucher (MIV) & Gate Pass',
        actor: 'Storekeeper & Crew Lead',
        description: 'Store releases physical items; receiver signs MIV acknowledgment.',
        outcome: 'Status: ISSUED. Stock deducted from inventory.',
      },
      {
        stepNumber: 4,
        title: 'Cost Attribution to Project',
        actor: 'Finance GL Engine',
        description: 'Inventory asset account credited and Project Direct Material Expense account debited in GL.',
        outcome: 'Status: POSTED_TO_PROJECT_COST.',
      },
    ],
  },
];

// ============================================================================
// 4. Complete Admin User Manual Chapters
// ============================================================================
export interface AdminManualSection {
  id: string;
  title: string;
  summary: string;
  subsections: {
    heading: string;
    content: string;
    bestPractices?: string[];
  }[];
}

export const ADMIN_MANUAL_SECTIONS: AdminManualSection[] = [
  {
    id: 'sec-architecture',
    title: '1. Multi-Tenant Architecture, Company & Branch Setup',
    summary: 'How SiteSync Pro manages multi-company holding structures, legal entities, regional branches, and project sites.',
    subsections: [
      {
        heading: 'Enterprise Hierarchy Overview',
        content: `SiteSync Pro utilizes a 4-tier enterprise organizational hierarchy:
1. Holding Enterprise (Apex Global Holdings)
2. Operating Divisions / Legal Entities (Apex ME LLC, Apex India Infra Ltd)
3. Regional Hubs / Branches (Central Corporate HQ, Metropolitan Logistics Yard, Regional Hub)
4. Site Projects (WTP Pipe Network, Transmission Main, Substation)`,
        bestPractices: [
          'Assign users to their specific branch or site to prevent information overload.',
          'Corporate executives can toggle "All Projects" in the top bar to inspect consolidated portfolio reports.',
          'Each branch maintains independent petty cash registers and store warehouses with distinct ledger codes.',
        ],
      },
      {
        heading: 'Switching Enterprise Context in UI',
        content: 'Users with multi-project authorization can switch their company, branch, and site context using the enterprise context selector bar located at the top of the Role Dashboard.',
      },
    ],
  },
  {
    id: 'sec-rbac',
    title: '2. User Management, RBAC & 8-Tier ABAC Policies',
    summary: 'Configuring user security, roles, permission matrices, and attribute-based site boundaries.',
    subsections: [
      {
        heading: 'The 8 Built-in Security Roles',
        content: `SiteSync Pro enforces 8 standardized enterprise roles:
1. ADMIN: Full system access, RBAC, master data, audit logs, configuration.
2. MANAGER: Project overview, high-level approvals, budget control, subcontractor certification.
3. INCHARGE: Department heads, site engineers, technical sign-offs, drawing approvals.
4. SUPERVISOR: Crew attendance, work order execution, first-level expense approvals.
5. STORE_KEEPER: Stock intake (GRN), material dispatch (MIV), inventory reconciliation.
6. DRIVER: Fleet operations, trip logs, fuel purchase entries.
7. OPERATOR: Heavy machinery execution, equipment inspection, plant maintenance.
8. WORKER: Personal attendance, self-service expense reimbursement claims, payslip view.`,
        bestPractices: [
          'Enforce Segregation of Duties: Never grant a single user both Storekeeper and Procurement PO approval rights.',
          'Regularly review the Audit Logs for privileged role actions.',
          'Enable "Force Password Change" for newly provisioned user accounts.',
        ],
      },
      {
        heading: 'Password & Security Governance',
        content: 'SiteSync Pro supports secure bcrypt-hashed credentials, JWT authentication with role scoping, and automatic session revocation upon password reset.',
      },
    ],
  },
  {
    id: 'sec-workflows',
    title: '3. Approval Workflows & Threshold Rules',
    summary: 'Configuring automated approval routes, spending limits, and multi-tier sign-off matrices.',
    subsections: [
      {
        heading: 'Configurable Approval Thresholds',
        content: `Standard default approval limits configured in the engine:
- Expenses <= ₹5,000: Single-level Site Supervisor approval.
- Expenses > ₹5,000: Supervisor + Project Manager approval.
- Purchase Orders <= $50,000: Procurement Manager approval.
- Purchase Orders > $50,000: Project Manager + Managing Director board sign-off.
- Subcontract Bills: Certified by Project Manager, verified by Commercial Head.`,
      },
      {
        heading: 'Duplicate Detection Engine',
        content: 'SiteSync Pro includes an automated duplicate detector for employee expense claims. If an employee submits a claim matching the same amount, vendor, and date within a 14-day window, a high-risk warning is surfaced before approval.',
      },
    ],
  },
  {
    id: 'sec-mdm',
    title: '4. Master Data Governance (MDM) & Golden Records',
    summary: 'Managing 32 master data domains, vendor registries, and chart of accounts.',
    subsections: [
      {
        heading: 'Golden Records Management',
        content: 'The Master Data Management (MDM) module maintains standardized reference catalogs for: Chart of Accounts, Material SKUs, Vendor Directory, Machinery Registry, WBS Codes, and Cost Centers. Changes to golden records generate an audit trail.',
      },
      {
        heading: 'Chart of Accounts Structure',
        content: `SiteSync Pro Standard 4-Digit Chart of Accounts:
- 1000 - 1999: ASSETS (1010 Bank Main Account, 1020 Petty Cash Reserve, 1030 Construction Inventory, 1040 Accounts Receivable)
- 2000 - 2999: LIABILITIES (2010 Accounts Payable Vendors, 2020 Subcontract Retention Payable, 2040 Payroll Payable, 2060 Mobilization Advance Recovery)
- 3000 - 3999: EQUITY (3010 Shareholder Capital, 3020 Retained Earnings)
- 4000 - 4999: REVENUE (4010 EPC Contract Revenue, 4020 Client Variation Revenue)
- 5000 - 5999: DIRECT COSTS (5010 Material Cost, 5020 Subcontract Cost, 5030 Direct Labor, 5040 Plant & Equipment)`,
      },
    ],
  },
  {
    id: 'sec-accounting',
    title: '5. Double-Entry Accounting & Ledger Integrity',
    summary: 'How SiteSync Pro enforces strict mathematical debit/credit balancing across all ERP modules.',
    subsections: [
      {
        heading: 'The Invariant Double-Entry Constraint',
        content: 'Every transaction that creates a financial posting MUST satisfy Total Debit = Total Credit. The system rejects any unbalanced journal entry at the database layer with an explicit error. Failed operations are rolled back atomically to prevent partial postings.',
      },
      {
        heading: 'Idempotency and Duplicate Protection',
        content: 'Subcontract certifications, automated 3-way match AP invoices, and payroll runs are guarded by unique reference keys. Running the certification twice does not double-post to the General Ledger.',
      },
    ],
  },
  {
    id: 'sec-troubleshooting',
    title: '6. System Diagnostics & Troubleshooting Guide',
    summary: 'Common administrator issues, root causes, and rapid solutions.',
    subsections: [
      {
        heading: 'Common Operational Issues & Solutions',
        content: `1. "User cannot see their project in the dropdown"
Cause: The user account has an assignedProjectId that does not match the active site.
Solution: In Admin -> User Management, set Assigned Project to "All Projects" or select the correct site ID.

2. "Claim rejected as duplicate"
Cause: The claim matches an existing expense with identical vendor, date, and amount.
Solution: If this was a legitimate second purchase, have the employee add a clarifying note and invoice reference.

3. "Trial Balance difference detected"
Cause: A legacy manual journal voucher had missing credit entries.
Solution: Open Finance -> Journal Entries and inspect voucher balancing. SiteSync Pro includes automated balancing validation.

4. "GPS attendance clock-in outside geofence"
Cause: Mobile device location accuracy is low or worker is at an auxiliary site.
Solution: Site supervisor can review and approve an Attendance Correction request in HRMS.`,
      },
    ],
  },
];

// ============================================================================
// MAIN HELP CENTER COMPONENT
// ============================================================================
interface EnterpriseHelpCenterProps {
  onNavigateTab?: (tab: string) => void;
  onClose?: () => void;
}

export const EnterpriseHelpCenter: React.FC<EnterpriseHelpCenterProps> = ({
  onNavigateTab,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'guides' | 'workflows' | 'glossary' | 'manual'>('guides');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('EMPLOYEE');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('wf-expense');
  const [glossaryCategory, setGlossaryCategory] = useState<string>('ALL');

  // Filtered glossary terms
  const filteredGlossary = useMemo(() => {
    return ERP_GLOSSARY.filter((item) => {
      const matchesCategory = glossaryCategory === 'ALL' || item.category === glossaryCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        item.term.toLowerCase().includes(q) ||
        (item.abbreviation && item.abbreviation.toLowerCase().includes(q)) ||
        item.plainEnglishExplanation.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, glossaryCategory]);

  // Filtered manual sections
  const filteredManual = useMemo(() => {
    if (!searchQuery.trim()) return ADMIN_MANUAL_SECTIONS;
    const q = searchQuery.toLowerCase();
    return ADMIN_MANUAL_SECTIONS.filter(
      (sec) =>
        sec.title.toLowerCase().includes(q) ||
        sec.summary.toLowerCase().includes(q) ||
        sec.subsections.some((sub) => sub.heading.toLowerCase().includes(q) || sub.content.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const activeRoleGuide = useMemo(() => {
    return ROLE_GUIDES.find((r) => r.roleId === selectedRole) || ROLE_GUIDES[0];
  }, [selectedRole]);

  const activeWorkflow = useMemo(() => {
    return WORKFLOW_LIFECYCLES.find((w) => w.id === selectedWorkflowId) || WORKFLOW_LIFECYCLES[0];
  }, [selectedWorkflowId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner & Search Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs text-indigo-300 font-bold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>SiteSync Pro Enterprise Help Center & User Manual</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Knowledge Hub & Guided Workflows
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Plain-English instructions for normal employees, visual step-by-step life cycles, searchable ERP glossary, and the complete Administrator User Manual.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1.5 border border-slate-700"
              title="Print Documentation"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Print Guide</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative max-w-2xl">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by keyword, acronym (e.g. PR, GRN, RA Bill), role, or administrator topic..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('guides')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'guides'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Role-Based Guides</span>
          </button>

          <button
            onClick={() => setActiveTab('workflows')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'workflows'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Visual Workflow Steppers (5)</span>
          </button>

          <button
            onClick={() => setActiveTab('glossary')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'glossary'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>ERP Plain-English Glossary</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'manual'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin User Manual</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ROLE-BASED USER GUIDES                                             */}
      {/* ========================================================================= */}
      {activeTab === 'guides' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column: Role Selector Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
              Select Your Role
            </h3>
            <div className="space-y-1.5">
              {ROLE_GUIDES.map((rg) => (
                <button
                  key={rg.roleId}
                  onClick={() => setSelectedRole(rg.roleId)}
                  className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                    selectedRole === rg.roleId
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-extrabold text-xs">{rg.roleName}</div>
                    <div className={`text-[10px] ${selectedRole === rg.roleId ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {rg.frequentTasks.length} common tasks
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${selectedRole === rg.roleId ? 'text-white' : 'text-slate-400'}`} />
                </button>
              ))}
            </div>

            {/* Quick Helper Box */}
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs space-y-2">
              <div className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Task-First Design</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                You never need accounting knowledge to claim a ₹200 expense or clock your shift. The system handles all ledger bookings behind the scenes.
              </p>
            </div>
          </div>

          {/* Right Column: Active Role Guide Content */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Header Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Step-by-Step Training Guide
                  </span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {activeRoleGuide.roleName}
                  </h2>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  {activeRoleGuide.badge}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                {activeRoleGuide.targetAudience}
              </p>

              {/* Core Responsibilities */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Core Responsibilities:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {activeRoleGuide.coreResponsibilities.map((resp, i) => (
                    <div key={i} className="flex items-start space-x-2 text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Frequent Tasks Breakdown */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Standard Step-by-Step Procedures</span>
              </h3>

              {activeRoleGuide.frequentTasks.map((task, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-black">
                        {idx + 1}
                      </span>
                      <span>{task.title}</span>
                    </h4>
                    <p className="text-xs text-slate-500 pl-8">
                      {task.description}
                    </p>
                  </div>

                  {/* Numbered Steps */}
                  <div className="pl-8 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Step-by-Step Instructions:
                    </div>
                    <ol className="space-y-2 text-xs">
                      {task.stepByStep.map((step, sIdx) => (
                        <li key={sIdx} className="flex items-start space-x-2 text-slate-700 dark:text-slate-300">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                            {sIdx + 1}.
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* What happens next & Troubleshooting boxes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-8 pt-2">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs space-y-1">
                      <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>What Happens Next?</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        {task.whatHappensNext}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs space-y-1">
                      <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Helpful Tip</span>
                      </div>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400">
                        {task.troubleshootingTip}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VISUAL WORKFLOW STEPPERS                                           */}
      {/* ========================================================================= */}
      {activeTab === 'workflows' && (
        <div className="space-y-6">
          
          {/* Workflow Selector Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {WORKFLOW_LIFECYCLES.map((wf) => (
              <button
                key={wf.id}
                onClick={() => setSelectedWorkflowId(wf.id)}
                className={`p-4 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                  selectedWorkflowId === wf.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-300'
                }`}
              >
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedWorkflowId === wf.id ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400'}`}>
                    {wf.category}
                  </span>
                  <h4 className="font-extrabold text-xs mt-1">{wf.name}</h4>
                </div>
                <div className={`text-[10px] mt-2 font-mono ${selectedWorkflowId === wf.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {wf.steps.length} sequential stages
                </div>
              </button>
            ))}
          </div>

          {/* Active Workflow Diagram Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                End-to-End Visual Workflow
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {activeWorkflow.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {activeWorkflow.description}
              </p>
            </div>

            {/* Stepper Timeline Visualizer */}
            <div className="relative pl-6 border-l-2 border-indigo-500 dark:border-indigo-600 space-y-6 py-2">
              {activeWorkflow.steps.map((step, idx) => (
                <div key={idx} className="relative group">
                  {/* Step Bubble */}
                  <div className="absolute -left-[35px] top-0 w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center ring-4 ring-white dark:ring-slate-900 shadow">
                    {step.stepNumber}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                        <span>{step.title}</span>
                      </h4>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 w-fit">
                        Actor: {step.actor}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {step.description}
                    </p>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">State Transition:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {step.outcome}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Action Navigation */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-600 dark:text-slate-400">
                Ready to execute this workflow? Launch the respective module directly:
              </div>
              {onNavigateTab && (
                <button
                  onClick={() => {
                    if (activeWorkflow.id === 'wf-expense') onNavigateTab('expenses');
                    else if (activeWorkflow.id === 'wf-procurement') onNavigateTab('procurement');
                    else if (activeWorkflow.id === 'wf-commercial') onNavigateTab('commercial');
                    else onNavigateTab('inventory');
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center space-x-1.5 shadow"
                >
                  <span>Open Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PLAIN-ENGLISH GLOSSARY                                             */}
      {/* ========================================================================= */}
      {activeTab === 'glossary' && (
        <div className="space-y-6">
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {['ALL', 'Accounting', 'Procurement', 'Site & Store', 'Commercial', 'Projects'].map((cat) => (
              <button
                key={cat}
                onClick={() => setGlossaryCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  glossaryCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                }`}
              >
                {cat === 'ALL' ? 'All Jargon Terms' : cat}
              </button>
            ))}
          </div>

          {/* Glossary Term Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGlossary.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {item.term}
                      </h4>
                      {item.abbreviation && (
                        <span className="px-2 py-0.5 rounded-md font-mono text-xs font-black bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                          {item.abbreviation}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>

                  {/* Plain English Translation */}
                  <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-1">
                    <div className="text-[10px] font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                      In Plain Everyday English:
                    </div>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      {item.plainEnglishExplanation}
                    </p>
                  </div>

                  {/* Official Definition */}
                  <div className="text-xs text-slate-500">
                    <strong className="text-slate-700 dark:text-slate-300 font-semibold">ERP Definition:</strong> {item.definition}
                  </div>
                </div>

                {/* Real-World Example */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-start space-x-1.5">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">Example:</span>
                  <span>{item.example}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: COMPLETE ADMIN USER MANUAL                                         */}
      {/* ========================================================================= */}
      {activeTab === 'manual' && (
        <div className="space-y-6">
          
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span className="font-bold text-slate-800 dark:text-slate-200">
                SiteSync Pro Enterprise ERP — Administrator System Reference Manual (v6.0)
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-bold">
              6 Governance Chapters
            </span>
          </div>

          <div className="space-y-6">
            {filteredManual.map((sec) => (
              <div
                key={sec.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {sec.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {sec.summary}
                  </p>
                </div>

                <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {sec.subsections.map((sub, sIdx) => (
                    <div key={sIdx} className="space-y-2">
                      <h4 className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                        {sub.heading}
                      </h4>
                      <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                        {sub.content}
                      </pre>

                      {sub.bestPractices && sub.bestPractices.length > 0 && (
                        <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-1">
                          <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                            Administrator Best Practices:
                          </div>
                          <ul className="space-y-1 text-xs text-emerald-900 dark:text-emerald-300">
                            {sub.bestPractices.map((bp, bIdx) => (
                              <li key={bIdx} className="flex items-start space-x-1.5">
                                <span className="font-bold text-emerald-600">•</span>
                                <span>{bp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
