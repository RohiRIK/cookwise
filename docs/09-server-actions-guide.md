# CookWise Server Actions Guide

> **Product:** CookWise - The AI-Powered Kitchen Operating System  
> **Domain:** cookwise.io  
> **Version:** 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Recipe Actions](#recipe-actions)
3. [Pantry Actions](#pantry-actions)
4. [Meal Plan Actions](#meal-plan-actions)
5. [Shopping List Actions](#shopping-list-actions)
6. [Best Practices](#best-practices)

---

## Overview

Server actions are async functions that run on the server and can be called from client components. All actions follow this pattern:

```typescript
// actions/example.ts
"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function exampleAction(input: ExampleInput) {
  // 1. Validate authentication
  const session = await auth()
  if (!session?.user) {
    throw new UnauthorizedError()
  }

  // 2. Validate input
  const validated = ExampleSchema.parse(input)

  // 3. Perform database operation
  const result = await prisma.example.create({
    data: { ...validated, userId: session.user.id }
  })

  // 4. Revalidate cache
  revalidatePath("/examples")

  // 5. Return result
  return result
}
```

---

## Recipe Actions

### `parseRecipeImage`

Parse recipe from uploaded image using Gemini OCR.

```typescript
// actions/recipes.ts
"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { geminiClient } from "@/lib/ai/gemini"
import { validateRecipeOutput } from "@/lib/ai/validation"

export async function parseRecipeImage(
  imageFile: File,
  recipeId?: string
): Promise<{ recipeId: string; status: "pending_review" | "created" }> {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  // Convert file to buffer
  const arrayBuffer = await imageFile.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Send to Gemini API
  const result = await geminiClient.generateContent({
    contents: [{
      role: "user",
      parts: [
        { text: "Extract this recipe as JSON. Follow the schema exactly." },
        { inlineData: { mimeType: imageFile.type, data: buffer.toString("base64") } }
      ]
    }]
  })

  // Parse and validate JSON
  const parsed = JSON.parse(result.response.text())
  const validated = validateRecipeOutput(parsed)

  // Create draft recipe
  const recipe = await prisma.recipe.create({
    data: {
      title: validated.title,
      description: validated.description,
      prepTime: validated.prepTime,
      cookTime: validated.cookTime,
      servings: validated.servings,
      difficulty: validated.difficulty,
      tags: validated.tags,
      sourceType: "OCR_IMAGE",
      householdId: session.user.householdId!,
      creatorId: session.user.id,
      ingredients: {
        create: validated.ingredients.map((ing) => ({
          ingredient: {
            connectOrCreate: {
              where: { name: ing.item },
              create: { name: ing.item, category: ing.category }
            }
          },
          quantity: ing.quantity,
          unit: ing.unit,
          originalText: ing.originalText,
          notes: ing.notes
        }))
      },
      instructionSteps: {
        create: validated.instructions.map((step) => ({
          stepNumber: step.stepNumber,
          instruction: step.instruction
        }))
      }
    }
  })

  return {
    recipeId: recipe.id,
    status: "pending_review"
  }
}
```

---

### `saveRecipe`

Save or update recipe after review.

```typescript
export async function saveRecipe(
  recipeId: string,
  data: RecipeInput
): Promise<Recipe> {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const recipe = await prisma.recipe.upsert({
    where: { id: recipeId },
    update: {
      title: data.title,
      description: data.description,
      prepTime: data.prepTime,
      cookTime: data.cookTime,
      servings: data.servings,
      difficulty: data.difficulty,
      tags: data.tags,
      // Update ingredients and steps...
    },
    create: {
      ...data,
      householdId: session.user.householdId!,
      creatorId: session.user.id,
      sourceType: "MANUAL"
    }
  })

  revalidatePath("/recipes")
  return recipe
}
```

---

## Pantry Actions

### `updatePantryItem`

Update or create pantry item.

```typescript
// actions/pantry.ts
"use server"

export async function updatePantryItem(
  ingredientId: string,
  quantity: number,
  unit: string,
  minQuantity?: number
): Promise<PantryItem> {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const pantryItem = await prisma.pantryItem.upsert({
    where: {
      householdId_ingredientId: {
        householdId: session.user.householdId!,
        ingredientId
      }
    },
    update: {
      quantity,
      unit,
      minQuantity: minQuantity ?? 1,
      status: calculatePantryStatus(quantity, minQuantity ?? 1)
    },
    create: {
      householdId: session.user.householdId!,
      ingredientId,
      quantity,
      unit,
      minQuantity: minQuantity ?? 1,
      status: calculatePantryStatus(quantity, minQuantity ?? 1)
    }
  })

  revalidatePath("/pantry")
  return pantryItem
}

function calculatePantryStatus(
  quantity: number,
  minQuantity: number
): "IN_STOCK" | "LOW" | "OUT" {
  if (quantity <= 0) return "OUT"
  if (quantity <= minQuantity) return "LOW"
  return "IN_STOCK"
}
```

---

### `deductPantryStock`

Deduct ingredients when meal is cooked.

```typescript
export async function deductPantryStock(
  mealPlanId: string
): Promise<{ success: boolean; deductedItems: any[]; warnings: any[] }> {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const mealPlan = await prisma.mealPlan.findUnique({
    where: { id: mealPlanId },
    include: {
      recipe: {
        include: {
          ingredients: {
            include: { ingredient: true }
          }
        }
      }
    }
  })

  if (!mealPlan || mealPlan.householdId !== session.user.householdId) {
    throw new Error("Meal plan not found")
  }

  const warnings: any[] = []
  const deductedItems: any[] = []

  // Deduct each ingredient
  await prisma.$transaction(
    mealPlan.recipe.ingredients.map((recipeIng) =>
      prisma.pantryItem.update({
        where: {
          householdId_ingredientId: {
            householdId: session.user.householdId!,
            ingredientId: recipeIng.ingredientId
          }
        },
        data: {
          quantity: { decrement: recipeIng.quantity },
          status: {
            set: calculatePantryStatus(
              // This would need a callback to get new value
              recipeIng.quantity,
              1
            )
          }
        },
        select: {
          ingredient: { select: { name: true } },
          quantity: true
        }
      })
    )
  )

  // Check for low stock
  const lowStockItems = await getLowStockItems(session.user.householdId!)
  warnings.push(...lowStockItems)

  revalidatePath("/pantry")
  return { success: true, deductedItems, warnings }
}
```

---

## Meal Plan Actions

### `addToMealPlan`

Add recipe to meal plan.

```typescript
// actions/meal-plans.ts
"use server"

export async function addToMealPlan(
  recipeId: string,
  date: string,
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK",
  servings?: number
): Promise<MealPlan> {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  // Check for conflicts
  const existing = await prisma.mealPlan.findUnique({
    where: {
      householdId_recipeId_date_mealType: {
        householdId: session.user.householdId!,
        recipeId,
        date: new Date(date),
        mealType
      }
    }
  })

  if (existing) {
    throw new Error("Meal already planned for this slot")
  }

  const mealPlan = await prisma.mealPlan.create({
    data: {
      recipeId,
      householdId: session.user.householdId!,
      userId: session.user.id,
      date: new Date(date),
      mealType,
      servings: servings ?? 4
    },
    include: {
      recipe: {
        select: {
          id: true,
          title: true,
          imageUrl: true
        }
      }
    }
  })

  revalidatePath("/meal-plan")
  return mealPlan
}
```

---

### `autoFillMealPlan`

Auto-fill empty meal slots (Lazy Button).

```typescript
export async function autoFillMealPlan(
  weekOf: string,
  options?: { usePantryFirst?: boolean; excludeRecipeIds?: string[] }
): Promise<MealPlan[]> {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const weekStart = new Date(weekOf)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)
    return date
  })

  const mealTypes = ["BREAKFAST", "LUNCH", "DINNER"] as const
  const filledPlans: MealPlan[] = []

  // Get available recipes
  let recipes = await prisma.recipe.findMany({
    where: {
      householdId: session.user.householdId,
      id: options?.excludeRecipeIds
        ? { notIn: options.excludeRecipeIds }
        : undefined
    },
    select: { id: true, title: true }
  })

  // If pantry-first, prioritize recipes with in-stock ingredients
  if (options?.usePantryFirst) {
    const pantryItems = await prisma.pantryItem.findMany({
      where: {
        householdId: session.user.householdId!,
        status: "IN_STOCK"
      },
      select: { ingredientId: true }
    })

    // Filter recipes that use pantry items
    recipes = recipes.filter((recipe) => {
      // Check if recipe uses pantry items
      // Implementation depends on your data structure
      return true // Simplified
    })
  }

  // Find empty slots and fill them
  for (const day of weekDays) {
    for (const mealType of mealTypes) {
      const existing = await prisma.mealPlan.findUnique({
        where: {
          householdId_recipeId_date_mealType: {
            householdId: session.user.householdId!,
            recipeId: recipes[0]?.id ?? "",
            date: day,
            mealType
          }
        }
      })

      if (!existing && recipes.length > 0) {
        // Pick random recipe
        const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)]

        const plan = await prisma.mealPlan.create({
          data: {
            recipeId: randomRecipe.id,
            householdId: session.user.householdId!,
            date: day,
            mealType,
            servings: 4
          }
        })

        filledPlans.push(plan)
      }
    }
  }

  revalidatePath("/meal-plan")
  return filledPlans
}
```

---

## Shopping List Actions

### `generateShoppingList`

Generate shopping list from meal plan.

```typescript
// actions/shopping-lists.ts
"use server"

export async function generateShoppingList(
  weekOf: string
): Promise<ShoppingList> {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const householdId = session.user.householdId!

  // Get meal plans for the week
  const weekStart = new Date(weekOf)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const mealPlans = await prisma.mealPlan.findMany({
    where: {
      householdId,
      date: {
        gte: weekStart,
        lt: weekEnd
      }
    },
    include: {
      recipe: {
        include: {
          ingredients: {
            include: {
              ingredient: true
            }
          }
        }
      }
    }
  })

  // Aggregate ingredients
  const ingredientMap = new Map<string, {
    quantity: number
    unit: string
    category: string
    recipeIds: string[]
  }>()

  for (const plan of mealPlans) {
    for (const recipeIng of plan.recipe.ingredients) {
      const key = recipeIng.ingredient.name
      const existing = ingredientMap.get(key)

      if (existing) {
        existing.quantity += recipeIng.quantity
        existing.recipeIds.push(plan.recipe.id)
      } else {
        ingredientMap.set(key, {
          quantity: recipeIng.quantity,
          unit: recipeIng.unit,
          category: recipeIng.ingredient.category,
          recipeIds: [plan.recipe.id]
        })
      }
    }
  }

  // Subtract pantry stock
  const pantryItems = await prisma.pantryItem.findMany({
    where: { householdId }
  })

  const itemsToBuy: Array<{
    ingredientId: string
    name: string
    quantity: number
    unit: string
    category: string
  }> = []

  for (const [name, data] of ingredientMap.entries()) {
    const pantryItem = pantryItems.find(
      (p) => p.ingredient.name === name
    )

    const needed = pantryItem
      ? data.quantity - pantryItem.quantity
      : data.quantity

    if (needed > 0) {
      const ingredient = await prisma.ingredient.findUnique({
        where: { name }
      })

      itemsToBuy.push({
        ingredientId: ingredient?.id ?? "",
        name,
        quantity: needed,
        unit: data.unit,
        category: data.category
      })
    }
  }

  // Create or get shopping list
  let shoppingList = await prisma.shoppingList.findFirst({
    where: {
      householdId,
      weekOf: weekStart,
      isActive: true
    }
  })

  if (!shoppingList) {
    shoppingList = await prisma.shoppingList.create({
      data: {
        householdId,
        weekOf: weekStart,
        name: `Week of ${weekStart.toLocaleDateString()}`
      }
    })
  }

  // Create shopping list items
  await prisma.shoppingListItem.createMany({
    data: itemsToBuy.map((item) => ({
      shoppingListId: shoppingList!.id,
      ingredientId: item.ingredientId,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category
    }))
  })

  revalidatePath("/shopping-list")
  return shoppingList
}
```

---

### `toggleShoppingItem`

Toggle item checked status.

```typescript
export async function toggleShoppingItem(
  itemId: string,
  isChecked: boolean
): Promise<ShoppingListItem> {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const item = await prisma.shoppingListItem.update({
    where: { id: itemId },
    data: {
      is_checked: isChecked,
      checkedAt: isChecked ? new Date() : null,
      checkedByUserId: session.user.id
    }
  })

  revalidatePath("/shopping-list")
  return item
}
```

---

## Best Practices

### 1. Always Validate Auth

```typescript
✅ DO:
const session = await auth()
if (!session?.user) throw new Error("Unauthorized")

❌ DON'T:
// Assuming user is authenticated
```

### 2. Scope to Household

```typescript
✅ DO:
where: {
  id,
  householdId: session.user.householdId
}

❌ DON'T:
where: { id } // Missing household scope
```

### 3. Revalidate After Mutations

```typescript
✅ DO:
await prisma.recipe.create({ ... })
revalidatePath("/recipes")

❌ DON'T:
// Not revalidating, stale data shown
```

### 4. Use Transactions for Multiple Writes

```typescript
✅ DO:
await prisma.$transaction([
  prisma.pantryItem.update(...),
  prisma.shoppingListItem.delete(...)
])

❌ DON'T:
// Multiple separate calls, potential inconsistency
```

### 5. Handle Errors Gracefully

```typescript
✅ DO:
try {
  await action()
  toast({ title: "Success!" })
} catch (error) {
  toast({
    title: "Failed",
    description: error.message,
    variant: "destructive"
  })
}
```

---

## Related Documents

- [API Reference](05-api-reference.md) - REST endpoints
- [Component Library](08-component-library.md) - UI integration
- [Authentication Guide](10-authentication-guide.md) - Auth patterns

---

*Document Version: 1.0 | Last Updated: 2026-02-17 | CookWise Technical Team*
