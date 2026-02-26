---
title: CookWise Pantry Management Guide
description: Kitchen-OS Documentation
---

> **Product:** CookWise - The AI-Powered Kitchen Operating System  
> **Domain:** cookwise.io  
> **Version:** 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Pantry Structure](#pantry-structure)
3. [Adding Items](#adding-items)
4. [Updating Quantities](#updating-quantities)
5. [Low Stock Alerts](#low-stock-alerts)
6. [Automatic Deduction](#automatic-deduction)

---

## Overview

The pantry tracks household ingredient inventory. Key features:
- **Real-time tracking** of ingredient quantities
- **Status indicators** (In Stock, Low, Out)
- **Automatic deduction** when meals are cooked
- **Low stock alerts** for shopping list generation

---

## Pantry Structure

### Data Model

```prisma
model PantryItem {
  id           String       @id @default(uuid())
  ingredientId String
  householdId  String?
  quantity     Float        @default(0)
  unit         UnitType
  minQuantity  Float        @default(1)
  status       PantryStatus @default(IN_STOCK)
  expiryDate   DateTime?
  location     String?      // "Pantry", "Fridge", "Freezer"
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
}

enum PantryStatus {
  IN_STOCK
  LOW
  OUT
}
```

### Status Logic

```typescript
// lib/pantry/utils.ts
export function calculatePantryStatus(
  quantity: number,
  minQuantity: number
): PantryStatus {
  if (quantity <= 0) return "OUT"
  if (quantity <= minQuantity) return "LOW"
  return "IN_STOCK"
}

export function isLowStock(item: PantryItem): boolean {
  return item.quantity <= item.minQuantity
}
```

---

## Adding Items

### Manual Add

```typescript
// components/pantry/add-pantry-item.tsx
export function AddPantryItemDialog() {
  const [open, setOpen] = useState(false)
  const [ingredientName, setIngredientName] = useState("")

  async function handleAdd(formData: FormData) {
    const result = await addPantryItem({
      ingredientName,
      quantity: parseFloat(formData.get("quantity") as string),
      unit: formData.get("unit") as string,
      location: formData.get("location") as string
    })

    if (result.success) {
      toast({ title: "Item added to pantry" })
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <h2>Add to Pantry</h2>
        <form action={handleAdd}>
          <Input
            placeholder="Search ingredient..."
            value={ingredientName}
            onChange={(e) => setIngredientName(e.target.value)}
          />
          <Input type="number" name="quantity" placeholder="Quantity" step="0.1" />
          <Select name="unit">
            <option value="piece">Piece</option>
            <option value="gram">Gram</option>
            <option value="cup">Cup</option>
          </Select>
          <Select name="location">
            <option value="Pantry">Pantry</option>
            <option value="Fridge">Fridge</option>
            <option value="Freezer">Freezer</option>
          </Select>
          <Button type="submit">Add Item</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### Server Action

```typescript
// actions/pantry.ts
"use server"

export async function addPantryItem(data: {
  ingredientName: string
  quantity: number
  unit: string
  location?: string
}) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  // Find or create ingredient
  const ingredient = await prisma.ingredient.upsert({
    where: { name: data.ingredientName },
    update: {},
    create: {
      name: data.ingredientName,
      category: categorizeIngredient(data.ingredientName)
    }
  })

  // Create or update pantry item
  const pantryItem = await prisma.pantryItem.upsert({
    where: {
      householdId_ingredientId: {
        householdId: session.user.householdId!,
        ingredientId: ingredient.id
      }
    },
    update: {
      quantity: { increment: data.quantity },
      status: calculatePantryStatus(data.quantity, 1)
    },
    create: {
      householdId: session.user.householdId!,
      ingredientId: ingredient.id,
      quantity: data.quantity,
      unit: data.unit as UnitType,
      location: data.location,
      status: calculatePantryStatus(data.quantity, 1)
    }
  })

  revalidatePath("/pantry")
  return { success: true, item: pantryItem }
}
```

---

## Updating Quantities

### Quick Update

```typescript
// components/pantry/pantry-item-row.tsx
export function PantryItemRow({ item }: { item: PantryItem }) {
  const [quantity, setQuantity] = useState(item.quantity)

  async function handleUpdate() {
    await updatePantryItem(item.ingredientId, {
      quantity,
      minQuantity: item.minQuantity
    })
    toast({ title: "Pantry updated" })
  }

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div>
        <h4 className="font-medium">{item.ingredient.name}</h4>
        <p className="text-sm text-muted-foreground">{item.location}</p>
      </div>

      <div className="flex items-center gap-4">
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseFloat(e.target.value))}
          className="w-24"
          step="0.1"
        />
        <span className="text-muted-foreground">{item.unit}</span>
        
        <Badge variant={statusVariant[item.status]}>
          {item.status}
        </Badge>

        <Button size="sm" onClick={handleUpdate}>
          Update
        </Button>
      </div>
    </div>
  )
}
```

---

## Low Stock Alerts

### Display Low Stock

```typescript
// components/pantry/low-stock-alert.tsx
export async function LowStockAlert() {
  const items = await getLowStockItems()

  if (items.length === 0) return null

  return (
    <Card className="border-yellow-500 bg-yellow-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icons.alertTriangle className="h-5 w-5 text-yellow-600" />
          <h3 className="font-semibold text-yellow-900">Low Stock Items</h3>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between">
              <span>{item.ingredient.name}</span>
              <span className="text-muted-foreground">
                {item.quantity} {item.unit} remaining
              </span>
            </li>
          ))}
        </ul>

        <Button className="mt-4" variant="outline" asChild>
          <Link href="/shopping-list?add-low-stock=true">
            Add to Shopping List
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
```

### Get Low Stock Items

```typescript
// actions/pantry.ts
export async function getLowStockItems(): Promise<PantryItem[]> {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return prisma.pantryItem.findMany({
    where: {
      householdId: session.user.householdId,
      OR: [
        { status: "LOW" },
        { status: "OUT" }
      ]
    },
    include: {
      ingredient: true
    },
    orderBy: { updatedAt: "desc" }
  })
}
```

---

## Automatic Deduction

### When Meal is Cooked

```typescript
// actions/meal-plans.ts
"use server"

export async function markMealAsCooked(mealPlanId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

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

  if (!mealPlan) throw new Error("Meal plan not found")

  // Deduct ingredients
  const warnings: string[] = []

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
          quantity: { decrement: recipeIng.quantity }
        }
      }).then((updated) => {
        // Check if now low stock
        if (updated.quantity <= updated.minQuantity) {
          warnings.push(`${updated.ingredient.name} is running low`)
        }
      })
    )
  )

  // Update meal plan
  await prisma.mealPlan.update({
    where: { id: mealPlanId },
    data: {
      isCooked: true,
      cookedAt: new Date()
    }
  })

  revalidatePath("/pantry")
  revalidatePath("/meal-plan")

  return { success: true, warnings }
}
```

---

## Related Documents

- [Database Schema](01-database-schema.md) - PantryItem model
- [Server Actions](09-server-actions-guide.md) - Pantry actions
- [Shopping List](15-shopping-list.md) - Low stock → shopping list

---

*Document Version: 1.0 | Last Updated: 2026-02-17 | CookWise Technical Team*
