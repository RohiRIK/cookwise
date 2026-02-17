import { Metadata } from "next"

import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { PantryList } from "@/components/pantry/pantry-list"
import { PantryAddButton } from "@/components/pantry/pantry-add-button" // New wrapper for client button
import { getPantryItems } from "@/app/actions/pantry"
import { db } from "@/lib/db"

export const metadata: Metadata = {
    title: "Pantry",
    description: "Manage your pantry inventory.",
}

export default async function PantryPage() {
    const items = await getPantryItems()

    // Fetch ingredients for the add dialog
    const ingredients = await db.ingredient.findMany({
        orderBy: { name: "asc" },
        take: 100 // Limit for now
    })

    return (
        <DashboardShell>
            <DashboardHeader heading="Pantry" text="Manage your inventory and track what you have.">
                <PantryAddButton ingredients={ingredients} />
            </DashboardHeader>
            <div className="grid gap-10">
                <PantryList items={items} />
            </div>
        </DashboardShell>
    )
}
