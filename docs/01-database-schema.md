# CookWise Database Schema

> **Product:** CookWise - The AI-Powered Kitchen Operating System  
> **Domain:** cookwise.io  
> **Version:** 1.0  
> **Database:** PostgreSQL with Prisma ORM

---

## Overview

This document describes the database schema for CookWise, designed for multi-tenant household isolation with proper relationships for recipe management, pantry tracking, meal planning, and shopping lists.

---

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│   Household     │       │      User       │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◀──────│ householdId     │
│ name            │       │ id (PK)         │
│ createdAt       │       │ email           │
│ updatedAt       │       │ name            │
└────────┬────────┘       │ image           │
         │                └────────┬────────┘
         │                         │
         │        ┌─────────────────┼─────────────────┐
         │        │                 │                 │
         ▼        ▼                 ▼                 ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    Recipe       │  │   PantryItem    │  │   MealPlan      │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ id (PK)         │  │ id (PK)         │  │ id (PK)         │
│ householdId     │  │ householdId     │  │ householdId     │
│ creatorId       │  │ ingredientId    │  │ recipeId        │
│ title           │  │ quantity        │  │ userId          │
│ description     │  │ unit            │  │ date            │
│ sourceType      │  │ status          │  │ mealType        │
│ prepTime        │  │ expiryDate      │  │ isCooked        │
│ cookTime        │  │ location        │  │ cookedAt        │
│ servings        │  └────────┬────────┘  └─────────────────┘
│ difficulty      │           │
│ tags[]          │           │
│ imageUrl        │           │
└────────┬────────┘           │
         │                    │
         │        ┌───────────┘
         │        │
         ▼        ▼
┌─────────────────────────────────┐
│     RecipeIngredient            │
├─────────────────────────────────┤
│ id (PK)                         │
│ recipeId                        │
│ ingredientId                    │
│ quantity                        │
│ unit                            │
│ originalText                    │
│ notes                           │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│   Ingredient    │
├─────────────────┤
│ id (PK)         │
│ name (unique)   │
│ category        │
└─────────────────┘

┌─────────────────┐       ┌─────────────────────┐
│  ShoppingList   │──────▶│  ShoppingListItem   │
├─────────────────┤       ├─────────────────────┤
│ id (PK)         │       │ id (PK)             │
│ householdId     │       │ shoppingListId      │
│ userId          │       │ ingredientId        │
│ name            │       │ name                │
│ weekOf          │       │ quantity            │
│ isActive        │       │ unit                │
└─────────────────┘       │ category            │
                          │ aisle               │
                          │ is_checked          │
                          │ checkedAt           │
                          │ recipeId            │
                          └─────────────────────┘
