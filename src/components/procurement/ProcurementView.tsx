import React, { useState, useEffect } from 'react';
import { safeFetchJson, safeJson } from '../../lib/safeFetch';
import { DSPageHeader, DSButton, DSTabs } from '../ui/design-system';
import { 
  Vendor, 
  RFQ, 
  VendorQuotation, 
  PurchaseRequisition, 
  PurchaseOrder, 
  GoodsReceiptNote, 
  SubcontractWorkOrder, 
  BOQItem, 
  MeasurementBookEntry, 
  Tender, 
  ProjectCostControl,
  PRStatus,
  MBStatus,
  TenderStatus
} from '../../types/procurement';
import { Project, InventoryItem } from '../../types';

import { VendorManagement } from './VendorManagement';
import { EnquiryRFQ } from './EnquiryRFQ';
import { QuotationManagement } from './QuotationManagement';
import { PurchaseRequisitionView } from './PurchaseRequisition';
import { PurchaseOrderView } from './PurchaseOrder';
import { GoodsReceiptView } from './GoodsReceipt';
import { SubcontractWorkOrdersView } from './SubcontractWorkOrders';
import { BOQManagementView } from './BOQManagement';
import { MeasurementBookView } from './MeasurementBook';
import { TenderManagementView } from './TenderManagement';
import { ProjectCostControlView } from './ProjectCostControl';
import { ProcurementReportsView } from './ProcurementReports';
import { PrintablePOModal } from './PrintablePOModal';
import { MaterialRequestModule } from './MaterialRequestModule';
import { EnterpriseVendorContractManagement } from './EnterpriseVendorContractManagement';
import { EnterpriseProcurementModule } from './EnterpriseProcurementModule';
import { RABillingModule } from './RABillingModule';

import { 
  Building2, 
  FileCheck2, 
  FileSpreadsheet, 
  ClipboardList, 
  FileCheck, 
  PackageCheck, 
  Wrench, 
  BarChart4, 
  Ruler, 
  Briefcase, 
  Calculator, 
  Award,
  DollarSign,
  Boxes,
  Layers,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Download,
  Receipt
} from 'lucide-react';

interface ProcurementViewProps {
  projects?: Project[];
  inventoryItems?: InventoryItem[];
  onRefreshProjects?: () => void;
}

const defaultProjects: Project[] = [
  {
    id: 'prj_01',
    code: 'PRJ-2026-001',
    name: 'Peruvannamuzhi WTP Pipe Network',
    client: 'Midland Water Resources Dept',
    category: 'Structural',
    location: 'Thane North Pier',
    status: 'In Progress',
    progress: 45,
    budgetUSD: 4500000,
    spentUSD: 1850000,
    startDate: '2026-01-15',
    targetCompletionDate: '2026-12-30',
    managerName: 'Robert Vance',
    inchargeName: 'Siddharth Nair',
    activeWorkersCount: 42,
    heavyMachineryCount: 8
  },
  {
    id: 'prj_02',
    code: 'PRJ-2026-002',
    name: 'High-Speed Rail Viaduct Segment B',
    client: 'NHSRCL',
    category: 'Mechanical',
    location: 'Surat Central Corridor',
    status: 'In Progress',
    progress: 30,
    budgetUSD: 12800000,
    spentUSD: 3400000,
    startDate: '2026-03-01',
    targetCompletionDate: '2027-04-15',
    managerName: 'Robert Vance',
    inchargeName: 'Vikram Singh',
    activeWorkersCount: 65,
    heavyMachineryCount: 14
  }
];

const defaultInventoryItems: InventoryItem[] = [
  {
    id: 'inv_01',
    itemCode: 'INV-STL-001',
    name: 'IS 2062 Grade E250 Steel Plates 25mm',
    category: 'Structural Steel',
    unit: 'Kg',
    quantityInStock: 85000,
    minThreshold: 20000,
    unitPriceUSD: 1,
    storeLocation: 'Bay A3 - Heavy Steel Store',
    lastRestocked: '2026-07-20',
    status: 'In Stock'
  },
  {
    id: 'inv_02',
    itemCode: 'INV-CST-002',
    name: 'High-Tensile Structural Anchor Bolts M36',
    category: 'Mechanical Fasteners',
    unit: 'Pcs',
    quantityInStock: 450,
    minThreshold: 100,
    unitPriceUSD: 42,
    storeLocation: 'Rack B2 - Hardware Store',
    lastRestocked: '2026-07-25',
    status: 'In Stock'
  }
];

