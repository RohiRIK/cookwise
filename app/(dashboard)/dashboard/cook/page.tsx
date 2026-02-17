import { Metadata } from "next"

import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { RecipeMatchCard } from "@/components/recipes/recipe-match-card"
import { getMatchedRecipes } from "@/app/actions/matching"

export const metadata: Metadata = {
    title: "What to Cook",
    description: "Recipes based on what you have.",
}

export default async function CookPage() {
    const matches = await getMatchedRecipes()

    return (
        <DashboardShell>
            <DashboardHeader heading="What to Cook" text="Recipes tailored to your pantry." />

            {matches.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center rounded-md border border-dashed bg-slate-50 p-8 text-center animate-in fade-in-50 dark:bg-slate-900">
                    <div className="text-sm font-medium text-slate-500">
                        No recipes found. Try adding more ingredients to your pantry or creating more recipes.
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {matches.map((match) => (
                        <RecipeMatchCard key={match.recipe.id} match={match} />
                    ))}
                </div>
            )}
        </DashboardShell>
    )
}
