import React, { useState, useEffect } from 'react';
import { safeFetchJson } from '../../lib/safeFetch';
import { 
  MaterialRequest, 
  MaterialRequestItem, 
  MaterialRequestStatus, 
  MaterialRequestPriority,
  MaterialReceiptRecord 
} from '../../types/procurement';
import { Project, InventoryItem } from '../../types';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Boxes, 
  Building2, 
  X, 
  FileCheck, 
  ShieldCheck, 
  XCircle, 
  Truck, 
  Send, 
  HelpCircle, 
  RotateCcw, 
  UserCheck, 
  Calendar, 
  MapPin, 
  Phone, 
  Building, 
  User, 
  ChevronRight, 
  Eye, 
  FileText,
  PackageCheck,
  AlertTriangle,
  RefreshCw,
  Download,
  Check,
  Layers
} from 'lucide-react';

interface MaterialRequestModuleProps {
  projects?: Project[];
  inventoryItems?: InventoryItem[];
  currentUserRole?: string;
  currentUserId?: string;
  currentUserName?: string;
  onRefreshData?: () => void;
}

export const MaterialRequestModule: React.FC<MaterialRequestModuleProps> = ({
  projects = [],
  inventoryItems = [],
  currentUserRole = 'INCHARGE',
  currentUserId = 'usr_current',
  currentUserName = 'Siddharth Nair',
  onRefreshData
}) => {
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING_MY_APPROVAL' | 'MY_REQUESTS' | 'AWAITING_RECEIPT'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedProject, setSelectedProject] = useState<string>('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  // Form State for Creating Material Request
  const [formProjectId, setFormProjectId] = useState<string>(projects[0]?.id || 'prj_01');
  const [formSiteName, setFormSiteName] = useState<string>('Section 4 Pipe Trench Site');
  const [formUnloadingPoint, setFormUnloadingPoint] = useState<string>('Yard 2 Main Unloading Platform');
  const [formContactNumber, setFormContactNumber] = useState<string>('+91 98470 12345');
  const [formEmployeeId, setFormEmployeeId] = useState<string>('EMP-1004');
  const [formDesignation, setFormDesignation] = useState<string>('Site Supervisor');
  const [formDepartment, setFormDepartment] = useState<string>('Site Engineering');
  const [formCompany, setFormCompany] = useState<string>('SiteSync Infrastructure Pvt Ltd');
  const [formBranch, setFormBranch] = useState<string>('Kerala Zone - Calicut');
  const [formRequiredDate, setFormRequiredDate] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [formPriority, setFormPriority] = useState<MaterialRequestPriority>('Normal');
  const [formRemarks, setFormRemarks] = useState<string>('');

  // Editable Grid Items
  const [gridItems, setGridItems] = useState<Partial<MaterialRequestItem>[]>([
    {
      id: `item_init_1`,
      slNo: 1,
      itemDescription: '500mm DI K9 Pressure Pipe PN16',
      sizeSpecification: '500mm OD x 6m Length',
      manufacturer: 'Electrosteel Castings',
      quantity: 10,
      unit: 'Meters',
      remarks: 'High pressure transmission main'
    }
  ]);

  // Autocomplete item search state for grid
  const [activeItemSearchIdx, setActiveItemSearchIdx] = useState<number | null>(null);

  // Workflow action state
  const [actionRemarks, setActionRemarks] = useState<string>('');
  const [actionProcessing, setActionProcessing] = useState<boolean>(false);

  // Receipt Modal State
  const [receiptDate, setReceiptDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [receiptVehicle, setReceiptVehicle] = useState<string>('KL-11-AX-4521');
  const [receiptNoteNumber, setReceiptNoteNumber] = useState<string>(`DN-${Date.now().toString().slice(-6)}`);
  const [receiptStoreName, setReceiptStoreName] = useState<string>('Main Project Yard Store');
  const [receiptItemQuantities, setReceiptItemQuantities] = useState<Record<string, number>>({});
  const [receiptRemarks, setReceiptRemarks] = useState<string>('Material received in good condition.');

  // Low-Stock Trigger State
  const [isLowStockDrawerOpen, setIsLowStockDrawerOpen] = useState<boolean>(false);
  const [liveInventory, setLiveInventory] = useState<any[]>([]);

  // BOQ-Assisted Procurement & Suggestion State
  const [boqItems, setBoqItems] = useState<any[]>([]);
  const [isBoqPickerOpen, setIsBoqPickerOpen] = useState<boolean>(false);
  const [boqSearchTerm, setBoqSearchTerm] = useState<string>('');
  const [boqCategoryFilter, setBoqCategoryFilter] = useState<string>('ALL');

  // Fetch BOQ Items for Selected Project
  useEffect(() => {
    const fetchProjectBoqs = async () => {
      if (!formProjectId) return;
      try {
        const token = localStorage.getItem('sitesync_access_token');
        const res = await fetch(`/api/v1/procurement/boq?projectId=${formProjectId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const json = await res.json();
        if (json && json.success && Array.isArray(json.data)) {
          setBoqItems(json.data);
        } else {
          setBoqItems(getFallbackBoqItems(formProjectId));
        }
      } catch (e) {
        console.warn('BOQ items fetch error, using fallback BOQ:', e);
        setBoqItems(getFallbackBoqItems(formProjectId));
      }
    };
    fetchProjectBoqs();
  }, [formProjectId]);

  const getFallbackBoqItems = (prjId: string) => [
    { id: 'boq_01', itemCode: 'BOQ-CIV-001', projectId: prjId, category: 'Civil & Foundation', description: 'M25 Grade Ready Mix Concrete with Admixture', unit: 'CUM', quantity: 450, balanceQuantity: 280, rateUSD: 110 },
    { id: 'boq_02', itemCode: 'BOQ-PIP-002', projectId: prjId, category: 'Piping & Hydraulics', description: '500mm DI K9 Pressure Pipe PN16 with Socket Spigot', unit: 'Meters', quantity: 2400, balanceQuantity: 1150, rateUSD: 185 },
    { id: 'boq_03', itemCode: 'BOQ-VLV-003', projectId: prjId, category: 'Mechanical & Valves', description: '300mm Sluice Valve PN16 Resilient Seated Flanged', unit: 'Nos', quantity: 36, balanceQuantity: 18, rateUSD: 420 },
    { id: 'boq_04', itemCode: 'BOQ-STL-004', projectId: prjId, category: 'Structural Steel', description: 'Fe 500D High Yield Strength Deformed TMT Bars', unit: 'MT', quantity: 85, balanceQuantity: 42, rateUSD: 780 },
    { id: 'boq_05', itemCode: 'BOQ-ELE-005', projectId: prjId, category: 'Electrical & Instrumentation', description: '4 Core 16 sq mm XLPE Armoured Copper Cable 1.1kV', unit: 'Meters', quantity: 1800, balanceQuantity: 920, rateUSD: 14 },
  ];

  const handleImportBoqItem = (boq: any) => {
    const newItem: Partial<MaterialRequestItem> = {
      id: `item_boq_${Date.now()}_${Math.random().toString().slice(-4)}`,
      slNo: gridItems.length + 1,
      itemCode: boq.itemCode,
      itemDescription: boq.description || 'Project BOQ Specification Item',
      sizeSpecification: `${boq.category || 'Civil & Structural'} - BOQ Sanctioned Qty: ${boq.quantity} ${boq.unit}`,
      manufacturer: 'Approved Project BOQ Vendor',
      quantity: Math.max(1, Math.min(Number(boq.balanceQuantity || boq.quantity || 10), 50)),
      unit: boq.unit || 'Nos',
      boqRef: boq.itemCode,
      isBoqLinked: true,
      remarks: `Linked to BOQ Line ${boq.itemCode} (Sanctioned Balance: ${boq.balanceQuantity ?? boq.quantity} ${boq.unit})`
    };

    // If initial row is empty placeholder, replace it; else append
    if (gridItems.length === 1 && (!gridItems[0].itemDescription || gridItems[0].itemDescription.trim() === '')) {
      setGridItems([newItem]);
    } else {
      setGridItems([...gridItems, newItem]);
    }
  };

  // Fetch Inventory for Live Low-Stock Detection
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const token = localStorage.getItem('sitesync_access_token');
        const res = await fetch('/api/inventory/materials', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const json = await res.json();
        if (json && json.success && Array.isArray(json.data)) {
          setLiveInventory(json.data);
        }
      } catch (e) {
        console.warn('Inventory fetch error, using fallback inventory:', e);
      }
    };
    fetchInventory();
  }, []);

  const fallbackInventory = [
    { id: 'mat_01', itemCode: 'MAT-PIP-001', name: '500mm DI K9 Pressure Pipe PN16', currentStock: 4, reorderLevel: 20, minStock: 10, maxStock: 60, unit: 'Meters', category: 'Pipes', specification: '500mm OD x 6m Length' },
    { id: 'mat_02', itemCode: 'MAT-VLV-002', name: '300mm Sluice Valve PN16 Flanged', currentStock: 1, reorderLevel: 5, minStock: 3, maxStock: 15, unit: 'Nos', category: 'Valves', specification: 'PN16 Resilient Seated' },
    { id: 'mat_03', itemCode: 'MAT-CEM-003', name: 'OPC 53 Grade Cement Bags', currentStock: 25, reorderLevel: 100, minStock: 50, maxStock: 300, unit: 'Bags', category: 'Civil', specification: 'IS 12269 Standard' },
    { id: 'mat_04', itemCode: 'MAT-STL-004', name: 'Fe 500D TMT Rebar 16mm', currentStock: 120, reorderLevel: 500, minStock: 250, maxStock: 1200, unit: 'Kg', category: 'Structural', specification: 'High Ductility Fe500D' },
    { id: 'mat_05', itemCode: 'MAT-FST-005', name: 'SS316 Hex Bolt M20x100mm', currentStock: 12, reorderLevel: 50, minStock: 30, maxStock: 150, unit: 'Sets', category: 'Fasteners', specification: 'Grade 316 with 2 Washers & Nut' },
  ];

  const effectiveInventoryList = liveInventory.length > 0 ? liveInventory : (inventoryItems.length > 0 ? inventoryItems.map(i => ({
    id: i.id,
    itemCode: i.itemCode,
    name: i.name,
    currentStock: i.quantity ?? 0,
    reorderLevel: i.minQuantity ?? 15,
    minStock: i.minQuantity ?? 10,
    maxStock: (i.minQuantity ?? 15) * 3,
    unit: i.unit || 'Nos',
    category: i.category || 'General',
    specification: 'Standard Specification'
  })) : fallbackInventory);

  const lowStockItems = effectiveInventoryList.filter(item => {
    const stock = Number(item.currentStock ?? item.quantity ?? 0);
    const reorder = Number(item.reorderLevel ?? item.minStock ?? item.minQuantity ?? 15);
    return stock <= reorder;
  });

  const handleGenerateDraftPrFromLowStock = (targetItems?: any[]) => {
    const itemsToProcess = targetItems && targetItems.length > 0 ? targetItems : lowStockItems;
    if (itemsToProcess.length === 0) return;

    const generatedGrid: Partial<MaterialRequestItem>[] = itemsToProcess.map((item, idx) => {
      const current = Number(item.currentStock ?? item.quantity ?? 0);
      const reorder = Number(item.reorderLevel ?? item.minStock ?? item.minQuantity ?? 15);
      const max = Number(item.maxStock ?? reorder * 3);
      const deficit = Math.max(max - current, reorder * 2 - current, 10);

      return {
        id: `item_auto_${Date.now()}_${idx}`,
        slNo: idx + 1,
        materialId: item.id,
        itemCode: item.itemCode || `MAT-${idx + 1}`,
        itemDescription: item.name || item.itemDescription || 'Low Stock Replenishment Item',
        sizeSpecification: item.specification || item.sizeSpecification || 'Project Standard Specification',
        manufacturer: item.manufacturer || 'Approved Vendor',
        quantity: deficit,
        unit: item.unit || 'Nos',
        remarks: `Automated reorder replenishment: Current stock (${current} ${item.unit || 'Nos'}) is at or below reorder threshold (${reorder} ${item.unit || 'Nos'}).`
      };
    });

    setGridItems(generatedGrid);
    setFormPriority('Urgent');
    setFormRemarks(`Automated replenishment requisition triggered from Low-Stock Alert Engine for ${itemsToProcess.length} items.`);
    setIsCreateModalOpen(true);
    setIsLowStockDrawerOpen(false);
  };

  // Load Material Requests from Backend API
  const fetchMaterialRequests = async () => {
    setLoading(true);
    try {
      const res = await safeFetchJson('/api/v1/procurement/material-requests');
      if (res.ok && res.data && res.data.success) {
        setRequests(res.data.data || []);
      } else {
        // Fallback or seed data
        setRequests(getFallbackRequests());
      }
    } catch (err) {
      console.error('Error fetching material requests:', err);
      setRequests(getFallbackRequests());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterialRequests();
  }, []);

  const getFallbackRequests = (): MaterialRequest[] => [
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

  // Grid row operations
  const handleAddGridRow = () => {
    setGridItems([
      ...gridItems,
      {
        id: `item_new_${Date.now()}_${gridItems.length + 1}`,
        slNo: gridItems.length + 1,
        itemDescription: '',
        sizeSpecification: '',
        manufacturer: '',
        quantity: 1,
        unit: 'Nos',
        remarks: ''
      }
    ]);
  };

  const handleRemoveGridRow = (index: number) => {
    if (gridItems.length <= 1) return;
    const updated = gridItems.filter((_, i) => i !== index).map((item, idx) => ({
      ...item,
      slNo: idx + 1
    }));
    setGridItems(updated);
  };

  const handleGridChange = (index: number, field: keyof MaterialRequestItem, value: any) => {
    const updated = [...gridItems];
    updated[index] = { ...updated[index], [field]: value };
    setGridItems(updated);
  };

  const handleSelectItemSuggestion = (index: number, invItem: InventoryItem) => {
    const updated = [...gridItems];
    const anyInv = invItem as any;
    updated[index] = {
      ...updated[index],
      materialId: invItem.id,
      itemCode: invItem.itemCode,
      itemDescription: invItem.name,
      sizeSpecification: anyInv.specification || invItem.category || '',
      unit: invItem.unit || 'Nos',
      manufacturer: anyInv.manufacturer || 'Approved Vendor'
    };
    setGridItems(updated);
    setActiveItemSearchIdx(null);
  };

  // Submit Create Form
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (gridItems.some(i => !i.itemDescription || !i.quantity || i.quantity <= 0)) {
      alert('Please fill out all required item descriptions and valid positive quantities.');
      return;
    }

    const selectedProjObj = projects.find(p => p.id === formProjectId);

    const payload = {
      projectId: formProjectId,
      projectName: selectedProjObj ? selectedProjObj.name : 'Infrastructure Project',
      siteName: formSiteName,
      unloadingPoint: formUnloadingPoint,
      contactNumber: formContactNumber,
      employeeId: formEmployeeId,
      designation: formDesignation,
      department: formDepartment,
      company: formCompany,
      branch: formBranch,
      requiredDate: formRequiredDate,
      priority: formPriority,
      remarks: formRemarks,
      requestedByUserId: currentUserId,
      requestedByUserName: currentUserName,
      items: gridItems.map((gi, idx) => ({
        slNo: idx + 1,
        materialId: gi.materialId,
        itemCode: gi.itemCode,
        itemDescription: gi.itemDescription || '',
        sizeSpecification: gi.sizeSpecification || '',
        manufacturer: gi.manufacturer || '',
        quantity: Number(gi.quantity),
        receivedQuantity: 0,
        unit: gi.unit || 'Nos',
        remarks: gi.remarks || ''
      }))
    };

    setActionProcessing(true);
    try {
      const res = await safeFetchJson('/api/v1/procurement/material-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok && res.data && res.data.success) {
        setRequests([res.data.data, ...requests]);
        setIsCreateModalOpen(false);
        resetCreateForm();
        if (onRefreshData) onRefreshData();
      } else {
        // Fallback local update
        const fallbackObj: MaterialRequest = {
          id: `mr_local_${Date.now()}`,
          requestNo: `MR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
          requestDate: new Date().toISOString().split('T')[0],
          requestedByUserId: currentUserId,
          requestedByUserName: currentUserName,
          employeeId: formEmployeeId,
          designation: formDesignation,
          department: formDepartment,
          company: formCompany,
          branch: formBranch,
          projectId: formProjectId,
          projectName: selectedProjObj ? selectedProjObj.name : 'Project Alpha',
          siteName: formSiteName,
          unloadingPoint: formUnloadingPoint,
          contactNumber: formContactNumber,
          requiredDate: formRequiredDate,
          priority: formPriority,
          remarks: formRemarks,
          status: 'Pending Incharge',
          currentApproverRole: 'INCHARGE',
          currentApproverName: 'Site Incharge',
          items: payload.items as any,
          approvalHistory: [
            {
              id: `aph_${Date.now()}`,
              step: 'Initiation',
              actorId: currentUserId,
              actorName: currentUserName,
              actorRole: currentUserRole,
              action: 'Submitted',
              remarks: formRemarks || 'Material Request submitted.',
              timestamp: new Date().toISOString()
            }
          ],
          receipts: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setRequests([fallbackObj, ...requests]);
        setIsCreateModalOpen(false);
        resetCreateForm();
      }
    } catch (err) {
      console.error('Error creating MR:', err);
    } finally {
      setActionProcessing(false);
    }
  };

  const resetCreateForm = () => {
    setGridItems([
      {
        id: `item_init_${Date.now()}`,
        slNo: 1,
        itemDescription: '',
        sizeSpecification: '',
        manufacturer: '',
        quantity: 1,
        unit: 'Nos',
        remarks: ''
      }
    ]);
    setFormRemarks('');
  };

  // Workflow Action Handler (Approve, Reject, Send Back, Clarification)
  const handleWorkflowAction = async (action: 'APPROVE' | 'REJECT' | 'SEND_BACK' | 'CLARIFICATION_REQUESTED' | 'CANCEL') => {
    if (!selectedRequest) return;
    if ((action === 'REJECT' || action === 'SEND_BACK' || action === 'CLARIFICATION_REQUESTED') && !actionRemarks.trim()) {
      alert('Please provide mandatory remarks for this action.');
      return;
    }

    setActionProcessing(true);
    try {
      const res = await safeFetchJson(`/api/v1/procurement/material-requests/${selectedRequest.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, remarks: actionRemarks })
      });

      if (res.ok && res.data && res.data.success) {
        const updatedObj = res.data.data;
        setRequests(requests.map(r => r.id === updatedObj.id ? updatedObj : r));
        setSelectedRequest(updatedObj);
        setActionRemarks('');
        if (action === 'CANCEL') setIsDetailModalOpen(false);
      } else {
        // Local state mutation fallback
        let newStatus = selectedRequest.status;
        let mappedAction: any = 'Approved';
        if (action === 'APPROVE') {
          mappedAction = 'Approved';
          if (selectedRequest.status === 'Pending Incharge' || selectedRequest.status === 'Submitted') {
            newStatus = 'Pending Manager';
          } else if (selectedRequest.status === 'Pending Manager') {
            newStatus = 'Approved';
          }
        } else if (action === 'REJECT') {
          mappedAction = 'Rejected';
          newStatus = 'Rejected';
        } else if (action === 'SEND_BACK') {
          mappedAction = 'Sent Back';
          newStatus = 'Draft';
        } else if (action === 'CLARIFICATION_REQUESTED') {
          mappedAction = 'Clarification Requested';
          newStatus = 'Clarification Requested';
        } else if (action === 'CANCEL') {
          mappedAction = 'Cancelled';
          newStatus = 'Cancelled';
        }

        const newHistory = [
          ...selectedRequest.approvalHistory,
          {
            id: `aph_${Date.now()}`,
            step: selectedRequest.status,
            actorId: currentUserId,
            actorName: currentUserName,
            actorRole: currentUserRole,
            action: mappedAction,
            remarks: actionRemarks || 'Action processed.',
            timestamp: new Date().toISOString()
          }
        ];

        const updatedLocal: MaterialRequest = {
          ...selectedRequest,
          status: newStatus as any,
          approvalHistory: newHistory,
          updatedAt: new Date().toISOString()
        };

        setRequests(requests.map(r => r.id === updatedLocal.id ? updatedLocal : r));
        setSelectedRequest(updatedLocal);
        setActionRemarks('');
      }
    } catch (err) {
      console.error('Error processing workflow action:', err);
    } finally {
      setActionProcessing(false);
    }
  };

  // Open Receipt Modal
  const openReceiptModal = (req: MaterialRequest) => {
    setSelectedRequest(req);
    // Initialize receipt quantities with remaining balance
    const initQtys: Record<string, number> = {};
    req.items.forEach(item => {
      const remaining = Math.max(0, item.quantity - item.receivedQuantity);
      initQtys[item.id] = remaining;
    });
    setReceiptItemQuantities(initQtys);
    setIsReceiptModalOpen(true);
  };

  // Submit Receipt
  const handleReceiptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    const itemsReceiptList = Object.entries(receiptItemQuantities)
      .map(([itemId, qty]) => {
        const matchingItem = selectedRequest.items.find(i => i.id === itemId);
        return {
          itemId,
          itemDescription: matchingItem?.itemDescription || 'Material Item',
          receivedQty: Number(qty),
          unit: matchingItem?.unit || 'Nos'
        };
      })
      .filter(i => i.receivedQty > 0);

    if (itemsReceiptList.length === 0) {
      alert('Please enter at least one positive received quantity.');
      return;
    }

    const payload = {
      receivedDate: receiptDate,
      deliveryProjectId: selectedRequest.projectId,
      deliveryProjectName: selectedRequest.projectName,
      storeName: receiptStoreName,
      receiverName: currentUserName,
      vehicleNumber: receiptVehicle,
      deliveryNoteNumber: receiptNoteNumber,
      items: itemsReceiptList,
      remarks: receiptRemarks
    };

    setActionProcessing(true);
    try {
      const res = await safeFetchJson(`/api/v1/procurement/material-requests/${selectedRequest.id}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok && res.data && res.data.success) {
        const updatedObj = res.data.data;
        setRequests(requests.map(r => r.id === updatedObj.id ? updatedObj : r));
        setSelectedRequest(updatedObj);
        setIsReceiptModalOpen(false);
      } else {
        // Fallback local update
        const updatedItems = selectedRequest.items.map(item => {
          const rQty = receiptItemQuantities[item.id] || 0;
          return {
            ...item,
            receivedQuantity: item.receivedQuantity + Number(rQty)
          };
        });

        const isFullyReceived = updatedItems.every(i => i.receivedQuantity >= i.quantity);
        const newReceiptObj: MaterialReceiptRecord = {
          id: `mrr_${Date.now()}`,
          receivedDate: receiptDate,
          deliveryProjectId: selectedRequest.projectId,
          deliveryProjectName: selectedRequest.projectName,
          storeId: 'str_site_yard',
          storeName: receiptStoreName,
          receiverName: currentUserName,
          vehicleNumber: receiptVehicle,
          deliveryNoteNumber: receiptNoteNumber,
          items: itemsReceiptList,
          remarks: receiptRemarks,
          createdAt: new Date().toISOString()
        };

        const updatedLocal: MaterialRequest = {
          ...selectedRequest,
          status: isFullyReceived ? 'Completed' : 'Partially Received',
          items: updatedItems,
          receipts: [...(selectedRequest.receipts || []), newReceiptObj],
          approvalHistory: [
            ...selectedRequest.approvalHistory,
            {
              id: `aph_${Date.now()}`,
              step: 'Material Receipt',
              actorId: currentUserId,
              actorName: currentUserName,
              actorRole: currentUserRole,
              action: 'Receipt Recorded',
              remarks: `Delivery recorded via DN #${receiptNoteNumber}`,
              timestamp: new Date().toISOString()
            }
          ]
        };

        setRequests(requests.map(r => r.id === updatedLocal.id ? updatedLocal : r));
        setSelectedRequest(updatedLocal);
        setIsReceiptModalOpen(false);
      }
    } catch (err) {
      console.error('Error submitting material receipt:', err);
    } finally {
      setActionProcessing(false);
    }
  };

  // Filtered Request List
  const filteredRequests = requests.filter(req => {
    // Search
    const matchesSearch = 
      req.requestNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requestedByUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.items.some(i => i.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()));

    // Dropdown Filters
    const matchesStatus = selectedStatus === 'ALL' || req.status === selectedStatus;
    const matchesPriority = selectedPriority === 'ALL' || req.priority === selectedPriority;
    const matchesProject = selectedProject === 'ALL' || req.projectId === selectedProject;

    // Tabs
    let matchesTab = true;
    if (activeTab === 'PENDING_MY_APPROVAL') {
      matchesTab = 
        req.currentApproverRole === currentUserRole ||
        (currentUserRole === 'ADMIN') ||
        (currentUserRole === 'INCHARGE' && req.status === 'Pending Incharge') ||
        (currentUserRole === 'MANAGER' && req.status === 'Pending Manager');
    } else if (activeTab === 'MY_REQUESTS') {
      matchesTab = req.requestedByUserId === currentUserId || req.requestedByUserName === currentUserName;
    } else if (activeTab === 'AWAITING_RECEIPT') {
      matchesTab = req.status === 'Approved' || req.status === 'Partially Received';
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesTab;
  });

  // KPI Calculations
  const pendingMyApprovalCount = requests.filter(r => 
    r.currentApproverRole === currentUserRole ||
    (currentUserRole === 'ADMIN' && (r.status === 'Pending Incharge' || r.status === 'Pending Manager')) ||
    (currentUserRole === 'INCHARGE' && r.status === 'Pending Incharge') ||
    (currentUserRole === 'MANAGER' && r.status === 'Pending Manager')
  ).length;

  const myRequestsCount = requests.filter(r => r.requestedByUserId === currentUserId || r.requestedByUserName === currentUserName).length;
  const urgentCount = requests.filter(r => r.priority === 'Urgent' || r.priority === 'Emergency').length;
  const awaitingReceiptCount = requests.filter(r => r.status === 'Approved' || r.status === 'Partially Received').length;

  const getStatusBadge = (status: MaterialRequestStatus) => {
    switch (status) {
      case 'Approved':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approved</span>;
      case 'Pending Incharge':
      case 'Pending Manager':
      case 'Submitted':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800"><Clock className="w-3.5 h-3.5 mr-1" /> {status}</span>;
      case 'Partially Received':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800"><Truck className="w-3.5 h-3.5 mr-1" /> Partially Received</span>;
      case 'Completed':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-300 dark:border-teal-800"><PackageCheck className="w-3.5 h-3.5 mr-1" /> Completed</span>;
      case 'Rejected':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800"><XCircle className="w-3.5 h-3.5 mr-1" /> Rejected</span>;
      case 'Clarification Requested':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800"><HelpCircle className="w-3.5 h-3.5 mr-1" /> Clarification</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: MaterialRequestPriority) => {
    switch (priority) {
      case 'Emergency':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-600 text-white animate-pulse">EMERGENCY</span>;
      case 'Urgent':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500 text-white">URGENT</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">NORMAL</span>;
    }
  };

  return (
    <div className="space-y-6">

      {/* Module Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Material Request & Approval Workflow Engine</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Enterprise v24</span>
              </h2>
              <p className="text-xs text-slate-5-00 dark:text-slate-400 mt-0.5">
                Hierarchy-based Material Procurement Routing: Supervisor &rarr; Incharge &rarr; Manager &rarr; Store Receipt
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchMaterialRequests}
            className="p-2.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Material Request</span>
          </button>
        </div>
      </div>

      {/* KPI Dashboard Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div 
          onClick={() => setActiveTab('PENDING_MY_APPROVAL')}
          className={`cursor-pointer p-5 rounded-2xl border transition shadow-sm ${
            activeTab === 'PENDING_MY_APPROVAL' 
              ? 'bg-amber-50/80 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700' 
              : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">Pending My Action</span>
            <div className="p-2 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{pendingMyApprovalCount}</span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Requires Approval</span>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('MY_REQUESTS')}
          className={`cursor-pointer p-5 rounded-2xl border transition shadow-sm ${
            activeTab === 'MY_REQUESTS' 
              ? 'bg-blue-50/80 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700' 
              : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">My Requests</span>
            <div className="p-2 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 rounded-lg">
              <User className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{myRequestsCount}</span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Submitted by me</span>
          </div>
        </div>

        <div 
          onClick={() => { setActiveTab('ALL'); setSelectedPriority('Urgent'); }}
          className="p-5 rounded-2xl border bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:border-rose-300 transition shadow-sm cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">Urgent Requests</span>
            <div className="p-2 bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{urgentCount}</span>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">High priority</span>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('AWAITING_RECEIPT')}
          className={`cursor-pointer p-5 rounded-2xl border transition shadow-sm ${
            activeTab === 'AWAITING_RECEIPT' 
              ? 'bg-emerald-50/80 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-700' 
              : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Awaiting Site Delivery</span>
            <div className="p-2 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 rounded-lg">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{awaitingReceiptCount}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Ready for Store Receipt</span>
          </div>
        </div>

      </div>

      {/* Low-Stock Automated Replenishment Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 dark:border-amber-700/60 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Low-Stock Replenishment Triggers ({lowStockItems.length} Materials Below Minimum Level)
                </h4>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-full bg-amber-500 text-white">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Site inventories for critical materials have fallen below safety thresholds. Generate draft requisitions for review and managerial sign-off.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => setIsLowStockDrawerOpen(true)}
              className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
            >
              <Boxes className="w-3.5 h-3.5 text-amber-500" />
              <span>Review Items ({lowStockItems.length})</span>
            </button>

            <button
              onClick={() => handleGenerateDraftPrFromLowStock()}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>1-Click Draft Requisition for All</span>
            </button>
          </div>
        </div>
      )}

      {/* Tabs & Search Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Requests ({requests.length})
          </button>

          <button
            onClick={() => setActiveTab('PENDING_MY_APPROVAL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'PENDING_MY_APPROVAL'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <span>Pending Approval</span>
            {pendingMyApprovalCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-200 text-amber-900 font-black">
                {pendingMyApprovalCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('MY_REQUESTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'MY_REQUESTS'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
            }`}
          >
            My Requests ({myRequestsCount})
          </button>

          <button
            onClick={() => setActiveTab('AWAITING_RECEIPT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'AWAITING_RECEIPT'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            Awaiting Site Receipt ({awaitingReceiptCount})
          </button>
        </div>

        {/* Filter Inputs Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search request #, project, material item..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending Incharge">Pending Incharge</option>
              <option value="Pending Manager">Pending Manager</option>
              <option value="Approved">Approved</option>
              <option value="Partially Received">Partially Received</option>
              <option value="Completed">Completed</option>
              <option value="Clarification Requested">Clarification Requested</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          {/* Project Filter */}
          <div>
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Requests Directory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Request No & Date</th>
                <th className="py-3.5 px-4">Project & Site</th>
                <th className="py-3.5 px-4">Requested By</th>
                <th className="py-3.5 px-4">Items Summary</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Workflow Status</th>
                <th className="py-3.5 px-4">Approver Stage</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-sm">No Material Requests match your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => {
                  const itemsCount = req.items?.length || 0;
                  const firstItem = req.items?.[0]?.itemDescription || 'Material items';

                  return (
                    <tr 
                      key={req.id} 
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer"
                      onClick={() => { setSelectedRequest(req); setIsDetailModalOpen(true); }}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        <div>{req.requestNo}</div>
                        <div className="text-[11px] text-slate-400 font-sans font-normal mt-0.5">{req.requestDate}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white max-w-[200px] truncate">{req.projectName}</div>
                        <div className="text-[11px] text-slate-400 flex items-center mt-0.5">
                          <MapPin className="w-3 h-3 mr-1 inline" />
                          <span className="truncate max-w-[180px]">{req.siteName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{req.requestedByUserName}</div>
                        <div className="text-[11px] text-slate-400">{req.designation} ({req.employeeId})</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="font-medium truncate text-slate-900 dark:text-white">{firstItem}</div>
                        {itemsCount > 1 && (
                          <div className="text-[10px] text-slate-400 mt-0.5">+{itemsCount - 1} more item(s)</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {getPriorityBadge(req.priority)}
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(req.status)}
                      </td>

                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                        {req.currentApproverRole === 'NONE' ? '-' : req.currentApproverRole}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => { setSelectedRequest(req); setIsDetailModalOpen(true); }}
                          className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition"
                        >
                          View Details
                        </button>

                        {(req.status === 'Approved' || req.status === 'Partially Received') && (
                          <button
                            onClick={() => openReceiptModal(req)}
                            className="px-2.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-sm"
                          >
                            Record Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* CREATE MATERIAL REQUEST MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full p-6 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl my-8">
            
            {/* Modal Title */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  <span>Initiate Enterprise Material Request</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dynamic approval hierarchy will auto-route this request to your reporting line.
                </p>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-6 text-xs">
              
              {/* Header Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Requester Employee</label>
                  <input
                    type="text"
                    value={`${currentUserName} (${formEmployeeId})`}
                    disabled
                    className="w-full px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Designation & Department</label>
                  <input
                    type="text"
                    value={`${formDesignation} - ${formDepartment}`}
                    disabled
                    className="w-full px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formContactNumber}
                    onChange={e => setFormContactNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Project & Location Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Project *</label>
                  <select
                    value={formProjectId}
                    onChange={e => setFormProjectId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Site Location *</label>
                  <input
                    type="text"
                    value={formSiteName}
                    onChange={e => setFormSiteName(e.target.value)}
                    required
                    placeholder="e.g. Section 4 Pier Trench"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Unloading Point *</label>
                  <input
                    type="text"
                    value={formUnloadingPoint}
                    onChange={e => setFormUnloadingPoint(e.target.value)}
                    required
                    placeholder="e.g. Yard 2 Platform"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Required By Date *</label>
                  <input
                    type="date"
                    value={formRequiredDate}
                    onChange={e => setFormRequiredDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority Level *</label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as MaterialRequestPriority)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Remarks / Justification</label>
                  <input
                    type="text"
                    value={formRemarks}
                    onChange={e => setFormRemarks(e.target.value)}
                    placeholder="e.g. Critical for monsoon pipeline work"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Dynamic Material Items Table */}
              <div className="space-y-3">
                {/* BOQ Intelligent Suggestion Banner */}
                <div className="p-3 bg-gradient-to-r from-indigo-50/90 via-indigo-50/40 to-transparent dark:from-indigo-950/40 dark:via-indigo-950/20 dark:to-transparent rounded-xl border border-indigo-200 dark:border-indigo-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-start space-x-2.5">
                    <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-sm">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">Intelligent BOQ Reference & Suggestions</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
                          Optional Reference
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        Import approved project BOQ line items with standardized specifications. Non-BOQ and emergency materials are also freely supported.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBoqPickerOpen(true)}
                    className="flex-shrink-0 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs shadow transition flex items-center space-x-1.5 self-start sm:self-auto"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Browse Project BOQ ({boqItems.length})</span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                    <Boxes className="w-4 h-4 text-blue-600" />
                    <span>Material Items Breakdown</span>
                  </h4>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsBoqPickerOpen(true)}
                      className="flex items-center space-x-1 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 rounded-lg text-xs font-semibold border border-indigo-200 dark:border-indigo-800 transition"
                    >
                      <Layers className="w-3 h-3 text-indigo-500" />
                      <span>+ From BOQ</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddGridRow}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:bg-blue-100 rounded-lg font-semibold transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Custom Item</span>
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                      <tr>
                        <th className="p-2.5 w-12 text-center">Sl</th>
                        <th className="p-2.5">Item Description (Auto-Suggest) *</th>
                        <th className="p-2.5">Size / Spec</th>
                        <th className="p-2.5">Manufacturer</th>
                        <th className="p-2.5 w-24">Qty *</th>
                        <th className="p-2.5 w-24">Unit</th>
                        <th className="p-2.5 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {gridItems.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className="p-2 text-center font-bold text-slate-400">{idx + 1}</td>
                          
                          {/* Item Description with Autocomplete & BOQ Badge */}
                          <td className="p-2 relative">
                            <input
                              type="text"
                              value={item.itemDescription || ''}
                              onChange={e => {
                                handleGridChange(idx, 'itemDescription', e.target.value);
                                setActiveItemSearchIdx(idx);
                              }}
                              onFocus={() => setActiveItemSearchIdx(idx)}
                              required
                              placeholder="Type to search or import from BOQ..."
                              className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />

                            {item.isBoqLinked && (
                              <div className="mt-1 flex items-center space-x-1">
                                <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-mono font-bold border border-indigo-200 dark:border-indigo-800">
                                  <Layers className="w-3 h-3 text-indigo-500" />
                                  BOQ Linked: {item.boqRef}
                                </span>
                              </div>
                            )}

                            {/* Autocomplete Dropdown */}
                            {activeItemSearchIdx === idx && (
                              <div className="absolute left-2 right-2 top-11 z-30 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-xl py-1">
                                {inventoryItems
                                  .filter(inv => !item.itemDescription || inv.name.toLowerCase().includes(item.itemDescription.toLowerCase()) || inv.itemCode.toLowerCase().includes(item.itemDescription.toLowerCase()))
                                  .slice(0, 6)
                                  .map(inv => (
                                    <div
                                      key={inv.id}
                                      onClick={() => handleSelectItemSuggestion(idx, inv)}
                                      className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-950/60 cursor-pointer flex justify-between items-center"
                                    >
                                      <div>
                                        <div className="font-bold text-slate-900 dark:text-white">{inv.name}</div>
                                        <div className="text-[10px] text-slate-400">{inv.itemCode} &bull; {inv.unit}</div>
                                      </div>
                                      <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                                        Stock: {inv.quantityInStock}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </td>

                          <td className="p-2">
                            <input
                              type="text"
                              value={item.sizeSpecification || ''}
                              onChange={e => handleGridChange(idx, 'sizeSpecification', e.target.value)}
                              placeholder="e.g. PN16 500mm"
                              className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </td>

                          <td className="p-2">
                            <input
                              type="text"
                              value={item.manufacturer || ''}
                              onChange={e => handleGridChange(idx, 'manufacturer', e.target.value)}
                              placeholder="Manufacturer"
                              className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </td>

                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity || ''}
                              onChange={e => handleGridChange(idx, 'quantity', Number(e.target.value))}
                              required
                              className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                            />
                          </td>

                          <td className="p-2">
                            <input
                              type="text"
                              value={item.unit || 'Nos'}
                              onChange={e => handleGridChange(idx, 'unit', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </td>

                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveGridRow(idx)}
                              disabled={gridItems.length <= 1}
                              className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Approval Hierarchy Visualizer */}
              <div className="bg-blue-50/60 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-200 dark:border-blue-900 space-y-2">
                <h5 className="font-bold text-blue-900 dark:text-blue-300 text-xs flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Configurable Routing Workflow Hierarchy</span>
                </h5>

                <div className="flex items-center space-x-2 text-[11px] font-semibold overflow-x-auto py-1">
                  <span className="px-2.5 py-1 rounded bg-blue-600 text-white">1. Requester ({currentUserName})</span>
                  <ChevronRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-200">2. Site Incharge</span>
                  <ChevronRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">3. Project Manager</span>
                  <ChevronRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">4. Project Store Receipt</span>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionProcessing}
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Material Request</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* DETAIL & WORKFLOW ACTION MODAL */}
      {isDetailModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full p-6 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl my-8">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white font-mono">
                    {selectedRequest.requestNo}
                  </h3>
                  {getStatusBadge(selectedRequest.status)}
                  {getPriorityBadge(selectedRequest.priority)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Requested on {selectedRequest.requestDate} by <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedRequest.requestedByUserName}</span> ({selectedRequest.designation})
                </p>
              </div>

              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Project Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedRequest.projectName}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Site & Unloading Point</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedRequest.siteName} - {selectedRequest.unloadingPoint}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Required Date</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedRequest.requiredDate}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Department & Branch</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedRequest.department} ({selectedRequest.branch})</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Contact Number</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedRequest.contactNumber}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Current Approver</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{selectedRequest.currentApproverName || selectedRequest.currentApproverRole}</span>
              </div>
            </div>

            {/* Item Table */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Requested Material Items</h4>
              
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                    <tr>
                      <th className="p-2.5">Sl</th>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5">Size / Specification</th>
                      <th className="p-2.5">Manufacturer</th>
                      <th className="p-2.5 text-right">Requested Qty</th>
                      <th className="p-2.5 text-right">Received Qty</th>
                      <th className="p-2.5">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {selectedRequest.items.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="p-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-2.5 font-bold">{item.itemDescription}</td>
                        <td className="p-2.5 text-slate-500">{item.sizeSpecification || '-'}</td>
                        <td className="p-2.5 text-slate-500">{item.manufacturer || '-'}</td>
                        <td className="p-2.5 text-right font-black">{item.quantity}</td>
                        <td className="p-2.5 text-right font-black text-emerald-600 dark:text-emerald-400">{item.receivedQuantity || 0}</td>
                        <td className="p-2.5">{item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Approval History & Audit Trail */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Approval Workflow Audit Trail</span>
              </h4>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {selectedRequest.approvalHistory.map((step, idx) => (
                  <div key={step.id || idx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-start text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                        <span>{step.actorName} ({step.actorRole})</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          {step.action}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">{step.remarks}</p>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(step.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow Action Panel */}
            <div className="bg-slate-100 dark:bg-slate-800/80 p-4 rounded-2xl space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs">Perform Workflow Action</h4>
              
              <textarea
                value={actionRemarks}
                onChange={e => setActionRemarks(e.target.value)}
                placeholder="Enter approval remarks, rejection reasons, or clarification notes..."
                rows={2}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleWorkflowAction('APPROVE')}
                    disabled={actionProcessing}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Request</span>
                  </button>

                  <button
                    onClick={() => handleWorkflowAction('CLARIFICATION_REQUESTED')}
                    disabled={actionProcessing}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Request Clarification</span>
                  </button>

                  <button
                    onClick={() => handleWorkflowAction('SEND_BACK')}
                    disabled={actionProcessing}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Send Back</span>
                  </button>

                  <button
                    onClick={() => handleWorkflowAction('REJECT')}
                    disabled={actionProcessing}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>

                {(selectedRequest.status === 'Approved' || selectedRequest.status === 'Partially Received') && (
                  <button
                    onClick={() => { setIsDetailModalOpen(false); openReceiptModal(selectedRequest); }}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Record Material Receipt</span>
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* RECORD MATERIAL RECEIPT MODAL */}
      {isReceiptModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl my-8">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-emerald-600" />
                  <span>Record Site Material Receipt</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update project store stock for Material Request #{selectedRequest.requestNo}
                </p>
              </div>

              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReceiptSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Receipt Date *</label>
                  <input
                    type="date"
                    value={receiptDate}
                    onChange={e => setReceiptDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Vehicle / Truck Number *</label>
                  <input
                    type="text"
                    value={receiptVehicle}
                    onChange={e => setReceiptVehicle(e.target.value)}
                    required
                    placeholder="e.g. KL-11-AX-4521"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Delivery Note / Challan # *</label>
                  <input
                    type="text"
                    value={receiptNoteNumber}
                    onChange={e => setReceiptNoteNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Store / Yard Location *</label>
                  <input
                    type="text"
                    value={receiptStoreName}
                    onChange={e => setReceiptStoreName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Items Receipt Qty Inputs */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-900 dark:text-white">Items Delivery Verification</label>
                
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                      <tr>
                        <th className="p-2">Item Description</th>
                        <th className="p-2 text-right">Requested</th>
                        <th className="p-2 text-right">Prev Recd</th>
                        <th className="p-2 text-right w-28">Current Recd Qty *</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {selectedRequest.items.map(item => {
                        const remaining = Math.max(0, item.quantity - item.receivedQuantity);
                        return (
                          <tr key={item.id}>
                            <td className="p-2 font-bold">{item.itemDescription}</td>
                            <td className="p-2 text-right">{item.quantity} {item.unit}</td>
                            <td className="p-2 text-right text-emerald-600">{item.receivedQuantity} {item.unit}</td>
                            <td className="p-2 text-right">
                              <input
                                type="number"
                                min="0"
                                max={remaining}
                                value={receiptItemQuantities[item.id] ?? remaining}
                                onChange={e => setReceiptItemQuantities({
                                  ...receiptItemQuantities,
                                  [item.id]: Number(e.target.value)
                                })}
                                className="w-full px-2 py-1 text-right rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Receipt Remarks</label>
                <input
                  type="text"
                  value={receiptRemarks}
                  onChange={e => setReceiptRemarks(e.target.value)}
                  placeholder="e.g. Inspected and added to site inventory"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionProcessing}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md flex items-center space-x-2"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Confirm Site Receipt</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Low-Stock Review and Batch Reorder Modal */}
      {isLowStockDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-200" />
                <div>
                  <h3 className="font-bold text-base">Low-Stock Replenishment Triggers</h3>
                  <p className="text-xs text-amber-100 mt-0.5">
                    {lowStockItems.length} materials currently at or below reorder threshold
                  </p>
                </div>
              </div>
              <button onClick={() => setIsLowStockDrawerOpen(false)} className="text-amber-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl text-amber-800 dark:text-amber-300">
                <strong>Governance & Control Rule:</strong> Generating a draft requisition does NOT place direct vendor orders or post to the general ledger. It initiates the standard SiteSync Pro procurement workflow for supervisor submission and project manager authorization.
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Material & Code</th>
                      <th className="p-3">Category / Spec</th>
                      <th className="p-3 text-right">Current Stock</th>
                      <th className="p-3 text-right">Reorder Level</th>
                      <th className="p-3 text-right text-blue-600 dark:text-blue-400">Suggested Order</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {lowStockItems.map((item, idx) => {
                      const current = Number(item.currentStock ?? item.quantity ?? 0);
                      const reorder = Number(item.reorderLevel ?? item.minStock ?? item.minQuantity ?? 15);
                      const max = Number(item.maxStock ?? reorder * 3);
                      const suggested = Math.max(max - current, reorder * 2 - current, 10);

                      return (
                        <tr key={item.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                          <td className="p-3 font-semibold">
                            <span className="text-slate-900 dark:text-white block">{item.name || item.itemDescription}</span>
                            <span className="text-[10px] font-mono text-slate-400 block">{item.itemCode}</span>
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400 text-[11px]">
                            <span className="block font-medium">{item.category || 'General'}</span>
                            <span className="block text-[10px] text-slate-400">{item.specification || item.sizeSpecification || '-'}</span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                            {current} {item.unit || 'Nos'}
                          </td>
                          <td className="p-3 text-right font-mono text-slate-500">
                            {reorder} {item.unit || 'Nos'}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/20">
                            {suggested} {item.unit || 'Nos'}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleGenerateDraftPrFromLowStock([item])}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] rounded-lg shadow-sm transition flex items-center space-x-1 ml-auto"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Draft PR</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 text-[11px]">
                  All generated draft requisitions will be queued into the grid for final adjustments.
                </span>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsLowStockDrawerOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenerateDraftPrFromLowStock()}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Create Draft PR for All ({lowStockItems.length}) Items</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOQ Item Selection & Intelligent Import Modal */}
      {isBoqPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="bg-gradient-to-r from-indigo-700 to-indigo-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Layers className="w-5 h-5 text-indigo-200" />
                <div>
                  <h3 className="font-bold text-base">Project Bill of Quantities (BOQ) — Material Reference</h3>
                  <p className="text-xs text-indigo-100 mt-0.5">
                    Select approved BOQ items to 1-click import standardized specifications into your Material Request
                  </p>
                </div>
              </div>
              <button onClick={() => setIsBoqPickerOpen(false)} className="text-indigo-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Informational Guidance Notice */}
              <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-indigo-950 dark:text-indigo-200 flex items-start space-x-3">
                <HelpCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Intelligent Suggestion Mechanism</span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">
                    BOQ line items provide pre-approved material descriptions, unit measurements, and balance budgets. BOQ selection is NOT mandatory; you can freely request custom, non-BOQ, or urgent ad-hoc materials at any time.
                  </span>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={boqSearchTerm}
                    onChange={e => setBoqSearchTerm(e.target.value)}
                    placeholder="Search by BOQ item code, description, category..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <select
                  value={boqCategoryFilter}
                  onChange={e => setBoqCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Civil & Foundation">Civil & Foundation</option>
                  <option value="Piping & Hydraulics">Piping & Hydraulics</option>
                  <option value="Mechanical & Valves">Mechanical & Valves</option>
                  <option value="Structural Steel">Structural Steel</option>
                  <option value="Electrical & Instrumentation">Electrical & Instrumentation</option>
                </select>
              </div>

              {/* BOQ Items Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800 sticky top-0">
                    <tr>
                      <th className="p-3">BOQ Code</th>
                      <th className="p-3">Description & Category</th>
                      <th className="p-3 text-right">Sanctioned Qty</th>
                      <th className="p-3 text-right">Balance Available</th>
                      <th className="p-3 text-right">Rate</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {boqItems
                      .filter(b => {
                        const matchesSearch = !boqSearchTerm || 
                          b.itemCode?.toLowerCase().includes(boqSearchTerm.toLowerCase()) ||
                          b.description?.toLowerCase().includes(boqSearchTerm.toLowerCase()) ||
                          b.category?.toLowerCase().includes(boqSearchTerm.toLowerCase());
                        const matchesCat = boqCategoryFilter === 'ALL' || b.category === boqCategoryFilter;
                        return matchesSearch && matchesCat;
                      })
                      .map((boq, idx) => (
                        <tr key={boq.id || idx} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20">
                          <td className="p-3 font-mono font-bold text-indigo-700 dark:text-indigo-400">
                            {boq.itemCode}
                          </td>
                          <td className="p-3">
                            <span className="text-slate-900 dark:text-white font-medium block">{boq.description}</span>
                            <span className="text-[10px] text-slate-500 block">{boq.category}</span>
                          </td>
                          <td className="p-3 text-right font-mono text-slate-600 dark:text-slate-400">
                            {boq.quantity} {boq.unit}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {boq.balanceQuantity ?? boq.quantity} {boq.unit}
                          </td>
                          <td className="p-3 text-right font-mono text-slate-500">
                            ${boq.rateUSD || boq.rate || 0}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                handleImportBoqItem(boq);
                                setIsBoqPickerOpen(false);
                              }}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center space-x-1 mx-auto"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add to MR</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    {boqItems.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400">
                          No BOQ items configured for this project. You can still add custom material lines freely.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 text-[11px]">
                  Imported items can be edited or adjusted in the requisition form before submission.
                </span>
                <button
                  type="button"
                  onClick={() => setIsBoqPickerOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
