"use client"

import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import Image from "next/image"

interface DroppableMealSlotProps {
    date: Date
    mealType: string
    recipe?: {
        id: string
        title: string
        imageUrl?: string | null
    } | null
    onRemove?: () => void
}

export function DroppableMealSlot({ date, mealType, recipe, onRemove }: DroppableMealSlotProps) {
    // Unique ID for the droppable area: "date_mealType"
    const slotId = `${date.toISOString()}_${mealType}`

    const { isOver, setNodeRef } = useDroppable({
        id: slotId,
        data: {
            date: date,
            mealType: mealType
        }
    })

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "relative h-24 p-2 border rounded-md transition-colors text-xs flex flex-col justify-center",
                isOver ? "bg-primary/20 border-primary border-2" : "border-dashed border-border bg-card/40 hover:bg-card/80",
                recipe ? "border-solid bg-card" : ""
            )}
        >
            {recipe ? (
                <div className="relative w-full h-full flex flex-col justify-between group">
                    <div className="flex gap-2 items-start">
                        {recipe.imageUrl && (
                            <div className="relative h-8 w-8 overflow-hidden rounded bg-muted">
                                <Image
                                    src={recipe.imageUrl}
                                    alt={recipe.title}
                                    fill
                                    className="object-cover"
                                    sizes="32px"
                                />
                            </div>
                        )}
                        <span className="font-medium line-clamp-2">{recipe.title}</span>
                    </div>

                    {onRemove && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-[-4px] right-[-4px] w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                                e.stopPropagation()
                                onRemove()
                            }}
                        >
                            <X className="w-3 h-3" />
                        </Button>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground/50 opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-[10px] uppercase font-bold tracking-wider">Drop here</span>
                </div>
            )}
        </div>
    )
}
