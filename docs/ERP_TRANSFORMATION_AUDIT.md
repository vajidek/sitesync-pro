# SiteSync Pro — ERP Transformation Audit & Control Baseline

## Purpose

This document records the repository-grounded baseline for transforming SiteSync Pro into the target Construction & Infrastructure Project Management Platform / enterprise ERP. It is an implementation control document, not a claim that the existing system is production-ready.

The transformation must preserve useful existing work, remove unsafe or misleading behavior, and connect modules through real transactional data.

## Target business spine

CRM → Tender → Estimation → BOQ → Contract → Project → WBS → Planning → Procurement → Store → Site Execution → Progress → Measurement → Billing → Cost Control → Finance → Management Analytics

Supporting chains:

HR → Attendance → Payroll → Labour Cost

Equipment/Fleet → Fuel → Maintenance → Equipment Cost

QA/QC + HSE + Documents/CDE + Variations/Claims + Asset Management + AI/PWA are cross-cutting controls.

## Repository baseline observed

- Repository: vajidek/sitesync-pro
- Default branch: main
- Current tree: 645 paths
- Source tree: 565 paths
- Backend: 48 service files, 52 route files, 47 controller files
- Drizzle runtime schema: 636 pgTable declarations
- Prisma schema: 29 models, 9 enums
- Runtime DB adapter currently uses Drizzle ORM + node-postgres.
- package.json contains Drizzle/pg dependencies but no Prisma runtime dependency.

## P0 risks requiring controlled remediation

### 1. Database source-of-truth conflict

Runtime code uses Drizzle while a separate Prisma schema also exists. The Drizzle schema is very large and contains duplicate SQL table declarations for multiple procurement tables. This creates schema-drift and migration-governance risk.

Control: establish one authoritative runtime schema/migration system after a parity inventory. Do not delete the Prisma schema or Drizzle definitions blindly; reconcile them first.

### 2. Production authentication secret fallback

The current environment configuration contains deterministic default JWT access/refresh secrets. Production can continue with those defaults unless a strict flag is separately enabled.

Control: production/UAT must require externally supplied cryptographically random secrets. Demo/development may use process-local development fallbacks.

### 3. Automatic demo user seeding

The authentication repository automatically inserts demo users, including a shared default password, without consistently applying the environment guard intended to prevent demo data in UAT/production.

Control: automatic demo user seeding is allowed only when the demo-seed policy permits it. UAT/production must rely on controlled provisioning.

### 4. Simulated biometric attendance

The HRMS service generates synthetic eSSL punch records when a sync request contains no records.

Control: no synthetic biometric punches outside an explicitly enabled demo environment. Production sync must come from the configured integration/device adapter.

### 5. Demo/static KPIs and workspace data

Workspace code contains hardcoded demonstration projects, workforce, inventory, machinery, and KPI values.

Control: production dashboards and KPIs must be computed from transactional database facts with source, formula, period and drill-down. Demo data must be isolated and visibly marked as demo.

### 6. Authorization consistency

Authentication/RBAC foundations exist, including permission checks and workflow governance, but route-level access is not consistently permission-driven and some admin paths depend on role checks or broad authenticated access.

Control: authorization must be enforced server-side at action and resource scope, with least privilege and project/company/department scope where applicable.

### 7. Workflow governance has hardcoded policy elements

The workflow engine is substantially database-driven, including maker-checker, delegation, scope and thresholds. It also contains hardcoded role normalization and monetary threshold logic.

Control: move business thresholds, approval tiers, role hierarchy and routing rules into governed configuration/master data. No magic business numbers in code.

### 8. Legacy/duplicate procurement paths

The repository contains active procurement services plus a legacy procurement adapter and multiple route aliases pointing to overlapping routers.

Control: identify the authoritative procurement transaction tables/services, preserve compatibility temporarily, then remove duplicate write paths after migration parity is verified.

## P1 architecture and UX work

- Consolidate duplicate navigation/module entry points without removing required capabilities.
- Replace hardcoded master-data arrays in operational screens with authoritative APIs.
- Make company/currency/project/site context server-authoritative rather than embedding sample IDs or regional assumptions.
- Complete traceability across Project + Contract + BOQ + WBS + Cost Code.
- Connect BOQ → Procurement → Store → Site → Progress → Measurement → Billing → Cost.
- Ensure financial, payroll, inventory and contractual transactions use transaction boundaries and idempotency where required.
- Standardize Route → Controller → Service → Repository → DB boundaries.
- Improve field UX so site users can complete daily work with minimal typing.
- Keep destructive actions explicit, scoped and auditable.
- Make mobile/PWA workflows resilient to offline work and sync conflicts.
- Keep water-infrastructure capability internally supported while keeping visible terminology generic unless explicitly authorized.

