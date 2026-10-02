# SiteSync Pro

**Construction & Infrastructure Project Management Platform**

SiteSync Pro is being developed as a modular enterprise ERP for construction and infrastructure businesses. The platform is designed around project transaction traceability rather than isolated CRUD modules.

## Core business lifecycle

CRM → Tender → Estimation → BOQ → Contract → Project → WBS → Planning → Procurement → Store → Site Execution → Progress → Measurement → Billing → Cost Control → Finance → Management Analytics

## Supporting enterprise domains

- Organization & master data
- HRMS, attendance, workforce and payroll
- Fleet, equipment, fuel and maintenance
- QA/QC and inspections
- HSE, incidents, permits and risk
- Document control / EDMS
- Variations, claims and change control
- Mobile field operations, GPS and offline PWA
- AI assistance and enterprise integrations

## Technology

- React 19 + TypeScript
- Tailwind CSS
- Node.js + Express + TypeScript
- PostgreSQL
- Drizzle ORM / Drizzle Kit
- JWT + refresh tokens
- Zod validation
- Helmet + rate limiting
- Progressive Web App (PWA)
- Gemini integration through a governed AI layer

## Architecture principles

1. Configuration over hard-coded business rules.
2. Transactional data over fake/static production KPIs.
3. Server-side authorization for every protected action.
4. Maker-checker and approval controls for governed transactions.
5. Immutable source records where source integrity matters.
6. Auditability for critical changes.
7. Project/WBS/cost-code traceability across operational and commercial transactions.
8. AI recommends or drafts; humans authorize controlled actions.
9. Offline field work uses explicit sync and conflict handling.
10. Legacy compatibility is temporary and must not create competing sources of truth.

## Environments

DEMO, UAT, and PRODUCTION are separate deployment modes.

- DEMO may use explicitly enabled synthetic seed data.
- UAT and PRODUCTION must use real controlled data and explicit JWT secrets.
- Do not commit real credentials, API keys, database passwords, or deployment secrets.

## Local development

Prerequisites: Node.js and Bun/npm as appropriate for the repository scripts.

Install dependencies:

    bun install

Create an environment file from the template:

    copy .env.example .env

Configure the database and development secrets locally, then start:

    bun run dev

Build:

    bun run build

Type-check:

    bun run lint

Database commands:

    bun run db:generate
    bun run db:migrate

## ERP transformation documentation

See docs/ERP_TRANSFORMATION_AUDIT.md.

That document records the repository-grounded security, architecture, transaction-flow and UX transformation controls. Major refactors should follow it rather than introducing isolated feature changes that bypass the target ERP architecture.
