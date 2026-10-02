// ============================================================================
// PHASE 76: MASTER DATA MANAGEMENT - DUPLICATE DETECTION & GOLDEN RECORD ENGINE
// ============================================================================

import {
  MasterRecordItem,
  DuplicateCandidateItem,
  GoldenRecordItem,
  MasterDomainCode,
} from './master_data.types';

export class DuplicateDetectionEngine {
  private static instance: DuplicateDetectionEngine;

  private constructor() {}

  public static getInstance(): DuplicateDetectionEngine {
    if (!DuplicateDetectionEngine.instance) {
      DuplicateDetectionEngine.instance = new DuplicateDetectionEngine();
    }
    return DuplicateDetectionEngine.instance;
  }

  /**
   * String normalization for corporate and entity names
   */
  public normalizeString(str: string): string {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/\b(private|pvt|ltd|limited|llc|inc|corp|corporation|co|company|est|establishment|fze|fzc)\b/gi, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }

  /**
   * Deterministic Levenshtein Distance & Similarity Calculation
   */
  public calculateLevenshteinSimilarity(s1: string, s2: string): number {
    if (s1 === s2) return 1.0;
    if (!s1 || !s2) return 0.0;

    const len1 = s1.length;
    const len2 = s2.length;
    const track = Array(len2 + 1)
      .fill(null)
      .map(() => Array(len1 + 1).fill(null));

    for (let i = 0; i <= len1; i += 1) track[0][i] = i;
    for (let j = 0; j <= len2; j += 1) track[j][0] = j;

    for (let j = 1; j <= len2; j += 1) {
      for (let i = 1; i <= len1; i += 1) {
        const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1, // deletion
          track[j - 1][i] + 1, // insertion
          track[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    const distance = track[len2][len1];
    const maxLength = Math.max(len1, len2);
    return Math.max(0, 1 - distance / maxLength);
  }

  /**
   * Token overlap Jaccard similarity
   */
  public calculateTokenSimilarity(s1: string, s2: string): number {
    const tokens1 = new Set(s1.toLowerCase().split(/\s+/).filter(Boolean));
    const tokens2 = new Set(s2.toLowerCase().split(/\s+/).filter(Boolean));
    if (tokens1.size === 0 || tokens2.size === 0) return 0;

    let intersectionCount = 0;
    tokens1.forEach((t) => {
      if (tokens2.has(t)) intersectionCount++;
    });

    const unionCount = new Set([...Array.from(tokens1), ...Array.from(tokens2)]).size;
    return unionCount > 0 ? intersectionCount / unionCount : 0;
  }

  /**
   * Scan two master records and compute comprehensive similarity
   */
  public evaluatePair(
    recordA: MasterRecordItem,
    recordB: MasterRecordItem
  ): DuplicateCandidateItem | null {
    if (recordA.id === recordB.id || recordA.domainCode !== recordB.domainCode) {
      return null;
    }

    const matchingFields: DuplicateCandidateItem['matchingFields'] = [];
    let cumulativeScore = 0;
    let weightSum = 0;

    // 1. Primary Name Matching (Normalized + Fuzzy)
    const normA = this.normalizeString(recordA.primaryName);
    const normB = this.normalizeString(recordB.primaryName);

    let nameScore = 0;
    if (normA === normB && normA.length > 0) {
      nameScore = 1.0;
      matchingFields.push({
        field: 'primaryName',
        valueA: recordA.primaryName,
        valueB: recordB.primaryName,
        matchType: 'NORMALIZED',
      });
    } else {
      const levScore = this.calculateLevenshteinSimilarity(normA, normB);
      const tokenScore = this.calculateTokenSimilarity(recordA.primaryName, recordB.primaryName);
      nameScore = Math.max(levScore, tokenScore);

      if (nameScore >= 0.75) {
        matchingFields.push({
          field: 'primaryName',
          valueA: recordA.primaryName,
          valueB: recordB.primaryName,
          matchType: 'FUZZY',
        });
      }
    }

    cumulativeScore += nameScore * 40.0;
    weightSum += 40.0;

    // 2. Exact Identifier Matching (Tax ID, Trade License, Serial No, SKU, IBAN, National ID)
    const identifiersA = recordA.identifiers || [];
    const identifiersB = recordB.identifiers || [];

    let hasExactIdMatch = false;
    for (const idA of identifiersA) {
      for (const idB of identifiersB) {
        if (idA.identifierType === idB.identifierType && idA.normalizedValue === idB.normalizedValue) {
          hasExactIdMatch = true;
          matchingFields.push({
            field: `identifier:${idA.identifierType}`,
            valueA: idA.identifierValue,
            valueB: idB.identifierValue,
            matchType: 'IDENTIFIER',
          });
        }
      }
    }

    if (hasExactIdMatch) {
      cumulativeScore += 1.0 * 35.0;
    } else {
      cumulativeScore += 0.0;
    }
    weightSum += 35.0;

    // 3. Payload Attributes (Email, Phone, Registration No, Serial)
    const payloadA = recordA.dataPayload || {};
    const payloadB = recordB.dataPayload || {};

    let contactMatchScore = 0;
    if (payloadA.email && payloadB.email && payloadA.email.toLowerCase() === payloadB.email.toLowerCase()) {
      contactMatchScore = 1.0;
      matchingFields.push({
        field: 'email',
        valueA: payloadA.email,
        valueB: payloadB.email,
        matchType: 'EXACT',
      });
    } else if (payloadA.phone && payloadB.phone && payloadA.phone.replace(/[^0-9]/g, '') === payloadB.phone.replace(/[^0-9]/g, '')) {
      contactMatchScore = 0.9;
      matchingFields.push({
        field: 'phone',
        valueA: payloadA.phone,
        valueB: payloadB.phone,
        matchType: 'EXACT',
      });
    }

    cumulativeScore += contactMatchScore * 25.0;
    weightSum += 25.0;

    const overallSimilarity = Math.round((cumulativeScore / weightSum) * 100) / 100;

    // Minimum threshold for duplicate candidate flag (0.65 or exact identifier match)
    if (overallSimilarity >= 0.65 || hasExactIdMatch) {
      const reason = hasExactIdMatch
        ? `Deterministic identifier match on ${matchingFields.find((m) => m.matchType === 'IDENTIFIER')?.field || 'statutory ID'}`
        : `High name and attribute similarity (${Math.round(overallSimilarity * 100)}%) across corporate metadata`;

      return {
        id: `dup-${recordA.id}-${recordB.id}`,
        domainCode: recordA.domainCode,
        candidateARecordId: recordA.id,
        candidateACanonicalId: recordA.canonicalId,
        candidateAName: recordA.primaryName,
        candidateBRecordId: recordB.id,
        candidateBCanonicalId: recordB.canonicalId,
        candidateBName: recordB.primaryName,
        similarityScore: overallSimilarity,
        detectionReason: reason,
        matchingFields,
        status: 'PENDING_REVIEW',
        aiClassification: 'RULE-BASED',
        aiAssistedExplanation: `Candidate A ('${recordA.primaryName}') and Candidate B ('${recordB.primaryName}') exhibit ${Math.round(overallSimilarity * 100)}% structural congruence. Resolution requires steward signoff.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return null;
  }

  /**
   * Build a canonical Golden Record from approved duplicate merge
   */
  public constructGoldenRecord(params: {
    domainCode: MasterDomainCode;
    primaryRecord: MasterRecordItem;
    secondaryRecords: MasterRecordItem[];
    approvedByUserId: string;
    approvedByUserName: string;
  }): GoldenRecordItem {
    const { domainCode, primaryRecord, secondaryRecords, approvedByUserId, approvedByUserName } = params;

    const sourceRecordIds = [primaryRecord.id, ...secondaryRecords.map((r) => r.id)];
    const survivorshipRulesApplied: GoldenRecordItem['survivorshipRulesApplied'] = [];

    // Survivorship: Start with primary record payload as base
    const consolidatedPayload: Record<string, any> = { ...primaryRecord.dataPayload };

    // Fill missing attributes from secondary records
    secondaryRecords.forEach((sec) => {
      Object.entries(sec.dataPayload || {}).forEach(([key, val]) => {
        if (consolidatedPayload[key] === undefined || consolidatedPayload[key] === null || consolidatedPayload[key] === '') {
          if (val !== undefined && val !== null && val !== '') {
            consolidatedPayload[key] = val;
            survivorshipRulesApplied.push({
              field: key,
              sourceRecordId: sec.id,
              sourceCanonicalId: sec.canonicalId,
              chosenValue: val,
              ruleType: 'MOST_RECENT',
            });
          }
        }
      });
    });

    const goldenCanonicalId = `GLD-${primaryRecord.canonicalId.replace('MDM-', '')}`;

    return {
      id: `gld-rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      goldenCanonicalId,
      domainCode,
      primaryName: primaryRecord.primaryName,
      consolidatedPayload,
      sourceRecordIds,
      primarySourceRecordId: primaryRecord.id,
      survivorshipRulesApplied,
      confidenceScore: 0.98,
      status: 'ACTIVE',
      approvedByUserId,
      approvedByUserName,
      approvedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export const duplicateDetectionEngine = DuplicateDetectionEngine.getInstance();
