# CookWise Meal Planning Guide

> **Product:** CookWise - The AI-Powered Kitchen Operating System  
> **Domain:** cookwise.io  
> **Version:** 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Calendar View](#calendar-view)
3. [Adding Meals](#adding-meals)
4. [Auto-Fill (Lazy Button)](#auto-fill-lazy-button)
5. [Cooking Flow](#cooking-flow)

---

## Overview

Meal planning allows users to schedule recipes for specific dates and meal types. Features include:
- **Weekly calendar** view
- **Drag-and-drop** meal scheduling
- **Auto-fill** for quick planning
- **Cooking tracking** with pantry deduction

---

## Calendar View

### Weekly Calendar Component

```typescript
// components/meal-plan/meal-calendar.tsx
export function MealCalendar({ weekStart, mealPlans }: Props) {
  const weekDays = Array.from({ length: 7 }, (_, i) => 
    addDays(weekStart, i)
  )

  const mealTypes = ["BREAKFAST", "LUNCH", "DINNER"] as const

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1000px]">
        {/* Header Row */}
        <div className="grid grid-cols-8 border-b">
          <div className="p-4 font-medium">Meal</div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="p-4 text-center border-l">
              <div className="text-sm font-medium">{format(day, "EEE")}</div>
              <div className="text-xs text-muted-foreground">
                {format(day, "MMM d")}
              </div>
            </div>
          ))}
        </div>

        {/* Meal Type Rows */}
        {mealTypes.map((mealType) => (
          <div key={mealType} className="grid grid-cols-8 border-b min-h-[120px]">
            <div className="p-4 font-medium flex items-center">
              {mealType}
            </div>
            {weekDays.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd")
              const plan = mealPlans.find(
                (p) => p.date === dateStr && p.mealType === mealType
              )

              return (
                <div key={`${dateStr}-${mealType}`} className="border-l p-2">
                  <MealSlot mealPlan={plan} />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Meal Slot Component

```typescript
// components/meal-plan/meal-slot.tsx
export function MealSlot({ mealPlan }: { mealPlan?: MealPlan }) {
  const [isAdding, setIsAdding] = useState(false)

  if (!mealPlan) {
    return (
      <div
        className="h-full border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5"
        onClick={() => setIsAdding(true)}
      >
        <Button variant="ghost" size="sm">
          <Icons.plus className="h-4 w-4 mr-2" />
          Add Meal
        </Button>
      </div>
    )
  }

  return (
    <Card className="h-full">
      <CardContent className="p-2">
        {mealPlan.recipe.imageUrl ? (
          <img
            src={mealPlan.recipe.imageUrl}
            alt={mealPlan.recipe.title}
            className="w-full h-20 object-cover rounded mb-2"
          />
        ) : null}
        
        <h4 className="font-medium text-sm truncate">
          {mealPlan.recipe.title}
        </h4>
        
        <div className="flex items-center justify-between mt-2">
          <Badge variant="outline" className="text-xs">
            {mealPlan.recipe.difficulty}
          </Badge>
          {mealPlan.isCooked && (
            <Icons.check className="h-4 w-4 text-green-600" />
          )}
        </div>

        <div className="flex gap-1 mt-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsAdding(true)}
          >
            <Icons.edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => removeMeal(mealPlan.id)}
          >
            <Icons.trash className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## Adding Meals

### Add to Meal Plan

```typescript
// components/meal-plan/add-meal-dialog.tsx
export function AddMealDialog({ date, mealType }: Props) {
  const [open, setOpen] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null)

  async function handleAdd() {
    if (!selectedRecipe) return

    await addToMealPlan({
      recipeId: selectedRecipe,
      date,
      mealType
    })

    toast({ title: "Meal added to plan" })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <h2>Add Meal</h2>
        <p className="text-sm text-muted-foreground">
          {format(date, "EEEE, MMM d")} - {mealType}
        </p>

        <RecipeSelector
          value={selectedRecipe}
          onChange={setSelectedRecipe}
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!selectedRecipe}>
            Add Meal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### Drag and Drop

```typescript
// components/meal-plan/drag-drop-calendar.tsx
import { DndContext, DragEndEvent } from "@dnd-kit/core"

export function DragDropCalendar() {
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      // Parse data from drag
      const recipeId = active.id as string
      const { date, mealType } = parseOverId(over.id as string)

      // Update meal plan
      moveMealPlan(recipeId, date, mealType)
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <MealCalendar />
      <RecipeSidebar />
    </DndContext>
  )
}
```

---

## Auto-Fill (Lazy Button)

### Auto-Fill Component

```typescript
// components/meal-plan/auto-fill-button.tsx
export function AutoFillButton({ weekOf }: { weekOf: Date }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isFilling, setIsFilling] = useState(false)

  async function handleAutoFill(options: { usePantryFirst: boolean }) {
    setIsFilling(true)
    try {
      await autoFillMealPlan(weekOf, {
        usePantryFirst: options.usePantryFirst
      })
      toast({ title: "Meal plan auto-filled!" })
      setIsOpen(false)
    } catch (error) {
      toast({ title: "Auto-fill failed", variant: "destructive" })
    } finally {
      setIsFilling(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button onClick={() => setIsOpen(true)} variant="outline">
        <Icons.sparkles className="h-4 w-4 mr-2" />
        Surprise Me (Auto-Fill)
      </Button>

      <DialogContent>
        <h2>Auto-Fill Meal Plan</h2>
        <p className="text-sm text-muted-foreground">
          Automatically fill empty meal slots for the week of {format(weekOf, "MMM d")}
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox id="pantry-first" />
            <Label htmlFor="pantry-first">
              Prioritize recipes using pantry items
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleAutoFill({ usePantryFirst: true })}
              disabled={isFilling}
            >
              {isFilling ? "Filling..." : "Auto-Fill"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### Server Action

```typescript
// actions/meal-plans.ts
"use server"

export async function autoFillMealPlan(
  weekOf: string,
  options?: { usePantryFirst?: boolean }
): Promise<{ filled: number }> {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const householdId = session.user.householdId!
  const weekStart = new Date(weekOf)

  // Get all recipes
  let recipes = await prisma.recipe.findMany({
    where: { householdId },
    select: { id: true, title: true }
  })

  // If pantry-first, filter recipes
  if (options?.usePantryFirst) {
    const pantryItems = await prisma.pantryItem.findMany({
      where: { householdId, status: "IN_STOCK" }
    })

    // Filter to recipes that use pantry items
    recipes = recipes.filter((recipe) => {
      // Check if recipe ingredients match pantry
      return true // Simplified
    })
  }

  // Find empty slots and fill
  let filled = 0
  const mealTypes = ["BREAKFAST", "LUNCH", "DINNER"]

  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i)

    for (const mealType of mealTypes) {
      // Check if slot is empty
      const existing = await prisma.mealPlan.findUnique({
        where: {
          householdId_recipeId_date_mealType: {
            householdId,
            recipeId: "",
            date,
            mealType: mealType as MealType
          }
        }
      })

      if (!existing && recipes.length > 0) {
        // Pick random recipe
        const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)]

        await prisma.mealPlan.create({
          data: {
            recipeId: randomRecipe.id,
            householdId,
            date,
            mealType: mealType as MealType,
            servings: 4
          }
        })

        filled++
      }
    }
  }

  revalidatePath("/meal-plan")
  return { filled }
}
```

---

## Cooking Flow

### Mark as Cooked

```typescript
// components/meal-plan/mark-cooked-button.tsx
export function MarkCookedButton({ mealPlanId }: { mealPlanId: string }) {
  const [isConfirming, setIsConfirming] = useState(false)

  async function handleMarkCooked() {
    try {
      const result = await markMealAsCooked(mealPlanId)
      
      toast({
        title: "Meal marked as cooked!",
        description: result.warnings.length > 0 
          ? `Warning: ${result.warnings.join(", ")}`
          : undefined
      })
      
      setIsConfirming(false)
    } catch (error) {
      toast({ title: "Failed to mark as cooked", variant: "destructive" })
    }
  }

  return (
    <>
      <Button onClick={() => setIsConfirming(true)}>
        <Icons.check className="h-4 w-4 mr-2" />
        Mark as Cooked
      </Button>

      <Dialog open={isConfirming} onOpenChange={setIsConfirming}>
        <DialogContent>
          <h2>Confirm Cooking</h2>
          <p>
            This will deduct the ingredients from your pantry. 
            Make sure you've cooked this meal!
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsConfirming(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkCooked}>
              Confirm & Deduct Ingredients
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

---

## Related Documents

- [User Flows](04-user-flows.md) - Cooking flow details
- [Pantry Management](13-pantry-management.md) - Automatic deduction
- [Component Library](08-component-library.md) - Calendar components

---

*Document Version: 1.0 | Last Updated: 2026-02-17 | CookWise Technical Team*
