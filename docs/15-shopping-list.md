---
title: CookWise Shopping List Guide
description: Kitchen-OS Documentation
---

> **Product:** CookWise - The AI-Powered Kitchen Operating System  
> **Domain:** cookwise.io  
> **Version:** 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [List Generation](#list-generation)
3. [Shopping Mode](#shopping-mode)
4. [Checking Items](#checking-items)
5. [Finish Trip](#finish-trip)

---

## Overview

The shopping list feature aggregates ingredients from meal plans, subtracts pantry stock, and provides a mobile-optimized shopping experience.

**Key Features:**
- Auto-generation from meal plans
- Category grouping (Produce, Dairy, etc.)
- Mobile shopping mode with wake lock
- Trip completion with pantry restocking

---

## List Generation

### Generate from Meal Plan

```typescript
// components/shopping-list/generate-button.tsx
export function GenerateListButton({ weekOf }: { weekOf: Date }) {
  const [isGenerating, setIsGenerating] = useState(false)

  async function handleGenerate() {
    setIsGenerating(true)
    try {
      await generateShoppingList(weekOf.toISOString())
      toast({ title: "Shopping list generated!" })
    } catch (error) {
      toast({ title: "Generation failed", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={handleGenerate} disabled={isGenerating}>
      {isGenerating ? "Generating..." : "Generate Shopping List"}
    </Button>
  )
}
```

### Server Action

```typescript
// actions/shopping-lists.ts
"use server"

export async function generateShoppingList(weekOf: string): Promise<ShoppingList> {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const householdId = session.user.householdId!
  const weekStart = new Date(weekOf)
  const weekEnd = addDays(weekStart, 7)

  // 1. Get meal plans for the week
  const mealPlans = await prisma.mealPlan.findMany({
    where: {
      householdId,
      date: { gte: weekStart, lt: weekEnd }
    },
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

  // 2. Aggregate ingredients
  const ingredientMap = new Map<string, AggregatedIngredient>()

  for (const plan of mealPlans) {
    for (const recipeIng of plan.recipe.ingredients) {
      const key = recipeIng.ingredient.name
      const existing = ingredientMap.get(key)

      if (existing) {
        existing.quantity += recipeIng.quantity
        existing.recipeIds.push(plan.recipe.id)
      } else {
        ingredientMap.set(key, {
          ingredientId: recipeIng.ingredientId,
          name: recipeIng.ingredient.name,
          quantity: recipeIng.quantity,
          unit: recipeIng.unit,
          category: recipeIng.ingredient.category,
          recipeIds: [plan.recipe.id]
        })
      }
    }
  }

  // 3. Subtract pantry stock
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
    const pantryItem = pantryItems.find((p) => p.ingredient.name === name)
    const needed = pantryItem ? data.quantity - pantryItem.quantity : data.quantity

    if (needed > 0) {
      itemsToBuy.push({
        ingredientId: data.ingredientId,
        name,
        quantity: needed,
        unit: data.unit,
        category: data.category
      })
    }
  }

  // 4. Create or get shopping list
  let shoppingList = await prisma.shoppingList.findFirst({
    where: { householdId, weekOf: weekStart, isActive: true }
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

  // 5. Create shopping list items
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

## Shopping Mode

### Mobile Shopping Mode

```typescript
// components/shopping/shopping-mode.tsx
"use client"

import { useEffect } from "react"
import { useWakeLock } from "@/hooks/use-wake-lock"
import { ShoppingList } from "./shopping-list"

export function ShoppingMode({
  items,
  onToggle,
  onFinish,
  onExit
}: ShoppingModeProps) {
  const { isLocked, requestWakeLock, releaseWakeLock } = useWakeLock()
  const [completed, setCompleted] = useState(0)

  useEffect(() => {
    requestWakeLock()
    return () => releaseWakeLock()
  }, [])

  useEffect(() => {
    setCompleted(items.filter((i) => i.is_checked).length)
  }, [items])

  const progress = items.length > 0 ? (completed / items.length) * 100 : 0

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      <header className="border-b p-4 flex items-center justify-between sticky top-0 bg-background z-10">
        <Button variant="ghost" onClick={onExit}>
          <Icons.chevronLeft className="h-4 w-4 mr-2" />
          Exit
        </Button>

        <div className="flex items-center gap-2">
          <Icons.bolt className="h-5 w-5 text-primary" />
          <span className="font-medium">Shopping Mode</span>
          {isLocked && (
            <span className="text-xs text-muted-foreground ml-2">
              Screen stays on
            </span>
          )}
        </div>

        <Button onClick={onFinish}>
          Finish Trip
        </Button>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Summary */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {items.length - completed} items remaining
          </span>
          <span className="text-sm font-medium">
            {completed}/{items.length} completed
          </span>
        </div>
      </div>

      {/* List */}
      <main className="flex-1 overflow-auto p-4">
        <ShoppingList items={items} onToggle={onToggle} mode="shopping" />
      </main>
    </div>
  )
}
```

### Wake Lock Hook

```typescript
// hooks/use-wake-lock.ts
"use client"

import { useState, useEffect, useCallback } from "react"

export function useWakeLock() {
  const [isLocked, setIsLocked] = useState(false)
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null)

  const requestWakeLock = useCallback(async () => {
    if ("wakeLock" in navigator) {
      try {
        const lock = await navigator.wakeLock.request("screen")
        setWakeLock(lock)
        setIsLocked(true)

        lock.addEventListener("release", () => {
          setIsLocked(false)
        })
      } catch (err) {
        console.error("Wake Lock error:", err)
      }
    }
  }, [])

  const releaseWakeLock = useCallback(() => {
    if (wakeLock) {
      wakeLock.release()
      setWakeLock(null)
    }
  }, [wakeLock])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && wakeLock === null) {
        requestWakeLock()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      releaseWakeLock()
    }
  }, [wakeLock, requestWakeLock, releaseWakeLock])

  return { isLocked, requestWakeLock, releaseWakeLock }
}
```

---

## Checking Items

### Toggle Item

```typescript
// components/shopping/shopping-item.tsx
"use client"

