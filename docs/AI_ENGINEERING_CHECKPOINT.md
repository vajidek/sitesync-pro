# SiteSync Pro — AI Engineering Checkpoint

Updated: 2026-10-02

## Rule for continuation
Before any new implementation, read this file. Do not repeat a merged fix. Continue from the first unfinished item.

## Completed / merged
- PR #6 — Commercial transaction persistence foundation and lifecycle validation.
- PR #7 — Legacy procurement transaction-context hardening.
- PR #8 — Enterprise procurement governance: demo seed isolation, actor binding, action roles.
- PR #9 — Procurement route canonicalization; removed shadowed duplicate transaction paths.
- PR #14 — WBS/BOQ automatic demo-seed isolation.
- PR #15 — Contract lifecycle + variation/EOT maker-checker controls.
- PR #16 — Finance journal atomic posting + authenticated actor audit.
- PR #17 — Daily progress project/site validation + maker-checker lifecycle.
- PR #18 — Cost control source-driven EVM; removed synthetic budgets/burn-rate metrics.
- PR #19 — Project Controls explicit project-context requirement outside DEMO.
- PR #66 — Auth canonical token storage, removal of browser role authority, safe auth-state cleanup, production login-password guard.
- PR #68 — Project Commercial Cost Control UI aligned to canonical auth storage.
- PR #69 — Cost Control net material returns and WBS material/labour allocation.
- PR #70 — Billing core: atomic finance posting and trustworthy measurement valuation.
- PR #71 — RA Billing: server-authoritative contract deductions and removal of synthetic UI controls.
- PR #77 — Payroll: loan recovery + payslip calculation made atomic; rollback-safe payroll persistence.
- PR #78 — Store: central stock ledger preserves Project/WBS/BOQ/Cost Code allocation context.
- PR #79 — Store: purchase requests carry WBS/BOQ/Cost Code traceability with migration.
- PR #80 — Cost Control: material actual allocation consumes the central stock transaction ledger.
- PR #81 — QA/QC: inspection and NCR transaction integrity with unique numbering.
- PR #82 — QA/QC: NCR to CAPA transaction integrity with audit and unique numbering.
- PR #83 — QA/QC: atomic ITP checklist persistence and removal of synthetic QA/QC input defaults.
- PR #84 — HSE: incident/PTW actor binding, safety validation, maker-checker permit approval, and removal of synthetic safety-data defaults.
- PR #85 — HSE: Risk Assessment/JSA actor binding, controlled approval lifecycle, maker-checker protection, audit history, unique document numbering, and duplicate PTW route cleanup.
- PR #86 — Documents/CDE: versioning, checkout, review/approval, actor binding, atomic document writes, revision/checkout uniqueness, EDMS initialization fail-closed behavior, and canonical auth token usage.
- PR #87 — Claims/Variations: contract change traceability, first-class claims, CDE evidence linkage, correct variation/EOT commercial math, privileged claim workflow roles, and Claims workspace.
- PR #88 — UI/UX: remove production dashboard demo data, enforce truthful sync state, generic SiteSync Pro branding, role-workspace restrictions, dashboard actor binding, and orphan duplicate workspace code cleanup.

## Current status
- HR master-data hardening: completed in main through authenticated actor propagation, canonical employee/leave/salary/loan writes, configurable numbering, and removal of production fallback identities/codes.
- HR loan recovery failure semantics: completed in main. Payroll recovery failures are fail-closed, and payroll recovery/payslip/run persistence is atomic.
- Store → Site → BOQ/Cost Code traceability: substantially hardened. Central stock ledger now stores allocation context; purchase requests carry allocation fields; Cost Control consumes stock-ledger allocations. Remaining work is UI/UX and any transaction types not yet mapped to the same allocation chain.
- Do not repeat the completed items above.

## Next unfinished area
1. CI/testing — compile/test coverage and deployment gates.
2. Remaining HSE modules — only where new evidence shows unfinished transaction integrity beyond Incident/Near-Miss/Risk/JSA/PTW.

## Continuation marker
Last verified main merge: PR #88. Next work should begin at CI/testing; do not restart Store/Cost/HR/Finance/QAQC/HSE Risk-JSA/Documents/CDE/Claims-Variations/UI hardening unless new evidence shows a regression.

## Safe marking rule
Prefer this checkpoint file. It does not affect ERP runtime behavior. Use source-code comments only when truly useful.

## Product constraints
- Generic visible terminology; do not expose water-domain customer-specific names in product UI unless explicitly requested.
- Business rules, approvals, roles, numbering, calendars, policies and workflows must be configurable/data-driven.
- No synthetic production KPIs, fake actors, fake project IDs or hidden fallback IDs.
- Financial, contractual and approval actions must be traceable and auditable.