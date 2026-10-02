# SiteSync Pro ERP Build Checkpoint

This file is a non-functional engineering checkpoint. It exists to prevent repeated work after chat/session interruptions.

## Working rules
- Always inspect current `main` before editing.
- Never resume an old/stale branch without comparing it with current `main`.
- Never repeat a completed fix unless current code proves it is still required.
- Use small, reviewable branches and merge only after comparing against current `main`.
- Preserve existing functionality unless a verified defect or architecture conflict requires change.
- Do not introduce synthetic production data, fake KPI values, fake identities, or hidden authorization fallbacks.

## Completed ERP hardening batches
- Authentication / authorization trust hardening — completed in repository history.
- Commercial persistence: tenders, rate analyses, subcontracts, subcontract bills, variation orders, client IPCs — merged.
- Procurement integrity: explicit transaction context, approval lifecycle, maker-checker protections — merged.
- Procurement route canonicalization: removed duplicate shadowed Phase-56 transaction routes — merged.
- Enterprise procurement governance: demo-only seed isolation and action-specific roles — merged.
- WBS/BOQ demo seed isolation — merged.
- Contract lifecycle + maker-checker controls — merged.
- Finance journal atomicity + authenticated actor audit — merged.
- Daily Progress project/site validation + verification/approval maker-checker — merged.
- Source-driven Project Cost Control / EVM — merged.
- Project Controls runtime project-context hardening — merged.

## Current next focus
Unify legacy Project Commercial Cost Control presentation with the source-driven cost-control engine without breaking the existing UI contract.

## Safety
The checkpoint must not contain secrets, credentials, API keys, real employee data, or production database contents.
