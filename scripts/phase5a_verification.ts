import http from 'http';
import { createPool } from '../src/db';
import { idempotencyRepository } from '../src/api/repositories/idempotency.repository';
import { signAccessToken } from '../src/api/utils/jwt';
import { UserRole } from '../src/types';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

function recordTest(name: string, passed: boolean, details?: string, error?: string) {
  results.push({ name, passed, details, error });
  console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${name}${details ? ` (${details})` : ''}${error ? ` - ERROR: ${error}` : ''}`);
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const k of keysA) {
    if (!deepEqual(a[k], b[k])) return false;
  }
  return true;
}

// Generate Admin JWT Token for seed admin user
const adminToken = signAccessToken({
  userId: 'usr-admin-001',
  email: 'admin@sitesyncpro.com',
  role: 'ADMIN' as UserRole,
  permissions: ['ALL'],
});

// Generate Manager User B JWT Token for seed manager user
const userBToken = signAccessToken({
  userId: 'usr-mgr-002',
  email: 'manager@sitesyncpro.com',
  role: 'MANAGER' as UserRole,
  permissions: ['ALL'],
});

function makeRequest(options: {
  method: string;
  path: string;
  headers?: Record<string, string>;
  body?: any;
}): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: any }> {
  return new Promise((resolve, reject) => {
    const data = options.body ? JSON.stringify(options.body) : '';
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data).toString(),
      ...(options.headers || {}),
    };

    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: options.path,
        method: options.method,
        headers: reqHeaders,
      },
      (res) => {
        let resData = '';
        res.on('data', (chunk) => {
          resData += chunk;
        });
        res.on('end', () => {
          let parsed: any;
          try {
            parsed = JSON.parse(resData);
          } catch {
            parsed = resData;
          }
          resolve({
            status: res.statusCode || 500,
            headers: res.headers,
            body: parsed,
          });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (data) req.write(data);
    req.end();
  });
}

async function runVerification() {
  console.log('============================================================');
  console.log('SITESYNC PRO ERP — PHASE 5A IDEMPOTENCY VERIFICATION SUITE');
  console.log('============================================================\n');

  // Test 1: Table & Schema initialization
  try {
    await idempotencyRepository.ensureTable();
    const pool = createPool();
    const checkTable = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'idempotency_keys';"
    );
    const cols = checkTable.rows.map((r) => r.column_name);
    const requiredCols = ['id', 'key', 'user_id', 'method', 'route_path', 'request_hash', 'status', 'status_code', 'response_body', 'locked_until', 'expires_at', 'replay_count'];
    const allPresent = requiredCols.every((c) => cols.includes(c));
    recordTest('1. Idempotency Table & Columns Verification', allPresent, `Found columns: ${cols.join(', ')}`);
  } catch (err: any) {
    recordTest('1. Idempotency Table & Columns Verification', false, undefined, err.message);
  }

  // Test 2: Material Issue — Initial creation with Idempotency-Key
  const issueKey = `idem_issue_${Date.now()}_001`;
  const issuePayload = {
    projectId: 'proj-001',
    warehouseId: 'wh-001',
    issuedTo: 'Site Engineer Rahul',
    notes: 'Idempotency verification issue',
    items: [
      {
        materialId: 'mat-001',
        requestedQty: 5,
        issuedQty: 5,
        unitPrice: 1200,
      },
    ],
  };

  let firstIssueResponse: any;
  try {
    const res = await makeRequest({
      method: 'POST',
      path: '/api/v1/inventory/material-issues',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Idempotency-Key': issueKey,
      },
      body: issuePayload,
    });
    firstIssueResponse = res;
    recordTest(
      '2. Material Issue: Initial Request Execution',
      res.status === 201 && res.body.success === true,
      `Status ${res.status}, Issue Number: ${res.body?.data?.issueNumber || 'N/A'}`
    );
  } catch (err: any) {
    recordTest('2. Material Issue: Initial Request Execution', false, undefined, err.message);
  }

  // Test 3: Material Issue — Exact Replay with same Idempotency-Key
  try {
    const res = await makeRequest({
      method: 'POST',
      path: '/api/v1/inventory/material-issues',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Idempotency-Key': issueKey,
      },
      body: issuePayload,
    });
    const isReplay = res.headers['x-idempotent-replay'] === 'true';
    const isDeepEqual = deepEqual(res.body, firstIssueResponse.body);
    recordTest(
      '3. Material Issue: Exact Idempotent Replay',
      res.status === 201 && isReplay && isDeepEqual,
      `Replay Header: ${res.headers['x-idempotent-replay']}, Deep Equal: ${isDeepEqual}`
    );
  } catch (err: any) {
    recordTest('3. Material Issue: Exact Idempotent Replay', false, undefined, err.message);
  }

  // Test 4: Payload Mismatch Detection (Conflict 409)
  try {
    const modifiedPayload = { ...issuePayload, issuedTo: 'Different Person Modified' };
    const res = await makeRequest({
      method: 'POST',
      path: '/api/v1/inventory/material-issues',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Idempotency-Key': issueKey,
      },
      body: modifiedPayload,
    });
    recordTest(
      '4. Payload Mismatch Detection (HTTP 409)',
      res.status === 409,
      `Status ${res.status}, Message: ${res.body?.message || res.body?.error}`
    );
  } catch (err: any) {
    recordTest('4. Payload Mismatch Detection (HTTP 409)', false, undefined, err.message);
  }

  // Test 5: Route Mismatch Detection (Conflict 409)
  try {
    const res = await makeRequest({
      method: 'POST',
      path: '/api/v1/procurement/purchase-orders',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Idempotency-Key': issueKey,
      },
      body: issuePayload,
    });
    recordTest(
      '5. Route Mismatch Detection (HTTP 409)',
      res.status === 409,
      `Status ${res.status}, Message: ${res.body?.message || res.body?.error}`
    );
  } catch (err: any) {
    recordTest('5. Route Mismatch Detection (HTTP 409)', false, undefined, err.message);
  }

  // Test 6: Cross-User Replay Protection (HTTP 403 Forbidden)
  try {
    const res = await makeRequest({
      method: 'POST',
      path: '/api/v1/inventory/material-issues',
      headers: {
        Authorization: `Bearer ${userBToken}`,
        'Idempotency-Key': issueKey,
      },
      body: issuePayload,
    });
    recordTest(
      '6. Cross-User Key Collision Protection (HTTP 403)',
      res.status === 403,
      `Status ${res.status}, Message: ${res.body?.message || res.body?.error}`
    );
  } catch (err: any) {
    recordTest('6. Cross-User Key Collision Protection (HTTP 403)', false, undefined, err.message);
  }

  // Test 7: Purchase Order creation idempotency
  const poKey = `idem_po_${Date.now()}_002`;
  const poPayload = {
    projectId: 'proj-001',
    projectName: 'Highland Infrastructure',
    vendorId: 'vnd-001',
    vendorName: 'Apex Steel & Cement Suppliers',
    totalAmount: 185000,
    items: [
      {
        materialId: 'mat-001',
        materialName: 'Structural Steel Fe500D',
        quantity: 20,
        unitPrice: 9250,
      },
    ],
  };

  try {
    const res1 = await makeRequest({
      method: 'POST',
      path: '/api/v1/procurement/purchase-orders',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Idempotency-Key': poKey,
      },
      body: poPayload,
    });

    const res2 = await makeRequest({
      method: 'POST',
      path: '/api/v1/procurement/purchase-orders',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Idempotency-Key': poKey,
      },
      body: poPayload,
    });

    const poPassed = res1.status === 201 && res2.status === 201 && res2.headers['x-idempotent-replay'] === 'true' && deepEqual(res1.body, res2.body);
    recordTest(
      '7. Purchase Order Creation Idempotency',
      poPassed,
      `First status: ${res1.status}, Second status: ${res2.status}, Replayed: ${res2.headers['x-idempotent-replay']}`
    );
  } catch (err: any) {
    recordTest('7. Purchase Order Creation Idempotency', false, undefined, err.message);
  }

  // Test 8: Goods Receipt Note (GRN) idempotency
  const grnKey = `idem_grn_${Date.now()}_003`;
  const grnPayload = {
    projectId: 'proj-001',
    vendorId: 'vnd-001',
    warehouseId: 'wh-001',
    items: [
      {
        materialId: 'mat-001',
        receivedQty: 10,
        acceptedQty: 10,
        rejectedQty: 0,
        unitPrice: 1200,
      },
    ],
  };

  try {
    const res1 = await makeRequest({
      method: 'POST',
      path: '/api/v1/inventory/goods-receipts',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Idempotency-Key': grnKey,
      },
      body: grnPayload,
    });

    const res2 = await makeRequest({
      method: 'POST',
      path: '/api/v1/inventory/goods-receipts',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Idempotency-Key': grnKey,
      },
      body: grnPayload,
    });

    const grnPassed = res1.status === 201 && res2.status === 201 && res2.headers['x-idempotent-replay'] === 'true' && deepEqual(res1.body, res2.body);
    recordTest(
      '8. Goods Receipt Note (GRN) Idempotency',
      grnPassed,
      `First status: ${res1.status}, Second status: ${res2.status}, Replayed: ${res2.headers['x-idempotent-replay']}`
    );
  } catch (err: any) {
    recordTest('8. Goods Receipt Note (GRN) Idempotency', false, undefined, err.message);
  }

  // Test 9: Project Cash Request & Settlement idempotency
  const cashKey = `idem_cash_${Date.now()}_004`;
  const cashPayload = {
    projectId: 'proj-001',
    projectName: 'Highland Infrastructure',
    amount: 45000,
    purpose: 'Site emergency fuel and masonry tools',
    category: 'SITE_EXPENSE',
  };

  try {
    const res1 = await makeRequest({
      method: 'POST',
      path: '/api/v1/finance/cash-requests',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Idempotency-Key': cashKey,
      },
      body: cashPayload,
    });

    const res2 = await makeRequest({
      method: 'POST',
      path: '/api/v1/finance/cash-requests',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Idempotency-Key': cashKey,
      },
      body: cashPayload,
    });

    const cashPassed = (res1.status === 200 || res1.status === 201) && res2.headers['x-idempotent-replay'] === 'true' && deepEqual(res1.body, res2.body);
    recordTest(
      '9. Project Cash Request Idempotency',
      cashPassed,
      `First status: ${res1.status}, Second status: ${res2.status}, Replayed: ${res2.headers['x-idempotent-replay']}`
    );
  } catch (err: any) {
    recordTest('9. Project Cash Request Idempotency', false, undefined, err.message);
  }

  // Test 10: High-Concurrency Burst (20 Simultaneous Parallel Requests)
  const concurrentKey = `idem_concurrent_${Date.now()}_005`;
  const concurrentPayload = {
    projectId: 'proj-001',
    warehouseId: 'wh-001',
    issuedTo: 'Foreman Suresh - Concurrent Stress Test',
    items: [
      {
        materialId: 'mat-001',
        requestedQty: 1,
        issuedQty: 1,
        unitPrice: 1200,
      },
    ],
  };

  try {
    const requests = Array.from({ length: 20 }, () =>
      makeRequest({
        method: 'POST',
        path: '/api/v1/inventory/material-issues',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Idempotency-Key': concurrentKey,
        },
        body: concurrentPayload,
      })
    );

    const responses = await Promise.all(requests);
    const createdCount = responses.filter((r) => r.status === 201 && r.headers['x-idempotent-replay'] !== 'true').length;
    const replayedCount = responses.filter((r) => r.status === 201 && r.headers['x-idempotent-replay'] === 'true').length;
    const inProgressCount = responses.filter((r) => r.status === 409).length;

    const concurrentPassed = createdCount === 1 && createdCount + replayedCount + inProgressCount === 20;
    recordTest(
      '10. High-Concurrency Burst (20 Concurrent Requests)',
      concurrentPassed,
      `Exactly 1 Execution (${createdCount}), Replayed: ${replayedCount}, Locked/Conflict: ${inProgressCount}`
    );
  } catch (err: any) {
    recordTest('10. High-Concurrency Burst (20 Concurrent Requests)', false, undefined, err.message);
  }

  // Test 11: GET Request Exemption (Passes through without overhead)
  try {
    const res = await makeRequest({
      method: 'GET',
      path: '/api/v1/inventory/materials',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Idempotency-Key': `idem_get_${Date.now()}`,
      },
    });
    recordTest(
      '11. GET Request Exemption',
      res.status === 200 && !res.headers['x-idempotent-replay'],
      `Status ${res.status}, Non-mutating verb passed through`
    );
  } catch (err: any) {
    recordTest('11. GET Request Exemption', false, undefined, err.message);
  }

  // Test 12: Request Without Idempotency-Key (Backwards Compatibility)
  try {
    const res = await makeRequest({
      method: 'POST',
      path: '/api/v1/inventory/subcategories',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      body: {
        name: `Subcat_${Date.now()}`,
        code: `SC_${Date.now()}`,
        categoryId: 'cat-001',
      },
    });
    recordTest(
      '12. Backwards Compatibility (No Idempotency-Key)',
      res.status === 200 || res.status === 201,
      `Status ${res.status}, Legacy caller executed seamlessly`
    );
  } catch (err: any) {
    recordTest('12. Backwards Compatibility (No Idempotency-Key)', false, undefined, err.message);
  }

  // Test 13: Material Return Idempotency
  const returnKey = `idem_return_${Date.now()}_006`;
  const returnPayload = {
    projectId: 'proj-001',
    warehouseId: 'wh-001',
    returnedBy: 'Site Engineer Rahul',
    reason: 'Surplus steel pipes returned to store',
    items: [
      {
        materialId: 'mat-001',
        returnedQty: 2,
        unitPrice: 1200,
        condition: 'GOOD',
      },
    ],
  };

  try {
    const res1 = await makeRequest({
      method: 'POST',
      path: '/api/v1/inventory/material-returns',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Idempotency-Key': returnKey,
      },
      body: returnPayload,
    });

    const res2 = await makeRequest({
      method: 'POST',
      path: '/api/v1/inventory/material-returns',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Idempotency-Key': returnKey,
      },
      body: returnPayload,
    });

    const retPassed = res1.status === 201 && res2.status === 201 && res2.headers['x-idempotent-replay'] === 'true' && deepEqual(res1.body, res2.body);
    recordTest(
      '13. Material Return Reversal Idempotency',
      retPassed,
      `First status: ${res1.status}, Second status: ${res2.status}, Replayed: ${res2.headers['x-idempotent-replay']}`
    );
  } catch (err: any) {
    recordTest('13. Material Return Reversal Idempotency', false, undefined, err.message);
  }

  // Test 14: Payroll Run Idempotency
  const payrollKey = `idem_payroll_${Date.now()}_007`;
  const payrollPayload = {
    periodId: 'pp-2026-08',
    remarks: 'August 2026 site staff automated payroll execution',
  };

  try {
    const res1 = await makeRequest({
      method: 'POST',
      path: '/api/v1/hrms/payroll/run',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Idempotency-Key': payrollKey,
      },
      body: payrollPayload,
    });

    const res2 = await makeRequest({
      method: 'POST',
      path: '/api/v1/hrms/payroll/run',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Idempotency-Key': payrollKey,
      },
      body: payrollPayload,
    });

    const payrollPassed = (res1.status === 200 || res1.status === 201) && res2.headers['x-idempotent-replay'] === 'true' && deepEqual(res1.body, res2.body);
    recordTest(
      '14. Payroll Execution Idempotency',
      payrollPassed,
      `First status: ${res1.status}, Second status: ${res2.status}, Replayed: ${res2.headers['x-idempotent-replay']}`
    );
  } catch (err: any) {
    recordTest('14. Payroll Execution Idempotency', false, undefined, err.message);
  }

  // Test 15: Replay Count Telemetry in PostgreSQL
  try {
    const pool = createPool();
    const query = await pool.query(
      "SELECT replay_count FROM idempotency_keys WHERE key = $1 AND user_id = $2;",
      [issueKey, 'usr-admin-001']
    );
    const replayCount = query.rows[0]?.replay_count;
    recordTest(
      '15. Telemetry: Database Replay Counter',
      replayCount >= 1,
      `Tracked replayCount: ${replayCount}`
    );
  } catch (err: any) {
    recordTest('15. Telemetry: Database Replay Counter', false, undefined, err.message);
  }

  // Test 16: Empty / Malformed Idempotency-Key Validation
  try {
    const res = await makeRequest({
      method: 'POST',
      path: '/api/v1/inventory/material-issues',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Idempotency-Key': '   ', // whitespace only
      },
      body: issuePayload,
    });
    recordTest(
      '16. Malformed Key Rejection (HTTP 400)',
      res.status === 400,
      `Status ${res.status}, Error: ${res.body?.message}`
    );
  } catch (err: any) {
    recordTest('16. Malformed Key Rejection (HTTP 400)', false, undefined, err.message);
  }

  // Test 17: Automatic TTL & Retention Purge
  try {
    const deletedCount = await idempotencyRepository.cleanupExpired();
    recordTest(
      '17. Automatic TTL Expiration Purge',
      typeof deletedCount === 'number',
      `Cleanup routine executed successfully, purged count: ${deletedCount}`
    );
  } catch (err: any) {
    recordTest('17. Automatic TTL Expiration Purge', false, undefined, err.message);
  }

  // Test 18: Safe Failure Key Release & Immediate Retriability
  const failKey = `idem_fail_${Date.now()}_008`;
  try {
    // 1st request fails with 400 due to invalid empty warehouse
    const res1 = await makeRequest({
      method: 'POST',
      path: '/api/v1/inventory/material-issues',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Idempotency-Key': failKey,
      },
      body: { ...issuePayload, warehouseId: 'non-existent-warehouse-99999' },
    });

    // 2nd request with corrected payload and same key succeeds immediately
    const res2 = await makeRequest({
      method: 'POST',
      path: '/api/v1/inventory/material-issues',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Idempotency-Key': failKey,
      },
      body: issuePayload,
    });

    recordTest(
      '18. Safe Key Release on 4xx Error & Immediate Retry',
      res1.status === 400 && res2.status === 201,
      `Failed attempt: ${res1.status}, Corrected attempt: ${res2.status}`
    );
  } catch (err: any) {
    recordTest('18. Safe Key Release on 4xx Error & Immediate Retry', false, undefined, err.message);
  }

  console.log('\n============================================================');
  console.log(`FINAL VERIFICATION SUMMARY: ${results.filter((r) => r.passed).length} / ${results.length} PASSED`);
  console.log('============================================================');

  const allPassed = results.every((r) => r.passed);
  process.exit(allPassed ? 0 : 1);
}

runVerification().catch((err) => {
  console.error('Verification script crashed:', err);
  process.exit(1);
});