```

---

## Enums

### MealType

```typescript
enum MealType {
  BREAKFAST
  LUNCH
  DINNER
  SNACK
}
```

### PantryStatus

```typescript
enum PantryStatus {
  IN_STOCK
  LOW
  OUT
}
```

### RecipeSourceType

```typescript
enum RecipeSourceType {
  MANUAL
  OCR_IMAGE
  OCR_PDF
  URL_SCRAPER
  IMPORT
}
```

### IngredientCategory

```typescript
enum IngredientCategory {
  PRODUCE
  DAIRY
  MEAT
  SEAFOOD
  GRAINS
  CANNED
  SPICES
  OILS
  BAKING
  BEVERAGES
  FROZEN
  CONDIMENTS
  OTHER
}
```

### UnitType

```typescript
enum UnitType {
  PIECE
  GRAM
  KILOGRAM
  MILLILITER
  LITER
  CUP
  TABLESPOON
  TEASPOON
  OUNCE
  POUND
  PINCH
  TO_TASTE
}
```

---

## Models

### Authentication & Users

#### User

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `email` | String | Unique email address |
| `emailVerified` | DateTime? | Email verification timestamp |
| `name` | String? | Display name |
| `image` | String? | Profile picture URL |
| `householdId` | UUID? | Foreign key to Household |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Record update timestamp |

**Relations:** Account[], Session[], Recipe[], PantryItem[], MealPlan[], ShoppingList[]

#### Household

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `name` | String | Household name (e.g., "Smith Family") |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Record update timestamp |

**Relations:** User[], Recipe[], PantryItem[], MealPlan[], ShoppingList[]

**Design Note:** All data is scoped to household for multi-tenant isolation.

---

### Recipe Management

#### Recipe

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `title` | String | Recipe title |
| `description` | String? | Brief description |
| `sourceType` | RecipeSourceType | How recipe was added |
| `sourceUrl` | String? | Original URL if scraped |
| `prepTime` | Int? | Preparation time (minutes) |
| `cookTime` | Int? | Cooking time (minutes) |
| `servings` | Int | Number of servings (default: 4) |
| `difficulty` | String? | Easy/Medium/Hard |
| `tags` | String[] | Search tags |
| `rating` | Int? | User rating (1-5) |
| `notes` | String? | Personal notes |
| `imageUrl` | String? | Recipe image URL |
| `householdId` | UUID? | Foreign key to Household |
| `creatorId` | UUID? | Foreign key to User |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Record update timestamp |

**Relations:** RecipeIngredient[], InstructionStep[], MealPlan[]

#### Ingredient

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `name` | String | Unique ingredient name |
| `category` | IngredientCategory | Category for organization |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Record update timestamp |

**Relations:** RecipeIngredient[], PantryItem[]

**Design Note:** Global ingredient catalog (not household-specific) for consistent naming.

#### RecipeIngredient

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `recipeId` | UUID | Foreign key to Recipe |
| `ingredientId` | UUID | Foreign key to Ingredient |
| `quantity` | Float | Quantity amount |
| `unit` | UnitType | Unit of measurement |
| `originalText` | String | Raw text from OCR/scraper |
| `notes` | String? | Prep notes (chopped, diced) |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Record update timestamp |

**Relations:** Recipe, Ingredient

**Design Note:** Join table separates ingredient definitions from recipe-specific quantities.

#### InstructionStep

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `recipeId` | UUID | Foreign key to Recipe |
| `stepNumber` | Int | Step order (1, 2, 3...) |
| `instruction` | String | Step instructions |
| `imageUrl` | String? | Step image URL |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Record update timestamp |

**Relations:** Recipe

---

### Pantry & Inventory

#### PantryItem

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `ingredientId` | UUID | Foreign key to Ingredient |
| `householdId` | UUID? | Foreign key to Household |
| `quantity` | Float | Current quantity |
| `unit` | UnitType | Unit of measurement |
| `minQuantity` | Float | Threshold for LOW status |
| `status` | PantryStatus | IN_STOCK/LOW/OUT |
| `expiryDate` | DateTime? | Expiration date |
| `location` | String? | Storage location |
| `notes` | String? | Additional notes |
| `userId` | UUID? | User who last updated |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Record update timestamp |

**Relations:** Ingredient, Household, User

**Design Note:** Unique constraint on (householdId, ingredientId) ensures one entry per ingredient per household.

---

### Meal Planning

#### MealPlan

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `recipeId` | UUID | Foreign key to Recipe |
| `householdId` | UUID? | Foreign key to Household |
| `userId` | UUID? | Foreign key to User |
| `date` | DateTime | Meal date |
| `mealType` | MealType | BREAKFAST/LUNCH/DINNER/SNACK |
| `servings` | Int | Number of servings |
| `notes` | String? | Meal-specific notes |
| `isCooked` | Boolean | Cooking completion status |
| `cookedAt` | DateTime? | When meal was cooked |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Record update timestamp |

**Relations:** Recipe, Household, User

**Design Note:** Unique constraint on (householdId, recipeId, date, mealType) prevents duplicate meals.

---

### Shopping List

#### ShoppingList

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `householdId` | UUID? | Foreign key to Household |
| `name` | String | List name (default: "Weekly List") |
| `weekOf` | DateTime | Week starting date |
| `isActive` | Boolean | Currently active list |
| `userId` | UUID? | User who created list |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Record update timestamp |

**Relations:** ShoppingListItem[], Household, User

#### ShoppingListItem

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `shoppingListId` | UUID | Foreign key to ShoppingList |
| `ingredientId` | UUID? | Foreign key to Ingredient |
| `name` | String | Item name (for manual entries) |
| `quantity` | Float | Quantity needed |
| `unit` | UnitType | Unit of measurement |
| `category` | IngredientCategory | For grouping by aisle |
| `aisle` | String? | Store aisle location |
| `estimatedPrice` | Float? | Price estimate |
| `is_checked` | Boolean | Checked off status |
| `checkedAt` | DateTime? | When item was checked |
| `checkedByUserId` | UUID? | Who checked the item |
| `notes` | String? | Additional notes |
| `recipeId` | UUID? | Source recipe for tracking |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Record update timestamp |

**Relations:** ShoppingList, Ingredient, Recipe, User

---

## Indexes

### Performance Indexes

| Model | Index Fields | Purpose |
|-------|-------------|---------|
| User | householdId, email | Household lookups, auth |
| Household | name | Search |
| Recipe | householdId, title, tags, creatorId | Filtering, search |
| Ingredient | name, category | Search, categorization |
| RecipeIngredient | recipeId, ingredientId | Join queries |
| InstructionStep | recipeId | Recipe detail loading |
| PantryItem | householdId, ingredientId, status, userId | Inventory queries |
| MealPlan | householdId, date, mealType, recipeId, userId | Calendar queries |
| ShoppingList | householdId, weekOf, isActive | List retrieval |
| ShoppingListItem | shoppingListId, is_checked, category, ingredientId | Shopping view |

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **UUIDs for all IDs** | Prevents ID enumeration, works across distributed systems |
| **Household isolation** | All data scoped to household for multi-tenant security |
| **RecipeIngredient join table** | Separates ingredient definitions from recipe-specific quantities |
| **Unit normalization** | Enforces consistent units for accurate calculations |
| **Timestamps on all models** | Enables audit trails and sync conflict resolution |
| **Indexed foreign keys** | Optimizes query performance for relationships |
| **Global Ingredient catalog** | Ensures consistent naming across households |

---

## Related Documents

- [Technical Specification](02-technical-spec.md) - Architecture and data flow
- [API Reference](05-api-reference.md) - REST endpoints
- [Development Setup](06-development-setup.md) - Database configuration

---

*Document Version: 1.0 | Last Updated: 2026-02-17 | CookWise Technical Team*
