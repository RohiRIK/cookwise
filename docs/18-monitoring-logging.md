# CookWise Monitoring & Logging Guide

> **Product:** CookWise - The AI-Powered Kitchen Operating System  
> **Domain:** cookwise.io  
> **Version:** 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Error Tracking](#error-tracking)
3. [Logging](#logging)
4. [Analytics](#analytics)
5. [Performance Monitoring](#performance-monitoring)
6. [Alerting](#alerting)

---

## Overview

Monitoring stack for CookWise:
- **Error Tracking:** Sentry
- **Logging:** Vercel Logs + Axiom
- **Analytics:** Vercel Analytics
- **Performance:** Vercel Speed Insights

---

## Error Tracking

### Sentry Setup

```bash
bun add @sentry/nextjs
```

### Configuration

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% sampling
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})
```

### Capture Errors

```typescript
// lib/errors.ts
"use client"

import * as Sentry from "@sentry/nextjs"

export function captureError(error: Error, context?: {
  tags?: Record<string, string>
  extra?: Record<string, any>
}) {
  Sentry.captureException(error, {
    tags: context?.tags,
    extra: {
      ...context?.extra,
      timestamp: new Date().toISOString()
    }
  })
}

// Usage in server actions
try {
  await someOperation()
} catch (error) {
  captureError(error as Error, {
    tags: { section: "recipe-upload" },
    extra: { recipeId, userId }
  })
  throw error
}
```

---

## Logging

### Structured Logging

```typescript
// lib/logger.ts
type LogLevel = "debug" | "info" | "warn" | "error"

interface LogContext {
  userId?: string
  householdId?: string
  recipeId?: string
  [key: string]: any
}

function log(level: LogLevel, message: string, context?: LogContext) {
  console.log(JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    ...context
  }))
}

export const logger = {
  debug: (message: string, context?: LogContext) => log("debug", message, context),
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
  error: (message: string, context?: LogContext) => log("error", message, context),
}

// Usage
logger.info("Recipe uploaded", {
  userId: session.user.id,
  recipeId: recipe.id,
  sourceType: "OCR"
})
```

### Axiom Integration

```bash
bun add @axiomhq/axiom-node
```

```typescript
// lib/axiom.ts
import { Client } from "@axiomhq/axiom-node"

const client = new Client({
  token: process.env.AXIOM_TOKEN,
  orgId: process.env.AXIOM_ORG_ID,
})

export async function ingestLog(dataset: string, log: any) {
  await client.ingest(dataset, [log])
}
```

---

## Analytics

### Vercel Analytics

```typescript
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Custom Events

```typescript
// lib/analytics.ts
"use client"

import { track } from "@vercel/analytics"

export function trackEvent(eventName: string, data?: Record<string, any>) {
  track(eventName, data)
}

// Usage
trackEvent("Recipe Created", {
  sourceType: "OCR",
  recipeId: recipe.id
})

trackEvent("Meal Planned", {
  recipeId,
  mealType: "DINNER",
  dayOfWeek: "Monday"
})
```

---

## Performance Monitoring

### Vercel Speed Insights

```typescript
// app/layout.tsx
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### Core Web Vitals

```typescript
// app/page.tsx
import { useReportWebVitals } from "next/web-vitals"

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to analytics
    trackEvent("Web Vitals", {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
    })
  })

  return null
}
```

---

## Alerting

### Error Rate Alerts

Configure in Sentry:
1. Go to Project Settings → Alerts
2. Create alert rule:
   - Condition: `error_count > 10` in `5 minutes`
   - Action: Send email/Slack

### Performance Alerts

```typescript
// Monitor slow API routes
export async function trackPerformance(
  route: string,
  duration: number
) {
  if (duration > 1000) { // > 1 second
    logger.warn("Slow route detected", {
      route,
      duration,
      threshold: 1000
    })

    trackEvent("Slow Route", {
      route,
      duration
    })
  }
}
```

---

## Dashboard Metrics

### Key Metrics to Track

| Metric | Target | Tool |
|--------|--------|------|
| Error Rate | < 1% | Sentry |
| Page Load Time | < 2s | Speed Insights |
| API Response Time | < 500ms | Custom |
| Active Users | - | Analytics |
| Recipe Uploads | - | Analytics |

---

## Related Documents

- [Deployment Guide](16-deployment-guide.md) - Production setup
- [Server Actions](09-server-actions-guide.md) - Error handling patterns

---

*Document Version: 1.0 | Last Updated: 2026-02-17 | CookWise Technical Team*
