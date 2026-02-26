import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { StepViewer } from "@/components/cook/step-viewer"

interface CookPageProps {
    params: Promise<{
        recipeId: string
    }>
}

export default async function CookPage({ params }: CookPageProps) {
    const { recipeId } = await params;
    const recipe = await db.recipe.findUnique({
        where: { id: recipeId },
        include: {
            ingredients: { include: { ingredient: true } },
            steps: { orderBy: { stepNumber: 'asc' } }
        }
    })

    if (!recipe) return notFound()

    // Transform data for the viewer
    const formattedRecipe = {
        title: recipe.title,
        ingredients: recipe.ingredients.map(ri => ({
            name: ri.ingredient.name,
            quantity: ri.quantity,
            unit: ri.unit
        })),
        instructions: recipe.steps.map(i => ({
            step: i.stepNumber,
            text: i.instruction
        }))
    }

    return <StepViewer recipe={formattedRecipe} />
}
