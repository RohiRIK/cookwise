"use server"

import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { IngredientCategory, PantryStatus, UnitType } from "@prisma/client"

// Schema for adding/updating pantry items
const pantryItemSchema = z.object({
    ingredientId: z.string().min(1, "Ingredient is required"),
    quantity: z.coerce.number().min(0),
    unit: z.nativeEnum(UnitType),
    location: z.string().optional(),
    expiryDate: z.date().optional().nullable(),
    minQuantity: z.coerce.number().min(0).default(0),
    notes: z.string().optional(),
})

export type PantryItemInput = z.infer<typeof pantryItemSchema>

export async function getPantryItems() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    // Get user's household
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { householdId: true }
    })

    if (!user?.householdId) {
        return []
    }

    const items = await db.pantryItem.findMany({
        where: {
            householdId: user.householdId,
        },
        include: {
            ingredient: true,
        },
        orderBy: {
            ingredient: {
                name: "asc",
            },
        },
    })

    return items
}

export async function addPantryItem(data: PantryItemInput) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { householdId: true }
    })

    if (!user?.householdId) {
        return { success: false, error: "No household found" }
    }

    try {
        // Upsert logic: if item exists for this ingredient in household, update quantity
        // Otherwise create new
        const existingItem = await db.pantryItem.findUnique({
            where: {
                householdId_ingredientId: {
                    householdId: user.householdId,
                    ingredientId: data.ingredientId,
                }
            }
        })

        if (existingItem) {
            await db.pantryItem.update({
                where: { id: existingItem.id },
                data: {
                    quantity: existingItem.quantity + data.quantity, // Add to existing
                    unit: data.unit, // Update unit to latest
                    location: data.location || existingItem.location,
                    expiryDate: data.expiryDate || existingItem.expiryDate,
                    updatedAt: new Date(),
                }
            })
        } else {
            await db.pantryItem.create({
                data: {
                    householdId: user.householdId,
                    ingredientId: data.ingredientId,
                    quantity: data.quantity,
                    unit: data.unit,
                    location: data.location,
                    expiryDate: data.expiryDate,
                    minQuantity: data.minQuantity,
                    status: PantryStatus.IN_STOCK, // Default status
                    userId: session.user.id, // Track who added it
                }
            })
        }

        return { success: true }
    } catch (error) {
        console.error("Failed to add pantry item:", error)
        return { success: false, error: "Failed to add item" }
    }
}

export async function updatePantryItem(id: string, data: Partial<PantryItemInput>) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        await db.pantryItem.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            }
        })

        return { success: true }
    } catch (error) {
        console.error("Failed to update pantry item:", error)
        return { success: false, error: "Failed to update item" }
    }
}

export async function deletePantryItem(id: string) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        await db.pantryItem.delete({
            where: { id }
        })

        return { success: true }
    } catch (error) {
        console.error("Failed to delete pantry item:", error)
        return { success: false, error: "Failed to delete item" }
    }
}
