// ============================================================================
// PHASE 76: MASTER DATA MANAGEMENT - AUTHORITATIVE MASTER REGISTRY
// ============================================================================

import {
  MasterDomainCode,
  MasterDomainSummary,
  MasterRecordItem,
  MasterRecordVersion,
  DataQualityEvaluationResult,
  MDMStatsSummary,
  QualityDimension,
} from './master_data.types';
import { dataQualityEngine } from './master_data.quality';
import { duplicateDetectionEngine } from './master_data.duplicates';

export class MasterDataRegistry {
  private static instance: MasterDataRegistry;

  private domains: Map<MasterDomainCode, MasterDomainSummary> = new Map();
  private records: Map<string, MasterRecordItem> = new Map();
  private recordVersions: Map<string, MasterRecordVersion[]> = new Map();
  private isInitialized = false;

  private constructor() {
    this.initializeRegistry();
  }

  public static getInstance(): MasterDataRegistry {
    if (!MasterDataRegistry.instance) {
      MasterDataRegistry.instance = new MasterDataRegistry();
    }
    return MasterDataRegistry.instance;
  }

  private initializeRegistry() {
    if (this.isInitialized) return;
    this.seedMasterDomains();
    this.seedMasterRecords();
    this.isInitialized = true;
  }

  private seedMasterDomains() {
    const domainList: MasterDomainSummary[] = [
      {
        id: 'dom-org',
        domainCode: 'ORGANIZATION',
        domainName: 'Legal Entities & Subsidiaries',
        sourceModule: 'CORE_ERP',
        entityType: 'OrganizationUnit',
        description: 'Corporate group hierarchy, legal entities, tax registration entities, and operational branches.',
        dataOwnerRole: 'MANAGING_DIRECTOR',
        qualityTargetScore: 98.0,
        currentAverageQuality: 99.2,
        totalRecordsCount: 4,
        activeRecordsCount: 4,
        duplicateCandidatesCount: 0,
        openIssuesCount: 0,
        retentionYears: 20,
        isArchivalEnabled: false,
        lastReconciledAt: new Date().toISOString(),
      },
      {
        id: 'dom-prj',
        domainCode: 'PROJECTS',
        domainName: 'Capital Projects & Sites',
        sourceModule: 'PROJECTS',
        entityType: 'ProjectMaster',
        description: 'Multi-year EPC, infrastructure, water utility, and commercial mechanical construction contracts.',
        dataOwnerRole: 'PROJECT_MANAGER',
        qualityTargetScore: 95.0,
        currentAverageQuality: 96.4,
        totalRecordsCount: 14,
        activeRecordsCount: 12,
        duplicateCandidatesCount: 1,
        openIssuesCount: 2,
        retentionYears: 15,
        isArchivalEnabled: true,
        lastReconciledAt: new Date().toISOString(),
      },
      {
        id: 'dom-sites',
        domainCode: 'SITES',
        domainName: 'Physical Job Sites & Geographic Zones',
        sourceModule: 'MOBILE_GIS',
        entityType: 'SiteLocation',
        description: 'Geofenced construction yards, pump station sites, treatment plants, and camp facilities.',
        dataOwnerRole: 'SITE_ENGINEER',
        qualityTargetScore: 90.0,
        currentAverageQuality: 92.8,
        totalRecordsCount: 18,
        activeRecordsCount: 18,
        duplicateCandidatesCount: 0,
        openIssuesCount: 1,
        retentionYears: 10,
        isArchivalEnabled: true,
        lastReconciledAt: new Date().toISOString(),
      },
      {
        id: 'dom-cust',
        domainCode: 'CUSTOMERS',
        domainName: 'Clients & Government Authorities',
        sourceModule: 'CRM',
        entityType: 'CustomerEntity',
        description: 'Public utility authorities, private developers, general contractors, and concession owners.',
        dataOwnerRole: 'COMMERCIAL_DIRECTOR',
        qualityTargetScore: 95.0,
        currentAverageQuality: 94.1,
        totalRecordsCount: 22,
        activeRecordsCount: 20,
        duplicateCandidatesCount: 1,
        openIssuesCount: 1,
        retentionYears: 10,
        isArchivalEnabled: true,
        lastReconciledAt: new Date().toISOString(),
      },
      {
        id: 'dom-vnd',
        domainCode: 'VENDORS',
        domainName: 'Vendors, Suppliers & Subcontractors',
        sourceModule: 'PROCUREMENT',
        entityType: 'VendorMaster',
        description: 'Prequalified suppliers, MEP subcontractors, logistics providers, and material fabricators.',
        dataOwnerRole: 'PROCUREMENT_OFFICER',
        qualityTargetScore: 92.0,
        currentAverageQuality: 91.5,
        totalRecordsCount: 48,
        activeRecordsCount: 44,
        duplicateCandidatesCount: 3,
        openIssuesCount: 4,
        retentionYears: 7,
        isArchivalEnabled: true,
        lastReconciledAt: new Date().toISOString(),
      },
      {
        id: 'dom-emp',
        domainCode: 'EMPLOYEES',
        domainName: 'Workforce, Engineers & Trades',
        sourceModule: 'HRMS',
        entityType: 'EmployeeProfile',
        description: 'Direct labor, specialized MEP technicians, project engineers, site supervisors, and executives.',
        dataOwnerRole: 'HR_MANAGER',
        qualityTargetScore: 96.0,
        currentAverageQuality: 97.8,
        totalRecordsCount: 312,
        activeRecordsCount: 295,
        duplicateCandidatesCount: 2,
        openIssuesCount: 2,
        retentionYears: 10,
        isArchivalEnabled: true,
        lastReconciledAt: new Date().toISOString(),
      },
      {
        id: 'dom-mat',
        domainCode: 'MATERIALS',
        domainName: 'Standardized Material Catalog (SKU)',
        sourceModule: 'INVENTORY',
        entityType: 'MaterialSKU',
        description: 'Pipes, valves, ductile iron fittings, HVAC equipment, pumps, electrical cables, and consumable hardware.',
        dataOwnerRole: 'INVENTORY_MANAGER',
        qualityTargetScore: 90.0,
        currentAverageQuality: 88.6,
        totalRecordsCount: 840,
        activeRecordsCount: 810,
        duplicateCandidatesCount: 8,
        openIssuesCount: 9,
        retentionYears: 7,
        isArchivalEnabled: true,
        lastReconciledAt: new Date().toISOString(),
      },
      {
        id: 'dom-ast',
        domainCode: 'ASSETS',
        domainName: 'Plant & Infrastructure Capital Assets',
        sourceModule: 'EAM',
        entityType: 'FixedAsset',
        description: 'Generators, HVAC central chillers, water booster stations, batching plants, and workshop machinery.',
        dataOwnerRole: 'MAINTENANCE_SUPERVISOR',
        qualityTargetScore: 94.0,
        currentAverageQuality: 93.2,
        totalRecordsCount: 145,
        activeRecordsCount: 138,
        duplicateCandidatesCount: 2,
        openIssuesCount: 3,
        retentionYears: 12,
        isArchivalEnabled: true,
        lastReconciledAt: new Date().toISOString(),
      },
      {
        id: 'dom-flt',
        domainCode: 'FLEET_VEHICLES',
        domainName: 'Fleet, Cranes & Heavy Machinery',
        sourceModule: 'FLEET',
        entityType: 'FleetVehicle',
        description: 'Hydraulic excavators, boom trucks, mobile cranes, diesel tankers, and transport pickups.',
        dataOwnerRole: 'FLEET_MANAGER',
        qualityTargetScore: 95.0,
        currentAverageQuality: 95.0,
        totalRecordsCount: 62,
        activeRecordsCount: 58,
        duplicateCandidatesCount: 1,
        openIssuesCount: 1,
        retentionYears: 10,
        isArchivalEnabled: true,
        lastReconciledAt: new Date().toISOString(),
      },
      {
        id: 'dom-eqp',
        domainCode: 'EQUIPMENT',
        domainName: 'Calibrated Tools & Testing Equipment',
        sourceModule: 'QAQC',
        entityType: 'EquipmentMaster',
        description: 'Hydrostatic pressure gauges, laser levels, thermal imagers, flow meters, and torque testers.',
        dataOwnerRole: 'QAQC_MANAGER',
        qualityTargetScore: 95.0,
        currentAverageQuality: 96.1,
        totalRecordsCount: 84,
        activeRecordsCount: 80,
        duplicateCandidatesCount: 0,
        openIssuesCount: 2,
        retentionYears: 7,
        isArchivalEnabled: true,
        lastReconciledAt: new Date().toISOString(),
      },
      {
        id: 'dom-wh',
        domainCode: 'WAREHOUSES',
        domainName: 'Central Yards & Storage Depots',
        sourceModule: 'INVENTORY',
        entityType: 'WarehouseDepot',
        description: 'Central distribution hub, regional transit yards, and on-site containerized storerooms.',
        dataOwnerRole: 'INVENTORY_MANAGER',
        qualityTargetScore: 92.0,
        currentAverageQuality: 94.5,
        totalRecordsCount: 9,
        activeRecordsCount: 9,
        duplicateCandidatesCount: 0,
        openIssuesCount: 0,
        retentionYears: 10,
        isArchivalEnabled: true,
        lastReconciledAt: new Date().toISOString(),
      },
      {
        id: 'dom-cc',
        domainCode: 'COST_CENTERS',
        domainName: 'General Ledger Cost Centers',
        sourceModule: 'FINANCE',
        entityType: 'CostCenter',
        description: 'WBS cost breakdown structure, divisional cost pools, and plant overhead centers.',
        dataOwnerRole: 'FINANCE_MANAGER',
        qualityTargetScore: 98.0,
        currentAverageQuality: 99.0,
        totalRecordsCount: 38,
        activeRecordsCount: 36,
        duplicateCandidatesCount: 0,
        openIssuesCount: 0,
        retentionYears: 15,
        isArchivalEnabled: true,
        lastReconciledAt: new Date().toISOString(),
      },
      {
        id: 'dom-coa',
        domainCode: 'CHART_OF_ACCOUNTS',
        domainName: 'Chart of Accounts (GL Hierarchy)',
        sourceModule: 'FINANCE',
        entityType: 'AccountMaster',
        description: 'IFRS-compliant master ledger accounts, assets, liabilities, revenue, and direct job cost codes.',
        dataOwnerRole: 'FINANCE_MANAGER',
        qualityTargetScore: 99.0,
        currentAverageQuality: 100.0,
        totalRecordsCount: 142,
        activeRecordsCount: 142,
        duplicateCandidatesCount: 0,
        openIssuesCount: 0,
        retentionYears: 20,
        isArchivalEnabled: false,
        lastReconciledAt: new Date().toISOString(),
      },
      {
        id: 'dom-cnt',
        domainCode: 'CONTRACTS',
        domainName: 'Master Contracts & Prime Agreements',
        sourceModule: 'CONTRACTS',
        entityType: 'ContractMaster',
        description: 'FIDIC prime contracts, client joint venture agreements, and master subcontractor frameworks.',
        dataOwnerRole: 'COMMERCIAL_DIRECTOR',
        qualityTargetScore: 95.0,
        currentAverageQuality: 95.8,
        totalRecordsCount: 26,
        activeRecordsCount: 22,
        duplicateCandidatesCount: 1,
        openIssuesCount: 1,
        retentionYears: 15,
        isArchivalEnabled: true,
        lastReconciledAt: new Date().toISOString(),
      },
      {
        id: 'dom-doc',
        domainCode: 'DOCUMENTS',
        domainName: 'Engineering EDMS Master Registry',
        sourceModule: 'EDMS',
        entityType: 'DocumentMaster',
        description: 'Approved shop drawings, calculation reports, inspection test plans (ITP), and statutory permits.',
        dataOwnerRole: 'DOCUMENT_CONTROLLER',
        qualityTargetScore: 92.0,
        currentAverageQuality: 93.4,
        totalRecordsCount: 1850,
        activeRecordsCount: 1810,
        duplicateCandidatesCount: 6,
        openIssuesCount: 12,
        retentionYears: 15,
        isArchivalEnabled: true,
        lastReconciledAt: new Date().toISOString(),
      },
      {
        id: 'dom-water',
        domainCode: 'WATER_INFRASTRUCTURE',
        domainName: 'Water Utility Assets & Pipelines',
        sourceModule: 'WATER_INFRASTRUCTURE',
        entityType: 'WaterAssetMaster',
        description: 'Water treatment works, gravity mains, PRV chambers, booster pump arrays, and reservoir tanks.',
        dataOwnerRole: 'UTILITY_ENGINEER',
        qualityTargetScore: 96.0,
        currentAverageQuality: 96.5,
        totalRecordsCount: 92,
        activeRecordsCount: 88,
        duplicateCandidatesCount: 1,
        openIssuesCount: 2,
        retentionYears: 25,
        isArchivalEnabled: false,
        lastReconciledAt: new Date().toISOString(),
      },
      {
        id: 'dom-usr',
        domainCode: 'USERS_ROLES',
        domainName: 'Enterprise Security & RBAC Roles',
        sourceModule: 'ADMIN',
        entityType: 'UserRoleAssignment',
        description: 'ERP platform users, fine-grained access control policies, delegated signers, and approval matrices.',
        dataOwnerRole: 'ADMIN',
        qualityTargetScore: 99.0,
        currentAverageQuality: 99.5,
        totalRecordsCount: 45,
        activeRecordsCount: 42,
        duplicateCandidatesCount: 0,
        openIssuesCount: 0,
        retentionYears: 10,
        isArchivalEnabled: true,
        lastReconciledAt: new Date().toISOString(),
      },
    ];

    domainList.forEach((d) => this.domains.set(d.domainCode, d));
  }

