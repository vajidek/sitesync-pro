# SiteSync Pro Enterprise ERP - Production Deployment & DevOps Guide

This guide details the operational procedures, environment configurations, database migration protocols, first administrator onboarding sequence, backup/disaster recovery strategies, and smoke-test checklists required to deploy and maintain SiteSync Pro in an enterprise production environment.

---

## 1. Production Architecture Overview

SiteSync Pro uses a hybrid Clean Architecture:
- **Client Tier:** React 19 SPA bundled via Vite with Tailwind CSS.
- **Application Tier:** Node.js Express server running behind an Nginx reverse proxy or Google Cloud Run / AWS ECS container.
- **Database Tier:** Managed PostgreSQL 15+ (Cloud SQL, AWS RDS, or dedicated cluster) with connection pooling.
- **Storage Tier:** S3-compatible private object storage for bills, invoices, drawings, and certificates.

---

## 2. Environment Variables & Production Configuration

Configure these environment variables in your container runtime or secret manager (e.g., Google Secret Manager, AWS Secrets Manager, HashiCorp Vault):

| Variable | Required | Default / Fallback | Description & Security Guidelines |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | **Yes** | `production` | Set to `production` to disable dev tools and enable static serving. |
| `PORT` | No | `3000` | Port on which the Node server listens. |
| `DATABASE_URL` | **Yes** | - | PostgreSQL connection URI (`postgresql://user:password@host:5432/dbname?sslmode=require`). |
| `SQL_HOST` | Conditional | - | Direct DB host for connection pool (`127.0.0.1` or Cloud SQL proxy). |
| `SQL_USER` | Conditional | - | Database username. |
| `SQL_PASSWORD` | Conditional | - | Database password (must be rotated periodically). |
| `SQL_DB_NAME` | Conditional | - | Database name (`sitesyncpro`). |
| `JWT_SECRET` | **Yes** | - | 256-bit cryptographically secure string for signing access tokens. |
| `JWT_REFRESH_SECRET` | **Yes** | - | 256-bit secure secret for refresh tokens (must differ from `JWT_SECRET`). |
| `JWT_EXPIRES_IN` | No | `1h` | Access token lifespan (recommended: 15m to 1h). |
| `JWT_REFRESH_EXPIRES_IN`| No | `7d` | Refresh token lifespan (recommended: 7d with revocation). |
| `STRICT_PROD_SECRETS` | **Yes** | `true` | When set to `true`, startup aborts if default dev secrets are detected. |
| `CORS_ORIGIN` | No | `https://erp.yourdomain.com` | Allowed CORS origins for API requests. |
| `STORAGE_BUCKET` | Optional | `sitesync-prod-attachments`| S3/GCS bucket name for uploaded bills and documents. |
| `LOG_LEVEL` | No | `info` | Winston log severity: `error`, `warn`, `info`, or `debug`. |

---

## 3. Database Production Readiness & Migration Workflow

