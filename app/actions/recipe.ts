"use server"

import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getGeminiModel } from "@/lib/gemini"
import { z } from "zod"
import { IngredientCategory, RecipeSourceType, UnitType } from "@prisma/client"

const recipeSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    prepTime: z.number().optional(),
    cookTime: z.number().optional(),
    servings: z.number().optional(),
    ingredients: z.array(z.object({
        name: z.string(),
        quantity: z.number(),
        unit: z.string(),
        originalText: z.string(),
        category: z.nativeEnum(IngredientCategory).default(IngredientCategory.OTHER),
    })),
    steps: z.array(z.string()),
})

export type RecipeInput = z.infer<typeof recipeSchema>

export async function parseRecipeImage(formData: FormData) {
    try {
        const file = formData.get("image") as File
        if (!file) {
            throw new Error("No image provided")
        }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64Image = buffer.toString("base64")

        const items = [
            {
                inlineData: {
                    data: base64Image,
                    mimeType: file.type,
                },
            },
            `Extract recipe data from this image in JSON format. 
      The JSON should match this schema: 
      { 
        title: string, 
        description?: string, 
        prepTime?: number (minutes), 
        cookTime?: number (minutes), 
        servings?: number, 
        ingredients: { 
          name: string, 
          quantity: number, 
          unit: string (e.g. GRAM, CUP, PIECE, TABLESPOON, etc. match UnitType enum if possible), 
          originalText: string,
          category: string (one of: ${Object.keys(IngredientCategory).join(", ")})
        }[], 
        steps: string[] 
      }
      If unit or category is unclear, make a best guess or use defaults.`,
        ]

        const session = await getServerSession(authOptions)
        const user = session?.user?.id
            ? await db.user.findUnique({ where: { id: session.user.id }, select: { geminiApiKey: true } })
            : null

        const geminiModel = getGeminiModel(user?.geminiApiKey)

        const result = await geminiModel.generateContent(items)
        const response = await result.response
        const text = response.text()

        // Clean up markdown code blocks if present
        const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim()

        const json = JSON.parse(cleanedText)

        // Normalize units and categories if needed (sanity check)
        // The Zod schema will validate, but we might want to be lenient with units in a real app

        const parsedRecipe = recipeSchema.parse(json)

        return { success: true, data: parsedRecipe }
    } catch (error) {
        console.error("Error parsing recipe:", error)
        return { success: false, error: "Failed to parse recipe" }
    }
}

export async function parseRecipeUrl(url: string) {
    try {
        if (!url || !url.startsWith("http")) {
            throw new Error("Please provide a valid URL")
        }

        // Fetch the page HTML
        const response = await fetch(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (compatible; CookWise/1.0; +https://cookwise.io)",
                Accept: "text/html",
            },
            signal: AbortSignal.timeout(10000),
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status}`)
        }

        const html = await response.text()

        // Strip HTML to text — remove scripts, styles, nav, footer, ads
        const textContent = html
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/<style[\s\S]*?<\/style>/gi, "")
            .replace(/<nav[\s\S]*?<\/nav>/gi, "")
            .replace(/<footer[\s\S]*?<\/footer>/gi, "")
            .replace(/<header[\s\S]*?<\/header>/gi, "")
            .replace(/<aside[\s\S]*?<\/aside>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&#\d+;/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 8000) // Limit to avoid token overflow

        const prompt = `Extract recipe data from this web page text in JSON format.
The JSON should match this schema:
{
  title: string,
  description?: string,
  prepTime?: number (minutes),
  cookTime?: number (minutes),
  servings?: number,
  ingredients: {
    name: string,
    quantity: number,
    unit: string (e.g. GRAM, CUP, PIECE, TABLESPOON, TEASPOON, KILOGRAM, MILLILITER, LITER, OUNCE, POUND, PINCH, TO_TASTE),
    originalText: string,
    category: string (one of: ${Object.keys(IngredientCategory).join(", ")})
  }[],
  steps: string[]
}
If unit or category is unclear, make a best guess or use defaults.
Only return valid JSON, no markdown code fences.

Web page text:
${textContent}`

        const session = await getServerSession(authOptions)
        const user = session?.user?.id
            ? await db.user.findUnique({ where: { id: session.user.id }, select: { geminiApiKey: true } })
            : null

        const geminiModel = getGeminiModel(user?.geminiApiKey)

        const result = await geminiModel.generateContent(prompt)
        const aiResponse = await result.response
        const text = aiResponse.text()

        // Clean up markdown code blocks if present
        const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim()
        const json = JSON.parse(cleanedText)
        const parsedRecipe = recipeSchema.parse(json)

        return { success: true, data: parsedRecipe }
    } catch (error) {
        console.error("Error parsing recipe URL:", error)
        const message =
            error instanceof Error ? error.message : "Failed to parse recipe URL"
        return { success: false, error: message }
    }
}

export async function createRecipe(data: RecipeInput) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    // Attempt to get householdId from user session or db
    // Since session modification for householdId might not be fully set up in all callbacks yet, query db
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { householdId: true }
    })

    const householdId = user?.householdId

    try {
        const recipe = await db.$transaction(async (tx) => {
            // 1. Create Recipe
            const newRecipe = await tx.recipe.create({
                data: {
                    title: data.title,
                    description: data.description,
                    prepTime: data.prepTime,
                    cookTime: data.cookTime,
                    servings: data.servings ?? 4,
                    sourceType: RecipeSourceType.OCR_IMAGE,
                    creatorId: session.user.id,
                    householdId: householdId,
                    steps: {
                        create: data.steps.map((step, index) => ({
                            stepNumber: index + 1,
                            instruction: step,
                        })),
                    },
                },
            })

            // 2. Process Ingredients
            for (const ing of data.ingredients) {
                // Upsert Ingredient (Global)
                const ingredient = await tx.ingredient.upsert({
                    where: { name: ing.name },
                    update: {},
                    create: {
                        name: ing.name,
                        category: ing.category || IngredientCategory.OTHER,
                    },
                })

                // Create RecipeIngredient
                await tx.recipeIngredient.create({
                    data: {
                        recipeId: newRecipe.id,
                        ingredientId: ingredient.id,
                        quantity: ing.quantity,
                        unit: ing.unit as UnitType, // Assuming AI returns valid enum, ideally map/validate
                        originalText: ing.originalText,
                    },
                })
            }

            return newRecipe
        })

        return { success: true, data: recipe }
    } catch (error) {
        console.error("Error creating recipe:", error)
        return { success: false, error: "Failed to create recipe" }
    }
}
