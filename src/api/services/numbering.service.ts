import {
  numberingRepository,
  DocumentEntityType,
  AllocateNumberParams,
  AllocationResult,
  DocumentNumberingPolicy,
} from '../repositories/numbering.repository';

export class NumberingService {
  private static instance: NumberingService;

  public static getInstance(): NumberingService {
    if (!NumberingService.instance) {
      NumberingService.instance = new NumberingService();
    }
    return NumberingService.instance;
  }

  /**
   * Universal allocator for any document entity type.
   */
  async getNextNumber(
    params: AllocateNumberParams,
    clientOrTx?: any
  ): Promise<AllocationResult> {
    return await numberingRepository.allocateNextNumber(params, clientOrTx);
  }

  /**
   * Preview next number without advancing sequence.
   */
  async peekNextNumber(params: AllocateNumberParams): Promise<string> {
    return await numberingRepository.peekNextNumber(params);
  }

  // =========================================================================
  // P0 ENTITY ALLOCATORS
  // =========================================================================

  /**
   * Allocate Purchase Order number (PO)
   */
  async generatePurchaseOrderNumber(
    options: {
      companyId?: string | null;
      branchId?: string | null;
      projectId?: string | null;
      date?: Date | string;
      manualNumber?: string;
      allocatedBy?: string;
    } = {},
    clientOrTx?: any
  ): Promise<string> {
    const result = await this.getNextNumber(
      {
        entityType: 'PURCHASE_ORDER',
        companyId: options.companyId,
        branchId: options.branchId,
        projectId: options.projectId,
        date: options.date,
        manualNumber: options.manualNumber,
        allocatedBy: options.allocatedBy,
      },
      clientOrTx
    );
    return result.documentNumber;
  }

  /**
   * Allocate Goods Receipt Note number (GRN)
   */
  async generateGoodsReceiptNumber(
    options: {
      companyId?: string | null;
      branchId?: string | null;
      projectId?: string | null;
      date?: Date | string;
      manualNumber?: string;
      allocatedBy?: string;
    } = {},
    clientOrTx?: any
  ): Promise<string> {
    const result = await this.getNextNumber(
      {
        entityType: 'GOODS_RECEIPT',
        companyId: options.companyId,
        branchId: options.branchId,
        projectId: options.projectId,
        date: options.date,
        manualNumber: options.manualNumber,
        allocatedBy: options.allocatedBy,
      },
      clientOrTx
    );
    return result.documentNumber;
  }

  /**
   * Allocate Material Issue Voucher number (MIV)
   */
  async generateMaterialIssueNumber(
    options: {
      companyId?: string | null;
      branchId?: string | null;
      projectId?: string | null;
      date?: Date | string;
      manualNumber?: string;
      allocatedBy?: string;
    } = {},
    clientOrTx?: any
  ): Promise<string> {
    const result = await this.getNextNumber(
      {
        entityType: 'MATERIAL_ISSUE',
        companyId: options.companyId,
        branchId: options.branchId,
        projectId: options.projectId,
        date: options.date,
        manualNumber: options.manualNumber,
        allocatedBy: options.allocatedBy,
      },
      clientOrTx
    );
    return result.documentNumber;
  }

  /**
   * Allocate Material Return Note number (RET / MRN)
   */
  async generateMaterialReturnNumber(
    options: {
      companyId?: string | null;
      branchId?: string | null;
      projectId?: string | null;
      date?: Date | string;
      manualNumber?: string;
      allocatedBy?: string;
    } = {},
    clientOrTx?: any
  ): Promise<string> {
    const result = await this.getNextNumber(
      {
        entityType: 'MATERIAL_RETURN',
        companyId: options.companyId,
        branchId: options.branchId,
        projectId: options.projectId,
        date: options.date,
        manualNumber: options.manualNumber,
        allocatedBy: options.allocatedBy,
      },
      clientOrTx
    );
    return result.documentNumber;
  }