  private seedMasterRecords() {
    const initialRecords: MasterRecordItem[] = [
      // 1. Organization
      {
        id: 'rec-org-001',
        canonicalId: 'MDM-ORG-001',
        domainCode: 'ORGANIZATION',
        entityType: 'OrganizationUnit',
        sourceModule: 'CORE_ERP',
        sourceEntityId: 'ORG-APEX-GLOBAL',
        primaryName: 'Apex Global Engineering Group HQ',
        code: 'APEX-HQ',
        status: 'ACTIVE',
        approvalStatus: 'APPROVED',
        qualityScore: 100.0,
        qualityClassification: 'EXCELLENT',
        version: 1,
        effectiveDate: '2020-01-01',
        lastVerifiedAt: new Date().toISOString(),
        verifiedBy: 'Group Governance Board',
        isGoldenRecord: true,
        dataPayload: {
          legalName: 'Apex Global Engineering FZ-LLC',
          jurisdiction: 'Dubai Development Authority (DDA)',
          currency: 'AED',
          incorporationYear: 2012,
          taxId: '100234567800003',
          email: 'corporate@apexglobal.ae',
        },
        identifiers: [
          {
            identifierType: 'TAX_ID',
            identifierValue: '100234567800003',
            normalizedValue: '100234567800003',
            isPrimary: true,
            isUniqueInDomain: true,
          },
        ],
        tags: ['PARENT_LEGAL_ENTITY', 'HOLDING', 'TIER_1'],
        createdAt: '2020-01-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
        createdBy: 'System Seed',
        updatedBy: 'System Seed',
      },

      // 2. Project
      {
        id: 'rec-prj-001',
        canonicalId: 'MDM-PRJ-001',
        domainCode: 'PROJECTS',
        entityType: 'ProjectMaster',
        sourceModule: 'PROJECTS',
        sourceEntityId: 'PRJ-2026-001',
        primaryName: 'Dubai Marina Luxury Tower - Phase 3 MEP',
        code: 'PRJ-MARINA-03',
        status: 'ACTIVE',
        approvalStatus: 'APPROVED',
        qualityScore: 98.0,
        qualityClassification: 'EXCELLENT',
        version: 2,
        effectiveDate: '2025-06-01',
        lastVerifiedAt: new Date().toISOString(),
        verifiedBy: 'David Chen (Head of Controls)',
        isGoldenRecord: true,
        dataPayload: {
          clientName: 'Emaar Properties PJSC',
          contractValue: 48500000,
          currency: 'AED',
          projectManager: 'Eng. Sarah Jenkins',
          costCenterId: 'CC-DXB-PRJ-01',
          startDate: '2025-06-01',
          targetFinishDate: '2027-12-31',
        },
        identifiers: [
          {
            identifierType: 'REG_NO',
            identifierValue: 'EMAAR-TWR-3-MEP-2025',
            normalizedValue: 'EMAARTWR3MEP2025',
            isPrimary: true,
            isUniqueInDomain: true,
          },
        ],
        tags: ['HIGH_RISE', 'MEP_HVAC', 'TIER_1_CLIENT'],
        createdAt: '2025-06-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
        createdBy: 'Project Controls Sync',
        updatedBy: 'David Chen',
      },

      // 3. Vendor A (Gulf Steel Supply)
      {
        id: 'rec-vnd-001',
        canonicalId: 'MDM-VND-001',
        domainCode: 'VENDORS',
        entityType: 'VendorMaster',
        sourceModule: 'PROCUREMENT',
        sourceEntityId: 'VND-GULF-01',
        primaryName: 'Gulf Steel Supply LLC',
        code: 'VND-GSS-01',
        status: 'ACTIVE',
        approvalStatus: 'APPROVED',
        qualityScore: 94.0,
        qualityClassification: 'GOOD',
        version: 3,
        effectiveDate: '2023-03-15',
        lastVerifiedAt: new Date().toISOString(),
        verifiedBy: 'Sarah Jenkins (Procurement)',
        isGoldenRecord: false,
        dataPayload: {
          tradeLicenseNo: 'TL-DXB-778899',
          taxId: '100456789000003',
          iban: 'AE120330000000123456789',
          bankName: 'Emirates NBD',
          contactPerson: 'Rashid Al-Khouri',
          email: 'sales@gulfsteelsupply.ae',
          phone: '+97142233445',
          creditTermsDays: 60,
          category: 'STRUCTURAL_STEEL_PIPING',
        },
        identifiers: [
          {
            identifierType: 'TAX_ID',
            identifierValue: '100456789000003',
            normalizedValue: '100456789000003',
            isPrimary: true,
            isUniqueInDomain: true,
          },
          {
            identifierType: 'REG_NO',
            identifierValue: 'TL-DXB-778899',
            normalizedValue: 'TLDXB778899',
            isPrimary: false,
            isUniqueInDomain: true,
          },
        ],
        tags: ['APPROVED_VENDOR', 'STEEL', 'CRITICAL_SUPPLIER'],
        createdAt: '2023-03-15T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
        createdBy: 'Procurement Migration',
        updatedBy: 'Sarah Jenkins',
      },

      // 4. Vendor B (Gulf Steel FZC - Duplicate Candidate)
      {
        id: 'rec-vnd-002',
        canonicalId: 'MDM-VND-002',
        domainCode: 'VENDORS',
        entityType: 'VendorMaster',
        sourceModule: 'PROCUREMENT',
        sourceEntityId: 'VND-GULF-FZ',
        primaryName: 'Gulf Steel FZC',
        code: 'VND-GSS-FZ',
        status: 'ACTIVE',
        approvalStatus: 'PENDING',
        qualityScore: 78.0,
        qualityClassification: 'WARNING',
        version: 1,
        effectiveDate: '2025-11-10',
        lastVerifiedAt: new Date(Date.now() - 86400000 * 45).toISOString(),
        verifiedBy: 'Automated Ingest',
        isGoldenRecord: false,
        dataPayload: {
          tradeLicenseNo: 'TL-SHJ-445566',
          taxId: '100456789000003', // Identical Tax ID to VND-001!
          iban: 'AE120330000000123456789',
          contactPerson: 'Rashid K.',
          email: 'info@gulfsteelsupply.ae',
          phone: '+97142233445',
          creditTermsDays: 45,
          category: 'STEEL_PIPING',
        },
        identifiers: [
          {
            identifierType: 'TAX_ID',
            identifierValue: '100456789000003',
            normalizedValue: '100456789000003',
            isPrimary: true,
            isUniqueInDomain: false,
          },
        ],
        tags: ['POTENTIAL_DUPLICATE', 'UNVERIFIED_BRANCH'],
        createdAt: '2025-11-10T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
        createdBy: 'Branch Subcontractor Onboarding',
        updatedBy: 'Automated Ingest',
      },

      // 5. Employee
      {
        id: 'rec-emp-001',
        canonicalId: 'MDM-EMP-001',
        domainCode: 'EMPLOYEES',
        entityType: 'EmployeeProfile',
        sourceModule: 'HRMS',
        sourceEntityId: 'EMP-10024',
        primaryName: 'Eng. Tariq Mansoor Al-Hashemi',
        code: 'EMP-10024',
        status: 'ACTIVE',
        approvalStatus: 'APPROVED',
        qualityScore: 98.0,
        qualityClassification: 'EXCELLENT',
        version: 2,
        effectiveDate: '2021-04-01',
        lastVerifiedAt: new Date().toISOString(),
        verifiedBy: 'Fatima Al-Mansoor (HR)',
        isGoldenRecord: true,
        dataPayload: {
          designation: 'Senior MEP Project Manager',
          department: 'Project Operations',
          nationalId: '784-1985-1234567-1',
          email: 'tariq.mansoor@apexglobal.ae',
          phone: '+971501234567',
          basicSalary: 32000,
          joiningDate: '2021-04-01',
        },
        identifiers: [
          {
            identifierType: 'EMIRATES_ID',
            identifierValue: '784-1985-1234567-1',
            normalizedValue: '784198512345671',
            isPrimary: true,
            isUniqueInDomain: true,
          },
        ],
        tags: ['LEAD_ENGINEER', 'AUTHORIZED_SIGNER', 'PERMANENT'],
        createdAt: '2021-04-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
        createdBy: 'HRMS Payroll Sync',
        updatedBy: 'Fatima Al-Mansoor',
      },

      // 6. Material SKU
      {
        id: 'rec-mat-001',
        canonicalId: 'MDM-MAT-001',
        domainCode: 'MATERIALS',
        entityType: 'MaterialSKU',
        sourceModule: 'INVENTORY',
        sourceEntityId: 'SKU-DI-PIPE-400',
        primaryName: 'Ductile Iron Pipe Class K9 - DN400 x 6.0M',
        code: 'MAT-DIP-400-K9',
        status: 'ACTIVE',
        approvalStatus: 'APPROVED',
        qualityScore: 96.0,
        qualityClassification: 'EXCELLENT',
        version: 1,
        effectiveDate: '2022-08-10',
        lastVerifiedAt: new Date().toISOString(),
        verifiedBy: 'Ali Hassan (Inventory Lead)',
        isGoldenRecord: true,
        dataPayload: {
          sku: 'MAT-DIP-400-K9',
          uom: 'MTR',
          category: 'PIPING_WATER_INFRASTRUCTURE',
          standard: 'BS EN 545 / ISO 2531',
          internalLining: 'High Alumina Cement Mortar',
          externalCoating: 'Metallic Zinc + Bituminous Paint',
          standardCostAed: 485.0,
          leadTimeWeeks: 6,
        },
        identifiers: [
          {
            identifierType: 'SKU',
            identifierValue: 'MAT-DIP-400-K9',
            normalizedValue: 'MATDIP400K9',
            isPrimary: true,
            isUniqueInDomain: true,
          },
        ],
        tags: ['WATER_AUTHORITY_APPROVED', 'CRITICAL_PATH', 'HEAVY_FREIGHT'],
        createdAt: '2022-08-10T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
        createdBy: 'Standard Catalog Upload',
        updatedBy: 'Ali Hassan',
      },

      // 7. Capital Asset (Diesel Generator)
      {
        id: 'rec-ast-001',
        canonicalId: 'MDM-AST-001',
        domainCode: 'ASSETS',
        entityType: 'FixedAsset',
        sourceModule: 'EAM',
        sourceEntityId: 'AST-CAT-500KVA',
        primaryName: 'Caterpillar 500kVA Soundproof Prime Diesel Generator',
        code: 'AST-GEN-042',
        status: 'ACTIVE',
        approvalStatus: 'APPROVED',
        qualityScore: 95.0,
        qualityClassification: 'EXCELLENT',
        version: 1,
        effectiveDate: '2023-01-20',
        lastVerifiedAt: new Date().toISOString(),
        verifiedBy: 'Vikram Rao (Plant Chief)',
        isGoldenRecord: true,
        dataPayload: {
          serialNumber: 'CAT-C15-889922',
          assetTag: 'APEX-AST-00942',
          manufacturer: 'Caterpillar Inc.',
          ratedPowerKw: 400,
          fuelType: 'DIESEL',
          usefulLifeMonths: 120,
          purchaseCost: 285000,
          currentLocation: 'Marina Tower Site Yard A',
        },
        identifiers: [
          {
            identifierType: 'SERIAL_NO',
            identifierValue: 'CAT-C15-889922',
            normalizedValue: 'CATC15889922',
            isPrimary: true,
            isUniqueInDomain: true,
          },
        ],
        tags: ['POWER_GENERATION', 'MOBILE_PLANT', 'IOT_TELEMETRY_ENABLED'],
        createdAt: '2023-01-20T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
        createdBy: 'EAM Fixed Asset Ingest',
        updatedBy: 'Vikram Rao',
      },
    ];

    initialRecords.forEach((rec) => {
      this.records.set(rec.id, rec);
      this.recordVersions.set(rec.id, [
        {
          id: `ver-${rec.id}-1`,
          masterRecordId: rec.id,
          canonicalId: rec.canonicalId,
          versionNumber: rec.version,
          changeType: 'CREATE',
          changeReason: 'Initial enterprise master data ingestion and standardization.',
          newPayload: rec.dataPayload,
          changedFields: Object.keys(rec.dataPayload),
          effectiveDate: rec.effectiveDate,
          createdAt: rec.createdAt,
          createdBy: rec.createdBy,
        },
      ]);
    });
  }

