"use client"

import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Card } from "@/components/ui/card"
import { GripVertical } from "lucide-react"
import Image from "next/image"

interface DraggableRecipeCardProps {
    id: string
    title: string
    imageUrl?: string | null
}

export function DraggableRecipeCard({ id, title, imageUrl }: DraggableRecipeCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `recipe-${id}`,
        data: {
            recipeId: id,
            title: title,
            imageUrl: imageUrl
        }
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none' // Essential for dnd-kit on mobile/touch
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="flex items-center gap-2 mb-2 p-2 cursor-grab active:cursor-grabbing hover:bg-accent/50 transition-colors"
        >
            <GripVertical className="text-muted-foreground w-4 h-4 flex-shrink-0" />

            {imageUrl && (
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                    <Image src={imageUrl} alt={title} fill className="object-cover" sizes="40px" />
                </div>
            )}

            <span className="text-sm font-medium line-clamp-2 leading-tight">
                {title}
            </span>
        </Card>
    )
}
