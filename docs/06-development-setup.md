# CookWise Development Setup Guide

> **Product:** CookWise - The AI-Powered Kitchen Operating System  
> **Domain:** cookwise.io  
> **Version:** 1.0  
> **Last Updated:** 2026-02-17

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Variables](#environment-variables)
4. [Project Structure](#project-structure)
5. [Development Commands](#development-commands)
6. [Database Management](#database-management)
7. [Testing](#testing)

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| [Node.js](https://nodejs.org/) | 20+ | JavaScript runtime |
| [Bun](https://bun.sh/) | Latest | Package manager & runtime |
| [PostgreSQL](https://postgresql.org/) | 15+ | Database |
| [Git](https://git-scm.com/) | Latest | Version control |

### Verify Installation

```bash
node --version      # v20.x.x
bun --version       # 1.x.x
psql --version      # 15.x
git --version       # 2.x.x
```

### API Keys

| Service | Purpose | Get Key |
|---------|---------|---------|
| Google Gemini | Recipe OCR & parsing | [Google AI Studio](https://makersuite.google.com/) |
| NextAuth Providers | OAuth authentication | Varies by provider |

---

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/your-org/cookwise.git
cd cookwise
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Copy Environment Variables

```bash
cp .env.example .env.local
```

### 4. Set Up Database

```bash
# Generate Prisma client
bunx prisma generate

# Run migrations
bunx prisma migrate dev

# (Optional) Seed database with sample data
bunx prisma db seed
```

### 5. Start Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## Environment Variables

### .env.example

```env
# ===========================================
# DATABASE
# ===========================================
DATABASE_URL="postgresql://postgres:password@localhost:5432/cookwise?schema=public"

# ===========================================
# AUTHENTICATION
# ===========================================
NEXTAUTH_SECRET="your-secret-key-min-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# ===========================================
# AI SERVICES
# ===========================================
GEMINI_API_KEY="your-gemini-api-key"

# ===========================================
# OPTIONAL SERVICES
# ===========================================
REDIS_URL="redis://localhost:6379"

# Email (for passwordless auth)
RESEND_API_KEY=""

# File Upload
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""
```

### Generate NEXTAUTH_SECRET

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Environment-Specific Files

| File | Purpose |
|------|---------|
| `.env.local` | Local development (gitignored) |
| `.env.development` | Development defaults |
| `.env.production` | Production values |

---

## Project Structure

```
cookwise/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth routes (login, register)
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/            # Main app routes
│   │   ├── dashboard/
│   │   ├── recipes/
│   │   ├── pantry/
│   │   ├── meal-plan/
│   │   └── shopping-list/
│   ├── api/                    # API routes
│   │   ├── auth/
│   │   ├── recipes/
│   │   ├── pantry/
│   │   ├── meal-plans/
│   │   └── shopping-lists/
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
│
├── components/                 # React components
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── recipes/                # Recipe-related components
│   │   ├── recipe-card.tsx
│   │   ├── recipe-form.tsx
│   │   └── recipe-upload.tsx
│   ├── pantry/                 # Pantry management
│   │   ├── pantry-item.tsx
│   │   └── pantry-list.tsx
│   ├── meal-plan/              # Meal planning
│   │   ├── calendar.tsx
│   │   └── meal-slot.tsx
│   └── shopping/               # Shopping list
│       ├── shopping-item.tsx
│       └── shopping-mode.tsx
│
├── actions/                    # Server actions
│   ├── recipes.ts
│   ├── pantry.ts
│   ├── meal-plans.ts
│   └── shopping-lists.ts
│
├── lib/                        # Utilities
│   ├── ai/                     # Gemini integration
│   │   ├── prompts.ts
│   │   ├── parser.ts
│   │   └── validation.ts
│   ├── auth/                   # Auth helpers
│   │   ├── index.ts
│   │   └── middleware.ts
│   ├── db/                     # Database client
│   │   └── index.ts
│   └── utils.ts
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Migration files
│
├── docs/                       # Documentation
│   ├── 00-PRD.md
│   ├── 01-database-schema.md
│   ├── 02-technical-spec.md
│   ├── 03-ai-prompts.md
│   ├── 04-user-flows.md
│   ├── 05-api-reference.md
│   └── 06-development-setup.md
│
├── tests/                      # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── public/                     # Static assets
│   ├── images/
│   └── icons/
│
├── hooks/                      # Custom React hooks
│   ├── use-optimistic.ts
│   └── use-shopping-list.ts
│
├── types/                      # TypeScript types
│   └── index.ts
│
├── middleware.ts               # Next.js middleware
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
└── package.json
```

---

## Development Commands

### Package Management

```bash
bun install           # Install dependencies
bun add <package>     # Add package
bun add -d <package>  # Add dev dependency
bun remove <package>  # Remove package
bun update            # Update dependencies
```

### Development

```bash
bun dev              # Start dev server (http://localhost:3000)
bun dev --turbo      # Turbopack mode (faster)
bun build            # Build for production
bun start            # Start production server
bun lint             # Run ESLint
bun type-check       # Run TypeScript check
```

### Database

```bash
bunx prisma generate              # Generate Prisma client
bunx prisma migrate dev           # Create & apply migration
bunx prisma migrate deploy        # Apply migrations (production)
bunx prisma studio                # Open Prisma Studio GUI
bunx prisma db push               # Push schema to DB (dev only)
bunx prisma db seed               # Seed database
bunx prisma db pull               # Pull schema from DB
```

### Testing

```bash
bun test              # Run all tests
bun test --watch      # Run tests in watch mode
bun test --coverage   # Run tests with coverage
```

---

## Database Management

### Create Migration

```bash
# After modifying schema.prisma
bunx prisma migrate dev --name add_recipe_rating
```

### Reset Database

```bash
# WARNING: Deletes all data
bunx prisma migrate reset
```

### Seed Data

Create seed file at `prisma/seed.ts`:

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample ingredients
  const tomato = await prisma.ingredient.upsert({
    where: { name: 'tomatoes' },
    update: {},
    create: {
      name: 'tomatoes',
      category: 'PRODUCE',
    },
  })

  console.log({ tomato })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "bun prisma/seed.ts"
  }
}
```

---

## Testing

### Unit Tests

```typescript
// tests/unit/recipe-parser.test.ts
import { describe, it, expect } from 'bun:test'
import { parseRecipeOutput } from '@/lib/ai/validation'

describe('Recipe Parser', () => {
  it('should validate valid recipe', () => {
    const recipe = {
      title: 'Test Recipe',
      ingredients: [{ item: 'tomato', quantity: 2, unit: 'piece', category: 'PRODUCE' }],
      instructions: [{ stepNumber: 1, instruction: 'Cook it' }],
    }
    
    expect(() => parseRecipeOutput(recipe)).not.toThrow()
  })
})
```

### Integration Tests

```typescript
// tests/integration/recipes.test.ts
import { describe, it, expect, beforeEach } from 'bun:test'
import { prisma } from '@/lib/db'

describe('Recipe API', () => {
  beforeEach(async () => {
    await prisma.recipe.deleteMany()
  })

  it('should create recipe', async () => {
    const recipe = await prisma.recipe.create({
      data: {
        title: 'Test Recipe',
        householdId: 'test-household',
      },
    })
    
    expect(recipe.title).toBe('Test Recipe')
  })
})
```

---

## Troubleshooting

### Common Issues

#### Prisma Client Not Generated

```bash
bunx prisma generate
```

#### Database Connection Error

```bash
# Check PostgreSQL is running
pg_isready

# Check DATABASE_URL in .env.local
echo $DATABASE_URL
```

#### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 bun dev
```

#### Migration Errors

```bash
# Reset and reapply migrations
bunx prisma migrate reset
```

---

## Related Documents

- [Database Schema](01-database-schema.md) - Data models reference
- [Technical Specification](02-technical-spec.md) - Architecture overview
- [API Reference](05-api-reference.md) - REST endpoints

---

*Document Version: 1.0 | Last Updated: 2026-02-17 | CookWise Technical Team*