### Step 3.1: Fresh Database Initialization
Connect to your PostgreSQL 15+ instance with an administrative user and create the database:
```sql
CREATE DATABASE sitesyncpro ENCODING 'UTF8';
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Step 3.2: Safe Non-Destructive Production Migration Protocol
> **Critical Production Rule:** Never execute destructive schema push or automated drop synchronization on live production databases. All migrations must follow the 4-phase safe procedure:

1. **Pre-Migration Snapshot (MANDATORY):**
   ```bash
   pg_dump -Fc -h $SQL_HOST -U $SQL_USER -d sitesyncpro > /backups/pre_migration_$(date +%Y%m%d_%H%M%S).dump
   ```
2. **Review Migration SQL:**
   Generate and inspect versioned migration files to verify no columns or tables are unintentionally dropped:
   ```bash
   npx drizzle-kit generate
   # Inspect generated SQL in migrations/ directory before execution
   ```
3. **Controlled Execution:**
   Apply the reviewed migrations in an explicit transaction block:
   ```bash
   npx drizzle-kit migrate
   ```
4. **Post-Migration Verification & Rollback Strategy:**
   - Execute verification query: verify table presence and foreign keys via `GET /api/health`.
   - **Rollback Procedure:** If an error occurs, cancel transaction or restore immediately from the pre-migration dump:
     ```bash
     pg_restore --clean --if-exists -h $SQL_HOST -U $SQL_USER -d sitesyncpro /backups/pre_migration_*.dump
     ```

### Step 3.3: Production Seed Protocol
Production systems must **never** be populated with artificial demo transactions (dummy expenses, test POs, fake invoices).
- **Allowed Seed Data:** Master data catalogs (Chart of Accounts, Currencies, Roles, Organization Structure, Standard Workflow Templates).
- **Prohibited in Production:** Seed expense claims, dummy employees, synthetic vendor invoices.

---

## 4. First Administrator Onboarding Sequence (17 Steps)

Follow this exact sequence on initial system startup to configure your enterprise tenant cleanly:

1. **Database Ready:** Verify connection via `GET /api/health`.
2. **Launch Application:** Navigate to web root; system defaults to clean state.
3. **Initial Admin Setup:** Create the primary Super Admin account (`ADMIN` role with `ALL` permissions).
4. **Company Profile:** Enter legal corporate entity (e.g., *SiteSync Infrastructure Holdings Ltd.*, Tax ID, Legal Address).
5. **Organization Hierarchy:** Define operating branches, divisions, and regional sites (e.g., HQ, Calicut Yard, Dubai Pier).
6. **Departments:** Configure core business units (Engineering, Safety/HSE, Procurement, Accounts, HR, Stores).
7. **Role Permissions:** Review and lock the RBAC matrix (Admin, Manager, Incharge, Supervisor, Storekeeper, Worker).
8. **User Directory:** Invite department heads and key staff with assigned roles and mobile phone numbers.
9. **Chart of Accounts:** Verify 5-tier GL tree (Assets: `1000`, Liabilities: `2000`, Equity: `3000`, Revenue: `4000`, Expenses: `5000`).
10. **Fiscal Calendar:** Set fiscal start date (e.g., Jan 1 or April 1) and active currency (USD, AED, INR, SAR).
11. **Cost Centers & Codes:** Set up project cost centers (e.g., `CC-CIVIL-01`, `CC-MEP-02`, `CC-HSE-01`).
12. **Approval Workflows:** Configure threshold rules (e.g., Expenses < ₹1,000 need Supervisor; > ₹1,000 require Finance).
13. **Expense Categories:** Define claimable categories (Site Consumables, Travel, Equipment Fuel, Safety Gear).
14. **Active Projects:** Create client projects with WBS budget allocations and contract values.
15. **Warehouses & Stores:** Register central and site store locations with bin codes.
16. **Approved Vendors:** Onboard pre-qualified suppliers and subcontractors.
17. **Handover & Lock:** Change initial bootstrap passwords and confirm audit log tracking is active.

---

## 5. Backup & Disaster Recovery Strategy

> **Crucial Notice:** Application code does not replace database-level backups. Backups must be configured at the cloud infrastructure or database management level.

### Automated Daily Snapshots
- Configure automated full daily backups using `pg_dump` or cloud provider snapshots (e.g., Google Cloud SQL Automated Backups, AWS RDS Automated Backups).
- **Command:**
  ```bash
  pg_dump -Fc -h $DB_HOST -U $DB_USER sitesyncpro > /backups/sitesync_$(date +%Y%m%d_%H%M%S).dump
  ```

### Point-in-Time Recovery (PITR)
- Enable PostgreSQL Write-Ahead Log (WAL) archiving.
- Retain WAL archives for a minimum of **14 days** to allow restoration to any precise minute prior to accidental data deletion or hardware failure.

### Restore Drill Procedure
Execute a test restoration drill quarterly to a staging database:
```bash
pg_restore -h $STAGING_DB_HOST -U $DB_USER -d sitesync_restore_test /backups/latest.dump
```

---

## 6. Private File Storage Guidelines

In production, bills, drawings, and payslips must be saved in private storage:
- **Storage Type:** Private bucket (AWS S3, Google Cloud Storage, or MinIO).
- **Access Protocol:** Direct public bucket access is prohibited. Files must be served via time-limited pre-signed URLs (e.g., 15-minute expiration) generated only for authenticated sessions.
- **Validation Rules Enforced:**
  - Maximum upload size: **25 MB** per attachment.
  - Allowed file types: PDF, PNG, JPG, WebP, XLSX, DOCX, CSV.
  - File titles: Sanitized to strip path traversal sequences (`..`, `/`, `\`).
  - Executable blacklist: `.exe`, `.bat`, `.sh`, `.php`, `.py`, `.dll` strictly blocked.

---

## 7. Background Jobs & External Dependencies Matrix

| Subsystem | Immediate Status | Scheduled Job / Cron Requirement | External Infrastructure Dependency |
| :--- | :---: | :--- | :--- |
| **General Ledger & AP/AR** | Ready | None (Event-driven synchronous posting) | Managed PostgreSQL |
| **Expense & Petty Cash** | Ready | None (Real-time approval transitions) | Managed PostgreSQL |
| **Procurement 3-Way Match** | Ready | None (Triggered on GRN/Invoice verification)| Managed PostgreSQL |
| **HRMS Attendance & Biometrics** | Ready | Daily night cron for OT & late-punch calculations | Biometric device webhook/sync |
| **EAM Preventive Maintenance** | Functional (B) | Weekly cron for automated Work Order generation | Background cron worker |
| **IoT / SCADA Telemetry** | Functional (B) | Continuous streaming ingestion | MQTT broker or WebSocket gateway |
| **Document Anti-Virus Scanning** | Ready | ClamAV / Cloud Storage Scanner on upload | Cloud Antivirus API |

---

## 8. Release Smoke-Test Checklist

Prior to signing off a production release, run this end-to-end verification sequence:

- [ ] **1. Authentication:** Log in with admin credentials; verify JWT issuance and CSRF protection.
- [ ] **2. Navigation:** Verify landing workspace loads without JavaScript console errors.
- [ ] **3. Employee Creation:** Create a sample worker; verify employee code format and project assignment.
- [ ] **4. Expense Lifecycle:**
  - [ ] Submit ₹200 site consumable claim with bill attachment.
  - [ ] Supervisor logs in and approves claim.
  - [ ] Finance reviews claim, specifies Debit `5010` and Credit `1010`.
  - [ ] Finance disburses payment; verify balanced JV voucher in General Ledger.
- [ ] **5. Procurement Lifecycle:**
  - [ ] Raise Material Requisition $\to$ PO $\to$ GRN.
  - [ ] Complete 3-way match; verify AP invoice creation.
- [ ] **6. Financial Reports:** Run Trial Balance; confirm Dr == Cr with zero variance.
- [ ] **7. Mobile Layout:** Inspect at 375px; confirm punch-in, bill upload, and approvals are responsive.
- [ ] **8. Audit Sentinel:** Confirm all test operations are recorded with operator name, timestamp, and entity ID.
- [ ] **9. Health Endpoint:** Query `GET /api/health`; ensure `status: "ok"` response.

---

## 9. Rollback & Troubleshooting Protocol

If a production incident occurs during deployment:
1. **Container Rollback:** Revert container image tag to previous stable build (e.g., `docker service update --image sitesync-pro:v1.9.4`).
2. **Database Rollback:** If migration caused schema issues, revert using migration rollback scripts or restore point-in-time snapshot.
3. **Troubleshooting Steps:**
   - Database connection timeout: Check PostgreSQL pool utilization and host security group rules.
   - 401 Unauthorized errors: Verify `JWT_SECRET` matches across multiple application instances.
   - CORS errors: Confirm `CORS_ORIGIN` matches production client URL scheme and port.

---

## 10. Master 21-Step Production Deployment Sequence

Follow this end-to-end procedural sequence for real enterprise go-live:

1. **Infrastructure Provisioning:** Deploy VPC, private subnets, security groups, and container orchestrator (Cloud Run / ECS / K8s).
2. **Database Creation:** Provision managed PostgreSQL 15+ instance with SSD storage, connection pooling, and automated failover.
3. **Backup Configuration:** Configure automated nightly snapshots and 14-day PITR Write-Ahead Log (WAL) retention in cloud console.
4. **Migration Generation & Review:** Generate migrations via `npm run db:generate` and audit SQL files in `drizzle/` for non-destructive operations.
5. **Staging Migration:** Apply migrations to staging PostgreSQL via `npm run db:migrate` and verify integrity.
6. **Production Migration:** Run pre-migration snapshot, then apply migrations to production via `npm run db:migrate`.
7. **Environment Variables:** Set production environment variables in container runtime (`NODE_ENV=production`, `PORT=3000`, `DATABASE_URL`, `CORS_ORIGIN`).
8. **Secret Generation:** Inject 256-bit cryptographically random strings for `JWT_SECRET` and `JWT_REFRESH_SECRET`, and set `STRICT_PROD_SECRETS=true`.
9. **Object Storage:** Create private bucket (S3/GCS) with IAM least-privilege service account for document/bill uploads.
10. **Application Deployment:** Build and deploy production container image (`npm run build` -> `npm start`).
11. **Reverse Proxy & TLS:** Configure Nginx or Cloud Load Balancer with SSL/TLS termination and HSTS headers.
12. **Health Check:** Verify system health via `GET /api/health` and `GET /api/info`.
13. **First Administrator Setup:** Log in and configure the primary Super Admin account (`ADMIN` role with `ALL` permissions).
14. **Company Setup:** Register legal corporate entity (Apex Global / Infrastructure Division, Tax ID, Corporate Address).
15. **Organization Hierarchy:** Define operating branches, divisions, and site hubs (HQ, Yard, Regional Pier).
16. **RBAC & Security Setup:** Verify the 8 core enterprise roles and review permission policies.
17. **Finance Setup:** Verify Chart of Accounts (Assets, Liabilities, Equity, Revenue, Expenses) and active currencies (USD, AED, INR, SAR).
18. **Workflow Rules Setup:** Configure tiered approval thresholds for purchase orders, expenses, and cash advances.
19. **Project & Cost Center Setup:** Create client projects with WBS budget allocations and linked cost centers.
20. **User Acceptance Testing (UAT):** Conduct user acceptance smoke tests across Employee, Supervisor, Finance, Store, and PM personas.
21. **Go-Live & Operational Handover:** Rotate temporary bootstrap credentials, verify audit log sentinel is active, and open access to business users.
