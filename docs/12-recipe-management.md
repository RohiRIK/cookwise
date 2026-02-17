# CookWise Recipe Management Guide

> **Product:** CookWise - The AI-Powered Kitchen Operating System  
> **Domain:** cookwise.io  
> **Version:** 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Recipe Ingestion](#recipe-ingestion)
3. [Recipe CRUD](#recipe-crud)
4. [Recipe Search](#recipe-search)
5. [Recipe Display](#recipe-display)

---

## Overview

Recipe management is the core feature of CookWise. Users can add recipes via:
- **Image Upload** (OCR parsing)
- **URL Import** (web scraping)
- **Manual Entry** (form input)
- **PDF Upload** (multi-page OCR)

---

## Recipe Ingestion

### Image Upload Flow

```
┌──────────┐     ┌─────────┐     ┌──────────┐     ┌─────────┐
│  Select  │────▶│ Upload  │────▶│  Gemini  │────▶│ Review  │
│  Image   │     │  File   │     │   OCR    │     │  & Edit │
└──────────┘     └─────────┘     └──────────┘     └─────────┘
```

**Implementation:**

```typescript
// components/recipes/recipe-upload.tsx
export function RecipeUpload({ onUploadComplete }: RecipeUploadProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    
    // Validate
    if (!isValidImageType(file)) {
      toast({ title: "Invalid file type", variant: "destructive" })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", variant: "destructive" })
      return
    }

    // Upload and parse
    setIsUploading(true)
    try {
      const result = await parseRecipeImage(file)
      toast({ title: "Recipe parsed!", description: "Please review" })
      onUploadComplete?.(result.recipeId)
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" })
    } finally {
      setIsUploading(false)
    }
  }, [onUploadComplete])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png"], "application/pdf": [".pdf"] }
  })

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <p>Drag & drop or click to upload recipe</p>
    </div>
  )
}
```

### URL Import Flow

```typescript
// components/recipes/url-import.tsx
export function RecipeUrlImport({ onImportComplete }: Props) {
  const [url, setUrl] = useState("")
  const [isScraping, setIsScraping] = useState(false)

  async function handleImport() {
    setIsScraping(true)
    try {
      const result = await scrapeRecipeUrl(url)
      toast({ title: "Recipe imported!", description: "Please review" })
      onImportComplete?.(result.recipeId)
    } catch (error) {
      toast({ 
        title: "Import failed", 
        description: "Check the URL and try again",
        variant: "destructive" 
      })
    } finally {
      setIsScraping(false)
    }
  }

  return (
    <div>
      <Input
        type="url"
        placeholder="Paste recipe URL..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <Button onClick={handleImport} disabled={!url || isScraping}>
        {isScraping ? "Importing..." : "Import Recipe"}
      </Button>
    </div>
  )
}
```

---

## Recipe CRUD

### Create Recipe

```typescript
// app/(dashboard)/recipes/new/page.tsx
export default function NewRecipePage() {
  const router = useRouter()

  return (
    <div>
      <h1>Add New Recipe</h1>
      
      <Tabs defaultValue="upload">
        <TabsList>
          <TabsTrigger value="upload">Upload Image</TabsTrigger>
          <TabsTrigger value="url">Import from URL</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <RecipeUpload onUploadComplete={(id) => router.push(`/recipes/${id}/edit`)} />
        </TabsContent>

        <TabsContent value="url">
          <RecipeUrlImport onImportComplete={(id) => router.push(`/recipes/${id}/edit`)} />
        </TabsContent>

        <TabsContent value="manual">
          <RecipeForm onSuccess={() => router.push("/recipes")} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### Update Recipe

```typescript
// app/(dashboard)/recipes/[id]/edit/page.tsx
export default async function EditRecipePage({ params }: { params: { id: string } }) {
  const recipe = await getRecipe(params.id)

  return (
    <div>
      <h1>Edit Recipe</h1>
      <RecipeForm
        defaultValues={{
          title: recipe.title,
          description: recipe.description,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          servings: recipe.servings,
          difficulty: recipe.difficulty,
          tags: recipe.tags,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions
        }}
        onSuccess={() => router.push(`/recipes/${params.id}`)}
      />
    </div>
  )
}
```

### Delete Recipe

```typescript
// actions/recipes.ts
"use server"

export async function deleteRecipe(recipeId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  // Verify ownership
  const recipe = await prisma.recipe.findFirst({
    where: {
      id: recipeId,
      householdId: session.user.householdId
    }
  })

  if (!recipe) throw new Error("Recipe not found")

  // Cascade delete (Prisma handles this)
  await prisma.recipe.delete({
    where: { id: recipeId }
  })

  revalidatePath("/recipes")
  return { success: true }
}
```

---

## Recipe Search

### Search with Filters

```typescript
// app/(dashboard)/recipes/page.tsx
export default async function RecipesPage({
  searchParams
}: {
  searchParams: { q?: string; category?: string; difficulty?: string }
}) {
  const recipes = await searchRecipes({
    query: searchParams.q,
    category: searchParams.category,
    difficulty: searchParams.difficulty
  })

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search recipes..."
          name="q"
          defaultValue={searchParams.q}
        />
        <Select name="difficulty">
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  )
}
```

### Search Implementation

```typescript
// lib/recipes/search.ts
export async function searchRecipes(options: {
  query?: string
  category?: string
  difficulty?: string
  tags?: string[]
}): Promise<Recipe[]> {
  const where: Prisma.RecipeWhereInput = {
    householdId: options.householdId
  }

  // Text search
  if (options.query) {
    where.OR = [
      { title: { contains: options.query, mode: "insensitive" } },
      { description: { contains: options.query, mode: "insensitive" } },
      { tags: { has: options.query } }
    ]
  }

  // Filter by difficulty
  if (options.difficulty) {
    where.difficulty = options.difficulty
  }

  // Filter by category (via ingredients)
  if (options.category) {
    where.ingredients = {
      some: {
        ingredient: {
          category: options.category as IngredientCategory
        }
      }
    }
  }

  return prisma.recipe.findMany({
    where,
    include: {
      ingredients: {
        include: { ingredient: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })
}
```

---

## Recipe Display

### Recipe Detail Page

```typescript
// app/(dashboard)/recipes/[id]/page.tsx
export default async function RecipeDetailPage({
  params
}: {
  params: { id: string }
}) {
  const recipe = await getRecipe(params.id)

  return (
    <div>
      {/* Hero */}
      <div className="relative h-64 rounded-lg overflow-hidden">
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Icons.recipe className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-6">
        <h1 className="text-3xl font-bold">{recipe.title}</h1>
        
        <div className="flex gap-4 mt-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Icons.clock className="h-5 w-5" />
            <span>{recipe.prepTime + recipe.cookTime} min</span>
          </div>
          <div className="flex items-center gap-2">
            <Icons.users className="h-5 w-5" />
            <span>{recipe.servings} servings</span>
          </div>
          <Badge>{recipe.difficulty}</Badge>
        </div>

        <div className="flex gap-2 mt-4">
          {recipe.tags?.map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-6">
        <Button asChild>
          <Link href={`/meal-plan?recipe=${recipe.id}`}>
            Add to Meal Plan
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/recipes/${recipe.id}/edit`}>Edit</Link>
        </Button>
      </div>

      {/* Ingredients */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
        <ul className="space-y-2">
          {recipe.ingredients.map((ing) => (
            <li key={ing.id} className="flex items-center gap-2">
              <Checkbox />
              <span>{ing.quantity} {ing.unit} {ing.ingredient.name}</span>
              {ing.notes && <span className="text-muted-foreground">({ing.notes})</span>}
            </li>
          ))}
        </ul>
      </section>

      {/* Instructions */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ol className="space-y-4">
          {recipe.instructionSteps.map((step, idx) => (
            <li key={step.id} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                {idx + 1}
              </div>
              <p className="flex-1">{step.instruction}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
```

---

## Related Documents

- [Component Library](08-component-library.md) - Recipe components
- [Server Actions](09-server-actions-guide.md) - Recipe actions
- [AI Integration](11-ai-integration-guide.md) - OCR parsing

---

*Document Version: 1.0 | Last Updated: 2026-02-17 | CookWise Technical Team*
