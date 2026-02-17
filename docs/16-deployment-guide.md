# CookWise Deployment Guide

> **Product:** CookWise - The AI-Powered Kitchen Operating System  
> **Domain:** cookwise.io  
> **Version:** 1.0  
> **Platform:** Vercel

---

## Table of Contents

1. [Overview](#overview)
2. [Vercel Setup](#vercel-setup)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Production Checklist](#production-checklist)

---

## Overview

CookWise is deployed on **Vercel** with **PostgreSQL** (hosted on Railway, Supabase, or similar).

---

## Vercel Setup

### Connect Repository

```bash
# 1. Install Vercel CLI
bun add -g vercel

# 2. Login
vercel login

# 3. Link project
vercel link
```

### vercel.json Configuration

```json
{
  "framework": "nextjs",
  "buildCommand": "bun run build",
  "devCommand": "bun run dev",
  "installCommand": "bun install",
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

## Environment Variables

### Production Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/cookwise?schema=public"

# Authentication
NEXTAUTH_SECRET="your-production-secret-min-32-chars"
NEXTAUTH_URL="https://cookwise.io"

# AI Services
GEMINI_API_KEY="your-gemini-api-key"

# Optional
REDIS_URL="redis://..."
RESEND_API_KEY="..."
```

### Set in Vercel Dashboard

1. Go to Project Settings → Environment Variables
2. Add each variable for Production environment
3. Redeploy after adding variables

---

## Database Setup

### Railway (Recommended)

```bash
# 1. Create PostgreSQL database
railway init
railway add postgresql

# 2. Get connection string
railway run psql -c "\conninfo"

# 3. Run migrations
bunx prisma migrate deploy
```

### Supabase

```bash
# 1. Create project in Supabase dashboard
# 2. Get connection string from Settings → Database
# 3. Run migrations
bunx prisma migrate deploy
```

---

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - name: Install dependencies
        run: bun install
      
      - name: Run tests
        run: bun test
      
      - name: Run type check
        run: bun run type-check
      
      - name: Run linter
        run: bun run lint
      
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Production Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Type check passes
- [ ] Linter passes
- [ ] Database migrations tested locally
- [ ] Environment variables configured
- [ ] Auth providers configured
- [ ] Gemini API key set

### Post-Deployment

- [ ] Site loads correctly
- [ ] Authentication works
- [ ] Recipe upload/parsing works
- [ ] Database queries working
- [ ] Error tracking configured
- [ ] Analytics configured

### Monitoring

```typescript
// lib/monitoring.ts
import { track } from "@vercel/analytics"

export function trackEvent(eventName: string, data?: Record<string, any>) {
  track(eventName, {
    ...data,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
}

// Usage
trackEvent("recipe_uploaded", {
  recipeId,
  sourceType: "OCR"
})
```

---

## Related Documents

- [Development Setup](06-development-setup.md) - Local setup
- [Database Migrations](17-database-migrations.md) - Migration guide
- [Monitoring & Logging](18-monitoring-logging.md) - Observability

---

*Document Version: 1.0 | Last Updated: 2026-02-17 | CookWise Technical Team*
