import type { Metadata } from "next"

import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { getShoppingList } from "@/app/actions/shopping-list"
import { ShoppingListView } from "@/components/shopping/shopping-list-view"

export const metadata: Metadata = {
    title: "Shopping List",
    description: "View and manage your shopping list.",
}

export default async function ShoppingPage() {
    const list = await getShoppingList()

    return (
        <DashboardShell>
            <div className="grid gap-8">
                <ShoppingListView list={list} />
            </div>
        </DashboardShell>
    )
}
