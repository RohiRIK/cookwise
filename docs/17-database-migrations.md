# CookWise Database Migrations Guide

> **Product:** CookWise - The AI-Powered Kitchen Operating System  
> **Domain:** cookwise.io  
> **Version:** 1.0  
> **ORM:** Prisma

---

## Table of Contents

1. [Overview](#overview)
2. [Creating Migrations](#creating-migrations)
3. [Applying Migrations](#applying-migrations)
4. [Seed Data](#seed-data)
5. [Rollback Strategy](#rollback-strategy)

---

## Overview

Prisma Migrations manages database schema changes with version control.

---

## Creating Migrations

### After Schema Changes

```bash
# Development (creates & applies migration)
bunx prisma migrate dev --name add_recipe_rating

# Production (create migration only)
bunx prisma migrate dev --create-only --name add_recipe_rating
```

### Migration File Structure

```
prisma/
├── migrations/
│   ├── 20260217120000_add_recipe_rating/
│   │   ├── migration.sql
│   │   └── migration_lock.toml
│   └── migration_lock.toml
└── schema.prisma
```

### Example Migration SQL

```sql
-- AlterTable
ALTER TABLE "Recipe" 
ADD COLUMN "rating" INTEGER;

-- CreateIndex
CREATE INDEX "Recipe_rating_idx" ON "Recipe"("rating");
```

---

## Applying Migrations

### Development

```bash
# Apply all pending migrations
bunx prisma migrate dev
```

### Production

```bash
# Apply migrations without prompts
bunx prisma migrate deploy

# Check migration status
bunx prisma migrate status
```

### Reset Database

```bash
# WARNING: Deletes all data!
bunx prisma migrate reset

# Or manually
bunx prisma db push --force-reset
bunx prisma migrate deploy
```

---

## Seed Data

### Seed Script

```typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Create base ingredients
  const ingredients = [
    { name: "tomatoes", category: "PRODUCE" },
    { name: "onions", category: "PRODUCE" },
    { name: "garlic", category: "PRODUCE" },
    { name: "olive oil", category: "OILS" },
    { name: "salt", category: "SPICES" },
    { name: "black pepper", category: "SPICES" },
    { name: "butter", category: "DAIRY" },
    { name: "eggs", category: "DAIRY" },
    { name: "all-purpose flour", category: "BAKING" },
    { name: "granulated sugar", category: "BAKING" },
  ]

  for (const ingredient of ingredients) {
    await prisma.ingredient.upsert({
      where: { name: ingredient.name },
      update: {},
      create: ingredient
    })
  }

  console.log(`Seeded ${ingredients.length} ingredients`)
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

### Package.json Configuration

```json
{
  "prisma": {
    "seed": "bun prisma/seed.ts"
  }
}
```

### Run Seed

```bash
# Seed database
bunx prisma db seed

# Or with TypeScript directly
bun prisma/seed.ts
```

---

## Rollback Strategy

### Rollback Last Migration

```bash
# Rollback one migration
bunx prisma migrate resolve --rolled-back <migration-name>

# Or manually edit migration history
bunx prisma migrate dev
```

### Emergency Rollback

```sql
-- Manually rollback SQL
ALTER TABLE "Recipe" DROP COLUMN "rating";
DROP INDEX "Recipe_rating_idx";
```

### Migration Best Practices

✅ **DO:**
- Test migrations locally first
- Use `--create-only` in production
- Backup database before production migrations
- Keep migrations small and focused

❌ **DON'T:**
- Edit applied migrations
- Delete migration files
- Skip testing migrations
- Run untested migrations in production

---

## Related Documents

- [Database Schema](01-database-schema.md) - Schema reference
- [Development Setup](06-development-setup.md) - Local database setup
- [Deployment Guide](16-deployment-guide.md) - Production deployment

---

*Document Version: 1.0 | Last Updated: 2026-02-17 | CookWise Technical Team*
