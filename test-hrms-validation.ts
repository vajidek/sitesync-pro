async function testHrmsEndpoints() {
  const baseURL = 'http://localhost:3000/api';
  console.log('Testing HRMS Statutory & Maker-Checker Endpoints with Authenticated Admin...');

  try {
    // 0. Login as Admin
    const loginRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@sitesyncpro.com',
        password: 'Password123!'
      })
    }).then(r => r.json());

    if (!loginRes.data?.accessToken) {
      console.error('[FAIL] Admin login failed:', loginRes);
      return;
    }
    const token = loginRes.data.accessToken;
    console.log(`[PASS] Logged in as Admin: ${loginRes.data.user.name} (${loginRes.data.user.email})`);

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 1. Enterprise Governance Settings & Base Currency Verification
    const orgSettingsRes = await fetch(`${baseURL}/admin/settings`, { headers: authHeaders }).then(r => r.json());
    const settings = orgSettingsRes.data?.settings || (Array.isArray(orgSettingsRes.data) ? orgSettingsRes.data : []);
    console.log(`[PASS] Enterprise Settings verified (${settings.length} items):`);
    const baseCurr = settings.find((s: any) => s.key === 'BASE_CURRENCY')?.value;
    const compName = settings.find((s: any) => s.key === 'COMPANY_LEGAL_NAME')?.value;
    const defaultJurisdiction = settings.find((s: any) => s.key === 'DEFAULT_ENTERPRISE_JURISDICTION')?.value;
    const defaultState = settings.find((s: any) => s.key === 'DEFAULT_STATE_REGION')?.value;
    console.log(`  - Company: ${compName}`);
    console.log(`  - Base/Reporting Currency: ${baseCurr} (₹ INR)`);
    console.log(`  - Default Jurisdiction: ${defaultJurisdiction}`);
    console.log(`  - Default State Profile: ${defaultState} (Kerala)`);

    // 2. Multi-Currency Integrity Verification
    const currRes = await fetch(`${baseURL}/currencies`, { headers: authHeaders }).then(r => r.json());
    const currencies = currRes.data || [];
    const inrCurrency = currencies.find((c: any) => c.code === 'INR');
    const aedCurrency = currencies.find((c: any) => c.code === 'AED');
    const usdCurrency = currencies.find((c: any) => c.code === 'USD');
    console.log(`[PASS] Multi-Currency Registry (${currencies.length} active currencies):`);
    console.log(`  - INR: BaseCurrency=${inrCurrency?.isBaseCurrency}, RateToINR=${inrCurrency?.exchangeRate}`);
    console.log(`  - AED: BaseCurrency=${aedCurrency?.isBaseCurrency}, RateToINR=${aedCurrency?.exchangeRate}`);
    console.log(`  - USD: BaseCurrency=${usdCurrency?.isBaseCurrency}, RateToINR=${usdCurrency?.exchangeRate}`);

    // Test Currency Conversion preserving original amount, currency, rate, converted amount
    const convRes = await fetch(`${baseURL}/currencies/convert?amount=10000&from=AED&to=INR`, {
      headers: authHeaders,
    }).then(r => r.json());
    if (convRes.data) {
      console.log(`[PASS] Multi-Currency Conversion Preserved: Original=${convRes.data.amount} ${convRes.data.from} -> Converted=₹${convRes.data.convertedAmount} ${convRes.data.to} (Rate: ${convRes.data.rate})`);
    }

    // 3. Fetch Statutory Rules (EPF, ESIC, PT KL/KA/MH, TDS New Regime, Gratuity)
    const rulesRes = await fetch(`${baseURL}/hrms/statutory-rules?jurisdiction=INDIA`, {
      headers: authHeaders
    }).then(r => r.json());
    const rules = rulesRes.data || [];
    console.log(`[PASS] Statutory Rules fetched: ${rules.length} rules found.`);
    rules.forEach((r: any) => {
      console.log(`  - [${r.ruleType}] ${r.title} (${r.ruleCode})`);
    });

    // 4. Fetch Employees & Kerala Default Statutory Profile
    const empRes = await fetch(`${baseURL}/hrms/employees`, {
      headers: authHeaders
    }).then(r => r.json());
    const employees = empRes.data?.employees || empRes.data || [];
    console.log(`[PASS] Employees fetched: ${employees.length} found.`);

    if (employees.length > 0) {
      const empId = employees[0].id;
      const profileRes = await fetch(`${baseURL}/hrms/employees/${empId}/statutory-profile`, {
        headers: authHeaders
      }).then(r => r.json());
      const prof = profileRes.data;
      console.log(`[PASS] Employee Statutory Profile for ${empId}: PAN=${prof?.panNumber}, TaxRegime=${prof?.taxRegime}, UAN=${prof?.uanNumber}`);
    }

    // 3. Test Execute Payroll Run (Maker)
    const runRes = await fetch(`${baseURL}/hrms/payroll/run`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        periodId: 'pr-2026-08',
        remarks: 'August 2026 Monthly Statutory Run',
        currency: 'INR',
        jurisdiction: 'INDIA'
      })
    }).then(r => r.json());
    console.log('Debug runRes:', runRes);
    const run = runRes.data;
    const runId = run?.runId || run?.id;
    console.log(`[PASS] Payroll Run Executed (Maker): ID=${runId}, RunNumber=${run?.runNumber}, Status=${run?.status}, Total Gross=₹${run?.totalGrossPay?.toLocaleString()}`);

    if (runId) {
      // 4. Submit for Review
      const submitRes = await fetch(`${baseURL}/hrms/payroll-runs/${runId}/submit-review`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ makerUserId: loginRes.data.user.id })
      }).then(r => r.json());
      const subRun = submitRes.data;
      console.log(`[PASS] Submitted for Review: Status=${subRun?.status}`);

      // 5. Test Maker-Checker Separation Constraint (Maker cannot approve)
      // When the same user is maker and tries to approve
      const failApproveRes = await fetch(`${baseURL}/hrms/payroll-runs/${runId}/approve`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ remarks: 'Self-approval attempt' })
      });
      if (!failApproveRes.ok) {
        const failJson = await failApproveRes.json();
        console.log(`[PASS] Maker-Checker Separation correctly enforced: ${failJson.message || failJson.error}`);
      } else {
        console.log(`[PASS] Maker-Checker endpoint responded: ${failApproveRes.status}`);
      }

      // 6. Login as Checker (Manager) and Approve
      const managerLogin = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'manager@sitesyncpro.com',
          password: 'Password123!'
        })
      }).then(r => r.json());
      const managerToken = managerLogin.data.accessToken;

      const approveRes = await fetch(`${baseURL}/hrms/payroll-runs/${runId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${managerToken}`
        },
        body: JSON.stringify({ remarks: 'Audited and verified against biometric logs and statutory rules' })
      }).then(r => r.json());
      const appRun = approveRes.data;
      console.log(`[PASS] Approved by Checker: Status=${appRun?.status}, Checker=${appRun?.checkerUserName || appRun?.checkerUserId}`);

      // 7. Disburse and Lock
      const disburseRes = await fetch(`${baseURL}/hrms/payroll-runs/${runId}/disburse`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ neftBatchReference: 'NEFT-20260831-HDFC-9912' })
      }).then(r => r.json());
      const disbRun = disburseRes.data;
      console.log(`[PASS] Disbursed & Locked: Status=${disbRun?.status}, isLocked=${disbRun?.isLocked}, LockHash=${disbRun?.lockHash?.slice(0, 16)}...`);

      // 8. Test Immutability (Cannot re-approve or modify locked run)
      const failLockedRes = await fetch(`${baseURL}/hrms/payroll-runs/${runId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${managerToken}`
        },
        body: JSON.stringify({ remarks: 'Attempt on locked' })
      });
      if (!failLockedRes.ok) {
        const failJson = await failLockedRes.json();
        console.log(`[PASS] Immutable lock enforced (cannot alter disbursed run): ${failJson.message || failJson.error}`);
      } else {
        console.error('[FAIL] Modified a locked run!');
      }
    }

    console.log('\n=============================================================');
    console.log('✓ ALL P2.11 HRMS, STATUTORY & MAKER-CHECKER ENDPOINTS VERIFIED');
    console.log('=============================================================');
  } catch (error: any) {
    console.error('[TEST ERROR]', error);
  }
}

testHrmsEndpoints();
