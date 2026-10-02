# SiteSync Pro Enterprise ERP - Developer Guide & Code Architecture

## Coding Standards & Conventions

### 1. Directory Structure Layout
```
/
├── prisma/               # Database schemas & migrations
├── public/               # PWA assets (manifest, sw.js)
├── docs/                 # Production enterprise documentation
├── src/
│   ├── api/              # Node/Express Express backend
│   │   ├── config/       # Environment variables
│   │   ├── controllers/  # API Request/Response handlers
│   │   ├── middleware/   # Auth, RateLimit, Error, Helmet
│   │   ├── routes/       # Express Route Registries
│   │   ├── services/     # Core Business Logic
│   │   ├── utils/        # Winston Logger, Response utilities
│   │   └── validators/   # Zod Validation Schemas
│   ├── components/       # Modular React Frontend Views
│   │   ├── ai/           # Gemini AI Assistant Modal
│   │   ├── common/       # Virtualized Tables, Reusable Controls
│   │   ├── dashboard/    # Executive & Role Analytics
│   │   ├── fleet/        # Machinery & Vehicle Management
│   │   ├── hr/           # Employee, Attendance & Payroll
│   │   ├── inventory/    # Stock & Warehouse Logistics
│   │   ├── procurement/  # Procurement, Vendor & BOQ Hub
│   │   └── projects/     # Construction Projects & Sites
│   ├── context/          # React Auth Context
│   ├── types/            # TypeScript Interface Definitions
│   └── tests/            # Automated Unit & Integration Tests
└── server.ts             # Application entry point
```

### 2. Standardized API Controller Pattern
Controllers must extract inputs, run Zod validations, call Service layer methods, and return standard `successResponse` or forward errors to `next(error)`.

### 3. Build & Type Checking Commands
```bash
npm run lint    # Runs tsc --noEmit
npm run build   # Vite bundle + esbuild server.ts into dist/server.cjs
npm run start   # Launches Node.js production server
```
