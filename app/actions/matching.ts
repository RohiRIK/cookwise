"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Recipe, RecipeIngredient, Ingredient } from "@prisma/client"

export type RecipeWithIngredients = Recipe & {
    ingredients: (RecipeIngredient & { ingredient: Ingredient })[]
}

export type MatchResult = {
    recipe: RecipeWithIngredients
    matchPercentage: number
    matchingIngredients: string[] // Names of ingredients we have
    missingIngredients: string[] // Names of ingredients we lack
}

export async function getMatchedRecipes(): Promise<MatchResult[]> {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return []
    }

    // 1. Get User's Household
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { householdId: true }
    })

    if (!user?.householdId) {
        return []
    }

    // 2. Fetch all Pantry Items for the household
    // We only need the ingredientIds to compare
    const pantryItems = await db.pantryItem.findMany({
        where: { householdId: user.householdId },
        select: { ingredientId: true, quantity: true, unit: true }
    })

    const pantryIngredientIds = new Set(pantryItems.map(item => item.ingredientId))

    // 3. Fetch all Recipes with their ingredients
    // Optimize: In a real app, we might filter or paginate. 
    // For now, fetch all associated with the household or public ones? 
    // Let's assume user sees their household's recipes for now.
    const recipes = await db.recipe.findMany({
        where: { householdId: user.householdId },
        include: {
            ingredients: {
                include: {
                    ingredient: true
                }
            }
        }
    })

    // 4. Calculate Match Scores
    const results: MatchResult[] = recipes.map(recipe => {
        let matchCount = 0
        const matching: string[] = []
        const missing: string[] = []

        recipe.ingredients.forEach(ri => {
            if (pantryIngredientIds.has(ri.ingredientId)) {
                matchCount++
                matching.push(ri.ingredient.name)
            } else {
                missing.push(ri.ingredient.name)
            }
        })

        const totalIngredients = recipe.ingredients.length
        const matchPercentage = totalIngredients > 0
            ? Math.round((matchCount / totalIngredients) * 100)
            : 0

        return {
            recipe,
            matchPercentage,
            matchingIngredients: matching,
            missingIngredients: missing
        }
    })

    // 5. Sort by Match Percentage (Descending)
    return results.sort((a, b) => b.matchPercentage - a.matchPercentage)
}
