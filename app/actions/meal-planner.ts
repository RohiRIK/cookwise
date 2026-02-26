"use server"

import { db } from "@/lib/db"
import { MealType } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { startOfWeek, endOfWeek, addDays, format } from "date-fns"

export async function getRecursiveRecipes() {
    return await db.recipe.findMany({
        select: {
            id: true,
            title: true,
            imageUrl: true,
            description: true,
        },
        orderBy: {
            title: 'asc'
        }
    })
}

export async function getWeekMealPlans(startDate: Date) {
    const start = startOfWeek(startDate, { weekStartsOn: 1 }) // Monday start
    const end = endOfWeek(startDate, { weekStartsOn: 1 })

    const plans = await db.mealPlan.findMany({
        where: {
            date: {
                gte: start,
                lte: end,
            }
        },
        include: {
            recipe: {
                select: {
                    id: true,
                    title: true,
                    imageUrl: true,
                }
            }
        }
    })

    return plans
}

export async function updateMealPlan(date: Date, mealType: string, recipeId: string) {
    // Check if we already have a plan for this slot
    // We need to upsert.
    // However, Prisma upsert requires a unique constraint.
    // Our schema has: @@unique([householdId, recipeId, date, mealType]) which is WRONG for this use case.
    // If we want 1 meal per slot, it should be @@unique([householdId, date, mealType]).
    // But currently we can have multiple recipes per slot if we change recipeId.
    // 
    // Wait, the schema in schema.prisma says:
    // @@unique([householdId, recipeId, date, mealType])
    // This allows multiple DIFFERENT recipes on the same date/mealType.
    // But our UI design is "Single Recipe per Slot".
    // So we should first delete any existing plan for this slot before creating new one?
    // OR we just findFirst and update it?
    // 
    // To support "Single Recipe Per Slot" visually, we should clear the slot first.
    // But since we can't easily rely on database constraints without migration, 
    // we will implement "Delete all in slot, then Create new" logic.

    // NOTE: This assumes single user/household context which we fallback to null in current MVP if not auth'd fully
    // But we should try to use a static household/user ID if auth is not fully mocked, 
    // or assume the generic one.
    // For now, let's assume we proceed without householdId logic strictly, or just use null if allowed.
    // (Schema allows householdId to be optional)

    // 1. Delete existing plans for this date/mealType
    // We need date to be at 00:00:00 for consistency
    const planDate = new Date(date)
    planDate.setHours(0, 0, 0, 0)

    // TODO: Add Auth check here to get householdId
    // For MVP we just interact with null householdId or whatever exists.

    // We will clear existing for this slot:
    await db.mealPlan.deleteMany({
        where: {
            date: planDate,
            mealType: mealType as MealType,
        }
    })

    // 2. Create new plan
    await db.mealPlan.create({
        data: {
            date: planDate,
            mealType: mealType as MealType,
            recipeId: recipeId,
            servings: 4, // Default
        }
    })

    revalidatePath("/dashboard/planner")
    return { success: true }
}


export async function removeMealPlan(id: string) {
    await db.mealPlan.delete({
        where: { id }
    })
    revalidatePath("/dashboard/planner")
    return { success: true }
}
