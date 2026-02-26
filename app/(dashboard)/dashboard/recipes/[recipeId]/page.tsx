import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { Clock, Users, ArrowLeft, ChefHat } from "lucide-react"
import Link from "next/link"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface RecipePageProps {
    params: Promise<{
        recipeId: string
    }>
}

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
    const { recipeId } = await params
    const recipe = await db.recipe.findUnique({
        where: { id: recipeId },
        select: { title: true },
    })

    return {
        title: recipe?.title || "Recipe Not Found",
        description: "Recipe details",
    }
}

export default async function RecipePage({ params }: RecipePageProps) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return null
    }

    const { recipeId } = await params
    const recipe = await db.recipe.findUnique({
        where: { id: recipeId },
        include: {
            ingredients: {
                include: {
                    ingredient: true,
                },
            },
            steps: {
                orderBy: {
                    stepNumber: "asc",
                },
            },
        },
    })

    if (!recipe) {
        notFound()
    }

    // Basic authorization check (household or creator)
    const user = await db.user.findUnique({ where: { id: session.user.id } })

    const hasAccess =
        recipe.creatorId === session.user.id ||
        (recipe.householdId && recipe.householdId === user?.householdId)

    if (!hasAccess) {
        // In a real app, strict RBAC. For now, if you can see it, you can view it.
        // actually, we should probably enforce it.
        return notFound()
    }

    return (
        <DashboardShell>
            <div className="mb-6 flex items-center gap-4">
                <Link href="/dashboard/recipes">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 size-4" />
                        Back
                    </Button>
                </Link>
                <div className="ml-auto">
                    <Link href={`/dashboard/recipes/${recipeId}/cook`}>
                        <Button>
                            <ChefHat className="mr-2 size-4" />
                            Cook This
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content: Header + Steps */}
                <div className="space-y-6 lg:col-span-2">
                    <div className="space-y-4">
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                            {recipe.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={recipe.imageUrl}
                                    alt={recipe.title}
                                    className="size-full object-cover"
                                />
                            ) : (
                                <div className="flex size-full items-center justify-center bg-secondary text-muted-foreground">
                                    <ChefHat className="size-12" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{recipe.title}</h1>
                            {recipe.description && (
                                <p className="mt-2 text-muted-foreground">{recipe.description}</p>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1">
                                <Clock className="size-4 text-muted-foreground" />
                                <span className="font-medium">Prep:</span> {recipe.prepTime ? `${recipe.prepTime}m` : "-"}
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="size-4 text-muted-foreground" />
                                <span className="font-medium">Cook:</span> {recipe.cookTime ? `${recipe.cookTime}m` : "-"}
                            </div>
                            <div className="flex items-center gap-1">
                                <Users className="size-4 text-muted-foreground" />
                                <span className="font-medium">Servings:</span> {recipe.servings}
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="font-medium">Diff:</span> {recipe.difficulty || "Medium"}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h2 className="mb-4 text-2xl font-semibold">Instructions</h2>
                        <div className="space-y-6">
                            {recipe.steps.map((step) => (
                                <div key={step.id} className="flex gap-4">
                                    <div className="flex size-8 flex-none items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                        {step.stepNumber}
                                    </div>
                                    <div className="pt-1">
                                        <p className="leading-relaxed">{step.instruction}</p>
                                    </div>
                                </div>
                            ))}
                            {recipe.steps.length === 0 && (
                                <p className="italic text-muted-foreground">No instructions provided.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Ingredients & source */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Ingredients</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {recipe.ingredients.map((ri) => (
                                    <li key={ri.id} className="flex items-start justify-between gap-2 text-sm">
                                        <span className="font-medium">
                                            {ri.quantity} {ri.unit.toLowerCase()}
                                        </span>
                                        <span className="flex-1 text-right text-muted-foreground">
                                            {ri.ingredient.name}
                                            {ri.notes && <span className="block text-xs italic">{ri.notes}</span>}
                                        </span>
                                    </li>
                                ))}
                                {recipe.ingredients.length === 0 && (
                                    <li className="text-sm italic text-muted-foreground">No ingredients listed.</li>
                                )}
                            </ul>
                        </CardContent>
                    </Card>

                    {recipe.sourceType === "OCR_IMAGE" && (
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-xs text-muted-foreground">
                                    Imported via AI from Image
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </DashboardShell>
    )
}
