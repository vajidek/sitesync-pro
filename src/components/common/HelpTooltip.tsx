import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';

export const ERP_TOOLTIP_DEFINITIONS: Record<string, { term: string; explanation: string; example?: string }> = {
  GL: {
    term: 'General Ledger (GL)',
    explanation: 'The central master accounting ledger where all debits and credits are permanently recorded.',
    example: 'Account 5010 is debited when site materials are purchased.',
  },
  AP: {
    term: 'Accounts Payable (AP)',
    explanation: 'Money our company owes to vendors, suppliers, or subcontractors for goods or services delivered.',
    example: 'Vendor invoices waiting to be paid according to credit terms.',
  },
  AR: {
    term: 'Accounts Receivable (AR)',
    explanation: 'Money owed to our company by clients for certified construction work completed.',
    example: 'Client IPC bills submitted for monthly milestone payment.',
  },
  GRN: {
    term: 'Goods Receipt Note (GRN)',
    explanation: 'Official proof of delivery confirming goods arrived at the warehouse or site, counted, and inspected.',
    example: 'Storekeeper verifies 50 cement bags arrived undamaged.',
  },
  'RA Bill': {
    term: 'Running Account Bill (RA Bill)',
    explanation: 'An interim progress payment bill submitted by a contractor for work completed during the billing cycle.',
    example: 'Earthwork subcontractor bills for 4,500 m³ excavated this month.',
  },
  IPC: {
    term: 'Interim Payment Certificate (IPC)',
    explanation: 'Formal certificate issued by the client/consultant approving measured progress and authorizing payment.',
    example: 'Client engineer certifies ₹1.85 Cr after inspecting bridge piers.',
  },
  BOQ: {
    term: 'Bill of Quantities (BOQ)',
    explanation: 'The master itemized list of all materials, parts, and labor operations with agreed contract unit rates.',
    example: 'Item 2.4: M30 Reinforced Concrete at ₹6,500 per cubic meter.',
  },
  WBS: {
    term: 'Work Breakdown Structure (WBS)',
    explanation: 'Decomposing a large project into manageable packages (e.g. 1.0 Civil -> 1.1 Foundation -> 1.1.2 Piling).',
    example: 'Costs for steel rebar are charged directly to WBS 1.1.2.',
  },
  EVM: {
    term: 'Earned Value Management (EVM)',
    explanation: 'Compares how much was budgeted vs how much was actually spent vs physical completion progress.',
    example: 'Combines Cost (CPI) and Schedule (SPI) performance indices.',
  },
  CPI: {
    term: 'Cost Performance Index (CPI)',
    explanation: 'CPI = Earned Value / Actual Cost. Value > 1.0 means under budget (healthy); < 1.0 means cost overrun.',
    example: 'CPI of 1.02 means you got $1.02 worth of work for every $1.00 spent.',
  },
  SPI: {
    term: 'Schedule Performance Index (SPI)',
    explanation: 'SPI = Earned Value / Planned Value. Value > 1.0 means ahead of schedule; < 1.0 means behind schedule.',
    example: 'SPI of 1.04 indicates work is progressing 4% faster than planned.',
  },
  MIV: {
    term: 'Material Issue Voucher (MIV)',
    explanation: 'Warehouse slip recording items released from store stock to a specific work crew or job zone.',
    example: 'Releasing 10 cement bags to Pier 4 foundation crew.',
  },
  '3-Way Match': {
    term: 'Three-Way Matching',
    explanation: 'Automated verification ensuring Purchase Order (PO) == Goods Receipt (GRN) == Supplier Invoice.',
    example: 'Prevents paying for unordered or undelivered goods.',
  },
  'Cost Centre': {
    term: 'Cost Centre',
    explanation: 'The specific project, department, or business area that should bear and account for this cost.',
    example: 'CC-CIVIL-01 assigns expense directly to Civil Works.',
  },
  Retention: {
    term: 'Retention Money',
    explanation: 'A small portion (typically 5%) held back from bills until the defect liability warranty period expires.',
    example: '₹50,000 withheld on a ₹10 Lakh bill until final handover.',
  },
  'Advance Recovery': {
    term: 'Mobilization Advance Recovery',
    explanation: 'Proportional monthly deduction from bills to pay back the upfront setup advance given to the contractor.',
    example: 'Recovering ₹2,40,000 mobilization loan over 10 monthly bills.',
  },
  PR: {
    term: 'Purchase Requisition (PR)',
    explanation: 'An internal formal request asking the procurement team to buy materials or services.',
    example: 'Site engineer requests 50 tons of rebar before pour date.',
  },
  PO: {
    term: 'Purchase Order (PO)',
    explanation: 'Legally binding order sent to a supplier committing to purchase goods at agreed prices.',
    example: 'Official PO released to Emirates Cement.',
  },
};

interface HelpTooltipProps {
  code: keyof typeof ERP_TOOLTIP_DEFINITIONS | string;
  label?: string;
  showIcon?: boolean;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ code, label, showIcon = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const info: { term: string; explanation: string; example?: string } = ERP_TOOLTIP_DEFINITIONS[code] || {
    term: code,
    explanation: 'Enterprise enterprise resource planning operational attribute.',
    example: undefined,
  };

  return (
    <span className="relative inline-flex items-center gap-1 group">
      <span className="underline decoration-dotted decoration-indigo-400 dark:decoration-indigo-500 underline-offset-2 cursor-help font-semibold">
        {label || code}
      </span>
      {showIcon && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center"
          title={`Explain ${info.term}`}
          aria-label={`Explain ${info.term}`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Hover / Click Popup Tooltip */}
      <span
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-xl bg-slate-900 text-white text-xs shadow-2xl z-50 pointer-events-none transition-all duration-150 border border-slate-700/80 ${
          isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto'
        }`}
      >
        <span className="block font-bold text-indigo-300 text-xs mb-1">
          {info.term}
        </span>
        <span className="block text-[11px] text-slate-200 leading-relaxed">
          {info.explanation}
        </span>
        {info.example && (
          <span className="block text-[10px] text-slate-400 mt-1.5 pt-1 border-t border-slate-800">
            <strong className="text-indigo-400">Example:</strong> {info.example}
          </span>
        )}
        {/* Triangle Arrow */}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
      </span>
    </span>
  );
};
