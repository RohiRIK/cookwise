# CookWise Template Customization Guide

> **Product:** CookWise - The AI-Powered Kitchen Operating System  
> **Domain:** cookwise.io  
> **Version:** 1.0  
> **Base Template:** [Taxonomy](https://github.com/shadcn-ui/taxonomy) by shadcn

---

## Overview

This document explains the **Taxonomy template** we're using as our starting point and details all the customizations needed to transform it into CookWise.

### What is Taxonomy?

**Taxonomy** is an open-source Next.js 14+ starter template created by shadcn (the creator of shadcn/ui). It provides a production-ready foundation with:

- ✅ Next.js App Router architecture
- ✅ shadcn/ui component library
- ✅ Tailwind CSS styling
- ✅ TypeScript configuration
- ✅ Authentication setup (NextAuth.js)
- ✅ Database integration (Prisma)
- ✅ SEO optimization
- ✅ Dark mode support

**Repository:** https://github.com/shadcn-ui/taxonomy

---

## Template Structure Analysis

### What We Keep from Taxonomy

| Component | Reason |
|-----------|--------|
| **App Router Setup** | Modern Next.js routing pattern |
| **shadcn/ui Components** | Button, Card, Dialog, etc. |
| **Tailwind Config** | Utility-first CSS framework |
| **TypeScript Setup** | Type safety |
| **Prisma Integration** | Database ORM |
| **NextAuth.js** | Authentication |
| **SEO Components** | Metadata, OpenGraph |
| **Dark Mode** | Theme switching |

### What We Replace/Remove

| Component | Taxonomy Default | CookWise Custom |
|-----------|------------------|-----------------|
| **Domain** | Blog/Documentation | Kitchen Management App |
| **Database Schema** | Blog posts, authors | Recipes, Pantry, Meal Plans, Shopping |
| **Auth Providers** | Generic setup | Household-based multi-tenant |
| **UI Theme** | Neutral/Documentation | Food/Kitchen-inspired |
| **Content Types** | Articles, pages | Recipes, ingredients, meals |
| **Dashboard** | Analytics, posts | Meal calendar, pantry, shopping |

---

## Required Changes Checklist

### 1. Configuration Files

#### `package.json`

**Changes:**
```diff
{
- "name": "taxonomy",
+ "name": "cookwise",
- "description": "A Next.js 14 template for building apps",
+ "description": "AI-Powered Kitchen Operating System",
  "author": "shadcn",
+ "homepage": "https://cookwise.io",
  "dependencies": {
    // Add AI/OCR packages
+   "@google/generative-ai": "^0.x",
+   "food-ingredient-parser": "^1.x",
    // Keep existing
  }
}
```

---

#### `next.config.js`

**Changes:**
```diff
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
-       hostname: "avatars.githubusercontent.com",
+       hostname: "images.unsplash.com",
      },
+     {
+       protocol: "https",
+       hostname: "images.pexels.com",
+     },
    ],
  },
+ env: {
+   GEMINI_API_KEY: process.env.GEMINI_API_KEY,
+ },
}
```

---

#### `tailwind.config.ts`

**Changes:**
```diff
const config: Config = {
  theme: {
    extend: {
      colors: {
-       border: "hsl(var(--border))",
+       // Keep existing + add custom
+       kitchen: {
+         DEFAULT: "hsl(var(--kitchen))",
+         foreground: "hsl(var(--kitchen-foreground))",
+       },
+       pantry: {
+         low: "hsl(var(--pantry-low))",    // Orange/yellow
+         out: "hsl(var(--pantry-out))",    // Red
+         in: "hsl(var(--pantry-in))",      // Green
+       },
      },
+     fontFamily: {
+       heading: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
+     },
    },
  },
}
```

---

### 2. Database Schema

#### `prisma/schema.prisma`

**Complete Replacement Required**

**Taxonomy Default:**
```prisma
model User {
  id       String   @id @default(cuid())
  name     String?
  email    String?  @unique
  posts    Post[]
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User?    @relation(fields: [authorId], references: [id])
  authorId  String?
}
```

**CookWise Replacement:**
See [Database Schema](01-database-schema.md) for complete schema with:
- Household, User (with householdId)
- Recipe, Ingredient, RecipeIngredient, InstructionStep
- PantryItem
- MealPlan
- ShoppingList, ShoppingListItem

---

### 3. Authentication

#### `lib/auth.ts` (or `pages/api/auth/[...nextauth].ts`)

**Changes:**
```diff
// Add household to session
callbacks: {
  async session({ session, user }) {
    return {
      ...session,
      user: {
        ...session.user,
        id: user.id,
+       householdId: user.householdId,
      },
    }
  },
+ async signIn({ user, account }) {
+   // Ensure user has household
+   if (!user.householdId) {
+     // Create or join household flow
+   }
+   return true
+ },
}
```

---

#### `middleware.ts`

**Changes:**
```diff
export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard")
  
  if (isOnDashboard) {
    if (isLoggedIn) return Response.next()
    return Response.redirect(new URL("/sign-in", req.url))
  }
  
+ // Ensure household is set
+ if (isLoggedIn && !req.auth.user.householdId) {
+   return Response.redirect(new URL("/onboarding", req.url))
+ }
})
```

---

### 4. App Routes

#### Create New Route Structure

```diff
app/
├── (auth)/
│   ├── sign-in/
│   ├── sign-up/
+│   └── onboarding/          # NEW: Household setup
├── (dashboard)/
│   ├── dashboard/
+│   ├── recipes/             # NEW: Recipe management
+│   ├── pantry/              # NEW: Pantry inventory
+│   ├── meal-plan/           # NEW: Meal calendar
+│   └── shopping-list/       # NEW: Shopping mode
├── api/
│   ├── auth/
+│   ├── recipes/             # NEW: Recipe CRUD + OCR
+│   ├── pantry/              # NEW: Pantry management
+│   ├── meal-plans/          # NEW: Meal planning
+│   └── shopping-lists/      # NEW: Shopping list
└── page.tsx
```

---

### 5. Component Replacements

#### `components/site-header.tsx`

**Changes:**
```diff
- <NavItem href="/docs">Docs</NavItem>
- <NavItem href="/examples">Examples</NavItem>
- <NavItem href="/blog">Blog</NavItem>
+ <NavItem href="/recipes">Recipes</NavItem>
+ <NavItem href="/pantry">Pantry</NavItem>
+ <NavItem href="/meal-plan">Meal Plan</NavItem>
+ <NavItem href="/shopping-list">Shopping</NavItem>
```

---

#### `components/main-nav.tsx`

**Changes:**
```diff
export function MainNav() {
  return (
    <nav className="flex items-center gap-6">
      <Link href="/" className="flex items-center space-x-2">
-       <span className="font-bold">Taxonomy</span>
+       <span className="font-bold">CookWise</span>
+       <Icons.kitchen className="h-6 w-6" />
      </Link>
    </nav>
  )
}
```

---

#### `components/user-account-nav.tsx`

**Changes:**
```diff
items: [
  {
    title: "Settings",
    href: "/settings",
  },
+ {
+   title: "Household",
+   href: "/settings/household",
+ },
  {
    title: "Sign out",
    onClick: handleSignOut,
  },
]
```

---

### 6. New Components to Create

#### Recipe Components

```
components/recipes/
├── recipe-card.tsx           # Display recipe preview
├── recipe-form.tsx           # Create/edit recipe
├── recipe-upload.tsx         # Image/PDF upload for OCR
├── recipe-url-import.tsx     # URL scraper input
├── recipe-detail.tsx         # Full recipe view
├── recipe-list.tsx           # Searchable recipe grid
├── ingredient-list.tsx       # Ingredient checklist
└── instruction-steps.tsx     # Step-by-step view
```

---

#### Pantry Components

```
components/pantry/
├── pantry-item.tsx           # Single item display
├── pantry-list.tsx           # Filterable list
├── pantry-status.tsx         # Status badge (In/Low/Out)
├── add-pantry-item.tsx       # Add item modal
└── low-stock-alert.tsx       # Low stock warnings
```

---

#### Meal Plan Components

```
components/meal-plan/
├── meal-calendar.tsx         # Weekly calendar view
├── meal-slot.tsx             # Single meal slot
├── meal-planner.tsx          # Drag-drop planner
├── auto-fill-button.tsx      # "Surprise Me" button
└── meal-type-selector.tsx    # Breakfast/Lunch/Dinner
```

---

#### Shopping Components

```
components/shopping/
├── shopping-list.tsx         # Main list view
├── shopping-item.tsx         # Checkable item
├── shopping-mode.tsx         # Mobile-optimized view
├── category-section.tsx      # Grouped by category
└── trip-summary.tsx          # Post-shopping recap
```

---

### 7. Server Actions

#### Create New Actions

```
actions/
├── recipes.ts
│   ├── parseRecipeImage()
│   ├── scrapeRecipeUrl()
│   ├── createRecipe()
│   ├── updateRecipe()
│   └── deleteRecipe()
│
├── pantry.ts
│   ├── updatePantryItem()
│   ├── deductPantryStock()
│   ├── getLowStockItems()
│   └── bulkUpdatePantry()
│
├── meal-plans.ts
│   ├── addToMealPlan()
│   ├── removeFromMealPlan()
│   ├── autoFillMealPlan()
│   └── markMealAsCooked()
│
└── shopping-lists.ts
    ├── generateShoppingList()
    ├── toggleShoppingItem()
    ├── addShoppingItem()
    └── finishShoppingTrip()
```

---

### 8. API Routes

#### Create New Endpoints

```
app/api/
├── recipes/
│   ├── route.ts              # GET, POST
│   ├── parse/
│   │   ├── image/
│   │   └── url/
│   └── [id]/
│       └── route.ts          # GET, PUT, DELETE
│
├── pantry/
│   ├── route.ts              # GET
│   ├── low-stock/
│   │   └── route.ts          # GET
│   └── [ingredientId]/
│       └── route.ts          # PUT
│
├── meal-plans/
│   ├── route.ts              # GET, POST
│   ├── auto-fill/
│   │   └── route.ts          # POST
│   └── [id]/
│       └── route.ts          # DELETE, PUT
│
└── shopping-lists/
    ├── route.ts              # GET
    ├── generate/
    │   └── route.ts          # POST
    ├── items/
    │   └── route.ts          # POST
    └── complete/
        └── route.ts          # POST
```

---

### 9. UI Theme Customization

#### `app/globals.css`

**Changes:**
```diff
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    
+   /* Kitchen theme colors */
+   --kitchen: 142 76% 36%;     /* Green for fresh */
+   --kitchen-foreground: 355 100% 100%;
+   
+   --pantry-low: 38 92% 50%;   /* Orange warning */
+   --pantry-out: 0 84% 60%;    /* Red out of stock */
+   --pantry-in: 142 76% 36%;   /* Green in stock */
    
    /* Keep existing shadcn colors */
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    /* ... */
  }
  
  .dark {
    /* Dark mode equivalents */
  }
}
```

---

### 10. Icons

#### `components/icons.tsx`

**Add New Icons:**
```diff
export function Icons() {
  return {
    // Keep existing
    spinner,
    gitHub,
    twitter,
    
+   // Kitchen icons
+   kitchen: (props) => <Utensils {...props} />,
+   chef: (props) => <ChefHat {...props} />,
+   pantry: (props) => <Package {...props} />,
+   calendar: (props) => <Calendar {...props} />,
+   shopping: (props) => <ShoppingCart {...props} />,
+   recipe: (props) => <BookOpen {...props} />,
+   upload: (props) => <Upload {...props} />,
+   scan: (props) => <Scan {...props} />,
+   check: (props) => <CheckCircle {...props} />,
+   warning: (props) => <AlertTriangle {...props} />,
  }
}
```

---

### 11. Content & Copy

#### Update All References

| File | Change |
|------|--------|
| `app/layout.tsx` | Title: "Taxonomy" → "CookWise" |
| `app/page.tsx` | Hero copy: Blog → Kitchen OS |
| `components/site-footer.tsx` | Copyright, links |
| `lib/constants.ts` | Site name, description |
| `metadata` | SEO titles, descriptions |

---

### 12. Features to Remove

**Delete or Disable:**

| Component | Path | Action |
|-----------|------|--------|
| Blog | `app/blog/` | Delete |
| Examples | `app/examples/` | Delete |
| Docs | `app/docs/` | Delete |
| Post CRUD | `app/dashboard/posts/` | Delete |
| Analytics | `app/dashboard/analytics/` | Delete |

---

## Migration Steps

### Phase 1: Setup (Day 1)

1. Clone Taxonomy template
2. Update `package.json` name/metadata
3. Install additional dependencies (Gemini AI)
4. Replace Prisma schema
5. Run migrations

### Phase 2: Core Structure (Day 2-3)

1. Update authentication with household
2. Create new route structure
3. Update navigation/header
4. Replace theme colors

### Phase 3: Features (Day 4-10)

1. Build Recipe components + OCR
2. Build Pantry components
3. Build Meal Plan calendar
4. Build Shopping List + mode

### Phase 4: Polish (Day 11-14)

1. Remove unused Taxonomy code
2. Update all copy/content
3. Test all flows
4. Performance optimization

---

## Template-Specific Notes

### What Taxonomy Does Well

✅ **Authentication:** NextAuth.js setup is solid, just extend session  
✅ **UI Components:** shadcn/ui components work out of the box  
✅ **TypeScript:** Full type safety, keep this  
✅ **SEO:** Metadata API usage is excellent  
✅ **Dark Mode:** Theme provider works great  

### What Needs Work

⚠️ **Database:** Schema is blog-focused, complete replacement needed  
⚠️ **Routes:** Blog/content routes need full replacement  
⚠️ **Dashboard:** Analytics/posts → Kitchen dashboard  
⚠️ **Content:** All copy references blog/docs  

---

## Quick Reference

### Taxonomy → CookWise Mapping

| Taxonomy Concept | CookWise Equivalent |
|------------------|---------------------|
| Post | Recipe |
| Author | User (with household) |
| Category | Ingredient Category |
| Tag | Recipe Tag |
| Dashboard | Meal Plan Dashboard |
| Settings | Household Settings |
| Blog Home | Recipe Library |

---

## Related Documents

- [Database Schema](01-database-schema.md) - New schema design
- [Technical Specification](02-technical-spec.md) - Architecture details
- [API Reference](05-api-reference.md) - New endpoints
- [User Flows](04-user-flows.md) - Feature requirements

---

*Document Version: 1.0 | Last Updated: 2026-02-17 | CookWise Technical Team*
