"use client"

import Link from "next/link"
import { Recipe } from "@prisma/client"
import { Clock, Users, ArrowRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MatchResult } from "@/app/actions/matching"

interface RecipeMatchCardProps {
    match: MatchResult
}

export function RecipeMatchCard({ match }: RecipeMatchCardProps) {
    const { recipe, matchPercentage, matchingIngredients, missingIngredients } = match

    return (
        <Card className="flex flex-col overflow-hidden">
            {/* Image Placeholder or Actual Image if available */}
            <div className="aspect-video w-full bg-slate-100 object-cover dark:bg-slate-800" />

            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-1">{recipe.title}</CardTitle>
                    <Badge variant={matchPercentage === 100 ? "default" : matchPercentage > 50 ? "secondary" : "outline"}>
                        {matchPercentage}% Match
                    </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                    {recipe.description || "No description provided."}
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
                <div className="flex items-center gap-4 text-sm text-slate-500">
                    {recipe.prepTime && (
                        <div className="flex items-center gap-1">
                            <Clock className="size-4" />
                            <span>{recipe.prepTime + (recipe.cookTime || 0)}m</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <Users className="size-4" />
                        <span>{recipe.servings} Servings</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                        <span>Ingredients Match</span>
                        <span>{matchingIngredients.length} / {matchingIngredients.length + missingIngredients.length}</span>
                    </div>
                    <Progress value={matchPercentage} className="h-2" />
                </div>

                {missingIngredients.length > 0 && (
                    <div className="text-xs text-slate-500">
                        <span className="font-semibold text-red-500">Missing: </span>
                        {missingIngredients.slice(0, 3).join(", ")}
                        {missingIngredients.length > 3 && `, +${missingIngredients.length - 3} more`}
                    </div>
                )}
            </CardContent>

            <CardFooter>
                <Button asChild className="w-full">
                    <Link href={`/dashboard/recipes/${recipe.id}`}>
                        View Recipe
                        <ArrowRight className="ml-2 size-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
