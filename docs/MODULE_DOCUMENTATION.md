# SiteSync Pro Enterprise ERP - Core Module Specifications

## Overview
SiteSync Pro incorporates 8 integrated enterprise modules designed for heavy construction, mechanical contracting, and infrastructure engineering.

## Integrated Modules Summary

### 1. Executive Analytics & Role Dashboard
- Multi-role switching (Admin, Manager, Incharge, Supervisor, Store Keeper, Driver, Operator, Worker).
- Live KPIs: Active mega projects, project completion %, equipment utilization rate, workforce present, monthly expenditure.
- Cross-module alert feed (Low stock, maintenance due, pending approvals).

### 2. Project & Site Management
- WBS (Work Breakdown Structure) milestone tracking.
- Site location mapping with GPS coordinates.
- Daily Progress Reports (DPR) and site execution logs.

### 3. Plant, Machinery & Fleet Management
- Heavy equipment (Excavators, Tower Cranes, Transit Mixers, Hydra Cranes).
- Real-time status (Available, In Use, Maintenance, Repair).
- Fuel consumption tracking, odometer logs, and driver/operator assignments.

### 4. Inventory, Warehouse & Material Logistics
- Multi-warehouse material stock tracking.
- Stock transactions (Inward purchase, site issue, inter-warehouse transfer, return, damage).
- Min/Max stock reorder triggers and QR/Barcode scanning integration.

### 5. Enterprise HR & Payroll Module
- Employee master directory with photo, mobile, emergency contacts, DOJ, and role details.
- Daily attendance tracking (Present, Late, Absent, OT hours).
- Monthly automated payroll calculator (Base salary, OT allowance, tax deductions, net pay).

### 6. Procurement, BOQ, Tender & Vendor Management
- Vendor master database with GSTIN, PAN, bank details, rating, and credit period.
- Purchase Requisitions (PR), Requests for Quotation (RFQ), Comparative Statements, and Purchase Orders (PO).
- Measurement Book (MB) for site quantity certification.
- Bill of Quantities (BOQ) cost control and active tender tracking.

### 7. AI Intelligence & Predictive Analytics
- Integrated Gemini 3.6 Flash model server proxy.
- Natural language query interface for ERP records.
- Automated BOQ cost anomaly detection and equipment predictive maintenance alerts.

### 8. PWA & Field Offline Architecture
- PWA manifest (`manifest.json`) and Service Worker (`sw.js`).
- Background data synchronization queue for remote field sites with poor connectivity.
