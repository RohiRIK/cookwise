"use client"

import { useState, useEffect } from "react"
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor } from "@dnd-kit/core"
import { format, startOfWeek, addDays, eachDayOfInterval } from "date-fns"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { DraggableRecipeCard } from "@/components/planner/draggable-recipe-card"
import { DroppableMealSlot } from "@/components/planner/droppable-meal-slot"
import { getRecursiveRecipes, getWeekMealPlans, updateMealPlan, removeMealPlan } from "@/app/actions/meal-planner"
import { toast } from "@/components/ui/use-toast"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function PlannerPage() {
    const [recipes, setRecipes] = useState<any[]>([])
    const [mealPlans, setMealPlans] = useState<any[]>([])
    const [currentDate, setCurrentDate] = useState(new Date())
    const [activeDragItem, setActiveDragItem] = useState<any>(null)

    // Sensors for drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor) // Better mobile support
    )

    // Fetch data
    useEffect(() => {
        getRecursiveRecipes().then(setRecipes)
        getWeekMealPlans(currentDate).then(setMealPlans)
    }, [currentDate])

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const days = eachDayOfInterval({
        start: weekStart,
        end: addDays(weekStart, 6)
    })
    const mealTypes = ["BREAKFAST", "LUNCH", "DINNER"]

    const handleDragStart = (event: any) => {
        setActiveDragItem(event.active.data.current)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveDragItem(null)

        if (!over) return

        // Parse drop target ID: "ISOString_MealType"
        const [dateStr, mealType] = (over.id as string).split('_')
        const recipeId = active.data.current?.recipeId

        if (recipeId && dateStr && mealType) {
            // Optimistic Update
            const newPlan = {
                id: `temp-${Date.now()}`,
                date: new Date(dateStr),
                mealType: mealType,
                recipe: active.data.current,
                recipeId: recipeId
            }

            // Remove existing for this slot + Add new
            setMealPlans(prev => {
                const filtered = prev.filter(p =>
                    !(new Date(p.date).toDateString() === new Date(dateStr).toDateString() && p.mealType === mealType)
                )
                return [...filtered, newPlan]
            })

            try {
                await updateMealPlan(new Date(dateStr), mealType, recipeId)
                toast({ title: "Meal updated" })
                // Refresh to get real ID
                getWeekMealPlans(currentDate).then(setMealPlans)
            } catch (error) {
                toast({ title: "Failed to update meal", variant: "destructive" })
                // Revert
                getWeekMealPlans(currentDate).then(setMealPlans)
            }
        }
    }

    const handleRemove = async (id: string, date: Date, mealType: string) => {
        // Optimistic Remove
        setMealPlans(prev => prev.filter(p => p.id !== id))

        if (id.startsWith('temp-')) return // Don't delete temp items from DB

        try {
            await removeMealPlan(id)
            toast({ title: "Meal removed" })
        } catch (error) {
            toast({ title: "Failed to remove meal", variant: "destructive" })
            getWeekMealPlans(currentDate).then(setMealPlans)
        }
    }

    return (
        <DashboardShell>
            <DashboardHeader heading="Meal Planner" text="Plan your meals for the week. Drag recipes onto the calendar." />

            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
                    {/* Sidebar: Recipes */}
                    <Card className="col-span-1 p-4 flex flex-col h-full bg-muted/40 border-r">
                        <h3 className="font-semibold mb-4">Recipes</h3>
                        <ScrollArea className="flex-1 pr-4">
                            {recipes.map(recipe => (
                                <DraggableRecipeCard
                                    key={recipe.id}
                                    id={recipe.id} // Needs to match drag ID logic? No, useDraggable handles unique ID internally
                                    title={recipe.title}
                                    imageUrl={recipe.imageUrl}
                                />
                            ))}
                        </ScrollArea>
                    </Card>

                    {/* Main: Calendar Grid */}
                    <div className="col-span-3 overflow-auto border rounded-md bg-background">
                        <div className="min-w-[800px]">
                            {/* Header Row */}
                            <div className="grid grid-cols-8 border-b bg-muted/10 sticky top-0 z-10 backdrop-blur">
                                <div className="p-2 font-medium border-r flex items-center justify-center bg-muted/20">Meal</div>
                                {days.map(day => (
                                    <div key={day.toISOString()} className="p-2 text-center border-r last:border-r-0">
                                        <div className="font-medium text-sm">{format(day, "EEE")}</div>
                                        <div className="text-xs text-muted-foreground">{format(day, "MMM d")}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Meal Rows */}
                            {mealTypes.map(mealType => (
                                <div key={mealType} className="grid grid-cols-8 border-b last:border-b-0 min-h-[120px]">
                                    <div className="p-2 font-medium border-r flex items-center justify-center bg-muted/5 text-xs writing-mode-vertical rotate-180 md:rotate-0 md:writing-mode-horizontal">
                                        {mealType}
                                    </div>
                                    {days.map(day => {
                                        const plan = mealPlans.find(p =>
                                            new Date(p.date).toDateString() === day.toDateString() &&
                                            p.mealType === mealType
                                        )

                                        return (
                                            <div key={`${day.toISOString()}_${mealType}`} className="border-r last:border-r-0 p-1">
                                                <DroppableMealSlot
                                                    date={day}
                                                    mealType={mealType}
                                                    recipe={plan?.recipe}
                                                    onRemove={() => plan && handleRemove(plan.id, day, mealType)}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DragOverlay>
                    {activeDragItem ? (
                        <div className="opacity-80 rotate-3 cursor-grabbing w-[200px]">
                            <Card className="p-2 flex items-center gap-2 shadow-xl border-primary/50 bg-background">
                                {activeDragItem.imageUrl && (
                                    <img src={activeDragItem.imageUrl} className="w-8 h-8 rounded bg-muted object-cover" />
                                )}
                                <span className="text-sm font-medium line-clamp-1">{activeDragItem.title}</span>
                            </Card>
                        </div>
                    ) : null}
                </DragOverlay>

            </DndContext>
        </DashboardShell>
    )
}
