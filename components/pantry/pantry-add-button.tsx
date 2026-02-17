"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Ingredient } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { PantryFormDialog } from "./pantry-form-dialog"

interface PantryAddButtonProps {
    ingredients: Ingredient[]
}

export function PantryAddButton({ ingredients }: PantryAddButtonProps) {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>
                <Plus className="mr-2 size-4" />
                Add Item
            </Button>
            <PantryFormDialog
                open={isOpen}
                onOpenChange={setIsOpen}
                ingredients={ingredients}
            />
        </>
    )
}
