# SiteSync Pro Enterprise ERP - Administrator Guide

## Administrative Functions

### 1. User Account Management (`/api/users`)
- Administrators can create, edit, lock, or deactivate user accounts.
- Assign users to specific roles (`ADMIN`, `MANAGER`, `INCHARGE`, `SUPERVISOR`, `STORE_KEEPER`, `DRIVER`, `OPERATOR`, `WORKER`) and assign them to specific projects or sites.

### 2. Role Permission Configuration (`/api/roles`)
- Define granular permissions for each module (Read, Create, Edit, Delete, Approve, Export).
- Enforce segregation of duties (e.g., storekeeper cannot approve purchase requisitions).

### 3. Audit Trail Inspection (`/api/audit-logs`)
- Every critical ERP action (login attempts, PO approvals, stock adjustments, salary generation) is logged with user ID, action timestamp, IP address, and user agent.

### 4. Database Schema Inspection
- Inspect active Prisma database schema and model definitions directly from the **Schema Inspector** tab in the admin panel.