## Target ERP design rules

1. Configuration over hard-coding.
2. Transactional truth over mock/static dashboard data.
3. Immutable raw records where source integrity matters.
4. Maker-checker / approval separation for controlled transactions.
5. Every critical change has actor, timestamp, reason and audit trail.
6. Every project transaction carries project/WBS/cost context where applicable.
7. A successful UI action is not trusted until server authorization and validation succeed.
8. AI may recommend or draft; it must not silently approve, post, certify or bypass authorization.
9. Do not create duplicate master records when an authoritative master already exists.
10. Preserve useful legacy compatibility only until its replacement is verified.

## Implementation order

### Phase A — Security & foundation
- Production/UAT secret hardening
- Demo-seed isolation
- Biometric simulation isolation
- Authentication query hardening
- Authorization consistency review
- DB source-of-truth/parity inventory

### Phase B — Transaction backbone
- Contract
- Estimate/rate analysis
- BOQ/WBS/cost-code integration
- Procurement/store traceability
- Measurement/billing
- Cost control/EVM

### Phase C — Execution
- Planning/scheduling
- Site/DPR
- Labour/attendance
- Fleet/equipment
- QA/QC
- HSE

### Phase D — Enterprise controls
- Documents/CDE
- Variations/claims
- Finance integration/cashflow
- Analytics and management reporting
- AI/document intelligence
- Offline/PWA hardening

## Definition of done

A module is not considered complete because a screen exists. Completion requires the relevant database model/migration, backend service/API, authorization, business rules, workflow, validation, auditability, UI, error handling, tests, responsive/mobile behavior, and cross-module integration.

## Current transformation status

The repository has completed the first controlled hardening and ERP-truth pass without a blind rewrite.

### Completed controls

- Production/UAT authentication secrets now fail closed when explicit secrets are missing.
- DEMO synthetic data seeding is isolated for authentication, HRMS, finance, project controls, procurement, WBS/BOQ and loans.
- Static dashboard/navigation counters and attendance states that implied real operational records were removed or neutralized.
- Employee-expense API endpoints are authenticated and controlled actions use authenticated actors with maker-checker/lifecycle validation.
- Master Data and Commercial/Tender/Contract mutation paths received server-side authentication/role hardening.
- Duplicate procurement transaction route registrations were removed so legacy handlers cannot shadow the enterprise transaction path.
- Contract status transitions, variation approvals and extension approvals now enforce state/lifecycle controls and maker-checker separation.
- Finance journal posting now validates balanced double-entry lines, referenced chart-of-account codes and atomic journal/GL/balance updates.
- Cost Control/EVM was converted from synthetic category/burn-rate calculations to transaction-driven project economics with transparent WBS allocation status and source-document drill-down.
- Project-linked labour allocations are included as actual labour cost; unallocated payroll is not guessed into project cost.
- HRMS payroll approval/disbursement/hold/unhold, loan approval and attendance finalization actions are bound to authenticated actors.
- Raw biometric punch access is restricted and the raw punch persistence path remains append-only.
- Payroll disbursement no longer generates a fake bank reference outside DEMO and no longer marks payroll as paid when Finance journal posting fails.
- Loan demo fixtures are disabled outside DEMO and loan request workflow history uses the authenticated applicant identity.
- Technical schema inspection is confined to the administrator workspace and the About/system navigation no longer renders schema diagnostics.

### Remaining ERP backbone work

1. Reconcile duplicate Drizzle/Prisma schema definitions into one authoritative migration strategy.
2. Complete Contract → BOQ → WBS → Cost Code linkage and enforce foreign-key/resource validity at all transaction boundaries.
3. Complete BOQ → Procurement → Store → Site → Progress → Measurement → Billing → Cost → Finance traceability.
4. Complete QA/QC, HSE, Document Control/CDE and Variations/Claims as governed transactional domains.
5. Replace remaining organization-specific defaults and hardcoded business rules with configuration/master data.
6. Complete planning/schedule baseline, resource loading and true time-phased PV/EV.
7. Complete cashflow, project profitability and management analytics from authoritative ledgers.
8. Harden offline/PWA synchronization, conflict handling, audit history and field UX.
9. Add repository/build/route/integration regression coverage before production release.

No module should be marked production-complete until the Definition of Done above is satisfied.
