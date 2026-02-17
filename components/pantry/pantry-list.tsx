"use client"

import * as React from "react"
import { PantryItem, Ingredient } from "@prisma/client"
import { format } from "date-fns"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { deletePantryItem } from "@/app/actions/pantry"
import { toast } from "@/components/ui/use-toast"
import { PantryFormDialog } from "./pantry-form-dialog"

type PantryItemWithIngredient = PantryItem & {
    ingredient: Ingredient
}

interface PantryListProps {
    items: PantryItemWithIngredient[]
}

export function PantryList({ items }: PantryListProps) {
    const [editingItem, setEditingItem] = React.useState<PantryItemWithIngredient | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false) // For future alert dialog

    const handleDelete = async (id: string) => {
        const result = await deletePantryItem(id)
        if (!result.success) {
            toast({
                title: "Error",
                description: result.error || "Failed to delete item",
                variant: "destructive",
            })
            return
        }
        toast({
            title: "Item deleted",
            description: "The item has been removed from your pantry.",
        })
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ingredient</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Expiry</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No items in pantry.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        {item.ingredient.name}
                                    </TableCell>
                                    <TableCell>
                                        {item.quantity} {item.unit.toLowerCase()}
                                    </TableCell>
                                    <TableCell>{item.location || "-"}</TableCell>
                                    <TableCell>
                                        {item.expiryDate ? format(new Date(item.expiryDate), "MMM d, yyyy") : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="size-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => setEditingItem(item)}>
                                                    <Pencil className="mr-2 size-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-red-600"
                                                >
                                                    <Trash className="mr-2 size-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {editingItem && (
                <PantryFormDialog
                    open={!!editingItem}
                    onOpenChange={(open) => !open && setEditingItem(null)}
                    item={editingItem}
                />
            )}
        </>
    )
}
