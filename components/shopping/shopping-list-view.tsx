"use client"

import { useState } from "react"
import { ShoppingList, ShoppingListItem, IngredientCategory } from "@prisma/client"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { RefreshCw, ShoppingCart } from "lucide-react"
import { generateShoppingList, toggleShoppingItem } from "@/app/actions/shopping-list"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface ShoppingListViewProps {
    list: (ShoppingList & { items: ShoppingListItem[] }) | null
}

export function ShoppingListView({ list }: ShoppingListViewProps) {
    const [isGenerating, setIsGenerating] = useState(false)

    // Group items by category
    const groupedItems: Record<string, ShoppingListItem[]> = {}

    if (list?.items) {
        list.items.forEach(item => {
            const cat = item.category
            if (!groupedItems[cat]) groupedItems[cat] = []
            groupedItems[cat].push(item)
        })
    }

    const categories = Object.keys(groupedItems).sort() as IngredientCategory[]

    const handleGenerate = async () => {
        setIsGenerating(true)
        try {
            const result = await generateShoppingList(new Date())
            if (result.success) {
                toast({
                    title: "Shopping List Updated",
                    description: `Added/updated ${result.count} items based on your meal plan.`
                })
            } else {
                toast({ title: "Generation Failed", description: result.message, variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to generate list.", variant: "destructive" })
        } finally {
            setIsGenerating(false)
        }
    }

    const handleToggle = async (id: string, checked: boolean) => {
        // Optimistic UI could be done here if we had local state, 
        // but for now we rely on server revalidatePath which is fast enough usually
        await toggleShoppingItem(id, checked)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Shopping List</h2>
                    <p className="text-muted-foreground">
                        {list ? `For week of ${format(new Date(list.weekOf), "MMM d, yyyy")}` : "No active list found."}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <a href="/dashboard/shopping/active">Start Shopping</a>
                    </Button>
                    <Button onClick={handleGenerate} disabled={isGenerating}>
                        {isGenerating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                        Generate
                    </Button>
                </div>
            </div>

            {!list || list.items.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                        <ShoppingCart className="h-12 w-12 mb-4 opacity-20" />
                        <p>Your shopping list is empty.</p>
                        <p className="text-sm">Plan some meals and click &ldquo;Generate&rdquo; to get started.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {categories.map(category => (
                        <Card key={category} className="h-fit">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                    {category}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {groupedItems[category].map(item => (
                                    <div key={item.id} className="flex items-start space-x-2">
                                        <Checkbox
                                            id={item.id}
                                            checked={item.isChecked}
                                            onCheckedChange={(c) => handleToggle(item.id, c as boolean)}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <label
                                                htmlFor={item.id}
                                                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${item.isChecked ? 'line-through text-muted-foreground' : ''}`}
                                            >
                                                {item.name}
                                            </label>
                                            <p className="text-xs text-muted-foreground">
                                                {item.quantity} {item.unit.toLowerCase()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
