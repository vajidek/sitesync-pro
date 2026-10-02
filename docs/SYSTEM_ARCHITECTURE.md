# SiteSync Pro Enterprise ERP - System Architecture Specification

## Overview
SiteSync Pro is an Enterprise Project Management, ERP, Plant & Machinery, Fleet Management, HR & Payroll, and Procurement system engineered specifically for mega construction and mechanical infrastructure enterprises.

Designed & Developed by: **Abdul Vajid EK**

## High-Level Architectural Topology
The application follows a **Clean Multi-Tier Enterprise Architecture**:

1. **Presentation Layer (Frontend)**:
   - Framework: React 19 + TypeScript 5.8
   - Styling: Tailwind CSS v4 + Motion UI
   - Iconography: Lucide-React
   - State Management: React Context + Custom Hooks + Local Persistent Cache
   - Progressive Web App (PWA): Service Worker `sw.js` with offline request interceptor and IndexedDB data queue.

2. **Application & API Layer (Backend)**:
   - Runtime: Node.js ESM/CJS dual target with `tsx` / `esbuild`
   - Framework: Express.js REST API Architecture
   - Security: Helmet.js, CORS, Express Rate Limit, CSRF/XSS sanitization
   - Authentication: Dual-Token JWT (Access token 1h + Refresh token 7d rotation) with Bcrypt password hashing
   - Logging & Diagnostics: Winston Logger + Structured JSON transport

3. **Database & Data Layer**:
   - ORM / Query Engine: Prisma v6 with PostgreSQL Client
   - Master Schema: Complete enterprise entity-relationship definitions in `/prisma/schema.prisma`
   - Models: Company, Branch, Department, Designation, User, Role, Permission, Employee, Project, Site, Contractor, Vendor, Equipment, Vehicle, Material, Warehouse, Stock, Document, AuditLog.

4. **AI & Intelligence Services**:
   - Engine: `@google/genai` SDK
   - Model: `gemini-3.6-flash`
   - Server Proxy Endpoints: `/api/ai/chat`, `/api/ai/boq-analysis`, `/api/ai/predict-delays`, `/api/ai/predict-maintenance`, `/api/ai/search`

## Core Architectural Design Principles (SOLID)
- **Single Responsibility**: Each API controller handles only HTTP request/response orchestration, delegating business logic to Service classes and data access to Repositories.
- **Open-Closed Principle**: Extensible ERP module routes registered in clean router registries.
- **Liskov Substitution**: Standardized API response format (`successResponse`, `errorResponse`).
- **Interface Segregation**: Explicit TypeScript interfaces in `/src/types/` and `/src/api/types/`.
- **Dependency Inversion**: Services depend on database abstract interfaces rather than hardcoded connection handles.