  /**
   * Allocate Material Transfer Note number (TRF / MTN)
   */
  async generateMaterialTransferNumber(
    options: {
      companyId?: string | null;
      branchId?: string | null;
      projectId?: string | null;
      date?: Date | string;
      manualNumber?: string;
      allocatedBy?: string;
    } = {},
    clientOrTx?: any
  ): Promise<string> {
    const result = await this.getNextNumber(
      {
        entityType: 'MATERIAL_TRANSFER',
        companyId: options.companyId,
        branchId: options.branchId,
        projectId: options.projectId,
        date: options.date,
        manualNumber: options.manualNumber,
        allocatedBy: options.allocatedBy,
      },
      clientOrTx
    );
    return result.documentNumber;
  }

  // =========================================================================
  // P1 ENTITY ALLOCATORS
  // =========================================================================

  /**
   * Allocate Material Request number (MR)
   */
  async generateMaterialRequestNumber(
    options: {
      companyId?: string | null;
      branchId?: string | null;
      projectId?: string | null;
      date?: Date | string;
      manualNumber?: string;
      allocatedBy?: string;
    } = {},
    clientOrTx?: any
  ): Promise<string> {
    const result = await this.getNextNumber(
      {
        entityType: 'MATERIAL_REQUEST',
        companyId: options.companyId,
        branchId: options.branchId,
        projectId: options.projectId,
        date: options.date,
        manualNumber: options.manualNumber,
        allocatedBy: options.allocatedBy,
      },
      clientOrTx
    );
    return result.documentNumber;
  }

  /**
   * Allocate Purchase Requisition number (PR)
   */
  async generatePurchaseRequisitionNumber(
    options: {
      companyId?: string | null;
      branchId?: string | null;
      projectId?: string | null;
      date?: Date | string;
      manualNumber?: string;
      allocatedBy?: string;
    } = {},
    clientOrTx?: any
  ): Promise<string> {
    const result = await this.getNextNumber(
      {
        entityType: 'PURCHASE_REQUISITION',
        companyId: options.companyId,
        branchId: options.branchId,
        projectId: options.projectId,
        date: options.date,
        manualNumber: options.manualNumber,
        allocatedBy: options.allocatedBy,
      },
      clientOrTx
    );
    return result.documentNumber;
  }

  /**
   * Allocate Request For Quotation number (RFQ)
   */
  async generateRfqNumber(
    options: {
      companyId?: string | null;
      branchId?: string | null;
      projectId?: string | null;
      date?: Date | string;
      manualNumber?: string;
      allocatedBy?: string;
    } = {},
    clientOrTx?: any
  ): Promise<string> {
    const result = await this.getNextNumber(
      {
        entityType: 'RFQ',
        companyId: options.companyId,
        branchId: options.branchId,
        projectId: options.projectId,
        date: options.date,
        manualNumber: options.manualNumber,
        allocatedBy: options.allocatedBy,
      },
      clientOrTx
    );
    return result.documentNumber;
  }

  /**
   * Allocate Vendor Quotation number (QOT)
   */
  async generateQuotationNumber(
    options: {
      companyId?: string | null;
      branchId?: string | null;
      projectId?: string | null;
      date?: Date | string;
      manualNumber?: string;
      allocatedBy?: string;
    } = {},
    clientOrTx?: any
  ): Promise<string> {
    const result = await this.getNextNumber(
      {
        entityType: 'QUOTATION',
        companyId: options.companyId,
        branchId: options.branchId,
        projectId: options.projectId,
        date: options.date,
        manualNumber: options.manualNumber,
        allocatedBy: options.allocatedBy,
      },
      clientOrTx
    );
    return result.documentNumber;
  }

