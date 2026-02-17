"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"
import { Plus, Trash, Loader2 } from "lucide-react"
import { IngredientCategory, UnitType } from "@prisma/client"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { createRecipe, RecipeInput } from "@/app/actions/recipe"

const recipeSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
    description: z.string().optional(),
    prepTime: z.coerce.number().min(0).default(0),
    cookTime: z.coerce.number().min(0).default(0),
    servings: z.coerce.number().min(1).default(4),
    ingredients: z.array(z.object({
        name: z.string().min(1, "Name required"),
        quantity: z.coerce.number().min(0, "Quantity must be positive"),
        unit: z.nativeEnum(UnitType).default(UnitType.PIECE),
        category: z.nativeEnum(IngredientCategory).default(IngredientCategory.OTHER),
        originalText: z.string().optional().default(""), // Internal use mostly
    })).min(1, "Add at least one ingredient"),
    steps: z.array(z.object({
        value: z.string().min(1, "Step instruction required")
    })).min(1, "Add at least one step"),
})

type FormData = z.infer<typeof recipeSchema>

export function RecipeForm() {
    const router = useRouter()
    const [isSaving, setIsSaving] = React.useState(false)

    // Explicitly typed form to match Zod schema exactly
    const form = useForm<FormData>({
        resolver: zodResolver(recipeSchema) as any,
        defaultValues: {
            title: "",
            description: "",
            prepTime: 0,
            cookTime: 0,
            servings: 4,
            ingredients: [{ name: "", quantity: 1, unit: UnitType.PIECE, category: IngredientCategory.OTHER, originalText: "" }],
            steps: [{ value: "" }],
        },
    })

    const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
        control: form.control,
        name: "ingredients",
    })

    const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
        control: form.control,
        name: "steps",
    })

    async function onSubmit(data: FormData) {
        setIsSaving(true)

        // Transform steps back to string array for server action
        const payload: RecipeInput = {
            ...data,
            steps: data.steps.map(s => s.value),
            // Ensure any string conversion needed for units/categories wraps up here
            ingredients: data.ingredients.map(i => ({
                ...i,
                originalText: i.originalText || `${i.quantity} ${i.unit} ${i.name}`
            }))
        }

        const result = await createRecipe(payload)

        setIsSaving(false)

        if (!result.success) {
            return toast({
                title: "Something went wrong.",
                description: result.error,
                variant: "destructive",
            })
        }

        toast({
            title: "Recipe created!",
            description: "Your recipe has been successfully saved.",
        })

        router.push(`/dashboard/recipes/${result.data?.id}`)
        router.refresh()
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Spaghetti Carbonara" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="A classic Italian pasta dish..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="prepTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Prep Time (mins)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="cookTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cook Time (mins)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="servings"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Servings</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Ingredients</h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendIngredient({ name: "", quantity: 1, unit: "PIECE", category: IngredientCategory.OTHER, originalText: "" })}
                        >
                            <Plus className="mr-2 size-4" />
                            Add Ingredient
                        </Button>
                    </div>
                    {ingredientFields.map((field, index) => (
                        <div key={field.id} className="flex items-start gap-2">
                            <FormField
                                control={form.control}
                                name={`ingredients.${index}.quantity`}
                                render={({ field }) => (
                                    <FormItem className="w-20">
                                        <FormControl>
                                            <Input type="number" placeholder="1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`ingredients.${index}.unit`}
                                render={({ field }) => (
                                    <FormItem className="w-24">
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Unit" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.values(UnitType).map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type.toLowerCase()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`ingredients.${index}.name`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input placeholder="Ingredient name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`ingredients.${index}.category`}
                                render={({ field }) => (
                                    <FormItem className="w-32">
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.values(IngredientCategory).map((cat) => (
                                                    <SelectItem key={cat} value={cat}>
                                                        {cat.toLowerCase()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeIngredient(index)}
                                disabled={ingredientFields.length === 1}
                            >
                                <Trash className="size-4 text-muted-foreground" />
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Instructions</h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => appendStep({ value: "" })}
                        >
                            <Plus className="size-4" />
                        </Button>
                    </div>
                    {stepFields.map((field, index) => (
                        <div key={field.id} className="flex items-start gap-2">
                            <div className="w-6 flex-none pt-2 text-center text-sm font-medium text-muted-foreground">
                                {index + 1}.
                            </div>
                            <FormField
                                control={form.control}
                                name={`steps.${index}.value`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Textarea
                                                className="min-h-10 resize-none"
                                                placeholder={`Step ${index + 1}...`}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeStep(index)}
                                disabled={stepFields.length === 1}
                            >
                                <Trash className="size-4 text-muted-foreground" />
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
                        Create Recipe
                    </Button>
                </div>
            </form>
        </Form>
    )
}
