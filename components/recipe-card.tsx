import Link from "next/link"
import { Recipe } from "@prisma/client"
import { Clock, ChefHat, Users } from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RecipeCardProps {
    recipe: Recipe
}

export function RecipeCard({ recipe }: RecipeCardProps) {
    return (
        <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
            <div className="relative aspect-video w-full bg-muted">
                {/* Placeholder for now, replace with next/image when imageUrl is real */}
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
            <CardHeader className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 text-lg font-semibold">{recipe.title}</h3>
                    {recipe.rating && (
                        <Badge variant="secondary" className="shrink-0">
                            ★ {recipe.rating}
                        </Badge>
                    )}
                </div>
                <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
                    {recipe.description || "No description provided."}
                </p>
            </CardHeader>
            <CardContent className="grow p-4 pt-0">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Clock className="size-4" />
                        <span>{recipe.cookTime ? `${recipe.cookTime}m` : "-"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="size-4" />
                        <span>{recipe.servings} pp</span>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                        <Badge variant="outline" className="text-xs font-normal capitalize">
                            {recipe.difficulty || "Medium"}
                        </Badge>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Link href={`/dashboard/recipes/${recipe.id}`} className="w-full">
                    <div className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                        View Recipe
                    </div>
                </Link>
            </CardFooter>
        </Card>
    )
}
