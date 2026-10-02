// ============================================================================
// PHASE 76: MASTER DATA MANAGEMENT - VALIDATORS (ZOD)
// ============================================================================

import { z } from 'zod';

export const MasterDomainCodeSchema = z.enum([
  'ORGANIZATION',
  'PROJECTS',
  'SITES',
  'CUSTOMERS',
  'VENDORS',
  'EMPLOYEES',
  'MATERIALS',
  'ASSETS',
  'FLEET_VEHICLES',
  'EQUIPMENT',
  'WAREHOUSES',
  'COST_CENTERS',
  'CHART_OF_ACCOUNTS',
  'CONTRACTS',
  'DOCUMENTS',
  'WATER_INFRASTRUCTURE',
  'USERS_ROLES',
]);

export const CreateMasterRecordSchema = z.object({
  domainCode: MasterDomainCodeSchema,
  entityType: z.string().min(1),
  sourceModule: z.string().min(1),
  sourceEntityId: z.string().min(1),
  primaryName: z.string().min(2),
  secondaryName: z.string().optional(),
  code: z.string().min(1),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED']).default('ACTIVE'),
  effectiveDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  expiryDate: z.string().optional(),
  dataPayload: z.record(z.string(), z.any()).default({}),
  identifiers: z
    .array(
      z.object({
        identifierType: z.enum([
          'TAX_ID',
          'VAT_NO',
          'REG_NO',
          'PASSPORT',
          'EMIRATES_ID',
          'SERIAL_NO',
          'SKU',
          'IBAN',
          'EMAIL',
          'PHONE',
        ]),
        identifierValue: z.string().min(1),
        isPrimary: z.boolean().default(false),
        issuingAuthority: z.string().optional(),
      })
    )
    .default([]),
  tags: z.array(z.string()).default([]),
});

export const UpdateMasterRecordSchema = z.object({
  primaryName: z.string().min(2).optional(),
  secondaryName: z.string().optional(),
  code: z.string().min(1).optional(),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'MERGED', 'ARCHIVED']).optional(),
  effectiveDate: z.string().optional(),
  expiryDate: z.string().optional(),
  dataPayload: z.record(z.string(), z.any()).optional(),
  identifiers: z
    .array(
      z.object({
        identifierType: z.enum([
          'TAX_ID',
          'VAT_NO',
          'REG_NO',
          'PASSPORT',
          'EMIRATES_ID',
          'SERIAL_NO',
          'SKU',
          'IBAN',
          'EMAIL',
          'PHONE',
        ]),
        identifierValue: z.string().min(1),
        isPrimary: z.boolean().default(false),
        issuingAuthority: z.string().optional(),
      })
    )
    .optional(),
  tags: z.array(z.string()).optional(),
  changeReason: z.string().min(3).default('Operational master attribute update'),
});

export const DuplicateResolutionSchema = z.object({
  candidateId: z.string().min(1),
  resolution: z.enum(['APPROVE_MERGE', 'KEEP_SEPARATE', 'REJECT_CANDIDATE', 'ESCALATE']),
  primaryRecordId: z.string().optional(),
  secondaryRecordIds: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const TriggerReconciliationSchema = z.object({
  domainCode: MasterDomainCodeSchema,
  triggerType: z.enum(['MANUAL', 'SCHEDULED', 'EVENT_DRIVEN']).default('MANUAL'),
});

export const CreateChangeRequestSchema = z.object({
  masterRecordId: z.string().min(1),
  domainCode: MasterDomainCodeSchema,
  requestType: z.enum(['UPDATE_ATTRIBUTES', 'BANK_ACCOUNT_CHANGE', 'MERGE_REQUEST', 'STATUS_CHANGE', 'RETIREMENT']),
  reason: z.string().min(5),
  proposedValue: z.record(z.string(), z.any()),
});

export const ReviewChangeRequestSchema = z.object({
  requestId: z.string().min(1),
  action: z.enum(['APPROVE', 'REJECT']),
  rejectionReason: z.string().optional(),
});

export const PlaceLegalHoldSchema = z.object({
  title: z.string().min(3),
  reason: z.string().min(5),
  domainCode: MasterDomainCodeSchema,
  targetCanonicalId: z.string().optional(),
  isGlobalForDomain: z.boolean().default(false),
});

export const ReleaseLegalHoldSchema = z.object({
  holdCode: z.string().min(1),
  releaseReason: z.string().min(5),
});