  /**
   * Allocate Project Cash Request number (CR)
   */
  async generateCashRequestNumber(
    options: {
      companyId?: string | null;
      branchId?: string | null;
      projectId?: string | null;
      date?: Date | string;
      manualNumber?: string;
      allocatedBy?: string;
    } = {},
    clientOrTx?: any
  ): Promise<string> {
    const result = await this.getNextNumber(
      {
        entityType: 'CASH_REQUEST',
        companyId: options.companyId,
        branchId: options.branchId,
        projectId: options.projectId,
        date: options.date,
        manualNumber: options.manualNumber,
        allocatedBy: options.allocatedBy,
      },
      clientOrTx
    );
    return result.documentNumber;
  }

  /**
   * Allocate Cash Settlement number (STL)
   */
  async generateCashSettlementNumber(
    options: {
      companyId?: string | null;
      branchId?: string | null;
      projectId?: string | null;
      date?: Date | string;
      manualNumber?: string;
      allocatedBy?: string;
    } = {},
    clientOrTx?: any
  ): Promise<string> {
    const result = await this.getNextNumber(
      {
        entityType: 'CASH_SETTLEMENT',
        companyId: options.companyId,
        branchId: options.branchId,
        projectId: options.projectId,
        date: options.date,
        manualNumber: options.manualNumber,
        allocatedBy: options.allocatedBy,
      },
      clientOrTx
    );
    return result.documentNumber;
  }

  /**
   * Allocate Running Account Bill number (RA)
   */
  async generateRaBillNumber(
    options: {
      companyId?: string | null;
      branchId?: string | null;
      projectId?: string | null;
      date?: Date | string;
      manualNumber?: string;
      allocatedBy?: string;
    } = {},
    clientOrTx?: any
  ): Promise<string> {
    const result = await this.getNextNumber(
      {
        entityType: 'RA_BILL',
        companyId: options.companyId,
        branchId: options.branchId,
        projectId: options.projectId,
        date: options.date,
        manualNumber: options.manualNumber,
        allocatedBy: options.allocatedBy,
      },
      clientOrTx
    );
    return result.documentNumber;
  }

  /**
   * Allocate Payment number (PAY)
   */
  async generatePaymentNumber(
    options: {
      companyId?: string | null;
      branchId?: string | null;
      projectId?: string | null;
      date?: Date | string;
      manualNumber?: string;
      allocatedBy?: string;
    } = {},
    clientOrTx?: any
  ): Promise<string> {
    const result = await this.getNextNumber(
      {
        entityType: 'PAYMENT',
        companyId: options.companyId,
        branchId: options.branchId,
        projectId: options.projectId,
        date: options.date,
        manualNumber: options.manualNumber,
        allocatedBy: options.allocatedBy,
      },
      clientOrTx
    );
    return result.documentNumber;
  }

  /**
   * Allocate Material Inspection / MIR number (MIR)
   */
  async generateMaterialInspectionNumber(
    options: {
      companyId?: string | null;
      branchId?: string | null;
      projectId?: string | null;
      date?: Date | string;
      manualNumber?: string;
      allocatedBy?: string;
    } = {},
    clientOrTx?: any
  ): Promise<string> {
    const result = await this.getNextNumber(
      {
        entityType: 'QUALITY_NCR',
        companyId: options.companyId,
        branchId: options.branchId,
        projectId: options.projectId,
        date: options.date,
        manualNumber: options.manualNumber,
        allocatedBy: options.allocatedBy,
      },
      clientOrTx
    );
    return result.documentNumber.replace('NCR-', 'MIR-');
  }

  // =========================================================================
  // POLICY CONFIGURATION API
  // =========================================================================

  async configurePolicy(policy: Partial<DocumentNumberingPolicy> & { entityType: string }): Promise<DocumentNumberingPolicy> {
    return await numberingRepository.upsertPolicy(policy);
  }

  async getPolicy(entityType: string, companyId?: string | null): Promise<DocumentNumberingPolicy> {
    return await numberingRepository.getPolicy(entityType, companyId);
  }
}

export const numberingService = NumberingService.getInstance();
