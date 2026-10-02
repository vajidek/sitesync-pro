# SiteSync Pro Enterprise ERP - Database ER Diagram & Schema Specification

## Overview
The SiteSync Pro database is powered by PostgreSQL with Prisma ORM 6. Detailed model specifications are maintained in `/prisma/schema.prisma`.

## Entity Relationships Summary

```
+----------------+        1:N       +----------------+        1:N       +----------------+
|    Company     | ---------------- |     Branch     | ---------------- |   Department   |
+----------------+                  +----------------+                  +----------------+
        |                                                                       |
        | 1:N                                                                   | 1:N
        v                                                                       v
+----------------+        1:N       +----------------+        1:N       +----------------+
|    Project     | ---------------- |      Site      | ---------------- |   Warehouse    |
+----------------+                  +----------------+                  +----------------+
        |                                   |                                   |
        | 1:N                               | 1:N                               | 1:N
        v                                   v                                   v
+----------------+                  +----------------+                  +----------------+
| ProjectMember  |                  |   Equipment    |                  |     Stock      |
+----------------+                  +----------------+                  +----------------+

                                                                                |
                                                                                | 1:N
                                                                                v
+----------------+        1:1       +----------------+        1:N       +----------------+
|      User      | ---------------- |    Employee    | ---------------- |    Vehicle     |
+----------------+                  +----------------+                  +----------------+
```

## Primary Model Definitions

### 1. User & Identity (`User`, `Role`, `Permission`, `RolePermission`, `RefreshToken`)
- Stores user credentials (bcrypt hashed), RBAC role mappings, permission flags, and active JWT refresh tokens.

### 2. Organizational (`Company`, `Branch`, `Department`, `Designation`)
- Multi-company and multi-branch structural organization for enterprise scaling.

### 3. HR & Employee Master (`Employee`)
- Employee codes, mobile, emergency contacts, DOJ, designation, salary structures, manager relationships.

### 4. Construction Projects (`Project`, `ProjectMember`, `Site`, `Contractor`)
- Project codes, GPS coordinates, timelines, budget allocations, site assignments, and sub-contractors.

### 5. Fleet & Machinery (`Equipment`, `Vehicle`)
- Heavy plant (excavators, cranes, batching plants) and transport vehicles with maintenance logs, fuel types, and driver mappings.

### 6. Procurement & Material Management (`Material`, `Warehouse`, `Stock`, `StockTransaction`, `Vendor`)
- Material master, stock levels across site warehouses, stock movement audit trail, and approved vendor directory.
