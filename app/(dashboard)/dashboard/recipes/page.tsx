import { Metadata } from "next"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { Plus } from "lucide-react"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { RecipeCard } from "@/components/recipe-card"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"

export const metadata: Metadata = {
    title: "Recipes",
    description: "Manage your recipes.",
}

export default async function RecipesPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return null // content handled by middleware/layout mostly
    }

    // Get recipes for the user's household or created by user
    // Assuming user has householdId, verify logic
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { householdId: true }
    })

    const recipes = await db.recipe.findMany({
        where: {
            OR: [
                { householdId: user?.householdId }, // Recipes in household
                { creatorId: session.user.id }      // Private recipes (fallback)
            ]
        },
        orderBy: { updatedAt: "desc" },
    })

    return (
        <DashboardShell>
            <DashboardHeader heading="Recipes" text="Create and manage your recipes.">
                <Link href="/dashboard/recipes/new">
                    <Button>
                        <Plus className="mr-2 size-4" />
                        Add Recipe
                    </Button>
                </Link>
            </DashboardHeader>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
                {recipes.length === 0 && (
                    <div className="col-span-full py-10 text-center text-muted-foreground">
                        No recipes found. Create your first one!
                    </div>
                )}
            </div>
        </DashboardShell>
    )
}
