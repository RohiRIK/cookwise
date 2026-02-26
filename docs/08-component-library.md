---
title: CookWise Component Library
description: Kitchen-OS Documentation
---

> **Product:** CookWise - The AI-Powered Kitchen Operating System  
> **Domain:** cookwise.io  
> **Version:** 1.0  
> **UI Framework:** React + shadcn/ui + Tailwind CSS

---

## Table of Contents

1. [Base Components](#base-components)
2. [Recipe Components](#recipe-components)
3. [Pantry Components](#pantry-components)
4. [Meal Plan Components](#meal-plan-components)
5. [Shopping Components](#shopping-components)
6. [Shared Components](#shared-components)

---

## Base Components

All base components are from [shadcn/ui](https://ui.shadcn.com). Import from `@/components/ui`.

| Component | Import | Usage |
|-----------|--------|-------|
| Button | `import { Button } from "@/components/ui/button"` | All actions |
| Card | `import { Card } from "@/components/ui/card"` | Content containers |
| Dialog | `import { Dialog } from "@/components/ui/dialog"` | Modals |
| Input | `import { Input } from "@/components/ui/input"` | Text inputs |
| Label | `import { Label } from "@/components/ui/label"` | Form labels |
| Select | `import { Select } from "@/components/ui/select"` | Dropdowns |
| Checkbox | `import { Checkbox } from "@/components/ui/checkbox"` | Boolean inputs |
| Calendar | `import { Calendar } from "@/components/ui/calendar"` | Date picking |
| Badge | `import { Badge } from "@/components/ui/badge"` | Status indicators |
| Avatar | `import { Avatar } from "@/components/ui/avatar"` | User images |
| Tabs | `import { Tabs } from "@/components/ui/tabs"` | Tabbed content |
| Form | `import { Form } from "@/components/ui/form"` | Form wrapper |
| Toast | `import { Toast } from "@/components/ui/toast"` | Notifications |
| Spinner | `import { Spinner } from "@/components/ui/spinner"` | Loading states |

---

## Recipe Components

### RecipeCard

Preview card for recipe listings.

```tsx
// components/recipes/recipe-card.tsx
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"

interface RecipeCardProps {
  id: string
  title: string
  description?: string
  imageUrl?: string
  prepTime?: number
  cookTime?: number
  servings?: number
  difficulty?: "Easy" | "Medium" | "Hard"
  tags?: string[]
  rating?: number
  onClick?: () => void
}

export function RecipeCard({
  title,
  description,
  imageUrl,
  prepTime,
  cookTime,
  servings,
  difficulty,
  tags,
  rating,
  onClick,
}: RecipeCardProps) {
  return (
    <Card className="overflow-hidden cursor-pointer" onClick={onClick}>
      <CardHeader className="p-0">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center">
            <Icons.recipe className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
        
        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          {prepTime && (
            <div className="flex items-center gap-1">
              <Icons.clock className="h-4 w-4" />
              <span>{prepTime}m</span>
            </div>
          )}
          {servings && (
            <div className="flex items-center gap-1">
              <Icons.users className="h-4 w-4" />
              <span>{servings}</span>
            </div>
          )}
          {difficulty && (
            <Badge variant="outline">{difficulty}</Badge>
          )}
        </div>
      </CardContent>
      
      {tags && tags.length > 0 && (
        <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </CardFooter>
      )}
    </Card>
  )
}
```

**Usage:**
```tsx
<RecipeCard
  id="recipe-123"
  title="Classic Tomato Soup"
  description="A comforting homemade soup perfect for cold days"
  imageUrl="/images/tomato-soup.jpg"
  prepTime={15}
  cookTime={30}
  servings={4}
  difficulty="Easy"
  tags={["soup", "vegetarian", "comfort food"]}
  rating={4.5}
  onClick={() => router.push(`/recipes/recipe-123`)}
/>
```

---

### RecipeUpload

Image/PDF upload component for OCR parsing.

```tsx
// components/recipes/recipe-upload.tsx
"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { parseRecipeImage } from "@/actions/recipes"
import { toast } from "@/hooks/use-toast"

interface RecipeUploadProps {
  onUploadComplete?: (recipeId: string) => void
}

export function RecipeUpload({ onUploadComplete }: RecipeUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "application/pdf"]
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload JPG, PNG, or PDF files only",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload files smaller than 10MB",
        variant: "destructive",
      })
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)

    // Upload and parse
    setIsUploading(true)
    try {
      const result = await parseRecipeImage(file)
      toast({
        title: "Recipe parsed!",
        description: "Please review the extracted information",
      })
      onUploadComplete?.(result.recipeId)
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }, [onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: isUploading,
  })

  return (
    <Card>
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors
            ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
            ${isUploading ? "opacity-50 pointer-events-none" : ""}
          `}
        >
          <input {...getInputProps()} />
          
          {isUploading ? (
            <div className="flex flex-col items-center gap-4">
              <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Parsing recipe...</p>
            </div>
          ) : preview ? (
            <div className="flex flex-col items-center gap-4">
              <img src={preview} alt="Preview" className="max-h-48 rounded" />
              <p className="text-sm text-muted-foreground">
                Drop to replace or click to upload
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Icons.upload className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {isDragActive ? "Drop the file here" : "Upload recipe image"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Drag & drop or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports: JPG, PNG, PDF (max 10MB)
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

---

### RecipeForm

Create/edit recipe form.

```tsx
// components/recipes/recipe-form.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { IngredientList } from "./ingredient-list"
import { InstructionSteps } from "./instruction-steps"
import { saveRecipe } from "@/actions/recipes"

const recipeFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  prepTime: z.coerce.number().min(0).optional(),
  cookTime: z.coerce.number().min(0).optional(),
  servings: z.coerce.number().min(1).default(4),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  tags: z.array(z.string()).default([]),
  ingredients: z.array(z.object({
    ingredientId: z.string(),
    quantity: z.coerce.number().positive(),
    unit: z.string(),
    notes: z.string().optional(),
  })).min(1, "At least one ingredient is required"),
  instructions: z.array(z.object({
    stepNumber: z.number(),
    instruction: z.string().min(1),
  })).min(1, "At least one instruction is required"),
})

type RecipeFormValues = z.infer<typeof recipeFormSchema>

interface RecipeFormProps {
  defaultValues?: Partial<RecipeFormValues>
  onSuccess?: () => void
}

export function RecipeForm({ defaultValues, onSuccess }: RecipeFormProps) {
  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      prepTime: 0,
      cookTime: 0,
      servings: 4,
      tags: [],
      ingredients: [],
      instructions: [],
      ...defaultValues,
    },
  })

  async function onSubmit(data: RecipeFormValues) {
    try {
      await saveRecipe(data)
      onSuccess?.()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        
        <div className="grid gap-4">
          <div>
            <Label htmlFor="title">Recipe Title *</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="e.g., Classic Tomato Soup"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Brief description of the recipe"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="prepTime">Prep Time (min)</Label>
              <Input
                id="prepTime"
                type="number"
                {...form.register("prepTime")}
              />
            </div>
            <div>
              <Label htmlFor="cookTime">Cook Time (min)</Label>
              <Input
                id="cookTime"
                type="number"
                {...form.register("cookTime")}
              />
            </div>
            <div>
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                {...form.register("servings")}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select {...form.register("difficulty")}>
              <option value="">Select difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Ingredients</h3>
        <IngredientList
          value={form.watch("ingredients")}
          onChange={(ingredients) => form.setValue("ingredients", ingredients)}
        />
        {form.formState.errors.ingredients && (
          <p className="text-sm text-destructive">
            {form.formState.errors.ingredients.message}
          </p>
        )}
      </div>

      {/* Instructions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Instructions</h3>
        <InstructionSteps
          value={form.watch("instructions")}
          onChange={(instructions) => form.setValue("instructions", instructions)}
        />
        {form.formState.errors.instructions && (
          <p className="text-sm text-destructive">
            {form.formState.errors.instructions.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">
          Save Recipe
        </Button>
      </div>
    </form>
  )
}
```

---

### IngredientList

Manage recipe ingredients.

```tsx
// components/recipes/ingredient-list.tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Icons } from "@/components/icons"

interface Ingredient {
  ingredientId: string
  quantity: number
  unit: string
  notes?: string
}

interface IngredientListProps {
  value: Ingredient[]
  onChange: (ingredients: Ingredient[]) => void
}

const UNIT_OPTIONS = [
  { value: "piece", label: "Piece" },
  { value: "gram", label: "Gram" },
  { value: "kilogram", label: "Kilogram" },
  { value: "milliliter", label: "Milliliter" },
  { value: "liter", label: "Liter" },
  { value: "cup", label: "Cup" },
  { value: "tablespoon", label: "Tablespoon" },
  { value: "teaspoon", label: "Teaspoon" },
  { value: "ounce", label: "Ounce" },
  { value: "pound", label: "Pound" },
  { value: "pinch", label: "Pinch" },
  { value: "to_taste", label: "To Taste" },
]

export function IngredientList({ value, onChange }: IngredientListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  function addIngredient() {
    onChange([
      ...value,
      { ingredientId: "", quantity: 1, unit: "piece" },
    ])
  }

  function updateIngredient(
    index: number,
    field: keyof Ingredient,
    newValue: any
  ) {
    const updated = [...value]
    updated[index] = { ...updated[index], [field]: newValue }
    onChange(updated)
  }

  function removeIngredient(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {value.map((ingredient, index) => (
        <div key={index} className="flex gap-2 items-start">
          <Input
            type="number"
            step="0.1"
            className="w-24"
            value={ingredient.quantity}
            onChange={(e) =>
              updateIngredient(index, "quantity", parseFloat(e.target.value))
            }
          />
          
          <Select
            value={ingredient.unit}
            onValueChange={(unit) => updateIngredient(index, "unit", unit)}
            className="w-32"
          >
            <option value="">Unit</option>
            {UNIT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>

          <Input
            placeholder="Ingredient name"
            className="flex-1"
            value={ingredient.ingredientId}
            onChange={(e) =>
              updateIngredient(index, "ingredientId", e.target.value)
            }
          />

          <Input
            placeholder="Notes (optional)"
            className="w-40"
            value={ingredient.notes || ""}
            onChange={(e) =>
              updateIngredient(index, "notes", e.target.value)
            }
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeIngredient(index)}
          >
            <Icons.trash className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addIngredient}>
        <Icons.plus className="h-4 w-4 mr-2" />
        Add Ingredient
      </Button>
    </div>
  )
}
```

---

### InstructionSteps

Manage recipe instructions.

```tsx
// components/recipes/instruction-steps.tsx
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Icons } from "@/components/icons"

interface InstructionStep {
  stepNumber: number
  instruction: string
}

interface InstructionStepsProps {
  value: InstructionStep[]
  onChange: (steps: InstructionStep[]) => void
}

export function InstructionSteps({ value, onChange }: InstructionStepsProps) {
  function addStep() {
    const nextNumber = value.length > 0 
      ? Math.max(...value.map(s => s.stepNumber)) + 1 
      : 1
    onChange([...value, { stepNumber: nextNumber, instruction: "" }])
  }

  function updateStep(
    index: number,
    field: keyof InstructionStep,
    newValue: any
  ) {
    const updated = [...value]
    updated[index] = { ...updated[index], [field]: newValue }
    onChange(updated)
  }

  function removeStep(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  function moveStep(index: number, direction: "up" | "down") {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === value.length - 1)
    ) {
      return
    }

    const updated = [...value]
    const swapIndex = direction === "up" ? index - 1 : index + 1
    ;[updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]]
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      {value.map((step, index) => (
        <div key={index} className="flex gap-2 items-start">
          <div className="flex flex-col gap-1 pt-2">
            <span className="text-sm font-medium text-muted-foreground w-6 text-center">
              {step.stepNumber}
            </span>
          </div>

          <Textarea
            placeholder={`Step ${step.stepNumber} instructions...`}
            className="flex-1"
            value={step.instruction}
            onChange={(e) =>
              updateStep(index, "instruction", e.target.value)
            }
            rows={2}
          />

          <div className="flex flex-col gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => moveStep(index, "up")}
              disabled={index === 0}
            >
              <Icons.chevronUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => moveStep(index, "down")}
              disabled={index === value.length - 1}
            >
              <Icons.chevronDown className="h-4 w-4" />
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeStep(index)}
          >
            <Icons.trash className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addStep}>
        <Icons.plus className="h-4 w-4 mr-2" />
        Add Step
      </Button>
    </div>
  )
}
```

---

## Pantry Components

### PantryItem

Display single pantry item with status.

```tsx
// components/pantry/pantry-item.tsx
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

interface PantryItemProps {
  id: string
  name: string
  quantity: number
  unit: string
  status: "IN_STOCK" | "LOW" | "OUT"
  expiryDate?: string
  location?: string
  onUpdate?: () => void
  onDelete?: () => void
}

const statusConfig = {
  IN_STOCK: { label: "In Stock", variant: "default" as const },
  LOW: { label: "Low Stock", variant: "secondary" as const },
  OUT: { label: "Out of Stock", variant: "destructive" as const },
}

export function PantryItem({
  name,
  quantity,
  unit,
  status,
  expiryDate,
  location,
  onUpdate,
  onDelete,
}: PantryItemProps) {
  const config = statusConfig[status]

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{name}</h4>
              <Badge variant={config.variant}>{config.label}</Badge>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {quantity} {unit}
              {location && ` • ${location}`}
              {expiryDate && ` • Expires ${expiryDate}`}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onUpdate}
            >
              <Icons.edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
            >
              <Icons.trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## Meal Plan Components

### MealCalendar

Weekly calendar view for meal planning.

```tsx
// components/meal-plan/meal-calendar.tsx
import { startOfWeek, addDays, format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MealSlot } from "./meal-slot"
import { Icons } from "@/components/icons"

interface MealPlan {
  id: string
  recipe?: {
    id: string
    title: string
    imageUrl?: string
  }
  date: string
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK"
}

interface MealCalendarProps {
  weekStart: Date
  mealPlans: MealPlan[]
  onAddMeal?: (date: Date, mealType: string) => void
  onDrop?: (recipeId: string, date: Date, mealType: string) => void
}

const MEAL_TYPES = [
  { value: "BREAKFAST", label: "Breakfast" },
  { value: "LUNCH", label: "Lunch" },
  { value: "DINNER", label: "Dinner" },
] as const

export function MealCalendar({
  weekStart,
  mealPlans,
  onAddMeal,
  onDrop,
}: MealCalendarProps) {
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1000px]">
        {/* Header */}
        <div className="grid grid-cols-8 border-b">
          <div className="p-4 font-medium">Meal</div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="p-4 text-center border-l">
              <div className="text-sm font-medium">
                {format(day, "EEE")}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(day, "MMM d")}
              </div>
            </div>
          ))}
        </div>

        {/* Rows */}
        {MEAL_TYPES.map((mealType) => (
          <div
            key={mealType.value}
            className="grid grid-cols-8 border-b min-h-[120px]"
          >
            <div className="p-4 font-medium flex items-center">
              {mealType.label}
            </div>
            {weekDays.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd")
              const plan = mealPlans.find(
                (p) => p.date === dateStr && p.mealType === mealType.value
              )

              return (
                <div
                  key={`${dateStr}-${mealType.value}`}
                  className="border-l p-2"
                >
                  <MealSlot
                    mealPlan={plan}
                    onAdd={() => onAddMeal?.(day, mealType.value)}
                  />
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

---

## Shopping Components

### ShoppingList

Main shopping list with category grouping.

```tsx
// components/shopping/shopping-list.tsx
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ShoppingItem } from "./shopping-item"

interface ShoppingListItem {
  id: string
  name: string
  quantity: number
  unit: string
  category: string
  is_checked: boolean
  aisle?: string
}

interface ShoppingListProps {
  items: ShoppingListItem[]
  onToggle: (id: string, checked: boolean) => void
  onAddItem?: () => void
}

export function ShoppingList({
  items,
  onToggle,
  onAddItem,
}: ShoppingListProps) {
  // Group by category
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof items>)

  const remainingCount = items.filter((i) => !i.is_checked).length

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Shopping List</h2>
        <div className="text-sm text-muted-foreground">
          {remainingCount} items remaining
        </div>
      </div>

      {/* Categories */}
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <Card key={category}>
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">{category}</h3>
            <div className="space-y-3">
              {categoryItems.map((item) => (
                <ShoppingItem
                  key={item.id}
                  item={item}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Your shopping list is empty
        </div>
      )}
    </div>
  )
}
```

---

### ShoppingMode

Mobile-optimized shopping mode with wake lock.

```tsx
// components/shopping/shopping-mode.tsx
"use client"

import { useEffect, useState } from "react"
import { useWakeLock } from "@/hooks/use-wake-lock"
import { ShoppingList } from "./shopping-list"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

interface ShoppingModeProps {
  items: any[]
  onToggle: (id: string, checked: boolean) => void
  onFinish: () => void
  onExit: () => void
}

export function ShoppingMode({
  items,
  onToggle,
  onFinish,
  onExit,
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
      <header className="border-b p-4 flex items-center justify-between">
        <Button variant="ghost" onClick={onExit}>
          <Icons.chevronLeft className="h-4 w-4 mr-2" />
          Exit
        </Button>

        <div className="flex items-center gap-2">
          <Icons.bolt className="h-5 w-5 text-primary" />
          <span className="font-medium">Shopping Mode</span>
          {isLocked && (
            <span className="text-xs text-muted-foreground">
              Screen stays on
            </span>
          )}
        </div>

        <Button onClick={onFinish}>
          Finish Trip
        </Button>
      </header>

      {/* Progress */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <main className="flex-1 overflow-auto p-4">
        <ShoppingList items={items} onToggle={onToggle} />
      </main>
    </div>
  )
}
```

---

## Shared Components

### StatusBadge

Reusable status indicator.

```tsx
// components/shared/status-badge.tsx
import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: "success" | "warning" | "error" | "default"
  label: string
}

const variants = {
  success: "bg-green-500 text-white",
  warning: "bg-yellow-500 text-white",
  error: "bg-red-500 text-white",
  default: "",
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <Badge className={variants[status]}>
      {label}
    </Badge>
  )
}
```

---

## Related Documents

- [Technical Specification](02-technical-spec.md) - Architecture overview
- [User Flows](04-user-flows.md) - UX requirements
- [API Reference](05-api-reference.md) - Backend integration

---

*Document Version: 1.0 | Last Updated: 2026-02-17 | CookWise Technical Team*
