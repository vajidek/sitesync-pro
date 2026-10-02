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

## Current unfinished area
1. Authentication storage contract cleanup:
   - backend JWT /api/auth/me validation already exists; do not reimplement.
   - frontend stores multiple token aliases and role aliases.
   - centralize to canonical auth storage without breaking request interception.
   - DEMO role switch must stay DEMO-only.
2. Project Commercial Cost Control UI compatibility with the source-driven engine.
3. Then continue with Store → Site Execution → BOQ/Cost Code traceability; Measurement → Billing → Finance; HR/Attendance/Payroll; QA/QC; HSE; Documents/CDE; Claims; UI/UX; CI/testing.

## Safe marking rule
Prefer this checkpoint file. It does not affect ERP runtime behavior. Use source-code comments only when truly useful.

## Product constraints
- Generic visible terminology; do not expose water-domain customer-specific names in product UI unless explicitly requested.
- Business rules, approvals, roles, numbering, calendars, policies and workflows must be configurable/data-driven.
- No synthetic production KPIs, fake actors, fake project IDs or hidden fallback IDs.
- Financial, contractual and approval actions must be traceable and auditable.