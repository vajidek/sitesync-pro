# SiteSync Pro Enterprise ERP - Installation & Local Setup Guide

## System Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher
- PostgreSQL 15+ database instance (or local Docker container)
- Environment Variables configuration in `.env`

## Step-by-Step Installation

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/sitesync-pro/sitesync-erp.git
cd sitesync-erp
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and configure your credentials:
```bash
cp .env.example .env
```

Ensure `.env` contains:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://sitesync:sitesync_secret@localhost:5432/sitesyncpro?schema=public"
JWT_SECRET="your-secure-jwt-secret-key"
JWT_REFRESH_SECRET="your-secure-jwt-refresh-secret-key"
GEMINI_API_KEY="your-google-gemini-api-key"
```

### 3. Database Initialization & Prisma Migration
```bash
npx prisma generate
npx prisma db push
```

### 4. Start Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:3000` with hot TypeScript compilation via `tsx` and integrated Vite middleware.
