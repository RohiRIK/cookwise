"use server"

import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getLLMClient } from "@/lib/llm"
import { generateObject } from "ai"
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

        const session = await getServerSession(authOptions)
        const user = session?.user?.id
            ? await db.user.findUnique({
                where: { id: session.user.id },
                select: { llmProvider: true, geminiApiKey: true, geminiModel: true, openaiApiKey: true, openaiModel: true, anthropicApiKey: true, anthropicModel: true }
            })
            : null

        const llmClient = getLLMClient({
            provider: (user?.llmProvider as any) || "gemini",
            ...user
        })

        const { object } = await generateObject({
            model: llmClient,
            schema: recipeSchema,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Extract recipe data from this image. If unit or category is unclear, make a best guess or use defaults." },
                        { type: "image", image: arrayBuffer }
                    ]
                }
            ]
        })

        return { success: true, data: object }
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

        const prompt = `Extract recipe data from this web page text.
If unit or category is unclear, make a best guess or use defaults.

Web page text:
${textContent}`

        const session = await getServerSession(authOptions)
        const user = session?.user?.id
            ? await db.user.findUnique({
                where: { id: session.user.id },
                select: { llmProvider: true, geminiApiKey: true, geminiModel: true, openaiApiKey: true, openaiModel: true, anthropicApiKey: true, anthropicModel: true }
            })
            : null

        const llmClient = getLLMClient({
            provider: (user?.llmProvider as any) || "gemini",
            ...user
        })

        const { object } = await generateObject({
            model: llmClient,
            schema: recipeSchema,
            prompt: prompt,
        })

        return { success: true, data: object }
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
