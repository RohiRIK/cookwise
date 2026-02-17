"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { PantryItem, Ingredient, UnitType } from "@prisma/client"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { addPantryItem, updatePantryItem, PantryItemInput } from "@/app/actions/pantry"
import { toast } from "@/components/ui/use-toast"

// We need a separate schema for the form because ingredientId might be input directly or selected
// For now, let's assume we simulate ingredient selection by just typing name (for MVP) 
// or optimally, we'd use a combobox. For simplicity, I'll use a simple input for "Ingredient Name" 
// and handle the lookup/creation on server or assume we pass an ID if we had a proper search.
// However, the server action expects `ingredientId`. 
// To make this robust without a complex combobox right now, let's assume we are editing existing mostly,
// and for adding, we might need a way to search ingredients. 
// actually, let's stick to the plan: "Ingredient (Select/Combobox)".
// Since I don't have a combobox component ready-made in my context (it's usually a composition in shadcn),
// I will just use a text input for "Ingredient ID" (bad UX) or better, 
// I'll fetch ingredients? No that's too heavy. 
// I'll implement a simple text input for "Ingredient Name" and we might need to change `addPantryItem` 
// to accept name and find/create ingredient. 
// BUT `addPantryItem` takes `ingredientId`.
// Let's modify the plan slightly: The Dialog will take an `ingredientId` if editing. 
// If adding, we need to pick an ingredient. 
// Let's use a simple Select for now if we have few ingredients, but we might have many.
// PROPOSAL: I'll use a text input for "Ingredient Name" and Update the server action to handle name lookup?
// No, I should stick to the agreed schema. 
// Let's assume for now the user has to copy-paste an ID (terrible) OR 
// I'll quickly implement a "Create Ingredient" on the fly?
// Let's look at `RecipeForm`. It successfully adds ingredients by name.
// `createRecipe` handles ingredient creation.
// `addPantryItem` currently takes `ingredientId`. 
// I should update specific `addPantryItem` to optional `ingredientName`? 
// No, let's just make the form take an ID for now, but I will mock it or basic usage.
// BETTER: I will assume for this MVP step, I can just fetch all ingredients to a select? 
// Might be too many. 
// I'll verify if I can just use `addPantryItem` with a name. 
// The server action `addPantryItem` expects `PantryItemInput` which has `ingredientId`.
// I will update the server action `addPantryItem` to also accept `ingredientName` to find/create it?
// That would be best for UX. 
// let's stick to the current server action and maybe just list a few ingredients or 
// use a text input for "Ingredient Name" and then simple-search or just fail if not found?
// 
// Let's go with: The user enters an Ingredient Name. We try to find it.
// I'll modify the Component to just accept "Ingredient Name" text. 
// But I need to send `ingredientId`.
// 
// Okay, I will modify `addPantryItem` to accept `ingredientName` as an alternative to `ingredientId` in a separate turn?
// Or I can just fetch all ingredients in the component? 
// Let's fetch all ingredients (limit 100) for the select. Use a server component wrapper?
// `PantryFormDialog` is a client component.
// I will pass `ingredients` prop to it from the parent page.

const formSchema = z.object({
    ingredientId: z.string().min(1, "Ingredient is required"),
    quantity: z.coerce.number().min(0),
    unit: z.nativeEnum(UnitType),
    location: z.string().optional(),
    expiryDate: z.string().optional(), // We'll convert to Date
    notes: z.string().optional(),
})

interface PantryFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    item?: (PantryItem & { ingredient: Ingredient }) | null
    ingredients?: Ingredient[] // Passed from parent
}

export function PantryFormDialog({ open, onOpenChange, item, ingredients = [] }: PantryFormDialogProps) {
    const router = useRouter()
    const [isSaving, setIsSaving] = React.useState(false)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ingredientId: item?.ingredientId || "",
            quantity: item?.quantity || 1,
            unit: item?.unit || UnitType.PIECE,
            location: item?.location || "",
            expiryDate: item?.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : "",
            notes: item?.notes || "",
        },
    })

    // Reset form when item changes
    React.useEffect(() => {
        if (item) {
            form.reset({
                ingredientId: item.ingredientId,
                quantity: item.quantity,
                unit: item.unit,
                location: item.location || "",
                expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : "",
                notes: item.notes || "",
            })
        } else {
            form.reset({
                ingredientId: "",
                quantity: 1,
                unit: UnitType.PIECE,
                location: "",
                expiryDate: "",
                notes: "",
            })
        }
    }, [item, form])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSaving(true)

        try {
            const payload: PantryItemInput = {
                ingredientId: values.ingredientId,
                quantity: values.quantity,
                unit: values.unit,
                location: values.location,
                expiryDate: values.expiryDate ? new Date(values.expiryDate) : null,
                notes: values.notes,
                minQuantity: 0, // Default
            }

            let result
            if (item) {
                result = await updatePantryItem(item.id, payload)
            } else {
                result = await addPantryItem(payload)
            }

            if (!result.success) {
                toast({
                    title: "Error",
                    description: result.error || "Failed to save item",
                    variant: "destructive",
                })
                return
            }

            toast({
                title: "Success",
                description: item ? "Item updated" : "Item added to pantry",
            })

            onOpenChange(false)
            router.refresh()
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{item ? "Edit Pantry Item" : "Add Pantry Item"}</DialogTitle>
                    <DialogDescription>
                        {item ? "Update the details of your pantry item." : "Add a new item to your pantry inventory."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="ingredientId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ingredient</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={!!item} // Disable changing ingredient on edit
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select ingredient" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {ingredients.map((ing) => (
                                                <SelectItem key={ing.id} value={ing.id}>
                                                    {ing.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" {...field} value={field.value as number} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="unit"
                                render={({ field }) => (
                                    <FormItem className="w-1/2">
                                        <FormLabel>Unit</FormLabel>
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
                        </div>
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Fridge, Pantry" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="expiryDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Expiry Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
