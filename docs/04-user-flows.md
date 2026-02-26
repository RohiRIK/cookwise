---
title: CookWise UI/UX User Flows
description: Kitchen-OS Documentation
---

> **Product:** CookWise - The AI-Powered Kitchen Operating System  
> **Domain:** cookwise.io  
> **Version:** 1.0  
> **Platforms:** Desktop Web, Mobile Web

---

## Table of Contents

1. [The Cooking Flow](#the-cooking-flow)
2. [The Shopping Flow](#the-shopping-flow)

---

## The Cooking Flow

**Flow:** Meal Plan → Cook → Deduct Ingredients → Pantry Update

```
┌──────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│  Browse  │────▶│  View Recipe  │────▶│  "Cook      │────▶│ Confirm  │
│  Meal    │     │  Details     │     │  This"      │     │ Ingredients│
│  Plan    │     │              │     │  Button     │     │ Available │
└──────────┘     └──────────────┘     └─────────────┘     └──────────┘
                                                               │
         ┌─────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Interactive     │────▶│  Mark as      │────▶│  Pantry     │
│  Cooking Mode    │     │  Complete     │     │  Deducted   │
│  (Step-by-step)  │     │              │     │  & Updated  │
└──────────────────┘     └──────────────┘     └─────────────┘
```

---

### Step 1: Browse Meal Plan

**Screen:** Weekly calendar view

**User Actions:**
- View all planned meals for the week
- Filter by meal type (Breakfast/Lunch/Dinner)
- See recipe thumbnails and titles
- Drag-and-drop to reschedule meals

**UI Elements:**
```
┌─────────────────────────────────────────────┐
│  📅 Week of Feb 17, 2026        [+ Add]    │
├─────────────────────────────────────────────┤
│                                             │
│  Monday    Tuesday   Wednesday   Thursday   │
│  ┌─────┐   ┌─────┐   ┌─────┐   ┌─────┐     │
│  │ 🍳  │   │ 🥗  │   │ 🍝  │   │ 🍲  │     │
│  │Break│   │Lunch│   │Dinner│   │Break│     │
│  └─────┘   └─────┘   └─────┘   └─────┘     │
│  ┌─────┐   ┌─────┐   ┌─────┐   ┌─────┐     │
│  │ 🥪  │   │ 🍜  │   │ 🍕  │   │ 🥘  │     │
│  │Lunch│   │Dinner│   │Lunch│   │Dinner│    │
│  └─────┘   └─────┘   └─────┘   └─────┘     │
│                                             │
│  [✨ Surprise Me - Auto Fill]               │
└─────────────────────────────────────────────┘
```

---

### Step 2: View Recipe Details

**Screen:** Recipe detail page

**User Actions:**
- Review ingredients list
- Read cooking instructions
- Check prep/cook time
- See nutritional info (future)

**UI Elements:**
```
┌─────────────────────────────────────────────┐
│  ← Back                                     │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │         Recipe Hero Image           │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  🍝 Classic Tomato Soup                     │
│  ⏱️ 15 min prep · 30 min cook · Serves 4   │
│  ⭐⭐⭐⭐☆ (4.2)                              │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  Ingredients (8 items)                      │
│  ☐ 2 lbs ripe tomatoes                      │
│  ☐ 1 medium onion, diced                    │
│  ☐ 3 cloves garlic, minced                  │
│  ...                                        │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  Instructions                               │
│  1. Heat olive oil in a large pot...        │
│  2. Add onions and cook until...            │
│  ...                                        │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  [🔥 Cook This Recipe]  ← Primary CTA       │
└─────────────────────────────────────────────┘
```

---

### Step 3: Initiate Cooking

**Action:** User taps "Cook This" button

**System:** Checks pantry availability

**Outcomes:**

| Status | Condition | Response |
|--------|-----------|----------|
| ✅ | All ingredients available | Show confirmation modal |
| ⚠️ | Some ingredients low | Show warning with missing items |
| ❌ | Missing ingredients | Suggest quick shopping list add |

---

### Step 4: Confirm Ingredients

**Modal:**
```
┌─────────────────────────────────────┐
│  Ready to cook?                     │
│                                     │
│  This will deduct the following     │
│  ingredients from your pantry:      │
│                                     │
│  📦 Tomatoes        -2 pcs   ✅     │
│  📦 Onion           -1 pc    ⚠️ Low │
│  📦 Garlic          -3 pcs   ✅     │
│  📦 Olive oil       -2 tbsp  ✅     │
│                                     │
│  [Cancel]  [Start Cooking]          │
└─────────────────────────────────────┘
```

---

### Step 5: Interactive Cooking Mode

**Screen:** Cooking mode (full-screen, wake lock enabled)

**Features:**
- Large text for instructions
- Step-by-step navigation (Previous/Next)
- Built-in timers for cooking steps
- Checkbox for completed steps
- Screen stays awake during cooking

**UI Elements:**
```
┌─────────────────────────────────────┐
│  ← Exit        Step 3 of 8    ⏱️    │
│  ▓▓▓▓▓▓░░░░░░░░░░░░░░░ 37%         │
├─────────────────────────────────────┤
│                                     │
│         ┌─────────────┐            │
│         │             │            │
│         │  Step Image │            │
│         │  (optional) │            │
│         │             │            │
│         └─────────────┘            │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│     Add garlic and cook until       │
│         fragrant, about 1           │
│            minute.                  │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│         [⏱️ Start Timer]            │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [← Previous]     [Next →]          │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│     [✓ Mark Step Complete]          │
│                                     │
└─────────────────────────────────────┘
```

---

### Step 6: Mark Complete

**Action:** User taps "Finish Cooking"

**System:**
- Marks meal plan as cooked
- Records cooked timestamp
- Triggers pantry deduction

---

### Step 7: Pantry Update

**Background Process:**

```typescript
async function completeCookingFlow(mealPlanId: string) {
  const mealPlan = await prisma.mealPlan.findUnique({
    where: { id: mealPlanId },
    include: { recipe: { include: { ingredients: true } } }
  })
  
  // Deduct each ingredient
  for (const recipeIngredient of mealPlan.recipe.ingredients) {
    await prisma.pantryItem.update({
      where: {
        householdId_ingredientId: {
          householdId: session.householdId,
          ingredientId: recipeIngredient.ingredientId
        }
      },
      data: {
        quantity: { decrement: recipeIngredient.quantity },
        updatedAt: new Date()
      }
    })
  }
  
  // Update meal plan status
  await prisma.mealPlan.update({
    where: { id: mealPlanId },
    data: {
      isCooked: true,
      cookedAt: new Date()
    }
  })
  
  // Check for low stock items
  const lowStockItems = await getLowStockItems(session.householdId)
  
  return {
    success: true,
    lowStockWarnings: lowStockItems
  }
}
```

---

### Step 8: Post-Cooking Feedback

**Screen:** Success state with options

**UI Elements:**
```
┌─────────────────────────────────────┐
│                                     │
│           🎉                        │
│                                     │
│     Recipe completed!               │
│                                     │
│  How did it turn out?               │
│                                     │
│  ☆ ☆ ☆ ☆ ☆  ← Rate this recipe      │
│                                     │
│  ☐ Add to favorites                 │
│                                     │
│  ⚠️ 2 items are running low:        │
│     • Onions (add to shopping list?)│
│     • Garlic (add to shopping list?)│
│                                     │
│  [Skip]  [Add to Shopping List]     │
│                                     │
└─────────────────────────────────────┘
```

---

## The Shopping Flow

**Flow:** Shopping Mode → Wake Lock → Check Items → Finish → Restock

```
┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│  Generate    │────▶│  Activate    │────▶│  Shopping    │
│  List from   │     │  Shopping    │     │  Mode UI     │
│  Meal Plan   │     │  Mode        │     │  (Mobile)    │
└──────────────┘     └─────────────┘     └──────────────┘
                                                │
         ┌──────────────────────────────────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Check off       │────▶│  Review      │────▶│  Finish     │
│  items while     │     │  Cart &      │     │  Trip &     │
│  shopping        │     │  Add Missing │     │  Restock    │
└──────────────────┘     └──────────────┘     └─────────────┘
```

---

### Step 1: Generate Shopping List

**Trigger:** User taps "Generate Shopping List" from meal plan

**System:**
- Aggregates all ingredients for week's meals
- Subtracts current pantry inventory
- Deduplicates items (combines quantities)
- Groups by category/aisle

**Output:** New active shopping list

---

### Step 2: Activate Shopping Mode

**Action:** User taps "Start Shopping" button

**System:**
```typescript
async function activateShoppingMode() {
  if ('wakeLock' in navigator) {
    try {
      const wakeLock = await navigator.wakeLock.request('screen')
      setWakeLock(wakeLock)
      
      wakeLock.addEventListener('release', () => {
        console.log('Wake lock released')
      })
    } catch (err) {
      console.error('Wake lock error:', err)
    }
  }
  
  // Set screen to stay on
  setKeepAwake(true)
}
```

**UI Changes:**
- Larger touch targets (44x44px minimum)
- High contrast mode option
- Simplified navigation
- Prevent screen timeout

---

### Step 3: Shopping Mode UI

```
┌─────────────────────────────────────┐
│  ← Back          Shopping Mode  ⚡  │
├─────────────────────────────────────┤
│                                     │
│  📍 Produce Section                 │
│  ┌─────────────────────────────┐   │
│  │ ☐ Tomatoes           4 pcs  │   │
│  │ ☐ Onions             2 pcs  │   │
│  │ ☐ Garlic             1 pc   │   │
│  │ ☐ Fresh Basil        1 pc   │   │
│  └─────────────────────────────┘   │
│                                     │
│  📍 Dairy Section                   │
│  ┌─────────────────────────────┐   │
│  │ ☐ Butter             227g   │   │
│  │ ☐ Eggs               12 pcs │   │
│  └─────────────────────────────┘   │
│                                     │
│  📍 Baking Aisle                    │
│  ┌─────────────────────────────┐   │
│  │ ☐ Flour              281g   │   │
│  │ ☐ Sugar              150g   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ─────────────────────────────────  │
│  8 items remaining                  │
│  [+ Add Item]                       │
│                                     │
│  [Finish Shopping Trip]             │
└─────────────────────────────────────┘
```

---

### Step 4: Check Off Items

**Interaction:** Tap checkbox or swipe right

**Feedback:**
- Immediate visual checkmark (optimistic UI)
- Haptic feedback (mobile)
- Item dims and moves to bottom (optional)
- Counter updates: "7 items remaining"

**Implementation:**
```typescript
async function toggleItem(itemId: string, isChecked: boolean) {
  // Optimistic update
  setItems(prev => prev.map(item => 
    item.id === itemId 
      ? { ...item, is_checked: isChecked, checkedAt: isChecked ? new Date() : null }
      : item
  ))
  
  // Server update
  await toggleShoppingItem(itemId, isChecked, userId)
  
  // Update remaining count
  updateRemainingCount()
}
```

---

### Step 5: Add Missing Items

**Scenario:** User finds additional items needed in store

**Action:** Tap "+ Add Item" button

**Modal:**
```
┌─────────────────────────────┐
│  Add Item to List           │
│                             │
│  Name: [____________]       │
│                             │
│  Quantity: [1]              │
│                             │
│  Unit: [piece ▼]            │
│                             │
│  Category: [Produce ▼]      │
│                             │
│  [Cancel]  [Add Item]       │
└─────────────────────────────┘
```

---

### Step 6: Review Cart

**Action:** User taps "Review Cart" or scrolls to bottom

**Screen:** Shows all checked items

**Features:**
- Total estimated cost (if prices available)
- Items grouped by category
- Option to uncheck items
- "Add missing items" prompt

---

### Step 7: Finish Trip & Restock

**Confirmation Modal:**
```
┌─────────────────────────────────────┐
│  Finish Shopping Trip?              │
│                                     │
│  You checked off 12 items.          │
│  These will be added to your        │
│  pantry inventory.                  │
│                                     │
│  📦 Items to restock:               │
│  • Tomatoes: +4 pieces              │
│  • Onions: +2 pieces                │
│  • Butter: +227g                    │
│  • ... and 9 more                   │
│                                     │
│  [Cancel]  [Confirm & Restock]      │
└─────────────────────────────────────┘
```

---

### Step 8: Restock Pantry

**Background Process:**

```typescript
async function finishShoppingTrip(shoppingListId: string) {
  const list = await prisma.shoppingList.findUnique({
    where: { id: shoppingListId },
    include: { 
      items: { 
        where: { is_checked: true },
        include: { ingredient: true }
      }
    }
  })
  
  // Transaction: Update pantry for each checked item
  await prisma.$transaction(list.items.map(item => 
    prisma.pantryItem.upsert({
      where: {
        householdId_ingredientId: {
          householdId: session.householdId,
          ingredientId: item.ingredientId
        }
      },
      create: {
        householdId: session.householdId,
        ingredientId: item.ingredientId,
        quantity: item.quantity,
        unit: item.unit,
        status: 'IN_STOCK'
      },
      update: {
        quantity: { increment: item.quantity },
        status: {
          set: calculatePantryStatus(item.quantity + current.quantity)
        }
      }
    })
  ))
  
  // Mark list as complete, create new active list
  await prisma.shoppingList.update({
    where: { id: shoppingListId },
    data: { isActive: false }
  })
  
  // Create new list for next week
  const newList = await createNewShoppingList(session.householdId)
  
  return { success: true, restockedItems: list.items.length }
}
```

---

### Step 9: Completion Screen

```
┌─────────────────────────────────────┐
│                                     │
│           🎉                        │
│                                     │
│     Shopping Trip Complete!         │
│                                     │
│  12 items added to pantry           │
│                                     │
│  Your pantry is now stocked!        │
│                                     │
│  ─────────────────────────────────  │
│  Total estimated: $47.32            │
│  (across 3 stores)                  │
│  ─────────────────────────────────  │
│                                     │
│  [View Pantry]  [Back to Home]      │
│                                     │
└─────────────────────────────────────┘
```

---

## Related Documents

- [Technical Specification](02-technical-spec.md) - Optimistic UI implementation
- [Database Schema](01-database-schema.md) - Data models for flows
- [API Reference](05-api-reference.md) - Endpoints used in flows

---

*Document Version: 1.0 | Last Updated: 2026-02-17 | CookWise Technical Team*
