---
title: CookWise Technical Specification
description: Kitchen-OS Documentation
---

> **Product:** CookWise - The AI-Powered Kitchen Operating System  
> **Domain:** cookwise.io  
> **Version:** 1.0  
> **Stack:** Next.js, Bun, PostgreSQL, Prisma, Gemini AI

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Server Actions](#server-actions)
3. [Data Flow](#data-flow)
4. [Optimistic UI Strategy](#optimistic-ui-strategy)
5. [Security Model](#security-model)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Desktop Web   │  │   Mobile Web    │  │   PWA (Future)  │  │
│  │   (Next.js)     │  │   (Next.js)     │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Next.js)                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Server Actions                        │    │
│  │  • parseRecipeImage()                                   │    │
│  │  • scrapeRecipeUrl()                                    │    │
│  │  • generateShoppingList()                               │    │
│  │  • deductPantryStock()                                  │    │
│  │  • toggleShoppingItem()                                 │    │
│  │  • autoFillMealPlan()                                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    API Routes                            │    │
│  │  • /api/auth/[...nextauth]                              │    │
│  │  • /api/recipes                                         │    │
│  │  • /api/pantry                                          │    │
│  │  • /api/meal-plans                                      │    │
│  │  • /api/shopping-lists                                  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INTELLIGENCE LAYER                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Gemini API     │  │  OCR Service    │  │  Scraper        │  │
│  │  (gemini-1.5-   │  │  (Image →       │  │  Service        │  │
│  │   flash)        │  │   JSON)         │  │  (URL → JSON)   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   PostgreSQL    │  │    Prisma ORM   │  │  Redis Cache    │  │
│  │   (Primary DB)  │  │                 │  │  (Future)       │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Runtime** | Bun | Package manager & runtime |
| **Framework** | Next.js (App Router) | Full-stack React framework |
| **Language** | TypeScript | Type-safe development |
| **Database** | PostgreSQL | Primary data store |
| **ORM** | Prisma | Database client & migrations |
| **Styling** | Tailwind CSS + shadcn/ui | Component library |
| **Auth** | NextAuth.js | Authentication |
| **AI** | Google Gemini 1.5 Flash | Recipe parsing |

---

## Server Actions

### Recipe Ingestion

#### `parseRecipeImage`

```typescript
/**
 * Parse recipe from uploaded image using Gemini OCR
 */
async function parseRecipeImage(
  imageFile: File,
  recipeId?: string
): Promise<{ recipeId: string; status: 'pending_review' | 'created' }> {
  // 1. Upload to temporary storage
  // 2. Send buffer to Gemini API
  // 3. Parse JSON response
  // 4. Create draft recipe or update existing
  // 5. Return for user review
}
```

#### `scrapeRecipeUrl`

```typescript
/**
 * Scrape recipe from URL
 */
async function scrapeRecipeUrl(
  url: string,
  householdId: string
): Promise<{ recipeId: string; status: 'pending_review' | 'created' }> {
  // 1. Fetch HTML
  // 2. Extract recipe content via DOM parsing
  // 3. Send to Gemini for structured extraction
  // 4. Create draft recipe
}
```

#### `saveRecipe`

```typescript
/**
 * Save reviewed recipe to database
 */
async function saveRecipe(
  recipeId: string,
  data: RecipeInput,
  householdId: string
): Promise<Recipe> {
  // 1. Validate user permissions
  // 2. Transaction: Create Recipe + Ingredients + Steps
  // 3. Index for search
}
```

---

### Pantry Management

#### `deductPantryStock`

```typescript
/**
 * Deduct ingredients from pantry when meal is marked as cooked
 */
async function deductPantryStock(
  mealPlanId: string
): Promise<{ success: boolean; deductedItems: DeductedItem[] }> {
  // 1. Fetch meal plan with recipe ingredients
  // 2. Check pantry availability
  // 3. Transaction: Deduct quantities, update status
  // 4. Return low stock warnings
}
```

#### `updatePantryItem`

```typescript
/**
 * Update pantry item quantity
 */
async function updatePantryItem(
  ingredientId: string,
  quantity: number,
  householdId: string
): Promise<PantryItem> {
  // 1. Upsert pantry item
  // 2. Calculate status based on minQuantity
  // 3. Return updated item
}
```

#### `getLowStockItems`

```typescript
/**
 * Get low stock items for shopping list generation
 */
async function getLowStockItems(
  householdId: string
): Promise<PantryItem[]> {
  // 1. Query pantry where status = LOW or OUT
  // 2. Include ingredient details
}
```

---

### Shopping List

#### `generateShoppingList`

```typescript
/**
 * Generate shopping list from meal plan minus pantry stock
 */
async function generateShoppingList(
  weekOf: Date,
  householdId: string
): Promise<ShoppingList> {
  // 1. Fetch meal plans for week
  // 2. Aggregate all recipe ingredients
  // 3. Subtract pantry inventory
  // 4. Deduplicate and group by category
  // 5. Create shopping list items
}
```

#### `toggleShoppingItem`

```typescript
/**
 * Toggle item checked status (optimistic UI)
 */
async function toggleShoppingItem(
  itemId: string,
  is_checked: boolean,
  userId: string
): Promise<ShoppingListItem> {
  // 1. Update database
  // 2. Return updated item for cache invalidation
}
```

#### `finishShoppingTrip`

```typescript
/**
 * Complete shopping trip and restock pantry
 */
async function finishShoppingTrip(
  shoppingListId: string,
  householdId: string
): Promise<{ restockedItems: PantryItem[] }> {
  // 1. Get all checked items
  // 2. Transaction: Add to pantry quantities
  // 3. Mark list as inactive
  // 4. Create new active list for next week
}
```

---

### Meal Planning

#### `addToMealPlan`

```typescript
/**
 * Add recipe to meal plan
 */
async function addToMealPlan(
  recipeId: string,
  date: Date,
  mealType: MealType,
  householdId: string
): Promise<MealPlan> {
  // 1. Check for conflicts
  // 2. Create or update meal plan
}
```

#### `autoFillMealPlan`

```typescript
/**
 * Auto-fill empty meal slots (Lazy Button)
 */
async function autoFillMealPlan(
  weekOf: Date,
  householdId: string,
  options?: { usePantryFirst?: boolean }
): Promise<MealPlan[]> {
  // 1. Find empty slots
  // 2. If usePantryFirst: prioritize recipes with in-stock ingredients
  // 3. Random selection from available recipes
  // 4. Create meal plans
}
```

#### `removeFromMealPlan`

```typescript
/**
 * Remove recipe from meal plan
 */
async function removeFromMealPlan(
  mealPlanId: string,
  householdId: string
): Promise<void> {
  // 1. Verify ownership
  // 2. Delete meal plan
}
```

---

## Data Flow

### Recipe Image Upload Lifecycle

```
┌──────────┐     ┌─────────────┐     ┌──────────────┐     ┌──────────┐
│  Client  │────▶│   Server    │────▶│   Gemini     │────▶│  Prisma  │
│  (Upload)│     │   Action    │     │   API        │     │   + PG   │
└──────────┘     └─────────────┘     └──────────────┘     └──────────┘
     │                  │                    │                  │
     │ 1. Select image  │                    │                  │
     │─────────────────▶│                    │                  │
     │                  │                    │                  │
     │                  │ 2. Convert to      │                  │
     │                  │    base64/buffer   │                  │
     │                  │───────────────────▶│                  │
     │                  │                    │                  │
     │                  │ 3. Process with    │                  │
     │                  │    system prompt   │                  │
     │                  │                    │                  │
     │                  │◀───────────────────│                  │
     │                  │    JSON response   │                  │
     │                  │                    │                  │
     │                  │ 4. Validate &      │                  │
     │                  │    transform       │                  │
     │                  │──────────────────────────────────────▶│
     │                  │                    │                  │
     │                  │◀──────────────────────────────────────│
     │                  │    Recipe created  │                  │
     │                  │                    │                  │
     │ 5. Return recipe │                    │                  │
     │    for review    │                    │                  │
     │◀─────────────────│                    │                  │
     │                  │                    │                  │
```

### Step-by-Step Breakdown

| Step | Component | Action |
|------|-----------|--------|
| 1 | Client | User selects/uploads recipe image |
| 2 | Server Action | Convert file to buffer, validate size/type |
| 3 | Gemini API | Send image with system prompt for OCR |
| 4 | Server Action | Validate JSON response against schema |
| 5 | Prisma | Transaction: Create Recipe + Ingredients + Steps |
| 6 | Client | Display recipe for user review/edit |
| 7 | Client | User confirms or edits parsed data |
| 8 | Server Action | Save final recipe to database |

---

## Optimistic UI Strategy

For the mobile shopping list, we implement optimistic updates to ensure zero perceived latency:

### Implementation

```typescript
// components/shopping-list-item.tsx
'use client'

import { useOptimistic, useTransition } from 'react'
import { toggleShoppingItem } from '@/actions/shopping-list'

export function ShoppingListItem({ item }: { item: ShoppingListItem }) {
  const [isPending, startTransition] = useTransition()
  
  const [optimisticItem, setOptimisticItem] = useOptimistic(
    item,
    (state, newChecked: boolean) => ({
      ...state,
      is_checked: newChecked,
      checkedAt: newChecked ? new Date() : null,
    })
  )

  async function handleToggle() {
    const newChecked = !optimisticItem.is_checked
    
    // Optimistically update UI
    startTransition(() => {
      setOptimisticItem(newChecked)
      toggleShoppingItem(item.id, newChecked, currentUserId)
    })
  }

  return (
    <Checkbox
      checked={optimisticItem.is_checked}
      onCheckedChange={handleToggle}
      disabled={isPending}
    />
  )
}
```

### Key Principles

| Principle | Implementation |
|-----------|----------------|
| **Immediate feedback** | UI updates before server confirmation |
| **Rollback on failure** | If server action fails, revert to previous state |
| **Loading states** | Show subtle indicators during pending operations |
| **Conflict resolution** | Last-write-wins with timestamp comparison |

### Mobile-Specific Optimizations

```typescript
// Enable wake lock during shopping
async function activateShoppingMode() {
  if ('wakeLock' in navigator) {
    const wakeLock = await navigator.wakeLock.request('screen')
    wakeLock.addEventListener('release', () => {
      console.log('Wake lock released')
    })
  }
}

// Touch-optimized checkboxes
<Checkbox 
  className="min-h-[44px] min-w-[44px]"  // WCAG touch target
/>
```

---

## Security Model

### Household Data Isolation

All data is scoped to households to ensure multi-tenant isolation:

```typescript
// Middleware: Attach household to all requests
export async function middleware(request: NextRequest) {
  const session = await getSession()
  
  if (!session?.user?.householdId) {
    return NextResponse.redirect('/onboarding')
  }
  
  // Inject household ID into request headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-household-id', session.user.householdId)
  
  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}
```

### Server Action Authorization

```typescript
// lib/auth.ts
export async function verifyHouseholdAccess(
  householdId: string | null,
  userId: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { householdId: true },
  })
  
  return user?.householdId === householdId
}

// Usage in server actions
export async function getRecipe(recipeId: string) {
  const session = await auth()
  if (!session?.user) throw new UnauthorizedError()
  
  const recipe = await prisma.recipe.findFirst({
    where: {
      id: recipeId,
      householdId: session.user.householdId, // Scope to household
    },
  })
  
  if (!recipe) throw new NotFoundError()
  return recipe
}
```

### Security Checklist

| Concern | Mitigation |
|---------|------------|
| **Data isolation** | All queries scoped to `householdId` |
| **Authentication** | NextAuth.js with secure sessions |
| **Input validation** | Zod schemas on all inputs |
| **SQL injection** | Prisma ORM with parameterized queries |
| **XSS** | React escaping, CSP headers |
| **CSRF** | NextAuth CSRF protection |
| **Rate limiting** | API route middleware |

---

## Related Documents

- [Database Schema](01-database-schema.md) - Data models and relationships
- [AI Prompts](03-ai-prompts.md) - Gemini prompt engineering
- [User Flows](04-user-flows.md) - UX journeys
- [API Reference](05-api-reference.md) - REST endpoints
- [Development Setup](06-development-setup.md) - Environment configuration

---

*Document Version: 1.0 | Last Updated: 2026-02-17 | CookWise Technical Team*