export const ProcurementView: React.FC<ProcurementViewProps> = ({
  projects = defaultProjects,
  inventoryItems = defaultInventoryItems
}) => {
  const [activeTab, setActiveTab] = useState<string>('enterprise-procurement');

  // Data states
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [quotations, setQuotations] = useState<VendorQuotation[]>([]);
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [grns, setGrns] = useState<GoodsReceiptNote[]>([]);
  const [workOrders, setWorkOrders] = useState<SubcontractWorkOrder[]>([]);
  const [boqItems, setBoqItems] = useState<BOQItem[]>([]);
  const [measurementEntries, setMeasurementEntries] = useState<MeasurementBookEntry[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [costControls, setCostControls] = useState<ProjectCostControl[]>([]);

  // Print PO modal state
  const [printPo, setPrintPo] = useState<PurchaseOrder | null>(null);

  // Fetch initial data from Express API
  useEffect(() => {
    fetchProcurementData();
  }, []);

  const fetchProcurementData = async () => {
    try {
      const [vRes, rfqRes, qRes, prRes, poRes, grnRes, woRes, boqRes, mbRes, tRes, ccRes] = await Promise.all([
        safeFetchJson('/api/procurement/vendors'),
        safeFetchJson('/api/procurement/rfqs'),
        safeFetchJson('/api/procurement/quotations'),
        safeFetchJson('/api/procurement/requisitions'),
        safeFetchJson('/api/procurement/purchase-orders'),
        safeFetchJson('/api/procurement/grns'),
        safeFetchJson('/api/procurement/work-orders'),
        safeFetchJson('/api/procurement/boq'),
        safeFetchJson('/api/procurement/measurements'),
        safeFetchJson('/api/procurement/tenders'),
        safeFetchJson('/api/procurement/cost-control')
      ]);

      if (vRes?.success) setVendors(vRes.data);
      if (rfqRes?.success) setRfqs(rfqRes.data);
      if (qRes?.success) setQuotations(qRes.data);
      if (prRes?.success) setRequisitions(prRes.data);
      if (poRes?.success) setPurchaseOrders(poRes.data);
      if (grnRes?.success) setGrns(grnRes.data);
      if (woRes?.success) setWorkOrders(woRes.data);
      if (boqRes?.success) setBoqItems(boqRes.data);
      if (mbRes?.success) setMeasurementEntries(mbRes.data);
      if (tRes?.success) setTenders(tRes.data);
      if (ccRes?.success) setCostControls(ccRes.data);
    } catch (err) {
      console.error('Failed to fetch procurement data', err);
    }
  };

  // Handlers for API mutations
  const handleSaveVendor = async (vendorData: Partial<Vendor>) => {
    try {
      const res = await fetch('/api/procurement/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorData)
      });
      const data = await safeJson(res);
      if (data?.success) {
        setVendors([data.data, ...vendors]);
      }
    } catch (err) {
      console.error('Failed to save vendor', err);
    }
  };

  const handleUpdateVendor = async (id: string, vendorData: Partial<Vendor>) => {
    try {
      const res = await fetch(`/api/procurement/vendors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorData)
      });
      const data = await safeJson(res);
      if (data?.success) {
        setVendors(vendors.map(v => v.id === id ? data.data : v));
      }
    } catch (err) {
      console.error('Failed to update vendor', err);
    }
  };

  const handleDeleteVendor = async (id: string) => {
    try {
      const res = await fetch(`/api/procurement/vendors/${id}`, {
        method: 'DELETE'
      });
      const data = await safeJson(res);
      if (data?.success) {
        setVendors(vendors.filter(v => v.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete vendor', err);
    }
  };

  const handleCreateRFQ = async (rfqData: Partial<RFQ>) => {
    try {
      const res = await fetch('/api/procurement/rfqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rfqData)
      });
      const data = await safeJson(res);
      if (data?.success) {
        setRfqs([data.data, ...rfqs]);
      }
    } catch (err) {
      console.error('Failed to create RFQ', err);
    }
  };

  const handleSubmitQuotation = async (qData: Partial<VendorQuotation>) => {
    try {
      const res = await fetch('/api/procurement/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(qData)
      });
      const data = await safeJson(res);
      if (data?.success) {
        setQuotations([data.data, ...quotations]);
      }
    } catch (err) {
      console.error('Failed to submit quotation', err);
    }
  };

  const handleGeneratePOFromQuotation = async (q: VendorQuotation) => {
    const rfq = rfqs.find(r => r.id === q.rfqId);
    const vendor = vendors.find(v => v.id === q.vendorId);
    if (!rfq || !vendor) return;

    const poPayload: Partial<PurchaseOrder> = {
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorCode: vendor.vendorCode,
      vendorGstin: vendor.gstin,
      projectId: rfq.projectId,
      projectName: rfq.projectName,
      subtotalUSD: q.subtotalUSD,
      discountUSD: 0,
      gstUSD: q.taxUSD,
      freightUSD: q.freightUSD,
      netAmountUSD: q.netTotalUSD,
      deliveryDueDate: q.deliverySchedule,
      paymentTerms: 'Net 30 Days from GRN clearance',
      freightTerms: 'FOR Site',
      termsAndConditions: '1. Strict compliance to specs.\n2. GST invoice mandatory.',
      items: q.items.map(it => ({
        id: `poi_${Date.now()}`,
        itemCode: it.itemCode,
        description: it.description,
        unit: it.unit,
        quantity: it.quantity,
        unitPriceUSD: it.unitRateUSD,
        gstPercent: it.gstPercent,
        discountPercent: 0,
        totalAmountUSD: it.totalAmountUSD
      }))
    };

    handleCreatePO(poPayload);
    setActiveTab('po');
  };

  const handleCreatePR = async (prData: Partial<PurchaseRequisition>) => {
    try {
      const res = await fetch('/api/procurement/requisitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prData)
      });
      const data = await safeJson(res);
      if (data?.success) {
        setRequisitions([data.data, ...requisitions]);
      }
    } catch (err) {
      console.error('Failed to create PR', err);
    }
  };

  const handleUpdatePRStatus = async (id: string, status: PRStatus, verifiedBy?: string, approvedBy?: string) => {
    try {
      const res = await fetch(`/api/procurement/requisitions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, verifiedBy, approvedBy })
      });
      const data = await safeJson(res);
      if (data?.success) {
        setRequisitions(requisitions.map(p => p.id === id ? data.data : p));
      }
    } catch (err) {
      console.error('Failed to update PR status', err);
    }
  };

  const handleCreatePO = async (poData: Partial<PurchaseOrder>) => {
    try {
      const res = await fetch('/api/procurement/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poData)
      });
      const data = await safeJson(res);
      if (data?.success) {
        setPurchaseOrders([data.data, ...purchaseOrders]);
        fetchProcurementData(); // refresh cost controls
      }
    } catch (err) {
      console.error('Failed to create PO', err);
    }
  };

  const handleCreateGRN = async (grnData: Partial<GoodsReceiptNote>) => {
    try {
      const res = await fetch('/api/procurement/grns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(grnData)
      });
      const data = await safeJson(res);
      if (data?.success) {
        setGrns([data.data, ...grns]);
        fetchProcurementData(); // refresh cost controls & inventory
      }
    } catch (err) {
      console.error('Failed to create GRN', err);
    }
  };

  const handleCreateWO = async (woData: Partial<SubcontractWorkOrder>) => {
    try {
      const res = await fetch('/api/procurement/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(woData)
      });
      const data = await safeJson(res);
      if (data?.success) {
        setWorkOrders([data.data, ...workOrders]);
        fetchProcurementData();
      }
    } catch (err) {
      console.error('Failed to create Work Order', err);
    }
  };

  const handleAddVariationOrder = async (woId: string, variation: any) => {
    try {
      const res = await fetch(`/api/procurement/work-orders/${woId}/variations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variation)
      });
      const data = await safeJson(res);
      if (data?.success) {
        setWorkOrders(workOrders.map(w => w.id === woId ? data.data : w));
        fetchProcurementData();
      }
    } catch (err) {
      console.error('Failed to add variation', err);
    }
  };

  const handleCreateBOQItem = async (boqData: Partial<BOQItem>) => {
    try {
      const res = await fetch('/api/procurement/boq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(boqData)
      });
      const data = await safeJson(res);
      if (data?.success) {
        setBoqItems([data.data, ...boqItems]);
      }
    } catch (err) {
      console.error('Failed to create BOQ item', err);
    }
  };

  const handleCreateMeasurement = async (mbData: Partial<MeasurementBookEntry>) => {
    try {
      const res = await fetch('/api/procurement/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mbData)
      });
      const data = await safeJson(res);
      if (data?.success) {
        setMeasurementEntries([data.data, ...measurementEntries]);
        fetchProcurementData(); // refresh BOQ executed quantities
      }
    } catch (err) {
      console.error('Failed to create measurement entry', err);
    }
  };

  const handleUpdateMBStatus = async (id: string, status: MBStatus, verifiedBy?: string, approvedBy?: string) => {
    try {
      const res = await fetch(`/api/procurement/measurements/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, verifiedBy, approvedBy })
      });
      const data = await safeJson(res);
      if (data?.success) {
        setMeasurementEntries(measurementEntries.map(m => m.id === id ? data.data : m));
        fetchProcurementData();
      }
    } catch (err) {
      console.error('Failed to update MB status', err);
    }
  };

  const handleCreateTender = async (tenderData: Partial<Tender>) => {
    try {
      const res = await fetch('/api/procurement/tenders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenderData)
      });
      const data = await safeJson(res);
      if (data?.success) {
        setTenders([data.data, ...tenders]);
      }
    } catch (err) {
      console.error('Failed to create tender', err);
    }
  };

  const handleUpdateTenderStatus = async (id: string, status: TenderStatus, isAwarded?: boolean) => {
    try {
      const res = await fetch(`/api/procurement/tenders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, isAwarded })
      });
      const data = await safeJson(res);
      if (data?.success) {
        setTenders(tenders.map(t => t.id === id ? data.data : t));
      }
    } catch (err) {
      console.error('Failed to update tender status', err);
    }
  };

  // Sub-navigation tabs configuration
  const navTabs = [
    { id: 'enterprise-procurement', name: 'Strategic Procurement ERP (Phase 69)', icon: Sparkles, count: null },
    { id: 'material-requests', name: 'Material Requests & Approvals', icon: Layers, count: null },
    { id: 'vendor-contract-engine', name: 'Enterprise Vendors & Contracts', icon: ShieldCheck, count: null },
    { id: 'vendors', name: 'Vendor Master', icon: Building2, count: vendors.length },
    { id: 'rfq', name: 'Enquiry & RFQ', icon: FileCheck2, count: rfqs.length },
    { id: 'quotations', name: 'Vendor Quotations', icon: FileSpreadsheet, count: quotations.length },
    { id: 'pr', name: 'Purchase Requisitions', icon: ClipboardList, count: requisitions.length },
    { id: 'po', name: 'Purchase Orders', icon: FileCheck, count: purchaseOrders.length },
    { id: 'grn', name: 'Goods Receipt (GRN)', icon: PackageCheck, count: grns.length },
    { id: 'workorders', name: 'Work Orders & Subcontracts', icon: Wrench, count: workOrders.length },
    { id: 'ra-billing', name: 'Contractor RA Billing & IPC (P2.0)', icon: Receipt, count: null },
    { id: 'boq', name: 'BOQ Management', icon: BarChart4, count: boqItems.length },
    { id: 'mb', name: 'Measurement Book (MB)', icon: Ruler, count: measurementEntries.length },
    { id: 'tenders', name: 'Tenders & Bidding', icon: Briefcase, count: tenders.length },
    { id: 'costcontrol', name: 'Project Cost Control', icon: Calculator, count: costControls.length },
    { id: 'reports', name: 'Reports & Analytics', icon: Award, count: null }
  ];

  // High-level KPI metrics calculation
  const totalVendorCount = vendors.length;
  const approvedVendorsCount = vendors.filter(v => v.approvedStatus === 'Approved').length;
  const totalPoValue = purchaseOrders.reduce((acc, curr) => acc + curr.netAmountUSD, 0);
  const totalGrnCompleted = grns.length;
  const totalTendersAwarded = tenders.filter(t => t.isAwarded).length;

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden p-2 sm:p-6 pb-24">
      
      {/* Module Title Header */}
      <DSPageHeader
        title="Procurement, BOQ, Tender & Subcontract ERP"
        description="End-to-end material procurement lifecycle: Vendor onboarding, RFQ matrix, Purchase Orders, Store GRN integration, Subcontract Work Orders, BOQ, Digital Measurement Book & Project Cost Control."
        breadcrumbs={[{ label: 'ERP' }, { label: 'Procurement' }]}
        actions={
          <>
            <DSButton
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={fetchProcurementData}
            >
              Refresh
            </DSButton>

            <DSButton
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5 text-emerald-600" />}
              onClick={() => {
                const rows = ["PO_Number,Vendor,Project,Net_Amount,Date"]
                  .concat(purchaseOrders.map(p => `"${p.poNumber || ''}","${p.vendorName || ''}","${p.projectName || ''}","${p.netAmountUSD || 0}","${p.createdDate || ''}"`));
                const blob = new Blob([rows.join("\n")], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", `procurement_po_register_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
            >
              Export
            </DSButton>
          </>
        }
      />

      {/* Horizontal Scrollable Sub-Navigation Tabs */}
      <div className="pb-2">
        <DSTabs
          tabs={navTabs.map((t) => ({
            id: t.id,
            label: `${t.name}${t.count !== null ? ` (${t.count})` : ''}`,
            icon: <t.icon className="w-4 h-4" />,
          }))}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id)}
          variant="underline"
        />
      </div>

      {/* Active Tab Sub-Module Content */}
      <div className="transition-all duration-300">
        {activeTab === 'enterprise-procurement' && (
          <EnterpriseProcurementModule />
        )}

        {activeTab === 'material-requests' && (
          <MaterialRequestModule
            projects={projects}
            inventoryItems={inventoryItems}
            onRefreshData={fetchProcurementData}
          />
        )}

        {activeTab === 'vendor-contract-engine' && (
          <EnterpriseVendorContractManagement />
        )}

        {activeTab === 'vendors' && (
          <VendorManagement
            vendors={vendors}
            onAddVendor={handleSaveVendor}
            onUpdateVendor={handleUpdateVendor}
            onDeleteVendor={handleDeleteVendor}
          />
        )}

        {activeTab === 'rfq' && (
          <EnquiryRFQ
            rfqs={rfqs}
            vendors={vendors}
            projects={projects}
            onCreateRFQ={handleCreateRFQ}
          />
        )}

        {activeTab === 'quotations' && (
          <QuotationManagement
            quotations={quotations}
            rfqs={rfqs}
            vendors={vendors}
            onSubmitQuotation={handleSubmitQuotation}
            onGeneratePOFromQuotation={handleGeneratePOFromQuotation}
          />
        )}

        {activeTab === 'pr' && (
          <PurchaseRequisitionView
            requisitions={requisitions}
            projects={projects}
            inventoryItems={inventoryItems}
            onCreatePR={handleCreatePR}
            onUpdatePRStatus={handleUpdatePRStatus}
          />
        )}

        {activeTab === 'po' && (
          <PurchaseOrderView
            purchaseOrders={purchaseOrders}
            vendors={vendors}
            projects={projects}
            onCreatePO={handleCreatePO}
            onOpenPrintModal={(po) => setPrintPo(po)}
          />
        )}

        {activeTab === 'grn' && (
          <GoodsReceiptView
            grns={grns}
            purchaseOrders={purchaseOrders}
            onCreateGRN={handleCreateGRN}
          />
        )}

        {activeTab === 'workorders' && (
          <SubcontractWorkOrdersView
            workOrders={workOrders}
            projects={projects}
            onCreateWO={handleCreateWO}
            onAddVariationOrder={handleAddVariationOrder}
          />
        )}

        {activeTab === 'ra-billing' && (
          <RABillingModule
            projects={projects}
            workOrders={workOrders}
            boqItems={boqItems}
          />
        )}

        {activeTab === 'boq' && (
          <BOQManagementView
            boqItems={boqItems}
            projects={projects}
            onCreateBOQItem={handleCreateBOQItem}
          />
        )}

        {activeTab === 'mb' && (
          <MeasurementBookView
            entries={measurementEntries}
            boqItems={boqItems}
            projects={projects}
            onCreateEntry={handleCreateMeasurement}
            onUpdateStatus={handleUpdateMBStatus}
          />
        )}

        {activeTab === 'tenders' && (
          <TenderManagementView
            tenders={tenders}
            onCreateTender={handleCreateTender}
            onUpdateTenderStatus={handleUpdateTenderStatus}
          />
        )}

        {activeTab === 'costcontrol' && (
          <ProjectCostControlView
            costControls={costControls}
            projects={projects}
          />
        )}

        {activeTab === 'reports' && (
          <ProcurementReportsView
            vendors={vendors}
            purchaseOrders={purchaseOrders}
            grns={grns}
            boqItems={boqItems}
            tenders={tenders}
            costControls={costControls}
          />
        )}
      </div>

      {/* Printable PO Modal Trigger */}
      {printPo && (
        <PrintablePOModal
          po={printPo}
          onClose={() => setPrintPo(null)}
        />
      )}

    </div>
  );
};