import { useOptimistic } from "react"
import { Checkbox } from "@/components/ui/checkbox"

export function ShoppingItem({
  item,
  onToggle
}: {
  item: ShoppingListItem
  onToggle: (id: string, checked: boolean) => void
}) {
  const [optimisticItem, setOptimisticItem] = useOptimistic(
    item,
    (state, newChecked: boolean) => ({
      ...state,
      is_checked: newChecked,
      checkedAt: newChecked ? new Date() : null
    })
  )

  async function handleToggle() {
    const newChecked = !optimisticItem.is_checked
    setOptimisticItem(newChecked)
    await onToggle(item.id, newChecked)
  }

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg ${
        optimisticItem.is_checked ? "bg-muted opacity-60" : ""
      }`}
    >
      <div className="flex items-center gap-3 flex-1">
        <Checkbox
          checked={optimisticItem.is_checked}
          onCheckedChange={handleToggle}
          className="h-5 w-5"
        />
        
        <div className="flex-1">
          <div className="font-medium">
            {optimisticItem.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {optimisticItem.quantity} {optimisticItem.unit}
            {optimisticItem.aisle && ` • ${optimisticItem.aisle}`}
          </div>
        </div>
      </div>

      {optimisticItem.is_checked && (
        <Icons.check className="h-5 w-5 text-green-600" />
      )}
    </div>
  )
}
```

---

## Finish Trip

### Complete Shopping Trip

```typescript
// components/shopping/finish-trip-button.tsx
export function FinishTripButton({ shoppingListId }: { shoppingListId: string }) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)

  async function handleFinish() {
    setIsFinishing(true)
    try {
      const result = await finishShoppingTrip(shoppingListId)
      
      toast({
        title: "Shopping trip complete!",
        description: `${result.restockedItems.length} items added to pantry`
      })
      
      setIsConfirming(false)
      router.push("/pantry")
    } catch (error) {
      toast({ title: "Failed to finish trip", variant: "destructive" })
    } finally {
      setIsFinishing(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsConfirming(true)}>
        Finish Shopping Trip
      </Button>

      <Dialog open={isConfirming} onOpenChange={setIsConfirming}>
        <DialogContent>
          <h2>Finish Shopping Trip?</h2>
          <p>
            This will add all checked items to your pantry inventory.
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsConfirming(false)}>
              Cancel
            </Button>
            <Button onClick={handleFinish} disabled={isFinishing}>
              {isFinishing ? "Finishing..." : "Confirm & Restock"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

### Server Action

```typescript
// actions/shopping-lists.ts
"use server"

export async function finishShoppingTrip(
  shoppingListId: string
): Promise<{ restockedItems: any[] }> {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const householdId = session.user.householdId!

  // Get all checked items
  const checkedItems = await prisma.shoppingListItem.findMany({
    where: {
      shoppingListId,
      is_checked: true
    },
    include: {
      ingredient: true
    }
  })

  // Restock pantry for each item
  const restockedItems: any[] = []

  await prisma.$transaction(
    checkedItems.map((item) =>
      prisma.pantryItem.upsert({
        where: {
          householdId_ingredientId: {
            householdId,
            ingredientId: item.ingredientId
          }
        },
        update: {
          quantity: { increment: item.quantity },
          status: {
            set: calculatePantryStatus(item.quantity, 1)
          }
        },
        create: {
          householdId,
          ingredientId: item.ingredientId,
          quantity: item.quantity,
          unit: item.unit,
          status: "IN_STOCK"
        }
      }).then((updated) => {
        restockedItems.push(updated)
      })
    )
  )

  // Mark list as inactive
  await prisma.shoppingList.update({
    where: { id: shoppingListId },
    data: { isActive: false }
  })

  // Create new list for next week
  const nextWeek = addDays(new Date(shoppingListId), 7)
  await prisma.shoppingList.create({
    data: {
      householdId,
      weekOf: nextWeek,
      name: `Week of ${nextWeek.toLocaleDateString()}`
    }
  })

  revalidatePath("/pantry")
  revalidatePath("/shopping-list")

  return { restockedItems }
}
```

---

## Related Documents

- [User Flows](04-user-flows.md) - Shopping flow details
- [Pantry Management](13-pantry-management.md) - Restocking logic
- [Component Library](08-component-library.md) - Shopping components

---

*Document Version: 1.0 | Last Updated: 2026-02-17 | CookWise Technical Team*