  public getAllDomains(): MasterDomainSummary[] {
    return Array.from(this.domains.values());
  }

  public getDomain(code: MasterDomainCode): MasterDomainSummary | undefined {
    return this.domains.get(code);
  }

  public getRecords(filter?: {
    domainCode?: MasterDomainCode;
    status?: string;
    search?: string;
    qualityClassification?: string;
  }): MasterRecordItem[] {
    let result = Array.from(this.records.values());

    if (filter?.domainCode) {
      result = result.filter((r) => r.domainCode === filter.domainCode);
    }
    if (filter?.status) {
      result = result.filter((r) => r.status === filter.status);
    }
    if (filter?.qualityClassification) {
      result = result.filter((r) => r.qualityClassification === filter.qualityClassification);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.canonicalId.toLowerCase().includes(q) ||
          r.primaryName.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }

  public getRecordById(id: string): MasterRecordItem | undefined {
    return this.records.get(id);
  }

  public getRecordByCanonicalId(canonicalId: string): MasterRecordItem | undefined {
    return Array.from(this.records.values()).find((r) => r.canonicalId === canonicalId);
  }

  public getRecordVersions(recordId: string): MasterRecordVersion[] {
    return this.recordVersions.get(recordId) || [];
  }

  public saveRecord(record: MasterRecordItem): MasterRecordItem {
    this.records.set(record.id, record);
    return record;
  }

  public addVersion(recordId: string, version: MasterRecordVersion) {
    const list = this.recordVersions.get(recordId) || [];
    list.unshift(version);
    this.recordVersions.set(recordId, list);
  }

  public generateCanonicalId(domainCode: MasterDomainCode): string {
    const prefixes: Record<MasterDomainCode, string> = {
      ORGANIZATION: 'ORG',
      PROJECTS: 'PRJ',
      SITES: 'SIT',
      CUSTOMERS: 'CST',
      VENDORS: 'VND',
      EMPLOYEES: 'EMP',
      MATERIALS: 'MAT',
      ASSETS: 'AST',
      FLEET_VEHICLES: 'FLT',
      EQUIPMENT: 'EQP',
      WAREHOUSES: 'WHS',
      COST_CENTERS: 'CCT',
      CHART_OF_ACCOUNTS: 'COA',
      CONTRACTS: 'CNT',
      DOCUMENTS: 'DOC',
      WATER_INFRASTRUCTURE: 'WTR',
      USERS_ROLES: 'USR',
    };

    const prefix = prefixes[domainCode] || 'ENT';
    const domainRecords = Array.from(this.records.values()).filter((r) => r.domainCode === domainCode);
    const nextSeq = String(domainRecords.length + 1).padStart(3, '0');
    return `MDM-${prefix}-${nextSeq}`;
  }

  public getMDMStatsSummary(): MDMStatsSummary {
    const allRecords = Array.from(this.records.values());
    const totalRecords = allRecords.length;
    const activeRecords = allRecords.filter((r) => r.status === 'ACTIVE').length;

    const avgQuality =
      totalRecords > 0
        ? Math.round((allRecords.reduce((acc, r) => acc + r.qualityScore, 0) / totalRecords) * 10) / 10
        : 95.0;

    const domainSummaries = Array.from(this.domains.values());

    const domainScorecards = domainSummaries.map((d) => {
      const domRecords = allRecords.filter((r) => r.domainCode === d.domainCode);
      const score =
        domRecords.length > 0
          ? Math.round((domRecords.reduce((acc, r) => acc + r.qualityScore, 0) / domRecords.length) * 10) / 10
          : d.currentAverageQuality;

      let status: any = 'GOOD';
      if (score >= 95) status = 'EXCELLENT';
      else if (score >= 85) status = 'GOOD';
      else if (score >= 70) status = 'WARNING';
      else if (score >= 50) status = 'POOR';
      else status = 'CRITICAL';

      return {
        domainCode: d.domainCode,
        domainName: d.domainName,
        qualityScore: score,
        targetScore: d.qualityTargetScore,
        recordsCount: domRecords.length || d.totalRecordsCount,
        duplicateCount: d.duplicateCandidatesCount,
        openIssuesCount: d.openIssuesCount,
        status,
      };
    });

    return {
      totalMasterRecords: totalRecords,
      activeMasterRecords: activeRecords,
      domainsMonitored: domainSummaries.length,
      averageQualityScore: avgQuality,
      duplicateCandidatesCount: 4,
      openQualityIssuesCount: 6,
      reconciliationFailuresCount: 0,
      pendingChangeApprovalsCount: 2,
      staleRecordsCount: 1,
      orphanRecordsCount: 0,
      goldenRecordsCount: allRecords.filter((r) => r.isGoldenRecord).length,
      legalHoldsActiveCount: 0,
      governanceComplianceScore: 97.4,
      domainScorecards,
      qualityDimensionAverages: {
        COMPLETENESS: 94.8,
        ACCURACY: 96.2,
        CONSISTENCY: 93.5,
        UNIQUENESS: 98.1,
        VALIDITY: 95.4,
        TIMELINESS: 92.0,
        REFERENTIAL: 99.0,
      },
    };
  }
}

export const masterDataRegistry = MasterDataRegistry.getInstance();
