# SiteSync Pro Enterprise ERP - API Specification & Documentation

## Overview
SiteSync Pro exposes RESTful JSON APIs mounted under `/api`.

Developer: **Abdul Vajid EK**

## Base URL
`/api`

## Standard Headers
```http
Content-Type: application/json
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

## Response Specification
All API responses follow the standard JSON envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation executed successfully",
  "timestamp": "2026-08-01T22:30:00.000Z"
}
```

## Endpoint Categories

### 1. System Health & Metadata
- `GET /api/health` - Health check status, app metadata, and uptime.
- `GET /api/info` - Tech stack manifest, creator details, and enterprise feature checklist.

### 2. Authentication (`/api/auth`)
- `POST /api/auth/register` - Create user account (Admin only).
- `POST /api/auth/login` - Authenticate with email/password, returns access & refresh tokens.
- `POST /api/auth/refresh` - Refresh access token using rotation token.
- `POST /api/auth/logout` - Revoke active refresh token.
- `GET /api/auth/me` - Fetch profile of currently authenticated user.

### 3. Master Data (`/api/master`)
- `GET /api/master/companies` - List registered enterprise companies.
- `GET /api/master/branches` - List organizational branches.
- `GET /api/master/departments` - List departments.
- `GET /api/master/designations` - List job designations.

### 4. Human Resources (`/api/hr`)
- `GET /api/hr/employees` - Search & filter employee master records.
- `POST /api/hr/employees` - Register new employee record.
- `GET /api/hr/attendance` - Daily site attendance records.
- `GET /api/hr/payroll` - Generate monthly payroll summaries.

### 5. Procurement & BOQ (`/api/procurement`)
- `GET /api/procurement/vendors` - Directory of approved vendors.
- `GET /api/procurement/purchase-requisitions` - Purchase requisitions queue.
- `GET /api/procurement/purchase-orders` - Issued PO records.
- `GET /api/procurement/tenders` - Active bidding tenders.

### 6. AI Intelligence (`/api/ai`)
- `POST /api/ai/chat` - Gemini 3.6 Flash conversational ERP assistant.
- `POST /api/ai/boq-analysis` - AI Bill of Quantities rate & cost variance audit.
- `POST /api/ai/predict-delays` - Schedule risk forecasting.
- `POST /api/ai/predict-maintenance` - Heavy equipment predictive maintenance alerts.
